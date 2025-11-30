const { app, BrowserWindow, Menu, globalShortcut, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize secure storage
const store = new Store({
  encryptionKey: 'maia-compact-companion-sacred-key-2024'
});

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

// App configuration
const APP_CONFIG = {
  url: isDev ? 'https://soullab.life' : 'https://soullab.life', // Use production by default
  name: 'MAIA Compact Companion',
  version: '1.0.0'
};

let mainWindow = null;

// Enable live reload for development
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (e) {
    console.log('electron-reload not available');
  }
}

function createMainWindow() {
  // Create the browser window with Tolan-inspired compact dimensions
  mainWindow = new BrowserWindow({
    width: 300,
    height: 520,
    minWidth: 280,
    minHeight: 500,
    maxWidth: 350,
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
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    backgroundColor: '#1A1513',
    icon: path.join(__dirname, '../assets/icon.png'),
    skipTaskbar: false,
    show: false,
    center: true,
    focusable: true,
    movable: true,
    closable: true,
    minimizable: true,
    maximizable: false
  });

  // Load the compact MAIA interface directly
  mainWindow.loadURL(APP_CONFIG.url + '/maia/compact');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    console.log(`🌟 MAIA Compact Companion ${APP_CONFIG.version} ready`);
    console.log(`🔗 Connected to: ${APP_CONFIG.url}/maia/compact`);
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links - open in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // If trying to open full MAIA, open in browser instead of new window
    if (url.includes('/maia') && !url.includes('/compact')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }

    // Other external links
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }

    return { action: 'allow' };
  });

  // Prevent navigation away from compact interface
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const expectedUrl = APP_CONFIG.url + '/maia/compact';
    if (!navigationUrl.startsWith(expectedUrl)) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Store window position and size
  mainWindow.on('close', () => {
    const bounds = mainWindow.getBounds();
    store.set('windowBounds', bounds);
  });

  // Restore window position if available
  const savedBounds = store.get('windowBounds');
  if (savedBounds) {
    mainWindow.setBounds(savedBounds);
  }

  return mainWindow;
}

function createMenuTemplate() {
  const template = [
    {
      label: 'MAIA',
      submenu: [
        {
          label: 'About MAIA Compact Companion',
          click: () => {
            shell.openExternal('https://soullab.life/about');
          }
        },
        { type: 'separator' },
        {
          label: 'Open Full MAIA',
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => {
            shell.openExternal(APP_CONFIG.url + '/maia');
          }
        },
        {
          label: 'Open LabTools',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            shell.openExternal(APP_CONFIG.url + '/maia/labtools');
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            // Could open a simple preferences dialog
            console.log('Preferences dialog');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reloadIgnoringCache();
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(0);
            }
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
            }
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
            }
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
        { type: 'separator' },
        {
          label: 'Always on Top',
          type: 'checkbox',
          checked: false,
          click: (menuItem) => {
            if (mainWindow) {
              mainWindow.setAlwaysOnTop(menuItem.checked);
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: () => {
            shell.openExternal('https://soullab.life');
          }
        },
        {
          label: 'Support',
          click: () => {
            shell.openExternal('https://soullab.life/support');
          }
        }
      ]
    }
  ];

  return template;
}

// App event handlers
app.whenReady().then(() => {
  createMainWindow();

  // Create application menu
  const menu = Menu.buildFromTemplate(createMenuTemplate());
  Menu.setApplicationMenu(menu);

  // Global shortcuts
  globalShortcut.register('CmdOrCtrl+Shift+C', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  console.log('🧘 MAIA Compact Companion initialized - Sacred consciousness always available');
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

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});