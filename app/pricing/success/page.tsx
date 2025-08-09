'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TrialManager } from '@/lib/trial-manager'

export default function PricingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking')

  useEffect(() => {
    const verify = async () => {
      const sessionId = searchParams.get('session_id')
      if (!sessionId) {
        setStatus('failed')
        return
      }
      try {
        const res = await fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`)
        const data = await res.json()
        if (data.ok && data.isPaid) {
          const planId = data.session?.metadata?.planId || 'premium'
          TrialManager.activatePremiumSubscription(planId)
          setStatus('success')
          // Redirect to hub after a moment
          setTimeout(() => router.push('/business-hub'), 1500)
        } else {
          setStatus('failed')
        }
      } catch {
        setStatus('failed')
      }
    }
    verify()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full text-center p-6">
        {status === 'checking' && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Confirming your payment…</h1>
            <p className="text-gray-600">Please wait a moment.</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Payment successful!</h1>
            <p className="text-gray-600 mb-4">Premium has been activated. Redirecting…</p>
            <Button onClick={() => router.push('/business-hub')}>Go to Business Hub</Button>
          </div>
        )}
        {status === 'failed' && (
          <div>
            <h1 className="text-2xl font-bold mb-2">We couldn't verify your payment</h1>
            <p className="text-gray-600 mb-4">If you were charged, contact support with your receipt.</p>
            <Button onClick={() => router.push('/pricing')}>Back to Pricing</Button>
          </div>
        )}
      </div>
    </div>
  )
}


