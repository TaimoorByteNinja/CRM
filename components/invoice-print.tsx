"use client"

import type { Sale } from "@/lib/shared-data"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Download, Printer } from "lucide-react"

interface InvoicePrintProps {
  sale: Sale | null
  isOpen: boolean
  onClose: () => void
}

export function InvoicePrint({ sale, isOpen, onClose }: InvoicePrintProps) {
  if (!sale) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-content")
    if (printContent) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice ${sale.invoiceNumber}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  color: #333;
                  line-height: 1.6;
                }
                .invoice-header { 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: center; 
                  margin-bottom: 30px;
                  border-bottom: 2px solid #e5e7eb;
                  padding-bottom: 20px;
                }
                .company-info h1 { 
                  color: #1f2937; 
                  margin: 0; 
                  font-size: 28px;
                  font-weight: bold;
                }
                .company-info p { 
                  margin: 5px 0; 
                  color: #6b7280;
                }
                .invoice-details { 
                  text-align: right; 
                }
                .invoice-number { 
                  font-size: 24px; 
                  font-weight: bold; 
                  color: #dc2626;
                  margin-bottom: 10px;
                }
                .billing-section { 
                  display: flex; 
                  justify-content: space-between; 
                  margin: 30px 0;
                }
                .billing-info h3 { 
                  color: #1f2937; 
                  margin-bottom: 10px;
                  font-size: 16px;
                  font-weight: 600;
                }
                .billing-info p { 
                  margin: 5px 0; 
                  color: #4b5563;
                }
                .items-table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 30px 0;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .items-table th, .items-table td { 
                  border: 1px solid #e5e7eb; 
                  padding: 12px; 
                  text-align: left;
                }
                .items-table th { 
                  background-color: #f9fafb; 
                  font-weight: 600;
                  color: #374151;
                }
                .items-table tr:nth-child(even) { 
                  background-color: #f9fafb; 
                }
                .text-right { 
                  text-align: right; 
                }
                .totals-section { 
                  margin-top: 30px; 
                  display: flex; 
                  justify-content: flex-end;
                }
                .totals-table { 
                  width: 300px;
                }
                .totals-table tr td { 
                  padding: 8px 12px; 
                  border: none;
                }
                .totals-table tr:last-child td { 
                  font-weight: bold; 
                  font-size: 18px;
                  border-top: 2px solid #374151;
                  color: #1f2937;
                }
                .footer { 
                  margin-top: 50px; 
                  padding-top: 20px; 
                  border-top: 1px solid #e5e7eb;
                  text-align: center;
                  color: #6b7280;
                  font-size: 14px;
                }
                .notes { 
                  margin-top: 30px; 
                  padding: 15px;
                  background-color: #f9fafb;
                  border-left: 4px solid #3b82f6;
                }
                .notes h4 { 
                  margin: 0 0 10px 0; 
                  color: #1f2937;
                }
                @media print {
                  body { margin: 0; padding: 15px; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const handleDownload = () => {
    handlePrint() // For now, this will open print dialog where user can save as PDF
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">Invoice Preview</DialogTitle>
          <div className="flex items-center gap-2">
            <Button onClick={handleDownload} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handlePrint} size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={onClose} size="sm" variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div id="invoice-content" className="p-8 bg-white">
          {/* Invoice Header */}
          <div className="invoice-header">
            <div className="company-info">
              <h1>CraftCRM BusinessHub</h1>
              <p>123 Business Street</p>
              <p>Business City, State 12345</p>
              <p>Phone: +1-555-0100</p>
              <p>Email: info@craftcrm.com</p>
              <p>GST: 29ABCDE1234F1Z5</p>
            </div>
            <div className="invoice-details">
              <div className="invoice-number">INVOICE</div>
              <p>
                <strong>Invoice #:</strong> {sale.invoiceNumber}
              </p>
              <p>
                <strong>Date:</strong> {formatDate(sale.createdAt)}
              </p>
              <p>
                <strong>Due Date:</strong> {formatDate(sale.dueDate)}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color: sale.status === "paid" ? "#059669" : sale.status === "overdue" ? "#dc2626" : "#d97706",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {sale.status}
                </span>
              </p>
            </div>
          </div>

          {/* Billing Information */}
          <div className="billing-section">
            <div className="billing-info">
              <h3>Bill To:</h3>
              <p>
                <strong>{sale.customerName}</strong>
              </p>
              <p>{sale.customerEmail}</p>
              <p>{sale.customerPhone}</p>
              <div style={{ whiteSpace: "pre-line" }}>{sale.customerAddress}</div>
            </div>
            <div className="billing-info">
              <h3>Payment Details:</h3>
              <p>
                <strong>Method:</strong> {sale.paymentMethod}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color:
                      sale.paymentStatus === "paid"
                        ? "#059669"
                        : sale.paymentStatus === "failed"
                          ? "#dc2626"
                          : "#d97706",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {sale.paymentStatus}
                </span>
              </p>
              <p>
                <strong>Tax Rate:</strong> {sale.taxRate}%
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="items-table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Description</th>
                <th style={{ width: "15%" }} className="text-right">
                  Quantity
                </th>
                <th style={{ width: "20%" }} className="text-right">
                  Unit Price
                </th>
                <th style={{ width: "15%" }} className="text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <strong>{item.itemName}</strong>
                  </td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{formatCurrency(item.price)}</td>
                  <td className="text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="totals-section">
            <table className="totals-table">
              <tbody>
                <tr>
                  <td>
                    <strong>Subtotal:</strong>
                  </td>
                  <td className="text-right">{formatCurrency(sale.subtotal)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Tax ({sale.taxRate}%):</strong>
                  </td>
                  <td className="text-right">{formatCurrency(sale.tax)}</td>
                </tr>
                {sale.discount > 0 && (
                  <tr>
                    <td>
                      <strong>Discount:</strong>
                    </td>
                    <td className="text-right">-{formatCurrency(sale.discount)}</td>
                  </tr>
                )}
                <tr>
                  <td>
                    <strong>TOTAL:</strong>
                  </td>
                  <td className="text-right">{formatCurrency(sale.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes Section */}
          {sale.notes && (
            <div className="notes">
              <h4>Notes:</h4>
              <p>{sale.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p>For any queries, please contact us at info@craftcrm.com or +1-555-0100</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
