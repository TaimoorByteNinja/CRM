import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      return NextResponse.json({ ok: false, error: 'Missing session_id' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const isPaid = session.payment_status === 'paid'

    return NextResponse.json({ ok: true, isPaid, session })
  } catch (error: any) {
    console.error('Stripe verify-session error:', error)
    return NextResponse.json({ ok: false, error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}


