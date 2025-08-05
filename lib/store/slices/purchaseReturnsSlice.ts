import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit'

export interface PurchaseReturnItem {
  id: string;
  return_id: string;
  item_id: string;
  name: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
  tax_rate: number | null;
}

export interface PurchaseReturn {
  id: string;
  return_number: string;
  purchase_id: string;
  supplier_id: string;
  date: string;
  subtotal: number | null;
  tax: number | null;
  tax_rate: number | null;
  total: number | null;
  status: string | null;
  payment_status: string | null;
  notes: string | null;
  created_at: string | null;
  purchase_return_items: PurchaseReturnItem[];
  supplier_name?: string;
  supplier?: {
    id: string;
    party_name: string;
    phone: string | null;
    email: string | null;
  } | null;
}

interface PurchaseReturnsState {
  purchaseReturns: PurchaseReturn[];
  loading: boolean;
  error: string | null;
  selectedReturn: PurchaseReturn | null;
  filters: {
    status: string;
    searchTerm: string;
  };
}

const initialState: PurchaseReturnsState = {
  purchaseReturns: [],
  loading: false,
  error: null,
  selectedReturn: null,
  filters: {
    status: "",
    searchTerm: "",
  },
};

function mapPurchaseReturnFromApi(returnData: any): PurchaseReturn {
  return {
    id: returnData.id,
    return_number: returnData.purchase_data?.return_number || returnData.bill_number || '',
    purchase_id: returnData.purchase_data?.original_purchase_id || '',
    supplier_id: returnData.supplier_id,
    date: returnData.purchase_data?.date || returnData.created_at?.split('T')[0] || '',
    subtotal: returnData.subtotal || 0,
    tax: returnData.tax || 0,
    tax_rate: returnData.tax_rate || 0,
    total: Math.abs(returnData.total || 0), // Convert back to positive for display
    status: returnData.status,
    payment_status: returnData.payment_status || returnData.purchase_data?.payment_status || 'pending',
    notes: returnData.notes || '',
    created_at: returnData.created_at,
    purchase_return_items: returnData.purchase_return_items || [],
    supplier_name: returnData.supplier_name || returnData.supplier?.party_name || returnData.purchase_data?.supplier_name || '',
    supplier: returnData.supplier || null,
  };
}

export const fetchPurchaseReturns = createAsyncThunk(
  'purchaseReturns/fetchPurchaseReturns',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.error('❌ No phone number available in Redux state for fetching purchase returns');
        return rejectWithValue('Phone number is required. Please ensure you are logged in.');
      }

      console.log('📱 Using phone number from Redux for purchase returns:', phoneNumber);

      const response = await fetch(`/api/business-hub/purchase-returns?phone=${encodeURIComponent(phoneNumber)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch purchase returns');
      }
      
      const data = await response.json();
      return data.map(mapPurchaseReturnFromApi);
    } catch (error) {
      console.error('Error fetching purchase returns:', error);
      return rejectWithValue('Failed to fetch purchase returns');
    }
  }
);

export const createPurchaseReturn = createAsyncThunk(
  'purchaseReturns/createPurchaseReturn',
  async (purchaseReturn: Omit<PurchaseReturn, 'id' | 'created_at'>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        throw new Error('Phone number not found in settings');
      }

      const response = await fetch('/api/business-hub/purchase-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...purchaseReturn, phone: phoneNumber }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create purchase return');
      }
      
      const data = await response.json();
      return mapPurchaseReturnFromApi(data);
    } catch (error) {
      console.error('Error creating purchase return:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create purchase return');
    }
  }
);

export const updatePurchaseReturn = createAsyncThunk(
  'purchaseReturns/updatePurchaseReturn',
  async ({ id, purchaseReturn }: { id: string; purchaseReturn: Partial<PurchaseReturn> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/business-hub/purchase-returns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseReturn),
      });
      const data = await response.json();
      return mapPurchaseReturnFromApi(data);
    } catch (error) {
      return rejectWithValue('Failed to update purchase return');
    }
  }
);

export const deletePurchaseReturn = createAsyncThunk(
  'purchaseReturns/deletePurchaseReturn',
  async (id: string, { rejectWithValue }) => {
    try {
      await fetch(`/api/business-hub/purchase-returns/${id}`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete purchase return');
    }
  }
);

const purchaseReturnsSlice = createSlice({
  name: 'purchaseReturns',
  initialState,
  reducers: {
    addPurchaseReturn: (state, action: PayloadAction<PurchaseReturn>) => {
      state.purchaseReturns.push(action.payload);
    },
    updatePurchaseReturnLocal: (state, action: PayloadAction<{ id: string; purchaseReturn: PurchaseReturn }>) => {
      const index = state.purchaseReturns.findIndex(returnItem => returnItem.id === action.payload.id);
      if (index !== -1) {
        state.purchaseReturns[index] = action.payload.purchaseReturn;
      }
    },
    deletePurchaseReturnLocal: (state, action: PayloadAction<string>) => {
      state.purchaseReturns = state.purchaseReturns.filter(returnItem => returnItem.id !== action.payload);
    },
    setSelectedReturn: (state, action: PayloadAction<PurchaseReturn | null>) => {
      state.selectedReturn = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<PurchaseReturnsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: "",
        searchTerm: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchaseReturns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseReturns.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseReturns = action.payload;
      })
      .addCase(fetchPurchaseReturns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPurchaseReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchaseReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseReturns.push(action.payload);
      })
      .addCase(createPurchaseReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePurchaseReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchaseReturn.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchaseReturns.findIndex(returnItem => returnItem.id === action.payload.id);
        if (index !== -1) {
          state.purchaseReturns[index] = action.payload;
        }
      })
      .addCase(updatePurchaseReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePurchaseReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePurchaseReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseReturns = state.purchaseReturns.filter(returnItem => returnItem.id !== action.payload);
      })
      .addCase(deletePurchaseReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addPurchaseReturn,
  updatePurchaseReturnLocal,
  deletePurchaseReturnLocal,
  setSelectedReturn,
  setFilters,
  clearFilters,
} = purchaseReturnsSlice.actions;

// Selectors
export const selectAllPurchaseReturns = (state: { purchaseReturns: PurchaseReturnsState }) => state.purchaseReturns.purchaseReturns;
export const selectPurchaseReturnsLoading = (state: { purchaseReturns: PurchaseReturnsState }) => state.purchaseReturns.loading;
export const selectPurchaseReturnsError = (state: { purchaseReturns: PurchaseReturnsState }) => state.purchaseReturns.error;
export const selectSelectedReturn = (state: { purchaseReturns: PurchaseReturnsState }) => state.purchaseReturns.selectedReturn;
export const selectFilters = (state: { purchaseReturns: PurchaseReturnsState }) => state.purchaseReturns.filters;

export const selectFilteredPurchaseReturns = createSelector(
  [
    (state: { purchaseReturns: PurchaseReturnsState }) => state.purchaseReturns.purchaseReturns,
    (state: { purchaseReturns: PurchaseReturnsState }) => state.purchaseReturns.filters
  ],
  (purchaseReturns, filters) => {
    return purchaseReturns.filter(returnItem => {
      const matchesStatus = !filters.status || returnItem.status === filters.status;
      const matchesSearch = !filters.searchTerm || 
        returnItem.return_number.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }
);

export const selectPurchaseReturnsStats = createSelector(
  [(state: { purchaseReturns: PurchaseReturnsState }) => state.purchaseReturns.purchaseReturns],
  (purchaseReturns) => {
    const totalReturns = purchaseReturns.length;
    const totalAmount = purchaseReturns.reduce((sum, returnItem) => sum + (returnItem.total || 0), 0);
    const processedReturns = purchaseReturns.filter(r => r.status === 'processed').length;
    const pendingReturns = purchaseReturns.filter(r => r.status === 'pending').length;

    return {
      totalReturns,
      totalAmount,
      processedReturns,
      pendingReturns,
    };
  }
);

export default purchaseReturnsSlice.reducer; 