import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  company: string;
  website?: string;
  taxId?: string;
  paymentTerms: string;
  leadTime: number;
  totalPurchases: number;
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  status: 'active' | 'inactive' | 'blocked';
  rating: number;
  currency: string;
  bankDetails?: string;
  contactPerson: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface SuppliersState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  selectedSupplier: Supplier | null;
}

const initialState: SuppliersState = {
  suppliers: [],
  loading: false,
  error: null,
  selectedSupplier: null,
};

function mapSupplierFromApi(supplier: any): Supplier {
  return {
    id: supplier.id,
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    city: supplier.city,
    state: supplier.state,
    zipCode: supplier.zip_code,
    country: supplier.country,
    company: supplier.company,
    website: supplier.website,
    taxId: supplier.tax_id,
    paymentTerms: supplier.payment_terms,
    leadTime: supplier.lead_time,
    totalPurchases: supplier.total_purchases,
    totalOrders: supplier.total_orders,
    averageOrderValue: supplier.average_order_value,
    lastOrderDate: supplier.last_order_date,
    status: supplier.status,
    rating: supplier.rating,
    currency: supplier.currency,
    bankDetails: supplier.bank_details,
    contactPerson: supplier.contact_person,
    tags: supplier.tags || [],
    notes: supplier.notes,
    createdAt: supplier.created_at,
    updatedAt: supplier.updated_at,
  };
}

function mapSupplierToApi(supplier: any): any {
  return {
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    city: supplier.city,
    state: supplier.state,
    zip_code: supplier.zipCode,
    country: supplier.country,
    company: supplier.company,
    website: supplier.website,
    tax_id: supplier.taxId,
    payment_terms: supplier.paymentTerms,
    lead_time: supplier.leadTime,
    total_purchases: supplier.totalPurchases,
    total_orders: supplier.totalOrders,
    average_order_value: supplier.averageOrderValue,
    last_order_date: supplier.lastOrderDate,
    status: supplier.status,
    rating: supplier.rating,
    currency: supplier.currency,
    bank_details: supplier.bankDetails,
    contact_person: supplier.contactPerson,
    tags: supplier.tags,
    notes: supplier.notes,
    created_at: supplier.createdAt,
    updated_at: supplier.updatedAt,
  };
}

export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/business-hub/suppliers');
      const data = await response.json();
      return data.map(mapSupplierFromApi);
    } catch (error) {
      return rejectWithValue('Failed to fetch suppliers');
    }
  }
);

export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/business-hub/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapSupplierToApi(supplier)),
      });
      const data = await response.json();
      return mapSupplierFromApi(data);
    } catch (error) {
      return rejectWithValue('Failed to create supplier');
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async ({ id, supplier }: { id: string; supplier: Partial<Supplier> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/business-hub/suppliers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapSupplierToApi(supplier)),
      });
      const data = await response.json();
      return mapSupplierFromApi(data);
    } catch (error) {
      return rejectWithValue('Failed to update supplier');
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'suppliers/deleteSupplier',
  async (id: string, { rejectWithValue }) => {
    try {
      await fetch(`/api/business-hub/suppliers/${id}`, { method: 'DELETE' });
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete supplier');
    }
  }
);

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    setSelectedSupplier: (state, action: PayloadAction<Supplier | null>) => {
      state.selectedSupplier = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers.push(action.payload);
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.suppliers.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.suppliers[idx] = action.payload;
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedSupplier } = suppliersSlice.actions;

export const selectAllSuppliers = (state: { suppliers: SuppliersState }) => state.suppliers.suppliers;
export const selectSuppliersLoading = (state: { suppliers: SuppliersState }) => state.suppliers.loading;
export const selectSuppliersError = (state: { suppliers: SuppliersState }) => state.suppliers.error;
export const selectSelectedSupplier = (state: { suppliers: SuppliersState }) => state.suppliers.selectedSupplier;

export default suppliersSlice.reducer; 