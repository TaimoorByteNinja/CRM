const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Supabase operations
  supabaseOperation: (operation, data) => ipcRenderer.invoke('supabase-operation', { operation, data }),
  
  // File operations
  saveFile: (data, filename, defaultPath) => ipcRenderer.invoke('save-file', { data, filename, defaultPath }),
  
  // Backup operations
  backupData: (data) => ipcRenderer.invoke('backup-data', data),
  
  // App info
  isElectron: true,
  platform: process.platform,
  
  // Environment variables for Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://txpufkxjnxhpnmydwdng.supabase.co',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4cHVma3hqbnhocG5teWR3ZG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTI0MzksImV4cCI6MjA2ODA2ODQzOX0.kgf6HZRrKMR',
  
  // Print operations for invoices
  print: () => window.print(),
  
  // Open external links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Offline detection
  onOffline: (callback) => ipcRenderer.on('offline', callback),
  onOnline: (callback) => ipcRenderer.on('online', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
