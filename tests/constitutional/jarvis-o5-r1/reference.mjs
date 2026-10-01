/**
 * JARVIS O5-R1 — CONFORMING REFERENCE DOUBLE.
 *
 * Proves the eight laws are MUTUALLY SATISFIABLE. ⛔ It is a test double, never
 * a seed: O5 implementation must be written to the frozen suite, not derived
 * from this file. Its cause mapping in particular is ILLUSTRATIVE — the suite
 * freezes totality, preservation and the cause→response table, ⛔ not any one
 * code's cause.
 */
import {
  CAUSES, CAUSE_RESPONSE, UNCLASSIFIED, EVIDENCE_KINDS, O1_CANDIDATE_STANDING,
  CONSEQUENCE_FINDING_FIELDS, URGENCY,
} from './contract.mjs';
import { sealValid } from './substrate.mjs';
import { CAUSE_OF } from './reference-cause-map.mjs';

const gated = (gate) => ({ disposition: 'GATED', gate });

/** Validation shared by lawful resume: authority is re-derived from the LIVE
 *  guard and tip, never read from the checkpoint. */
export function validate(ctx, cp) {
  if (!cp) return gated('BLOCKED_BY_EVIDENCE');
  if (!sealValid(cp) || cp.unit_id !== ctx.unitId) return gated('BLOCKED_BY_EVIDENCE');
  if (ctx.currentGuard.state !== 'EXECUTING') return gated('NEEDS_OPERATOR_AUTHORITY');
  if (cp.core_digest !== ctx.currentGuard.core_digest) return gated('NEEDS_OPERATOR_AUTHORITY');
  if (cp.base_head !== ctx.currentHead) return gated('BLOCKED_BY_EVIDENCE');
  return null;
}

/** Settle the in-flight effect by its phase — the idempotence boundary. */
export function settle(ctx, cp, state) {
  const i = cp.step;
  switch (cp.phase) {
    case 'ledgered': return { disposition: 'RESUMED', fromStep: i + 1, state, settle: [] };
    case 'effect_witnessed':
      return { disposition: 'RESUMED', fromStep: i + 1, state, settle: [{ step: i, action: 'RECORD', receipt: cp.receipt }] };
    case 'dispatched': {
      const p = ctx.probe(ctx.effectKey(i));
      if (p.status === 'PRESENT') return { disposition: 'RESUMED', fromStep: i + 1, state, settle: [{ step: i, action: 'RECORD', receipt: p.receipt }] };
      if (p.status === 'ABSENT') return { disposition: 'RESUMED', fromStep: i + 1, state, settle: [{ step: i, action: 'DISPATCH' }] };
      return gated('BLOCKED_BY_EVIDENCE');
    }
    case 'authorized': return { disposition: 'RESUMED', fromStep: i + 1, state, settle: [{ step: i, action: 'DISPATCH' }] };
    default: return gated('BLOCKED_BY_EVIDENCE');
  }
}

export function resume(ctx) {
  const cp = ctx.checkpoints.read(ctx.unitId);
  const refusal = validate(ctx, cp);
  if (refusal) return refusal;
  return settle(ctx, cp, cp.state);
}

const INDEX = new Map();
for (const cause of CAUSES) for (const code of CAUSE_OF[cause]) INDEX.set(code, cause);

export function classify(code) {
  const cause = INDEX.get(code);
  if (!cause) return { code, ...UNCLASSIFIED };
  return { code, cause, response: CAUSE_RESPONSE[cause], classified: true };
}

export function admitEvidence(entry) {
  if (!entry || !EVIDENCE_KINDS.includes(entry.kind)) return null;
  const ledgerEntry = Object.freeze({ kind: entry.kind, source_act: entry.source_act, summary: entry.summary, ...(entry.proposed_kind ? { proposed_kind: entry.proposed_kind } : {}) });
  if (entry.kind !== 'proposal') return { ledgerEntry };
  return {
    ledgerEntry,
    o1Candidate: Object.freeze({ standing: O1_CANDIDATE_STANDING, raw_utterance: entry.summary, source: 'executor-proposal', authority_grants: Object.freeze([]) }),
  };
}

export function admitConsequenceFinding(input) {
  if (!input || typeof input !== 'object') return { admitted: false, refused_fields: ['<not an object>'] };
  const refused = Object.keys(input).filter((k) => !CONSEQUENCE_FINDING_FIELDS.includes(k));
  if (refused.length) return { admitted: false, refused_fields: refused };
  if (input.kind !== 'finding' || typeof input.affected_lane !== 'string' || typeof input.reason !== 'string'
    || !Array.isArray(input.evidence_refs) || !URGENCY.includes(input.urgency)) {
    return { admitted: false, refused_fields: ['<malformed>'] };
  }
  return { admitted: true, record: Object.freeze({ ...input, evidence_refs: Object.freeze([...input.evidence_refs]) }) };
}

export const REFERENCE = Object.freeze({ resume, classify, admitEvidence, admitConsequenceFinding });
