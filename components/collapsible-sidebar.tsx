"use client"

import { useMemo } from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCurrency } from "@/lib/currency-manager"
import {
  Package,
  ShoppingCart,
  CreditCard,
  Cloud,
  Settings,
  Plus,
  Users,
  DollarSign,
  UserCheck,
  Zap,
  Banknote,
  ChevronRight,
  TrendingUp,
  ChevronDown,
  BarChart3,
} from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function CollapsibleSidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { getSymbol, getCode, getName } = useCurrency()

  // Sidebar navigation items with href links

const sidebarNavigation = useMemo(() => [
  { name: "Manager", icon: UserCheck, tab: "home", href: "/business-hub" },
  { name: "overview", icon: TrendingUp, tab: "grow", hasDropdown: true, href: "/business-hub/overview" },
  { name: "Parties", icon: Users, tab: "parties", hasAdd: true, href: "/business-hub/parties" },
  { name: "Items", icon: Package, tab: "items", hasAdd: true, href: "/business-hub/items" },
  { name: "Sale", icon: ShoppingCart, tab: "sale", hasDropdown: true, href: "/business-hub/sale" },
  { name: "Purchase & Expense", icon: CreditCard, tab: "purchase", hasDropdown: true, href: "/business-hub/purchase" },
  { name: "Cash & Bank", icon: Banknote, tab: "bank", hasDropdown: true, href: "/business-hub/bank" },
  { name: "Reports", icon: BarChart3, tab: "reports", href: "/business-hub/reports" },
  { name: "Sync, Share & Backup", icon: Cloud, tab: "sync", hasDropdown: true, href: "/business-hub/sync" },
  { name: "Utilities", icon: Zap, tab: "utilities", hasDropdown: true, href: "/business-hub/utilities" },
  { name: "Settings", icon: Settings, tab: "settings", href: "/business-hub/settings" },
  { name: "Plans & Pricing", icon: DollarSign, tab: "plans", href: "/business-hub/plans" },
], [])


  const handleNavigation = (item: any) => {
    setActiveTab(item.tab)
    if (item.href) {
      router.push(item.href)
    }
  }

  const isActiveRoute = (href: string) => {
    return pathname === href || activeTab === sidebarNavigation.find((item) => item.href === href)?.tab
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl z-50 transition-all duration-300 ease-in-out ${
          isHovered ? "w-64" : "w-16"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className={`transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
            <div className="text-xs text-slate-400 mb-1">Open Anything (Ctrl+F)</div>
            
            {/* Currency Display */}
            <div className="mt-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{getSymbol()}</span>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">{getCode()}</div>
                    <div className="text-xs text-slate-400 truncate">{getName()}</div>
                  </div>
                </div>
                <div className="text-xs text-green-400 font-medium">Active</div>
              </div>
            </div>
          </div>
          {!isHovered && (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-1">
            {sidebarNavigation.map((item) => (
              <div key={item.name}>
                {item.href ? (
                  <Link href={item.href} className="block">
                    <button
                      onClick={() => handleNavigation(item)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                        isActiveRoute(item.href)
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={`h-4 w-4 ${isActiveRoute(item.href) ? "text-white" : "text-slate-400"}`}
                        />
                        <span
                          className={`text-sm font-medium transition-all duration-300 ${
                            isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      {isHovered && (
                        <div className="flex items-center gap-1 transition-all duration-300">
                          {item.hasAdd && (
                            <div
                              className="p-1 hover:bg-slate-600/50 rounded transition-colors cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                // Handle add action
                                console.log(`Add new ${item.name}`)
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </div>
                          )}
                          {item.hasDropdown && <ChevronDown className="h-3 w-3" />}
                        </div>
                      )}
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                      activeTab === item.tab
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-4 w-4 ${activeTab === item.tab ? "text-white" : "text-slate-400"}`} />
                      <span
                        className={`text-sm font-medium transition-all duration-300 ${
                          isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    {isHovered && (
                      <div className="flex items-center gap-1 transition-all duration-300">
                        {item.hasAdd && (
                          <div
                            className="p-1 hover:bg-slate-600/50 rounded transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle add action
                              console.log(`Add new ${item.name}`)
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </div>
                        )}
                        {item.hasDropdown && <ChevronDown className="h-3 w-3" />}
                      </div>
                    )}
                  </button>
                )}

                {/* Tooltip for collapsed state */}
                {!isHovered && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Promotional Banner */}
        <div className={`p-4 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          {isHovered && (
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-pink-600 rounded-xl p-4 text-white relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
              <div className="relative z-10">
                <div className="absolute top-2 right-2">
                  <div className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                    Upto 50% OFF
                  </div>
                </div>
                <div className="text-lg font-bold mb-1">EARLY BIRD</div>
                <div className="text-lg font-bold mb-2">OFFER</div>
                <div className="text-xs mb-2 opacity-90">📅 9 Jul 2025</div>
                <div className="text-xs mb-3 opacity-90">🕐 4:32 PM - 3:32 PM</div>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black text-xs px-3 py-1 h-auto font-bold shadow-md hover:shadow-lg transition-all">
                  Buy Now
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CRM Link */}
        <div
          className={`p-4 border-t border-slate-700/50 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          <Link href="/crm" className="block">
            <button className="w-full flex items-center justify-between text-slate-300 hover:text-white transition-colors group">
              <span className="text-sm font-medium">Craft CRM</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isHovered && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsHovered(false)}
        />
      )}
    </>
  )
}
