import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// Additional Settings Interfaces
export interface PartySettings {
  partyGrouping: boolean
  shippingAddress: boolean
  managePartyStatus: boolean
  enablePaymentReminder: boolean
  paymentReminderDays: number
  enableLoyaltyPoint: boolean
  sendSMSToParty: boolean
  sendTransactionUpdate: boolean
  sendSMSCopy: boolean
  partyBalance: boolean
  webInvoiceLink: boolean
  autoSMSFor: {
    sale: boolean
    purchase: boolean
    payment: boolean
    quotation: boolean
    proforma: boolean
    delivery: boolean
  }
  additionalFields: {
    field1: { name: string; enabled: boolean; showInPrint?: boolean }
    field2: { name: string; enabled: boolean; showInPrint?: boolean }
    field3: { name: string; enabled: boolean; showInPrint?: boolean }
    field4: { name: string; enabled: boolean; showInPrint?: boolean }
  }
}

export interface ItemSettings {
  enableItem: boolean
  barcodeScanning: boolean
  stockMaintenance: boolean
  manufacturing: boolean
  showLowStockDialog: boolean
  itemsUnit: boolean
  defaultUnit: boolean
  itemCategory: boolean
  partyWiseItemRate: boolean
  description: boolean
  itemWiseTax: boolean
  itemWiseDiscount: boolean
  updateSalePrice: boolean
  wholesalePrice: boolean
  itemFields: {
    modelNo: { enabled: boolean; name: string }
    size: { enabled: boolean; name: string }
    color: { enabled: boolean; name: string }
    brand: { enabled: boolean; name: string }
  }
}

export interface MessageSettings {
  sendSMSToParty: boolean
  sendTransactionUpdate: boolean
  sendSMSCopy: boolean
  partyBalance: boolean
  webInvoiceLink: boolean
  messageTemplates: {
    sales: string
    purchase: string
    payment: string
    quotation: string
    proforma: string
    delivery: string
  }
}

export interface TaxSettings {
  taxRates: {
    id: string
    name: string
    rate: number
    type: 'percentage' | 'fixed'
    isDefault: boolean
  }[]
  taxGroups: {
    id: string
    name: string
    taxes: string[]
    totalRate: number
  }[]
}

export interface InvoiceSettings {
  // Layout and Theme
  layoutTheme: 'tally' | 'landscape1' | 'landscape2' | 'tax1' | 'custom'
  customTheme: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
    headerColor: string
    borderColor: string
  }
  
  // Company Information
  companyName: string
  companyLogo: boolean
  companyLogoUrl?: string
  companyAddress: string
  companyEmail: string
  companyPhone: string
  companyWebsite?: string
  companyTaxId?: string
  
  // Invoice Layout
  showCompanyLogo: boolean
  showCompanyAddress: boolean
  showCompanyContact: boolean
  showTaxId: boolean
  showWebsite: boolean
  
  // Invoice Content
  invoiceTitle: string
  showInvoiceNumber: boolean
  showDate: boolean
  showDueDate: boolean
  showCustomerInfo: boolean
  showShippingAddress: boolean
  showNotes: boolean
  showTerms: boolean
  
  // Items Table
  showItemDescription: boolean
  showItemCode: boolean
  showItemCategory: boolean
  showItemTax: boolean
  showItemDiscount: boolean
  showItemTotal: boolean
  
  // Totals Section
  showSubtotal: boolean
  showTax: boolean
  showDiscount: boolean
  showShipping: boolean
  showGrandTotal: boolean
  
  // Footer
  footerText: string
  showFooter: boolean
  showSignature: boolean
  signatureText: string
  
  // Print Settings
  paperSize: 'A4' | 'A5' | 'Letter' | 'Legal'
  orientation: 'Portrait' | 'Landscape'
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
  fontSize: number
  fontFamily: string
  
  // Advanced Settings
  repeatHeader: boolean
  showPageNumbers: boolean
  showWatermark: boolean
  watermarkText: string
  watermarkOpacity: number
  
  // Currency and Formatting
  currency: string
  currencySymbol: string
  decimalPlaces: number
  dateFormat: string
  numberFormat: string
  
  // Templates
  templates: {
    id: string
    name: string
    settings: Partial<InvoiceSettings>
    isDefault: boolean
  }[]
  activeTemplate: string
}

export interface GeneralSettings {
  enablePasscode: boolean
  passcodeSetup: boolean
  businessCurrency: string
  decimalPlaces: number
  tinNumber: boolean
  stopNegativeStock: boolean
  autoBackup: boolean
  transactionHistory: boolean
  screenZoom: number
  multiFirm: boolean
  selectedCountry: string
  selectedCurrency: string
  selectedCurrencySymbol: string
  selectedNumberFormat: string
  selectedDateFormat: string
  phoneNumber: string
}

export interface TransactionSettings {
  invoiceNumber: boolean
  addTime: boolean
  cashSaleDefault: boolean
  billingName: boolean
  customerPO: boolean
  displayPurchasePrice: boolean
  showLastSalePrice: boolean
  freeItemQuantity: boolean
  count: boolean
  transactionTax: boolean
  transactionDiscount: boolean
  roundOffTotal: boolean
  quickEntry: boolean
  noInvoicePreview: boolean
  passcodeEdit: boolean
  discountPayments: boolean
  linkPayments: boolean
  dueDates: boolean
  showProfit: boolean
}

export interface SettingsState {
  general: GeneralSettings
  transaction: TransactionSettings
  invoice: InvoiceSettings
  party: PartySettings
  item: ItemSettings
  message: MessageSettings
  tax: TaxSettings
  loading: boolean
  error: string | null
  lastSaved: string | null
}

const defaultInvoiceSettings: InvoiceSettings = {
  layoutTheme: 'tally',
  customTheme: {
    primaryColor: '#1f2937',
    secondaryColor: '#6b7280',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    headerColor: '#f9fafb',
    borderColor: '#e5e7eb'
  },
  companyName: 'craft CRM',
  companyLogo: true,
  companyAddress: 'A-41 whadat colony whadat road lahore',
  companyEmail: 'taimoorazam38@gmail.com',
  companyPhone: '3034091907',
  companyWebsite: '',
  companyTaxId: '',
  showCompanyLogo: true,
  showCompanyAddress: true,
  showCompanyContact: true,
  showTaxId: false,
  showWebsite: false,
  invoiceTitle: 'Tax Invoice',
  showInvoiceNumber: true,
  showDate: true,
  showDueDate: true,
  showCustomerInfo: true,
  showShippingAddress: false,
  showNotes: true,
  showTerms: false,
  showItemDescription: true,
  showItemCode: false,
  showItemCategory: false,
  showItemTax: true,
  showItemDiscount: true,
  showItemTotal: true,
  showSubtotal: true,
  showTax: true,
  showDiscount: true,
  showShipping: false,
  showGrandTotal: true,
  footerText: 'Thank you for your business!',
  showFooter: true,
  showSignature: false,
  signatureText: 'Authorized Signature',
  paperSize: 'A4',
  orientation: 'Portrait',
  margins: {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20
  },
  fontSize: 12,
  fontFamily: 'Arial, sans-serif',
  repeatHeader: true,
  showPageNumbers: true,
  showWatermark: false,
  watermarkText: 'DRAFT',
  watermarkOpacity: 0.1,
  currency: 'INR',
  currencySymbol: '₹',
  decimalPlaces: 2,
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'en-IN',
  templates: [
    {
      id: 'default',
      name: 'Default Template',
      settings: {},
      isDefault: true
    }
  ],
  activeTemplate: 'default'
}

const initialState: SettingsState = {
  general: {
    enablePasscode: false,
    passcodeSetup: false,
    businessCurrency: '₨',
    decimalPlaces: 2,
    tinNumber: false,
    stopNegativeStock: false,
    autoBackup: false,
    transactionHistory: true,
    screenZoom: 100,
    multiFirm: false,
    selectedCountry: 'PK',
    selectedCurrency: 'PKR',
    selectedCurrencySymbol: '₨',
    selectedNumberFormat: 'en-PK',
    selectedDateFormat: 'DD/MM/YYYY',
    phoneNumber: ''
  },
  transaction: {
    invoiceNumber: true,
    addTime: false,
    cashSaleDefault: false,
    billingName: false,
    customerPO: false,
    displayPurchasePrice: true,
    showLastSalePrice: false,
    freeItemQuantity: false,
    count: false,
    transactionTax: true,
    transactionDiscount: true,
    roundOffTotal: true,
    quickEntry: false,
    noInvoicePreview: false,
    passcodeEdit: false,
    discountPayments: false,
    linkPayments: false,
    dueDates: false,
    showProfit: false
  },
  invoice: defaultInvoiceSettings,
  party: {
    partyGrouping: false,
    shippingAddress: false,
    managePartyStatus: false,
    enablePaymentReminder: false,
    paymentReminderDays: 7,
    enableLoyaltyPoint: false,
    sendSMSToParty: false,
    sendTransactionUpdate: false,
    sendSMSCopy: false,
    partyBalance: false,
    webInvoiceLink: false,
    autoSMSFor: {
      sale: false,
      purchase: false,
      payment: false,
      quotation: false,
      proforma: false,
      delivery: false
    },
    additionalFields: {
      field1: { name: 'Field 1', enabled: false, showInPrint: false },
      field2: { name: 'Field 2', enabled: false, showInPrint: false },
      field3: { name: 'Field 3', enabled: false, showInPrint: false },
      field4: { name: 'Field 4', enabled: false, showInPrint: false }
    }
  },
  item: {
    enableItem: true,
    barcodeScanning: false,
    stockMaintenance: true,
    manufacturing: false,
    showLowStockDialog: true,
    itemsUnit: true,
    defaultUnit: true,
    itemCategory: true,
    partyWiseItemRate: false,
    description: true,
    itemWiseTax: true,
    itemWiseDiscount: true,
    updateSalePrice: false,
    wholesalePrice: false,
    itemFields: {
      modelNo: { enabled: false, name: 'Model No.' },
      size: { enabled: false, name: 'Size' },
      color: { enabled: false, name: 'Color' },
      brand: { enabled: false, name: 'Brand' }
    }
  },
  message: {
    sendSMSToParty: false,
    sendTransactionUpdate: false,
    sendSMSCopy: false,
    partyBalance: false,
    webInvoiceLink: false,
    messageTemplates: {
      sales: `Greetings from [Firm_Name]
We are pleased to have you as a valuable customer. Please find the details of your transaction.

Sale Invoice :
Invoice Amount: [Invoice_Amount]
Balance: [Transaction_Balance]

Thanks for doing business with us.
Regards,
[Firm_Name]`,
      purchase: `Greetings from [Firm_Name]
Purchase transaction completed.

Purchase Invoice :
Invoice Amount: [Invoice_Amount]
Balance: [Transaction_Balance]

Thank you.
Regards,
[Firm_Name]`,
      payment: `Greetings from [Firm_Name]
Payment received successfully.

Payment Amount: [Payment_Amount]
Balance: [Transaction_Balance]

Thank you for your payment.
Regards,
[Firm_Name]`,
      quotation: `Greetings from [Firm_Name]
Please find your quotation details.

Quotation Amount: [Invoice_Amount]
Valid until: [Due_Date]

Thank you for your interest.
Regards,
[Firm_Name]`,
      proforma: `Greetings from [Firm_Name]
Please find your proforma invoice.

Proforma Amount: [Invoice_Amount]
Valid until: [Due_Date]

Thank you.
Regards,
[Firm_Name]`,
      delivery: `Greetings from [Firm_Name]
Your delivery is on the way.

Delivery Challan No: [Invoice_Number]
Items: [Item_Count]

Thank you.
Regards,
[Firm_Name]`
    }
  },
  tax: {
    taxRates: [
      { id: '1', name: 'GST 18%', rate: 18, type: 'percentage', isDefault: true },
      { id: '2', name: 'GST 12%', rate: 12, type: 'percentage', isDefault: false },
      { id: '3', name: 'GST 5%', rate: 5, type: 'percentage', isDefault: false }
    ],
    taxGroups: [
      { id: '1', name: 'Standard Tax', taxes: ['1'], totalRate: 18 }
    ]
  },
  loading: false,
  error: null,
  lastSaved: null
}

// Async thunks for backend integration
export const saveSettingsAsync = createAsyncThunk(
  'settings/saveSettingsAsync',
  async (settings: Partial<SettingsState>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/business-hub/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save settings');
    }
  }
);

export const loadSettingsAsync = createAsyncThunk(
  'settings/loadSettingsAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/business-hub/settings/load');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load settings');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load settings');
    }
  }
);

export const resetSettingsAsync = createAsyncThunk(
  'settings/resetSettingsAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/business-hub/settings/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset settings');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reset settings');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setLastSaved: (state, action: PayloadAction<string>) => {
      state.lastSaved = action.payload
    },
    
    // General Settings
    updateGeneralSettings: (state, action: PayloadAction<Partial<GeneralSettings>>) => {
      console.log('🔄 Redux: Updating general settings:', action.payload);
      if (action.payload.phoneNumber) {
        console.log('📱 Redux: Phone number being set to:', action.payload.phoneNumber);
        // Also save to localStorage for API client
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUserPhone', action.payload.phoneNumber);
          console.log('💾 Redux: Saved phone to localStorage');
        }
      }
      state.general = { ...state.general, ...action.payload }
    },
    
    // Transaction Settings
    updateTransactionSettings: (state, action: PayloadAction<Partial<TransactionSettings>>) => {
      state.transaction = { ...state.transaction, ...action.payload }
    },
    
    // Invoice Settings
    updateInvoiceSettings: (state, action: PayloadAction<Partial<InvoiceSettings>>) => {
      state.invoice = { ...state.invoice, ...action.payload }
    },
    
    // Party Settings
    updatePartySettings: (state, action: PayloadAction<Partial<PartySettings>>) => {
      state.party = { ...state.party, ...action.payload }
    },
    
    // Item Settings
    updateItemSettings: (state, action: PayloadAction<Partial<ItemSettings>>) => {
      state.item = { ...state.item, ...action.payload }
    },
    
    // Message Settings
    updateMessageSettings: (state, action: PayloadAction<Partial<MessageSettings>>) => {
      state.message = { ...state.message, ...action.payload }
    },
    
    // Tax Settings
    updateTaxSettings: (state, action: PayloadAction<Partial<TaxSettings>>) => {
      state.tax = { ...state.tax, ...action.payload }
    },
    
    // Tax Rate Management
    addTaxRate: (state, action: PayloadAction<TaxSettings['taxRates'][0]>) => {
      state.tax.taxRates.push(action.payload)
    },
    
    updateTaxRate: (state, action: PayloadAction<{ id: string; rate: Partial<TaxSettings['taxRates'][0]> }>) => {
      const index = state.tax.taxRates.findIndex(rate => rate.id === action.payload.id)
      if (index !== -1) {
        state.tax.taxRates[index] = { ...state.tax.taxRates[index], ...action.payload.rate }
      }
    },
    
    deleteTaxRate: (state, action: PayloadAction<string>) => {
      state.tax.taxRates = state.tax.taxRates.filter(rate => rate.id !== action.payload)
    },
    
    // Tax Group Management
    addTaxGroup: (state, action: PayloadAction<TaxSettings['taxGroups'][0]>) => {
      state.tax.taxGroups.push(action.payload)
    },
    
    updateTaxGroup: (state, action: PayloadAction<{ id: string; group: Partial<TaxSettings['taxGroups'][0]> }>) => {
      const index = state.tax.taxGroups.findIndex(group => group.id === action.payload.id)
      if (index !== -1) {
        state.tax.taxGroups[index] = { ...state.tax.taxGroups[index], ...action.payload.group }
      }
    },
    
    deleteTaxGroup: (state, action: PayloadAction<string>) => {
      state.tax.taxGroups = state.tax.taxGroups.filter(group => group.id !== action.payload)
    },
    
    updateCustomTheme: (state, action: PayloadAction<Partial<InvoiceSettings['customTheme']>>) => {
      state.invoice.customTheme = { ...state.invoice.customTheme, ...action.payload }
    },
    
    updateMargins: (state, action: PayloadAction<Partial<InvoiceSettings['margins']>>) => {
      state.invoice.margins = { ...state.invoice.margins, ...action.payload }
    },
    
    // Template Management
    addTemplate: (state, action: PayloadAction<InvoiceSettings['templates'][0]>) => {
      state.invoice.templates.push(action.payload)
    },
    
    updateTemplate: (state, action: PayloadAction<{ id: string; template: Partial<InvoiceSettings['templates'][0]> }>) => {
      const index = state.invoice.templates.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.invoice.templates[index] = { ...state.invoice.templates[index], ...action.payload.template }
      }
    },
    
    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.invoice.templates = state.invoice.templates.filter(t => t.id !== action.payload)
    },
    
    setActiveTemplate: (state, action: PayloadAction<string>) => {
      state.invoice.activeTemplate = action.payload
    },
    
    setDefaultTemplate: (state, action: PayloadAction<string>) => {
      state.invoice.templates.forEach(template => {
        template.isDefault = template.id === action.payload
      })
    },
    
    // Reset Settings
    resetToDefault: (state) => {
      state.invoice = defaultInvoiceSettings
    },
    
    // Load Settings
    loadSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      if (action.payload.general) state.general = { ...state.general, ...action.payload.general }
      if (action.payload.transaction) state.transaction = { ...state.transaction, ...action.payload.transaction }
      if (action.payload.invoice) state.invoice = { ...state.invoice, ...action.payload.invoice }
      if (action.payload.party) state.party = { ...state.party, ...action.payload.party }
      if (action.payload.item) state.item = { ...state.item, ...action.payload.item }
      if (action.payload.message) state.message = { ...state.message, ...action.payload.message }
      if (action.payload.tax) state.tax = { ...state.tax, ...action.payload.tax }
    }
  },
  extraReducers: (builder) => {
    builder
      // Save settings
      .addCase(saveSettingsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSettingsAsync.fulfilled, (state) => {
        state.loading = false;
        state.lastSaved = new Date().toISOString();
      })
      .addCase(saveSettingsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load settings
      .addCase(loadSettingsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSettingsAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.general) state.general = { ...state.general, ...action.payload.general };
        if (action.payload.transaction) state.transaction = { ...state.transaction, ...action.payload.transaction };
        if (action.payload.invoice) state.invoice = { ...state.invoice, ...action.payload.invoice };
        if (action.payload.party) state.party = { ...state.party, ...action.payload.party };
        if (action.payload.item) state.item = { ...state.item, ...action.payload.item };
        if (action.payload.message) state.message = { ...state.message, ...action.payload.message };
        if (action.payload.tax) state.tax = { ...state.tax, ...action.payload.tax };
      })
      .addCase(loadSettingsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset settings
      .addCase(resetSettingsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetSettingsAsync.fulfilled, (state) => {
        state.loading = false;
        // Reset to initial state
        const newState = initialState;
        state.general = newState.general;
        state.transaction = newState.transaction;
        state.invoice = newState.invoice;
        state.party = newState.party;
        state.item = newState.item;
        state.message = newState.message;
        state.tax = newState.tax;
      })
      .addCase(resetSettingsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
})

export const {
  setLoading,
  setError,
  setLastSaved,
  updateGeneralSettings,
  updateTransactionSettings,
  updateInvoiceSettings,
  updatePartySettings,
  updateItemSettings,
  updateMessageSettings,
  updateTaxSettings,
  addTaxRate,
  updateTaxRate,
  deleteTaxRate,
  addTaxGroup,
  updateTaxGroup,
  deleteTaxGroup,
  updateCustomTheme,
  updateMargins,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  setActiveTemplate,
  setDefaultTemplate,
  resetToDefault,
  loadSettings
} = settingsSlice.actions

// Selectors
export const selectSettings = (state: { settings: SettingsState }) => state.settings
export const selectGeneralSettings = (state: { settings: SettingsState }) => state.settings.general
export const selectTransactionSettings = (state: { settings: SettingsState }) => state.settings.transaction
export const selectInvoiceSettings = (state: { settings: SettingsState }) => state.settings.invoice
export const selectPartySettings = (state: { settings: SettingsState }) => state.settings.party
export const selectItemSettings = (state: { settings: SettingsState }) => state.settings.item
export const selectMessageSettings = (state: { settings: SettingsState }) => state.settings.message
export const selectTaxSettings = (state: { settings: SettingsState }) => state.settings.tax
export const selectActiveTemplate = (state: { settings: SettingsState }) => {
  const settings = state.settings.invoice
  return settings.templates.find(t => t.id === settings.activeTemplate) || settings.templates[0]
}
export const selectTemplates = (state: { settings: SettingsState }) => state.settings.invoice.templates
export const selectSettingsLoading = (state: { settings: SettingsState }) => state.settings.loading
export const selectSettingsError = (state: { settings: SettingsState }) => state.settings.error
export const selectLastSaved = (state: { settings: SettingsState }) => state.settings.lastSaved

export default settingsSlice.reducer 