import { Sale as ContextSale } from "./sales-context"
import { Sale as SliceSale } from "./store/slices/salesSlice"
import { store } from "./store"
import { selectInvoiceSettings, selectGeneralSettings } from "./store/slices/settingsSlice"
import { formatCurrencyWithSymbol } from "./country-data"

// Function to convert SliceSale to ContextSale for invoice generation
function convertSaleForInvoice(sale: SliceSale): ContextSale {
  return {
    id: sale.id,
    invoiceNumber: sale.invoice_number || sale.invoiceNumber,
    customerId: sale.party_id || sale.customerId,
    customerName: sale.party_name || sale.customerName,
    customerEmail: sale.customerEmail || '',
    customerPhone: sale.customerPhone || '',
    customerAddress: sale.customerAddress || '',
    shipping: false, // Boolean as per ContextSale interface
    items: (sale.items || []).map(item => ({
      id: item.id || '',
      itemId: item.item_id || item.itemId,
      itemCode: item.item_id || item.itemId, // Adding itemCode property
      itemName: item.item_name || item.itemName,
      quantity: item.quantity,
      price: item.unit_price || item.price,
      tax: item.tax_rate || 0, // Adding tax property
      discount: item.discount_amount || item.discount || 0,
      total: item.total_amount || item.total,
    })),
    subtotal: sale.subtotal,
    tax: sale.tax_amount || sale.tax,
    taxRate: sale.taxRate || 0,
    discount: sale.discount_amount || sale.discount,
    total: sale.total_amount || sale.total,
    status: sale.status as "draft" | "sent" | "paid" | "overdue",
    paymentMethod: sale.paymentMethod,
    paymentStatus: (() => {
      const status = sale.payment_status || sale.paymentStatus;
      // Map 'partial' and 'unpaid' to 'pending' to match ContextSale interface
      if (status === 'partial' || status === 'unpaid') return 'pending';
      return status as "paid" | "pending";
    })(),
    dueDate: sale.due_date || sale.dueDate,
    createdAt: sale.created_at || sale.createdAt,
    notes: sale.notes || '',
  };
}

export const generateInvoicePDF = (sale: SliceSale | ContextSale) => {
  // Convert SliceSale to ContextSale if needed
  const invoiceSale: ContextSale = 'invoice_number' in sale ? convertSaleForInvoice(sale as SliceSale) : sale as ContextSale;
  // Get settings from Redux store
  const state = store.getState()
  const invoiceSettings = selectInvoiceSettings(state)
  const generalSettings = selectGeneralSettings(state)
  
  // Create a new window for the invoice
  const invoiceWindow = window.open('', '_blank', 'width=800,height=600')
  
  if (!invoiceWindow) {
    alert('Please allow popups to generate invoice')
    return
  }

  const formatCurrency = (amount: number) => {
    return formatCurrencyWithSymbol(amount, {
      code: generalSettings.selectedCurrency,
      symbol: generalSettings.selectedCurrencySymbol,
      name: "",
      position: "before"
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${invoiceSettings.invoiceTitle} ${invoiceSale.invoiceNumber}</title>
      <style>
        body {
          font-family: ${invoiceSettings.fontFamily};
          margin: 0;
          padding: ${invoiceSettings.margins.top}px ${invoiceSettings.margins.right}px ${invoiceSettings.margins.bottom}px ${invoiceSettings.margins.left}px;
          background: ${invoiceSettings.customTheme.backgroundColor};
          color: ${invoiceSettings.customTheme.textColor};
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
          border-bottom: 2px solid ${invoiceSettings.customTheme.borderColor};
          padding-bottom: 20px;
          margin-bottom: 30px;
          background: ${invoiceSettings.customTheme.headerColor};
          padding: 20px;
          border-radius: 8px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: ${invoiceSettings.customTheme.primaryColor};
          margin-bottom: 5px;
        }
        .company-info {
          color: ${invoiceSettings.customTheme.secondaryColor};
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
          color: ${invoiceSettings.customTheme.primaryColor};
          margin-bottom: 10px;
        }
        .label {
          font-weight: bold;
          color: ${invoiceSettings.customTheme.primaryColor};
          margin-bottom: 5px;
        }
        .value {
          color: ${invoiceSettings.customTheme.secondaryColor};
          margin-bottom: 10px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th {
          background: ${invoiceSettings.customTheme.headerColor};
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid ${invoiceSettings.customTheme.borderColor};
          font-weight: bold;
          color: ${invoiceSettings.customTheme.primaryColor};
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid ${invoiceSettings.customTheme.borderColor};
          color: ${invoiceSettings.customTheme.secondaryColor};
        }
        .items-table .item-name {
          font-weight: bold;
          color: ${invoiceSettings.customTheme.primaryColor};
        }
        .items-table .amount {
          text-align: right;
          font-weight: bold;
          color: ${invoiceSettings.customTheme.primaryColor};
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
          color: ${invoiceSettings.customTheme.primaryColor};
          border-top: 2px solid ${invoiceSettings.customTheme.borderColor};
          padding-top: 10px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: ${invoiceSettings.customTheme.secondaryColor};
          font-size: 12px;
          border-top: 1px solid ${invoiceSettings.customTheme.borderColor};
          padding-top: 20px;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-paid {
          background: #dcfce7;
          color: #166534;
        }
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        .status-draft {
          background: #f3f4f6;
          color: #374151;
        }
        .status-sent {
          background: #dbeafe;
          color: #1e40af;
        }
        ${invoiceSettings.showWatermark ? `
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48px;
          color: ${invoiceSettings.customTheme.secondaryColor};
          opacity: ${invoiceSettings.watermarkOpacity};
          pointer-events: none;
          z-index: -1;
        }
        ` : ''}
        @media print {
          body {
            background: white;
          }
          .invoice-container {
            box-shadow: none;
            border: 1px solid ${invoiceSettings.customTheme.borderColor};
          }
        }
      </style>
    </head>
    <body>
      ${invoiceSettings.showWatermark ? `<div class="watermark">${invoiceSettings.watermarkText}</div>` : ''}
      <div class="invoice-container">
        <div class="header">
          <div class="company-name">${invoiceSettings.companyName}</div>
          <div class="company-info">
            ${invoiceSettings.showCompanyAddress ? invoiceSettings.companyAddress + '<br>' : ''}
            ${invoiceSettings.showCompanyContact ? `Phone: ${invoiceSettings.companyPhone}<br>` : ''}
            ${invoiceSettings.showCompanyContact ? `Email: ${invoiceSettings.companyEmail}` : ''}
            ${invoiceSettings.showWebsite && invoiceSettings.companyWebsite ? `<br>Website: ${invoiceSettings.companyWebsite}` : ''}
            ${invoiceSettings.showTaxId && invoiceSettings.companyTaxId ? `<br>Tax ID: ${invoiceSettings.companyTaxId}` : ''}
          </div>
        </div>
        
        <div class="invoice-details">
          <div class="invoice-info">
            ${invoiceSettings.showInvoiceNumber ? `<div class="invoice-number">${invoiceSettings.invoiceTitle}: ${invoiceSale.invoiceNumber}</div>` : ''}
            ${invoiceSettings.showDate ? `<div class="label">Date:</div><div class="value">${formatDate(invoiceSale.createdAt)}</div>` : ''}
            ${invoiceSettings.showDueDate ? `<div class="label">Due Date:</div><div class="value">${formatDate(invoiceSale.dueDate)}</div>` : ''}
            <div class="label">Status:</div>
            <div class="value">
              <span class="status-badge status-${invoiceSale.status}">${invoiceSale.status}</span>
            </div>
          </div>
          
          ${invoiceSettings.showCustomerInfo ? `
          <div class="customer-info">
            <div class="label">Bill To:</div>
            <div class="value">
              <strong>${invoiceSale.customerName}</strong><br>
              ${sale.customerEmail}<br>
              ${sale.customerPhone}<br>
              ${sale.customerAddress}
            </div>
          </div>
          ` : ''}
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              ${invoiceSettings.showItemCode ? '<th>Code</th>' : ''}
              <th>Quantity</th>
              <th>Price</th>
              ${invoiceSettings.showItemTax ? '<th>Tax</th>' : ''}
              ${invoiceSettings.showItemDiscount ? '<th>Discount</th>' : ''}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceSale.items.map(item => `
              <tr>
                <td class="item-name">${item.itemName}</td>
                ${invoiceSettings.showItemCode ? `<td>${item.itemCode || ''}</td>` : ''}
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)}</td>
                ${invoiceSettings.showItemTax ? `<td>${formatCurrency(item.tax || 0)}</td>` : ''}
                ${invoiceSettings.showItemDiscount ? `<td>${formatCurrency(item.discount || 0)}</td>` : ''}
                <td class="amount">${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          ${invoiceSettings.showSubtotal ? `
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(invoiceSale.subtotal)}</span>
          </div>
          ` : ''}
          ${invoiceSettings.showTax ? `
          <div class="total-row">
            <span>Tax (${invoiceSale.taxRate}%):</span>
            <span>${formatCurrency(invoiceSale.tax)}</span>
          </div>
          ` : ''}
          ${invoiceSettings.showDiscount && invoiceSale.discount > 0 ? `
          <div class="total-row">
            <span>Discount:</span>
            <span>-${formatCurrency(invoiceSale.discount)}</span>
          </div>
          ` : ''}
          ${invoiceSettings.showShipping && invoiceSale.shipping ? `
          <div class="total-row">
            <span>Shipping:</span>
            <span>${formatCurrency(0)}</span>
          </div>
          ` : ''}
          ${invoiceSettings.showGrandTotal ? `
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>${formatCurrency(invoiceSale.total)}</span>
          </div>
          ` : ''}
        </div>
        
        ${invoiceSettings.showNotes && invoiceSale.notes ? `
          <div style="margin-top: 30px; padding: 20px; background: ${invoiceSettings.customTheme.headerColor}; border-radius: 8px;">
            <div style="font-weight: bold; margin-bottom: 10px; color: ${invoiceSettings.customTheme.primaryColor};">Notes:</div>
            <div style="color: ${invoiceSettings.customTheme.secondaryColor};">${invoiceSale.notes}</div>
          </div>
        ` : ''}
        
        ${invoiceSettings.showFooter ? `
        <div class="footer">
          <p>${invoiceSettings.footerText}</p>
          <p>This is a computer generated invoice. No signature required.</p>
        </div>
        ` : ''}
      </div>
      
      <script>
        // Auto-print when the window loads
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