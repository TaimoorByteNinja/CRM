import CryptoJS from 'crypto-js';

export interface TrialInfo {
  startDate: string;
  endDate: string;
  daysUsed: number;
  daysRemaining: number;
  isExpired: boolean;
  isActive: boolean;
}

export interface SubscriptionInfo {
  isActive: boolean;
  plan: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isExpired: boolean;
}

export class TrialManager {
  private static readonly TRIAL_DAYS = 7;
  private static readonly SECRET_KEY = 'craft-crm-trial-key-2025-secure';
  private static readonly STORAGE_KEY = 'craftcrm_trial_data';
  private static readonly SUB_STORAGE_KEY = 'craftcrm_subscription_data';
  private static readonly COOKIE_TRIAL_KEY = 'craftcrm_trial';
  private static readonly COOKIE_SUB_KEY = 'craftcrm_subscription';

  // Generate secure hash for trial data
  private static generateHash(data: string): string {
    return CryptoJS.HmacSHA256(data, this.SECRET_KEY).toString();
  }

  // Verify hash integrity
  private static verifyHash(data: string, hash: string): boolean {
    const expectedHash = this.generateHash(data);
    return expectedHash === hash;
  }

  // Set cookie with secure options
  private static setCookie(name: string, value: string, days: number = 365): void {
    if (typeof window === 'undefined') return;
    
    const expires = new Date();
   // expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    //change this time to 2 minutes
    expires.setTime(expires.getTime() + (2 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure=${window.location.protocol === 'https:'}`;
  }

  // Get cookie value
  private static getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Delete cookie
  private static deleteCookie(name: string): void {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  // Store data in both localStorage and cookies for redundancy
  private static storeData(key: string, data: any, cookieKey: string): void {
    if (typeof window === 'undefined') return;
    
    const dataString = JSON.stringify(data);
    const hash = this.generateHash(dataString);
    const encryptedData = CryptoJS.AES.encrypt(dataString, this.SECRET_KEY).toString();
    
    const storageData = { data: encryptedData, hash };
    
    // Store in localStorage
    localStorage.setItem(key, JSON.stringify(storageData));
    
    // Store in cookie as backup
    this.setCookie(cookieKey, JSON.stringify(storageData));
  }

  // Get data from localStorage first, fallback to cookies
  private static getData(key: string, cookieKey: string): any {
    if (typeof window === 'undefined') return null;
    
    try {
      // Try localStorage first
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Fallback to cookies
      const cookieData = this.getCookie(cookieKey);
      if (cookieData) {
        const parsed = JSON.parse(cookieData);
        // Restore to localStorage
        localStorage.setItem(key, JSON.stringify(parsed));
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get data:', error);
      return null;
    }
  }

  // Initialize trial when user first opens the app
  static initializeTrial(): TrialInfo {
    try {
      const existingData = this.getTrialData();
      if (existingData) {
        return existingData;
      }

      // Create new trial
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + this.TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
      
      const trialData = {
        startDate,
        endDate,
        created: Date.now()
      };

      // Store in both localStorage and cookies
      this.storeData(this.STORAGE_KEY, trialData, this.COOKIE_TRIAL_KEY);

      return this.calculateTrialInfo(startDate, endDate);
    } catch (error) {
      console.error('Failed to initialize trial:', error);
      return this.getDefaultTrialInfo();
    }
  }

  // Get current trial status
  static getTrialData(): TrialInfo | null {
    try {
      if (typeof window === 'undefined') {
        return null;
      }

      const stored = this.getData(this.STORAGE_KEY, this.COOKIE_TRIAL_KEY);
      if (!stored) {
        return null;
      }

      const { data: encryptedData, hash } = stored;
      
      // Decrypt data
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
      const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      // Verify hash
      if (!this.verifyHash(decryptedData, hash)) {
        console.warn('Trial data tampering detected');
        return null;
      }

      const trialData = JSON.parse(decryptedData);
      return this.calculateTrialInfo(trialData.startDate, trialData.endDate);
    } catch (error) {
      console.error('Failed to get trial data:', error);
      return null;
    }
  }

  // Calculate trial information
  private static calculateTrialInfo(startDate: string, endDate: string): TrialInfo {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const totalDays = this.TRIAL_DAYS;
    const daysUsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isExpired = now > end;
    const isActive = !isExpired && daysRemaining > 0;
    
    return {
      startDate,
      endDate,
      daysUsed: Math.min(daysUsed, totalDays),
      daysRemaining,
      isExpired,
      isActive
    };
  }

  // Get default trial info (fallback)
  private static getDefaultTrialInfo(): TrialInfo {
    const now = new Date();
    const endDate = new Date(now.getTime() + this.TRIAL_DAYS * 24 * 60 * 60 * 1000);
    
    return {
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      daysUsed: 0,
      daysRemaining: this.TRIAL_DAYS,
      isExpired: false,
      isActive: true
    };
  }

  // Activate premium subscription
  static activatePremiumSubscription(planType: string = 'premium'): SubscriptionInfo {
    try {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year
      
      const subscriptionData = {
        plan: planType,
        startDate,
        endDate,
        activated: Date.now()
      };

      // Store in both localStorage and cookies
      this.storeData(this.SUB_STORAGE_KEY, subscriptionData, this.COOKIE_SUB_KEY);

      return this.calculateSubscriptionInfo(planType, startDate, endDate);
    } catch (error) {
      console.error('Failed to activate subscription:', error);
      return this.getDefaultSubscriptionInfo();
    }
  }

  // Get current subscription status
  static getSubscriptionData(): SubscriptionInfo | null {
    try {
      if (typeof window === 'undefined') {
        return null;
      }

      const stored = this.getData(this.SUB_STORAGE_KEY, this.COOKIE_SUB_KEY);
      if (!stored) {
        return null;
      }

      const { data: encryptedData, hash } = stored;
      
      // Decrypt data
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
      const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      // Verify hash
      if (!this.verifyHash(decryptedData, hash)) {
        console.warn('Subscription data tampering detected');
        return null;
      }

      const subscriptionData = JSON.parse(decryptedData);
      return this.calculateSubscriptionInfo(
        subscriptionData.plan,
        subscriptionData.startDate,
        subscriptionData.endDate
      );
    } catch (error) {
      console.error('Failed to get subscription data:', error);
      return null;
    }
  }

  // Calculate subscription information
  private static calculateSubscriptionInfo(plan: string, startDate: string, endDate: string): SubscriptionInfo {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const daysRemaining = Math.max(0, Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isExpired = now > end;
    const isActive = !isExpired && daysRemaining > 0;
    
    return {
      isActive,
      plan,
      startDate,
      endDate,
      daysRemaining,
      isExpired
    };
  }

  // Get default subscription info
  private static getDefaultSubscriptionInfo(): SubscriptionInfo {
    return {
      isActive: false,
      plan: 'none',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      daysRemaining: 0,
      isExpired: true
    };
  }

  // Check if user has premium access
  static hasPremiumAccess(): boolean {
    const subscription = this.getSubscriptionData();
    if (subscription && subscription.isActive) {
      return true;
    }
    
    const trial = this.getTrialData();
    return trial ? trial.isActive : false;
  }

  // Get combined status
  static getAccessStatus() {
    const subscription = this.getSubscriptionData();
    const trial = this.getTrialData() || this.initializeTrial();

    return {
      trial,
      subscription,
      hasPremiumAccess: this.hasPremiumAccess(),
      status: subscription && subscription.isActive ? 'premium' : 
              trial.isActive ? 'trial' : 'expired'
    };
  }

  // Force logout user when trial expires
  static forceLogout(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Clear all authentication data
      sessionStorage.clear();
      localStorage.removeItem('pinVerified');
      localStorage.removeItem('pinVerificationTime');
      localStorage.removeItem('hasSeenCountrySelection');
      localStorage.removeItem('currencySetupCompleted');
      
      // Clear trial and subscription data
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.SUB_STORAGE_KEY);
      this.deleteCookie(this.COOKIE_TRIAL_KEY);
      this.deleteCookie(this.COOKIE_SUB_KEY);
      
      // Redirect to home page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Failed to force logout:', error);
    }
  }

  // Check if trial has expired and handle logout
  static checkTrialExpiry(): boolean {
    const trial = this.getTrialData();
    if (trial && trial.isExpired) {
      this.forceLogout();
      return true;
    }
    return false;
  }

  // Clear all trial and subscription data (for testing)
  static clearAllTrialData(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SUB_STORAGE_KEY);
    this.deleteCookie(this.COOKIE_TRIAL_KEY);
    this.deleteCookie(this.COOKIE_SUB_KEY);
  }
}
