'use client'

import { Provider as ReduxProvider } from 'react-redux'
import { useEffect } from 'react'
import { store } from './index'
import { updateGeneralSettings } from './slices/settingsSlice'

function StoreHydrator() {
  useEffect(() => {
    // Hydrate phone number from localStorage on app startup
    const savedPhone = localStorage.getItem('currentUserPhone')
    if (savedPhone && savedPhone.trim() !== '') {
      console.log('🔄 Global hydration: Loading phone number from localStorage:', savedPhone)
      store.dispatch(updateGeneralSettings({ phoneNumber: savedPhone }))
    }
  }, [])

  return null
}

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <StoreHydrator />
      {children}
    </ReduxProvider>
  )
} 