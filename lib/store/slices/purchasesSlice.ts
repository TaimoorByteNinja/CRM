import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit'

export interface Purchase {
  id: string;
  bill_number: string;
  supplier_id: string | null;
  subtotal: number | null;
  tax: number | null;
  tax_rate: number | null;
  discount: number | null;
  total: number | null;
  status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  created_at: string | null;
  notes: string | null;
  supplier_name?: string;
  supplier?: {
    id: string;
    party_name: string;
    phone: string | null;
    email: string | null;
  } | null;
}

interface PurchasesState {
  purchases: Purchase[]
  loading: boolean
  error: string | null
  selectedPurchase: Purchase | null
  filters: {
    status: string
    searchTerm: string
  }
}

const initialState: PurchasesState = {
  purchases: [], // No dummy data, only real data from backend
  loading: false,
  error: null,
  selectedPurchase: null,
  filters: {
    status: "",
    searchTerm: "",
  },
}

function mapPurchaseFromApi(purchase: any): Purchase {
  return {
    id: purchase.id,
    bill_number: purchase.purchase_data?.bill_number || purchase.purchase_id || '',
    supplier_id: purchase.supplier_id,
    subtotal: purchase.purchase_data?.subtotal || 0,
    tax: purchase.purchase_data?.tax || 0,
    tax_rate: purchase.purchase_data?.tax_rate || 0,
    discount: purchase.purchase_data?.discount || 0,
    total: purchase.total_amount || 0,
    status: purchase.status,
    payment_status: purchase.purchase_data?.payment_status || 'pending',
    payment_method: purchase.purchase_data?.payment_method || '',
    created_at: purchase.created_at,
    notes: purchase.purchase_data?.notes || '',
    supplier_name: purchase.supplier_name || purchase.supplier?.party_name || '',
    supplier: purchase.supplier || null,
  };
}

export const fetchPurchases = createAsyncThunk(
  'purchases/fetchPurchases',
  async (_, { rejectWithValue }) => {
    try {
      const { apiClient } = await import('@/lib/api-client');
      const data = await apiClient.purchases.getAll();
      return data.map(mapPurchaseFromApi);
    } catch (error) {
      return rejectWithValue('Failed to fetch purchases');
    }
  }
)

export const createPurchase = createAsyncThunk(
  'purchases/createPurchase',
  async (purchase: Omit<Purchase, 'id' | 'created_at'>, { rejectWithValue, getState }) => {
    try {
      // Get phone number from Redux state
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.error('❌ No phone number available in Redux state');
        return rejectWithValue('Phone number is required. Please ensure you are logged in.');
      }
      
      console.log('📱 Using phone number from Redux for purchases:', phoneNumber);
      
      const { apiClient } = await import('@/lib/api-client');
      const data = await apiClient.purchases.create({
        ...purchase,
        phone: phoneNumber
      });
      return mapPurchaseFromApi(data);
    } catch (error) {
      return rejectWithValue('Failed to create purchase');
    }
  }
)

export const updatePurchase = createAsyncThunk(
  'purchases/updatePurchase',
  async ({ id, purchase }: { id: string; purchase: Partial<Purchase> }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        throw new Error('Phone number not found in settings');
      }

      const response = await fetch(`/api/business-hub/purchases/${id}?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...purchase, phone: phoneNumber }),
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update purchase');
      }
      
      const data = await response.json()
      return mapPurchaseFromApi(data)
    } catch (error) {
      console.error('Error updating purchase:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update purchase')
    }
  }
)

export const deletePurchase = createAsyncThunk(
  'purchases/deletePurchase',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        throw new Error('Phone number not found in settings');
      }

      const response = await fetch(`/api/business-hub/purchases/${id}?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete purchase');
      }
      
      return id
    } catch (error) {
      console.error('Error deleting purchase:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete purchase')
    }
  }
)

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    addPurchase: (state, action: PayloadAction<Purchase>) => {
      state.purchases.push(action.payload)
    },
    setPurchases: (state, action: PayloadAction<Purchase[]>) => {
      state.purchases = action.payload
    },
    clearPurchases: (state) => {
      state.purchases = []
      state.selectedPurchase = null
      state.error = null
    },
    updatePurchaseLocal: (state, action: PayloadAction<{ id: string; purchase: Purchase }>) => {
      const index = state.purchases.findIndex(purchase => purchase.id === action.payload.id)
      if (index !== -1) {
        state.purchases[index] = action.payload.purchase
      }
    },
    deletePurchaseLocal: (state, action: PayloadAction<string>) => {
      state.purchases = state.purchases.filter(purchase => purchase.id !== action.payload)
    },
    setSelectedPurchase: (state, action: PayloadAction<Purchase | null>) => {
      state.selectedPurchase = action.payload
    },
    updatePurchaseStatus: (state, action: PayloadAction<{ id: string; status: Purchase['status'] }>) => {
      const purchase = state.purchases.find(p => p.id === action.payload.id)
      if (purchase) {
        purchase.status = action.payload.status
      }
    },
    setFilters: (state, action: PayloadAction<Partial<PurchasesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: "",
        searchTerm: "",
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false
        state.purchases = action.payload
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createPurchase.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading = false
        state.purchases.push(action.payload)
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updatePurchase.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePurchase.fulfilled, (state, action) => {
        state.loading = false
        const index = state.purchases.findIndex(purchase => purchase.id === action.payload.id)
        if (index !== -1) {
          state.purchases[index] = action.payload
        }
      })
      .addCase(updatePurchase.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deletePurchase.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.loading = false
        state.purchases = state.purchases.filter(purchase => purchase.id !== action.payload)
      })
      .addCase(deletePurchase.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  addPurchase,
  setPurchases,
  clearPurchases,
  updatePurchaseLocal,
  deletePurchaseLocal,
  setSelectedPurchase,
  updatePurchaseStatus,
  setFilters,
  clearFilters,
} = purchasesSlice.actions

// Selectors
export const selectAllPurchases = (state: { purchases: PurchasesState }) => state.purchases.purchases
export const selectPurchasesLoading = (state: { purchases: PurchasesState }) => state.purchases.loading
export const selectPurchasesError = (state: { purchases: PurchasesState }) => state.purchases.error
export const selectSelectedPurchase = (state: { purchases: PurchasesState }) => state.purchases.selectedPurchase
export const selectFilters = (state: { purchases: PurchasesState }) => state.purchases.filters

export const selectFilteredPurchases = createSelector(
  [
    (state: { purchases: PurchasesState }) => state.purchases.purchases,
    (state: { purchases: PurchasesState }) => state.purchases.filters
  ],
  (purchases, filters) => {
    return purchases.filter(purchase => {
      const matchesStatus = !filters.status || purchase.status === filters.status
      const matchesSearch = !filters.searchTerm || 
        purchase.bill_number.toLowerCase().includes(filters.searchTerm.toLowerCase())
      
      return matchesStatus && matchesSearch
    })
  }
)

export const selectPurchasesStats = createSelector(
  [(state: { purchases: PurchasesState }) => state.purchases.purchases],
  (purchases) => {
    const totalPurchases = purchases.length
    const totalAmount = purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0)
    const pendingPurchases = purchases.filter(p => p.status === 'ordered').length
    const receivedPurchases = purchases.filter(p => p.status === 'received').length
    const paidPurchases = purchases.filter(p => p.status === 'paid').length

    return {
      totalPurchases,
      totalAmount,
      pendingPurchases,
      receivedPurchases,
      paidPurchases,
    }
  }
)

export default purchasesSlice.reducer 