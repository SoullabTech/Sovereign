const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('cabinWriting', {
 saveCopy: id => ipcRenderer.invoke('cabin:save-copy', id),
});
