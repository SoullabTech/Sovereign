# MAIA-DEVELOPMENTAL-ANCESTRY-01 — I0A SCHEMA EXECUTION CUSTODY

**Date:** 2026-10-01 / 2026-10-02 UTC
**Standing:** EVIDENCE + custody disposition
**Authority:** founder continuation after I0 admission
**Runtime/code authority:** NONE

## 1. What happened

PR #1673 merged at 2026-10-01T23:48:00Z, merge commit `5898fbbf6e35407a4004cd60cbbd80837547916b`.

I0's binding stop rule admitted the migration source but did not authorize:
- production migration execution;
- runtime wiring;
- deployment.

Production `schema_migrations` nevertheless records:

`20261001000001_developmental_memory_source_exchange.sql | 2026-10-02 00:20:47.014392+00`

The production column `developmental_memories.source_exchange_id` exists.

## 2. Execution custody

No matching command was found in the inspected minisforum shell histories.
No matching recent file was found in `.deploy-evidence/`.

The migration was the only ledger entry applied in the inspected 00:15–00:25 UTC window.

Therefore:

`EXECUTION OCCURRED · ACTOR / MECHANISM UNRESOLVED`

This record does not infer who or what executed it.

## 3. Production shape witness

The applied production schema matches the admitted I0 shape:

- `source_exchange_id uuid NULL`;
- partial index `idx_developmental_memories_source_exchange`;
- exact canonical column comment;
- no populated provenance values at witness time: `COUNT(*) = 0`.

The ledger checksum field is empty for this row.

Running MAIA at witness time reports `GIT_COMMIT=298414555`.
That runtime's `MemoryWriteback.WritebackInput` has no source-exchange field and no runtime reference to `source_exchange_id`.

Therefore the carrier is presently inert.

## 4. Classification

This is a sequence/custody deviation:

`canonical admission ≠ migration execution authority`

The migration was applied outside the recorded I0 execution authority boundary.

It is not classified here as data corruption or false provenance:
- the schema shape is faithful;
- historical rows remain NULL;
- runtime is unwired;
- zero developmental rows carry manufactured ancestry.

## 5. Disposition

Do not backfill.
Do not infer historical lineage.
Do not treat schema presence as runtime authorization.
Do not roll the additive inert carrier back merely to reenact the intended sequence.

Rollback-and-reapply would not restore the missing authorization event; it would add churn while preserving the same historical deviation.

## 6. Boundary from here

I0 schema carrier: CANONICAL + APPLIED
Execution custody: UNRESOLVED
Runtime lineage population: NONE
Historical backfill: PROHIBITED

I1 runtime wiring remains a separate act.

Before I1 opens, the runtime contract must continue to preserve:
1. one existing exchange identity per member-MAIA exchange;
2. no turn-id domain collapse;
3. no historical inference;
4. no Sanctuary write;
5. no retrieval/ranking/member-facing change.

This custody record does not itself open I1.
