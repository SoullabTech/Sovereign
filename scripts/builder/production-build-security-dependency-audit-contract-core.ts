/**
 * PRODUCTION-BUILD-SECURITY-01 / B0 — DEPENDENCY-AUDIT CONTRACT EVALUATOR
 *
 * Pure deterministic evaluator for dependency audit evidence.
 * No IO. No deployment authority.
 */

export type Severity = "low" | "moderate" | "high" | "critical";

export type VulnerabilityCounts = {
  critical: number;
  high: number;
  moderate: number;
  low: number;
};

export type SourceClass = "PACKAGE_MANAGER_AUDIT" | "CI_AUDIT" | "EXTERNAL_ADVISORY";

export type ExecutionDisposition = "EXECUTED" | "UNAVAILABLE" | "ERROR" | "BYPASSED";

export type ParseDisposition = "PARSED" | "UNPARSEABLE" | "NOT_APPLICABLE";

export type DependencyAuditEvidence = {
  target_commit: string;
  manifest_path: string;
  manifest_sha256: string;
  lockfile_path: string;
  lockfile_sha256: string;
  declared_package_manager: string;
  source_class: SourceClass;
  audit_tool_identity: string;
  audit_tool_version: string;
  command: string;
  dependency_scope: "prod" | "dev" | "all";
  execution_disposition: ExecutionDisposition;
  parse_disposition: ParseDisposition;
  parsed_vulnerability_counts: VulnerabilityCounts | null;
  recorded_timestamp: string;
  provenance: string;
  bypass_authority: string | null;
};

export type ExpectedDependencyBinding = {
  target_commit: string;
  manifest_path: string;
  manifest_sha256: string;
  lockfile_path: string;
  lockfile_sha256: string;
  declared_package_manager: string;
};

export type DependencyAuditPolicy = {
  dependency_scope: "prod" | "dev" | "all";
  severity_threshold: Severity;
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

function isDependencyScope(value: unknown): value is DependencyAuditPolicy["dependency_scope"] {
  return value === "prod" || value === "dev" || value === "all";
}

function isSeverity(value: unknown): value is Severity {
  return value === "low" || value === "moderate" || value === "high" || value === "critical";
}

export function evaluateDependencyAudit(
  evidence: DependencyAuditEvidence,
  expected: ExpectedDependencyBinding,
  policy: DependencyAuditPolicy
): DependencyAuditOutcome {
  // Validate policy inputs at runtime; TypeScript unions are not a runtime boundary.
  if (!isDependencyScope(policy.dependency_scope) || !isSeverity(policy.severity_threshold)) {
    return { kind: "POLICY_INPUT_MISSING" };
  }

  // Validate evidence binding against expected
  if (evidence.target_commit !== expected.target_commit ||
      evidence.manifest_path !== expected.manifest_path ||
      evidence.manifest_sha256 !== expected.manifest_sha256 ||
      evidence.lockfile_path !== expected.lockfile_path ||
      evidence.lockfile_sha256 !== expected.lockfile_sha256 ||
      evidence.declared_package_manager !== expected.declared_package_manager) {
    return { kind: "STALE_EVIDENCE" };
  }

  // Validate source class
  if (evidence.source_class !== "PACKAGE_MANAGER_AUDIT") {
    return { kind: "SOURCE_MISMATCH" };
  }

  // Validate audit tool identity matches expected package manager
  const expectedManager = expected.declared_package_manager.split("@")[0];
  if (evidence.audit_tool_identity !== expectedManager) {
    return { kind: "SOURCE_MISMATCH" };
  }

  // Handle execution dispositions
  if (evidence.execution_disposition === "UNAVAILABLE") {
    return { kind: "AUDIT_UNAVAILABLE" };
  }
  if (evidence.execution_disposition === "ERROR") {
    return { kind: "EXECUTION_ERROR" };
  }
  if (evidence.execution_disposition === "BYPASSED") {
    return { kind: "BYPASSED" };
  }

  // Validate parse disposition and counts
  if (evidence.parse_disposition !== "PARSED" ||
      evidence.parsed_vulnerability_counts === null) {
    return { kind: "UNPARSEABLE" };
  }

  const counts = evidence.parsed_vulnerability_counts;
  // Validate that each count is a finite non-negative integer
  for (const key of ["critical", "high", "moderate", "low"] as const) {
    if (!Number.isInteger(counts[key]) ||
        !Number.isFinite(counts[key]) ||
        counts[key] < 0) {
      return { kind: "UNPARSEABLE" };
    }
  }

  // Validate dependency scope matches policy
  if (evidence.dependency_scope !== policy.dependency_scope) {
    return { kind: "SCOPE_MISMATCH" };
  }

  // Evaluate threshold
  const threshold = policy.severity_threshold;
  const hasViolation = (
    (threshold === "critical" && counts.critical > 0) ||
    (threshold === "high" && (counts.critical > 0 || counts.high > 0)) ||
    (threshold === "moderate" &&
     (counts.critical > 0 || counts.high > 0 || counts.moderate > 0)) ||
    (threshold === "low" &&
     (counts.critical > 0 || counts.high > 0 || counts.moderate > 0 || counts.low > 0))
  );

  if (hasViolation) {
    return { kind: "POLICY_VIOLATION" };
  }

  // If we reach here, all checks passed and no violations
  return { kind: "PASS" };
}