"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectGeneralSettings, updateGeneralSettings } from "@/lib/store/slices/settingsSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Settings,
  Phone,
  User,
  Info,
  RefreshCw,
  Trash2,
  Eye,
  Database,
  Smartphone,
  Globe,
  Monitor,
  Code,
  Zap,
} from "lucide-react"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { useUserData } from "@/hooks/use-user-data"

export default function SyncPage() {
  const [activeTab, setActiveTab] = useState("sync")
  const dispatch = useAppDispatch()
  const generalSettings = useAppSelector(selectGeneralSettings)
  const { currentUser, isNewUser } = useUserData()
  const [mounted, setMounted] = useState(false)
  const [showCountrySelection, setShowCountrySelection] = useState(false)
  const [tempPhoneNumber, setTempPhoneNumber] = useState('')

  useEffect(() => {
    setMounted(true)
    setTempPhoneNumber(generalSettings.phoneNumber || '')
  }, [generalSettings.phoneNumber])

  const handleClearPhone = () => {
    console.log('🔄 Clearing phone number...')
    dispatch(updateGeneralSettings({ phoneNumber: '' }))
    setShowCountrySelection(true)
    setTempPhoneNumber('')
  }

  const handleSetPhone = () => {
    if (tempPhoneNumber) {
      dispatch(updateGeneralSettings({ phoneNumber: tempPhoneNumber }))
    }
  }

  const handleShowForm = () => {
    setShowCountrySelection(true)
  }

  return (
    <div className="flex h-screen">
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Code className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                System Debug & Configuration
              </h1>
              <p className="text-slate-600 text-sm">Monitor and manage your application settings</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Status Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-1">Phone Number Status</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={generalSettings.phoneNumber ? "default" : "destructive"} 
                          className={`${generalSettings.phoneNumber ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} px-3 py-1`}
                        >
                          {generalSettings.phoneNumber ? "Connected" : "Not Set"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        {generalSettings.phoneNumber || 'No phone number configured'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-full">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-1">User Status</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={isNewUser === true ? "secondary" : isNewUser === false ? "default" : "outline"} 
                          className={`${
                            isNewUser === true ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                            isNewUser === false ? 'bg-green-100 text-green-800 border-green-200' : 
                            'bg-gray-100 text-gray-800 border-gray-200'
                          } px-3 py-1`}
                        >
                          {isNewUser === null ? "Unknown" : (isNewUser ? "New User" : "Existing User")}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        {currentUser || 'No user identified'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full">
                      <Monitor className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-1">Development Mode</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary"
                          className="bg-purple-100 text-purple-800 border-purple-200 px-3 py-1"
                        >
                          Active
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Debug panel enabled
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  Current System Information
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Real-time system status and configuration details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                      <div className={`w-3 h-3 rounded-full ${generalSettings.phoneNumber ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className={`font-mono text-sm flex-1 ${generalSettings.phoneNumber ? 'text-green-700' : 'text-red-600'}`}>
                        {generalSettings.phoneNumber || 'Not Set'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Current User ID
                    </Label>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                      <div className={`w-3 h-3 rounded-full ${currentUser ? 'bg-green-400' : 'bg-gray-400'}`} />
                      <span className={`font-mono text-sm flex-1 ${currentUser ? 'text-green-700' : 'text-slate-500'}`}>
                        {currentUser || 'None'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      User Type
                    </Label>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                      <div className={`w-3 h-3 rounded-full ${
                        isNewUser === true ? 'bg-blue-400' : 
                        isNewUser === false ? 'bg-green-400' : 
                        'bg-gray-400'
                      }`} />
                      <span className={`text-sm flex-1 ${
                        isNewUser === true ? 'text-blue-700' : 
                        isNewUser === false ? 'text-green-700' : 
                        'text-slate-500'
                      }`}>
                        {isNewUser === null ? 'Unknown Status' : (isNewUser ? 'New User' : 'Existing User')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Country Form
                    </Label>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                      <div className={`w-3 h-3 rounded-full ${showCountrySelection ? 'bg-blue-400' : 'bg-gray-400'}`} />
                      <span className={`text-sm flex-1 ${showCountrySelection ? 'text-blue-700' : 'text-slate-500'}`}>
                        {showCountrySelection ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone Number Management */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  Phone Number Management
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Update or manage the system phone number configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="phone-input" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    Set Phone Number
                  </Label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        id="phone-input"
                        type="text"
                        placeholder="Enter phone number (e.g., +923034091907)"
                        value={tempPhoneNumber}
                        onChange={(e) => setTempPhoneNumber(e.target.value)}
                        className="h-12 pl-4 pr-4 bg-gradient-to-r from-white to-slate-50 border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    <Button 
                      onClick={handleSetPhone}
                      disabled={!tempPhoneNumber || tempPhoneNumber === generalSettings.phoneNumber}
                      className="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                  </div>
                  {tempPhoneNumber && tempPhoneNumber !== generalSettings.phoneNumber && (
                    <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                      Preview: {tempPhoneNumber} will be set as the new phone number
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  System Actions
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Execute system operations and manage application state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={handleClearPhone}
                    variant="destructive"
                    className="h-16 flex flex-col items-center gap-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="text-sm font-semibold">Clear Phone</span>
                  </Button>
                  
                  <Button 
                    onClick={handleShowForm}
                    className="h-16 flex flex-col items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                  >
                    <Eye className="h-5 w-5" />
                    <span className="text-sm font-semibold">Show Form</span>
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="h-16 flex flex-col items-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 hover:bg-slate-200 shadow-lg"
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span className="text-sm font-semibold">Refresh Page</span>
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 mb-1">Action Effects</p>
                      <ul className="text-xs text-amber-700 space-y-1">
                        <li>• <strong>Clear Phone:</strong> Removes phone number and shows country selection</li>
                        <li>• <strong>Show Form:</strong> Forces the country selection overlay to appear</li>
                        <li>• <strong>Refresh Page:</strong> Reloads the page to reset any UI state</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environment Information */}
            <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Database className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <AlertDescription className="text-blue-800">
                    <span className="font-semibold">Development Environment:</span> This debug panel provides real-time system monitoring and control. 
                    All system changes are logged to the console and take effect immediately across the application.
                  </AlertDescription>
                </div>
              </div>
            </Alert>

          </div>
        </div>
      </div>
    </div>
  )
}
