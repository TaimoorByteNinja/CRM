import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const stripe = getStripe()
  const buf = await req.arrayBuffer()
  const rawBody = Buffer.from(buf)
  const sig = headers().get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 })
  }

  let event
  try {
    if (!sig) throw new Error('Missing Stripe signature header')
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        console.log('Checkout session completed:', session.id, session.metadata)
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error('Error handling webhook:', err)
    return NextResponse.json({ received: true, handled: false })
  }

  return NextResponse.json({ received: true })
}


