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

  // Generate secure hash for trial data
  private static generateHash(data: string): string {
    return CryptoJS.HmacSHA256(data, this.SECRET_KEY).toString();
  }

  // Verify hash integrity
  private static verifyHash(data: string, hash: string): boolean {
    const expectedHash = this.generateHash(data);
    return expectedHash === hash;
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

      // Create secure hash
      const dataString = JSON.stringify(trialData);
      const hash = this.generateHash(dataString);
      
      // Store encrypted data
      const encryptedData = CryptoJS.AES.encrypt(dataString, this.SECRET_KEY).toString();
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
          data: encryptedData,
          hash
        }));
      }

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

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const { data: encryptedData, hash } = JSON.parse(stored);
      
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
    
    const totalMs = end.getTime() - start.getTime();
    const usedMs = now.getTime() - start.getTime();
    
    const daysUsed = Math.floor(usedMs / (24 * 60 * 60 * 1000));
    const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    
    const isExpired = now > end;
    const isActive = !isExpired && daysRemaining >= 0;

    return {
      startDate,
      endDate,
      daysUsed: Math.max(0, daysUsed),
      daysRemaining,
      isExpired,
      isActive
    };
  }

  // Get default trial info (fallback)
  private static getDefaultTrialInfo(): TrialInfo {
    return {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + this.TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
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

      // Create secure hash
      const dataString = JSON.stringify(subscriptionData);
      const hash = this.generateHash(dataString);
      
      // Store encrypted data
      const encryptedData = CryptoJS.AES.encrypt(dataString, this.SECRET_KEY).toString();
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SUB_STORAGE_KEY, JSON.stringify({
          data: encryptedData,
          hash
        }));
      }

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

      const stored = localStorage.getItem(this.SUB_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const { data: encryptedData, hash } = JSON.parse(stored);
      
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
    const end = new Date(endDate);
    
    const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    const isExpired = now > end;
    const isActive = !isExpired;

    return {
      isActive,
      plan,
      startDate,
      endDate,
      daysRemaining,
      isExpired
    };
  }

  // Get default subscription info (fallback)
  private static getDefaultSubscriptionInfo(): SubscriptionInfo {
    return {
      isActive: false,
      plan: 'none',
      startDate: '',
      endDate: '',
      daysRemaining: 0,
      isExpired: true
    };
  }

  // Check if user has access to premium features
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
}
