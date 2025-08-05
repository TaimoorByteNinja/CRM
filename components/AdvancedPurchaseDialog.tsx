"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sparkles, Search, Plus, User, Building } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { addPurchase, updatePurchase, selectAllPurchases, createPurchase } from "@/lib/store/slices/purchasesSlice"
import { selectAllParties, fetchParties } from "@/lib/store/slices/partiesSlice"
import { showNotification } from "@/lib/store/slices/uiSlice"

interface AdvancedPurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseToEdit?: any // can be improved with a type
}

export default function AdvancedPurchaseDialog({ open, onOpenChange, purchaseToEdit }: AdvancedPurchaseDialogProps) {
  const dispatch = useAppDispatch()
  const purchases = useAppSelector(selectAllPurchases)
  const parties = useAppSelector(selectAllParties)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [showSupplierSearch, setShowSupplierSearch] = useState(false)
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)

  // Filter suppliers from parties - use useMemo to prevent infinite re-renders
  const suppliers = useMemo(() => 
    parties.filter(party => party.type === 'supplier' || party.type === 'both'),
    [parties]
  )

  useEffect(() => {
    if (purchaseToEdit) {
      setFormData({
        bill_number: purchaseToEdit.bill_number || '',
        supplier_id: purchaseToEdit.supplier_id || '',
        subtotal: purchaseToEdit.subtotal || 0,
        tax: purchaseToEdit.tax || 0,
        tax_rate: purchaseToEdit.tax_rate || 0,
        discount: purchaseToEdit.discount || 0,
        total: purchaseToEdit.total || 0,
        status: purchaseToEdit.status || 'draft',
        payment_status: purchaseToEdit.payment_status || 'pending',
        payment_method: purchaseToEdit.payment_method || '',
        notes: purchaseToEdit.notes || '',
      });
      // Set selected supplier if editing
      if (purchaseToEdit.supplier_id) {
        const supplier = suppliers.find(s => s.id === purchaseToEdit.supplier_id)
        setSelectedSupplier(supplier || null)
      }
    } else {
      setFormData({
        bill_number: '',
        supplier_id: '',
        subtotal: 0,
        tax: 0,
        tax_rate: 0,
        discount: 0,
        total: 0,
        status: 'draft',
        payment_status: 'pending',
        payment_method: '',
        notes: '',
      });
      setSelectedSupplier(null)
    }
  }, [purchaseToEdit, open, suppliers]);

  // Fetch parties when dialog opens
  useEffect(() => {
    if (open) {
      dispatch(fetchParties({ type: 'supplier' }))
    }
  }, [open, dispatch])

  // Auto-calculate total when subtotal, tax, or discount changes
  useEffect(() => {
    const subtotal = formData.subtotal || 0
    const tax = formData.tax || 0
    const discount = formData.discount || 0
    const total = subtotal + tax - discount
    if (total !== formData.total) {
      setFormData(prev => ({ ...prev, total }))
    }
  }, [formData.subtotal, formData.tax, formData.discount, formData.total])

  // Auto-calculate tax when subtotal and tax rate change
  useEffect(() => {
    const subtotal = formData.subtotal || 0
    const taxRate = formData.tax_rate || 0
    const tax = (subtotal * taxRate) / 100
    if (tax !== formData.tax) {
      setFormData(prev => ({ ...prev, tax }))
    }
  }, [formData.subtotal, formData.tax_rate, formData.tax])

  const handleSupplierSelect = (supplier: any) => {
    setSelectedSupplier(supplier)
    setFormData(prev => ({ ...prev, supplier_id: supplier.id }))
    setShowSupplierSearch(false)
    setSupplierSearchTerm("")
  }

  const filteredSuppliers = useMemo(() => 
    suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
      supplier.phone.includes(supplierSearchTerm) ||
      supplier.email.toLowerCase().includes(supplierSearchTerm.toLowerCase())
    ),
    [suppliers, supplierSearchTerm]
  )

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (purchaseToEdit) {
        // Use Redux action for updating purchase (includes phone number)
        const updatedPurchase = { ...formData };
        const result = await dispatch(updatePurchase({ id: purchaseToEdit.id, purchase: updatedPurchase }));
        if (updatePurchase.fulfilled.match(result)) {
          dispatch(showNotification({ message: "Purchase updated successfully!", type: "success" }));
        } else {
          throw new Error("Failed to update purchase");
        }
      } else {
        // Use Redux action for creating purchase (includes phone number)
        const newPurchase = { ...formData };
        const result = await dispatch(createPurchase(newPurchase));
        if (createPurchase.fulfilled.match(result)) {
          dispatch(showNotification({ message: "Purchase added successfully!", type: "success" }));
        } else {
          throw new Error("Failed to create purchase");
        }
      }
      onOpenChange(false);
    } catch (error) {
      dispatch(showNotification({ message: "Failed to save purchase", type: "error" }));
    } finally {
      setIsLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {purchaseToEdit ? "Edit Purchase Order" : "Create New Purchase Order"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {purchaseToEdit
              ? "Update the purchase order details below"
              : "Fill in the purchase order details below"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Bill Number and Supplier Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bill_number" className="text-sm font-medium text-gray-700">
                Bill Number *
              </Label>
              <Input
                id="bill_number"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={formData.bill_number || ""}
                onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                placeholder="Enter bill number"
              />
            </div>
            <div className="relative">
              <Label htmlFor="supplier" className="text-sm font-medium text-gray-700">
                Supplier *
              </Label>
              <div className="relative">
                <Input
                  id="supplier"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors pr-10"
                  value={selectedSupplier ? selectedSupplier.name : ""}
                  onChange={(e) => {
                    setSupplierSearchTerm(e.target.value)
                    setShowSupplierSearch(true)
                  }}
                  onFocus={() => setShowSupplierSearch(true)}
                  placeholder="Search and select supplier"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowSupplierSearch(!showSupplierSearch)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Supplier Search Dropdown */}
              {showSupplierSearch && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Select Supplier</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSupplierSearch(false)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                    {filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((supplier) => (
                        <div
                          key={supplier.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => handleSupplierSelect(supplier)}
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {supplier.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{supplier.name}</p>
                            <p className="text-xs text-gray-600">{supplier.phone}</p>
                            {supplier.email && <p className="text-xs text-gray-600">{supplier.email}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Balance: {formatCurrency(supplier.balance)}</p>
                            <p className="text-xs text-gray-500">{supplier.city}, {supplier.state}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No suppliers found</p>
                        <p className="text-xs">Add suppliers in the Parties section</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Supplier Info */}
          {selectedSupplier && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {selectedSupplier.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedSupplier.name}</p>
                    <p className="text-sm text-gray-600">{selectedSupplier.phone}</p>
                    {selectedSupplier.email && <p className="text-sm text-gray-600">{selectedSupplier.email}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Current Balance</p>
                  <p className={`text-lg font-bold ${selectedSupplier.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(selectedSupplier.balance)}
                  </p>
                  <p className="text-xs text-gray-600">Credit Limit: {formatCurrency(selectedSupplier.creditLimit)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Amount Calculations */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="subtotal" className="text-sm font-medium text-gray-700">
                Subtotal
              </Label>
              <Input
                id="subtotal"
                type="number"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={formData.subtotal || ""}
                onChange={(e) => setFormData({ ...formData, subtotal: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="tax_rate" className="text-sm font-medium text-gray-700">
                Tax Rate (%)
              </Label>
              <Input
                id="tax_rate"
                type="number"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={formData.tax_rate || ""}
                onChange={(e) => setFormData({ ...formData, tax_rate: Number.parseFloat(e.target.value) || 0 })}
                placeholder="18"
              />
            </div>
            <div>
              <Label htmlFor="tax" className="text-sm font-medium text-gray-700">
                Tax Amount
              </Label>
              <Input
                id="tax"
                type="number"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors bg-gray-50"
                value={formData.tax || ""}
                onChange={(e) => setFormData({ ...formData, tax: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                readOnly
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount" className="text-sm font-medium text-gray-700">
                Discount
              </Label>
              <Input
                id="discount"
                type="number"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={formData.discount || ""}
                onChange={(e) => setFormData({ ...formData, discount: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="total" className="text-sm font-medium text-gray-700">
                Total Amount
              </Label>
              <Input
                id="total"
                type="number"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors bg-gray-50 font-bold"
                value={formData.total || ""}
                onChange={(e) => setFormData({ ...formData, total: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                readOnly
              />
            </div>
          </div>

          {/* Status and Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_method" className="text-sm font-medium text-gray-700">
                Payment Method
              </Label>
              <Select
                value={formData.payment_method || ""}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <Select
                value={formData.status || ""}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="payment_status" className="text-sm font-medium text-gray-700">
              Payment Status
            </Label>
            <Select
              value={formData.payment_status || ""}
              onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
            >
              <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notes
            </Label>
            <Textarea
              id="notes"
              className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or terms"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border-gray-300 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !formData.bill_number || !selectedSupplier}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : purchaseToEdit ? "Update Order" : "Create Order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 