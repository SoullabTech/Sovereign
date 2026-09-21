/**
 * DEPLOYMENT-SAFETY-03 · STEP 2B — PURE COMPATIBILITY GATE COMPOSITION
 *
 * Two epistemically distinct review acts must BOTH be admitted, BOTH remain
 * applicable, and BOTH converge on one exact deployment target before pending
 * migrations may cross:
 *
 *   migration custody      "was this migration reviewed correctly against the target?"
 *   compatibility custody  "does the exact old reader tolerate the resulting target?"
 *
 * This core composes outcomes. It does not re-derive them: the migration gate
 * and `evaluateCompatibility` remain the sole authorities over their own
 * questions, and neither is edited here.
 *
 * ⛔ It proves that two independent claims are jointly applicable to one
 *    deployment. It never establishes that either claim is semantically true.
 */

/** An admitted review act, reduced to the facts composition may reason about. */
export type AdmittedReview = {
  role: "migration" | "compatibility";
  /** Exact review bytes admitted into the record. */
  reviewSha256: string;
  /** The harness trace whose physical Read events witnessed this review. */
  traceId: string;
  /** Free-text reviewer identity. Deliberately NOT an independence criterion. */
  reviewer: string;
  /** The commit the custody record is bound to (`record.repo_head`). */
  boundTarget: string;
  /** Outcome of that record's own applicability check. */
  applicability: "applies" | "stale" | "refused";
};

/**
 * Which tree the CLI actually hashed old-reader evidence bytes from.
 * Reading "old reader source" at the target commit would make every
 * compatibility claim vacuously true, so the tree is named and checked.
 */
export type EvidenceTree = { kind: "commit"; commit: string };

/** Which admitted trace supplied the witness corpus handed to the evaluator. */
export type WitnessSource = { kind: "review"; role: "migration" | "compatibility" };

export type CompositionInput = {
  /** The deployment target commit both records must converge on. */
  target: string;
  /** The exact currently-serving reader commit compatibility was assessed against. */
  oldReaderCommit: string;
  migrationReview: AdmittedReview;
  /** Absent when no compatibility review was admitted at all. */
  compatibilityReview: AdmittedReview | null;
  /** Ordered pending migration paths the custody migration gate admitted. */
  gatedPending: string[];
  /** Verdict from `evaluateCompatibility`, or null when it was never run. */
  compatibility: { kind: "applies" } | { kind: "refused"; code: string } | null;
  oldReaderEvidenceTree: EvidenceTree;
  compatibilityWitnessSource: WitnessSource;
};

export type CompositionRefusalCode =
  | "BAD_COMPOSITION_INPUT"
  | "NO_PENDING_MIGRATIONS"
  | "MIGRATION_REVIEW_NOT_APPLICABLE"
  | "NO_COMPATIBILITY_REVIEW"
  | "COMPATIBILITY_REVIEW_NOT_APPLICABLE"
  | "COMPATIBILITY_REFUSED"
  | "MIGRATION_TARGET_DIVERGENCE"
  | "COMPATIBILITY_TARGET_DIVERGENCE"
  | "ADMISSION_IDENTITY_COLLAPSED"
  | "OLD_READER_EVIDENCE_FROM_WRONG_TREE"
  | "WITNESS_CORPUS_SUBSTITUTED";

export type CompositionOutcome =
  | { kind: "crosses"; pending: number; target: string; oldReaderCommit: string }
  | { kind: "refused"; code: CompositionRefusalCode; reason: string };

export interface CompositionDecisions {
  reviewApplicable(r: AdmittedReview): boolean;
  /** A compatibility review is structurally required; it is not an upgrade. */
  requireCompatibilityReview: boolean;
  /** A deployment with nothing pending has nothing to gate. */
  requireNonEmptyPending: boolean;
  compatibilityApplies(o: NonNullable<CompositionInput["compatibility"]>): boolean;
  targetMatches(bound: string, target: string, role: AdmittedReview["role"]): boolean;
  /**
   * Two SEPARATELY ADMITTED claims — distinct review bytes AND distinct traces.
   * Reviewer identity is intentionally not consulted: the same authorized,
   * competent human may perform both acts.
   */
  distinctAdmissions(m: AdmittedReview, c: AdmittedReview): boolean;
  evidenceTreeAdmissible(tree: EvidenceTree, oldReaderCommit: string): boolean;
  witnessSourceAdmissible(src: WitnessSource): boolean;
}

export const STRICT_COMPOSITION: CompositionDecisions = {
  reviewApplicable: r => r.applicability === "applies",
  requireCompatibilityReview: true,
  compatibilityApplies: o => o.kind === "applies",
  targetMatches: (bound, target) => bound === target,
  requireNonEmptyPending: true,
  distinctAdmissions: (m, c) =>
    m.reviewSha256 !== c.reviewSha256 && m.traceId !== c.traceId,
  evidenceTreeAdmissible: (tree, oldReaderCommit) =>
    tree.kind === "commit" && tree.commit === oldReaderCommit,
  witnessSourceAdmissible: src => src.kind === "review" && src.role === "compatibility",
};

const refuse = (code: CompositionRefusalCode, reason: string): CompositionOutcome =>
  ({ kind: "refused", code, reason });

const fullSha = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{40}$/.test(v);

function validReview(v: unknown, role: AdmittedReview["role"]): v is AdmittedReview {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return o["role"] === role &&
    typeof o["reviewSha256"] === "string" && /^[0-9a-f]{64}$/.test(o["reviewSha256"]) &&
    typeof o["traceId"] === "string" && o["traceId"] !== "" &&
    typeof o["reviewer"] === "string" && o["reviewer"] !== "" &&
    fullSha(o["boundTarget"]) &&
    (o["applicability"] === "applies" || o["applicability"] === "stale" || o["applicability"] === "refused");
}

export function evaluateComposition(
  input: CompositionInput,
  d: CompositionDecisions = STRICT_COMPOSITION,
): CompositionOutcome {
  if (!input || typeof input !== "object") {
    return refuse("BAD_COMPOSITION_INPUT", "composition input is absent or not an object.");
  }
  if (!fullSha(input.target) || !fullSha(input.oldReaderCommit)) {
    return refuse("BAD_COMPOSITION_INPUT", "target and old-reader commits must be full 40-hex commit ids.");
  }
  if (!validReview(input.migrationReview, "migration")) {
    return refuse("BAD_COMPOSITION_INPUT", "migration review admission has an invalid shape.");
  }
  if (!Array.isArray(input.gatedPending)) {
    return refuse("BAD_COMPOSITION_INPUT", "gated pending set is not an array.");
  }
  if (d.requireNonEmptyPending && input.gatedPending.length === 0) {
    return refuse("NO_PENDING_MIGRATIONS", "no custody-gated pending migration was supplied.");
  }

  // 1. The migration review must itself still apply. Compatibility cannot rescue it.
  if (!d.reviewApplicable(input.migrationReview)) {
    return refuse("MIGRATION_REVIEW_NOT_APPLICABLE",
      "the admitted migration review is " + input.migrationReview.applicability + ", not applicable.");
  }
  if (!d.targetMatches(input.migrationReview.boundTarget, input.target, "migration")) {
    return refuse("MIGRATION_TARGET_DIVERGENCE",
      "migration review is bound to " + input.migrationReview.boundTarget +
      "; deployment target is " + input.target + ".");
  }

  // 2. A compatibility review is structurally required, never an optional upgrade.
  const compatReview = input.compatibilityReview;
  if (d.requireCompatibilityReview && compatReview === null) {
    return refuse("NO_COMPATIBILITY_REVIEW",
      "no compatibility review was admitted; migration custody alone cannot attest that the old reader tolerates the target.");
  }
  if (compatReview !== null) {
    if (!validReview(compatReview, "compatibility")) {
      return refuse("BAD_COMPOSITION_INPUT", "compatibility review admission has an invalid shape.");
    }
    if (!d.reviewApplicable(compatReview)) {
      return refuse("COMPATIBILITY_REVIEW_NOT_APPLICABLE",
        "the admitted compatibility review is " + compatReview.applicability + ", not applicable.");
    }
    if (!d.targetMatches(compatReview.boundTarget, input.target, "compatibility")) {
      return refuse("COMPATIBILITY_TARGET_DIVERGENCE",
        "compatibility review is bound to " + compatReview.boundTarget +
        "; deployment target is " + input.target + ".");
    }
    // 3. Two separately admitted claims — not one act counted twice.
    if (!d.distinctAdmissions(input.migrationReview, compatReview)) {
      return refuse("ADMISSION_IDENTITY_COLLAPSED",
        "migration and compatibility custody resolve to one admitted claim; two separate admissions are required.");
    }
  }

  // 4. Old-reader evidence must have been read from the old reader, not the target.
  if (!d.evidenceTreeAdmissible(input.oldReaderEvidenceTree, input.oldReaderCommit)) {
    const t = input.oldReaderEvidenceTree;
    return refuse("OLD_READER_EVIDENCE_FROM_WRONG_TREE",
      "old-reader evidence bytes were taken from " + t.commit +
      ", not from the old reader " + input.oldReaderCommit + ".");
  }

  // 5. The witness corpus must be the compatibility review's own admitted trace.
  if (!d.witnessSourceAdmissible(input.compatibilityWitnessSource)) {
    return refuse("WITNESS_CORPUS_SUBSTITUTED",
      "compatibility evidence was witnessed against the " +
      input.compatibilityWitnessSource.role + " review's trace, not its own.");
  }

  // 6. Only now does the compatibility verdict itself get to speak.
  const compat = input.compatibility;
  if (compat === null) {
    return refuse("COMPATIBILITY_REFUSED", "no compatibility evaluation was performed.");
  }
  if (!d.compatibilityApplies(compat)) {
    return refuse("COMPATIBILITY_REFUSED",
      "compatibility does not apply" + (compat.kind === "refused" ? " [" + compat.code + "]" : "") + ".");
  }

  return {
    kind: "crosses",
    pending: input.gatedPending.length,
    target: input.target,
    oldReaderCommit: input.oldReaderCommit,
  };
}
