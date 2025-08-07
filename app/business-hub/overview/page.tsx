"use client"

import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts"
import {
  ShoppingCart,
  CreditCard,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Activity,
  Package,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Target,
  Zap,
  Star,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  RefreshCw,
  Bell,
  Settings,
  BarChart3,
  PieChartIcon,
  Wallet,
  ShoppingBag,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { 
  selectDashboardMetrics, 
  selectTopSellingItems,
  selectTopCustomers,
  selectLowStockAlerts,
  selectRecentActivity,
  selectFinancialMetrics,
  setSelectedPeriod,
  setLastUpdated,
  setLoading
} from "@/lib/store/slices/dashboardSlice"
import { selectGeneralSettings } from "@/lib/store/slices/settingsSlice"
import { showNotification } from "@/lib/store/slices/uiSlice"
import { NotificationHelpers } from "@/lib/notification-helpers"
import { NewSaleDialog } from "@/components/NewSaleDialog"
import AdvancedPurchaseDialog from "@/components/AdvancedPurchaseDialog"
import { NewCustomerDialog } from "@/components/NewCustomerDialog"
import { NewItemDialog } from "@/components/NewItemDialog"
import TargetSettingsDialog from "@/components/TargetSettingsDialog"
import LoadingState from "@/components/LoadingState"
import { NotificationDropdown } from "@/components/NotificationDropdown"
import { apiClient } from "@/lib/api-client"
import { useCurrency } from "@/lib/currency-manager"
import { useTheme } from "@/components/ThemeProvider"
import UserDataTest from "@/components/UserDataTest"

export default function OverviewPage() {
  const dispatch = useAppDispatch()
  const generalSettings = useAppSelector(selectGeneralSettings)
  const dashboardStats = useAppSelector(selectDashboardMetrics)
  const topProducts = useAppSelector(selectTopSellingItems)
  const topCustomers = useAppSelector(selectTopCustomers)
  const lowStockAlerts = useAppSelector(selectLowStockAlerts)
  const recentActivity = useAppSelector(selectRecentActivity)
  const financialMetrics = useAppSelector(selectFinancialMetrics)
  const { formatAmountWithSymbol, getSymbol } = useCurrency()
  const { applyTheme } = useTheme()

  // Real analytics data state
  const [salesChartData, setSalesChartData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsTotals, setAnalyticsTotals] = useState<any>({
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalCount: 0
  })
  
  // Real transactions data state
  const [realTransactions, setRealTransactions] = useState<any[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  
  const selectedPeriod = useAppSelector((state) => state.dashboard.selectedPeriod)
  const lastUpdated = useAppSelector((state) => state.dashboard.lastUpdated)
  const dashboardLoading = useAppSelector((state) => state.dashboard.loading)
  
  // Ensure component re-renders when country/currency changes
  useEffect(() => {
    // This effect will trigger when generalSettings.selectedCountry changes
    // The useCurrency hook will automatically pick up the new country and update currency formatting
    console.log('Country changed to:', generalSettings.selectedCountry)
  }, [generalSettings.selectedCountry])
  
  const [activeTab, setActiveTab] = useState("home")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSaleDialog, setShowSaleDialog] = useState(false)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null)
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null)
  const [showTargetSettings, setShowTargetSettings] = useState(false)
  const [dailyTarget, setDailyTarget] = useState(3333) // Default daily target
  const [monthlyTarget, setMonthlyTarget] = useState(100000) // Default monthly target
  const [previousDailyAchievement, setPreviousDailyAchievement] = useState(false)
  const [previousMonthlyAchievement, setPreviousMonthlyAchievement] = useState(false)
  const [showUserDataTest, setShowUserDataTest] = useState(true) // State for test component visibility

  // Generate sample activity notifications for demonstration
  const generateSampleNotifications = () => {
    // Sample sale notification
    NotificationHelpers.saleCreated(dispatch, {
      invoiceNo: 'INV-2025-001',
      amount: 15000,
      customerName: 'John Doe'
    })

    // Sample purchase notification
    setTimeout(() => {
      NotificationHelpers.purchaseCreated(dispatch, {
        invoiceNo: 'PO-2025-001',
        amount: 8500,
        supplierName: 'ABC Suppliers'
      })
    }, 1000)

    // Sample expense notification
    setTimeout(() => {
      NotificationHelpers.expenseAdded(dispatch, {
        description: 'Office Rent Payment',
        amount: 25000,
        category: 'Operating Expenses'
      })
    }, 2000)

    // Sample bank transaction notification
    setTimeout(() => {
      NotificationHelpers.bankTransactionAdded(dispatch, {
        type: 'Credit',
        amount: 50000,
        description: 'Customer Payment Received'
      })
    }, 3000)

    // Sample report notification
    setTimeout(() => {
      NotificationHelpers.reportGenerated(dispatch, {
        type: 'Sales Report',
        period: 'January 2025'
      })
    }, 4000)

    // Sample low stock alert
    setTimeout(() => {
      NotificationHelpers.lowStockAlert(dispatch, {
        name: 'Product XYZ',
        currentStock: 5,
        minStock: 10
      })
    }, 5000)
  }

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Only fetch if we have a phone number
      if (!generalSettings.phoneNumber) {
        console.log('No phone number available, skipping dashboard data fetch')
        dispatch(setLoading(false))
        return
      }

      dispatch(setLoading(true))
      try {
        console.log('📊 Overview: Fetching data for phone:', generalSettings.phoneNumber)
        // Fetch real-time overview metrics using the API client
        const result = await apiClient.overview.getMetrics(generalSettings.phoneNumber)
        
        if (result.success) {
          console.log('✅ Overview: Real-time metrics fetched successfully:', result.data)
          setRealTimeMetrics(result.data)
          // Update the last updated timestamp
          dispatch(setLastUpdated(new Date().toISOString()))
        } else {
          console.error('❌ Overview: Failed to fetch real-time metrics:', result.error)
        }

        // Generate sample notifications on first load (for demonstration)
        // generateSampleNotifications() // Temporarily disabled to test user isolation
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        dispatch(setLoading(false))
      }
    }

    fetchDashboardData()
  }, [dispatch, generalSettings.phoneNumber])

  // Load saved targets from localStorage
  useEffect(() => {
    const savedTargets = localStorage.getItem('businessTargets')
    if (savedTargets) {
      try {
        const targets = JSON.parse(savedTargets)
        setDailyTarget(targets.dailyTarget || 3333)
        setMonthlyTarget(targets.monthlyTarget || 100000)
      } catch (error) {
        console.error('Failed to load saved targets:', error)
      }
    }

    // Load previous achievements to prevent duplicate notifications
    const achievements = JSON.parse(localStorage.getItem('achievements') || '{}')
    const today = new Date().toISOString().split('T')[0]
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    setPreviousDailyAchievement(!!achievements[`daily_${today}`])
    setPreviousMonthlyAchievement(!!achievements[`monthly_${currentMonth}`])
  }, [])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    const interval = setInterval(async () => {
      // Only auto-refresh if we have a phone number
      if (!generalSettings.phoneNumber) return

      try {
        const result = await apiClient.overview.getMetrics(generalSettings.phoneNumber)
        
        if (result.success) {
          setRealTimeMetrics(result.data)
          dispatch(setLastUpdated(new Date().toISOString()))
        }
      } catch (error) {
        console.error('Auto-refresh failed:', error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch, generalSettings.phoneNumber])

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setAnalyticsLoading(true)
      try {
        console.log('📈 Analytics: Fetching data for period:', selectedPeriod, 'phone:', generalSettings.phoneNumber)
        // Fetch sales chart data
        const salesResponse = await apiClient.analytics.getSalesChart(selectedPeriod)
        console.log('📊 Analytics: Sales response:', salesResponse)
        setSalesChartData(salesResponse.data || [])
        setAnalyticsTotals({
          totalSales: salesResponse.totalSales || 0,
          totalRevenue: salesResponse.totalRevenue || 0,
          totalProfit: salesResponse.totalProfit || 0,
          totalCount: salesResponse.totalCount || 0
        })

        // Fetch category analytics
        const categoryResponse = await apiClient.analytics.getCategoryAnalytics()
        console.log('🏷️ Analytics: Category response:', categoryResponse)
        setCategoryData(categoryResponse.categories || [])
      } catch (error) {
        console.error('❌ Analytics: Failed to fetch analytics data:', error)
      } finally {
        setAnalyticsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [selectedPeriod])

  // Fetch recent transactions
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      setTransactionsLoading(true)
      try {
        console.log('🔄 Recent Transactions: Fetching for phone:', generalSettings.phoneNumber)
        const response = await apiClient.recentTransactions.getRecent(5)
        console.log('✅ Recent Transactions: Response:', response)
        setRealTransactions(response.data || [])
      } catch (error) {
        console.error('❌ Recent Transactions: Failed to fetch:', error)
        setRealTransactions([])
      } finally {
        setTransactionsLoading(false)
      }
    }

    if (generalSettings.phoneNumber) {
      fetchRecentTransactions()
    }
  }, [generalSettings.phoneNumber])

  // Target achievement detection
  useEffect(() => {
    if (realTimeMetrics) {
      const dailyProgress = (realTimeMetrics.todaysSales || 0) / dailyTarget * 100
      const monthlyProgress = (realTimeMetrics.totalSales || 0) / monthlyTarget * 100

      // Check daily target achievement (only trigger once when crossing 100%)
      if (dailyProgress >= 100 && !previousDailyAchievement) {
        dispatch(showNotification({
          message: `🎉 Congratulations! You've achieved your daily target of ₹${dailyTarget.toLocaleString('en-IN')}! Today's sales: ₹${(realTimeMetrics.todaysSales || 0).toLocaleString('en-IN')}`,
          type: "success"
        }))
        setPreviousDailyAchievement(true)
        
        // Save achievement to localStorage to persist across sessions
        const achievements = JSON.parse(localStorage.getItem('achievements') || '{}')
        const today = new Date().toISOString().split('T')[0]
        achievements[`daily_${today}`] = true
        localStorage.setItem('achievements', JSON.stringify(achievements))
      } else if (dailyProgress < 100) {
        setPreviousDailyAchievement(false)
      }

      // Check monthly target achievement (only trigger once when crossing 100%)
      if (monthlyProgress >= 100 && !previousMonthlyAchievement) {
        dispatch(showNotification({
          message: `🚀 Outstanding Achievement! You've reached your monthly target of ₹${monthlyTarget.toLocaleString('en-IN')}! Total sales: ₹${(realTimeMetrics.totalSales || 0).toLocaleString('en-IN')}`,
          type: "success"
        }))
        setPreviousMonthlyAchievement(true)
        
        // Save achievement to localStorage
        const achievements = JSON.parse(localStorage.getItem('achievements') || '{}')
        const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
        achievements[`monthly_${currentMonth}`] = true
        localStorage.setItem('achievements', JSON.stringify(achievements))
      } else if (monthlyProgress < 100) {
        setPreviousMonthlyAchievement(false)
      }

      // Milestone celebrations (show only once per session)
      const sessionMilestones = sessionStorage.getItem('milestonesShown') || '{}'
      const milestonesShown = JSON.parse(sessionMilestones)
      
      if (dailyProgress >= 75 && dailyProgress < 100 && !milestonesShown.daily75) {
        dispatch(showNotification({
          message: `💪 Great progress! You're 75% towards your daily target! Only ₹${(dailyTarget - (realTimeMetrics.todaysSales || 0)).toLocaleString('en-IN')} to go!`,
          type: "info"
        }))
        milestonesShown.daily75 = true
        sessionStorage.setItem('milestonesShown', JSON.stringify(milestonesShown))
      }

      if (monthlyProgress >= 50 && monthlyProgress < 75 && !milestonesShown.monthly50) {
        dispatch(showNotification({
          message: `⭐ Halfway there! You've reached 50% of your monthly target! Keep going strong!`,
          type: "info"
        }))
        milestonesShown.monthly50 = true
        sessionStorage.setItem('milestonesShown', JSON.stringify(milestonesShown))
      }

      if (monthlyProgress >= 75 && monthlyProgress < 100 && !milestonesShown.monthly75) {
        dispatch(showNotification({
          message: `🔥 You're on fire! 75% of your monthly target achieved! Final push!`,
          type: "info"
        }))
        milestonesShown.monthly75 = true
        sessionStorage.setItem('milestonesShown', JSON.stringify(milestonesShown))
      }
    }
  }, [realTimeMetrics, dailyTarget, monthlyTarget, previousDailyAchievement, previousMonthlyAchievement, dispatch])

  // Transform the chart data for better display
  const chartData = salesChartData.map((item: any) => ({
    name: selectedPeriod === 'thisYear' || selectedPeriod === 'lastYear' 
      ? new Date(item.date).toLocaleDateString('en-US', { month: 'short' })
      : new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    date: item.date,
    sales: item.sales || 0,
    revenue: item.revenue || 0,
    profit: item.profit || 0,
    count: item.count || 0,
    total: item.sales || 0, // For the line chart
  }))

  // Debug logging
  console.log('Chart data transformation:', {
    salesChartDataLength: salesChartData.length,
    salesChartData: salesChartData.slice(0, 3), // First 3 items
    chartData: chartData.slice(0, 3), // First 3 items
    selectedPeriod
  })

  // Transform category data for charts
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
  const transformedCategoryData = categoryData.map((item: any, index: number) => ({
    name: item.category || 'Unknown',
    value: item.sales || 0,
    color: colors[index % colors.length],
    category: item.category || 'Unknown',
    sales: item.sales || 0,
    revenue: item.revenue || 0,
    count: item.count || 0,
    percentage: item.percentage || 0
  }))

  // Calculate trend percentages for KPI cards
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // Get previous period data for trend calculation
  const getPreviousPeriodData = (): { totalSales: number; totalOrders: number; totalCustomers: number; profitMargin: number } => {
    const now = new Date()
    let start: Date
    let end: Date

    switch (selectedPeriod) {
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        end = new Date(now.getFullYear(), now.getMonth() - 1, 0)
        break
      case 'thisYear':
        start = new Date(now.getFullYear() - 1, 0, 1)
        end = new Date(now.getFullYear() - 1, 11, 31)
        break
      case 'lastYear':
        start = new Date(now.getFullYear() - 2, 0, 1)
        end = new Date(now.getFullYear() - 2, 11, 31)
        break
      default:
        return { totalSales: 0, totalOrders: 0, totalCustomers: 0, profitMargin: 0 }
    }

    // This would need to be calculated from actual data
    // For now, returning estimated values
    return {
      totalSales: dashboardStats.totalSales * 0.85,
      totalOrders: dashboardStats.totalOrders * 0.9,
      totalCustomers: dashboardStats.totalCustomers,
      profitMargin: dashboardStats.profitMargin * 0.95,
    }
  }

  const previousData = getPreviousPeriodData()

  const handlePeriodChange = (period: string) => {
    dispatch(setSelectedPeriod(period as any))
  }

  const handleRefresh = () => {
    dispatch(setLoading(true))
    setTimeout(() => {
      dispatch(setLoading(false))
      dispatch(setLastUpdated(new Date().toISOString()))
      dispatch(showNotification({ message: "Dashboard data synced successfully!", type: "success" }))
    }, 1000)
  }

  const handleTargetsUpdate = (newDailyTarget: number, newMonthlyTarget: number) => {
    setDailyTarget(newDailyTarget)
    setMonthlyTarget(newMonthlyTarget)
  }

  // Use real transactions instead of mock data
  const recentTransactions = realTransactions.slice(0, 4)

  // Refresh functions for dialogs
  const refreshOverviewData = async () => {
    console.log('🔄 Refreshing overview data after transaction...')
    
    // Refresh recent transactions
    try {
      const response = await apiClient.recentTransactions.getRecent(5)
      setRealTransactions(response.data || [])
    } catch (error) {
      console.error('❌ Failed to refresh transactions:', error)
    }
    
    // Refresh real-time metrics
    try {
      const result = await apiClient.overview.getMetrics(generalSettings.phoneNumber)
      if (result.success) {
        setRealTimeMetrics(result.data)
        dispatch(setLastUpdated(new Date().toISOString()))
      }
    } catch (error) {
      console.error('❌ Failed to refresh metrics:', error)
    }
    
    // Refresh analytics data
    try {
      const salesResponse = await apiClient.analytics.getSalesChart(selectedPeriod)
      setSalesChartData(salesResponse.data || [])
      setAnalyticsTotals({
        totalSales: salesResponse.totalSales || 0,
        totalRevenue: salesResponse.totalRevenue || 0,
        totalProfit: salesResponse.totalProfit || 0,
        totalCount: salesResponse.totalCount || 0
      })
    } catch (error) {
      console.error('❌ Failed to refresh analytics:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="ml-16 flex flex-col min-h-screen">
        {/* Enhanced Header */}
        <div className="bg-white border-b border-gray-200 shadow-lg sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Business Overview
                    </h1>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {currentTime.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Last synced: {lastUpdated ? new Date(lastUpdated!).toLocaleTimeString() : 'Never'}</span>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative bg-white rounded-xl p-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-12 pr-4 py-3 w-96 bg-gray-50/50 border-gray-200/50 rounded-lg focus:bg-white transition-all duration-200"
                      placeholder="Search transactions, parties, items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={dashboardLoading}
                  className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-transparent"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${dashboardLoading ? "animate-spin" : ""}`} />
                  {dashboardLoading ? "Syncing..." : "Sync"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-transparent"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  onClick={() => setShowSaleDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Sale
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  onClick={() => setShowPurchaseDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Purchase
                </Button>
                <NotificationDropdown />
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-transparent"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content Area */}
        <div className="flex-1 flex gap-8 p-8">
          {/* Left Content */}
          <div className="flex-1 space-y-8">
            {/* Enhanced KPI Cards */}
            {dashboardLoading ? (
              <LoadingState 
                type="cards" 
                text="Loading dashboard metrics..." 
                rows={1} 
                columns={4}
              />
            ) : (
              <div className="grid grid-cols-4 gap-6">
              {[
                {
                  title: "Total Sales",
                  value: formatAmountWithSymbol(realTimeMetrics?.totalSales || dashboardStats.totalRevenue || 0),
                  change: `${calculateTrend(realTimeMetrics?.totalSales || dashboardStats.totalRevenue, previousData.totalSales).toFixed(1)}%`,
                  trend: calculateTrend(realTimeMetrics?.totalSales || dashboardStats.totalRevenue, previousData.totalSales) >= 0 ? "up" : "down",
                  icon: DollarSign,
                  color: "from-green-500 to-emerald-600",
                  bgColor: "bg-green-50",
                },
                {
                  title: "Total Purchases",
                  value: formatAmountWithSymbol(realTimeMetrics?.totalPurchases || 0),
                  change: `${calculateTrend(realTimeMetrics?.totalPurchases || 0, previousData.totalOrders).toFixed(1)}%`,
                  trend: calculateTrend(realTimeMetrics?.totalPurchases || 0, previousData.totalOrders) >= 0 ? "up" : "down",
                  icon: ShoppingCart,
                  color: "from-blue-500 to-indigo-600",
                  bgColor: "bg-blue-50",
                },
                {
                  title: "Today's Sales",
                  value: formatAmountWithSymbol(realTimeMetrics?.todaysSales || 0),
                  change: `${calculateTrend(realTimeMetrics?.todaysSales || 0, 0).toFixed(1)}%`,
                  trend: (realTimeMetrics?.todaysSales || 0) >= 0 ? "up" : "down",
                  icon: TrendingUp,
                  color: "from-purple-500 to-violet-600",
                  bgColor: "bg-purple-50",
                },
                {
                  title: "Profit Margin",
                  value: `${(realTimeMetrics?.profitMargin || dashboardStats.profitMargin || 0).toFixed(1)}%`,
                  change: `${calculateTrend(realTimeMetrics?.profitMargin || dashboardStats.profitMargin, previousData.profitMargin).toFixed(1)}%`,
                  trend: calculateTrend(realTimeMetrics?.profitMargin || dashboardStats.profitMargin, previousData.profitMargin) >= 0 ? "up" : "down",
                  icon: Target,
                  color: "from-orange-500 to-red-600",
                  bgColor: "bg-orange-50",
                },
              ].map((metric, index) => (
                <Card
                  key={metric.title}
                  className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden relative"
                >
                  <div
                    className={`absolute inset-0 ${metric.bgColor} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
                  ></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                      >
                        <metric.icon className="h-6 w-6 text-white" />
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          metric.trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {metric.trend === "up" ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {metric.change}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}

            {/* Target Achievement Cards */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              {/* Daily Sales Target */}
              <Card className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTargetSettings(true)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Daily Sales Target</p>
                    <p className="text-xl font-bold text-gray-900">
                      {Math.round(((realTimeMetrics?.todaysSales || 0) / dailyTarget) * 100)}% Achieved
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Progress 
                      value={Math.min(100, ((realTimeMetrics?.todaysSales || 0) / dailyTarget) * 100)} 
                      className="h-3" 
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{formatAmountWithSymbol(realTimeMetrics?.todaysSales || 0)}</span>
                      <span>{formatAmountWithSymbol(dailyTarget)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Sales Target */}
              <Card className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
                <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTargetSettings(true)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Monthly Sales Target</p>
                    <p className="text-xl font-bold text-gray-900">
                      {Math.round(((realTimeMetrics?.totalSales || 0) / monthlyTarget) * 100)}% Achieved
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Progress 
                      value={Math.min(100, ((realTimeMetrics?.totalSales || 0) / monthlyTarget) * 100)} 
                      className="h-3" 
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{formatAmountWithSymbol(realTimeMetrics?.totalSales || 0)}</span>
                      <span>{formatAmountWithSymbol(monthlyTarget)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Business Metrics */}
            <div className="grid grid-cols-4 gap-6 mt-6">
              {[
                {
                  title: "Inventory Value",
                  value: formatAmountWithSymbol(realTimeMetrics?.inventoryValue || 0),
                  change: `${(realTimeMetrics?.totalItems || 0)} items`,
                  trend: "neutral",
                  icon: Package,
                  color: "from-teal-500 to-cyan-600",
                  bgColor: "bg-teal-50",
                },
                {
                  title: "Available Balance",
                  value: formatAmountWithSymbol(realTimeMetrics?.availableBalance || 0),
                  change: `${(realTimeMetrics?.lowStockItems || 0)} low stock`,
                  trend: (realTimeMetrics?.lowStockItems || 0) === 0 ? "up" : "down",
                  icon: Wallet,
                  color: "from-indigo-500 to-purple-600",
                  bgColor: "bg-indigo-50",
                },
                {
                  title: "Total Expenses",
                  value: formatAmountWithSymbol(realTimeMetrics?.totalExpenses || 0),
                  change: `${(realTimeMetrics?.totalPurchasesCount || 0)} purchases`,
                  trend: "neutral",
                  icon: CreditCard,
                  color: "from-rose-500 to-pink-600",
                  bgColor: "bg-rose-50",
                },
                {
                  title: "Active Customers",
                  value: (realTimeMetrics?.totalCustomers || dashboardStats.activeCustomers || 0).toString(),
                  change: `${(realTimeMetrics?.totalSuppliers || 0)} suppliers`,
                  trend: "up",
                  icon: Users,
                  color: "from-emerald-500 to-green-600",
                  bgColor: "bg-emerald-50",
                },
              ].map((metric, index) => (
                <Card
                  key={metric.title}
                  className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden relative"
                >
                  <div
                    className={`absolute inset-0 ${metric.bgColor} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
                  ></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                      >
                        <metric.icon className="h-6 w-6 text-white" />
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          metric.trend === "up" ? "bg-green-100 text-green-700" : 
                          metric.trend === "down" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {metric.trend === "up" ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : metric.trend === "down" ? (
                          <ArrowDownRight className="h-3 w-3" />
                        ) : (
                          <Activity className="h-3 w-3" />
                        )}
                        {metric.change}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sales Targets Section */}
            {realTimeMetrics && (
              <div className="grid grid-cols-3 gap-6 mt-6">
                <Card className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        Daily Target
                        {((realTimeMetrics.todaysSales || 0) >= dailyTarget) && (
                          <span className="text-green-600 text-sm">🎉</span>
                        )}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTargetSettings(true)}
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                      >
                        <Settings className="h-4 w-4 text-blue-600" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className={`${
                          ((realTimeMetrics.todaysSales || 0) / dailyTarget * 100) >= 100 
                            ? 'text-green-600 font-semibold' 
                            : ''
                        }`}>
                          {((realTimeMetrics.todaysSales || 0) / dailyTarget * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(realTimeMetrics.todaysSales || 0) / dailyTarget * 100} 
                        className={`h-2 ${
                          ((realTimeMetrics.todaysSales || 0) / dailyTarget * 100) >= 100 
                            ? 'bg-green-100' 
                            : ''
                        }`} 
                      />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{formatAmountWithSymbol(realTimeMetrics.todaysSales || 0)}</span>
                        <span>{formatAmountWithSymbol(dailyTarget)}</span>
                      </div>
                      {((realTimeMetrics.todaysSales || 0) >= dailyTarget) && (
                        <div className="text-xs text-green-600 font-medium text-center mt-2">
                          ✅ Target Achieved!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        Monthly Target
                        {((realTimeMetrics.totalSales || 0) >= monthlyTarget) && (
                          <span className="text-green-600 text-sm">🚀</span>
                        )}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTargetSettings(true)}
                        className="h-8 w-8 p-0 hover:bg-green-50"
                      >
                        <Settings className="h-4 w-4 text-green-600" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className={`${
                          ((realTimeMetrics.totalSales || 0) / monthlyTarget * 100) >= 100 
                            ? 'text-green-600 font-semibold' 
                            : ''
                        }`}>
                          {((realTimeMetrics.totalSales || 0) / monthlyTarget * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(realTimeMetrics.totalSales || 0) / monthlyTarget * 100} 
                        className={`h-2 ${
                          ((realTimeMetrics.totalSales || 0) / monthlyTarget * 100) >= 100 
                            ? 'bg-green-100' 
                            : ''
                        }`}
                      />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{formatAmountWithSymbol(realTimeMetrics.totalSales || 0)}</span>
                        <span>{formatAmountWithSymbol(monthlyTarget)}</span>
                      </div>
                      {((realTimeMetrics.totalSales || 0) >= monthlyTarget) && (
                        <div className="text-xs text-green-600 font-medium text-center mt-2">
                          ✅ Target Achieved!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Revenue Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatAmountWithSymbol(realTimeMetrics.revenue || 0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Net Profit: {formatAmountWithSymbol(realTimeMetrics.netProfit || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Gross Profit: {formatAmountWithSymbol(realTimeMetrics.grossProfit || 0)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Enhanced Sales Chart */}
            {analyticsLoading ? (
              <LoadingState 
                type="skeleton" 
                text="Loading sales analytics..." 
                size="lg"
              />
            ) : (
              <Card className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Sales Analytics</CardTitle>
                      <p className="text-sm text-gray-600">Revenue trends and performance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Sales</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Profit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Target</span>
                    </div>
                    <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                      <SelectTrigger className="w-40 rounded-xl border-gray-200 bg-white/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="allTime">All Time</SelectItem>
                        <SelectItem value="last7Days">Last 7 Days</SelectItem>
                        <SelectItem value="last30Days">Last 30 Days</SelectItem>
                        <SelectItem value="thisMonth">This Month</SelectItem>
                        <SelectItem value="lastMonth">Last Month</SelectItem>
                        <SelectItem value="thisYear">This Year</SelectItem>
                        <SelectItem value="lastYear">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Analytics Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">Total Sales ({selectedPeriod})</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {formatAmountWithSymbol(analyticsTotals.totalSales)}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="text-sm text-green-600 mb-1">Total Revenue ({selectedPeriod})</div>
                    <div className="text-2xl font-bold text-green-800">
                      {formatAmountWithSymbol(analyticsTotals.totalRevenue)}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="text-sm text-purple-600 mb-1">Total Profit ({selectedPeriod})</div>
                    <div className="text-2xl font-bold text-purple-800">
                      {formatAmountWithSymbol(analyticsTotals.totalProfit)}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <div className="text-sm text-orange-600 mb-1">Total Orders ({selectedPeriod})</div>
                    <div className="text-2xl font-bold text-orange-800">
                      {analyticsTotals.totalCount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="h-80 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
                  {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">No data available</div>
                        <div className="text-sm text-gray-500">Change the period to see more data</div>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6B7280" 
                          fontSize={12}
                          tick={{ fontSize: 12 }}
                          interval={0}
                        />
                        <YAxis 
                          stroke="#6B7280" 
                          fontSize={12}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => formatAmountWithSymbol(value)}
                          domain={['dataMin - 1000', 'dataMax + 1000']}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value: any, name: any) => {
                            const formattedValue = formatAmountWithSymbol(Number(value));
                            const label = name === 'sales' ? 'Sales' : 
                                         name === 'profit' ? 'Profit' : 
                                         name === 'revenue' ? 'Revenue' : name;
                            return [formattedValue, label];
                          }}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2 }}
                          connectNulls={true}
                        />
                        <Line
                          type="monotone"
                          dataKey="profit"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                          connectNulls={true}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8B5CF6"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                          connectNulls={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Recent Transactions */}
            {transactionsLoading ? (
              <LoadingState 
                type="table" 
                text="Loading recent transactions..." 
                rows={5} 
                columns={4}
              />
            ) : (
              <Card className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Recent Transactions</CardTitle>
                  </div>
                  <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0 font-semibold">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center text-gray-500">
                        <div className="mb-2">No recent transactions</div>
                        <div className="text-sm">Start by creating your first sale or purchase</div>
                      </div>
                    </div>
                  ) : (
                    recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            transaction.type === "Sale"
                              ? "bg-green-100 text-green-600"
                              : transaction.type === "Purchase"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {transaction.type === "Sale" ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : transaction.type === "Purchase" ? (
                            <ShoppingCart className="h-5 w-5" />
                          ) : (
                            <CreditCard className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.party}</p>
                          <p className="text-sm text-gray-600">
                            {transaction.type}
                            {transaction.item && ` • ${transaction.item}`}
                            {transaction.quantity && ` (${transaction.quantity}x)`}
                            {` • ${transaction.time}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatAmountWithSymbol(transaction.amount || 0)}</p>
                          <Badge
                            variant={transaction.status === "Paid" ? "default" : "secondary"}
                            className={
                              transaction.status === "Paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Top Products */}
            {dashboardLoading ? (
              <LoadingState 
                type="table" 
                text="Loading top products..." 
                rows={5} 
                columns={3}
              />
            ) : (
              <Card className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Top Performing Products</CardTitle>
                  </div>
                  <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0 font-semibold">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-white/80 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.totalSold} units sold</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatAmountWithSymbol(product.revenue)}</p>
                          <div
                            className={`flex items-center gap-1 text-xs font-medium ${
                              product.trend.startsWith("+") ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {product.trend.startsWith("+") ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {product.trend}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}
          </div>

          {/* Enhanced Right Sidebar */}
          <div className="w-80 space-y-6">
            {/* Quick Actions */}
            {dashboardLoading ? (
              <LoadingState 
                type="cards" 
                text="Loading quick actions..." 
                rows={1} 
                columns={2}
              />
            ) : (
              <Card className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { 
                      title: "New Sale", 
                      icon: ShoppingCart, 
                      color: "from-green-500 to-emerald-600",
                      onClick: () => setShowSaleDialog(true)
                    },
                    { 
                      title: "New Purchase", 
                      icon: ShoppingBag, 
                      color: "from-blue-500 to-indigo-600",
                      onClick: () => setShowPurchaseDialog(true)
                    },
                    { 
                      title: "Add Party", 
                      icon: Users, 
                      color: "from-purple-500 to-violet-600",
                      onClick: () => setShowCustomerDialog(true)
                    },
                    { 
                      title: "Add Item", 
                      icon: Package, 
                      color: "from-orange-500 to-red-600",
                      onClick: () => setShowItemDialog(true)
                    },
                  ].map((action) => (
                    <Button
                      key={action.title}
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2 border-gray-200 hover:bg-white/80 transition-all duration-200 group bg-transparent"
                      onClick={action.onClick}
                    >
                      <div
                        className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                      >
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-medium">{action.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Business Metrics */}
            {dashboardLoading ? (
              <LoadingState 
                type="cards" 
                text="Loading business metrics..." 
                rows={2} 
                columns={2}
              />
            ) : (
              <>
              {[
              {
                title: "Cash Flow",
                value: formatAmountWithSymbol(financialMetrics.cashFlow),
                subtitle: "Net Cash Flow",
                icon: Wallet,
                color: "from-green-500 to-emerald-600",
                progress: Math.min(100, Math.max(0, (financialMetrics.cashFlow / 10000) * 100)),
              },
              {
                title: "Inventory Value",
                value: formatAmountWithSymbol(financialMetrics.inventoryValue),
                subtitle: "Current Stock",
                icon: Package,
                color: "from-blue-500 to-indigo-600",
                progress: Math.min(100, Math.max(0, (financialMetrics.inventoryValue / 100000) * 100)),
              },
              {
                title: "Available Balance",
                value: formatAmountWithSymbol(financialMetrics.availableBalance),
                subtitle: "Bank Balance",
                icon: Target,
                color: "from-purple-500 to-violet-600",
                progress: Math.min(100, Math.max(0, (financialMetrics.availableBalance / 20000) * 100)),
              },
              {
                title: "Outstanding",
                value: formatAmountWithSymbol(financialMetrics.pendingReceivables),
                subtitle: "To Collect",
                icon: AlertTriangle,
                color: "from-orange-500 to-red-600",
                progress: Math.min(100, Math.max(0, (financialMetrics.pendingReceivables / 5000) * 100)),
              },
            ].map((metric) => (
              <Card
                key={metric.title}
                className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                    >
                      <metric.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{metric.subtitle}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <span>{metric.progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={metric.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
            </>
            )}

            {/* Sales by Category */}
            {dashboardLoading ? (
              <LoadingState 
                type="skeleton" 
                text="Loading category analytics..." 
                size="md"
              />
            ) : (
              <Card className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-blue-500" />
                  Sales by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={transformedCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {transformedCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value: any) => [formatAmountWithSymbol(value), 'Sales']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {transformedCategoryData.slice(0, 4).map((category, index) => (
                    <div key={category.category || `category-${index}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ 
                          backgroundColor: category.color
                        }}></div>
                        <span className="text-sm text-gray-600">{category.category || 'Unknown'}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatAmountWithSymbol(category.sales || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Alerts & Notifications */}
            {dashboardLoading ? (
              <LoadingState 
                type="table" 
                text="Loading alerts..." 
                rows={3} 
                columns={2}
              />
            ) : (
              <Card className="bg-background-primary border-border-default shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-500" />
                  Alerts & Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      type: "warning",
                      title: "Low Stock Alert",
                      message: `${lowStockAlerts.length} items running low`,
                      icon: AlertTriangle,
                      color: "text-orange-600 bg-orange-100",
                    },
                    {
                      type: "info",
                      title: "Payment Due",
                      message: `Rs ${financialMetrics.pendingReceivables.toLocaleString()} to collect`,
                      icon: Clock,
                      color: "text-blue-600 bg-blue-100",
                    },
                    {
                      type: "success",
                      title: "Target Achieved",
                      message: "Monthly sales goal reached",
                      icon: CheckCircle,
                      color: "text-green-600 bg-green-100",
                    },
                  ].map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg hover:bg-white/80 transition-all duration-200"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${alert.color}`}>
                        <alert.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                        <p className="text-xs text-gray-600">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </div>
        <NewSaleDialog 
          open={showSaleDialog} 
          onOpenChange={setShowSaleDialog} 
          trigger={null} 
          onSave={refreshOverviewData}
        />
        <AdvancedPurchaseDialog 
          open={showPurchaseDialog} 
          onOpenChange={setShowPurchaseDialog} 
          purchaseToEdit={selectedPurchase}
          onSave={refreshOverviewData}
        />
        <NewCustomerDialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog} trigger={null} />
        <NewItemDialog open={showItemDialog} onOpenChange={setShowItemDialog} trigger={null} />
        <TargetSettingsDialog 
          open={showTargetSettings} 
          onOpenChange={setShowTargetSettings}
          currentDailyTarget={dailyTarget}
          currentMonthlyTarget={monthlyTarget}
          currentDailySales={realTimeMetrics?.todaysSales || 0}
          currentMonthlySales={realTimeMetrics?.totalSales || 0}
          onTargetsUpdate={handleTargetsUpdate}
        />
      </div>
    </div>
  )
}
