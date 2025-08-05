import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  company?: string
  totalSales: number
  totalOrders: number
  status: "active" | "inactive"
  createdAt: string
}

interface CustomersState {
  customers: Customer[]
  loading: boolean
  error: string | null
  selectedCustomer: Customer | null
  filters: {
    status: string
    searchTerm: string
  }
}

const initialState: CustomersState = {
  customers: [], // No dummy data, only real data from backend
  loading: false,
  error: null,
  selectedCustomer: null,
  filters: {
    status: "",
    searchTerm: "",
  },
}

function mapCustomerFromApi(customer: any): Customer {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    company: customer.company,
    totalSales: customer.total_sales ?? 0,
    totalOrders: customer.total_orders ?? 0,
    status: customer.status,
    createdAt: customer.created_at,
  }
}

function mapCustomerToApi(customer: any): any {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    company: customer.company,
    status: customer.status,
  }
}

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/business-hub/customers')
      const data = await response.json()
      return data.map(mapCustomerFromApi)
    } catch (error) {
      return rejectWithValue('Failed to fetch customers')
    }
  }
)

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customer: Omit<Customer, 'id' | 'createdAt' | 'totalSales' | 'totalOrders'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/business-hub/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapCustomerToApi(customer)),
      })
      const data = await response.json()
      return mapCustomerFromApi(data)
    } catch (error) {
      return rejectWithValue('Failed to create customer')
    }
  }
)

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.push(action.payload)
    },
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customers = action.payload
    },
    clearCustomers: (state) => {
      state.customers = []
      state.selectedCustomer = null
      state.error = null
    },
    updateCustomer: (state, action: PayloadAction<{ id: string; customer: Customer }>) => {
      const index = state.customers.findIndex(customer => customer.id === action.payload.id)
      if (index !== -1) {
        state.customers[index] = action.payload.customer
      }
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter(customer => customer.id !== action.payload)
    },
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload
    },
    updateCustomerStats: (state, action: PayloadAction<{ id: string; totalSales: number; totalOrders: number }>) => {
      const customer = state.customers.find(c => c.id === action.payload.id)
      if (customer) {
        customer.totalSales = action.payload.totalSales
        customer.totalOrders = action.payload.totalOrders
      }
    },
    setFilters: (state, action: PayloadAction<Partial<CustomersState['filters']>>) => {
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
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.customers = action.payload
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.customers.push(action.payload)
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  addCustomer,
  setCustomers,
  clearCustomers,
  updateCustomer,
  deleteCustomer,
  setSelectedCustomer,
  updateCustomerStats,
  setFilters,
  clearFilters,
} = customersSlice.actions

// Selectors
export const selectAllCustomers = (state: { customers: CustomersState }) => state.customers.customers
export const selectCustomersLoading = (state: { customers: CustomersState }) => state.customers.loading
export const selectCustomersError = (state: { customers: CustomersState }) => state.customers.error
export const selectSelectedCustomer = (state: { customers: CustomersState }) => state.customers.selectedCustomer
export const selectFilters = (state: { customers: CustomersState }) => state.customers.filters

export const selectFilteredCustomers = createSelector(
  [
    (state: { customers: CustomersState }) => state.customers.customers,
    (state: { customers: CustomersState }) => state.customers.filters
  ],
  (customers, filters) => {
    return customers.filter(customer => {
      const matchesStatus = !filters.status || customer.status === filters.status
      const matchesSearch = !filters.searchTerm || 
        customer.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        customer.company?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      
      return matchesStatus && matchesSearch
    })
  }
)

export const selectCustomersStats = createSelector(
  [(state: { customers: CustomersState }) => state.customers.customers],
  (customers) => {
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(customer => customer.status === 'active').length
    const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSales, 0)
    const totalOrders = customers.reduce((sum, customer) => sum + customer.totalOrders, 0)

    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      totalOrders,
    }
  }
)

export default customersSlice.reducer 