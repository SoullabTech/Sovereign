# F5-CONFORMANCE-REPAIR-01 · P5-E RUNTIME REHEARSAL — FOUNDER AUTHORIZATION

**Date:** 2026-09-17
**Founder act:** continuation after `P5-D-R1` PASS at `87f4ef0514360fb66cd16cb5e3d197ae6fc781c2`

```text
P5-D SUBJECT                  f9a6855828b6f3fb66c2cb16eb16153dc3ae7f7b
P5-D-R1 SUBJECT               87f4ef0514360fb66cd16cb5e3d197ae6fc781c2
P5-E MODE                     DISPOSABLE EXECUTOR + GOVERNED RESTORE REHEARSAL
PRODUCTION / STAGING          CLOSED
REAL MEMBER DATA              CLOSED
CANONICAL MERGE / DEPLOY      CLOSED
```

This continuation reopens only the disposable runtime and restore witness after R1 discharged the migration-application stop. It authorizes a fresh PostgreSQL 17.7 environment, synthetic members and Circle state, a pre-erasure backup, the governed executor, and `scripts/restore-governed.sh`.

Stop immediately if the synthetic environment cannot represent the governed pre-erasure state, the executor cannot complete truthfully, or restore semantics cannot preserve the erased-member/Circle invariants.
