# MAIA-DEVELOPMENTAL-ANCESTRY-01 — I2R1 PRODUCTION CUT

**Date:** 2026-10-02
**Standing:** isolated production candidate · not deployed
**Class:** A
**Production base:** `7be140182723a25232689cc8c2afd5df14d37faa`

## 1. Why R1 exists

I2 originally isolated ancestry on production runtime `298414555`.

Before that candidate could deploy, another governed lane successfully promoted Writer's Studio working-style runtime `7be140182`.

Deploying the original I2 candidate afterward would have regressed those newly live commits. I2 therefore became obsolete by its own production-base invariant.

I2R1 rebases only the ancestry programme onto the newly live production SHA.

## 2. Included change

Relative to `7be140182`, this candidate contains only:
- I0 migration source and schema record;
- I0A execution-custody record;
- I1 runtime lineage wiring;
- I1 focused falsifiers;
- this I2R1 custody record.

No unrelated canonical commits are imported.

## 3. Local witness

Applied onto `7be140182` with zero conflicts.

Verified on the resulting tree:
- focused developmental-ancestry falsifiers: 6/6 PASS;
- migration lock-timeout law: 10/10 PASS;
- TypeScript no-regression gate: PASS.

## 4. Production database relation

The I0 schema is already present in production.

The migration filename is already ledgered, with blank historical checksum. Current migration-runner semantics classify it as already applied and skip its DDL.

Before promotion, the exact candidate snapshot must again show zero pending production migrations and production must show zero historically backfilled `source_exchange_id` values.

## 5. Stop rule

This candidate may not deploy until:
- the exact candidate SHA is admitted by the I3 deployment act;
- its review/CI surface is green;
- production runtime still equals the declared base;
- deploy lock is free;
- exact-SHA preflight passes.

Current canonical tip is not an authorized substitute.
