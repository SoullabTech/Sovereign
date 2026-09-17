# F5-CONFORMANCE-REPAIR-01 - P5-D-R3 RUNTIME SCHEMA AUTHORITY - RESULT

**Date:** 2026-09-17
**Authority:** `F5-CONFORMANCE-REPAIR-01_P5D-R3_FOUNDER_AUTHORIZATION_2026-09-17.md`
**Returned gate:** `09e4f884bab49b74edad7004fa0e6ece0a0ff3ee`

```text
RUNTIME DIRECT-LOCUS AUTHORITY       PASS
RUNTIME FK IDENTIFIER REPRESENTATION PASS
RUNTIME FK AUTHORITY                 PASS
SOURCE/RUNTIME PROVENANCE SPLIT      PASS
SCHEMA-INPUT DRIFT GUARD             PASS
READ-ONLY ACTIVATION PREFLIGHT       PASS
PRODUCTION / STAGING                 UNTOUCHED
```

## 1 - R3 outcome

R3 separates the previously conflated authority planes. `account-erasure-registry.v3.json` remains source/migration provenance. `account-erasure-runtime-authority.v1.json` freezes the actual canonical migrated PostgreSQL execution graph and links every current object back to v3 where possible.

Runtime-only FK groups receive only explicit `refuse`; source-only objects retain provenance but no execution standing. `dream_entries` therefore remains visible as source history without becoming an `unknown` runtime locus or guessed zero.

## 2 - Acceptance verdict

All eight R3 acceptance conditions are discharged:

1. **PASS** - FK local columns are real `text[]` identifiers;
2. **PASS** - all 318 current direct loci and all 316 current member-FK constraints are accounted;
3. **PASS** - runtime-only, source-only and count-drift cases remain explicit;
4. **PASS** - `dream_entries` is stale provenance, not runtime execution state;
5. **PASS** - all 36 runtime-only FK groups are fail-closed `refuse`;
6. **PASS** - v3 or baseline/migration-corpus drift invalidates the static runtime-authority gate;
7. **PASS** - live runtime graph fingerprint and exact object identities match the frozen R3 authority;
8. **PASS** - the synthetic read-only preflight reports `candidate_destructive_plan`, `activationReady=true`, `blockers=0`.

## 3 - Repository evidence

```text
P5/R3 suites               14 / 14 PASS
P5/R3 tests               133 / 133 PASS
ship TypeScript            229 diagnostics vs baseline 239 - 0 regressions
scripts TypeScript parent   40 diagnostics
scripts TypeScript R3       40 diagnostics - 0 new / 0 resolved
check:erasure-runtime-authority PASS
ci:sovereignty             PASS
member-ID logging          532 / 532 baseline - 0 new
design canon               PASS - no member-facing UI delta
git diff --check           PASS
```

Critical candidate Git blobs before commit:

```text
config/governance/account-erasure-runtime-authority.v1.json
  f001bfc19e6a80531b2c696be569e5996980f7e8

lib/erasure/accountErasureRuntimeAuthority.ts
  3300467d5551d75bdae1f3f3d4ce42265aed8601

lib/erasure/accountErasureFacts.ts
  6a65206749a0481e3465e59c48e2b733f4c147c4

lib/erasure/accountErasureActivationPlan.ts
  ffafaa0000ca592196bdcb14702cdd2cb87df0d0

lib/erasure/accountErasureExecutor.ts
  3d0ff79fcb763bb4fa08e9c173016d36b96f7d04

scripts/erasure/build-account-erasure-runtime-authority.ts
  98a9b5911bb3a757c70973acf8f1f61cf38a4b06

scripts/check-account-erasure-runtime-authority.ts
  9d654e58594179044b159b9515528c2e7dbf6c91

package.json
  093e72092b6af9f1f24e688015a6eb6865a42b55

.githooks/pre-commit
  53bd4fb3d613d420d4e34ce6aa3e245a21a60669

docs/programme/F5-CONFORMANCE-REPAIR-01_P5D-R3_FOUNDER_AUTHORIZATION_2026-09-17.md
  148071f49138cb74afb9432b21594a7d84ff55c5

```

## 4 - Standing

```text
P5-A      COMPLETE
P5-B      COMPLETE
P5-C      COMPLETE
P5-D      CANDIDATE - R1 + R2 + R3 blockers repaired
P5-D-R1   CLOSED / PASS
P5-D-R2   CLOSED / PASS
P5-D-R3   CLOSED / PASS

P5-E read-only preflight blocker     DISCHARGED
P5-E executor runtime rehearsal      CLOSED - new founder continuation required
P5-E governed restore rehearsal      CLOSED - new founder continuation required
P5-E rollout-readiness ruling        NOT YET EARNED
CANONICAL MERGE / DEPLOY             CLOSED
PRODUCTION / STAGING                 UNTOUCHED
```

R3 does not itself invoke the executor. The next exact act is a new founder continuation reopening P5-E to run the synthetic governed executor and pre-erasure backup / governed-restore rehearsal against the R3 authority.
