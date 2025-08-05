"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Download,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Building,
  DollarSign,
  Activity,
  FileText,
  BarChart3,
} from "lucide-react"
import { useAppSelector } from "@/lib/store/hooks"
import { selectAllSales } from "@/lib/store/slices/salesSlice"
import { selectAllPurchases } from "@/lib/store/slices/purchasesSlice"
import { selectAllParties } from "@/lib/store/slices/partiesSlice"
import { selectAllItems } from "@/lib/store/slices/itemsSlice"

interface PartyReportProps {
  reportType: string
  dateRange: string
  firmFilter: string
  searchTerm: string
  currentReport?: any
  onViewPartyDetails?: (party: any) => void
}

export default function PartyReports({ reportType, dateRange, firmFilter, searchTerm, currentReport, onViewPartyDetails }: PartyReportProps) {
  const sales = useAppSelector(selectAllSales)
  const purchases = useAppSelector(selectAllPurchases)
  const parties = useAppSelector(selectAllParties)
  const items = useAppSelector(selectAllItems)
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Debug logging
  console.log('🔍 PartyReports Debug:', {
    reportType,
    partiesCount: parties?.length || 0,
    salesCount: sales?.length || 0,
    purchasesCount: purchases?.length || 0,
    currentReport: currentReport?.data ? 'Has data' : 'No data',
    searchTerm
  })

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB")
  }

  // Calculate party statistics
  const partyStats = useMemo(() => {
    // Use currentReport data if available, otherwise use Redux store data
    const reportParties = currentReport?.data?.parties || parties
    const reportSales = currentReport?.data?.sales || sales  
    const reportPurchases = currentReport?.data?.purchases || purchases
    
    return reportParties.map((party: any) => {
      // Handle both field naming conventions
      const partyName = party.name || party.party_name || 'Unknown'
      const partyType = party.type || party.party_type || 'customer'
      const partyPhone = party.phone || party.contact_number || ''
      const partyEmail = party.email || ''
      const partyBalance = party.balance || party.current_balance || 0
      const partyStatus = party.status || (party.is_active ? 'active' : 'inactive') || 'active'
      
      const partySales = reportSales.filter((sale: any) => 
        sale.customerName === partyName || sale.customer_name === partyName
      )
      const partyPurchases = reportPurchases.filter((purchase: any) => 
        purchase.supplier_id === party.id || purchase.supplier_name === partyName
      )
      
      const totalSales = partySales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0)
      const totalPurchases = partyPurchases.reduce((sum: number, purchase: any) => sum + (Number(purchase.total) || 0), 0)
      
      const totalCost = partySales.reduce((sum: number, sale: any) => {
        return sum + (sale.items || []).reduce((itemSum: number, item: any) => {
          const itemData = items.find(i => i.id === item.itemId)
          return itemSum + (item.quantity * (itemData?.cost || 0))
        }, 0)
      }, 0)
      
      const profit = totalSales - totalCost
      const profitMargin = totalSales > 0 ? (profit / totalSales) * 100 : 0
      
      return {
        ...party,
        // Normalize field names
        name: partyName,
        type: partyType,
        phone: partyPhone,
        email: partyEmail,
        balance: partyBalance,
        status: partyStatus,
        // Calculated fields
        totalSales,
        totalPurchases,
        totalCost,
        profit,
        profitMargin,
        salesCount: partySales.length,
        purchasesCount: partyPurchases.length,
        lastTransaction: party.lastTransaction || party.createdAt || party.created_at,
      }
    })
  }, [parties, sales, purchases, items, currentReport])

  // Filter parties based on search term
  const filteredParties = useMemo(() => {
    const filtered = partyStats.filter((party: any) => {
      const matchesSearch = !searchTerm || 
                          party.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          party.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          party.phone?.includes(searchTerm)
      
      // More inclusive type matching - show all party types for most reports
      const matchesType = reportType === "all-parties" || 
                         reportType === "party-statement" || // Show all parties for party statement
                         reportType === "party-wise-profit" || // Show all parties for profit analysis
                         reportType === "party-report-item" ||
                         reportType === "sale-purchase-party" ||
                         reportType === "sale-purchase-party-group"
      
      return matchesSearch && matchesType
    })
    
    console.log('🔍 Filtering Debug:', {
      reportType,
      searchTerm,
      totalPartyStats: partyStats.length,
      filteredCount: filtered.length,
      samplePartyStats: partyStats.slice(0, 2).map((p: any) => ({ name: p.name, type: p.type, email: p.email })),
      sampleFiltered: filtered.slice(0, 2).map((p: any) => ({ name: p.name, type: p.type, email: p.email }))
    })
    
    return filtered
  }, [partyStats, searchTerm, reportType])

  // Sort parties
  const sortedParties = useMemo(() => {
    const sorted = [...filteredParties].sort((a, b) => {
      const aValue = a[sortField as keyof typeof a]
      const bValue = b[sortField as keyof typeof b]
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })
    
    // Debug logging
    console.log('🔍 Filtered & Sorted Parties:', {
      originalParties: parties?.length || 0,
      filteredParties: filteredParties.length,
      sortedParties: sorted.length,
      reportType,
      sortField,
      sortDirection,
      sampleParty: sorted[0] ? { name: sorted[0].name, type: sorted[0].type } : 'None'
    })
    
    return sorted
  }, [filteredParties, sortField, sortDirection, parties, reportType])

  // Calculate summary statistics (moved after sortedParties definition)
  const summaryStats = useMemo(() => {
    const totalParties = sortedParties.length
    const totalSales = sortedParties.reduce((sum, p) => sum + p.totalSales, 0)
    const totalPurchases = sortedParties.reduce((sum, p) => sum + p.totalPurchases, 0)
    const totalProfit = sortedParties.reduce((sum, p) => sum + p.profit, 0)
    const totalBalance = sortedParties.reduce((sum, p) => sum + p.balance, 0)
    const activeParties = sortedParties.filter(p => p.status === 'active').length

    return {
      totalParties,
      totalSales,
      totalPurchases,
      totalProfit,
      totalBalance,
      activeParties,
      avgProfitMargin: totalSales > 0 ? (totalProfit / totalSales) * 100 : 0
    }
  }, [sortedParties])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const exportToExcel = () => {
    const headers = ["Party Name", "Email", "Phone", "Type", "Total Sales", "Total Purchases", "Profit", "Balance"]
    const csvContent = [
      headers.join(","),
      ...sortedParties.map((party) =>
        [party.name, party.email, party.phone, party.type, party.totalSales, party.totalPurchases, party.profit, party.balance].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printReport = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .amount { text-align: right; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Party Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Total Sales</th>
              <th>Total Purchases</th>
              <th>Profit</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${sortedParties.map((party) => `
              <tr>
                <td>${party.name}</td>
                <td>${party.email}</td>
                <td>${party.phone}</td>
                <td>${party.type}</td>
                <td class="amount">${formatCurrency(party.totalSales)}</td>
                <td class="amount">${formatCurrency(party.totalPurchases)}</td>
                <td class="amount">${formatCurrency(party.profit)}</td>
                <td class="amount">${formatCurrency(party.balance)}</td>
              </tr>
            `).join("")}
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
  }

  // Render different report types
  const SummaryCard = () => (
    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Parties</p>
            <p className="text-2xl font-bold text-blue-600">{summaryStats.totalParties}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.totalSales)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Profit</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(summaryStats.totalProfit)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Avg Profit Margin</p>
            <p className="text-2xl font-bold text-purple-600">{summaryStats.avgProfitMargin.toFixed(2)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderPartyStatement = () => (
    <>
      {/* Show API report data if available */}
      {currentReport?.data && (
        <Card className="bg-blue-50/70 backdrop-blur-xl border-blue-200/50 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">
              {currentReport.title} - API Data
            </CardTitle>
            <p className="text-sm text-blue-700">
              Generated on {new Date(currentReport.generatedAt).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            {currentReport.data.summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-blue-100 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-600 mb-2">Total Parties</h3>
                  <p className="text-2xl font-bold text-blue-700">{currentReport.data.summary.totalParties || 0}</p>
                </div>
                <div className="text-center p-4 bg-green-100 rounded-lg">
                  <h3 className="text-sm font-medium text-green-600 mb-2">Total Receivables</h3>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(currentReport.data.summary.totalReceivables || 0)}</p>
                </div>
                <div className="text-center p-4 bg-red-100 rounded-lg">
                  <h3 className="text-sm font-medium text-red-600 mb-2">Total Payables</h3>
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(currentReport.data.summary.totalPayables || 0)}</p>
                </div>
              </div>
            )}
            {currentReport.data.parties && currentReport.data.parties.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Party Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentReport.data.parties.map((party: any, index: number) => (
                      <TableRow key={party.id || index}>
                        <TableCell className="font-medium">
                          <button 
                            onClick={() => onViewPartyDetails?.(party)}
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {party.name}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant={party.party_type === 'customer' ? 'default' : 'secondary'}>
                            {party.party_type || party.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{party.contact_number || party.phone || 'N/A'}</TableCell>
                        <TableCell className={party.balance > 0 ? 'text-green-600' : party.balance < 0 ? 'text-red-600' : 'text-gray-600'}>
                          {formatCurrency(party.balance || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={party.balance === 0 ? 'outline' : party.balance > 0 ? 'default' : 'destructive'}>
                            {party.balance === 0 ? 'Settled' : party.balance > 0 ? 'To Receive' : 'To Pay'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Local calculated data */}
      <SummaryCard />
      <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">Party Statement</CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={exportToExcel} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-green-50 hover:text-green-600 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={printReport} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-blue-50 hover:text-blue-600 bg-transparent">
                <Printer className="h-4 w-4 mr-2" />
                Print
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
                    <div 
                      onClick={() => handleSort("name")} 
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      Party Name
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>
                    <div 
                      onClick={() => handleSort("totalSales")} 
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      Total Sales
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      onClick={() => handleSort("balance")} 
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      Balance
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedParties.length > 0 ? (
                  sortedParties.map((party) => (
                    <TableRow key={party.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium">
                        <button 
                          onClick={() => onViewPartyDetails?.(party)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {party.name}
                        </button>
                      </TableCell>
                      <TableCell>{party.email}</TableCell>
                      <TableCell>{party.phone}</TableCell>
                      <TableCell>
                        <Badge className={
                          party.type === "customer" ? "bg-green-100 text-green-800" :
                          party.type === "supplier" ? "bg-blue-100 text-blue-800" :
                          "bg-purple-100 text-purple-800"
                        }>
                          {party.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(party.totalSales)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(party.balance)}</TableCell>
                      <TableCell>
                        <Badge className={party.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {party.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="hover:bg-gray-50">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white/95 backdrop-blur-xl border-white/20">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
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
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="space-y-2">
                        <p className="text-gray-500">No parties found for "{reportType}"</p>
                        <p className="text-sm text-gray-400">
                          Total parties in store: {parties?.length || 0} | 
                          Search term: "{searchTerm}" | 
                          Report type: {reportType}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )

  const renderPartyWiseProfit = () => (
    <>
      <SummaryCard />
      <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">Party wise Profit & Loss</CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={exportToExcel} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-green-50 hover:text-green-600 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={printReport} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-blue-50 hover:text-blue-600 bg-transparent">
                <Printer className="h-4 w-4 mr-2" />
                Print
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
                    <div 
                      onClick={() => handleSort("name")} 
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      Party Name
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      onClick={() => handleSort("totalSales")} 
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      Total Sales
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      onClick={() => handleSort("totalCost")} 
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      Total Cost
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      onClick={() => handleSort("profit")} 
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      Profit/Loss
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Profit Margin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedParties.map((party) => (
                  <TableRow key={party.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-medium">
                      <button 
                        onClick={() => onViewPartyDetails?.(party)}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {party.name}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(party.totalSales)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(party.totalCost)}</TableCell>
                    <TableCell className="font-medium">
                      <span className={party.profit >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(party.profit)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={party.profitMargin >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {party.profitMargin.toFixed(2)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="hover:bg-gray-50">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white/95 backdrop-blur-xl border-white/20">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Chart
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )

  const renderAllParties = () => (
    <>
      <SummaryCard />
      <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">All Parties</CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={exportToExcel} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-green-50 hover:text-green-600 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={printReport} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-blue-50 hover:text-blue-600 bg-transparent">
                <Printer className="h-4 w-4 mr-2" />
                Print
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
                    <div 
                      onClick={() => handleSort("name")} 
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      Party Name
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>
                    <div 
                      onClick={() => handleSort("totalSales")} 
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      Total Sales
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      onClick={() => handleSort("salesCount")} 
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      Total Orders
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedParties.map((party) => (
                  <TableRow key={party.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-medium">
                      <button 
                        onClick={() => onViewPartyDetails?.(party)}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {party.name}
                      </button>
                    </TableCell>
                    <TableCell>{party.email}</TableCell>
                    <TableCell>{party.phone}</TableCell>
                    <TableCell>
                      <Badge className={
                        party.type === "customer" ? "bg-green-100 text-green-800" :
                        party.type === "supplier" ? "bg-blue-100 text-blue-800" :
                        "bg-purple-100 text-purple-800"
                      }>
                        {party.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(party.totalSales)}</TableCell>
                    <TableCell>{party.salesCount}</TableCell>
                    <TableCell>
                      <Badge className={party.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {party.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="hover:bg-gray-50">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white/95 backdrop-blur-xl border-white/20">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="h-4 w-4 mr-2" />
                            View Transactions
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )

  const renderPartyReportByItem = () => (
    <>
      <SummaryCard />
      <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">Party Report By Item</CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={exportToExcel} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-green-50 hover:text-green-600 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={printReport} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-blue-50 hover:text-blue-600 bg-transparent">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedParties.flatMap((party) => {
                  const partySales = sales.filter(sale => sale.customerName === party.name)
                  const itemMap = new Map()
                  partySales.forEach(sale => {
                    (sale.items || []).forEach(item => {
                      if (!itemMap.has(item.itemName)) {
                        itemMap.set(item.itemName, { quantity: 0, total: 0 })
                      }
                      const entry = itemMap.get(item.itemName)
                      entry.quantity += item.quantity
                      entry.total += item.total
                    })
                  })
                  return Array.from(itemMap.entries()).map(([itemName, data]) => (
                    <TableRow key={party.id + itemName}>
                      <TableCell>{party.name}</TableCell>
                      <TableCell>{itemName}</TableCell>
                      <TableCell>{data.quantity}</TableCell>
                      <TableCell>{formatCurrency(data.total)}</TableCell>
                    </TableRow>
                  ))
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )

  const renderSalePurchaseByParty = () => (
    <>
      <SummaryCard />
      <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">Sale Purchase By Party</CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={exportToExcel} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-green-50 hover:text-green-600 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={printReport} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-blue-50 hover:text-blue-600 bg-transparent">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Total Purchases</TableHead>
                  <TableHead>Net Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedParties.map((party) => {
                  const totalSales = sales.filter(sale => sale.customerName === party.name).reduce((sum, sale) => sum + sale.total, 0)
                  const totalPurchases = purchases.filter(purchase => purchase.supplier_id === party.id).reduce((sum, purchase) => sum + (Number(purchase.total) || 0), 0)
                  const netAmount = totalSales - totalPurchases
                  return (
                    <TableRow key={party.id}>
                      <TableCell className="font-medium">
                        <button 
                          onClick={() => onViewPartyDetails?.(party)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {party.name}
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(totalSales)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(totalPurchases)}</TableCell>
                      <TableCell className="font-medium">
                        <span className={netAmount >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(netAmount)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )

  const renderSalePurchaseByPartyGroup = () => (
    <>
      <SummaryCard />
      <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">Sale Purchase By Party Group</CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={exportToExcel} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-green-50 hover:text-green-600 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={printReport} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-blue-50 hover:text-blue-600 bg-transparent">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Party Count</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Total Purchases</TableHead>
                  <TableHead>Net Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Customers</TableCell>
                  <TableCell>{sortedParties.filter(p => p.type === 'customer' || p.type === 'both').length}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(sortedParties.filter(p => p.type === 'customer' || p.type === 'both').reduce((sum, p) => sum + p.totalSales, 0))}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(sortedParties.filter(p => p.type === 'customer' || p.type === 'both').reduce((sum, p) => sum + p.totalPurchases, 0))}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(sortedParties.filter(p => p.type === 'customer' || p.type === 'both').reduce((sum, p) => sum + p.totalSales - p.totalPurchases, 0))}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Suppliers</TableCell>
                  <TableCell>{sortedParties.filter(p => p.type === 'supplier' || p.type === 'both').length}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(sortedParties.filter(p => p.type === 'supplier' || p.type === 'both').reduce((sum, p) => sum + p.totalSales, 0))}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(sortedParties.filter(p => p.type === 'supplier' || p.type === 'both').reduce((sum, p) => sum + p.totalPurchases, 0))}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(sortedParties.filter(p => p.type === 'supplier' || p.type === 'both').reduce((sum, p) => sum + p.totalSales - p.totalPurchases, 0))}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )

  // Render based on report type
  switch (reportType) {
    case "party-statement":
      return renderPartyStatement()
    case "party-wise-profit":
      return renderPartyWiseProfit()
    case "all-parties":
      return renderAllParties()
    case "party-report-item":
      return renderPartyReportByItem()
    case "sale-purchase-party":
      return renderSalePurchaseByParty()
    case "sale-purchase-party-group":
      return renderSalePurchaseByPartyGroup()
    default:
      return renderPartyStatement()
  }
} 