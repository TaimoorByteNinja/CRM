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
  
  // Print operations for invoices
  print: () => window.print(),
  
  // Open external links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Offline detection
  onOffline: (callback) => ipcRenderer.on('offline', callback),
  onOnline: (callback) => ipcRenderer.on('online', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
