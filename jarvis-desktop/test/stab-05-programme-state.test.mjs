#!/usr/bin/env node
// JARVIS-STAB — programme state consistency proof.
//
// Four invariants (founder ruling 2026-08-27), each proven POSITIVELY (the
// correct case is produced) and by SABOTAGE (the defective case is refused).
// The sabotage half is the load-bearing half: an invariant that is only ever
// exercised on well-formed input proves nothing about what it prevents.
//
// The scenario replayed throughout is the real one — PR #1110 at c70f6ee36:
// a superseded red Covenant run, a green re-run, and a Docker `build` check
// still in progress, which the defective report reduced to "BLOCKERS none".

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const P = require(path.join(HERE, '..', 'src', 'programme-state.js'));

let failures = 0;
const report = (name, ok, extra) => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? `\n        ${extra}` : ''}`);
};
const throws = (fn) => { try { fn(); return false; } catch { return true; } };

// ── The real PR #1110 check set ─────────────────────────────────────────────
const COVENANT_RED = { id: 101, created_at: '2026-08-27T10:00:00Z', run_attempt: 1, status: 'completed', conclusion: 'failure' };
const COVENANT_GREEN = { id: 102, created_at: '2026-08-27T11:30:00Z', run_attempt: 1, status: 'completed', conclusion: 'success' };
const BUILD_RUNNING = { id: 201, created_at: '2026-08-27T11:35:00Z', run_attempt: 1, status: 'in_progress', conclusion: null };
const SOVEREIGNTY_OK = { id: 301, created_at: '2026-08-27T11:31:00Z', run_attempt: 1, status: 'completed', conclusion: 'success' };

const REQUIRED = ['Covenant', 'build', 'sovereignty'];

console.log('\n── Invariant 4: adjudicate before reducing ─────────────────────');

const cov = P.adjudicateRuns('Covenant', [COVENANT_RED, COVENANT_GREEN]);
report('superseded red + later green adjudicates to success',
  cov.adjudicated === true && cov.conclusion === 'success', JSON.stringify(cov));
report('the supersession is REPORTED, not silently applied',
  cov.contradiction === true && cov.superseded.length === 1 && /supersedes/.test(cov.basis), cov.basis);
report('order of presentation does not change the verdict',
  P.adjudicateRuns('Covenant', [COVENANT_GREEN, COVENANT_RED]).conclusion === 'success');

// SABOTAGE: two disagreeing runs that ordering cannot separate must REFUSE.
const tie = P.adjudicateRuns('build', [
  { id: 1, created_at: '2026-08-27T12:00:00Z', run_attempt: 1, status: 'completed', conclusion: 'failure' },
  { id: 2, created_at: '2026-08-27T12:00:00Z', run_attempt: 1, status: 'completed', conclusion: 'success' },
]);
report('unorderable contradiction refuses rather than choosing',
  tie.adjudicated === false && tie.conclusion === 'indeterminate' && tie.authoritative === null, JSON.stringify(tie));

report('a re-run attempt supersedes its own earlier attempt',
  P.adjudicateRuns('build', [
    { id: 9, created_at: '2026-08-27T12:00:00Z', run_attempt: 1, status: 'completed', conclusion: 'failure' },
    { id: 9, created_at: '2026-08-27T12:00:00Z', run_attempt: 2, status: 'completed', conclusion: 'success' },
  ]).conclusion === 'success');

report('in_progress reads as pending, never as failure',
  P.adjudicateRuns('build', [BUILD_RUNNING]).conclusion === 'pending');

console.log('\n── Invariants 1 + 2: HOLD ⇄ BLOCKERS are one fact ──────────────');

const adjudications = [
  cov,
  P.adjudicateRuns('build', [BUILD_RUNNING]),
  P.adjudicateRuns('sovereignty', [SOVEREIGNTY_OK]),
];
const blockers = P.blockersFromChecks(adjudications, { required: REQUIRED });

report('the running required check produces exactly one blocker',
  blockers.length === 1 && blockers[0].id === 'check:build', JSON.stringify(blockers));
report('a green adjudicated check produces no blocker',
  !blockers.some((b) => b.id === 'check:Covenant' || b.id === 'check:sovereignty'));

const view = P.deriveProgrammeState({
  unit: 'VOICE-CAPTURE-01B-OBS',
  blockers,
  observations: [],
});

// THE DEFECT, DIRECTLY: the report that said HOLD and "BLOCKERS none".
report('STATE is HOLD',
  view.state === P.HOLD, view.state);
report('BLOCKERS is NOT none — the 2026-08-27 contradiction cannot occur',
  view.blockers.length === 1
  && view.blockers_summary.length === 1
  && view.blockers_summary[0] !== 'none'
  && /in progress/i.test(view.blockers_summary[0]), JSON.stringify(view.blockers_summary));
report('the blocker names an observable resolution condition',
  view.blockers[0].resolves_when && view.blockers[0].kind === P.KIND.PREREQUISITE);
report('action is NO ACTION while held',
  /NO ACTION/.test(view.action), view.action);

// SABOTAGE: state cannot be authored, so the contradiction is unrepresentable.
report('deriveProgrammeState ignores any caller-supplied state',
  P.deriveProgrammeState({ blockers, state: 'ADVANCE' }).state === P.HOLD);

// The clean case still advances — an invariant that never permits action is
// not an invariant, it is a brake.
const clear = P.deriveProgrammeState({
  unit: 'VOICE-CAPTURE-01B-OBS',
  blockers: P.blockersFromChecks(
    [cov, P.adjudicateRuns('build', [{ id: 201, created_at: '2026-08-27T12:00:00Z', status: 'completed', conclusion: 'success' }]),
      P.adjudicateRuns('sovereignty', [SOVEREIGNTY_OK])],
    { required: REQUIRED }),
});
report('all-green derives ADVANCE with blockers none',
  clear.state === P.ADVANCE && clear.blockers.length === 0 && clear.blockers_summary[0] === 'none', clear.why);

// SABOTAGE: a blocker that names nothing observable is refused at construction.
report('blocker("none") is refused', throws(() => P.blocker('x', 'none')));
report('blocker("") is refused', throws(() => P.blocker('x', '')));
report('blocker("unknown") is refused', throws(() => P.blocker('x', 'unknown')));
report('blocker("pending") is refused', throws(() => P.blocker('x', 'pending')));
report('a real condition is accepted',
  P.blocker('check:build', "Required check 'build' is still in progress.").kind === P.KIND.PREREQUISITE);

console.log('\n── Invariant 3: carried ≠ current, carried ≠ unknown ───────────');

const prodPrior = P.observed('production_sha', '64c2b7c07', { at: '2026-08-26T18:04:00Z', by: 'prior deploy witness' });
const prodNow = P.carried('production_sha', prodPrior);

report('a carried value PRESERVES the last verified SHA',
  prodNow.value === '64c2b7c07', JSON.stringify(prodNow));
report('a carried value is marked NOT re-read',
  prodNow.freshness === P.FRESHNESS.CARRIED
  && P.describeObservation(prodNow).freshness_label === 'NOT RE-READ THIS RUN');
report('carried provenance is inherited, never restamped',
  prodNow.verified_at === '2026-08-26T18:04:00Z' && prodNow.verified_by === 'prior deploy witness');
report('a carried value must be re-verified before it is acted on',
  P.describeObservation(prodNow).must_reverify_before_acting === true);
report('a fresh value is not flagged for re-verification',
  P.describeObservation(P.observed('candidate_sha', 'c70f6ee36', { by: 'gh api' })).must_reverify_before_acting === false);

// SABOTAGE: never-observed must NOT masquerade as carried.
const never = P.carried('production_sha', null);
report('never-observed stays distinct from carried',
  never.freshness === P.FRESHNESS.NEVER_OBSERVED && never.value === null);
report('never-observed renders as "never", not as a stale value',
  P.describeObservation(never).last_verified === 'never'
  && P.describeObservation(never).value === '—');

// A required fact nobody ever read is itself a blocker.
const unread = P.deriveProgrammeState({
  observations: [{ ...never, required_before_advance: true }],
});
report('a required never-observed value forces HOLD',
  unread.state === P.HOLD && unread.blockers[0].kind === P.KIND.UNOBSERVED, JSON.stringify(unread.blockers_summary));
report('a required CARRIED value does not by itself force HOLD',
  P.deriveProgrammeState({ observations: [{ ...prodNow, required_before_advance: true }] }).state === P.ADVANCE);

console.log('\n── auditStateBlock: refuse contradictions arriving from outside ─');

// The exact defective block, as it would arrive in a Claude Code receipt.
const defective = { state: 'HOLD', blockers: [], observations: [], adjudications: [] };
const vio = P.auditStateBlock(defective);
report('the 2026-08-27 report block is REFUSED on ingestion',
  vio.some((x) => x.code === 'HOLD_WITHOUT_BLOCKER'), JSON.stringify(vio));
report('a derived block audits clean',
  P.isConsistent(view) && P.isConsistent(clear));

report('advancing past a live blocker is refused',
  P.auditStateBlock({ state: 'ADVANCE', blockers: [view.blockers[0]] })
    .some((x) => x.code === 'ADVANCE_WITH_UNRESOLVED_BLOCKER'));
report('a blocker naming nothing observable is refused',
  P.auditStateBlock({ state: 'HOLD', blockers: [{ id: 'x', condition: 'none' }] })
    .some((x) => x.code === 'BLOCKER_NOT_CONCRETE'));
report('an observation with no freshness marker is refused',
  P.auditStateBlock({ state: 'ADVANCE', blockers: [], observations: [{ field: 'production_sha', value: '64c2b7c07' }] })
    .some((x) => x.code === 'OBSERVATION_WITHOUT_FRESHNESS'));
report('CARRIED with no preserved value is refused',
  P.auditStateBlock({ state: 'ADVANCE', blockers: [], observations: [{ field: 'p', value: null, freshness: 'CARRIED' }] })
    .some((x) => x.code === 'CARRIED_WITHOUT_VALUE'));
report('an unadjudicated contradiction is refused',
  P.auditStateBlock({ state: 'ADVANCE', blockers: [], adjudications: [{ check: 'Covenant', contradiction: true, adjudicated: false, conclusion: 'failure' }] })
    .some((x) => x.code === 'UNADJUDICATED_CONTRADICTION'));
report('an unknown state value is refused',
  P.auditStateBlock({ state: 'WAITING', blockers: [] }).some((x) => x.code === 'UNKNOWN_STATE'));

console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
