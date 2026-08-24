#!/usr/bin/env node
// JOP-06 — Desktop C1 result persistence (B1).
//
// Proves three things that are different:
//   1. The record SHAPE is honest: a correctness verdict is never upgraded by
//      persistence, and 'unverified' is not collapsed into FAILED or VERIFIED.
//   2. A C1 run persisted through the CANONICAL store survives process restart
//      and is retrievable by canonical run_id with its provenance intact.
//   3. C1 records cannot be rewritten by the work-unit lane's orphan
//      reconciliation — the two lanes share a store, not a state machine.
//
// The store is isolated via AIN_DELEGATION_HOME so this test cannot pollute the
// real runtime store.

import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtempSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const REPO_ROOT = path.resolve(DESKTOP, '..');
const require = createRequire(import.meta.url);

const HOME = mkdtempSync(path.join(os.tmpdir(), 'jop06-'));
process.env.AIN_DELEGATION_HOME = HOME;

const { buildC1RunRecord, stateForCorrectness } = require(path.join(DESKTOP, 'src', 'c1-run-record.js'));
const { decideCorrectness } = require(path.join(DESKTOP, 'src', 'correctness.js'));
const { materializePacket } = await import(`file://${path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-context.mjs')}`);
const { verifyEvidence } = await import(`file://${path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-runtime-pipeline.mjs')}`);
const store = await import(`file://${path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-runtime-store.mjs')}`);

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}\n      ${e.message}`); fail++; }
};

console.log('\nJOP-06 — C1 result persistence\n');

// ── 1. honest state mapping ──────────────────────────────────────────────────
t('verified maps to VERIFIED', () => assert.equal(stateForCorrectness('verified'), 'VERIFIED'));
t('failed maps to FAILED', () => assert.equal(stateForCorrectness('failed'), 'FAILED'));
t("unverified maps to UNVERIFIED — not collapsed into FAILED or VERIFIED", () => {
  const s = stateForCorrectness('unverified');
  assert.equal(s, 'UNVERIFIED');
  assert.notEqual(s, 'FAILED');
  assert.notEqual(s, 'VERIFIED');
});
t('an unknown verdict throws rather than defaulting', () => {
  assert.throws(() => stateForCorrectness('probably-fine'), /unknown correctness/);
});

// ── 2. a real materialized C1 run round-trips with provenance ────────────────
const selectors = [{ ref: 'scripts/builder/router.mjs', selector: { type: 'lines', start: 16, end: 24 }, why: 'C1_MAX_INPUT_CHARS declaration' }];
const fragments = materializePacket({ context_selectors: selectors }, REPO_ROOT);
// An answer citing a line that IS inside the materialized fragment.
const answer = 'The bound is 4000 characters (scripts/builder/router.mjs:23).';
const evidence = verifyEvidence(answer, fragments);
const verdict = decideCorrectness({ materialization_error: null, fragmentCount: fragments.length, evidence });

t('fixture is genuinely evidence-contained (guards the rest of the test)', () => {
  assert.equal(evidence.ok, true, `evidence not ok: ${JSON.stringify(evidence.citations)}`);
  assert.equal(verdict.correctness, 'verified');
});

store.initStore();
const run_id = store.newRunId();
const record = buildC1RunRecord({
  run_id, now: store.nowISO(), root: REPO_ROOT,
  task: 'What is C1_MAX_INPUT_CHARS?', model: 'qwen2.5:7b',
  executionVerified: true, correctness: verdict.correctness,
  correctness_reason: verdict.correctness_reason, fragments, evidence, answer,
});
store.saveRun(record);

t('fragment CONTENT is not persisted, provenance metadata is', () => {
  assert.equal(record.fragments.length, 1);
  assert.equal(record.fragments[0].content, undefined, 'raw content leaked into the record');
  assert.equal(record.fragments[0].source_file, 'scripts/builder/router.mjs');
  assert.equal(record.fragments[0].start_line, 16);
  assert.equal(record.fragments[0].end_line, 24);
  assert.ok(record.fragments[0].source_sha, 'source_sha missing');
  assert.ok(record.fragments[0].content_hash, 'content_hash missing');
});

t('canonical run_id format is used (store loadRun fail-closes otherwise)', () => {
  assert.match(run_id, /^r-[0-9a-f]{10}$/);
});

// RESTART: a genuinely separate process, sharing only the isolated store dir.
const probe = `
  process.env.AIN_DELEGATION_HOME = ${JSON.stringify(HOME)};
  const s = await import(${JSON.stringify(`file://${path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-runtime-store.mjs')}`)});
  console.log(JSON.stringify(s.loadRun(${JSON.stringify(run_id)})));
`;
const reloaded = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', probe], { encoding: 'utf8' }));

t('run is retrievable in a SEPARATE process (restart survival)', () => {
  assert.ok(reloaded, 'run not retrievable after restart');
  assert.equal(reloaded.run_id, run_id);
  assert.equal(reloaded.record_kind, 'c1-task');
  assert.equal(reloaded.lane, 'C1');
});

t('evidence + provenance survived the restart intact', () => {
  assert.equal(reloaded.state, 'VERIFIED');
  assert.equal(reloaded.correctness, 'verified');
  assert.equal(reloaded.repo_root, REPO_ROOT);
  assert.equal(reloaded.starting_sha, fragments[0].source_sha);
  assert.equal(reloaded.evidence.method, 'materialized-fragment-containment');
  assert.equal(reloaded.evidence.valid, evidence.valid);
  assert.equal(reloaded.evidence.invalid, 0);
  assert.equal(reloaded.fragments[0].source_file, 'scripts/builder/router.mjs');
});

// ── 3. an UNVERIFIED run persists as such, and is not reachable by reconcile ──
const unverifiedId = store.newRunId();
const nc = decideCorrectness({ materialization_error: null, fragmentCount: 0, evidence: null });
store.saveRun(buildC1RunRecord({
  run_id: unverifiedId, now: store.nowISO(), root: REPO_ROOT,
  task: 'ungrounded question', model: 'qwen2.5:7b', executionVerified: true,
  correctness: nc.correctness, correctness_reason: nc.correctness_reason,
  fragments: [], evidence: null, answer: 'a confident-sounding guess',
}));

t('a run with no evidence persists as UNVERIFIED, never VERIFIED', () => {
  const r = store.loadRun(unverifiedId);
  assert.equal(r.state, 'UNVERIFIED');
  assert.equal(r.correctness, 'unverified');
  assert.match(r.correctness_reason, /NO_EVIDENCE_CONTEXT/);
  assert.equal(r.starting_sha, null);
});

t('execution success is recorded separately from correctness', () => {
  const r = store.loadRun(unverifiedId);
  assert.equal(r.execution_verified, true);   // the worker DID run
  assert.equal(r.correctness, 'unverified');  // that proves nothing about truth
});

t('work-unit orphan reconciliation cannot rewrite C1 records', () => {
  const IN_FLIGHT = ['QUEUED', 'VALIDATING', 'CONTEXT_ROUTING', 'READY_FOR_WORKER', 'RUNNING', 'VALIDATING_RESULT', 'VERIFYING_EVIDENCE'];
  const touched = store.reconcileOrphanedRuns(IN_FLIGHT);
  assert.deepEqual(touched, [], `reconcile rewrote C1 records: ${touched.join(', ')}`);
  assert.equal(store.loadRun(run_id).state, 'VERIFIED');
  assert.equal(store.loadRun(unverifiedId).state, 'UNVERIFIED');
});

// ── 4. the wire actually exists in main.js ───────────────────────────────────
t('main.js persists via the canonical store, on the C1 path', () => {
  const src = readFileSync(path.join(DESKTOP, 'src', 'main.js'), 'utf8');
  assert.ok(src.includes("require('./c1-run-record')"), 'builder not required');
  assert.ok(src.includes('store.saveRun(buildC1RunRecord({'), 'saveRun wire absent');
  assert.ok(src.includes("'jarvis-runtime-store.mjs'"), 'canonical store not imported');
  // persistence must sit AFTER the verdict, never before it
  assert.ok(src.indexOf('decideCorrectness({') < src.indexOf('store.saveRun(buildC1RunRecord({'),
    'persistence runs before correctness is decided');
});

t('persistence failure does not rewrite the verdict', () => {
  const src = readFileSync(path.join(DESKTOP, 'src', 'main.js'), 'utf8');
  assert.ok(src.includes('response.persisted = false'), 'no persistence-failure branch');
  assert.ok(src.includes('response.persistence_error'), 'failure not reported');
});

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
