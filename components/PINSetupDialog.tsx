"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Lock, Eye, EyeOff } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectGeneralSettings, updateGeneralSettings } from "@/lib/store/slices/settingsSlice"
import { pinService } from "@/lib/pin-service"

interface PINSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSetupComplete: () => void
}

export function PINSetupDialog({ open, onOpenChange, onSetupComplete }: PINSetupDialogProps) {
  const dispatch = useAppDispatch()
  const generalSettings = useAppSelector(selectGeneralSettings)
  
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<'setup' | 'confirm'>('setup')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setError("")
    
    if (step === 'setup') {
      // Validate PIN format
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        setError("PIN must be exactly 4 digits")
        return
      }
      
      if (pin === "0000" || pin === "1234" || pin === "1111") {
        setError("Please choose a more secure PIN")
        return
      }
      
      setStep('confirm')
      return
    }
    
    if (step === 'confirm') {
      if (pin !== confirmPin) {
        setError("PINs do not match")
        return
      }
      
      setIsLoading(true)
      
      try {
        // Save PIN to Supabase
        const result = await pinService.savePIN(generalSettings.phoneNumber, pin)
        
        if (!result.success) {
          setError(result.error || "Failed to setup PIN. Please try again.")
          return
        }

        dispatch(updateGeneralSettings({
          enablePasscode: true,
          passcodeSetup: true
        }))
        
        // Reset form
        setPin("")
        setConfirmPin("")
        setStep('setup')
        
        onSetupComplete()
        onOpenChange(false)
      } catch (error) {
        console.error('PIN setup error:', error)
        setError("Failed to setup PIN. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCancel = () => {
    // If user cancels, disable passcode in settings
    dispatch(updateGeneralSettings({
      enablePasscode: false
    }))
    setPin("")
    setConfirmPin("")
    setStep('setup')
    setError("")
    onOpenChange(false)
  }

  const handlePinChange = (value: string, isConfirm = false) => {
    // Only allow digits and limit to 4 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 4)
    
    if (isConfirm) {
      setConfirmPin(numericValue)
    } else {
      setPin(numericValue)
    }
    
    // Clear error when user starts typing
    if (error) setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            {step === 'setup' ? 'Setup Security PIN' : 'Confirm Your PIN'}
          </DialogTitle>
          <DialogDescription>
            {step === 'setup' 
              ? "Create a 4-digit PIN to secure your application. You'll need this PIN every time you access the app."
              : "Please confirm your PIN by entering it again."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {step === 'setup' ? (
            <div className="space-y-2">
              <Label htmlFor="pin">Enter 4-digit PIN</Label>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="Enter PIN"
                  className="pr-10 text-center text-lg tracking-widest"
                  maxLength={4}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm your PIN</Label>
              <Input
                id="confirmPin"
                type={showPin ? "text" : "password"}
                value={confirmPin}
                onChange={(e) => handlePinChange(e.target.value, true)}
                placeholder="Confirm PIN"
                className="text-center text-lg tracking-widest"
                maxLength={4}
                autoComplete="new-password"
              />
            </div>
          )}
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This PIN will be required every time you refresh the page or restart the application. Make sure to remember it!
            </AlertDescription>
          </Alert>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Phone number display */}
          <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
            <strong>Phone:</strong> {generalSettings.phoneNumber || 'Not set'}
          </div>
        </div>

        <DialogFooter>
          {step === 'confirm' && (
            <Button variant="outline" onClick={() => setStep('setup')}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || (step === 'setup' ? pin.length !== 4 : confirmPin.length !== 4)}
          >
            {isLoading ? "Setting up..." : step === 'setup' ? "Continue" : "Complete Setup"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
