// Electron integration wrapper for business operations
declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      platform: string;
      supabaseOperation: (operation: string, data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
      saveFile: (data: Buffer | string, filename: string, defaultPath?: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      backupData: (data: any) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      print: () => void;
      openExternal: (url: string) => Promise<void>;
      onOffline: (callback: () => void) => void;
      onOnline: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

export class ElectronIntegration {
  static isElectron(): boolean {
    return typeof window !== 'undefined' && window.electronAPI?.isElectron === true;
  }

  static async saveInvoicePDF(pdfData: Buffer, invoiceNumber: string): Promise<string | null> {
    if (!this.isElectron() || !window.electronAPI) {
      // Fallback for web: trigger download
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      return null;
    }

    try {
      const result = await window.electronAPI.saveFile(
        pdfData,
        `invoice-${invoiceNumber}.pdf`,
        'Documents'
      );
      
      if (result.success && result.filePath) {
        return result.filePath;
      } else {
        throw new Error(result.error || 'Failed to save file');
      }
    } catch (error) {
      console.error('Failed to save invoice PDF:', error);
      throw error;
    }
  }

  static async backupBusinessData(data: any): Promise<string | null> {
    if (!this.isElectron() || !window.electronAPI) {
      // Fallback for web: trigger download
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return null;
    }

    try {
      const result = await window.electronAPI.backupData(data);
      
      if (result.success && result.filePath) {
        return result.filePath;
      } else {
        throw new Error(result.error || 'Failed to backup data');
      }
    } catch (error) {
      console.error('Failed to backup business data:', error);
      throw error;
    }
  }

  static printInvoice(): void {
    if (this.isElectron() && window.electronAPI) {
      window.electronAPI.print();
    } else {
      window.print();
    }
  }

  static async openExternal(url: string): Promise<void> {
    if (this.isElectron() && window.electronAPI) {
      await window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  }

  static setupOfflineDetection(
    onOffline: () => void,
    onOnline: () => void
  ): () => void {
    if (this.isElectron() && window.electronAPI) {
      window.electronAPI.onOffline(onOffline);
      window.electronAPI.onOnline(onOnline);
      
      return () => {
        window.electronAPI?.removeAllListeners('offline');
        window.electronAPI?.removeAllListeners('online');
      };
    } else {
      // Web fallback
      window.addEventListener('offline', onOffline);
      window.addEventListener('online', onOnline);
      
      return () => {
        window.removeEventListener('offline', onOffline);
        window.removeEventListener('online', onOnline);
      };
    }
  }

  static getPlatformInfo(): { isElectron: boolean; platform: string } {
    return {
      isElectron: this.isElectron(),
      platform: this.isElectron() && window.electronAPI ? window.electronAPI.platform : 'web'
    };
  }
}

// Business-specific Electron integrations
export class BusinessElectronAPI {
  
  static async syncOfflineData(): Promise<void> {
    if (!ElectronIntegration.isElectron()) return;
    
    try {
      // Implement offline data synchronization logic
      console.log('Syncing offline data with Supabase...');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  static async exportBusinessReport(type: 'sales' | 'purchases' | 'inventory' | 'parties', data: any): Promise<string | null> {
    const filename = `${type}-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    if (!ElectronIntegration.isElectron()) {
      // Web fallback - implement XLSX export here
      console.log(`Exporting ${type} report...`);
      return null;
    }

    try {
      // Convert data to Excel format (implement with a library like xlsx)
      const excelBuffer = this.generateExcelReport(type, data);
      
      const result = await window.electronAPI!.saveFile(
        excelBuffer,
        filename,
        'Documents'
      );
      
      return result.success ? result.filePath || null : null;
    } catch (error) {
      console.error(`Failed to export ${type} report:`, error);
      throw error;
    }
  }

  private static generateExcelReport(type: string, data: any): Buffer {
    // Placeholder - implement with xlsx library
    const jsonString = JSON.stringify(data, null, 2);
    return Buffer.from(jsonString);
  }

  static async importBusinessData(type: 'items' | 'parties'): Promise<any[] | null> {
    if (!ElectronIntegration.isElectron()) {
      console.log('Data import not available in web version');
      return null;
    }

    try {
      // Implement file dialog and CSV/Excel import logic
      console.log(`Importing ${type} data...`);
      return [];
    } catch (error) {
      console.error(`Failed to import ${type} data:`, error);
      throw error;
    }
  }

  static async scheduleBackup(frequency: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    if (!ElectronIntegration.isElectron()) return;
    
    try {
      // Implement automatic backup scheduling
      console.log(`Scheduling ${frequency} backups...`);
    } catch (error) {
      console.error('Failed to schedule backup:', error);
    }
  }
}

export default ElectronIntegration;
