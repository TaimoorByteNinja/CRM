"use client"

import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, ShoppingCart, DollarSign, CheckCircle, AlertCircle, Printer, Edit, Eye, Trash, Download, MoreHorizontal } from "lucide-react"
import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectAllSales, selectSalesStats, deleteSale, setSelectedSale, fetchSales, Sale as SliceSale } from "@/lib/store/slices/salesSlice"
import { Sale as ContextSale } from "@/lib/sales-context"
import { selectActiveTab, setActiveTab, setSearchTerm, selectSearchTerm } from "@/lib/store/slices/uiSlice"
import { showNotification } from "@/lib/store/slices/uiSlice"
import { NotificationHelpers } from "@/lib/notification-helpers"
import { NewSaleDialog } from "@/components/NewSaleDialog"
import { EditSaleDialog } from "@/components/EditSaleDialog"
import { ViewDialog } from "@/components/ViewDialog"
import { InvoiceCustomizationDialog } from "@/components/InvoiceCustomizationDialog"
import { generateInvoicePDF } from "@/lib/invoice-generator"
import { printSaleInvoice } from "@/lib/universal-print"
import { selectGeneralSettings } from "@/lib/store/slices/settingsSlice"
import { formatCurrencyWithSymbol } from "@/lib/country-data"
import { useCurrency } from "@/lib/currency-manager"

// Function to convert SliceSale to ContextSale for components
function convertSaleForComponents(sale: SliceSale): ContextSale {
  return {
    id: sale.id,
    invoiceNumber: sale.invoice_number || sale.invoiceNumber || '',
    customerId: sale.party_id || sale.customerId || '',
    customerName: sale.party_name || sale.customerName || '',
    customerEmail: sale.customerEmail || '',
    customerPhone: sale.customerPhone || '',
    customerAddress: sale.customerAddress || '',
    shipping: false, // Boolean as per ContextSale interface
    items: (sale.items || []).map(item => ({
      id: item.id || '',
      itemId: item.item_id || item.itemId || '',
      itemCode: item.item_id || item.itemId || '', // Adding itemCode property
      itemName: item.item_name || item.itemName || '',
      quantity: item.quantity || 0,
      price: item.unit_price || item.price || 0,
      tax: item.tax_rate || 0, // Adding tax property
      discount: item.discount_amount || item.discount || 0,
      total: item.total_amount || item.total || 0,
    })),
    subtotal: sale.subtotal || 0,
    tax: sale.tax_amount || sale.tax || 0,
    taxRate: sale.taxRate || 0,
    discount: sale.discount_amount || sale.discount || 0,
    total: sale.total_amount || sale.total || 0,
    status: sale.status as "draft" | "sent" | "paid" | "overdue",
    paymentMethod: sale.paymentMethod || '',
    paymentStatus: (() => {
      const status = sale.payment_status || sale.paymentStatus;
      // Map 'partial' and 'unpaid' to 'pending' to match ContextSale interface
      if (status === 'partial' || status === 'unpaid') return 'pending';
      return status as "paid" | "pending";
    })(),
    dueDate: sale.due_date || sale.dueDate || '',
    createdAt: sale.created_at || sale.createdAt || '',
    notes: sale.notes || '',
  };
}
import React from "react"
import { deleteSaleAsync } from "@/lib/store/slices/salesSlice"
import LoadingState from "@/components/LoadingState"

export default function SalePage() {
  const dispatch = useAppDispatch()
  const activeTab = useAppSelector(selectActiveTab)
  const searchTerm = useAppSelector(selectSearchTerm)
  const sales = useAppSelector(selectAllSales)
  const salesStats = useAppSelector(selectSalesStats)
  const salesLoading = useAppSelector((state) => state.sales.loading)
  const generalSettings = useAppSelector(selectGeneralSettings)
  const { formatAmountWithSymbol } = useCurrency()
  const [deleteTarget, setDeleteTarget] = useState(null as null | typeof sales[0]);

  useEffect(() => {
    // Only fetch sales if phone number is available
    if (generalSettings.phoneNumber && generalSettings.phoneNumber.trim() !== '') {
      console.log('📱 Phone number available, fetching sales...', generalSettings.phoneNumber)
      dispatch(fetchSales({}))
    } else {
      console.log('⏳ Waiting for phone number before fetching sales...')
    }
  }, [dispatch, generalSettings.phoneNumber])

  // Debug log when sales change
  useEffect(() => {
    console.log('🔍 Sales state changed:', {
      salesLength: sales.length,
      sales: sales,
      phoneNumber: generalSettings.phoneNumber
    });
    if (sales.length > 0) {
      console.log('📋 First sale details:', sales[0]);
    }
  }, [sales, generalSettings.phoneNumber]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const createSampleData = async () => {
    try {
      const response = await fetch('/api/business-hub/sales/seed', {
        method: 'POST',
      });
      
      if (response.ok) {
        dispatch(showNotification({
          type: 'success',
          message: 'Sample sales data created successfully!',
          category: 'sale',
          actionUrl: '/business-hub/sale',
          priority: 'medium'
        }));
        // Refresh sales data
        dispatch(fetchSales({}));
      } else {
        dispatch(showNotification({
          type: 'error',
          message: 'Failed to create sample data',
          category: 'sale',
          priority: 'high'
        }));
      }
    } catch (error) {
      dispatch(showNotification({
        type: 'error',
        message: 'Error creating sample data',
        category: 'sale',
        priority: 'high'
      }));
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={(tab) => dispatch(setActiveTab(tab))} />

      {/* Main Content */}
      <div className="ml-16 flex flex-col min-h-screen">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-white" />
                    </div>
                    Sales & Invoices
                  </h1>
                  <p className="text-gray-600">Manage your sales transactions</p>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative bg-white rounded-xl p-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-12 pr-4 py-3 w-96 bg-gray-50/50 border-gray-200/50 rounded-lg focus:bg-white transition-all duration-200"
                      placeholder="Search Sales"
                      value={searchTerm}
                      onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={createSampleData}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sample Data
                </Button>
                <InvoiceCustomizationDialog>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Printer className="h-4 w-4 mr-2" />
                    Customize Invoice
                  </Button>
                </InvoiceCustomizationDialog>
                <NewSaleDialog />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">{formatAmountWithSymbol(salesStats.totalSales)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{salesStats.totalOrders}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{salesStats.pendingSales}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-2xl font-bold text-gray-900">{salesStats.paidSales}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Transactions */}
          {salesLoading ? (
            <LoadingState 
              type="table" 
              text="Loading sales transactions..." 
              rows={5} 
              columns={7}
            />
          ) : (
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Sales Transactions ({salesStats.totalOrders})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{sale.invoiceNumber}</p>
                            <p className="text-sm text-gray-600">Due: {formatDate(sale.dueDate)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{sale.customerName}</p>
                            <p className="text-sm text-gray-600">{sale.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(sale.createdAt)}</TableCell>
                        <TableCell className="font-medium">{formatAmountWithSymbol(sale.total)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              sale.status === "paid"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : sale.status === "sent"
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            }
                          >
                            {sale.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              sale.paymentStatus === "paid"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {sale.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="hover:bg-blue-50 hover:text-blue-600" 
                              onClick={() => printSaleInvoice(sale)}
                              title="Print Invoice"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <EditSaleDialog sale={convertSaleForComponents(sale)} />
                            <ViewDialog
                              title={`Sale Details - ${sale.invoiceNumber}`}
                              fields={[
                                { label: "Customer Name", value: sale.customerName },
                                { label: "Customer Email", value: sale.customerEmail },
                                { label: "Customer Phone", value: sale.customerPhone },
                                { label: "Customer Address", value: sale.customerAddress },
                                { label: "Status", value: sale.status },
                                { label: "Payment Method", value: sale.paymentMethod },
                                { label: "Payment Status", value: sale.paymentStatus },
                                { label: "Created At", value: formatDate(sale.createdAt) },
                                { label: "Due Date", value: formatDate(sale.dueDate) },
                                { label: "Notes", value: sale.notes },
                              ]}
                              table={{
                                columns: [
                                  { label: "Item", render: (item) => item.itemName },
                                  { label: "Qty", render: (item) => item.quantity },
                                  { label: "Price", render: (item) => formatAmountWithSymbol(item.price) },
                                  { label: "Total", render: (item) => formatAmountWithSymbol(item.total) },
                                ],
                                data: sale.items || [],
                              }}
                            />
                            <Button size="sm" variant="ghost" className="hover:bg-red-50 hover:text-red-600" onClick={() => setDeleteTarget(sale)}>
                              <Trash className="h-4 w-4" />
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
        </div>
      </div>
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <div className="font-bold text-lg mb-2">Delete Sale?</div>
            <div className="mb-4 text-gray-700">Are you sure you want to delete this sale? This action cannot be undone.</div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" className="bg-red-500" onClick={async () => {
                try {
                  await dispatch(deleteSaleAsync(deleteTarget.id)).unwrap();
                  dispatch(showNotification({ 
                    message: "Sale deleted successfully!", 
                    type: "success",
                    category: "sale",
                    actionUrl: "/business-hub/sale",
                    priority: "medium"
                  }));
                } catch (error) {
                  dispatch(showNotification({ 
                    message: error?.toString() || "Failed to delete sale", 
                    type: "error",
                    category: "sale",
                    priority: "high"
                  }));
                }
                setDeleteTarget(null);
              }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
