import Stripe from 'stripe'

let stripeSingleton: Stripe | null = null

export function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable')
  }

  stripeSingleton = new Stripe(secretKey, {
    apiVersion: '2024-06-20',
  })

  return stripeSingleton
}

export const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase()


