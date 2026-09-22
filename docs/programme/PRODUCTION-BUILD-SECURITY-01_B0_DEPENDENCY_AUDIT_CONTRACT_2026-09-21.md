# PRODUCTION-BUILD-SECURITY-01 / B0 Dependency Audit Contract

## Purpose
Establish a deterministic, pure, and immutable contract for dependency audit evaluation in production.

## Scope
This contract governs the evaluation of dependency security audits performed during production deployment. It defines the expected evidence, policy inputs, and outcome semantics.

## Evidence Binding
- **Target Commit**: `7c58ad533`
- **Manifest Path**: `package.json`
- **Manifest SHA256**: `dd8612af09e63cba`
- **Lockfile Path**: `package-lock.json`
- **Lockfile SHA256**: `b4e56c7b7a382d0a`
- **Declared Package Manager**: `npm@10.8.2`
- **Expected Dependency Binding**:
  - Target Commit: `7c58ad533`
  - Manifest Path: `package.json`
  - Manifest SHA256: `dd8612af09e63cba`
  - Lockfile Path: `package-lock.json`
  - Lockfile SHA256: `b4e56c7b7a382d0a`
  - Declared Package Manager: `npm@10.8.2`
- **Evidence Source Class**: `PACKAGE_MANAGER_AUDIT` (distinct from CI_AUDIT or EXTERNAL_ADVISORY)
- **Audit Tool Identity**: `pnpm` (if present) or `npm audit`
- **Audit Tool Version**: _recorded_
- **Command Scope**: `--prod --audit-level=moderate`
- **Execution Disposition**: `EXECUTED`, `UNAVAILABLE`, `ERROR`, or `BYPASSED`
- **Parse Disposition**: `PARSED` or `UNPARSEABLE`
- **Parsed Vulnerability Counts**: `critical`, `high`, `moderate`, `low` (must be finite non-negative integers)
- **Recorded Timestamp**: Provenance-only
- **Provenance**: `scripts/deploy-production.sh`
- **Bypass Authority**: _recorded_ (if applicable)

## Policy Inputs
- **Dependency Scope**: `prod`, `dev`, or `all` (explicitly defined)
- **Severity Threshold**: `low`, `moderate`, `high`, or `critical` (Founder-reserved)
- **Bypass Authority**: _Founder-reserved_ (must be explicitly provided)

## Outcome Semantics
- **PASS**: All evidence is complete, parseable, exact, and no findings at or above threshold.
- **AUDIT_UNAVAILABLE**: No audit tool found or executed.
- **EXECUTION_ERROR**: Tool execution failed.
- **UNPARSEABLE**: Audit output could not be parsed or vulnerability counts are invalid (non-integral, non-finite, negative).
- **STALE_EVIDENCE**: Manifest/lockfile identity mismatch.
- **SOURCE_MISMATCH**: Evidence source does not match expected (`PACKAGE_MANAGER_AUDIT` required).
- **SCOPE_MISMATCH**: Audit scope does not match policy.
- **POLICY_INPUT_MISSING**: Threshold or bypass authority not provided.
- **POLICY_VIOLATION**: Vulnerabilities found at or above threshold.
- **BYPASSED**: Audit was skipped with explicit bypass authority (distinct from PASS).

## Notes
- The mismatch between `pnpm` and `npm` audit execution is a custody finding, not a repair decision.
- The final production severity threshold, dependency-scope policy, and bypass authority are unresolved Founder decisions.
- Only `EXECUTED` dispositions can reach ordinary `PASS`.
- `BYPASSED` is distinct from `PASS` and requires explicit bypass authority.

## Next Intermediate Act
B0R2-B: Final B0 verification and Founder adjudication of threshold/scope/bypass policy.