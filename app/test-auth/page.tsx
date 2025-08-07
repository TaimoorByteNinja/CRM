"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export default function TestAuthPage() {
  const { user, session, loading, signIn, signOut } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        alert("Login successful!")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🔐 Authentication Test</CardTitle>
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

            {!user && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Login</h3>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="test@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="password"
                      required
                    />
                  </div>
                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={() => window.location.href = '/business-hub'}>
                Test Business Hub Access
              </Button>
              <Button onClick={() => window.location.href = '/login'}>
                Go to Login Page
              </Button>
              {user && (
                <Button onClick={() => signOut()} variant="destructive">
                  Sign Out
                </Button>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
              <ol className="text-blue-700 text-sm space-y-1">
                <li>1. If not authenticated, try logging in with test credentials</li>
                <li>2. Check if session is properly stored</li>
                <li>3. Click "Test Business Hub Access" to verify middleware</li>
                <li>4. Check browser console for any errors</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
