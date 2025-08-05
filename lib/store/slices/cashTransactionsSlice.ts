import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface CashTransaction {
  id: string;
  transaction_id?: string;
  type: 'sale' | 'purchase' | 'expense' | 'income' | 'adjustment';
  name: string;
  description: string;
  amount: number;
  date: string;
  reference?: string;
  phone_number?: string;
  createdAt: string;
}

interface CashTransactionsState {
  items: CashTransaction[];
  loading: boolean;
  error: string | null;
}

const initialState: CashTransactionsState = {
  items: [],
  loading: false,
  error: null,
};

function mapCashTransactionFromApi(transaction: any): CashTransaction {
  return {
    id: transaction.id,
    transaction_id: transaction.transaction_id,
    type: transaction.type,
    name: transaction.name,
    description: transaction.description,
    amount: transaction.amount,
    date: transaction.date,
    reference: transaction.reference,
    phone_number: transaction.phone_number,
    createdAt: transaction.created_at,
  };
}

function mapCashTransactionToApi(transaction: any): any {
  return {
    type: transaction.type,
    name: transaction.name,
    description: transaction.description,
    amount: transaction.amount,
    date: transaction.date,
    reference: transaction.reference,
    phone_number: transaction.phone_number,
  };
}

export const fetchCashTransactions = createAsyncThunk(
  'cashTransactions/fetchAll',
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      console.log('Fetching cash transactions for phone:', phoneNumber);
      const response = await fetch(`/api/business-hub/cash-transactions?phone=${encodeURIComponent(phoneNumber)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch cash transactions:', errorData);
        return rejectWithValue(errorData.error || 'Failed to fetch cash transactions');
      }

      const data = await response.json();
      console.log('Fetched cash transactions:', data);
      return data.map(mapCashTransactionFromApi);
    } catch (error) {
      console.error('Error fetching cash transactions:', error);
      return rejectWithValue('Failed to fetch cash transactions');
    }
  }
);

export const addCashTransaction = createAsyncThunk(
  'cashTransactions/add',
  async ({ transaction, phoneNumber }: { transaction: Omit<CashTransaction, 'id'>; phoneNumber: string }, { rejectWithValue }) => {
    try {
      console.log('Adding cash transaction for phone:', phoneNumber, 'Data:', transaction);
      
      const transactionWithPhone = {
        ...transaction,
        phone_number: phoneNumber,
      };

      const response = await fetch(`/api/business-hub/cash-transactions?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapCashTransactionToApi(transactionWithPhone)),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create cash transaction:', errorData);
        return rejectWithValue(errorData.error || 'Failed to create cash transaction');
      }

      const data = await response.json();
      console.log('Created cash transaction:', data);
      return mapCashTransactionFromApi(data);
    } catch (error) {
      console.error('Error creating cash transaction:', error);
      return rejectWithValue('Failed to create cash transaction');
    }
  }
);

export const updateCashTransaction = createAsyncThunk(
  'cashTransactions/update',
  async ({ id, transaction, phoneNumber }: { id: string; transaction: Partial<CashTransaction>; phoneNumber: string }, { rejectWithValue }) => {
    try {
      console.log('Updating cash transaction:', id, 'for phone:', phoneNumber, 'Data:', transaction);
      
      const response = await fetch(`/api/business-hub/cash-transactions/${id}?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapCashTransactionToApi(transaction)),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update cash transaction:', errorData);
        return rejectWithValue(errorData.error || 'Failed to update cash transaction');
      }

      const data = await response.json();
      console.log('Updated cash transaction:', data);
      return mapCashTransactionFromApi(data);
    } catch (error) {
      console.error('Error updating cash transaction:', error);
      return rejectWithValue('Failed to update cash transaction');
    }
  }
);

export const deleteCashTransaction = createAsyncThunk(
  'cashTransactions/delete',
  async ({ id, phoneNumber }: { id: string; phoneNumber: string }, { rejectWithValue }) => {
    try {
      console.log('Deleting cash transaction:', id, 'for phone:', phoneNumber);
      
      const response = await fetch(`/api/business-hub/cash-transactions/${id}?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete cash transaction:', errorData);
        return rejectWithValue(errorData.error || 'Failed to delete cash transaction');
      }

      console.log('Successfully deleted cash transaction:', id);
      return id;
    } catch (error) {
      console.error('Error deleting cash transaction:', error);
      return rejectWithValue('Failed to delete cash transaction');
    }
  }
);

const cashTransactionsSlice = createSlice({
  name: 'cashTransactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCashTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCashTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCashTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch cash transactions';
      })
      .addCase(addCashTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(addCashTransaction.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to add cash transaction';
      })
      .addCase(updateCashTransaction.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateCashTransaction.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to update cash transaction';
      })
      .addCase(deleteCashTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.transaction_id !== action.payload && t.id !== action.payload);
      })
      .addCase(deleteCashTransaction.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to delete cash transaction';
      });
  },
});

export default cashTransactionsSlice.reducer;
export const selectAllCashTransactions = (state: any) => state.cashTransactions.items;
export const selectCashTransactionsLoading = (state: any) => state.cashTransactions.loading;
export const selectCashTransactionsError = (state: any) => state.cashTransactions.error; 