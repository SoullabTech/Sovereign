/**
 * JARVIS O5-R1 — DEFEAT CANDIDATES.
 *
 * Each is the smallest competent embodiment of ONE named error: the reference
 * with exactly one decision replaced. A candidate that survives its named
 * falsifier repairs the SUITE, ⛔ never the candidate.
 */
import { REFERENCE, validate, settle } from './reference.mjs';
import { compute } from './substrate.mjs';

const R = REFERENCE;
const make = (id, law, named, overrides, collateral = {}) =>
  Object.freeze({ id, law, named, decisions: Object.freeze({ ...R, ...overrides }), collateral: Object.freeze(collateral) });

export const CANDIDATES = Object.freeze([
  make('DC-1', 'restart-from-zero: validates, then reruns the unit from its origin (today\'s reconcileOrphanedRuns → rerun)', 'F1', {
    resume(ctx) {
      const cp = ctx.checkpoints.read(ctx.unitId);
      const refusal = validate(ctx, cp);
      if (refusal) return refusal;
      return { disposition: 'RESUMED', fromStep: 0, state: ctx.unit.initial_state, settle: [] };
    },
  }, {
    F7: 'restarting necessarily reconstructs state from the original unit — F7\'s error is a sub-act of every restart',
    F8: 'restarting necessarily re-sends the in-flight effect along with every completed one',
  }),

  make('DC-2', 'blind resume: trusts the checkpoint — no live authority, freshness or integrity check', 'F2', {
    resume(ctx) {
      const cp = ctx.checkpoints.read(ctx.unitId);
      if (!cp) return { disposition: 'GATED', gate: 'BLOCKED_BY_EVIDENCE' };
      return settle(ctx, cp, cp.state);
    },
  }),

  make('DC-3', 'dead checkpoint: written faithfully, never read — position and state derived from the ledger', 'F3', {
    resume(ctx) {
      if (ctx.currentGuard.state !== 'EXECUTING' || ctx.currentGuard.core_digest !== ctx.unit.core_digest) {
        return { disposition: 'GATED', gate: 'NEEDS_OPERATOR_AUTHORITY' };
      }
      if (ctx.currentHead !== ctx.unit.base_head) return { disposition: 'GATED', gate: 'BLOCKED_BY_EVIDENCE' };
      const done = ctx.ledger.filter((e) => e.kind === 'attempt').sort((a, b) => a.step - b.step);
      let state = ctx.unit.initial_state;
      for (const e of done) state = compute(state, e.receipt);
      return { disposition: 'RESUMED', fromStep: done.length, state, settle: [] };
    },
  }, {
    F2: 'a checkpoint that is never read cannot be found corrupt, foreign or over-wide; detecting that requires reading it, which un-makes the candidate',
    F8: 'the ledger cannot see an effect that was sent or witnessed but not yet ledgered — that is precisely the information the checkpoint exists to carry',
  }),

  make('DC-4', 'cosmetic recovery: reads the checkpoint for POSITION, reconstructs STATE from the original unit', 'F7', {
    resume(ctx) {
      const cp = ctx.checkpoints.read(ctx.unitId);
      const refusal = validate(ctx, cp);
      if (refusal) return refusal;
      return settle(ctx, cp, ctx.unit.initial_state);
    },
  }),

  make('DC-5', 'error flattening: the cause replaces the specific failure code', 'F4', {
    classify(code) {
      const c = R.classify(code);
      return c.classified ? { ...c, code: c.cause } : c;
    },
  }),

  make('DC-6', 'evidence escalation: a read-only (INSPECT) proposal is auto-enqueued as O2 work "because reading is harmless"', 'F5', {
    admitEvidence(entry, programme) {
      const adm = R.admitEvidence(entry, programme);
      if (entry?.kind === 'proposal' && entry.proposed_kind === 'INSPECT') {
        return { ...adm, o2Additions: [{ id: `p-${programme.o2.nodes.length + 1}`, kind: 'INSPECT', origin: 'executor-proposal' }] };
      }
      return adm;
    },
  }),

  make('DC-7', 'cross-lane leakage: a consequence finding may carry a suggested patch / command into the affected lane', 'F6', {
    admitConsequenceFinding(input) {
      if (!input || typeof input.affected_lane !== 'string') return { admitted: false, refused_fields: ['<malformed>'] };
      return { admitted: true, record: Object.freeze({ ...input }) };
    },
  }),

  make('DC-8', 'step-N resume: continues from the step, re-sending any effect not yet ledgered', 'F8', {
    resume(ctx) {
      const cp = ctx.checkpoints.read(ctx.unitId);
      const refusal = validate(ctx, cp);
      if (refusal) return refusal;
      if (cp.phase === 'ledgered') return { disposition: 'RESUMED', fromStep: cp.step + 1, state: cp.state, settle: [] };
      return { disposition: 'RESUMED', fromStep: cp.step + 1, state: cp.state, settle: [{ step: cp.step, action: 'DISPATCH' }] };
    },
  }),

  make('DC-9', 'inert caution: reads and validates, then gates every resume for operator judgment — safety by refusing to recover', 'F1', {
    resume(ctx) {
      const cp = ctx.checkpoints.read(ctx.unitId);
      return validate(ctx, cp) ?? { disposition: 'GATED', gate: 'NEEDS_OPERATOR_JUDGMENT' };
    },
  }, {
    F7: 'a supervisor that never continues cannot carry the checkpointed state into any continuation',
    F8: 'a supervisor that never continues leaves a witnessed effect permanently unrecorded — consequence lost, not preserved',
  }),
]);
