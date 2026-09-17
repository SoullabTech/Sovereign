# F5-CONFORMANCE-REPAIR-01 - P5-D-R3 RUNTIME SCHEMA AUTHORITY - FOUNDER AUTHORIZATION

**Date:** 2026-09-17
**Founder act:** `P5-D-R3 · RUNTIME SCHEMA AUTHORITY`
**Returned gate:** `09e4f884bab49b74edad7004fa0e6ece0a0ff3ee`

```text
R3 MODE                         RUNTIME SCHEMA AUTHORITY RECONCILIATION
SOURCE / MIGRATION PROVENANCE   PRESERVED
PRODUCTION / STAGING            CLOSED
EXECUTOR MUTATION               CLOSED
RESTORE REHEARSAL               CLOSED
CANONICAL MERGE / DEPLOY        CLOSED
```

## Authority spent

R3 may establish a separate runtime execution-authority object from a fresh canonical PostgreSQL 17.7 bootstrap + full migration run; correct runtime FK identifier decoding; bind direct-locus and FK execution planning to that runtime object; preserve v3 as source/migration provenance; add static/runtime drift guards, tests and documentary evidence; and rerun the mandatory read-only activation preflight.

Runtime-only member-FK effects may receive only explicit fail-closed `refuse` standing in R3 unless prior P5-D authority already governs the same runtime effect. Source-only/stale objects receive no runtime execution standing.

## Acceptance

R3 passes only if:

1. PostgreSQL FK local columns are real `text[]` identifiers, never stringified `name[]` payloads;
2. the runtime authority accounts for every current direct member-bound locus and every current member-FK constraint;
3. source-only, runtime-only and count-drift cases remain explicitly distinguished;
4. `dream_entries` is preserved as stale source provenance but excluded from runtime planning without being treated as observed zero;
5. runtime-only FK effects remain `refuse` and cannot acquire destructive authority by inference;
6. repository schema-input drift invalidates the runtime authority artifact;
7. a fresh runtime schema matches the frozen runtime authority exactly;
8. the synthetic read-only P5-E preflight reaches `candidate_destructive_plan`, `activationReady=true`, `blockers=0` before R3 may close.

R3 does not authorize executor mutation or restore rehearsal. Those remain P5-E acts after R3 PASS.
