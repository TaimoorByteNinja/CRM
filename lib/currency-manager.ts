import { useAppSelector } from './store/hooks'
import { selectGeneralSettings } from './store/slices/settingsSlice'
import { getCountryByCode } from './country-data'

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  position: 'before' | 'after'
  numberFormat: string
}

export class CurrencyManager {
  private static instance: CurrencyManager
  private currentCurrency: CurrencyConfig | null = null

  private constructor() {}

  static getInstance(): CurrencyManager {
    if (!CurrencyManager.instance) {
      CurrencyManager.instance = new CurrencyManager()
    }
    return CurrencyManager.instance
  }

  setCurrency(countryCode: string): void {
    const country = getCountryByCode(countryCode)
    if (country) {
      this.currentCurrency = {
        code: country.currency.code,
        symbol: country.currency.symbol,
        name: country.currency.name,
        position: country.currency.position,
        numberFormat: country.numberFormat
      }
    }
  }

  getCurrentCurrency(): CurrencyConfig | null {
    return this.currentCurrency
  }

  formatAmount(amount: number, showSymbol: boolean = true): string {
    if (!this.currentCurrency) {
      return amount.toString()
    }

    const formatter = new Intl.NumberFormat(this.currentCurrency.numberFormat, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: this.currentCurrency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

    if (showSymbol) {
      return formatter.format(amount)
    } else {
      const formatted = formatter.format(amount)
      return formatted
    }
  }

  formatAmountWithSymbol(amount: number | undefined | null): string {
    // Handle undefined/null amounts
    if (amount === undefined || amount === null || isNaN(amount)) {
      amount = 0
    }

    if (!this.currentCurrency) {
      return amount.toString()
    }

    const formattedNumber = new Intl.NumberFormat(this.currentCurrency.numberFormat, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)

    if (this.currentCurrency.position === 'before') {
      return `${this.currentCurrency.symbol}${formattedNumber}`
    } else {
      return `${formattedNumber}${this.currentCurrency.symbol}`
    }
  }

  getSymbol(): string {
    return this.currentCurrency?.symbol || '₹'
  }

  getCode(): string {
    return this.currentCurrency?.code || 'INR'
  }

  getName(): string {
    return this.currentCurrency?.name || 'Indian Rupee'
  }
}

// Hook for React components
export const useCurrency = () => {
  const generalSettings = useAppSelector(selectGeneralSettings)
  const currencyManager = CurrencyManager.getInstance()
  
  // Update currency based on current Redux settings
  if (generalSettings.selectedCountry) {
    currencyManager.setCurrency(generalSettings.selectedCountry)
  }
  
  return {
    formatAmount: (amount: number, showSymbol: boolean = true) => 
      currencyManager.formatAmount(amount, showSymbol),
    formatAmountWithSymbol: (amount: number) => 
      currencyManager.formatAmountWithSymbol(amount),
    getSymbol: () => currencyManager.getSymbol(),
    getCode: () => currencyManager.getCode(),
    getName: () => currencyManager.getName(),
    getCurrentCurrency: () => currencyManager.getCurrentCurrency()
  }
}

// Utility function for non-hook contexts
export const formatCurrency = (amount: number, countryCode?: string): string => {
  const currencyManager = CurrencyManager.getInstance()
  
  if (countryCode) {
    currencyManager.setCurrency(countryCode)
  }
  
  return currencyManager.formatAmountWithSymbol(amount)
}

export const getCurrencySymbol = (countryCode?: string): string => {
  const currencyManager = CurrencyManager.getInstance()
  
  if (countryCode) {
    currencyManager.setCurrency(countryCode)
  }
  
  return currencyManager.getSymbol()
}
