"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Package,
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  Eye,
  EyeOff,
  Chrome,
  Github,
  ArrowRight,
  CheckCircle,
  Shield,
  Clock,
  Globe,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: false,
  })

  const handleLoginChange = (field: string, value: string | boolean) => {
    setLoginData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignupChange = (field: string, value: string | boolean) => {
    setSignupData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/business-hub")
    }, 2000)
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords don't match!")
      return
    }
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/business-hub")
    }, 2000)
  }

  const handleSocialAuth = (provider: string) => {
    setIsLoading(true)
    // Simulate social auth
    setTimeout(() => {
      setIsLoading(false)
      router.push("/business-hub")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <div className="space-y-8 hidden lg:block">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {isLogin ? "Welcome Back to" : "Join Thousands of"}
                <br />
                <span className="text-blue-600">CraftCRM</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {isLogin
                  ? "Access your inventory management dashboard and continue optimizing your business operations."
                  : "Start your journey with the most powerful inventory management system trusted by 50,000+ businesses."}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              {[
                {
                  icon: CheckCircle,
                  title: "Real-time Inventory Tracking",
                  description: "Monitor stock levels across all locations instantly",
                },
                {
                  icon: Shield,
                  title: "Enterprise-grade Security",
                  description: "Your data is protected with bank-level encryption",
                },
                {
                  icon: Clock,
                  title: "24/7 Support",
                  description: "Get help whenever you need it from our expert team",
                },
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <benefit.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="/placeholder.svg?height=50&width=50&text=AK"
                    alt="Ahmed Khan"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">Ahmed Khan</h4>
                    <p className="text-sm text-gray-600">CEO, Khan Electronics</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "CraftCRM transformed our inventory management. We reduced costs by 30% and eliminated stockouts
                  completely. Highly recommended!"
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="bg-white border border-gray-200 shadow-2xl rounded-2xl">
              <CardContent className="p-8">
                {/* Toggle Buttons */}
                <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      !isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {isLogin ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="text-gray-600">
                    {isLogin
                      ? "Enter your credentials to access your dashboard"
                      : "Start your free trial today - no credit card required"}
                  </p>
                </div>

                {/* Social Auth Buttons */}
                <div className="space-y-3 mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                    onClick={() => handleSocialAuth("google")}
                    disabled={isLoading}
                  >
                    <Chrome className="w-5 h-5 mr-2" />
                    Continue with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                    onClick={() => handleSocialAuth("github")}
                    disabled={isLoading}
                  >
                    <Github className="w-5 h-5 mr-2" />
                    Continue with GitHub
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>

                {/* Login Form */}
                {isLogin ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="john@company.com"
                          value={loginData.email}
                          onChange={(e) => handleLoginChange("email", e.target.value)}
                          className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => handleLoginChange("password", e.target.value)}
                          className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={loginData.rememberMe}
                          onCheckedChange={(checked) => handleLoginChange("rememberMe", checked as boolean)}
                        />
                        <Label htmlFor="remember-me" className="text-sm text-gray-600">
                          Remember me
                        </Label>
                      </div>
                      <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                      {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </form>
                ) : (
                  /* Sign Up Form */
                  <form onSubmit={handleSignupSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-firstName" className="text-gray-700">
                          First Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="signup-firstName"
                            type="text"
                            placeholder="John"
                            value={signupData.firstName}
                            onChange={(e) => handleSignupChange("firstName", e.target.value)}
                            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-lastName" className="text-gray-700">
                          Last Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="signup-lastName"
                            type="text"
                            placeholder="Doe"
                            value={signupData.lastName}
                            onChange={(e) => handleSignupChange("lastName", e.target.value)}
                            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="john@company.com"
                          value={signupData.email}
                          onChange={(e) => handleSignupChange("email", e.target.value)}
                          className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-company" className="text-gray-700">
                        Company Name
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="signup-company"
                          type="text"
                          placeholder="Acme Corp"
                          value={signupData.company}
                          onChange={(e) => handleSignupChange("company", e.target.value)}
                          className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="text-gray-700">
                        Phone Number (Optional)
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+92 300 1234567"
                          value={signupData.phone}
                          onChange={(e) => handleSignupChange("phone", e.target.value)}
                          className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={signupData.password}
                          onChange={(e) => handleSignupChange("password", e.target.value)}
                          className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirmPassword" className="text-gray-700">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="signup-confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={signupData.confirmPassword}
                          onChange={(e) => handleSignupChange("confirmPassword", e.target.value)}
                          className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="agree-terms"
                          checked={signupData.agreeToTerms}
                          onCheckedChange={(checked) => handleSignupChange("agreeToTerms", checked as boolean)}
                          className="mt-1"
                        />
                        <Label htmlFor="agree-terms" className="text-sm text-gray-600 leading-relaxed">
                          I agree to the{" "}
                          <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="subscribe-newsletter"
                          checked={signupData.subscribeNewsletter}
                          onCheckedChange={(checked) => handleSignupChange("subscribeNewsletter", checked as boolean)}
                          className="mt-1"
                        />
                        <Label htmlFor="subscribe-newsletter" className="text-sm text-gray-600">
                          Subscribe to our newsletter for product updates and tips
                        </Label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                      disabled={isLoading || !signupData.agreeToTerms}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                      {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </form>
                )}

                {/* Footer */}
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
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
