import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { apiClient } from '../../api-client';

export interface SaleItem {
  id?: string
  sale_id?: string
  item_id: string
  item_name: string
  quantity: number
  unit_price: number
  discount_amount: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  // Legacy fields for compatibility
  itemId: string
  itemName: string
  price: number
  discount: number
  total: number
}

export interface Sale {
  id: string
  // New Supabase fields
  invoice_number: string
  party_id: string
  invoice_date: string
  due_date?: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  balance_amount: number
  payment_status: 'paid' | 'partial' | 'unpaid'
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
  items?: SaleItem[]
  party_name?: string
  // Legacy fields for compatibility
  invoiceNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  tax: number
  taxRate: number
  discount: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue"
  paymentMethod: string
  paymentStatus: "pending" | "paid"
  dueDate: string
  createdAt: string
}

interface SalesState {
  sales: Sale[]
  loading: boolean
  error: string | null
  selectedSale: Sale | null
}

const initialState: SalesState = {
  sales: [], // No dummy data, only real data from backend
  loading: false,
  error: null,
  selectedSale: null,
}

function mapSaleFromApi(sale: any): Sale {
  return {
    // New Supabase fields
    id: sale.id,
    invoice_number: sale.invoice_number,
    party_id: sale.party_id,
    invoice_date: sale.invoice_date,
    due_date: sale.due_date,
    subtotal: sale.subtotal,
    discount_amount: sale.discount_amount || 0,
    tax_amount: sale.tax_amount || 0,
    total_amount: sale.total_amount,
    paid_amount: sale.paid_amount || 0,
    balance_amount: sale.balance_amount || 0,
    payment_status: sale.payment_status || 'unpaid',
    notes: sale.notes,
    is_active: sale.is_active !== false,
    created_at: sale.created_at,
    updated_at: sale.updated_at,
    items: sale.items || [],
    party_name: sale.party_name,
    // Legacy fields for compatibility
    invoiceNumber: sale.invoice_number,
    customerId: sale.party_id,
    customerName: sale.party_name || '',
    customerEmail: sale.customer_email || '',
    customerPhone: sale.customer_phone || '',
    customerAddress: sale.customer_address || '',
    tax: sale.tax_amount || 0,
    taxRate: sale.tax_rate || 0,
    discount: sale.discount_amount || 0,
    total: sale.total_amount,
    status: sale.payment_status === 'paid' ? 'paid' : 'sent',
    paymentMethod: sale.payment_method || 'cash',
    paymentStatus: sale.payment_status === 'paid' ? 'paid' : 'pending',
    dueDate: sale.due_date || sale.invoice_date,
    createdAt: sale.created_at,
  };
}

function mapSaleToApi(sale: any): any {
  return {
    invoice_number: sale.invoice_number || sale.invoiceNumber,
    party_id: sale.party_id || sale.customerId,
    party_name: sale.party_name || sale.customerName, // Add customer name mapping
    invoice_date: sale.invoice_date || new Date().toISOString().split('T')[0],
    due_date: sale.due_date || sale.dueDate,
    subtotal: sale.subtotal,
    discount_amount: sale.discount_amount || sale.discount || 0,
    tax_amount: sale.tax_amount || sale.tax || 0,
    total_amount: sale.total_amount || sale.total,
    paid_amount: sale.paid_amount || 0,
    balance_amount: sale.balance_amount || sale.total_amount || sale.total,
    payment_status: sale.payment_status || 'unpaid',
    notes: sale.notes,
  };
}

// Async thunks for API calls using Next.js API routes
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (params: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      console.log('🚀 Redux fetchSales: Starting fetch...');
      const response = await apiClient.sales.getAll();
      console.log('✅ Redux fetchSales: Got response:', response);
      return response.map(mapSaleFromApi);
    } catch (error) {
      console.error('❌ Redux fetchSales: Error:', error);
      return rejectWithValue('Failed to fetch sales');
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData: { sale: Partial<Sale>; items: SaleItem[] }, { rejectWithValue, getState }) => {
    try {
      // Get phone number from Redux state
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.error('❌ No phone number available in Redux state');
        return rejectWithValue('Phone number is required. Please ensure you are logged in.');
      }
      
      console.log('📱 Using phone number from Redux for sales:', phoneNumber);
      
      const response = await apiClient.sales.create({
        ...mapSaleToApi(saleData.sale),
        items: saleData.items,
        phone: phoneNumber
      });
      return { sale: mapSaleFromApi(response), items: saleData.items };
    } catch (error) {
      return rejectWithValue('Failed to create sale');
    }
  }
);

export const deleteSaleAsync = createAsyncThunk(
  'sales/deleteSaleAsync',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.sales.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete sale');
    }
  }
);

export const updateSaleAsync = createAsyncThunk(
  'sales/updateSaleAsync',
  async ({ id, updates }: { id: string; updates: Partial<Sale> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.sales.update(id, mapSaleToApi(updates));
      return mapSaleFromApi(response);
    } catch (error) {
      return rejectWithValue('Failed to update sale');
    }
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    addSale: (state, action: PayloadAction<Sale>) => {
      state.sales.push(action.payload)
    },
    setSales: (state, action: PayloadAction<Sale[]>) => {
      state.sales = action.payload
    },
    clearSales: (state) => {
      state.sales = []
      state.selectedSale = null
      state.error = null
    },
    updateSale: (state, action: PayloadAction<{ id: string; sale: Sale }>) => {
      const index = state.sales.findIndex(sale => sale.id === action.payload.id)
      if (index !== -1) {
        state.sales[index] = action.payload.sale
      }
    },
    deleteSale: (state, action: PayloadAction<string>) => {
      state.sales = state.sales.filter(sale => sale.id !== action.payload)
    },
    setSelectedSale: (state, action: PayloadAction<Sale | null>) => {
      state.selectedSale = action.payload
    },
    updateSaleStatus: (state, action: PayloadAction<{ id: string; status: Sale['status'] }>) => {
      const sale = state.sales.find(s => s.id === action.payload.id)
      if (sale) {
        sale.status = action.payload.status
      }
    },
    updatePaymentStatus: (state, action: PayloadAction<{ id: string; paymentStatus: Sale['paymentStatus'] }>) => {
      const sale = state.sales.find(s => s.id === action.payload.id)
      if (sale) {
        sale.paymentStatus = action.payload.paymentStatus
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false
        state.sales = action.payload
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createSale.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false
        state.sales.push(action.payload.sale)
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Handle deleteSaleAsync
      .addCase(deleteSaleAsync.fulfilled, (state, action) => {
        state.sales = state.sales.filter(sale => sale.id !== action.payload)
      })
      // Handle updateSaleAsync
      .addCase(updateSaleAsync.fulfilled, (state, action) => {
        const index = state.sales.findIndex(sale => sale.id === action.payload.id)
        if (index !== -1) {
          state.sales[index] = action.payload
        }
      })
  },
})

export const {
  addSale,
  setSales,
  clearSales,
  updateSale,
  deleteSale,
  setSelectedSale,
  updateSaleStatus,
  updatePaymentStatus,
} = salesSlice.actions

// Selectors
export const selectAllSales = (state: { sales: SalesState }) => state.sales.sales
export const selectSalesLoading = (state: { sales: SalesState }) => state.sales.loading
export const selectSalesError = (state: { sales: SalesState }) => state.sales.error
export const selectSelectedSale = (state: { sales: SalesState }) => state.sales.selectedSale

export const selectSalesStats = createSelector(
  [(state: { sales: SalesState }) => state.sales.sales],
  (sales) => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
    const totalOrders = sales.length
    const pendingSales = sales.filter(s => s.paymentStatus === "pending").length
    const paidSales = sales.filter(s => s.paymentStatus === "paid").length

    return {
      totalSales,
      totalOrders,
      pendingSales,
      paidSales,
    }
  }
)

export default salesSlice.reducer 