#!/usr/bin/env node
// GATE ZERO — mechanism-level restart witness.
//
// Proves, at the level this environment can prove it:
//   1. the canonical operated repository resolves,
//   2. a bounded C1 task executes through the real handler,
//   3. evidence is gathered and scored by the CANONICAL verifier,
//   4. the run is persisted automatically — nobody asked it to save,
//   5. the process that ran it is TERMINATED,
//   6. a NEW process retrieves the same canonical run with provenance intact.
//
// ── WHAT THIS IS NOT ────────────────────────────────────────────────────────
// This is not the packaged-application witness. It drives main.js under an
// Electron stub in Node. The packaged witness requires /Applications/JARVIS.app
// on macOS, a real GUI, and a real local worker, and it is the founder's step —
// see docs/ops/JARVIS_00_BINDING_RECORD_2026-08-24.md. Passing here is a
// necessary condition for that walk, never a substitute for it, and this file
// says so rather than letting a green line be read as more than it is.
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtempSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const AIN_HOME = mkdtempSync(path.join(os.tmpdir(), 'jarvis-gate-zero-'));

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}\n      ${e.message}`); fail++; }
};

const runPhase = (script, args) => {
  const out = execFileSync(process.execPath, [path.join(HERE, 'harness', script), ...args], {
    encoding: 'utf8',
    env: { ...process.env, AIN_DELEGATION_HOME: AIN_HOME },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return out;
};

console.log('\nGATE ZERO — C1 execute · persist · restart · retrieve\n');
console.log(`  run store: ${AIN_HOME}\n`);

// ── PHASE A ────────────────────────────────────────────────────────────────
let a = null, aPid = null, aExit = 0;
try {
  const out = runPhase('phase-a-run.mjs', []);
  a = JSON.parse(out.split('__PHASE_A__')[1].trim());
} catch (e) {
  aExit = e.status ?? -1;
  const raw = `${e.stdout || ''}${e.stderr || ''}`;
  const marker = raw.split('__PHASE_A__')[1];
  if (marker) a = JSON.parse(marker.trim());
  else { console.log(`  PHASE A produced no verdict:\n${raw.slice(0, 1500)}`); }
}

t('phase A executed the real main.js C1 handler without an unresolved reference', () => {
  assert.ok(a, 'phase A produced no verdict at all');
  // B2's signature. Named explicitly so a regression reads as the defect it is
  // rather than as a generic failure.
  const trace = String(a.error || a.result_error || '');
  assert.ok(!/is not defined/.test(trace),
    `unresolved identifier on the C1 path — this is the B2 class of defect: ${trace}`);
  assert.equal(a.error, undefined, `phase A threw: ${a.error}`);
});

t('the router selected C1 and the task completed', () => {
  assert.equal(a.execution_lane, 'C1', `expected lane C1, got ${a.execution_lane}`);
  assert.equal(a.status, 'completed', `expected completed, got ${a.status} (${a.failure_class || ''} ${a.result_error || ''})`);
});

t('canonical evidence was materialized and scored (not the no-evidence path)', () => {
  assert.ok(a.verification, 'no verification block was produced');
  assert.ok(a.verification.fragments_offered > 0,
    'no fragments were materialized — containment was never actually exercised');
  assert.equal(a.verification.correctness, 'verified',
    `canonical verifier did not confirm containment: ${a.verification.correctness}`);
});

t('B1 — the run persisted AUTOMATICALLY, with no explicit save', () => {
  assert.ok(a.persistence, 'the response carried no persistence fact at all');
  assert.equal(a.persistence.persisted, true, `run was not persisted: ${a.persistence.reason}`);
  assert.match(String(a.persistence.run_id), /^r-[0-9a-f]{10}$/, `not a canonical run id: ${a.persistence.run_id}`);
});

const runId = a && a.persistence ? a.persistence.run_id : null;

t('the run is on disk in the canonical store, not in Desktop-local storage', () => {
  assert.ok(runId, 'no run id to check');
  const f = path.join(AIN_HOME, 'runtime', 'runs', `${runId}.json`);
  assert.ok(existsSync(f), `expected the canonical store path ${f}`);
  const rec = JSON.parse(readFileSync(f, 'utf8'));
  assert.equal(rec.lane, 'C1');
  assert.equal(rec.origin, 'jarvis-desktop');
});

// ── PROCESS DEATH ──────────────────────────────────────────────────────────
t('phase A process is terminated before retrieval is attempted', () => {
  assert.ok(a && a.pid, 'phase A never reported its pid');
  aPid = a.pid;
  // execFileSync does not return until the child has exited, so the process is
  // already gone. Asserted rather than assumed: signal 0 throws ESRCH for a
  // pid that no longer exists, which is the fact we need on the record.
  let alive = true;
  try { process.kill(aPid, 0); } catch (e) { alive = e.code !== 'EPERM'; if (e.code === 'ESRCH') alive = false; }
  assert.equal(alive, false, `phase A pid ${aPid} is still alive — this would not be a restart`);
});

// ── PHASE B ────────────────────────────────────────────────────────────────
let b = null;
if (runId) {
  try {
    const out = runPhase('phase-b-retrieve.mjs', [runId]);
    b = JSON.parse(out.split('__PHASE_B__')[1].trim());
  } catch (e) {
    const raw = `${e.stdout || ''}${e.stderr || ''}`;
    const marker = raw.split('__PHASE_B__')[1];
    if (marker) b = JSON.parse(marker.trim());
    else console.log(`  PHASE B produced no verdict:\n${raw.slice(0, 1500)}`);
  }
}

t('a NEW process retrieves the same canonical run', () => {
  assert.ok(b, 'phase B produced no verdict');
  assert.equal(b.error, undefined, `phase B threw: ${b.error}`);
  assert.equal(b.retrieved, true, `run not retrieved after restart: ${b.reason}`);
  assert.equal(b.run.run_id, runId, 'a different run came back');
  assert.notEqual(b.pid, aPid, 'phase B ran in the same process — that is not a restart');
});

t('the run is discoverable by listing, not only by an id already known', () => {
  assert.equal(b.listed, true, 'the run did not appear in the bounded run listing');
});

t('provenance survived the restart — the eight identities are readable', () => {
  assert.equal(b.provenance_intact, true, 'the retrieved run carries no operated identity');
  const topo = b.run.topology;
  assert.ok(topo, 'no topology record on the retrieved run');
  assert.ok(topo.repository_identity, 'repository identity was not recorded');
  assert.ok(topo.operated_worktree, 'operated worktree was not recorded');
  assert.ok(topo.operated_commit, 'operated commit was not recorded');
  assert.ok(topo.operated_branch, 'operated branch was not recorded');
  assert.ok(topo.relationship_state, 'build/operated relationship was not recorded');
});

t('build identity and operated identity are stored as SEPARATE facts', () => {
  const topo = b.run.topology;
  // In an unpackaged harness run there IS no build identity, and the correct
  // record of that is null — never the operated commit copied across. A stamp
  // back-filled from the substrate would manufacture the exact alignment the
  // invariant exists to detect.
  assert.equal(topo.build_source_worktree, null,
    'an unpackaged process reported a build worktree — build identity was fabricated');
  assert.equal(topo.running_artifact_sha, null,
    'an unpackaged process reported an artifact SHA — it has no build identity to report');
  assert.equal(topo.relationship_state, 'UNKNOWN',
    `an unstamped artifact cannot be ALIGNED with anything; got ${topo.relationship_state}`);
});

rmSync(AIN_HOME, { recursive: true, force: true });

console.log(`\n  ${pass} passed · ${fail} failed`);
console.log(
  fail === 0
    ? '\n  MECHANISM-LEVEL RESTART WITNESS: PASS\n' +
      '  This is NOT the packaged-application witness. /Applications/JARVIS.app\n' +
      '  has not been exercised here. See the founder step in\n' +
      '  docs/ops/JARVIS_00_BINDING_RECORD_2026-08-24.md.\n'
    : '\n  MECHANISM-LEVEL RESTART WITNESS: FAIL\n',
);
process.exit(fail === 0 ? 0 : 1);
