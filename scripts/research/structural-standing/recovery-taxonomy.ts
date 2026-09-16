export type RecoveryDisposition = 'RECOVERABLE_COMPOSITION' | 'HARD_STOP';
export type RefusalDomain = 'model_plan' | 'substrate_integrity' | 'context_dependent' | 'unclassified';

export interface RecoveryTaxon {
  readonly disposition: RecoveryDisposition;
  readonly domain: RefusalDomain;
  readonly rationale: string;
}

const RECOVERABLE = new Set([
  // Conditional only: ACT 2 still requires current head already referenced in model support,
  // bounded ground capacity, zero synthesis/question mutation, and zero regeneration.
  'superseded_without_current',
]);

const MODEL_PLAN = new Set([
  'unknown_field',
  'invalid_shape',
  'blank_text',
  'borrowed_first_person',
  'member_role_leak',
  'too_many_ground_segments',
  'too_many_synthesis_segments',
  'synthesis_requires_support',
  'synthesis_requires_basis',
  'recovery_current_not_referenced',
  'recovery_not_applicable',
  'recovery_ground_capacity',
]);

const SUBSTRATE = new Set([
  'cyclic_evidence_lineage',
  'recovery_missing_current_head',
  'recovery_mutated_synthesis',
  'recovery_mutated_question',
  'invalid_claim_act',
  'duplicate_claim_act',
  'duplicate_claim_evidence',
  'claim_standing_requires_member_evidence',
  'current_turn_requires_member_evidence',
  'cross_claim_supersession',
  'branched_claim_standing',
  'multiple_claim_roots',
  'multiple_current_claims',
]);

const CONTEXT_DEPENDENT = new Set([
  // A model may invent an evidence id, or substrate lineage/standing may reference a missing id.
  // Both are hard stops, but attribution requires call-site context.
  'unknown_evidence',
]);

export const KNOWN_REFUSAL_CODES = Object.freeze([
  ...RECOVERABLE,
  ...MODEL_PLAN,
  ...SUBSTRATE,
  ...CONTEXT_DEPENDENT,
].sort());

export function classifyRecoveryRefusal(code: string): RecoveryTaxon {
  if (RECOVERABLE.has(code)) {
    return {
      disposition: 'RECOVERABLE_COMPOSITION',
      domain: 'model_plan',
      rationale: 'May be repaired only by ACT 2 one-shot structural recovery; the refusal code alone never authorizes repair.',
    };
  }
  if (MODEL_PLAN.has(code)) {
    return {
      disposition: 'HARD_STOP',
      domain: 'model_plan',
      rationale: 'Repair would require new cognition, invented provenance, content deletion/rewrite, or authority the substrate does not possess.',
    };
  }
  if (SUBSTRATE.has(code)) {
    return {
      disposition: 'HARD_STOP',
      domain: 'substrate_integrity',
      rationale: 'The standing/evidence apparatus is inconsistent or an internal recovery invariant failed.',
    };
  }
  if (CONTEXT_DEPENDENT.has(code)) {
    return {
      disposition: 'HARD_STOP',
      domain: 'context_dependent',
      rationale: 'The same refusal code can arise from a model reference or broken substrate lineage; never recover, and attribute only with call-site evidence.',
    };
  }
  return {
    disposition: 'HARD_STOP',
    domain: 'unclassified',
    rationale: 'Unknown refusal classes fail closed. No future code becomes recoverable merely by appearing.',
  };
}
