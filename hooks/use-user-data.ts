import { useState, useCallback, useEffect } from 'react'
import { useAppSelector } from '@/lib/store/hooks'
import { UserDataManager } from '@/lib/user-data-manager'

interface UseUserDataReturn {
  currentUser: string | null
  isNewUser: boolean | null
  isLoading: boolean
  error: string | null
  initializeUser: (phoneNumber: string) => Promise<{ isNewUser: boolean; userData: any }>
  saveUserData: () => Promise<void>
  clearUserSession: () => void
  hasExistingData: (phoneNumber: string) => Promise<boolean>
}

/**
 * Hook for managing user data based on phone numbers
 * Provides easy access to user data management functionality
 */
export function useUserData(): UseUserDataReturn {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const generalSettings = useAppSelector((state) => state.settings.general)

  // Initialize current user from settings if available
  useEffect(() => {
    if (generalSettings.phoneNumber && !currentUser) {
      setCurrentUser(generalSettings.phoneNumber)
    }
  }, [generalSettings.phoneNumber, currentUser])

  /**
   * Initialize or load user data by phone number
   */
  const initializeUser = useCallback(async (phoneNumber: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log(`🔄 Initializing user with phone: ${phoneNumber}`)
      
      const result = await UserDataManager.initializeUserByPhone(phoneNumber)
      
      setCurrentUser(phoneNumber)
      setIsNewUser(result.isNewUser)
      
      if (result.isNewUser) {
        console.log('✅ New user created and initialized')
      } else {
        console.log('✅ Existing user data loaded')
      }
      
      return result
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize user'
      setError(errorMessage)
      console.error('❌ Error initializing user:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Save current user data to database
   */
  const saveUserData = useCallback(async () => {
    if (!currentUser) {
      setError('No current user to save data for')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      console.log('💾 Saving user data...')
      await UserDataManager.saveCurrentUserData()
      console.log('✅ User data saved successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save user data'
      setError(errorMessage)
      console.error('❌ Error saving user data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser])

  /**
   * Clear current user session
   */
  const clearUserSession = useCallback(() => {
    UserDataManager.clearUserSession()
    setCurrentUser(null)
    setIsNewUser(null)
    setError(null)
    console.log('🔄 User session cleared')
  }, [])

  /**
   * Check if a phone number has existing data
   */
  const hasExistingData = useCallback(async (phoneNumber: string): Promise<boolean> => {
    try {
      return await UserDataManager.hasExistingData(phoneNumber)
    } catch (err) {
      console.error('Error checking existing data:', err)
      return false
    }
  }, [])

  return {
    currentUser,
    isNewUser,
    isLoading,
    error,
    initializeUser,
    saveUserData,
    clearUserSession,
    hasExistingData
  }
}
