"use client"

import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { 
  selectInvoiceSettings, 
  selectGeneralSettings,
  updateInvoiceSettings, 
  updateCustomTheme, 
  updateMargins,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  setActiveTemplate,
  setDefaultTemplate,
  selectTemplates,
  resetToDefault
} from "@/lib/store/slices/settingsSlice"
import { formatCurrencyWithSymbol } from "@/lib/country-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Palette, 
  Type, 
  Layout, 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  Copy, 
  Eye,
  Download,
  Upload,
  RotateCcw,
  FileText,
  Image,
  Building,
  User,
  Package,
  Calculator,
  FileDown,
  Printer
} from "lucide-react"

interface InvoiceCustomizationDialogProps {
  children: React.ReactNode
}

export function InvoiceCustomizationDialog({ children }: InvoiceCustomizationDialogProps) {
  const dispatch = useAppDispatch()
  const invoiceSettings = useAppSelector(selectInvoiceSettings)
  const generalSettings = useAppSelector(selectGeneralSettings)
  const templates = useAppSelector(selectTemplates)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("layout")
  const [previewData, setPreviewData] = useState({
    invoiceNumber: "INV-001",
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+1 234 567 8900",
    customerAddress: "123 Main St, City, State 12345",
    items: [
      { itemName: "Product A", quantity: 2, price: 100, total: 200 },
      { itemName: "Product B", quantity: 1, price: 150, total: 150 }
    ],
    subtotal: 350,
    tax: 35,
    total: 385,
    notes: "Thank you for your business!"
  })

  const formatCurrency = (amount: number) => {
    return formatCurrencyWithSymbol(amount, {
      code: generalSettings.selectedCurrency,
      symbol: generalSettings.selectedCurrencySymbol,
      name: "",
      position: "before"
    })
  }

  const handleSettingChange = (key: string, value: any) => {
    dispatch(updateInvoiceSettings({ [key]: value }))
  }

  const handleThemeChange = (key: string, value: string) => {
    dispatch(updateCustomTheme({ [key]: value }))
  }

  const handleMarginChange = (key: string, value: number) => {
    dispatch(updateMargins({ [key]: value }))
  }

  const handleSaveTemplate = () => {
    const templateName = prompt("Enter template name:")
    if (templateName) {
      const newTemplate = {
        id: `template_${Date.now()}`,
        name: templateName,
        settings: invoiceSettings,
        isDefault: false
      }
      dispatch(addTemplate(newTemplate))
    }
  }

  const handleSaveSettings = () => {
    // Settings are automatically saved via Redux, just show confirmation
    alert("Settings saved successfully!")
  }

  const handleOpenPreview = () => {
    const previewHTML = generatePreviewHTML()
    const previewWindow = window.open('', '_blank', 'width=800,height=600')
    if (previewWindow) {
      previewWindow.document.write(previewHTML)
      previewWindow.document.close()
    }
  }

  const handleResetToDefault = () => {
    if (confirm("Are you sure you want to reset all settings to default? This action cannot be undone.")) {
      dispatch(resetToDefault())
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      dispatch(deleteTemplate(templateId))
    }
  }

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      dispatch(setActiveTemplate(templateId))
      dispatch(updateInvoiceSettings(template.settings))
    }
  }

  const generatePreviewHTML = () => {
    const { customTheme, companyName, companyAddress, companyEmail, companyPhone, invoiceTitle, footerText } = invoiceSettings
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice Preview</title>
        <style>
          body {
            font-family: ${invoiceSettings.fontFamily};
            margin: 0;
            padding: ${invoiceSettings.margins.top}px ${invoiceSettings.margins.right}px ${invoiceSettings.margins.bottom}px ${invoiceSettings.margins.left}px;
            background: ${customTheme.backgroundColor};
            color: ${customTheme.textColor};
            font-size: ${invoiceSettings.fontSize}px;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid ${customTheme.borderColor};
            padding-bottom: 20px;
            margin-bottom: 30px;
            background: ${customTheme.headerColor};
            padding: 20px;
            border-radius: 8px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: ${customTheme.primaryColor};
            margin-bottom: 5px;
          }
          .company-info {
            color: ${customTheme.secondaryColor};
            font-size: 14px;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .invoice-info, .customer-info {
            flex: 1;
          }
          .invoice-number {
            font-size: 18px;
            font-weight: bold;
            color: ${customTheme.primaryColor};
            margin-bottom: 10px;
          }
          .label {
            font-weight: bold;
            color: ${customTheme.primaryColor};
            margin-bottom: 5px;
          }
          .value {
            color: ${customTheme.secondaryColor};
            margin-bottom: 10px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th {
            background: ${customTheme.headerColor};
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid ${customTheme.borderColor};
            font-weight: bold;
            color: ${customTheme.primaryColor};
          }
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid ${customTheme.borderColor};
            color: ${customTheme.secondaryColor};
          }
          .items-table .item-name {
            font-weight: bold;
            color: ${customTheme.primaryColor};
          }
          .items-table .amount {
            text-align: right;
            font-weight: bold;
            color: ${customTheme.primaryColor};
          }
          .totals {
            text-align: right;
            margin-top: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .total-row.grand-total {
            font-size: 20px;
            font-weight: bold;
            color: ${customTheme.primaryColor};
            border-top: 2px solid ${customTheme.borderColor};
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: ${customTheme.secondaryColor};
            font-size: 12px;
            border-top: 1px solid ${customTheme.borderColor};
            padding-top: 20px;
          }
          @media print {
            body {
              background: white;
            }
            .invoice-container {
              box-shadow: none;
              border: 1px solid ${customTheme.borderColor};
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">${companyName}</div>
            <div class="company-info">
              ${companyAddress}<br>
              ${companyPhone ? `Phone: ${companyPhone}<br>` : ''}
              ${companyEmail ? `Email: ${companyEmail}<br>` : ''}
              ${invoiceSettings.companyWebsite ? `Website: ${invoiceSettings.companyWebsite}<br>` : ''}
              ${invoiceSettings.companyTaxId ? `Tax ID: ${invoiceSettings.companyTaxId}` : ''}
            </div>
          </div>
          
          <div class="invoice-details">
            <div class="invoice-info">
              <div class="invoice-number">${invoiceTitle}: ${previewData.invoiceNumber}</div>
              <div class="label">Date:</div>
              <div class="value">${previewData.date}</div>
              <div class="label">Due Date:</div>
              <div class="value">${previewData.dueDate}</div>
            </div>
            
            <div class="customer-info">
              <div class="label">Bill To:</div>
              <div class="value">
                <strong>${previewData.customerName}</strong><br>
                ${previewData.customerEmail}<br>
                ${previewData.customerPhone}<br>
                ${previewData.customerAddress}
              </div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${previewData.items.map(item => `
                <tr>
                  <td class="item-name">${item.itemName}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price}</td>
                  <td class="amount">$${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${previewData.subtotal}</span>
            </div>
            <div class="total-row">
              <span>Tax (10%):</span>
              <span>$${previewData.tax}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span>$${previewData.total}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>${footerText}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const openPreview = () => {
    const previewWindow = window.open('', '_blank', 'width=800,height=600')
    if (previewWindow) {
      previewWindow.document.write(generatePreviewHTML())
      previewWindow.document.close()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Customization
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full gap-6">
          {/* Left Panel - Settings */}
          <div className="flex-1 overflow-y-auto pr-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="print">Print</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>

              <TabsContent value="layout" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="h-5 w-5" />
                      Layout Theme
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'tally', name: 'Tally Theme', description: 'Classic business layout' },
                        { id: 'landscape1', name: 'Landscape Theme 1', description: 'Wide format layout' },
                        { id: 'landscape2', name: 'Landscape Theme 2', description: 'Modern wide layout' },
                        { id: 'tax1', name: 'Tax Theme 1', description: 'Tax-compliant layout' },
                        { id: 'custom', name: 'Custom Theme', description: 'Fully customizable' }
                      ].map((theme) => (
                        <div
                          key={theme.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            invoiceSettings.layoutTheme === theme.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSettingChange('layoutTheme', theme.id)}
                        >
                          <div className="w-full h-16 bg-gray-100 rounded mb-2"></div>
                          <h4 className="font-medium">{theme.name}</h4>
                          <p className="text-sm text-gray-600">{theme.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input
                        value={invoiceSettings.companyName}
                        onChange={(e) => handleSettingChange('companyName', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Company Address</Label>
                      <Textarea
                        value={invoiceSettings.companyAddress}
                        onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={invoiceSettings.companyEmail}
                          onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={invoiceSettings.companyPhone}
                          onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Website (Optional)</Label>
                      <Input
                        value={invoiceSettings.companyWebsite || ''}
                        onChange={(e) => handleSettingChange('companyWebsite', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tax ID (Optional)</Label>
                      <Input
                        value={invoiceSettings.companyTaxId || ''}
                        onChange={(e) => handleSettingChange('companyTaxId', e.target.value)}
                        placeholder="Tax ID Number"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="colors" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Color Customization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Primary Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={invoiceSettings.customTheme.primaryColor}
                              onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={invoiceSettings.customTheme.primaryColor}
                              onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Secondary Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={invoiceSettings.customTheme.secondaryColor}
                              onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={invoiceSettings.customTheme.secondaryColor}
                              onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Background Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={invoiceSettings.customTheme.backgroundColor}
                              onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={invoiceSettings.customTheme.backgroundColor}
                              onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Text Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={invoiceSettings.customTheme.textColor}
                              onChange={(e) => handleThemeChange('textColor', e.target.value)}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={invoiceSettings.customTheme.textColor}
                              onChange={(e) => handleThemeChange('textColor', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Header Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={invoiceSettings.customTheme.headerColor}
                              onChange={(e) => handleThemeChange('headerColor', e.target.value)}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={invoiceSettings.customTheme.headerColor}
                              onChange={(e) => handleThemeChange('headerColor', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Border Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={invoiceSettings.customTheme.borderColor}
                              onChange={(e) => handleThemeChange('borderColor', e.target.value)}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={invoiceSettings.customTheme.borderColor}
                              onChange={(e) => handleThemeChange('borderColor', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="h-5 w-5" />
                      Content Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Invoice Title</Label>
                      <Input
                        value={invoiceSettings.invoiceTitle}
                        onChange={(e) => handleSettingChange('invoiceTitle', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <h4 className="font-medium">Invoice Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Invoice Number</Label>
                            <Switch
                              checked={invoiceSettings.showInvoiceNumber}
                              onCheckedChange={(checked) => handleSettingChange('showInvoiceNumber', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Date</Label>
                            <Switch
                              checked={invoiceSettings.showDate}
                              onCheckedChange={(checked) => handleSettingChange('showDate', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Due Date</Label>
                            <Switch
                              checked={invoiceSettings.showDueDate}
                              onCheckedChange={(checked) => handleSettingChange('showDueDate', checked)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Customer Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Customer Info</Label>
                            <Switch
                              checked={invoiceSettings.showCustomerInfo}
                              onCheckedChange={(checked) => handleSettingChange('showCustomerInfo', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Shipping Address</Label>
                            <Switch
                              checked={invoiceSettings.showShippingAddress}
                              onCheckedChange={(checked) => handleSettingChange('showShippingAddress', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Items Table</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Item Description</Label>
                            <Switch
                              checked={invoiceSettings.showItemDescription}
                              onCheckedChange={(checked) => handleSettingChange('showItemDescription', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Item Code</Label>
                            <Switch
                              checked={invoiceSettings.showItemCode}
                              onCheckedChange={(checked) => handleSettingChange('showItemCode', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Item Category</Label>
                            <Switch
                              checked={invoiceSettings.showItemCategory}
                              onCheckedChange={(checked) => handleSettingChange('showItemCategory', checked)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Item Tax</Label>
                            <Switch
                              checked={invoiceSettings.showItemTax}
                              onCheckedChange={(checked) => handleSettingChange('showItemTax', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Item Discount</Label>
                            <Switch
                              checked={invoiceSettings.showItemDiscount}
                              onCheckedChange={(checked) => handleSettingChange('showItemDiscount', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Item Total</Label>
                            <Switch
                              checked={invoiceSettings.showItemTotal}
                              onCheckedChange={(checked) => handleSettingChange('showItemTotal', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Totals Section</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Subtotal</Label>
                            <Switch
                              checked={invoiceSettings.showSubtotal}
                              onCheckedChange={(checked) => handleSettingChange('showSubtotal', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Tax</Label>
                            <Switch
                              checked={invoiceSettings.showTax}
                              onCheckedChange={(checked) => handleSettingChange('showTax', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Discount</Label>
                            <Switch
                              checked={invoiceSettings.showDiscount}
                              onCheckedChange={(checked) => handleSettingChange('showDiscount', checked)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Shipping</Label>
                            <Switch
                              checked={invoiceSettings.showShipping}
                              onCheckedChange={(checked) => handleSettingChange('showShipping', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Grand Total</Label>
                            <Switch
                              checked={invoiceSettings.showGrandTotal}
                              onCheckedChange={(checked) => handleSettingChange('showGrandTotal', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Footer</h4>
                      <div className="space-y-2">
                        <Label>Footer Text</Label>
                        <Textarea
                          value={invoiceSettings.footerText}
                          onChange={(e) => handleSettingChange('footerText', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Show Footer</Label>
                        <Switch
                          checked={invoiceSettings.showFooter}
                          onCheckedChange={(checked) => handleSettingChange('showFooter', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="print" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Printer className="h-5 w-5" />
                      Print Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Paper Size</Label>
                          <Select
                            value={invoiceSettings.paperSize}
                            onValueChange={(value) => handleSettingChange('paperSize', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A4">A4</SelectItem>
                              <SelectItem value="A5">A5</SelectItem>
                              <SelectItem value="Letter">Letter</SelectItem>
                              <SelectItem value="Legal">Legal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Orientation</Label>
                          <Select
                            value={invoiceSettings.orientation}
                            onValueChange={(value) => handleSettingChange('orientation', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Portrait">Portrait</SelectItem>
                              <SelectItem value="Landscape">Landscape</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <Select
                            value={invoiceSettings.fontFamily}
                            onValueChange={(value) => handleSettingChange('fontFamily', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                              <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                              <SelectItem value="Courier New, monospace">Courier New</SelectItem>
                              <SelectItem value="Georgia, serif">Georgia</SelectItem>
                              <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Font Size: {invoiceSettings.fontSize}px</Label>
                          <Slider
                            value={[invoiceSettings.fontSize]}
                            onValueChange={(value) => handleSettingChange('fontSize', value[0])}
                            min={8}
                            max={20}
                            step={1}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Margins (mm)</h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Top: {invoiceSettings.margins.top}mm</Label>
                            <Slider
                              value={[invoiceSettings.margins.top]}
                              onValueChange={(value) => handleMarginChange('top', value[0])}
                              min={10}
                              max={50}
                              step={5}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Bottom: {invoiceSettings.margins.bottom}mm</Label>
                            <Slider
                              value={[invoiceSettings.margins.bottom]}
                              onValueChange={(value) => handleMarginChange('bottom', value[0])}
                              min={10}
                              max={50}
                              step={5}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Left: {invoiceSettings.margins.left}mm</Label>
                            <Slider
                              value={[invoiceSettings.margins.left]}
                              onValueChange={(value) => handleMarginChange('left', value[0])}
                              min={10}
                              max={50}
                              step={5}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Right: {invoiceSettings.margins.right}mm</Label>
                            <Slider
                              value={[invoiceSettings.margins.right]}
                              onValueChange={(value) => handleMarginChange('right', value[0])}
                              min={10}
                              max={50}
                              step={5}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Advanced Settings</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Repeat Header on All Pages</Label>
                            <Switch
                              checked={invoiceSettings.repeatHeader}
                              onCheckedChange={(checked) => handleSettingChange('repeatHeader', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Page Numbers</Label>
                            <Switch
                              checked={invoiceSettings.showPageNumbers}
                              onCheckedChange={(checked) => handleSettingChange('showPageNumbers', checked)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Watermark</Label>
                            <Switch
                              checked={invoiceSettings.showWatermark}
                              onCheckedChange={(checked) => handleSettingChange('showWatermark', checked)}
                            />
                          </div>
                          {invoiceSettings.showWatermark && (
                            <div className="space-y-2">
                              <Label className="text-sm">Watermark Text</Label>
                              <Input
                                value={invoiceSettings.watermarkText}
                                onChange={(e) => handleSettingChange('watermarkText', e.target.value)}
                                placeholder="DRAFT"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Template Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Saved Templates</h4>
                      <Button onClick={handleSaveTemplate} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Save Current as Template
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-4 border rounded-lg flex items-center justify-between ${
                            invoiceSettings.activeTemplate === template.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <h5 className="font-medium">{template.name}</h5>
                              <p className="text-sm text-gray-600">
                                {template.isDefault ? 'Default Template' : 'Custom Template'}
                              </p>
                            </div>
                            {template.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLoadTemplate(template.id)}
                              disabled={invoiceSettings.activeTemplate === template.id}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Load
                            </Button>
                            {!template.isDefault && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteTemplate(template.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => dispatch(setDefaultTemplate(template.id))}
                                >
                                  Set Default
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-96 flex flex-col">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Preview</span>
                  <Button onClick={openPreview} size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Open Preview
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border rounded-lg p-4 text-sm h-full overflow-auto">
                  <div className="text-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold" style={{ color: invoiceSettings.customTheme.primaryColor }}>
                      {invoiceSettings.companyName}
                    </h2>
                    <p className="text-xs text-gray-600">{invoiceSettings.companyAddress}</p>
                    <p className="text-xs text-gray-600">Phone: {invoiceSettings.companyPhone}</p>
                    <p className="text-xs text-gray-600">Email: {invoiceSettings.companyEmail}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold mb-2">Invoice Details:</h4>
                      <p className="text-xs">Invoice: {previewData.invoiceNumber}</p>
                      <p className="text-xs">Date: {previewData.date}</p>
                      <p className="text-xs">Due: {previewData.dueDate}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Bill To:</h4>
                      <p className="text-xs font-medium">{previewData.customerName}</p>
                      <p className="text-xs">{previewData.customerEmail}</p>
                      <p className="text-xs">{previewData.customerAddress}</p>
                    </div>
                  </div>
                  
                  <div className="border rounded mb-4">
                    <table className="w-full text-xs">
                      <thead style={{ backgroundColor: invoiceSettings.customTheme.headerColor }}>
                        <tr>
                          <th className="p-2 text-left">Item</th>
                          <th className="p-2 text-left">Qty</th>
                          <th className="p-2 text-left">Price</th>
                          <th className="p-2 text-left">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.items.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{item.itemName}</td>
                            <td className="p-2">{item.quantity}</td>
                            <td className="p-2">{formatCurrency(item.price)}</td>
                            <td className="p-2">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="text-right space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(previewData.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>{formatCurrency(previewData.tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total:</span>
                      <span>{formatCurrency(previewData.total)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center text-xs text-gray-600">
                    <p>{invoiceSettings.footerText}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleResetToDefault} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button onClick={handleOpenPreview} variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Open Preview
              </Button>
              <Button onClick={handleSaveSettings} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 