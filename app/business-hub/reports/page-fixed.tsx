"use client"

import { useState, useMemo, useEffect } from "react"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  BarChart3,
  Search,
  Plus,
  MoreHorizontal,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  FileText,
  Eye,
  Edit,
  Trash2,
  Settings,
  Building,
  Users,
  Package,
  CreditCard,
  Receipt,
  PiggyBank,
  Activity,
  ArrowUpRight,
} from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectAllSales } from "@/lib/store/slices/salesSlice"
import { selectAllPurchases } from "@/lib/store/slices/purchasesSlice"
import { selectAllParties } from "@/lib/store/slices/partiesSlice"
import { selectAllItems } from "@/lib/store/slices/itemsSlice"
import { selectDashboardMetrics, selectFinancialMetrics } from "@/lib/store/slices/dashboardSlice"
import { selectGeneralSettings } from "@/lib/store/slices/settingsSlice"
import { 
  generateReport,
  generateTransactionSummary,
  generateSalesReport,
  generatePurchasesReport,
  generatePartyStatement,
  generateCashFlowReport,
  generateProfitLossReport,
  selectCurrentReport,
  selectReportsLoading,
  selectReportsError
} from "@/lib/store/slices/reportsSlice"
import { showNotification } from "@/lib/store/slices/uiSlice"
import { fetchSales } from "@/lib/store/slices/salesSlice"
import { fetchPurchases } from "@/lib/store/slices/purchasesSlice"
import { fetchParties } from "@/lib/store/slices/partiesSlice"
import { fetchItems } from "@/lib/store/slices/itemsSlice"
import { useCurrency } from "@/lib/currency-manager"

interface Transaction {
  id: string
  date: string
  transactionType: "Sale" | "Purchase"
  invoiceNo: string
  partyName: string
  amount: number
  status: "completed" | "pending" | "cancelled"
}

interface ReportSummary {
  totalSales: number
  received: number
  balance: number
  percentageChange: number
  isIncrease: boolean
}

// Report categories configuration
const reportCategories = [
  {
    title: "Sale Reports",
    icon: Activity,
    items: [
      { name: "Sale", key: "sale" },
      { name: "Sale Return", key: "sale-return" },
    ],
  },
  {
    title: "Purchase Reports",
    icon: Package,
    items: [
      { name: "Purchase", key: "purchase" },
      { name: "Purchase Return", key: "purchase-return" },
    ],
  },
  {
    title: "Cash & Bank Report",
    icon: Building,
    items: [
      { name: "Daybook", key: "daybook" },
      { name: "Cash & Bank Summary", key: "cash-bank-summary" },
    ],
  },
  {
    title: "Financial Report",
    icon: FileText,
    items: [
      { name: "Profit And Loss", key: "profit-loss" },
      { name: "Bill Wise Profit", key: "bill-wise-profit" },
      { name: "Cash Flow", key: "cash-flow" },
      { name: "Trial Balance Report", key: "trial-balance", badge: "NEW" },
      { name: "Balance Sheet", key: "balance-sheet" },
    ],
  },
  {
    title: "Party Report",
    icon: Users,
    items: [
      { name: "Party Statement", key: "party-statement" },
      { name: "Party wise Profit & Loss", key: "party-wise-profit" },
      { name: "All Parties", key: "all-parties" },
      { name: "Party Report By Item", key: "party-report-item" },
      { name: "Sale Purchase By Party", key: "sale-purchase-party" },
      { name: "Sale Purchase By Party Group", key: "sale-purchase-party-group" },
    ],
  },
  {
    title: "Item / Stock Report",
    icon: Package,
    items: [
      { name: "Stock Summary", key: "stock-summary" },
      { name: "Item Report By Party", key: "item-report-party" },
      { name: "Item Wise Profit And Loss", key: "item-wise-profit" },
      { name: "Low Stock Summary", key: "low-stock-summary" },
      { name: "Stock Detail", key: "stock-detail" },
      { name: "Item Detail", key: "item-detail" },
      { name: "Sale/ Purchase Report By Item Category", key: "sale-purchase-item-category" },
      { name: "Stock Summary Report By Item Category", key: "stock-summary-item-category" },
      { name: "Item Wise Discount", key: "item-wise-discount" },
    ],
  },
  {
    title: "Business Status",
    icon: Building,
    items: [
      { name: "Bank Statement", key: "bank-statement" },
      { name: "Discount Report", key: "discount-report" },
    ],
  },
  {
    title: "Taxes",
    icon: Receipt,
    items: [
      { name: "Tax Report", key: "tax-report" },
      { name: "Tax Rate Report", key: "tax-rate-report" },
    ],
  },
  {
    title: "Expense Report",
    icon: CreditCard,
    items: [
      { name: "Expense", key: "expense" },
      { name: "Expense Category Report", key: "expense-category" },
      { name: "Expense Item Report", key: "expense-item" },
    ],
  },
  {
    title: "Sale Order Report",
    icon: Activity,
    items: [
      { name: "Sale Orders", key: "sale-orders" },
      { name: "Sale Order Items", key: "sale-order-items" },
    ],
  },
  {
    title: "Loan Accounts",
    icon: PiggyBank,
    items: [{ name: "Loan Statement", key: "loan-statement" }],
  },
]

export default function ReportsPage() {
  const dispatch = useAppDispatch()
  const sales = useAppSelector(selectAllSales)
  const purchases = useAppSelector(selectAllPurchases)
  const parties = useAppSelector(selectAllParties)
  const items = useAppSelector(selectAllItems)
  const dashboardMetrics = useAppSelector(selectDashboardMetrics)
  const financialMetrics = useAppSelector(selectFinancialMetrics)
  const generalSettings = useAppSelector(selectGeneralSettings)
  const currentReport = useAppSelector(selectCurrentReport)
  const reportsLoading = useAppSelector(selectReportsLoading)
  const reportsError = useAppSelector(selectReportsError)
  const [activeTab, setActiveTab] = useState("reports")
  const [selectedReport, setSelectedReport] = useState("transaction-summary")
  const [dateRange, setDateRange] = useState("this-month")
  const [firmFilter, setFirmFilter] = useState("all-firms")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Transaction>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedParty, setSelectedParty] = useState<any>(null)
  const [showPartyDetails, setShowPartyDetails] = useState(false)
  const { formatAmountWithSymbol } = useCurrency()

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateForReport = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Map frontend report types to API supported types
  const mapReportType = (frontendType: string): string => {
    const reportTypeMap: { [key: string]: string } = {
      // Sales related
      'sale': 'sales-report',
      'sales-report': 'sales-report',
      'sale-return': 'sales-report',
      
      // Purchase related
      'purchase': 'purchases-report',
      'purchases-report': 'purchases-report',
      'purchase-return': 'purchases-report',
      
      // Party related
      'party-statement': 'party-statement',
      'all-parties': 'party-statement',
      'party-wise-profit': 'party-statement',
      'party-report-item': 'party-statement',
      'sale-purchase-party': 'party-statement',
      'sale-purchase-party-group': 'party-statement',
      
      // Financial reports
      'cash-flow': 'cash-flow',
      'profit-loss': 'profit-loss',
      'bill-wise-profit': 'profit-loss',
      'trial-balance': 'profit-loss',
      'balance-sheet': 'profit-loss',
      
      // Transaction summary (default for many types)
      'transaction-summary': 'transaction-summary',
      'bank-statement': 'transaction-summary',
      'discount-report': 'transaction-summary',
      'tax-report': 'transaction-summary',
      'tax-rate-report': 'transaction-summary',
      
      // Stock/Item related (map to transaction summary for now)
      'stock-summary': 'transaction-summary',
      'item-report-party': 'transaction-summary',
      'item-wise-profit': 'transaction-summary',
      'low-stock-summary': 'transaction-summary',
      'stock-detail': 'transaction-summary',
      'item-detail': 'transaction-summary',
      'sale-purchase-item-category': 'transaction-summary',
      'stock-summary-item-category': 'transaction-summary',
      'item-wise-discount': 'transaction-summary',
      
      // Other types (map to transaction summary)
      'expense': 'transaction-summary',
      'expense-category': 'transaction-summary',
      'expense-item': 'transaction-summary',
      'sale-orders': 'transaction-summary',
      'sale-order-items': 'transaction-summary',
      'loan-statement': 'transaction-summary',
      'daybook': 'transaction-summary',
      'cash-bank-summary': 'transaction-summary'
    }
    
    return reportTypeMap[frontendType] || 'transaction-summary'
  }

  // Phone-based report generation functions
  const handleGenerateReport = async (reportType: string, startDate?: string, endDate?: string) => {
    const phoneNumber = generalSettings?.phoneNumber
    if (!phoneNumber) {
      dispatch(showNotification({
        message: "Phone number not configured. Please update your settings.",
        type: "error",
        category: "report",
        priority: "high"
      }))
      return
    }

    const mappedReportType = mapReportType(reportType)

    try {
      switch (mappedReportType) {
        case 'transaction-summary':
          await dispatch(generateTransactionSummary({ phoneNumber, startDate, endDate })).unwrap()
          break
        case 'sales-report':
          await dispatch(generateSalesReport({ phoneNumber, startDate, endDate })).unwrap()
          break
        case 'purchases-report':
          await dispatch(generatePurchasesReport({ phoneNumber, startDate, endDate })).unwrap()
          break
        case 'party-statement':
          await dispatch(generatePartyStatement({ phoneNumber, startDate, endDate })).unwrap()
          break
        case 'cash-flow':
          await dispatch(generateCashFlowReport({ phoneNumber, startDate, endDate })).unwrap()
          break
        case 'profit-loss':
          await dispatch(generateProfitLossReport({ phoneNumber, startDate, endDate })).unwrap()
          break
        default:
          await dispatch(generateReport({ 
            phoneNumber, 
            reportType: mappedReportType, 
            startDate, 
            endDate,
            title: getReportDisplayName()
          })).unwrap()
          break
      }
      
      dispatch(showNotification({
        message: "Report generated successfully!",
        type: "success",
        category: "report",
        priority: "low"
      }))
    } catch (error) {
      console.error('Failed to generate report:', error)
      dispatch(showNotification({
        message: `Failed to generate report: ${error}`,
        type: "error",
        category: "report",
        priority: "high"
      }))
    }
  }

  const getReportDisplayName = () => {
    const report = reportCategories.flatMap((cat) => cat.items).find((item) => item.key === selectedReport)
    return report ? report.name : "Report"
  }

  // Transform sales and purchases into transactions for display
  const transactions: Transaction[] = useMemo(() => {
    // Use all sales and purchases as they should already be phone-filtered from the API
    const salesTransactions: Transaction[] = sales.map((sale) => ({
      id: sale.id,
      date: sale.createdAt || sale.created_at,
      transactionType: "Sale",
      invoiceNo: sale.invoiceNumber || sale.invoice_number,
      partyName: sale.customerName || sale.party_name || 'Unknown Customer',
      amount: sale.total || sale.total_amount,
      status: "completed", // Assuming sales are completed
    }))

    const purchaseTransactions: Transaction[] = purchases.map((purchase) => ({
      id: purchase.id,
      date: purchase.created_at || new Date().toISOString(),
      transactionType: "Purchase",
      invoiceNo: purchase.bill_number || `PUR-${purchase.id.slice(-6)}`,
      partyName: purchase.supplier_name || 'Unknown Supplier',
      amount: purchase.total || 0,
      status: "completed", // Assuming purchases are completed
    }))

    return [...salesTransactions, ...purchaseTransactions]
  }, [sales, purchases])

  // Calculate summary data from current report or fallback to local data
  const reportSummary: ReportSummary = useMemo(() => {
    // Use API report data if available
    if (currentReport?.data?.summary) {
      const summary = currentReport.data.summary
      return {
        totalSales: summary.totalSales || 0,
        received: summary.totalSales || 0, // For now, assume all sales are received
        balance: 0, // Balance would be totalSales - received
        percentageChange: 100, // TODO: Calculate from previous period
        isIncrease: true,
      }
    }
    
    // Fallback to local transaction data (already phone-filtered from API)
    const totalSales = sales.reduce((sum, sale) => sum + (sale.total || sale.total_amount || 0), 0)
    const totalPurchases = purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0)
    const received = totalSales * 0.8 // Estimate 80% received
    const balance = totalSales - received

    return {
      totalSales,
      received,
      balance,
      percentageChange: 100, // Mock data
      isIncrease: true,
    }
  }, [currentReport, sales, purchases])

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesSearch =
        (transaction.partyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (transaction.invoiceNo || '').includes(searchTerm) ||
        (transaction.transactionType?.toLowerCase() || '').includes(searchTerm.toLowerCase())

      const matchesReport =
        selectedReport === "all-transactions" ||
        selectedReport === "daybook" ||
        (selectedReport === "sale" && transaction.transactionType === "Sale") ||
        (selectedReport === "purchase" && transaction.transactionType === "Purchase")

      return matchesSearch && matchesReport
    })

    // Sort transactions
    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return filtered
  }, [transactions, searchTerm, selectedReport, sortField, sortDirection])

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Print report function
  const handlePrintReport = () => {
    const printContent = `
      <html>
      <head>
        <title>${getReportDisplayName()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
          .summary-item { text-align: center; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${getReportDisplayName()}</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>Phone: ${generalSettings?.phoneNumber || 'Not configured'}</p>
        </div>
        <div class="summary">
          <div class="summary-item"><strong>Total Sales:</strong> ${formatAmountWithSymbol(reportSummary.totalSales)}</div>
          <div class="summary-item"><strong>Received:</strong> ${formatAmountWithSymbol(reportSummary.received)}</div>
          <div class="summary-item"><strong>Balance:</strong> ${formatAmountWithSymbol(reportSummary.balance)}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Invoice No</th>
              <th>Party</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions
              .map(
                (t) => `
              <tr>
                <td>${formatDate(t.date)}</td>
                <td>${t.transactionType}</td>
                <td>${t.invoiceNo}</td>
                <td>${t.partyName}</td>
                <td>${formatAmountWithSymbol(t.amount)}</td>
                <td>${t.status}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }
    }
    
    dispatch(showNotification({ 
      message: "Report sent to printer!", 
      type: "success",
      category: "report",
      actionUrl: "/business-hub/reports",
      priority: "low"
    }))
  }

  const getReportTitle = () => {
    const report = reportCategories.flatMap((cat) => cat.items).find((item) => item.key === selectedReport)
    return report ? report.name : "Sale Invoices"
  }

  useEffect(() => {
    const phoneNumber = generalSettings?.phoneNumber
    if (phoneNumber) {
      dispatch(fetchSales({}))
      dispatch(fetchPurchases())
      dispatch(fetchParties({}))
      dispatch(fetchItems())
      
      // Generate initial report
      handleGenerateReport(selectedReport)
    }
  }, [dispatch, generalSettings?.phoneNumber])

  // Generate report when selection changes
  useEffect(() => {
    if (generalSettings?.phoneNumber) {
      handleGenerateReport(selectedReport)
    }
  }, [selectedReport])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="ml-16 flex min-h-screen">
        {/* Reports Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-lg">
          <div className="p-4 border-b border-gray-200/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10 bg-gray-50/50 border-gray-200/50 rounded-lg"
                placeholder="Search Reports"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-120px)]">
            {reportCategories.map((category) => (
              <div key={category.title} className="border-b border-gray-200/50">
                <div className="p-3 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <category.icon className="h-4 w-4" />
                    {category.title}
                  </div>
                </div>
                <div className="py-1">
                  {category.items.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setSelectedReport(item.key)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between ${
                        selectedReport === item.key ? "bg-blue-100 text-blue-700 border-r-2 border-blue-500" : ""
                      }`}
                    >
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge className="bg-red-500 text-white text-xs px-1 py-0 h-4">{item.badge}</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Reports Area */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header Controls */}
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-gray-700">Date Range:</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-40 rounded-lg border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="this-week">This Week</SelectItem>
                        <SelectItem value="last-week">Last Week</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="this-year">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <Input type="date" className="w-36 rounded-lg border-gray-200" defaultValue="2025-07-01" />
                    <span className="text-sm text-gray-500">To</span>
                    <Input type="date" className="w-36 rounded-lg border-gray-200" defaultValue="2025-07-31" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-gray-700">Phone:</Label>
                    <span className="text-sm text-blue-600 font-medium">
                      {generalSettings?.phoneNumber || 'Not configured'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">Total Sales Amount</h3>
                      <div className="flex items-center gap-1 text-green-600">
                        <span className="text-sm font-medium">{reportSummary.percentageChange}%</span>
                        {reportSummary.isIncrease ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{formatAmountWithSymbol(reportSummary.totalSales)}</p>
                    <p className="text-sm text-gray-500">vs last month</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Received</h3>
                    <p className="text-xl font-bold text-blue-600">{formatAmountWithSymbol(reportSummary.received)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Balance</h3>
                    <p className="text-xl font-bold text-orange-600">{formatAmountWithSymbol(reportSummary.balance)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Report Display */}
            {currentReport && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    {currentReport.title}
                    <Badge className="bg-green-100 text-green-800">Generated</Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Generated on {formatDate(currentReport.generatedAt)}
                    {currentReport.dateRange && ` • ${formatDate(currentReport.dateRange.startDate)} to ${formatDate(currentReport.dateRange.endDate)}`}
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Report Content Based on Type */}
                  {currentReport.type === 'transaction-summary' && currentReport.data && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total Sales</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatAmountWithSymbol(currentReport.data.summary?.totalSales || 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total Purchases</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {formatAmountWithSymbol(currentReport.data.summary?.totalPurchases || 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Net Profit</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatAmountWithSymbol(currentReport.data.summary?.netProfit || 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <p className="text-sm text-gray-600">Transactions</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {currentReport.data.summary?.transactionCount || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Display for other report types */}
                  {['sales-report', 'purchases-report', 'party-statement', 'cash-flow', 'profit-loss'].includes(currentReport.type) && currentReport.data && (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Report Type: {currentReport.type.replace('-', ' ').toUpperCase()}</p>
                        <p className="text-lg font-medium text-gray-700">
                          Data available for phone: {generalSettings?.phoneNumber}
                        </p>
                      </div>
                      
                      {/* Display basic metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(currentReport.data).map(([key, value]) => {
                          if (typeof value === 'number' && value > 0) {
                            return (
                              <div key={key} className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="text-xl font-bold text-blue-600">
                                  {key.toLowerCase().includes('amount') || key.toLowerCase().includes('total') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('price')
                                    ? formatAmountWithSymbol(value)
                                    : value.toLocaleString()
                                  }
                                </p>
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {reportsError && (
              <Card className="bg-red-50/70 backdrop-blur-xl border-red-200/50 shadow-lg mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <p className="font-medium">Report Generation Error</p>
                  </div>
                  <p className="text-red-600 text-sm mt-1">{reportsError}</p>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {reportsLoading && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                      Generating {getReportDisplayName()} report...
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transaction Table */}
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">{getReportTitle()}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrintReport}
                      className="flex items-center gap-2 hover:bg-gray-50"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort("date")}
                        >
                          Date
                          <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort("transactionType")}
                        >
                          Type
                          <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead>Invoice No</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort("partyName")}
                        >
                          Party
                          <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort("amount")}
                        >
                          Amount
                          <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-gray-50/50">
                          <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                transaction.transactionType === "Sale"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }
                            >
                              {transaction.transactionType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{transaction.invoiceNo}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => {
                                setSelectedParty(transaction)
                                setShowPartyDetails(true)
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {transaction.partyName}
                            </button>
                          </TableCell>
                          <TableCell className="font-medium">{formatAmountWithSymbol(transaction.amount)}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                transaction.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : transaction.status === "pending"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <Printer className="h-4 w-4" />
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
          </div>
        </div>
      </div>
    </div>
  )
}
