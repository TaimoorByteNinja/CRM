"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  Banknote,
  FileText,
  Cloud,
  Wrench,
  Settings,
  Crown,
  ChevronDown,
  Plus,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import UserProfile from "./UserProfile"

const navigationItems = [
  {
    title: "Home",
    href: "/business-hub/overview",
    icon: Home,
  },
  {
    title: "Parties",
    href: "/business-hub/parties",
    icon: Users,
    hasAdd: true,
    addHref: "/business-hub/parties/add",
    subItems: [
      { title: "All Parties", href: "/business-hub/parties" },
      { title: "Customers", href: "/business-hub/parties/customers" },
      { title: "Suppliers", href: "/business-hub/parties/suppliers" },
      { title: "Add Party", href: "/business-hub/parties/add" },
    ],
  },
  {
    title: "Items",
    href: "/business-hub/items",
    icon: Package,
    hasAdd: true,
    addHref: "/business-hub/items/add",
    subItems: [
      { title: "All Items", href: "/business-hub/items" },
      { title: "Add Item", href: "/business-hub/items/add" },
      { title: "Categories", href: "/business-hub/items/categories" },
      { title: "Stock Report", href: "/business-hub/items/stock-report" },
      { title: "Low Stock Alert", href: "/business-hub/items/low-stock" },
    ],
  },
  {
    title: "Sale",
    href: "/business-hub/sale",
    icon: ShoppingCart,
    hasDropdown: true,
    subItems: [
      { title: "Sale Invoice", href: "/business-hub/sale" },
      { title: "Sale Return", href: "/business-hub/sale/returns" },
      { title: "Quotation", href: "/business-hub/sale/quotations" },
      { title: "Delivery Challan", href: "/business-hub/sale/delivery" },
      { title: "Proforma Invoice", href: "/business-hub/sale/proforma" },
    ],
  },
  {
    title: "Purchase & Expense",
    href: "/business-hub/purchase",
    icon: CreditCard,
    hasDropdown: true,
    subItems: [
      { title: "Purchase", href: "/business-hub/purchase" },
      { title: "Purchase Return", href: "/business-hub/purchase/returns" },
      { title: "Expense", href: "/business-hub/purchase/expenses" },
      { title: "Purchase Order", href: "/business-hub/purchase/orders" },
    ],
  },
  {
    title: "Grow Your Business",
    href: "/business-hub/grow-business",
    icon: TrendingUp,
    hasDropdown: true,
    subItems: [
      { title: "Online Store", href: "/business-hub/grow-business/online-store" },
      { title: "WhatsApp Catalog", href: "/business-hub/grow-business/whatsapp-catalog" },
      { title: "Marketing Tools", href: "/business-hub/grow-business/marketing-tools" },
      { title: "Analytics", href: "/business-hub/grow-business/analytics" },
    ],
  },
  {
    title: "Cash & Bank",
    href: "/business-hub/cash-bank",
    icon: Banknote,
    hasDropdown: true,
    subItems: [
      { title: "Cash In", href: "/business-hub/cash-bank/cash-in" },
      { title: "Cash Out", href: "/business-hub/cash-bank/cash-out" },
      { title: "Bank Accounts", href: "/business-hub/cash-bank/accounts" },
      { title: "Reconciliation", href: "/business-hub/cash-bank/reconciliation" },
    ],
  },
  {
    title: "Reports",
    href: "/business-hub/reports",
    icon: FileText,
  },
  {
    title: "Sync, Share & Backup",
    href: "/business-hub/sync",
    icon: Cloud,
    hasDropdown: true,
    subItems: [
      { title: "Cloud Backup", href: "/business-hub/sync/backup" },
      { title: "Share Data", href: "/business-hub/sync/share" },
      { title: "Import/Export", href: "/business-hub/sync/import-export" },
      { title: "Multi-Device Sync", href: "/business-hub/sync/devices" },
    ],
  },
  {
    title: "Utilities",
    href: "/business-hub/utilities",
    icon: Wrench,
    hasDropdown: true,
    subItems: [
      { title: "Bulk Operations", href: "/business-hub/utilities/bulk" },
      { title: "Data Cleanup", href: "/business-hub/utilities/cleanup" },
      { title: "Templates", href: "/business-hub/utilities/templates" },
      { title: "Shortcuts", href: "/business-hub/utilities/shortcuts" },
    ],
  },
  {
    title: "Settings",
    href: "/business-hub/settings",
    icon: Settings,
  },
  {
    title: "Plans & Pricing",
    href: "/business-hub/plans",
    icon: Crown,
  },
]

export function BusinessSidebar() {
  const pathname = usePathname()
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])

  const toggleDropdown = (title: string) => {
    setOpenDropdowns((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  const isParentActive = (item: any) => {
    if (isActive(item.href)) return true
    if (item.subItems) {
      return item.subItems.some((subItem: any) => isActive(subItem.href))
    }
    return false
  }

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.title}>
              {item.hasDropdown ? (
                <Collapsible open={openDropdowns.includes(item.title)} onOpenChange={() => toggleDropdown(item.title)}>
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-3 rounded-md text-sm font-medium transition-colors",
                        isParentActive(item)
                          ? "bg-slate-700 text-white"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white",
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          openDropdowns.includes(item.title) && "rotate-180",
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1">
                    <ul className="ml-6 space-y-1">
                      {item.subItems?.map((subItem) => (
                        <li key={subItem.title}>
                          <Link
                            href={subItem.href}
                            className={cn(
                              "block px-3 py-2 rounded-md text-sm transition-colors",
                              isActive(subItem.href)
                                ? "bg-slate-600 text-white"
                                : "text-slate-400 hover:bg-slate-700 hover:text-white",
                            )}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors flex-1",
                      isActive(item.href)
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                  {item.hasAdd && (
                    <Link href={item.addHref || "#"}>
                      <Button size="sm" className="ml-2 h-7 w-7 p-0 bg-slate-600 hover:bg-slate-500 text-white">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Profile Section */}
      <div className="p-3 border-t border-slate-700">
        <UserProfile />
      </div>
    </div>
  )
}
