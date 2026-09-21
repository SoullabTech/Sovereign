/**
 * DEPLOYMENT-SAFETY-03 — PURE MIGRATION COMPATIBILITY CONTRACT
 *
 * Determines whether an already-authored compatibility attestation still applies
 * to one exact deployment relation. It does not establish semantic truth.
 */
export type PendingMigration = { path: string; sha256: string };
export type OldReaderEvidence = { repo_path: string; sha256: string; trace_path: string };

export type CompatibilityAttestation = {
  instrument: "migration-compatibility/v1";
  verdict: "COMPATIBLE" | "INCOMPATIBLE";
  old_reader_commit: string;
  target_reader_commit: string;
  pending: PendingMigration[];
  old_reader_evidence: OldReaderEvidence[];
  rationale: string;
  limitations: unknown[];
};

export type CompatibilityObservation = {
  oldReaderCommit: string;
  targetReaderCommit: string;
  pending: PendingMigration[];
  oldReaderEvidence: { repo_path: string; sha256: string }[];
  witnessedFiles: string[];
};

export type CompatibilityRefusalCode =
  | "BAD_COMPATIBILITY_RECORD"
  | "OLD_READER_INCOMPATIBLE"
  | "OLD_READER_MOVED"
  | "TARGET_READER_MOVED"
  | "PENDING_SET_MOVED"
  | "PENDING_CONTENT_MOVED"
  | "DUPLICATE_PENDING_PATH"
  | "NO_OLD_READER_EVIDENCE"
  | "OLD_READER_EVIDENCE_MOVED"
  | "OLD_READER_EVIDENCE_UNWITNESSED"
  | "PENDING_MIGRATION_UNWITNESSED"
  | "MISSING_COMPATIBILITY_BASIS";

export type CompatibilityOutcome =
  | { kind: "applies"; pending: number; evidence: number }
  | { kind: "refused"; code: CompatibilityRefusalCode; reason: string };

export interface CompatibilityDecisions {
  compatibleVerdict(v: unknown): boolean;
  oldReaderMatches(attested: string, observed: string): boolean;
  targetReaderMatches(attested: string, observed: string): boolean;
  pendingPathsMatch(attested: string[], observed: string[]): boolean;
  hashMatches(attested: string, observed: string): boolean;
  duplicatePaths(paths: string[]): string[];
  requireOldReaderEvidence: boolean;
  witnessContains(attested: string, witnessed: string[]): boolean;
  requirePendingWitness: boolean;
  requireRationale: boolean;
  requireLimitations: boolean;
}

export const STRICT_COMPATIBILITY: CompatibilityDecisions = {
  compatibleVerdict: v => v === "COMPATIBLE",
  oldReaderMatches: (a, b) => a === b,
  targetReaderMatches: (a, b) => a === b,
  pendingPathsMatch: (a, b) =>
    a.length === b.length && a.every((p, i) => p === b[i]),
  hashMatches: (a, b) => a === b,
  duplicatePaths: paths => {
    const seen = new Set<string>();
    const dup = new Set<string>();
    for (const p of paths) {
      if (seen.has(p)) dup.add(p);
      else seen.add(p);
    }
    return [...dup].sort();
  },
  requireOldReaderEvidence: true,
  witnessContains: (a, witnessed) => witnessed.includes(a),
  requirePendingWitness: true,
  requireRationale: true,
  requireLimitations: true,
};

const refuse = (code: CompatibilityRefusalCode, reason: string): CompatibilityOutcome =>
  ({ kind: "refused", code, reason });

const fullSha = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{40}$/.test(v);

function validPending(v: unknown): v is PendingMigration[] {
  return Array.isArray(v) && v.length > 0 && v.every(x => {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return typeof o.path === "string" && o.path !== "" &&
      typeof o.sha256 === "string" && /^[0-9a-f]{64}$/.test(o.sha256);
  });
}

function validEvidence(v: unknown): v is OldReaderEvidence[] {
  return Array.isArray(v) && v.every(x => {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return typeof o.repo_path === "string" && o.repo_path !== "" &&
      typeof o.trace_path === "string" && o.trace_path !== "" &&
      typeof o.sha256 === "string" && /^[0-9a-f]{64}$/.test(o.sha256);
  });
}

export function evaluateCompatibility(
  raw: unknown,
  observed: CompatibilityObservation,
  d: CompatibilityDecisions = STRICT_COMPATIBILITY,
): CompatibilityOutcome {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return refuse("BAD_COMPATIBILITY_RECORD", "compatibility attestation is absent or not an object.");
  }
  const a = raw as Record<string, unknown>;
  if (a.instrument !== "migration-compatibility/v1" ||
      !fullSha(a.old_reader_commit) || !fullSha(a.target_reader_commit) ||
      !validPending(a.pending) || !validEvidence(a.old_reader_evidence)) {
    return refuse("BAD_COMPATIBILITY_RECORD", "compatibility attestation has an invalid v1 shape.");
  }
  if (!d.compatibleVerdict(a.verdict)) {
    return refuse("OLD_READER_INCOMPATIBLE",
      "the review does not attest that the old reader can tolerate the resulting schema.");
  }
  if (!d.oldReaderMatches(a.old_reader_commit, observed.oldReaderCommit)) {
    return refuse("OLD_READER_MOVED",
      "reviewed old reader " + a.old_reader_commit + "; observed " + observed.oldReaderCommit + ".");
  }
  if (!d.targetReaderMatches(a.target_reader_commit, observed.targetReaderCommit)) {
    return refuse("TARGET_READER_MOVED",
      "reviewed target reader " + a.target_reader_commit + "; observed " + observed.targetReaderCommit + ".");
  }

  const attestedPending = a.pending as PendingMigration[];
  const dup = d.duplicatePaths(attestedPending.map(x => x.path));
  if (dup.length > 0) {
    return refuse("DUPLICATE_PENDING_PATH",
      "pending compatibility set repeats path(s): " + dup.join(", ") + ".");
  }
  if (!d.pendingPathsMatch(attestedPending.map(x => x.path), observed.pending.map(x => x.path))) {
    return refuse("PENDING_SET_MOVED",
      "the ordered pending migration set is not the set the compatibility review assessed.");
  }
  for (let i = 0; i < attestedPending.length; i += 1) {
    const at = attestedPending[i];
    const ob = observed.pending[i];
    if (!at || !ob || !d.hashMatches(at.sha256, ob.sha256)) {
      return refuse("PENDING_CONTENT_MOVED",
        (at ? at.path : "pending migration") + " bytes differ from the compatibility-reviewed migration.");
    }
  }

  const evidence = a.old_reader_evidence as OldReaderEvidence[];
  if (d.requireOldReaderEvidence && evidence.length === 0) {
    return refuse("NO_OLD_READER_EVIDENCE",
      "compatibility cannot be asserted without old-reader source evidence.");
  }
  const observedEvidence = new Map(observed.oldReaderEvidence.map(x => [x.repo_path, x.sha256]));
  for (const e of evidence) {
    const actual = observedEvidence.get(e.repo_path);
    if (actual === undefined || !d.hashMatches(e.sha256, actual)) {
      return refuse("OLD_READER_EVIDENCE_MOVED",
        "old-reader evidence bytes moved: " + e.repo_path + ".");
    }
    if (!d.witnessContains(e.trace_path, observed.witnessedFiles)) {
      return refuse("OLD_READER_EVIDENCE_UNWITNESSED",
        "no physical Read witness for old-reader evidence: " + e.trace_path + ".");
    }
  }

  if (d.requirePendingWitness) {
    for (const m of attestedPending) {
      if (!d.witnessContains(m.path, observed.witnessedFiles)) {
        return refuse("PENDING_MIGRATION_UNWITNESSED",
          "no physical Read witness for pending migration: " + m.path + ".");
      }
    }
  }

  if ((d.requireRationale && (typeof a.rationale !== "string" || a.rationale.trim() === "")) ||
      (d.requireLimitations && !Array.isArray(a.limitations))) {
    return refuse("MISSING_COMPATIBILITY_BASIS",
      "compatibility requires a non-empty rationale and explicit limitations array.");
  }
  return { kind: "applies", pending: attestedPending.length, evidence: evidence.length };
}
