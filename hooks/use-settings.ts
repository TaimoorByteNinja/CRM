import { useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks'
import { pinService } from '@/lib/pin-service'
import {
  selectGeneralSettings,
  selectTransactionSettings,
  selectInvoiceSettings,
  selectPartySettings,
  selectItemSettings,
  selectMessageSettings,
  selectTaxSettings,
  selectSettingsLoading,
  selectSettingsError,
  selectLastSaved,
  updateGeneralSettings,
  updateTransactionSettings,
  updateInvoiceSettings,
  updatePartySettings,
  updateItemSettings,
  updateMessageSettings,
  updateTaxSettings,
  saveSettingsAsync,
  loadSettingsAsync,
  resetSettingsAsync,
  type GeneralSettings,
  type TransactionSettings,
  type InvoiceSettings,
  type PartySettings,
  type ItemSettings,
  type MessageSettings,
  type TaxSettings
} from '@/lib/store/slices/settingsSlice'

export interface UseSettingsReturn {
  // Settings data
  general: GeneralSettings
  transaction: TransactionSettings
  invoice: InvoiceSettings
  party: PartySettings
  item: ItemSettings
  message: MessageSettings
  tax: TaxSettings
  
  // Loading states
  loading: boolean
  error: string | null
  lastSaved: string | null
  
  // Update functions
  updateGeneral: (updates: Partial<GeneralSettings>) => void
  updateTransaction: (updates: Partial<TransactionSettings>) => void
  updateInvoice: (updates: Partial<InvoiceSettings>) => void
  updateParty: (updates: Partial<PartySettings>) => void
  updateItem: (updates: Partial<ItemSettings>) => void
  updateMessage: (updates: Partial<MessageSettings>) => void
  updateTax: (updates: Partial<TaxSettings>) => void
  
  // Auto-save update functions
  updateGeneralWithSave: (key: string, value: any) => void
  updateTransactionWithSave: (key: string, value: any) => void
  updateInvoiceWithSave: (key: string, value: any) => void
  updatePartyWithSave: (key: string, value: any) => void
  updateItemWithSave: (key: string, value: any) => void
  updateMessageWithSave: (key: string, value: any) => void
  updateTaxWithSave: (key: string, value: any) => void
  
  // Action functions
  saveAll: () => Promise<void>
  loadAll: () => Promise<void>
  resetAll: () => Promise<void>
  
  // Utility functions
  isFeatureEnabled: (section: keyof UseSettingsReturn, feature: string) => boolean
  toggleFeature: (section: string, feature: string) => void
  
  // PIN utility functions
  isPINRequired: () => boolean
  isPINSetup: () => Promise<boolean>
  isPINVerified: () => boolean
  clearPINData: () => Promise<void>
}

export const useSettings = (): UseSettingsReturn => {
  const dispatch = useAppDispatch()
  
  // Selectors
  const general = useAppSelector(selectGeneralSettings)
  const transaction = useAppSelector(selectTransactionSettings)
  const invoice = useAppSelector(selectInvoiceSettings)
  const party = useAppSelector(selectPartySettings)
  const item = useAppSelector(selectItemSettings)
  const message = useAppSelector(selectMessageSettings)
  const tax = useAppSelector(selectTaxSettings)
  const loading = useAppSelector(selectSettingsLoading)
  const error = useAppSelector(selectSettingsError)
  const lastSaved = useAppSelector(selectLastSaved)
  
  // Basic update functions
  const updateGeneral = useCallback((updates: Partial<GeneralSettings>) => {
    dispatch(updateGeneralSettings(updates))
  }, [dispatch])
  
  const updateTransaction = useCallback((updates: Partial<TransactionSettings>) => {
    dispatch(updateTransactionSettings(updates))
  }, [dispatch])
  
  const updateInvoice = useCallback((updates: Partial<InvoiceSettings>) => {
    dispatch(updateInvoiceSettings(updates))
  }, [dispatch])
  
  const updateParty = useCallback((updates: Partial<PartySettings>) => {
    dispatch(updatePartySettings(updates))
  }, [dispatch])
  
  const updateItem = useCallback((updates: Partial<ItemSettings>) => {
    dispatch(updateItemSettings(updates))
  }, [dispatch])
  
  const updateMessage = useCallback((updates: Partial<MessageSettings>) => {
    dispatch(updateMessageSettings(updates))
  }, [dispatch])
  
  const updateTax = useCallback((updates: Partial<TaxSettings>) => {
    dispatch(updateTaxSettings(updates))
  }, [dispatch])
  
  // Auto-save update functions
  const updateGeneralWithSave = useCallback((key: string, value: any) => {
    const updates = { [key]: value }
    dispatch(updateGeneralSettings(updates))
    // Auto-save after 500ms
    setTimeout(() => {
      dispatch(saveSettingsAsync({ general: { ...general, ...updates } }))
    }, 500)
  }, [dispatch, general])
  
  const updateTransactionWithSave = useCallback((key: string, value: any) => {
    const updates = { [key]: value }
    dispatch(updateTransactionSettings(updates))
    setTimeout(() => {
      dispatch(saveSettingsAsync({ transaction: { ...transaction, ...updates } }))
    }, 500)
  }, [dispatch, transaction])
  
  const updateInvoiceWithSave = useCallback((key: string, value: any) => {
    const updates = { [key]: value }
    dispatch(updateInvoiceSettings(updates))
    setTimeout(() => {
      dispatch(saveSettingsAsync({ invoice: { ...invoice, ...updates } }))
    }, 500)
  }, [dispatch, invoice])
  
  const updatePartyWithSave = useCallback((key: string, value: any) => {
    const updates = { [key]: value }
    dispatch(updatePartySettings(updates))
    setTimeout(() => {
      dispatch(saveSettingsAsync({ party: { ...party, ...updates } }))
    }, 500)
  }, [dispatch, party])
  
  const updateItemWithSave = useCallback((key: string, value: any) => {
    const updates = { [key]: value }
    dispatch(updateItemSettings(updates))
    setTimeout(() => {
      dispatch(saveSettingsAsync({ item: { ...item, ...updates } }))
    }, 500)
  }, [dispatch, item])
  
  const updateMessageWithSave = useCallback((key: string, value: any) => {
    const updates = { [key]: value }
    dispatch(updateMessageSettings(updates))
    setTimeout(() => {
      dispatch(saveSettingsAsync({ message: { ...message, ...updates } }))
    }, 500)
  }, [dispatch, message])
  
  const updateTaxWithSave = useCallback((key: string, value: any) => {
    const updates = { [key]: value }
    dispatch(updateTaxSettings(updates))
    setTimeout(() => {
      dispatch(saveSettingsAsync({ tax: { ...tax, ...updates } }))
    }, 500)
  }, [dispatch, tax])
  
  // Action functions
  const saveAll = useCallback(async () => {
    await dispatch(saveSettingsAsync({
      general,
      transaction,
      invoice,
      party,
      item,
      message,
      tax
    }))
  }, [dispatch, general, transaction, invoice, party, item, message, tax])
  
  const loadAll = useCallback(async () => {
    await dispatch(loadSettingsAsync())
  }, [dispatch])
  
  const resetAll = useCallback(async () => {
    await dispatch(resetSettingsAsync())
  }, [dispatch])
  
  // Utility functions
  const isFeatureEnabled = useCallback((section: keyof UseSettingsReturn, feature: string): boolean => {
    const sectionSettings = eval(section) // This is safe as we control the section names
    return sectionSettings?.[feature] === true
  }, [general, transaction, invoice, party, item, message, tax])
  
  const toggleFeature = useCallback((section: string, feature: string) => {
    switch (section) {
      case 'general':
        updateGeneralWithSave(feature, !general[feature as keyof GeneralSettings])
        break
      case 'transaction':
        updateTransactionWithSave(feature, !transaction[feature as keyof TransactionSettings])
        break
      case 'invoice':
        updateInvoiceWithSave(feature, !invoice[feature as keyof InvoiceSettings])
        break
      case 'party':
        updatePartyWithSave(feature, !party[feature as keyof PartySettings])
        break
      case 'item':
        updateItemWithSave(feature, !item[feature as keyof ItemSettings])
        break
      case 'message':
        updateMessageWithSave(feature, !message[feature as keyof MessageSettings])
        break
      case 'tax':
        updateTaxWithSave(feature, !tax[feature as keyof TaxSettings])
        break
      default:
        console.warn('Unknown settings section:', section)
    }
  }, [
    updateGeneralWithSave,
    updateTransactionWithSave,
    updateInvoiceWithSave,
    updatePartyWithSave,
    updateItemWithSave,
    updateMessageWithSave,
    updateTaxWithSave,
    general,
    transaction,
    invoice,
    party,
    item,
    message,
    tax
  ])

  // PIN utility functions
  const isPINRequired = useCallback((): boolean => {
    return general.enablePasscode && general.passcodeSetup
  }, [general.enablePasscode, general.passcodeSetup])

  const isPINSetup = useCallback(async (): Promise<boolean> => {
    if (!general.phoneNumber) return false
    return await pinService.hasPIN(general.phoneNumber)
  }, [general.phoneNumber])

  const isPINVerified = useCallback((): boolean => {
    if (!isPINRequired()) return true
    
    const sessionPinVerified = sessionStorage.getItem('pinVerified') === 'true'
    const pinVerificationTime = sessionStorage.getItem('pinVerificationTime')
    
    if (!sessionPinVerified || !pinVerificationTime) return false
    
    // Check if verification is still valid (24 hour session)
    const verificationTime = new Date(pinVerificationTime)
    const now = new Date()
    const hoursDiff = (now.getTime() - verificationTime.getTime()) / (1000 * 60 * 60)
    
    return hoursDiff < 24
  }, [isPINRequired])

  const clearPINData = useCallback(async (): Promise<void> => {
    if (general.phoneNumber) {
      await pinService.deletePIN(general.phoneNumber)
    }
    
    // Update settings
    updateGeneralWithSave('enablePasscode', false)
    updateGeneralWithSave('passcodeSetup', false)
  }, [general.phoneNumber, updateGeneralWithSave])
  
  return {
    // Settings data
    general,
    transaction,
    invoice,
    party,
    item,
    message,
    tax,
    
    // Loading states
    loading,
    error,
    lastSaved,
    
    // Update functions
    updateGeneral,
    updateTransaction,
    updateInvoice,
    updateParty,
    updateItem,
    updateMessage,
    updateTax,
    
    // Auto-save update functions
    updateGeneralWithSave,
    updateTransactionWithSave,
    updateInvoiceWithSave,
    updatePartyWithSave,
    updateItemWithSave,
    updateMessageWithSave,
    updateTaxWithSave,
    
    // Action functions
    saveAll,
    loadAll,
    resetAll,
    
    // Utility functions
    isFeatureEnabled,
    toggleFeature,
    
    // PIN utility functions
    isPINRequired,
    isPINSetup,
    isPINVerified,
    clearPINData
  }
}

export default useSettings
