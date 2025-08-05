"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { useCurrency } from "@/lib/currency-manager"
import { useAppSelector } from "@/lib/store/hooks"
import { selectGeneralSettings } from "@/lib/store/slices/settingsSlice"
import { getCountryByCode } from "@/lib/country-data"
import {
  Calculator,
  Plus,
  Minus,
  X,
  Divide,
  Equal,
  Delete,
  TrendingUp,
  DollarSign,
  Package2,
  AlertTriangle,
  Search,
  EyeOff,
  Eye,
  Trash2,
  Target,
  Check,
  Receipt,
  ChevronUp,
  ChevronDown,
  Globe,
  RefreshCw,
  Save,
  Download,
  Clock,
  RotateCcw,
  CheckCircle,
} from "lucide-react"

interface BusinessItem {
  id: string
  name: string
  category: string
  quantity: number
  price: number
  cost: number
  description: string
  sku: string
  minStock: number
  maxStock: number
  supplier: string
  lastUpdated: Date
  customFields: Record<string, any>
  image?: string
  barcode?: string
  location?: string
  tags: string[]
  color: string
}

interface CalculatorHistory {
  id: string
  expression: string
  result: number
  timestamp: Date
  saved?: boolean
}

interface BusinessModule {
  id: string
  name: string
  type: "inventory" | "sales" | "custom" | "analytics" | "calculator"
  items: BusinessItem[]
  settings: Record<string, any>
  position: { x: number; y: number }
  size: { width: number; height: number }
  color: string
  icon: string
  totalStock: number
  pricePerUnit: number
}

interface Transaction {
  id: string
  itemId: string
  itemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  type: "sale" | "purchase" | "adjustment" | "return"
  timestamp: Date
  notes: string
  customer?: string
  paymentMethod?: string
}

interface CartItem {
  moduleId: string
  moduleName: string
  quantity: number
  pricePerUnit: number
  totalPrice: number
  color: string
}

interface Currency {
  code: string
  symbol: string
  name: string
  rate: number // Exchange rate relative to USD
}

interface DailyReset {
  lastResetDate: string
  todaysSalesReset: boolean
}

const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1.0 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.85 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.73 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 110.0 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.25 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.35 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", rate: 0.92 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 6.45 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 74.5 },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", rate: 278.0 },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", rate: 85.0 },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", rate: 200.0 },
  { code: "NPR", symbol: "Rs", name: "Nepalese Rupee", rate: 119.0 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 3.67 },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", rate: 3.75 },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal", rate: 3.64 },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", rate: 0.3 },
  { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar", rate: 0.38 },
  { code: "OMR", symbol: "ر.ع.", name: "Omani Rial", rate: 0.38 },
  { code: "EGP", symbol: "£", name: "Egyptian Pound", rate: 15.7 },
  { code: "ZAR", symbol: "R", name: "South African Rand", rate: 14.8 },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", rate: 411.0 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", rate: 108.0 },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", rate: 6.1 },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", rate: 2320.0 },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling", rate: 3550.0 },
  { code: "RWF", symbol: "RF", name: "Rwandan Franc", rate: 1030.0 },
  { code: "ETB", symbol: "Br", name: "Ethiopian Birr", rate: 47.0 },
  { code: "MXN", symbol: "$", name: "Mexican Peso", rate: 20.1 },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", rate: 5.2 },
  { code: "ARS", symbol: "$", name: "Argentine Peso", rate: 98.0 },
  { code: "CLP", symbol: "$", name: "Chilean Peso", rate: 800.0 },
  { code: "COP", symbol: "$", name: "Colombian Peso", rate: 3800.0 },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol", rate: 3.6 },
  { code: "KRW", symbol: "₩", name: "South Korean Won", rate: 1180.0 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 1.35 },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", rate: 4.15 },
  { code: "THB", symbol: "฿", name: "Thai Baht", rate: 33.0 },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", rate: 14250.0 },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", rate: 50.5 },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", rate: 23000.0 },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", rate: 74.0 },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", rate: 3.9 },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", rate: 21.5 },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", rate: 295.0 },
  { code: "RON", symbol: "lei", name: "Romanian Leu", rate: 4.2 },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev", rate: 1.66 },
  { code: "HRK", symbol: "kn", name: "Croatian Kuna", rate: 6.4 },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", rate: 8.6 },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", rate: 8.5 },
  { code: "DKK", symbol: "kr", name: "Danish Krone", rate: 6.3 },
  { code: "ISK", symbol: "kr", name: "Icelandic Krona", rate: 127.0 },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", rate: 8.8 },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel", rate: 3.2 },
]

const moduleColors = [
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#84cc16", // Lime
  "#f97316", // Orange
  "#10b981", // Emerald
  "#6366f1", // Indigo
  "#14b8a6", // Teal
]

export default function BusinessManager() {
  const generalSettings = useAppSelector(selectGeneralSettings)
  const { formatAmountWithSymbol, getSymbol, getCode, getName } = useCurrency()
  
  // Get current currency from Redux settings
  const getCurrentCurrency = (): Currency => {
    const country = getCountryByCode(generalSettings.selectedCountry)
    if (country) {
      return {
        code: country.currency.code,
        symbol: country.currency.symbol,
        name: country.currency.name,
        rate: 1 // We'll use 1 as base rate since we're not doing conversions
      }
    }
    // Fallback to USD if no country is selected
    return currencies.find(c => c.code === 'USD') || currencies[0]
  }
  
  const [activeTab, setActiveTab] = useState("home")
  const [modules, setModules] = useState<BusinessModule[]>([])
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [calculatorDisplay, setCalculatorDisplay] = useState("0")
  const [calculatorHistory, setCalculatorHistory] = useState<CalculatorHistory[]>([])
  const [currentExpression, setCurrentExpression] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showCalculator, setShowCalculator] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModuleDialog, setShowAddModuleDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showLowStockDialog, setShowLowStockDialog] = useState(false)
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null)
  const [lowStockModule, setLowStockModule] = useState<BusinessModule | null>(null)
  const [newModule, setNewModule] = useState<Partial<BusinessModule>>({})
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [showClearCartDialog, setShowClearCartDialog] = useState(false)
  const [showDeleteItemDialog, setShowDeleteItemDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [customQuantities, setCustomQuantities] = useState<Record<string, number>>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [dailyReset, setDailyReset] = useState<DailyReset>({
    lastResetDate: new Date().toDateString(),
    todaysSalesReset: false,
  })
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  
  // Get current currency based on selected country from Redux
  const selectedCurrency = getCurrentCurrency()

  // Check for daily reset at midnight
  const checkDailyReset = useCallback(() => {
    const currentDate = new Date().toDateString()
    const savedReset = localStorage.getItem("daily-reset-data")
    let resetData: DailyReset = {
      lastResetDate: currentDate,
      todaysSalesReset: false,
    }

    if (savedReset) {
      try {
        resetData = JSON.parse(savedReset)
      } catch (error) {
        console.error("Failed to parse daily reset data:", error)
      }
    }

    // If it's a new day, reset today's sales
    if (resetData.lastResetDate !== currentDate) {
      resetData = {
        lastResetDate: currentDate,
        todaysSalesReset: true,
      }

      // Reset today's sales transactions
      setTransactions((prev) => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayString = yesterday.toDateString()

        // Filter out yesterday's sales transactions
        const filteredTransactions = prev.filter((t) => {
          const transactionDate = new Date(t.timestamp).toDateString()
          return !(t.type === "sale" && transactionDate === yesterdayString)
        })

        return filteredTransactions
      })

      localStorage.setItem("daily-reset-data", JSON.stringify(resetData))
      setDailyReset(resetData)
    }
  }, [])

  // Auto-save functionality with better persistence
  useEffect(() => {
    const saveData = () => {
      setIsAutoSaving(true)
      try {
        localStorage.setItem(
          "business-manager-data",
          JSON.stringify({
            modules,
            transactions,
            calculatorHistory,
            selectedCurrency,
            cart,
            customQuantities,
            lastSaved: new Date().toISOString(),
          }),
        )
        setLastSaved(new Date())
      } catch (error) {
        console.error("Failed to save data:", error)
      } finally {
        setIsAutoSaving(false)
      }
    }

    // Save immediately when data changes
    if (modules.length > 0 || transactions.length > 0) {
      const timeoutId = setTimeout(saveData, 1000) // Debounce saves
      return () => clearTimeout(timeoutId)
    }
  }, [modules, transactions, calculatorHistory, selectedCurrency, cart, customQuantities])

  // Load saved data with better error handling
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem("business-manager-data")
        if (savedData) {
          const parsed = JSON.parse(savedData)
          if (parsed.modules && Array.isArray(parsed.modules)) {
            setModules(parsed.modules)
          }
          if (parsed.transactions && Array.isArray(parsed.transactions)) {
            setTransactions(
              parsed.transactions.map((t: Transaction) => ({
                ...t,
                timestamp: new Date(t.timestamp),
              })),
            )
          }
          if (parsed.calculatorHistory && Array.isArray(parsed.calculatorHistory)) {
            setCalculatorHistory(parsed.calculatorHistory)
          }
          // Note: selectedCurrency is now determined by Redux settings, not local storage
          if (parsed.cart && Array.isArray(parsed.cart)) {
            setCart(parsed.cart)
          }
          if (parsed.customQuantities) {
            setCustomQuantities(parsed.customQuantities)
          }
          if (parsed.lastSaved) {
            setLastSaved(new Date(parsed.lastSaved))
          }
        }
      } catch (error) {
        console.error("Failed to load saved data:", error)
      }
    }

    // Check for daily reset first
    checkDailyReset()
    loadData()

    // Set up interval to check for daily reset every minute
    const interval = setInterval(() => {
      checkDailyReset()
    }, 60000)

    return () => clearInterval(interval)
  }, [checkDailyReset])

  // Update cart total when cart changes
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0)
    setCartTotal(total)
  }, [cart])

  // Currency conversion functions
  const convertPrice = (priceInUSD: number, toCurrency: Currency): number => {
    return priceInUSD * toCurrency.rate
  }

  const convertToUSD = (price: number, fromCurrency: Currency): number => {
    return price / fromCurrency.rate
  }

  const formatCurrency = (amount: number, currency: Currency = selectedCurrency): string => {
    // Use the standard currency formatter instead of custom formatting
    return formatAmountWithSymbol(amount)
  }

  // Currency conversion functionality disabled - currency is now managed through Redux settings
  // const handleCurrencyChange = (newCurrency: Currency) => {
  //   // Convert all existing module prices to the new currency
  //   const updatedModules = modules.map((module) => ({
  //     ...module,
  //     pricePerUnit: convertPrice(convertToUSD(module.pricePerUnit, selectedCurrency), newCurrency),
  //   }))

  //   // Convert cart items
  //   const updatedCart = cart.map((item) => {
  //     const newPricePerUnit = convertPrice(convertToUSD(item.pricePerUnit, selectedCurrency), newCurrency)
  //     return {
  //       ...item,
  //       pricePerUnit: newPricePerUnit,
  //       totalPrice: item.quantity * newPricePerUnit,
  //     }
  //   })

  //   setModules(updatedModules)
  //   setCart(updatedCart)
  // }

  // Enhanced Calculator Functions
  const handleCalculatorInput = (value: string) => {
    if (value === "C") {
      setCalculatorDisplay("0")
      setCurrentExpression("")
    } else if (value === "=") {
      try {
        let expression = currentExpression || calculatorDisplay
        // Replace business variables if any
        expression = expression.replace(/\$(\w+)/g, (match, itemName) => {
          const module = modules.find((m) => m.name.toLowerCase().replace(/\s+/g, "") === itemName.toLowerCase())
          return module ? module.pricePerUnit.toString() : match
        })

        const result = eval(expression)
        const historyEntry: CalculatorHistory = {
          id: Date.now().toString(),
          expression: currentExpression || calculatorDisplay,
          result: result,
          timestamp: new Date(),
        }

        setCalculatorHistory((prev) => [historyEntry, ...prev.slice(0, 19)])
        setCalculatorDisplay(result.toString())
        setCurrentExpression("")
      } catch (error) {
        setCalculatorDisplay("Error")
        setCurrentExpression("")
      }
    } else if (value === "backspace") {
      if (calculatorDisplay.length > 1) {
        setCalculatorDisplay(calculatorDisplay.slice(0, -1))
      } else {
        setCalculatorDisplay("0")
      }
    } else {
      if (calculatorDisplay === "0" && !isNaN(Number(value))) {
        setCalculatorDisplay(value)
      } else {
        setCalculatorDisplay(calculatorDisplay + value)
      }
      setCurrentExpression(calculatorDisplay + value)
    }
  }

  // Module Management Functions
  const addBusinessModule = (moduleData: Partial<BusinessModule>) => {
    const colorIndex = modules.length % moduleColors.length
    const newModule: BusinessModule = {
      id: Date.now().toString(),
      name: moduleData.name || "",
      type: "inventory",
      items: [],
      settings: {},
      position: { x: 0, y: 0 },
      size: { width: 300, height: 200 },
      color: moduleColors[colorIndex],
      icon: "Package",
      totalStock: moduleData.totalStock || 0,
      pricePerUnit: moduleData.pricePerUnit || 0,
    }

    setModules((prev) => [...prev, newModule])

    // Create initial transaction record
    const transaction: Transaction = {
      id: Date.now().toString(),
      itemId: newModule.id,
      itemName: newModule.name,
      quantity: newModule.totalStock,
      unitPrice: newModule.pricePerUnit,
      totalPrice: newModule.totalStock * newModule.pricePerUnit,
      type: "purchase",
      timestamp: new Date(),
      notes: `Initial stock entry for ${newModule.name}`,
    }

    setTransactions((prev) => [transaction, ...prev])
  }

  const deleteModule = (moduleId: string) => {
    setModules((prev) => prev.filter((m) => m.id !== moduleId))
    setCart((prev) => prev.filter((item) => item.moduleId !== moduleId))
    setExpandedModule(null)
    setShowDeleteDialog(false)
    setModuleToDelete(null)
  }

  const updateModuleStock = (moduleId: string, newStock: number) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId ? { ...module, totalStock: Math.max(0, newStock), lastUpdated: new Date() } : module,
      ),
    )
  }

  const addToCart = (module: BusinessModule, quantity: number) => {
    const existingItem = cart.find((item) => item.moduleId === module.id)
    if (existingItem) {
      setCart((prev) =>
        prev.map((item) =>
          item.moduleId === module.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * item.pricePerUnit,
              }
            : item,
        ),
      )
    } else {
      const newCartItem: CartItem = {
        moduleId: module.id,
        moduleName: module.name,
        quantity: quantity,
        pricePerUnit: module.pricePerUnit,
        totalPrice: quantity * module.pricePerUnit,
        color: module.color,
      }
      setCart((prev) => [...prev, newCartItem])
    }
  }

  const removeFromCart = (moduleId: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.moduleId === moduleId
            ? {
                ...item,
                quantity: Math.max(0, item.quantity - quantity),
                totalPrice: Math.max(0, item.quantity - quantity) * item.pricePerUnit,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const confirmSale = () => {
    let allSalesSuccessful = true
    const saleTransactions: Transaction[] = []

    cart.forEach((cartItem) => {
      const module = modules.find((m) => m.id === cartItem.moduleId)
      if (module && module.totalStock >= cartItem.quantity) {
        // Update stock
        updateModuleStock(module.id, module.totalStock - cartItem.quantity)

        // Create transaction
        const transaction: Transaction = {
          id: Date.now().toString(),
          itemId: module.id,
          itemName: module.name,
          quantity: cartItem.quantity,
          unitPrice: cartItem.pricePerUnit,
          totalPrice: cartItem.totalPrice,
          type: "sale",
          timestamp: new Date(),
          notes: `Sale of ${cartItem.quantity} units`,
        }
        saleTransactions.push(transaction)
      } else {
        allSalesSuccessful = false
      }
    })

    if (allSalesSuccessful) {
      setTransactions((prev) => [...saleTransactions, ...prev])
      generateReceipt()
      setCart([])
      setExpandedModule(null)
      setShowConfirmDialog(false)
    } else {
      alert("Insufficient stock for some items!")
    }
  }

  const generateReceipt = () => {
    const receiptData = {
      receiptNumber: `RCP-${Date.now()}`,
      date: new Date().toLocaleString(),
      items: cart,
      subtotal: cartTotal,
      tax: cartTotal * 0.08, // 8% tax
      total: cartTotal * 1.08,
      currency: selectedCurrency,
    }

    const receiptContent = `BUSINESS MANAGER RECEIPT
========================
Receipt #: ${receiptData.receiptNumber}
Date: ${receiptData.date}
Currency: ${selectedCurrency.name} (${selectedCurrency.code})

ITEMS:
${cart
  .map(
    (item) =>
      `${item.moduleName}
Qty: ${item.quantity} x ${formatCurrency(item.pricePerUnit)} = ${formatCurrency(item.totalPrice)}`,
  )
  .join("\n")}

------------------------
Subtotal: ${formatCurrency(receiptData.subtotal)}
Tax (8%): ${formatCurrency(receiptData.tax)}
TOTAL: ${formatCurrency(receiptData.total)}

========================
Thank you for your business!
    `

    const blob = new Blob([receiptContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipt-${receiptData.receiptNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const checkLowStock = (module: BusinessModule) => {
    const lowStockThreshold = Math.max(5, module.totalStock * 0.1) // 10% or minimum 5
    return module.totalStock <= lowStockThreshold
  }

  const handleModuleClick = (module: BusinessModule) => {
    if (checkLowStock(module)) {
      setLowStockModule(module)
      setShowLowStockDialog(true)
    } else {
      setExpandedModule(expandedModule === module.id ? null : module.id)
    }
  }

  const getFilteredModules = () => {
    return modules.filter(
      (module) =>
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.type.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const getTotalInventoryValue = () => {
    return modules.reduce((total, module) => total + module.totalStock * module.pricePerUnit, 0)
  }

  const getTodaysSales = () => {
    const today = new Date().toDateString()
    return transactions
      .filter((t) => t.type === "sale" && new Date(t.timestamp).toDateString() === today)
      .reduce((sum, t) => sum + t.totalPrice, 0)
  }

  const getLowStockCount = () => {
    return modules.filter((module) => checkLowStock(module)).length
  }

  const clearCart = () => {
    setCart([])
    setCustomQuantities({})
    setShowClearCartDialog(false)
  }

  const deleteCartItem = (moduleId: string) => {
    setCart((prev) => prev.filter((item) => item.moduleId !== moduleId))
    setCustomQuantities((prev) => {
      const updated = { ...prev }
      delete updated[moduleId]
      return updated
    })
    setShowDeleteItemDialog(false)
    setItemToDelete(null)
  }

  const updateCartItemQuantity = (moduleId: string, newQuantity: number) => {
    const module = modules.find((m) => m.id === moduleId)
    if (!module) return

    if (newQuantity <= 0) {
      deleteCartItem(moduleId)
      return
    }

    if (newQuantity > module.totalStock) {
      alert(`Cannot exceed available stock of ${module.totalStock}`)
      return
    }

    setCart((prev) =>
      prev.map((item) =>
        item.moduleId === moduleId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.pricePerUnit,
            }
          : item,
      ),
    )

    setCustomQuantities((prev) => ({ ...prev, [moduleId]: newQuantity }))
  }

  const handleCustomQuantityChange = (moduleId: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    setCustomQuantities((prev) => ({ ...prev, [moduleId]: numValue }))
  }

  const applyCustomQuantity = (moduleId: string) => {
    const customQty = customQuantities[moduleId]
    if (customQty !== undefined) {
      updateCartItemQuantity(moduleId, customQty)
    }
  }

  const manualSave = () => {
    setIsAutoSaving(true)
    try {
      localStorage.setItem(
        "business-manager-data",
        JSON.stringify({
          modules,
          transactions,
          calculatorHistory,
          selectedCurrency,
          cart,
          customQuantities,
          lastSaved: new Date().toISOString(),
        }),
      )
      setLastSaved(new Date())
      alert("Data saved successfully!")
    } catch (error) {
      console.error("Failed to save data:", error)
      alert("Failed to save data. Please try again.")
    } finally {
      setIsAutoSaving(false)
    }
  }

  const exportData = () => {
    try {
      const dataToExport = {
        modules,
        transactions,
        calculatorHistory,
        selectedCurrency,
        exportDate: new Date().toISOString(),
        version: "1.0",
      }

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `business-manager-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export data:", error)
      alert("Failed to export data. Please try again.")
    }
  }

  const handleResetAllData = async () => {
    setIsResetting(true)
    setShowResetDialog(false)

    try {
      // Simulate reset process with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Clear all data from localStorage
      localStorage.removeItem("business-manager-data")
      localStorage.removeItem("daily-reset-data")

      // Reset all state variables to initial values
      setModules([])
      setTransactions([])
      setCalculatorHistory([])
      setCart([])
      setCustomQuantities({})
      // Note: Currency is now managed through Redux settings
      setLastSaved(null)
      setDailyReset({
        lastResetDate: new Date().toDateString(),
        todaysSalesReset: false,
      })
      setExpandedModule(null)
      setSelectedModule(null)
      setCalculatorDisplay("0")
      setCurrentExpression("")
      setSearchTerm("")

      // Show success notification
      setTimeout(() => {
        setIsResetting(false)
        alert("All business data has been successfully reset!")
      }, 500)
    } catch (error) {
      console.error("Failed to reset data:", error)
      setIsResetting(false)
      alert("Failed to reset data. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="ml-16 min-h-screen">
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 lg:mb-8 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Client Response Management</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">Universal CRM</Badge>
                  {lastSaved && (
                    <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </Badge>
                  )}
                  {dailyReset.todaysSalesReset && (
                    <Badge className="bg-blue-100 text-blue-600 border-blue-200 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Daily Reset: {dailyReset.lastResetDate}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              {/* Currency Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm">
                    <Globe className="h-4 w-4 mr-2" />
                    {selectedCurrency.symbol} {selectedCurrency.code}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg max-h-64 overflow-y-auto">
                  {currencies.map((currency) => (
                    <DropdownMenuItem
                      key={currency.code}
                      className="text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        // Currency changes are now managed through Settings -> Country Selection
                        console.log(`Currency change to ${currency.code} - please use Settings to change country/currency`)
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {currency.symbol} {currency.code}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">{currency.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                  {showCalculator ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={manualSave}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                  disabled={isAutoSaving}
                >
                  {isAutoSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={exportData}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setShowResetDialog(true)}
                  className="bg-white border border-red-300 text-red-600 hover:bg-red-50 shadow-sm"
                  disabled={isResetting}
                >
                  {isResetting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                </Button>
                <Dialog open={showAddModuleDialog} onOpenChange={setShowAddModuleDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Module
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border border-gray-200 shadow-xl">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900">Create New Business Module</DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Add a new module to manage your inventory
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-700">Item Name *</Label>
                        <Input
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="e.g., Medical Bandages"
                          value={newModule.name || ""}
                          onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Total Stock *</Label>
                        <Input
                          type="number"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="e.g., 100"
                          value={newModule.totalStock || ""}
                          onChange={(e) => setNewModule({ ...newModule, totalStock: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Price Per Unit ({selectedCurrency.symbol}) *</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 flex-1"
                            placeholder="e.g., 2.50"
                            value={newModule.pricePerUnit || ""}
                            onChange={(e) => setNewModule({ ...newModule, pricePerUnit: Number(e.target.value) })}
                          />
                          <div className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded text-gray-700 text-sm">
                            {selectedCurrency.code}
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          Current currency: {selectedCurrency.name} ({selectedCurrency.symbol})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setShowAddModuleDialog(false)
                            setNewModule({})
                          }}
                          className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            if (newModule.name && newModule.totalStock && newModule.pricePerUnit) {
                              addBusinessModule(newModule)
                              setNewModule({})
                              setShowAddModuleDialog(false)
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                        >
                          Create Module
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Inventory Value</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold text-gray-900">
                  {formatCurrency(getTotalInventoryValue())}
                </div>
                <p className="text-xs text-gray-500 mt-1">Current stock value</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Today's Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold text-gray-900">{formatCurrency(getTodaysSales())}</div>
                <div className="flex items-center mt-1">
                  <Clock className="h-3 w-3 text-blue-600 mr-1" />
                  <p className="text-xs text-blue-600">
                    {dailyReset.todaysSalesReset ? "Reset at 12:00 AM" : "Resets at midnight"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold text-gray-900">{getLowStockCount()}</div>
                <p className="text-xs text-gray-500 mt-1">Need attention</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Modules</CardTitle>
                <Package2 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold text-gray-900">{modules.length}</div>
                <p className="text-xs text-gray-500 mt-1">Business modules</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col xl:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1">
              {/* Search Bar */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-10"
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Modules Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {getFilteredModules().map((module) => (
                  <Card
                    key={module.id}
                    className={`bg-white border border-gray-200 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                      checkLowStock(module) ? "border-red-300 bg-red-50" : ""
                    }`}
                    style={{ borderLeft: `4px solid ${module.color}` }}
                    onClick={() => handleModuleClick(module)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: module.color }} />
                          <CardTitle className="text-gray-900 text-sm font-medium truncate">{module.name}</CardTitle>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 h-6 w-6 p-0 border-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setModuleToDelete(module.id)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Stock:</span>
                          <Badge
                            className={`text-xs ${
                              checkLowStock(module)
                                ? "bg-red-100 text-red-700 border-red-200"
                                : "bg-green-100 text-green-700 border-green-200"
                            }`}
                          >
                            {module.totalStock}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Price:</span>
                          <span className="text-gray-900 text-sm font-medium">
                            {formatCurrency(module.pricePerUnit)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Value:</span>
                          <span className="text-gray-900 text-sm font-medium">
                            {formatCurrency(module.totalStock * module.pricePerUnit)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {modules.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-gray-900 text-lg font-medium mb-2">No Modules Yet</h3>
                    <p className="text-gray-600 mb-4">Create your first business module to get started</p>
                    <Button
                      onClick={() => setShowAddModuleDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Module
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer - Expanded Module Details */}
              {expandedModule && (
                <Card className="bg-white border border-gray-200 shadow-sm mt-8">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: modules.find((m) => m.id === expandedModule)?.color,
                          }}
                        />
                        <CardTitle className="text-gray-900">
                          {modules.find((m) => m.id === expandedModule)?.name} - Details
                        </CardTitle>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gray-100 text-gray-600 hover:bg-gray-200"
                        onClick={() => setExpandedModule(null)}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const module = modules.find((m) => m.id === expandedModule)
                      if (!module) return null

                      const cartItem = cart.find((item) => item.moduleId === module.id)
                      const cartQuantity = cartItem?.quantity || 0

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                              <h4 className="text-gray-900 font-medium mb-3">Stock Management</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Current Stock:</span>
                                  <span className="text-gray-900 font-medium">{module.totalStock}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Price per Unit:</span>
                                  <span className="text-gray-900 font-medium">
                                    {formatCurrency(module.pricePerUnit)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Total Value:</span>
                                  <span className="text-gray-900 font-medium">
                                    {formatCurrency(module.totalStock * module.pricePerUnit)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                              <h4 className="text-gray-900 font-medium mb-3">Quick Actions</h4>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  onClick={() => removeFromCart(module.id, 1)}
                                  disabled={cartQuantity === 0}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-gray-900 px-4 py-2 bg-white border border-gray-300 rounded min-w-[3rem] text-center">
                                  {cartQuantity}
                                </span>
                                <Button
                                  size="sm"
                                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  onClick={() => addToCart(module, 1)}
                                  disabled={module.totalStock <= cartQuantity}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-gray-900 font-medium">Cart Summary</h4>
                                {cart.length > 0 && (
                                  <Button
                                    size="sm"
                                    className="bg-red-100 text-red-600 hover:bg-red-200"
                                    onClick={() => setShowClearCartDialog(true)}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Clear Cart
                                  </Button>
                                )}
                              </div>
                              <div className="space-y-3">
                                {cart.length === 0 ? (
                                  <p className="text-gray-500 text-sm">No items in cart</p>
                                ) : (
                                  cart.map((item) => {
                                    const currentCustomQty = customQuantities[item.moduleId] ?? item.quantity
                                    return (
                                      <div
                                        key={item.moduleId}
                                        className="bg-white border border-gray-200 p-3 rounded-lg"
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="w-2 h-2 rounded-full"
                                              style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-gray-900 text-sm font-medium">{item.moduleName}</span>
                                          </div>
                                          <Button
                                            size="sm"
                                            className="bg-red-100 text-red-600 hover:bg-red-200 h-6 w-6 p-0"
                                            onClick={() => {
                                              setItemToDelete(item.moduleId)
                                              setShowDeleteItemDialog(true)
                                            }}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <Button
                                              size="sm"
                                              className="bg-gray-200 text-gray-700 hover:bg-gray-300 h-8 w-8 p-0"
                                              onClick={() => updateCartItemQuantity(item.moduleId, item.quantity - 1)}
                                              disabled={item.quantity <= 1}
                                            >
                                              <Minus className="h-3 w-3" />
                                            </Button>
                                            <div className="flex items-center gap-1">
                                              <Input
                                                type="number"
                                                min="1"
                                                max={modules.find((m) => m.id === item.moduleId)?.totalStock || 999}
                                                value={currentCustomQty}
                                                onChange={(e) =>
                                                  handleCustomQuantityChange(item.moduleId, e.target.value)
                                                }
                                                onBlur={() => applyCustomQuantity(item.moduleId)}
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") {
                                                    applyCustomQuantity(item.moduleId)
                                                  }
                                                }}
                                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-16 h-8 text-center text-gray-900 text-sm"
                                              />
                                            </div>
                                            <Button
                                              size="sm"
                                              className="bg-gray-200 text-gray-700 hover:bg-gray-300 h-8 w-8 p-0"
                                              onClick={() => updateCartItemQuantity(item.moduleId, item.quantity + 1)}
                                              disabled={
                                                item.quantity >=
                                                (modules.find((m) => m.id === item.moduleId)?.totalStock || 0)
                                              }
                                            >
                                              <Plus className="h-3 w-3" />
                                            </Button>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-gray-600 text-xs">
                                              {item.quantity} x {formatCurrency(item.pricePerUnit)}
                                            </div>
                                            <div className="text-gray-900 text-sm font-medium">
                                              {formatCurrency(item.totalPrice)}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })
                                )}
                                {cart.length > 0 && (
                                  <div className="border-t border-gray-300 pt-3 mt-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-900 font-bold text-lg">Total:</span>
                                      <span className="text-gray-900 font-bold text-lg">
                                        {formatCurrency(cartTotal)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => setShowConfirmDialog(true)}
                              disabled={cart.length === 0}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Confirm Sale
                            </Button>
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Scientific Calculator Sidebar */}
            {showCalculator && (
              <div className="w-full xl:w-80">
                <Card className="bg-white border border-gray-200 shadow-sm xl:sticky xl:top-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900 flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Scientific Calculator
                      </CardTitle>
                      <Button
                        size="sm"
                        className="bg-gray-100 text-gray-600 hover:bg-gray-200"
                        onClick={() => setShowCalculator(false)}
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Calculator Display */}
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <div className="text-right text-gray-900 text-2xl font-mono min-h-[2rem] break-all">
                        {calculatorDisplay}
                      </div>
                      {currentExpression && (
                        <div className="text-right text-gray-500 text-sm mt-1">{currentExpression}</div>
                      )}
                    </div>

                    {/* Quick Business Calculations */}
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      <h4 className="text-gray-900 text-sm font-medium mb-2">Quick Business Calc</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                          onClick={() => handleCalculatorInput(`${getTotalInventoryValue()}`)}
                        >
                          Inventory Value
                        </Button>
                        <Button
                          size="sm"
                          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                          onClick={() => handleCalculatorInput(`${getTodaysSales()}`)}
                        >
                          Today's Sales
                        </Button>
                      </div>
                    </div>

                    {/* Calculator History */}
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg max-h-32 overflow-y-auto">
                      <h4 className="text-gray-900 text-sm font-medium mb-2">History</h4>
                      {calculatorHistory.length === 0 ? (
                        <p className="text-gray-500 text-xs">No calculations yet</p>
                      ) : (
                        <div className="space-y-1">
                          {calculatorHistory.slice(0, 5).map((entry) => (
                            <div
                              key={entry.id}
                              className="text-xs cursor-pointer hover:bg-gray-100 p-1 rounded"
                              onClick={() => setCalculatorDisplay(entry.result.toString())}
                            >
                              <div className="text-gray-600">{entry.expression}</div>
                              <div className="text-gray-900 font-medium">= {entry.result}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Calculator Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      {/* Row 1 */}
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("C")}
                      >
                        C
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("backspace")}
                      >
                        <Delete className="h-4 w-4" />
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("(")}
                      >
                        (
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput(")")}
                      >
                        )
                      </Button>
                      {/* Row 2 */}
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("7")}
                      >
                        7
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("8")}
                      >
                        8
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("9")}
                      >
                        9
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("/")}
                      >
                        <Divide className="h-4 w-4" />
                      </Button>
                      {/* Row 3 */}
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("4")}
                      >
                        4
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("5")}
                      >
                        5
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("6")}
                      >
                        6
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("*")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {/* Row 4 */}
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("1")}
                      >
                        1
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("2")}
                      >
                        2
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("3")}
                      >
                        3
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("-")}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      {/* Row 5 */}
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 col-span-2"
                        onClick={() => handleCalculatorInput("0")}
                      >
                        0
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput(".")}
                      >
                        .
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCalculatorInput("+")}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {/* Row 6 */}
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white col-span-4"
                        onClick={() => handleCalculatorInput("=")}
                      >
                        <Equal className="h-4 w-4 mr-2" />
                        Calculate
                      </Button>
                    </div>

                    {/* Scientific Functions */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                        onClick={() => handleCalculatorInput("Math.sin(")}
                      >
                        sin
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                        onClick={() => handleCalculatorInput("Math.cos(")}
                      >
                        cos
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                        onClick={() => handleCalculatorInput("Math.tan(")}
                      >
                        tan
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                        onClick={() => handleCalculatorInput("Math.log(")}
                      >
                        log
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                        onClick={() => handleCalculatorInput("Math.sqrt(")}
                      >
                        √
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                        onClick={() => handleCalculatorInput("**2")}
                      >
                        x²
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                        onClick={() => handleCalculatorInput("Math.PI")}
                      >
                        π
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                        onClick={() => handleCalculatorInput("Math.E")}
                      >
                        e
                      </Button>
                      <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                        onClick={() => handleCalculatorInput("%")}
                      >
                        %
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Dialog Components */}
      {/* Reset All Data Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Reset All Business Data
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              This will permanently delete ALL business data and reset the system to its initial state. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h4 className="text-red-700 font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Data to be permanently deleted:
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-red-600" />
                  <span className="text-gray-900 text-sm">All Business Modules ({modules.length} modules)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-red-600" />
                  <span className="text-gray-900 text-sm">
                    All Transaction History ({transactions.length} transactions)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-red-600" />
                  <span className="text-gray-900 text-sm">Shopping Cart ({cart.length} items)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-red-600" />
                  <span className="text-gray-900 text-sm">Calculator History ({calculatorHistory.length} entries)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-red-600" />
                  <span className="text-gray-900 text-sm">Today's Sales ({formatCurrency(getTodaysSales())})</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-red-600" />
                  <span className="text-gray-900 text-sm">
                    Total Inventory Value ({formatCurrency(getTotalInventoryValue())})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-red-600" />
                  <span className="text-gray-900 text-sm">Currency Settings & Preferences</span>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-800 text-sm font-medium">Warning: This action is irreversible!</span>
              </div>
              <p className="text-yellow-700 text-xs mt-1">
                All data will be permanently lost. Consider exporting your data first if you need to keep it.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowResetDialog(false)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleResetAllData} className="bg-red-600 hover:bg-red-700 text-white flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Confirm Sale</DialogTitle>
            <DialogDescription className="text-gray-600">
              Please review your sale before confirming. A receipt will be generated automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <h4 className="text-gray-900 font-medium mb-3">Sale Summary</h4>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.moduleId} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-900">{item.moduleName}</span>
                    </div>
                    <span className="text-gray-600">
                      {item.quantity} x {formatCurrency(item.pricePerUnit)} = {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-300 pt-2 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-medium">Subtotal:</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax (8%):</span>
                    <span className="text-gray-600">{formatCurrency(cartTotal * 0.08)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-900 font-bold">Total:</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(cartTotal * 1.08)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowConfirmDialog(false)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1"
              >
                Cancel
              </Button>
              <Button onClick={confirmSale} className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                <Receipt className="h-4 w-4 mr-2" />
                Confirm & Generate Receipt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Delete Module</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this module? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowDeleteDialog(false)}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => moduleToDelete && deleteModule(moduleToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Low Stock Alert Dialog */}
      <Dialog open={showLowStockDialog} onOpenChange={setShowLowStockDialog}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Low Stock Alert
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              This item is running low on stock and needs attention.
            </DialogDescription>
          </DialogHeader>
          {lowStockModule && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="text-gray-900 font-medium mb-2">{lowStockModule.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Stock:</span>
                    <span className="text-red-600 font-medium">{lowStockModule.totalStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recommended Minimum:</span>
                    <span className="text-yellow-600">{Math.max(5, Math.floor(lowStockModule.totalStock * 0.1))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="text-gray-900">{formatCurrency(lowStockModule.pricePerUnit)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowLowStockDialog(false)
                    setLowStockModule(null)
                  }}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1"
                >
                  Acknowledge
                </Button>
                <Button
                  onClick={() => {
                    setShowLowStockDialog(false)
                    setLowStockModule(null)
                    setExpandedModule(lowStockModule.id)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  Manage Stock
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Clear Cart Confirmation Dialog */}
      <Dialog open={showClearCartDialog} onOpenChange={setShowClearCartDialog}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Clear Cart</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <h4 className="text-gray-900 font-medium mb-2">Items to be removed:</h4>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.moduleId} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-900 text-sm">{item.moduleName}</span>
                    </div>
                    <span className="text-gray-600 text-sm">
                      {item.quantity} x {formatCurrency(item.pricePerUnit)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-medium">Total Value:</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowClearCartDialog(false)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1"
              >
                Cancel
              </Button>
              <Button onClick={clearCart} className="bg-red-600 hover:bg-red-700 text-white flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Cart Item Confirmation Dialog */}
      <Dialog open={showDeleteItemDialog} onOpenChange={setShowDeleteItemDialog}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Remove Item</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to remove this item from your cart?
            </DialogDescription>
          </DialogHeader>
          {itemToDelete && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                {(() => {
                  const item = cart.find((i) => i.moduleId === itemToDelete)
                  if (!item) return null
                  return (
                    <div>
                      <h4 className="text-gray-900 font-medium mb-2">{item.moduleName}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="text-gray-900">{item.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unit Price:</span>
                          <span className="text-gray-900">{formatCurrency(item.pricePerUnit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="text-gray-900 font-medium">{formatCurrency(item.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowDeleteItemDialog(false)
                    setItemToDelete(null)
                  }}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => itemToDelete && deleteCartItem(itemToDelete)}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Item
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Success Indicator */}
      {isResetting && (
        <div className="fixed bottom-6 left-6 bg-white border border-gray-200 shadow-lg rounded-lg p-4 z-50">
          <div className="flex items-center gap-3">
            <RotateCcw className="h-5 w-5 text-red-600 animate-spin" />
            <div>
              <p className="text-gray-900 text-sm font-medium">Resetting All Business Data...</p>
              <p className="text-gray-600 text-xs">Please wait while we clear all system data</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
