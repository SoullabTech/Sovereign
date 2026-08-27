#!/usr/bin/env node
// JARVIS-STAB-01..04 — custody loop proof, against the REAL canonical store.
//
// Nothing here is mocked. task-runs.js resolves scripts/builder/jarvis-runtime-store.mjs
// from the bound root and writes real files; the test only redirects
// AIN_DELEGATION_HOME to a temp directory so the proof cannot touch a founder's
// actual run history. Mocking the store would prove the wire compiles, not that
// a run survives — and survival is the entire claim.
//
// Acceptance replayed verbatim from the founder ruling (2026-08-27):
//   open → submit bounded task → durable run_id → close app → reopen
//   → exact task/result/lane/status still present.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const REPO_ROOT = path.resolve(DESKTOP, '..');

// Redirect the store BEFORE task-runs is imported: jarvis-runtime-store.mjs
// reads AIN_DELEGATION_HOME at module scope.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-stab-'));
process.env.AIN_DELEGATION_HOME = TMP;

const require = createRequire(import.meta.url);
const RUNS = require(path.join(DESKTOP, 'src', 'task-runs.js'));
const PS = require(path.join(DESKTOP, 'src', 'programme-state.js'));
const PACKET = require(path.join(DESKTOP, 'src', 'execution-packet.js'));
const RECEIPT = require(path.join(DESKTOP, 'src', 'evidence-receipt.js'));

let failures = 0;
const report = (name, ok, extra) => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? `\n        ${extra}` : ''}`);
};

const C3_TASK = { description: 'Wire the duplication mechanism for VOICE-CAPTURE-01B-OBS' };
const C3_DECISION = {
  execution_lane: 'C3', cost_class: 'frontier_model', status: 'routed',
  reason: 'No deterministic capability matched and task is not declared bounded-for-local; requires frontier-model reasoning.',
  verification_required: true,
};
const REGISTRY = ['ExploreDirectory', 'ReadFile'];

console.log('\n── STAB-01: a submitted task survives the app ──────────────────');
{
  // Guard the guard: if the store were silently unreachable, every survival
  // assertion below would pass vacuously against an in-memory object.
  const probe = await RUNS.loadStore(REPO_ROOT);
  report('the canonical store is resolved from the bound root (not mocked)',
    probe.ok && probe.source.endsWith(path.join('scripts', 'builder', 'jarvis-runtime-store.mjs')),
    probe.reason || probe.source);

  const opened = await RUNS.openRun(REPO_ROOT, { task: C3_TASK, decision: C3_DECISION, capabilityNames: REGISTRY, app_build_sha: '4f0d2289f' });
  report('submitting a task opens custody with a durable run_id',
    opened.custody && /^r-[0-9a-f]{10}$/.test(opened.run.run_id), opened.reason);

  const RUN_ID = opened.run.run_id;
  const onDisk = path.join(TMP, 'runtime', 'runs', `${RUN_ID}.json`);
  report('the run is on disk BEFORE execution is attempted', fs.existsSync(onDisk), onDisk);

  RUNS.transition(opened.store, opened.run, RUNS.STATE.ROUTED_NOT_EXECUTED, {
    result: { note: 'C3 selected. Desktop Alpha does not auto-invoke Claude.' },
  });

  // ── "close the app" ──────────────────────────────────────────────────────
  // Every in-process handle is dropped; the next block reads only from disk.
  const reopened = await RUNS.listRuns(REPO_ROOT, { limit: 25 });
  const found = reopened.runs.find((r) => r.run_id === RUN_ID);

  report('after reopen, the run is still present', !!found, JSON.stringify(reopened.runs.map((r) => r.run_id)));
  report('the EXACT task survives', JSON.stringify(found.task) === JSON.stringify(C3_TASK), JSON.stringify(found && found.task));
  report('the lane survives', found.lane === 'C3');
  report('the status survives', found.state === RUNS.STATE.ROUTED_NOT_EXECUTED, found.state);
  report('the result survives', /does not auto-invoke Claude/.test(found.result.note));
  report('the routing reason survives', found.reason === C3_DECISION.reason);
  report('the build that produced it survives', found.app_build_sha === '4f0d2289f');
  report('no run is blank or missing', reopened.runs.every((r) => r.run_id && r.state && r.lane !== undefined));

  globalThis.__RUN_ID = RUN_ID;
}

console.log('\n── STAB-01: a run abandoned mid-flight is reconciled, not left lying ──');
{
  const opened = await RUNS.openRun(REPO_ROOT, { task: { bounded_for_local: true, input_chars: 12, prompt: 'hello' }, decision: { execution_lane: 'C1', cost_class: 'local_model', status: 'routed', reason: 'bounded', verification_required: true }, capabilityNames: REGISTRY });
  RUNS.transition(opened.store, opened.run, RUNS.STATE.EXECUTING, {});
  const id = opened.run.run_id;

  // The app is killed here. No terminal transition is ever written.
  const rec = await RUNS.reconcileOnLaunch(REPO_ROOT);
  report('the abandoned run is reconciled at next launch', rec.custody && rec.reconciled.includes(id), JSON.stringify(rec));

  const after = (await RUNS.getRun(REPO_ROOT, id)).run;
  report('it is FAILED, not still claiming to execute', after.state === 'FAILED', after.state);
  report('and it says WHY it failed', after.failure_class === 'RUNTIME_STOPPED_MID_RUN', after.failure_class);

  // A terminal run must never be rewritten by a later reconcile pass.
  const again = await RUNS.reconcileOnLaunch(REPO_ROOT);
  report('a second launch does not re-reconcile settled runs', !again.reconciled.includes(globalThis.__RUN_ID), JSON.stringify(again.reconciled));
}

console.log('\n── STAB-02: determinism is AUDITED from durable history ────────');
{
  const a = RUNS.routingFingerprint(C3_TASK, REGISTRY);
  report('same task + same registry → same fingerprint', a === RUNS.routingFingerprint({ ...C3_TASK }, [...REGISTRY].reverse()));
  report('a changed registry is a different fingerprint, not a violation',
    a !== RUNS.routingFingerprint(C3_TASK, [...REGISTRY, 'NewCapability']));

  const listed = await RUNS.listRuns(REPO_ROOT, { limit: 200 });
  report('durable history reports determinism', listed.determinism.deterministic, JSON.stringify(listed.determinism.violations));
  report('and states its basis rather than asserting confidence',
    /distinct routing input/.test(listed.determinism.basis), listed.determinism.basis);
  report('an empty history reports UNVERIFIED, not "deterministic"',
    /UNVERIFIED/.test(RUNS.auditRoutingDeterminism([]).basis));

  // SABOTAGE: if the router ever drifted, the audit must SAY so.
  const drifted = RUNS.auditRoutingDeterminism([
    { run_id: 'r-1111111111', routing_fingerprint: a, lane: 'C3' },
    { run_id: 'r-2222222222', routing_fingerprint: a, lane: 'C1' },
  ]);
  report('drift is reported, never suppressed',
    !drifted.deterministic && drifted.violations[0].lanes.sort().join(',') === 'C1,C3');
}

console.log('\n── STAB-03: the C3 lane ends in a packet, not a paragraph ──────');
{
  const RUN_ID = globalThis.__RUN_ID;
  const run = (await RUNS.getRun(REPO_ROOT, RUN_ID)).run;
  const rp = await RUNS.receiptPath(REPO_ROOT, RUN_ID);

  const pkt = PACKET.buildPacket({
    run_id: RUN_ID, unit: 'VOICE-CAPTURE-01B-OBS', task: run.task, lane: run.lane, reason: run.reason,
    canonical_sha: PS.carried('canonical_sha', PS.observed('canonical_sha', '64c2b7c07', { at: '2026-08-26T18:04:00Z', by: 'prior deploy witness' })),
    production_sha: PS.carried('production_sha', null),
    candidate_sha: PS.observed('candidate_sha', 'c70f6ee36', { at: '2026-08-27T11:40:00Z', by: 'git HEAD' }),
    allowed: ['lib/voice/**'], forbidden: ['no schema changes'],
    acceptance: ['duplication mechanism covered by a test'], stop_condition: 'PR #1110 build resolves',
    receipt_path: rp.path,
  });

  report('the packet carries the run_id — evidence can find its way home', pkt.run_id === RUN_ID);
  report('a packet without custody is REFUSED, not defaulted',
    (() => { try { PACKET.buildPacket({ task: {} }); return false; } catch { return true; } })());

  const text = PACKET.renderPacket(pkt);
  for (const field of ['RUN ID', 'ACTIVE UNIT', 'CANONICAL SHA', 'PRODUCTION SHA', 'CANDIDATE SHA',
    'TASK', 'ALLOWED FILES / SURFACES', 'FORBIDDEN CHANGES', 'ACCEPTANCE', 'STOP CONDITION', 'RETURN FORMAT']) {
    report(`packet states ${field}`, text.includes(field));
  }

  // Invariant 3, inside the handoff: the worker is told what is stale.
  report('a carried canonical SHA travels with its value AND its staleness',
    text.includes('64c2b7c07') && /NOT RE-READ THIS RUN/.test(text));
  report('a never-observed production SHA does not masquerade as a value',
    pkt.production_sha.freshness === PS.FRESHNESS.NEVER_OBSERVED && pkt.production_sha.value === '—');
  report('the freshly-read candidate is marked fresh',
    pkt.candidate_sha.freshness === PS.FRESHNESS.FRESH);
  report('unverified bases are enumerated as data, not buried in prose',
    pkt.unverified_bases.map((u) => u.field).sort().join(',') === 'canonical_sha,production_sha');
  report('the packet names WHERE the receipt goes', text.includes(rp.path));

  const w = await RUNS.writeHandoffPacket(REPO_ROOT, RUN_ID, text);
  report('the packet is written to durable custody', w.ok && fs.existsSync(w.path), w.reason);
}

console.log('\n── STAB-04: evidence returns and rejoins its run ───────────────');
{
  const RUN_ID = globalThis.__RUN_ID;
  const run = (await RUNS.getRun(REPO_ROOT, RUN_ID)).run;

  const bad = (r) => RECEIPT.validateReceipt(r, run).violations.map((v) => v.code);
  report('a receipt with no non_claim is refused',
    bad({ run_id: RUN_ID, claim: 'wired the mechanism' }).includes('MISSING_REQUIRED_FIELD'));
  report('an unfreshened observation is refused',
    bad({ run_id: RUN_ID, claim: 'a', non_claim: 'b', observations: [{ field: 'production_sha', value: '64c2b7c07' }] })
      .includes('OBSERVATION_WITHOUT_FRESHNESS'));
  report('a contradictory programme state is refused ON INGESTION',
    bad({ run_id: RUN_ID, claim: 'a', non_claim: 'b', programme_state: { state: 'HOLD', blockers: [] } })
      .includes('PROGRAMME_STATE:HOLD_WITHOUT_BLOCKER'));
  report('an orphan receipt naming an unknown run is refused',
    RECEIPT.validateReceipt({ run_id: 'r-0000000000', claim: 'a', non_claim: 'b' }, null)
      .violations.map((v) => v.code).includes('UNKNOWN_RUN'));

  // A refused receipt must leave the run UNTOUCHED — whole-or-nothing.
  const refused = RECEIPT.applyReceipt(run, { run_id: RUN_ID, claim: 'x' });
  report('a refused receipt is not partially applied',
    !refused.ok && refused.run.evidence === undefined && !refused.run.evidence_received);

  const good = {
    run_id: RUN_ID,
    branch: 'claude/jarvis-app-stabilization-1jwcen',
    candidate_sha: 'c70f6ee36',
    diff_summary: 'lib/voice/duplication.ts — added the duplication mechanism',
    tests: '12 passed, 0 failed',
    pr: 'https://github.com/soullabtech/sovereign/pull/1110',
    observations: [
      { field: 'production_sha', value: '64c2b7c07', freshness: 'CARRIED', verified_at: '2026-08-26T18:04:00Z', verified_by: 'prior deploy witness' },
      { field: 'candidate_sha', value: 'c70f6ee36', freshness: 'FRESH', verified_at: '2026-08-27T11:40:00Z', verified_by: 'gh api' },
    ],
    claim: 'The duplication mechanism is implemented and unit-tested on the candidate head.',
    non_claim: 'It has NOT been observed under production traffic, and PR #1110 build has not resolved.',
    next_boundary: 'VOICE-CAPTURE-01C — telemetry after merge',
    programme_state: {
      state: 'HOLD',
      blockers: [{ id: 'check:build', condition: "Required check 'build' is still in progress.", kind: 'PREREQUISITE' }],
      observations: [], adjudications: [],
    },
  };
  const applied = RECEIPT.applyReceipt(run, good, { at: '2026-08-27T12:00:00Z' });
  report('a well-formed receipt is accepted', applied.ok, JSON.stringify(applied.violations));
  report('evidence is stored SEPARATELY from what this console observed',
    applied.run.evidence.claim === good.claim && applied.run.task.description === C3_TASK.description);
  report('the console\'s own history is NOT rewritten by the worker\'s report',
    applied.run.state === RUNS.STATE.ROUTED_NOT_EXECUTED);

  await RUNS.saveRun(REPO_ROOT, applied.run);
  const rehydrated = (await RUNS.getRun(REPO_ROOT, RUN_ID)).run;
  report('the evidence survives a reopen too',
    rehydrated.evidence_received === true && rehydrated.evidence.pr.endsWith('/1110'));

  const d = RECEIPT.describeEvidence(rehydrated);
  report('the summary states the claim AND its bound',
    /NOT established/.test(d.summary) && d.non_claim.includes('has not resolved'), d.summary);
  report('next_boundary is PROPOSED, never issued',
    d.proposed_next.proposed_by === 'worker' && /founder act/.test(d.proposed_next.note));
  report('a carried observation in the receipt keeps its staleness through ingestion',
    d.observations.find((o) => o.field === 'production_sha').freshness_label === 'NOT RE-READ THIS RUN');

  // The whole loop, closed: the receipt's programme state drives the cockpit.
  const view = PS.deriveProgrammeState({
    unit: 'VOICE-CAPTURE-01B-OBS',
    blockers: [PS.blocker('check:build', "Required check 'build' is still in progress.", { kind: PS.KIND.PREREQUISITE })],
    observations: [PS.carried('production_sha', PS.observed('production_sha', '64c2b7c07', { by: 'prior deploy witness' }))],
  });
  report('the cockpit ends in HOLD with a NAMED blocker',
    view.state === 'HOLD' && view.blockers_summary[0] !== 'none' && PS.isConsistent(view), view.why);
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
