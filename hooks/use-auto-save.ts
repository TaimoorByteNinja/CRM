import { useEffect, useRef } from 'react'
import { useAppSelector } from '@/lib/store/hooks'
import { UserDataManager } from '@/lib/user-data-manager'

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null
  
  const debounced = ((...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T & { cancel: () => void }
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }
  
  return debounced
}

/**
 * Hook that automatically saves user data when Redux state changes
 * Uses debouncing to prevent excessive API calls
 */
export function useAutoSave(delay: number = 2000) {
  const currentUser = UserDataManager.getCurrentUserPhone()
  const hasInitialized = useRef(false)
  
  // Subscribe to relevant Redux state changes
  const sales = useAppSelector((state) => state.sales.sales)
  const customers = useAppSelector((state) => state.customers.customers)
  const parties = useAppSelector((state) => state.parties.parties)
  const items = useAppSelector((state) => state.items.items)
  const settings = useAppSelector((state) => state.settings)

  // Create debounced save function
  const debouncedSave = useRef(
    debounce(async () => {
      if (!currentUser || !hasInitialized.current) {
        return
      }
      
      try {
        console.log('🔄 Auto-saving user data...')
        await UserDataManager.saveCurrentUserData()
        console.log('✅ Auto-save completed')
      } catch (error) {
        console.error('❌ Auto-save failed:', error)
      }
    }, delay)
  ).current

  // Effect to trigger save when data changes
  useEffect(() => {
    if (currentUser) {
      hasInitialized.current = true
      debouncedSave()
    }
  }, [sales, customers, parties, items, settings, currentUser, debouncedSave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  // Save immediately when component unmounts
  useEffect(() => {
    return () => {
      if (currentUser && hasInitialized.current) {
        UserDataManager.saveCurrentUserData().catch(console.error)
      }
    }
  }, [currentUser])

  return {
    triggerSave: () => debouncedSave(),
    cancelAutoSave: () => debouncedSave.cancel()
  }
}
