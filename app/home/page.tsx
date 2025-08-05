"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import {
  Package,
  BarChart3,
  AlertTriangle,
  Truck,
  QrCode,
  Users,
  FileText,
  TrendingUp,
  Shield,
  Smartphone,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Zap,
  Award,
  Target,
  MapPin,
  RefreshCw,
  Clock,
  Database,
  Wifi,
  Lock,
  Briefcase,
  Receipt,
  ShoppingBag,
  FileCheck,
  ScanLine,
  Store,
  ShoppingCart,
  Diamond,
  Cross,
  Utensils,
  Shirt,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [solutionsModalOpen, setSolutionsModalOpen] = useState(false)
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/login")
  }

  const businessSolutions = [
    { icon: Briefcase, title: "Accounting", color: "bg-orange-100 text-orange-600" },
    { icon: Package, title: "Inventory", color: "bg-green-100 text-green-600" },
    { icon: Receipt, title: "Invoicing", color: "bg-purple-100 text-purple-600" },
    { icon: FileCheck, title: "E-Invoice", color: "bg-blue-100 text-blue-600" },
    { icon: ShoppingBag, title: "POS", color: "bg-yellow-100 text-yellow-600" },
    { icon: ScanLine, title: "OCR", color: "bg-gray-100 text-gray-600" },
  ]

  const industrySolutions = [
    { icon: Store, title: "Retail", color: "bg-red-100 text-red-600" },
    { icon: Cross, title: "Pharmacy", color: "bg-green-100 text-green-600" },
    { icon: ShoppingCart, title: "Grocery", color: "bg-blue-100 text-blue-600" },
    { icon: Utensils, title: "Restaurant", color: "bg-purple-100 text-purple-600" },
    { icon: Diamond, title: "Jewellery", color: "bg-yellow-100 text-yellow-600" },
    { icon: Shirt, title: "Clothing/Apparel", color: "bg-cyan-100 text-cyan-600" },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Solutions Modal */}
      {solutionsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Solutions</h2>
                <button
                  onClick={() => setSolutionsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-500 text-xl">×</span>
                </button>
              </div>

              {/* Content */}
              <div className="grid md:grid-cols-2 gap-12">
                {/* Business Management Solutions */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Business Management Solutions</h3>
                  <div className="space-y-4">
                    {businessSolutions.map((solution, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${solution.color}`}>
                          <solution.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-900">{solution.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Industry Solutions */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Industry Solution</h3>
                  <div className="space-y-4">
                    {industrySolutions.map((solution, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${solution.color}`}>
                          <solution.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-900">{solution.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4 mr-2" />
                #1 Management System Worldwide
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Smart Inventory 
                <br />
                <span className="text-blue-600">Management System</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Take full control of your inventory with real-time tracking, automated alerts, and powerful analytics. Trusted by over 50,000 businesses worldwide to streamline stock management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
                {/* <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-lg bg-transparent"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button> */}
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Free trial for 7 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Setup in 5 seconds</span>
                </div>
              </div>
            </div>

            {/* Right Content - Inventory Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Inventory Dashboard</h3>
                  <Badge className="bg-green-100 text-green-700">Live Data</Badge>
                </div>

                {/* Inventory Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">2,847</div>
                    <div className="text-sm text-gray-600">Total Products</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$12.4</div>
                    <div className="text-sm text-gray-600">Stock Value</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">23</div>
                    <div className="text-sm text-gray-600">Low Stock</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">156</div>
                    <div className="text-sm text-gray-600">Suppliers</div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Stock Added</span>
                        <div className="text-xs text-gray-500">iPhone 16 Pro - 50 units</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">2m ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Low Stock Alert</span>
                        <div className="text-xs text-gray-500">Samsung Galaxy S24 - 5 left</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">5m ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Complete Inventory Control at Your Fingertips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From stock tracking to supplier management, our comprehensive system handles every aspect of your
              inventory
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                title: "Real-Time Stock Tracking",
                description:
                  "Monitor stock levels in real-time across all locations with automatic updates and instant visibility.",
                color: "blue",
              },
              {
                icon: AlertTriangle,
                title: "Smart Stock Alerts",
                description:
                  "Get automated notifications for low stock, overstock, and reorder points to prevent stockouts.",
                color: "orange",
              },
              {
                icon: QrCode,
                title: "Barcode & QR Scanning",
                description: "Scan products instantly for quick stock updates, transfers, and inventory audits.",
                color: "green",
              },
              {
                icon: MapPin,
                title: "Multi-Location Management",
                description:
                  "Manage inventory across multiple warehouses, stores, and locations from a single dashboard.",
                color: "purple",
              },
              {
                icon: Truck,
                title: "Purchase Order Management",
                description: "Create, track, and manage purchase orders with automated supplier communications.",
                color: "indigo",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description:
                  "Get detailed insights on stock movement, turnover rates, and inventory performance metrics.",
                color: "red",
              },
              {
                icon: Users,
                title: "Supplier Management",
                description:
                  "Maintain comprehensive supplier database with contact details, pricing, and performance tracking.",
                color: "teal",
              },
              {
                icon: RefreshCw,
                title: "Automated Reordering",
                description: "Set up automatic reorder points and let the system handle purchase orders for you.",
                color: "cyan",
              },
              {
                icon: FileText,
                title: "Detailed Reporting",
                description: "Generate comprehensive reports on stock levels, movements, valuations, and trends.",
                color: "pink",
              },
            ].map((feature, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-6`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Why 50,000+ Businesses Trust CraftCRM</h2>
            <p className="text-xl text-gray-600">Join the fastest growing inventory management platform in Pakistan</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Reduce Costs by 30%",
                description: "Optimize stock levels and reduce carrying costs with smart inventory management",
                stat: "30% Cost Reduction",
              },
              {
                icon: Shield,
                title: "99.9% Accuracy",
                description: "Maintain accurate stock records with automated tracking and real-time updates",
                stat: "99.9% Accuracy",
              },
              {
                icon: Target,
                title: "Zero Stockouts",
                description: "Prevent stockouts with intelligent forecasting and automated reorder alerts",
                stat: "0% Stockouts",
              },
              {
                icon: Smartphone,
                title: "Mobile Access",
                description: "Manage inventory on the go with our powerful mobile app for Android and iOS",
                stat: "24/7 Access",
              },
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 mb-4">{benefit.description}</p>
                <div className="text-2xl font-bold text-blue-600">{benefit.stat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Get Started in 3 Simple Steps</h2>
            <p className="text-xl text-gray-600">Set up your inventory management system in minutes, not days</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Import Your Products",
                description:
                  "Upload your existing product catalog via CSV or add products manually with our easy-to-use interface.",
                icon: Package,
              },
              {
                step: "02",
                title: "Set Stock Levels",
                description:
                  "Configure current stock quantities, reorder points, and maximum stock levels for each product.",
                icon: BarChart3,
              },
              {
                step: "03",
                title: "Start Tracking",
                description: "Begin real-time inventory tracking with automated alerts and comprehensive reporting.",
                icon: TrendingUp,
              },
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                {index < 2 && <ArrowRight className="hidden md:block absolute top-10 -right-4 w-8 h-8 text-gray-300" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Advanced Features for Modern Businesses
            </h2>
            <p className="text-xl text-gray-600">Powerful tools designed to scale with your growing business</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Features list */}
            <div className="space-y-8">
              {[
                {
                  icon: Database,
                  title: "Cloud-Based Storage",
                  description: "Secure cloud storage with automatic backups and 99.9% uptime guarantee.",
                },
                {
                  icon: Wifi,
                  title: "Real-Time Sync",
                  description: "Instant synchronization across all devices and locations in real-time.",
                },
                {
                  icon: Lock,
                  title: "Enterprise Security",
                  description: "Bank-grade security with SSL encryption and role-based access control.",
                },
                {
                  icon: Clock,
                  title: "Automated Workflows",
                  description: "Set up custom workflows to automate repetitive inventory management tasks.",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right side - Feature showcase */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Inventory Analytics Dashboard</h3>

              {/* Mock analytics data */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Stock Turnover Rate</span>
                  <span className="font-bold text-green-600">+15.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Inventory Accuracy</span>
                  <span className="font-bold text-blue-600">99.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "99%" }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cost Reduction</span>
                  <span className="font-bold text-purple-600">-28.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Performance Insight</span>
                </div>
                <p className="text-blue-800 text-sm">
                  Your inventory efficiency has improved by 32% this month compared to last month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Real stories from real business owners</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Rajesh Kumar",
                business: "Kumar Electronics, Delhi",
                content:
                  "CraftCRM transformed our electronics business. We reduced stockouts by 95% and cut inventory costs by 25%. The real-time tracking is a game-changer!",
                rating: 5,
                image: "/placeholder.svg?height=60&width=60&text=RK",
              },
              {
                name: "Priya Sharma",
                business: "Sharma Textiles, Mumbai",
                content:
                  "Managing inventory across 5 locations was a nightmare before CraftCRM. Now everything is automated and we have complete visibility of our stock.",
                rating: 5,
                image: "/placeholder.svg?height=60&width=60&text=PS",
              },
              {
                name: "Amit Patel",
                business: "Patel Trading Co., Ahmedabad",
                content:
                  "The barcode scanning feature saves us hours every day. Stock updates are instant and accurate. Best investment we've made for our business!",
                rating: 5,
                image: "/placeholder.svg?height=60&width=60&text=AP",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-600 text-sm">{testimonial.business}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section id="pricing" className="py-16 lg:py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that's right for your inventory needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "Forever",
                description: "Perfect for small businesses with basic inventory needs",
                features: [
                  "Up to 100 products",
                  "Basic stock tracking",
                  "Low stock alerts",
                  "Mobile app access",
                  "Email support",
                ],
                cta: "Start Free",
                popular: false,
              },
              {
                name: "Professional",
                price: "₹1,499",
                period: "per month",
                description: "Best for growing businesses with advanced inventory needs",
                features: [
                  "Unlimited products",
                  "Multi-location support",
                  "Barcode scanning",
                  "Advanced reporting",
                  "Purchase order management",
                  "Priority support",
                ],
                cta: "Start Free Trial",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "₹3,999",
                period: "per month",
                description: "For large businesses with complex inventory requirements",
                features: [
                  "Everything in Professional",
                  "Custom integrations",
                  "Advanced analytics",
                  "Dedicated support",
                  "API access",
                  "Custom workflows",
                ],
                cta: "Contact Sales",
                popular: false,
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`border-2 ${plan.popular ? "border-blue-500 shadow-lg" : "border-gray-200"} relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.price !== "Free" && <span className="text-gray-600 ml-2">{plan.period}</span>}
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                    onClick={handleGetStarted}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Inventory Management?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join over 50,000 businesses already using CraftCRM to optimize their stock management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg font-semibold rounded-lg shadow-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            {/* <Button
              size="lg"
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-4 text-lg font-semibold rounded-lg bg-transparent"
            >
              Schedule a Demo
            </Button> */}
          </div>
          <p className="text-gray-500">No credit card required • 7-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">CraftCRM</span>
              </div>
              <p className="text-gray-400 mb-6">
                Smart inventory management solution trusted by over 50,000 businesses across Pakistan.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Mobile App</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Integrations</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">API</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <span className="hover:text-white cursor-pointer">Help Center</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Contact Support</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Training</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Community</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">System Status</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <span className="hover:text-white cursor-pointer">About Us</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Careers</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Blog</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Press</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Partners</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">© 2024 CraftCRM. All rights reserved.</p>
              <div className="flex space-x-6 text-gray-400">
                <span className="hover:text-white cursor-pointer">Privacy Policy</span>
                <span className="hover:text-white cursor-pointer">Terms of Service</span>
                <span className="hover:text-white cursor-pointer">Security</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
