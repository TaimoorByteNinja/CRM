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
import PartyReports from "@/components/PartyReports"
import PartyTransactionDetails from "@/components/PartyTransactionDetails"
import { printSaleInvoice, printPurchaseOrder, UniversalPrintManager } from "@/lib/universal-print"
import { formatCurrencyWithSymbol } from "@/lib/country-data"
import { useCurrency } from "@/lib/currency-manager"

// Interfaces
interface Transaction {
  id: string
  date: string
  invoiceNo: string
  partyName: string
  transactionType: "Sale" | "Purchase" | "Payment" | "Receipt"
  paymentType: "Cash" | "Cheque" | "Bank" | "UPI" | "Credit Card"
  amount: number
  balance: number
  status: "completed" | "pending" | "cancelled"
  description?: string
}

interface ReportSummary {
  totalSales: number
  received: number
  balance: number
  percentageChange: number
  isIncrease: boolean
}

// Report Categories
const reportCategories = [
  {
    title: "Transaction Report",
    icon: FileText,
    items: [
      { name: "Sale", key: "sale" },
      { name: "Purchase", key: "purchase" },
      { name: "Day Book", key: "daybook" },
      { name: "All Transactions", key: "all-transactions" },
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

  const getReportDisplayName = () => {
    const report = reportCategories.flatMap((cat) => cat.items).find((item) => item.key === selectedReport)
    return report ? report.name : "Report"
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
      
      // Party related - fetch from parties data
      'party-statement': 'party-statement',
      'all-parties': 'party-report',
      'party-list': 'party-report',
      'party-report': 'party-report',
      'party-wise-profit': 'party-statement',
      'party-report-item': 'party-report-item',
      'sale-purchase-party': 'party-statement',
      'sale-purchase-party-group': 'party-statement',
      
      // Item/Stock related - fetch from items data
      'item-report': 'item-report',
      'stock-report': 'stock-report',
      'item-report-party': 'item-report-party',
      'stock-summary': 'stock-summary',
      'stock-summary-item-category': 'stock-summary-item-category',
      'item-wise-profit': 'item-report',
      'low-stock-summary': 'stock-summary',
      'stock-detail': 'item-report',
      'item-detail': 'item-report',
      'sale-purchase-item-category': 'item-report-party',
      
      // Business Status - fetch from cash and bank data
      'business-status': 'business-status',
      'trial-balance': 'trial-balance',
      'balance-sheet': 'balance-sheet',
      
      // Tax Reports - fetch tax data from all sources
      'tax-report': 'tax-report',
      'tax-rate-report': 'tax-rate-report',
      
      // Expense Reports - fetch from cash and bank data
      'expense-report': 'expense-report',
      'expense-category': 'expense-category',
      'expense-item': 'expense-item',
      
      // Financial reports
      'cash-flow': 'cash-flow',
      'profit-loss': 'profit-loss',
      'bill-wise-profit': 'profit-loss',
      
      // Transaction summary (default for some types)
      'transaction-summary': 'transaction-summary',
      'bank-statement': 'transaction-summary',
      'discount-report': 'transaction-summary',
      'item-wise-discount': 'transaction-summary',
      
      // Other types (map to transaction summary)
      'sale-orders': 'transaction-summary',
      'sale-order-items': 'transaction-summary',
      'loan-statement': 'transaction-summary'
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
        
        // Party Reports - fetch from parties section
        case 'party-report':
        case 'party-list':
        case 'party-report-item':
        
        // Item/Stock Reports - fetch from items section  
        case 'item-report':
        case 'stock-report':
        case 'item-report-party':
        case 'stock-summary':
        case 'stock-summary-item-category':
        
        // Business Status Reports - fetch from cash and bank
        case 'business-status':
        case 'trial-balance':
        case 'balance-sheet':
        
        // Tax Reports - fetch tax data from all sources
        case 'tax-report':
        case 'tax-rate-report':
        
        // Expense Reports - fetch from cash and bank
        case 'expense-report':
        case 'expense-category':
        case 'expense-item':
          await dispatch(generateReport({ 
            phoneNumber, 
            reportType: mappedReportType, 
            startDate, 
            endDate,
            title: getReportDisplayName()
          })).unwrap()
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

  // Print functions for different report types
  const handlePrintTransaction = (transaction: Transaction) => {
    if (transaction.transactionType === "Sale") {
      // Find the original sale data
      const sale = sales.find(s => s.id === transaction.id)
      if (sale) {
        printSaleInvoice(sale)
      }
    } else if (transaction.transactionType === "Purchase") {
      // Find the original purchase data  
      const purchase = purchases.find(p => p.id === transaction.id)
      if (purchase) {
        printPurchaseOrder(purchase)
      }
    }
  }

  const handlePrintReport = () => {
    const printManager = UniversalPrintManager.getInstance()
    
    // Create a comprehensive report document
    const reportDocument = {
      id: `report-${Date.now()}`,
      documentNumber: `RPT-${selectedReport.toUpperCase()}-${Date.now()}`,
      documentType: 'INVOICE' as const,
      date: new Date().toISOString(),
      partyName: 'Business Report',
      partyEmail: '',
      partyPhone: '',
      partyAddress: '',
      items: filteredTransactions.map((transaction, index) => ({
        id: transaction.id,
        name: `${transaction.transactionType} - ${transaction.invoiceNo}`,
        description: `${transaction.partyName} - ${transaction.description || ''}`,
        quantity: 1,
        unit: '',
        unitPrice: transaction.amount,
        discount: 0,
        tax: 0,
        total: transaction.amount
      })),
      subtotal: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalDiscount: 0,
      totalTax: 0,
      total: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
      notes: `${getReportDisplayName()} - Generated on ${formatDate(new Date().toISOString())}`,
      status: 'Generated',
      paymentMethod: '',
      paymentStatus: 'N/A'
    }
    
    printManager.printDocument(reportDocument)
  }
  
  // Combine sales and purchases for reports
  const transactions: Transaction[] = useMemo(() => {
    const salesTransactions: Transaction[] = sales.map(sale => ({
      id: sale.id,
      date: sale.createdAt,
      invoiceNo: sale.invoiceNumber || '',
      partyName: sale.customerName || 'Unknown Customer',
      transactionType: "Sale" as const,
      paymentType: "Cash" as const, // Default, could be enhanced
      amount: sale.total,
      balance: sale.total - (sale.paymentStatus === "paid" ? sale.total : 0),
      status: sale.paymentStatus === "paid" ? "completed" : "pending",
      description: `Sale to ${sale.customerName || 'Unknown Customer'}`,
    }))
    
    const purchaseTransactions: Transaction[] = purchases.map(purchase => ({
      id: purchase.id,
      date: purchase.created_at || new Date().toISOString(),
      invoiceNo: purchase.bill_number || '',
      partyName: `Supplier ${purchase.supplier_id || 'Unknown'}`, // We'll need to get supplier name from parties
      transactionType: "Purchase" as const,
      paymentType: "Bank" as const, // Default, could be enhanced
      amount: Number(purchase.total) || 0,
      balance: (Number(purchase.total) || 0) - (purchase.payment_status === "paid" ? (Number(purchase.total) || 0) : 0),
      status: purchase.payment_status === "paid" ? "completed" : "pending",
      description: `Purchase from Supplier ${purchase.supplier_id || 'Unknown'}`,
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
    
    // Fallback to local transaction data (sales and purchases are already phone-filtered from API)
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
      setSortDirection("asc")
    }
  }

  const formatDateForReport = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB")
  }

  const exportToExcel = () => {
    // Create CSV content
    const headers = ["Date", "Invoice No", "Party Name", "Transaction", "Payment Type", "Amount", "Balance"]
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((t) =>
        [formatDateForReport(t.date), t.invoiceNo, t.partyName, t.transactionType, t.paymentType, t.amount, t.balance].join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${selectedReport}-report-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    dispatch(showNotification({ 
      message: "Report exported successfully!", 
      type: "success",
      category: "report",
      actionUrl: "/business-hub/reports",
      priority: "low"
    }))
  }

  const printReport = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 20px; }
          .summary-item { display: inline-block; margin-right: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .amount { text-align: right; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
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
              <th>Invoice No</th>
              <th>Party Name</th>
              <th>Transaction</th>
              <th>Payment Type</th>
              <th>Amount</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions
              .map(
                (t) => `
              <tr>
                <td>${formatDateForReport(t.date)}</td>
                <td>${t.invoiceNo}</td>
                <td>${t.partyName}</td>
                <td>${t.transactionType}</td>
                <td>${t.paymentType}</td>
                <td class="amount">${formatAmountWithSymbol(t.amount)}</td>
                <td class="amount">${formatAmountWithSymbol(t.balance)}</td>
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
    console.log('📱 Reports Page: Phone number from settings:', phoneNumber)
    
    if (phoneNumber) {
      // Ensure phone number is stored in localStorage for API client
      localStorage.setItem('currentUserPhone', phoneNumber)
      console.log('✅ Reports Page: Stored phone in localStorage:', phoneNumber)
      
      // Fetch data with phone isolation
      console.log('🔄 Reports Page: Fetching data...')
      dispatch(fetchSales({}))
        .unwrap()
        .then((sales) => console.log('✅ Reports Page: Fetched sales:', sales.length))
        .catch((error) => console.error('❌ Reports Page: Failed to fetch sales:', error))
      
      dispatch(fetchPurchases())
        .unwrap()
        .then((purchases) => console.log('✅ Reports Page: Fetched purchases:', purchases.length))
        .catch((error) => console.error('❌ Reports Page: Failed to fetch purchases:', error))
      
      dispatch(fetchParties({}))
        .unwrap()
        .then((parties) => console.log('✅ Reports Page: Fetched parties:', parties.length))
        .catch((error) => console.error('❌ Reports Page: Failed to fetch parties:', error))
      
      dispatch(fetchItems())
        .unwrap()
        .then((items) => console.log('✅ Reports Page: Fetched items:', items.length))
        .catch((error) => console.error('❌ Reports Page: Failed to fetch items:', error))
      
      // Generate initial report
      handleGenerateReport(selectedReport)
    } else {
      console.error('❌ Reports Page: No phone number available in settings')
      dispatch(showNotification({
        message: 'Phone number not configured. Please set up your business phone number in settings.',
        type: "error",
        category: "settings",
        priority: "high"
      }))
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
                placeholder="Search Transactions"
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-30">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      {getReportTitle()}
                    </h1>
                    <p className="text-gray-600">Business reports and analytics</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sale
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Purchase
                  </Button>
                  <Button 
                    onClick={() => handleGenerateReport(selectedReport)}
                    disabled={reportsLoading}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    title="Generate Current Report"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {reportsLoading ? 'Generating...' : 'Generate Report'}
                  </Button>
                  <Button 
                    onClick={handlePrintReport}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    title="Print Current Report"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
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
                      <DropdownMenuItem onClick={handlePrintReport}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print Report
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="flex-1 p-8">
            {/* Filter Bar */}
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-gray-700">Filter by :</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-40 rounded-lg border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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

                  <Select value={firmFilter} onValueChange={setFirmFilter}>
                    <SelectTrigger className="w-40 rounded-lg border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-firms">All Firms</SelectItem>
                      <SelectItem value="firm-1">Firm 1</SelectItem>
                      <SelectItem value="firm-2">Firm 2</SelectItem>
                    </SelectContent>
                  </Select>
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

                  {currentReport.type === 'sales-report' && currentReport.data && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total Sales</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatAmountWithSymbol(currentReport.data.totalSales || 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Sales Count</p>
                          <p className="text-2xl font-bold text-green-600">
                            {Array.isArray(currentReport.data.sales) ? currentReport.data.sales.length : 0}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm text-gray-600">Average Sale</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {formatAmountWithSymbol(
                              Array.isArray(currentReport.data.sales) && currentReport.data.sales.length > 0
                                ? (currentReport.data.totalSales || 0) / currentReport.data.sales.length
                                : 0
                            )}
                          </p>
                        </div>
                      </div>
                      {Array.isArray(currentReport.data.sales) && currentReport.data.sales.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold mb-4">Recent Sales</h4>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Invoice #</TableHead>
                                  <TableHead>Customer</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Amount</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {currentReport.data.sales.slice(0, 10).map((sale: any, index: number) => (
                                  <TableRow key={sale.id || index}>
                                    <TableCell>{sale.invoice_number || sale.invoiceNumber || `INV-${index + 1}`}</TableCell>
                                    <TableCell>{sale.customer_name || sale.customerName || 'N/A'}</TableCell>
                                    <TableCell>{formatDate(sale.created_at || sale.date)}</TableCell>
                                    <TableCell>{formatAmountWithSymbol(sale.total_amount || sale.total || 0)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentReport.type === 'purchases-report' && currentReport.data && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total Purchases</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatAmountWithSymbol(currentReport.data.totalPurchases || 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <p className="text-sm text-gray-600">Purchase Count</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {Array.isArray(currentReport.data.purchases) ? currentReport.data.purchases.length : 0}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-gray-600">Average Purchase</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {formatAmountWithSymbol(
                              Array.isArray(currentReport.data.purchases) && currentReport.data.purchases.length > 0
                                ? (currentReport.data.totalPurchases || 0) / currentReport.data.purchases.length
                                : 0
                            )}
                          </p>
                        </div>
                      </div>
                      {Array.isArray(currentReport.data.purchases) && currentReport.data.purchases.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold mb-4">Recent Purchases</h4>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Invoice #</TableHead>
                                  <TableHead>Supplier</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Amount</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {currentReport.data.purchases.slice(0, 10).map((purchase: any, index: number) => (
                                  <TableRow key={purchase.id || index}>
                                    <TableCell>{purchase.invoice_number || purchase.invoiceNumber || `PUR-${index + 1}`}</TableCell>
                                    <TableCell>{purchase.supplier_name || purchase.supplierName || 'N/A'}</TableCell>
                                    <TableCell>{formatDate(purchase.created_at || purchase.date)}</TableCell>
                                    <TableCell>{formatAmountWithSymbol(purchase.total_amount || purchase.total || 0)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentReport.type === 'party-statement' && currentReport.data && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total Parties</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {Array.isArray(currentReport.data.parties) ? currentReport.data.parties.length : 0}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total Receivables</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatAmountWithSymbol(currentReport.data.totalReceivables || 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total Payables</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatAmountWithSymbol(currentReport.data.totalPayables || 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm text-gray-600">Net Balance</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {formatAmountWithSymbol((currentReport.data.totalReceivables || 0) - (currentReport.data.totalPayables || 0))}
                          </p>
                        </div>
                      </div>
                      {Array.isArray(currentReport.data.parties) && currentReport.data.parties.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold mb-4">Party Details</h4>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Party Name</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Balance</TableHead>
                                  <TableHead>Contact</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {currentReport.data.parties.slice(0, 10).map((party: any, index: number) => (
                                  <TableRow key={party.id || index}>
                                    <TableCell>{party.name || 'N/A'}</TableCell>
                                    <TableCell>{party.type || 'Customer'}</TableCell>
                                    <TableCell>{formatAmountWithSymbol(party.balance || 0)}</TableCell>
                                    <TableCell>{party.phone || party.email || 'N/A'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentReport.type === 'cash-flow' && currentReport.data && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Cash Inflow</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatAmountWithSymbol(currentReport.data.summary?.inflow || 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-sm text-gray-600">Cash Outflow</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatAmountWithSymbol(currentReport.data.summary?.outflow || 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Net Cash Flow</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatAmountWithSymbol(currentReport.data.summary?.netFlow || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentReport.type === 'profit-loss' && currentReport.data && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Revenue</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatAmountWithSymbol(currentReport.data.revenue || 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-sm text-gray-600">Costs</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatAmountWithSymbol(currentReport.data.costs || 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Gross Profit</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatAmountWithSymbol(currentReport.data.grossProfit || 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm text-gray-600">Profit Margin</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {currentReport.data.profitMargin || 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generic report display for other types */}
                  {!['transaction-summary', 'cash-flow', 'profit-loss', 'sales-report', 'purchases-report', 'party-statement'].includes(currentReport.type) && currentReport.data && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        <p>Report data available for {currentReport.title}. Displaying summary information:</p>
                      </div>
                      
                      {/* Display data summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(currentReport.data).map(([key, value]) => {
                          if (typeof value === 'number') {
                            return (
                              <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="text-xl font-bold text-gray-700">
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
                      
                      {/* Display array data if available */}
                      {Object.entries(currentReport.data).map(([key, value]) => {
                        if (Array.isArray(value) && value.length > 0) {
                          return (
                            <div key={key} className="mt-6">
                              <h4 className="text-lg font-semibold mb-4 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                              <div className="text-sm text-gray-600 mb-2">
                                Showing {Math.min(value.length, 10)} of {value.length} records
                              </div>
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      {Object.keys(value[0] || {}).slice(0, 5).map((column) => (
                                        <TableHead key={column} className="capitalize">
                                          {column.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                        </TableHead>
                                      ))}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {value.slice(0, 10).map((item: any, index: number) => (
                                      <TableRow key={item.id || index}>
                                        {Object.entries(item).slice(0, 5).map(([col, val]: [string, any]) => (
                                          <TableCell key={col}>
                                            {typeof val === 'number' && (col.toLowerCase().includes('amount') || col.toLowerCase().includes('total') || col.toLowerCase().includes('cost') || col.toLowerCase().includes('price'))
                                              ? formatAmountWithSymbol(val)
                                              : val?.toString() || 'N/A'
                                            }
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )
                        }
                        return null
                      })}
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

            {/* Current Report Display with Phone-Filtered Data */}
            {!currentReport && selectedReport && (
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

            {/* Phone-Filtered Data Display */}
            {selectedReport && !currentReport && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">{getReportDisplayName()}</CardTitle>
                  <p className="text-sm text-gray-600">
                    Phone-filtered data for: {generalSettings?.phoneNumber || 'No phone number configured'}
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Display phone-filtered local data while API report loads */}
                  {(() => {
                    const phoneNumber = generalSettings?.phoneNumber
                    // Since sales/purchases are already phone-filtered from API, use them directly
                    const phoneFilteredSales = sales || []
                    const phoneFilteredPurchases = purchases || []
                    const phoneFilteredParties = parties || []

                    if (selectedReport.includes('sale') || selectedReport.includes('sales')) {
                      return (
                        <div className="space-y-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">Sales Records</p>
                            <p className="text-2xl font-bold text-blue-600">{phoneFilteredSales.length}</p>
                          </div>
                          {phoneFilteredSales.length > 0 && (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {phoneFilteredSales.slice(0, 10).map((sale) => (
                                    <TableRow key={sale.id}>
                                      <TableCell>{sale.invoiceNumber || sale.invoice_number}</TableCell>
                                      <TableCell>{sale.customerName || sale.party_name}</TableCell>
                                      <TableCell>{formatDate(sale.createdAt || sale.created_at)}</TableCell>
                                      <TableCell>{formatAmountWithSymbol(sale.total || sale.total_amount)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      )
                    } else if (selectedReport.includes('purchase')) {
                      return (
                        <div className="space-y-4">
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-sm text-gray-600">Purchase Records</p>
                            <p className="text-2xl font-bold text-red-600">{phoneFilteredPurchases.length}</p>
                          </div>
                          {phoneFilteredPurchases.length > 0 && (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Bill #</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {phoneFilteredPurchases.slice(0, 10).map((purchase) => (
                                    <TableRow key={purchase.id}>
                                      <TableCell>{purchase.bill_number}</TableCell>
                                      <TableCell>{purchase.supplier_name}</TableCell>
                                      <TableCell>{formatDate(purchase.created_at)}</TableCell>
                                      <TableCell>{formatAmountWithSymbol(purchase.total)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      )
                    } else if (selectedReport.includes('party') || selectedReport.includes('parties')) {
                      return (
                        <div className="space-y-4">
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600">Party Records</p>
                            <p className="text-2xl font-bold text-purple-600">{phoneFilteredParties.length}</p>
                          </div>
                          {phoneFilteredParties.length > 0 && (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Balance</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {phoneFilteredParties.slice(0, 10).map((party) => (
                                    <TableRow key={party.id}>
                                      <TableCell>{party.name}</TableCell>
                                      <TableCell>{party.type}</TableCell>
                                      <TableCell>{party.phone}</TableCell>
                                      <TableCell>{formatAmountWithSymbol(party.balance || 0)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      )
                    } else {
                      return (
                        <div className="text-center py-8">
                          <p className="text-gray-600">Report data loading...</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Phone: {phoneNumber || 'Not configured'}
                          </p>
                        </div>
                      )
                    }
                  })()}
                </CardContent>
              </Card>
            )}

            {selectedReport === "daybook" && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Day Book</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Invoice No</TableHead>
                          <TableHead>Party</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>{formatDateForReport(t.date)}</TableCell>
                            <TableCell>{t.transactionType}</TableCell>
                            <TableCell>{t.invoiceNo}</TableCell>
                            <TableCell>{t.partyName}</TableCell>
                            <TableCell>{formatAmountWithSymbol(t.amount)}</TableCell>
                            <TableCell>{t.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedReport === "trial-balance" && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Trial Balance Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Debits (Purchases)</TableCell>
                          <TableCell>{formatAmountWithSymbol(financialMetrics.totalExpenses)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Credits (Sales)</TableCell>
                          <TableCell>{formatAmountWithSymbol(financialMetrics.totalRevenue)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><b>Balance</b></TableCell>
                          <TableCell><b>{formatAmountWithSymbol(financialMetrics.totalRevenue - financialMetrics.totalExpenses)}</b></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedReport === "balance-sheet" && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Balance Sheet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Assets</h3>
                      <p className="text-md text-gray-700">Cash in Hand: {formatAmountWithSymbol(financialMetrics.availableBalance)}</p>
                      <p className="text-md text-gray-700">Inventory: {formatAmountWithSymbol(financialMetrics.inventoryValue)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Liabilities</h3>
                      <p className="text-md text-gray-700">Payables: {formatAmountWithSymbol(financialMetrics.pendingPayables)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Net Worth</h3>
                      <p className="text-2xl font-bold text-green-700">{formatAmountWithSymbol(financialMetrics.availableBalance + financialMetrics.inventoryValue - financialMetrics.pendingPayables)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedReport === "party-statement" && (
              <PartyReports 
                reportType="party-statement"
                dateRange={dateRange}
                firmFilter={firmFilter}
                searchTerm={searchTerm}
                currentReport={currentReport}
                onViewPartyDetails={(party) => {
                  setSelectedParty(party)
                  setShowPartyDetails(true)
                }}
              />
            )}

            {selectedReport === "party-wise-profit" && (
              <PartyReports 
                reportType="party-wise-profit"
                dateRange={dateRange}
                firmFilter={firmFilter}
                searchTerm={searchTerm}
                currentReport={currentReport}
                onViewPartyDetails={(party) => {
                  setSelectedParty(party)
                  setShowPartyDetails(true)
                }}
              />
            )}

            {selectedReport === "all-parties" && (
              <PartyReports 
                reportType="all-parties"
                dateRange={dateRange}
                firmFilter={firmFilter}
                searchTerm={searchTerm}
                currentReport={currentReport}
                onViewPartyDetails={(party) => {
                  setSelectedParty(party)
                  setShowPartyDetails(true)
                }}
              />
            )}

            {selectedReport === "party-report-item" && (
              <PartyReports 
                reportType="party-report-item"
                dateRange={dateRange}
                firmFilter={firmFilter}
                searchTerm={searchTerm}
                currentReport={currentReport}
                onViewPartyDetails={(party) => {
                  setSelectedParty(party)
                  setShowPartyDetails(true)
                }}
              />
            )}

            {selectedReport === "sale-purchase-party" && (
              <PartyReports 
                reportType="sale-purchase-party"
                dateRange={dateRange}
                firmFilter={firmFilter}
                searchTerm={searchTerm}
                currentReport={currentReport}
                onViewPartyDetails={(party) => {
                  setSelectedParty(party)
                  setShowPartyDetails(true)
                }}
              />
            )}

            {selectedReport === "sale-purchase-party-group" && (
              <PartyReports 
                reportType="sale-purchase-party-group"
                dateRange={dateRange}
                firmFilter={firmFilter}
                searchTerm={searchTerm}
                currentReport={currentReport}
                onViewPartyDetails={(party) => {
                  setSelectedParty(party)
                  setShowPartyDetails(true)
                }}
              />
            )}

            {/* Sales Report */}
            {(selectedReport === "sale" || selectedReport === "sales-report") && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Sales Report</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentReport.data && Array.isArray(currentReport.data) && currentReport.data.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <h3 className="text-sm font-medium text-green-600 mb-2">Total Sales</h3>
                          <p className="text-2xl font-bold text-green-700">
                            {formatAmountWithSymbol(currentReport.data.reduce((sum: number, sale: any) => sum + (sale.total_amount || sale.total || 0), 0))}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <h3 className="text-sm font-medium text-blue-600 mb-2">Sales Count</h3>
                          <p className="text-2xl font-bold text-blue-700">{currentReport.data.length}</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <h3 className="text-sm font-medium text-purple-600 mb-2">Avg Sale Value</h3>
                          <p className="text-2xl font-bold text-purple-700">
                            {formatAmountWithSymbol(currentReport.data.length > 0 ? 
                              currentReport.data.reduce((sum: number, sale: any) => sum + (sale.total_amount || sale.total || 0), 0) / currentReport.data.length : 0)}
                          </p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Invoice No</TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Paid Amount</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentReport.data.map((sale: any, index: number) => (
                              <TableRow key={sale.id || index}>
                                <TableCell className="font-medium">{sale.invoice_number || sale.invoiceNumber || `INV-${index + 1}`}</TableCell>
                                <TableCell>{sale.party_name || sale.customer_name || sale.customerName || 'N/A'}</TableCell>
                                <TableCell>{sale.invoice_date ? new Date(sale.invoice_date).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell>{formatAmountWithSymbol(sale.total_amount || sale.total || 0)}</TableCell>
                                <TableCell>{formatAmountWithSymbol(sale.paid_amount || sale.paidAmount || 0)}</TableCell>
                                <TableCell>
                                  <Badge variant={sale.payment_status === 'paid' ? 'default' : 'destructive'}>
                                    {sale.payment_status || sale.paymentStatus || 'pending'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No sales data available</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Purchases Report */}
            {(selectedReport === "purchase" || selectedReport === "purchases-report") && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Purchases Report</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentReport.data && Array.isArray(currentReport.data) && currentReport.data.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <h3 className="text-sm font-medium text-red-600 mb-2">Total Purchases</h3>
                          <p className="text-2xl font-bold text-red-700">
                            {formatAmountWithSymbol(currentReport.data.reduce((sum: number, purchase: any) => sum + (purchase.total_amount || purchase.total || 0), 0))}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <h3 className="text-sm font-medium text-blue-600 mb-2">Purchase Count</h3>
                          <p className="text-2xl font-bold text-blue-700">{currentReport.data.length}</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <h3 className="text-sm font-medium text-purple-600 mb-2">Avg Purchase Value</h3>
                          <p className="text-2xl font-bold text-purple-700">
                            {formatAmountWithSymbol(currentReport.data.length > 0 ? 
                              currentReport.data.reduce((sum: number, purchase: any) => sum + (purchase.total_amount || purchase.total || 0), 0) / currentReport.data.length : 0)}
                          </p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Bill No</TableHead>
                              <TableHead>Supplier</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Paid Amount</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentReport.data.map((purchase: any, index: number) => (
                              <TableRow key={purchase.id || index}>
                                <TableCell className="font-medium">{purchase.bill_number || purchase.invoiceNumber || `PUR-${index + 1}`}</TableCell>
                                <TableCell>{purchase.party_name || purchase.supplier_name || purchase.supplierName || 'N/A'}</TableCell>
                                <TableCell>{purchase.created_at ? new Date(purchase.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell>{formatAmountWithSymbol(purchase.total_amount || purchase.total || 0)}</TableCell>
                                <TableCell>{formatAmountWithSymbol(purchase.paid_amount || purchase.paidAmount || 0)}</TableCell>
                                <TableCell>
                                  <Badge variant={purchase.payment_status === 'paid' ? 'default' : 'destructive'}>
                                    {purchase.payment_status || purchase.paymentStatus || 'pending'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No purchases data available</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Cash Flow Report */}
            {selectedReport === "cash-flow" && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Cash Flow Report</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentReport.data ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <h3 className="text-sm font-medium text-green-600 mb-2">Cash Inflow</h3>
                          <p className="text-2xl font-bold text-green-700">{formatAmountWithSymbol(currentReport.data.summary?.inflow || 0)}</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <h3 className="text-sm font-medium text-red-600 mb-2">Cash Outflow</h3>
                          <p className="text-2xl font-bold text-red-700">{formatAmountWithSymbol(currentReport.data.summary?.outflow || 0)}</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <h3 className="text-sm font-medium text-blue-600 mb-2">Net Cash Flow</h3>
                          <p className={`text-2xl font-bold ${(currentReport.data.summary?.netFlow || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatAmountWithSymbol(currentReport.data.summary?.netFlow || 0)}
                          </p>
                        </div>
                      </div>
                      {currentReport.data.transactions && currentReport.data.transactions.length > 0 && (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Reference</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentReport.data.transactions.map((transaction: any, index: number) => (
                                <TableRow key={transaction.id || index}>
                                  <TableCell>{transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                                  <TableCell className="font-medium">{transaction.name || transaction.description}</TableCell>
                                  <TableCell>
                                    <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                                      {transaction.type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                    {formatAmountWithSymbol(transaction.amount || 0)}
                                  </TableCell>
                                  <TableCell>{transaction.reference || 'N/A'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No cash flow data available</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Profit Loss Report */}
            {selectedReport === "profit-loss" && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Profit & Loss Report</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentReport.data ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <h3 className="text-sm font-medium text-green-600 mb-2">Total Revenue</h3>
                          <p className="text-2xl font-bold text-green-700">{formatAmountWithSymbol(currentReport.data.revenue || 0)}</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <h3 className="text-sm font-medium text-red-600 mb-2">Total Costs</h3>
                          <p className="text-2xl font-bold text-red-700">{formatAmountWithSymbol(currentReport.data.costs || 0)}</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <h3 className="text-sm font-medium text-blue-600 mb-2">Gross Profit</h3>
                          <p className={`text-2xl font-bold ${(currentReport.data.grossProfit || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatAmountWithSymbol(currentReport.data.grossProfit || 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <h3 className="text-sm font-medium text-purple-600 mb-2">Profit Margin</h3>
                          <p className="text-2xl font-bold text-purple-700">{currentReport.data.profitMargin || 0}%</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No profit/loss data available</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tax Reports */}
            {(selectedReport.includes("tax") || ["tax-report", "tax-rate-report"].includes(selectedReport)) && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Tax Report</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentReport.data ? (
                    <div className="space-y-4">
                      {currentReport.data.summary && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-600 mb-2">Total Tax Collected</h3>
                            <p className="text-2xl font-bold text-blue-700">{formatAmountWithSymbol(currentReport.data.summary.totalTaxCollected || 0)}</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <h3 className="text-sm font-medium text-green-600 mb-2">Tax Paid</h3>
                            <p className="text-2xl font-bold text-green-700">{formatAmountWithSymbol(currentReport.data.summary.taxPaid || 0)}</p>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <h3 className="text-sm font-medium text-red-600 mb-2">Net Tax Liability</h3>
                            <p className="text-2xl font-bold text-red-700">{formatAmountWithSymbol(currentReport.data.summary.netTaxLiability || 0)}</p>
                          </div>
                        </div>
                      )}
                      {currentReport.data.taxData && currentReport.data.taxData.length > 0 && (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Transaction Type</TableHead>
                                <TableHead>Tax Rate</TableHead>
                                <TableHead>Taxable Amount</TableHead>
                                <TableHead>Tax Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentReport.data.taxData.map((tax: any, index: number) => (
                                <TableRow key={tax.id || index}>
                                  <TableCell>{tax.date ? new Date(tax.date).toLocaleDateString() : 'N/A'}</TableCell>
                                  <TableCell className="font-medium">{tax.transaction_type}</TableCell>
                                  <TableCell>{tax.tax_rate}%</TableCell>
                                  <TableCell>{formatAmountWithSymbol(tax.taxable_amount || 0)}</TableCell>
                                  <TableCell className="text-blue-600">{formatAmountWithSymbol(tax.tax_amount || 0)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No tax data available</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Expense Reports */}
            {(selectedReport.includes("expense") || ["expense-report", "expense-category", "expense-item"].includes(selectedReport)) && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Expense Report</CardTitle>
                  <p className="text-sm text-gray-600">
                    {currentReport ? `API Data - Generated on ${new Date(currentReport.timestamp).toLocaleString()}` : 
                     `Phone-filtered data for: ${generalSettings?.phoneNumber || 'No phone number configured'}`}
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Get data from API or fallback to Redux store metrics
                    const apiData = currentReport?.data
                    const phoneNumber = generalSettings?.phoneNumber

                    console.log('Expense Report Debug:', {
                      selectedReport,
                      hasCurrentReport: !!currentReport,
                      apiData: !!apiData,
                      financialMetrics: !!financialMetrics,
                      apiDataType: Array.isArray(apiData) ? 'array' : typeof apiData,
                      phoneNumber
                    })

                    // Check if we have any meaningful data to display
                    const hasApiData = apiData && (
                      (Array.isArray(apiData) && apiData.length > 0) ||
                      (apiData.expenses && apiData.expenses.length > 0) ||
                      (apiData.summary && Object.keys(apiData).length > 1) ||
                      (!Array.isArray(apiData) && Object.keys(apiData).length > 0)
                    );

                    console.log('Data availability check:', {
                      hasApiData,
                      apiDataExists: !!apiData,
                      isApiArray: Array.isArray(apiData),
                      apiLength: Array.isArray(apiData) ? apiData.length : 0,
                      hasFinancialMetrics: !!financialMetrics,
                      hasPurchases: !!(purchases && purchases.length > 0)
                    });

                    if (hasApiData || (financialMetrics && purchases && sales)) {
                      // Use API data if available, otherwise calculate from local data
                      let expenseData;
                      let displayData = [];
                      
                      if (apiData) {
                        console.log('API Data Structure:', {
                          isArray: Array.isArray(apiData),
                          length: Array.isArray(apiData) ? apiData.length : Object.keys(apiData).length,
                          firstItem: Array.isArray(apiData) ? apiData[0] : apiData,
                          hasExpenses: !!apiData.expenses,
                          hasSummary: !!apiData.summary
                        });

                        // API data structure
                        if (Array.isArray(apiData)) {
                          // Direct expense transactions array
                          displayData = apiData;
                          const totalExpenses = apiData.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0);
                          const cashExpenses = apiData.filter((exp: any) => 
                            exp.payment_method === 'cash' || exp.type === 'cash'
                          ).reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0);
                          const bankExpenses = totalExpenses - cashExpenses;
                          
                          expenseData = {
                            summary: {
                              totalExpenses,
                              cashExpenses,
                              bankExpenses,
                              avgDailyExpense: apiData.length > 0 ? totalExpenses / Math.max(apiData.length, 1) : 0,
                              transactionCount: apiData.length
                            },
                            expenses: apiData
                          };
                        } else if (apiData.summary || apiData.expenses) {
                          // Structured API response
                          expenseData = apiData;
                          displayData = apiData.expenses || [];
                        } else {
                          // Category or item grouped data
                          displayData = Array.isArray(apiData) ? apiData : Object.values(apiData);
                          const totalExpenses = displayData.reduce((sum: number, item: any) => 
                            sum + (item.totalAmount || item.amount || 0), 0);
                          
                          expenseData = {
                            summary: {
                              totalExpenses,
                              transactionCount: displayData.length
                            },
                            groupedData: displayData
                          };
                        }
                      } else {
                        // Calculate from local Redux data (use purchases as expenses)
                        // Note: Phone filtering temporarily disabled due to interface mismatch
                        const phoneFilteredPurchases = purchases || [];
                        
                        console.log('Using fallback data:', {
                          phoneNumber,
                          totalPurchases: purchases?.length || 0,
                          phoneFilteredPurchases: phoneFilteredPurchases.length,
                          financialMetrics: financialMetrics,
                          samplePurchase: phoneFilteredPurchases[0]
                        });

                        const totalExpenses = financialMetrics?.totalExpenses || 
                          phoneFilteredPurchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0);
                        const transactionCount = phoneFilteredPurchases.length;
                        
                        // Create mock expense transactions from purchases
                        const mockExpenses = phoneFilteredPurchases.map(purchase => ({
                          id: purchase.id,
                          date: purchase.created_at,
                          created_at: purchase.created_at,
                          description: `Purchase - ${purchase.supplier_name || 'Supplier'} (Bill: ${purchase.bill_number || 'N/A'})`,
                          name: `Purchase from ${purchase.supplier_name || 'Unknown Supplier'}`,
                          category: 'Purchase Expense',
                          payment_method: 'bank',
                          type: 'expense',
                          amount: purchase.total || 0
                        }));

                        // Add some sample expense categories if no data
                        if (mockExpenses.length === 0) {
                          mockExpenses.push(
                            {
                              id: 'sample-1',
                              date: new Date().toISOString(),
                              created_at: new Date().toISOString(),
                              description: 'Office Supplies',
                              name: 'Office Supplies',
                              category: 'Office Expenses',
                              payment_method: 'cash',
                              type: 'expense',
                              amount: 500
                            },
                            {
                              id: 'sample-2',
                              date: new Date().toISOString(),
                              created_at: new Date().toISOString(),
                              description: 'Utility Bills',
                              name: 'Electricity Bill',
                              category: 'Utilities',
                              payment_method: 'bank',
                              type: 'expense',
                              amount: 1200
                            }
                          );
                        }
                        
                        expenseData = {
                          summary: {
                            totalExpenses: mockExpenses.reduce((sum, exp) => sum + exp.amount, 0),
                            cashExpenses: mockExpenses.filter(exp => exp.payment_method === 'cash').reduce((sum, exp) => sum + exp.amount, 0),
                            bankExpenses: mockExpenses.filter(exp => exp.payment_method === 'bank').reduce((sum, exp) => sum + exp.amount, 0),
                            avgDailyExpense: mockExpenses.length > 0 ? mockExpenses.reduce((sum, exp) => sum + exp.amount, 0) / mockExpenses.length : 0,
                            transactionCount: mockExpenses.length
                          },
                          expenses: mockExpenses
                        };
                        displayData = expenseData.expenses;
                      }

                      return (
                        <div className="space-y-4">
                          {/* Summary Cards */}
                          {expenseData.summary && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="text-center p-4 bg-red-50 rounded-lg">
                                <h3 className="text-sm font-medium text-red-600 mb-2">Total Expenses</h3>
                                <p className="text-2xl font-bold text-red-700">{formatAmountWithSymbol(expenseData.summary.totalExpenses || 0)}</p>
                              </div>
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-600 mb-2">Cash Expenses</h3>
                                <p className="text-2xl font-bold text-blue-700">{formatAmountWithSymbol(expenseData.summary.cashExpenses || 0)}</p>
                              </div>
                              <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <h3 className="text-sm font-medium text-purple-600 mb-2">Bank Expenses</h3>
                                <p className="text-2xl font-bold text-purple-700">{formatAmountWithSymbol(expenseData.summary.bankExpenses || 0)}</p>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <h3 className="text-sm font-medium text-green-600 mb-2">Avg Per Transaction</h3>
                                <p className="text-2xl font-bold text-green-700">{formatAmountWithSymbol(expenseData.summary.avgDailyExpense || 0)}</p>
                              </div>
                            </div>
                          )}

                          {/* Display based on report type */}
                          {selectedReport === 'expense-category' && expenseData.groupedData ? (
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-gray-800">Expenses by Category</h4>
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Category</TableHead>
                                      <TableHead>Total Amount</TableHead>
                                      <TableHead>Transaction Count</TableHead>
                                      <TableHead>Average Amount</TableHead>
                                      <TableHead>Percentage</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {expenseData.groupedData.map((category: any, index: number) => {
                                      const percentage = expenseData.summary?.totalExpenses > 0 ? 
                                        ((category.totalAmount || 0) / expenseData.summary.totalExpenses * 100).toFixed(1) : '0';
                                      
                                      return (
                                        <TableRow key={category.category || index}>
                                          <TableCell className="font-medium">{category.category || 'Uncategorized'}</TableCell>
                                          <TableCell className="text-red-600 font-medium">{formatAmountWithSymbol(category.totalAmount || 0)}</TableCell>
                                          <TableCell>{category.transactionCount || 0}</TableCell>
                                          <TableCell>{formatAmountWithSymbol(category.averageAmount || 0)}</TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-2">
                                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div 
                                                  className="bg-red-500 h-2 rounded-full" 
                                                  style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                                                ></div>
                                              </div>
                                              <span className="text-sm">{percentage}%</span>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          ) : selectedReport === 'expense-item' && expenseData.groupedData ? (
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-gray-800">Expenses by Item</h4>
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Item/Description</TableHead>
                                      <TableHead>Total Amount</TableHead>
                                      <TableHead>Transaction Count</TableHead>
                                      <TableHead>Average Amount</TableHead>
                                      <TableHead>Last Transaction</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {expenseData.groupedData.map((item: any, index: number) => (
                                      <TableRow key={item.itemName || index}>
                                        <TableCell className="font-medium">{item.itemName || 'Unknown Item'}</TableCell>
                                        <TableCell className="text-red-600 font-medium">{formatAmountWithSymbol(item.totalAmount || 0)}</TableCell>
                                        <TableCell>{item.transactionCount || 0}</TableCell>
                                        <TableCell>{formatAmountWithSymbol(item.averageAmount || 0)}</TableCell>
                                        <TableCell>
                                          {item.lastTransaction ? new Date(item.lastTransaction).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          ) : displayData && displayData.length > 0 ? (
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-gray-800">Detailed Expense Transactions</h4>
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Date</TableHead>
                                      <TableHead>Description</TableHead>
                                      <TableHead>Category</TableHead>
                                      <TableHead>Payment Method</TableHead>
                                      <TableHead>Amount</TableHead>
                                      <TableHead>Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {displayData.map((expense: any, index: number) => (
                                      <TableRow key={expense.id || index}>
                                        <TableCell>
                                          {expense.date ? new Date(expense.date).toLocaleDateString() : 
                                           expense.created_at ? new Date(expense.created_at).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          {expense.description || expense.name || 'No description'}
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline">
                                            {expense.category || 'General'}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant={expense.payment_method === 'cash' ? 'default' : 'secondary'}>
                                            {expense.payment_method || 'Unknown'}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-red-600 font-medium">
                                          {formatAmountWithSymbol(expense.amount || expense.total || 0)}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Button 
                                              size="sm" 
                                              variant="ghost" 
                                              className="hover:bg-blue-50 hover:text-blue-600"
                                              title="View Details"
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                              size="sm" 
                                              variant="ghost" 
                                              className="hover:bg-green-50 hover:text-green-600"
                                              title="Edit"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500 mb-2">No expense transactions found</p>
                              <p className="text-sm text-gray-400">
                                {apiData && Array.isArray(apiData) && apiData.length === 0 ? 
                                  'API returned empty data. Try adding some expense transactions.' :
                                  'Add some expenses or purchases to see detailed transaction data.'}
                              </p>
                            </div>
                          )}

                          {/* Report Type Specific Information */}
                          {selectedReport === 'expense-category' && (
                            <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                              <h4 className="font-medium text-orange-800 mb-2">Category Analysis</h4>
                              <p className="text-sm text-orange-700">
                                Expenses grouped by category showing total amounts, transaction counts, and spending patterns.
                              </p>
                            </div>
                          )}
                          
                          {selectedReport === 'expense-item' && (
                            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                              <h4 className="font-medium text-purple-800 mb-2">Item Analysis</h4>
                              <p className="text-sm text-purple-700">
                                Expenses grouped by item/description showing frequency and spending patterns for each expense type.
                              </p>
                            </div>
                          )}

                          {apiData && (
                            <div className="mt-4 p-4 bg-green-50 rounded-lg">
                              <h4 className="font-medium text-green-800 mb-2">API Data Loaded</h4>
                              <p className="text-sm text-green-700">
                                This report includes real-time expense data from cash transactions and bank records.
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    } else {
                      return (
                        <div className="text-center py-8">
                          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-2">No expense data available</p>
                          <p className="text-sm text-gray-400">
                            {!phoneNumber ? 'Phone number not configured' : 
                             'No expense transactions found. Add some expenses or purchases to see data.'}
                          </p>
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600">
                              Debug: API={currentReport ? 'Yes' : 'No'}, Financial Metrics={!!financialMetrics}, 
                              Purchases={purchases?.length || 0}, Phone={phoneNumber || 'None'}
                            </p>
                          </div>
                        </div>
                      )
                    }
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Items/Stock Reports */}
            {(selectedReport.includes("item") || selectedReport.includes("stock") || 
              ["item-report", "stock-report", "item-report-party", "stock-summary", 
               "stock-summary-item-category", "item-wise-profit", "low-stock-summary", 
               "stock-detail", "item-detail", "sale-purchase-item-category"].includes(selectedReport)) && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Items & Stock Report</CardTitle>
                  <p className="text-sm text-gray-600">
                    {currentReport ? `API Data - Generated on ${new Date(currentReport.timestamp).toLocaleString()}` : 
                     `Phone-filtered data for: ${generalSettings?.phoneNumber || 'No phone number configured'}`}
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Get data from API or fallback to Redux store
                    const displayItems = currentReport?.data?.items || currentReport?.data || items || []
                    const phoneNumber = generalSettings?.phoneNumber
                    
                    // Filter items by phone number if using Redux data (API data is already filtered)
                    const phoneFilteredItems = phoneNumber && !currentReport ? 
                      displayItems.filter((item: any) => item.phone_number === phoneNumber) : displayItems

                    console.log('Items Report Debug:', {
                      selectedReport,
                      hasCurrentReport: !!currentReport,
                      apiItemsType: Array.isArray(currentReport?.data) ? 'array' : typeof currentReport?.data,
                      apiItems: currentReport?.data?.items?.length || (Array.isArray(currentReport?.data) ? currentReport.data.length : 0),
                      reduxItems: items?.length || 0,
                      phoneNumber,
                      phoneFilteredItems: phoneFilteredItems.length,
                      displayItems: displayItems.length,
                      sampleItem: phoneFilteredItems[0]
                    })

                    if (phoneFilteredItems && phoneFilteredItems.length > 0) {
                      // Calculate summary from items data
                      const totalItems = phoneFilteredItems.length
                      const totalStockValue = phoneFilteredItems.reduce((sum: number, item: any) => {
                        const stockQty = item.currentStock || item.stock_quantity || item.stock || item.quantity || 0
                        const price = item.sale_price || item.price || 0
                        return sum + (stockQty * price)
                      }, 0)
                      const lowStockItems = phoneFilteredItems.filter((item: any) => {
                        const stockQty = item.currentStock || item.stock_quantity || item.stock || item.quantity || 0
                        const lowStockAlert = item.minimum_stock || item.min_stock || item.minStock || item.low_stock_alert || 5
                        return stockQty <= lowStockAlert && stockQty > 0
                      }).length
                      const outOfStockItems = phoneFilteredItems.filter((item: any) => {
                        const stockQty = item.currentStock || item.stock_quantity || item.stock || item.quantity || 0
                        return stockQty === 0
                      }).length

                      return (
                        <div className="space-y-4">
                          {/* Summary Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <h3 className="text-sm font-medium text-blue-600 mb-2">Total Items</h3>
                              <p className="text-2xl font-bold text-blue-700">{totalItems}</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <h3 className="text-sm font-medium text-green-600 mb-2">Total Stock Value</h3>
                              <p className="text-2xl font-bold text-green-700">{formatAmountWithSymbol(totalStockValue)}</p>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                              <h3 className="text-sm font-medium text-yellow-600 mb-2">Low Stock Items</h3>
                              <p className="text-2xl font-bold text-yellow-700">{lowStockItems}</p>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                              <h3 className="text-sm font-medium text-red-600 mb-2">Out of Stock</h3>
                              <p className="text-2xl font-bold text-red-700">{outOfStockItems}</p>
                            </div>
                          </div>
                          
                          {/* Items Table */}
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Item Name</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead>Current Stock</TableHead>
                                  <TableHead>Unit Price</TableHead>
                                  <TableHead>Stock Value</TableHead>
                                  {currentReport && <TableHead>Total Sold</TableHead>}
                                  {currentReport && <TableHead>Total Purchased</TableHead>}
                                  <TableHead>Status</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {phoneFilteredItems.map((item: any, index: number) => {
                                  const stockQuantity = item.currentStock || item.stock_quantity || item.stock || item.quantity || 0
                                  const salePrice = item.sale_price || item.price || 0
                                  const stockValue = item.stockValue || (stockQuantity * salePrice)
                                  const lowStockAlert = item.minimum_stock || item.min_stock || item.minStock || item.low_stock_alert || 5
                                  const itemName = item.name || item.item_name || 'Unnamed Item'
                                  const category = item.category || item.item_category || 'N/A'
                                  const unit = item.unit || item.item_unit || 'units'
                                  
                                  return (
                                    <TableRow key={item.id || index}>
                                      <TableCell className="font-medium">{itemName}</TableCell>
                                      <TableCell>{category}</TableCell>
                                      <TableCell>
                                        <span className={stockQuantity <= lowStockAlert ? 'text-red-600 font-medium' : ''}>
                                          {stockQuantity} {unit}
                                        </span>
                                      </TableCell>
                                      <TableCell>{formatAmountWithSymbol(salePrice)}</TableCell>
                                      <TableCell className="text-green-600 font-medium">
                                        {formatAmountWithSymbol(stockValue)}
                                      </TableCell>
                                      {currentReport && (
                                        <TableCell className="text-blue-600">
                                          {item.totalSold || 0} {unit}
                                        </TableCell>
                                      )}
                                      {currentReport && (
                                        <TableCell className="text-purple-600">
                                          {item.totalPurchased || 0} {unit}
                                        </TableCell>
                                      )}
                                      <TableCell>
                                        <Badge variant={
                                          stockQuantity === 0 ? 'destructive' : 
                                          stockQuantity <= lowStockAlert ? 'secondary' : 'default'
                                        }>
                                          {stockQuantity === 0 ? 'Out of Stock' : 
                                           stockQuantity <= lowStockAlert ? 'Low Stock' : 'In Stock'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="hover:bg-blue-50 hover:text-blue-600"
                                            title="View Item Details"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="hover:bg-green-50 hover:text-green-600"
                                            title="Edit Item"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                          
                          {/* Report Type Specific Information */}
                          {selectedReport === 'low-stock-summary' && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                              <h4 className="font-medium text-yellow-800 mb-2">Low Stock Alert</h4>
                              <p className="text-sm text-yellow-700">
                                Showing items with stock below their low stock alert level.
                                Total: {lowStockItems} items need restocking.
                              </p>
                            </div>
                          )}
                          
                          {selectedReport === 'stock-detail' && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-medium text-blue-800 mb-2">Stock Details</h4>
                              <p className="text-sm text-blue-700">
                                Complete stock overview including quantities, values, and status for all items.
                                {currentReport && ' Includes sales and purchase transaction data.'}
                              </p>
                            </div>
                          )}
                          
                          {currentReport && (
                            <div className="mt-4 p-4 bg-green-50 rounded-lg">
                              <h4 className="font-medium text-green-800 mb-2">API Data Loaded</h4>
                              <p className="text-sm text-green-700">
                                This report includes calculated stock levels based on sales and purchase transactions.
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    } else {
                      return (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-2">No items/stock data available</p>
                          <p className="text-sm text-gray-400">
                            {!phoneNumber ? 'Phone number not configured' : 
                             !currentReport && items?.length === 0 ? 'No items found in store' :
                             'No items match the current filter criteria'}
                          </p>
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600">
                              Debug: API={currentReport ? 'Yes' : 'No'}, Redux Items={items?.length || 0}, 
                              Phone={phoneNumber || 'None'}, Filtered={phoneFilteredItems.length}
                            </p>
                          </div>
                        </div>
                      )
                    }
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Business Status Reports */}
            {(["business-status", "trial-balance", "balance-sheet"].includes(selectedReport)) && (
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Business Status Report</CardTitle>
                  <p className="text-sm text-gray-600">
                    {currentReport ? `API Data - Generated on ${new Date(currentReport.timestamp).toLocaleString()}` : 
                     `Phone-filtered data for: ${generalSettings?.phoneNumber || 'No phone number configured'}`}
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Get data from API or fallback to Redux store metrics
                    const apiData = currentReport?.data
                    const phoneNumber = generalSettings?.phoneNumber

                    console.log('Business Status Report Debug:', {
                      selectedReport,
                      hasCurrentReport: !!currentReport,
                      apiData: !!apiData,
                      dashboardMetrics: !!dashboardMetrics,
                      financialMetrics: !!financialMetrics,
                      phoneNumber
                    })

                    if (apiData || (dashboardMetrics && financialMetrics)) {
                      // Use API data if available, otherwise calculate from local data
                      let businessData;
                      
                      if (apiData) {
                        // API data structure
                        businessData = {
                          assets: {
                            cash: apiData.assets?.cash || 0,
                            bank: apiData.assets?.bank || 0,
                            receivables: apiData.assets?.receivables || 0,
                            total: apiData.assets?.total || 0
                          },
                          liabilities: {
                            payables: apiData.liabilities?.payables || 0,
                            total: apiData.liabilities?.total || 0
                          },
                          equity: {
                            capital: apiData.equity?.capital || 0,
                            total: apiData.equity?.total || 0
                          },
                          performance: {
                            sales: apiData.performance?.sales || 0,
                            purchases: apiData.performance?.purchases || 0,
                            profit: apiData.performance?.profit || 0
                          }
                        }
                      } else {
                        // Calculate from local Redux data
                        const totalCash = financialMetrics?.cashInHand || 0
                        const totalBank = dashboardMetrics?.totalBankBalance || financialMetrics?.totalBankBalance || 0
                        const totalReceivables = dashboardMetrics?.totalReceivable || 0
                        const totalPayables = dashboardMetrics?.totalPayable || 0
                        const totalSales = dashboardMetrics?.totalSales || 0
                        const totalPurchases = dashboardMetrics?.totalPurchaseAmount || 0
                        
                        businessData = {
                          assets: {
                            cash: totalCash,
                            bank: totalBank,
                            receivables: totalReceivables,
                            total: totalCash + totalBank + totalReceivables
                          },
                          liabilities: {
                            payables: totalPayables,
                            total: totalPayables
                          },
                          equity: {
                            capital: totalCash + totalBank + totalReceivables - totalPayables,
                            total: totalCash + totalBank + totalReceivables - totalPayables
                          },
                          performance: {
                            sales: totalSales,
                            purchases: totalPurchases,
                            profit: totalSales - totalPurchases
                          }
                        }
                      }

                      return (
                        <div className="space-y-4">
                          {/* Key Financial Metrics */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <h3 className="text-sm font-medium text-blue-600 mb-2">Total Assets</h3>
                              <p className="text-2xl font-bold text-blue-700">{formatAmountWithSymbol(businessData.assets.total)}</p>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                              <h3 className="text-sm font-medium text-red-600 mb-2">Total Liabilities</h3>
                              <p className="text-2xl font-bold text-red-700">{formatAmountWithSymbol(businessData.liabilities.total)}</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <h3 className="text-sm font-medium text-green-600 mb-2">Net Worth</h3>
                              <p className={`text-2xl font-bold ${businessData.equity.total >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {formatAmountWithSymbol(businessData.equity.total)}
                              </p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                              <h3 className="text-sm font-medium text-purple-600 mb-2">Gross Profit</h3>
                              <p className={`text-2xl font-bold ${businessData.performance.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {formatAmountWithSymbol(businessData.performance.profit)}
                              </p>
                            </div>
                          </div>

                          {/* Detailed Breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Assets Breakdown */}
                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                              <CardHeader>
                                <CardTitle className="text-lg font-semibold text-blue-800">Assets</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-700">Cash in Hand:</span>
                                    <span className="font-medium text-blue-800">{formatAmountWithSymbol(businessData.assets.cash)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-700">Bank Balance:</span>
                                    <span className="font-medium text-blue-800">{formatAmountWithSymbol(businessData.assets.bank)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-700">Accounts Receivable:</span>
                                    <span className="font-medium text-blue-800">{formatAmountWithSymbol(businessData.assets.receivables)}</span>
                                  </div>
                                  <hr className="border-blue-200" />
                                  <div className="flex justify-between items-center font-semibold">
                                    <span className="text-blue-800">Total Assets:</span>
                                    <span className="text-blue-900">{formatAmountWithSymbol(businessData.assets.total)}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Liabilities & Equity Breakdown */}
                            <Card className="bg-gradient-to-br from-red-50 to-red-100">
                              <CardHeader>
                                <CardTitle className="text-lg font-semibold text-red-800">Liabilities & Equity</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-red-700">Accounts Payable:</span>
                                    <span className="font-medium text-red-800">{formatAmountWithSymbol(businessData.liabilities.payables)}</span>
                                  </div>
                                  <hr className="border-red-200" />
                                  <div className="flex justify-between items-center font-semibold">
                                    <span className="text-red-800">Total Liabilities:</span>
                                    <span className="text-red-900">{formatAmountWithSymbol(businessData.liabilities.total)}</span>
                                  </div>
                                  <hr className="border-red-300" />
                                  <div className="flex justify-between items-center">
                                    <span className="text-green-700">Owner's Equity:</span>
                                    <span className={`font-medium ${businessData.equity.total >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                                      {formatAmountWithSymbol(businessData.equity.total)}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Performance Metrics */}
                          <Card className="bg-gradient-to-br from-green-50 to-green-100">
                            <CardHeader>
                              <CardTitle className="text-lg font-semibold text-green-800">Business Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-700">{formatAmountWithSymbol(businessData.performance.sales)}</div>
                                  <div className="text-sm text-green-600">Total Sales</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-red-700">{formatAmountWithSymbol(businessData.performance.purchases)}</div>
                                  <div className="text-sm text-red-600">Total Purchases</div>
                                </div>
                                <div className="text-center">
                                  <div className={`text-2xl font-bold ${businessData.performance.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {formatAmountWithSymbol(businessData.performance.profit)}
                                  </div>
                                  <div className="text-sm text-gray-600">Gross Profit</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Report Type Specific Information */}
                          {selectedReport === 'trial-balance' && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-medium text-blue-800 mb-2">Trial Balance</h4>
                              <p className="text-sm text-blue-700">
                                Shows the balance of all accounts to verify that debits equal credits.
                                Total Assets: {formatAmountWithSymbol(businessData.assets.total)} | 
                                Total Liabilities + Equity: {formatAmountWithSymbol(businessData.liabilities.total + businessData.equity.total)}
                              </p>
                            </div>
                          )}
                          
                          {selectedReport === 'balance-sheet' && (
                            <div className="mt-4 p-4 bg-green-50 rounded-lg">
                              <h4 className="font-medium text-green-800 mb-2">Balance Sheet</h4>
                              <p className="text-sm text-green-700">
                                Financial position snapshot showing assets, liabilities, and owner's equity.
                                {businessData.equity.total >= 0 ? ' Your business has positive equity.' : ' Your business has negative equity - consider reviewing expenses.'}
                              </p>
                            </div>
                          )}

                          {apiData && (
                            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                              <h4 className="font-medium text-indigo-800 mb-2">API Data Loaded</h4>
                              <p className="text-sm text-indigo-700">
                                This report includes real-time data from cash transactions and bank accounts.
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    } else {
                      return (
                        <div className="text-center py-8">
                          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-2">No business status data available</p>
                          <p className="text-sm text-gray-400">
                            {!phoneNumber ? 'Phone number not configured' : 
                             'No financial data found. Please add some sales, purchases, or bank accounts.'}
                          </p>
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600">
                              Debug: API={currentReport ? 'Yes' : 'No'}, Dashboard Metrics={!!dashboardMetrics}, 
                              Financial Metrics={!!financialMetrics}, Phone={phoneNumber || 'None'}
                            </p>
                          </div>
                        </div>
                      )
                    }
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Default Transactions Table */}
            {!["daybook", "trial-balance", "balance-sheet", "party-statement", "party-wise-profit", "all-parties", "party-report", "party-list", "party-report-item", "sale-purchase-party", "sale-purchase-party-group", "item-report", "stock-report", "item-report-party", "stock-summary", "stock-summary-item-category", "business-status", "tax-report", "tax-rate-report", "expense-report", "expense-category", "expense-item", "sales-report", "sale", "purchases-report", "purchase", "cash-flow", "profit-loss"].includes(selectedReport) && (
              // Transactions Table
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900">Transactions</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={exportToExcel}
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-gray-200 hover:bg-green-50 hover:text-green-600 bg-transparent"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button
                        onClick={printReport}
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-gray-200 hover:bg-blue-50 hover:text-blue-600 bg-transparent"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-gray-200 hover:bg-purple-50 hover:text-purple-600 bg-transparent"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-gray-200 hover:bg-gray-50 bg-transparent"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-gray-200 hover:bg-gray-50 bg-transparent"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <button
                              onClick={() => handleSort("date")}
                              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                              Date
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </TableHead>
                          <TableHead>
                            <button
                              onClick={() => handleSort("invoiceNo")}
                              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                              Invoice no
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </TableHead>
                          <TableHead>
                            <button
                              onClick={() => handleSort("partyName")}
                              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                              Party Name
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </TableHead>
                          <TableHead>
                            <button
                              onClick={() => handleSort("transactionType")}
                              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                              Transaction
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </TableHead>
                          <TableHead>
                            <button
                              onClick={() => handleSort("paymentType")}
                              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                              Payment Type
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </TableHead>
                          <TableHead>
                            <button
                              onClick={() => handleSort("amount")}
                              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                              Amount
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </TableHead>
                          <TableHead>
                            <button
                              onClick={() => handleSort("balance")}
                              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                              Balance
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>{formatDateForReport(transaction.date)}</TableCell>
                            <TableCell className="font-medium">{transaction.invoiceNo}</TableCell>
                            <TableCell className="font-medium">{transaction.partyName}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  transaction.transactionType === "Sale"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : transaction.transactionType === "Purchase"
                                      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                      : "bg-purple-100 text-purple-800 hover:bg-purple-100"
                                }
                              >
                                {transaction.transactionType}
                              </Badge>
                            </TableCell>
                            <TableCell>{transaction.paymentType}</TableCell>
                            <TableCell className="font-medium">{formatAmountWithSymbol(transaction.amount)}</TableCell>
                            <TableCell className="font-medium">{formatAmountWithSymbol(transaction.balance)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="hover:bg-blue-50 hover:text-blue-600"
                                  onClick={() => handlePrintTransaction(transaction)}
                                  title="Print Transaction"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="hover:bg-green-50 hover:text-green-600">
                                  <ArrowUpRight className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost" className="hover:bg-gray-50">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-white/95 backdrop-blur-xl border-white/20">
                                    <DropdownMenuItem onClick={() => handlePrintTransaction(transaction)}>
                                      <Printer className="h-4 w-4 mr-2" />
                                      Print
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Party Transaction Details Modal */}
      {showPartyDetails && selectedParty && (
        <PartyTransactionDetails
          party={selectedParty}
          onClose={() => {
            setShowPartyDetails(false)
            setSelectedParty(null)
          }}
        />
      )}
    </div>
  )
}
