"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { useAppSelector } from "@/lib/store/hooks"
import { selectGeneralSettings } from "@/lib/store/slices/settingsSlice"
import { pinService } from "@/lib/pin-service"

interface PINAuthOverlayProps {
  onAuthSuccess: () => void
}

export function PINAuthOverlay({ onAuthSuccess }: PINAuthOverlayProps) {
  const generalSettings = useAppSelector(selectGeneralSettings)
  const [pin, setPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 3

  const verifyPIN = async () => {
    setError("")
    
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits")
      return
    }
    
    setIsLoading(true)
    
    try {
      // Verify PIN with Supabase
      const result = await pinService.verifyPIN(generalSettings.phoneNumber, pin)
      
      if (result.success) {
        onAuthSuccess()
      } else {
        if (result.isLocked) {
          setError("Account temporarily locked. Please wait 30 seconds.")
        } else {
          setError(result.error || "Incorrect PIN")
        }
        setPin("")
      }
    } catch (error) {
      console.error('PIN verification error:', error)
      setError("Authentication failed. Please try again.")
      setPin("")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinChange = (value: string) => {
    // Only allow digits and limit to 4 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 4)
    setPin(numericValue)
    
    // Clear error when user starts typing
    if (error) setError("")
    
    // Auto-submit when 4 digits are entered
    if (numericValue.length === 4) {
      setTimeout(() => verifyPIN(), 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length === 4) {
      verifyPIN()
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center">
            <Lock className="h-6 w-6 text-blue-600" />
            Enter Your PIN
          </DialogTitle>
          <DialogDescription className="text-center">
            Please enter your 4-digit PIN to access the application
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="pin" className="text-center block">Security PIN</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="••••"
                className="pr-10 text-center text-2xl tracking-[0.5em] h-14 font-mono"
                maxLength={4}
                autoComplete="off"
                autoFocus
                disabled={isLoading || attempts >= maxAttempts}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPin(!showPin)}
                disabled={isLoading}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* PIN input dots indicator */}
          <div className="flex justify-center gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border-2 ${
                  i < pin.length 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300'
                }`}
              />
            ))}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {attempts >= maxAttempts && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Account temporarily locked for security. Please wait 30 seconds.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-center">
            <Button 
              onClick={verifyPIN}
              disabled={isLoading || pin.length !== 4 || attempts >= maxAttempts}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Unlock"}
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 text-center space-y-1">
            <div>Phone: {generalSettings.phoneNumber || 'Not set'}</div>
            {attempts > 0 && (
              <div className="text-red-600">
                Failed attempts: {attempts}/{maxAttempts}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
