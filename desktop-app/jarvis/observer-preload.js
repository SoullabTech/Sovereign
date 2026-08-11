'use strict';
/**
 * JARVIS O-1 — Observer preload.
 *
 * The entire surface the renderer is given. One verb, and it is a read.
 * There is deliberately no way from here to submit, approve, resolve, cancel,
 * deploy, or write — N9 is enforced by what this file does not contain.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('observer', {
  read: (opts) => ipcRenderer.invoke('observer:read', opts || {}),
});
