# F5-CONFORMANCE-REPAIR-01 - P5-E EXECUTOR + RESTORE REHEARSAL - FOUNDER AUTHORIZATION

**Date:** 2026-09-17
**Founder act:** "lets do it" after P5-D-R2 PASS at `6df34018547c71c218230d8d826ce5a6f7136cb8`

```text
SUBJECT                         6df34018547c71c218230d8d826ce5a6f7136cb8
MODE                            DISPOSABLE EXECUTOR + GOVERNED RESTORE REHEARSAL
PRODUCTION / STAGING            CLOSED
REAL MEMBER DATA                CLOSED
CANONICAL MERGE / DEPLOY        CLOSED
```

## Authority spent

This continuation reopens P5-E only for a fresh local PostgreSQL 17.7 witness against synthetic identities. It may bootstrap/migrate an isolated database, seed only adjudicated erasure surfaces, take a pre-erasure backup, run the governed executor, replay the backup through `scripts/restore-governed.sh`, and record the evidence.

The witness must stop before mutation unless the runtime plan is complete, has no governed-refusal blocker, and reports `activationReady=true`.

A PASS requires durable `act_completed` evidence, a surviving erasure ledger + S5 member tombstone, no resurrected member after governed restore, and Circle history restored only as `revoked / withdrawn + payload NULL / left`.

This act does not authorize production/staging access, real-member deletion, canonical merge, deploy, or rollout.
