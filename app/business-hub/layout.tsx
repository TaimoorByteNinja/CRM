/**
 * Business Hub Layout Component
 * 
 * This layout provides the basic structure for the business hub.
 * Country selection is now handled through the Settings page.
 * Updated to remove automatic overlay display.
 */

"use client"

import { useEffect, useState } from "react"
import { SalesProvider } from "@/lib/sales-context"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectGeneralSettings, updateGeneralSettings } from "@/lib/store/slices/settingsSlice"
import { CountrySelectionOverlay } from "@/components/CountrySelectionOverlay"
import { useUserData } from "@/hooks/use-user-data"
import { useAutoSave } from "@/hooks/use-auto-save"

export default function BusinessHubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const generalSettings = useAppSelector(selectGeneralSettings)
  const dispatch = useAppDispatch()
  const { currentUser, isNewUser, initializeUser } = useUserData()
  const [showCountrySelection, setShowCountrySelection] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Enable auto-save with 3 second delay
  useAutoSave(3000)

  useEffect(() => {
    setMounted(true)
    
    // Ensure Pakistan is set as default if no country is selected or still using India
    if (!generalSettings.selectedCountry || generalSettings.selectedCountry === 'IN') {
      console.log('Setting default country to Pakistan')
      dispatch(updateGeneralSettings({
        selectedCountry: 'PK',
        selectedCurrency: 'PKR',
        selectedCurrencySymbol: '₨',
        selectedNumberFormat: 'en-PK',
        selectedDateFormat: 'DD/MM/YYYY',
        businessCurrency: '₨'
      }))
    }

    // Show country selection if no phone number is set
    if (!generalSettings.phoneNumber || generalSettings.phoneNumber.trim() === '') {
      console.log('📱 No phone number found, showing country selection')
      setShowCountrySelection(true)
    } else if (generalSettings.phoneNumber && !currentUser) {
      console.log('🔄 Auto-initializing user with phone:', generalSettings.phoneNumber)
      initializeUser(generalSettings.phoneNumber).catch(console.error)
    }
  }, [generalSettings.selectedCountry, generalSettings.phoneNumber, dispatch, currentUser, initializeUser])

  const handleCountrySelectionClose = () => {
    setShowCountrySelection(false)
  }

  return (
    <SalesProvider>
      {children}
      
      {/* Debug Information - Development Only */}
      {process.env.NODE_ENV === 'development' && mounted && (
        <div className="fixed bottom-4 left-4 bg-black/90 text-white p-3 rounded-lg text-xs z-[9999] shadow-2xl border border-gray-600 min-w-[250px]">
          <div className="font-semibold mb-2 text-yellow-300">🛠️ Debug Panel</div>
          <div>Phone Number: <span className={generalSettings.phoneNumber ? 'text-green-400' : 'text-red-400'}>{generalSettings.phoneNumber || 'Not Set'}</span></div>
          <div>Show Form: <span className={showCountrySelection ? 'text-green-400' : 'text-red-400'}>{showCountrySelection ? 'Yes' : 'No'}</span></div>
          <div>Current User: <span className={currentUser ? 'text-green-400' : 'text-red-400'}>{currentUser || 'None'}</span></div>
          <div>Is New User: <span className={isNewUser ? 'text-blue-400' : 'text-gray-400'}>{isNewUser === null ? 'Unknown' : (isNewUser ? 'Yes' : 'No')}</span></div>
          <div className="flex gap-1 mt-2">
            <button 
              onClick={() => {
                console.log('🔄 Clearing phone number...')
                dispatch(updateGeneralSettings({ phoneNumber: '' }))
                setShowCountrySelection(true)
              }}
              className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs transition-colors"
            >
              Clear Phone
            </button>
            <button 
              onClick={() => {
                setShowCountrySelection(true)
              }}
              className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs transition-colors"
            >
              Show Form
            </button>
          </div>
        </div>
      )}
      
      {/* Show welcome message for new users */}
      {isNewUser && currentUser && (
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

      {/* Country Selection Overlay - only show if no phone number is set */}
      {mounted && (
        <CountrySelectionOverlay 
          isOpen={showCountrySelection} 
          onClose={handleCountrySelectionClose} 
        />
      )}
    </SalesProvider>
  )
} 