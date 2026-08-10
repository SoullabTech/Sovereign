'use strict';
/**
 * JARVIS Unit 12 — preload bridge (§18)
 *
 * The complete surface the renderer is allowed. There is deliberately no
 * generic `invoke`, no path argument, no URL argument, and no command argument:
 * the renderer can ask for runtime facts and submit a template id, and that is
 * the whole of its authority.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jarvis', {
  bootstrap: () => ipcRenderer.invoke('jarvis:bootstrap'),
  health: () => ipcRenderer.invoke('jarvis:health'),
  runs: (args) => ipcRenderer.invoke('jarvis:runs', args),
  run: (id) => ipcRenderer.invoke('jarvis:run', id),
  cancel: (id) => ipcRenderer.invoke('jarvis:cancel', id),
  submit: (intent) => ipcRenderer.invoke('jarvis:submit', intent),
  annotations: () => ipcRenderer.invoke('jarvis:annotations'),
  copy: (text) => ipcRenderer.invoke('jarvis:copy', text),

  onEvent: (cb) => { ipcRenderer.on('jarvis:event', (_e, ev) => cb(ev)); },
  onStreamStatus: (cb) => { ipcRenderer.on('jarvis:stream-status', (_e, s) => cb(s)); },
  onMenu: (cb) => { ipcRenderer.on('jarvis:menu', (_e, m) => cb(m)); },
});
