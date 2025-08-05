"use client"

import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  Package,
  Edit,
  AlertCircle,
  DollarSign,
  MoreHorizontal,
  Filter,
  Settings,
  ShoppingCart,
  Tag,
  Ruler,
  Eye,
  TrendingUp,
  Calendar,
  Box,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectAllItems, addItem, updateItem, deleteItem, selectItemsStats, createItem, fetchItems, Item } from "@/lib/store/slices/itemsSlice"
import { selectActiveTab, setActiveTab, setSearchTerm, selectSearchTerm, showNotification } from "@/lib/store/slices/uiSlice"
import { selectGeneralSettings } from "@/lib/store/slices/settingsSlice"

export default function ItemsPage() {
  const dispatch = useAppDispatch()
  const activeTab = useAppSelector(selectActiveTab)
  const searchTerm = useAppSelector(selectSearchTerm)
  const items = useAppSelector(selectAllItems)
  const itemsStats = useAppSelector(selectItemsStats)
  const generalSettings = useAppSelector(selectGeneralSettings)
  
  console.log('🎯 ItemsPage render - items from Redux:', items.length, items);
  
  const [activeItemTab, setActiveItemTab] = useState("products")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showUnitDialog, setShowUnitDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  const [itemForm, setItemForm] = useState({
    name: "",
    category: "Electronics",
    sku: "",
    salePrice: 0,
    purchasePrice: 0,
    stock: 0,
    minStock: 5,
    description: "",
    supplier: "",
    unit: "pcs",
    hsn: "",
    taxRate: 18,
  })

  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "Consultation",
    salePrice: 0,
    description: "",
    duration: "",
    taxRate: 18,
  })

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    parentCategory: "",
  })

  const [unitForm, setUnitForm] = useState({
    name: "",
    symbol: "",
    type: "quantity",
  })

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "₹0"
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleItemSubmit = async () => {
    const newItem = {
      // Map to database schema fields
      item_name: itemForm.name,
      name: itemForm.name, // Keep for compatibility
      category_id: undefined, // Set to undefined instead of null
      item_code: itemForm.sku,
      sku: itemForm.sku, // Keep for compatibility
      sale_price: itemForm.salePrice,
      purchase_price: itemForm.purchasePrice,
      price: itemForm.salePrice, // Keep for compatibility
      cost: itemForm.purchasePrice, // Keep for compatibility
      stock_quantity: itemForm.stock,
      stock: itemForm.stock, // Keep for compatibility
      current_stock: itemForm.stock,
      opening_stock: itemForm.stock,
      minimum_stock: itemForm.minStock,
      min_stock: itemForm.minStock, // Keep for compatibility
      minStock: itemForm.minStock, // Keep for compatibility
      description: itemForm.description,
      supplier_id: undefined, // Set to undefined instead of null
      unit_id: undefined, // Set to undefined instead of null
      unit: "pcs",
      hsn_code: itemForm.hsn,
      hsn: itemForm.hsn, // Keep for compatibility
      tax_rate: itemForm.taxRate,
      gst_rate: itemForm.taxRate.toString(),
      status: "active" as const,
      type: "product",
    }
    try {
      await dispatch(createItem(newItem)).unwrap();
      dispatch(showNotification({ message: "Product added successfully!", type: "success" }));
    } catch (error) {
      dispatch(showNotification({ message: error?.toString() || "Failed to add product", type: "error" }));
    }
    setShowItemDialog(false)
    setItemForm({
      name: "",
      category: "Electronics",
      sku: "",
      salePrice: 0,
      purchasePrice: 0,
      stock: 0,
      minStock: 5,
      description: "",
      supplier: "",
      unit: "pcs",
      hsn: "",
      taxRate: 18,
    })
  }

  const handleServiceSubmit = async () => {
    const newService = {
      // Map to database schema fields
      item_name: serviceForm.name,
      name: serviceForm.name, // Keep for compatibility
      category_id: undefined,
      item_code: "",
      sku: "",
      sale_price: serviceForm.salePrice,
      purchase_price: 0,
      price: serviceForm.salePrice, // Keep for compatibility
      cost: 0, // Keep for compatibility
      stock_quantity: 0,
      stock: 0, // Keep for compatibility
      current_stock: 0,
      opening_stock: 0,
      minimum_stock: 0,
      min_stock: 0, // Keep for compatibility
      minStock: 0, // Keep for compatibility
      description: serviceForm.description,
      supplier_id: undefined,
      unit_id: undefined,
      unit: "service",
      hsn_code: "",
      hsn: "", // Keep for compatibility
      tax_rate: serviceForm.taxRate,
      gst_rate: serviceForm.taxRate.toString(),
      status: "active" as const,
      type: "service",
    }
    try {
      await dispatch(createItem(newService)).unwrap();
      dispatch(showNotification({ message: "Service added successfully!", type: "success" }));
    } catch (error) {
      dispatch(showNotification({ message: error?.toString() || "Failed to add service", type: "error" }));
    }
    setShowServiceDialog(false)
    setServiceForm({
      name: "",
      category: "Consultation",
      salePrice: 0,
      description: "",
      duration: "",
      taxRate: 18,
    })
  }

  const handleCategorySubmit = async () => {
    const newCategory = {
      name: categoryForm.name,
      category_id: undefined, // Categories may need a separate table; for now, just store name
      sku: "",
      sale_price: 0,
      purchase_price: 0,
      stock: 0,
      min_stock: 0,
      description: categoryForm.description,
      supplier_id: undefined,
      unit_id: undefined,
      hsn: "",
      tax_rate: 0,
      status: "active" as const,
      type: "category",
    }
    try {
      await dispatch(createItem(newCategory)).unwrap();
      dispatch(showNotification({ message: "Category added successfully!", type: "success" }));
    } catch (error) {
      dispatch(showNotification({ message: error?.toString() || "Failed to add category", type: "error" }));
    }
    setShowCategoryDialog(false)
    setCategoryForm({
      name: "",
      description: "",
      parentCategory: "",
    })
  }

  const handleUnitSubmit = async () => {
    const newUnit = {
      name: unitForm.name,
      category_id: undefined,
      sku: unitForm.symbol,
      sale_price: 0,
      purchase_price: 0,
      stock: 0,
      min_stock: 0,
      description: unitForm.type,
      supplier_id: undefined,
      unit_id: undefined,
      hsn: "",
      tax_rate: 0,
      status: "active" as const,
      type: "unit",
    }
    try {
      await dispatch(createItem(newUnit)).unwrap();
      dispatch(showNotification({ message: "Unit added successfully!", type: "success" }));
    } catch (error) {
      dispatch(showNotification({ message: error?.toString() || "Failed to add unit", type: "error" }));
    }
    setShowUnitDialog(false)
    setUnitForm({
      name: "",
      symbol: "",
      type: "quantity",
    })
  }

  const handleEditClick = () => {
    if (selectedItem) {
      setEditForm({ ...selectedItem });
      setShowEditDialog(true);
    }
  };

  const handleEditSubmit = async () => {
    try {
      await dispatch(updateItem({ id: editForm.id, updates: editForm })).unwrap();
      dispatch(showNotification({ message: "Item updated successfully!", type: "success" }));
      setShowEditDialog(false);
    } catch (error) {
      dispatch(showNotification({ message: error?.toString() || "Failed to update item", type: "error" }));
    }
  };

  const getCurrentData = () => {
    switch (activeItemTab) {
      case "products":
        const productItems = items.filter(item => !item.type || item.type === 'product');
        console.log('🔍 Filtering products:', productItems);
        return productItems;
      case "services":
        return items.filter(item => item.type === 'service')
      case "categories":
        return items.filter(item => item.type === 'category')
      case "units":
        return items.filter(item => item.type === 'unit')
      default:
        return items.filter(item => !item.type || item.type === 'product')
    }
  }

  const filteredData = getCurrentData().filter((item: any) =>
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    // Only fetch items if phone number is available
    if (generalSettings.phoneNumber && generalSettings.phoneNumber.trim() !== '') {
      console.log('📱 Phone number available, fetching items...', generalSettings.phoneNumber)
      dispatch(fetchItems());
    } else {
      console.log('⏳ Waiting for phone number before fetching items...')
    }
  }, [dispatch, generalSettings.phoneNumber]);

  // Debug log when items change
  useEffect(() => {
    console.log('🔍 Items state changed:', {
      itemsLength: items.length,
      items: items,
      phoneNumber: generalSettings.phoneNumber
    });
    if (items.length > 0) {
      console.log('📋 First item details:', items[0]);
    }
  }, [items, generalSettings.phoneNumber]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Debug Panel - Remove this after testing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
          <div className="font-bold mb-2">Debug Info:</div>
          <div>Items Count: {items.length}</div>
          <div>Active Tab: {activeItemTab}</div>
          <div>Search Term: "{searchTerm}"</div>
          <div>Products: {items.filter(item => !item.type || item.type === 'product').length}</div>
          <div>Services: {items.filter(item => item.type === 'service').length}</div>
          <div>API Status: {items.length > 0 ? 'Has Data' : 'Empty'}</div>
          <div>Currency: INR (₹)</div>
          <div>Sample: {formatCurrency(1000)}</div>
        </div>
      )}
      
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={(tab) => dispatch(setActiveTab(tab))} />

      {/* Main Content */}
      <div className="ml-16 flex flex-col min-h-screen">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-30">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative bg-white rounded-xl p-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-12 pr-4 py-3 w-96 bg-gray-50/50 border-gray-200/50 rounded-lg focus:bg-white transition-all duration-200"
                      placeholder="Search Transactions"
                      value={searchTerm}
                      onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sale
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Purchase
                </Button>
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Options
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left Panel - Items List */}
          <div className="w-80 bg-white/70 backdrop-blur-xl border-r border-white/20 shadow-lg">
            {/* Tab Navigation - Fixed styling to match image */}
            <div className="border-b border-gray-200">
              {/* Tab Selector */}
<div className="grid grid-cols-4 border-b bg-white">
  <button
    onClick={() => setActiveItemTab("products")}
    className={`flex items-center justify-center gap-1 py-3 text-xs font-medium border-b-2 transition-colors ${
      activeItemTab === "products"
        ? "border-blue-500 text-blue-600 bg-blue-50/50"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`}
  >
    <Box className="h-4 w-4" />
    PRODUCTS
  </button>

  <button
    onClick={() => setActiveItemTab("services")}
    className={`flex items-center justify-center gap-1 py-3 text-xs font-medium border-b-2 transition-colors ${
      activeItemTab === "services"
        ? "border-blue-500 text-blue-600 bg-blue-50/50"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`}
  >
    <Settings className="h-4 w-4" />
    SERVICES
  </button>

  <button
    onClick={() => setActiveItemTab("categories")}
    className={`flex items-center justify-center gap-1 py-3 text-xs font-medium border-b-2 transition-colors ${
      activeItemTab === "categories"
        ? "border-blue-500 text-blue-600 bg-blue-50/50"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`}
  >
    <Tag className="h-4 w-4" />
    CATEGORY
  </button>

  <button
    onClick={() => setActiveItemTab("units")}
    className={`flex items-center justify-center gap-1 py-3 text-xs font-medium border-b-2 transition-colors ${
      activeItemTab === "units"
        ? "border-blue-500 text-blue-600 bg-blue-50/50"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`}
  >
    <Ruler className="h-4 w-4" />
    UNITS
  </button>
</div>

            </div>

            {/* Search and Add Button */}
            <div className="p-4 border-b border-gray-200/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10 pr-4 py-2 bg-gray-50/50 border-gray-200/50 rounded-lg focus:bg-white transition-all duration-200"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                  />
                </div>
                <Button size="sm" variant="ghost" className="hover:bg-gray-100">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Add Item Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => setShowItemDialog(true)}>
                    <Package className="h-4 w-4 mr-2" />
                    Add Product
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowServiceDialog(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Add Service
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowCategoryDialog(true)}>
                    <Tag className="h-4 w-4 mr-2" />
                    Add Category
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowUnitDialog(true)}>
                    <Ruler className="h-4 w-4 mr-2" />
                    Add Unit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-auto">
              {activeItemTab === "products" && (
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-sm font-medium text-gray-700">ITEM</span>
                    <span className="text-sm font-medium text-gray-700">QUANTITY</span>
                  </div>
                  <div className="space-y-1">
                    {getCurrentData().length > 0 ? (
                      getCurrentData().map((item) => {
                        console.log('🎯 Rendering item:', item);
                        return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedItem?.id === item.id ? "bg-blue-100 border-l-4 border-blue-500" : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{item.name || 'Unnamed Item'}</p>
                            <p className="text-xs text-gray-500">{(item.sku && item.sku !== 'EMPTY') ? item.sku : 'No SKU'}</p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-sm font-medium ${(item.stock || 0) <= (item.minStock || 0) ? "text-red-600" : "text-gray-900"}`}
                            >
                              {item.stock || 0}
                            </span>
                            {(item.stock || 0) <= (item.minStock || 0) && <AlertCircle className="h-3 w-3 text-red-500 ml-1 inline" />}
                          </div>
                        </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 px-4">
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-8 shadow-lg border border-white/20">
                          <Package className="h-16 w-16 mx-auto mb-6 text-gray-400" />
                          <h3 className="text-xl font-semibold text-gray-700 mb-3">No products found</h3>
                          <p className="text-gray-500 mb-6">Get started by adding your first product to the inventory</p>
                          <Button 
                            onClick={() => setShowItemDialog(true)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Product
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeItemTab === "services" && (
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-sm font-medium text-gray-700">SERVICE</span>
                    <span className="text-sm font-medium text-gray-700">PRICE</span>
                  </div>
                  <div className="space-y-1">
                    {items.filter(item => item.type === 'service').length > 0 ? (
                      items.filter(item => item.type === 'service').map((service) => (
                        <div
                          key={service.id}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedItem?.id === service.id
                              ? "bg-blue-100 border-l-4 border-blue-500"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedItem(service)}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                            <p className="text-xs text-gray-500">{service.description || service.category || '-'}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">{formatCurrency(service.sale_price || 0)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 px-4">
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-8 shadow-lg border border-white/20">
                          <Settings className="h-16 w-16 mx-auto mb-6 text-gray-400" />
                          <h3 className="text-xl font-semibold text-gray-700 mb-3">No services found</h3>
                          <p className="text-gray-500 mb-6">Get started by adding your first service to the inventory</p>
                          <Button 
                            onClick={() => setShowServiceDialog(true)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Service
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeItemTab === "categories" && (
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-sm font-medium text-gray-700">CATEGORY</span>
                    <span className="text-sm font-medium text-gray-700">ITEMS</span>
                  </div>
                  <div className="space-y-1">
                    {items.filter(item => item.type === 'category').length > 0 ? (
                      items.filter(item => item.type === 'category').map((category) => (
                        <div
                          key={category.id}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedItem?.id === category.id
                              ? "bg-blue-100 border-l-4 border-blue-500"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedItem(category)}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{category.name}</p>
                            <p className="text-xs text-gray-500">{category.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">{category.sku || '-'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 px-4">
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-8 shadow-lg border border-white/20">
                          <Tag className="h-16 w-16 mx-auto mb-6 text-gray-400" />
                          <h3 className="text-xl font-semibold text-gray-700 mb-3">No categories found</h3>
                          <p className="text-gray-500 mb-6">Get started by adding your first category to organize your inventory</p>
                          <Button 
                            onClick={() => setShowCategoryDialog(true)}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Category
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeItemTab === "units" && (
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-sm font-medium text-gray-700">UNIT</span>
                    <span className="text-sm font-medium text-gray-700">SYMBOL</span>
                  </div>
                  <div className="space-y-1">
                    {items.filter(item => item.type === 'unit').length > 0 ? (
                      items.filter(item => item.type === 'unit').map((unit) => (
                        <div
                          key={unit.id}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedItem?.id === unit.id ? "bg-blue-100 border-l-4 border-blue-500" : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedItem(unit)}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{unit.name}</p>
                            <p className="text-xs text-gray-500">{unit.description || unit.type || '-'}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">{unit.sku || '-'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 px-4">
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-8 shadow-lg border border-white/20">
                          <Ruler className="h-16 w-16 mx-auto mb-6 text-gray-400" />
                          <h3 className="text-xl font-semibold text-gray-700 mb-3">No units found</h3>
                          <p className="text-gray-500 mb-6">Get started by adding your first unit of measurement</p>
                          <Button 
                            onClick={() => setShowUnitDialog(true)}
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Unit
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Item Details */}
          <div className="flex-1 bg-white/50 backdrop-blur-xl">
            {selectedItem ? (
              <div className="p-8">
                {/* Item Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 uppercase">{selectedItem.name}</h1>
                    <Button size="sm" variant="ghost" className="hover:bg-gray-100">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={handleEditClick}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    ADJUST ITEM
                  </Button>
                </div>

                {/* Item Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Show details for all types */}
                  <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-2">
                        <div><span className="text-sm text-gray-600">SKU:</span> <span className="font-bold text-gray-900">{(selectedItem.sku && selectedItem.sku !== 'EMPTY') ? selectedItem.sku : 'No SKU'}</span></div>
                        <div><span className="text-sm text-gray-600">Type:</span> <span className="font-bold text-gray-900">{selectedItem.type}</span></div>
                        <div><span className="text-sm text-gray-600">Category ID:</span> <span className="font-bold text-gray-900">{selectedItem.category_id || '-'}</span></div>
                        <div><span className="text-sm text-gray-600">Supplier ID:</span> <span className="font-bold text-gray-900">{selectedItem.supplier_id || '-'}</span></div>
                        <div><span className="text-sm text-gray-600">Unit ID:</span> <span className="font-bold text-gray-900">{selectedItem.unit_id || '-'}</span></div>
                        <div><span className="text-sm text-gray-600">Description:</span> <span className="font-bold text-gray-900">{selectedItem.description || '-'}</span></div>
                        <div><span className="text-sm text-gray-600">HSN:</span> <span className="font-bold text-gray-900">{selectedItem.hsn || '-'}</span></div>
                        <div><span className="text-sm text-gray-600">Tax Rate:</span> <span className="font-bold text-gray-900">{selectedItem.tax_rate ?? '-'}</span></div>
                        <div><span className="text-sm text-gray-600">Status:</span> <span className="font-bold text-gray-900">{selectedItem.status}</span></div>
                        <div><span className="text-sm text-gray-600">Created At:</span> <span className="font-bold text-gray-900">{selectedItem.created_at || '-'}</span></div>
                        <div><span className="text-sm text-gray-600">Updated At:</span> <span className="font-bold text-gray-900">{selectedItem.updated_at || '-'}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Show price/stock only for product/service */}
                  {(selectedItem.type === 'product' || selectedItem.type === 'service') && (
                    <>
                      <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">SALE PRICE</p>
                              <p className="text-xl font-bold text-green-600">
                                {formatCurrency(selectedItem.sale_price || selectedItem.price || 0)}
                              </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">PURCHASE PRICE</p>
                              <p className="text-xl font-bold text-blue-600">
                                {formatCurrency(selectedItem.purchase_price || selectedItem.cost || 0)}
                              </p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                  {/* Show stock for product only */}
                  {selectedItem.type === 'product' && (
                    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">STOCK QUANTITY</p>
                            <p
                              className={`text-xl font-bold ${(selectedItem.stock || 0) <= (selectedItem.minStock || 0) ? "text-red-600" : "text-gray-900"}`}
                            >
                              {selectedItem.stock || 0}
                            </p>
                          </div>
                          <Package className="h-8 w-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Transactions Section */}
                {(activeItemTab === "products" || activeItemTab === "services") && (
                  <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-gray-900">TRANSACTIONS</CardTitle>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            className="pl-10 pr-4 py-2 w-64 bg-gray-50/50 border-gray-200/50 rounded-lg focus:bg-white transition-all duration-200"
                            placeholder="Search transactions"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedItem.transactions && selectedItem.transactions.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>TYPE</TableHead>
                              <TableHead>INVOICE/REF</TableHead>
                              <TableHead>NAME</TableHead>
                              <TableHead>DATE</TableHead>
                              <TableHead>QUANTITY</TableHead>
                              <TableHead>PRICE/UNIT</TableHead>
                              <TableHead>STATUS</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedItem.transactions.map((transaction: any) => (
                              <TableRow key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell>
                                  <Badge
                                    className={
                                      transaction.type === "Sale"
                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                        : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                    }
                                  >
                                    {transaction.type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{transaction.invoice}</TableCell>
                                <TableCell>{transaction.name}</TableCell>
                                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                <TableCell>{transaction.quantity}</TableCell>
                                <TableCell>{formatCurrency(transaction.price || 0)}</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    {transaction.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-12">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No transactions to show</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl p-12 shadow-lg border border-white/20 text-center max-w-md">
                  <Box className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">Select an Item</h2>
                  <p className="text-gray-500 mb-6">Choose an item from the left panel to view details and manage inventory</p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={() => setShowItemDialog(true)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                    <Button 
                      onClick={() => setShowServiceDialog(true)}
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Add New Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName" className="text-sm font-medium text-gray-700">
                  Product Name
                </Label>
                <Input
                  id="productName"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sku" className="text-sm font-medium text-gray-700">
                  SKU
                </Label>
                <Input
                  id="sku"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={itemForm.sku}
                  onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Category
                </Label>
                <Select
                  value={itemForm.category}
                  onValueChange={(value) => setItemForm({ ...itemForm, category: value })}
                >
                  <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                    <SelectItem value="Home">Home & Garden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
                  Unit
                </Label>
                <Select value={itemForm.unit} onValueChange={(value) => setItemForm({ ...itemForm, unit: value })}>
                  <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="m">Meters</SelectItem>
                    <SelectItem value="L">Liters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salePrice" className="text-sm font-medium text-gray-700">
                  Sale Price
                </Label>
                <Input
                  id="salePrice"
                  type="number"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={itemForm.salePrice}
                  onChange={(e) => setItemForm({ ...itemForm, salePrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="purchasePrice" className="text-sm font-medium text-gray-700">
                  Purchase Price
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={itemForm.purchasePrice}
                  onChange={(e) => setItemForm({ ...itemForm, purchasePrice: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="stock" className="text-sm font-medium text-gray-700">
                  Stock Quantity
                </Label>
                <Input
                  id="stock"
                  type="number"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={itemForm.stock}
                  onChange={(e) => setItemForm({ ...itemForm, stock: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="minStock" className="text-sm font-medium text-gray-700">
                  Minimum Stock
                </Label>
                <Input
                  id="minStock"
                  type="number"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={itemForm.minStock}
                  onChange={(e) => setItemForm({ ...itemForm, minStock: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="taxRate" className="text-sm font-medium text-gray-700">
                  Tax Rate (%)
                </Label>
                <Input
                  id="taxRate"
                  type="number"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={itemForm.taxRate}
                  onChange={(e) => setItemForm({ ...itemForm, taxRate: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowItemDialog(false)}
                className="rounded-lg border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleItemSubmit}
                disabled={!itemForm.name}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Add New Service
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceName" className="text-sm font-medium text-gray-700">
                  Service Name
                </Label>
                <Input
                  id="serviceName"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="serviceCategory" className="text-sm font-medium text-gray-700">
                  Category
                </Label>
                <Select
                  value={serviceForm.category}
                  onValueChange={(value) => setServiceForm({ ...serviceForm, category: value })}
                >
                  <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Installation">Installation</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="servicePrice" className="text-sm font-medium text-gray-700">
                  Service Price
                </Label>
                <Input
                  id="servicePrice"
                  type="number"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={serviceForm.salePrice}
                  onChange={(e) => setServiceForm({ ...serviceForm, salePrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                  Duration
                </Label>
                <Input
                  id="duration"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                  placeholder="e.g., 1 hour"
                />
              </div>
              <div>
                <Label htmlFor="serviceTaxRate" className="text-sm font-medium text-gray-700">
                  Tax Rate (%)
                </Label>
                <Input
                  id="serviceTaxRate"
                  type="number"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={serviceForm.taxRate}
                  onChange={(e) => setServiceForm({ ...serviceForm, taxRate: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="serviceDescription" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="serviceDescription"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowServiceDialog(false)}
                className="rounded-lg border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleServiceSubmit}
                disabled={!serviceForm.name}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Add Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Add New Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName" className="text-sm font-medium text-gray-700">
                Category Name
              </Label>
              <Input
                id="categoryName"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="parentCategory" className="text-sm font-medium text-gray-700">
                Parent Category (Optional)
              </Label>
              <Select
                value={categoryForm.parentCategory}
                onValueChange={(value) => setCategoryForm({ ...categoryForm, parentCategory: value })}
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="categoryDescription" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="categoryDescription"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCategoryDialog(false)}
                className="rounded-lg border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCategorySubmit}
                disabled={!categoryForm.name}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Add Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Unit Dialog */}
      <Dialog open={showUnitDialog} onOpenChange={setShowUnitDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Add New Unit
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unitName" className="text-sm font-medium text-gray-700">
                  Unit Name
                </Label>
                <Input
                  id="unitName"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={unitForm.name}
                  onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                  placeholder="e.g., Pieces"
                />
              </div>
              <div>
                <Label htmlFor="unitSymbol" className="text-sm font-medium text-gray-700">
                  Symbol
                </Label>
                <Input
                  id="unitSymbol"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={unitForm.symbol}
                  onChange={(e) => setUnitForm({ ...unitForm, symbol: e.target.value })}
                  placeholder="e.g., pcs"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="unitType" className="text-sm font-medium text-gray-700">
                Unit Type
              </Label>
              <Select value={unitForm.type} onValueChange={(value) => setUnitForm({ ...unitForm, type: value })}>
                <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="length">Length</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowUnitDialog(false)}
                className="rounded-lg border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUnitSubmit}
                disabled={!unitForm.name || !unitForm.symbol}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Add Unit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Edit Item
            </DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editName" className="text-sm font-medium text-gray-700">Name</Label>
                  <Input id="editName" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="editSku" className="text-sm font-medium text-gray-700">SKU</Label>
                  <Input id="editSku" value={editForm.sku} onChange={e => setEditForm({ ...editForm, sku: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editPrice" className="text-sm font-medium text-gray-700">Sale Price</Label>
                  <Input id="editPrice" type="number" value={editForm.sale_price ?? ''} onChange={e => setEditForm({ ...editForm, sale_price: Number(e.target.value) })} />
                </div>
                <div>
                  <Label htmlFor="editCost" className="text-sm font-medium text-gray-700">Purchase Price</Label>
                  <Input id="editCost" type="number" value={editForm.purchase_price ?? ''} onChange={e => setEditForm({ ...editForm, purchase_price: Number(e.target.value) })} />
                </div>
                <div>
                  <Label htmlFor="editStock" className="text-sm font-medium text-gray-700">Stock</Label>
                  <Input id="editStock" type="number" value={editForm.stock ?? ''} onChange={e => setEditForm({ ...editForm, stock: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editMinStock" className="text-sm font-medium text-gray-700">Min Stock</Label>
                  <Input id="editMinStock" type="number" value={editForm.min_stock ?? ''} onChange={e => setEditForm({ ...editForm, min_stock: Number(e.target.value) })} />
                </div>
                <div>
                  <Label htmlFor="editTaxRate" className="text-sm font-medium text-gray-700">Tax Rate</Label>
                  <Input id="editTaxRate" type="number" value={editForm.tax_rate ?? ''} onChange={e => setEditForm({ ...editForm, tax_rate: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label htmlFor="editDescription" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea id="editDescription" value={editForm.description ?? ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowEditDialog(false)} className="rounded-lg border-gray-300 hover:bg-gray-50">Cancel</Button>
                <Button onClick={handleEditSubmit} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">Update Item</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
