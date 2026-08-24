#!/usr/bin/env node
/**
 * Proof — JSL-00 (Learning Trace) + JSL-01 (Experience Memory).
 *
 * Runs entirely inside a throwaway AIN_DELEGATION_HOME. No worker session is
 * launched, no real trace is read or written, and no other builder module is
 * re-tested — their proven behaviour is reconciled with, not re-litigated.
 *
 * The load-bearing assertions are the REFUSALS. A ledger that records happily is
 * easy; what this proves is that the ledger refuses to launder a self-report
 * into evidence, refuses to carry an epistemic status of its own, and refuses to
 * propose a strong claim off a run of unverified successes.
 */
import { mkdtempSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

const TMP = mkdtempSync(path.join(os.tmpdir(), 'ain-jsl-proof-'));
const HOME = path.join(TMP, 'ain-delegation');
mkdirSync(HOME, { recursive: true });
process.env.AIN_DELEGATION_HOME = HOME;

// Imported AFTER the env var is set — these modules resolve HOME lazily, and this
// ordering is itself part of what makes that laziness necessary.
const { record, loadTrace, verifyTrace, validateEntry, TRACE_KIND_NAMES, EVIDENCE_KINDS } =
  await import('../jarvis-learning-trace.mjs');
const { query, strategyRecord, promotionCandidate, HEURISTIC_THRESHOLD } =
  await import('../jarvis-experience-memory.mjs');

let passed = 0, failed = 0;
const assert = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail && !cond) console.log(`          ${detail}`);
};
const refusalRules = (fn) => { try { fn(); return []; } catch (e) { return (e.refusals ?? []).map((r) => r.rule); } };

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== JSL-00 — the trace records experience, and only experience ===');
// ─────────────────────────────────────────────────────────────────────────────

const obs = record('wu-mic-arming', {
  kind: 'OBSERVATION', subsystem: 'voice', symptom: 'microphone stranded in ARMING',
  statement: 'mic never leaves ARMING after a denied permission prompt',
});
assert('an OBSERVATION is recorded with a derived step number', obs.step === 1 && obs.trace_id.startsWith('t-'));

const hyp = record('wu-mic-arming', {
  kind: 'HYPOTHESIS', subsystem: 'voice', symptom: 'microphone stranded in ARMING',
  strategy: 'add arming timeout',
  statement: 'ARMING has no timeout, so a denied prompt leaves the state machine parked',
});
assert('step increments from what is on disk, not from the caller', hyp.step === 2);

// J3 — the single most important refusal in JSL-00.
assert('J3 refuses a trace entry that carries its own epistemic status',
  refusalRules(() => record('wu-mic-arming', {
    kind: 'OBSERVATION', statement: 'x', status: 'PROVEN',
  })).includes('J3'));

// J1 — grounding is mandatory and never defaulted in either direction.
assert('J1 refuses an OUTCOME with no declared grounding',
  refusalRules(() => record('wu-mic-arming', {
    kind: 'OUTCOME', statement: 'it works now', outcome: 'CONFIRMED', bears_on: hyp.trace_id,
  })).includes('J1'));

assert('J1 refuses a VERIFIED outcome that cites no evidence',
  refusalRules(() => record('wu-mic-arming', {
    kind: 'OUTCOME', statement: 'it works now', outcome: 'CONFIRMED',
    grounding: 'VERIFIED', bears_on: hyp.trace_id,
  })).includes('J1'));

// J2 — lineage is checked against disk, so a typo is caught at write time.
assert('J2 refuses an OUTCOME with no antecedent',
  refusalRules(() => record('wu-mic-arming', {
    kind: 'OUTCOME', statement: 'y', outcome: 'REFUTED', grounding: 'SELF_REPORTED',
  })).includes('J2'));

assert('J2 refuses an OUTCOME whose antecedent is not in this trace',
  refusalRules(() => record('wu-mic-arming', {
    kind: 'OUTCOME', statement: 'y', outcome: 'REFUTED',
    grounding: 'SELF_REPORTED', bears_on: 't-deadbeef00',
  })).includes('J2'));

assert('J5 refuses evidence of a kind the epistemic guard cannot adjudicate',
  refusalRules(() => record('wu-mic-arming', {
    kind: 'OUTCOME', statement: 'y', outcome: 'REFUTED', grounding: 'VERIFIED',
    bears_on: hyp.trace_id, evidence: [{ kind: 'test_result', ref: 'x' }],
  })).includes('J5'));

assert('an unknown kind is refused rather than coerced',
  refusalRules(() => record('wu-mic-arming', { kind: 'LESSON', statement: 'x' })).includes('SHAPE'));

// A refused write must leave the ledger exactly as it was — fail closed, not partial.
assert('every refused write left the trace untouched', loadTrace('wu-mic-arming').length === 2,
  `expected 2 entries, found ${loadTrace('wu-mic-arming').length}`);

const out1 = record('wu-mic-arming', {
  kind: 'OUTCOME', bears_on: hyp.trace_id, strategy: 'add arming timeout',
  statement: 'timeout fires but the deny path still parks the machine',
  outcome: 'REFUTED', grounding: 'VERIFIED',
  evidence: [{ kind: 'executable_gate', ref: 'mic-lifecycle.test.ts::denied-prompt' }],
});
assert('a VERIFIED outcome citing evidence is recorded', out1.outcome === 'REFUTED');

record('wu-mic-arming', {
  kind: 'ABANDONMENT', bears_on: hyp.trace_id, strategy: 'add arming timeout',
  statement: 'dropped: a timeout treats the symptom, the deny path never emits a transition',
});

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== JSL-00 — verify reports the uncomfortable numbers ===');
// ─────────────────────────────────────────────────────────────────────────────

record('wu-mic-arming', {
  kind: 'HYPOTHESIS', subsystem: 'voice', statement: 'the deny path is missing a transition emit',
});
const v = verifyTrace('wu-mic-arming');
assert('verify separates verified from self-reported outcomes',
  v.outcomes_verified === 1 && v.outcomes_self_reported === 0);
assert('verify surfaces a hypothesis nobody ever tested', v.untested_hypotheses.length === 1);
assert('a well-formed trace reports structurally sound', v.structurally_sound === true);
assert('by_kind covers the whole closed taxonomy',
  TRACE_KIND_NAMES.every((k) => k in v.by_kind));
assert('validateEntry is callable without touching disk',
  validateEntry({ kind: 'OBSERVATION', statement: 'x' }).length === 0);

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== JSL-01 — prior experience is retrievable across Work Units ===');
// ─────────────────────────────────────────────────────────────────────────────

// A SECOND, later Work Unit walks into the same symptom under a different id.
// This is the whole reason JSL-01 exists.
const h2 = record('wu-voice-regression', {
  kind: 'HYPOTHESIS', subsystem: 'voice', symptom: 'microphone stranded in ARMING',
  strategy: 'add arming timeout', statement: 'maybe an arming timeout fixes it',
});
record('wu-voice-regression', {
  kind: 'OUTCOME', bears_on: h2.trace_id, strategy: 'add arming timeout',
  statement: 'same parked state as before', outcome: 'REFUTED', grounding: 'VERIFIED',
  evidence: [{ kind: 'runtime_route_trace', ref: 'voice-trace#arming' }],
});

const q = query({ symptom: 'microphone stranded in ARMING', subsystem: 'voice' });
assert('a later Work Unit finds the earlier episode by symptom', q.total === 2);
assert('results carry the episode outcomes, not just the matching line',
  q.results.every((r) => r.episode_outcomes.length > 0));
assert('the abandonment is surfaced so the dead end is not re-entered',
  q.results.some((r) => r.abandonments.length === 1));
assert('an unmatched query returns empty rather than a nearest guess',
  query({ symptom: 'postgres connection pool exhausted' }).total === 0);
assert('a query with no usable terms is refused, not silently matched to everything',
  (() => { try { query({}); return false; } catch { return true; } })());
assert('identical queries are deterministically ordered',
  JSON.stringify(query({ symptom: 'microphone stranded in ARMING' })) ===
  JSON.stringify(query({ symptom: 'microphone stranded in ARMING' })));

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== JSL-01 — self-report is recorded, and never counted ===');
// ─────────────────────────────────────────────────────────────────────────────

const h3 = record('wu-cache-a', {
  kind: 'HYPOTHESIS', subsystem: 'cache', strategy: 'memoize the loader',
  statement: 'memoizing the loader will cut turn latency',
});
record('wu-cache-a', {
  kind: 'OUTCOME', bears_on: h3.trace_id, strategy: 'memoize the loader',
  statement: 'felt faster', outcome: 'CONFIRMED', grounding: 'SELF_REPORTED',
});
const cache = strategyRecord('memoize the loader');
assert('a self-reported success is preserved in the record', cache.self_reported_confirmed === 1);
assert('a self-reported success contributes nothing to the verified counts',
  cache.verified_confirmed === 0 && cache.verified_refuted === 0);

const noClaim = promotionCandidate('memoize the loader');
assert('no claim is proposed from self-report alone', noClaim.eligible === false && noClaim.claim === null);

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== JSL-01 — promotion is a gate, not a writer ===');
// ─────────────────────────────────────────────────────────────────────────────

const timeout = strategyRecord('add arming timeout');
assert('a strategy record aggregates across every episode that tried it', timeout.episodes === 2);
assert('both refutations are verified', timeout.verified_refuted === HEURISTIC_THRESHOLD);

const heur = promotionCandidate('add arming timeout');
assert('repeated VERIFIED failure is proposed as a HEURISTIC', heur.proposed_status === 'HEURISTIC');
assert('the proposed heuristic carries its prior-instance count for the guard',
  heur.claim.prior_instances === HEURISTIC_THRESHOLD);
assert('the proposal never exceeds HEURISTIC', heur.claim.status === 'HEURISTIC');
assert('the proposal is a claim to adjudicate, not a recorded fact',
  /adjudicate/i.test(heur.next) && loadTrace('wu-mic-arming').every((e) => !('status' in e)));

// Verified SUCCESS is treated asymmetrically — the point of the whole design.
const s1 = record('wu-retry-a', {
  kind: 'HYPOTHESIS', strategy: 'bound the retry', statement: 'bounding retries stops the storm',
});
record('wu-retry-a', {
  kind: 'OUTCOME', bears_on: s1.trace_id, strategy: 'bound the retry',
  statement: 'storm stopped', outcome: 'CONFIRMED', grounding: 'VERIFIED',
  evidence: [{ kind: 'production_observation', ref: 'runtime_events#storm' }],
});
const s2 = record('wu-retry-b', {
  kind: 'HYPOTHESIS', strategy: 'bound the retry', statement: 'same fix, second incident',
});
record('wu-retry-b', {
  kind: 'OUTCOME', bears_on: s2.trace_id, strategy: 'bound the retry',
  statement: 'storm stopped again', outcome: 'CONFIRMED', grounding: 'VERIFIED',
  evidence: [{ kind: 'production_observation', ref: 'runtime_events#storm2' }],
});
const succ = promotionCandidate('bound the retry');
assert('repeated VERIFIED success is proposed only as HYPOTHESIS, never PROVEN',
  succ.proposed_status === 'HYPOTHESIS');
assert('the success proposal demands a discriminating test before it may rise',
  /discriminates?/i.test(succ.next));

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== the evidence vocabulary cannot silently drift from the guard ===');
// ─────────────────────────────────────────────────────────────────────────────
// JSL mirrors epistemic-guard.mjs's KNOWN_KINDS because that module has no
// main-module guard and cannot be imported. Discipline does not keep two lists in
// sync — this does. If the guard's vocabulary changes, this fails.
{
  const src = readFileSync(new URL('../epistemic-guard.mjs', import.meta.url), 'utf8');
  const weak = src.match(/const WEAK_KINDS = new Set\(\[([\s\S]*?)\]\)/);
  const known = src.match(/const KNOWN_KINDS = new Set\(\[([\s\S]*?)\]\)/);
  const lift = (m) => [...(m?.[1] ?? '').matchAll(/'([a-z_]+)'/g)].map((x) => x[1]);
  const guardKinds = [...new Set([...lift(weak), ...lift(known)])].sort();
  assert('the guard vocabulary was actually parsed (guards against a vacuous match)',
    guardKinds.length > 15, `parsed ${guardKinds.length} kinds`);
  assert('JSL EVIDENCE_KINDS is identical to the guard vocabulary',
    JSON.stringify([...EVIDENCE_KINDS].sort()) === JSON.stringify(guardKinds),
    `jsl=${[...EVIDENCE_KINDS].sort().join(',')}\n          guard=${guardKinds.join(',')}`);
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== end-to-end — a JSL proposal survives the REAL epistemic guard ===');
// ─────────────────────────────────────────────────────────────────────────────
// The integration is proved by running the actual gate, not by asserting that it
// would pass. An earlier revision of this module produced a claim the guard
// refused on two counts; only executing it surfaced that.
{
  const guardPath = new URL('../epistemic-guard.mjs', import.meta.url).pathname;
  const r = spawnSync(process.execPath,
    [guardPath, 'adjudicate', '--claim-json', JSON.stringify(heur.claim), '--json'],
    { encoding: 'utf8' });
  let j = null;
  try { j = JSON.parse(r.stdout); } catch { /* left null — asserted below */ }
  assert('the guard returned an adjudication', j !== null, r.stdout || r.stderr);
  assert('the guard does not refuse the JSL-proposed HEURISTIC',
    j?.verdict !== 'REFUSED', JSON.stringify(j?.refusals ?? []));
  assert('no cited evidence is non-probative for an unknown kind',
    !(j?.evidence_standing ?? []).some((e) => /unknown evidence kind/.test(e.reason ?? '')),
    JSON.stringify(j?.evidence_standing ?? []));
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== path safety ===');
// ─────────────────────────────────────────────────────────────────────────────
assert('a traversing work_unit_id is refused',
  (() => { try { record('../../escape', { kind: 'OBSERVATION', statement: 'x' }); return false; } catch { return true; } })());

rmSync(TMP, { recursive: true, force: true });
console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
