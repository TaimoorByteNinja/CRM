"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Navigation } from "@/components/navigation"
import {
  Sparkles,
  Check,
  ArrowRight,
  Zap,
  Crown,
  Building2,
  Users,
  Star,
  Link,
  ChevronDown,
  Shield,
  Clock,
  Headphones,
  RefreshCw,
} from "lucide-react"
import { useState, useEffect } from "react"
import NextLink from "next/link"
import { useTrialManagement } from "@/hooks/use-trial-management"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState("1-year")
  const [selectedDevice, setSelectedDevice] = useState("desktop-mobile")
  const [isDurationDropdownOpen, setIsDurationDropdownOpen] = useState(false)
  const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false)
  const [isActivating, setIsActivating] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    trialInfo,
    subscriptionInfo,
    getAccessStatus,
    activatePremium
  } = useTrialManagement()
  const { user } = useAuth()

  // Check if user came from trial expiry
  const fromTrial = searchParams.get('from') === 'trial'

  useEffect(() => {
    if (fromTrial && trialInfo) {
      // Show a welcome message or highlight for trial users
      console.log('User came from trial expiry')
    }
  }, [fromTrial, trialInfo])

  // If user just logged in and had a pending plan, resume checkout
  useEffect(() => {
    const resumeCheckout = async () => {
      try {
        const pending = sessionStorage.getItem('craftcrm_pending_plan')
        if (!pending || !user) return
        const { planId, planName, amount } = JSON.parse(pending)
        sessionStorage.removeItem('craftcrm_pending_plan')
        const res = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId, planName, amount }),
        })
        if (!res.ok) return
        const data = await res.json()
        if (data.url) window.location.href = data.url as string
      } catch (e) {
        console.error('Failed to resume checkout:', e)
      }
    }
    resumeCheckout()
  }, [user])

  // Handle plan activation via Stripe Checkout
  const handlePlanActivation = async (planId: string, planName: string) => {
    setIsActivating(true)
    setSelectedPlan(planId)

    try {
      const selected = plans.find(p => p.id === planId)
      const amount = selected ? calculatePrice(selected.annualPrice) : 0

      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, planName, amount }),
      })

      if (res.status === 401) {
        // Persist intent and redirect to login
        sessionStorage.setItem('craftcrm_pending_plan', JSON.stringify({ planId, planName, amount }))
        router.push('/login?redirect=/pricing')
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url as string
        return
      }
      throw new Error('Invalid checkout session response')
    } catch (error) {
      console.error('Failed to start checkout:', error)
      alert('❌ Could not start checkout. Please try again.')
    } finally {
      setIsActivating(false)
      setSelectedPlan(null)
    }
  }

  // Duration and device options
  const durationOptions = [
    { label: "1-year", display: "1 Year", multiplier: 1 },
    { label: "3-year", display: "3 Years", multiplier: 2.5 }
  ]

  const deviceOptions = [
    { label: "desktop-mobile", display: "Desktop + Mobile", discount: 0 },
    { label: "desktop", display: "Desktop Only", discount: 0.2 },
    { label: "mobile", display: "Mobile Only", discount: 0.2 }
  ]

  // Calculate prices based on selected duration and device
  const calculatePrice = (basePrice: number) => {
    const durationMultiplier = durationOptions.find(opt => opt.label === selectedDuration)?.multiplier || 1
    const deviceDiscount = deviceOptions.find(opt => opt.label === selectedDevice)?.discount || 0
    return basePrice * durationMultiplier * (1 - deviceDiscount)
  }

  const calculateOriginalPrice = (originalPrice: number) => {
    const durationMultiplier = durationOptions.find(opt => opt.label === selectedDuration)?.multiplier || 1
    const deviceDiscount = deviceOptions.find(opt => opt.label === selectedDevice)?.discount || 0
    return originalPrice * durationMultiplier * (1 - deviceDiscount)
  }

  const allFeatures = [
    "Sync data across devices",
    "Create multiple companies",
    "Remove advertisement on invoices",
    "Set multiple pricing for items",
    "Create Multiple Firms",
    "Advanced inventory management",
    "Multi-currency support",
    "Custom invoice templates",
    "Automated backup system",
    "Real-time data synchronization",
    "Advanced reporting dashboard",
    "Tax calculation automation",
    "Customer relationship management",
    "Supplier management system",
    "Purchase order management",
    "Sales order tracking",
    "Barcode scanning support",
    "Mobile app integration",
    "Cloud storage integration",
    "Email integration",
    "SMS notifications",
    "Payment gateway integration",
    "Bank reconciliation",
    "Financial reporting",
    "Profit & loss statements",
    "Balance sheet generation",
    "Cash flow management",
    "Budget planning tools",
    "Expense tracking",
    "Asset management",
    "Depreciation calculation",
    "Audit trail maintenance",
    "User role management",
  ]

  const plans = [
    {
      id: "silver",
      name: "Silver Plan",
      icon: Crown,
      description: "Perfect for small businesses",
      annualPrice: 79.99,
      originalPrice: 100,
      savings: "20% OFF",
      features: [
        "Sync data across devices",
        "Create multiple companies (3 companies)",
        "Remove advertisement on invoices",
        "Set multiple pricing for items",
        "Create Multiple Firms (3 firms)",
      ],
      missing: [
        "Keep different rates for each party",
        "Restore deleted transactions",
        "Partywise Profit and Loss Report",
        "Manage godowns & Transfer stock",
      ],
      popular: false,
      color: "from-gray-50 to-gray-100",
      buttonColor: "bg-gray-900 hover:bg-gray-800 text-white",
    },
    {
      id: "gold",
      name: "Gold Plan",
      icon: Crown,
      description: "Best for growing businesses",
      annualPrice: 119.99,
      originalPrice: 190,
      savings: "37% OFF",
      features: [
        "Sync data across devices",
        "Create multiple companies (unlimited)",
        "Remove advertisement on invoices",
        "Keep different rates for each party",
        "Restore deleted transactions",
        "Partywise Profit and Loss Report",
        "Create Multiple Firms (5 firms)",
        "Manage godowns & Transfer stock",
        "Set multiple pricing for items",
      ],
      missing: [],
      popular: true,
      color: "from-yellow-50 to-amber-50",
      buttonColor: "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white",
    },
  ]

  const faqs = [
    {
      question: "Can I start with the free trial?",
      answer: "Yes! We offer a 14-day free trial for all paid plans. No credit card required to get started.",
      icon: Clock,
    },
    {
      question: "Can I change my plan at any time?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the billing accordingly.",
      icon: RefreshCw,
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets.",
      icon: Shield,
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.",
      icon: Shield,
    },
    {
      question: "Is there a setup fee?",
      answer: "No, there are no setup fees or hidden charges. You only pay for your chosen plan.",
      icon: Star,
    },
    {
      question: "Do you provide training?",
      answer:
        "Yes, we provide comprehensive training materials, video tutorials, and live training sessions for Enterprise customers.",
      icon: Headphones,
    },
  ]

  const benefits = [
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Bank-grade security with 99.9% uptime guarantee",
    },
    {
      icon: Users,
      title: "10L+ Happy Users",
      description: "Trusted by over 10 lakh businesses across India",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round-the-clock customer support in multiple languages",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed with instant data synchronization",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Trial Status Banner */}
      {trialInfo && (
        <div className={`w-full py-3 px-4 ${
          subscriptionInfo?.isActive 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : trialInfo.isActive 
              ? trialInfo.daysRemaining <= 1 
                ? 'bg-gradient-to-r from-red-500 to-pink-600' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              : 'bg-gradient-to-r from-red-500 to-pink-600'
        } text-white`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {subscriptionInfo?.isActive ? (
                <Crown className="h-5 w-5" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
              <span className="font-medium">
                {subscriptionInfo?.isActive 
                  ? `Premium Active - ${subscriptionInfo.daysRemaining} days remaining`
                  : trialInfo.isActive 
                    ? `Free Trial - ${trialInfo.daysRemaining} day${trialInfo.daysRemaining !== 1 ? 's' : ''} remaining`
                    : 'Trial Expired - Upgrade to continue'
                }
              </span>
            </div>
            {fromTrial && (
              <Badge variant="secondary" className="bg-white text-blue-600">
                Upgrade Required
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 lg:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-indigo-500 rounded-full blur-xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight mb-6">
              Plans & Pricing
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Choose a plan that suits your business. All plans include our core features with{" "}
              <span className="text-blue-600 font-semibold">no hidden fees</span>.
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20"
                >
                  <benefit.icon className="w-6 h-6 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{benefit.title}</h3>
                  <p className="text-xs text-gray-600 text-center">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plan Options */}
      <section className="py-6 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose Your Plan</h2>
              <p className="text-gray-600">Select the perfect plan for your business needs</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3 flex flex-col min-w-[140px]">
                <span className="text-xs text-blue-600 font-medium mb-1">Plan Duration</span>
                <span className="font-bold text-lg text-gray-800 flex items-center">
                  1 Year
                  <ChevronDown className="w-4 h-4 ml-1 text-blue-600" />
                </span>
              </div>

              <div className="relative group bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3 flex flex-col min-w-[160px] cursor-pointer">
                <span className="text-xs text-blue-600 font-medium mb-1">Select Device</span>
                <span className="font-bold text-lg text-gray-800 flex items-center">
                  Desktop + Mobile
                  <ChevronDown className="w-4 h-4 ml-1 text-blue-600" />
                </span>

                <div className="absolute left-0 top-full mt-2 w-full bg-white border border-blue-200 rounded-lg shadow-xl z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200">
                  <ul className="py-2">
                    <li className="flex items-center px-4 py-2 font-bold text-gray-900 bg-blue-50">
                      <Check className="w-4 h-4 mr-2 text-blue-600" />
                      Desktop + Mobile
                    </li>
                    <li className="px-4 py-2 text-gray-800 hover:bg-gray-50 cursor-pointer transition-colors">
                      Desktop
                    </li>
                    <li className="px-4 py-2 text-gray-800 hover:bg-gray-50 cursor-pointer transition-colors">
                      Mobile
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan, idx) => (
              <Card
                key={idx}
                className={`relative border-2 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                  selectedPlan === plan.id
                    ? "border-blue-500 shadow-lg bg-blue-50/50"
                    : plan.popular
                      ? "border-yellow-400 shadow-md bg-gradient-to-br from-yellow-50 to-amber-50"
                      : "border-gray-200 hover:border-blue-300 bg-white"
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 text-xs font-bold shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      MOST POPULAR
                    </Badge>
                  </div>
                )}

                {/* Selection Indicator */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === plan.id ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"
                    }`}
                  >
                    {selectedPlan === plan.id && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div
                      className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-md`}
                    >
                      <plan.icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-3xl font-bold text-gray-900">${plan.annualPrice.toFixed(2)}</span>
                      <div className="flex flex-col">
                        <span className="text-sm line-through text-gray-400">${plan.originalPrice}</span>
                        <Badge className="bg-green-100 text-green-700 text-xs px-1 py-0.5">{plan.savings}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">1 YEAR • DESKTOP + MOBILE</p>
                  </div>

                  <Button
                    onClick={() => handlePlanActivation(plan.id, plan.name)}
                    disabled={isActivating && selectedPlan === plan.id}
                    className={`w-full py-3 text-base font-semibold rounded-lg shadow-md transition-all duration-200 ${
                      selectedPlan === plan.id ? "bg-blue-600 hover:bg-blue-700 text-white" : plan.buttonColor
                    }`}
                  >
                    {isActivating && selectedPlan === plan.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Activating...
                      </>
                    ) : selectedPlan === plan.id ? (
                      "Selected" 
                    ) : (
                      <>
                        Activate {plan.name.split(" ")[0]} Plan
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      What's included:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-700">
                          <Check className="text-green-500 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}

                      {/* 29+ More Features Button */}
                      <li className="flex items-start text-sm">
                        <Check className="text-green-500 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                          <DialogTrigger asChild>
                            <button className="text-blue-600 hover:text-blue-800 font-medium underline text-left">
                              + 29 More Features
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
                                Complete Feature List
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid md:grid-cols-2 gap-3">
                              {allFeatures.map((feature, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50">
                                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{feature}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-6 pt-4 border-t">
                              <p className="text-sm text-gray-600 text-center">
                                All features are included in both Silver and Gold plans, with Gold offering unlimited
                                access.
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </li>

                      {plan.missing.map((missing, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-400">
                          <div className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 rounded-full border border-gray-300"></div>
                          <span className="line-through">{missing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Need a custom solution for your enterprise?</p>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-2 bg-transparent"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              FAQ
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our pricing and features
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="border border-white/50 hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <faq.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join over <span className="font-bold text-white">10 lakh businesses</span> already using BusinessHub to
            streamline their operations
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-bold rounded-xl shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-bold rounded-xl bg-transparent transition-all duration-200 hover:scale-105"
            >
              <Users className="w-5 h-5 mr-2" />
              Contact Sales
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-blue-200 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <NextLink href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-12"></div>
                </div>
                <span className="text-xl font-bold text-white">CraftCRM</span>
              </NextLink>
              <p className="text-gray-400 mb-6 leading-relaxed text-sm">
                Complete business management solution trusted by over 10 lakh businesses across India.
              </p>
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <Link className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <Star className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Product</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>
                  <a href="/features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/mobile-app" className="hover:text-white transition-colors">
                    Mobile App
                  </a>
                </li>
                <li>
                  <a href="/desktop" className="hover:text-white transition-colors">
                    Desktop App
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>
                  <a href="/about" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/careers" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="/partner" className="hover:text-white transition-colors">
                    Partner with us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Support</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>
                  <a href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/support" className="hover:text-white transition-colors">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href="/training" className="hover:text-white transition-colors">
                    Training
                  </a>
                </li>
                <li>
                  <a href="/community" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">© 2024 BusinessHub. All rights reserved.</p>
              <div className="flex space-x-6 text-gray-400 text-sm">
                <a href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="/security" className="hover:text-white transition-colors">
                  Security
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
