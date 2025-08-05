"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Sparkles, Edit, Search } from "lucide-react"
import { Sale, SaleItem } from "@/lib/sales-context"
import { SaleItem as SaleItemApi } from "@/lib/store/slices/salesSlice"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { selectAllItems, fetchItems } from "@/lib/store/slices/itemsSlice"
import { updateSaleAsync } from "@/lib/store/slices/salesSlice"
import { showNotification } from "@/lib/store/slices/uiSlice"
import { selectGeneralSettings } from "@/lib/store/slices/settingsSlice"
import { generateInvoicePDF } from "@/lib/invoice-generator"

interface Item {
  id: string
  name: string
  category: string
  sku: string
  price: number
  cost: number
  stock: number
  minStock: number
  description: string
  supplier: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  totalSold: number
}

interface EditSaleDialogProps {
  sale: Sale
  items?: Item[]
  trigger?: React.ReactNode
}

export function EditSaleDialog({ sale, items: propItems = [], trigger }: EditSaleDialogProps) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const generalSettings = useAppSelector(selectGeneralSettings);
  const [open, setOpen] = useState(false)
  const [saleForm, setSaleForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    items: [] as SaleItem[],
    paymentMethod: "Cash",
    status: "draft" as "draft" | "sent" | "paid" | "overdue",
    notes: "",
    discount: 0,
  })
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemDiscount, setItemDiscount] = useState<number>(0);
  const [itemSearchTerm, setItemSearchTerm] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Fetch items on dialog open
  useEffect(() => {
    if (open) {
      dispatch(fetchItems());
    }
  }, [open, dispatch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (sale) {
      setSaleForm({
        customerName: sale.customerName,
        customerEmail: sale.customerEmail,
        customerPhone: sale.customerPhone,
        customerAddress: sale.customerAddress,
        items: sale.items,
        paymentMethod: sale.paymentMethod,
        status: sale.status,
        notes: sale.notes,
        discount: sale.discount || 0,
      })
    }
  }, [sale])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleSaleUpdate = async () => {
    const subtotal = saleForm.items.reduce((sum, item) => sum + item.total, 0);
    const discountPercentage = saleForm.discount || 0;
    const discountAmount = (subtotal * discountPercentage) / 100;
    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * 0.08;
    const total = discountedSubtotal + tax;
    const updatedFields = {
      party_name: saleForm.customerName,
      invoice_date: new Date().toISOString().split('T')[0],
      subtotal,
      discount_amount: discountAmount,
      tax_amount: tax,
      total_amount: total,
      payment_status: saleForm.status === "paid" ? "paid" as const : "unpaid" as const,
      notes: saleForm.notes,
    };
    try {
      await dispatch(updateSaleAsync({ id: sale.id, updates: updatedFields })).unwrap();
      
      // Update item stock for each item in the sale
      for (const saleItem of saleForm.items) {
        const item = items.find(i => i.id === saleItem.itemId);
        if (item) {
          const newStock = item.stock - saleItem.quantity;
          if (newStock < 0) {
            dispatch(showNotification({ 
              message: `Insufficient stock for ${item.name}. Available: ${item.stock}`, 
              type: 'error' 
            }));
            return;
          }
          
          try {
            const phoneNumber = generalSettings.phoneNumber;
            if (!phoneNumber) {
              console.error('Phone number not available for stock update');
              continue;
            }

            const stockResponse = await fetch(`/api/business-hub/items/${item.id}?phone=${encodeURIComponent(phoneNumber)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stock_quantity: newStock }),
            });
            
            if (!stockResponse.ok) {
              console.error(`Failed to update stock for item ${item.name}`);
            } else {
              console.log('✅ Stock updated for item:', item.name);
            }
          } catch (error) {
            console.error(`Error updating stock for item ${item.name}:`, error);
          }
        }
      }
      
      dispatch(showNotification({ message: "Sale updated successfully!", type: "success" }));
      setOpen(false);
      setSaleForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        items: [],
        paymentMethod: "Cash",
        status: "draft",
        notes: "",
        discount: 0,
      });
    } catch (error) {
      dispatch(showNotification({ message: error?.toString() || "Failed to update sale", type: "error" }));
    }
  }

  const handleAddItemToSale = () => {
    const selectedItem = items.find(i => i.id === selectedItemId);
    if (!selectedItem) return;
    
    // Calculate total with discount
    const discountAmount = (itemPrice * itemQuantity * itemDiscount) / 100;
    const total = (itemQuantity * itemPrice) - discountAmount;
    
    const newSaleItem: SaleItem = {
      id: Date.now().toString(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemCode: selectedItem.sku || selectedItem.id,
      quantity: itemQuantity,
      price: itemPrice,
      discount: itemDiscount,
      tax: 0,
      total: total,
    };
    setSaleForm({
      ...saleForm,
      items: [...saleForm.items, newSaleItem],
    });
    setSelectedItemId("");
    setItemQuantity(1);
    setItemPrice(0);
    setItemDiscount(0);
  };

  const handleItemSelect = (item: any) => {
    setSelectedItemId(item.id);
    setItemPrice(item.price || 0);
    setItemSearchTerm(item.name || '');
    setShowSuggestions(false);
  };

  const filteredItems = items.filter(item => 
    (item.name?.toLowerCase() || '').includes(itemSearchTerm.toLowerCase()) ||
    (item.sku?.toLowerCase() || '').includes(itemSearchTerm.toLowerCase()) ||
    (item.category?.toLowerCase() || '').includes(itemSearchTerm.toLowerCase())
  ).slice(0, 8); // Limit to 8 suggestions

  const defaultTrigger = (
    <Button size="sm" variant="ghost" className="hover:bg-green-50 hover:text-green-600">
      <Edit className="h-4 w-4" />
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Edit Sale - {sale.invoiceNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">
                Customer Name
              </Label>
              <Input
                id="customerName"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={saleForm.customerName}
                onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="customerEmail" className="text-sm font-medium text-gray-700">
                Customer Email
              </Label>
              <Input
                id="customerEmail"
                type="email"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={saleForm.customerEmail}
                onChange={(e) => setSaleForm({ ...saleForm, customerEmail: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerPhone" className="text-sm font-medium text-gray-700">
                Customer Phone
              </Label>
              <Input
                id="customerPhone"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={saleForm.customerPhone}
                onChange={(e) => setSaleForm({ ...saleForm, customerPhone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
                Payment Method
              </Label>
              <Select
                value={saleForm.paymentMethod}
                onValueChange={(value) => setSaleForm({ ...saleForm, paymentMethod: value })}
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <Select
                value={saleForm.status}
                onValueChange={(value: "draft" | "sent" | "paid" | "overdue") => 
                  setSaleForm({ ...saleForm, status: value })
                }
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-200">
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
          </div>
          <div>
            <Label htmlFor="customerAddress" className="text-sm font-medium text-gray-700">
              Customer Address
            </Label>
            <Textarea
              id="customerAddress"
              className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
              value={saleForm.customerAddress}
              onChange={(e) => setSaleForm({ ...saleForm, customerAddress: e.target.value })}
            />
          </div>
          {/* Google-like Item Search */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 mb-4">
            <div className="space-y-4">
              {/* Search Input with Suggestions */}
              <div className="search-container">
                <Label htmlFor="itemSearch" className="text-sm font-medium text-gray-700">
                  Search & Select Items
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="itemSearch"
                    className="pl-10 pr-10 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                    placeholder="Type to search items..."
                    value={itemSearchTerm}
                    onChange={(e) => {
                      setItemSearchTerm(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowSuggestions(itemSearchTerm.length > 0)}
                  />
                  {itemSearchTerm && (
                    <button
                      onClick={() => {
                        setItemSearchTerm("");
                        setShowSuggestions(false);
                        setSelectedItemId("");
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {/* Suggestions Dropdown */}
                {showSuggestions && filteredItems.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto" style={{ maxHeight: '180px', maxWidth: '100%', right: '0' }}>
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleItemSelect(item)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{item.name || 'Unnamed Item'}</div>
                            <div className="text-sm text-gray-500">
                              SKU: {item.sku || 'N/A'} | Category: {item.category || 'N/A'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">{formatCurrency(item.price || 0)}</div>
                            <div className="text-sm text-gray-500">Stock: {item.stock || 0}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Selected Item Details */}
              {selectedItemId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-blue-900">Selected: {items.find(i => i.id === selectedItemId)?.name}</span>
                      <span className="text-sm text-blue-600 ml-2">
                        Price: {formatCurrency(itemPrice)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedItemId("");
                        setItemSearchTerm("");
                        setItemPrice(0);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Item Details Form */}
              <div className="flex items-center gap-4">
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700 mb-2 block">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={itemQuantity}
                    onChange={e => setItemQuantity(Number(e.target.value))}
                    className="w-24"
                    placeholder="Qty"
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700 mb-2 block">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={itemPrice}
                    onChange={e => setItemPrice(Number(e.target.value))}
                    className="w-32"
                    placeholder="Price"
                  />
                </div>
                <div>
                  <Label htmlFor="discount" className="text-sm font-medium text-gray-700 mb-2 block">
                    Discount %
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    min={0}
                    max={100}
                    value={itemDiscount}
                    onChange={e => setItemDiscount(Number(e.target.value))}
                    className="w-24"
                    placeholder="0%"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    type="button" 
                    onClick={handleAddItemToSale} 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg"
                    disabled={!selectedItemId || itemQuantity <= 0 || itemPrice <= 0}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
              </div>
            </div>
            {saleForm.items.length > 0 && (
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
                {saleForm.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{item.itemName}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(item.total)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Qty: {item.quantity} × {formatCurrency(item.price)}</span>
                        {item.discount && item.discount > 0 && (
                          <span className="text-green-600">Discount: {item.discount}%</span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setSaleForm({ ...saleForm, items: saleForm.items.filter((_, i) => i !== index) })}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Discount input */}
          <div>
            <Label htmlFor="discount" className="text-sm font-medium text-gray-700">
              Bill Discount (%)
            </Label>
            <Input
              id="discount"
              type="number"
              min={0}
              max={100}
              value={saleForm.discount || 0}
              onChange={e => setSaleForm({ ...saleForm, discount: Number(e.target.value) })}
              className="w-32"
              placeholder="0%"
            />
          </div>
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notes
            </Label>
            <Textarea
              id="notes"
              className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
              value={saleForm.notes}
              onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-lg border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaleUpdate}
              disabled={!saleForm.customerName || saleForm.items.length === 0}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Update Sale
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 