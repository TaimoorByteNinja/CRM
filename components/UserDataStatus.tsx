"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUserData } from '@/hooks/use-user-data'
import { Database, User, Phone, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface UserDataStatusProps {
  phoneNumber?: string
}

export function UserDataStatus({ phoneNumber }: UserDataStatusProps) {
  const { currentUser, isNewUser, isLoading, error, initializeUser, hasExistingData } = useUserData()
  const [checkingExisting, setCheckingExisting] = useState(false)
  const [existingDataResult, setExistingDataResult] = useState<boolean | null>(null)

  const handleCheckExisting = async () => {
    if (!phoneNumber) return
    
    setCheckingExisting(true)
    try {
      const result = await hasExistingData(phoneNumber)
      setExistingDataResult(result)
    } catch (err) {
      console.error('Error checking existing data:', err)
    } finally {
      setCheckingExisting(false)
    }
  }

  const handleInitialize = async () => {
    if (!phoneNumber) return
    await initializeUser(phoneNumber)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          User Data Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User Status */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="text-sm">Current User:</span>
          {currentUser ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {currentUser}
            </Badge>
          ) : (
            <Badge variant="outline">Not set</Badge>
          )}
        </div>

        {/* New User Status */}
        {isNewUser !== null && (
          <div className="flex items-center gap-2">
            <span className="text-sm">User Type:</span>
            {isNewUser ? (
              <Badge className="bg-green-500 text-white flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                New User
              </Badge>
            ) : (
              <Badge className="bg-blue-500 text-white flex items-center gap-1">
                <Database className="h-3 w-3" />
                Existing User
              </Badge>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Phone Number Input */}
        {phoneNumber && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="text-sm">Target Phone:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{phoneNumber}</code>
            </div>

            {/* Check Existing Data Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCheckExisting}
              disabled={checkingExisting || isLoading}
              className="w-full"
            >
              {checkingExisting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check for Existing Data'
              )}
            </Button>

            {/* Existing Data Result */}
            {existingDataResult !== null && (
              <div className="text-sm p-2 rounded-lg">
                {existingDataResult ? (
                  <div className="text-green-700 bg-green-50 p-2 rounded flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    User has existing data
                  </div>
                ) : (
                  <div className="text-blue-700 bg-blue-50 p-2 rounded flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    No existing data found - will create new user
                  </div>
                )}
              </div>
            )}

            {/* Initialize Button */}
            {!currentUser && (
              <Button 
                onClick={handleInitialize} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  'Initialize User Data'
                )}
              </Button>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Phone numbers are used as unique identifiers</p>
          <p>• All business data is automatically saved</p>
          <p>• Existing users will load their previous data</p>
        </div>
      </CardContent>
    </Card>
  )
}
