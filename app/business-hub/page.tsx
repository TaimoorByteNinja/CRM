"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { NewSaleDialog } from "@/components/NewSaleDialog"
import { Notification } from "@/components/Notification"
import BusinessManager from "./business-manager/page"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import {
  selectActiveTab,
  selectSearchTerm,
  selectDialogs,
  setActiveTab,
  setSearchTerm,
  setDialogOpen,
  showNotification,
} from "@/lib/store/slices/uiSlice"
import {
  selectDashboardMetrics,
  selectSalesChartData,
  selectTopSellingItems,
  selectTopCustomers,
  selectLowStockAlerts,
  selectRecentActivity,
} from "@/lib/store/slices/dashboardSlice"
import {
  addPurchase,
} from "@/lib/store/slices/purchasesSlice"
import {
  Package,
  ShoppingCart,
  CreditCard,
  FileText,
  Plus,
  Search,
  Users,
  DollarSign,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  X,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Activity,
  Zap,
} from "lucide-react"
import AdvancedPurchaseDialog from "@/components/AdvancedPurchaseDialog"
import { useState } from "react"

// Enhanced interfaces (keeping the same as before)
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

interface Sale {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  items: SaleItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue"
  paymentMethod: string
  paymentStatus: "pending" | "paid"
  dueDate: string
  createdAt: string
  notes: string
}

interface SaleItem {
  id: string
  itemId: string
  itemName: string
  quantity: number
  price: number
  total: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  company?: string
  totalSales: number
  totalOrders: number
  status: "active" | "inactive"
  createdAt: string
}

interface Purchase {
  id: string
  billNumber: string
  supplierId: string
  supplierName: string
  items: PurchaseItem[]
  subtotal: number
  tax: number
  total: number
  status: "draft" | "ordered" | "received" | "paid"
  createdAt: string
}

interface PurchaseItem {
  id: string
  itemId: string
  itemName: string
  quantity: number
  cost: number
  total: number
}

interface BankAccount {
  id: string
  name: string
  accountNumber: string
  balance: number
  type: "checking" | "savings"
  status: "active" | "inactive"
}

// Sample data (keeping the same as before)
const sampleItems: Item[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    category: "Electronics",
    sku: "IPH15P-001",
    price: 999.99,
    cost: 750.0,
    stock: 15,
    minStock: 5,
    description: "Latest iPhone with advanced features",
    supplier: "Apple Inc.",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
    totalSold: 45,
  },
  {
    id: "2",
    name: "Samsung Galaxy S24",
    category: "Electronics",
    sku: "SGS24-001",
    price: 899.99,
    cost: 650.0,
    stock: 3,
    minStock: 5,
    description: "Premium Android smartphone",
    supplier: "Samsung Electronics",
    status: "active",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-18T10:00:00Z",
    totalSold: 32,
  },
  {
    id: "3",
    name: "MacBook Air M3",
    category: "Electronics",
    sku: "MBA-M3-001",
    price: 1299.99,
    cost: 950.0,
    stock: 8,
    minStock: 3,
    description: "Lightweight laptop with M3 chip",
    supplier: "Apple Inc.",
    status: "active",
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-22T10:00:00Z",
    totalSold: 18,
  },
]



const sampleCustomers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1-555-0123",
    address: "123 Main St, City, State 12345",
    company: "Tech Corp",
    totalSales: 1079.98,
    totalOrders: 1,
    status: "active",
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+1-555-0124",
    address: "456 Oak Ave, City, State 12346",
    company: "Design Studio",
    totalSales: 1893.97,
    totalOrders: 1,
    status: "active",
    createdAt: "2024-01-12T10:00:00Z",
  },
]

// PDF Generation utility with Redux integration
const generateInvoicePDF = (sale: Sale) => {
  // Import store and selectors (this would normally be at the top of the file)
  const { store } = require('@/lib/store')
  const { selectInvoiceSettings, selectGeneralSettings } = require('@/lib/store/slices/settingsSlice')
  const { CurrencyManager } = require('@/lib/currency-manager')
  
  // Get settings from Redux store
  const state = store.getState()
  const invoiceSettings = selectInvoiceSettings(state)
  const generalSettings = selectGeneralSettings(state)
  
  const currencyManager = CurrencyManager.getInstance()
  currencyManager.setCurrency(generalSettings.selectedCountry || 'IN')
  
  const formatCurrency = (amount: number) => {
    return currencyManager.formatAmountWithSymbol(amount)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${sale.invoiceNumber}</title>
      <style>
        body { 
          font-family: ${invoiceSettings.fontFamily || 'Arial, sans-serif'}; 
          margin: 0; 
          padding: ${invoiceSettings.margins?.top || 20}px ${invoiceSettings.margins?.right || 20}px ${invoiceSettings.margins?.bottom || 20}px ${invoiceSettings.margins?.left || 20}px; 
          color: ${invoiceSettings.customTheme?.textColor || '#333'}; 
          font-size: ${invoiceSettings.fontSize || 14}px;
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid ${invoiceSettings.customTheme?.primaryColor || '#3B82F6'}; 
          padding-bottom: 20px; 
        }
        .company-info { 
          flex: 1; 
        }
        .company-name { 
          font-size: 24px; 
          font-weight: bold; 
          color: ${invoiceSettings.customTheme?.headerColor || '#3B82F6'}; 
          margin-bottom: 5px; 
        }
        .company-details { 
          font-size: 12px; 
          color: ${invoiceSettings.customTheme?.secondaryColor || '#666'}; 
        }
        .invoice-info { 
          text-align: right; 
        }
        .invoice-title { 
          font-size: 28px; 
          font-weight: bold; 
          color: ${invoiceSettings.customTheme?.headerColor || '#3B82F6'}; 
          margin-bottom: 10px; 
        }
        .invoice-details { 
          font-size: 14px; 
          color: ${invoiceSettings.customTheme?.textColor || '#333'};
        }
        .billing-section { 
          display: flex; 
          justify-content: space-between; 
          margin: 30px 0; 
        }
        .billing-info { 
          flex: 1; 
        }
        .billing-title { 
          font-size: 16px; 
          font-weight: bold; 
          margin-bottom: 10px; 
          color: ${invoiceSettings.customTheme?.headerColor || '#333'}; 
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 30px 0; 
        }
        .items-table th, .items-table td { 
          padding: 12px; 
          text-align: left; 
          border-bottom: 1px solid ${invoiceSettings.customTheme?.borderColor || '#ddd'}; 
        }
        .items-table th { 
          background-color: ${invoiceSettings.customTheme?.headerColor || '#f8f9fa'}; 
          font-weight: bold; 
          color: ${invoiceSettings.customTheme?.primaryColor || '#333'}; 
        }
        .items-table .amount { 
          text-align: right; 
        }
        .totals { 
          margin-top: 30px; 
        }
        .totals-table { 
          width: 300px; 
          margin-left: auto; 
        }
        .totals-table td { 
          padding: 8px 12px; 
          border: none; 
        }
        .totals-table .total-row { 
          font-weight: bold; 
          font-size: 16px; 
          border-top: 2px solid ${invoiceSettings.customTheme?.borderColor || '#333'}; 
        }
        .footer { 
          margin-top: 50px; 
          padding-top: 20px; 
          border-top: 1px solid ${invoiceSettings.customTheme?.borderColor || '#ddd'}; 
          font-size: 12px; 
          color: ${invoiceSettings.customTheme?.secondaryColor || '#666'}; 
        }
        .status-badge { 
          display: inline-block; 
          padding: 4px 12px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: bold; 
          text-transform: uppercase; 
        }
        .status-paid { 
          background-color: #d4edda; 
          color: #155724; 
        }
        .status-pending { 
          background-color: #fff3cd; 
          color: #856404; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">${invoiceSettings.companyName || 'Your Business Name'}</div>
          ${invoiceSettings.showCompanyAddress ? `
          <div class="company-details">
            ${invoiceSettings.companyAddress || '123 Business Street'}<br>
            ${invoiceSettings.showCompanyContact ? `Phone: ${invoiceSettings.companyPhone || '(555) 123-4567'}<br>` : ''}
            ${invoiceSettings.showCompanyContact ? `Email: ${invoiceSettings.companyEmail || 'info@yourbusiness.com'}` : ''}
          </div>
          ` : ''}
        </div>
        <div class="invoice-info">
          <div class="invoice-title">${invoiceSettings.invoiceTitle || 'INVOICE'}</div>
          <div class="invoice-details">
            ${invoiceSettings.showInvoiceNumber ? `<strong>Invoice #:</strong> ${sale.invoiceNumber}<br>` : ''}
            ${invoiceSettings.showDate ? `<strong>Date:</strong> ${formatDate(sale.createdAt)}<br>` : ''}
            ${invoiceSettings.showDueDate ? `<strong>Due Date:</strong> ${formatDate(sale.dueDate)}<br>` : ''}
            <span class="status-badge status-${sale.paymentStatus}">${sale.paymentStatus}</span>
          </div>
        </div>
      </div>
      
      ${invoiceSettings.showCustomerInfo ? `
      <div class="billing-section">
        <div class="billing-info">
          <div class="billing-title">Bill To:</div>
          <div>
            <strong>${sale.customerName}</strong><br>
            ${sale.customerAddress}<br>
            ${sale.customerEmail}<br>
            ${sale.customerPhone}
          </div>
        </div>
        <div class="billing-info">
          <div class="billing-title">Payment Details:</div>
          <div>
            <strong>Method:</strong> ${sale.paymentMethod}<br>
            <strong>Status:</strong> ${sale.paymentStatus}<br>
          </div>
        </div>
      </div>
      ` : ''}
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th class="amount">Unit Price</th>
            <th class="amount">Total</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items
            .map(
              (item) => `
            <tr>
              <td><strong>${item.itemName}</strong></td>
              <td>${item.quantity}</td>
              <td class="amount">${formatCurrency(item.price)}</td>
              <td class="amount">${formatCurrency(item.total)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
      
      <div class="totals">
        <table class="totals-table">
          ${invoiceSettings.showSubtotal ? `
          <tr>
            <td>Subtotal:</td>
            <td class="amount">${formatCurrency(sale.subtotal)}</td>
          </tr>
          ` : ''}
          ${
            sale.discount > 0
              ? `
          <tr>
            <td>Discount:</td>
            <td class="amount">-${formatCurrency(sale.discount)}</td>
          </tr>
          `
              : ""
          }
          ${invoiceSettings.showTax ? `
          <tr>
            <td>Tax (${sale.taxRate}%):</td>
            <td class="amount">${formatCurrency(sale.tax)}</td>
          </tr>
          ` : ''}
          ${invoiceSettings.showGrandTotal ? `
          <tr class="total-row">
            <td><strong>Total:</strong></td>
            <td class="amount"><strong>${formatCurrency(sale.total)}</strong></td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      ${
        sale.notes
          ? `
      <div style="margin-top: 30px; padding: 15px; background-color: ${invoiceSettings.customTheme?.backgroundColor || '#f8f9fa'}; border-radius: 5px;">
        <strong>Notes:</strong><br>
        ${sale.notes}
      </div>
      `
          : ""
      }
      
      ${invoiceSettings.showFooter ? `
      <div class="footer">
        <p><strong>${invoiceSettings.footerText || 'Thank you for your business!'}</strong></p>
        <p>Please include the invoice number ${sale.invoiceNumber} with your payment.</p>
      </div>
      ` : ''}
    </body>
    </html>
  `

  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }
}

export default function BusinessHub() {
  return(
    <BusinessManager />
  )
}
