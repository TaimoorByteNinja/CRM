import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface LoanAccount {
  id: string;
  loan_id?: string;
  type: 'borrowing' | 'lending';
  partyName: string;
  amount: number;
  interestRate: number;
  startDate: string;
  dueDate: string;
  status: 'active' | 'completed' | 'overdue' | 'cancelled';
  description: string;
  phone_number?: string;
  createdAt: string;
}

interface LoanAccountsState {
  items: LoanAccount[];
  loading: boolean;
  error: string | null;
}

const initialState: LoanAccountsState = {
  items: [],
  loading: false,
  error: null,
};

function mapLoanAccountFromApi(loan: any): LoanAccount {
  return {
    id: loan.id,
    loan_id: loan.loan_id,
    type: loan.type,
    partyName: loan.party_name,
    amount: loan.amount,
    interestRate: loan.interest_rate,
    startDate: loan.start_date,
    dueDate: loan.due_date,
    status: loan.status,
    description: loan.description,
    phone_number: loan.phone_number,
    createdAt: loan.created_at,
  };
}

function mapLoanAccountToApi(loan: any): any {
  return {
    type: loan.type,
    party_name: loan.partyName,
    amount: loan.amount,
    interest_rate: loan.interestRate,
    start_date: loan.startDate,
    due_date: loan.dueDate,
    status: loan.status,
    description: loan.description,
    phone_number: loan.phone_number,
  };
}

export const fetchLoanAccounts = createAsyncThunk(
  'loanAccounts/fetchAll',
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      console.log('Fetching loan accounts for phone:', phoneNumber);
      const response = await fetch(`/api/business-hub/loan-accounts?phone=${encodeURIComponent(phoneNumber)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch loan accounts:', errorData);
        return rejectWithValue(errorData.error || 'Failed to fetch loan accounts');
      }

      const data = await response.json();
      console.log('Fetched loan accounts:', data);
      return data.map(mapLoanAccountFromApi);
    } catch (error) {
      console.error('Error fetching loan accounts:', error);
      return rejectWithValue('Failed to fetch loan accounts');
    }
  }
);

export const addLoanAccount = createAsyncThunk(
  'loanAccounts/add',
  async ({ loan, phoneNumber }: { loan: Omit<LoanAccount, 'id'>; phoneNumber: string }, { rejectWithValue }) => {
    try {
      console.log('Adding loan account for phone:', phoneNumber, 'Data:', loan);
      
      const loanWithPhone = {
        ...loan,
        phone_number: phoneNumber,
      };

      const response = await fetch(`/api/business-hub/loan-accounts?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapLoanAccountToApi(loanWithPhone)),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create loan account:', errorData);
        return rejectWithValue(errorData.error || 'Failed to create loan account');
      }

      const data = await response.json();
      console.log('Created loan account:', data);
      return mapLoanAccountFromApi(data);
    } catch (error) {
      console.error('Error creating loan account:', error);
      return rejectWithValue('Failed to create loan account');
    }
  }
);

export const updateLoanAccount = createAsyncThunk(
  'loanAccounts/update',
  async ({ id, loan, phoneNumber }: { id: string; loan: Partial<LoanAccount>; phoneNumber: string }, { rejectWithValue }) => {
    try {
      console.log('Updating loan account:', id, 'for phone:', phoneNumber, 'Data:', loan);
      
      const response = await fetch(`/api/business-hub/loan-accounts/${id}?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapLoanAccountToApi(loan)),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update loan account:', errorData);
        return rejectWithValue(errorData.error || 'Failed to update loan account');
      }

      const data = await response.json();
      console.log('Updated loan account:', data);
      return mapLoanAccountFromApi(data);
    } catch (error) {
      console.error('Error updating loan account:', error);
      return rejectWithValue('Failed to update loan account');
    }
  }
);

export const deleteLoanAccount = createAsyncThunk(
  'loanAccounts/delete',
  async ({ id, phoneNumber }: { id: string; phoneNumber: string }, { rejectWithValue }) => {
    try {
      console.log('Deleting loan account:', id, 'for phone:', phoneNumber);
      
      const response = await fetch(`/api/business-hub/loan-accounts/${id}?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete loan account:', errorData);
        return rejectWithValue(errorData.error || 'Failed to delete loan account');
      }

      console.log('Successfully deleted loan account:', id);
      return id;
    } catch (error) {
      console.error('Error deleting loan account:', error);
      return rejectWithValue('Failed to delete loan account');
    }
  }
);

const loanAccountsSlice = createSlice({
  name: 'loanAccounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoanAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoanAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLoanAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch loan accounts';
      })
      .addCase(addLoanAccount.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateLoanAccount.fulfilled, (state, action) => {
        const idx = state.items.findIndex((l) => l.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteLoanAccount.fulfilled, (state, action) => {
        state.items = state.items.filter((l) => l.id !== action.payload);
      });
  },
});

export default loanAccountsSlice.reducer;
export const selectAllLoanAccounts = (state: any) => state.loanAccounts.items;
export const selectLoanAccountsLoading = (state: any) => state.loanAccounts.loading;
export const selectLoanAccountsError = (state: any) => state.loanAccounts.error; 