"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Crown, 
  Clock, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Calendar,
  TrendingUp,
  Users,
  Package,
  ArrowRight,
  RefreshCw,
  Gift,
  ExternalLink
} from 'lucide-react'
import { useTrialManagement } from '@/hooks/use-trial-management'
import { useRouter } from 'next/navigation'
import { CollapsibleSidebar } from '@/components/collapsible-sidebar'

export default function PricePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("plans")
  const {
    trialInfo,
    subscriptionInfo,
    isLoading,
    getAccessStatus,
    refreshTrialData,
    activatePremium
  } = useTrialManagement()

  const [isActivating, setIsActivating] = useState(false)

  const accessStatus = getAccessStatus()

  const handleUpgradeClick = () => {
    // Open external website instead of local pricing page
    if (typeof window !== 'undefined') {
      window.open('https://craftcrm.tech/pricing', '_blank')
    }
  }

  const handleRefreshStatus = () => {
    refreshTrialData()
  }

  // Demo function - in real app this would handle payment
  const handleActivatePremium = async () => {
    setIsActivating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate payment processing
      activatePremium('premium')
      alert('🎉 Premium subscription activated successfully!')
    } catch (error) {
      console.error('Failed to activate premium:', error)
      alert('❌ Failed to activate premium. Please try again.')
    } finally {
      setIsActivating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex">
        <CollapsibleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 ml-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading subscription status...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 ml-16 p-6">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription & Pricing</h1>
            <p className="text-gray-600 mt-1">Manage your Craft CRM subscription and trial status</p>
          </div>
          <Button 
            onClick={handleRefreshStatus}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Status
          </Button>
        </div>

        {/* Current Status Card */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {subscriptionInfo?.isActive ? (
                  <>
                    <Crown className="h-6 w-6 text-yellow-600" />
                    Premium Active
                  </>
                ) : trialInfo?.isActive ? (
                  <>
                    <Clock className="h-6 w-6 text-blue-600" />
                    Free Trial
                  </>
                ) : (
                  <>
                    <Clock className="h-6 w-6 text-red-600" />
                    Trial Expired
                  </>
                )}
              </CardTitle>
              <Badge 
                variant={subscriptionInfo?.isActive ? "default" : trialInfo?.isActive ? "secondary" : "destructive"}
                className="text-sm"
              >
                {accessStatus.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Premium Subscription Status */}
            {subscriptionInfo?.isActive ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-green-800">Premium Plan Active</h3>
                    <Crown className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-600">Plan Type</label>
                      <p className="font-medium text-gray-900 capitalize">{subscriptionInfo.plan}</p>
                    </div>
                    <div>
                      <label className="text-gray-600">Days Remaining</label>
                      <p className="font-medium text-gray-900">{subscriptionInfo.daysRemaining} days</p>
                    </div>
                    <div>
                      <label className="text-gray-600">Started</label>
                      <p className="font-medium text-gray-900">
                        {new Date(subscriptionInfo.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Expires</label>
                      <p className="font-medium text-gray-900">
                        {new Date(subscriptionInfo.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Subscription Progress</span>
                      <span>{Math.round(((365 - subscriptionInfo.daysRemaining) / 365) * 100)}%</span>
                    </div>
                    <Progress 
                      value={((365 - subscriptionInfo.daysRemaining) / 365) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">All Premium Features Unlocked</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Unlimited transactions and customers</li>
                        <li>• Advanced reporting and analytics</li>
                        <li>• Priority customer support</li>
                        <li>• Data export and backup</li>
                        <li>• Multi-currency support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : trialInfo?.isActive ? (
              /* Trial Status */
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-800">Free Trial Active</h3>
                    <Gift className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-600">Days Used</label>
                      <p className="font-medium text-gray-900">{trialInfo.daysUsed} of 7 days</p>
                    </div>
                    <div>
                      <label className="text-gray-600">Days Remaining</label>
                      <p className={`font-medium ${trialInfo.daysRemaining <= 1 ? 'text-red-600' : 'text-gray-900'}`}>
                        {trialInfo.daysRemaining} days
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Started</label>
                      <p className="font-medium text-gray-900">
                        {new Date(trialInfo.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Expires</label>
                      <p className={`font-medium ${trialInfo.daysRemaining <= 1 ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(trialInfo.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Trial Progress</span>
                      <span>{Math.round((trialInfo.daysUsed / 7) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(trialInfo.daysUsed / 7) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>

                {trialInfo.daysRemaining <= 2 && (
                  <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-800 mb-1">
                          Trial Ending {trialInfo.daysRemaining <= 1 ? 'Today!' : 'Soon'}
                        </h4>
                        <p className="text-sm text-orange-700 mb-3">
                          Upgrade to Premium to avoid losing access to your data and continue using all features.
                        </p>
                        <Button 
                          onClick={handleUpgradeClick}
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Expired Status */
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-red-800">Trial Expired</h3>
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-center py-6">
                    <div className="text-4xl mb-4">🔒</div>
                    <h4 className="text-lg font-semibold text-red-800 mb-2">Access Limited</h4>
                    <p className="text-red-600 text-sm mb-4">
                      Your 7-day trial has ended. Upgrade to Premium to restore full access.
                    </p>
                    <div className="text-xs text-gray-500">
                      Trial ended: {trialInfo ? new Date(trialInfo.endDate).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </div>

                <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">Immediate Action Required</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Upgrade to Premium now to regain access to all your data and features.
                      </p>
                      <Button 
                        onClick={handleUpgradeClick}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Premium
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Upgrade Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Choose the perfect plan for your business needs.
              </div>
              
              <Button 
                onClick={handleUpgradeClick}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                <Crown className="mr-2 h-4 w-4" />
                View Pricing Plans
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>

              {!subscriptionInfo?.isActive && (
                <Button 
                  onClick={handleActivatePremium}
                  disabled={isActivating}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {isActivating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Activate Premium (Demo)
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Premium Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Unlimited transactions and customer records</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Advanced reporting and analytics dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Data export and automated backups</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Priority email and phone support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Multi-currency and tax compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Mobile app synchronization</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Support Information */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Users className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Have questions about your subscription or need assistance with upgrading? 
                  Our support team is here to help.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => router.push('/support')}>
                    Contact Support
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => window.open('mailto:support@craftcrm.com')}>
                    Email Us
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}