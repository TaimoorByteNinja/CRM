import { supabase } from './supabaseClient'
import { store } from './store'
import { 
  updateGeneralSettings,
  updateTransactionSettings,
  updateInvoiceSettings,
  updatePartySettings,
  updateItemSettings,
  updateMessageSettings,
  updateTaxSettings 
} from './store/slices/settingsSlice'
import { setSales, clearSales, addSale } from './store/slices/salesSlice'
import { setCustomers, clearCustomers } from './store/slices/customersSlice'
import { setParties, clearParties } from './store/slices/partiesSlice'
import { setItems, clearItems } from './store/slices/itemsSlice'
import { setPurchases, clearPurchases } from './store/slices/purchasesSlice'
import { setExpenses, clearExpenses } from './store/slices/expensesSlice'
import { setBankAccounts, clearBankAccounts } from './store/slices/bankAccountsSlice'

export interface UserProfile {
  id?: string
  phone_number: string
  country: string
  currency: string
  currency_symbol: string
  date_format: string
  number_format: string
  created_at?: string
  updated_at?: string
}

export interface UserBusinessData {
  settings: {
    general: any
    transaction: any
    invoice: any
    party: any
    item: any
    message: any
    tax: any
  }
  sales: any[]
  customers: any[]
  parties: any[]
  items: any[]
  purchases: any[]
  expenses: any[]
  bankAccounts: any[]
}

export class UserDataManager {
  private static currentUserPhone: string | null = null

  /**
   * Clear all Redux data to ensure clean state for new users
   */
  private static clearAllReduxData() {
    console.log('🧹 Clearing all Redux data for fresh user state')
    
    // Clear phone number from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUserPhone')
    }
    
    // Clear internal phone tracking
    this.currentUserPhone = null
    
    // Clear all business data using the new clear actions
    store.dispatch(clearSales())
    store.dispatch(clearCustomers())
    store.dispatch(clearParties())
    store.dispatch(clearItems())
    store.dispatch(clearPurchases())
    store.dispatch(clearExpenses())
    store.dispatch(clearBankAccounts())
    
    console.log('✅ All Redux data cleared successfully')
  }

  /**
   * Initialize user session by phone number
   * If user exists, load their data. If new, create fresh profile.
   */
  static async initializeUserByPhone(phoneNumber: string): Promise<{
    isNewUser: boolean
    userData: UserBusinessData | null
  }> {
    try {
      console.log(`🔍 Checking for existing user with phone: ${phoneNumber}`)
      
      // Store phone number in localStorage for API client access
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUserPhone', phoneNumber)
      }
      
      // Clear any existing data first to ensure clean state
      this.clearAllReduxData()
      
      // Check if user profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking user profile:', profileError)
        throw profileError
      }

      this.currentUserPhone = phoneNumber

      if (existingProfile) {
        console.log('✅ Existing user found, loading their data...')
        const userData = await this.loadUserBusinessData(phoneNumber)
        return {
          isNewUser: false,
          userData
        }
      } else {
        console.log('🆕 New user detected, creating fresh profile...')
        await this.createNewUserProfile(phoneNumber)
        return {
          isNewUser: true,
          userData: null
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error)
      throw error
    }
  }

  /**
   * Create a new user profile with default settings
   */
  private static async createNewUserProfile(phoneNumber: string): Promise<void> {
    try {
      const defaultProfile: UserProfile = {
        phone_number: phoneNumber,
        country: 'PK',
        currency: 'PKR',
        currency_symbol: '₨',
        date_format: 'DD/MM/YYYY',
        number_format: 'en-PK'
      }

      const { error } = await supabase
        .from('user_profiles')
        .insert([defaultProfile])

      if (error) {
        // Ignore duplicate key error - user profile already exists
        if (error.code === '23505' && error.message.includes('duplicate key value violates unique constraint')) {
          console.log('ℹ️ User profile already exists, continuing...')
          // Load the existing profile instead
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('phone_number', phoneNumber)
            .single()
          
          if (existingProfile) {
            // Update Redux store with existing settings
            store.dispatch(updateGeneralSettings({
              selectedCountry: existingProfile.country || 'PK',
              selectedCurrency: existingProfile.currency || 'PKR',
              selectedCurrencySymbol: existingProfile.currency_symbol || '₨',
              selectedNumberFormat: existingProfile.number_format || 'en-PK',
              selectedDateFormat: existingProfile.date_format || 'DD/MM/YYYY',
              phoneNumber: phoneNumber
            }))
          }
          return
        }
        
        console.error('Error creating user profile:', error)
        throw error
      }

      console.log('✅ New user profile created successfully')
      
      // Update Redux store with default Pakistan settings
      store.dispatch(updateGeneralSettings({
        selectedCountry: 'PK',
        selectedCurrency: 'PKR',
        selectedCurrencySymbol: '₨',
        selectedNumberFormat: 'en-PK',
        selectedDateFormat: 'DD/MM/YYYY',
        phoneNumber: phoneNumber
      }))

    } catch (error) {
      console.error('Error in createNewUserProfile:', error)
      throw error
    }
  }

  /**
   * Load all business data for an existing user
   */
  private static async loadUserBusinessData(phoneNumber: string): Promise<UserBusinessData> {
    try {
      console.log('📊 Loading business data for user...')

      // Load all data in parallel
      const [
        settingsData,
        salesData,
        customersData,
        partiesData,
        itemsData,
        purchasesData,
        expensesData,
        bankAccountsData
      ] = await Promise.all([
        this.loadUserSettings(phoneNumber),
        this.loadUserSales(phoneNumber),
        this.loadUserCustomers(phoneNumber),
        this.loadUserParties(phoneNumber),
        this.loadUserItems(phoneNumber),
        this.loadUserPurchases(phoneNumber),
        this.loadUserExpenses(phoneNumber),
        this.loadUserBankAccounts(phoneNumber)
      ])

      const userData: UserBusinessData = {
        settings: settingsData || {
          general: {},
          transaction: {},
          invoice: {},
          party: {},
          item: {},
          message: {},
          tax: {}
        },
        sales: salesData || [],
        customers: customersData || [],
        parties: partiesData || [],
        items: itemsData || [],
        purchases: purchasesData || [],
        expenses: expensesData || [],
        bankAccounts: bankAccountsData || []
      }

      // Update Redux store with loaded data
      await this.updateReduxWithUserData(userData, phoneNumber)

      console.log('✅ All user data loaded successfully')
      return userData

    } catch (error) {
      console.error('Error loading user business data:', error)
      throw error
    }
  }

  /**
   * Load user settings from database
   */
  private static async loadUserSettings(phoneNumber: string) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single()

      if (error) {
        // Handle case where table/column doesn't exist yet
        if (error.code === '42703' || error.code === 'PGRST204') {
          console.warn('user_settings table not properly configured, using default settings')
          return null
        }
        // Handle case where no record found (normal case)
        if (error.code !== 'PGRST116') {
          console.error('Error loading settings:', error)
          return null
        }
      }

      return data?.settings_data || null
    } catch (error) {
      console.error('Error in loadUserSettings:', error)
      return null
    }
  }

  /**
   * Load user sales data
   */
  private static async loadUserSales(phoneNumber: string) {
    try {
      const { data, error } = await supabase
        .from('user_sales')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading sales:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in loadUserSales:', error)
      return []
    }
  }

  /**
   * Load user customers
   */
  private static async loadUserCustomers(phoneNumber: string) {
    try {
      const { data, error } = await supabase
        .from('user_customers')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading customers:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in loadUserCustomers:', error)
      return []
    }
  }

  /**
   * Load user parties
   */
  private static async loadUserParties(phoneNumber: string) {
    try {
      const { data, error } = await supabase
        .from('user_parties')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading parties:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in loadUserParties:', error)
      return []
    }
  }

  /**
   * Load user items
   */
  private static async loadUserItems(phoneNumber: string) {
    try {
      const { data, error } = await supabase
        .from('user_items')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading items:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in loadUserItems:', error)
      return []
    }
  }

  /**
   * Load user purchases
   */
  private static async loadUserPurchases(phoneNumber: string) {
    try {
      const { data, error } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading purchases:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in loadUserPurchases:', error)
      return []
    }
  }

  /**
   * Load user expenses
   */
  private static async loadUserExpenses(phoneNumber: string) {
    try {
      const { data, error } = await supabase
        .from('user_expenses')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading expenses:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in loadUserExpenses:', error)
      return []
    }
  }

  /**
   * Load user bank accounts
   */
  private static async loadUserBankAccounts(phoneNumber: string) {
    try {
      const { data, error } = await supabase
        .from('user_bank_accounts')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading bank accounts:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in loadUserBankAccounts:', error)
      return []
    }
  }

  /**
   * Update Redux store with loaded user data
   */
  private static async updateReduxWithUserData(userData: UserBusinessData, phoneNumber: string) {
    try {
      const { settings, sales, customers, parties, items, purchases, expenses, bankAccounts } = userData

      // Update settings
      if (settings.general) {
        store.dispatch(updateGeneralSettings({
          ...settings.general,
          phoneNumber
        }))
      }
      if (settings.transaction) {
        store.dispatch(updateTransactionSettings(settings.transaction))
      }
      if (settings.invoice) {
        store.dispatch(updateInvoiceSettings(settings.invoice))
      }
      if (settings.party) {
        store.dispatch(updatePartySettings(settings.party))
      }
      if (settings.item) {
        store.dispatch(updateItemSettings(settings.item))
      }
      if (settings.message) {
        store.dispatch(updateMessageSettings(settings.message))
      }
      if (settings.tax) {
        store.dispatch(updateTaxSettings(settings.tax))
      }

      // Update business data using batch update actions
      if (sales.length > 0) {
        // Skip setting sales here - let the API client handle sales loading
        // This prevents unmapped data from overriding properly mapped API data
        console.log('📊 Skipping user-data-manager sales loading, API client handles this');
        // store.dispatch(setSales(sales))
      }
      if (customers.length > 0) {
        store.dispatch(setCustomers(customers))
      }
      if (parties.length > 0) {
        store.dispatch(setParties(parties))
      }
      if (items.length > 0) {
        // Skip setting items here - let the API client handle items loading
        // This prevents unmapped data from overriding properly mapped API data
        console.log('📋 Skipping user-data-manager items loading, API client handles this');
        // store.dispatch(setItems(items))
      }
      if (purchases.length > 0) {
        store.dispatch(setPurchases(purchases))
      }
      if (expenses.length > 0) {
        store.dispatch(setExpenses(expenses))
      }
      if (bankAccounts.length > 0) {
        store.dispatch(setBankAccounts(bankAccounts))
      }

      console.log('✅ Redux store updated with user data')
    } catch (error) {
      console.error('Error updating Redux store:', error)
      throw error
    }
  }

  /**
   * Save current user data to database
   */
  static async saveCurrentUserData(): Promise<void> {
    if (!this.currentUserPhone) {
      console.warn('No current user phone number set')
      return
    }

    try {
      const state = store.getState()
      
      // Save settings
      await this.saveUserSettings(this.currentUserPhone, {
        general: state.settings.general,
        transaction: state.settings.transaction,
        invoice: state.settings.invoice,
        party: state.settings.party,
        item: state.settings.item,
        message: state.settings.message,
        tax: state.settings.tax
      })

      // Save business data
      await Promise.all([
        this.saveUserSales(this.currentUserPhone, state.sales.sales),
        this.saveUserCustomers(this.currentUserPhone, state.customers.customers),
        this.saveUserParties(this.currentUserPhone, state.parties.parties),
        this.saveUserItems(this.currentUserPhone, state.items.items),
        this.saveUserPurchases(this.currentUserPhone, state.purchases.purchases),
        this.saveUserExpenses(this.currentUserPhone, state.expenses.expenses),
        this.saveUserBankAccounts(this.currentUserPhone, state.bankAccounts.accounts)
      ])

      console.log('✅ All user data saved successfully')
    } catch (error) {
      console.error('Error saving user data:', error)
      // Don't throw error to prevent app crashes
      console.warn('Some data save operations failed, continuing without full persistence')
    }
  }

  /**
   * Save user settings
   */
  private static async saveUserSettings(phoneNumber: string, settings: any) {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert([{
          phone_number: phoneNumber,
          settings_data: settings,
          updated_at: new Date().toISOString()
        }])

      if (error) {
        // Handle case where table/column doesn't exist yet
        if (error.code === '42703' || error.code === 'PGRST204') {
          console.warn('user_settings table not properly configured, skipping save')
          return
        }
        console.error('Error saving settings:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in saveUserSettings:', error)
      // Don't throw error to prevent app crashes
      console.warn('Settings save failed, continuing without persistence')
    }
  }

  /**
   * Save user sales
   */
  private static async saveUserSales(phoneNumber: string, sales: any[]) {
    try {
      // Delete existing sales for this user
      await supabase
        .from('user_sales')
        .delete()
        .eq('phone_number', phoneNumber)

      // Insert new sales data
      if (sales.length > 0) {
        const salesWithPhone = sales.map(sale => ({
          ...sale,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('user_sales')
          .insert(salesWithPhone)

        if (error) {
          console.error('Error saving sales:', error)
          throw error
        }
      }
    } catch (error) {
      console.error('Error in saveUserSales:', error)
      throw error
    }
  }

  /**
   * Save user customers
   */
  private static async saveUserCustomers(phoneNumber: string, customers: any[]) {
    try {
      // Delete existing customers for this user
      await supabase
        .from('user_customers')
        .delete()
        .eq('phone_number', phoneNumber)

      // Insert new customers data
      if (customers.length > 0) {
        const customersWithPhone = customers.map(customer => ({
          ...customer,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('user_customers')
          .insert(customersWithPhone)

        if (error) {
          console.error('Error saving customers:', error)
          throw error
        }
      }
    } catch (error) {
      console.error('Error in saveUserCustomers:', error)
      throw error
    }
  }

  /**
   * Save user parties
   */
  private static async saveUserParties(phoneNumber: string, parties: any[]) {
    try {
      // Delete existing parties for this user
      await supabase
        .from('user_parties')
        .delete()
        .eq('phone_number', phoneNumber)

      // Insert new parties data
      if (parties.length > 0) {
        const partiesWithPhone = parties.map(party => ({
          ...party,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('user_parties')
          .insert(partiesWithPhone)

        if (error) {
          console.error('Error saving parties:', error)
          throw error
        }
      }
    } catch (error) {
      console.error('Error in saveUserParties:', error)
      throw error
    }
  }

  /**
   * Save user items
   */
  private static async saveUserItems(phoneNumber: string, items: any[]) {
    try {
      // Delete existing items for this user
      await supabase
        .from('user_items')
        .delete()
        .eq('phone_number', phoneNumber)

      // Insert new items data
      if (items.length > 0) {
        const itemsWithPhone = items.map(item => ({
          ...item,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('user_items')
          .insert(itemsWithPhone)

        if (error) {
          console.error('Error saving items:', error)
          throw error
        }
      }
    } catch (error) {
      console.error('Error in saveUserItems:', error)
      throw error
    }
  }

  private static async saveUserPurchases(phoneNumber: string, purchases: any[]) {
    try {
      // Delete existing purchases for this user
      await supabase
        .from('user_purchases')
        .delete()
        .eq('phone_number', phoneNumber)

      // Insert new purchases data
      if (purchases.length > 0) {
        const purchasesWithPhone = purchases.map(purchase => ({
          ...purchase,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('user_purchases')
          .insert(purchasesWithPhone)

        if (error) {
          console.error('Error saving purchases:', error)
          throw error
        }
      }
    } catch (error) {
      console.error('Error in saveUserPurchases:', error)
      throw error
    }
  }

  private static async saveUserExpenses(phoneNumber: string, expenses: any[]) {
    try {
      // Delete existing expenses for this user
      await supabase
        .from('user_expenses')
        .delete()
        .eq('phone_number', phoneNumber)

      // Insert new expenses data
      if (expenses.length > 0) {
        const expensesWithPhone = expenses.map(expense => ({
          ...expense,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('user_expenses')
          .insert(expensesWithPhone)

        if (error) {
          console.error('Error saving expenses:', error)
          throw error
        }
      }
    } catch (error) {
      console.error('Error in saveUserExpenses:', error)
      throw error
    }
  }

  private static async saveUserBankAccounts(phoneNumber: string, bankAccounts: any[]) {
    try {
      // Delete existing bank accounts for this user
      await supabase
        .from('user_bank_accounts')
        .delete()
        .eq('phone_number', phoneNumber)

      // Insert new bank accounts data
      if (bankAccounts.length > 0) {
        const accountsWithPhone = bankAccounts.map(account => ({
          ...account,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('user_bank_accounts')
          .insert(accountsWithPhone)

        if (error) {
          console.error('Error saving bank accounts:', error)
          throw error
        }
      }
    } catch (error) {
      console.error('Error in saveUserBankAccounts:', error)
      throw error
    }
  }

  /**
   * Clear current user session
   */
  static clearUserSession(): void {
    this.currentUserPhone = null
    console.log('🔄 User session cleared')
  }

  /**
   * Get current user phone number
   */
  static getCurrentUserPhone(): string | null {
    return this.currentUserPhone
  }

  /**
   * Check if user has any existing data
   */
  static async hasExistingData(phoneNumber: string): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('phone_number', phoneNumber)
        .single()

      return !!profile
    } catch (error) {
      return false
    }
  }
}
