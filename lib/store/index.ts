import { configureStore } from '@reduxjs/toolkit'
import salesReducer from './slices/salesSlice'
import itemsReducer from './slices/itemsSlice'
import customersReducer from './slices/customersSlice'
import suppliersReducer from './slices/suppliersSlice'
import partiesReducer from './slices/partiesSlice'
import purchasesReducer from './slices/purchasesSlice'
import purchaseReturnsReducer from './slices/purchaseReturnsSlice'
import expensesReducer from './slices/expensesSlice'
import bankAccountsReducer from './slices/bankAccountsSlice'
import uiReducer from './slices/uiSlice'
import dashboardReducer from './slices/dashboardSlice'
import cashTransactionsReducer from './slices/cashTransactionsSlice';
import chequesReducer from './slices/chequesSlice';
import loanAccountsReducer from './slices/loanAccountsSlice';
import reportsReducer from './slices/reportsSlice';
import settingsReducer from './slices/settingsSlice';
import utilitiesReducer from './slices/utilitiesSlice';

export const store = configureStore({
  reducer: {
    sales: salesReducer,
    items: itemsReducer,
    customers: customersReducer,
    suppliers: suppliersReducer,
    parties: partiesReducer,
    purchases: purchasesReducer,
    purchaseReturns: purchaseReturnsReducer,
    expenses: expensesReducer,
    bankAccounts: bankAccountsReducer,
    ui: uiReducer,
    dashboard: dashboardReducer,
    cashTransactions: cashTransactionsReducer,
    cheques: chequesReducer,
    loanAccounts: loanAccountsReducer,
    reports: reportsReducer,
    settings: settingsReducer,
    utilities: utilitiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

// Make store available globally for API client
if (typeof window !== 'undefined') {
  (window as any).__REDUX_STORE__ = store;
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 