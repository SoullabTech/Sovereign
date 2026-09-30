/**
 * JARVIS O5-R3 — reference doubles, CURRENT-CODE adapter (Class A) and defeat
 * candidates for the reason-code and settlement falsifiers.
 *
 * ⛔ The references are test doubles that prove mutual satisfiability, never
 * implementations. REASON_CURRENT is the live classifier, used only as Class A
 * evidence by the unfrozen matrix.
 *
 * ⚠️ Candidates wrap the LIVE classifier (decision-level lethality), so each one
 * forces its wrong decision regardless of what the live classifier does: DC-C1
 * maps the honest reason back to today's label, so it stays known-bad after the
 * classifier is repaired.
 */
import * as REAL_CLASSIFIER from '../../../scripts/builder/o5-recovery-path-b-v1.mjs';

// ── Reason code ────────────────────────────────────────────────────────────────
const lifecycleOf = (fx) => fx?.envelope?.work_unit?.state?.lifecycle_state;
const noWitness = (fx, grantId) => !fx?.results?.[grantId] || fx.results[grantId].present === false;

export function relabel(classify, { anyLifecycle = false, act = false } = {}) {
  return {
    classifyWorkUnit(fx) {
      return classify(fx).map((d) => {
        const g = fx.grants?.find((x) => x.grant?.grant_id === d.grant_id);
        const eligible = g?.standing === 'CLAIMED' && noWitness(fx, d.grant_id)
          && (anyLifecycle ? d.action === 'GATED' : lifecycleOf(fx) === 'ROUTED' && d.reason === 'W2_NOT_EXECUTING');
        if (!eligible) return d;
        const out = { ...d, reason: 'CLAIMED_NEVER_DISPATCHED', phase: 'never_dispatched' };
        return act ? { ...out, action: 'RETIRE', retire_grant: true } : out;
      });
    },
  };
}

export const REASON_REFERENCE = relabel(REAL_CLASSIFIER.classifyWorkUnit);
export const REASON_CURRENT = REAL_CLASSIFIER;

export const REASON_CANDIDATES = Object.freeze([
  { id: 'DC-C1', named: 'R3-C1', law: 'today\'s label, pinned: a proven-undispatched grant is labelled "authority no longer sufficient"',
    subject: { classifyWorkUnit: (fx) => REAL_CLASSIFIER.classifyWorkUnit(fx).map((d) => (d.reason === 'CLAIMED_NEVER_DISPATCHED' ? { ...d, reason: 'W2_NOT_EXECUTING', phase: 'unconverged' } : d)) },
    collateral: {} },
  // FREEZE AMENDMENT 1 (founder act, 2026-09-30): the subject formerly wrapped the LIVE classifier
  // and acted only on today's label, so it became conforming once the classifier was corrected.
  // Law, falsifier and expected death unchanged; the wrong decision is now pinned to the honest label.
  { id: 'DC-C2', named: 'R3-C2', law: 'relabel AND retire: the absence proof is used as licence to act',
    subject: { classifyWorkUnit: (fx) => REASON_REFERENCE.classifyWorkUnit(fx).map((d) => (d.reason === 'CLAIMED_NEVER_DISPATCHED' ? { ...d, action: 'RETIRE', retire_grant: true } : d)) },
    collateral: {} },
  { id: 'DC-C3', named: 'R3-C3', law: 'never-dispatched whenever there is no witness, whatever the lifecycle',
    subject: relabel(REAL_CLASSIFIER.classifyWorkUnit, { anyLifecycle: true }), collateral: {} },
]);

// ── Settlement surfacing ───────────────────────────────────────────────────────
export const SETTLEMENT_REFERENCE = Object.freeze({
  finish({ consume, appendW4 }) {
    const c = consume();
    const w4 = appendW4();
    return { w4, settlement: c?.ok ? { settled: true } : { settled: false, reason: c?.reason ?? 'UNKNOWN' } };
  },
  abort({ invalidate }) {
    const r = invalidate();
    return { invalidation: r?.ok ? { recorded: true } : { recorded: false, reason: r?.reason ?? 'UNKNOWN' } };
  },
});

/** The shape canonicalConfirmAuthorizedExecution has today: both returns ignored. */
const IGNORES = Object.freeze({
  finish({ consume, appendW4 }) { consume(); return { w4: appendW4(), settlement: { settled: true } }; },
  abort({ invalidate }) { invalidate(); return { invalidation: { recorded: true } }; },
});

export const SETTLEMENT_CANDIDATES = Object.freeze([
  { id: 'DC-S1', named: 'R3-S1', law: 'the consume return is ignored (today\'s B7)',
    subject: { finish: IGNORES.finish, abort: SETTLEMENT_REFERENCE.abort }, collateral: {} },
  { id: 'DC-S2', named: 'R3-S2', law: 'surfacing by suppression: a refused consume drops the witnessed W4 record',
    subject: { finish({ consume, appendW4 }) { const c = consume(); if (!c?.ok) return { w4: null, settlement: { settled: false, reason: c?.reason } }; return { w4: appendW4(), settlement: { settled: true } }; },
      abort: SETTLEMENT_REFERENCE.abort }, collateral: {} },
  { id: 'DC-S3', named: 'R3-S3', law: 'the invalidate return is ignored (today\'s B1/B2/B5)',
    subject: { finish: SETTLEMENT_REFERENCE.finish, abort: IGNORES.abort }, collateral: {} },
]);
