import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Cheque {
  id: string;
  cheque_id?: string;
  type: 'issued' | 'received';
  chequeNumber: string;
  partyName: string;
  amount: number;
  date: string;
  dueDate: string;
  bankName: string;
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled';
  description: string;
  phone_number?: string;
  createdAt: string;
}

interface ChequesState {
  items: Cheque[];
  loading: boolean;
  error: string | null;
}

const initialState: ChequesState = {
  items: [],
  loading: false,
  error: null,
};

function mapChequeFromApi(cheque: any): Cheque {
  return {
    id: cheque.id,
    cheque_id: cheque.cheque_id,
    type: cheque.type,
    chequeNumber: cheque.cheque_number,
    partyName: cheque.party_name,
    amount: cheque.amount,
    date: cheque.date,
    dueDate: cheque.due_date,
    bankName: cheque.bank_name,
    status: cheque.status,
    description: cheque.description,
    phone_number: cheque.phone_number,
    createdAt: cheque.created_at,
  };
}

function mapChequeToApi(cheque: any): any {
  return {
    type: cheque.type,
    cheque_number: cheque.chequeNumber,
    party_name: cheque.partyName,
    amount: cheque.amount,
    date: cheque.date,
    due_date: cheque.dueDate,
    bank_name: cheque.bankName,
    status: cheque.status,
    description: cheque.description,
    phone_number: cheque.phone_number,
  };
}

export const fetchCheques = createAsyncThunk(
  'cheques/fetchAll',
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      console.log('Fetching cheques for phone:', phoneNumber);
      const response = await fetch(`/api/business-hub/cheques?phone=${encodeURIComponent(phoneNumber)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch cheques:', errorData);
        return rejectWithValue(errorData.error || 'Failed to fetch cheques');
      }

      const data = await response.json();
      console.log('Fetched cheques:', data);
      return data.map(mapChequeFromApi);
    } catch (error) {
      console.error('Error fetching cheques:', error);
      return rejectWithValue('Failed to fetch cheques');
    }
  }
);

export const addCheque = createAsyncThunk(
  'cheques/add',
  async ({ cheque, phoneNumber }: { cheque: Omit<Cheque, 'id'>; phoneNumber: string }, { rejectWithValue }) => {
    try {
      console.log('Adding cheque for phone:', phoneNumber, 'Data:', cheque);
      
      const chequeWithPhone = {
        ...cheque,
        phone_number: phoneNumber,
      };

      const response = await fetch(`/api/business-hub/cheques?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapChequeToApi(chequeWithPhone)),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create cheque:', errorData);
        return rejectWithValue(errorData.error || 'Failed to create cheque');
      }

      const data = await response.json();
      console.log('Created cheque:', data);
      return mapChequeFromApi(data);
    } catch (error) {
      console.error('Error creating cheque:', error);
      return rejectWithValue('Failed to create cheque');
    }
  }
);

export const updateCheque = createAsyncThunk(
  'cheques/update',
  async ({ id, cheque, phoneNumber }: { id: string; cheque: Partial<Cheque>; phoneNumber: string }, { rejectWithValue }) => {
    try {
      console.log('Updating cheque:', id, 'for phone:', phoneNumber, 'Data:', cheque);
      
      const response = await fetch(`/api/business-hub/cheques/${id}?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapChequeToApi(cheque)),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update cheque:', errorData);
        return rejectWithValue(errorData.error || 'Failed to update cheque');
      }

      const data = await response.json();
      console.log('Updated cheque:', data);
      return mapChequeFromApi(data);
    } catch (error) {
      console.error('Error updating cheque:', error);
      return rejectWithValue('Failed to update cheque');
    }
  }
);

export const deleteCheque = createAsyncThunk(
  'cheques/delete',
  async ({ id, phoneNumber }: { id: string; phoneNumber: string }, { rejectWithValue }) => {
    try {
      console.log('Deleting cheque:', id, 'for phone:', phoneNumber);
      
      const response = await fetch(`/api/business-hub/cheques/${id}?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete cheque:', errorData);
        return rejectWithValue(errorData.error || 'Failed to delete cheque');
      }

      console.log('Successfully deleted cheque:', id);
      return id;
    } catch (error) {
      console.error('Error deleting cheque:', error);
      return rejectWithValue('Failed to delete cheque');
    }
  }
);

const chequesSlice = createSlice({
  name: 'cheques',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCheques.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCheques.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCheques.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch cheques';
      })
      .addCase(addCheque.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(addCheque.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to add cheque';
      })
      .addCase(updateCheque.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateCheque.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to update cheque';
      })
      .addCase(deleteCheque.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.cheque_id !== action.payload && c.id !== action.payload);
      })
      .addCase(deleteCheque.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to delete cheque';
      });
  },
});

export default chequesSlice.reducer;
export const selectAllCheques = (state: any) => state.cheques.items;
export const selectChequesLoading = (state: any) => state.cheques.loading;
export const selectChequesError = (state: any) => state.cheques.error; 