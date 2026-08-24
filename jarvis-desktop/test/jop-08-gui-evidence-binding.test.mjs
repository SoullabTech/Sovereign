#!/usr/bin/env node
// JOP-08 — GUI evidence binding (B4).
//
// The seam: the runtime could always reason from materialized evidence and score
// an answer's containment inside it. The Desktop had no way to ask. renderer.js
// builds every C1 task as {bounded_for_local, input_chars, prompt} — no
// context_selectors field exists anywhere in the UI — so a task submitted from
// the surface a founder actually uses materialized zero fragments and could only
// ever return UNVERIFIED — NO_EVIDENCE_CONTEXT. A C1 lane that can only answer
// UNVERIFIED from the founder surface is not operationally bound.
//
// Every case below submits the EXACT payload shape the renderer produces,
// through the real registered handler, against the real bound repository. The
// deterministic cases stub the worker (this proves Desktop wiring, not a model);
// the final acceptance case uses the real local worker.

import assert from 'node:assert/strict';
import path from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { loadMainProcess, stubLocalWorker, DESKTOP, REPO } from './harness/electron-stub.mjs';

const HEAD = execFileSync('git', ['-C', REPO, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();

// The payload the renderer actually produces, kept in one place so every case
// goes through the shape a founder's keystrokes produce.
const guiC1 = (prompt) => ({ bounded_for_local: true, input_chars: prompt.length, prompt });

let pass = 0, fail = 0;
const t = async (name, fn) => {
  try { await fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}\n      ${e.message}`); fail++; }
};

console.log('\nJOP-08 — GUI evidence binding\n');

await t('the renderer still emits exactly the shape these tests submit', () => {
  const src = readFileSync(path.join(DESKTOP, 'src', 'renderer.js'), 'utf8');
  assert.ok(/bounded_for_local:\s*true,\s*input_chars:\s*p\.length,\s*prompt:\s*p/.test(src),
    'renderer C1 payload shape changed — these tests no longer mirror the GUI');
});

// ── deterministic cases: worker stubbed, aperture real ───────────────────────
const { invoke } = loadMainProcess({ repoRoot: REPO });

await t('a GUI question derives selectors from the bound repository', async () => {
  const restore = stubLocalWorker(async () => ({ response: 'The bound is 4000 (scripts/builder/router.mjs:23).', model: 'qwen2.5:7b' }));
  try {
    const r = await invoke('jarvis:submit-task', guiC1('What is the value of C1_MAX_INPUT_CHARS in the router?'));
    assert.equal(r.execution_lane, 'C1');
    assert.equal(r.verification.aperture.method, 'deterministic-grep-aperture');
    assert.ok(r.verification.fragments_offered > 0,
      `no fragments derived; aperture said: ${JSON.stringify(r.verification.aperture)}`);
    const files = r.verification.aperture.files_ranked.map((f) => f.file);
    assert.ok(files.includes('scripts/builder/router.mjs'),
      `expected router.mjs among ranked files, got: ${files.join(', ')}`);
    for (const f of files) assert.ok(existsSync(path.join(REPO, f)), `${f} not in bound repo`);
  } finally { restore(); }
});

await t('a question that localizes to nothing stays UNVERIFIED — NO_EVIDENCE_CONTEXT', async () => {
  const restore = stubLocalWorker(async () => ({ response: 'Sunny, about 22 degrees.', model: 'qwen2.5:7b' }));
  try {
    const r = await invoke('jarvis:submit-task', guiC1('what is the weather like today'));
    assert.equal(r.verification.fragments_offered, 0);
    assert.equal(r.verification.correctness, 'unverified');
    assert.match(r.verification.correctness_reason, /NO_EVIDENCE_CONTEXT/);
    assert.match(r.verification.aperture.reason, /NO_ELIGIBLE_EVIDENCE/);
  } finally { restore(); }
});

await t('a coincidental ordinary-word match is DECLINED, not offered as evidence', async () => {
  const restore = stubLocalWorker(async () => ({ response: 'It rejects it.', model: 'qwen2.5:7b' }));
  try {
    // 'oversized' appears in unrelated files; no definition, not identifier-shaped.
    const r = await invoke('jarvis:submit-task', guiC1('What does the router do with an oversized bounded task?'));
    assert.equal(r.verification.fragments_offered, 0);
    assert.equal(r.verification.correctness, 'unverified');
    assert.match(r.verification.aperture.reason, /NO_ELIGIBLE_EVIDENCE/);
  } finally { restore(); }
});

await t('evidence offered but answer uncited is NOT verified', async () => {
  const restore = stubLocalWorker(async () => ({ response: 'It is four thousand, roughly.', model: 'qwen2.5:7b' }));
  try {
    const r = await invoke('jarvis:submit-task', guiC1('What is the value of C1_MAX_INPUT_CHARS in the router?'));
    assert.ok(r.verification.fragments_offered > 0);
    assert.equal(r.verification.correctness, 'failed');
    assert.match(r.verification.correctness_reason, /EVIDENCE_INSUFFICIENT/);
  } finally { restore(); }
});

await t('a citation outside the materialized fragments is NOT verified', async () => {
  const restore = stubLocalWorker(async () => ({ response: 'See scripts/builder/router.mjs:99999.', model: 'qwen2.5:7b' }));
  try {
    const r = await invoke('jarvis:submit-task', guiC1('What is the value of C1_MAX_INPUT_CHARS in the router?'));
    assert.notEqual(r.verification.correctness, 'verified');
  } finally { restore(); }
});

await t('a caller-declared packet overrides the aperture', async () => {
  const restore = stubLocalWorker(async () => ({ response: 'ok (scripts/builder/router.mjs:23)', model: 'qwen2.5:7b' }));
  try {
    const r = await invoke('jarvis:submit-task', {
      bounded_for_local: true, input_chars: 30, prompt: 'What is C1_MAX_INPUT_CHARS?',
      context_selectors: [{ ref: 'scripts/builder/router.mjs', selector: { type: 'lines', start: 16, end: 24 }, why: 'explicit' }],
    });
    assert.equal(r.verification.aperture.method, 'caller-declared');
    assert.equal(r.verification.fragments_offered, 1);
  } finally { restore(); }
});

await t('an invalid caller selector fails CLOSED', async () => {
  const restore = stubLocalWorker(async () => ({ response: 'x', model: 'qwen2.5:7b' }));
  try {
    const r = await invoke('jarvis:submit-task', {
      bounded_for_local: true, input_chars: 10, prompt: 'probe',
      context_selectors: [{ ref: 'no/such/file.mjs', why: 'unresolvable' }],
    });
    assert.equal(r.verification.correctness, 'failed');
    assert.match(r.verification.correctness_reason, /CONTEXT_MATERIALIZATION_FAILED/);
  } finally { restore(); }
});

await t('an out-of-range caller selector fails CLOSED', async () => {
  const restore = stubLocalWorker(async () => ({ response: 'x', model: 'qwen2.5:7b' }));
  try {
    const r = await invoke('jarvis:submit-task', {
      bounded_for_local: true, input_chars: 10, prompt: 'probe',
      context_selectors: [{ ref: 'scripts/builder/router.mjs', selector: { type: 'lines', start: 1, end: 999999 }, why: 'out of range' }],
    });
    assert.equal(r.verification.correctness, 'failed');
    assert.match(r.verification.correctness_reason, /CONTEXT_MATERIALIZATION_FAILED/);
  } finally { restore(); }
});

// ── lane regression ──────────────────────────────────────────────────────────
await t('C0 still routes and executes', async () => {
  const r = await invoke('jarvis:submit-task', { capability: 'git.rev_parse', args: {} });
  assert.equal(r.execution_lane, 'C0');
  assert.equal(r.status, 'completed');
});

await t('C3 still routed but NOT executed', async () => {
  const r = await invoke('jarvis:submit-task', { description: 'redesign the whole architecture' });
  assert.equal(r.execution_lane, 'C3');
  assert.equal(r.status, 'routed_not_executed');
});

// ── acceptance: the real worker ──────────────────────────────────────────────
await t('GUI question -> aperture -> evidence -> qwen2.5:7b -> containment -> VERIFIED -> persisted', async () => {
  const r = await invoke('jarvis:submit-task', guiC1('What is the value of C1_MAX_INPUT_CHARS in the router?'));
  assert.equal(r.status, 'completed', `worker did not complete: ${JSON.stringify(r.result).slice(0, 200)}`);
  assert.ok(r.verification.fragments_offered > 0, 'no evidence offered');
  assert.notEqual(r.verification.correctness, 'unverified',
    'evidence was offered, so the verdict must not be NO_EVIDENCE_CONTEXT');
  assert.equal(r.verification.correctness, 'verified', `answer not contained: ${r.verification.correctness_reason}`);
  assert.equal(r.persistence.persisted, true, `not persisted: ${r.persistence.reason}`);
  assert.match(r.persistence.run_id, /^r-[0-9a-f]{10}$/);

  const store = await import(`file://${path.join(REPO, 'scripts', 'builder', 'jarvis-runtime-store.mjs')}`);
  const rec = store.loadRun(r.persistence.run_id);
  assert.ok(rec, 'record not retrievable');
  assert.equal(rec.state, 'COMPLETED');
  assert.equal(rec.disposition, 'verified');
  assert.ok(rec.verification.evidence.valid > 0, 'no contained citations recorded');
  const frags = rec.verification.evidence.citations;
  assert.ok(frags.length > 0, 'no citations recorded');
  for (const c of frags.filter((c) => c.in_context)) {
    assert.ok(c.fragment, 'contained citation missing its fragment range');
    assert.equal(c.source_sha, HEAD, 'citation sha is not the bound repo HEAD');
  }
});

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
