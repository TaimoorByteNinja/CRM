"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Cloud,
  Download,
  Upload,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Users,
  Shield,
  Calendar,
  HardDrive,
  Smartphone,
  Globe,
  Share2,
  Database,
  Info,
  X,
  CloudUpload,
  FolderOpen,
  History,
  Timer,
  Wifi,
} from "lucide-react"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"

export default function SyncShareBackupPage() {
  const [activeTab, setActiveTab] = useState("sync")
  const [autoBackup, setAutoBackup] = useState(true)
  const [transactionHistory, setTransactionHistory] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState("daily")
  const [backupProgress, setBackupProgress] = useState(0)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showCloudDialog, setShowCloudDialog] = useState(false)
  const [cloudProvider, setCloudProvider] = useState("")
  const [isCloudConnected, setIsCloudConnected] = useState(false)
  const [syncEnabled, setSyncEnabled] = useState(false)
  const [lastBackup, setLastBackup] = useState("09/07/2025 | 04:07 PM")
  const [nextBackup, setNextBackup] = useState("10/07/2025 | 04:07 PM")
  const [backupSize, setBackupSize] = useState("2.4 MB")
  const [connectedDevices, setConnectedDevices] = useState(3)
  const [staffMembers, setStaffMembers] = useState(5)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Simulate backup to computer
  const handleBackupToComputer = useCallback(async () => {
    setIsBackingUp(true)
    setBackupProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsBackingUp(false)

          // Generate and download backup file
          const backupData = {
            timestamp: new Date().toISOString(),
            version: "1.0.0",
            data: {
              parties: [],
              items: [],
              transactions: [],
              settings: {},
            },
          }

          const blob = new Blob([JSON.stringify(backupData, null, 2)], {
            type: "application/json",
          })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `business-backup-${new Date().toISOString().split("T")[0]}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          return 100
        }
        return prev + 10
      })
    }, 200)
  }, [])

  // Handle cloud backup
  const handleCloudBackup = useCallback(async () => {
    if (!cloudProvider) {
      setShowCloudDialog(true)
      return
    }

    setIsBackingUp(true)
    setBackupProgress(0)

    // Simulate cloud upload
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsBackingUp(false)
          setIsCloudConnected(true)
          return 100
        }
        return prev + 8
      })
    }, 300)
  }, [cloudProvider])

  // Handle restore backup
  const handleRestoreBackup = useCallback(() => {
    setShowRestoreDialog(true)
  }, [])

  const confirmRestore = useCallback(async () => {
    setShowRestoreDialog(false)
    setIsRestoring(true)

    // Simulate restore process
    setTimeout(() => {
      setIsRestoring(false)
      setLastBackup(new Date().toLocaleString())
    }, 3000)
  }, [])

  // Handle file upload for restore
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        setShowRestoreDialog(true)
      } else {
        alert("Please select a valid JSON backup file.")
      }
    }
  }, [])

  // Enable sync functionality
  const handleEnableSync = useCallback(() => {
    setSyncEnabled(true)
    // Simulate sync setup
    setTimeout(() => {
      setConnectedDevices((prev) => prev + 1)
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="ml-16 transition-all duration-300">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Sync, Share & Backup
              </h1>
              <p className="text-slate-600 mt-1">Secure your data and collaborate with your team</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={syncEnabled ? "default" : "secondary"} className="px-3 py-1">
                <Wifi className="h-3 w-3 mr-1" />
                {syncEnabled ? "Sync Active" : "Sync Disabled"}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Database className="h-3 w-3 mr-1" />
                {backupSize}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Sync & Share Section */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Sync & Share</CardTitle>
                  <CardDescription>Give access to your staff and sync across devices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!syncEnabled ? (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mAHSAgKvKiy7azhxxw4tdaKqahVXvL.png"
                      alt="Sync illustration"
                      className="mx-auto h-48 w-auto opacity-90"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Give Access To Your Staff</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Share your company with your staff in a secure manner by assigning roles.
                  </p>
                  <Button
                    onClick={handleEnableSync}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Enable Sync
                  </Button>
                  <p className="text-sm text-slate-500 mt-4">*You're logged in with 3034091907</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Sync Enabled</p>
                          <p className="text-sm text-green-700">Real-time data synchronization active</p>
                        </div>
                      </div>
                      <Switch checked={syncEnabled} onCheckedChange={setSyncEnabled} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Connected Devices</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{connectedDevices}</p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">Staff Members</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">{staffMembers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Staff Access
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Shield className="h-4 w-4 mr-2" />
                      Role Permissions
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Globe className="h-4 w-4 mr-2" />
                      Sync Settings
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auto Backup Section */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Auto Backup</CardTitle>
                  <CardDescription>Automatically backup your data at scheduled intervals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <Timer className="h-5 w-5 text-slate-600" />
                  <div>
                    <Label htmlFor="auto-backup" className="text-base font-medium">
                      Enable Auto Backup
                    </Label>
                    <p className="text-sm text-slate-600">Automatically backup data based on schedule</p>
                  </div>
                </div>
                <Switch id="auto-backup" checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>

              {autoBackup && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2 block">Backup Frequency</Label>
                      <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Every Hour</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Transaction History</p>
                        <Switch checked={transactionHistory} onCheckedChange={setTransactionHistory} className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Last Backup</span>
                      </div>
                      <p className="text-lg font-semibold text-green-700">{lastBackup}</p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">Next Backup</span>
                      </div>
                      <p className="text-lg font-semibold text-orange-700">{nextBackup}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Backup Options */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Backup to Computer */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                    <HardDrive className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Backup to Computer</CardTitle>
                    <CardDescription>Download backup file to your local machine</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isBackingUp && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Creating backup...</span>
                      <span className="font-medium">{backupProgress}%</span>
                    </div>
                    <Progress value={backupProgress} className="h-2" />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Backup Size</span>
                    <span className="font-medium">{backupSize}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Format</span>
                    <Badge variant="outline">JSON</Badge>
                  </div>
                </div>

                <Button
                  onClick={handleBackupToComputer}
                  disabled={isBackingUp}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                >
                  {isBackingUp ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Backup
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Backup to Cloud */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <Cloud className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Backup to Cloud</CardTitle>
                    <CardDescription>Save backup to Google Drive, OneDrive, or Dropbox</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCloudConnected ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Connected to {cloudProvider}. Last backup: {lastBackup}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-orange-200 bg-orange-50">
                    <Info className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      Connect to a cloud provider to enable automatic cloud backups
                    </AlertDescription>
                  </Alert>
                )}

                {isBackingUp && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Uploading to cloud...</span>
                      <span className="font-medium">{backupProgress}%</span>
                    </div>
                    <Progress value={backupProgress} className="h-2" />
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={handleCloudBackup}
                    disabled={isBackingUp}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    {isBackingUp ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <CloudUpload className="h-4 w-4 mr-2" />
                        {isCloudConnected ? "Backup Now" : "Connect & Backup"}
                      </>
                    )}
                  </Button>

                  {isCloudConnected && (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setShowCloudDialog(true)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Cloud Settings
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Restore Backup */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Restore Backup</CardTitle>
                  <CardDescription>Upload and restore from a previous backup file</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isRestoring && (
                <Alert className="border-blue-200 bg-blue-50">
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  <AlertDescription className="text-blue-800">
                    Restoring backup... This may take a few minutes.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900">From Computer</h4>
                  <p className="text-sm text-slate-600">Upload a backup file from your computer</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json,.zip"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRestoring}
                    className="w-full"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900">From Cloud</h4>
                  <p className="text-sm text-slate-600">Restore from your cloud storage</p>
                  <Button
                    variant="outline"
                    disabled={!isCloudConnected || isRestoring}
                    className="w-full bg-transparent"
                  >
                    <Cloud className="h-4 w-4 mr-2" />
                    Restore from Cloud
                  </Button>
                </div>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Warning:</strong> Restoring a backup will overwrite all current data. Make sure to create a
                  backup of your current data before proceeding.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Backup History */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg">
                  <History className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Backup History</CardTitle>
                  <CardDescription>View and manage your backup history</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "09/07/2025 04:07 PM", size: "2.4 MB", type: "Auto", status: "Success" },
                  { date: "08/07/2025 04:07 PM", size: "2.3 MB", type: "Manual", status: "Success" },
                  { date: "07/07/2025 04:07 PM", size: "2.2 MB", type: "Auto", status: "Success" },
                  { date: "06/07/2025 04:07 PM", size: "2.1 MB", type: "Auto", status: "Failed" },
                ].map((backup, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1 rounded-full ${backup.status === "Success" ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {backup.status === "Success" ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{backup.date}</p>
                        <p className="text-xs text-slate-600">
                          {backup.type} backup • {backup.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={backup.status === "Success" ? "default" : "destructive"} className="text-xs">
                        {backup.status}
                      </Badge>
                      {backup.status === "Success" && (
                        <Button size="sm" variant="ghost">
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Restore
            </DialogTitle>
            <DialogDescription>
              Restoring a backup will overwrite all current data. This action cannot be undone. Are you sure you want to
              continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRestore} className="bg-red-600 hover:bg-red-700">
              Yes, Restore Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cloud Provider Dialog */}
      <Dialog open={showCloudDialog} onOpenChange={setShowCloudDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Cloud Storage</DialogTitle>
            <DialogDescription>Choose a cloud storage provider to backup your data securely.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: "Google Drive", icon: "🔵" },
                { name: "OneDrive", icon: "🔷" },
                { name: "Dropbox", icon: "🔹" },
              ].map((provider) => (
                <Button
                  key={provider.name}
                  variant={cloudProvider === provider.name ? "default" : "outline"}
                  onClick={() => setCloudProvider(provider.name)}
                  className="h-20 flex-col gap-2"
                >
                  <span className="text-2xl">{provider.icon}</span>
                  <span className="text-sm">{provider.name}</span>
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloudDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowCloudDialog(false)
                handleCloudBackup()
              }}
              disabled={!cloudProvider}
            >
              Connect & Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
