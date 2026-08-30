// MAIA Desktop — the Sovereign Portability Invariant, asserted structurally.
//
// Doctrine: docs/architecture/SOVEREIGN_PORTABILITY_INVARIANT_2026-08-29.md
//
//   Electron is a host adapter, not a domain boundary.
//
// This proof exists for the same reason the preload allow-list does: a boundary
// that is only written down decays on the second regression, not the first. The
// declaration lives in ONE place and a new source file has to come and argue for
// which side of the boundary it is on.
//
// ⛔ Adding a file to HOST_ADAPTERS is an authority decision. It says: this
// capability is intrinsically Electron-specific and could not be answered by
// injection. Convenience is not an answer.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

// The ONLY files permitted to name Electron. Each carries why.
const HOST_ADAPTERS = [
  { file: 'main.js',
    why: 'Host wiring: BrowserWindow, app lifecycle, ipcMain transport, webContents broadcast. The native supervisor replaces THIS file.' },
  { file: 'preload.js',
    why: 'The bridge itself: contextBridge + ipcRenderer. Electron-specific by definition; ten ratified channels reviewed in test/d01-preload-allowlist.mjs.' },
];

// Modules that must survive replacing BrowserWindow + IPC with a native host
// without changing their semantics. Each is currently free of Electron.
const PORTABLE_DOMAIN = [
  'conversation.js', 'thread-watch.js', 'capture-liveness.js', 'capture-worklet.js',
  'continuity.js', // DESKTOP SOVEREIGN CORE 01 — extracted from main.js
  'turn.js',       // DESKTOP SOVEREIGN CORE 02 — extracted from main.js
  'capture-watch.js', // DESKTOP SOVEREIGN CORE 03 — extracted from main.js
  'voice-lifecycle.js', // DESKTOP SOVEREIGN CORE 04 — extracted from main.js
  'session.js', // adapter-shaped: createSession({ app, safeStorage, fetchImpl })
  'voice/epoch.js', 'voice/vad.js', 'voice/utterance.js',
  'voice/wav.js', 'voice/transcription.js', 'voice/diagnostics.js',
  'voice/member-draft.js', // DSC-FINAL — salvage authorship left the composition root
  'shell-policy.js', 'shell.js', // HOUSE-RECONCILE-01 — carried; both Electron-free
];

// The presentation edge. Speaks an abstract capability surface, never Electron.
const PRESENTATION = ['renderer.js'];

// Constructs that can only come from Electron itself — no injected parameter
// legitimately carries these names. (`app` and `safeStorage` are deliberately
// absent: session.js receives them as arguments, which is the shape we want.)
// ⛔ Electron surfaces that arrive as INJECTED PARAMETERS rather than imports.
// This is the shape the invariant asks for — session.js has always taken `app`
// and `safeStorage` this way — but two of these names are otherwise unforgeable,
// so a file that receives them has to say so here. Adding an entry is an
// authority decision, exactly like HOST_ADAPTERS.
const INJECTED_ELECTRON = {
  'shell.js': {
    names: ['BrowserView', 'webContents'],
    why: 'Every Electron surface arrives as a constructor parameter — BrowserView, sessionApi, shellApi, window. `webContents` is only ever read off the injected view, never imported. ds01 drives the real logic with fakes precisely because none of it is bound to Electron.',
  },
};

const ELECTRON_CONSTRUCTS = ['ipcMain', 'ipcRenderer', 'BrowserWindow', 'contextBridge', 'webContents'];

const read = (rel) => readFileSync(path.join(SRC, rel), 'utf8');

// Strip comments, so doctrine ABOUT the boundary is never mistaken for a crossing.
function code(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function listSources(dir = SRC, prefix = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? listSources(path.join(dir, e.name), `${prefix}${e.name}/`)
      : e.name.endsWith('.js') ? [`${prefix}${e.name}`] : []
  );
}

test('every source file has declared which side of the host boundary it is on', () => {
  const declared = new Set([
    ...HOST_ADAPTERS.map((a) => a.file), ...PORTABLE_DOMAIN, ...PRESENTATION,
  ]);
  const undeclared = listSources().filter((f) => !declared.has(f));
  assert.deepEqual(undeclared, [],
    'A new Desktop source file appeared without declaring its side of the Sovereign Portability ' +
    'Invariant. Answer question 1 — is this logic intrinsically Electron-specific? — then add it ' +
    'to PORTABLE_DOMAIN, PRESENTATION, or (as an authority decision) HOST_ADAPTERS.');

  // And nothing declared may have quietly vanished.
  const present = new Set(listSources());
  for (const f of declared) {
    assert.ok(present.has(f), `Declared source ${f} is gone; update the declaration.`);
  }
});

test('domain logic never imports Electron', () => {
  for (const file of [...PORTABLE_DOMAIN, ...PRESENTATION]) {
    const body = code(read(file));
    assert.ok(!/require\(\s*['"]electron['"]\s*\)/.test(body),
      `${file} requires electron. Domain logic must reach host capability by injection ` +
      `(see session.js), so a native supervisor can supply it instead.`);
    assert.ok(!/from\s+['"]electron['"]/.test(body), `${file} imports from electron.`);
  }
});

test('domain logic never names an Electron construct', () => {
  for (const file of [...PORTABLE_DOMAIN, ...PRESENTATION]) {
    const body = code(read(file));
    const injected = (INJECTED_ELECTRON[file] || { names: [] }).names;
    for (const construct of ELECTRON_CONSTRUCTS.filter((c) => !injected.includes(c))) {
      assert.ok(!new RegExp(`\\b${construct}\\b`).test(body),
        `${file} names ${construct}. Question 5: this could not survive replacing ` +
        `BrowserWindow + IPC with a native host without changing its semantics.`);
    }
  }
});

test('the renderer depends on an abstract Desktop capability, not on Electron machinery', () => {
  for (const file of PRESENTATION) {
    const body = code(read(file));
    assert.ok(!/\brequire\s*\(/.test(body), `${file} uses require(); the renderer gets named verbs only.`);
    assert.ok(/window\.maia\./.test(body), `${file} no longer speaks the capability surface.`);
  }
});

test('every declared Electron injection carries why it is injected, not imported', () => {
  for (const [file, d] of Object.entries(INJECTED_ELECTRON)) {
    assert.ok(d.why && d.why.length > 60, `INJECTED_ELECTRON entry ${file} must argue for itself`);
    // The exemption covers naming only. Importing Electron is still forbidden,
    // and the import proof above already covers every portable file.
    const body = code(read(file));
    assert.ok(!/require\(\s*['"]electron['"]\s*\)/.test(body), `${file} imports electron`);
  }
});

test('exactly two files are host adapters, and they are the ones declared', () => {
  const naming = listSources().filter((f) =>
    /require\(\s*['"]electron['"]\s*\)|from\s+['"]electron['"]/.test(code(read(f))));
  assert.deepEqual(naming.sort(), HOST_ADAPTERS.map((a) => a.file).sort(),
    'The set of files importing Electron changed. Electron is a host adapter, not a domain ' +
    'boundary — a third adapter has to argue for itself.');
  for (const a of HOST_ADAPTERS) {
    assert.ok(a.why && a.why.length > 40, `HOST_ADAPTERS entry ${a.file} must carry why it is Electron-specific.`);
  }
});
