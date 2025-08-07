"use client"

import { useState, useEffect } from 'react'
import { TrialManager, type TrialInfo, type SubscriptionInfo } from '@/lib/trial-manager'

export function useTrialManagement() {
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [showTrialModal, setShowTrialModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize trial data
  useEffect(() => {
    const initializeData = () => {
      setIsLoading(true)
      
      try {
        // Get existing data or initialize new trial
        let trial = TrialManager.getTrialData()
        if (!trial) {
          trial = TrialManager.initializeTrial()
        }
        
        const subscription = TrialManager.getSubscriptionData()
        
        setTrialInfo(trial)
        setSubscriptionInfo(subscription)
        
        // Show modal if trial is expired or expiring soon (1 day left)
        if (trial && !subscription?.isActive) {
          if (trial.daysRemaining <= 1 || !trial.isActive) {
            setShowTrialModal(true)
          }
        }
        
      } catch (error) {
        console.error('Failed to initialize trial management:', error)
        // Fallback to default trial
        const defaultTrial = TrialManager.initializeTrial()
        setTrialInfo(defaultTrial)
      } finally {
        setIsLoading(false)
      }
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializeData()
    }
  }, [])

  // Check for updates periodically
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkForUpdates = () => {
      try {
        const trial = TrialManager.getTrialData()
        const subscription = TrialManager.getSubscriptionData()
        
        setTrialInfo(trial)
        setSubscriptionInfo(subscription)
        
        // Show modal if trial expired or expiring today
        if (trial && !subscription?.isActive) {
          if (trial.daysRemaining <= 0 && !showTrialModal) {
            setShowTrialModal(true)
          }
        }
      } catch (error) {
        console.error('Failed to check for trial updates:', error)
      }
    }

    // Check every hour
    const interval = setInterval(checkForUpdates, 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [showTrialModal])

  // Activate premium subscription
  const activatePremium = (planType: string = 'premium') => {
    try {
      const newSubscription = TrialManager.activatePremiumSubscription(planType)
      setSubscriptionInfo(newSubscription)
      setShowTrialModal(false)
      return newSubscription
    } catch (error) {
      console.error('Failed to activate premium subscription:', error)
      throw error
    }
  }

  // Close trial modal
  const closeTrialModal = () => {
    setShowTrialModal(false)
  }

  // Force show trial modal (for testing or user request)
  const showTrialModalNow = () => {
    setShowTrialModal(true)
  }

  // Get access status
  const getAccessStatus = () => {
    if (subscriptionInfo && subscriptionInfo.isActive) {
      return {
        status: 'premium' as const,
        hasAccess: true,
        message: 'Premium subscription active'
      }
    }
    
    if (trialInfo && trialInfo.isActive) {
      return {
        status: 'trial' as const,
        hasAccess: true,
        message: `${trialInfo.daysRemaining} day${trialInfo.daysRemaining !== 1 ? 's' : ''} remaining`
      }
    }
    
    return {
      status: 'expired' as const,
      hasAccess: false,
      message: 'Trial expired - Upgrade to continue'
    }
  }

  // Check if user has premium access
  const hasPremiumAccess = () => {
    return TrialManager.hasPremiumAccess()
  }

  // Refresh trial data
  const refreshTrialData = () => {
    if (typeof window === 'undefined') return

    try {
      const trial = TrialManager.getTrialData()
      const subscription = TrialManager.getSubscriptionData()
      
      setTrialInfo(trial)
      setSubscriptionInfo(subscription)
    } catch (error) {
      console.error('Failed to refresh trial data:', error)
    }
  }

  return {
    trialInfo,
    subscriptionInfo,
    showTrialModal,
    isLoading,
    activatePremium,
    closeTrialModal,
    showTrialModalNow,
    getAccessStatus,
    hasPremiumAccess,
    refreshTrialData
  }
}
