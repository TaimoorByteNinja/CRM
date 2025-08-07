import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '../index'

interface BusinessItem {
  id: string
  name: string
  category: string
  quantity: number
  price: number
  cost: number
  description: string
  sku: string
  minStock: number
  maxStock: number
  supplier: string
  lastUpdated: Date
  customFields: Record<string, any>
  image?: string
  barcode?: string
  location?: string
  tags: string[]
  color: string
  phone_number: string
}

interface CalculatorHistory {
  id: string
  expression: string
  result: number
  timestamp: Date
  saved?: boolean
  phone_number: string
}

interface BusinessModule {
  id: string
  name: string
  type: "inventory" | "sales" | "custom" | "analytics" | "calculator"
  items: BusinessItem[]
  settings: Record<string, any>
  position: { x: number; y: number }
  size: { width: number; height: number }
  color: string
  icon: string
  totalStock: number
  pricePerUnit: number
  phone_number: string
  created_at: string
  updated_at: string
}

interface Transaction {
  id: string
  itemId: string
  itemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  type: "sale" | "purchase" | "adjustment" | "return"
  timestamp: Date
  notes: string
  customer?: string
  paymentMethod?: string
  phone_number: string
}

interface CartItem {
  moduleId: string
  moduleName: string
  quantity: number
  pricePerUnit: number
  totalPrice: number
  color: string
}

interface DailyReset {
  lastResetDate: string
  todaysSalesReset: boolean
  phone_number: string
}

interface BusinessManagerState {
  modules: BusinessModule[]
  transactions: Transaction[]
  calculatorHistory: CalculatorHistory[]
  cart: CartItem[]
  customQuantities: Record<string, number>
  dailyReset: DailyReset | null
  loading: boolean
  error: string | null
  lastSaved: string | null
  isAutoSaving: boolean
}

const initialState: BusinessManagerState = {
  modules: [],
  transactions: [],
  calculatorHistory: [],
  cart: [],
  customQuantities: {},
  dailyReset: null,
  loading: false,
  error: null,
  lastSaved: null,
  isAutoSaving: false,
}

// Async thunks for API operations
export const fetchBusinessModules = createAsyncThunk(
  'businessManager/fetchModules',
  async (phoneNumber: string) => {
    const response = await fetch(`/api/business-hub/business-manager/modules?phone=${encodeURIComponent(phoneNumber)}`)
    if (!response.ok) throw new Error('Failed to fetch business modules')
    return response.json()
  }
)

export const saveBusinessModule = createAsyncThunk(
  'businessManager/saveModule',
  async ({ module, phoneNumber }: { module: BusinessModule; phoneNumber: string }) => {
    const response = await fetch('/api/business-hub/business-manager/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...module, phone_number: phoneNumber }),
    })
    if (!response.ok) throw new Error('Failed to save business module')
    return response.json()
  }
)

export const updateBusinessModule = createAsyncThunk(
  'businessManager/updateModule',
  async ({ module, phoneNumber }: { module: BusinessModule; phoneNumber: string }) => {
    const response = await fetch(`/api/business-hub/business-manager/modules/${module.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...module, phone_number: phoneNumber }),
    })
    if (!response.ok) throw new Error('Failed to update business module')
    return response.json()
  }
)

export const deleteBusinessModule = createAsyncThunk(
  'businessManager/deleteModule',
  async ({ moduleId, phoneNumber }: { moduleId: string; phoneNumber: string }) => {
    const response = await fetch(`/api/business-hub/business-manager/modules/${moduleId}?phone=${encodeURIComponent(phoneNumber)}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete business module')
    return moduleId
  }
)

export const fetchTransactions = createAsyncThunk(
  'businessManager/fetchTransactions',
  async (phoneNumber: string) => {
    const response = await fetch(`/api/business-hub/business-manager/transactions?phone=${encodeURIComponent(phoneNumber)}`)
    if (!response.ok) throw new Error('Failed to fetch transactions')
    return response.json()
  }
)

export const saveTransaction = createAsyncThunk(
  'businessManager/saveTransaction',
  async ({ transaction, phoneNumber }: { transaction: Transaction; phoneNumber: string }) => {
    const response = await fetch('/api/business-hub/business-manager/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...transaction, phone_number: phoneNumber }),
    })
    if (!response.ok) throw new Error('Failed to save transaction')
    return response.json()
  }
)

const businessManagerSlice = createSlice({
  name: 'businessManager',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setIsAutoSaving: (state, action: PayloadAction<boolean>) => {
      state.isAutoSaving = action.payload
    },
    setLastSaved: (state, action: PayloadAction<string>) => {
      state.lastSaved = action.payload
    },
    addModule: (state, action: PayloadAction<BusinessModule>) => {
      state.modules.push(action.payload)
    },
    updateModule: (state, action: PayloadAction<BusinessModule>) => {
      const index = state.modules.findIndex(m => m.id === action.payload.id)
      if (index !== -1) {
        state.modules[index] = action.payload
      }
    },
    removeModule: (state, action: PayloadAction<string>) => {
      state.modules = state.modules.filter(m => m.id !== action.payload)
      state.cart = state.cart.filter(item => item.moduleId !== action.payload)
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload)
    },
    updateModuleStock: (state, action: PayloadAction<{ moduleId: string; newStock: number }>) => {
      const module = state.modules.find(m => m.id === action.payload.moduleId)
      if (module) {
        module.totalStock = Math.max(0, action.payload.newStock)
        module.updated_at = new Date().toISOString()
      }
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.cart.find(item => item.moduleId === action.payload.moduleId)
      if (existingItem) {
        existingItem.quantity += action.payload.quantity
        existingItem.totalPrice = existingItem.quantity * existingItem.pricePerUnit
      } else {
        state.cart.push(action.payload)
      }
    },
    removeFromCart: (state, action: PayloadAction<{ moduleId: string; quantity?: number }>) => {
      const { moduleId, quantity } = action.payload
      if (quantity) {
        const item = state.cart.find(item => item.moduleId === moduleId)
        if (item) {
          item.quantity = Math.max(0, item.quantity - quantity)
          item.totalPrice = item.quantity * item.pricePerUnit
          if (item.quantity === 0) {
            state.cart = state.cart.filter(item => item.moduleId !== moduleId)
          }
        }
      } else {
        state.cart = state.cart.filter(item => item.moduleId !== moduleId)
      }
    },
    updateCartItemQuantity: (state, action: PayloadAction<{ moduleId: string; quantity: number }>) => {
      const item = state.cart.find(item => item.moduleId === action.payload.moduleId)
      if (item) {
        item.quantity = action.payload.quantity
        item.totalPrice = item.quantity * item.pricePerUnit
      }
    },
    clearCart: (state) => {
      state.cart = []
      state.customQuantities = {}
    },
    setCustomQuantity: (state, action: PayloadAction<{ moduleId: string; quantity: number }>) => {
      state.customQuantities[action.payload.moduleId] = action.payload.quantity
    },
    addCalculatorHistory: (state, action: PayloadAction<CalculatorHistory>) => {
      state.calculatorHistory.unshift(action.payload)
      // Keep only last 20 entries
      if (state.calculatorHistory.length > 20) {
        state.calculatorHistory = state.calculatorHistory.slice(0, 20)
      }
    },
    setDailyReset: (state, action: PayloadAction<DailyReset>) => {
      state.dailyReset = action.payload
    },
    resetTodaysSales: (state) => {
      const today = new Date().toDateString()
      state.transactions = state.transactions.filter(t => {
        const transactionDate = new Date(t.timestamp).toDateString()
        return !(t.type === 'sale' && transactionDate === today)
      })
    },
    clearAllData: (state) => {
      Object.assign(state, initialState)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch modules
      .addCase(fetchBusinessModules.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBusinessModules.fulfilled, (state, action) => {
        state.loading = false
        state.modules = action.payload
      })
      .addCase(fetchBusinessModules.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch modules'
      })
      // Save module
      .addCase(saveBusinessModule.fulfilled, (state, action) => {
        state.modules.push(action.payload)
      })
      // Update module
      .addCase(updateBusinessModule.fulfilled, (state, action) => {
        const index = state.modules.findIndex(m => m.id === action.payload.id)
        if (index !== -1) {
          state.modules[index] = action.payload
        }
      })
      // Delete module
      .addCase(deleteBusinessModule.fulfilled, (state, action) => {
        state.modules = state.modules.filter(m => m.id !== action.payload)
        state.cart = state.cart.filter(item => item.moduleId !== action.payload)
      })
      // Fetch transactions
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload
      })
      // Save transaction
      .addCase(saveTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload)
      })
  },
})

export const {
  setLoading,
  setError,
  setIsAutoSaving,
  setLastSaved,
  addModule,
  updateModule,
  removeModule,
  addTransaction,
  updateModuleStock,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  setCustomQuantity,
  addCalculatorHistory,
  setDailyReset,
  resetTodaysSales,
  clearAllData,
} = businessManagerSlice.actions

// Selectors
export const selectBusinessModules = (state: RootState) => state.businessManager.modules
export const selectBusinessTransactions = (state: RootState) => state.businessManager.transactions
export const selectBusinessCart = (state: RootState) => state.businessManager.cart
export const selectCalculatorHistory = (state: RootState) => state.businessManager.calculatorHistory
export const selectBusinessManagerLoading = (state: RootState) => state.businessManager.loading
export const selectBusinessManagerError = (state: RootState) => state.businessManager.error
export const selectLastSaved = (state: RootState) => state.businessManager.lastSaved
export const selectIsAutoSaving = (state: RootState) => state.businessManager.isAutoSaving
export const selectCustomQuantities = (state: RootState) => state.businessManager.customQuantities
export const selectDailyReset = (state: RootState) => state.businessManager.dailyReset

// Computed selectors
export const selectCartTotal = (state: RootState) => 
  state.businessManager.cart.reduce((sum, item) => sum + item.totalPrice, 0)

export const selectTotalInventoryValue = (state: RootState) =>
  state.businessManager.modules.reduce((total, module) => total + (module.totalStock * module.pricePerUnit), 0)

export const selectTodaysSales = (state: RootState) => {
  const today = new Date().toDateString()
  return state.businessManager.transactions
    .filter(t => t.type === 'sale' && new Date(t.timestamp).toDateString() === today)
    .reduce((sum, t) => sum + t.totalPrice, 0)
}

export const selectLowStockModules = (state: RootState) =>
  state.businessManager.modules.filter(module => {
    const lowStockThreshold = Math.max(5, module.totalStock * 0.1) // 10% or minimum 5
    return module.totalStock <= lowStockThreshold
  })

export const selectActiveModulesCount = (state: RootState) => state.businessManager.modules.length

// Business metrics for overview integration
export const selectBusinessMetrics = (state: RootState) => ({
  totalInventoryValue: selectTotalInventoryValue(state),
  todaysSales: selectTodaysSales(state),
  lowStockCount: selectLowStockModules(state).length,
  activeModulesCount: selectActiveModulesCount(state),
  cartTotal: selectCartTotal(state),
  totalTransactions: state.businessManager.transactions.length,
})

export default businessManagerSlice.reducer
