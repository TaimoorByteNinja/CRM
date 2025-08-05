"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shirt, Palette, Ruler, TrendingUp, Download, CheckCircle, Smartphone, Shield, Clock } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function ClothingPage() {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsDownloading(false)
  }

  const features = [
    {
      icon: <Shirt className="h-6 w-6" />,
      title: "Apparel Catalog",
      description: "Comprehensive product catalog with sizes, colors, and variants",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Style Management",
      description: "Manage collections, seasons, and fashion trends effectively",
    },
    {
      icon: <Ruler className="h-6 w-6" />,
      title: "Size & Fit Tracking",
      description: "Complete size chart management and fit recommendations",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Fashion Analytics",
      description: "Track trends, bestsellers, and seasonal performance",
    },
  ]

  const benefits = [
    "Multi-Size Management",
    "Color Variant Tracking",
    "Seasonal Collections",
    "Supplier Management",
    "Fashion Trends Analysis",
    "Online Store Integration",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      <Navigation />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Fashion-Forward <span className="text-cyan-600">Apparel Management</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Comprehensive clothing and apparel management system with size variants, color tracking, and fashion
              analytics designed for modern fashion retailers.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">Mobile Commerce</span>
              </div>
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-500" />
                <span className="text-gray-700">Style Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Secure Transactions</span>
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
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Clothing System
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <img
                src="/clothing.jpg?height=400&width=600"
                alt="Clothing Dashboard"
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
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Fashion Features</h3>
            <p className="text-xl text-gray-600">Specialized tools for fashion retail</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-100 rounded-lg mb-4 group-hover:bg-cyan-200 transition-colors">
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
          <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Why Choose Our Clothing System?</h3>
              <p className="text-xl opacity-90">Designed for fashion professionals</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-cyan-300 flex-shrink-0" />
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
                className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-600 mr-2"></div>
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
