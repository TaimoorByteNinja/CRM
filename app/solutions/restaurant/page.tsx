"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Utensils, Clock, Users, ChefHat, Download, CheckCircle, Smartphone, Shield, Star } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function RestaurantPage() {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsDownloading(false)
  }

  const features = [
    {
      icon: <Utensils className="h-6 w-6" />,
      title: "Menu Management",
      description: "Digital menu with categories, pricing, and availability tracking",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Order Management",
      description: "Kitchen display system with order timing and status tracking",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Table Management",
      description: "Reservation system with table allocation and customer management",
    },
    {
      icon: <ChefHat className="h-6 w-6" />,
      title: "Kitchen Operations",
      description: "Recipe management, ingredient tracking, and kitchen workflow",
    },
  ]

  const benefits = [
    "Digital Menu Management",
    "Online Ordering System",
    "Table Reservations",
    "Kitchen Display System",
    "Staff Management",
    "Customer Feedback",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navigation />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Elevate Your <span className="text-purple-600">Restaurant Operations</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Comprehensive restaurant management system with menu management, order processing, table reservations, and
              kitchen operations designed for modern food service businesses.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">Mobile Orders</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Real-time Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <span className="text-gray-700">Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-orange-500" />
                <span className="text-gray-700">Customer Reviews</span>
              </div>
            </div>

            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Restaurant System
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <img
                src="/resturant.jpg?height=400&width=600"
                alt="Restaurant Dashboard"
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
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Restaurant Features</h3>
            <p className="text-xl text-gray-600">Everything you need to run a successful restaurant</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors">
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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Why Choose Our Restaurant System?</h3>
              <p className="text-xl opacity-90">Designed for modern food service operations</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-purple-300 flex-shrink-0" />
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
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-2"></div>
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
