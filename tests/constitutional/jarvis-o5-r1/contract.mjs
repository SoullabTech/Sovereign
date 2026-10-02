/**
 * JARVIS O5-R1 — Execution Continuity & Recovery · CONTRACT (vocabulary only).
 *
 * Governing sentence: RECOVERY PRESERVES LAWFUL CONSEQUENCE, NOT MERELY
 * COMPUTATIONAL POSITION.
 *
 * This file types the law at the observable boundary. It names no table, no
 * file layout, no store, no lock. It adds vocabulary ONLY where the census
 * (SOULLAB-JARVIS-015 crosswalk §2) found a genuine gap; everything else is
 * reused by name from O0 (gate decisions) and W4 (ledger).
 *
 * ⛔ No O7 founder-inbox behaviour. ⛔ No O8 semantic-merge behaviour.
 */

// ── Reused, not re-legislated: O0 operator gate decisions ────────────────────
// (jarvis-desktop/src/operator-constitution.js). R1 may only EMIT these.
export const O0_GATES = Object.freeze([
  'CONTINUE',
  'NEEDS_OPERATOR_AUTHORITY',
  'NEEDS_OPERATOR_JUDGMENT',
  'BLOCKED_BY_EVIDENCE',
  'STOP',
]);

// ── Gap 1: per-effect idempotence boundary (checkpoint phase) ─────────────────
// A checkpoint records where ONE effect stands, not merely which step is next.
// Order is law: a later phase implies every earlier one held.
//   authorized       — the effect is inside the W2 authorized core; not yet sent
//   dispatched       — written BEFORE the effect is sent: it MAY have happened
//   effect_witnessed — the effect's receipt was observed; NOT yet in the W4 ledger
//   ledgered         — appended to the W4 ledger; lawful consequence is recorded
// ("intended" precedes AUTHORIZED and lives in O1/O2; it is not a checkpoint phase.)
export const EFFECT_PHASES = Object.freeze([
  'authorized',
  'dispatched',
  'effect_witnessed',
  'ledgered',
]);

// A resume may lawfully re-send an effect ONLY when its absence is proven.
export const EFFECT_PROBE = Object.freeze(['PRESENT', 'ABSENT', 'UNKNOWN']);

// Resume dispositions. ⛔ There is deliberately no RESTART: re-running a unit
// from its origin after interruption is the F1 defect, not a disposition.
export const RESUME_DISPOSITIONS = Object.freeze([
  'RESUMED',   // continued from the checkpointed lawful boundary
  'GATED',     // stopped at an O0 gate (authority, evidence, freshness, integrity)
]);

// ── Gap 2: failure-cause axis (ADDITIVE over existing failure_class codes) ────
export const CAUSES = Object.freeze([
  'EXECUTION',
  'ENVIRONMENT',
  'ASSUMPTION',
  'SCOPE',
  'EVIDENCE',
  'AUTHORITY',
  'INTEGRATION',
]);

// Lawful response per cause. A response is RECOMMENDED RECOVERY METADATA —
// it is never a grant. "Reattempt" still runs through the existing W2
// lifecycle (retry ≠ independent review); nothing here authorizes it.
export const CAUSE_RESPONSE = Object.freeze({
  EXECUTION: 'REATTEMPT_UNDER_EXISTING_LIFECYCLE',
  ENVIRONMENT: 'REPAIR_ENVIRONMENT_THEN_REATTEMPT_UNDER_EXISTING_LIFECYCLE',
  ASSUMPTION: 'INVALIDATE_HYPOTHESIS_RETURN_TO_OBSERVATION',
  SCOPE: 'STOP_RETURN_FOR_RESCOPE',
  EVIDENCE: 'BLOCKED_BY_EVIDENCE',
  AUTHORITY: 'NEEDS_OPERATOR_AUTHORITY',
  INTEGRATION: 'STOP_RECORD_FINDING',
});

// An unrecognised code is NOT guessed into a cause. Fail closed.
export const UNCLASSIFIED = Object.freeze({ cause: null, response: 'STOP', classified: false });

// Fields a classification may never carry: classification explains; it does
// not authorize and does not replace the diagnostic.
export const CLASSIFICATION_FORBIDDEN_FIELDS = Object.freeze([
  'retry_authorized', 'authorized', 'grant', 'grants', 'authority', 'failure_class_replaced',
]);

// Where the existing concrete codes are emitted today. The suite reads these
// sources so that a new code without a cause mapping FAILS the suite.
export const FAILURE_CODE_SOURCES = Object.freeze([
  'scripts/builder/jarvis-runtime-pipeline.mjs',
  'scripts/builder/jarvis-local-worker.mjs',
  'scripts/builder/jarvis-runtime-store.mjs',
]);

// ── Gap 3: two evidence-only W4 ledger kinds ─────────────────────────────────
export const EVIDENCE_KINDS = Object.freeze(['finding', 'proposal']);

// proposal → O1 operator-intent CANDIDATE. Never a CLEAR O1 intent, never an
// O2 node, never an O3 held authority. Only the operator converts.
export const O1_CANDIDATE_STANDING = 'CANDIDATE';

// ── Gap 4: cross-lane consequence finding — CLOSED field set ──────────────────
export const CONSEQUENCE_FINDING_FIELDS = Object.freeze([
  'kind',           // always 'finding'
  'source_act',
  'affected_lane',
  'reason',         // descriptive text; nothing downstream may execute it
  'evidence_refs',
  'urgency',
]);
export const URGENCY = Object.freeze(['low', 'normal', 'high']);

// Named here so refusal is explicit, not merely a side effect of the allowlist.
export const CONSEQUENCE_FORBIDDEN_FIELDS = Object.freeze([
  'patch', 'suggested_patch', 'diff', 'command', 'commands', 'script',
  'grant', 'grants', 'authority', 'allowed_paths', 'write_paths',
  'instruction', 'instructions', 'next_act', 'apply', 'mutation',
]);

/**
 * The decision seam every candidate implements. Candidates share one
 * substrate (substrate.mjs) and differ in exactly one decision, so lethality
 * is DECISION-LEVEL (see review-custody precedent), ⛔ not a claim about every
 * possible standalone implementation.
 *
 * @typedef {Object} ContinuityDecisions
 * @property {(ctx: ResumeContext) => ResumePlan} resume
 * @property {(code: string) => Classification} classify
 * @property {(entry: object, programme: object) => EvidenceAdmission} admitEvidence
 * @property {(input: object) => FindingAdmission} admitConsequenceFinding
 *
 * @typedef {Object} ResumeContext
 * @property {string} unitId
 * @property {{ read(id: string): object|null }} checkpoints  instrumented store
 * @property {object} unit          the ORIGINAL authorized unit (available — using it
 *                                  to reconstruct execution state is F7)
 * @property {object} currentGuard  live W2 guard (authorized-core digest, state)
 * @property {string} currentHead   live canonical tip (O2 freshness precondition)
 * @property {(effectKey: string) => 'PRESENT'|'ABSENT'|'UNKNOWN'} probe
 * @property {ReadonlyArray<object>} ledger  W4 ledger (read-only view)
 *
 * @typedef {Object} ResumePlan
 * @property {'RESUMED'|'GATED'} disposition
 * @property {string} [gate]                one of O0_GATES when GATED
 * @property {number} [fromStep]            next step to execute
 * @property {object} [state]               carried execution state
 * @property {Array<{step:number, action:'RECORD'|'DISPATCH', receipt?:string}>} [settle]
 *           how in-flight effects are settled before continuing
 */
