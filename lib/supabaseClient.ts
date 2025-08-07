import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './database.types'

// Check if we're running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron

// Create Supabase client with proper environment variable handling
export const supabase = createClientComponentClient<Database>({
  supabaseUrl: isElectron 
    ? window.electronAPI?.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: isElectron 
    ? window.electronAPI?.supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

// Add TypeScript declaration for Electron API
declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean
      supabaseUrl: string
      supabaseKey: string
      supabaseOperation: (operation: string, data: any) => Promise<any>
      saveFile: (data: any, filename: string, defaultPath?: string) => Promise<any>
      backupData: (data: any) => Promise<any>
      platform: string
      print: () => void
      openExternal: (url: string) => Promise<any>
      onOffline: (callback: () => void) => void
      onOnline: (callback: () => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
}
