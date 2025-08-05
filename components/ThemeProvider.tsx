"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks'
import { CurrencyManager } from '@/lib/currency-manager'
import { generateCSSVariables } from '@/lib/solid-theme'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  applyTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const generalSettings = useAppSelector((state) => state.settings.general)
  const currencyManager = CurrencyManager.getInstance()

  // Apply theme and currency settings
  const applyTheme = () => {
    // Inject CSS variables for solid theme
    const styleElement = document.getElementById('solid-theme-vars') || document.createElement('style')
    styleElement.id = 'solid-theme-vars'
    styleElement.innerHTML = generateCSSVariables()
    if (!document.getElementById('solid-theme-vars')) {
      document.head.appendChild(styleElement)
    }

    // Set currency based on selected country
    if (generalSettings.selectedCountry) {
      currencyManager.setCurrency(generalSettings.selectedCountry)
    }

    // Apply solid background to body
    document.body.style.backgroundColor = '#f8fafc'
    document.body.classList.remove('bg-gradient-to-br', 'from-slate-50', 'via-blue-50/30', 'to-indigo-50/50')
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  useEffect(() => {
    applyTheme()
  }, [generalSettings.selectedCountry])

  useEffect(() => {
    // Apply theme on initial load
    applyTheme()
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
