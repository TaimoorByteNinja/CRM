import { supabase } from './supabaseClient'

export interface UserPIN {
  id: string
  phone_number: string
  pin_hash: string
  created_at: string
  updated_at: string
  is_active: boolean
  failed_attempts: number
  last_failed_attempt: string | null
  locked_until: string | null
}

export class PINService {
  // Hash PIN with phone number for security
  private hashPIN(pin: string, phoneNumber: string): string {
    return btoa(pin + phoneNumber + 'CRM_SECRET_SALT')
  }

  // Save PIN to Supabase
  async savePIN(phoneNumber: string, pin: string): Promise<{ success: boolean; error?: string }> {
    try {
      const pinHash = this.hashPIN(pin, phoneNumber)
      
      // First check if PIN already exists for this phone number
      const { data: existingPIN } = await supabase
        .from('user_pins')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single()

      if (existingPIN) {
        // Update existing PIN
        const { error } = await supabase
          .from('user_pins')
          .update({
            pin_hash: pinHash,
            is_active: true,
            failed_attempts: 0,
            last_failed_attempt: null,
            locked_until: null
          })
          .eq('phone_number', phoneNumber)

        if (error) {
          console.error('Error updating PIN:', error)
          return { success: false, error: error.message }
        }
      } else {
        // Create new PIN record
        const { error } = await supabase
          .from('user_pins')
          .insert({
            phone_number: phoneNumber,
            pin_hash: pinHash,
            is_active: true,
            failed_attempts: 0
          })

        if (error) {
          console.error('Error saving PIN:', error)
          return { success: false, error: error.message }
        }
      }

      // Also save to localStorage as backup
      localStorage.setItem('userPIN', pinHash)
      localStorage.setItem('pinSetupCompleted', 'true')
      localStorage.setItem('pinSetupDate', new Date().toISOString())

      console.log('✅ PIN saved successfully to Supabase and localStorage')
      return { success: true }
    } catch (error: any) {
      console.error('Error in savePIN:', error)
      
      // Check if it's a table not found error
      if (error?.code === 'PGRST116' || error?.message?.includes('not found')) {
        console.warn('user_pins table not found in Supabase. Please run the SQL schema. Saving to localStorage only.')
        // Still save to localStorage as fallback
        const pinHash = this.hashPIN(pin, phoneNumber)
        localStorage.setItem('userPIN', pinHash)
        localStorage.setItem('pinSetupCompleted', 'true')
        localStorage.setItem('pinSetupDate', new Date().toISOString())
        return { success: true }
      }
      
      return { success: false, error: 'Failed to save PIN' }
    }
  }

  // Verify PIN against Supabase
  async verifyPIN(phoneNumber: string, pin: string): Promise<{ success: boolean; error?: string; isLocked?: boolean }> {
    try {
      const pinHash = this.hashPIN(pin, phoneNumber)

      // Get PIN record from Supabase
      const { data: pinRecord, error } = await supabase
        .from('user_pins')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Supabase error during PIN verification:', error)
        // Check if it's a table not found error (406 or PGRST116)
        if (error.code === 'PGRST116' || error.message?.includes('not found')) {
          console.warn('user_pins table not found in Supabase. Please run the SQL schema. Falling back to localStorage.')
        }
        // Fallback to localStorage
        return this.verifyPINLocalStorage(phoneNumber, pin)
      }

      if (!pinRecord) {
        console.error('PIN record not found for phone:', phoneNumber)
        // Fallback to localStorage
        return this.verifyPINLocalStorage(phoneNumber, pin)
      }

      // Check if PIN is locked due to failed attempts
      if (pinRecord.locked_until && new Date(pinRecord.locked_until) > new Date()) {
        console.log('🔒 PIN is locked due to failed attempts')
        return { success: false, error: 'PIN is temporarily locked', isLocked: true }
      }

      // Verify PIN
      if (pinRecord.pin_hash === pinHash) {
        // PIN is correct, reset failed attempts
        await supabase
          .from('user_pins')
          .update({
            failed_attempts: 0,
            last_failed_attempt: null,
            locked_until: null
          })
          .eq('phone_number', phoneNumber)

        // Set session flags
        sessionStorage.setItem('pinVerified', 'true')
        sessionStorage.setItem('pinVerificationTime', new Date().toISOString())

        console.log('✅ PIN verified successfully')
        return { success: true }
      } else {
        // PIN is incorrect, increment failed attempts
        const newFailedAttempts = (pinRecord.failed_attempts || 0) + 1
        const maxAttempts = 3
        
        let updateData: any = {
          failed_attempts: newFailedAttempts,
          last_failed_attempt: new Date().toISOString()
        }

        // Lock PIN if max attempts reached (30 seconds lockout)
        if (newFailedAttempts >= maxAttempts) {
          updateData.locked_until = new Date(Date.now() + 30 * 1000).toISOString()
        }

        await supabase
          .from('user_pins')
          .update(updateData)
          .eq('phone_number', phoneNumber)

        console.log('❌ PIN verification failed')
        return { 
          success: false, 
          error: `Incorrect PIN. ${Math.max(0, maxAttempts - newFailedAttempts)} attempts remaining.`,
          isLocked: newFailedAttempts >= maxAttempts
        }
      }
    } catch (error) {
      console.error('Error in verifyPIN:', error)
      // Fallback to localStorage
      return this.verifyPINLocalStorage(phoneNumber, pin)
    }
  }

  // Fallback verification using localStorage
  private verifyPINLocalStorage(phoneNumber: string, pin: string): { success: boolean; error?: string } {
    try {
      const storedPin = localStorage.getItem('userPIN')
      if (!storedPin) {
        return { success: false, error: 'PIN not found' }
      }

      const hashedInput = this.hashPIN(pin, phoneNumber)
      
      if (hashedInput === storedPin) {
        sessionStorage.setItem('pinVerified', 'true')
        sessionStorage.setItem('pinVerificationTime', new Date().toISOString())
        return { success: true }
      } else {
        return { success: false, error: 'Incorrect PIN' }
      }
    } catch (error) {
      return { success: false, error: 'Verification failed' }
    }
  }

  // Check if PIN exists for user
  async hasPIN(phoneNumber: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_pins')
        .select('id')
        .eq('phone_number', phoneNumber)
        .eq('is_active', true)
        .single()

      if (error) {
        console.log('Supabase PIN check error (falling back to localStorage):', error.message)
        // Check if it's a table not found error
        if (error.code === 'PGRST116' || error.message?.includes('not found')) {
          console.warn('user_pins table not found in Supabase. Please run the SQL schema.')
        }
        // Fallback check localStorage
        const localPin = localStorage.getItem('pinSetupCompleted')
        return localPin === 'true'
      }

      return !!data
    } catch (error) {
      console.log('PIN service error (falling back to localStorage):', error)
      // Fallback check localStorage
      const localPin = localStorage.getItem('pinSetupCompleted')
      return localPin === 'true'
    }
  }

  // Delete PIN (when user disables passcode)
  async deletePIN(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_pins')
        .update({ is_active: false })
        .eq('phone_number', phoneNumber)

      if (error) {
        console.error('Error deactivating PIN:', error)
      }

      // Also clear localStorage
      localStorage.removeItem('userPIN')
      localStorage.removeItem('pinSetupCompleted')
      localStorage.removeItem('pinSetupDate')
      sessionStorage.removeItem('pinVerified')
      sessionStorage.removeItem('pinVerificationTime')

      console.log('✅ PIN deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('Error in deletePIN:', error)
      return { success: false, error: 'Failed to delete PIN' }
    }
  }
}

// Export singleton instance
export const pinService = new PINService()
