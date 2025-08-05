import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit'

export interface Expense {
  id: string;
  expense_id: string;
  expense_name: string;
  expense_date: string;
  amount: number;
  category: string;
  description: string;
  phone_number: string;
  expense_data: any;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  expense_number?: string;
  date?: string;
  status?: string;
  notes?: string;
  party_id?: string | null;
  party_name?: string | null;
  party?: {
    id: string;
    party_name: string;
    phone?: string;
    email?: string;
  } | null;
}

interface ExpensesState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  selectedExpense: Expense | null;
  filters: {
    status: string;
    searchTerm: string;
  };
}

const initialState: ExpensesState = {
  expenses: [],
  loading: false,
  error: null,
  selectedExpense: null,
  filters: {
    status: "",
    searchTerm: "",
  },
};

function mapExpenseFromApi(expense: any): Expense {
  return {
    id: expense.id,
    expense_id: expense.expense_id,
    expense_name: expense.expense_name,
    expense_date: expense.expense_date,
    amount: expense.amount,
    category: expense.category || '',
    description: expense.description || '',
    phone_number: expense.phone_number,
    expense_data: expense.expense_data,
    created_at: expense.created_at,
    updated_at: expense.updated_at,
    // Legacy fields for backward compatibility
    expense_number: expense.expense_id,
    date: expense.expense_date,
    status: expense.expense_data?.status || 'paid',
    notes: expense.expense_data?.notes || expense.description || '',
    party_id: expense.expense_data?.party_id,
    party_name: expense.party_name,
    party: expense.party,
  };
}

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get phone number from Redux state
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.error('❌ No phone number available in Redux state');
        return rejectWithValue('Phone number is required. Please ensure you are logged in.');
      }
      
      console.log('📱 Using phone number from Redux for expenses fetch:', phoneNumber);
      
      const { apiClient } = await import('@/lib/api-client');
      const data = await apiClient.expenses.getAll(phoneNumber);
      return data.map(mapExpenseFromApi);
    } catch (error) {
      return rejectWithValue('Failed to fetch expenses');
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expense: Omit<Expense, 'id' | 'created_at'>, { rejectWithValue, getState }) => {
    try {
      // Get phone number from Redux state
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.error('❌ No phone number available in Redux state');
        return rejectWithValue('Phone number is required. Please ensure you are logged in.');
      }
      
      console.log('📱 Using phone number from Redux for expenses:', phoneNumber);
      
      const { apiClient } = await import('@/lib/api-client');
      const data = await apiClient.expenses.create({
        ...expense,
        phone: phoneNumber
      });
      return mapExpenseFromApi(data);
    } catch (error) {
      return rejectWithValue('Failed to create expense');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, expense }: { id: string; expense: Partial<Expense> }, { rejectWithValue, getState }) => {
    try {
      // Get phone number from Redux state
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.error('❌ No phone number available in Redux state');
        return rejectWithValue('Phone number is required. Please ensure you are logged in.');
      }
      
      console.log('📱 Using phone number from Redux for expense update:', phoneNumber);
      
      const response = await fetch(`/api/business-hub/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expense,
          phone: phoneNumber
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return mapExpenseFromApi(data);
    } catch (error) {
      console.error('❌ Error updating expense:', error);
      return rejectWithValue('Failed to update expense');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      // Get phone number from Redux state
      const state = getState() as any;
      const phoneNumber = state.settings.general.phoneNumber;
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.error('❌ No phone number available in Redux state');
        return rejectWithValue('Phone number is required. Please ensure you are logged in.');
      }
      
      console.log('📱 Using phone number from Redux for expense deletion:', phoneNumber);
      
      const response = await fetch(`/api/business-hub/expenses/${id}?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return id;
    } catch (error) {
      console.error('❌ Error deleting expense:', error);
      return rejectWithValue('Failed to delete expense');
    }
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.push(action.payload);
    },
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload;
    },
    clearExpenses: (state) => {
      state.expenses = [];
      state.selectedExpense = null;
      state.error = null;
    },
    updateExpenseLocal: (state, action: PayloadAction<{ id: string; expense: Expense }>) => {
      const index = state.expenses.findIndex(expense => expense.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = action.payload.expense;
      }
    },
    deleteExpenseLocal: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(expense => expense.id !== action.payload);
    },
    setSelectedExpense: (state, action: PayloadAction<Expense | null>) => {
      state.selectedExpense = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ExpensesState['filters']>>) => {
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
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.push(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.expenses.findIndex(expense => expense.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.filter(expense => expense.id !== action.payload);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addExpense,
  setExpenses,
  clearExpenses,
  updateExpenseLocal,
  deleteExpenseLocal,
  setSelectedExpense,
  setFilters,
  clearFilters,
} = expensesSlice.actions;

// Selectors
export const selectAllExpenses = (state: { expenses: ExpensesState }) => state.expenses.expenses;
export const selectExpensesLoading = (state: { expenses: ExpensesState }) => state.expenses.loading;
export const selectExpensesError = (state: { expenses: ExpensesState }) => state.expenses.error;
export const selectSelectedExpense = (state: { expenses: ExpensesState }) => state.expenses.selectedExpense;
export const selectFilters = (state: { expenses: ExpensesState }) => state.expenses.filters;

export const selectFilteredExpenses = createSelector(
  [
    (state: { expenses: ExpensesState }) => state.expenses.expenses,
    (state: { expenses: ExpensesState }) => state.expenses.filters
  ],
  (expenses, filters) => {
    return expenses.filter(expense => {
      const matchesStatus = !filters.status || expense.status === filters.status;
      const matchesSearch = !filters.searchTerm || 
        expense.expense_number?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        expense.category?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }
);

export const selectExpensesStats = createSelector(
  [(state: { expenses: ExpensesState }) => state.expenses.expenses],
  (expenses) => {
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const paidExpenses = expenses.filter(e => e.status === 'paid').length;
    const pendingExpenses = expenses.filter(e => e.status === 'pending').length;

    return {
      totalExpenses,
      totalAmount,
      paidExpenses,
      pendingExpenses,
    };
  }
);

export default expensesSlice.reducer; 