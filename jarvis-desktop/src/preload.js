// Narrow, explicit bridge. No general IPC channel, no arbitrary shell.
// The renderer can ask for status, ask which deterministic capabilities are
// registered (read-only, no execution), and submit ONE bounded task shape —
// nothing else crosses this boundary.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jarvis', {
  getStatus: () => ipcRenderer.invoke('jarvis:status'),
  getCapabilities: () => ipcRenderer.invoke('jarvis:capabilities'),
  submitTask: (task) => ipcRenderer.invoke('jarvis:submit-task', task),
  governanceAction: (req) => ipcRenderer.invoke('jarvis:governance-action', req),
});
