# F5-CONFORMANCE-REPAIR-01 - P5-D-R4 EVIDENCE REFERENCE PARAMETER TYPING - FOUNDER AUTHORIZATION

**Date:** 2026-09-17
**Founder act:** `P5-D-R4 · EVIDENCE REFERENCE PARAMETER TYPING`
**Returned gate:** `a2a4ab36bfd6bfc2d1b568918c53471c29d55da9`

```text
R4 MODE                       COMPLETION-EVIDENCE SQL PARAMETER REPAIR
R3 RUNTIME AUTHORITY          FROZEN / UNCHANGED
CIRCLE / S5 ORDERING          FROZEN / UNCHANGED
PRODUCTION / STAGING          CLOSED
GOVERNED RESTORE REHEARSAL    CLOSED
CANONICAL MERGE / DEPLOY      CLOSED
```

## Authority spent

R4 may repair only the SQL parameter typing used when `recordCompletionEvidence()` writes `disposition_succeeded`, `verification_succeeded`, and `act_completed` evidence references. It may add focused falsifiers and one disposable PostgreSQL 17.7 executor witness proving durable `act_completed`.

R4 may not change erasure dispositions, runtime authority, plan construction, destructive ordering, Circle lifecycle, S5 tombstone semantics, route/client behavior, restore semantics, production/staging state, merge, or deploy.

## Acceptance

R4 passes only if:

1. UUID act identity and text evidence reference use distinct typed SQL parameters;
2. both bulk completion-evidence inserts store S5-backed evidence as the act UUID text and ordinary evidence as `p5d-poststate-census`;
3. terminal `act_completed` stores its evidence reference as text without reusing the UUID-typed parameter;
4. focused/static and full P5/R3/R4 regression gates remain green;
5. a fresh PostgreSQL 17.7 synthetic executor reaches `completed / 200 / accountChanged=true` with durable ledger, S5 and Circle post-state evidence;
6. no production/staging/restore/merge/deploy authority is spent.

R4 PASS may discharge the P5-E executor blocker. It does not itself reopen governed restore rehearsal.
