import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { RootState } from '../index'

interface DashboardState {
  loading: boolean
  error: string | null
  lastUpdated: string | null
  selectedPeriod: 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'last30Days' | 'last7Days' | 'allTime'
  selectedDateRange: {
    start: string
    end: string
  }
}

const initialState: DashboardState = {
  loading: false,
  error: null,
  lastUpdated: null,
  selectedPeriod: 'allTime',
  selectedDateRange: {
    start: '',
    end: '',
  },
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setLastUpdated: (state, action: PayloadAction<string>) => {
      state.lastUpdated = action.payload
    },
    setSelectedPeriod: (state, action: PayloadAction<DashboardState['selectedPeriod']>) => {
      state.selectedPeriod = action.payload
      const now = new Date()
      let start: Date | '' = ''
      let end: Date | '' = ''
      switch (action.payload) {
        case 'last7Days':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          end = now
          break
        case 'last30Days':
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          end = now
          break
        case 'thisMonth':
          start = new Date(now.getFullYear(), now.getMonth(), 1)
          end = now
          break
        case 'lastMonth':
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          end = new Date(now.getFullYear(), now.getMonth(), 0)
          break
        case 'thisYear':
          start = new Date(now.getFullYear(), 0, 1)
          end = now
          break
        case 'lastYear':
          start = new Date(now.getFullYear() - 1, 0, 1)
          end = new Date(now.getFullYear() - 1, 11, 31)
          break
        case 'allTime':
        default:
          start = ''
          end = ''
      }
      state.selectedDateRange = {
        start: start ? start.toISOString().split('T')[0] : '',
        end: end ? end.toISOString().split('T')[0] : '',
      }
    },
    setDateRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
      state.selectedDateRange = action.payload
    },
  },
})

export const {
  setLoading,
  setError,
  setLastUpdated,
  setSelectedPeriod,
  setDateRange,
} = dashboardSlice.actions

// Helper function to check if a date is within range
const isDateInRange = (dateString: string, startDate: string, endDate: string) => {
  if (!startDate || !endDate) return true // allTime
  const date = new Date(dateString)
  const start = new Date(startDate)
  const end = new Date(endDate)
  return date >= start && date <= end
}

// Comprehensive selectors that combine data from all slices
export const selectDashboardMetrics = createSelector(
  [
    (state: RootState) => state.sales.sales,
    (state: RootState) => state.purchases.purchases,
    (state: RootState) => state.items.items,
    (state: RootState) => state.customers.customers,
    (state: RootState) => state.bankAccounts.accounts,
    (state: RootState) => state.dashboard.selectedDateRange,
  ],
  (sales, purchases, items, customers, bankAccounts, dateRange) => {
    // Filter data by date range
    const filteredSales = sales.filter(sale => 
      isDateInRange(sale.createdAt, dateRange.start, dateRange.end)
    )
    const filteredPurchases = purchases.filter(purchase => 
      purchase.created_at && isDateInRange(purchase.created_at, dateRange.start, dateRange.end)
    )

    const salesStats = {
      totalSales: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
      totalOrders: filteredSales.length,
      pendingSales: filteredSales.filter(s => s.paymentStatus === "pending").length,
      paidSales: filteredSales.filter(s => s.paymentStatus === "paid").length,
    }

    const itemsStats = {
      totalItems: items.length,
      activeItems: items.filter(item => item.status === 'active').length,
      lowStockItems: items.filter(item => item.stock <= item.minStock).length,
      totalStockValue: items.reduce((sum, item) => sum + (item.stock * item.cost), 0),
    }

    const customersStats = {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(customer => customer.status === 'active').length,
      // Remove this as we should calculate revenue from actual sales, not customer data
      totalOrders: customers.reduce((sum, customer) => sum + customer.totalOrders, 0),
    }

    const purchasesStats = {
      totalPurchases: filteredPurchases.length,
      totalAmount: filteredPurchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0),
      pendingPurchases: filteredPurchases.filter(p => p.status === 'ordered').length,
      receivedPurchases: filteredPurchases.filter(p => p.status === 'received').length,
      paidPurchases: filteredPurchases.filter(p => p.status === 'paid').length,
    }

    const bankStats = {
      totalAccounts: bankAccounts.length,
      activeAccounts: bankAccounts.filter(account => account.status === 'active').length,
      totalBalance: bankAccounts.reduce((sum, account) => sum + account.balance, 0),
      checkingAccounts: bankAccounts.filter(account => account.type === 'checking').length,
      savingsAccounts: bankAccounts.filter(account => account.type === 'savings').length,
    }

    // Calculate total receivable (pending sales)
    const pendingSales = sales.filter(sale => sale.paymentStatus === 'pending')
    const totalReceivable = pendingSales.reduce((sum, sale) => sum + sale.total, 0)

    // Calculate total payable (pending purchases)
    const pendingPurchases = purchases.filter(purchase => purchase.status === 'ordered')
    const totalPayable = pendingPurchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0)

    // Calculate cash in hand (total bank balance)
    const cashInHand = bankStats.totalBalance

    // Calculate stock value
    const stockValue = itemsStats.totalStockValue

    // Calculate low stock items count
    const lowStockItems = itemsStats.lowStockItems

    // Calculate profit margin for the selected period
    const periodRevenue = salesStats.totalSales
    const periodCost = filteredSales.reduce((sum, sale) => {
      return sum + (sale.items || []).reduce((itemSum, item) => {
        const itemData = items.find(i => i.id === item.itemId)
        return itemSum + (item.quantity * (itemData?.cost || 0))
      }, 0)
    }, 0)
    const profitMargin = periodRevenue > 0 ? ((periodRevenue - periodCost) / periodRevenue) * 100 : 0

    return {
      // Sales metrics - totalSales and totalRevenue are the same (total revenue from sales)
      totalSales: salesStats.totalSales,
      totalRevenue: salesStats.totalSales, // This should be the same as totalSales
      totalOrders: salesStats.totalOrders,
      pendingSales: salesStats.pendingSales,
      paidSales: salesStats.paidSales,
      totalReceivable,
      
      // Purchase metrics
      totalPurchases: purchasesStats.totalPurchases,
      totalPayable,
      pendingPurchases: purchasesStats.pendingPurchases,
      receivedPurchases: purchasesStats.receivedPurchases,
      paidPurchases: purchasesStats.paidPurchases,
      
      // Inventory metrics
      totalItems: itemsStats.totalItems,
      activeItems: itemsStats.activeItems,
      lowStockItems,
      stockValue,
      
      // Customer metrics
      totalCustomers: customersStats.totalCustomers,
      activeCustomers: customersStats.activeCustomers,
      
      // Financial metrics
      cashInHand,
      totalBalance: bankStats.totalBalance,
      totalAccounts: bankStats.totalAccounts,
      
      // Combined metrics
      netWorth: cashInHand + stockValue - totalPayable,
      profitMargin,
    }
  }
)

export const selectSalesChartData = createSelector(
  [
    (state: RootState) => state.sales.sales,
    (state: RootState) => state.dashboard.selectedPeriod,
    (state: RootState) => state.dashboard.selectedDateRange,
  ],
  (sales, selectedPeriod, dateRange) => {
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Generate date array based on period
    let dateArray: string[] = []
    
    if (selectedPeriod === 'thisYear' || selectedPeriod === 'lastYear') {
      // Monthly data for year view
      const months = []
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        months.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0])
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
      dateArray = months
    } else {
      // Daily data for other periods
      dateArray = Array.from({ length: daysDiff + 1 }, (_, i) => {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        return date.toISOString().split('T')[0]
      })
    }

    const salesByDate = dateArray.map(date => {
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt)
        if (selectedPeriod === 'thisYear' || selectedPeriod === 'lastYear') {
          // Compare year and month for monthly view
          return saleDate.getFullYear() === new Date(date).getFullYear() && 
                 saleDate.getMonth() === new Date(date).getMonth()
        } else {
          // Compare full date for daily view
          return sale.createdAt.startsWith(date)
        }
      })
      
      const total = daySales.reduce((sum, sale) => sum + sale.total, 0)
      const orders = daySales.length
      const profit = daySales.reduce((sum, sale) => {
        return sum + (sale.items || []).reduce((itemSum, item) => {
          // Calculate profit based on cost vs selling price
          const itemCost = item.price * 0.7 // Assuming 30% profit margin
          return itemSum + (item.total - (item.quantity * itemCost))
        }, 0)
      }, 0)
      
      return {
        date,
        sales: total,
        orders,
        profit,
        target: selectedPeriod === 'thisYear' || selectedPeriod === 'lastYear' ? 50000 : 2000, // Dynamic target
      }
    })

    return salesByDate
  }
)

export const selectCategoryAnalytics = createSelector(
  [
    (state: RootState) => state.items.items,
    (state: RootState) => state.sales.sales,
    (state: RootState) => state.dashboard.selectedDateRange,
  ],
  (items, sales, dateRange) => {
    // Get sales within date range
    const filteredSales = sales.filter(sale => 
      isDateInRange(sale.createdAt, dateRange.start, dateRange.end)
    )

    // Group items by category
    const categoryMap = new Map<string, { name: string; value: number; color: string; items: any[] }>()
    
    items.forEach(item => {
      if (!categoryMap.has(item.category)) {
        const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316']
        const colorIndex = categoryMap.size % colors.length
        categoryMap.set(item.category, {
          name: item.category,
          value: 0,
          color: colors[colorIndex],
          items: []
        })
      }
      
      const category = categoryMap.get(item.category)!
      category.items.push(item)
    })

    // Calculate sales value for each category
    filteredSales.forEach(sale => {
      (sale.items || []).forEach(saleItem => {
        const item = items.find(i => i.id === saleItem.itemId)
        if (item && categoryMap.has(item.category)) {
          const category = categoryMap.get(item.category)!
          category.value += saleItem.total
        }
      })
    })

    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value)
  }
)

export const selectTopSellingItems = createSelector(
  [
    (state: RootState) => state.items.items,
    (state: RootState) => state.sales.sales,
    (state: RootState) => state.dashboard.selectedDateRange,
  ],
  (items, sales, dateRange) => {
    // Get sales within date range
    const filteredSales = sales.filter(sale => 
      isDateInRange(sale.createdAt, dateRange.start, dateRange.end)
    )

    // Calculate sales for each item
    const itemSales = new Map<string, { item: any; totalSold: number; revenue: number }>()
    
    filteredSales.forEach(sale => {
      (sale.items || []).forEach(saleItem => {
        const item = items.find(i => i.id === saleItem.itemId)
        if (item) {
          if (!itemSales.has(item.id)) {
            itemSales.set(item.id, { item, totalSold: 0, revenue: 0 })
          }
          const itemData = itemSales.get(item.id)!
          itemData.totalSold += saleItem.quantity
          itemData.revenue += saleItem.total
        }
      })
    })

    return Array.from(itemSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(({ item, totalSold, revenue }) => ({
        id: item.id,
        name: item.name,
        totalSold,
        revenue,
        trend: totalSold > 20 ? "+12%" : totalSold > 10 ? "+8%" : "-3%",
      }))
  }
)

export const selectTopCustomers = createSelector(
  [
    (state: RootState) => state.customers.customers,
    (state: RootState) => state.sales.sales,
    (state: RootState) => state.dashboard.selectedDateRange,
  ],
  (customers, sales, dateRange) => {
    // Get sales within date range
    const filteredSales = sales.filter(sale => 
      isDateInRange(sale.createdAt, dateRange.start, dateRange.end)
    )

    // Calculate sales for each customer
    const customerSales = new Map<string, { customer: any; totalSales: number; totalOrders: number }>()
    
    filteredSales.forEach(sale => {
      if (!customerSales.has(sale.customerId)) {
        const customer = customers.find(c => c.id === sale.customerId)
        if (customer) {
          customerSales.set(sale.customerId, { customer, totalSales: 0, totalOrders: 0 })
        }
      }
      
      const customerData = customerSales.get(sale.customerId)
      if (customerData) {
        customerData.totalSales += sale.total
        customerData.totalOrders += 1
      }
    })

    return Array.from(customerSales.values())
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5)
      .map(({ customer, totalSales, totalOrders }) => ({
        id: customer.id,
        name: customer.name,
        totalSales,
        totalOrders,
      }))
  }
)

export const selectLowStockAlerts = createSelector(
  [(state: RootState) => state.items.items],
  (items) => {
    return items
      .filter(item => item.stock <= item.minStock)
      .map(item => ({
        id: item.id,
        name: item.name,
        currentStock: item.stock,
        minStock: item.minStock,
        supplier: item.supplier,
      }))
  }
)

export const selectRecentActivity = createSelector(
  [
    (state: RootState) => state.sales.sales,
    (state: RootState) => state.purchases.purchases,
  ],
  (sales, purchases) => {
    const activities = [
      ...sales.map(sale => ({
        id: sale.id,
        type: 'sale' as const,
        title: `Sale ${sale.invoiceNumber}`,
        description: `${sale.customerName} - Rs ${(sale.total || 0).toLocaleString()}`,
        date: sale.createdAt,
        status: sale.paymentStatus,
        amount: sale.total || 0,
      })),
      ...purchases.map(purchase => ({
        id: purchase.id,
        type: 'purchase' as const,
        title: `Purchase ${purchase.bill_number}`,
        description: `${purchase.supplier_id} - Rs ${(purchase.total || 0).toLocaleString()}`,
        date: purchase.created_at,
        status: purchase.status,
        amount: purchase.total || 0,
      })),
    ]

    return [...activities]
      .filter(activity => activity.date) // Filter out activities with null dates
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
      .slice(0, 10)
  }
)

export const selectFinancialMetrics = createSelector(
  [
    (state: RootState) => state.sales.sales,
    (state: RootState) => state.purchases.purchases,
    (state: RootState) => state.items.items,
    (state: RootState) => state.bankAccounts.accounts,
    (state: RootState) => state.dashboard.selectedDateRange,
  ],
  (sales, purchases, items, bankAccounts, dateRange) => {
    // Filter data by date range
    const filteredSales = sales.filter(sale => 
      isDateInRange(sale.createdAt, dateRange.start, dateRange.end)
    )
    const filteredPurchases = purchases.filter(purchase => 
      purchase.created_at && isDateInRange(purchase.created_at, dateRange.start, dateRange.end)
    )

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
    const totalExpenses = filteredPurchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0)
    const cashFlow = totalRevenue - totalExpenses
    
    const inventoryValue = items.reduce((sum, item) => sum + (item.stock * item.cost), 0)
    const availableBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0)
    
    const pendingReceivables = sales
      .filter(sale => sale.paymentStatus === 'pending')
      .reduce((sum, sale) => sum + sale.total, 0)
    
    const pendingPayables = purchases
      .filter(purchase => purchase.status === 'ordered')
      .reduce((sum, purchase) => sum + (purchase.total || 0), 0)

    return {
      cashFlow,
      inventoryValue,
      availableBalance,
      pendingReceivables,
      pendingPayables,
      totalRevenue,
      totalExpenses,
    }
  }
)

export default dashboardSlice.reducer 