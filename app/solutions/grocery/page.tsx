"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Truck, Users, BarChart3, Download, CheckCircle, Smartphone, Shield, Clock } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function GroceryPage() {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsDownloading(false)
  }

  const features = [
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      title: "Product Management",
      description: "Manage fresh produce, packaged goods with expiry tracking",
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Delivery Management",
      description: "Home delivery tracking with route optimization",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Customer Orders",
      description: "Online ordering system with customer management",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Sales Analytics",
      description: "Track bestsellers, seasonal trends, and profit margins",
    },
  ]

  const benefits = [
    "Fresh Produce Tracking",
    "Home Delivery System",
    "Loyalty Programs",
    "Supplier Management",
    "Expiry Date Alerts",
    "Mobile App Integration",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Navigation />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Modernize Your <span className="text-blue-600">Grocery Business</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Comprehensive grocery management system with fresh produce tracking, delivery management, and customer
              ordering features designed for modern grocery stores and supermarkets.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">Mobile Orders</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Home Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <span className="text-gray-700">Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-gray-700">24/7 Support</span>
              </div>
            </div>

            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Grocery System
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <img
                src="/grocery.jpg?height=400&width=600"
                alt="Grocery Dashboard"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/50 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Grocery Features</h3>
            <p className="text-xl text-gray-600">Specialized tools for grocery business management</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                    {feature.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Why Choose Our Grocery System?</h3>
              <p className="text-xl opacity-90">Perfect for modern grocery businesses</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-300 flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Get Started Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
