"use client"

import { useState } from "react"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Banknote,
  Plus,
  Edit,
  Trash2,
  Search,
  MoreHorizontal,
  Building2,
  FileText,
  Download,
  Upload,
  ArrowUpRight,
  Activity,
  Sparkles,
  TrendingDown,
  Calendar,
  Wallet,
  Receipt,
  PiggyBank,
  Settings,
  Shield,
  Printer,
  QrCode,
} from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectAllBankAccounts, createBankAccount, updateBankAccount, fetchBankAccounts, deleteBankAccount, selectBankAccountsStats } from "@/lib/store/slices/bankAccountsSlice"
import { showNotification } from "@/lib/store/slices/uiSlice"
import {
  selectAllCashTransactions,
  selectCashTransactionsLoading,
  fetchCashTransactions,
  addCashTransaction,
  updateCashTransaction,
  deleteCashTransaction,
} from '@/lib/store/slices/cashTransactionsSlice';
import {
  selectAllCheques,
  selectChequesLoading,
  fetchCheques,
  addCheque,
  updateCheque,
  deleteCheque,
} from '@/lib/store/slices/chequesSlice';
import {
  selectAllLoanAccounts,
  selectLoanAccountsLoading,
  fetchLoanAccounts,
  addLoanAccount,
  updateLoanAccount,
  deleteLoanAccount,
} from '@/lib/store/slices/loanAccountsSlice';
import { useEffect } from 'react';
import LoadingState from '@/components/LoadingState';
import { useCurrency } from '@/lib/currency-manager';
import { selectGeneralSettings } from '@/lib/store/slices/settingsSlice';

// Interfaces
interface BankAccount {
  id: string
  name: string
  accountNumber: string
  balance: number
  type: "checking" | "savings"
  status: "active" | "inactive"
}

interface CashTransaction {
  id: string
  type: "sale" | "purchase" | "expense" | "income" | "adjustment"
  name: string
  description: string
  amount: number
  date: string
  reference?: string
  createdAt: string
}

interface Cheque {
  id: string
  type: "issued" | "received"
  chequeNumber: string
  partyName: string
  amount: number
  date: string
  dueDate: string
  bankName: string
  status: "pending" | "cleared" | "bounced" | "cancelled"
  description: string
  createdAt: string
}

interface LoanAccount {
  id: string
  type: "borrowing" | "lending"
  partyName: string
  amount: number
  interestRate: number
  startDate: string
  dueDate: string
  status: "active" | "completed" | "overdue" | "cancelled"
  description: string
  createdAt: string
}

export default function BankPage() {
  const dispatch = useAppDispatch();
  const bankAccounts = useAppSelector(selectAllBankAccounts);
  const bankStats = useAppSelector(selectBankAccountsStats);
  const bankAccountsLoading = useAppSelector((state) => state.bankAccounts.loading);
  const cashTransactions = useAppSelector(selectAllCashTransactions);
  const cashLoading = useAppSelector(selectCashTransactionsLoading);
  const cheques = useAppSelector(selectAllCheques);
  const chequesLoading = useAppSelector(selectChequesLoading);
  const loanAccounts = useAppSelector(selectAllLoanAccounts);
  const loansLoading = useAppSelector(selectLoanAccountsLoading);
  const generalSettings = useAppSelector(selectGeneralSettings);
  const { formatAmountWithSymbol } = useCurrency();

  const [activeTab, setActiveTab] = useState('bank');
  const [tabValue, setTabValue] = useState('accounts');
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [showCashDialog, setShowCashDialog] = useState(false);
  const [showChequeDialog, setShowChequeDialog] = useState(false);
  const [showLoanDialog, setShowLoanDialog] = useState(false);

  // Selected items for editing
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [selectedCash, setSelectedCash] = useState<CashTransaction | null>(null);
  const [selectedCheque, setSelectedCheque] = useState<Cheque | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<LoanAccount | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [bankForm, setBankForm] = useState<Partial<BankAccount>>({});
  const [cashForm, setCashForm] = useState<Partial<CashTransaction>>({});
  const [chequeForm, setChequeForm] = useState<Partial<Cheque>>({});
  const [loanForm, setLoanForm] = useState<Partial<LoanAccount>>({});

  // Fetch all data on mount
  useEffect(() => {
    const phoneNumber = generalSettings?.phoneNumber;
    if (phoneNumber) {
      dispatch(fetchBankAccounts(phoneNumber));
      dispatch(fetchCashTransactions(phoneNumber));
      dispatch(fetchCheques(phoneNumber));
      dispatch(fetchLoanAccounts(phoneNumber));
    }
  }, [dispatch, generalSettings?.phoneNumber]);

  // Calculations
  const totalBankBalance = bankAccounts.reduce((sum: number, account: BankAccount) => sum + account.balance, 0);
  const totalCashInHand = cashTransactions.reduce((sum: number, transaction: CashTransaction) => {
    return transaction.type === 'sale' || transaction.type === 'income'
      ? sum + transaction.amount
      : sum - transaction.amount;
  }, 0);
  const pendingCheques = cheques.filter((c: Cheque) => c.status === 'pending').length;
  const totalLoanBalance = loanAccounts.reduce((sum: number, loan: LoanAccount) => sum + loan.amount, 0);

  // Dialog handlers
  const openBankDialog = (bank?: BankAccount) => {
    setSelectedBank(bank || null)
    setBankForm(bank || { type: "checking", status: "active", balance: 0 })
    setShowBankDialog(true)
  }

  const openCashDialog = (transaction?: CashTransaction) => {
    setSelectedCash(transaction || null)
    setCashForm(transaction || { type: "sale", amount: 0, date: new Date().toISOString().split("T")[0] })
    setShowCashDialog(true)
  }

  const openChequeDialog = (cheque?: Cheque) => {
    setSelectedCheque(cheque || null)
    setChequeForm(
      cheque || {
        type: "received",
        status: "pending",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        chequeNumber: "",
        partyName: "",
        bankName: "",
        description: "",
      },
    )
    setShowChequeDialog(true)
  }

  const openLoanDialog = (loan?: LoanAccount) => {
    setSelectedLoan(loan || null)
    setLoanForm(
      loan || {
        type: "borrowing",
        status: "active",
        amount: 0,
        interestRate: 0,
        startDate: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        partyName: "",
        description: "",
      },
    )
    setShowLoanDialog(true)
  }

  // Save handlers
  const handleSaveBank = async () => {
    setIsLoading(true);
    console.log('handleSaveBank called', { selectedBank, bankForm });
    
    const phoneNumber = generalSettings?.phoneNumber;
    if (!phoneNumber) {
      dispatch(showNotification({ 
        message: 'Phone number not found. Please check your settings.', 
        type: 'error',
        category: 'bank',
        actionUrl: '/business-hub/settings',
        priority: 'high'
      }));
      setIsLoading(false);
      return;
    }

    try {
      if (selectedBank) {
        console.log('Updating bank account', { id: selectedBank.id, account: bankForm, phoneNumber });
        await dispatch(updateBankAccount({ id: selectedBank.id, account: bankForm, phoneNumber }));
        dispatch(showNotification({ 
          message: 'Bank account updated successfully!', 
          type: 'success',
          category: 'bank',
          actionUrl: '/business-hub/bank',
          priority: 'medium'
        }));
      } else {
        console.log('Creating new bank account', bankForm, phoneNumber);
        const newBank: Omit<BankAccount, 'id'> = {
          ...(bankForm as BankAccount),
        };
        await dispatch(createBankAccount({ account: newBank, phoneNumber }));
        dispatch(showNotification({ 
          message: 'Bank account added successfully!', 
          type: 'success',
          category: 'bank',
          actionUrl: '/business-hub/bank',
          priority: 'medium'
        }));
      }
      setShowBankDialog(false);
      setBankForm({});
      setSelectedBank(null);
    } catch (error) {
      console.error('Failed to save bank account:', error);
      dispatch(showNotification({ 
        message: 'Failed to save bank account', 
        type: 'error',
        category: 'bank',
        priority: 'high'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCash = async () => {
    setIsLoading(true);
    try {
      const phoneNumber = generalSettings?.phoneNumber;
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }

      if (selectedCash) {
        await dispatch(updateCashTransaction({ 
          id: selectedCash.id, 
          transaction: cashForm, 
          phoneNumber 
        }));
      } else {
        const newTransaction: Omit<CashTransaction, 'id'> = {
          ...(cashForm as CashTransaction),
          createdAt: new Date().toISOString(),
        };
        await dispatch(addCashTransaction({ transaction: newTransaction, phoneNumber }));
      }
      setShowCashDialog(false);
      setCashForm({});
      setSelectedCash(null);
    } catch (error) {
      console.error('Failed to save cash transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCheque = async () => {
    // Get phone number from settings
    const phoneNumber = generalSettings?.phoneNumber;
    if (!phoneNumber) {
      alert('Phone number not found in settings');
      return;
    }

    // Validate required fields
    if (!chequeForm.type) {
      alert('Please select a cheque type');
      return;
    }
    if (!chequeForm.chequeNumber) {
      alert('Please enter a cheque number');
      return;
    }
    if (!chequeForm.partyName) {
      alert('Please enter a party name');
      return;
    }
    if (!chequeForm.amount || chequeForm.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      if (selectedCheque) {
        await dispatch(updateCheque({ id: selectedCheque.id, cheque: chequeForm, phoneNumber }));
      } else {
        const newCheque: Omit<Cheque, 'id'> = {
          ...(chequeForm as Cheque),
          createdAt: new Date().toISOString(),
        };
        await dispatch(addCheque({ cheque: newCheque, phoneNumber }));
      }
      setShowChequeDialog(false);
      setChequeForm({});
      setSelectedCheque(null);
    } catch (error) {
      console.error('Failed to save cheque:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLoan = async () => {
    // Get phone number from settings
    const phoneNumber = generalSettings?.phoneNumber;
    if (!phoneNumber) {
      alert('Phone number not found in settings');
      return;
    }

    setIsLoading(true);
    try {
      if (selectedLoan) {
        await dispatch(updateLoanAccount({ id: selectedLoan.id, loan: loanForm, phoneNumber }));
      } else {
        const newLoan: Omit<LoanAccount, 'id'> = {
          ...(loanForm as LoanAccount),
          createdAt: new Date().toISOString(),
        };
        await dispatch(addLoanAccount({ loan: newLoan, phoneNumber }));
      }
      setShowLoanDialog(false);
      setLoanForm({});
      setSelectedLoan(null);
    } catch (error) {
      console.error('Failed to save loan account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteBank = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;
    
    const phoneNumber = generalSettings?.phoneNumber;
    if (!phoneNumber) {
      dispatch(showNotification({ 
        message: 'Phone number not found. Please check your settings.', 
        type: 'error',
        category: 'bank',
        actionUrl: '/business-hub/settings',
        priority: 'high'
      }));
      return;
    }

    await dispatch(deleteBankAccount({ id, phoneNumber }));
    dispatch(showNotification({ 
      message: 'Bank account deleted successfully!', 
      type: 'success',
      category: 'bank',
      actionUrl: '/business-hub/bank',
      priority: 'medium'
    }));
  };

  const handleDeleteCash = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    const phoneNumber = generalSettings?.phoneNumber;
    if (!phoneNumber) {
      console.error('Phone number is required');
      return;
    }
    await dispatch(deleteCashTransaction({ id, phoneNumber }));
  };

  const handleDeleteCheque = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cheque?')) return;
    await dispatch(deleteCheque({ id, phoneNumber }));
  };

  const handleDeleteLoan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this loan account?')) return;
    const phoneNumber = generalSettings?.phoneNumber;
    if (!phoneNumber) {
      alert('Phone number not found in settings');
      return;
    }
    await dispatch(deleteLoanAccount({ id, phoneNumber }));
  };

  const formatCurrency = (amount: number) => {
    return formatAmountWithSymbol(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="ml-16 flex flex-col min-h-screen">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Banknote className="h-4 w-4 text-white" />
                    </div>
                    Cash & Bank
                  </h1>
                  <p className="text-gray-600">Manage your financial accounts and transactions</p>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative bg-white rounded-xl p-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-12 pr-4 py-3 w-96 bg-gray-50/50 border-gray-200/50 rounded-lg focus:bg-white transition-all duration-200"
                      placeholder="Search Transactions"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* <Button className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sale
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Purchase
                </Button> */}
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                </Button> */}
                {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-transparent"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white/95 backdrop-blur-xl border-white/20">
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <Tabs value={tabValue} onValueChange={setTabValue} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-xl border-white/20 shadow-lg rounded-2xl p-2">
              <TabsTrigger
                value="accounts"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                Bank Accounts
              </TabsTrigger>
              <TabsTrigger
                value="cash"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                Cash in Hand
              </TabsTrigger>
              <TabsTrigger
                value="cheques"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                Cheques
              </TabsTrigger>
              <TabsTrigger
                value="loans"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                Loan Accounts
              </TabsTrigger>
            </TabsList>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Total Bank Balance</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBankBalance)}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <ArrowUpRight className="h-3 w-3 text-blue-500" />
                        {bankAccounts.length} accounts
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Cash in Hand</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCashInHand)}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Activity className="h-3 w-3 text-green-500" />
                        {cashTransactions.length} transactions
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Wallet className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Pending Cheques</p>
                      <p className="text-2xl font-bold text-gray-900">{pendingCheques}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-purple-500" />
                        {cheques.length} total
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Receipt className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Loan Balance</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalLoanBalance)}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <TrendingDown className="h-3 w-3 text-orange-500" />
                        {loanAccounts.length} accounts
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <PiggyBank className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bank Accounts Tab */}
            <TabsContent value="accounts" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Bank Accounts</h2>
                <Button
                  onClick={() => openBankDialog()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank Account
                </Button>
              </div>

              {bankAccountsLoading ? (
                <LoadingState 
                  type="table" 
                  text="Loading bank accounts..." 
                  rows={5} 
                  columns={5}
                />
              ) : bankAccounts.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Banking with Craft CRM</h3>
                    <p className="text-gray-600 mb-6">Add Bank accounts on Craft CRM and you can effortlessly:</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Printer className="h-6 w-6 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">Print Bank Details on Invoices</h4>
                        <p className="text-sm text-gray-600">
                          Print account details on your invoices and get payments via NEFT/RTGS/IMPS etc.
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <FileText className="h-6 w-6 text-green-600" />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">Track your transactions</h4>
                        <p className="text-sm text-gray-600">
                          Keep track of bank transactions by entering them on Craft CRM to maintain accurate records.
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <QrCode className="h-6 w-6 text-purple-600" />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">Receive Online Payments</h4>
                        <p className="text-sm text-gray-600">
                          Print QR code on your invoices or send payment links to your customers.
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => openBankDialog()}
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Bank Account
                    </Button>

                    <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>At Craft CRM, the security of your details is our top priority.</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bank Details</TableHead>
                          <TableHead>Account Type</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bankAccounts.map((account, index: number) => (
                          <TableRow key={`bank-account-${account.id || index}`} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900">{account.name}</p>
                                <p className="text-sm text-gray-600">A/C: {account.accountNumber}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {account.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{formatCurrency(account.balance)}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  account.status === "active"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                }
                              >
                                {account.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => openBankDialog(account)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteBank(account.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Cash in Hand Tab */}
            <TabsContent value="cash" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">CASH IN HAND</h2>
                  <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(totalCashInHand)}</p>
                </div>
                <Button
                  onClick={() => openCashDialog()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Adjust Cash
                </Button>
              </div>

              {cashLoading ? (
                <LoadingState 
                  type="table" 
                  text="Loading cash transactions..." 
                  rows={5} 
                  columns={5}
                />
              ) : (
                <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">TRANSACTIONS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Input
                        placeholder="Search transactions..."
                        className="w-64 rounded-lg border-gray-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>TYPE</TableHead>
                        <TableHead>NAME</TableHead>
                        <TableHead>DATE</TableHead>
                        <TableHead>AMOUNT</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cashTransactions.map((transaction: CashTransaction, index: number) => (
                        <TableRow key={`cash-transaction-${transaction.id || index}`} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  transaction.type === "sale"
                                    ? "bg-green-500"
                                    : transaction.type === "purchase"
                                      ? "bg-red-500"
                                      : "bg-blue-500"
                                }`}
                              ></div>
                              <span className="capitalize">{transaction.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{transaction.name}</TableCell>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell
                            className={`font-medium ${
                              transaction.type === "sale" || transaction.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => openCashDialog(transaction)}
                                size="sm"
                                variant="ghost"
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteCash(transaction.id)}
                                size="sm"
                                variant="ghost"
                                className="hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              )}
            </TabsContent>

            {/* Cheques Tab */}
            <TabsContent value="cheques" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">CHEQUE DETAILS</h2>
                <Button
                  onClick={() => openChequeDialog()}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cheque
                </Button>
              </div>

              {chequesLoading ? (
                <LoadingState 
                  type="table" 
                  text="Loading cheques..." 
                  rows={5} 
                  columns={6}
                />
              ) : cheques.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Receipt className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Cheques Found</h3>
                    <p className="text-gray-600 mb-6">
                      Payment received through cheque for your invoices will be shown here.
                    </p>
                    <Button
                      onClick={() => openChequeDialog()}
                      className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Cheque
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cheque Details</TableHead>
                          <TableHead>Party</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cheques.map((cheque: Cheque, index: number) => (
                          <TableRow key={`cheque-${cheque.id || index}`} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900">#{cheque.chequeNumber}</p>
                                <p className="text-sm text-gray-600">{cheque.bankName}</p>
                                <Badge
                                  variant="outline"
                                  className={
                                    cheque.type === "received"
                                      ? "text-green-700 border-green-200"
                                      : "text-blue-700 border-blue-200"
                                  }
                                >
                                  {cheque.type}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{cheque.partyName}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(cheque.amount)}</TableCell>
                            <TableCell>{formatDate(cheque.dueDate)}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  cheque.status === "cleared"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : cheque.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                      : cheque.status === "bounced"
                                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                }
                              >
                                {cheque.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => openChequeDialog(cheque)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteCheque(cheque.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Loan Accounts Tab */}
            <TabsContent value="loans" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Loan Accounts</h2>
                <Button
                  onClick={() => openLoanDialog()}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Loan Account
                </Button>
              </div>

              {loansLoading ? (
                <LoadingState 
                  type="table" 
                  text="Loading loan accounts..." 
                  rows={5} 
                  columns={7}
                />
              ) : loanAccounts.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <PiggyBank className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Loan Accounts</h3>
                    <p className="text-gray-600 mb-6">
                      Add your loan accounts & track loan transactions all at one place.
                    </p>
                    <Button
                      onClick={() => openLoanDialog()}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Loan A/C
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Loan Details</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Principal</TableHead>
                          <TableHead>Current Balance</TableHead>
                          <TableHead>Interest Rate</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loanAccounts.map((loan: LoanAccount, index: number) => (
                          <TableRow key={`loan-${loan.id || index}`} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900">{loan.partyName}</p>
                                <p className="text-sm text-gray-600">Due: {formatDate(loan.dueDate)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  loan.type === "borrowing"
                                    ? "text-red-700 border-red-200"
                                    : "text-green-700 border-green-200"
                                }
                              >
                                {loan.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{formatCurrency(loan.amount)}</TableCell>
                            <TableCell>{loan.interestRate}%</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  loan.status === "active"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : loan.status === "overdue"
                                      ? "bg-red-100 text-red-800 hover:bg-red-100"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                }
                              >
                                {loan.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => openLoanDialog(loan)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteLoan(loan.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bank Account Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {selectedBank ? "Edit Bank Account" : "Add Bank Account"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedBank ? "Update bank account details" : "Add a new bank account to your business"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Bank Name *
                </Label>
                <Input
                  id="name"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={bankForm.name || ""}
                  onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
                  Account Number *
                </Label>
                <Input
                  id="accountNumber"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={bankForm.accountNumber || ""}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  placeholder="Enter account number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                  Account Type
                </Label>
                <Select
                  value={bankForm.type || ""}
                  onValueChange={(value: "checking" | "savings") =>
                    setBankForm({ ...bankForm, type: value })
                  }
                >
                  <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="balance" className="text-sm font-medium text-gray-700">
                  Opening Balance
                </Label>
                <Input
                  id="balance"
                  type="number"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={bankForm.balance || ""}
                  onChange={(e) => setBankForm({ ...bankForm, balance: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowBankDialog(false)}
              className="rounded-lg border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveBank}
              disabled={isLoading || !bankForm.name || !bankForm.accountNumber}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : selectedBank ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cash Transaction Dialog */}
      <Dialog open={showCashDialog} onOpenChange={setShowCashDialog}>
        <DialogContent className="max-w-lg bg-white/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {selectedCash ? "Edit Cash Transaction" : "Add Cash Transaction"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedCash ? "Update transaction details" : "Add a new cash transaction"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="transactionType" className="text-sm font-medium text-gray-700">
                Transaction Type
              </Label>
              <Select
                value={cashForm.type || ""}
                onValueChange={(value: "sale" | "purchase" | "expense" | "income" | "adjustment") =>
                  setCashForm({ ...cashForm, type: value })
                }
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name/Party *
              </Label>
              <Input
                id="name"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={cashForm.name || ""}
                onChange={(e) => setCashForm({ ...cashForm, name: e.target.value })}
                placeholder="Enter name or party"
              />
            </div>
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                Amount *
              </Label>
              <Input
                id="amount"
                type="number"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={cashForm.amount || ""}
                onChange={(e) => setCashForm({ ...cashForm, amount: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={cashForm.date || ""}
                onChange={(e) => setCashForm({ ...cashForm, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={cashForm.description || ""}
                onChange={(e) => setCashForm({ ...cashForm, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCashDialog(false)}
              className="rounded-lg border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCash}
              disabled={isLoading || !cashForm.name || !cashForm.amount}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : selectedCash ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cheque Dialog */}
      <Dialog open={showChequeDialog} onOpenChange={setShowChequeDialog}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {selectedCheque ? "Edit Cheque" : "Add Cheque"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedCheque ? "Update cheque details" : "Add a new cheque transaction"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chequeType" className="text-sm font-medium text-gray-700">
                  Cheque Type
                </Label>
                <Select
                  value={chequeForm.type || ""}
                  onValueChange={(value: "issued" | "received") => setChequeForm({ ...chequeForm, type: value })}
                >
                  <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="chequeNumber" className="text-sm font-medium text-gray-700">
                  Cheque Number *
                </Label>
                <Input
                  id="chequeNumber"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={chequeForm.chequeNumber || ""}
                  onChange={(e) => setChequeForm({ ...chequeForm, chequeNumber: e.target.value })}
                  placeholder="Enter cheque number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partyName" className="text-sm font-medium text-gray-700">
                  Party Name *
                </Label>
                <Input
                  id="partyName"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={chequeForm.partyName || ""}
                  onChange={(e) => setChequeForm({ ...chequeForm, partyName: e.target.value })}
                  placeholder="Enter party name"
                />
              </div>
              <div>
                <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={chequeForm.bankName || ""}
                  onChange={(e) => setChequeForm({ ...chequeForm, bankName: e.target.value })}
                  placeholder="Enter bank name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={chequeForm.amount || ""}
                  onChange={(e) => setChequeForm({ ...chequeForm, amount: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select
                  value={chequeForm.status || ""}
                  onValueChange={(value: "pending" | "cleared" | "bounced" | "cancelled") =>
                    setChequeForm({ ...chequeForm, status: value })
                  }
                >
                  <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cleared">Cleared</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Cheque Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={chequeForm.date || ""}
                  onChange={(e) => setChequeForm({ ...chequeForm, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={chequeForm.dueDate || ""}
                  onChange={(e) => setChequeForm({ ...chequeForm, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={chequeForm.description || ""}
                onChange={(e) => setChequeForm({ ...chequeForm, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowChequeDialog(false)}
              className="rounded-lg border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCheque}
              disabled={isLoading || !chequeForm.chequeNumber || !chequeForm.partyName || !chequeForm.amount}
              className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : selectedCheque ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loan Account Dialog */}
      <Dialog open={showLoanDialog} onOpenChange={setShowLoanDialog}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {selectedLoan ? "Edit Loan Account" : "Add Loan Account"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedLoan ? "Update loan account details" : "Add a new loan account"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loanType" className="text-sm font-medium text-gray-700">
                  Loan Type
                </Label>
                <Select
                  value={loanForm.type || ""}
                  onValueChange={(value: "borrowing" | "lending") => setLoanForm({ ...loanForm, type: value })}
                >
                  <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrowing">Borrowing</SelectItem>
                    <SelectItem value="lending">Lending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="partyName" className="text-sm font-medium text-gray-700">
                  Party/Institution Name *
                </Label>
                <Input
                  id="partyName"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={loanForm.partyName || ""}
                  onChange={(e) => setLoanForm({ ...loanForm, partyName: e.target.value })}
                  placeholder="Enter party name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={loanForm.amount || ""}
                  onChange={(e) =>
                    setLoanForm({ ...loanForm, amount: Number.parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="interestRate" className="text-sm font-medium text-gray-700">
                  Interest Rate (%)
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={loanForm.interestRate || ""}
                  onChange={(e) => setLoanForm({ ...loanForm, interestRate: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="0.0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select
                  value={loanForm.status || ""}
                  onValueChange={(value: "active" | "completed" | "overdue" | "cancelled") =>
                    setLoanForm({ ...loanForm, status: value })
                  }
                >
                  <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={loanForm.startDate || ""}
                  onChange={(e) => setLoanForm({ ...loanForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={loanForm.dueDate || ""}
                  onChange={(e) => setLoanForm({ ...loanForm, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={loanForm.description || ""}
                onChange={(e) => setLoanForm({ ...loanForm, description: e.target.value })}
                placeholder="Enter loan description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowLoanDialog(false)}
              className="rounded-lg border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveLoan}
              disabled={isLoading || !loanForm.partyName || !loanForm.amount}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : selectedLoan ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 