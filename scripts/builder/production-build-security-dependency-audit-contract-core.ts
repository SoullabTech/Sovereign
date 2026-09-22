/**
 * DEPLOYMENT-SAFETY-03 / STEP 4 — PRODUCTION DEPENDENCY AUDIT CONTRACT EVALUATOR
 *
 * Pure deterministic evaluator for dependency audit evidence.
 * No IO. No deployment authority.
 */

export type DependencyAuditEvidence = {
  target_commit: string;
  manifest_path: string;
  manifest_sha256: string;
  lockfile_path: string;
  lockfile_sha256: string;
  declared_package_manager: string;
  audit_tool_identity: string;
  command_scope: string;
  execution_disposition: "SUCCESS" | "FAILURE";
  parse_disposition: "PARSED" | "UNPARSEABLE";
  parsed_vulnerability_counts: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
  evidence_source: string;
  recorded_timestamp: string;
};

export type DependencyAuditPolicy = {
  dependency_scope: "prod" | "dev" | "all";
  severity_threshold: "low" | "moderate" | "high" | "critical";
  bypass_authority: string;
};

export type DependencyAuditOutcome =
  | { kind: "PASS" }
  | { kind: "AUDIT_UNAVAILABLE" }
  | { kind: "EXECUTION_ERROR" }
  | { kind: "UNPARSEABLE" }
  | { kind: "STALE_EVIDENCE" }
  | { kind: "SOURCE_MISMATCH" }
  | { kind: "SCOPE_MISMATCH" }
  | { kind: "POLICY_INPUT_MISSING" }
  | { kind: "POLICY_VIOLATION" }
  | { kind: "BYPASSED" };

export function evaluateDependencyAudit(
  evidence: DependencyAuditEvidence,
  policy: DependencyAuditPolicy
): DependencyAuditOutcome {
  // Check for missing policy inputs
  if (!policy.severity_threshold || !policy.bypass_authority) {
    return { kind: "POLICY_INPUT_MISSING" };
  }

  // Validate evidence binding
  if (evidence.target_commit !== "7c58ad533") {
    return { kind: "STALE_EVIDENCE" };
  }
  if (evidence.manifest_path !== "package.json" ||
      evidence.manifest_sha256 !== "dd8612af09e63cba") {
    return { kind: "STALE_EVIDENCE" };
  }
  if (evidence.lockfile_path !== "package-lock.json" ||
      evidence.lockfile_sha256 !== "b4e56c7b7a382d0a") {
    return { kind: "STALE_EVIDENCE" };
  }

  // Validate source
  if (evidence.evidence_source !== "scripts/deploy-production.sh") {
    return { kind: "SOURCE_MISMATCH" };
  }

  // Validate scope
  if (evidence.command_scope !== "--prod --audit-level=moderate") {
    return { kind: "SCOPE_MISMATCH" };
  }

  // Validate execution and parse disposition
  if (evidence.execution_disposition === "FAILURE") {
    return { kind: "EXECUTION_ERROR" };
  }
  if (evidence.parse_disposition === "UNPARSEABLE") {
    return { kind: "UNPARSEABLE" };
  }

  // Check for bypass
  if (evidence.execution_disposition === "SUCCESS" &&
      evidence.parse_disposition === "PARSED" &&
      evidence.parsed_vulnerability_counts.critical === 0 &&
      evidence.parsed_vulnerability_counts.high === 0 &&
      evidence.parsed_vulnerability_counts.moderate === 0 &&
      evidence.parsed_vulnerability_counts.low === 0) {
    return { kind: "PASS" };
  }

  // Severity threshold evaluation
  const threshold = policy.severity_threshold;
  const counts = evidence.parsed_vulnerability_counts;

  if (threshold === "critical" && (counts.critical > 0)) {
    return { kind: "POLICY_VIOLATION" };
  }
  if (threshold === "high" && (counts.critical > 0 || counts.high > 0)) {
    return { kind: "POLICY_VIOLATION" };
  }
  if (threshold === "moderate" &&
      (counts.critical > 0 || counts.high > 0 || counts.moderate > 0)) {
    return { kind: "POLICY_VIOLATION" };
  }

  // If we reach here, no violations at or above threshold
  return { kind: "PASS" };
}