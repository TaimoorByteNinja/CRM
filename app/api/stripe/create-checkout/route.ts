import { NextRequest, NextResponse } from 'next/server'
import { getStripe, STRIPE_CURRENCY } from '@/lib/stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json()
    const { planId, planName, amount } = body as {
      planId: string
      planName: string
      amount: number
    }

    if (!planId || !planName || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const stripe = getStripe()

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || ''
    const successUrl = `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/pricing?canceled=1`

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: STRIPE_CURRENCY,
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: planName,
              metadata: { planId },
            },
          },
        },
      ],
      metadata: {
        userId: user.id,
        planId,
        planName,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return NextResponse.json({ id: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout create error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}


