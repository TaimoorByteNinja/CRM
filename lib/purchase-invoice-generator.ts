import { store } from "./store"
import { selectInvoiceSettings, selectGeneralSettings } from "./store/slices/settingsSlice"
import { CurrencyManager } from "./currency-manager"

interface PurchaseOrder {
  id: string
  billNumber: string
  date: string
  expectedDate: string
  supplierName: string
  supplierPhone: string
  supplierEmail: string
  supplierAddress: string
  supplierGSTIN?: string
  items: PurchaseItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount: number
  total: number
  status: "draft" | "ordered" | "received" | "paid" | "cancelled"
  paymentStatus: "pending" | "partial" | "paid"
  paymentMethod: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface PurchaseItem {
  id: string
  name: string
  description?: string
  quantity: number
  unit?: string
  unitPrice: number
  discount?: number
  tax?: number
  total: number
}

export const generatePurchaseInvoicePDF = (purchase: PurchaseOrder) => {
  const invoiceWindow = window.open('', '_blank', 'width=800,height=600')
  if (!invoiceWindow) {
    alert('Please allow popups to generate invoice')
    return
  }

  // Get settings from Redux store
  const state = store.getState()
  const invoiceSettings = selectInvoiceSettings(state)
  const generalSettings = selectGeneralSettings(state)
  
  const currencyManager = CurrencyManager.getInstance()
  currencyManager.setCurrency(generalSettings.selectedCountry || 'IN')
  
  const formatCurrency = (amount: number) => {
    return currencyManager.formatAmountWithSymbol(amount)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Purchase Order ${purchase.billNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 5px; }
        .company-tagline { color: #6b7280; font-size: 14px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .invoice-info, .supplier-info { flex: 1; }
        .invoice-number { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
        .label { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .value { color: #6b7280; margin-bottom: 10px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #f9fafb; padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151; }
        .items-table td { padding: 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; }
        .items-table .item-name { font-weight: bold; color: #1f2937; }
        .items-table .amount { text-align: right; font-weight: bold; color: #1f2937; }
        .totals { text-align: right; margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16px; }
        .total-row.grand-total { font-size: 20px; font-weight: bold; color: #1f2937; border-top: 2px solid #e5e7eb; padding-top: 10px; margin-top: 10px; }
        .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .status-received { background: #dcfce7; color: #166534; }
        .status-ordered { background: #dbeafe; color: #1e40af; }
        .status-paid { background: #f3f4f6; color: #374151; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        @media print { body { background: white; } .invoice-container { box-shadow: none; border: 1px solid #e5e7eb; } }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-name">Your Company Name</div>
          <div class="company-tagline">Professional Business Solutions</div>
        </div>
        <div class="invoice-details">
          <div class="invoice-info">
            <div class="invoice-number">Purchase Order: ${purchase.billNumber}</div>
            <div class="label">Order Date:</div>
            <div class="value">${formatDate(purchase.date)}</div>
            <div class="label">Expected Date:</div>
            <div class="value">${formatDate(purchase.expectedDate)}</div>
            <div class="label">Status:</div>
            <div class="value"><span class="status-badge status-${purchase.status}">${purchase.status}</span></div>
          </div>
          <div class="supplier-info">
            <div class="label">Supplier:</div>
            <div class="value">
              <strong>${purchase.supplierName}</strong><br>
              ${purchase.supplierEmail}<br>
              ${purchase.supplierPhone}<br>
              ${purchase.supplierAddress}
            </div>
          </div>
        </div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${purchase.items.map((item: PurchaseItem) => `
              <tr>
                <td class="item-name">${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unitPrice)}</td>
                <td class="amount">${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(purchase.subtotal)}</span>
          </div>
          <div class="total-row">
            <span>Tax (${purchase.taxRate}%):</span>
            <span>${formatCurrency(purchase.tax)}</span>
          </div>
          ${purchase.discount > 0 ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>-${formatCurrency(purchase.discount)}</span>
            </div>
          ` : ''}
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>${formatCurrency(purchase.total)}</span>
          </div>
        </div>
        ${purchase.notes ? `
          <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <div style="font-weight: bold; margin-bottom: 10px; color: #374151;">Notes:</div>
            <div style="color: #6b7280;">${purchase.notes}</div>
          </div>
        ` : ''}
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer generated purchase order. No signature required.</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 1000);
        };
      </script>
    </body>
    </html>
  `
  invoiceWindow.document.write(invoiceHTML)
  invoiceWindow.document.close()
} 