export interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  customerName: string
  customerAddress: string
  customerPhone: string
  customerEmail: string
  customerGSTIN?: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount: number
  total: number
  notes?: string
  paymentTerms: string
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  companyGSTIN?: string
}

export interface InvoiceItem {
  name: string
  description?: string
  quantity: number
  rate: number
  amount: number
  taxRate: number
}

export function generateInvoicePDF(invoiceData: InvoiceData) {
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoiceData.invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Arial', sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background: white;
        }
        .invoice-container { 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 20px; 
          background: white;
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          margin-bottom: 30px; 
          padding-bottom: 20px; 
          border-bottom: 3px solid #3B82F6; 
        }
        .company-info h1 { 
          color: #3B82F6; 
          font-size: 28px; 
          margin-bottom: 10px; 
        }
        .company-info p { 
          margin: 2px 0; 
          color: #666; 
        }
        .invoice-info { 
          text-align: right; 
        }
        .invoice-title { 
          font-size: 32px; 
          font-weight: bold; 
          color: #3B82F6; 
          margin-bottom: 10px; 
        }
        .invoice-details p { 
          margin: 5px 0; 
          font-size: 14px; 
        }
        .billing-section { 
          display: flex; 
          justify-content: space-between; 
          margin: 30px 0; 
        }
        .billing-info { 
          flex: 1; 
          margin-right: 20px; 
        }
        .billing-title { 
          font-size: 16px; 
          font-weight: bold; 
          color: #3B82F6; 
          margin-bottom: 10px; 
          text-transform: uppercase; 
        }
        .billing-details p { 
          margin: 3px 0; 
          font-size: 14px; 
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 30px 0; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .items-table th { 
          background: #3B82F6; 
          color: white; 
          padding: 12px; 
          text-align: left; 
          font-weight: bold; 
          font-size: 14px; 
        }
        .items-table td { 
          padding: 12px; 
          border-bottom: 1px solid #E5E7EB; 
          font-size: 14px; 
        }
        .items-table tr:nth-child(even) { 
          background: #F9FAFB; 
        }
        .items-table .amount { 
          text-align: right; 
          font-weight: 500; 
        }
        .totals-section { 
          margin-top: 30px; 
          display: flex; 
          justify-content: flex-end; 
        }
        .totals-table { 
          width: 300px; 
        }
        .totals-table td { 
          padding: 8px 12px; 
          border: none; 
          font-size: 14px; 
        }
        .totals-table .total-row { 
          font-weight: bold; 
          font-size: 16px; 
          border-top: 2px solid #3B82F6; 
          background: #F0F9FF; 
        }
        .notes-section { 
          margin-top: 30px; 
          padding: 20px; 
          background: #F9FAFB; 
          border-radius: 8px; 
        }
        .notes-title { 
          font-weight: bold; 
          color: #3B82F6; 
          margin-bottom: 10px; 
        }
        .footer { 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #E5E7EB; 
          text-align: center; 
          color: #666; 
          font-size: 12px; 
        }
        .status-badge { 
          display: inline-block; 
          padding: 4px 12px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: bold; 
          text-transform: uppercase; 
          background: #10B981; 
          color: white; 
        }
        @media print {
          body { margin: 0; }
          .invoice-container { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-info">
            <h1>${invoiceData.companyName}</h1>
            <p>${invoiceData.companyAddress}</p>
            <p>Phone: ${invoiceData.companyPhone}</p>
            <p>Email: ${invoiceData.companyEmail}</p>
            ${invoiceData.companyGSTIN ? `<p>GSTIN: ${invoiceData.companyGSTIN}</p>` : ""}
          </div>
          <div class="invoice-info">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-details">
              <p><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(invoiceData.date).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString()}</p>
              <span class="status-badge">Original</span>
            </div>
          </div>
        </div>

        <div class="billing-section">
          <div class="billing-info">
            <div class="billing-title">Bill To:</div>
            <div class="billing-details">
              <p><strong>${invoiceData.customerName}</strong></p>
              <p>${invoiceData.customerAddress}</p>
              <p>Phone: ${invoiceData.customerPhone}</p>
              <p>Email: ${invoiceData.customerEmail}</p>
              ${invoiceData.customerGSTIN ? `<p>GSTIN: ${invoiceData.customerGSTIN}</p>` : ""}
            </div>
          </div>
          <div class="billing-info">
            <div class="billing-title">Payment Terms:</div>
            <div class="billing-details">
              <p><strong>Terms:</strong> ${invoiceData.paymentTerms}</p>
              <p><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th class="amount">Rate</th>
              <th class="amount">Tax %</th>
              <th class="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items
              .map(
                (item) => `
              <tr>
                <td>
                  <strong>${item.name}</strong>
                  ${item.description ? `<br><small style="color: #666;">${item.description}</small>` : ""}
                </td>
                <td style="text-align: center;">${item.quantity}</td>
                <td class="amount">₹${item.rate.toFixed(2)}</td>
                <td class="amount">${item.taxRate}%</td>
                <td class="amount">₹${item.amount.toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td class="amount">₹${invoiceData.subtotal.toFixed(2)}</td>
            </tr>
            ${
              invoiceData.discount > 0
                ? `
            <tr>
              <td>Discount:</td>
              <td class="amount">-₹${invoiceData.discount.toFixed(2)}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td>Tax (${invoiceData.taxRate}%):</td>
              <td class="amount">₹${invoiceData.tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Total Amount:</strong></td>
              <td class="amount"><strong>₹${invoiceData.total.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>

        ${
          invoiceData.notes
            ? `
        <div class="notes-section">
          <div class="notes-title">Notes:</div>
          <p>${invoiceData.notes}</p>
        </div>
        `
            : ""
        }

        <div class="footer">
          <p><strong>Thank you for your business!</strong></p>
          <p>This is a computer generated invoice and does not require signature.</p>
        </div>
      </div>
    </body>
    </html>
  `

  // Create a new window and write the HTML content
  const printWindow = window.open("", "_blank", "width=800,height=600")
  if (printWindow) {
    printWindow.document.write(invoiceHTML)
    printWindow.document.close()

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        // Optionally close the window after printing
        // printWindow.close()
      }, 250)
    }
  }
}
