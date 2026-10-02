/**
 * DEPLOYMENT-SAFETY-03 / STEP 3 — FAILURE-PREFIX COMPATIBILITY
 *
 * The production runner commits each migration independently. If migration N
 * fails, migrations 1..N-1 remain committed while the old reader stays live.
 * Therefore final-schema compatibility is insufficient: every committed prefix
 * must be explicitly attested compatible with the exact old reader.
 *
 * Pure evaluator. No IO. No deployment authority.
 */
import type { PendingMigration } from "./migration-compatibility-core";

export type PrefixEntry = {
  through_path: string;
  through_sha256: string;
  rationale: string;
  limitations: unknown[];
};

export type PrefixCompatibilityAttestation = {
  instrument: "migration-prefix-compatibility/v1";
  verdict: "ALL_PREFIXES_COMPATIBLE" | "NOT_ALL_PREFIXES_COMPATIBLE";
  prefixes: PrefixEntry[];
};

export type PrefixRefusalCode =
  | "BAD_PREFIX_COMPATIBILITY"
  | "PREFIX_INCOMPATIBLE"
  | "PREFIX_COUNT_MISMATCH"
  | "PREFIX_IDENTITY_MISMATCH"
  | "PREFIX_BASIS_MISSING";

export type PrefixOutcome =
  | { kind: "applies"; prefixes: number }
  | { kind: "refused"; code: PrefixRefusalCode; reason: string };

export interface PrefixDecisions {
  acceptVerdict(v: unknown): boolean;
  countMatches(attested: number, pending: number): boolean;
  identityMatches(entry: PrefixEntry, pending: PendingMigration): boolean;
  requireRationale: boolean;
  requireLimitations: boolean;
}

export const STRICT_PREFIX_COMPATIBILITY: PrefixDecisions = {
  acceptVerdict: v => v === "ALL_PREFIXES_COMPATIBLE",
  countMatches: (a, b) => a === b,
  identityMatches: (e, p) =>
    e.through_path === p.path && e.through_sha256 === p.sha256,
  requireRationale: true,
  requireLimitations: true,
};

const refuse = (code: PrefixRefusalCode, reason: string): PrefixOutcome =>
  ({ kind: "refused", code, reason });

function validEntry(v: unknown): v is PrefixEntry {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o=v as Record<string, unknown>;
  return typeof o.through_path === "string" && o.through_path !== "" &&
    typeof o.through_sha256 === "string" && /^[0-9a-f]{64}$/.test(o.through_sha256) &&
    typeof o.rationale === "string" &&
    Array.isArray(o.limitations);
}

export function evaluatePrefixCompatibility(
  raw: unknown,
  pending: PendingMigration[],
  d: PrefixDecisions = STRICT_PREFIX_COMPATIBILITY,
): PrefixOutcome {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return refuse("BAD_PREFIX_COMPATIBILITY", "failure-prefix compatibility is absent or malformed.");
  }
  const a=raw as Record<string, unknown>;
  if (a.instrument !== "migration-prefix-compatibility/v1" ||
      !Array.isArray(a.prefixes) || !a.prefixes.every(validEntry)) {
    return refuse("BAD_PREFIX_COMPATIBILITY", "failure-prefix compatibility has an invalid v1 shape.");
  }
  if (!d.acceptVerdict(a.verdict)) {
    return refuse("PREFIX_INCOMPATIBLE",
      "the review does not attest old-reader compatibility for every committed migration prefix.");
  }

  const prefixes=a.prefixes as PrefixEntry[];
  if (!d.countMatches(prefixes.length,pending.length)) {
    return refuse("PREFIX_COUNT_MISMATCH",
      "the prefix attestation does not cover every possible committed prefix.");
  }
  for (let i=0;i<pending.length;i+=1) {
    const e=prefixes[i], p=pending[i];
    if (!e || !p || !d.identityMatches(e,p)) {
      return refuse("PREFIX_IDENTITY_MISMATCH",
        "prefix "+(i+1)+" is not bound to the exact migration ending that prefix.");
    }
    if ((d.requireRationale && e.rationale.trim()==="") ||
        (d.requireLimitations && !Array.isArray(e.limitations))) {
      return refuse("PREFIX_BASIS_MISSING",
        "prefix "+(i+1)+" lacks an explicit rationale or limitations claim.");
    }
  }
  return { kind:"applies", prefixes:prefixes.length };
}
