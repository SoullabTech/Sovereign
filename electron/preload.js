const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  getAppName: () => ipcRenderer.invoke('app-name'),

  // Menu event listeners
  onMenuEvent: (callback) => {
    ipcRenderer.on('menu-new-assessment', callback);
    ipcRenderer.on('menu-export-data', callback);
    ipcRenderer.on('menu-switch-view', callback);
  },

  // File operations
  exportSessionData: (data) => ipcRenderer.invoke('export-session-data', data),

  // Session management
  onNewAssessment: (callback) => ipcRenderer.on('menu-new-assessment', callback),
  onExportData: (callback) => ipcRenderer.on('menu-export-data', callback),
  onSwitchView: (callback) => ipcRenderer.on('menu-switch-view', callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Expose a limited set of Node.js APIs
contextBridge.exposeInMainWorld('nodeAPI', {
  platform: process.platform,
  versions: process.versions
});