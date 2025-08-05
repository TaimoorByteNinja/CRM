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
import { Truck, Plus, Edit, Trash2, Search, Home, CheckCircle, DollarSign, Activity } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectAllSuppliers, fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/lib/store/slices/suppliersSlice';
import { showNotification } from "@/lib/store/slices/uiSlice"

interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  company: string
  website?: string
  taxId?: string
  paymentTerms: string
  leadTime: number
  totalPurchases: number
  totalOrders: number
  averageOrderValue: number
  lastOrderDate?: string
  status: "active" | "inactive" | "blocked"
  rating: number
  currency: string
  bankDetails?: string
  contactPerson: string
  tags: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

export default function SuppliersPage() {
  const dispatch = useAppDispatch()
  const suppliers = useAppSelector(selectAllSuppliers)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})
  
  // Convert customers to suppliers format for compatibility
  const suppliersList: Supplier[] = suppliers.map(supplier => ({
    id: supplier.id,
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    city: supplier.city,
    state: supplier.state,
    zipCode: supplier.zipCode,
    country: supplier.country,
    company: supplier.company || supplier.name,
    website: "",
    taxId: supplier.taxId,
    paymentTerms: supplier.paymentTerms,
    leadTime: 7,
    totalPurchases: supplier.totalPurchases,
    totalOrders: supplier.totalOrders,
    averageOrderValue: supplier.averageOrderValue,
    lastOrderDate: supplier.lastOrderDate,
    status: supplier.status,
    rating: 5,
    currency: "USD",
    bankDetails: "",
    contactPerson: supplier.contactPerson,
    tags: supplier.tags,
    notes: supplier.notes,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  }))

  const filteredSuppliers = suppliersList.filter(
    (supplier) =>
      (supplier.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.company || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const dashboardMetrics = {
    totalSuppliers: suppliersList.length,
    activeSuppliers: suppliersList.filter((s) => s.status === "active").length,
    totalPurchases: suppliersList.reduce((sum, s) => sum + s.totalPurchases, 0),
    averageLeadTime:
      suppliersList.length > 0 ? Math.round(suppliersList.reduce((sum, s) => sum + s.leadTime, 0) / suppliersList.length) : 0,
  }

  const openDialog = (supplier?: Supplier) => {
    setSelectedSupplier(supplier || null)
    setFormData(supplier || {})
    setShowAddDialog(true)
  }

  const closeDialog = () => {
    setShowAddDialog(false)
    setSelectedSupplier(null)
    setFormData({})
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const currentTime = new Date().toISOString()

      if (selectedSupplier) {
        const updatedSupplier: Supplier = {
          ...selectedSupplier,
          ...formData,
          updatedAt: currentTime,
        }
        dispatch(updateSupplier({ id: selectedSupplier.id, supplier: updatedSupplier }))
        dispatch(showNotification({ message: "Supplier updated successfully!", type: "success" }))
      } else {
        const newSupplier: Supplier = {
          id: Date.now().toString(), // Temporary ID for new items
          ...formData,
          totalPurchases: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          status: "active",
          rating: 5,
          currency: "USD",
          tags: [],
          notes: "",
          createdAt: currentTime,
          updatedAt: currentTime,
        }
        dispatch(createSupplier(newSupplier))
        dispatch(showNotification({ message: "Supplier added successfully!", type: "success" }))
      }

      closeDialog()
    } catch (error) {
      console.error("Failed to save:", error)
      dispatch(showNotification({ message: "Failed to save supplier", type: "error" }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      dispatch(deleteSupplier(id))
      dispatch(showNotification({ message: "Supplier deleted successfully!", type: "success" }))
    } catch (error) {
      console.error("Failed to delete:", error)
      dispatch(showNotification({ message: "Failed to delete supplier", type: "error" }))
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
              <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
              <p className="text-sm text-gray-600">Manage supplier relationships and procurement</p>
            </div>
          </div>

          <Button onClick={() => openDialog()} className="aesthetic-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
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
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Supplier Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="modern-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.totalSuppliers}</p>
                </div>
                <Truck className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.activeSuppliers}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Purchases</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardMetrics.totalPurchases)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Lead Time</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.averageLeadTime} days</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suppliers Table */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle>Supplier Directory</CardTitle>
            <p className="text-sm text-gray-600">{filteredSuppliers.length} suppliers</p>
          </CardHeader>
          <CardContent>
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers yet</h3>
                <p className="text-gray-600 mb-4">Add your first supplier to get started</p>
                <Button onClick={() => openDialog()} className="aesthetic-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Total Purchases</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Lead Time</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-gray-600">{supplier.company}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{supplier.email}</p>
                            <p className="text-sm text-gray-600">{supplier.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(supplier.totalPurchases)}</TableCell>
                        <TableCell>{supplier.totalOrders}</TableCell>
                        <TableCell>{supplier.leadTime} days</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span>{supplier.rating}/5</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              supplier.status === "active"
                                ? "bg-green-100 text-green-800"
                                : supplier.status === "inactive"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {supplier.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => openDialog(supplier)}
                              className="aesthetic-button-secondary h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(supplier.id)}
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

      {/* Dialog for Add/Edit Supplier */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSupplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
            <DialogDescription>
              {selectedSupplier ? "Update supplier details below" : "Add a new supplier to your database"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Supplier Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="aesthetic-input"
                  placeholder="Enter supplier name"
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
                  placeholder="supplier@email.com"
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
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="aesthetic-input"
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state || ""}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="aesthetic-input"
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode || ""}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="aesthetic-input"
                  placeholder="12345"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leadTime">Lead Time (days)</Label>
                <Input
                  id="leadTime"
                  type="number"
                  value={formData.leadTime || ""}
                  onChange={(e) => setFormData({ ...formData, leadTime: Number.parseInt(e.target.value) })}
                  className="aesthetic-input"
                  placeholder="7"
                />
              </div>
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select
                  value={formData.paymentTerms || ""}
                  onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="COD">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson || ""}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="aesthetic-input"
                placeholder="Primary contact person"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="aesthetic-input"
                placeholder="Additional notes about the supplier"
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
