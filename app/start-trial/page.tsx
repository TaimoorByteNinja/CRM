"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  CheckCircle,
  Clock,
  Globe,
  Mail,
  Package,
  Phone,
  Shield,
  Smartphone,
  TrendingUp,
  User,
  Users,
  Zap
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function StartTrialPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    teamSize: "",
    useCase: "",
  })
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const router = useRouter()

  const benefits = [
    {
      icon: Zap,
      title: "Instant Setup",
      description: "Get your management system  running in under 5 minutes",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and data protection",
    },
    {
      icon: Clock,
      title: "14-Day Free Trial",
      description: "Full access to all features, no credit card required",
    },
    {
      icon: Users,
      title: "Unlimited Products",
      description: "Add unlimited products and manage multiple locations",
    },
  ]

  const features = [
    "Real-time stock tracking",
    "Smart stock alerts & notifications",
    "Barcode & QR scanning",
    "Multi-location management",
    "Purchase order automation",
    "Advanced analytics dashboard",
    "Mobile apps (iOS & Android)",
    "24/7 priority support",
  ]

  const teamSizes = [
    "Just me (1)",
    "Small team (2-10)",
    "Medium team (11-50)",
    "Large team (51-200)",
    "Enterprise (200+)",
  ]

  const useCases = [
    "Inventory Management",
    "Stock Tracking",
    "Purchase Management",
    "Multi-location Operations",
    "Supplier Management",
    "Other",
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    window.location.href = "/businesshub";
    e.preventDefault()
    setShowSuccessModal(true)
  }

  const handleStartTrial = () => {
    window.location.href = "/businesshub";
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to CraftCRM!</h2>
              <p className="text-gray-600 mb-6">
                Your free trial has been activated. You now have full access to all features for 14 days.
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleStartTrial} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Access Your Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSuccessModal(false)}
                  className="border-gray-300 text-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CraftCRM</span>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Benefits & Features */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  <Award className="w-4 h-4 mr-2" />
                  Start Your Free Trial Today
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Transform Your
                  <br />
                  <span className="text-blue-600">Inventory Management</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join thousands of businesses who've optimized their inventory with CraftCRM. No credit card required,
                  full access to all features for 14 days.
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                          <p className="text-sm text-gray-600">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Features List */}
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Everything included in your trial
                  </h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Proof */}
              {/* <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <img
                        key={i}
                        src={`/placeholder.svg?height=40&width=40&text=U${i}`}
                        alt={`User ${i}`}
                        className="w-10 h-10 rounded-full border-2 border-white"
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Trusted by 50,000+ businesses</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "CraftCRM helped us reduce inventory costs by 30% and eliminate stockouts completely. The setup was
                  incredibly easy!"
                </p>
                <p className="text-sm text-gray-500 mt-2">- Sarah Johnson, Operations Manager</p>
              </div> */}
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="relative">
              <Card className="bg-white border border-gray-200 shadow-2xl rounded-2xl">
                <CardContent className="p-8">
                  {/* Progress Indicator */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        Step {currentStep} of {totalSteps}
                      </span>
                      <span className="text-sm text-gray-500">
                        {Math.round((currentStep / totalSteps) * 100)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's get started</h2>
                          <p className="text-gray-600">Tell us a bit about yourself</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-gray-700">
                              First Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <Input
                                id="firstName"
                                type="text"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-gray-700">
                              Last Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <Input
                                id="lastName"
                                type="text"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-700">
                            Work Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="john@company.com"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Company Information */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">About your company</h2>
                          <p className="text-gray-600">Help us customize your experience</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company" className="text-gray-700">
                            Company Name
                          </Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="company"
                              type="text"
                              placeholder="Acme Corp"
                              value={formData.company}
                              onChange={(e) => handleInputChange("company", e.target.value)}
                              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-gray-700">
                            Phone Number (Optional)
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+92 300 1234567"
                              value={formData.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">Team Size</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {teamSizes.map((size, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleInputChange("teamSize", size)}
                                className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                                  formData.teamSize === size
                                    ? "bg-blue-50 border-blue-500 text-blue-700"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Use Case */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">How will you use CraftCRM?</h2>
                          <p className="text-gray-600">This helps us set up your workspace</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">Primary Use Case</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {useCases.map((useCase, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleInputChange("useCase", useCase)}
                                className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                                  formData.useCase === useCase
                                    ? "bg-blue-50 border-blue-500 text-blue-700"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {useCase}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Final CTA */}
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-green-900">Ready to launch!</h3>
                                <p className="text-sm text-green-700">Your management system  will be set up instantly</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-6">
                      {currentStep > 1 ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                        >
                          Back
                        </Button>
                      ) : (
                        <div></div>
                      )}

                      {currentStep < totalSteps ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold"
                          disabled={
                            (currentStep === 1 && (!formData.firstName || !formData.lastName || !formData.email)) ||
                            (currentStep === 2 && (!formData.company || !formData.teamSize))
                          }
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="bg-green-600 hover:bg-green-700 text-white px-8 font-semibold"
                          onClick={handleSubmit}
                          disabled={!formData.useCase}
                          
                        >
                          Download Now
                          <Zap className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </form>

                  {/* Trust Indicators */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3" />
                        <span>SSL Secured</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>GDPR Compliant</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>No Credit Card</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, stat: "50,000+", label: "Active Users" },
              { icon: TrendingUp, stat: "30%", label: "Cost Reduction" },
              { icon: BarChart3, stat: "99.9%", label: "Uptime" },
              { icon: Smartphone, stat: "24/7", label: "Support" },
            ].map((item, index) => (
              <div key={index} className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <item.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{item.stat}</div>
                  <div className="text-gray-600">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
