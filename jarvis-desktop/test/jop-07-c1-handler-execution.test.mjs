#!/usr/bin/env node
// JOP-07 — the ACTUAL jarvis:submit-task handler executes its C1 path.
//
// JOP-06 proves the record shape and the store round-trip. It does NOT prove the
// handler in main.js runs — and a grep cannot, because an undeclared identifier
// is a runtime fault in JavaScript, not a syntax error. That is precisely how
// `REPO_ROOT` sat in the C1 path unnoticed: the file parsed, the tests passed,
// and the lane died only when a founder submitted a task.
//
// So this loads the real main.js with Electron stubbed, captures the real
// registered handler, and invokes it.

import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtempSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const REPO_ROOT = path.resolve(DESKTOP, '..');
const require = createRequire(import.meta.url);

process.env.AIN_DELEGATION_HOME = mkdtempSync(path.join(os.tmpdir(), 'jop07-'));
process.env.JARVIS_REPO_ROOT = REPO_ROOT;

// ── Electron stub ────────────────────────────────────────────────────────────
const handlers = new Map();
const noop = () => {};
const electronStub = {
  app: {
    isPackaged: false,
    getPath: () => mkdtempSync(path.join(os.tmpdir(), 'jop07-appdata-')),
    getVersion: () => '0.0.0-test',
    setPath: noop, setAppUserModelId: noop, getName: () => 'JARVIS',
    whenReady: () => new Promise(() => {}),   // never resolves: no window, no menu
    on: noop, quit: noop, requestSingleInstanceLock: () => true, setName: noop,
  },
  BrowserWindow: Object.assign(function () {}, { getAllWindows: () => [], fromWebContents: () => null }),
  ipcMain: { handle: (ch, fn) => handlers.set(ch, fn), on: noop },
  dialog: { showOpenDialog: async () => ({ canceled: true }), showMessageBox: async () => ({ response: 0 }) },
  Menu: { buildFromTemplate: () => ({}), setApplicationMenu: noop },
  shell: { openPath: noop, showItemInFolder: noop },
};
const Module = require('node:module');
const realLoad = Module._load;
Module._load = function (req, parent, isMain) {
  if (req === 'electron') return electronStub;
  return realLoad.apply(this, [req, parent, isMain]);
};

require(path.join(DESKTOP, 'src', 'main.js'));

let pass = 0, fail = 0;
const t = async (name, fn) => {
  try { await fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}\n      ${e.message}`); fail++; }
};

console.log('\nJOP-07 — real submit-task handler, C1 path\n');

await t('main.js registered a jarvis:submit-task handler', () => {
  assert.ok(handlers.has('jarvis:submit-task'), 'handler never registered');
});

const submit = handlers.get('jarvis:submit-task');

// The evidence path is exercised WITHOUT reaching the model: an unresolvable
// selector makes materializePacket throw, which is caught and mapped. That still
// proves execution reached materialization — which is where REPO_ROOT died.
await t('C1 path reaches evidence materialization (no ReferenceError)', async () => {
  const r = await submit({}, {
    bounded_for_local: true, input_chars: 20, prompt: 'probe',
    context_selectors: [{ ref: 'no/such/file.mjs', why: 'deliberately unresolvable' }],
  });
  assert.equal(r.execution_lane, 'C1');
  const blob = JSON.stringify(r);
  assert.ok(!/REPO_ROOT is not defined/.test(blob), `ReferenceError survives: ${blob.slice(0, 300)}`);
  assert.ok(!/is not defined/.test(blob), `undeclared identifier in C1 path: ${blob.slice(0, 300)}`);
  // it got far enough to try to materialize, and failed CLOSED on the bad selector
  assert.equal(r.verification.correctness, 'failed');
  assert.match(r.verification.correctness_reason, /CONTEXT_MATERIALIZATION_FAILED/);
  assert.match(r.verification.correctness_reason, /file not found/);
});

await t('C0 lane still routes and executes against the resolved root', async () => {
  const r = await submit({}, { capability: 'git.rev_parse', args: {} });
  assert.equal(r.execution_lane, 'C0');
  assert.equal(r.status, 'completed');
  assert.equal(r.verification.pass, true);
});

await t('C3 remains routed but NOT executed', async () => {
  const r = await submit({}, { prompt: 'redesign the architecture' });
  assert.equal(r.execution_lane, 'C3');
  assert.equal(r.status, 'routed_not_executed');
});

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
