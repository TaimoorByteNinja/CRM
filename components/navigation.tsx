"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-12"></div>
            </div>
            <span className="text-xl font-bold text-gray-900">CraftCRM</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              Features
            </Link>
            <div className="relative group">
              <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center">
                Solutions
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Solutions Dropdown */}
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2">
                  <div className="grid grid-cols-2 gap-1">
                    <div
                      className="flex items-center space-x-2 p-2 rounded-md font-bold transition-colors"
                    >
                      <span className="text-sm text-gray-700  ">Business Management solutions </span>
                    </div>
                    <div
                      className="flex items-center space-x-2 p-2 rounded-md font-bold transition-colors"
                    >
                      <span className="text-sm text-gray-700 ">Industry Solution </span>
                    </div>
                    <Link
                      href="/solutions/accounting"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                        <span className="text-orange-600 text-xs">📊</span>
                      </div>
                      <span className="text-sm text-gray-700">Accounting</span>
                    </Link>
                    <Link
                      href="/solutions/retail"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                        <span className="text-red-600 text-xs">🏪</span>
                      </div>
                      <span className="text-sm text-gray-700">Retail</span>
                    </Link>
                    <Link
                      href="/solutions/inventory"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-green-600 text-xs">📦</span>
                      </div>
                      <span className="text-sm text-gray-700">Inventory</span>
                    </Link>
                    <Link
                      href="/solutions/pharmacy"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-green-600 text-xs">⚕️</span>
                      </div>
                      <span className="text-sm text-gray-700">Pharmacy</span>
                    </Link>
                    <Link
                      href="/solutions/invoicing"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                        <span className="text-purple-600 text-xs">📄</span>
                      </div>
                      <span className="text-sm text-gray-700">Invoicing</span>
                    </Link>
                    <Link
                      href="/solutions/grocery"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-blue-600 text-xs">🛒</span>
                      </div>
                      <span className="text-sm text-gray-700">Grocery</span>
                    </Link>
                    <Link
                      href="/solutions/e-invoice"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-blue-600 text-xs">📋</span>
                      </div>
                      <span className="text-sm text-gray-700">E-Invoice</span>
                    </Link>
                    <Link
                      href="/solutions/restaurant"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                        <span className="text-purple-600 text-xs">🍽️</span>
                      </div>
                      <span className="text-sm text-gray-700">Restaurant</span>
                    </Link>
                    <Link
                      href="/solutions/pos"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                        <span className="text-orange-600 text-xs">🧮</span>
                      </div>
                      <span className="text-sm text-gray-700">POS</span>
                    </Link>
                    <Link
                      href="/solutions/jewellery"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
                        <span className="text-yellow-600 text-xs">💎</span>
                      </div>
                      <span className="text-sm text-gray-700">Jewellery</span>
                    </Link>
                    <Link
                      href="/solutions/ocr"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-600 text-xs">🔍</span>
                      </div>
                      <span className="text-sm text-gray-700">OCR</span>
                    </Link>
                    <Link
                      href="/solutions/clothing"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-cyan-100 rounded flex items-center justify-center">
                        <span className="text-cyan-600 text-xs">👕</span>
                      </div>
                      <span className="text-sm text-gray-700">Clothing</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              Pricing
            </Link>
            <Link href="/reviews" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              Reviews
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              Contact
            </Link>
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              Login / Sign Up
            </Link>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <Link href="/start-trial">Try for Free</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/features"
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>

              {/* Mobile Solutions */}
              <div className="px-2">
                <div className="text-gray-600 font-medium mb-2">Solutions</div>
                <div className="grid grid-cols-2 gap-2 ml-4">
                  <Link
                    href="/solutions/accounting"
                    className="text-sm text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Accounting
                  </Link>
                  <Link
                    href="/solutions/retail"
                    className="text-sm text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Retail
                  </Link>
                  <Link
                    href="/solutions/inventory"
                    className="text-sm text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inventory
                  </Link>
                  <Link
                    href="/solutions/pharmacy"
                    className="text-sm text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pharmacy
                  </Link>
                  <Link
                    href="/solutions/invoicing"
                    className="text-sm text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Invoicing
                  </Link>
                  <Link
                    href="/solutions/grocery"
                    className="text-sm text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Grocery
                  </Link>
                  <Link
                    href="/solutions/e-invoice"
                    className="text-sm text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    E-Invoice
                  </Link>
                  <Link
                    href="/solutions/restaurant"
                    className="text-sm text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Restaurant
                  </Link>
                  <Link
                    href="/solutions/pos"
                    className="text-sm text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    POS
                  </Link>
                  <Link
                    href="/solutions/jewellery"
                    className="text-sm text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Jewellery
                  </Link>
                  <Link
                    href="/solutions/ocr"
                    className="text-sm text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    OCR
                  </Link>
                  <Link
                    href="/solutions/clothing"
                    className="text-sm text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Clothing
                  </Link>
                </div>
              </div>

              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/reviews"
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              <div className="border-t border-gray-100 pt-4 px-2">
                <Link
                  href="/login"
                  className="block text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login / Sign Up
                </Link>
                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <Link href="/start-trial" onClick={() => setIsMenuOpen(false)}>
                    Try for Free
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
