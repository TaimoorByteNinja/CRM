import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from './lib/database.types'

export async function middleware(req: NextRequest) {
  // Skip middleware if static export is enabled
  if (process.env.STATIC_EXPORT === 'true') {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Also try to get user directly
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes
  const protectedRoutes = [
    '/business-hub',
    '/business-hub/overview',
    '/business-hub/parties',
    '/business-hub/items',
    '/business-hub/sale',
    '/business-hub/purchase',
    '/business-hub/grow-business',
    '/business-hub/cash-bank',
    '/business-hub/reports',
    '/business-hub/settings',
    '/business-hub/utilities',
  ]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Debug logging
  console.log('Middleware Debug:', {
    pathname: req.nextUrl.pathname,
    isProtectedRoute,
    hasSession: !!session,
    hasUser: !!user,
    sessionUser: session?.user?.email,
    directUser: user?.email,
    sessionData: session ? {
      access_token: session.access_token ? 'present' : 'missing',
      refresh_token: session.refresh_token ? 'present' : 'missing',
      expires_at: session.expires_at
    } : 'no session'
  })

  // If accessing a protected route without authentication, redirect to login
  if (isProtectedRoute && !session && !user) {
    console.log('Redirecting to login - no session or user found')
    console.log('Session check failed for protected route:', req.nextUrl.pathname)
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Allow access to protected routes if session or user exists
  if (isProtectedRoute && (session || user)) {
    console.log('Allowing access to protected route:', req.nextUrl.pathname)
    console.log('User authenticated:', session?.user?.email || user?.email)
  }

  // If accessing login page while authenticated, redirect to business hub
  if (req.nextUrl.pathname === '/login' && (session || user)) {
    console.log('Redirecting to business hub - user is authenticated')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/business-hub'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
