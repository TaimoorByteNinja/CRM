"use client"

import { type Sale, dataStore } from "@/lib/shared-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"

interface SaleEditDialogProps {
  sale: Sale | null
  isOpen: boolean
  onClose: () => void
}

export function SaleEditDialog({ sale, isOpen, onClose }: SaleEditDialogProps) {
  const { toast } = useToast()
  const [editSale, setEditSale] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    items: [{ itemName: "", quantity: 1, price: 0 }],
    taxRate: 8.0,
    discount: 0,
    paymentMethod: "Cash",
    dueDate: "",
    notes: "",
    status: "draft" as Sale["status"],
    paymentStatus: "pending" as Sale["paymentStatus"],
  })

  useEffect(() => {
    if (sale) {
      setEditSale({
        customerName: sale.customerName,
        customerEmail: sale.customerEmail,
        customerPhone: sale.customerPhone,
        customerAddress: sale.customerAddress,
        items: sale.items.map((item) => ({
          itemName: item.itemName,
          quantity: item.quantity,
          price: item.price,
        })),
        taxRate: sale.taxRate,
        discount: sale.discount,
        paymentMethod: sale.paymentMethod,
        dueDate: sale.dueDate.split("T")[0], // Convert to date input format
        notes: sale.notes,
        status: sale.status,
        paymentStatus: sale.paymentStatus,
      })
    }
  }, [sale])

  if (!sale) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleSave = () => {
    // Calculate totals
    const subtotal = editSale.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    const tax = (subtotal * editSale.taxRate) / 100
    const total = subtotal + tax - editSale.discount

    const updatedSale: Partial<Sale> = {
      customerName: editSale.customerName,
      customerEmail: editSale.customerEmail,
      customerPhone: editSale.customerPhone,
      customerAddress: editSale.customerAddress,
      items: editSale.items.map((item, index) => ({
        id: (index + 1).toString(),
        itemId: (index + 1).toString(),
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      })),
      subtotal,
      tax,
      taxRate: editSale.taxRate,
      discount: editSale.discount,
      total,
      paymentMethod: editSale.paymentMethod,
      dueDate: editSale.dueDate ? new Date(editSale.dueDate).toISOString() : sale.dueDate,
      notes: editSale.notes,
      status: editSale.status,
      paymentStatus: editSale.paymentStatus,
    }

    dataStore.updateSale(sale.id, updatedSale)
    onClose()

    toast({
      title: "Sale Updated",
      description: `Invoice ${sale.invoiceNumber} has been updated successfully.`,
    })
  }

  const addNewItem = () => {
    setEditSale((prev) => ({
      ...prev,
      items: [...prev.items, { itemName: "", quantity: 1, price: 0 }],
    }))
  }

  const removeItem = (index: number) => {
    setEditSale((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateItem = (index: number, field: string, value: any) => {
    setEditSale((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Sale - {sale.invoiceNumber}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Customer Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={editSale.customerName}
                onChange={(e) => setEditSale((prev) => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={editSale.customerEmail}
                onChange={(e) => setEditSale((prev) => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="Enter customer email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                value={editSale.customerPhone}
                onChange={(e) => setEditSale((prev) => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="Enter customer phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={editSale.dueDate}
                onChange={(e) => setEditSale((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerAddress">Customer Address</Label>
            <Textarea
              id="customerAddress"
              value={editSale.customerAddress}
              onChange={(e) => setEditSale((prev) => ({ ...prev, customerAddress: e.target.value }))}
              placeholder="Enter customer address"
              rows={2}
            />
          </div>

          {/* Status Updates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Invoice Status</Label>
              <Select
                value={editSale.status}
                onValueChange={(value) => setEditSale((prev) => ({ ...prev, status: value as Sale["status"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select
                value={editSale.paymentStatus}
                onValueChange={(value) =>
                  setEditSale((prev) => ({ ...prev, paymentStatus: value as Sale["paymentStatus"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Items</Label>
              <Button type="button" onClick={addNewItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {editSale.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                <div className="col-span-5 space-y-2">
                  <Label>Item Name *</Label>
                  <Input
                    value={item.itemName}
                    onChange={(e) => updateItem(index, "itemName", e.target.value)}
                    placeholder="Enter item name"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label>Total</Label>
                  <div className="text-sm font-medium p-2 bg-gray-50 rounded">
                    {formatCurrency(item.quantity * item.price)}
                  </div>
                </div>
                <div className="col-span-1">
                  {editSale.items.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Payment & Tax Information */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={editSale.taxRate}
                onChange={(e) => setEditSale((prev) => ({ ...prev, taxRate: Number.parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount Amount</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={editSale.discount}
                onChange={(e) => setEditSale((prev) => ({ ...prev, discount: Number.parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={editSale.paymentMethod}
                onValueChange={(value) => setEditSale((prev) => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={editSale.notes}
              onChange={(e) => setEditSale((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          {/* Total Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(editSale.items.reduce((sum, item) => sum + item.quantity * item.price, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({editSale.taxRate}%):</span>
                <span>
                  {formatCurrency(
                    (editSale.items.reduce((sum, item) => sum + item.quantity * item.price, 0) * editSale.taxRate) /
                      100,
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-{formatCurrency(editSale.discount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>
                  {formatCurrency(
                    editSale.items.reduce((sum, item) => sum + item.quantity * item.price, 0) +
                      (editSale.items.reduce((sum, item) => sum + item.quantity * item.price, 0) * editSale.taxRate) /
                        100 -
                      editSale.discount,
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!editSale.customerName || editSale.items.some((item) => !item.itemName || item.price <= 0)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
