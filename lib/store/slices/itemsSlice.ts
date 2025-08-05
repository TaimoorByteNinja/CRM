import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { apiClient } from '../../api-client';

export interface Item {
  id: string
  name: string
  item_name: string
  sku: string
  item_code: string
  price: number
  sale_price: number
  cost: number
  purchase_price: number
  stock: number
  current_stock: number
  opening_stock: number
  minStock: number
  minimum_stock: number
  description: string
  tax_rate: number
  gst_rate: string
  category: string
  unit: string
  hsn_code: string
  hsn: string
  status: 'active' | 'inactive'
  is_active: boolean
  taxable: boolean
  godown: string
  barcode: string
  supplier: string
  totalSold: number
  type: string
  category_id: string
  supplier_id: string
  unit_id: string
  created_at: string
  updated_at: string
}

interface ItemsState {
  items: Item[]
  selectedItem: Item | null
  loading: boolean
  error: string | null
  filters: {
    category: string
    status: string
    searchTerm: string
  }
  stockSummary: {
    totalItems: number
    lowStockItems: number
    totalValue: number
  }
}

const initialState: ItemsState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  filters: {
    category: '',
    status: '',
    searchTerm: '',
  },
  stockSummary: {
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0,
  },
}

// Async thunks using API client
export const fetchItems = createAsyncThunk(
  'items/fetchItems',
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log('🚀 Redux fetchItems: Starting fetch...');
      
      // Get phone number from Redux state
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.error('❌ No phone number available in Redux state for fetching items');
        return rejectWithValue('Phone number is required. Please ensure you are logged in.');
      }
      
      console.log('📱 Using phone number from Redux for items:', phoneNumber);
      
      const response = await apiClient.items.getAll(phoneNumber);
      console.log('✅ Redux fetchItems: Got response:', response);
      return response;
    } catch (error) {
      console.error('❌ Redux fetchItems: Error:', error);
      return rejectWithValue('Failed to fetch items');
    }
  }
);

export const createItem = createAsyncThunk(
  'items/createItem',
  async (itemData: Partial<Item>, { rejectWithValue, getState }) => {
    try {
      // Get phone number from Redux state
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.error('❌ No phone number available in Redux state');
        return rejectWithValue('Phone number is required. Please ensure you are logged in.');
      }
      
      console.log('📱 Using phone number from Redux for items:', phoneNumber);
      
      const response = await apiClient.items.create({
        ...itemData,
        phone: phoneNumber
      });
      return response;
    } catch (error) {
      return rejectWithValue('Failed to create item');
    }
  }
);

export const updateItem = createAsyncThunk(
  'items/updateItem',
  async ({ id, updates }: { id: string; updates: Partial<Item> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.items.update(id, updates);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to update item');
    }
  }
);

export const deleteItem = createAsyncThunk(
  'items/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.items.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete item');
    }
  }
);

export const fetchStockSummary = createAsyncThunk(
  'items/fetchStockSummary',
  async (_, { rejectWithValue }) => {
    try {
      const items = await apiClient.items.getAll();
      const totalItems = items.length;
      const lowStockItems = items.filter((item: any) => item.current_stock <= item.minimum_stock).length;
      const totalValue = items.reduce((sum: number, item: any) => sum + (item.current_stock * item.purchase_price), 0);
      
      return {
        totalItems,
        lowStockItems,
        totalValue,
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch stock summary');
    }
  }
);

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Item>) => {
      state.items.push(action.payload)
    },
    setItems: (state, action: PayloadAction<Item[]>) => {
      state.items = action.payload
    },
    clearItems: (state) => {
      state.items = []
      state.selectedItem = null
      state.error = null
      state.stockSummary = {
        totalItems: 0,
        lowStockItems: 0,
        totalValue: 0
      }
    },
    updateItemLocal: (state, action: PayloadAction<{ id: string; item: Item }>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload.item
      }
    },
    deleteItemLocal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    setSelectedItem: (state, action: PayloadAction<Item | null>) => {
      state.selectedItem = action.payload
    },
    updateStock: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id)
      if (item) {
        item.stock -= action.payload.quantity
        item.current_stock = item.stock
      }
    },
    setFilters: (state, action: PayloadAction<Partial<ItemsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        status: '',
        searchTerm: '',
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false
        console.log('✅ Redux fetchItems.fulfilled: Updating items state with:', action.payload);
        state.items = action.payload
        console.log('✅ Redux: Items state updated, new count:', state.items.length);
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
      })
      .addCase(fetchStockSummary.fulfilled, (state, action) => {
        state.stockSummary = action.payload
      })
  },
})

export const {
  addItem,
  setItems,
  clearItems,
  updateItemLocal,
  deleteItemLocal,
  setSelectedItem,
  updateStock,
  setFilters,
  clearFilters,
} = itemsSlice.actions

// Selectors
export const selectAllItems = (state: { items: ItemsState }) => {
  console.log('🔍 selectAllItems called, returning:', state.items.items);
  return state.items.items;
}
export const selectItemsLoading = (state: { items: ItemsState }) => state.items.loading
export const selectItemsError = (state: { items: ItemsState }) => state.items.error
export const selectSelectedItem = (state: { items: ItemsState }) => state.items.selectedItem
export const selectFilters = (state: { items: ItemsState }) => state.items.filters

export const selectFilteredItems = createSelector(
  [
    (state: { items: ItemsState }) => state.items.items,
    (state: { items: ItemsState }) => state.items.filters
  ],
  (items, filters) => {
    return items.filter(item => {
      const matchesCategory = !filters.category || item.category === filters.category
      const matchesStatus = !filters.status || item.status === filters.status
      const matchesSearch = !filters.searchTerm || 
        item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(filters.searchTerm.toLowerCase())
      
      return matchesCategory && matchesStatus && matchesSearch
    })
  }
)

export const selectLowStockItems = createSelector(
  [(state: { items: ItemsState }) => state.items.items],
  (items) => {
    return items.filter(item => item.stock <= item.minStock)
  }
)

export const selectItemsStats = createSelector(
  [(state: { items: ItemsState }) => state.items.items],
  (items) => {
    const totalItems = items.length
    const activeItems = items.filter(item => item.status === 'active').length
    const lowStockItems = items.filter(item => item.stock <= item.minStock).length
    const totalStockValue = items.reduce((sum, item) => sum + (item.stock * item.cost), 0)

    return {
      totalItems,
      activeItems,
      lowStockItems,
      totalStockValue,
    }
  }
)

export default itemsSlice.reducer