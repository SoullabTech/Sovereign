'use strict';
/**
 * JARVIS O-1 — Desktop Observer main process.
 *
 * A SEPARATE entry point from jarvis/main.js. That separation is the security
 * boundary, not a stylistic choice: the command surface (main.js) is
 * write-capable, and Observer must not be able to reach it. This process
 * registers exactly one IPC handler — `observer:read` — and there is no verb
 * here that submits, resolves, cancels, or deploys (N9).
 *
 * Trust boundary matches the existing Desktop Alpha: no node integration in the
 * renderer, context isolation on, CSP forbids every external origin, and the
 * renderer cannot open a socket. Everything it knows arrives by IPC.
 *
 *   npm run jarvis:observer
 */

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('node:path');

const { observeAll } = require('./lib/observer/observe');
const { NotificationChannel } = require('./lib/observer/notification');

const REPO_ROOT = path.resolve(__dirname, '../..');
const RENDERER = path.join(__dirname, 'observer-renderer', 'index.html');

// publicGovernanceGate lives in an ESM builder module; load it once, lazily.
// If it cannot be loaded, `redact` stays undefined and the governance adapter
// refuses to render rather than exposing raw gate material (N8b).
let redact;
async function loadRedactor() {
  if (redact !== undefined) return redact;
  try {
    const mod = await import(path.join(REPO_ROOT, 'scripts/builder/jarvis-governance-gate.mjs'));
    redact = typeof mod.publicGovernanceGate === 'function' ? mod.publicGovernanceGate : null;
  } catch {
    redact = null;
  }
  return redact;
}

const channel = new NotificationChannel();
let previous = null;

async function readOnce(opts = {}) {
  const r = await loadRedactor();
  const view = await observeAll({
    repoRoot: REPO_ROOT,
    redact: r || undefined,
    previous,
    production: { enabled: opts.production !== false },
  });
  previous = view;
  for (const fam of channel.pending()) channel.settle(fam);
  return view;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 860,
    title: 'JARVIS — Observer',
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: path.join(__dirname, 'observer-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  // The renderer may not navigate anywhere, and may not spawn windows.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\/github\.com\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e) => e.preventDefault());

  win.loadFile(RENDERER);
  return win;
}

app.whenReady().then(() => {
  // The ONLY channel. Read-only by construction: it takes no mutating argument
  // and returns a composed view.
  ipcMain.handle('observer:read', async (_evt, arg) => {
    try {
      return { ok: true, view: await readOnce({ production: !(arg && arg.skipProduction) }) };
    } catch (e) {
      // Observer failing is itself a reportable condition, not a blank screen.
      return { ok: false, error: String(e && e.message ? e.message : e) };
    }
  });

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
