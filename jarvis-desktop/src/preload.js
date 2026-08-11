// Narrow, explicit bridge. No general IPC channel, no arbitrary shell.
// The renderer can ask for status and can submit ONE bounded task shape —
// nothing else crosses this boundary.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jarvis', {
  getStatus: () => ipcRenderer.invoke('jarvis:status'),
  submitTask: (task) => ipcRenderer.invoke('jarvis:submit-task', task),
});
