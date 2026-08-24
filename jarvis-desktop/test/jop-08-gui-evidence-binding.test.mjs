#!/usr/bin/env node
// JOP-08 — GUI evidence binding (B4).
//
// The seam: the runtime could always reason from materialized evidence, but the
// Desktop had no way to ask it to. renderer.js builds every C1 task as
// {bounded_for_local, input_chars, prompt} — no context_selectors field exists
// anywhere in the UI — so a GUI C1 task materialized zero fragments and could
// only ever return UNVERIFIED — NO_EVIDENCE_CONTEXT.
//
// These tests submit the EXACT payload shape the renderer produces, through the
// real registered handler, against the real bound repository, and (in the final
// case) the real local worker. Source-text matching would not prove any of it.

import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const REPO_ROOT = path.resolve(DESKTOP, '..');
const require = createRequire(import.meta.url);

process.env.AIN_DELEGATION_HOME = mkdtempSync(path.join(os.tmpdir(), 'jop08-'));
process.env.JARVIS_REPO_ROOT = REPO_ROOT;

const handlers = new Map();
const noop = () => {};
const electronStub = {
  app: {
    isPackaged: false,
    getPath: () => mkdtempSync(path.join(os.tmpdir(), 'jop08-appdata-')),
    getVersion: () => '0.0.0-test',
    setPath: noop, setAppUserModelId: noop, getName: () => 'JARVIS',
    whenReady: () => new Promise(() => {}),
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
const submit = handlers.get('jarvis:submit-task');

// The payload the renderer actually produces. Kept as one helper so every test
// below goes through the same shape a founder's keystrokes produce.
const guiC1 = (prompt) => ({ bounded_for_local: true, input_chars: prompt.length, prompt });

const HEAD = execFileSync('git', ['-C', REPO_ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();

let pass = 0, fail = 0;
const t = async (name, fn) => {
  try { await fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}\n      ${e.message}`); fail++; }
};

console.log('\nJOP-08 — GUI evidence binding\n');

await t('the renderer still emits exactly the shape these tests submit', () => {
  const src = readFileSync(path.join(DESKTOP, 'src', 'renderer.js'), 'utf8');
  assert.ok(src.includes('task = { bounded_for_local: true, input_chars: p.length, prompt: p };'),
    'renderer C1 payload shape changed — these tests no longer mirror the GUI');
});

// ── the aperture, exercised through the real handler ─────────────────────────
let verifiedRun = null;

await t('a GUI C1 question derives selectors and materializes evidence', async () => {
  const r = await submit({}, guiC1('What is the value of C1_MAX_INPUT_CHARS in the router?'));
  assert.equal(r.execution_lane, 'C1');
  assert.ok(r.verification, 'no verification block');
  assert.ok(r.verification.fragments_offered > 0,
    `no fragments derived; aperture said: ${JSON.stringify(r.verification.aperture)}`);
  assert.equal(r.verification.aperture.method, 'deterministic-grep-aperture');
  assert.ok(r.verification.aperture.terms_used.length > 0, 'no terms used');
  verifiedRun = r;
});

await t('fragments come from the BOUND operated repository, at its HEAD', () => {
  // Fragment provenance itself is asserted from the persisted record below.
  const ranked = verifiedRun.verification.aperture.files_ranked;
  assert.ok(ranked.length > 0);
  for (const f of ranked) {
    assert.ok(existsSync(path.join(REPO_ROOT, f.file)), `${f.file} is not in the bound repo`);
  }
});

await t('the router source is what the aperture selected (not a coincidental file)', () => {
  const files = verifiedRun.verification.aperture.files_ranked.map((f) => f.file);
  assert.ok(files.includes('scripts/builder/router.mjs'),
    `expected router.mjs among ranked files, got: ${files.join(', ')}`);
});

// ── epistemic behaviour must stay distinct ───────────────────────────────────
await t('a question that localizes to nothing stays UNVERIFIED — NO_EVIDENCE_CONTEXT', async () => {
  const r = await submit({}, guiC1('what is the weather like today'));
  assert.equal(r.verification.fragments_offered, 0);
  assert.equal(r.verification.correctness, 'unverified');
  assert.match(r.verification.correctness_reason, /NO_EVIDENCE_CONTEXT/);
  assert.match(r.verification.aperture.reason, /NO_ELIGIBLE_EVIDENCE/);
});

await t('a coincidental ordinary-word match is DECLINED, not offered as evidence', async () => {
  const r = await submit({}, guiC1('What does the router do with an oversized bounded task?'));
  // 'oversized' matches unrelated files; no definition, not identifier-shaped.
  assert.equal(r.verification.fragments_offered, 0);
  assert.equal(r.verification.correctness, 'unverified');
  assert.match(r.verification.aperture.reason, /NO_ELIGIBLE_EVIDENCE/);
});

await t('a caller-declared packet overrides the aperture', async () => {
  const r = await submit({}, {
    bounded_for_local: true, input_chars: 30, prompt: 'What is C1_MAX_INPUT_CHARS?',
    context_selectors: [{ ref: 'scripts/builder/router.mjs', selector: { type: 'lines', start: 16, end: 24 }, why: 'explicit' }],
  });
  assert.equal(r.verification.aperture.method, 'caller-declared');
  assert.equal(r.verification.fragments_offered, 1);
});

await t('an invalid caller selector fails CLOSED, never silently degrading', async () => {
  const r = await submit({}, {
    bounded_for_local: true, input_chars: 10, prompt: 'probe',
    context_selectors: [{ ref: 'no/such/file.mjs', why: 'unresolvable' }],
  });
  assert.equal(r.verification.correctness, 'failed');
  assert.match(r.verification.correctness_reason, /CONTEXT_MATERIALIZATION_FAILED/);
});

await t('an out-of-range selector fails CLOSED', async () => {
  const r = await submit({}, {
    bounded_for_local: true, input_chars: 10, prompt: 'probe',
    context_selectors: [{ ref: 'scripts/builder/router.mjs', selector: { type: 'lines', start: 1, end: 999999 }, why: 'out of range' }],
  });
  assert.equal(r.verification.correctness, 'failed');
  assert.match(r.verification.correctness_reason, /CONTEXT_MATERIALIZATION_FAILED/);
});

// ── no regression on the other lanes ─────────────────────────────────────────
await t('C0 still routes and executes', async () => {
  const r = await submit({}, { capability: 'git.rev_parse', args: {} });
  assert.equal(r.execution_lane, 'C0');
  assert.equal(r.status, 'completed');
});

await t('C3 still routed but NOT executed', async () => {
  const r = await submit({}, { description: 'redesign the whole architecture' });
  assert.equal(r.execution_lane, 'C3');
  assert.equal(r.status, 'routed_not_executed');
});

// ── the full GUI acceptance chain, with the real worker ──────────────────────
await t('GUI question -> aperture -> evidence -> qwen2.5:7b -> containment -> VERIFIED -> persisted', async () => {
  const r = verifiedRun;
  assert.equal(r.status, 'completed', `worker did not complete: ${JSON.stringify(r.result).slice(0, 200)}`);
  assert.equal(r.verification.pass, true, 'execution not verified');
  assert.ok(r.verification.evidence, 'verifier did not run');
  assert.notEqual(r.verification.correctness, 'unverified',
    'evidence was offered, so the verdict must not be NO_EVIDENCE_CONTEXT');
  assert.equal(r.verification.correctness, 'verified',
    `answer not contained: ${r.verification.correctness_reason}`);
  assert.equal(r.persisted, true, 'run was not persisted');
  assert.match(r.run_id, /^r-[0-9a-f]{10}$/);
});

await t('the persisted record carries repository SHA, path and line range', async () => {
  const store = await import(`file://${path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-runtime-store.mjs')}`);
  const rec = store.loadRun(verifiedRun.run_id);
  assert.ok(rec, 'record not retrievable');
  assert.equal(rec.state, 'VERIFIED');
  assert.equal(rec.repo_root, REPO_ROOT);
  assert.equal(rec.starting_sha, HEAD, 'record sha is not the bound repo HEAD');
  assert.ok(rec.fragments.length > 0);
  for (const f of rec.fragments) {
    assert.ok(f.source_file, 'fragment missing path');
    assert.equal(f.source_sha, HEAD, 'fragment sha is not the bound repo HEAD');
    assert.ok(Number.isInteger(f.start_line) && Number.isInteger(f.end_line), 'fragment missing line range');
    assert.ok(f.content_hash, 'fragment missing content hash');
    assert.equal(f.content, undefined, 'raw content leaked into the record');
  }
});

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
