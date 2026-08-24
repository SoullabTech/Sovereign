// Headless harness for JARVIS Desktop's main process.
//
// ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
// B2 (undefined `REPO_ROOT` in the C1 branch) was a one-word defect that made
// EVERY C1 task fail, and it survived because nothing ever executed main.js
// outside a GUI. `node --check` cannot catch it — an undefined identifier is
// valid syntax and only throws when the line runs. Unit tests of the extracted
// pure modules cannot catch it either, because the defect was in the wiring
// BETWEEN them.
//
// So the harness loads the REAL main.js, with Electron replaced by the smallest
// stub that lets it initialise, and invokes the REAL ipc handlers. Any
// unresolved reference on an exercised path now throws here instead of in front
// of the founder.
//
// ── WHAT IT DOES NOT DO ─────────────────────────────────────────────────────
// It stubs Electron and the local worker's HTTP endpoint. It does NOT stub the
// repository, the canonical builder modules, the router, the verifier, or the
// run store — those are the things under test and they run for real, from the
// bound root, exactly as they do in the app.
import path from 'node:path';
import os from 'node:os';
import { mkdtempSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DESKTOP = path.resolve(HERE, '..', '..');
export const REPO = path.resolve(DESKTOP, '..');

/**
 * Install a `require('electron')` stub and load main.js.
 *
 * `isPackaged` is a parameter because it is the single fact that selects
 * between the two repository-resolution ladders, and both need exercising.
 *
 * @param {object}  [opts]
 * @param {boolean} [opts.isPackaged]  which resolution ladder main.js takes
 * @param {string}  [opts.appDataDir]  where persisted config lives (temp by default)
 * @param {string}  [opts.srcDir]      which src/ to load — used ONLY by the
 *   negative control, which loads a deliberately broken copy to prove this
 *   harness would actually catch the B2 defect. A green proof that cannot fail
 *   is not a proof.
 * @returns {{handlers: Map<string, Function>, invoke: Function, electron: object}}
 */
export function loadMainProcess(opts = {}) {
  const require = createRequire(import.meta.url);
  const Module = require('node:module');

  const appData = opts.appDataDir || mkdtempSync(path.join(os.tmpdir(), 'jarvis-harness-appdata-'));
  const handlers = new Map();
  const sent = [];

  const electron = {
    app: {
      isPackaged: opts.isPackaged === true,
      // Every path the app asks for resolves inside the temp sandbox, so a
      // harness run can never read or write the founder's real JARVIS config.
      getPath: (k) => (k === 'home' ? os.homedir() : path.join(appData, k)),
      setPath: () => {},
      // The real app registers work on whenReady(); the harness never resolves
      // it, so no window is created and no menu is built. IPC handlers are
      // registered at module scope, which is what we are here to exercise.
      whenReady: () => new Promise(() => {}),
      on: () => {},
      requestSingleInstanceLock: () => true,
      quit: () => {},
      getName: () => 'JARVIS',
      getVersion: () => '0.0.0-harness',
    },
    BrowserWindow: class {
      static getAllWindows() { return []; }
      constructor() { this.webContents = { send: (...a) => sent.push(a), on: () => {}, setWindowOpenHandler: () => {} }; }
      loadFile() {} on() {} once() {} setTitle() {} show() {} focus() {} isMinimized() { return false; } restore() {}
    },
    ipcMain: {
      handle: (channel, fn) => handlers.set(channel, fn),
      on: () => {},
    },
    dialog: { showOpenDialog: async () => ({ canceled: true, filePaths: [] }), showMessageBox: async () => ({ response: 0 }) },
    Menu: { buildFromTemplate: () => ({}), setApplicationMenu: () => {} },
    shell: { showItemInFolder: () => {}, openPath: async () => '' },
    contextBridge: { exposeInMainWorld: () => {} },
    ipcRenderer: { invoke: async () => {}, on: () => {}, removeListener: () => {} },
  };

  const srcDir = opts.srcDir || path.join(DESKTOP, 'src');

  const realLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === 'electron') return electron;
    return realLoad.apply(this, [request, parent, isMain]);
  };
  try {
    // Fresh module registry per load, so repeated loads in one process cannot
    // observe a previous load's captured state.
    delete require.cache[require.resolve(path.join(srcDir, 'main.js'))];
    require(path.join(srcDir, 'main.js'));
  } finally {
    Module._load = realLoad;
  }

  const invoke = (channel, ...args) => {
    const fn = handlers.get(channel);
    if (!fn) throw new Error(`no ipc handler registered for '${channel}'`);
    return fn({ sender: null }, ...args);
  };

  return { handlers, invoke, electron, appData, sent };
}

/**
 * Stub the local worker endpoint.
 *
 * C1 posts to 127.0.0.1:11434 (Ollama). The harness must NOT depend on a model
 * being installed — this proves the Desktop wiring, not the model. The stub
 * answers with a caller-supplied body so a proof can produce a well-cited
 * answer, an uncited one, or a connection failure on demand.
 *
 * Returns a restore function; the real fetch is always put back.
 */
export function stubLocalWorker(responder) {
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const body = await responder(url, init);
    if (body instanceof Error) throw body;
    return {
      ok: true,
      status: 200,
      json: async () => body,
    };
  };
  return () => { globalThis.fetch = real; };
}
