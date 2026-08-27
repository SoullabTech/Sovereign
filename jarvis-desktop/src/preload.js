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

  // Governed Builder work-unit mechanism. `runWorkUnit` carries a packet only —
  // the lane is pinned in main to the single authorized read-only lane and is
  // deliberately NOT a renderer-supplied value, so a buggy or compromised
  // renderer cannot name a lane at all. Admission remains the mechanism's.
  getMechanismStatus: () => ipcRenderer.invoke('jarvis:mechanism-status'),
  runWorkUnit: (packet) => ipcRenderer.invoke('jarvis:run-work-unit', { packet }),

  // JARVIS-STAB-01..04 — run custody and the C3 handoff loop.
  //
  // Four narrow verbs, and none of them widens authority: `listRuns` and
  // `handoffPacket` are reads plus a file write, `ingestReceipt` validates
  // evidence that arrived from outside. Nothing here executes, spawns, or
  // authenticates — C3 remains routed-not-executed, decided in main.
  //
  // Deliberately four separate verbs rather than one overloaded channel: the
  // point of this surface is that it can be REVIEWED, and an argument-switched
  // channel hides what it can do behind a payload.
  listRuns: (opts) => ipcRenderer.invoke('jarvis:list-runs', opts || {}),
  handoffPacket: (req) => ipcRenderer.invoke('jarvis:handoff-packet', req || {}),
  ingestReceipt: (req) => ipcRenderer.invoke('jarvis:ingest-receipt', req || {}),

  getRepoConfig: () => ipcRenderer.invoke('jarvis:repo-config'),
  chooseRepo: () => ipcRenderer.invoke('jarvis:choose-repo'),
  clearRepo: () => ipcRenderer.invoke('jarvis:clear-repo'),

  // Reveal the BOUND workspace in Finder. Takes no argument by design: the path
  // is read from the resolved binding inside main, so this cannot be used to
  // open an arbitrary location the renderer names. It reveals only what JARVIS
  // has already resolved and is already showing on Home.
  revealWorkspace: () => ipcRenderer.invoke('jarvis:reveal-workspace'),
  onRepoChanged: (fn) => {
    if (typeof fn !== 'function') return () => {};
    const handler = (_evt, state) => fn(state);
    ipcRenderer.on('jarvis:repo-changed', handler);
    return () => ipcRenderer.removeListener('jarvis:repo-changed', handler);
  },
});
