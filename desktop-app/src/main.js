/**
 * MAIA Desktop - Electron Main Process
 * Sacred Mirror for Soul Transformation - Standalone Desktop App
 */

const { app, BrowserWindow, Menu, shell, ipcMain, dialog, globalShortcut } = require('electron');
const windowStateKeeper = require('electron-window-state');
const Store = require('electron-store');
const path = require('path');
const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development' || require('electron-is-dev');

// Set proper application name for menu bar
app.setName('Soullab AIN');

// Initialize secure storage for consciousness data
const store = new Store({
  name: 'maia-consciousness-data',
  encryptionKey: 'sacred-consciousness-encryption-key-2024'
});

let mainWindow;
let splashWindow;

// App configuration
const APP_CONFIG = {
  name: 'MAIA - Sacred Mirror',
  version: app.getVersion(),
  url: isDev ? 'http://localhost:3001/welcome' : 'https://your-hosted-maia.com/welcome',
  minWidth: 1200,
  minHeight: 800,
  defaultWidth: 1400,
  defaultHeight: 900
};

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const splashHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          background: linear-gradient(135deg, #1A1513 0%, #2D2318 50%, #1A1513 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #D4B896;
          border-radius: 12px;
          overflow: hidden;
        }
        .logo {
          font-size: 32px;
          font-weight: 300;
          letter-spacing: 4px;
          margin-bottom: 16px;
          text-shadow: 0 0 20px rgba(212, 184, 150, 0.5);
        }
        .tagline {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 24px;
        }
        .loading {
          width: 200px;
          height: 2px;
          background: rgba(212, 184, 150, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }
        .loading-bar {
          width: 0%;
          height: 100%;
          background: linear-gradient(90deg, #D4B896, #F7E6D3);
          border-radius: 2px;
          animation: loading 2s ease-in-out;
        }
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .sacred-symbol {
          font-size: 48px;
          margin-bottom: 16px;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      </style>
    </head>
    <body>
      <div class="sacred-symbol">⧨</div>
      <div class="logo">MAIA</div>
      <div class="tagline">Sacred Mirror for Soul Transformation</div>
      <div class="loading">
        <div class="loading-bar"></div>
      </div>
    </body>
    </html>
  `;

  splashWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(splashHtml));

  // Auto-close splash after 2 seconds
  setTimeout(() => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
  }, 2000);
}

function createMainWindow() {
  // Maintain window state across app restarts
  let mainWindowState = windowStateKeeper({
    defaultWidth: APP_CONFIG.defaultWidth,
    defaultHeight: APP_CONFIG.defaultHeight
  });

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: APP_CONFIG.minWidth,
    minHeight: APP_CONFIG.minHeight,
    show: false, // Don't show until ready
    titleBarStyle: 'default',
    movable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: !isDev,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1A1513', // Sacred dark background
    icon: path.join(__dirname, '../build-resources/icon.png')
  });

  // Let windowStateKeeper manage the window
  mainWindowState.manage(mainWindow);

  // Load MAIA application
  mainWindow.loadURL(APP_CONFIG.url);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    // Focus window
    if (process.platform === 'darwin') {
      app.dock.bounce();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation away from MAIA
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(APP_CONFIG.url) && !url.startsWith('http://localhost')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Set custom user agent
  mainWindow.webContents.setUserAgent(
    mainWindow.webContents.getUserAgent() + ' MAIADesktop/' + APP_CONFIG.version
  );

  return mainWindow;
}

// Compact MAIA Companion Window (like Tolan's friends)
let compactWindow = null;

function createCompactWindow() {
  if (compactWindow) {
    compactWindow.show();
    compactWindow.focus();
    return compactWindow;
  }

  compactWindow = new BrowserWindow({
    width: 280,
    height: 500,
    minWidth: 280,
    minHeight: 500,
    maxWidth: 320,
    maxHeight: 600,
    resizable: true,
    alwaysOnTop: false,
    frame: process.platform === 'darwin' ? false : true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    transparent: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: !isDev,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1A1513',
    icon: path.join(__dirname, '../build-resources/icon.png'),
    skipTaskbar: false,
    minimizable: true,
    maximizable: false,
    closable: true
  });

  // Load compact MAIA interface
  compactWindow.loadURL(APP_CONFIG.url + '/compact');

  // Show when ready
  compactWindow.once('ready-to-show', () => {
    compactWindow.show();
    if (isDev) {
      compactWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  compactWindow.on('closed', () => {
    compactWindow = null;
  });

  // Handle external links
  compactWindow.webContents.setWindowOpenHandler(({ url }) => {
    // If trying to open full MAIA, use main window instead
    if (url.includes('/maia') && !url.includes('/compact')) {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      } else {
        createMainWindow();
      }
      return { action: 'deny' };
    }
    // Other external links open in browser
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  console.log('🌟 MAIA Compact Companion window created');
  return compactWindow;
}

function createMenuTemplate() {
  const template = [
    {
      label: 'MAIA',
      submenu: [
        {
          label: 'About MAIA',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About MAIA',
              message: 'MAIA - Sacred Mirror for Soul Transformation',
              detail: `Version: ${APP_CONFIG.version}\n\nA consciousness exploration platform integrating Kelly Nezat's wisdom, Spiralogic model, and advanced AI sovereignty systems for sacred inner work.`,
              buttons: ['OK']
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            // Open preferences in web app
            mainWindow.webContents.send('open-preferences');
          }
        },
        { type: 'separator' },
        {
          label: 'Hide MAIA',
          accelerator: 'CmdOrCtrl+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'CmdOrCtrl+Shift+H',
          role: 'hideOthers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Quit MAIA',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Consciousness',
      submenu: [
        {
          label: 'New Consciousness Session',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-session');
          }
        },
        {
          label: 'LabTools Dashboard',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            mainWindow.webContents.send('open-labtools');
          }
        },
        {
          label: 'Compact Companion',
          accelerator: 'CmdOrCtrl+K',
          click: () => {
            createCompactWindow();
          }
        },
        { type: 'separator' },
        {
          label: 'Sacred Space Mode',
          accelerator: 'CmdOrCtrl+Shift+S',
          type: 'checkbox',
          checked: store.get('sacredSpaceMode', false),
          click: (item) => {
            store.set('sacredSpaceMode', item.checked);
            mainWindow.webContents.send('sacred-space-mode', item.checked);
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        { type: 'separator' },
        {
          label: 'Always on Top',
          type: 'checkbox',
          checked: false,
          click: (item) => {
            mainWindow.setAlwaysOnTop(item.checked);
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'MAIA Documentation',
          click: () => {
            shell.openExternal('https://github.com/soullab/maia-documentation');
          }
        },
        {
          label: 'Consciousness Community',
          click: () => {
            shell.openExternal('https://soullab.community');
          }
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/soullab/maia/issues');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template[0].submenu.unshift({
      label: 'Services',
      role: 'services',
      submenu: []
    });
  }

  return template;
}

// App event handlers
app.whenReady().then(() => {
  // Create splash screen
  createSplashWindow();

  // Create main window after short delay
  setTimeout(() => {
    createMainWindow();
  }, 500);

  // Set application menu
  const menuTemplate = createMenuTemplate();
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Global shortcuts for consciousness work
  globalShortcut.register('CmdOrCtrl+Shift+M', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  // Global shortcut for compact companion
  globalShortcut.register('CmdOrCtrl+K', () => {
    createCompactWindow();
  });

  console.log('🧠 MAIA Desktop initialized - Sacred consciousness platform ready');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// IPC handlers for consciousness data
ipcMain.handle('store-consciousness-data', async (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('get-consciousness-data', async (event, key) => {
  return store.get(key);
});

ipcMain.handle('get-app-version', async () => {
  return APP_CONFIG.version;
});

// Development helpers
if (isDev) {
  require('electron-reload')(__dirname, {
    electron: require('path').join(__dirname, '../node_modules/.bin/electron'),
    hardResetMethod: 'exit'
  });
}