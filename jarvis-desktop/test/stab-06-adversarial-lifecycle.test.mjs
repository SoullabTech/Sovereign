#!/usr/bin/env node
// JARVIS-STAB-06 — adversarial integration proof of the WHOLE lifecycle.
//
// The unit proofs (stab-01-04, stab-05) each establish that a part behaves. This
// one attacks the parts as a chain, because the failures that matter in a
// conductor are seam failures: evidence that ingests against the wrong base, a
// corruption that half-applies, a stale fact that quietly becomes current
// somewhere between one subsystem and the next.
//
// WHAT IS REAL HERE
//   · the canonical store — real files, real atomic writes (AIN_DELEGATION_HOME
//     is redirected to a temp dir so a founder's history is never touched)
//   · the restart — a genuinely separate node process reads the run back. An
//     in-process re-read would prove the object still exists, which is not the
//     claim; the claim is that it survives the process dying.
//   · the SHAs — a real git repository with real commits, so abbreviation
//     handling is exercised on real 40-char and 7-char forms rather than on
//     fixtures chosen to match.
//
// WHAT IS NOT EXERCISED, STATED SO IT IS NOT ASSUMED
//   main.js's IPC handlers are Electron-resident and are not invoked here; this
//   proves the modules they call, wired as they wire them. `readSubstrateVersion`
//   is stood in for by the same `git rev-parse` it shells out to.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const REPO_ROOT = path.resolve(DESKTOP, '..');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-adv-'));
const AIN = path.join(TMP, 'ain');
const GITREPO = path.join(TMP, 'tree');
process.env.AIN_DELEGATION_HOME = AIN;

const require = createRequire(import.meta.url);
const RUNS = require(path.join(DESKTOP, 'src', 'task-runs.js'));
const PS = require(path.join(DESKTOP, 'src', 'programme-state.js'));
const PACKET = require(path.join(DESKTOP, 'src', 'execution-packet.js'));
const RECEIPT = require(path.join(DESKTOP, 'src', 'evidence-receipt.js'));
const SHA = require(path.join(DESKTOP, 'src', 'sha-resolve.js'));

let failures = 0;
const report = (name, ok, extra) => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? `\n        ${extra}` : ''}`);
};
const phase = (n) => console.log(`\n── ${n} ${'─'.repeat(Math.max(0, 62 - n.length))}`);

// ── a real git tree, for real SHAs ──────────────────────────────────────────
const git = (...args) => execFileSync('git', args, { cwd: GITREPO, encoding: 'utf8' }).trim();
fs.mkdirSync(GITREPO, { recursive: true });
execFileSync('git', ['init', '-q', GITREPO]);
git('config', 'user.email', 'proof@local');
git('config', 'user.name', 'proof');
git('commit', '-q', '--allow-empty', '-m', 'A');
const BASE_A_FULL = git('rev-parse', 'HEAD');
const BASE_A = git('rev-parse', '--short', 'HEAD');

const resolve = SHA.makeResolver(GITREPO);

const TASK = { description: 'Wire the duplication mechanism for VOICE-CAPTURE-01B-OBS' };
const DECISION = {
  execution_lane: 'C3', cost_class: 'frontier_model', status: 'routed',
  reason: 'No deterministic capability matched; requires frontier-model reasoning.',
  verification_required: true,
};

// ═══════════════════════════════════════════════════════════════════════════
phase('1  create run → persist');
const opened = await RUNS.openRun(REPO_ROOT, { task: TASK, decision: DECISION, capabilityNames: ['ReadFile'], app_build_sha: '4f0d2289f' });
report('the store is the real canonical one, not a stand-in', opened.custody, opened.reason);
const RUN_ID = opened.run.run_id;
RUNS.transition(opened.store, opened.run, RUNS.STATE.ROUTED_NOT_EXECUTED, { result: { note: 'C3 selected.' } });
report('run persisted to disk', fs.existsSync(path.join(AIN, 'runtime', 'runs', `${RUN_ID}.json`)));

// ═══════════════════════════════════════════════════════════════════════════
phase('2  quit Desktop → restart → reconstruct');
// A genuinely separate process. Nothing from this one is in scope for it.
const childOut = execFileSync(process.execPath, ['-e', `
  process.env.AIN_DELEGATION_HOME = ${JSON.stringify(AIN)};
  const RUNS = require(${JSON.stringify(path.join(DESKTOP, 'src', 'task-runs.js'))});
  RUNS.listRuns(${JSON.stringify(REPO_ROOT)}, { limit: 50 }).then((r) => {
    const run = r.runs.find((x) => x.run_id === ${JSON.stringify(RUN_ID)});
    process.stdout.write(JSON.stringify({ custody: r.custody, total: r.total, run, determinism: r.determinism }));
  });
`], { encoding: 'utf8', env: { ...process.env, AIN_DELEGATION_HOME: AIN } });
const fresh = JSON.parse(childOut);
report('a NEW process finds the run', !!fresh.run, childOut.slice(0, 200));
report('the exact task survives the restart', JSON.stringify(fresh.run.task) === JSON.stringify(TASK));
report('lane survives', fresh.run.lane === 'C3');
report('status survives', fresh.run.state === RUNS.STATE.ROUTED_NOT_EXECUTED, fresh.run.state);
report('result survives', fresh.run.result.note === 'C3 selected.');
report('routing fingerprint survives', fresh.run.routing_fingerprint === opened.run.routing_fingerprint);
report('determinism is auditable from the restarted process', fresh.determinism.deterministic, JSON.stringify(fresh.determinism));
report('nothing is blank or reset', !!(fresh.run.created_at && fresh.run.reason && fresh.run.app_build_sha));

// ═══════════════════════════════════════════════════════════════════════════
phase('3  produce C3 handoff against base A');
const run = (await RUNS.getRun(REPO_ROOT, RUN_ID)).run;
const rp = await RUNS.receiptPath(REPO_ROOT, RUN_ID);
const STALE_PROD = PS.observed('production_sha', '64c2b7c07', { at: '2026-08-26T18:04:00Z', by: 'prior deploy witness' });

const pkt = PACKET.buildPacket({
  run_id: RUN_ID, unit: 'VOICE-CAPTURE-01B-OBS', task: run.task, lane: run.lane, reason: run.reason,
  canonical_sha: PS.carried('canonical_sha', PS.observed('canonical_sha', '64c2b7c07', { at: '2026-08-26T18:04:00Z', by: 'prior deploy witness' })),
  production_sha: PS.carried('production_sha', STALE_PROD),
  candidate_sha: PS.observed('candidate_sha', BASE_A, { at: new Date().toISOString(), by: 'git HEAD' }),
  allowed: ['lib/voice/**'], forbidden: ['no schema changes'],
  acceptance: ['duplication mechanism covered by a test'], stop_condition: 'PR #1110 build resolves',
  receipt_path: rp.path,
});
const text = PACKET.renderPacket(pkt);
await RUNS.writeHandoffPacket(REPO_ROOT, RUN_ID, text);
run.handoff = {
  issued_at: new Date().toISOString(), receipt_path: rp.path, unit: pkt.unit,
  bases: { canonical_sha: pkt.canonical_sha.value, production_sha: pkt.production_sha.value, candidate_sha: pkt.candidate_sha.value },
};
await RUNS.saveRun(REPO_ROOT, run, 'handoff_issued');

report('the packet is issued against the real base A', pkt.candidate_sha.value === BASE_A);
report('the issued base is RECORDED on the run, not only in the text',
  (await RUNS.getRun(REPO_ROOT, RUN_ID)).run.handoff.bases.candidate_sha === BASE_A);
report('the packet demands base_sha back', /base_sha/.test(text));
report('the stale production fact travels as CARRIED, with provenance',
  pkt.production_sha.freshness === 'CARRIED' && /NOT RE-READ THIS RUN/.test(text) && text.includes('prior deploy witness'));

// ═══════════════════════════════════════════════════════════════════════════
phase('4  deliberately corrupt receipts → rejection is atomic');
const issued = (await RUNS.getRun(REPO_ROOT, RUN_ID)).run;
const VALID = {
  run_id: RUN_ID, base_sha: BASE_A_FULL,   // full SHA against a short packet base
  branch: 'claude/jarvis-app-stabilization-1jwcen', candidate_sha: 'c70f6ee36',
  diff_summary: 'lib/voice/duplication.ts', tests: '12 passed, 0 failed',
  pr: 'https://github.com/soullabtech/sovereign/pull/1110',
  observations: [{ field: 'production_sha', value: '64c2b7c07', freshness: 'CARRIED', verified_at: '2026-08-26T18:04:00Z', verified_by: 'prior deploy witness' }],
  claim: 'The duplication mechanism is implemented and unit-tested.',
  non_claim: 'NOT observed under production traffic; PR #1110 build has not resolved.',
  next_boundary: 'VOICE-CAPTURE-01C — telemetry after merge',
  programme_state: { state: 'HOLD', blockers: [{ id: 'check:build', condition: "Required check 'build' is still in progress.", kind: 'PREREQUISITE' }], observations: [], adjudications: [] },
};
const codes = (r) => RECEIPT.validateReceipt(r, issued, { resolve }).violations.map((v) => v.code);
const CORRUPTIONS = [
  ['no non_claim', (() => { const { non_claim, ...r } = VALID; return r; })(), 'MISSING_REQUIRED_FIELD'],
  ['empty non_claim', { ...VALID, non_claim: '   ' }, 'MISSING_REQUIRED_FIELD'],
  ['no base_sha', (() => { const { base_sha, ...r } = VALID; return r; })(), 'MISSING_BASE_SHA'],
  ['base_sha naming a ref, not a commit', { ...VALID, base_sha: 'main' }, 'BASE_SHA_MALFORMED'],
  ['observation with no freshness', { ...VALID, observations: [{ field: 'production_sha', value: '64c2b7c07' }] }, 'OBSERVATION_WITHOUT_FRESHNESS'],
  ['CARRIED with no value', { ...VALID, observations: [{ field: 'p', value: null, freshness: 'CARRIED' }] }, 'CARRIED_WITHOUT_VALUE'],
  ['HOLD with no blockers', { ...VALID, programme_state: { state: 'HOLD', blockers: [] } }, 'PROGRAMME_STATE:HOLD_WITHOUT_BLOCKER'],
  ['blocker naming nothing', { ...VALID, programme_state: { state: 'HOLD', blockers: [{ id: 'x', condition: 'none' }] } }, 'PROGRAMME_STATE:BLOCKER_NOT_CONCRETE'],
  ['run_id for a different run', { ...VALID, run_id: 'r-0000000000' }, 'RUN_MISMATCH'],
];
for (const [label, bad, expect] of CORRUPTIONS) {
  report(`corrupt receipt refused — ${label}`, codes(bad).includes(expect), codes(bad).join(', '));
  const applied = RECEIPT.applyReceipt(issued, bad, { resolve });
  report(`  …and nothing was applied — ${label}`,
    !applied.ok && applied.run.evidence === undefined && !applied.run.evidence_received);
}
const onDiskAfterCorruption = (await RUNS.getRun(REPO_ROOT, RUN_ID)).run;
report('after 9 rejected receipts the stored run is UNCHANGED',
  onDiskAfterCorruption.evidence === undefined && onDiskAfterCorruption.state === RUNS.STATE.ROUTED_NOT_EXECUTED);

// ═══════════════════════════════════════════════════════════════════════════
phase('5  THE NASTY CASE: head moves between handoff and return');
git('commit', '-q', '--allow-empty', '-m', 'B');
const BASE_B = git('rev-parse', '--short', 'HEAD');
report('the tree really moved', BASE_B !== BASE_A, `${BASE_A} -> ${BASE_B}`);

const drifted0 = RECEIPT.applyReceipt(issued, VALID, { at: '2026-08-27T12:00:00Z', current_base: BASE_B, resolve });
const drifted = { ...drifted0, run: RECEIPT.confirmCurrency(drifted0.run, { base_before: BASE_B, base_after: BASE_B, resolve }) };
drifted.ok = drifted0.ok; drifted.violations = drifted0.violations;
report('the receipt is still ACCEPTED — the work was really done', drifted.ok, JSON.stringify(drifted.violations));
report('but it is NOT current evidence about the tree', drifted.run.evidence.currency === 'HISTORICAL', drifted.run.evidence.currency);
report('it names the base it IS evidence about', drifted.run.evidence.base_drift.issued_against === BASE_A);
report('and the base it is NOT evidence about', drifted.run.evidence.base_drift.current_base === BASE_B);
report('identity is RESOLVED, not prefix-matched: full SHA == short SHA',
  SHA.compareIdentity(BASE_A_FULL, BASE_A, resolve).verdict === 'SAME');
report('an unresolvable abbreviation is UNKNOWN, never assumed same',
  SHA.compareIdentity('deadbeef', BASE_A, resolve).verdict === 'UNKNOWN');
report('a ref name is refused as a base identity',
  SHA.makeResolver(GITREPO)('main').outcome === 'MALFORMED');
const recon = RECEIPT.reconciliationBlockers(drifted.run, PS);
report('drift raises a CONCRETE reconciliation blocker', recon.length === 1 && PS.isConcreteCondition(recon[0].condition), JSON.stringify(recon));
report('the summary cannot be read without its base', /EVIDENCE ABOUT .*NOT THE CURRENT HEAD/.test(RECEIPT.describeEvidence(drifted.run).summary));
const heldByDrift = PS.deriveProgrammeState({ unit: pkt.unit, blockers: recon });
report('the programme cannot advance on historical evidence', heldByDrift.state === 'HOLD' && PS.isConsistent(heldByDrift), heldByDrift.why);
report('an unreadable head is UNVERIFIED, never assumed current',
  RECEIPT.applyReceipt(issued, VALID, { current_base: null, resolve }).run.evidence.currency === 'UNVERIFIED');
await RUNS.saveRun(REPO_ROOT, drifted.run, 'evidence_received');
report('the drift verdict survives to disk',
  (await RUNS.getRun(REPO_ROOT, RUN_ID)).run.evidence.currency === 'HISTORICAL');

// ═══════════════════════════════════════════════════════════════════════════
phase('6  ingest a receipt whose base IS current');
const r2 = await RUNS.openRun(REPO_ROOT, { task: { description: 'second unit' }, decision: DECISION, capabilityNames: ['ReadFile'] });
r2.run.handoff = { issued_at: new Date().toISOString(), bases: { candidate_sha: BASE_B }, unit: 'VOICE-CAPTURE-01C' };
RUNS.transition(r2.store, r2.run, RUNS.STATE.ROUTED_NOT_EXECUTED, {});
const clean0 = RECEIPT.applyReceipt(r2.run, { ...VALID, run_id: r2.run.run_id, base_sha: BASE_B }, { current_base: BASE_B, resolve });
report('provisional currency is never displayed as settled',
  clean0.run.evidence.currency_confirmed === false && RECEIPT.describeEvidence(clean0.run).currency === 'UNCONFIRMED');
const clean = { ok: clean0.ok, run: RECEIPT.confirmCurrency(clean0.run, { base_before: BASE_B, base_after: BASE_B, resolve }) };
report('a receipt on the current base ingests as CURRENT', clean.ok && clean.run.evidence.currency === 'CURRENT');
report('and raises no reconciliation blocker', RECEIPT.reconciliationBlockers(clean.run, PS).length === 0);
report("the console's own history is not rewritten by the worker", clean.run.state === RUNS.STATE.ROUTED_NOT_EXECUTED);
report('next_boundary is proposed, never issued', RECEIPT.describeEvidence(clean.run).proposed_next.proposed_by === 'worker');
await RUNS.saveRun(REPO_ROOT, clean.run, 'evidence_received');

// ═══════════════════════════════════════════════════════════════════════════
phase('7  the stale production fact stays CARRIED across the whole chain');
const carriedBack = RECEIPT.describeEvidence((await RUNS.getRun(REPO_ROOT, r2.run.run_id)).run)
  .observations.find((o) => o.field === 'production_sha');
report('production is still 64c2b7c07 — preserved, not erased', carriedBack.value === '64c2b7c07');
report('still marked NOT RE-READ after packet → worker → receipt → store → reload',
  carriedBack.freshness_label === 'NOT RE-READ THIS RUN', JSON.stringify(carriedBack));
report('still attributed to the observation that made it', /prior deploy witness/.test(carriedBack.last_verified));
report('still flagged for re-verification before it is acted on', carriedBack.must_reverify_before_acting === true);

// ═══════════════════════════════════════════════════════════════════════════
phase('8  observable blocker → HOLD → superseded → ADVANCE');
const BUILD_RUNNING = { id: 201, created_at: '2026-08-27T11:35:00Z', run_attempt: 1, status: 'in_progress', conclusion: null };
const COV_RED = { id: 101, created_at: '2026-08-27T10:00:00Z', run_attempt: 1, status: 'completed', conclusion: 'failure' };
const COV_GREEN = { id: 102, created_at: '2026-08-27T11:30:00Z', run_attempt: 1, status: 'completed', conclusion: 'success' };
const REQ = ['Covenant', 'build'];

const adj1 = [PS.adjudicateRuns('Covenant', [COV_RED, COV_GREEN]), PS.adjudicateRuns('build', [BUILD_RUNNING])];
const held = PS.deriveProgrammeState({ unit: pkt.unit, blockers: PS.blockersFromChecks(adj1, { required: REQ }) });
report('a running required check makes STATE HOLD', held.state === 'HOLD');
report('and BLOCKERS names it — never "none"', held.blockers_summary[0] !== 'none' && /in progress/i.test(held.blockers_summary[0]), JSON.stringify(held.blockers_summary));
report('the superseded red Covenant run does NOT become a blocker', !held.blockers.some((b) => b.id === 'check:Covenant'));
report('the supersession is visible, not silent', adj1[0].contradiction && /supersedes/.test(adj1[0].basis), adj1[0].basis);
report('this state block audits clean', PS.isConsistent(held));

// later ordered evidence resolves it
const BUILD_GREEN = { id: 201, created_at: '2026-08-27T12:10:00Z', run_attempt: 2, status: 'completed', conclusion: 'success' };
const adj2 = [PS.adjudicateRuns('Covenant', [COV_RED, COV_GREEN]), PS.adjudicateRuns('build', [BUILD_RUNNING, BUILD_GREEN])];
report('a later ordered run supersedes the pending one', adj2[1].conclusion === 'success' && adj2[1].superseded.length === 1);
const advanced = PS.deriveProgrammeState({ unit: pkt.unit, blockers: PS.blockersFromChecks(adj2, { required: REQ }) });
report('STATE becomes ADVANCE with blockers none', advanced.state === 'ADVANCE' && advanced.blockers_summary[0] === 'none', advanced.why);
report('an out-of-order presentation reaches the same verdict',
  PS.deriveProgrammeState({ blockers: PS.blockersFromChecks([PS.adjudicateRuns('build', [BUILD_GREEN, BUILD_RUNNING])], { required: ['build'] }) }).state === 'ADVANCE');

// ═══════════════════════════════════════════════════════════════════════════
phase('9  finish the run — and prove the lifecycle is reconstructable');
const last = await RUNS.listRuns(REPO_ROOT, { limit: 50 });
report('both runs are in durable history', last.total === 2, String(last.total));
report('the drifted run still reads HISTORICAL', last.runs.find((r) => r.run_id === RUN_ID).evidence.currency === 'HISTORICAL');
report('the clean run still reads CURRENT', last.runs.find((r) => r.run_id === r2.run.run_id).evidence.currency === 'CURRENT');
report('routing determinism holds across the whole lifecycle', last.determinism.deterministic, JSON.stringify(last.determinism.violations));

const events = fs.readFileSync(path.join(AIN, 'runtime', 'events.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const kinds = events.filter((e) => e.run_id === RUN_ID).map((e) => e.kind);
report('the append-only log reconstructs the lifecycle in order',
  kinds.join(' → ').includes('routed → transition → handoff_packet_written → handoff_issued → evidence_received'),
  kinds.join(' → '));
report('every event is attributed to the router surface', events.every((e) => e.surface === 'router'));

fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
