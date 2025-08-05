"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Download,
  Printer,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { useAppSelector } from "@/lib/store/hooks"
import { selectAllSales } from "@/lib/store/slices/salesSlice"
import { selectAllPurchases } from "@/lib/store/slices/purchasesSlice"
import { Party } from "@/lib/store/slices/partiesSlice"

interface PartyTransactionDetailsProps {
  party: Party
  onClose: () => void
}

interface Transaction {
  id: string
  date: string
  invoiceNo: string
  type: "Sale" | "Purchase" | "Payment" | "Receipt"
  amount: number
  balance: number
  status: string
  description: string
}

export default function PartyTransactionDetails({ party, onClose }: PartyTransactionDetailsProps) {
  const sales = useAppSelector(selectAllSales)
  const purchases = useAppSelector(selectAllPurchases)
  const [sortField, setSortField] = useState<keyof Transaction>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

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

  // Get party transactions
  const partyTransactions = useMemo(() => {
    const salesTransactions: Transaction[] = sales
      .filter(sale => sale.customerName === party.name)
      .map(sale => ({
        id: sale.id,
        date: sale.createdAt,
        invoiceNo: sale.invoiceNumber,
        type: "Sale" as const,
        amount: sale.total,
        balance: sale.total - (sale.paymentStatus === "paid" ? sale.total : 0),
        status: sale.paymentStatus,
        description: `Sale to ${party.name}`,
      }))

    const purchaseTransactions: Transaction[] = purchases
      .filter(purchase => purchase.supplier_id === party.id)
      .map(purchase => ({
        id: purchase.id,
        date: purchase.created_at || new Date().toISOString(),
        invoiceNo: purchase.bill_number || '',
        type: "Purchase" as const,
        amount: Number(purchase.total) || 0,
        balance: (Number(purchase.total) || 0) - (purchase.payment_status === "paid" ? (Number(purchase.total) || 0) : 0),
        status: purchase.payment_status || 'pending',
        description: `Purchase from ${party.name}`,
      }))

    return [...salesTransactions, ...purchaseTransactions]
  }, [sales, purchases, party])

  // Calculate summary
  const summary = useMemo(() => {
    const totalSales = partyTransactions
      .filter(t => t.type === "Sale")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalPurchases = partyTransactions
      .filter(t => t.type === "Purchase")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalReceived = partyTransactions
      .filter(t => t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const balance = totalSales - totalReceived

    return {
      totalSales,
      totalPurchases,
      totalReceived,
      balance,
      transactionCount: partyTransactions.length,
    }
  }, [partyTransactions])

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    return [...partyTransactions].sort((a, b) => {
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
  }, [partyTransactions, sortField, sortDirection])

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const exportToExcel = () => {
    const headers = ["Date", "Invoice No", "Type", "Amount", "Balance", "Status"]
    const csvContent = [
      headers.join(","),
      ...sortedTransactions.map((t) =>
        [formatDate(t.date), t.invoiceNo, t.type, t.amount, t.balance, t.status].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${party.name}-transactions-${new Date().toISOString().split("T")[0]}.csv`)
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
        <title>${party.name} - Transaction History</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 20px; display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .amount { text-align: right; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${party.name} - Transaction History</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="summary">
          <div><strong>Total Sales:</strong> ${formatCurrency(summary.totalSales)}</div>
          <div><strong>Total Received:</strong> ${formatCurrency(summary.totalReceived)}</div>
          <div><strong>Balance:</strong> ${formatCurrency(summary.balance)}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice No</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${sortedTransactions.map((t) => `
              <tr>
                <td>${formatDate(t.date)}</td>
                <td>${t.invoiceNo}</td>
                <td>${t.type}</td>
                <td class="amount">${formatCurrency(t.amount)}</td>
                <td class="amount">${formatCurrency(t.balance)}</td>
                <td>${t.status}</td>
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{party.name} - Transaction Details</h2>
              <p className="text-gray-600">{party.email} • {party.phone}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={exportToExcel} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-green-50 hover:text-green-600 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={printReport} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-blue-50 hover:text-blue-600 bg-transparent">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={onClose} size="sm" variant="outline" className="rounded-lg border-gray-200 hover:bg-gray-50 bg-transparent">
                Close
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Sales</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.totalSales)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Received</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(summary.totalReceived)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Balance</p>
                    <p className="text-2xl font-bold text-orange-900">{formatCurrency(summary.balance)}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Transactions</p>
                    <p className="text-2xl font-bold text-purple-900">{summary.transactionCount}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div 
                          onClick={() => handleSort("date")} 
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          Date
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div 
                          onClick={() => handleSort("invoiceNo")} 
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          Invoice No
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div 
                          onClick={() => handleSort("type")} 
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          Type
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div 
                          onClick={() => handleSort("amount")} 
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          Amount
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
                      <TableHead>
                        <div 
                          onClick={() => handleSort("status")} 
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          Status
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell className="font-medium">{transaction.invoiceNo}</TableCell>
                        <TableCell>
                          <Badge className={
                            transaction.type === "Sale" ? "bg-green-100 text-green-800" :
                            transaction.type === "Purchase" ? "bg-blue-100 text-blue-800" :
                            "bg-purple-100 text-purple-800"
                          }>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(transaction.balance)}</TableCell>
                        <TableCell>
                          <Badge className={transaction.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                            {transaction.status}
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 