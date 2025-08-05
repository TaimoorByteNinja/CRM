"use client"

import { useAppSelector } from "@/lib/store/hooks"
import { selectDashboardMetrics, selectSalesChartData } from "@/lib/store/slices/dashboardSlice"

export function DebugInfo() {
  const dashboardStats = useAppSelector(selectDashboardMetrics)
  const salesChartData = useAppSelector(selectSalesChartData)
  const allSales = useAppSelector((state) => state.sales.sales)

  // Calculate total manually for verification
  const manualTotal = allSales.reduce((sum, sale) => sum + sale.total, 0)
  
  // Calculate total for current month (January + February 2024)
  const currentMonthSales = allSales.filter(sale => {
    const saleDate = new Date(sale.createdAt)
    return saleDate.getFullYear() === 2024 && (saleDate.getMonth() === 0 || saleDate.getMonth() === 1)
  })
  const currentMonthTotal = currentMonthSales.reduce((sum, sale) => sum + sale.total, 0)

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Total Sales (All): Rs {manualTotal.toLocaleString()}</div>
        <div>Current Month Sales: Rs {currentMonthTotal.toLocaleString()}</div>
        <div>Dashboard Total Revenue: Rs {dashboardStats.totalRevenue.toLocaleString()}</div>
        <div>Dashboard Total Sales: Rs {dashboardStats.totalSales.toLocaleString()}</div>
        <div>Total Orders: {dashboardStats.totalOrders}</div>
        <div>Chart Data Points: {salesChartData.length}</div>
        <div>Date Range: {dashboardStats.totalRevenue === currentMonthTotal ? "✅ Correct" : "❌ Incorrect"}</div>
      </div>
    </div>
  )
} 