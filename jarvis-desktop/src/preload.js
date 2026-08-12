// Narrow, explicit bridge. No general IPC channel, no arbitrary shell.
// The renderer can ask for status, ask which deterministic capabilities are
// registered (read-only, no execution), and submit ONE bounded task shape —
// nothing else crosses this boundary.
const { contextBridge, ipcRenderer } = require('electron');

// Repo binding is exposed as three narrow verbs plus a change subscription.
// The renderer can ask what the binding IS, and can ask main to run the NATIVE
// chooser — it can never set a path directly. So a buggy or compromised
// renderer cannot silently rebind the console's execution substrate to an
// arbitrary directory; validation and persistence stay in main, and the only
// way a new root enters the system is through a founder's own file dialog.
contextBridge.exposeInMainWorld('jarvis', {
  getStatus: () => ipcRenderer.invoke('jarvis:status'),
  getCapabilities: () => ipcRenderer.invoke('jarvis:capabilities'),
  submitTask: (task) => ipcRenderer.invoke('jarvis:submit-task', task),
  governanceAction: (req) => ipcRenderer.invoke('jarvis:governance-action', req),

  getRepoConfig: () => ipcRenderer.invoke('jarvis:repo-config'),
  chooseRepo: () => ipcRenderer.invoke('jarvis:choose-repo'),
  clearRepo: () => ipcRenderer.invoke('jarvis:clear-repo'),
  onRepoChanged: (fn) => {
    if (typeof fn !== 'function') return () => {};
    const handler = (_evt, state) => fn(state);
    ipcRenderer.on('jarvis:repo-changed', handler);
    return () => ipcRenderer.removeListener('jarvis:repo-changed', handler);
  },
});
