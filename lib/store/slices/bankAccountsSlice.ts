import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit'

export interface BankAccount {
  id: string
  name: string
  accountNumber: string
  balance: number
  type: "checking" | "savings"
  status: "active" | "inactive"
}

interface BankAccountsState {
  accounts: BankAccount[]
  loading: boolean
  error: string | null
  selectedAccount: BankAccount | null
}

const initialState: BankAccountsState = {
  accounts: [], // No dummy data, only real data from backend
  loading: false,
  error: null,
  selectedAccount: null,
}

function mapBankAccountFromApi(account: any): BankAccount {
  console.log('Raw account data from API:', JSON.stringify(account, null, 2));
  
  // Handle different possible field names and structures
  const id = account.account_id || account.id || `bank_${Date.now()}`;
  const name = account.account_name || account.name || 'Unnamed Account';
  const accountNumber = account.account_number || account.accountNumber || 'Not Set';
  const balance = parseFloat(account.balance) || 0;
  const type = (account.account_type || account.type || 'checking') as "checking" | "savings";
  
  // Try to get status from multiple locations
  let status: "active" | "inactive" = 'active';
  if (account.account_data?.status) {
    status = account.account_data.status as "active" | "inactive";
  } else if (account.account_data?.originalData?.status) {
    status = account.account_data.originalData.status as "active" | "inactive";
  } else if (account.status) {
    status = account.status as "active" | "inactive";
  }
  
  const mapped = {
    id,
    name,
    accountNumber,
    balance,
    type,
    status,
  };
  
  console.log('Final mapped bank account:', mapped);
  console.log('Field mapping details:', {
    'id source': account.account_id ? 'account_id' : (account.id ? 'id' : 'generated'),
    'name source': account.account_name ? 'account_name' : (account.name ? 'name' : 'default'),
    'accountNumber source': account.account_number ? 'account_number' : (account.accountNumber ? 'accountNumber' : 'default'),
    'type source': account.account_type ? 'account_type' : (account.type ? 'type' : 'default'),
    'status source': account.account_data?.status ? 'account_data.status' : (account.status ? 'status' : 'default')
  });
  
  return mapped;
}

function mapBankAccountToApi(account: any, isUpdate: boolean = false): any {
  console.log('Mapping bank account to API:', account, 'isUpdate:', isUpdate);
  
  const mapped: any = {};
  
  // Only include fields that are provided (for updates)
  if (account.name !== undefined) {
    mapped.account_name = account.name;
  }
  if (account.accountNumber !== undefined) {
    mapped.account_number = account.accountNumber;
  }
  if (account.type !== undefined) {
    mapped.account_type = account.type;
  }
  if (account.balance !== undefined) {
    mapped.balance = parseFloat(account.balance) || 0;
  }
  if (account.bankName !== undefined) {
    mapped.bank_name = account.bankName || '';
  }
  
  // For new accounts, ensure we have required fields
  if (!isUpdate) {
    mapped.account_id = account.id || `bank_${Date.now()}`;
    mapped.account_name = mapped.account_name || 'Unnamed Account';
    mapped.account_type = mapped.account_type || 'checking';
    mapped.balance = mapped.balance || 0;
  }
  
  // Always update account_data with status and original data
  mapped.account_data = {
    status: account.status || 'active',
    lastUpdated: new Date().toISOString(),
    ...(account.account_data || {})
  };
  
  console.log('Mapped bank account for API:', mapped);
  return mapped;
}

export const fetchBankAccounts = createAsyncThunk(
  'bankAccounts/fetchBankAccounts',
  async (phoneNumber: string, { rejectWithValue }) => {
    console.log('fetchBankAccounts thunk called with phone:', phoneNumber);
    try {
      const response = await fetch(`/api/business-hub/bank-accounts?phone=${encodeURIComponent(phoneNumber)}`)
      console.log('fetchBankAccounts response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json()
      console.log('fetchBankAccounts response data:', data);
      return data.map(mapBankAccountFromApi)
    } catch (error) {
      console.error('fetchBankAccounts error:', error);
      return rejectWithValue('Failed to fetch bank accounts')
    }
  }
)

export const createBankAccount = createAsyncThunk(
  'bankAccounts/createBankAccount',
  async ({ account, phoneNumber }: { account: Omit<BankAccount, 'id'>, phoneNumber: string }, { rejectWithValue }) => {
    console.log('createBankAccount thunk called with:', account, 'phone:', phoneNumber);
    try {
      const response = await fetch(`/api/business-hub/bank-accounts?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapBankAccountToApi(account, false)),
      })
      console.log('createBankAccount response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }
      const data = await response.json()
      console.log('createBankAccount response data:', data);
      return mapBankAccountFromApi(data)
    } catch (error) {
      console.error('createBankAccount error:', error);
      return rejectWithValue('Failed to create bank account')
    }
  }
)

export const updateBankAccount = createAsyncThunk(
  'bankAccounts/updateBankAccount',
  async ({ id, account, phoneNumber }: { id: string; account: Partial<BankAccount>; phoneNumber: string }, { rejectWithValue }) => {
    console.log('updateBankAccount thunk called with:', { id, account, phoneNumber });
    try {
      const response = await fetch(`/api/business-hub/bank-accounts/${id}?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapBankAccountToApi(account, true)),
      })
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }
      const data = await response.json()
      console.log('updateBankAccount response data:', data);
      return mapBankAccountFromApi(data)
    } catch (error) {
      console.error('updateBankAccount error:', error);
      return rejectWithValue('Failed to update bank account')
    }
  }
)

export const deleteBankAccount = createAsyncThunk(
  'bankAccounts/deleteBankAccount',
  async ({ id, phoneNumber }: { id: string; phoneNumber: string }, { rejectWithValue }) => {
    console.log('deleteBankAccount thunk called with:', { id, phoneNumber });
    try {
      const response = await fetch(`/api/business-hub/bank-accounts/${id}?phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return id
    } catch (error) {
      console.error('deleteBankAccount error:', error);
      return rejectWithValue('Failed to delete bank account')
    }
  }
)

const bankAccountsSlice = createSlice({
  name: 'bankAccounts',
  initialState,
  reducers: {
    addBankAccount: (state, action: PayloadAction<BankAccount>) => {
      state.accounts.push(action.payload)
    },
    setBankAccounts: (state, action: PayloadAction<BankAccount[]>) => {
      state.accounts = action.payload
    },
    clearBankAccounts: (state) => {
      state.accounts = []
      state.selectedAccount = null
      state.error = null
    },
    updateBankAccount: (state, action: PayloadAction<{ id: string; account: BankAccount }>) => {
      const index = state.accounts.findIndex(account => account.id === action.payload.id)
      if (index !== -1) {
        state.accounts[index] = action.payload.account
      }
    },
    deleteBankAccount: (state, action: PayloadAction<string>) => {
      state.accounts = state.accounts.filter(account => account.id !== action.payload)
    },
    setSelectedAccount: (state, action: PayloadAction<BankAccount | null>) => {
      state.selectedAccount = action.payload
    },
    updateBalance: (state, action: PayloadAction<{ id: string; amount: number; type: 'add' | 'subtract' }>) => {
      const account = state.accounts.find(a => a.id === action.payload.id)
      if (account) {
        if (action.payload.type === 'add') {
          account.balance += action.payload.amount
        } else {
          account.balance = Math.max(0, account.balance - action.payload.amount)
        }
      }
    },
    transferFunds: (state, action: PayloadAction<{ fromId: string; toId: string; amount: number }>) => {
      const fromAccount = state.accounts.find(a => a.id === action.payload.fromId)
      const toAccount = state.accounts.find(a => a.id === action.payload.toId)
      
      if (fromAccount && toAccount && fromAccount.balance >= action.payload.amount) {
        fromAccount.balance -= action.payload.amount
        toAccount.balance += action.payload.amount
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBankAccounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBankAccounts.fulfilled, (state, action) => {
        state.loading = false
        state.accounts = action.payload
      })
      .addCase(fetchBankAccounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createBankAccount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBankAccount.fulfilled, (state, action) => {
        state.loading = false
        state.accounts.push(action.payload)
      })
      .addCase(createBankAccount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateBankAccount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBankAccount.fulfilled, (state, action) => {
        state.loading = false
        const index = state.accounts.findIndex(account => account.id === action.payload.id)
        if (index !== -1) {
          state.accounts[index] = action.payload
        }
      })
      .addCase(updateBankAccount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deleteBankAccount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteBankAccount.fulfilled, (state, action) => {
        state.loading = false
        state.accounts = state.accounts.filter(account => account.id !== action.payload)
      })
      .addCase(deleteBankAccount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  addBankAccount,
  setBankAccounts,
  clearBankAccounts,
  updateBankAccount: updateBankAccountReducer,
  deleteBankAccount: deleteBankAccountReducer,
  setSelectedAccount,
  updateBalance,
  transferFunds,
} = bankAccountsSlice.actions

// Selectors
export const selectAllBankAccounts = (state: { bankAccounts: BankAccountsState }) => state.bankAccounts.accounts
export const selectBankAccountsLoading = (state: { bankAccounts: BankAccountsState }) => state.bankAccounts.loading
export const selectBankAccountsError = (state: { bankAccounts: BankAccountsState }) => state.bankAccounts.error
export const selectSelectedAccount = (state: { bankAccounts: BankAccountsState }) => state.bankAccounts.selectedAccount

export const selectBankAccountsStats = createSelector(
  [(state: { bankAccounts: BankAccountsState }) => state.bankAccounts.accounts],
  (accounts) => {
    const totalAccounts = accounts.length
    const activeAccounts = accounts.filter(account => account.status === 'active').length
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
    const checkingAccounts = accounts.filter(account => account.type === 'checking')
    const savingsAccounts = accounts.filter(account => account.type === 'savings')

    return {
      totalAccounts,
      activeAccounts,
      totalBalance,
      checkingAccounts: checkingAccounts.length,
      savingsAccounts: savingsAccounts.length,
    }
  }
)

export default bankAccountsSlice.reducer 