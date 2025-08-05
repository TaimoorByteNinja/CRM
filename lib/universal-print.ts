import { store } from "./store"
import { selectInvoiceSettings, selectGeneralSettings } from "./store/slices/settingsSlice"
import { useCurrency } from "./currency-manager"

export type PrintableDocument = {
  id: string
  documentNumber: string
  documentType: 'INVOICE' | 'PURCHASE_ORDER' | 'EXPENSE_RECEIPT' | 'QUOTATION' | 'DELIVERY_NOTE'
  date: string
  dueDate?: string
  
  // Party Information
  partyName: string
  partyEmail?: string
  partyPhone?: string
  partyAddress?: string
  
  // Items
  items: Array<{
    id: string
    name: string
    description?: string
    code?: string
    category?: string
    quantity: number
    unit?: string
    unitPrice: number
    discount?: number
    tax?: number
    total: number
  }>
  
  // Totals
  subtotal: number
  totalDiscount?: number
  totalTax: number
  shippingCost?: number
  total: number
  
  // Additional Information
  notes?: string
  terms?: string
  status?: string
  paymentMethod?: string
  paymentStatus?: string
  type?: 'sale' | 'purchase' | 'expense'
}

export class UniversalPrintManager {
  private static instance: UniversalPrintManager
  
  static getInstance(): UniversalPrintManager {
    if (!UniversalPrintManager.instance) {
      UniversalPrintManager.instance = new UniversalPrintManager()
    }
    return UniversalPrintManager.instance
  }
  
  private getSettings() {
    const state = store.getState()
    const invoiceSettings = selectInvoiceSettings(state)
    const generalSettings = selectGeneralSettings(state)
    return { invoiceSettings, generalSettings }
  }
  
  private formatCurrency(amount: number | undefined | null): string {
    // Handle undefined/null amounts
    if (amount === undefined || amount === null || isNaN(amount)) {
      amount = 0
    }
    const { generalSettings } = this.getSettings()
    const currencyManager = new (require('./currency-manager').CurrencyManager)()
    return currencyManager.formatAmountWithSymbol(amount)
  }
  
  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }
  
  private getDocumentTitle(document: PrintableDocument): string {
    const { invoiceSettings } = this.getSettings()
    const typeMap = {
      'INVOICE': invoiceSettings.invoiceTitle || 'Invoice',
      'PURCHASE_ORDER': 'Purchase Order',
      'EXPENSE_RECEIPT': 'Expense Receipt', 
      'QUOTATION': 'Quotation',
      'DELIVERY_NOTE': 'Delivery Note'
    }
    return typeMap[document.documentType] || 'Document'
  }
  
  private getPartyLabel(document: PrintableDocument): string {
    const labelMap = {
      'INVOICE': 'Bill To',
      'PURCHASE_ORDER': 'Supplier',
      'EXPENSE_RECEIPT': 'Vendor',
      'QUOTATION': 'Quote For',
      'DELIVERY_NOTE': 'Deliver To'
    }
    return labelMap[document.documentType] || 'Party'
  }
  
  private generateInvoiceHTML(document: PrintableDocument): string {
    const { invoiceSettings, generalSettings } = this.getSettings()
    const documentTitle = this.getDocumentTitle(document)
    const partyLabel = this.getPartyLabel(document)
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${invoiceSettings.showInvoiceNumber ? `${documentTitle} ${document.documentNumber}` : documentTitle}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: ${invoiceSettings.fontFamily || 'Arial, sans-serif'};
            margin: ${invoiceSettings.margins?.top || 20}px ${invoiceSettings.margins?.right || 20}px ${invoiceSettings.margins?.bottom || 20}px ${invoiceSettings.margins?.left || 20}px;
            padding: 0;
            background: ${invoiceSettings.customTheme?.backgroundColor || 'white'};
            color: ${invoiceSettings.customTheme?.textColor || '#333'};
            font-size: ${invoiceSettings.fontSize || 14}px;
            line-height: 1.6;
          }
          .invoice-container {
            max-width: 100%;
            margin: 0 auto;
            background: ${invoiceSettings.customTheme?.backgroundColor || 'white'};
            padding: 30px;
            ${invoiceSettings.showWatermark ? `position: relative;` : ''}
          }
          ${invoiceSettings.showWatermark ? `
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px;
            color: ${invoiceSettings.customTheme?.primaryColor || '#e5e7eb'};
            opacity: ${invoiceSettings.watermarkOpacity || 0.1};
            pointer-events: none;
            z-index: 1;
            font-weight: bold;
          }
          ` : ''}
          .header {
            ${invoiceSettings.showCompanyLogo || invoiceSettings.showCompanyAddress || invoiceSettings.showCompanyContact ? 'text-align: center;' : 'display: none;'}
            border-bottom: 2px solid ${invoiceSettings.customTheme?.borderColor || '#e5e7eb'};
            padding-bottom: 20px;
            margin-bottom: 30px;
            background: ${invoiceSettings.customTheme?.headerColor || '#f8fafc'};
            padding: 20px;
            border-radius: 8px;
            position: relative;
            z-index: 2;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: ${invoiceSettings.customTheme?.primaryColor || '#1f2937'};
            margin-bottom: 5px;
            ${!invoiceSettings.showCompanyLogo ? 'display: none;' : ''}
          }
          .company-info {
            color: ${invoiceSettings.customTheme?.secondaryColor || '#6b7280'};
            font-size: 14px;
            ${!invoiceSettings.showCompanyAddress && !invoiceSettings.showCompanyContact ? 'display: none;' : ''}
          }
          .document-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 40px;
            position: relative;
            z-index: 2;
          }
          .document-info, .party-info {
            flex: 1;
          }
          .document-number {
            font-size: 20px;
            font-weight: bold;
            color: ${invoiceSettings.customTheme?.primaryColor || '#1f2937'};
            margin-bottom: 15px;
            ${!invoiceSettings.showInvoiceNumber ? 'display: none;' : ''}
          }
          .label {
            font-weight: bold;
            color: ${invoiceSettings.customTheme?.primaryColor || '#1f2937'};
            margin-bottom: 5px;
            font-size: 13px;
            text-transform: uppercase;
          }
          .value {
            color: ${invoiceSettings.customTheme?.secondaryColor || '#374151'};
            margin-bottom: 15px;
            font-size: 14px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            border: 1px solid ${invoiceSettings.customTheme?.borderColor || '#e5e7eb'};
            position: relative;
            z-index: 2;
          }
          .items-table th {
            background: ${invoiceSettings.customTheme?.headerColor || '#f8fafc'};
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid ${invoiceSettings.customTheme?.borderColor || '#e5e7eb'};
            color: ${invoiceSettings.customTheme?.primaryColor || '#1f2937'};
            font-weight: bold;
            font-size: 13px;
            text-transform: uppercase;
          }
          .items-table td {
            padding: 12px 15px;
            border-bottom: 1px solid ${invoiceSettings.customTheme?.borderColor || '#e5e7eb'};
            vertical-align: top;
          }
          .items-table tr:nth-child(even) {
            background-color: ${invoiceSettings.customTheme?.backgroundColor || '#f9fafb'};
          }
          .totals {
            width: 350px;
            margin-left: auto;
            border: 1px solid ${invoiceSettings.customTheme?.borderColor || '#e5e7eb'};
            border-radius: 8px;
            overflow: hidden;
            position: relative;
            z-index: 2;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 20px;
            border-bottom: 1px solid ${invoiceSettings.customTheme?.borderColor || '#e5e7eb'};
          }
          .total-row:last-child {
            border-bottom: none;
            background: ${invoiceSettings.customTheme?.headerColor || '#f8fafc'};
            font-weight: bold;
            color: ${invoiceSettings.customTheme?.primaryColor || '#1f2937'};
            font-size: 16px;
          }
          .footer {
            ${invoiceSettings.showFooter ? 'text-align: center;' : 'display: none;'}
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid ${invoiceSettings.customTheme?.borderColor || '#e5e7eb'};
            color: ${invoiceSettings.customTheme?.secondaryColor || '#6b7280'};
            font-size: 12px;
            position: relative;
            z-index: 2;
          }
          .signature-section {
            ${invoiceSettings.showSignature ? 'margin-top: 40px;' : 'display: none;'}
            text-align: right;
            position: relative;
            z-index: 2;
          }
          .notes-section {
            ${invoiceSettings.showNotes ? 'margin-top: 30px;' : 'display: none;'}
            padding: 15px;
            background: ${invoiceSettings.customTheme?.headerColor || '#f8fafc'};
            border-radius: 8px;
            border-left: 4px solid ${invoiceSettings.customTheme?.primaryColor || '#3b82f6'};
            position: relative;
            z-index: 2;
          }
          @media print {
            body { 
              margin: 0; 
              padding: ${invoiceSettings.margins?.top || 15}px ${invoiceSettings.margins?.right || 15}px ${invoiceSettings.margins?.bottom || 15}px ${invoiceSettings.margins?.left || 15}px; 
              font-size: ${(invoiceSettings.fontSize || 14) - 2}px;
            }
            .invoice-container { 
              padding: 0;
              max-width: none;
            }
            ${invoiceSettings.showPageNumbers ? `
            @page {
              @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
                font-size: 10px;
                color: ${invoiceSettings.customTheme?.secondaryColor || '#6b7280'};
              }
            }
            ` : ''}
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          ${invoiceSettings.showWatermark ? `<div class="watermark">${invoiceSettings.watermarkText || 'INVOICE'}</div>` : ''}
          
          ${invoiceSettings.showCompanyLogo || invoiceSettings.showCompanyAddress || invoiceSettings.showCompanyContact ? `
          <div class="header">
            ${invoiceSettings.showCompanyLogo ? `<div class="company-name">${invoiceSettings.companyName || 'craft CRM'}</div>` : ''}
            <div class="company-info">
              ${invoiceSettings.showCompanyAddress && invoiceSettings.companyAddress ? `${invoiceSettings.companyAddress}<br>` : ''}
              ${invoiceSettings.showCompanyContact ? `
                ${invoiceSettings.companyPhone ? `Phone: ${invoiceSettings.companyPhone}` : ''}
                ${invoiceSettings.companyPhone && invoiceSettings.companyEmail ? ' | ' : ''}
                ${invoiceSettings.companyEmail ? `Email: ${invoiceSettings.companyEmail}` : ''}
                ${(invoiceSettings.companyPhone || invoiceSettings.companyEmail) && invoiceSettings.showWebsite && invoiceSettings.companyWebsite ? '<br>' : ''}
                ${invoiceSettings.showWebsite && invoiceSettings.companyWebsite ? `Website: ${invoiceSettings.companyWebsite}` : ''}
                ${(invoiceSettings.companyPhone || invoiceSettings.companyEmail || invoiceSettings.companyWebsite) && invoiceSettings.showTaxId && invoiceSettings.companyTaxId ? '<br>' : ''}
                ${invoiceSettings.showTaxId && invoiceSettings.companyTaxId ? `Tax ID: ${invoiceSettings.companyTaxId}` : ''}
              ` : ''}
            </div>
          </div>
          ` : ''}
          
          <div class="document-details">
            <div class="document-info">
              ${invoiceSettings.showInvoiceNumber ? `<div class="document-number">${invoiceSettings.invoiceTitle || documentTitle} #${document.documentNumber}</div>` : ''}
              ${invoiceSettings.showDate ? `
                <div class="label">Date:</div>
                <div class="value">${this.formatDate(document.date)}</div>
              ` : ''}
              ${invoiceSettings.showDueDate && document.dueDate ? `
                <div class="label">Due Date:</div>
                <div class="value">${this.formatDate(document.dueDate)}</div>
              ` : ''}
            </div>
            
            ${invoiceSettings.showCustomerInfo ? `
            <div class="party-info">
              <div class="label">${partyLabel}:</div>
              <div class="value">
                <strong>${document.partyName}</strong><br>
                ${document.partyEmail ? `${document.partyEmail}<br>` : ''}
                ${document.partyPhone ? `${document.partyPhone}<br>` : ''}
                ${document.partyAddress ? `${document.partyAddress}` : ''}
              </div>
            </div>
            ` : ''}
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 40%;">Item</th>
                ${invoiceSettings.showItemCode ? '<th style="width: 15%;">Code</th>' : ''}
                <th style="width: 10%;">Qty</th>
                <th style="width: 15%;">Price</th>
                ${invoiceSettings.showItemDiscount ? '<th style="width: 10%;">Discount</th>' : ''}
                ${invoiceSettings.showItemTax ? '<th style="width: 10%;">Tax</th>' : ''}
                <th style="width: 15%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${document.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.name}</strong>
                    ${invoiceSettings.showItemDescription && item.description ? `<br><small style="color: ${invoiceSettings.customTheme?.secondaryColor || '#6b7280'};">${item.description}</small>` : ''}
                    ${invoiceSettings.showItemCategory && item.category ? `<br><small style="color: ${invoiceSettings.customTheme?.secondaryColor || '#6b7280'};">Category: ${item.category}</small>` : ''}
                  </td>
                  ${invoiceSettings.showItemCode ? `<td>${item.code || '-'}</td>` : ''}
                  <td>${item.quantity}</td>
                  <td>${this.formatCurrency(item.unitPrice)}</td>
                  ${invoiceSettings.showItemDiscount ? `<td>${item.discount ? this.formatCurrency(item.discount) : '-'}</td>` : ''}
                  ${invoiceSettings.showItemTax ? `<td>${item.tax ? this.formatCurrency(item.tax) : '-'}</td>` : ''}
                  <td style="text-align: right;"><strong>${this.formatCurrency(item.total)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            ${invoiceSettings.showSubtotal ? `
            <div class="total-row">
              <span>Sub Total:</span>
              <span>${this.formatCurrency(document.subtotal)}</span>
            </div>
            ` : ''}
            ${invoiceSettings.showDiscount && document.totalDiscount && document.totalDiscount > 0 ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>-${this.formatCurrency(document.totalDiscount)}</span>
            </div>
            ` : ''}
            ${invoiceSettings.showTax && document.totalTax > 0 ? `
              <div class="total-row">
                <span>Tax:</span>
                <span>${this.formatCurrency(document.totalTax)}</span>
              </div>
            ` : ''}
            ${invoiceSettings.showShipping && document.shippingCost && document.shippingCost > 0 ? `
            <div class="total-row">
              <span>Shipping:</span>
              <span>${this.formatCurrency(document.shippingCost)}</span>
            </div>
            ` : ''}
            ${invoiceSettings.showGrandTotal ? `
            <div class="total-row">
              <span>Total:</span>
              <span>${this.formatCurrency(document.total)}</span>
            </div>
            ` : ''}
          </div>
          
          ${invoiceSettings.showNotes ? `
          <div class="notes-section">
            <div class="label">Notes:</div>
            <div style="margin-top: 10px; color: ${invoiceSettings.customTheme?.textColor || '#374151'};">
              ${document.notes || 'Thank you for your business!'}
            </div>
          </div>
          ` : ''}
          
          ${invoiceSettings.showSignature ? `
          <div class="signature-section">
            <div style="margin-top: 60px; border-top: 2px solid ${invoiceSettings.customTheme?.borderColor || '#e5e7eb'}; padding-top: 10px; width: 200px; margin-left: auto;">
              <div style="text-align: center; color: ${invoiceSettings.customTheme?.primaryColor || '#1f2937'}; font-weight: bold;">
                ${invoiceSettings.signatureText || 'Authorized Signature'}
              </div>
            </div>
          </div>
          ` : ''}
          
          ${invoiceSettings.showFooter ? `
          <div class="footer">
            <p><strong>${invoiceSettings.footerText || 'Thank you for your business!'}</strong></p>
            <p>Generated on ${this.formatDate(new Date().toISOString())} • ${invoiceSettings.companyName || 'craft CRM'}</p>
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `
  }
  
  public printDocument(document: PrintableDocument): void {
    const html = this.generateInvoiceHTML(document)
    
    // For better Electron compatibility, always use new window approach
    this.printInElectronDirect(html)
  }

  private printInElectronDirect(html: string): void {
    // Create a new window with the invoice content for better printing
    const newWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes')
    
    if (!newWindow) {
      // Fallback to download if popup blocked
      this.downloadHTML(html)
      return
    }

    // Write complete HTML document with proper structure
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice Print Preview</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif;
          }
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
          }
          .print-controls {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
            background: white;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .print-controls button {
            margin: 0 5px;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          .print-btn {
            background-color: #007bff;
            color: white;
          }
          .download-btn {
            background-color: #28a745;
            color: white;
          }
        </style>
      </head>
      <body>
        <div class="print-controls no-print">
          <button class="print-btn" onclick="window.print()">Print</button>
          <button class="download-btn" onclick="downloadHTML()">Download HTML</button>
          <button onclick="window.close()">Close</button>
        </div>
        ${html}
        <script>
          function downloadHTML() {
            const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'invoice.html';
            a.click();
            URL.revokeObjectURL(url);
          }
        </script>
      </body>
      </html>
    `

    // Write the content to the new window
    newWindow.document.write(fullHTML)
    newWindow.document.close()

    // Wait for content to load, then focus
    newWindow.onload = () => {
      newWindow.focus()
      // Auto-print after a short delay
      setTimeout(() => {
        if (confirm('Ready to print. Click OK to open print dialog.')) {
          newWindow.print()
        }
      }, 500)
    }
  }

  // Add a method to offer both print and download options
  private showPrintOptions(html: string): void {
    const choice = confirm('Choose printing method:\n\nOK = Print directly\nCancel = Download HTML file to print later')
    
    if (choice) {
      this.printInElectronDirect(html)
    } else {
      this.downloadHTML(html)
    }
  }

  private printInElectron(html: string): void {
    // Create a hidden iframe to hold the content
    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.top = '-1000px'
    iframe.style.left = '-1000px'
    iframe.style.width = '800px'
    iframe.style.height = '600px'
    
    document.body.appendChild(iframe)
    
    // Write content to iframe
    const iframeDoc = iframe.contentWindow?.document
    if (iframeDoc) {
      iframeDoc.open()
      iframeDoc.write(html)
      iframeDoc.close()
      
      // Wait for content to load
      setTimeout(() => {
        try {
          // Try to print using iframe
          iframe.contentWindow?.print()
        } catch (error) {
          console.error('Print failed:', error)
          // Fallback: download as file
          this.downloadHTML(html)
        }
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 1000)
      }, 500)
    } else {
      // Fallback: download as file
      this.downloadHTML(html)
      document.body.removeChild(iframe)
    }
  }

  private downloadHTML(html: string): void {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'invoice.html'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('Invoice downloaded as HTML file. You can open it in your browser to print.')
  }

  private printInBrowser(html: string): void {
    // Create a new window with the invoice content
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    
    if (!printWindow) {
      alert('Please allow popups to print the document')
      return
    }
    
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }
}

// Convenience functions for printing documents
export const printSaleInvoice = (sale: any) => {
  // Debug: Log the sale data to see what we're working with
  console.log('Sale data for printing:', sale)
  
  const printManager = UniversalPrintManager.getInstance()
  
  // Use real sale data, only fall back to samples if absolutely no data exists
  const hasRealItems = sale.items && Array.isArray(sale.items) && sale.items.length > 0
  
  const document: PrintableDocument = {
    id: sale.id || '',
    documentNumber: sale.invoice_number || sale.invoiceNumber || 'INV-001',
    documentType: 'INVOICE',
    date: sale.invoice_date || sale.createdAt || sale.created_at || new Date().toISOString(),
    dueDate: sale.due_date || sale.dueDate,
    partyName: sale.customer_name || sale.customerName || sale.party_name || 'Customer',
    partyEmail: sale.customer_email || sale.customerEmail || '',
    partyPhone: sale.customer_phone || sale.customerPhone || '',
    partyAddress: sale.customer_address || sale.customerAddress || '',
    items: hasRealItems ? sale.items.map((item: any) => ({
      id: item.id || '',
      name: item.item_name || item.itemName || 'Item',
      description: item.description || '',
      quantity: Number(item.quantity) || 1,
      unit: item.unit || '',
      unitPrice: Number(item.unit_price || item.price) || 0,
      discount: Number(item.discount_amount || item.discount) || 0,
      tax: Number(item.tax_amount || item.tax) || 0,
      total: Number(item.total_amount || item.total) || (Number(item.quantity) || 1) * (Number(item.unit_price || item.price) || 0)
    })) : [
      {
        id: '1',
        name: 'Sample Product',
        description: 'No items found in sale data',
        quantity: 1,
        unit: '',
        unitPrice: Number(sale.total_amount || sale.total) || 0,
        discount: 0,
        tax: 0,
        total: Number(sale.total_amount || sale.total) || 0
      }
    ],
    subtotal: Number(sale.subtotal) || Number(sale.total_amount || sale.total) || 0,
    totalDiscount: Number(sale.discount_amount || sale.discount) || 0,
    totalTax: Number(sale.tax_amount || sale.tax) || 0,
    total: Number(sale.total_amount || sale.total) || 0,
    notes: sale.notes || '',
    status: sale.payment_status || sale.status || 'Pending',
    paymentMethod: sale.paymentMethod || '',
    paymentStatus: sale.payment_status || sale.paymentStatus || 'Pending'
  }
  
  // Debug: Log the processed document
  console.log('Processed document for printing:', document)
  
  printManager.printDocument(document)
}

export const printPurchaseOrder = (purchase: any) => {
  const printManager = UniversalPrintManager.getInstance()
  
  const document: PrintableDocument = {
    id: purchase.id || '',
    documentNumber: purchase.purchaseNumber || purchase.purchase_number || 'PO-001',
    documentType: 'PURCHASE_ORDER',
    date: purchase.createdAt || purchase.created_at || new Date().toISOString(),
    dueDate: purchase.dueDate || purchase.due_date,
    partyName: purchase.supplierName || purchase.party_name || 'Supplier',
    partyEmail: purchase.supplierEmail || '',
    partyPhone: purchase.supplierPhone || '',
    partyAddress: purchase.supplierAddress || '',
    items: (purchase.items || []).map((item: any) => ({
      id: item.id || '',
      name: item.itemName || item.item_name || 'Item',
      description: item.description || '',
      quantity: Number(item.quantity) || 0,
      unit: item.unit || '',
      unitPrice: Number(item.price || item.unit_price) || 0,
      discount: Number(item.discount || item.discount_amount) || 0,
      tax: Number(item.tax || item.tax_amount) || 0,
      total: Number(item.total || item.total_amount) || 0
    })),
    subtotal: Number(purchase.subtotal) || 0,
    totalDiscount: Number(purchase.discount || purchase.discount_amount) || 0,
    totalTax: Number(purchase.tax || purchase.tax_amount) || 0,
    total: Number(purchase.total || purchase.total_amount) || 0,
    notes: purchase.notes || '',
    status: purchase.status || 'Pending',
    paymentMethod: purchase.paymentMethod || '',
    paymentStatus: purchase.paymentStatus || purchase.payment_status || 'Pending'
  }
  
  printManager.printDocument(document)
}

export const printExpenseReceipt = (expense: any) => {
  const printManager = UniversalPrintManager.getInstance()
  
  const document: PrintableDocument = {
    id: expense.id || '',
    documentNumber: expense.expenseNumber || expense.expense_number || expense.id || 'EXP-001',
    documentType: 'EXPENSE_RECEIPT',
    date: expense.createdAt || expense.created_at || expense.date || new Date().toISOString(),
    partyName: expense.vendor || expense.party_name || 'General Expense',
    partyEmail: expense.vendorEmail || '',
    partyPhone: expense.vendorPhone || '',
    partyAddress: expense.vendorAddress || '',
    items: [{
      id: '1',
      name: expense.description || expense.category || 'Expense Item',
      description: expense.notes || '',
      quantity: 1,
      unit: '',
      unitPrice: Number(expense.amount) || 0,
      discount: 0,
      tax: Number(expense.tax) || 0,
      total: Number(expense.amount) || 0
    }],
    subtotal: Number(expense.amount) || 0,
    totalDiscount: 0,
    totalTax: Number(expense.tax) || 0,
    total: Number(expense.amount) || 0,
    notes: expense.notes || '',
    status: expense.status || 'Paid',
    paymentMethod: expense.paymentMethod || 'Cash'
  }
  
  printManager.printDocument(document)
}

export const printInventoryReport = (items: any[]) => {
  const printManager = UniversalPrintManager.getInstance()
  
  const document: PrintableDocument = {
    id: 'inventory-report',
    documentNumber: `INV-${new Date().getTime()}`,
    documentType: 'DELIVERY_NOTE', // Using delivery note template for inventory
    date: new Date().toISOString(),
    partyName: 'Inventory Report',
    items: items.map((item, index) => ({
      id: item.id || index.toString(),
      name: item.name || item.item_name,
      description: `SKU: ${item.sku || item.item_code || 'N/A'}`,
      quantity: item.stock || item.current_stock || 0,
      unit: item.unit || 'pcs',
      unitPrice: item.price || item.sale_price || 0,
      total: (item.stock || item.current_stock || 0) * (item.price || item.sale_price || 0)
    })),
    subtotal: items.reduce((sum, item) => sum + ((item.stock || item.current_stock || 0) * (item.price || item.sale_price || 0)), 0),
    totalTax: 0,
    total: items.reduce((sum, item) => sum + ((item.stock || item.current_stock || 0) * (item.price || item.sale_price || 0)), 0),
    notes: `Generated on ${new Date().toLocaleDateString()} - Total Items: ${items.length}`
  }
  
  printManager.printDocument(document)
}
