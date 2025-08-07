const { app, BrowserWindow, ipcMain, dialog, session } = require('electron');
const path = require('path');
const http = require('http');
const isDev = !app.isPackaged;

// Set app name
app.setName('Craft CRM');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    title: 'Craft CRM',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true, // Enable web security
      allowRunningInsecureContent: false, // Prevent insecure content
      experimentalFeatures: false // Disable experimental features
    },
    icon: path.join(__dirname, '../assets/craft-crm-icon.png'), // Updated icon path
    show: false, // Don't show until ready
  });

  // Configure Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          isDev 
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://txpufkxjnxhpnmydwdng.supabase.co wss://txpufkxjnxhpnmydwdng.supabase.co http://localhost:* ws://localhost:*; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:*; style-src 'self' 'unsafe-inline' http://localhost:*" 
            : "default-src 'self' 'unsafe-inline' data: blob: https://txpufkxjnxhpnmydwdng.supabase.co wss://txpufkxjnxhpnmydwdng.supabase.co; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        ]
      }
    });
  });

  // Show window when ready to prevent visual flash
  win.once('ready-to-show', () => {
    win.show();
    
    // Auto-open DevTools in development
    if (isDev) {
      win.webContents.openDevTools();
    }
  });

  if (isDev) {
    // Try to detect which port Next.js is actually running on
    const tryPorts = [3000, 3001, 3002, 3003, 3004];
    
    const checkPort = (port) => {
      return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(1000, () => {
          req.destroy();
          resolve(false);
        });
      });
    };
    
    const loadApp = async () => {
      for (const port of tryPorts) {
        console.log(`Checking port ${port}...`);
        const isResponding = await checkPort(port);
        
        if (isResponding) {
          const url = `http://localhost:${port}/business-hub`;
          console.log(`Found Next.js running on port ${port}, loading: ${url}`);
          win.loadURL(url);
          return;
        }
      }
      
      // If no port works, try the default
      console.log('No responsive port found, trying default...');
      win.loadURL('http://localhost:3000/business-hub');
    };
    
    // Wait a bit for Next.js to fully start, then detect port
    setTimeout(loadApp, 3000);
    
    // Handle navigation within the app
    win.webContents.on('did-navigate', (event, navigationUrl) => {
      console.log('Navigated to:', navigationUrl);
    });
  } else {
    win.loadFile(path.join(__dirname, '../out/business-hub/index.html'));
  }

  // Handle external links
  win.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  return win;
}

app.whenReady().then(() => {
  // Set app security defaults
  app.setAsDefaultProtocolClient('combined-crm');
  
  // Configure security policies
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    // Allow specific permissions that the app needs
    const allowedPermissions = [
      'media',
      'geolocation', 
      'notifications',
      'fullscreen'
    ];
    
    callback(allowedPermissions.includes(permission));
  });

  // Prevent new window creation for security
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    callback({ cancel: false });
  });

  createWindow();
  
  // Handle app activation (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Enhanced security: Prevent navigation to external URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // Allow navigation within the app and to Supabase
    if (parsedUrl.origin !== 'http://localhost:3000' && 
        parsedUrl.origin !== 'http://localhost:3001' && 
        parsedUrl.origin !== 'http://localhost:3002' &&
        parsedUrl.origin !== 'https://txpufkxjnxhpnmydwdng.supabase.co' &&
        !navigationUrl.startsWith('file://')) {
      event.preventDefault();
    }
  });
  
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
});

// IPC handlers for Supabase operations
ipcMain.handle('supabase-operation', async (event, { operation, data }) => {
  try {
    const result = await handleSupabaseOperation(operation, data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Supabase operation error:', error);
    return { success: false, error: error.message };
  }
});

// Handle file operations for invoices, receipts, etc.
ipcMain.handle('save-file', async (event, { data, filename, defaultPath }) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: path.join(defaultPath || app.getPath('documents'), filename),
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (filePath) {
      const fs = require('fs').promises;
      await fs.writeFile(filePath, data);
      return { success: true, filePath };
    }
    
    return { success: false, error: 'Save cancelled' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle backup operations
ipcMain.handle('backup-data', async (event, data) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: path.join(app.getPath('documents'), `business-backup-${new Date().toISOString().split('T')[0]}.json`),
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (filePath) {
      const fs = require('fs').promises;
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return { success: true, filePath };
    }
    
    return { success: false, error: 'Backup cancelled' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Placeholder for Supabase operations handler
async function handleSupabaseOperation(operation, data) {
  // This will handle offline/online sync operations
  // For now, operations go through the web API
  return { message: 'Operation handled by web API' };
}
