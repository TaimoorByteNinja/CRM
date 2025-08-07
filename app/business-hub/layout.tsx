/**
 * Business Hub Layout Component
 * 
 * This layout provides the basic structure for the business hub with authentication flow:
 * 1. First-time users: Phone setup → PIN authentication (if enabled) → App content
 * 2. Returning users: PIN authentication (if enabled) → App content
 * 
 * Authentication Flow Priority:
 * - Priority 1: Phone number setup (if not set and not seen before)
 * - Priority 2: PIN authentication (if enabled and PIN is set up)
 * - Priority 3: App content access
 */

"use client"

import { useEffect, useState } from "react"
import { SalesProvider } from "@/lib/sales-context"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectGeneralSettings, updateGeneralSettings } from "@/lib/store/slices/settingsSlice"
import { CountrySelectionOverlay } from "@/components/CountrySelectionOverlay"
import { PINAuthOverlay } from "@/components/PINAuthOverlay"
import { PINSetupDialog } from "@/components/PINSetupDialog"
import { TrialExpiryModal, TrialStatusBanner } from "@/components/TrialExpiryModal"
import { useUserData } from "@/hooks/use-user-data"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useTrialManagement } from "@/hooks/use-trial-management"
import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"

export default function BusinessHubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const generalSettings = useAppSelector(selectGeneralSettings)
  const dispatch = useAppDispatch()
  const { currentUser, isNewUser, initializeUser } = useUserData()
  const router = useRouter()
  const [showCountrySelection, setShowCountrySelection] = useState(false)
  const [showPINAuth, setShowPINAuth] = useState(false)
  const [showPINSetup, setShowPINSetup] = useState(false)
  const [isPINAuthenticated, setIsPINAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Trial management
  const {
    trialInfo,
    subscriptionInfo,
    showTrialModal,
    isLoading: trialLoading,
    closeTrialModal,
    getAccessStatus,
    hasPremiumAccess
  } = useTrialManagement()
  
  // Enable auto-save with 3 second delay
  useAutoSave(3000)

  // Development helper - expose function to reset auth state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).resetAuthState = () => {
        // console.log('🔄 Resetting authentication state...')
        sessionStorage.removeItem('currencySetupCompleted')
        sessionStorage.removeItem('pinVerified')
        sessionStorage.removeItem('pinVerificationTime')
        localStorage.removeItem('hasSeenCountrySelection')
        console.log('✅ Auth state cleared, refreshing page...')
        window.location.reload()
      }
      
      (window as any).forceShowCurrency = () => {
        // console.log('🔄 Forcing currency form to show...')
        sessionStorage.removeItem('currencySetupCompleted')
        setShowCountrySelection(true)
        setShowPINAuth(false)
        setIsPINAuthenticated(false)
      }
      
      (window as any).checkSupabaseTables = async () => {
        // console.log('🔍 Checking Supabase tables...')
        try {
          const { createClient } = await import('@supabase/supabase-js')
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
          
          // Check user_pins table
          const { data: pins, error: pinsError } = await supabase
            .from('user_pins')
            .select('count')
            .limit(1)
          
          if (pinsError) {
            console.error('❌ user_pins table issue:', pinsError.message)
            if (pinsError.code === 'PGRST116') {
              // console.error('💡 Solution: Run the SQL schema in Supabase dashboard')
            }
          } else {
            // console.log('✅ user_pins table exists and accessible')
          }
          
          // Check user_settings table
          const { data: settings, error: settingsError } = await supabase
            .from('user_settings')
            .select('count')
            .limit(1)
          
          if (settingsError) {
            console.error('❌ user_settings table issue:', settingsError.message)
            if (settingsError.code === 'PGRST116') {
              // console.error('💡 Solution: Run the SQL schema in Supabase dashboard')
            }
          } else {
            // console.log('✅ user_settings table exists and accessible')
          }
          
          // Check user_business_transactions table
          const { data: transactions, error: transactionsError } = await supabase
            .from('user_business_transactions')
            .select('count')
            .limit(1)
          
          if (transactionsError) {
            console.error('❌ user_business_transactions table issue:', transactionsError.message)
            if (transactionsError.code === 'PGRST116') {
              // console.error('💡 Solution: Run the updated SQL schema in Supabase dashboard')
            }
          } else {
            // console.log('✅ user_business_transactions table exists and accessible')
          }
        } catch (error) {
          console.error('❌ Error checking Supabase:', error)
        }
      }
      
      (window as any).clearAllPINData = () => {
        // console.log('🧹 Clearing all PIN data (localStorage + sessionStorage)...')
        localStorage.removeItem('userPIN')
        localStorage.removeItem('pinSetupCompleted')
        localStorage.removeItem('pinSetupDate')
        sessionStorage.removeItem('pinVerified')
        sessionStorage.removeItem('pinVerificationTime')
        // console.log('✅ All PIN data cleared. Refresh page to test from clean state.')
      }
      
      // console.log('💡 Dev Helpers Available:')
      // console.log('  - resetAuthState() - Clear all auth data and refresh')
      // console.log('  - forceShowCurrency() - Force show currency form')
      // console.log('  - checkSupabaseTables() - Check if Supabase tables exist')
      // console.log('  - clearAllPINData() - Clear all PIN data for clean testing')
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    
    // Ensure Pakistan is set as default if no country is selected or still using India
    if (!generalSettings.selectedCountry || generalSettings.selectedCountry === 'IN') {
      // console.log('Setting default country to Pakistan')
      dispatch(updateGeneralSettings({
        selectedCountry: 'PK',
        selectedCurrency: 'PKR',
        selectedCurrencySymbol: '₨',
        selectedNumberFormat: 'en-PK',
        selectedDateFormat: 'DD/MM/YYYY',
        businessCurrency: '₨'
      }))
    }

    // ALWAYS show currency form on page load/refresh - this ensures it appears every time
    // console.log('🔍 Page loaded - checking if we should show currency form')
    
    // Check if user has completed the currency setup in this session
    const currencySetupCompleted = sessionStorage.getItem('currencySetupCompleted') === 'true'
    
    if (!currencySetupCompleted) {
      // console.log('📱 SHOWING CURRENCY FORM: Not completed in this session')
      setShowCountrySelection(true)
      setShowPINAuth(false)
      setIsPINAuthenticated(false)
      return
    }

    // console.log('📱 Currency setup completed in session, checking PIN requirements...')
    
    // Check PIN requirements asynchronously
    const checkPINRequirements = async () => {
      const isPasscodeEnabled = generalSettings.enablePasscode
      
      if (isPasscodeEnabled) {
        // Check if user has a PIN set up for their phone number
        try {
          const { pinService } = await import('@/lib/pin-service')
          const hasPIN = await pinService.hasPIN(generalSettings.phoneNumber || '')
          
          if (hasPIN) {
            // PIN exists, check if it's already verified in session
            const sessionPinVerified = sessionStorage.getItem('pinVerified') === 'true'
            const pinVerificationTime = sessionStorage.getItem('pinVerificationTime')
            
            let isSessionValid = false
            if (pinVerificationTime) {
              const verificationTime = new Date(pinVerificationTime)
              const now = new Date()
              const hoursDiff = (now.getTime() - verificationTime.getTime()) / (1000 * 60 * 60)
              isSessionValid = hoursDiff < 24 // 24 hour session
            }

            if (sessionPinVerified && isSessionValid) {
              // console.log('🔓 PIN already verified and session valid - allowing access')
              setIsPINAuthenticated(true)
              setShowPINAuth(false)
              setShowPINSetup(false)
              setShowCountrySelection(false)
            } else {
              // console.log('🔒 PIN exists but needs verification - showing PIN auth')
              setIsPINAuthenticated(false)
              setShowPINAuth(true)
              setShowPINSetup(false)
              setShowCountrySelection(false)
              // Clear expired session
              sessionStorage.removeItem('pinVerified')
              sessionStorage.removeItem('pinVerificationTime')
            }
          } else {
            // No PIN exists but passcode is enabled - show PIN setup
            // console.log('📝 Passcode enabled but no PIN found - showing PIN setup')
            setIsPINAuthenticated(false)
            setShowPINAuth(false)
            setShowPINSetup(true)
            setShowCountrySelection(false)
          }
        } catch (error) {
          console.error('Error checking PIN status:', error)
          
          // If Supabase is not available/tables don't exist, we can't rely on localStorage
          // because the PIN might not actually exist in the database
          // Always default to PIN setup when database is unavailable
          if ((error as any)?.code === 'PGRST116' || (error as any)?.message?.includes('not found')) {
            console.warn('⚠️ Supabase tables not found - defaulting to PIN setup')
            console.warn('💡 Please run the SQL schema in Supabase dashboard')
            setShowPINSetup(true)
            setShowPINAuth(false)
            setIsPINAuthenticated(false)
            setShowCountrySelection(false)
            // Clear localStorage since we can't verify it against database
            localStorage.removeItem('pinSetupCompleted')
            localStorage.removeItem('userPIN')
            return
          }
          
          // For other errors, fallback to localStorage check
          const pinSetupCompleted = localStorage.getItem('pinSetupCompleted') === 'true'
          const sessionPinVerified = sessionStorage.getItem('pinVerified') === 'true'
          const pinVerificationTime = sessionStorage.getItem('pinVerificationTime')

          if (pinSetupCompleted) {
            let isSessionValid = false
            if (pinVerificationTime) {
              const verificationTime = new Date(pinVerificationTime)
              const now = new Date()
              const hoursDiff = (now.getTime() - verificationTime.getTime()) / (1000 * 60 * 60)
              isSessionValid = hoursDiff < 24
            }

            if (sessionPinVerified && isSessionValid) {
              // console.log('🔓 PIN already verified (localStorage fallback)')
              setIsPINAuthenticated(true)
              setShowPINAuth(false)
              setShowPINSetup(false)
              setShowCountrySelection(false)
            } else {
              // console.log('🔒 Showing PIN authentication (localStorage fallback)')
              setIsPINAuthenticated(false)
              setShowPINAuth(true)
              setShowPINSetup(false)
              setShowCountrySelection(false)
              sessionStorage.removeItem('pinVerified')
              sessionStorage.removeItem('pinVerificationTime')
            }
          } else {
            // console.log('📝 No PIN setup found (localStorage fallback) - showing setup')
            setShowPINSetup(true)
            setShowPINAuth(false)
            setIsPINAuthenticated(false)
            setShowCountrySelection(false)
          }
        }
      } else {
        // No PIN required
        // console.log('✅ No PIN required - allowing direct access')
        setIsPINAuthenticated(true)
        setShowPINAuth(false)
        setShowPINSetup(false)
        setShowCountrySelection(false)
      }
    }
    
    checkPINRequirements()

    // Initialize user if phone exists but no user data
    const hasPhoneNumber = generalSettings.phoneNumber && generalSettings.phoneNumber.trim() !== ''
    if (hasPhoneNumber && !currentUser) {
      console.log('🔄 Auto-initializing user with phone:', generalSettings.phoneNumber)
      initializeUser(generalSettings.phoneNumber).catch(console.error)
    }
  }, [generalSettings, dispatch, currentUser, initializeUser])

  const handleCountrySelectionClose = async () => {
    setShowCountrySelection(false)
    // Mark that currency setup is completed for this session
    sessionStorage.setItem('currencySetupCompleted', 'true')
    
    // console.log('📱 CURRENCY SETUP COMPLETE - checking PIN requirements')
    
    // After currency setup, check if PIN authentication is needed
    const isPasscodeEnabled = generalSettings.enablePasscode
    
    if (isPasscodeEnabled) {
      // Check if user has a PIN set up for their phone number
      try {
        const { pinService } = await import('@/lib/pin-service')
        const hasPIN = await pinService.hasPIN(generalSettings.phoneNumber || '')
        
        if (hasPIN) {
          // PIN exists, check if it's already verified in this session
          const sessionPinVerified = sessionStorage.getItem('pinVerified') === 'true'
          const pinVerificationTime = sessionStorage.getItem('pinVerificationTime')
          
          let isSessionValid = false
          if (pinVerificationTime) {
            const verificationTime = new Date(pinVerificationTime)
            const now = new Date()
            const hoursDiff = (now.getTime() - verificationTime.getTime()) / (1000 * 60 * 60)
            isSessionValid = hoursDiff < 24
          }
          
          if (!sessionPinVerified || !isSessionValid) {
            // console.log('🔒 PIN authentication required after currency setup')
            setShowPINAuth(true)
            setShowPINSetup(false)
            setIsPINAuthenticated(false)
          } else {
            // console.log('🔓 PIN already verified in current session')
            setIsPINAuthenticated(true)
            setShowPINAuth(false)
            setShowPINSetup(false)
          }
        } else {
          // No PIN exists but passcode is enabled - show PIN setup
          // console.log('📝 Passcode enabled but no PIN found - showing PIN setup after currency')
          setShowPINSetup(true)
          setShowPINAuth(false)
          setIsPINAuthenticated(false)
        }
      } catch (error) {
        console.error('Error checking PIN status after currency setup:', error)
        
        // If Supabase is not available/tables don't exist, default to PIN setup
        if ((error as any)?.code === 'PGRST116' || (error as any)?.message?.includes('not found')) {
          console.warn('⚠️ Supabase tables not found - defaulting to PIN setup after currency')
          setShowPINSetup(true)
          setShowPINAuth(false)
          setIsPINAuthenticated(false)
          // Clear localStorage since we can't verify it against database
          localStorage.removeItem('pinSetupCompleted')
          localStorage.removeItem('userPIN')
          return
        }
        
        // For other errors, fallback to localStorage check
        const pinSetupCompleted = localStorage.getItem('pinSetupCompleted') === 'true'
        
        if (pinSetupCompleted) {
          const sessionPinVerified = sessionStorage.getItem('pinVerified') === 'true'
          const pinVerificationTime = sessionStorage.getItem('pinVerificationTime')
          
          let isSessionValid = false
          if (pinVerificationTime) {
            const verificationTime = new Date(pinVerificationTime)
            const now = new Date()
            const hoursDiff = (now.getTime() - verificationTime.getTime()) / (1000 * 60 * 60)
            isSessionValid = hoursDiff < 24
          }
          
          if (!sessionPinVerified || !isSessionValid) {
            // console.log('🔒 PIN authentication required (localStorage fallback)')
            setShowPINAuth(true)
            setShowPINSetup(false)
            setIsPINAuthenticated(false)
          } else {
            // console.log('🔓 PIN already verified (localStorage fallback)')
            setIsPINAuthenticated(true)
            setShowPINAuth(false)
            setShowPINSetup(false)
          }
        } else {
          // console.log('📝 No PIN setup found (localStorage fallback) - showing setup')
          setShowPINSetup(true)
          setShowPINAuth(false)
          setIsPINAuthenticated(false)
        }
      }
    } else {
      // No PIN required
      // console.log('✅ No PIN required, user can access app directly')
      setIsPINAuthenticated(true)
      setShowPINAuth(false)
      setShowPINSetup(false)
    }
  }

  const handlePINAuthSuccess = () => {
    // console.log('🔓 STEP 2 COMPLETE: PIN authentication successful - user can now access app')
    setIsPINAuthenticated(true)
    setShowPINAuth(false)
    setShowPINSetup(false)
  }

  const handlePINSetupComplete = () => {
    // console.log('📝 PIN setup complete - user can now access app')
    setShowPINSetup(false)
    setIsPINAuthenticated(true)
    setShowPINAuth(false)
  }

  const handleTrialUpgrade = () => {
    // Open external website instead of local pricing page
    if (typeof window !== 'undefined') {
      window.open('https://craftcrm.tech/pricing', '_blank')
    }
  }

  // Check if user should have access to the app
  const shouldBlockAccess = () => {
    const accessStatus = getAccessStatus()
    return !accessStatus.hasAccess
  }

  return (
    <SalesProvider>
      {/* Only show content if PIN is authenticated or not required AND user has access */}
      {isPINAuthenticated && !shouldBlockAccess() ? (
        <>
          {/* Trial Status Banner */}
          {trialInfo && !trialLoading && (
            <div className="fixed top-0 left-0 right-0 z-40 p-4">
              <TrialStatusBanner 
                trialInfo={trialInfo}
                subscriptionInfo={subscriptionInfo}
                onUpgradeClick={handleTrialUpgrade}
              />
            </div>
          )}
          
          {/* Main Content with trial banner offset */}
          <div className={trialInfo && !trialLoading ? "pt-20" : ""}>
            {children}
          </div>
        </>
      ) : null}
      
      {/* Country Selection Overlay - Priority 1: Phone setup first */}
      {mounted && (
        <CountrySelectionOverlay 
          isOpen={showCountrySelection} 
          onClose={handleCountrySelectionClose} 
        />
      )}
      
      {/* PIN Authentication Overlay - Priority 2: After phone setup */}
      {mounted && showPINAuth && (
        <PINAuthOverlay onAuthSuccess={handlePINAuthSuccess} />
      )}
      
      {/* PIN Setup Dialog - Priority 2.5: When passcode is enabled but no PIN exists */}
      {mounted && showPINSetup && (
        <PINSetupDialog 
          open={showPINSetup}
          onOpenChange={setShowPINSetup}
          onSetupComplete={handlePINSetupComplete}
        />
      )}
      
      {/* Trial Expiry Modal */}
      {trialInfo && !trialLoading && (
        <TrialExpiryModal
          isOpen={showTrialModal}
          onClose={closeTrialModal}
          trialInfo={trialInfo}
        />
      )}
      
      {/* Access Blocked Message */}
      {isPINAuthenticated && shouldBlockAccess() && !showTrialModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Trial Expired</h2>
              <p className="text-gray-600 mb-6">
                Your 7-day trial has ended. Upgrade to premium to continue using Craft CRM.
              </p>
              <button
                onClick={handleTrialUpgrade}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
              >
                Upgrade to Premium
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Show welcome message for new users - only when fully authenticated */}
      {isNewUser && currentUser && isPINAuthenticated && !showCountrySelection && !showPINAuth && !showPINSetup && !shouldBlockAccess() && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-medium">Welcome to Craft CRM!</span>
          </div>
          <p className="text-sm mt-1 text-green-100">
            Your new business profile has been created. All your data will be automatically saved.
          </p>
        </div>
      )}
    </SalesProvider>
  )
} 