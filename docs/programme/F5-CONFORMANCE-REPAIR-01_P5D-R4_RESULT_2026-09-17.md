# F5-CONFORMANCE-REPAIR-01 - P5-D-R4 EVIDENCE REFERENCE PARAMETER TYPING - RESULT

**Date:** 2026-09-17
**Authority:** `F5-CONFORMANCE-REPAIR-01_P5D-R4_FOUNDER_AUTHORIZATION_2026-09-17.md`
**Returned gate:** `a2a4ab36bfd6bfc2d1b568918c53471c29d55da9`

```text
UUID / TEXT PARAMETER SEPARATION    PASS
DISPOSITION EVIDENCE REFERENCES     PASS
VERIFICATION EVIDENCE REFERENCES    PASS
TERMINAL COMPLETION EVIDENCE        PASS
SYNTHETIC EXECUTOR COMPLETION       PASS
TRANSACTION / LEDGER INVARIANTS     PASS
PRODUCTION / STAGING                UNTOUCHED
```

## 1 - R4 outcome

The PostgreSQL `22P02` failure was caused by reusing a UUID-typed act-id placeholder as a text evidence reference. R4 gives each semantic value its own typed SQL parameter.

The repair is limited to `recordCompletionEvidence()` plus focused falsification. It does not change the immutable plan, runtime authority, erasure dispositions, destructive order, Circle lifecycle, S5 tombstone semantics, route/client behavior, or restore logic.

## 2 - Acceptance verdict

All six R4 acceptance conditions are discharged:

1. **PASS** - UUID act identity and text evidence reference use distinct typed SQL parameters;
2. **PASS** - bulk disposition and verification evidence store act UUID text for all 10 S5-backed rows and `p5d-poststate-census` for all 604 ordinary rows;
3. **PASS** - `act_completed.evidence_ref` stores the act UUID as text via its own parameter;
4. **PASS** - focused, full P5/R3/R4, type-health, runtime-authority, sovereignty and design gates remain green;
5. **PASS** - a fresh PostgreSQL 17.7 synthetic executor reaches `completed / 200 / accountChanged=true` with durable act, 614 plan rows, 614 successful disposition outcomes, 614 successful verification events, S5 tombstones and lawful Circle post-state;
6. **PASS** - no production, staging, restore, merge or deploy authority was spent.

## 3 - Repository evidence

```text
focused executor suite        7 / 7 PASS
P5/R3/R4 suites              14 / 14 PASS
P5/R3/R4 tests              134 / 134 PASS
ship TypeScript              229 diagnostics vs baseline 239 - 0 regressions
scripts TypeScript parent     40 diagnostics
scripts TypeScript R4         40 diagnostics - 0 new / 0 resolved
check:erasure-runtime-authority PASS
ci:sovereignty               PASS
member-ID logging            532 / 532 baseline - 0 new
design canon                 PASS - no member-facing UI delta
git diff --check             PASS
```

Critical candidate Git blobs before commit:

```text
lib/erasure/accountErasureExecutor.ts
  1e6713e77acc45ec7f5765b51c38f75f7b21db04

lib/erasure/__tests__/accountErasureExecutor.test.ts
  fee4e0f05761fe392ea16d8fab773e0bdb9ec933

docs/programme/F5-CONFORMANCE-REPAIR-01_P5D-R4_FOUNDER_AUTHORIZATION_2026-09-17.md
  49e692dec93e7ce7ab7f7fe856c45cba3d2afc23
```

## 4 - Standing

```text
P5-A      COMPLETE
P5-B      COMPLETE
P5-C      COMPLETE
P5-D      CANDIDATE - R1 + R2 + R3 + R4 blockers repaired
P5-D-R1   CLOSED / PASS
P5-D-R2   CLOSED / PASS
P5-D-R3   CLOSED / PASS
P5-D-R4   CLOSED / PASS

P5-E executor blocker                 DISCHARGED
P5-E governed restore rehearsal       CLOSED - new founder continuation required
P5-E rollout-readiness ruling         NOT YET EARNED
CANONICAL MERGE / DEPLOY              CLOSED
PRODUCTION / STAGING                  UNTOUCHED
```

R4 does not itself run governed restore. The next exact act is a new founder continuation reopening P5-E to replay a pre-erasure backup through `scripts/restore-governed.sh` against a successfully erased synthetic member and prove anti-resurrection plus Circle historical-state preservation.
