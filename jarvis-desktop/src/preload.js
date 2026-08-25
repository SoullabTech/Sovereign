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

  getRepoConfig: () => ipcRenderer.invoke('jarvis:repo-config'),
  chooseRepo: () => ipcRenderer.invoke('jarvis:choose-repo'),
  clearRepo: () => ipcRenderer.invoke('jarvis:clear-repo'),

  // Reveal the BOUND workspace in Finder. Takes no argument by design: the path
  // is read from the resolved binding inside main, so this cannot be used to
  // open an arbitrary location the renderer names. It reveals only what JARVIS
  // has already resolved and is already showing on Home.
  //
  // RATIFIED — MAIA-D00A, 2026-08-25. JOP-04 added this channel without
  // re-reviewing the exact-list guard, so the guard went red (nine vs ten) and
  // stayed red for a generation. It was reviewed against the five questions —
  // required, authorized, minimal, main-validated, doctrine-compatible — and
  // admitted. Four properties keep it minimal and are now ASSERTED, not merely
  // asserted-in-prose: no argument crosses here; the handler declares no
  // parameter; an unbound root short-circuits before shell is touched; and main
  // reveals only (showItemInFolder), never openPath/openExternal. The reviewed
  // allow-list for the whole bridge lives in
  // scripts/builder/__tests__/desktop-preload-allowlist.mjs — the one place to
  // come and argue for an eleventh channel.
  revealWorkspace: () => ipcRenderer.invoke('jarvis:reveal-workspace'),
  onRepoChanged: (fn) => {
    if (typeof fn !== 'function') return () => {};
    const handler = (_evt, state) => fn(state);
    ipcRenderer.on('jarvis:repo-changed', handler);
    return () => ipcRenderer.removeListener('jarvis:repo-changed', handler);
  },
});
