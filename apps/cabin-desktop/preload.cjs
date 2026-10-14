const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('cabin', {
  readiness: () => ipcRenderer.invoke('cabin:readiness'),
  open: () => ipcRenderer.invoke('cabin:open'),
});
