"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Crown, Zap, ArrowRight, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TrialManager, type TrialInfo, type SubscriptionInfo } from '@/lib/trial-manager'

interface TrialExpiryModalProps {
  isOpen: boolean
  onClose: () => void
  trialInfo: TrialInfo
}

export function TrialExpiryModal({ isOpen, onClose, trialInfo }: TrialExpiryModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = () => {
    setIsLoading(true)
    // Open external website instead of local pricing page
    if (typeof window !== 'undefined') {
      window.open('https://craftcrm.tech/pricing', '_blank')
    }
    setIsLoading(false)
  }

  const handleContinueTrial = () => {
    onClose()
  }

  const isExpired = trialInfo.daysRemaining <= 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isExpired ? (
              <>
                <Clock className="h-6 w-6 text-red-500" />
                Trial Expired
              </>
            ) : (
              <>
                <Clock className="h-6 w-6 text-orange-500" />
                Trial Ending Soon
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className={`border-2 ${isExpired ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                  {trialInfo.daysRemaining} days
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {isExpired ? 'Your trial has ended' : 'remaining in your trial'}
                </p>
                
                <div className="mt-3 bg-white rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span>Trial Progress:</span>
                    <span>{trialInfo.daysUsed} of 7 days used</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isExpired ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(100, (trialInfo.daysUsed / 7) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isExpired ? (
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Your trial has ended
                </h3>
                <p className="text-sm text-gray-600">
                  Upgrade to Premium to continue using Craft CRM with full features
                </p>
              </div>

              <Button 
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Trial ending in {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-gray-600">
                  Upgrade now to avoid any interruption to your workflow
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleContinueTrial}
                  variant="outline"
                  className="w-full"
                >
                  Continue Trial
                </Button>
                <Button 
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Upgrade Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-center text-gray-500 pt-2">
            Trial started: {new Date(trialInfo.startDate).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Trial Status Banner Component
interface TrialStatusBannerProps {
  trialInfo: TrialInfo
  subscriptionInfo: SubscriptionInfo | null
  onUpgradeClick: () => void
}

export function TrialStatusBanner({ trialInfo, subscriptionInfo, onUpgradeClick }: TrialStatusBannerProps) {
  if (subscriptionInfo && subscriptionInfo.isActive) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            <span className="font-medium">Premium Active</span>
          </div>
          <div className="text-sm">
            {subscriptionInfo.daysRemaining} days remaining
          </div>
        </div>
      </div>
    )
  }

  if (!trialInfo.isActive) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-3 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Trial Expired</span>
          </div>
          <Button 
            onClick={onUpgradeClick}
            size="sm"
            variant="secondary"
            className="bg-white text-red-600 hover:bg-gray-100"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    )
  }

  const isNearExpiry = trialInfo.daysRemaining <= 2

  return (
    <div className={`p-3 rounded-lg mb-4 ${
      isNearExpiry 
        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span className="font-medium">
            {isNearExpiry ? 'Trial Ending Soon' : 'Free Trial'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm">
            {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''} left
          </span>
          <Button 
            onClick={onUpgradeClick}
            size="sm"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  )
}
