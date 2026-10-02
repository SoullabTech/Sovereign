/**
 * DEPLOYMENT-SAFETY-03 / STEP 2B — PURE COMPOSITION CORE
 *
 * Joins two already-separate laws without merging their semantics:
 *   review custody -> compatibility.
 *
 * Compatibility receives the witness corpus produced by custody. There is no
 * independent compatibility trace in the lawful path.
 */
import {
  evaluateCompatibility,
  STRICT_COMPATIBILITY,
  type CompatibilityDecisions,
  type CompatibilityObservation,
  type CompatibilityOutcome,
  type PendingMigration,
} from "./migration-compatibility-core";

export type CustodyState = {
  applies: boolean;
  refusalCode?: string;
  targetReaderCommit: string;
  pending: PendingMigration[];
  witnessedFiles: string[];
};

export type CompatibilityObservationInput =
  Omit<CompatibilityObservation, "witnessedFiles"> & {
    candidateWitnessedFiles?: string[];
  };

export type CompositionRefusalCode =
  | "CUSTODY_REFUSED"
  | "COMPATIBILITY_NOT_IN_ADMITTED_REVIEW"
  | "COMPOSITION_TARGET_MISMATCH"
  | "COMPOSITION_PENDING_MISMATCH"
  | "COMPATIBILITY_REFUSED";

export type CompositionOutcome =
  | { kind: "applies"; pending: number; evidence: number }
  | { kind: "refused"; code: CompositionRefusalCode; reason: string };

export interface CompositionDecisions {
  acceptCustody(c: CustodyState): boolean;
  acceptCompatibilitySource(source: "admitted_review" | "sidecar"): boolean;
  targetMatches(custodyTarget: string, observedTarget: string): boolean;
  pendingMatches(custodyPending: PendingMigration[], observedPending: PendingMigration[]): boolean;
  witnessCorpus(custodyWitnessed: string[], candidateWitnessed: string[] | undefined): string[];
  acceptCompatibility(outcome: CompatibilityOutcome): boolean;
  compatibility: CompatibilityDecisions;
}

export const STRICT_COMPOSITION: CompositionDecisions = {
  acceptCustody: c => c.applies,
  acceptCompatibilitySource: source => source === "admitted_review",
  targetMatches: (a, b) => a === b,
  pendingMatches: (a, b) =>
    a.length === b.length &&
    a.every((x, i) => x.path === b[i]?.path && x.sha256 === b[i]?.sha256),
  // Load-bearing: compatibility gets custody's witnessed corpus, never a second trace.
  witnessCorpus: custodyWitnessed => custodyWitnessed,
  acceptCompatibility: outcome => outcome.kind === "applies",
  compatibility: STRICT_COMPATIBILITY,
};

const refuse = (code: CompositionRefusalCode, reason: string): CompositionOutcome =>
  ({ kind: "refused", code, reason });

export function composeMigrationGate(
  custody: CustodyState,
  compatibilityRaw: unknown,
  compatibilitySource: "admitted_review" | "sidecar",
  observed: CompatibilityObservationInput,
  d: CompositionDecisions = STRICT_COMPOSITION,
): CompositionOutcome {
  if (!d.acceptCustody(custody)) {
    return refuse("CUSTODY_REFUSED",
      "review custody does not apply; compatibility cannot rescue an inadmissible review.");
  }
  if (!d.acceptCompatibilitySource(compatibilitySource)) {
    return refuse("COMPATIBILITY_NOT_IN_ADMITTED_REVIEW",
      "migration_compatibility must inhabit the exact review bytes admitted by custody.");
  }
  if (!d.targetMatches(custody.targetReaderCommit, observed.targetReaderCommit)) {
    return refuse("COMPOSITION_TARGET_MISMATCH",
      "compatibility target is not the target reader bound by review custody.");
  }
  if (!d.pendingMatches(custody.pending, observed.pending)) {
    return refuse("COMPOSITION_PENDING_MISMATCH",
      "compatibility did not evaluate the exact ordered pending bytes gated by custody.");
  }

  const compatibility = evaluateCompatibility(
    compatibilityRaw,
    {
      oldReaderCommit: observed.oldReaderCommit,
      targetReaderCommit: observed.targetReaderCommit,
      pending: observed.pending,
      oldReaderEvidence: observed.oldReaderEvidence,
      witnessedFiles: d.witnessCorpus(custody.witnessedFiles, observed.candidateWitnessedFiles),
    },
    d.compatibility,
  );
  if (!d.acceptCompatibility(compatibility)) {
    return refuse("COMPATIBILITY_REFUSED",
      compatibility.kind === "refused" ? "[" + compatibility.code + "] " + compatibility.reason
        : "compatibility was not accepted.");
  }
  if (compatibility.kind !== "applies") {
    // A defeat candidate may say to accept a refusal; lawful code must never
    // accidentally treat that candidate path as evidence.
    return { kind: "applies", pending: custody.pending.length, evidence: 0 };
  }
  return { kind: "applies", pending: compatibility.pending, evidence: compatibility.evidence };
}
