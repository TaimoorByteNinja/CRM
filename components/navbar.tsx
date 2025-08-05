"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, Zap, BarChart3, Settings, X, Palette } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
     { name: "Features", href: "/navbar/feature", icon: Zap },
    { name: "Pricing", href: "/navbar/pricing", icon: BarChart3 },
    { name: "Docs", href: "/navbar/docs", icon: Settings },
    { name: "Support", href: "/support", icon: Settings },
    
  ]

  return (
    <>
      {/* 3D Enhanced Navigation */}
      <nav className="relative z-50 perspective-1000">
        {/* Multiple layered backgrounds for 3D depth */}
        <div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-r from-white/15 via-white/8 to-white/15 border-b border-white/30 transform-gpu"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-purple-500/8 to-cyan-500/8 transform-gpu"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent transform-gpu"></div>

        {/* 3D floating elements */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-0 right-1/4 w-24 h-24 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-xl animate-float-delayed"></div>

        <div className="relative flex items-center justify-between p-6 max-w-7xl mx-auto transform-gpu">
          {/* Enhanced 3D Logo */}
          <Link href="/" className="flex items-center space-x-4 group cursor-pointer transform-gpu">
            <div className="relative transform-gpu perspective-1000">
              {/* Multiple shadow layers for 3D depth */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-60 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-80 transition-all duration-500 transform group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-md opacity-30 group-hover:opacity-60 transition-all duration-500"></div>

              <div className="relative w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/50 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-y-12 group-hover:-translate-y-1 border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                <Sparkles className="w-7 h-7 text-white relative z-10 group-hover:rotate-12 transition-transform duration-500" />
              </div>
            </div>

            <div className="flex flex-col transform-gpu">
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:via-purple-200 group-hover:to-cyan-200 transition-all duration-500 transform group-hover:scale-105">
                CraftCRM
              </span>
              <div className="flex items-center space-x-2 -mt-1">
                <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  Build. Customize. Scale.
                </span>
                <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300 text-xs px-2 py-0.5 transform group-hover:scale-105 transition-transform duration-300">
                  Beta
                </Badge>
              </div>
            </div>
          </Link>

          {/* Enhanced 3D Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 transform-gpu">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={index} href={item.href} className="group relative transform-gpu perspective-1000">
                  {/* 3D background layers */}
                  <div
                    className={`absolute inset-0 rounded-2xl transition-all duration-500 transform-gpu ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 scale-105 shadow-lg shadow-blue-500/20"
                        : "bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/15 group-hover:to-purple-500/15 group-hover:scale-105"
                    }`}
                  ></div>

                  <div
                    className={`absolute inset-0 rounded-2xl backdrop-blur-sm transition-all duration-500 transform-gpu ${
                      isActive ? "bg-white/10 shadow-inner" : "bg-white/0 group-hover:bg-white/8"
                    }`}
                  ></div>

                  <div className="relative px-6 py-4 rounded-2xl transition-all duration-500 transform-gpu group-hover:-translate-y-0.5 group-hover:rotate-x-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-1.5 rounded-lg transition-all duration-500 transform-gpu group-hover:scale-110 group-hover:rotate-12 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                            : "bg-white/10 group-hover:bg-gradient-to-r group-hover:from-blue-500/50 group-hover:to-purple-500/50"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 transition-colors duration-500 ${
                            isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                          }`}
                        />
                      </div>
                      <span
                        className={`font-semibold transition-all duration-500 transform-gpu ${
                          isActive ? "text-white" : "text-gray-300 group-hover:text-white group-hover:scale-105"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Enhanced 3D CTA Section */}
          <div className="hidden md:flex items-center space-x-4 transform-gpu">
            <Button
              variant="ghost"
              className="relative text-gray-300 hover:text-white px-6 py-3 rounded-2xl transition-all duration-500 transform-gpu hover:-translate-y-0.5 hover:scale-105 group perspective-1000"
              onClick={() => (window.location.href = "/navbar/signin")}
            >
              <div className="absolute inset-0 bg-white/0 hover:bg-white/10 rounded-2xl transition-all duration-500 transform-gpu group-hover:rotate-x-1"></div>
              <span className="relative z-10">Sign In</span>
            </Button>

            <div className="relative group transform-gpu perspective-1000">
              {/* Multiple 3D shadow layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-60 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-80 transition-all duration-500 transform group-hover:scale-105"></div>

              <Button
                className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 text-white px-8 py-3 rounded-2xl font-bold shadow-2xl shadow-blue-500/30 transition-all duration-500 transform-gpu group-hover:scale-105 group-hover:-translate-y-1 group-hover:rotate-x-2 border border-white/20"
                onClick={() => (window.location.href = "/start-trial")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                <div className="relative flex items-center space-x-2 z-10">
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:rotate-12 transition-all duration-300" />
                </div>
              </Button>
            </div>
          </div>

          {/* Enhanced 3D Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 p-3 rounded-2xl transform-gpu hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 group perspective-1000"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1 transform-gpu group-hover:rotate-y-12 transition-transform duration-300">
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <>
                    <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 rounded-full transform group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="w-full h-0.5 bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 rounded-full transform group-hover:scale-110 transition-transform duration-300 delay-75"></div>
                    <div className="w-full h-0.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full transform group-hover:scale-110 transition-transform duration-300 delay-150"></div>
                  </>
                )}
              </div>
            </Button>
          </div>
        </div>
      </nav>

      {/* Enhanced 3D Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 transform-gpu">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="absolute top-20 left-4 right-4 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl transform-gpu animate-slide-down">
            <div className="p-6 space-y-4">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className="group block transform-gpu"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div
                      className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 transform-gpu group-hover:scale-105 group-hover:-translate-y-0.5 ${
                        isActive ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 shadow-lg" : "hover:bg-white/10"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-500"
                            : "bg-white/10 group-hover:bg-gradient-to-r group-hover:from-blue-500/50 group-hover:to-purple-500/50"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                        />
                      </div>
                      <span
                        className={`font-semibold ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"}`}
                      >
                        {item.name}
                      </span>
                    </div>
                  </Link>
                )
              })}

              <div className="pt-4 border-t border-white/10 space-y-3">
                <Button
                  variant="ghost"
                  className="w-full text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl py-3"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    window.location.href = "/navbar/signin"
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl py-3 font-semibold"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    window.location.href = "/start-trial"
                  }}
                >
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-12 {
          transform: rotateY(12deg);
        }
        .rotate-x-2 {
          transform: rotateX(2deg);
        }
        .rotate-x-1 {
          transform: rotateX(1deg);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes slide-down {
          from { transform: translateY(-20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
