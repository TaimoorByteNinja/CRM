/**
 * Setup Manager - Handles first-time app setup state
 */

const SETUP_STORAGE_KEY = 'craft-crm-setup-completed'

export class SetupManager {
  /**
   * Check if the user has completed the initial setup
   */
  static hasCompletedSetup(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(SETUP_STORAGE_KEY) === 'true'
  }

  /**
   * Mark the setup as completed
   */
  static markSetupCompleted(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(SETUP_STORAGE_KEY, 'true')
  }

  /**
   * Reset the setup state (useful for testing/development)
   */
  static resetSetup(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(SETUP_STORAGE_KEY)
  }

  /**
   * Check if this is the first launch of the application
   */
  static isFirstLaunch(): boolean {
    return !this.hasCompletedSetup()
  }
}

/**
 * Hook for managing setup state in React components
 */
export function useSetupManager() {
  return {
    hasCompletedSetup: SetupManager.hasCompletedSetup(),
    markSetupCompleted: SetupManager.markSetupCompleted,
    resetSetup: SetupManager.resetSetup,
    isFirstLaunch: SetupManager.isFirstLaunch(),
  }
}
