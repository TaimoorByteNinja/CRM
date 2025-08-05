"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileCheck, Shield, Zap, Globe, Download, CheckCircle, Clock, Award, Lock } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function EInvoicePage() {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsDownloading(false)
  }

  const features = [
    {
      icon: <FileCheck className="h-6 w-6" />,
      title: "E-Invoice Generation",
      description: "Generate GST compliant e-invoices as per government standards",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Government Integration",
      description: "Direct integration with GST portal and e-invoice system",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Bulk Processing",
      description: "Process multiple invoices simultaneously with bulk upload",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "API Integration",
      description: "Seamless integration with existing ERP and accounting systems",
    },
  ]

  const benefits = [
    "GST Portal Integration",
    "IRN Generation",
    "QR Code Generation",
    "Bulk Invoice Processing",
    "Error Validation",
    "Compliance Reports",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Government Compliant <span className="text-blue-600">E-Invoice System</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Complete e-invoicing solution with direct GST portal integration. Generate IRN, QR codes, and maintain
              full compliance with government e-invoice regulations.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Government Approved</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">Secure Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="text-gray-700">Fast Generation</span>
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
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download E-Invoice System
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <img
                src="/e-invoicing.jpg?height=400&width=600"
                alt="E-Invoice Dashboard"
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
            <h3 className="text-3xl font-bold text-gray-900 mb-4">E-Invoice Features</h3>
            <p className="text-xl text-gray-600">Complete compliance and automation</p>
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Why Choose Our E-Invoice System?</h3>
              <p className="text-xl opacity-90">Stay compliant with government regulations</p>
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
