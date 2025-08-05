"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Target, Save } from "lucide-react"
import { useAppDispatch } from "@/lib/store/hooks"
import { showNotification } from "@/lib/store/slices/uiSlice"
import { useCurrency } from "@/lib/currency-manager"

interface TargetSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentDailyTarget: number
  currentMonthlyTarget: number
  onTargetsUpdate: (dailyTarget: number, monthlyTarget: number) => void
  currentDailySales?: number
  currentMonthlySales?: number
}

export default function TargetSettingsDialog({
  open,
  onOpenChange,
  currentDailyTarget,
  currentMonthlyTarget,
  onTargetsUpdate,
  currentDailySales = 0,
  currentMonthlySales = 0
}: TargetSettingsDialogProps) {
  const [dailyTarget, setDailyTarget] = useState(currentDailyTarget.toString())
  const [monthlyTarget, setMonthlyTarget] = useState(currentMonthlyTarget.toString())
  const [saving, setSaving] = useState(false)
  const dispatch = useAppDispatch()
  const { formatAmountWithSymbol, getSymbol } = useCurrency()

  useEffect(() => {
    setDailyTarget(currentDailyTarget.toString())
    setMonthlyTarget(currentMonthlyTarget.toString())
  }, [currentDailyTarget, currentMonthlyTarget])

  const handleSave = async () => {
    setSaving(true)
    try {
      const dailyValue = parseFloat(dailyTarget) || 0
      const monthlyValue = parseFloat(monthlyTarget) || 0

      if (dailyValue < 0 || monthlyValue < 0) {
        dispatch(showNotification({
          message: "Targets cannot be negative values",
          type: "error"
        }))
        return
      }

      // Save to localStorage for persistence
      localStorage.setItem('businessTargets', JSON.stringify({
        dailyTarget: dailyValue,
        monthlyTarget: monthlyValue,
        updatedAt: new Date().toISOString()
      }))

      onTargetsUpdate(dailyValue, monthlyValue)
      
      dispatch(showNotification({
        message: "Your sales targets have been saved successfully",
        type: "success"
      }))
      
      onOpenChange(false)
    } catch (error) {
      dispatch(showNotification({
        message: "Failed to save targets. Please try again.",
        type: "error"
      }))
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''))
    return isNaN(num) ? '' : num.toString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Set Sales Targets
            {(currentDailySales >= currentDailyTarget || currentMonthlySales >= currentMonthlyTarget) && (
              <span className="text-yellow-500">🏆</span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="dailyTarget" className="text-sm font-medium">
              Daily Sales Target ({getSymbol()})
            </Label>
            <Input
              id="dailyTarget"
              type="number"
              placeholder="Enter daily target"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              className="text-lg"
              min="0"
              step="100"
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Current sales: {formatAmountWithSymbol(currentDailySales)}
              </span>
              {currentDailySales >= currentDailyTarget && (
                <span className="text-green-600 font-medium">🎉 Target Achieved!</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentDailySales >= currentDailyTarget ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min((currentDailySales / currentDailyTarget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyTarget" className="text-sm font-medium">
              Monthly Sales Target ({getSymbol()})
            </Label>
            <Input
              id="monthlyTarget"
              type="number"
              placeholder="Enter monthly target"
              value={monthlyTarget}
              onChange={(e) => setMonthlyTarget(e.target.value)}
              className="text-lg"
              min="0"
              step="1000"
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Current sales: {formatAmountWithSymbol(currentMonthlySales)}
              </span>
              {currentMonthlySales >= currentMonthlyTarget && (
                <span className="text-green-600 font-medium">🚀 Target Achieved!</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentMonthlySales >= currentMonthlyTarget ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min((currentMonthlySales / currentMonthlyTarget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Tips for Setting Targets:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Set realistic targets based on your business capacity</li>
              <li>• Consider seasonal variations in your business</li>
              <li>• Review and adjust targets monthly</li>
              <li>• Daily target × 30 should roughly equal monthly target</li>
            </ul>
          </div>

          {(currentDailySales >= currentDailyTarget || currentMonthlySales >= currentMonthlyTarget) && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                🎉 Congratulations!
              </h4>
              <p className="text-xs text-green-700">
                {currentDailySales >= currentDailyTarget && currentMonthlySales >= currentMonthlyTarget
                  ? "You've achieved both your daily and monthly targets! Outstanding performance!"
                  : currentDailySales >= currentDailyTarget
                  ? "You've reached your daily target! Keep up the great work!"
                  : "You've achieved your monthly target! Excellent job!"}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Targets"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
