import {
  evaluateComposition, STRICT_COMPOSITION,
  type AdmittedReview, type CompositionDecisions,
  type CompositionInput, type CompositionRefusalCode,
} from "../../../scripts/migration-compatibility-gate-core";

export type FResult = { pass: true } | { pass: false; why: string };
export type Falsifier = { id: string; law: string; run(d: CompositionDecisions): FResult };
const ok: FResult = { pass: true };
const fail = (why: string): FResult => ({ pass: false, why });

const TARGET = "2".repeat(40), OLD = "1".repeat(40), OTHER = "9".repeat(40);
const RM = "a".repeat(64), RC = "b".repeat(64);
const M1 = "database/migrations/20990101000001_a.sql";
const M2 = "database/migrations/20990101000002_b.sql";

const migrationReview = (): AdmittedReview => ({
  role: "migration",
  reviewSha256: RM,
  traceId: "trace-migration-0001",
  reviewer: "reviewer-one",
  boundTarget: TARGET,
  applicability: "applies",
});
const compatibilityReview = (): AdmittedReview => ({
  role: "compatibility",
  reviewSha256: RC,
  traceId: "trace-compatibility-0002",
  reviewer: "reviewer-two",
  boundTarget: TARGET,
  applicability: "applies",
});
const input = (): CompositionInput => ({
  target: TARGET,
  oldReaderCommit: OLD,
  migrationReview: migrationReview(),
  compatibilityReview: compatibilityReview(),
  gatedPending: [M1, M2],
  compatibility: { kind: "applies" },
  oldReaderEvidenceTree: { kind: "commit", commit: OLD },
  compatibilityWitnessSource: { kind: "review", role: "compatibility" },
});

const mustRefuse = (
  d: CompositionDecisions, i: CompositionInput,
  code: CompositionRefusalCode, what: string,
): FResult => {
  const r = evaluateComposition(i, d);
  if (r.kind !== "refused") return fail(what + ": expected [" + code + "], got crosses");
  if (r.code !== code) return fail(what + ": expected [" + code + "], got [" + r.code + "]");
  return ok;
};

const mustCross = (d: CompositionDecisions, i: CompositionInput, what: string): FResult => {
  const r = evaluateComposition(i, d);
  if (r.kind !== "crosses") {
    return fail(what + ": expected crosses, got refused [" + r.code + "] — " + r.reason);
  }
  return ok;
};

export const FALSIFIERS: Falsifier[] = [
  { id: "GC-F1", law: "A stale migration review is never rescued by compatibility.",
    run: d => { const i = input(); i.migrationReview.applicability = "stale";
      return mustRefuse(d, i, "MIGRATION_REVIEW_NOT_APPLICABLE", "stale migration review"); }},

  { id: "GC-F2", law: "A compatibility review is structurally required, not an optional upgrade.",
    run: d => { const i = input(); i.compatibilityReview = null;
      return mustRefuse(d, i, "NO_COMPATIBILITY_REVIEW", "absent compatibility review"); }},

  { id: "GC-F3", law: "A stale compatibility review is never rescued by migration custody.",
    run: d => { const i = input(); i.compatibilityReview!.applicability = "stale";
      return mustRefuse(d, i, "COMPATIBILITY_REVIEW_NOT_APPLICABLE", "stale compatibility review"); }},

  { id: "GC-F4", law: "An APPROVED migration review never overrides a refused compatibility verdict.",
    run: d => { const i = input(); i.compatibility = { kind: "refused", code: "OLD_READER_INCOMPATIBLE" };
      return mustRefuse(d, i, "COMPATIBILITY_REFUSED", "refused compatibility verdict"); }},

  { id: "GC-F5", law: "Both records must bind to the exact deployment target (migration side).",
    run: d => { const i = input(); i.migrationReview.boundTarget = OTHER;
      return mustRefuse(d, i, "MIGRATION_TARGET_DIVERGENCE", "migration target divergence"); }},

  { id: "GC-F6", law: "Both records must bind to the exact deployment target (compatibility side).",
    run: d => { const i = input(); i.compatibilityReview!.boundTarget = OTHER;
      return mustRefuse(d, i, "COMPATIBILITY_TARGET_DIVERGENCE", "compatibility target divergence"); }},

  { id: "GC-F7", law: "One trace observed twice is one admitted claim, not two.",
    run: d => { const i = input(); i.compatibilityReview!.traceId = i.migrationReview.traceId;
      return mustRefuse(d, i, "ADMISSION_IDENTITY_COLLAPSED", "shared trace"); }},

  { id: "GC-F8", law: "One review's bytes admitted twice is one claim, even under two trace ids.",
    run: d => { const i = input(); i.compatibilityReview!.reviewSha256 = i.migrationReview.reviewSha256;
      return mustRefuse(d, i, "ADMISSION_IDENTITY_COLLAPSED", "shared review bytes"); }},

  { id: "GC-F9", law: "Independence is of ADMISSIONS, never of humans: one authorized, competent reviewer may perform both acts.",
    run: d => { const i = input(); i.compatibilityReview!.reviewer = i.migrationReview.reviewer;
      return mustCross(d, i, "same reviewer, two distinct admissions"); }},

  { id: "GC-F10", law: "Old-reader evidence read from the target tree proves nothing.",
    run: d => { const i = input(); i.oldReaderEvidenceTree = { kind: "commit", commit: TARGET };
      return mustRefuse(d, i, "OLD_READER_EVIDENCE_FROM_WRONG_TREE", "evidence from target tree"); }},

  { id: "GC-F11", law: "Compatibility evidence must be witnessed by its own trace, not the migration review's.",
    run: d => { const i = input(); i.compatibilityWitnessSource = { kind: "review", role: "migration" };
      return mustRefuse(d, i, "WITNESS_CORPUS_SUBSTITUTED", "substituted witness corpus"); }},

  { id: "GC-F12", law: "An empty pending set never crosses.",
    run: d => { const i = input(); i.gatedPending = [];
      return mustRefuse(d, i, "NO_PENDING_MIGRATIONS", "empty pending set"); }},
];

export { STRICT_COMPOSITION };
