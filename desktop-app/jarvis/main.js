'use strict';
/**
 * JARVIS Unit 12 — Desktop Alpha main process (§2, §14, §18)
 *
 * A native Mac access point for the Unit 11 local runtime. It reuses the
 * Electron shell this repository already carries (desktop-app/) rather than
 * introducing a new desktop framework — same electron + electron-builder
 * toolchain, separate entry point, no MAIA surface (§17).
 *
 * Trust boundary: the renderer has no node integration, no remote module, and
 * no network reach of its own — a CSP forbids every external origin and the
 * renderer cannot open a socket. Everything it learns comes through IPC from
 * this process, which talks to one loopback address and refuses any other (§18).
 */

const { app, BrowserWindow, Menu, ipcMain, clipboard, shell } = require('electron');
const path = require('node:path');

const { createClient, createEventDedupe, resolveEndpoint } = require('./lib/runtime-client');
const presentation = require('./lib/presentation');
const packets = require('./lib/packets');
const { createAnnotations } = require('./lib/annotations');

const RENDERER = path.join(__dirname, 'renderer', 'index.html');

let win = null;
let client = null;
let stream = null;
let annotations = null;
/** Endpoint resolution can fail closed (non-loopback). That is a UI state. */
let endpointError = null;
/**
 * Last known condition of the event stream. Held here because the stream is
 * subscribed before the renderer exists: a status pushed at connect time has no
 * listener yet, so the renderer reads the current value at bootstrap instead of
 * waiting for a transition that already happened.
 */
let streamStatus = { status: 'CONNECTING', detail: null };

function makeClient() {
  try {
    client = createClient();
    endpointError = null;
  } catch (e) {
    client = null;
    endpointError = { code: e.code ?? 'RUNTIME_ENDPOINT_REFUSED', message: e.message };
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    title: 'JARVIS',
    backgroundColor: '#0b0e11',
    titleBarStyle: 'hiddenInset',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: false,
    },
  });

  win.loadFile(RENDERER);
  win.once('ready-to-show', () => win.show());
  win.on('closed', () => { win = null; });

  // The Desktop is a runtime client, not a browser. Nothing navigates, nothing
  // opens a second window, and a link goes to the OS rather than in-app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e) => e.preventDefault());
}

function attachStream() {
  if (!client) return;
  const accept = createEventDedupe();
  stream = client.subscribe({
    onEvent: (ev) => {
      if (!accept(ev)) return;                       // duplicate suppression (§14)
      win?.webContents.send('jarvis:event', ev);
    },
    onStatus: (status, detail) => {
      // SSE is notification, not truth (§14). The renderer answers a reconnect
      // by re-fetching REST state; this only tells it the stream's condition.
      streamStatus = { status, detail: detail ?? null };
      win?.webContents.send('jarvis:stream-status', streamStatus);
    },
  });
}

/** Wrap a runtime call so transport failure is a typed answer, not a crash. */
async function call(fn) {
  if (!client) return { ok: false, error: endpointError ?? { code: 'RUNTIME_ENDPOINT_REFUSED', message: 'no client' } };
  try {
    const res = await fn(client);
    return { ok: true, status: res.status, body: res.body };
  } catch (e) {
    return { ok: false, error: { code: e.code ?? 'RUNTIME_OFFLINE', message: presentation.redact(e.message) } };
  }
}

function registerIpc() {
  ipcMain.handle('jarvis:bootstrap', () => ({
    address: client?.endpoint.address ?? null,
    endpointError,
    templates: packets.TEMPLATES.map((t) => ({ id: t.id, label: t.label, summary: t.summary, objective: t.objective })),
    offline: presentation.offlineView(client?.endpoint.address ?? null),
    disclosure: presentation.SEMANTIC_VERIFICATION_DISCLOSURE,
    authority: packets.DEFAULT_AUTHORITY,
    lane: packets.READ_ONLY_LANE,
    // Objective labels for Desktop-submitted runs. Never a source of run state.
    annotations: annotations?.all() ?? {},
    streamStatus,
  }));

  ipcMain.handle('jarvis:health', () => call((c) => c.health()));
  ipcMain.handle('jarvis:runs', (_e, args) => call((c) => c.listRuns(args ?? {})));
  ipcMain.handle('jarvis:run', (_e, id) => call((c) => c.getRun(String(id))));
  ipcMain.handle('jarvis:cancel', (_e, id) => call((c) => c.cancelRun(String(id))));

  /**
   * Submit. The packet is built here — the renderer sends intent (template id +
   * objective), never a packet — so a compromised renderer cannot widen
   * authority or aim the run at arbitrary files (§4, §18).
   */
  ipcMain.handle('jarvis:submit', async (_e, intent) => {
    let packet;
    try {
      packet = packets.buildPacket({
        templateId: intent?.templateId,
        objective: intent?.objective,
        canonicalSha: intent?.canonicalSha,
        nonce: String(Date.now()),
      });
    } catch (e) {
      return { ok: false, error: { code: e.code ?? 'PACKET_BUILD_FAILED', message: e.message } };
    }
    const res = await call((c) => c.createRun(packet));
    if (res.ok && res.status === 202 && res.body?.run_id) {
      annotations?.record(res.body.run_id, packet.objective);
    }
    return res.ok ? { ...res, packet: { work_unit_id: packet.work_unit_id, objective: packet.objective } } : res;
  });

  ipcMain.handle('jarvis:annotations', () => annotations?.all() ?? {});

  ipcMain.handle('jarvis:copy', (_e, text) => { clipboard.writeText(String(text ?? '')); return true; });
}

function buildMenu() {
  // No shell, no exec, no filesystem action anywhere in this menu (§24).
  const template = [
    { role: 'appMenu' },
    {
      label: 'Run',
      submenu: [
        { label: 'Refresh', accelerator: 'CmdOrCtrl+R', click: () => win?.webContents.send('jarvis:menu', 'refresh') },
        { label: 'New Command', accelerator: 'CmdOrCtrl+N', click: () => win?.webContents.send('jarvis:menu', 'command') },
      ],
    },
    { role: 'editMenu' },
    { role: 'windowMenu' },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  makeClient();
  annotations = createAnnotations(app.getPath('userData'));
  registerIpc();
  buildMenu();
  createWindow();
  attachStream();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// The runtime is a separate, persistent process (Unit 11). Closing the Desktop
// closes a window onto it and nothing else — run history stays in the runtime
// store, which is what makes §15 restart continuity true rather than simulated.
app.on('window-all-closed', () => {
  try { stream?.close(); } catch { /* already closed */ }
  if (process.platform !== 'darwin') app.quit();
});

module.exports = { resolveEndpoint };
