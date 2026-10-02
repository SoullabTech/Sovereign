# MAIA-DEVELOPMENTAL-ANCESTRY-01 — I2 PRODUCTION CUT

**Date:** 2026-10-02
**Standing:** isolated production candidate · not deployed
**Class:** A
**Production base:** `298414555`

## 1. Purpose

Create the smallest deployable cut that can activate admitted I1 lineage wiring without promoting the unrelated canonical delta.

The candidate is based directly on the exact production runtime commit `298414555`.

It contains only:
- I0 migration source + schema custody record;
- I0A execution-custody record;
- I1 runtime wiring;
- I1 focused falsifiers;
- this I2 release-custody record.

It does not contain the other canonical commits between production and current main.

## 2. Existing production database state

Production already contains:
- `developmental_memories.source_exchange_id uuid NULL`;
- the admitted partial index;
- the admitted column comment;
- a `schema_migrations` row for `20261001000001_developmental_memory_source_exchange.sql`;
- zero rows with non-null source exchange lineage at preflight witness.

The ledger row checksum is blank.

## 3. Migration-runner behavior

Current `scripts/apply-migrations.sh` treats a migration filename already present with NULL/empty checksum as:

`Skipping (already applied, no checksum stored)`

Therefore this production cut must not re-execute I0 DDL.

The blank historical checksum remains visible; I2 does not rewrite custody history.

## 4. Isolation rule

I2 must remain a direct descendant of `298414555` plus only the ancestry programme changes.

Any unrelated canonical merge entering the candidate defeats this production cut.

## 5. Required local gates

Before a production-promotion act may open:
1. focused ancestry falsifiers pass;
2. TypeScript no-regression gate passes;
3. migration lock-timeout law passes;
4. production-base diff remains bounded to the declared programme files;
5. deploy tooling can target the exact candidate commit rather than implicitly deploying current canonical;
6. production preflight still shows zero populated lineage rows before swap.

## 6. Stop rule

Building and pushing this candidate does not authorize production deployment.

Production promotion requires an exact-SHA deployment act and a post-swap witness:
- runtime SHA equals candidate SHA;
- migration is skipped, not re-executed;
- next eligible new developmental memory carries the exact persisted exchange UUID;
- no historical row is backfilled;
- Sanctuary remains non-writing.
