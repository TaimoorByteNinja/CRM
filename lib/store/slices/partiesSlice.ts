import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { partiesAPI } from '../../supabase-business-client';

export interface Party {
  id: string;
  party_name: string;
  party_type: 'customer' | 'supplier' | 'both';
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  opening_balance: number;
  current_balance: number;
  credit_limit: number;
  payment_terms: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Legacy fields for compatibility
  name: string;
  type: 'customer' | 'supplier' | 'both';
  pan?: string;
  creditLimit: number;
  balance: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  totalTransactions: number;
  lastTransaction?: string;
}

interface PartiesState {
  parties: Party[];
  loading: boolean;
  error: string | null;
  selectedParty: Party | null;
}

const initialState: PartiesState = {
  parties: [],
  loading: false,
  error: null,
  selectedParty: null,
};

// Mapping functions
function mapPartyFromApi(party: any): Party {
  return {
    // New Supabase fields (mapped from actual DB columns)
    id: party.id,
    party_name: party.name || party.party_name,
    party_type: party.type || party.party_type,
    contact_person: party.contact_person,
    phone: party.phone,
    email: party.email,
    address: party.address,
    city: party.city,
    state: party.state,
    pincode: party.pincode,
    gstin: party.gstin,
    opening_balance: party.balance || party.opening_balance || 0,
    current_balance: party.balance || party.current_balance || 0,
    credit_limit: party.credit_limit || party.creditLimit || 0,
    payment_terms: party.payment_terms || 0,
    is_active: party.status === 'active',
    created_at: party.created_at,
    updated_at: party.updated_at,
    // Legacy fields for compatibility
    name: party.name || party.party_name,
    type: party.type || party.party_type,
    pan: party.pan,
    creditLimit: party.credit_limit || party.creditLimit || 0,
    balance: party.balance || party.current_balance || 0,
    status: party.status || (party.is_active !== false ? 'active' : 'inactive'),
    createdAt: party.created_at,
    updatedAt: party.updated_at,
    totalTransactions: party.total_transactions || party.totalTransactions || 0,
    lastTransaction: party.last_transaction || party.lastTransaction,
  };
}

function mapPartyToApi(party: any): any {
  return {
    // Map to actual database columns
    name: party.party_name || party.name,
    type: party.party_type || party.type,
    phone: party.phone,
    email: party.email,
    address: party.address,
    city: party.city,
    state: party.state,
    pincode: party.pincode,
    gstin: party.gstin,
    pan: party.pan,
    credit_limit: party.credit_limit || party.creditLimit || 0,
    balance: party.opening_balance || party.current_balance || party.balance || 0,
    status: party.is_active !== false ? 'active' : 'inactive',
  };
}

export const fetchParties = createAsyncThunk(
  'parties/fetchParties',
  async (params: { type?: 'customer' | 'supplier' | 'both' } = {}, { rejectWithValue, getState }) => {
    try {
      // Get phone number from Redux state
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.error('❌ No phone number available in Redux state for fetching parties');
        return rejectWithValue('Phone number is required. Please ensure you are logged in.');
      }
      
      console.log('📱 Using phone number from Redux for fetching parties:', phoneNumber);
      
      const { apiClient } = await import('@/lib/api-client');
      const response = await apiClient.parties.getAll(phoneNumber);
      return response.map(mapPartyFromApi);
    } catch (error) {
      return rejectWithValue('Failed to fetch parties');
    }
  }
);

export const createParty = createAsyncThunk(
  'parties/createParty',
  async (party: Omit<Party, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue, getState }) => {
    try {
      console.log('➕ Creating party:', party);
      
      // Get phone number from Redux state
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.error('❌ No phone number available in Redux state');
        return rejectWithValue('Phone number is required. Please ensure you are logged in.');
      }
      
      console.log('📱 Using phone number from Redux:', phoneNumber);
      
      const { apiClient } = await import('@/lib/api-client');
      const response = await apiClient.parties.create({
        ...mapPartyToApi(party),
        phone: phoneNumber
      });
      console.log('✅ Create successful:', response);
      return mapPartyFromApi(response);
    } catch (error) {
      console.error('❌ Create party error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create party';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateParty = createAsyncThunk(
  'parties/updateParty',
  async ({ id, updates }: { id: string; updates: Partial<Party> }, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating party:', id, 'with updates:', updates);
      const response = await partiesAPI.update(id, mapPartyToApi(updates));
      console.log('✅ Update successful:', response);
      return mapPartyFromApi(response);
    } catch (error) {
      console.error('❌ Update party error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update party';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteParty = createAsyncThunk(
  'parties/deleteParty',
  async (id: string, { rejectWithValue }) => {
    try {
      await partiesAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete party');
    }
  }
);

const partiesSlice = createSlice({
  name: 'parties',
  initialState,
  reducers: {
    addParty: (state, action: PayloadAction<Party>) => {
      state.parties.push(action.payload);
    },
    setParties: (state, action: PayloadAction<Party[]>) => {
      state.parties = action.payload;
    },
    clearParties: (state) => {
      state.parties = [];
      state.selectedParty = null;
      state.error = null;
    },
    updatePartyLocal: (state, action: PayloadAction<{ id: string; party: Party }>) => {
      const index = state.parties.findIndex(party => party.id === action.payload.id);
      if (index !== -1) {
        state.parties[index] = action.payload.party;
      }
    },
    deletePartyLocal: (state, action: PayloadAction<string>) => {
      state.parties = state.parties.filter(party => party.id !== action.payload);
    },
    setSelectedParty: (state, action: PayloadAction<Party | null>) => {
      state.selectedParty = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParties.fulfilled, (state, action) => {
        state.loading = false;
        state.parties = action.payload;
      })
      .addCase(fetchParties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createParty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createParty.fulfilled, (state, action) => {
        state.loading = false;
        state.parties.push(action.payload);
      })
      .addCase(createParty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateParty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateParty.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.parties.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.parties[idx] = action.payload;
      })
      .addCase(updateParty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteParty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteParty.fulfilled, (state, action) => {
        state.loading = false;
        state.parties = state.parties.filter(p => p.id !== action.payload);
      })
      .addCase(deleteParty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  addParty,
  setParties,
  clearParties,
  updatePartyLocal,
  deletePartyLocal,
  setSelectedParty 
} = partiesSlice.actions;

export const selectAllParties = (state: { parties: PartiesState }) => state.parties.parties;
export const selectPartiesLoading = (state: { parties: PartiesState }) => state.parties.loading;
export const selectPartiesError = (state: { parties: PartiesState }) => state.parties.error;
export const selectSelectedParty = (state: { parties: PartiesState }) => state.parties.selectedParty;

export default partiesSlice.reducer; 