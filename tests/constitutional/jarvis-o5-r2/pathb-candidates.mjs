/**
 * JARVIS O5-R2C — Path B DEFEAT CANDIDATES.
 *
 * Each is the real classifier (scripts/builder/o5-recovery-path-b-v1.mjs) with
 * exactly one decision replaced by a plausible, competent, WRONG one.
 * A candidate that survives its named falsifier repairs the SUITE, never the
 * candidate. Lethality is decision-level, not implementation-independent.
 */
import * as REAL from '../../../scripts/builder/o5-recovery-path-b-v1.mjs';

const wrap = (id, law, named, classifyGrant, collateral = {}) => Object.freeze({
  id, law, named, collateral: Object.freeze(collateral),
  classifier: Object.freeze({
    classifyWorkUnit(facts) {
      if (facts.grants_unreadable) return REAL.classifyWorkUnit(facts);
      return (facts.grants || []).map((g) => classifyGrant(facts, g));
    },
  }),
});
const real = (facts, g) => REAL.classifyGrant(facts, g);
const witnessOf = (facts, g) => facts.results?.[g.grant.grant_id];

export const PB_CANDIDATES = Object.freeze([
  wrap('DC-B1', 'gate-then-retry: stops on the silent claim, but schedules an automatic reissue once the gate "clears"', 'PB-F1', (facts, g) => {
    const d = real(facts, g);
    return d.action === 'GATED' && d.phase === 'dispatched' ? { ...d, reissue_after: 'gate_cleared' } : d;
  }),

  wrap('DC-B2', 'consumed means finished: a CONSUMED grant with no witness is declared converged', 'PB-F2', (facts, g) => {
    const w = witnessOf(facts, g);
    if (g.standing === 'CONSUMED' && (!w || !w.present)) {
      return { work_unit_id: facts.work_unit_id, grant_id: g.grant.grant_id, action: 'CONVERGED', phase: 'ledgered', reason: 'GRANT_CONSUMED' };
    }
    return real(facts, g);
  }),

  wrap('DC-B3', 'lenient witness: any file present counts as the result, whatever it says or whether it parses', 'PB-F3', (facts, g) => {
    const w = witnessOf(facts, g);
    if (w?.present && (!w.readable || w.body?.work_unit_id !== facts.work_unit_id || w.body?.grant_id !== g.grant.grant_id || !w.digest)) {
      const patched = { ...facts, results: { ...facts.results, [g.grant.grant_id]: { present: true, readable: true, digest: w.digest ?? 'sha256:lenient', body: { ...(w.body || {}), work_unit_id: facts.work_unit_id, grant_id: g.grant.grant_id } } } };
      return real(patched, g);
    }
    return real(facts, g);
  }),

  wrap('DC-B4', 'blind authority: a witnessed result is recorded whatever the unit\'s live standing — "it already happened"', 'PB-F4', (facts, g) => {
    const d = real(facts, g);
    // Only AUTHORITY stops are ignored; evidence stops (unreadable, foreign) are kept —
    // the error modelled is "authority does not matter", not "evidence does not matter".
    if (d.action !== 'GATED' || d.phase !== 'unconverged' || d.gate !== 'NEEDS_OPERATOR_AUTHORITY') return d;
    const w = REAL.witnessStanding(facts, g.grant.grant_id);
    if (w.standing !== 'PRESENT') return d;
    return { ...d, action: 'RECORD', gate: undefined, phase: 'effect_witnessed', settle_grant: g.standing === 'CLAIMED', record: { durable_result: w.body, result_digest: w.digest, result_ref: REAL.resultRef(facts.work_unit_id, g.grant.grant_id) } };
  }),

  wrap('DC-B5', 'double record: convergence is not checked, so a ledgered result is recorded again', 'PB-F5', (facts, g) => {
    const d = real(facts, g);
    if (d.action !== 'CONVERGED') return d;
    const stripped = { ...facts, envelope: { ...facts.envelope, work_unit: { ...facts.envelope.work_unit, execution: { attempts: [], artifacts: [] } } } };
    return real(stripped, g);
  }),

  wrap('DC-B6', 'dead witness reader: every CLAIMED grant is treated as UNKNOWN without reading its durable result', 'PB-F6', (facts, g) => {
    const d = real(facts, g);
    if (d.action === 'RECORD' && g.standing === 'CLAIMED') return { ...d, action: 'GATED', gate: 'BLOCKED_BY_EVIDENCE', reason: 'CLAIMED_ASSUMED_UNKNOWN', record: undefined, phase: 'dispatched' };
    return d;
  }),

  wrap('DC-B7', 'inert caution: reads and names every stop truthfully, then defers every recovery to operator judgment — safety by refusing to recover', 'PB-F6', (facts, g) => {
    const d = real(facts, g);
    if (d.action === 'RECORD' || d.action === 'CONVERGED') {
      return { work_unit_id: facts.work_unit_id, grant_id: g.grant.grant_id, action: 'GATED', gate: 'NEEDS_OPERATOR_JUDGMENT', reason: 'RECOVERY_DEFERRED', phase: d.phase };
    }
    return d;
  }, {
    'PB-F5': 'a supervisor that never recovers cannot answer CONVERGED — recognising convergence and acting on it is recovering',
  }),

  wrap('DC-B8', 'unreadable as empty: an envelope that cannot be read is treated as a unit with nothing to recover', 'PB-F7', (facts, g) => {
    if (facts.envelope?.unreadable) return { work_unit_id: facts.work_unit_id, grant_id: g.grant.grant_id, action: 'NONE', reason: 'NO_ENVELOPE' };
    return real(facts, g);
  }),
]);
