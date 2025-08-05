"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Plus, Edit, Trash2, Search, Home, CheckCircle, DollarSign, ArrowUpRight } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectAllCustomers, addCustomer, updateCustomer, deleteCustomer, selectCustomersStats, Customer } from "@/lib/store/slices/customersSlice"
import { showNotification } from "@/lib/store/slices/uiSlice"



export default function CustomersPage() {
  const dispatch = useAppDispatch()
  const customers = useAppSelector(selectAllCustomers)
  const customersStats = useAppSelector(selectCustomersStats)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.company || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const dashboardMetrics = {
    totalCustomers: customersStats.totalCustomers,
    activeCustomers: customersStats.activeCustomers,
    averageOrderValue: customersStats.totalRevenue / customersStats.totalCustomers || 0,
    conversionRate: 3.2,
  }

  const openDialog = (customer?: Customer) => {
    setSelectedCustomer(customer || null)
    setFormData(customer || {})
    setShowAddDialog(true)
  }

  const closeDialog = () => {
    setShowAddDialog(false)
    setSelectedCustomer(null)
    setFormData({})
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const currentTime = new Date().toISOString()

      if (selectedCustomer) {
        const updatedCustomer = { ...selectedCustomer, ...formData }
        dispatch(updateCustomer({ id: selectedCustomer.id, customer: updatedCustomer }))
        dispatch(showNotification({ message: "Customer updated successfully!", type: "success" }))
      } else {
        const newCustomer: Customer = {
          id: Date.now().toString(),
          ...formData,
          totalSales: 0,
          totalOrders: 0,
          status: "active",
          createdAt: currentTime,
        }
        dispatch(addCustomer(newCustomer))
        dispatch(showNotification({ message: "Customer added successfully!", type: "success" }))
      }

      closeDialog()
    } catch (error) {
      console.error("Failed to save:", error)
      dispatch(showNotification({ message: "Failed to save customer", type: "error" }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      dispatch(deleteCustomer(id))
      dispatch(showNotification({ message: "Customer deleted successfully!", type: "success" }))
    } catch (error) {
      console.error("Failed to delete:", error)
      dispatch(showNotification({ message: "Failed to delete customer", type: "error" }))
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild className="aesthetic-button-secondary">
              <a href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </a>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-sm text-gray-600">Manage customer relationships and data</p>
            </div>
          </div>

          <Button onClick={() => openDialog()} className="aesthetic-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="aesthetic-input pl-10"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="modern-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.totalCustomers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.activeCustomers}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardMetrics.averageOrderValue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.conversionRate}%</p>
                </div>
                <ArrowUpRight className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle>Customer Directory</CardTitle>
            <p className="text-sm text-gray-600">{filteredCustomers.length} customers</p>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
                <p className="text-gray-600 mb-4">Add your first customer to get started</p>
                <Button onClick={() => openDialog()} className="aesthetic-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Total Sales</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Last Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.company}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{customer.email}</p>
                            <p className="text-sm text-gray-600">{customer.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(customer.totalSales)}</TableCell>
                        <TableCell>{customer.totalOrders}</TableCell>
                        <TableCell>{customer.createdAt ? formatDate(customer.createdAt) : "Never"}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              customer.status === "active"
                                ? "bg-green-100 text-green-800"
                                : customer.status === "inactive"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => openDialog(customer)}
                              className="aesthetic-button-secondary h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(customer.id)}
                              className="aesthetic-button-secondary h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog for Add/Edit Customer */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
            <DialogDescription>
              {selectedCustomer ? "Update customer details below" : "Add a new customer to your database"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="aesthetic-input"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="aesthetic-input"
                  placeholder="customer@email.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="aesthetic-input"
                  placeholder="+1-555-0123"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company || ""}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="aesthetic-input"
                  placeholder="Company name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="aesthetic-input"
                placeholder="Full address (street, city, state, zip)"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={closeDialog} className="aesthetic-button-secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="aesthetic-button">
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
