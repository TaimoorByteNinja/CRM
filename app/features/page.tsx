"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import NextLink from "next/link"
import {
  Package,
  BarChart3,
  AlertTriangle,
  Truck,
  QrCode,
  Users,
  FileText,
  TrendingUp,
  Smartphone,
  CheckCircle,
  Zap,
  MapPin,
  RefreshCw,
  Database,
  Wifi,
  Lock,
  CreditCard,
  Globe,
  Settings,
  Bell,
  Download,
  Calendar,
  Mail,
  Building2,
} from "lucide-react"
import Link from "next/link"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-blue-100 text-blue-800 mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Complete Feature Set
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Powerful Features for
              <br />
              <span className="text-blue-600">Modern Businesses</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Discover all the tools and capabilities that make CraftCRM the most comprehensive inventory management
              solution for businesses of all sizes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg"
              >
                <Link href="/start-trial">
                  <Zap className="w-5 h-5 mr-2" />
                  Get started
                </Link>
              </Button>
              {/* <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-lg bg-transparent"
              >
                Schedule Demo
              </Button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Core Inventory Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your inventory efficiently and effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                title: "Real-Time Stock Tracking",
                description:
                  "Monitor stock levels in real-time across all locations with automatic updates and instant visibility into your inventory status.",
                features: ["Live stock updates", "Multi-location tracking", "Stock movement history", "Instant alerts"],
                color: "blue",
              },
              {
                icon: AlertTriangle,
                title: "Smart Stock Alerts",
                description:
                  "Get automated notifications for low stock, overstock, and reorder points to prevent stockouts and optimize inventory levels.",
                features: ["Low stock alerts", "Reorder notifications", "Overstock warnings", "Custom thresholds"],
                color: "orange",
              },
              {
                icon: QrCode,
                title: "Barcode & QR Scanning",
                description:
                  "Scan products instantly for quick stock updates, transfers, and inventory audits using mobile devices.",
                features: ["Mobile scanning", "Bulk updates", "Audit trails", "Custom barcodes"],
                color: "green",
              },
              {
                icon: MapPin,
                title: "Multi-Location Management",
                description:
                  "Manage inventory across multiple warehouses, stores, and locations from a single centralized dashboard.",
                features: ["Location tracking", "Transfer management", "Location-based reports", "Centralized control"],
                color: "purple",
              },
              {
                icon: Truck,
                title: "Purchase Order Management",
                description:
                  "Create, track, and manage purchase orders with automated supplier communications and delivery tracking.",
                features: ["PO creation", "Supplier integration", "Delivery tracking", "Automated workflows"],
                color: "indigo",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description:
                  "Get detailed insights on stock movement, turnover rates, and inventory performance with comprehensive analytics.",
                features: ["Performance metrics", "Trend analysis", "Custom reports", "Data visualization"],
                color: "red",
              },
            ].map((feature, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-6`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business Management Features */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Business Management Tools</h2>
            <p className="text-xl text-gray-600">Comprehensive tools to run your entire business operation</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "Customer Management",
                description: "Maintain detailed customer profiles, purchase history, and relationship management.",
                color: "teal",
              },
              {
                icon: FileText,
                title: "Invoice Generation",
                description: "Create professional invoices with automated calculations and payment tracking.",
                color: "blue",
              },
              {
                icon: CreditCard,
                title: "Payment Processing",
                description: "Handle payments, track receivables, and manage financial transactions.",
                color: "green",
              },
              {
                icon: TrendingUp,
                title: "Sales Analytics",
                description: "Track sales performance, identify trends, and optimize revenue generation.",
                color: "purple",
              },
              {
                icon: Building2,
                title: "Supplier Management",
                description: "Maintain supplier database with contact details, pricing, and performance tracking.",
                color: "orange",
              },
              {
                icon: RefreshCw,
                title: "Automated Workflows",
                description: "Set up custom workflows to automate repetitive business processes.",
                color: "indigo",
              },
              {
                icon: Calendar,
                title: "Order Scheduling",
                description: "Schedule and manage orders with delivery dates and customer requirements.",
                color: "pink",
              },
              {
                icon: Settings,
                title: "System Configuration",
                description: "Customize the system to match your business processes and requirements.",
                color: "gray",
              },
            ].map((feature, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Features */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Advanced Technology</h2>
            <p className="text-xl text-gray-600">Built with modern technology for reliability and performance</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Features list */}
            <div className="space-y-8">
              {[
                {
                  icon: Database,
                  title: "Cloud-Based Storage",
                  description:
                    "Secure cloud storage with automatic backups, 99.9% uptime guarantee, and unlimited data retention.",
                  features: ["Automatic backups", "99.9% uptime", "Unlimited storage", "Data encryption"],
                },
                {
                  icon: Wifi,
                  title: "Real-Time Synchronization",
                  description: "Instant synchronization across all devices and locations with real-time data updates.",
                  features: ["Instant sync", "Multi-device access", "Offline capability", "Conflict resolution"],
                },
                {
                  icon: Lock,
                  title: "Enterprise Security",
                  description: "Bank-grade security with SSL encryption, role-based access control, and audit trails.",
                  features: ["SSL encryption", "Role-based access", "Audit trails", "Data privacy"],
                },
                {
                  icon: Smartphone,
                  title: "Mobile Applications",
                  description:
                    "Native mobile apps for iOS and Android with full functionality and offline capabilities.",
                  features: ["iOS & Android apps", "Offline mode", "Push notifications", "Mobile scanning"],
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {feature.features.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right side - Technology showcase */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">System Capabilities</h3>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">System Performance</span>
                    <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Data Security</span>
                    <Badge className="bg-blue-100 text-blue-700">Bank-Grade</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Uptime Guarantee</span>
                    <Badge className="bg-purple-100 text-purple-700">99.9%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: "99%" }}></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Mobile Compatibility</span>
                    <Badge className="bg-orange-100 text-orange-700">Full Support</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">50K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">10M+</div>
                  <div className="text-sm text-gray-600">Transactions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Features */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Integrations & Connectivity</h2>
            <p className="text-xl text-gray-600">Connect with your existing tools and systems seamlessly</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "E-commerce Integration",
                description: "Connect with popular e-commerce platforms like Shopify, WooCommerce, and Amazon.",
                color: "blue",
              },
              {
                icon: Mail,
                title: "Email Marketing",
                description: "Integrate with email marketing tools for customer communication and campaigns.",
                color: "green",
              },
              {
                icon: CreditCard,
                title: "Payment Gateways",
                description: "Support for multiple payment gateways including PayPal, Stripe, and local banks.",
                color: "purple",
              },
              {
                icon: FileText,
                title: "Accounting Software",
                description: "Sync with popular accounting software like QuickBooks, Xero, and Tally.",
                color: "orange",
              },
              {
                icon: Download,
                title: "Data Import/Export",
                description: "Easy data migration with CSV, Excel, and API-based import/export capabilities.",
                color: "indigo",
              },
              {
                icon: Bell,
                title: "Notification Systems",
                description: "Integration with SMS, WhatsApp, and push notification services.",
                color: "red",
              },
            ].map((feature, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}
                  >
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Ready to Experience All Features?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your free trial today and discover how CraftCRM can transform your business operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold rounded-lg"
            >
              <Link href="/start-trial">
                <Zap className="w-5 h-5 mr-2" />
                Get started
              </Link>
            </Button>
            {/* <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 text-lg font-semibold rounded-lg bg-transparent"
            >
              Schedule a Demo
            </Button> */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <NextLink href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-12"></div>
                      </div>
                      <span className="text-xl font-bold text-white">CraftCRM</span>
              </NextLink>
              <p className="text-gray-400 mb-6">
                Smart inventory management solution trusted by over 50,000 businesses across Pakistan.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Mobile App</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Integrations</span>
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
                  <span className="hover:text-white cursor-pointer">Contact</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">© 2024 CraftCRM. All rights reserved</p>
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
