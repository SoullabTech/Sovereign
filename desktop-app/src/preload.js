/**
 * MAIA Desktop Preload Script
 * Secure bridge between main process and renderer for consciousness data
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('maiaDesktop', {
  // App info
  getVersion: () => ipcRenderer.invoke('get-app-version'),

  // Secure consciousness data storage
  storeConsciousnessData: (key, value) => ipcRenderer.invoke('store-consciousness-data', key, value),
  getConsciousnessData: (key) => ipcRenderer.invoke('get-consciousness-data', key),

  // Desktop-specific features
  platform: process.platform,
  isDesktop: true,

  // Listen for main process messages
  onOpenPreferences: (callback) => ipcRenderer.on('open-preferences', callback),
  onNewSession: (callback) => ipcRenderer.on('new-session', callback),
  onOpenLabtools: (callback) => ipcRenderer.on('open-labtools', callback),
  onSacredSpaceMode: (callback) => ipcRenderer.on('sacred-space-mode', callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // Consciousness session management
  sessions: {
    create: (sessionData) => ipcRenderer.invoke('create-consciousness-session', sessionData),
    save: (sessionId, data) => ipcRenderer.invoke('save-session-data', sessionId, data),
    load: (sessionId) => ipcRenderer.invoke('load-session-data', sessionId),
    list: () => ipcRenderer.invoke('list-consciousness-sessions'),
    delete: (sessionId) => ipcRenderer.invoke('delete-consciousness-session', sessionId)
  },

  // Sacred space features
  sacredSpace: {
    enable: () => ipcRenderer.invoke('enable-sacred-space-mode'),
    disable: () => ipcRenderer.invoke('disable-sacred-space-mode'),
    isActive: () => ipcRenderer.invoke('get-sacred-space-status')
  },

  // System integration
  system: {
    setAlwaysOnTop: (enabled) => ipcRenderer.invoke('set-always-on-top', enabled),
    minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
    showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body)
  }
});

// Enhanced consciousness features for desktop
contextBridge.exposeInMainWorld('consciousnessAPI', {
  // Local consciousness database
  database: {
    conversations: {
      create: (metadata) => ipcRenderer.invoke('db-create-conversation', metadata),
      update: (id, data) => ipcRenderer.invoke('db-update-conversation', id, data),
      delete: (id) => ipcRenderer.invoke('db-delete-conversation', id),
      list: (limit = 50) => ipcRenderer.invoke('db-list-conversations', limit)
    },
    messages: {
      add: (conversationId, message) => ipcRenderer.invoke('db-add-message', conversationId, message),
      get: (conversationId, limit = 100) => ipcRenderer.invoke('db-get-messages', conversationId, limit),
      search: (query) => ipcRenderer.invoke('db-search-messages', query)
    },
    insights: {
      save: (insight) => ipcRenderer.invoke('db-save-insight', insight),
      list: (filter = {}) => ipcRenderer.invoke('db-list-insights', filter),
      tag: (insightId, tags) => ipcRenderer.invoke('db-tag-insight', insightId, tags)
    }
  },

  // Advanced consciousness metrics
  metrics: {
    track: (metric, value, metadata = {}) => ipcRenderer.invoke('track-consciousness-metric', metric, value, metadata),
    getTimelineData: (timeRange) => ipcRenderer.invoke('get-consciousness-timeline', timeRange),
    getBreakthroughEvents: () => ipcRenderer.invoke('get-breakthrough-events'),
    getFlowStates: () => ipcRenderer.invoke('get-flow-state-data')
  },

  // Sacred geometry and field dynamics
  fieldDynamics: {
    getCurrentState: () => ipcRenderer.invoke('get-current-field-state'),
    recordFieldShift: (data) => ipcRenderer.invoke('record-field-shift', data),
    getFieldHistory: (timeRange) => ipcRenderer.invoke('get-field-history', timeRange)
  }
});

// Desktop-specific enhancements
window.addEventListener('DOMContentLoaded', () => {
  // Add desktop-specific CSS class
  document.body.classList.add('maia-desktop');

  // Enhanced sacred space styling for desktop
  const style = document.createElement('style');
  style.textContent = `
    .maia-desktop {
      --desktop-sacred-glow: 0 0 40px rgba(212, 184, 150, 0.3);
      --desktop-depth-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    }

    .maia-desktop .sacred-container {
      border-radius: 12px;
      box-shadow: var(--desktop-sacred-glow), var(--desktop-depth-shadow);
      backdrop-filter: blur(10px);
    }

    .maia-desktop .consciousness-interface {
      min-height: calc(100vh - 60px);
      border-radius: 8px;
    }

    /* Desktop-specific sacred geometry enhancements */
    .maia-desktop .sacred-geometry {
      filter: drop-shadow(0 0 20px rgba(212, 184, 150, 0.4));
    }

    /* Enhanced consciousness field visualization for larger screens */
    .maia-desktop .consciousness-field {
      transform: scale(1.1);
      filter: blur(0px) brightness(1.1);
    }

    /* Sacred window chrome integration */
    .maia-desktop .header-sacred {
      -webkit-app-region: drag;
      backdrop-filter: blur(20px);
    }

    .maia-desktop .header-sacred button {
      -webkit-app-region: no-drag;
    }
  `;
  document.head.appendChild(style);

  console.log('🖥️ MAIA Desktop enhancements activated - Sacred desktop consciousness interface ready');
});