"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestMiddlewarePage() {
  const { user, session, loading } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Middleware Test Page</CardTitle>
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
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Navigation</h3>
              <div className="flex gap-4 flex-wrap">
                <Button onClick={() => window.location.href = '/business-hub'}>
                  Test Business Hub
                </Button>
                <Button onClick={() => window.location.href = '/business-hub/overview'}>
                  Test Overview
                </Button>
                <Button onClick={() => window.location.href = '/business-hub/parties'}>
                  Test Parties
                </Button>
                <Button onClick={() => window.location.href = '/login'}>
                  Test Login Page
                </Button>
                <Button onClick={() => window.location.href = '/debug-auth'}>
                  Debug Auth
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
              <ol className="text-blue-700 text-sm space-y-1">
                <li>1. Check if you're authenticated above</li>
                <li>2. Click the test buttons to see if middleware allows access</li>
                <li>3. Check browser console for middleware debug logs</li>
                <li>4. If you get redirected to login, the middleware is blocking access</li>
              </ol>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Expected Behavior:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• If authenticated: Should access all business-hub pages</li>
                <li>• If not authenticated: Should be redirected to login</li>
                <li>• Login page: Should redirect to business-hub if already authenticated</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
