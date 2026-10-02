// O5-R2E — Path A orphan VISIBILITY witness. Not recovery.
//
// Law: a Path A run interrupted in flight is made visibly terminal
// (FAILED · RUNTIME_STOPPED_MID_RUN · disposition BLOCKED_BY_EVIDENCE) ONLY on
// proof its owner is gone. It is never resumed, re-dispatched or re-queued.
// Absence of evidence (no owner stamp, other host, undeterminable) is not proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const REPO = path.resolve(import.meta.dirname, '..', '..');
const HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'o5r2e-'));
process.env.AIN_DELEGATION_HOME = HOME;
const bust = `?t=${Date.now()}`;
const store = await import(pathToFileURL(path.join(REPO, 'scripts/builder/jarvis-runtime-store.mjs')).href + bust);
const pipeline = await import(pathToFileURL(path.join(REPO, 'scripts/builder/jarvis-runtime-pipeline.mjs')).href + bust);
const MECH = require('../src/builder-mechanism.js');

test.after(() => fs.rmSync(HOME, { recursive: true, force: true }));

// A pid that certainly existed on this host and certainly no longer does.
const deadPid = spawnSync(process.execPath, ['-e', 'process.stdout.write(String(process.pid))'], { encoding: 'utf8' }).stdout.trim() * 1;
const host = os.hostname();
let n = 0;
function seed(patch) {
  n += 1;
  const run = { run_id: `r-${String(n).padStart(10, '0')}`, state: 'RUNNING', created_at: `2026-09-30T00:00:${String(n).padStart(2, '0')}Z`, ...patch };
  store.saveRun(run);
  return run.run_id;
}
const load = (id) => store.loadRun(id);

test('R2E-1 in-flight run whose owner is PROVEN gone → FAILED · RUNTIME_STOPPED_MID_RUN · BLOCKED_BY_EVIDENCE, with what may have happened', () => {
  assert.equal(store.ownerProcessAlive(deadPid), false, 'instrument: the seeded owner pid is really gone');
  const id = seed({ owner: { pid: deadPid, host, started_at: 'x' } });
  const out = store.reconcileOrphanedRuns(pipeline.IN_FLIGHT_STATES, { effectsByState: pipeline.EFFECTS_POSSIBLE_BY_STATE });
  assert.ok(out.reconciled.includes(id));
  const r = load(id);
  assert.equal(r.state, 'FAILED');
  assert.equal(r.failure_class, 'RUNTIME_STOPPED_MID_RUN', 'existing code preserved, not renamed');
  assert.equal(r.disposition, 'BLOCKED_BY_EVIDENCE');
  assert.equal(r.interruption.last_state, 'RUNNING');
  assert.ok(r.interruption.effects_possible.includes('candidate commit created'));
  assert.match(r.interruption.recovery, /^NONE/);
  assert.ok(pipeline.isLegalTransition('RUNNING', 'FAILED'), 'FAILED is the lawful destination from every in-flight state');
  for (const k of ['packet', 'worker', 'blocked']) assert.equal(r[k], undefined, `no re-dispatch artefact '${k}' written`);
});

test('R2E-2 no resume semantics: a reconciled run is terminal and a second pass leaves it alone', () => {
  const id = seed({ state: 'VERIFYING_EVIDENCE', owner: { pid: deadPid, host, started_at: 'x' } });
  store.reconcileOrphanedRuns(pipeline.IN_FLIGHT_STATES, { effectsByState: pipeline.EFFECTS_POSSIBLE_BY_STATE });
  const first = load(id);
  assert.ok(pipeline.TERMINAL_STATES.includes(first.state));
  assert.notEqual(first.state, 'QUEUED');
  const again = store.reconcileOrphanedRuns(pipeline.IN_FLIGHT_STATES, {});
  assert.equal(again.reconciled.includes(id), false);
  assert.equal(load(id).reconciled_at, first.reconciled_at);
});

test('R2E-3 absence of evidence is not proof: unrecorded, other-host, live, self and undeterminable owners are UNPROVEN and untouched', () => {
  const cases = [
    [seed({}), 'OWNER_UNRECORDED'],
    [seed({ owner: { pid: deadPid, host: host + '-elsewhere' } }), 'OWNER_ON_OTHER_HOST'],
    [seed({ owner: { pid: process.pid, host } }), 'OWNER_IS_THIS_PROCESS'],
    [seed({ owner: { pid: process.ppid, host } }), 'OWNER_ALIVE'],
  ];
  const out = store.reconcileOrphanedRuns(pipeline.IN_FLIGHT_STATES, {});
  for (const [id, reason] of cases) {
    assert.deepEqual(out.unproven.find((u) => u.run_id === id)?.reason, reason);
    assert.equal(load(id).state, 'RUNNING', `${reason}: untouched`);
  }
  const u = seed({ owner: { pid: 424242, host } });
  const o2 = store.reconcileOrphanedRuns(pipeline.IN_FLIGHT_STATES, { isAlive: () => null });
  assert.equal(o2.unproven.find((x) => x.run_id === u)?.reason, 'OWNER_UNDETERMINABLE');
  assert.equal(load(u).state, 'RUNNING');
});

test('R2E-4 not in flight is never touched: QUEUED, PAUSED_FOR_GOVERNANCE and terminal runs', () => {
  const ids = ['QUEUED', 'PAUSED_FOR_GOVERNANCE', 'VERIFIED', 'ESCALATION_REQUIRED'].map((state) => [seed({ state, owner: { pid: deadPid, host } }), state]);
  store.reconcileOrphanedRuns(pipeline.IN_FLIGHT_STATES, {});
  for (const [id, state] of ids) assert.equal(load(id).state, state);
  assert.equal(pipeline.IN_FLIGHT_STATES.includes('PAUSED_FOR_GOVERNANCE'), false);
  assert.equal(pipeline.IN_FLIGHT_STATES.includes('QUEUED'), false);
});

test('R2E-5 Desktop stamps the owner on every new run, and reconciles through the mechanism loaded from the bound root', async () => {
  const r = await MECH.runWorkUnit(REPO, { objective: 'invalid on purpose' }, {});
  assert.equal(r.submitted, true);
  assert.equal(r.run.owner.pid, process.pid);
  assert.equal(r.run.owner.host, host);
  const id = seed({ state: 'CONTEXT_ROUTING', owner: { pid: deadPid, host } });
  const out = await MECH.reconcileOrphans(REPO);
  assert.equal(out.ok, true);
  assert.ok(out.reconciled.includes(id));
  assert.deepEqual(load(id).interruption.effects_possible, [...pipeline.EFFECTS_POSSIBLE_BY_STATE.CONTEXT_ROUTING]);
});
