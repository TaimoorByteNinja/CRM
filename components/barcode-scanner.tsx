"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scan, Search, ShoppingCart, Eye, CheckCircle, AlertTriangle } from "lucide-react"

interface BarcodeItem {
  barcode: string
  itemName: string
  price: number
  stock: number
  category?: string
}

interface ScannedResult {
  barcode: string
  item: BarcodeItem | null
  timestamp: Date
  found: boolean
}

interface BarcodeScannerProps {
  barcodeDatabase: BarcodeItem[]
  onItemScanned: (item: BarcodeItem) => void
  onAddToCart?: (item: BarcodeItem) => void
}

export function BarcodeScanner({ barcodeDatabase, onItemScanned, onAddToCart }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanInput, setScanInput] = useState("")
  const [scanHistory, setScanHistory] = useState<ScannedResult[]>([])
  const [lastScanned, setLastScanned] = useState<ScannedResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input when scanning is active
  useEffect(() => {
    if (isScanning && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isScanning])

  // Handle barcode scan
  const handleScan = useCallback(
    (barcode: string) => {
      if (!barcode.trim()) return

      const foundItem = barcodeDatabase.find((item) => item.barcode === barcode.trim())
      const scanResult: ScannedResult = {
        barcode: barcode.trim(),
        item: foundItem || null,
        timestamp: new Date(),
        found: !!foundItem,
      }

      setScanHistory((prev) => [scanResult, ...prev.slice(0, 9)]) // Keep last 10 scans
      setLastScanned(scanResult)

      if (foundItem) {
        onItemScanned(foundItem)
        // Auto-clear input after successful scan
        setScanInput("")
      }
    },
    [barcodeDatabase, onItemScanned],
  )

  // Handle input change with auto-scan
  const handleInputChange = (value: string) => {
    setScanInput(value)

    // Auto-scan when barcode length is typical (8-13 characters)
    if (value.length >= 8 && value.length <= 13 && !value.includes(" ")) {
      // Small delay to allow for complete barcode input
      setTimeout(() => {
        if (value === scanInput) {
          handleScan(value)
        }
      }, 300)
    }
  }

  // Manual scan trigger
  const triggerScan = () => {
    if (scanInput.trim()) {
      handleScan(scanInput)
    }
  }

  return (
    <div className="space-y-6">
      {/* Scanner Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Barcode Scanner
            {isScanning && <Badge className="bg-green-600">Active</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setIsScanning(!isScanning)}
              className={isScanning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              <Scan className="h-4 w-4 mr-2" />
              {isScanning ? "Stop Scanner" : "Start Scanner"}
            </Button>
            <Button variant="outline" onClick={() => setScanHistory([])}>
              Clear History
            </Button>
          </div>

          <div className="relative">
            <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder={isScanning ? "Scan barcode here..." : "Enter barcode manually"}
              value={scanInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  triggerScan()
                }
              }}
              className="pl-10 font-mono"
              disabled={!isScanning}
            />
          </div>

          <Button onClick={triggerScan} disabled={!scanInput.trim()} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Search Product
          </Button>
        </CardContent>
      </Card>

      {/* Last Scanned Item */}
      {lastScanned && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastScanned.found ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              Last Scanned
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastScanned.found && lastScanned.item ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">{lastScanned.item.itemName}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium ml-2">₹{lastScanned.item.price}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-medium ml-2">{lastScanned.item.stock}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Barcode:</span>
                      <span className="font-mono text-xs ml-2">{lastScanned.barcode}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {onAddToCart && (
                      <Button onClick={() => onAddToCart(lastScanned.item!)} className="flex-1" size="sm">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Barcode "{lastScanned.barcode}" not found in database
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scan History ({scanHistory.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {scanHistory.map((scan, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    scan.found ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {scan.found ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{scan.item?.itemName || "Unknown Item"}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-mono">{scan.barcode}</span>
                      <span className="ml-2">{scan.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                  {scan.found && scan.item && (
                    <div className="text-right">
                      <div className="font-medium">₹{scan.item.price}</div>
                      <div className="text-sm text-gray-600">Stock: {scan.item.stock}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Database Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{barcodeDatabase.length}</div>
              <div className="text-sm text-blue-700">Total Barcodes</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{scanHistory.filter((s) => s.found).length}</div>
              <div className="text-sm text-green-700">Successful Scans</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
