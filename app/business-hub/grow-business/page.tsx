"use client"

import { useState } from "react"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Target,
  Users,
  DollarSign,
  ShoppingCart,
  Package,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Settings,
  Lightbulb,
  Star,
  Award,
  Zap,
} from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectDashboardMetrics } from "@/lib/store/slices/dashboardSlice"
import { showNotification } from "@/lib/store/slices/uiSlice"

export default function GrowBusinessPage() {
  const dispatch = useAppDispatch()
  const dashboardStats = useAppSelector(selectDashboardMetrics)
  const [activeTab, setActiveTab] = useState("grow-business")
  const [selectedGoal, setSelectedGoal] = useState("revenue")
  const [goalValue, setGoalValue] = useState("")
  const [timeframe, setTimeframe] = useState("3months")

  // Business growth goals
  const growthGoals = [
    {
      id: "revenue",
      title: "Increase Revenue",
      icon: DollarSign,
      current: dashboardStats.totalRevenue,
      target: 500000,
      progress: (dashboardStats.totalRevenue / 500000) * 100,
      suggestions: [
        "Expand product catalog",
        "Implement upselling strategies",
        "Launch promotional campaigns",
        "Improve customer retention",
      ],
    },
    {
      id: "customers",
      title: "Grow Customer Base",
      icon: Users,
      current: dashboardStats.totalCustomers,
      target: 1000,
      progress: (dashboardStats.totalCustomers / 1000) * 100,
      suggestions: [
        "Improve marketing campaigns",
        "Enhance customer service",
        "Implement referral programs",
        "Expand to new markets",
      ],
    },
    {
      id: "orders",
      title: "Increase Order Volume",
      icon: ShoppingCart,
      current: dashboardStats.totalOrders,
      target: 500,
      progress: (dashboardStats.totalOrders / 500) * 100,
      suggestions: [
        "Optimize pricing strategy",
        "Improve website conversion",
        "Enhance product descriptions",
        "Implement loyalty programs",
      ],
    },
    {
      id: "inventory",
      title: "Optimize Inventory",
      icon: Package,
      current: dashboardStats.totalItems,
      target: 200,
      progress: (dashboardStats.totalItems / 200) * 100,
      suggestions: [
        "Analyze sales patterns",
        "Implement just-in-time inventory",
        "Negotiate better supplier terms",
        "Reduce carrying costs",
      ],
    },
  ]

  const handleSetGoal = () => {
    if (!goalValue) {
      dispatch(showNotification({ message: "Please enter a goal value", type: "error" }))
      return
    }
    
    dispatch(showNotification({ 
      message: `Goal set successfully! Target: ${goalValue} in ${timeframe}`, 
      type: "success" 
    }))
    setGoalValue("")
  }

  const handleActionClick = (action: string) => {
    dispatch(showNotification({ 
      message: `Action initiated: ${action}`, 
      type: "success" 
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="ml-16 flex flex-col min-h-screen">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    Grow Your Business
                  </h1>
                  <p className="text-gray-600">Set goals, track progress, and scale your business</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <Target className="h-4 w-4 mr-2" />
                  Set New Goal
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Growth Goals */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Business Growth Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {growthGoals.map((goal) => (
                    <div key={goal.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                            <goal.icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                            <p className="text-sm text-gray-600">
                              Current: {goal.current.toLocaleString()} | Target: {goal.target.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={goal.progress >= 100 ? "default" : "secondary"}
                          className="px-3 py-1"
                        >
                          {goal.progress.toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={Math.min(goal.progress, 100)} className="h-2" />
                      
                      <div className="grid grid-cols-2 gap-3">
                        {goal.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="justify-start text-left h-auto p-3"
                            onClick={() => handleActionClick(suggestion)}
                          >
                            <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                            <span className="text-sm">{suggestion}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {dashboardStats.profitMargin.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-700">Profit Margin</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {dashboardStats.totalRevenue > 0 ? (dashboardStats.totalRevenue / dashboardStats.totalCustomers).toFixed(0) : 0}
                      </div>
                      <div className="text-sm text-blue-700">Avg. Customer Value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Actions & Tips */}
            <div className="space-y-6">
              {/* Set New Goal */}
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">Set New Goal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Goal Type</Label>
                    <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="customers">Customers</SelectItem>
                        <SelectItem value="orders">Orders</SelectItem>
                        <SelectItem value="inventory">Inventory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Value</Label>
                    <Input
                      placeholder="Enter target value"
                      value={goalValue}
                      onChange={(e) => setGoalValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Timeframe</Label>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1month">1 Month</SelectItem>
                        <SelectItem value="3months">3 Months</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSetGoal} className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Set Goal
                  </Button>
                </CardContent>
              </Card>

              {/* Growth Tips */}
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    Growth Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Focus on Customer Retention</p>
                      <p className="text-xs text-gray-600">Existing customers are 5x more valuable than new ones</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Optimize Your Pricing</p>
                      <p className="text-xs text-gray-600">Small price increases can significantly boost profits</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <Award className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Build Brand Loyalty</p>
                      <p className="text-xs text-gray-600">Loyal customers spend 67% more than new customers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleActionClick("Launch Marketing Campaign")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Launch Marketing Campaign
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleActionClick("Analyze Sales Data")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze Sales Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleActionClick("Update Pricing Strategy")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Update Pricing Strategy
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
