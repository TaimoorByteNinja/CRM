"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugAuthPage() {
  const { user, session, loading, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Authentication Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Loading State</h3>
                <Badge variant={loading ? "destructive" : "default"}>
                  {loading ? "Loading..." : "Loaded"}
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
                <Badge variant={user ? "default" : "destructive"}>
                  {user ? "Authenticated" : "Not Authenticated"}
                </Badge>
              </div>
            </div>

            {user && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">User Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">User ID:</span>
                    <span className="text-sm font-mono">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email Confirmed:</span>
                    <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                      {user.email_confirmed_at ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {session && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Session Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Access Token:</span>
                    <span className="text-sm font-mono">
                      {session.access_token ? `${session.access_token.slice(0, 20)}...` : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Expires At:</span>
                    <span>
                      {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : "None"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={() => window.location.href = '/business-hub'}>
                Test Business Hub Access
              </Button>
              <Button onClick={() => window.location.href = '/login'}>
                Test Login Page
              </Button>
              {user && (
                <Button onClick={() => signOut()} variant="destructive">
                  Sign Out
                </Button>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Debug Instructions:</h4>
              <ol className="text-blue-700 text-sm space-y-1">
                <li>1. Check if user is authenticated above</li>
                <li>2. Click "Test Business Hub Access" to see if middleware allows access</li>
                <li>3. Check browser console for middleware debug logs</li>
                <li>4. If redirected to login, check the console logs for session info</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
