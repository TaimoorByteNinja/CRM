import { store } from '@/lib/store'
import { 
  saveSettingsAsync, 
  loadSettingsAsync,
  resetSettingsAsync,
  updateGeneralSettings,
  updateTransactionSettings,
  updateInvoiceSettings,
  updatePartySettings,
  updateItemSettings,
  updateMessageSettings,
  updateTaxSettings
} from '@/lib/store/slices/settingsSlice'

// Auto-save utility with debouncing
class SettingsManager {
  private debounceTimer: NodeJS.Timeout | null = null
  private pendingChanges: any = {}

  // Auto-save after delay to batch changes
  autoSave(settingsType: string, changes: any, delay = 1000) {
    this.pendingChanges[settingsType] = { 
      ...this.pendingChanges[settingsType], 
      ...changes 
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      this.saveToServer()
    }, delay)
  }

  private async saveToServer() {
    try {
      await store.dispatch(saveSettingsAsync(this.pendingChanges))
      this.pendingChanges = {}
      console.log('Settings auto-saved successfully')
    } catch (error) {
      console.error('Failed to auto-save settings:', error)
    }
  }

  // Manual save all settings
  async saveAll() {
    const state = store.getState()
    const settings = state.settings
    
    try {
      await store.dispatch(saveSettingsAsync({
        general: settings.general,
        transaction: settings.transaction,
        invoice: settings.invoice,
        party: settings.party,
        item: settings.item,
        message: settings.message,
        tax: settings.tax
      }))
      console.log('All settings saved successfully')
    } catch (error) {
      console.error('Failed to save all settings:', error)
      throw error
    }
  }

  // Load settings from server
  async loadAll() {
    try {
      await store.dispatch(loadSettingsAsync())
      console.log('Settings loaded successfully')
    } catch (error) {
      console.error('Failed to load settings:', error)
      throw error
    }
  }

  // Reset all settings to defaults
  async resetAll() {
    try {
      await store.dispatch(resetSettingsAsync())
      console.log('Settings reset successfully')
    } catch (error) {
      console.error('Failed to reset settings:', error)
      throw error
    }
  }

  // Helper functions for common settings operations
  updateGeneral(key: string, value: any) {
    store.dispatch(updateGeneralSettings({ [key]: value }))
    this.autoSave('general', { [key]: value })
  }

  updateTransaction(key: string, value: any) {
    store.dispatch(updateTransactionSettings({ [key]: value }))
    this.autoSave('transaction', { [key]: value })
  }

  updateInvoice(key: string, value: any) {
    store.dispatch(updateInvoiceSettings({ [key]: value }))
    this.autoSave('invoice', { [key]: value })
  }

  updateParty(key: string, value: any) {
    store.dispatch(updatePartySettings({ [key]: value }))
    this.autoSave('party', { [key]: value })
  }

  updateItem(key: string, value: any) {
    store.dispatch(updateItemSettings({ [key]: value }))
    this.autoSave('item', { [key]: value })
  }

  updateMessage(key: string, value: any) {
    store.dispatch(updateMessageSettings({ [key]: value }))
    this.autoSave('message', { [key]: value })
  }

  updateTax(key: string, value: any) {
    store.dispatch(updateTaxSettings({ [key]: value }))
    this.autoSave('tax', { [key]: value })
  }

  // Batch update multiple settings
  batchUpdate(updates: {
    general?: any
    transaction?: any
    invoice?: any
    party?: any
    item?: any
    message?: any
    tax?: any
  }) {
    if (updates.general) {
      store.dispatch(updateGeneralSettings(updates.general))
    }
    if (updates.transaction) {
      store.dispatch(updateTransactionSettings(updates.transaction))
    }
    if (updates.invoice) {
      store.dispatch(updateInvoiceSettings(updates.invoice))
    }
    if (updates.party) {
      store.dispatch(updatePartySettings(updates.party))
    }
    if (updates.item) {
      store.dispatch(updateItemSettings(updates.item))
    }
    if (updates.message) {
      store.dispatch(updateMessageSettings(updates.message))
    }
    if (updates.tax) {
      store.dispatch(updateTaxSettings(updates.tax))
    }

    // Auto-save all changes
    this.autoSave('batch', updates)
  }

  // Get current settings
  getCurrentSettings() {
    const state = store.getState()
    return state.settings
  }

  // Export settings to JSON
  exportSettings() {
    const settings = this.getCurrentSettings()
    const exportData = {
      general: settings.general,
      transaction: settings.transaction,
      invoice: settings.invoice,
      party: settings.party,
      item: settings.item,
      message: settings.message,
      tax: settings.tax,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  // Import settings from JSON
  async importSettings(file: File) {
    try {
      const text = await file.text()
      const importData = JSON.parse(text)
      
      if (importData.version !== '1.0') {
        throw new Error('Unsupported settings file version')
      }
      
      this.batchUpdate({
        general: importData.general,
        transaction: importData.transaction,
        invoice: importData.invoice,
        party: importData.party,
        item: importData.item,
        message: importData.message,
        tax: importData.tax
      })
      
      await this.saveAll()
      console.log('Settings imported successfully')
    } catch (error) {
      console.error('Failed to import settings:', error)
      throw error
    }
  }

  // Validate settings before saving
  validateSettings(settings: any) {
    const errors: string[] = []
    
    // Validate general settings
    if (settings.general) {
      if (settings.general.decimalPlaces < 0 || settings.general.decimalPlaces > 4) {
        errors.push('Decimal places must be between 0 and 4')
      }
      if (settings.general.screenZoom < 50 || settings.general.screenZoom > 200) {
        errors.push('Screen zoom must be between 50% and 200%')
      }
    }
    
    // Validate party settings
    if (settings.party) {
      if (settings.party.paymentReminderDays < 1 || settings.party.paymentReminderDays > 365) {
        errors.push('Payment reminder days must be between 1 and 365')
      }
    }
    
    // Validate tax settings
    if (settings.tax) {
      settings.tax.taxRates?.forEach((rate: any, index: number) => {
        if (rate.rate < 0 || rate.rate > 100) {
          errors.push(`Tax rate ${index + 1} must be between 0% and 100%`)
        }
      })
    }
    
    return errors
  }
}

// Export singleton instance
export const settingsManager = new SettingsManager()

// Export common settings operations
export const settingsOperations = {
  // Theme operations
  setTheme: (theme: 'light' | 'dark' | 'auto') => {
    settingsManager.updateGeneral('theme', theme)
  },
  
  // Currency operations
  setCurrency: (currency: { code: string, symbol: string, name: string }) => {
    settingsManager.batchUpdate({
      general: {
        selectedCurrency: currency.code,
        selectedCurrencySymbol: currency.symbol,
        businessCurrency: currency.symbol
      }
    })
  },
  
  // Invoice template operations
  setInvoiceTemplate: (templateId: string) => {
    settingsManager.updateInvoice('activeTemplate', templateId)
  },
  
  // Quick toggles
  toggleFeature: (section: string, feature: string, enabled: boolean) => {
    switch (section) {
      case 'general':
        settingsManager.updateGeneral(feature, enabled)
        break
      case 'transaction':
        settingsManager.updateTransaction(feature, enabled)
        break
      case 'party':
        settingsManager.updateParty(feature, enabled)
        break
      case 'item':
        settingsManager.updateItem(feature, enabled)
        break
      case 'message':
        settingsManager.updateMessage(feature, enabled)
        break
      default:
        console.warn('Unknown settings section:', section)
    }
  }
}

export default settingsManager
