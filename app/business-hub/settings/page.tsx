"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  X,
  Search,
  Settings,
  FileText,
  Calculator,
  MessageSquare,
  Users,
  Package,
  Bell,
  Play,
  Plus,
  Save,
  RefreshCw,
  Printer,
  Palette,
  Globe,
  Layout,
} from "lucide-react"
import { InvoiceCustomizationDialog } from "@/components/InvoiceCustomizationDialog"
import { PINSetupDialog } from "@/components/PINSetupDialog"
import { formatCurrencyWithSymbol } from "@/lib/country-data"
import { CountrySelectionOverlay } from "@/components/CountrySelectionOverlay"
import { useSettings } from "@/hooks/use-settings"

// Simple currency formatting for preview
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function SettingsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("GENERAL")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCountrySetup, setShowCountrySetup] = useState(false)
  const [showPINSetup, setShowPINSetup] = useState(false)

  // Use the new settings hook
  const {
    general: generalSettings,
    transaction: transactionSettings,
    invoice: invoiceSettings,
    party: partySettings,
    item: itemSettings,
    message: messageSettings,
    tax: taxSettings,
    loading,
    error,
    lastSaved,
    updateGeneralWithSave: handleGeneralSettingChange,
    updateTransactionWithSave: handleTransactionSettingChange,
    updateInvoiceWithSave: handleInvoiceSettingChange,
    updatePartyWithSave: handlePartySettingChange,
    updateItemWithSave: handleItemSettingChange,
    updateMessageWithSave: handleMessageSettingChange,
    updateTaxWithSave: handleTaxSettingChange,
    loadAll,
    saveAll
  } = useSettings()

  // Load settings on component mount
  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Handle passcode toggle
  const handlePasscodeToggle = async (checked: boolean) => {
    if (checked) {
      // Check if phone number is set
      if (!generalSettings.phoneNumber) {
        alert("Please set your phone number first in Country Setup section.")
        return
      }
      
      // Check if PIN is already set up for this phone number using Supabase
      try {
        const { pinService } = await import('@/lib/pin-service')
        const hasPIN = await pinService.hasPIN(generalSettings.phoneNumber)
        
        if (hasPIN) {
          // PIN already exists, just enable
          handleGeneralSettingChange("enablePasscode", true)
          handleGeneralSettingChange("passcodeSetup", true)
          console.log('✅ PIN already exists for phone:', generalSettings.phoneNumber)
        } else {
          // No PIN exists, show setup dialog
          console.log('📝 No PIN found for phone:', generalSettings.phoneNumber, '- showing setup dialog')
          setShowPINSetup(true)
        }
      } catch (error) {
        console.error('Error checking PIN status:', error)
        // Fallback to localStorage check
        const pinSetupCompleted = localStorage.getItem('pinSetupCompleted') === 'true'
        if (pinSetupCompleted) {
          handleGeneralSettingChange("enablePasscode", true)
          handleGeneralSettingChange("passcodeSetup", true)
        } else {
          setShowPINSetup(true)
        }
      }
    } else {
      // Disable passcode
      handleGeneralSettingChange("enablePasscode", false)
      handleGeneralSettingChange("passcodeSetup", false)
      
      // Clear PIN from storage
      localStorage.removeItem('userPIN')
      localStorage.removeItem('pinSetupCompleted')
      localStorage.removeItem('pinSetupDate')
      sessionStorage.removeItem('pinVerified')
      sessionStorage.removeItem('pinVerificationTime')
    }
  }

  const handlePINSetupComplete = () => {
    // PIN setup is complete, the PINSetupDialog has already saved the PIN
    // Just update the UI state
    setShowPINSetup(false)
  }

  const formatCurrency = (amount: number) => {
    return formatCurrencyWithSymbol(amount, {
      code: generalSettings.selectedCurrency,
      symbol: generalSettings.selectedCurrencySymbol,
      name: "",
      position: "before"
    })
  }

  const sidebarSections = [
    { id: "GENERAL", label: "GENERAL", icon: Settings },
    { id: "TRANSACTION", label: "TRANSACTION", icon: FileText },
    { id: "PRINT", label: "PRINT", icon: Printer },
    // { id: "TAXES", label: "TAXES", icon: Calculator },
    // { id: "TRANSACTION MESSAGE", label: "TRANSACTION MESSAGE", icon: MessageSquare },
    { id: "PARTY", label: "PARTY", icon: Users },
    // { id: "ITEM", label: "ITEM", icon: Package },
    // { id: "SERVICE REMINDERS", label: "SERVICE REMINDERS", icon: Bell },
    { id: "COUNTRY SETUP", label: "COUNTRY SETUP", icon: Globe },
  ]

  const handleClose = () => {
    router.back()
  }

  const renderGeneralSettings = () => (
    <div className="space-y-8">
      {/* Application Section */}
      <div className="grid grid-cols-3 gap-8">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* <div className="flex items-center justify-between"> */}
                {/* <div>
                  <Label className="text-sm font-medium">Enable Passcode</Label>
                  <p className="text-xs text-gray-500">Secure your app with 4-digit PIN</p>
                </div> */}
                {/* <Switch
                  checked={generalSettings.enablePasscode}
                  onCheckedChange={handlePasscodeToggle}
                /> */}
              {/* </div> */}

              {/* <div className="space-y-2">
                <Label className="text-sm font-medium">Business Currency</Label>
                <Select
                  value={generalSettings.businessCurrency}
                  onValueChange={(value) => handleGeneralSettingChange("businessCurrency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rs">Rs (Indian Rupee)</SelectItem>
                    <SelectItem value="$">$ (US Dollar)</SelectItem>
                    <SelectItem value="€">€ (Euro)</SelectItem>
                    <SelectItem value="£">£ (British Pound)</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* <div className="space-y-2">
                <Label className="text-sm font-medium">Amount (upto Decimal Places)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={generalSettings.decimalPlaces}
                    onChange={(e) => handleGeneralSettingChange("decimalPlaces", Number.parseInt(e.target.value))}
                    className="w-20"
                    min="0"
                    max="4"
                  />
                  <span className="text-xs text-gray-500">e.g. 0.00</span>
                </div>
              </div> */}

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">TIN Number</Label>
                <Switch
                  checked={generalSettings.tinNumber}
                  onCheckedChange={(checked) => handleGeneralSettingChange("tinNumber", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Stop Sale on Negative Stock</Label>
                <Switch
                  checked={generalSettings.stopNegativeStock}
                  onCheckedChange={(checked) => handleGeneralSettingChange("stopNegativeStock", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multi Firm Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Multi Firm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">C</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">craft CRM</h3>
              <Badge variant="secondary" className="text-xs">
                DEFAULT
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Backup & History Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Backup & History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Auto Backup</Label>
              <Switch
                checked={generalSettings.autoBackup}
                onCheckedChange={(checked) => handleGeneralSettingChange("autoBackup", checked)}
              />
            </div> */}

            {/* <div className="text-sm text-gray-600">
              <p>Last Backup: 09/07/2025 | 04:07 PM</p>
            </div> */}

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Transaction History</Label>
              <Switch
                checked={generalSettings.transactionHistory}
                onCheckedChange={(checked) => handleGeneralSettingChange("transactionHistory", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* More Transactions Section */}
      {/* <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">More Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {[
              { key: "estimate", label: "Estimate/Quotation" },
              { key: "proforma", label: "Proforma Invoice" },
              { key: "saleOrder", label: "Sale/Purchase Order" },
              { key: "otherIncome", label: "Other Income" },
              { key: "fixedAssets", label: "Fixed Assets (FA)" },
              { key: "delivery", label: "Delivery Challan" },
            ].map((item) => (
              <div key={item.key} className="flex items-center space-x-3">
                <Switch
                  checked={false} // This will need to be updated when we add more transactions to the settings slice
                  onCheckedChange={(checked) => {
                    console.log('More transactions feature:', item.key, checked)
                    // handleGeneralSettingChange("moreTransactions", { ...generalSettings.moreTransactions, [item.key]: checked })
                  }}
                />
                <Label className="text-sm font-medium">{item.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}

      {/* Customize Your View Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Customize Your View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Screen Zoom/Scale is comming soon :)</Label>
              
            </div>
            {/* <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>70%</span>
                <span>80%</span>
                <span>90%</span>
                <span>100%</span>
                <span>110%</span>
                <span>115%</span>
                <span>120%</span>
                <span>130%</span>
              </div>
              <Slider
                value={[generalSettings.screenZoom]}
                onValueChange={(value) => handleGeneralSettingChange("screenZoom", value[0])}
                min={70}
                max={130}
                step={10}
                className="w-full"
              />
              <div className="flex justify-end">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Apply
                </Button>
              </div>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTransactionSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-8">
        {/* Transaction Header */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Transaction Header</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "invoiceNumber", label: "Invoice/Bill No.", checked: transactionSettings.invoiceNumber },
              { key: "addTime", label: "Add Time on Transactions", checked: transactionSettings.addTime },
              { key: "cashSaleDefault", label: "Cash Sale by default", checked: transactionSettings.cashSaleDefault },
              { key: "billingName", label: "Billing Name of Parties", checked: transactionSettings.billingName },
              { key: "customerPO", label: "Customers P.O. Details on Transactions", checked: transactionSettings.customerPO },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <Label className="text-sm font-medium">{item.label}</Label>
                <Switch checked={item.checked} onCheckedChange={(checked) => handleTransactionSettingChange(item.key, checked)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Items Table</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "displayPurchasePrice",
                label: "Display Purchase Price of Items",
                checked: transactionSettings.displayPurchasePrice,
              },
              {
                key: "showLastSalePrice",
                label: "Show last 5 Sale Price of Items",
                checked: transactionSettings.showLastSalePrice,
              },
              { key: "freeItemQuantity", label: "Free Item Quantity", checked: transactionSettings.freeItemQuantity },
              { key: "count", label: "Count", checked: transactionSettings.count },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <Label className="text-sm font-medium">{item.label}</Label>
                <Switch checked={item.checked} onCheckedChange={(checked) => handleTransactionSettingChange(item.key, checked)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Taxes, Discount & Totals */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Taxes, Discount & Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "transactionTax", label: "Transaction wise Tax", checked: transactionSettings.transactionTax },
              { key: "transactionDiscount", label: "Transaction wise Discount", checked: transactionSettings.transactionDiscount },
              { key: "roundOffTotal", label: "Round Off Total", checked: transactionSettings.roundOffTotal },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <Label className="text-sm font-medium">{item.label}</Label>
                <Switch checked={item.checked} onCheckedChange={(checked) => handleTransactionSettingChange(item.key, checked)} />
              </div>
            ))}

            <div className="space-y-2">
              <Label className="text-sm font-medium">Round Off To</Label>
              <div className="flex items-center gap-2">
                <Select defaultValue="nearest">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nearest">Nearest</SelectItem>
                    <SelectItem value="up">Up</SelectItem>
                    <SelectItem value="down">Down</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm">To</span>
                <Select defaultValue="1">
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* More Transaction Features */}
      {/* <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">More Transaction Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {[
              { key: "quickEntry", label: "Quick Entry", checked: transactionSettings.quickEntry },
              { key: "noInvoicePreview", label: "Do not Show Invoice Preview", checked: transactionSettings.noInvoicePreview },
              {
                key: "passcodeEdit",
                label: "Enable Passcode for transaction edit/delete",
                checked: transactionSettings.passcodeEdit,
              },
              { key: "discountPayments", label: "Discount During Payments", checked: transactionSettings.discountPayments },
              { key: "linkPayments", label: "Link Payments to Invoices", checked: transactionSettings.linkPayments },
              { key: "dueDates", label: "Due Dates and Payment Terms", checked: transactionSettings.dueDates },
              { key: "showProfit", label: "Show Profit while making Sale Invoice", checked: transactionSettings.showProfit },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <Label className="text-sm font-medium">{item.label}</Label>
                <Switch checked={item.checked} onCheckedChange={(checked) => handleTransactionSettingChange(item.key, checked)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}

      {/* Transaction Prefixes */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Transaction Prefixes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="mb-4">
              <Label className="text-sm font-medium">Firm</Label>
              <Input value="craft CRM" className="mt-1" readOnly />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Prefixes</h4>
                {[
                  { label: "Sale", value: "None" },
                  { label: "Sale Order", value: "None" },
                  { label: "Estimate", value: "None" },
                  { label: "Delivery Challan", value: "None" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <Label className="text-xs text-gray-600">{item.label}</Label>
                    <Select defaultValue={item.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div> */}

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">&nbsp;</h4>
                {[
                  { label: "Credit Note", value: "None" },
                  { label: "Purchase Order", value: "None" },
                  { label: "Proforma Invoice", value: "None" },
                  { label: "Payment In", value: "None" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <Label className="text-xs text-gray-600">{item.label}</Label>
                    <Select defaultValue={item.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPrintSettings = () => (
    <div className="space-y-6">
      {/* Invoice Customization Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">INVOICE CUSTOMIZATION</CardTitle>
            <InvoiceCustomizationDialog>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="h-4 w-4 mr-2" />
                Customize Invoice
              </Button>
            </InvoiceCustomizationDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Palette className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Colors & Themes</h4>
              <p className="text-sm text-gray-600">Customize colors, fonts, and visual themes</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Layout className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-medium mb-2">Layout & Content</h4>
              <p className="text-sm text-gray-600">Configure layout, fields, and content display</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Printer className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">Print Settings</h4>
              <p className="text-sm text-gray-600">Set paper size, margins, and print options</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Live Invoice Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white border rounded-lg p-6 text-sm max-w-2xl mx-auto">
            {/* Invoice Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded flex items-center justify-center" style={{ backgroundColor: invoiceSettings.customTheme.primaryColor }}>
                  <span className="text-white font-bold">C</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: invoiceSettings.customTheme.primaryColor }}>{invoiceSettings.companyName}</h2>
                  {invoiceSettings.showCompanyAddress && (
                    <p className="text-xs" style={{ color: invoiceSettings.customTheme.secondaryColor }}>{invoiceSettings.companyAddress}</p>
                  )}
                  {invoiceSettings.showCompanyContact && (
                    <>
                      <p className="text-xs" style={{ color: invoiceSettings.customTheme.secondaryColor }}>Phone: {invoiceSettings.companyPhone}</p>
                      <p className="text-xs" style={{ color: invoiceSettings.customTheme.secondaryColor }}>Email: {invoiceSettings.companyEmail}</p>
                      {invoiceSettings.companyWebsite && (
                        <p className="text-xs" style={{ color: invoiceSettings.customTheme.secondaryColor }}>Website: {invoiceSettings.companyWebsite}</p>
                      )}
                      {invoiceSettings.companyTaxId && (
                        <p className="text-xs" style={{ color: invoiceSettings.customTheme.secondaryColor }}>Tax ID: {invoiceSettings.companyTaxId}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-bold" style={{ color: invoiceSettings.customTheme.primaryColor }}>{invoiceSettings.invoiceTitle}</h3>
              </div>
            </div>

            {/* Bill To & Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              {invoiceSettings.showCustomerInfo && (
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: invoiceSettings.customTheme.primaryColor }}>Bill To:</h4>
                  <p className="text-sm">John Doe</p>
                  <p className="text-xs" style={{ color: invoiceSettings.customTheme.secondaryColor }}>123 Main St, City, State 12345</p>
                  <p className="text-xs" style={{ color: invoiceSettings.customTheme.secondaryColor }}>Contact: +1 234 567 8900</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2" style={{ color: invoiceSettings.customTheme.primaryColor }}>Invoice Details:</h4>
                <div className="text-xs space-y-1" style={{ color: invoiceSettings.customTheme.secondaryColor }}>
                  {invoiceSettings.showInvoiceNumber && <p>Invoice No.: INV-001</p>}
                  {invoiceSettings.showDate && <p>Date: {new Date().toLocaleDateString()}</p>}
                  {invoiceSettings.showDueDate && <p>Due Date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border rounded mb-6" style={{ borderColor: invoiceSettings.customTheme.borderColor }}>
              <table className="w-full text-xs">
                <thead style={{ backgroundColor: invoiceSettings.customTheme.headerColor }}>
                  <tr>
                    <th className="p-2 text-left border-r" style={{ borderColor: invoiceSettings.customTheme.borderColor, color: invoiceSettings.customTheme.primaryColor }}>#</th>
                    <th className="p-2 text-left border-r" style={{ borderColor: invoiceSettings.customTheme.borderColor, color: invoiceSettings.customTheme.primaryColor }}>Item name</th>
                    <th className="p-2 text-left border-r" style={{ borderColor: invoiceSettings.customTheme.borderColor, color: invoiceSettings.customTheme.primaryColor }}>Quantity</th>
                    <th className="p-2 text-left border-r" style={{ borderColor: invoiceSettings.customTheme.borderColor, color: invoiceSettings.customTheme.primaryColor }}>Price/unit</th>
                    <th className="p-2 text-left" style={{ color: invoiceSettings.customTheme.primaryColor }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t" style={{ borderColor: invoiceSettings.customTheme.borderColor }}>
                    <td className="p-2 border-r" style={{ borderColor: invoiceSettings.customTheme.borderColor, color: invoiceSettings.customTheme.secondaryColor }}>1</td>
                    <td className="p-2 border-r" style={{ color: invoiceSettings.customTheme.primaryColor }}>Product A</td>
                    <td className="p-2 border-r" style={{ color: invoiceSettings.customTheme.secondaryColor }}>2</td>
                    <td className="p-2 border-r" style={{ color: invoiceSettings.customTheme.secondaryColor }}>{formatCurrency(100)}</td>
                    <td className="p-2" style={{ color: invoiceSettings.customTheme.primaryColor }}>{formatCurrency(200)}</td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: invoiceSettings.customTheme.borderColor }}>
                    <td className="p-2 border-r" style={{ borderColor: invoiceSettings.customTheme.borderColor, color: invoiceSettings.customTheme.secondaryColor }}>2</td>
                    <td className="p-2 border-r" style={{ color: invoiceSettings.customTheme.primaryColor }}>Product B</td>
                    <td className="p-2 border-r" style={{ color: invoiceSettings.customTheme.secondaryColor }}>1</td>
                    <td className="p-2 border-r" style={{ color: invoiceSettings.customTheme.secondaryColor }}>{formatCurrency(150)}</td>
                    <td className="p-2" style={{ color: invoiceSettings.customTheme.primaryColor }}>{formatCurrency(150)}</td>
                  </tr>
                  <tr className="border-t" style={{ backgroundColor: invoiceSettings.customTheme.headerColor, borderColor: invoiceSettings.customTheme.borderColor }}>
                    <td className="p-2 border-r font-semibold" colSpan={4} style={{ borderColor: invoiceSettings.customTheme.borderColor, color: invoiceSettings.customTheme.primaryColor }}>
                      TOTAL
                    </td>
                    <td className="p-2 font-semibold" style={{ color: invoiceSettings.customTheme.primaryColor }}>{formatCurrency(350)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
                          <div className="text-right space-y-1 text-xs">
                {invoiceSettings.showSubtotal && (
                  <div className="flex justify-between">
                    <span style={{ color: invoiceSettings.customTheme.secondaryColor }}>Sub Total:</span>
                    <span style={{ color: invoiceSettings.customTheme.primaryColor }}>{formatCurrency(350)}</span>
                  </div>
                )}
                {invoiceSettings.showTax && (
                  <div className="flex justify-between">
                    <span style={{ color: invoiceSettings.customTheme.secondaryColor }}>Tax (10%):</span>
                    <span style={{ color: invoiceSettings.customTheme.primaryColor }}>{formatCurrency(35)}</span>
                  </div>
                )}
                {invoiceSettings.showGrandTotal && (
                  <div className="flex justify-between font-semibold border-t pt-1" style={{ borderColor: invoiceSettings.customTheme.borderColor }}>
                    <span style={{ color: invoiceSettings.customTheme.primaryColor }}>Total:</span>
                    <span style={{ color: invoiceSettings.customTheme.primaryColor }}>{formatCurrency(385)}</span>
                  </div>
                )}
              </div>

            {/* Footer */}
            {invoiceSettings.showFooter && (
              <div className="mt-6 text-xs text-center" style={{ color: invoiceSettings.customTheme.secondaryColor }}>
                <p>{invoiceSettings.footerText}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTaxSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-8">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Tax Rates</CardTitle>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tax rates configured yet</p>
              <p className="text-sm">Click "Add" to create your first tax rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Tax Group</CardTitle>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tax groups configured yet</p>
              <p className="text-sm">Click "Add" to create your first tax group</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTransactionMessageSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-8">
        {/* Left Panel - Settings */}
        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Select Message Type:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span className="font-medium">Send via Personal WhatsApp</span>
                <Button size="sm" variant="outline" className="ml-auto bg-transparent">
                  Login
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Message Recipient Settings:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Send SMS to Party</Label>
                <Switch
                  checked={messageSettings.sendSMSToParty}
                  onCheckedChange={(checked) => handleMessageSettingChange("sendSMSToParty", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Send Transaction Update SMS</Label>
                <Switch
                  checked={messageSettings.sendTransactionUpdate}
                  onCheckedChange={(checked) => handleMessageSettingChange("sendTransactionUpdate", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Send SMS Copy to Self</Label>
                <Switch
                  checked={messageSettings.sendSMSCopy}
                  onCheckedChange={(checked) => handleMessageSettingChange("sendSMSCopy", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Message Content:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Party Current Balance in SMS</Label>
                <Switch
                  checked={messageSettings.partyBalance}
                  onCheckedChange={(checked) => handleMessageSettingChange("partyBalance", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Web invoice link in SMS</Label>
                <Switch
                  checked={messageSettings.webInvoiceLink}
                  onCheckedChange={(checked) => handleMessageSettingChange("webInvoiceLink", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Send Automatic SMS for:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(partySettings.autoSMSFor).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Switch
                      checked={Boolean(value)}
                      onCheckedChange={(checked) => {
                        const newAutoSMSFor = { ...partySettings.autoSMSFor, [key]: checked }
                        handlePartySettingChange("autoSMSFor", newAutoSMSFor)
                      }}
                    />
                    <Label className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Message Editor */}
        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Edit Message</CardTitle>
                <p className="text-sm text-gray-600">Transaction Type: Sales Transaction</p>
              </div>
              <Select defaultValue="sales">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Transaction</SelectItem>
                  <SelectItem value="purchase">Purchase Transaction</SelectItem>
                  <SelectItem value="payment">Payment Transaction</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter your message template here..."
                  rows={8}
                  defaultValue={`Greetings from [Firm_Name]
We are pleased to have you as a valuable customer. Please find the details of your transaction.

[Transaction_Type] :
Invoice Amount: [Invoice_Amount]
Balance: [Transaction_Balance]

Thanks for doing business with us.
Regards,
[Firm_Name]`}
                />

                <div className="text-xs text-gray-500">
                  <p>Insert 'T' symbol anywhere to include a variable.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Message Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Transaction Image Attached</span>
                </div>

                <div className="text-sm">
                  <p className="font-medium">Greetings from craft CRM</p>
                  <p>We are pleased to have you as a valuable customer. Please find the details of your transaction.</p>
                  <br />
                  <p>Sale Invoice :</p>
                  <p>Invoice Amount: 792.00</p>
                  <p>Balance: 0.00</p>
                  <br />
                  <p>Thanks for doing business with us.</p>
                  <p>Regards,</p>
                  <p>craft CRM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderPartySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-8">
        {/* Party Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Party Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "partyGrouping", label: "Party Grouping", checked: partySettings.partyGrouping },
              { key: "shippingAddress", label: "Shipping Address", checked: partySettings.shippingAddress },
              { key: "managePartyStatus", label: "Manage Party Status", checked: partySettings.managePartyStatus },
              // {
              //   key: "enablePaymentReminder",
              //   label: "Enable Payment Reminder",
              //   checked: partySettings.enablePaymentReminder,
              // },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <Label className="text-sm font-medium">{item.label}</Label>
                <Switch checked={item.checked} onCheckedChange={(checked) => handlePartySettingChange(item.key, checked)} />
              </div>
            ))}

            {/* {partySettings.enablePaymentReminder && (
              <div className="flex items-center gap-2 mt-4">
                <Label className="text-sm font-medium">Remind me for payment due in</Label>
                <Input
                  type="number"
                  value={partySettings.paymentReminderDays}
                  onChange={(e) => handlePartySettingChange("paymentReminderDays", Number.parseInt(e.target.value))}
                  className="w-16"
                  min="1"
                />
                <span className="text-sm text-gray-500">(days)</span>
              </div> */}
            {/* )} */}

            {/* <Button variant="link" className="text-blue-600 p-0 h-auto">
              Reminder Message &gt;
            </Button> */}
          </CardContent>
        </Card>

        {/* Additional Fields */}
        {/* <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Additional fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={
                      partySettings.additionalFields[`field${num}` as keyof typeof partySettings.additionalFields]?.enabled
                    }
                    onCheckedChange={(checked) => {
                      const fieldKey = `field${num}` as keyof typeof partySettings.additionalFields
                      const newAdditionalFields = {
                        ...partySettings.additionalFields,
                        [fieldKey]: {
                          ...partySettings.additionalFields[fieldKey],
                          enabled: checked,
                        }
                      }
                      handlePartySettingChange("additionalFields", newAdditionalFields)
                    }}
                  />
                  <Input placeholder={`Additional Field ${num}`} className="flex-1" />
                </div>
                <div className="flex items-center justify-between ml-6">
                  <span className="text-xs text-gray-500">Show In Print</span>
                  <Switch
                    checked={
                      partySettings.additionalFields[`field${num}` as keyof typeof partySettings.additionalFields]?.showInPrint
                    }
                    onCheckedChange={(checked) => {
                      const fieldKey = `field${num}` as keyof typeof partySettings.additionalFields
                      const newAdditionalFields = {
                        ...partySettings.additionalFields,
                        [fieldKey]: {
                          ...partySettings.additionalFields[fieldKey],
                          showInPrint: checked,
                        }
                      }
                      handlePartySettingChange("additionalFields", newAdditionalFields)
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card> */}

        {/* Enable Loyalty Point */}
        {/* <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Enable Loyalty Point</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Enable Loyalty Point</Label>
              <Switch
                checked={partySettings.enableLoyaltyPoint}
                onCheckedChange={(checked) => handlePartySettingChange("enableLoyaltyPoint", checked)}
              />
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )

  const renderItemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-8">
        {/* Item Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Item Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Enable Item</Label>
              <Switch
                checked={itemSettings.enableItem}
                onCheckedChange={(checked) => handleItemSettingChange("enableItem", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">What do you sell?</Label>
              <Select
                value="Product/Service"
                onValueChange={(value) => handleItemSettingChange("whatDoYouSell", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product/Service">Product/Service</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {[
              { key: "barcodeScanning", label: "Barcode Scan", checked: itemSettings.barcodeScanning },
              { key: "stockMaintenance", label: "Stock Maintenance", checked: itemSettings.stockMaintenance },
              { key: "manufacturing", label: "Manufacturing", checked: itemSettings.manufacturing },
              { key: "showLowStockDialog", label: "Show Low Stock Dialog", checked: itemSettings.showLowStockDialog },
              { key: "itemsUnit", label: "Items Unit", checked: itemSettings.itemsUnit },
              { key: "defaultUnit", label: "Default Unit", checked: itemSettings.defaultUnit },
              { key: "itemCategory", label: "Item Category", checked: itemSettings.itemCategory },
              { key: "partyWiseItemRate", label: "Party Wise Item Rate", checked: itemSettings.partyWiseItemRate },
              { key: "description", label: "Description", checked: itemSettings.description },
              { key: "itemWiseTax", label: "Item wise Tax", checked: itemSettings.itemWiseTax },
              { key: "itemWiseDiscount", label: "Item wise Discount", checked: itemSettings.itemWiseDiscount },
              {
                key: "updateSalePrice",
                label: "Update Sale Price from Transaction",
                checked: itemSettings.updateSalePrice,
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <Label className="text-sm font-medium">{item.label}</Label>
                <Switch checked={item.checked} onCheckedChange={(checked) => handleItemSettingChange(item.key, checked)} />
              </div>
            ))}

            <div className="space-y-2">
              <Label className="text-sm font-medium">Quantity (upto Decimal Places)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={2}
                  onChange={(e) => handleItemSettingChange("quantityDecimal", Number.parseInt(e.target.value))}
                  className="w-20"
                  min="0"
                  max="4"
                />
                <span className="text-xs text-gray-500">e.g. 0.00</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Wholesale Price</Label>
              <Switch
                checked={itemSettings.wholesalePrice}
                onCheckedChange={(checked) => handleItemSettingChange("wholesalePrice", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Item Fields */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Additional Item Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">MRP/Price</h4>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={false}
                  onCheckedChange={(checked) => {
                    console.log('MRP field:', checked)
                  }}
                />
                <Label className="text-sm">MRP</Label>
                <Input placeholder="MRP" className="flex-1" />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Serial No. Tracking</h4>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={false}
                  onCheckedChange={(checked) => {
                    console.log('Serial Tracking field:', checked)
                  }}
                />
                <Label className="text-sm">Serial No./ IMEI No. etc</Label>
                <Input placeholder="Serial No." className="flex-1" />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Batch Tracking</h4>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={false}
                  onCheckedChange={(checked) => {
                    console.log('Batch Tracking field:', checked)
                  }}
                />
                <Label className="text-sm">Batch No.</Label>
                <Input placeholder="Batch No." className="flex-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={false}
                  onCheckedChange={(checked) => {
                    console.log('Exp Date field:', checked)
                  }}
                />
                <Label className="text-sm">Exp Date</Label>
              </div>
              <Select defaultValue="mm/yy">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm/yy">mm/yy</SelectItem>
                  <SelectItem value="dd/mm/yy">dd/mm/yy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={false}
                  onCheckedChange={(checked) => {
                    console.log('Mfg Date field:', checked)
                  }}
                />
                <Label className="text-sm">Mfg Date</Label>
              </div>
              <Select defaultValue="dd/mm/yy">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/mm/yy">dd/mm/yy</SelectItem>
                  <SelectItem value="mm/yy">mm/yy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={itemSettings.itemFields.modelNo.enabled}
                onCheckedChange={(checked) => {
                  const newItemFields = {
                    ...itemSettings.itemFields,
                    modelNo: { ...itemSettings.itemFields.modelNo, enabled: checked }
                  }
                  handleItemSettingChange("itemFields", newItemFields)
                }}
              />
              <Label className="text-sm">Model No.</Label>
              <Input placeholder="Model No." className="flex-1" />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={itemSettings.itemFields.size.enabled}
                onCheckedChange={(checked) => {
                  const newItemFields = {
                    ...itemSettings.itemFields,
                    size: { ...itemSettings.itemFields.size, enabled: checked }
                  }
                  handleItemSettingChange("itemFields", newItemFields)
                }}
              />
              <Label className="text-sm">Size</Label>
              <Input placeholder="Size" className="flex-1" />
            </div>
          </CardContent>
        </Card>

        {/* Item Custom Fields */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Item Custom Fields</CardTitle>
            <Button variant="link" className="text-blue-600 p-0 h-auto">
              Add Custom Fields &gt;
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No custom fields added yet</p>
              <p className="text-sm">Click "Add Custom Fields" to create custom item fields</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderServiceReminders = () => (
    <div className="space-y-6">
      {/* Service Reminders Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">How does Service Reminders feature work in Vyapar?</h2>
            <p className="text-blue-100 mb-4">
              Watch the video and see how you can grow your business using Service Reminders.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center">
              <Play className="h-8 w-8 text-white" />
            </div>
            <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold">
              <Play className="h-4 w-4 mr-2" />
              Play Video
            </Button>
          </div>
        </div>
      </div>

      {/* Service Reminders Illustration */}
      <div className="text-center py-12">
        <div className="w-64 h-64 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full"></div>
          <div className="absolute top-8 left-8 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Bell className="h-6 w-6 text-orange-500" />
          </div>
          <div className="absolute top-12 right-12 w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <div className="w-12 h-8 bg-orange-500 rounded"></div>
          </div>
          <div className="absolute bottom-8 left-12 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Settings className="h-5 w-5 text-orange-500" />
          </div>
          <div className="absolute bottom-12 right-8 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Users className="h-4 w-4 text-orange-500" />
          </div>

          {/* Floating elements */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl">⭐</div>
          <div className="absolute top-1/3 left-4 text-xl">✨</div>
          <div className="absolute top-1/3 right-4 text-xl">⚡</div>
          <div className="absolute bottom-4 left-1/3 text-lg">💫</div>
          <div className="absolute bottom-4 right-1/3 text-lg">🔧</div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl font-semibold">Service Reminders</h3>
            <Badge className="bg-red-500 text-white">New</Badge>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Remind your parties</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Don't lose customers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Grow your Business</span>
            </div>
          </div>

          <Button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold mt-6">
            <Bell className="h-4 w-4 mr-2" />
            Enable Service Reminders
          </Button>
        </div>
      </div>
    </div>
  )

  const renderCountrySetup = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Country Setup</h2>
            <p className="text-gray-500">Configure your business location and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Settings Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Current Settings</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Country:</span>
                <span className="font-medium">{generalSettings.selectedCountry === 'PK' ? 'Pakistan' : generalSettings.selectedCountry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium">{generalSettings.selectedCurrency} ({generalSettings.selectedCurrencySymbol})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone Number:</span>
                <span className="font-medium">{generalSettings.phoneNumber || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date Format:</span>
                <span className="font-medium">{generalSettings.selectedDateFormat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number Format:</span>
                <span className="font-medium">{generalSettings.selectedNumberFormat}</span>
              </div>
            </div>
          </div>

          {/* Update Settings */}
          <div className="space-y-4">
            <Button 
              onClick={() => setShowCountrySetup(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Globe className="h-4 w-4 mr-2" />
              Update Country Settings
            </Button>
            
            <div className="text-sm text-gray-500">
              <p className="mb-2">Click the button above to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Change your business country</li>
                <li>Update currency preferences</li>
                <li>Set phone number format</li>
                <li>Configure date and number formats</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Country Selection Modal */}
      {!showCountrySetup && (
        <CountrySelectionOverlay 
          isOpen={true}
          onClose={() => setShowCountrySetup(true)}
        />
      )}
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "GENERAL":
        return renderGeneralSettings()
      case "TRANSACTION":
        return renderTransactionSettings()
      case "PRINT":
        return renderPrintSettings()
      // case "TAXES":
      //   return renderTaxSettings()
      case "TRANSACTION MESSAGE":
        return renderTransactionMessageSettings()
      case "PARTY":
        return renderPartySettings()
      case "ITEM":
        return renderItemSettings()
      case "SERVICE REMINDERS":
        return renderServiceReminders()
      case "COUNTRY SETUP":
        return renderCountrySetup()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 text-white min-h-screen fixed left-0 top-0 z-50">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6" />
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-white hover:bg-slate-700 p-1">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search settings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 pb-4">
            <div className="space-y-1">
              {sidebarSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{activeSection}</h1>
                  <p className="text-gray-600 mt-1">Configure your {activeSection.toLowerCase()} settings</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Save Status */}
                  {loading && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm">Saving...</span>
                    </div>
                  )}
                  
                  {lastSaved && !loading && (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">
                        Saved: {new Date(lastSaved).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  
                  {error && (
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Error saving</span>
                    </div>
                  )}
                  
                  <Button variant="outline" className="bg-white" onClick={() => loadAll()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700" 
                    onClick={saveAll}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </div>
      </div>

      {/* PIN Setup Dialog */}
      <PINSetupDialog 
        open={showPINSetup}
        onOpenChange={setShowPINSetup}
        onSetupComplete={handlePINSetupComplete}
      />
    </div>
  )
}
