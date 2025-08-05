"use client"

import type React from "react"
import { BusinessSidebar } from "./business-sidebar"
import { SalesProvider } from "@/lib/sales-context"

interface BusinessLayoutProps {
  children: React.ReactNode
}

export function BusinessLayout({ children }: BusinessLayoutProps) {
  return (
    <SalesProvider>
      <div className="flex h-screen bg-gray-50">
        <BusinessSidebar />
        <div className="flex-1 ml-64 overflow-hidden">{children}</div>
      </div>
    </SalesProvider>
  )
}
