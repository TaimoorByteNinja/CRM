"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { useAppSelector } from "@/lib/store/hooks"
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'

import type { FunctionComponent } from "react"

import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Zap,
  Upload,
  Download,
  FileSpreadsheet,
  Users,
  QrCode,
  Database,
  Shield,
  Calendar,
  CloudUpload,
  CheckCircle,
  AlertTriangle,
  Info,
  Edit,
  Save,
  X,
  Search,
  RefreshCw,
  FileText,
  Printer,
  Eye,
  Archive,
  Loader2,
  Check,
  FileX,
} from "lucide-react"
import LoadingSpinner from "@/components/LoadingSpinner"

// Currency formatting function
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0"
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

// Interfaces
interface ImportItem {
  itemName: string
  hsn: string
  salePrice: number
  purchasePrice: number
  openingStock: number
  minimumStock: number
  godown: string
  gstRate: string
  taxable: string
}

interface Party {
  id?: string
  name: string
  contact: string
  email: string
  address: string
  openingBalance: number
  type: "customer" | "supplier"
  phone?: string
  city?: string
  state?: string
  pincode?: string
  gstin?: string
  pan?: string
  creditLimit?: number
  balance?: number
  status?: string
  createdAt?: string
  updatedAt?: string
  totalTransactions?: number
  lastTransaction?: string
}

interface ImportParty {
  name: string
  contact: string
  email: string
  address: string
  openingBalance: number
  type: "customer" | "supplier"
  phone?: string
  city?: string
  state?: string
  pincode?: string
  gstin?: string
  pan?: string
  creditLimit?: number
}

interface BulkUpdateItem {
  id: string
  itemName: string
  category: string
  purchasePrice: number
  salePrice: number
  stock: number
  hsnCode?: string
  unit?: string
  description?: string
  sku?: string
  minStock?: number
  maxStock?: number
  supplier?: string
  location?: string
  tags?: string[]
  color?: string
  lastUpdated?: string
}

const UtilitiesPage: FunctionComponent = () => {
  const [activeTab, setActiveTab] = useState("utilities")
  const [selectedUtility, setSelectedUtility] = useState("import-items")
  
  // Get phone number from Redux store
  const phoneNumber = useAppSelector((state) => state.settings.general.phoneNumber)
  
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [importItems, setImportItems] = useState<ImportItem[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [bulkItems, setBulkItems] = useState<BulkUpdateItem[]>([])
  const [bulkView, setBulkView] = useState("pricing")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCloseYearDialog, setShowCloseYearDialog] = useState(false)
  const [verificationResults, setVerificationResults] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [barcodeItems, setBarcodeItems] = useState<string[]>([])
  const [isLoadingBarcodeItems, setIsLoadingBarcodeItems] = useState(false)
  const [isGeneratingBarcodes, setIsGeneratingBarcodes] = useState(false)
  const [barcodeType, setBarcodeType] = useState<"barcode" | "qr">("barcode")
  const [generatedBarcodes, setGeneratedBarcodes] = useState<{[key: string]: string}>({})
  const [generatedQRCodes, setGeneratedQRCodes] = useState<{[key: string]: string}>({})
  
  // New state variables for bulk update functionality
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [isSavingChanges, setIsSavingChanges] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [originalItems, setOriginalItems] = useState<BulkUpdateItem[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  // New state variables for party import functionality
  const [importParties, setImportParties] = useState<ImportParty[]>([])
  const [showPartiesPreview, setShowPartiesPreview] = useState(false)
  const [isImportingParties, setIsImportingParties] = useState(false)
  const [partiesUploadProgress, setPartiesUploadProgress] = useState(0)
  const [partiesUploadedFile, setPartiesUploadedFile] = useState<File | null>(null)
  const [partiesFileInputRef] = useState(useRef<HTMLInputElement>(null))
  const [partiesDragRef] = useState(useRef<HTMLDivElement>(null))

  // New state variables for items import functionality
  const [showItemsPreview, setShowItemsPreview] = useState(false)
  const [isImportingItems, setIsImportingItems] = useState(false)
  const [itemsUploadProgress, setItemsUploadProgress] = useState(0)
  const [itemsUploadedFile, setItemsUploadedFile] = useState<File | null>(null)
  const [itemsFileInputRef] = useState(useRef<HTMLInputElement>(null))
  const [itemsDragRef] = useState(useRef<HTMLDivElement>(null))

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  // Fetch items from backend when bulk update tab is selected
  useEffect(() => {
    if (selectedUtility === "update-bulk" && bulkItems.length === 0) {
      fetchItemsFromBackend()
    }
  }, [selectedUtility])

  // Fetch items for barcode generator when tab is selected
  useEffect(() => {
    if (selectedUtility === "barcode-generator" && bulkItems.length === 0) {
      fetchItemsForBarcodeGenerator()
    }
  }, [selectedUtility])

  // Fetch export data when export-tally tab is selected
  useEffect(() => {
    if (selectedUtility === "export-tally" && !exportData) {
      fetchExportData()
    }
  }, [selectedUtility])

  // Fetch items data when export-items tab is selected
  useEffect(() => {
    if (selectedUtility === "export-items" && exportItemsData.length === 0) {
      fetchItemsForExport()
    }
  }, [selectedUtility])

  // Check for changes in bulk items
  useEffect(() => {
    if (originalItems.length > 0 && bulkItems.length > 0) {
      const hasChanges = bulkItems.some((item, index) => {
        const original = originalItems[index]
        return (
          item.purchasePrice !== original.purchasePrice ||
          item.salePrice !== original.salePrice ||
          item.stock !== original.stock ||
          item.hsnCode !== original.hsnCode ||
          item.unit !== original.unit ||
          item.description !== original.description ||
          item.sku !== original.sku ||
          item.minStock !== original.minStock ||
          item.maxStock !== original.maxStock ||
          item.supplier !== original.supplier ||
          item.location !== original.location
        )
      })
      setHasChanges(hasChanges)
    }
  }, [bulkItems, originalItems])

  // Function to fetch items from backend
  const fetchItemsFromBackend = async () => {
    if (!phoneNumber) {
      console.error('No phone number available for API call')
      return
    }
    
    setIsLoadingItems(true)
    try {
      const response = await fetch(`/api/business-hub/items?phone=${encodeURIComponent(phoneNumber)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch items')
      }
      const data = await response.json()
      
      // Transform the data to match our BulkUpdateItem interface
      const transformedItems: BulkUpdateItem[] = data.map((item: any) => ({
        id: item.id,
        itemName: item.name || item.itemName || '',
        category: item.category || '',
        purchasePrice: item.cost || item.purchasePrice || 0,
        salePrice: item.price || item.salePrice || 0,
        stock: item.quantity || item.stock || 0,
        hsnCode: item.hsn || item.hsnCode || '',
        unit: item.unit || 'pcs',
        description: item.description || '',
        sku: item.sku || '',
        minStock: item.minStock || 0,
        maxStock: item.maxStock || 0,
        supplier: item.supplier || '',
        location: item.location || '',
        tags: item.tags || [],
        color: item.color || '#3B82F6',
        lastUpdated: item.updated_at || item.lastUpdated || new Date().toISOString(),
      }))
      
      setBulkItems(transformedItems)
      setOriginalItems(transformedItems)
    } catch (error) {
      console.error('Error fetching items:', error)
      // Show error message to user
    } finally {
      setIsLoadingItems(false)
    }
  }

  // Function to fetch items specifically for barcode generator
  const fetchItemsForBarcodeGenerator = async () => {
    if (!phoneNumber) {
      console.error('No phone number available for API call')
      return
    }
    
    setIsLoadingBarcodeItems(true)
    try {
      const response = await fetch(`/api/business-hub/items?phone=${encodeURIComponent(phoneNumber)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch items')
      }
      const data = await response.json()
      
      // Transform the data to match our BulkUpdateItem interface
      const transformedItems: BulkUpdateItem[] = data.map((item: any) => ({
        id: item.id,
        itemName: item.name || item.itemName || '',
        category: item.category || '',
        purchasePrice: item.cost || item.purchasePrice || 0,
        salePrice: item.price || item.salePrice || 0,
        stock: item.quantity || item.stock || 0,
        hsnCode: item.hsn || item.hsnCode || '',
        unit: item.unit || 'pcs',
        description: item.description || '',
        sku: item.sku || '',
        minStock: item.minStock || 0,
        maxStock: item.maxStock || 0,
        supplier: item.supplier || '',
        location: item.location || '',
        tags: item.tags || [],
        color: item.color || '#3B82F6',
        lastUpdated: item.updated_at || item.lastUpdated || new Date().toISOString(),
      }))
      
      setBulkItems(transformedItems)
    } catch (error) {
      console.error('Error fetching items for barcode generator:', error)
      alert('Failed to fetch items. Please try again.')
    } finally {
      setIsLoadingBarcodeItems(false)
    }
  }

  // Function to save changes to backend
  const saveChangesToBackend = async () => {
    setIsSavingChanges(true)
    try {
      // Get only the items that have been selected and have changes
      const itemsToUpdate = bulkItems.filter(item => 
        selectedItems.includes(item.id) && 
        originalItems.find(original => original.id === item.id && 
          (original.purchasePrice !== item.purchasePrice ||
           original.salePrice !== item.salePrice ||
           original.stock !== item.stock ||
           original.hsnCode !== item.hsnCode ||
           original.unit !== item.unit ||
           original.description !== item.description ||
           original.sku !== item.sku ||
           original.minStock !== item.minStock ||
           original.maxStock !== item.maxStock ||
           original.supplier !== item.supplier ||
           original.location !== item.location)
        )
      )

      if (itemsToUpdate.length === 0) {
        alert('No changes detected in selected items')
        return
      }

      // Update each item individually
      const updatePromises = itemsToUpdate.map(async (item) => {
        const response = await fetch(`/api/business-hub/items/${item.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: item.itemName,
            category: item.category,
            cost: item.purchasePrice,
            price: item.salePrice,
            quantity: item.stock,
            hsn: item.hsnCode,
            unit: item.unit,
            description: item.description,
            sku: item.sku,
            minStock: item.minStock,
            maxStock: item.maxStock,
            supplier: item.supplier,
            location: item.location,
            tags: item.tags,
            color: item.color,
            updated_at: new Date().toISOString(),
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to update item ${item.itemName}`)
        }

        return response.json()
      })

      await Promise.all(updatePromises)
      
      // Refresh the items from backend
      await fetchItemsFromBackend()
      
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
      
      // Clear selected items
      setSelectedItems([])
      
    } catch (error) {
      console.error('Error saving changes:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSavingChanges(false)
    }
  }

  // Function to reset changes
  const resetChanges = () => {
    setBulkItems([...originalItems])
    setSelectedItems([])
    setHasChanges(false)
  }

  // Function to handle individual item save
  const handleIndividualSave = async (item: BulkUpdateItem) => {
    try {
      const response = await fetch(`/api/business-hub/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: item.itemName,
          category: item.category,
          cost: item.purchasePrice,
          price: item.salePrice,
          quantity: item.stock,
          hsn: item.hsnCode,
          unit: item.unit,
          description: item.description,
          sku: item.sku,
          minStock: item.minStock,
          maxStock: item.maxStock,
          supplier: item.supplier,
          location: item.location,
          tags: item.tags,
          color: item.color,
          updated_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update item ${item.itemName}`)
      }

      // Update the original items to reflect the change
      const updatedOriginalItems = originalItems.map(original => 
        original.id === item.id ? item : original
      )
      setOriginalItems(updatedOriginalItems)
      
      alert(`Item "${item.itemName}" updated successfully!`)
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Failed to save item. Please try again.')
    }
  }

  // Party import functions
  const downloadPartiesTemplate = () => {
    // Create sample data for template
    const sampleData = [
      {
        name: "Sample Customer",
        contact: "+91-9876543210",
        email: "customer@example.com",
        address: "123 Main Street",
        openingBalance: 0,
        type: "customer",
        phone: "+91-9876543210",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        gstin: "27ABCDE1234F1Z5",
        pan: "ABCDE1234F",
        creditLimit: 50000
      },
      {
        name: "Sample Supplier",
        contact: "+91-9876543211",
        email: "supplier@example.com",
        address: "456 Business Avenue",
        openingBalance: 0,
        type: "supplier",
        phone: "+91-9876543211",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        gstin: "07ABCDE1234F1Z5",
        pan: "ABCDE1234G",
        creditLimit: 100000
      }
    ]

    // Convert to CSV format
    const headers = [
      "name", "contact", "email", "address", "openingBalance", "type",
      "phone", "city", "state", "pincode", "gstin", "pan", "creditLimit"
    ]
    
    const csvContent = [
      headers.join(","),
      ...sampleData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        }).join(",")
      )
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'parties-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handlePartiesFileUpload = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      alert("Please upload only .xlsx, .xls, or .csv files")
      return
    }

    setPartiesUploadedFile(file)
    setIsImportingParties(true)
    setPartiesUploadProgress(0)

    try {
      // Simulate file processing with progress
      const interval = setInterval(() => {
        setPartiesUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsImportingParties(false)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // Parse the file content
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      const parties: ImportParty[] = []
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const party: ImportParty = {
            name: values[headers.indexOf('name')] || '',
            contact: values[headers.indexOf('contact')] || '',
            email: values[headers.indexOf('email')] || '',
            address: values[headers.indexOf('address')] || '',
            openingBalance: parseFloat(values[headers.indexOf('openingBalance')]) || 0,
            type: (values[headers.indexOf('type')] as "customer" | "supplier") || "customer",
            phone: values[headers.indexOf('phone')] || '',
            city: values[headers.indexOf('city')] || '',
            state: values[headers.indexOf('state')] || '',
            pincode: values[headers.indexOf('pincode')] || '',
            gstin: values[headers.indexOf('gstin')] || '',
            pan: values[headers.indexOf('pan')] || '',
            creditLimit: parseFloat(values[headers.indexOf('creditLimit')]) || 0,
          }
          parties.push(party)
        }
      }

      setImportParties(parties)
      setShowPartiesPreview(true)
      
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Error processing file. Please check the file format.')
      setIsImportingParties(false)
    }
  }, [])

  const handlePartiesDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50')
  }, [])

  const handlePartiesDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
  }, [])

  const handlePartiesDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handlePartiesFileUpload(files[0])
    }
  }, [handlePartiesFileUpload])

  const savePartiesToBackend = async () => {
    if (!phoneNumber) {
      console.error('No phone number available for API call')
      alert('Phone number is required to save parties.')
      return
    }
    
    setIsImportingParties(true)
    try {
      const savePromises = importParties.map(async (party) => {
        const response = await fetch('/api/business-hub/parties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phoneNumber,
            name: party.name,
            type: party.type,
            party_phone: party.contact || party.phone,
            email: party.email,
            address: party.address,
            city: party.city,
            state: party.state,
            pincode: party.pincode,
            gstin: party.gstin,
            pan: party.pan,
            credit_limit: party.creditLimit,
            balance: party.openingBalance,
            status: 'active',
            total_transactions: 0,
            last_transaction: null,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to save party ${party.name}`)
        }

        return response.json()
      })

      await Promise.all(savePromises)
      
      alert(`Successfully imported ${importParties.length} parties!`)
      setImportParties([])
      setShowPartiesPreview(false)
      setPartiesUploadedFile(null)
      
    } catch (error) {
      console.error('Error saving parties:', error)
      alert('Failed to save parties. Please try again.')
    } finally {
      setIsImportingParties(false)
    }
  }

  // Items import functions
  const downloadItemsTemplate = () => {
    // Create sample data for template
    const sampleData = [
      {
        itemName: "Sample Item 1",
        hsn: "H001",
        salePrice: 150,
        purchasePrice: 100,
        openingStock: 50,
        minimumStock: 10,
        godown: "Main Store",
        gstRate: "GST@18%",
        taxable: "Y",
      },
      {
        itemName: "Sample Item 2",
        hsn: "H002",
        salePrice: 200,
        purchasePrice: 150,
        openingStock: 30,
        minimumStock: 5,
        godown: "Warehouse A",
        gstRate: "GST@12%",
        taxable: "Y",
      }
    ]

    // Convert to CSV format
    const headers = [
      "itemName", "hsn", "salePrice", "purchasePrice", "openingStock", 
      "minimumStock", "godown", "gstRate", "taxable"
    ]
    
    const csvContent = [
      headers.join(","),
      ...sampleData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        }).join(",")
      )
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'items-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleItemsFileUpload = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      alert("Please upload only .xlsx, .xls, or .csv files")
      return
    }

    setItemsUploadedFile(file)
    setIsImportingItems(true)
    setItemsUploadProgress(0)

    try {
      // Simulate file processing with progress
      const interval = setInterval(() => {
        setItemsUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsImportingItems(false)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // Parse the file content
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      const items: ImportItem[] = []
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const item: ImportItem = {
            itemName: values[headers.indexOf('itemName')] || '',
            hsn: values[headers.indexOf('hsn')] || '',
            salePrice: parseFloat(values[headers.indexOf('salePrice')]) || 0,
            purchasePrice: parseFloat(values[headers.indexOf('purchasePrice')]) || 0,
            openingStock: parseFloat(values[headers.indexOf('openingStock')]) || 0,
            minimumStock: parseFloat(values[headers.indexOf('minimumStock')]) || 0,
            godown: values[headers.indexOf('godown')] || '',
            gstRate: values[headers.indexOf('gstRate')] || '',
            taxable: values[headers.indexOf('taxable')] || 'N',
          }
          items.push(item)
        }
      }

      setImportItems(items)
      setShowItemsPreview(true)
      
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Error processing file. Please check the file format.')
      setIsImportingItems(false)
    }
  }, [])

  const handleItemsDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleItemsDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleItemsDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleItemsFileUpload(files[0])
      }
    },
    [handleItemsFileUpload],
  )

  const saveItemsToBackend = async () => {
    if (!phoneNumber) {
      console.error('No phone number available for API call')
      alert('Phone number is required to save items.')
      return
    }
    
    setIsImportingItems(true)
    try {
      const savePromises = importItems.map(async (item) => {
        const response = await fetch('/api/business-hub/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phoneNumber,
            name: item.itemName,
            item_name: item.itemName,
            hsn: item.hsn,
            hsn_code: item.hsn,
            price: item.salePrice,
            sale_price: item.salePrice,
            cost: item.purchasePrice,
            purchase_price: item.purchasePrice,
            quantity: item.openingStock,
            stock: item.openingStock,
            stock_quantity: item.openingStock,
            min_stock: item.minimumStock,
            minimum_stock: item.minimumStock,
            location: item.godown,
            gst_rate: item.gstRate,
            taxable: item.taxable === 'Y',
            category: 'Imported',
            unit: 'pcs',
            description: '',
            sku: '',
            supplier: '',
            tags: [],
            color: '#3B82F6',
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to save item ${item.itemName}`)
        }

        return response.json()
      })

      await Promise.all(savePromises)
      
      alert(`Successfully imported ${importItems.length} items!`)
      setImportItems([])
      setShowItemsPreview(false)
      setItemsUploadedFile(null)
      
    } catch (error) {
      console.error('Error saving items:', error)
      alert('Failed to save items. Please try again.')
    } finally {
      setIsImportingItems(false)
    }
  }

  // Utility options
  const utilityOptions = [
    { key: "import-items", label: "Import Items", icon: FileSpreadsheet },
    { key: "barcode-generator", label: "Barcode Generator", icon: QrCode },
    { key: "update-bulk", label: "Update Items In Bulk", icon: Edit },
    { key: "import-parties", label: "Import Parties", icon: Users },
    { key: "export-tally", label: "Export to Tally", icon: Database },
    { key: "export-items", label: "Export Items", icon: Download },
    { key: "verify-data", label: "Verify My Data", icon: Shield },
    { key: "close-year", label: "Close Financial Year", icon: Calendar },
  ]

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      alert("Please upload only .xlsx or .xls files")
      return
    }

    setUploadedFile(file)
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate file processing
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          // Mock imported data
          setImportItems([
            {
              itemName: "Item 1",
              hsn: "H001",
              salePrice: 15,
              purchasePrice: 10,
              openingStock: 20,
              minimumStock: 5,
              godown: "Store 1",
              gstRate: "GST@0%",
              taxable: "N",
            },
            {
              itemName: "Item 2",
              hsn: "H002",
              salePrice: 10,
              purchasePrice: 8,
              openingStock: 40,
              minimumStock: 10,
              godown: "Store 2",
              gstRate: "GST@0%",
              taxable: "N",
            },
          ])
          setShowPreview(true)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }, [])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  // Download sample file
  const downloadSample = useCallback(() => {
    const sampleData = [
      [
        "Item Name",
        "HSN",
        "Sale Price",
        "Purchase Price",
        "Opening Stock Quantity",
        "Minimum Stock",
        "Godown",
        "GST Rate",
        "Taxable",
      ],
      ["Item 1", "H001", "15", "10", "20", "5", "Store 1", "GST@0%", "N"],
      ["Item 2", "H002", "10", "8", "40", "10", "Store 2", "GST@0%", "N"],
    ]

    const csvContent = sampleData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample-items.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // Verify data integrity
  const verifyData = useCallback(async () => {
    setIsVerifying(true)

    // Simulate verification process
    setTimeout(() => {
      setVerificationResults({
        missingHSN: 3,
        missingCategory: 1,
        duplicateEntries: 2,
        stockMismatches: 0,
        missingTaxFields: 1,
        totalIssues: 7,
      })
      setIsVerifying(false)
    }, 2000)
  }, [])

  // Generate real scannable barcode
  const generateBarcode = useCallback(async (item: BulkUpdateItem) => {
    try {
      // Create a unique barcode value using item data
      const barcodeValue = `${item.sku || item.id}-${item.itemName.replace(/\s+/g, '')}-${item.salePrice}`
      
      // Create canvas element for barcode
      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 100
      
      // Generate barcode using JsBarcode
      JsBarcode(canvas, barcodeValue, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 14,
        margin: 10,
        background: "#ffffff",
        lineColor: "#000000"
      })
      
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('Error generating barcode:', error)
      return null
    }
  }, [])

  // Generate real scannable QR code
  const generateQRCode = useCallback(async (item: BulkUpdateItem) => {
    try {
      // Create QR code data with item information
      const qrData = JSON.stringify({
        name: item.itemName,
        sku: item.sku || item.id,
        price: item.salePrice,
        category: item.category,
        stock: item.stock
      })
      
      // Generate QR code using qrcode library
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      
      return qrDataUrl
    } catch (error) {
      console.error('Error generating QR code:', error)
      return null
    }
  }, [])

  // Generate barcodes
  const generateBarcodes = useCallback(async () => {
    if (selectedItems.length === 0) {
      alert("Please select items to generate barcodes")
      return
    }
    
    setIsGeneratingBarcodes(true)
    
    try {
      const newBarcodes: {[key: string]: string} = {}
      const newQRCodes: {[key: string]: string} = {}
      
      // Generate barcodes and QR codes for selected items
      for (const itemId of selectedItems) {
        const item = bulkItems.find(i => i.id === itemId)
        if (item) {
          const barcodeDataUrl = await generateBarcode(item)
          const qrDataUrl = await generateQRCode(item)
          
          if (barcodeDataUrl) {
            newBarcodes[itemId] = barcodeDataUrl
          }
          if (qrDataUrl) {
            newQRCodes[itemId] = qrDataUrl
          }
        }
      }
      
      setGeneratedBarcodes(newBarcodes)
      setGeneratedQRCodes(newQRCodes)
      setBarcodeItems(selectedItems)
    } catch (error) {
      console.error('Error generating barcodes:', error)
      alert('Failed to generate barcodes. Please try again.')
    } finally {
      setIsGeneratingBarcodes(false)
    }
  }, [selectedItems, bulkItems, generateBarcode, generateQRCode])

    // Download barcodes as images
  const downloadBarcodes = useCallback(async () => {
    if (barcodeItems.length === 0) {
      alert('No barcodes to download')
      return
    }
  
    try {
      // Create a zip file with all barcode images
      const JSZip = await import('jszip')
      const zip = new JSZip.default()
      
      for (const itemId of barcodeItems) {
        const item = bulkItems.find(i => i.id === itemId)
        if (!item) continue
        
        const barcodeDataUrl = barcodeType === "barcode" 
          ? generatedBarcodes[itemId]
          : generatedQRCodes[itemId]
        
        if (barcodeDataUrl) {
          // Convert data URL to blob
          const response = await fetch(barcodeDataUrl)
          const blob = await response.blob()
          
          // Add to zip with descriptive filename
          const filename = `${item.itemName.replace(/[^a-zA-Z0-9]/g, '_')}-${barcodeType}-${item.sku || item.id}.png`
          zip.file(filename, blob)
        }
      }
      
      // Generate and download zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `barcodes-${barcodeType}-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading barcodes:', error)
      alert('Failed to download barcodes. Please try again.')
    }
  }, [barcodeItems, bulkItems, barcodeType, generatedBarcodes, generatedQRCodes])

  // State for export to tally functionality
  const [isExportingToTally, setIsExportingToTally] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportData, setExportData] = useState<{
    items: any[]
    parties: any[]
    sales: any[]
    totalItems: number
    totalParties: number
    totalSales: number
  } | null>(null)

  // Fetch real data for export
  const fetchExportData = async () => {
    if (!phoneNumber) {
      console.error('No phone number available for API call')
      return null
    }
    
    setIsExportingToTally(true)
    setExportProgress(0)
    
    try {
      // Fetch items
      setExportProgress(20)
      const itemsResponse = await fetch(`/api/business-hub/items?phone=${encodeURIComponent(phoneNumber)}`)
      const itemsData = await itemsResponse.ok ? await itemsResponse.json() : []
      
      // Fetch parties
      setExportProgress(40)
      const partiesResponse = await fetch(`/api/business-hub/parties?phone=${encodeURIComponent(phoneNumber)}`)
      const partiesData = await partiesResponse.ok ? await partiesResponse.json() : []
      
      // Fetch sales
      setExportProgress(60)
      const salesResponse = await fetch(`/api/business-hub/sales?phone=${encodeURIComponent(phoneNumber)}`)
      const salesData = await salesResponse.ok ? await salesResponse.json() : []
      
      setExportProgress(80)
      
      const exportDataObj = {
        items: itemsData,
        parties: partiesData,
        sales: salesData,
        totalItems: itemsData.length,
        totalParties: partiesData.length,
        totalSales: salesData.length
      }
      
      setExportData(exportDataObj)
      setExportProgress(100)
      
      return exportDataObj
    } catch (error) {
      console.error('Error fetching export data:', error)
      alert('Failed to fetch data for export. Please try again.')
      throw error
    } finally {
      setIsExportingToTally(false)
    }
  }

  // Export functions
  const exportToTally = useCallback(async () => {
    try {
      setIsExportingToTally(true)
      setExportProgress(0)
      
      // Fetch real data from backend
      const data = await fetchExportData()
      
      if (!data || (data.totalItems === 0 && data.totalParties === 0 && data.totalSales === 0)) {
        alert('No data available to export. Please add some items, parties, or sales first.')
        return
      }

      // Create Tally XML content
      const xmlContent = generateTallyXML(data)
      
      // Create and download file
      const blob = new Blob([xmlContent], { type: "application/xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `tally-export-${new Date().toISOString().split('T')[0]}.xml`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      alert(`Successfully exported ${data.totalItems} items, ${data.totalParties} parties, and ${data.totalSales} sales to Tally XML format!`)
      
    } catch (error) {
      console.error('Error exporting to Tally:', error)
      alert('Failed to export to Tally. Please try again.')
    } finally {
      setIsExportingToTally(false)
      setExportProgress(0)
    }
  }, [])

  // Generate Tally XML content
  const generateTallyXML = (data: any) => {
    const { items, parties, sales } = data
    
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>List of Items</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Business Hub</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <COLLECTION NAME="Items" ISMODIFY="No">
          <TYPE>StockItem</TYPE>
          <FETCH>Name, Category, BaseUnits, SellingPrice, CostPrice, OpeningBalance</FETCH>
        </COLLECTION>
      </TALLYMESSAGE>`

    // Add items
    if (items && items.length > 0) {
      items.forEach((item: any) => {
        xmlContent += `
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <STOCKITEM NAME="${escapeXML(item.name || item.itemName || '')}" ACTION="Create">
          <CATEGORY>${escapeXML(item.category || 'General')}</CATEGORY>
          <BASEUNITS>${escapeXML(item.unit || 'Nos')}</BASEUNITS>
          <SELLINGPRICE>${item.price || item.salePrice || 0}</SELLINGPRICE>
          <COSTPRICE>${item.cost || item.purchasePrice || 0}</COSTPRICE>
          <OPENINGBALANCE>${item.quantity || item.stock || 0}</OPENINGBALANCE>
          <HSNCODE>${escapeXML(item.hsn || item.hsnCode || '')}</HSNCODE>
          <DESCRIPTION>${escapeXML(item.description || '')}</DESCRIPTION>
        </STOCKITEM>
      </TALLYMESSAGE>`
      })
    }

    // Add parties (customers and suppliers)
    if (parties && parties.length > 0) {
      parties.forEach((party: any) => {
        const partyType = party.type === 'customer' ? 'Sundry Debtors' : 'Sundry Creditors'
        xmlContent += `
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <LEDGER NAME="${escapeXML(party.name)}" ACTION="Create">
          <PARENT>${partyType}</PARENT>
          <OPENINGBALANCE>${party.balance || party.openingBalance || 0}</OPENINGBALANCE>
          <ADDRESS>${escapeXML(party.address || '')}</ADDRESS>
          <PHONE>${escapeXML(party.phone || party.contact || '')}</PHONE>
          <EMAIL>${escapeXML(party.email || '')}</EMAIL>
          <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
          <GSTREGISTRATIONNO>${escapeXML(party.gstin || '')}</GSTREGISTRATIONNO>
          <PARTYGSTIN>${escapeXML(party.gstin || '')}</PARTYGSTIN>
          <PARTYPAN>${escapeXML(party.pan || '')}</PARTYPAN>
        </LEDGER>
      </TALLYMESSAGE>`
      })
    }

    // Add sales transactions
    if (sales && sales.length > 0) {
      sales.forEach((sale: any, index: number) => {
        xmlContent += `
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <VOUCHER REMOTEID="${sale.id || index}" VCHKEY="${sale.id || index}" ACTION="Create" OBJVIEW="Invoice Voucher View">
          <DATE>${formatDateForTally(sale.date || sale.created_at)}</DATE>
          <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${escapeXML(sale.invoice_number || sale.id || '')}</VOUCHERNUMBER>
          <REFERENCE>${escapeXML(sale.customer_name || sale.customer || '')}</REFERENCE>
          <PARTYLEDGERNAME>${escapeXML(sale.customer_name || sale.customer || '')}</PARTYLEDGERNAME>
          <BASICBUYERIDENTIFICATION>
            <PARTYGSTIN>${escapeXML(sale.customer_gstin || '')}</PARTYGSTIN>
          </BASICBUYERIDENTIFICATION>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escapeXML(sale.customer_name || sale.customer || '')}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <LEDGERFROMITEM>No</LEDGERFROMITEM>
            <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
            <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
            <AMOUNT>-${sale.total_amount || sale.amount || 0}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Sales Account</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <LEDGERFROMITEM>No</LEDGERFROMITEM>
            <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
            <ISPARTYLEDGER>No</ISPARTYLEDGER>
            <AMOUNT>${sale.total_amount || sale.amount || 0}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`
        
        // Add item entries if available
        if (sale.items && sale.items.length > 0) {
          sale.items.forEach((item: any) => {
            xmlContent += `
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escapeXML(item.name || item.itemName || '')}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <LEDGERFROMITEM>No</LEDGERFROMITEM>
            <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
            <ISPARTYLEDGER>No</ISPARTYLEDGER>
            <AMOUNT>-${item.quantity || 1}</AMOUNT>
            <ACTUALQTY>${item.quantity || 1}</ACTUALQTY>
            <BILLEDQTY>${item.quantity || 1}</BILLEDQTY>
            <RATE>${item.price || item.salePrice || 0}</RATE>
          </ALLLEDGERENTRIES.LIST>`
          })
        }
        
        xmlContent += `
        </VOUCHER>
      </TALLYMESSAGE>`
      })
    }

    xmlContent += `
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`

    return xmlContent
  }

  // Helper function to escape XML special characters
  const escapeXML = (str: string) => {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  // Helper function to format date for Tally
  const formatDateForTally = (dateString: string) => {
    if (!dateString) return new Date().toISOString().split('T')[0]
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  // State for export items functionality
  const [isExportingItems, setIsExportingItems] = useState(false)
  const [exportItemsProgress, setExportItemsProgress] = useState(0)
  const [exportItemsData, setExportItemsData] = useState<any[]>([])
  const [selectedExportFormat, setSelectedExportFormat] = useState<string>("csv")
  const [exportOptions, setExportOptions] = useState({
    includePricing: true,
    includeStock: true,
    includeCategories: true,
    activeOnly: false,
    includeHSN: true,
    includeDescription: true,
    includeSupplier: true,
    includeLocation: true
  })

  // Fetch items for export
  const fetchItemsForExport = async () => {
    if (!phoneNumber) {
      console.error('No phone number available for API call')
      return []
    }
    
    setIsExportingItems(true)
    setExportItemsProgress(0)
    
    try {
      setExportItemsProgress(30)
      const response = await fetch(`/api/business-hub/items?phone=${encodeURIComponent(phoneNumber)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch items')
      }
      const data = await response.json()
      
      setExportItemsProgress(70)
      
      // Transform the data to include all necessary fields
      const transformedItems = data.map((item: any) => ({
        id: item.id,
        itemName: item.name || item.itemName || '',
        category: item.category || '',
        purchasePrice: item.cost || item.purchasePrice || 0,
        salePrice: item.price || item.salePrice || 0,
        stock: item.quantity || item.stock || 0,
        hsnCode: item.hsn || item.hsnCode || '',
        unit: item.unit || 'pcs',
        description: item.description || '',
        sku: item.sku || '',
        minStock: item.minStock || 0,
        maxStock: item.maxStock || 0,
        supplier: item.supplier || '',
        location: item.location || '',
        tags: item.tags || [],
        color: item.color || '#3B82F6',
        lastUpdated: item.updated_at || item.lastUpdated || new Date().toISOString(),
        status: item.status || 'active',
        taxable: item.taxable || false,
        gstRate: item.gst_rate || item.gstRate || '',
        createdAt: item.created_at || new Date().toISOString(),
      }))
      
      setExportItemsData(transformedItems)
      setExportItemsProgress(100)
      
      return transformedItems
    } catch (error) {
      console.error('Error fetching items for export:', error)
      alert('Failed to fetch items. Please try again.')
      throw error
    } finally {
      setIsExportingItems(false)
    }
  }

  const exportItems = useCallback(
    async (format: string) => {
      try {
        setIsExportingItems(true)
        setExportItemsProgress(0)
        
        // Fetch fresh data from backend
        const items = await fetchItemsForExport()
        
        if (!items || items.length === 0) {
          alert('No items available to export. Please add some items first.')
          return
        }

        // Filter items based on options
        let filteredItems = items
        if (exportOptions.activeOnly) {
          filteredItems = items.filter((item: any) => item.status === 'active')
        }

        let content = ""
        let mimeType = ""
        let fileName = ""

        if (format === "csv") {
          content = generateCSVContent(filteredItems)
          mimeType = "text/csv"
          fileName = `items-export-${new Date().toISOString().split('T')[0]}.csv`
        } else if (format === "excel") {
          content = generateExcelContent(filteredItems)
          mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          fileName = `items-export-${new Date().toISOString().split('T')[0]}.xlsx`
        } else if (format === "tally") {
          content = generateTallyXMLForItems(filteredItems)
          mimeType = "application/xml"
          fileName = `items-tally-export-${new Date().toISOString().split('T')[0]}.xml`
        }

        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        alert(`Successfully exported ${filteredItems.length} items in ${format.toUpperCase()} format!`)
        
      } catch (error) {
        console.error('Error exporting items:', error)
        alert('Failed to export items. Please try again.')
      } finally {
        setIsExportingItems(false)
        setExportItemsProgress(0)
      }
    },
    [exportOptions],
  )

  // Generate CSV content
  const generateCSVContent = (items: any[]) => {
    const headers = ['Item Name', 'Category', 'SKU', 'Unit']
    
    if (exportOptions.includePricing) {
      headers.push('Purchase Price', 'Sale Price')
    }
    if (exportOptions.includeStock) {
      headers.push('Stock', 'Min Stock', 'Max Stock')
    }
    if (exportOptions.includeHSN) {
      headers.push('HSN Code')
    }
    if (exportOptions.includeDescription) {
      headers.push('Description')
    }
    if (exportOptions.includeSupplier) {
      headers.push('Supplier')
    }
    if (exportOptions.includeLocation) {
      headers.push('Location')
    }
    headers.push('Status', 'Last Updated')

    const rows = items.map(item => {
      const row = [
        escapeCSV(item.itemName),
        escapeCSV(item.category),
        escapeCSV(item.sku),
        escapeCSV(item.unit)
      ]
      
      if (exportOptions.includePricing) {
        row.push(item.purchasePrice.toString(), item.salePrice.toString())
      }
      if (exportOptions.includeStock) {
        row.push(item.stock.toString(), item.minStock.toString(), item.maxStock.toString())
      }
      if (exportOptions.includeHSN) {
        row.push(escapeCSV(item.hsnCode))
      }
      if (exportOptions.includeDescription) {
        row.push(escapeCSV(item.description))
      }
      if (exportOptions.includeSupplier) {
        row.push(escapeCSV(item.supplier))
      }
      if (exportOptions.includeLocation) {
        row.push(escapeCSV(item.location))
      }
      row.push(item.status, formatDate(item.lastUpdated))
      
      return row.join(',')
    })

    return [headers.join(','), ...rows].join('\n')
  }

  // Generate Excel content (simplified as CSV for now)
  const generateExcelContent = (items: any[]) => {
    // For now, using CSV format as Excel content
    // In a real implementation, you'd use a library like xlsx
    return generateCSVContent(items)
  }

  // Generate Tally XML for items only
  const generateTallyXMLForItems = (items: any[]) => {
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>List of Items</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Business Hub</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>`

    items.forEach((item) => {
      xmlContent += `
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <STOCKITEM NAME="${escapeXML(item.itemName)}" ACTION="Create">
          <CATEGORY>${escapeXML(item.category)}</CATEGORY>
          <BASEUNITS>${escapeXML(item.unit)}</BASEUNITS>
          <SELLINGPRICE>${item.salePrice}</SELLINGPRICE>
          <COSTPRICE>${item.purchasePrice}</COSTPRICE>
          <OPENINGBALANCE>${item.stock}</OPENINGBALANCE>
          <HSNCODE>${escapeXML(item.hsnCode)}</HSNCODE>
          <DESCRIPTION>${escapeXML(item.description)}</DESCRIPTION>
          <MINIMUMSTOCK>${item.minStock}</MINIMUMSTOCK>
          <MAXIMUMSTOCK>${item.maxStock}</MAXIMUMSTOCK>
        </STOCKITEM>
      </TALLYMESSAGE>`
    })

    xmlContent += `
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`

    return xmlContent
  }

  // Helper function to escape CSV values
  const escapeCSV = (value: string) => {
    if (!value) return ''
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Render utility content
  const renderUtilityContent = () => {
    switch (selectedUtility) {
      case "import-items":
        return (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Steps */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Steps to Import</h2>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-red-500 text-white">STEP 1</Badge>
                    </div>
                    <p className="text-gray-700 mb-4">Create an Excel/CSV file with the following format.</p>
                    <Button onClick={downloadItemsTemplate} variant="outline" className="mb-4 bg-transparent">
                      Download Template
                    </Button>

                    {/* Sample table preview */}
                    <div className="overflow-x-auto bg-gray-50 p-4 rounded-lg border">
                      <div className="text-sm text-gray-600 mb-2 font-medium">Sample Excel Format:</div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Column Headers: itemName, hsn, salePrice, purchasePrice, openingStock, minimumStock, godown, gstRate, taxable</div>
                        <div>Example Row: "Sample Item", "H001", 150, 100, 50, 10, "Main Store", "GST@18%", "Y"</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-red-500 text-white">STEP 2</Badge>
                    </div>
                    <div className="flex items-start gap-2">
                      <Upload className="h-5 w-5 text-gray-600 mt-0.5" />
                      <p className="text-gray-700">
                        Upload the file <span className="font-medium">(.xlsx, .xls, or .csv)</span> by clicking on the Upload
                        File button below.
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-red-500 text-white">STEP 3</Badge>
                    </div>
                    <p className="text-gray-700">Verify the items from the file & complete the import.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Upload */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload your file (.xlsx, .xls, or .csv)</h3>

                <div
                  ref={itemsDragRef}
                  onDragOver={handleItemsDragOver}
                  onDrop={handleItemsDrop}
                  className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center bg-blue-50/30 hover:bg-blue-50/50 transition-colors"
                >
                  <CloudUpload className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Drag & Drop files here</p>
                  <p className="text-gray-500 mb-6">or</p>

                  <input
                    type="file"
                    ref={itemsFileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleItemsFileUpload(e.target.files[0])}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                  />

                  <Button
                    onClick={() => itemsFileInputRef.current?.click()}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-3 rounded-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>

                {isImportingItems && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Processing file...</span>
                      <span className="text-sm font-medium">{itemsUploadProgress}%</span>
                    </div>
                    <Progress value={itemsUploadProgress} className="h-2" />
                  </div>
                )}

                {itemsUploadedFile && !isImportingItems && (
                  <Alert className="mt-4 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      File "{itemsUploadedFile.name}" uploaded successfully. {importItems.length} items found.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {showItemsPreview && importItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview Items ({importItems.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>HSN</TableHead>
                            <TableHead>Sale Price</TableHead>
                            <TableHead>Purchase Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Min Stock</TableHead>
                            <TableHead>Godown</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.itemName}</TableCell>
                              <TableCell>{item.hsn}</TableCell>
                              <TableCell>{formatCurrency(item.salePrice)}</TableCell>
                              <TableCell>{formatCurrency(item.purchasePrice)}</TableCell>
                              <TableCell>{item.openingStock}</TableCell>
                              <TableCell>{item.minimumStock}</TableCell>
                              <TableCell>{item.godown}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <Button variant="outline" onClick={() => setShowItemsPreview(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-green-600 hover:bg-green-700" 
                        onClick={saveItemsToBackend}
                        disabled={isImportingItems}
                      >
                        {isImportingItems ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Import {importItems.length} Items
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )

      case "update-bulk":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Update Items In Bulk</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Tabs value={bulkView} onValueChange={setBulkView}>
                  <TabsList>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="stock">Stock</TabsTrigger>
                    <TabsTrigger value="info">Item Information</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(bulkItems.map((item) => item.id))
                              } else {
                                setSelectedItems([])
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        {bulkView === "pricing" && (
                          <>
                            <TableHead>Purchase Price</TableHead>
                            <TableHead>Sale Price</TableHead>
                          </>
                        )}
                        {bulkView === "stock" && <TableHead>Stock Quantity</TableHead>}
                        {bulkView === "info" && (
                          <>
                            <TableHead>HSN Code</TableHead>
                            <TableHead>Unit</TableHead>
                          </>
                        )}
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkItems
                        .filter((item) => item.itemName.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems([...selectedItems, item.id])
                                  } else {
                                    setSelectedItems(selectedItems.filter((id) => id !== item.id))
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{item.itemName}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            {bulkView === "pricing" && (
                              <>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={item.purchasePrice}
                                    onChange={(e) => {
                                      const newItems = bulkItems.map((i) =>
                                        i.id === item.id ? { ...i, purchasePrice: Number(e.target.value) } : i,
                                      )
                                      setBulkItems(newItems)
                                    }}
                                    className="w-24"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={item.salePrice}
                                    onChange={(e) => {
                                      const newItems = bulkItems.map((i) =>
                                        i.id === item.id ? { ...i, salePrice: Number(e.target.value) } : i,
                                      )
                                      setBulkItems(newItems)
                                    }}
                                    className="w-24"
                                  />
                                </TableCell>
                              </>
                            )}
                            {bulkView === "stock" && (
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.stock}
                                  onChange={(e) => {
                                    const newItems = bulkItems.map((i) =>
                                      i.id === item.id ? { ...i, stock: Number(e.target.value) } : i,
                                    )
                                    setBulkItems(newItems)
                                  }}
                                  className="w-24"
                                />
                              </TableCell>
                            )}
                            {bulkView === "info" && (
                              <>
                                <TableCell>
                                  <Input placeholder="HSN Code" className="w-32" />
                                </TableCell>
                                <TableCell>
                                  <Select defaultValue="pcs">
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pcs">Pcs</SelectItem>
                                      <SelectItem value="kg">Kg</SelectItem>
                                      <SelectItem value="ltr">Ltr</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </>
                            )}
                            <TableCell>
                              <Button size="sm" variant="ghost">
                                <Save className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">{selectedItems.length} items selected</p>
              <div className="flex gap-3">
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Changes
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )

      case "barcode-generator":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Barcode Generator</h2>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Select Items</CardTitle>
                  <CardDescription>Choose items to generate barcodes for</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search items..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {isLoadingBarcodeItems ? (
                    <LoadingSpinner 
                      size="md" 
                      text="Loading items..." 
                      className="py-8"
                    />
                  ) : bulkItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No items found</p>
                      <Button 
                        variant="outline" 
                        onClick={fetchItemsForBarcodeGenerator}
                        className="mt-2"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Items
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {bulkItems
                        .filter(item => 
                          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((item) => (
                          <div key={item.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems([...selectedItems, item.id])
                                } else {
                                  setSelectedItems(selectedItems.filter((id) => id !== item.id))
                                }
                              }}
                            />
                            <div className="flex-1">
                              <span className="font-medium">{item.itemName}</span>
                              <div className="text-sm text-gray-500">
                                {item.category} • ₹{item.salePrice}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {item.stock} in stock
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-gray-600">
                      {selectedItems.length} of {bulkItems.length} items selected
                    </span>
                    {selectedItems.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedItems([])}
                      >
                        Clear Selection
                      </Button>
                    )}
                  </div>

                  <Button 
                    onClick={generateBarcodes} 
                    className="w-full"
                    disabled={selectedItems.length === 0 || isLoadingBarcodeItems || isGeneratingBarcodes}
                  >
                    {isGeneratingBarcodes ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4 mr-2" />
                        Generate Barcodes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Barcode Preview</CardTitle>
                  <CardDescription>Preview and download generated barcodes</CardDescription>
                </CardHeader>
                <CardContent>
                  {barcodeItems.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant={barcodeType === "barcode" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBarcodeType("barcode")}
                        >
                          Barcode
                        </Button>
                        <Button
                          variant={barcodeType === "qr" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBarcodeType("qr")}
                        >
                          QR Code
                        </Button>
                      </div>

                      {barcodeItems.slice(0, 3).map((itemId) => {
                        const item = bulkItems.find((i) => i.id === itemId)
                        const barcodeDataUrl = barcodeType === "barcode" 
                          ? generatedBarcodes[itemId]
                          : generatedQRCodes[itemId]
                        
                        return (
                          <div key={itemId} className="border rounded-lg p-4 text-center">
                            {barcodeDataUrl ? (
                              <div className="mb-2">
                                <img 
                                  src={barcodeDataUrl} 
                                  alt={`${barcodeType} for ${item?.itemName}`}
                                  className="max-w-full h-auto mx-auto"
                                  style={{ 
                                    maxHeight: barcodeType === "barcode" ? '60px' : '120px',
                                    width: barcodeType === "barcode" ? '100%' : 'auto'
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="bg-gray-100 text-gray-500 font-mono text-xs p-2 mb-2 rounded">
                                {barcodeType === "barcode" ? 'Loading barcode...' : 'Loading QR code...'}
                              </div>
                            )}
                            <p className="font-medium">{item?.itemName}</p>
                            <p className="text-sm text-gray-600">₹{item?.salePrice}</p>
                            <p className="text-xs text-gray-500 mt-1">SKU: {item?.sku || 'N/A'}</p>
                          </div>
                        )
                      })}

                      {barcodeItems.length > 3 && (
                        <div className="text-center py-2 text-sm text-gray-500">
                          +{barcodeItems.length - 3} more {barcodeType === "barcode" ? "barcodes" : "QR codes"}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview All
                        </Button>
                        <Button className="flex-1">
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 bg-transparent"
                          onClick={downloadBarcodes}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select items and generate barcodes to see preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "import-parties":
        return (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Import Parties</h2>

              <div className="space-y-4">
                <div>
                  <Badge className="bg-blue-500 text-white mb-2">STEP 1</Badge>
                  <p className="text-gray-700 mb-4">Download the sample template for parties import.</p>
                  <Button onClick={downloadPartiesTemplate} variant="outline">
                    Download Template
                  </Button>
                </div>

                <div>
                  <Badge className="bg-blue-500 text-white mb-2">STEP 2</Badge>
                  <p className="text-gray-700">Fill the template with party details including:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                    <li>Party Name (Required)</li>
                    <li>Contact Number</li>
                    <li>Email Address</li>
                    <li>Address</li>
                    <li>Opening Balance</li>
                    <li>Party Type (Customer/Supplier)</li>
                  </ul>
                </div>

                <div>
                  <Badge className="bg-blue-500 text-white mb-2">STEP 3</Badge>
                  <p className="text-gray-700">Upload the completed file and verify the data.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Upload Parties File</h3>

              <div
                ref={partiesDragRef}
                onDragOver={handlePartiesDragOver}
                onDragLeave={handlePartiesDragLeave}
                onDrop={handlePartiesDrop}
                className="border-2 border-dashed border-green-300 rounded-xl p-12 text-center bg-green-50/30"
              >
                <Users className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">Drag & Drop parties file here</p>
                <p className="text-gray-500 mb-6">or</p>
                <input
                  type="file"
                  ref={partiesFileInputRef}
                  onChange={(e) => e.target.files?.[0] && handlePartiesFileUpload(e.target.files[0])}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
                <Button 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={() => partiesFileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>

              {isImportingParties && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Importing parties...</span>
                    <span className="text-sm font-medium">{partiesUploadProgress}%</span>
                  </div>
                  <Progress value={partiesUploadProgress} className="h-2" />
                </div>
              )}

              {showPartiesPreview && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Preview Parties ({importParties.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importParties.map((party, index) => (
                            <TableRow key={index}>
                              <TableCell>{party.name}</TableCell>
                              <TableCell>{party.contact}</TableCell>
                              <TableCell>{party.email}</TableCell>
                              <TableCell>{party.type}</TableCell>
                              <TableCell>₹{party.openingBalance}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <Button variant="outline" onClick={() => setShowPartiesPreview(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={savePartiesToBackend}>
                        <Save className="h-4 w-4 mr-2" />
                        Save {importParties.length} Parties
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )

      case "export-tally":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Export to Tally</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>Choose what data to export to Tally</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="items" defaultChecked disabled />
                      <Label htmlFor="items">Items & Stock</Label>
                      <Badge variant="outline" className="ml-auto">Auto</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="parties" defaultChecked disabled />
                      <Label htmlFor="parties">Parties (Customers & Suppliers)</Label>
                      <Badge variant="outline" className="ml-auto">Auto</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="transactions" defaultChecked disabled />
                      <Label htmlFor="transactions">Sales Transactions</Label>
                      <Badge variant="outline" className="ml-auto">Auto</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="accounts" disabled />
                      <Label htmlFor="accounts">Chart of Accounts</Label>
                      <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Label className="text-sm font-medium">Export Format</Label>
                    <Select defaultValue="xml" disabled>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xml">Tally XML</SelectItem>
                        <SelectItem value="csv">CSV Format</SelectItem>
                        <SelectItem value="excel">Excel Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isExportingToTally && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Fetching data...</span>
                        <span className="font-medium">{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} className="h-2" />
                    </div>
                  )}

                  <Button 
                    onClick={exportToTally} 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={isExportingToTally}
                  >
                    {isExportingToTally ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Export to Tally
                      </>
                    )}
                  </Button>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This will export all your business data in Tally XML format. Make sure Tally is running and ready to import data.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Summary</CardTitle>
                  <CardDescription>Real data from your database</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {exportData ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-700">Items:</span>
                        </div>
                        <span className="font-bold text-blue-600">{exportData.totalItems}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-gray-700">Parties:</span>
                        </div>
                        <span className="font-bold text-green-600">{exportData.totalParties}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-700">Sales:</span>
                        </div>
                        <span className="font-bold text-purple-600">{exportData.totalSales}</span>
                      </div>
                      
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Total Records:</span>
                          <span className="font-bold text-lg">
                            {exportData.totalItems + exportData.totalParties + exportData.totalSales}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500">Items:</span>
                        </div>
                        <span className="font-medium text-gray-500">--</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500">Parties:</span>
                        </div>
                        <span className="font-medium text-gray-500">--</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500">Sales:</span>
                        </div>
                        <span className="font-medium text-gray-500">--</span>
                      </div>
                      
                      <div className="text-center py-4">
                        <Button 
                          variant="outline" 
                          onClick={fetchExportData}
                          disabled={isExportingToTally}
                          className="w-full"
                        >
                          {isExportingToTally ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading Data...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Load Data Summary
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      The exported XML file will be compatible with Tally ERP 9 and Tally Prime.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "export-items":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Export Items</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Export Formats</CardTitle>
                  <CardDescription>Choose your preferred export format</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => exportItems("excel")} 
                    className="w-full justify-start" 
                    variant="outline"
                    disabled={isExportingItems}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                    Export as Excel (.xlsx)
                  </Button>
                  <Button 
                    onClick={() => exportItems("csv")} 
                    className="w-full justify-start" 
                    variant="outline"
                    disabled={isExportingItems}
                  >
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Export as CSV (.csv)
                  </Button>
                  <Button 
                    onClick={() => exportItems("tally")} 
                    className="w-full justify-start bg-transparent" 
                    variant="outline"
                    disabled={isExportingItems}
                  >
                    <Database className="h-4 w-4 mr-2 text-orange-600" />
                    Export as Tally XML
                  </Button>

                  {isExportingItems && (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Exporting items...</span>
                        <span className="font-medium">{exportItemsProgress}%</span>
                      </div>
                      <Progress value={exportItemsProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>Customize your export</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="include-pricing" 
                        checked={exportOptions.includePricing}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includePricing: e.target.checked }))}
                      />
                      <Label htmlFor="include-pricing">Include Pricing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="include-stock" 
                        checked={exportOptions.includeStock}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeStock: e.target.checked }))}
                      />
                      <Label htmlFor="include-stock">Include Stock Levels</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="include-hsn" 
                        checked={exportOptions.includeHSN}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeHSN: e.target.checked }))}
                      />
                      <Label htmlFor="include-hsn">Include HSN Codes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="include-description" 
                        checked={exportOptions.includeDescription}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeDescription: e.target.checked }))}
                      />
                      <Label htmlFor="include-description">Include Description</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="include-supplier" 
                        checked={exportOptions.includeSupplier}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeSupplier: e.target.checked }))}
                      />
                      <Label htmlFor="include-supplier">Include Supplier</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="include-location" 
                        checked={exportOptions.includeLocation}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeLocation: e.target.checked }))}
                      />
                      <Label htmlFor="include-location">Include Location</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="active-only" 
                        checked={exportOptions.activeOnly}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, activeOnly: e.target.checked }))}
                      />
                      <Label htmlFor="active-only">Active Items Only</Label>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    {exportItemsData.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Items:</span>
                          <span className="font-medium">{exportItemsData.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Active Items:</span>
                          <span className="font-medium">{exportItemsData.filter(item => item.status === 'active').length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Items with Stock:</span>
                          <span className="font-medium">{exportItemsData.filter(item => item.stock > 0).length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Items with HSN:</span>
                          <span className="font-medium">{exportItemsData.filter(item => item.hsnCode).length}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Button 
                          variant="outline" 
                          onClick={fetchItemsForExport}
                          disabled={isExportingItems}
                          className="w-full"
                        >
                          {isExportingItems ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading Items...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Load Items Data
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {exportItemsData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Sample of items that will be exported</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>SKU</TableHead>
                          {exportOptions.includePricing && (
                            <>
                              <TableHead>Purchase Price</TableHead>
                              <TableHead>Sale Price</TableHead>
                            </>
                          )}
                          {exportOptions.includeStock && <TableHead>Stock</TableHead>}
                          {exportOptions.includeHSN && <TableHead>HSN Code</TableHead>}
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {exportItemsData.slice(0, 5).map((item, index) => (
                          <TableRow key={item.id || index}>
                            <TableCell className="font-medium">{item.itemName}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.sku}</TableCell>
                            {exportOptions.includePricing && (
                              <>
                                <TableCell>{formatCurrency(item.purchasePrice)}</TableCell>
                                <TableCell>{formatCurrency(item.salePrice)}</TableCell>
                              </>
                            )}
                            {exportOptions.includeStock && <TableCell>{item.stock}</TableCell>}
                            {exportOptions.includeHSN && <TableCell>{item.hsnCode}</TableCell>}
                            <TableCell>
                              <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                {item.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {exportItemsData.length > 5 && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Showing 5 of {exportItemsData.length} items
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )

      case "verify-data":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Verify My Data</h2>
              <Button onClick={verifyData} disabled={isVerifying} className="bg-blue-600 hover:bg-blue-700">
                {isVerifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Run Verification
                  </>
                )}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Data Integrity Checks</CardTitle>
                  <CardDescription>We'll verify the following data points</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Missing HSN Codes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Missing Categories</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Missing Tax Fields</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Duplicate Entries</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Stock Mismatches</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Pricing Inconsistencies</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Verification Results</CardTitle>
                  <CardDescription>Issues found in your data</CardDescription>
                </CardHeader>
                <CardContent>
                  {verificationResults ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">{verificationResults.totalIssues}</p>
                          <p className="text-sm text-red-700">Total Issues</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            {bulkItems.length - verificationResults.totalIssues}
                          </p>
                          <p className="text-sm text-green-700">Clean Records</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Missing HSN Codes</span>
                          <Badge variant="destructive">{verificationResults.missingHSN}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Missing Categories</span>
                          <Badge variant="destructive">{verificationResults.missingCategory}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Duplicate Entries</span>
                          <Badge variant="destructive">{verificationResults.duplicateEntries}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Stock Mismatches</span>
                          <Badge variant="secondary">{verificationResults.stockMismatches}</Badge>
                        </div>
                      </div>

                      <Button className="w-full bg-transparent" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Detailed Report
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Click "Run Verification" to check your data integrity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "close-year":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Close Financial Year</h2>

            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Warning:</strong> Closing the financial year is an irreversible action. Please ensure you have a
                complete backup before proceeding.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Year Details</CardTitle>
                  <CardDescription>Configure the year-end closing parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="closing-date">Closing Date</Label>
                    <Input type="date" id="closing-date" className="mt-1" defaultValue="2024-03-31" />
                  </div>

                  <div>
                    <Label htmlFor="new-year-start">New Financial Year Start</Label>
                    <Input type="date" id="new-year-start" className="mt-1" defaultValue="2024-04-01" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="backup-before" defaultChecked />
                      <Label htmlFor="backup-before">Create backup before closing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="archive-data" defaultChecked />
                      <Label htmlFor="archive-data">Archive old year data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="reset-sequences" />
                      <Label htmlFor="reset-sequences">Reset invoice sequences</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pre-Closing Checklist</CardTitle>
                  <CardDescription>Ensure these items are completed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">All transactions recorded</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Bank reconciliation completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">Stock verification pending</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Tax returns filed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Audit pending</span>
                  </div>

                  <div className="pt-4 border-t">
                    <Button onClick={() => setShowCloseYearDialog(true)} className="w-full bg-red-600 hover:bg-red-700">
                      <Archive className="h-4 w-4 mr-2" />
                      Close Financial Year
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Utility</h3>
            <p className="text-gray-600">Choose a utility from the sidebar to get started</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="ml-16 flex min-h-screen">
        {/* Utilities Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-lg">
          <div className="p-4 border-b border-gray-200/50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Utilities
            </h2>
          </div>

          <div className="py-2">
            {utilityOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setSelectedUtility(option.key)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                  selectedUtility === option.key ? "bg-blue-100 text-blue-700 border-r-2 border-blue-500" : ""
                }`}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-30">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    {utilityOptions.find((opt) => opt.key === selectedUtility)?.label || "Utilities"}
                  </h1>
                  <p className="text-gray-600">Powerful tools to manage your business data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-8">{renderUtilityContent()}</div>
        </div>
      </div>

      {/* Close Year Confirmation Dialog */}
      <Dialog open={showCloseYearDialog} onOpenChange={setShowCloseYearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Year Closing
            </DialogTitle>
            <DialogDescription>
              This action will close the current financial year and cannot be undone. A backup will be created
              automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>This action is irreversible.</strong> Please ensure all data is accurate and you have a recent
                backup.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseYearDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowCloseYearDialog(false)
                // Handle year closing logic
                alert("Financial year closed successfully!")
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Close Financial Year
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UtilitiesPage