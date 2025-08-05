"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface SaleItem {
  itemCode: string
  itemCode: string
  tax: number
  discount: number
  id: string
  itemId: string
  itemName: string
  quantity: number
  price: number
  total: number
}

export interface Sale {
  shipping: boolean
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

interface SalesContextType {
  sales: Sale[]
  addSale: (sale: Sale) => void
  updateSale: (id: string, sale: Sale) => void
  deleteSale: (id: string) => void
  getSalesStats: () => {
    totalSales: number
    totalOrders: number
    pendingSales: number
    paidSales: number
  }
}

const SalesContext = createContext<SalesContextType | undefined>(undefined)

// Initial sample sales data
const initialSales: Sale[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    customerId: "1",
    customerName: "John Doe",
    customerEmail: "john.doe@email.com",
    customerPhone: "+1-555-0123",
    customerAddress: "123 Main St, City, State 12345",
    items: [
      {
        id: "1",
        itemId: "1",
        itemName: "iPhone 15 Pro",
        quantity: 1,
        price: 999.99,
        total: 999.99,
      },
    ],
    subtotal: 999.99,
    tax: 79.99,
    taxRate: 8.0,
    discount: 0,
    total: 1079.98,
    status: "paid",
    paymentMethod: "Credit Card",
    paymentStatus: "paid",
    dueDate: "2024-02-15T00:00:00Z",
    createdAt: "2024-01-15T10:00:00Z",
    notes: "Customer requested express delivery",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    customerId: "2",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@email.com",
    customerPhone: "+1-555-0124",
    customerAddress: "456 Oak Ave, City, State 12346",
    items: [
      {
        id: "2",
        itemId: "2",
        itemName: "Samsung Galaxy S24",
        quantity: 2,
        price: 899.99,
        total: 1799.98,
      },
    ],
    subtotal: 1799.98,
    tax: 143.99,
    taxRate: 8.0,
    discount: 50.0,
    total: 1893.97,
    status: "sent",
    paymentMethod: "Bank Transfer",
    paymentStatus: "pending",
    dueDate: "2024-02-20T00:00:00Z",
    createdAt: "2024-01-20T10:00:00Z",
    notes: "Bulk order discount applied",
  },
]

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>(initialSales)

  const addSale = (sale: Sale) => {
    setSales(prev => [...prev, sale])
  }

  const updateSale = (id: string, updatedSale: Sale) => {
    setSales(prev => prev.map(sale => sale.id === id ? updatedSale : sale))
  }

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(sale => sale.id !== id))
  }

  const getSalesStats = () => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
    const totalOrders = sales.length
    const pendingSales = sales.filter(s => s.paymentStatus === "pending").length
    const paidSales = sales.filter(s => s.paymentStatus === "paid").length

    return {
      totalSales,
      totalOrders,
      pendingSales,
      paidSales,
    }
  }

  return (
    <SalesContext.Provider value={{
      sales,
      addSale,
      updateSale,
      deleteSale,
      getSalesStats,
    }}>
      {children}
    </SalesContext.Provider>
  )
}

export function useSales() {
  const context = useContext(SalesContext)
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider')
  }
  return context
} 