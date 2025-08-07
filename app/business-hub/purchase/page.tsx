"use client"

import { useState, useEffect } from "react"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Search,
  MoreHorizontal,
  Printer,
  Send,
  Download,
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Truck,
  ArrowUpRight,
  Sparkles,
  Activity,
  Eye,
  Building,
  User,
  RefreshCw,
  CheckCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ViewDialog } from "@/components/ViewDialog"
import { generatePurchaseInvoicePDF } from "@/lib/purchase-invoice-generator"
import { useCurrency } from "@/lib/currency-manager"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectAllPurchases, addPurchase, updatePurchase, deletePurchase, selectPurchasesStats, fetchPurchases } from "@/lib/store/slices/purchasesSlice"
import { selectAllPurchaseReturns, fetchPurchaseReturns, createPurchaseReturn, updatePurchaseReturn, deletePurchaseReturn, selectPurchaseReturnsStats } from "@/lib/store/slices/purchaseReturnsSlice"
import { selectAllExpenses, fetchExpenses, createExpense, updateExpense, deleteExpense, selectExpensesStats } from "@/lib/store/slices/expensesSlice"
import { showNotification } from "@/lib/store/slices/uiSlice"
import { selectGeneralSettings } from "@/lib/store/slices/settingsSlice"
import { printPurchaseOrder, printExpenseReceipt } from "@/lib/universal-print"
import AdvancedPurchaseDialog from "@/components/AdvancedPurchaseDialog"
import PurchaseReturnDialog from "@/components/PurchaseReturnDialog"
import ExpenseDialog from "@/components/ExpenseDialog"
import LoadingState from "@/components/LoadingState"

interface PurchaseOrder {
  id: string
  billNumber: string
  date: string
  expectedDate: string
  supplierName: string
  supplierPhone: string
  supplierEmail: string
  supplierAddress: string
  supplierGSTIN?: string
  items: PurchaseItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount: number
  total: number
  status: "draft" | "ordered" | "received" | "paid" | "cancelled"
  paymentStatus: "pending" | "partial" | "paid"
  paymentMethod: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface PurchaseItem {
  id: string
  name: string
  description?: string
  quantity: number
  rate: number
  amount: number
  taxRate: number
  taxAmount: number
}

export default function PurchasePage() {
  const dispatch = useAppDispatch()
  const purchases = useAppSelector(selectAllPurchases)
  const purchaseReturns = useAppSelector(selectAllPurchaseReturns)
  const expenses = useAppSelector(selectAllExpenses)
  const generalSettings = useAppSelector(selectGeneralSettings)
  const [activeTab, setActiveTab] = useState("purchases")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAddReturnDialog, setShowAddReturnDialog] = useState(false)
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null)
  const [selectedReturn, setSelectedReturn] = useState<any>(null)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    // Only fetch data if phone number is available
    if (generalSettings.phoneNumber && generalSettings.phoneNumber.trim() !== '') {
      console.log('📱 Phone number available, fetching purchase data...')
      dispatch(fetchPurchases())
      dispatch(fetchPurchaseReturns())
      dispatch(fetchExpenses())
    } else {
      console.log('⏳ Waiting for phone number before fetching purchase data...')
    }
  }, [dispatch, generalSettings.phoneNumber])

  const filteredPurchases = purchases.filter((purchase) => {
    const supplierName = purchase.supplier?.party_name || purchase.supplier_name || "";
    const matchesSearch = purchase.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || purchase.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const filteredReturns = purchaseReturns.filter((returnItem) => {
    const matchesSearch = returnItem.return_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.supplier?.party_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || returnItem.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.expense_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.party?.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.party_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || expense.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const openDialog = (purchase?: any) => {
    setSelectedPurchase(purchase || null)
    setShowAddDialog(true)
  }

  const openReturnDialog = (returnItem?: any) => {
    setSelectedReturn(returnItem || null)
    setShowAddReturnDialog(true)
  }

  const openExpenseDialog = (expense?: any) => {
    setSelectedExpense(expense || null)
    setShowAddExpenseDialog(true)
  }

  const handleDelete = async (id: string, type: 'purchase' | 'return' | 'expense') => {
    if (!confirm("Are you sure you want to delete this item?")) return
    setDeletingId(id)
    try {
      if (type === 'purchase') {
        await dispatch(deletePurchase(id)).unwrap()
        dispatch(showNotification({ 
          message: "Purchase deleted successfully!", 
          type: "success",
          category: "purchase",
          actionUrl: "/business-hub/purchase",
          priority: "medium"
        }))
      } else if (type === 'return') {
        await dispatch(deletePurchaseReturn(id)).unwrap()
        dispatch(showNotification({ 
          message: "Purchase return deleted successfully!", 
          type: "success",
          category: "purchase",
          actionUrl: "/business-hub/purchase",
          priority: "medium"
        }))
      } else if (type === 'expense') {
        await dispatch(deleteExpense(id)).unwrap()
        dispatch(showNotification({ 
          message: "Expense deleted successfully!", 
          type: "success",
          category: "expense",
          actionUrl: "/business-hub/purchase",
          priority: "medium"
        }))
      }
    } catch (error) {
      console.error("Failed to delete:", error)
      dispatch(showNotification({ 
        message: "Failed to delete item", 
        type: "error",
        category: type === 'expense' ? 'expense' : 'purchase',
        priority: "high"
      }))
    } finally {
      setDeletingId(null)
    }
  }

  const { formatAmountWithSymbol } = useCurrency()

  const generatePurchaseReport = () => {
    generatePurchaseInvoicePDF(filteredPurchases)
    dispatch(showNotification({ 
      message: "Purchase report generated!", 
      type: "success",
      category: "purchase",
      actionUrl: "/business-hub/purchase",
      priority: "low"
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "ordered":
        return "bg-blue-100 text-blue-800"
      case "received":
        return "bg-green-100 text-green-800"
      case "paid":
        return "bg-purple-100 text-purple-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "partial":
        return "bg-orange-100 text-orange-800"
      case "paid":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative">
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
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Truck className="h-4 w-4 text-white" />
                    </div>
                    Purchase Management
                  </h1>
                  <p className="text-gray-600">Manage purchases, returns, and expenses</p>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative bg-white rounded-xl p-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-12 pr-4 py-3 w-96 bg-gray-50/50 border-gray-200/50 rounded-lg focus:bg-white transition-all duration-200"
                      placeholder="Search purchases, returns, expenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => openDialog()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Purchase
                </Button>
                <Button
                  onClick={() => openReturnDialog()}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Return
                </Button>
                <Button
                  onClick={() => openExpenseDialog()}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-transparent flex items-center"
                  onClick={async () => {
                    setIsLoading(true)
                    await Promise.all([
                      dispatch(fetchPurchases()),
                      dispatch(fetchPurchaseReturns()),
                      dispatch(fetchExpenses())
                    ])
                    setIsLoading(false)
                  }}
                  title="Refresh"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1${isLoading ? " animate-spin" : ""}`} />
                  Refresh
                </Button>
                <DropdownMenu>
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
                    <DropdownMenuItem onClick={generatePurchaseReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Printer className="h-4 w-4 mr-2" />
                      Print Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <Tabs defaultValue="purchases" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-xl border-white/20 shadow-lg rounded-2xl p-2">
              <TabsTrigger
                value="purchases"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                Purchases ({purchases.length})
              </TabsTrigger>
              <TabsTrigger
                value="returns"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                Returns ({purchaseReturns.length})
              </TabsTrigger>
              <TabsTrigger
                value="expenses"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                Expenses ({expenses.length})
              </TabsTrigger>
            </TabsList>

            {/* Purchases Tab */}
            <TabsContent value="purchases" className="space-y-8">
              {/* Enhanced Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Total Purchases</p>
                        <p className="text-2xl font-bold text-gray-900">{purchases.length}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <ArrowUpRight className="h-3 w-3 text-blue-500" />
                          {purchases.filter(p => p.status === 'received').length} received
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Truck className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatAmountWithSymbol(purchases.reduce((sum, p) => sum + (p.total || 0), 0))}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <DollarSign className="h-3 w-3 text-green-500" />
                          Average: {formatAmountWithSymbol(purchases.length > 0 ? purchases.reduce((sum, p) => sum + (p.total || 0), 0) / purchases.length : 0)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Pending Orders</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {purchases.filter(p => p.status === 'ordered').length}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Activity className="h-3 w-3 text-yellow-500" />
                          {purchases.filter(p => p.payment_status === 'pending').length} pending payment
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Calendar className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Paid Orders</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {purchases.filter(p => p.payment_status === 'paid').length}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {formatAmountWithSymbol(purchases.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + (p.total || 0), 0))} total paid
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <CreditCard className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Filters and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-48 rounded-xl border-gray-200 bg-white/50 backdrop-blur-xl">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="ordered">Ordered</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-white/50 backdrop-blur-xl"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
                <Button
                  onClick={() => openDialog()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Purchase
                </Button>
              </div>

              {/* Enhanced Purchases Table */}
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Purchases ({filteredPurchases.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bill Number</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment Status</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPurchases.map((purchase) => (
                          <TableRow key={purchase.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="font-medium">{purchase.bill_number}</TableCell>
                            <TableCell>{formatDate(purchase.created_at || '')}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-semibold">
                                    {(purchase.supplier?.party_name || purchase.supplier_name || "No Supplier").split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{purchase.supplier?.party_name || purchase.supplier_name || "No Supplier"}</p>
                                  <p className="text-xs text-gray-600">{purchase.supplier?.phone || ""}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold">{formatAmountWithSymbol(purchase.total || 0)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(purchase.status || 'draft')}>
                                {purchase.status || 'draft'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPaymentStatusColor(purchase.payment_status || 'pending')}>
                                {purchase.payment_status || 'pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>{purchase.payment_method || "Not specified"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => printPurchaseOrder(purchase)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-green-50 hover:text-green-600"
                                  title="Print Purchase Order"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => openDialog(purchase)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-blue-50 hover:text-blue-600"
                                  title="Edit Purchase"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(purchase.id, 'purchase')}
                                  size="sm"
                                  variant="ghost"
                                  disabled={deletingId === purchase.id}
                                  className="hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                  title="Delete Purchase"
                                >
                                  {deletingId === purchase.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Returns Tab */}
            <TabsContent value="returns" className="space-y-8">
              {/* Returns Table */}
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Purchase Returns ({filteredReturns.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Return Number</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReturns.map((returnItem) => (
                          <TableRow key={returnItem.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="font-medium">{returnItem.return_number}</TableCell>
                            <TableCell>{formatDate(returnItem.date)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-semibold">
                                    {returnItem.supplier_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || returnItem.supplier?.party_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{returnItem.supplier_name || returnItem.supplier?.party_name || "No Supplier"}</p>
                                  <p className="text-xs text-gray-600">{returnItem.supplier?.phone || ""}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold">{formatAmountWithSymbol(returnItem.total || 0)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(returnItem.status || 'draft')}>
                                {returnItem.status || 'draft'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPaymentStatusColor(returnItem.payment_status || 'pending')}>
                                {returnItem.payment_status || 'pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => openReturnDialog(returnItem)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-red-50 hover:text-red-600"
                                  title="Edit Return"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(returnItem.id, 'return')}
                                  size="sm"
                                  variant="ghost"
                                  disabled={deletingId === returnItem.id}
                                  className="hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                  title="Delete Return"
                                >
                                  {deletingId === returnItem.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Expenses Tab */}
            <TabsContent value="expenses" className="space-y-8">
              {/* Expenses Table */}
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Expenses ({filteredExpenses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Expense Number</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Related Party</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExpenses.map((expense) => (
                          <TableRow key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="font-medium">{expense.expense_number}</TableCell>
                            <TableCell>{formatDate(expense.date)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {expense.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {expense.party || expense.party_name ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold">
                                      {(expense.party?.party_name || expense.party_name || 'N/A').split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{expense.party?.party_name || expense.party_name}</p>
                                    <p className="text-xs text-gray-600">{expense.party?.phone || 'No phone'}</p>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500">No party</span>
                              )}
                            </TableCell>
                            <TableCell className="font-bold">{formatAmountWithSymbol(expense.amount || 0)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(expense.status || 'paid')}>
                                {expense.status || 'paid'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => printExpenseReceipt(expense)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-green-50 hover:text-green-600"
                                  title="Print Expense Receipt"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => openExpenseDialog(expense)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-orange-50 hover:text-orange-600"
                                  title="Edit Expense"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(expense.id, 'expense')}
                                  size="sm"
                                  variant="ghost"
                                  disabled={deletingId === expense.id}
                                  className="hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                  title="Delete Expense"
                                >
                                  {deletingId === expense.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Enhanced Add/Edit Purchase Order Dialog */}
      <AdvancedPurchaseDialog open={showAddDialog} onOpenChange={setShowAddDialog} purchaseToEdit={selectedPurchase} />

      {/* Purchase Return Dialog */}
      <PurchaseReturnDialog open={showAddReturnDialog} onOpenChange={setShowAddReturnDialog} returnToEdit={selectedReturn} />

      {/* Expense Dialog */}
      <ExpenseDialog open={showAddExpenseDialog} onOpenChange={setShowAddExpenseDialog} expenseToEdit={selectedExpense} />
    </div>
  )
}
