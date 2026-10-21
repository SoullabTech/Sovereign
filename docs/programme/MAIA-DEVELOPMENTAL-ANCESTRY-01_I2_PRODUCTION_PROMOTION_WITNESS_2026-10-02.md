# MAIA-DEVELOPMENTAL-ANCESTRY-01 — I2 PRODUCTION PROMOTION WITNESS

**Date:** 2026-10-02
**Standing:** production deployment witness
**Class:** C — documentary custody record
**Runtime authority:** descriptive only; this record does not authorize a further deploy.

## 1. Production cut

Live baseline before promotion:

`12b461bd8778c148060250c002a54079f4f58221`

Subject:

`feat(writers-studio): pace MAIA insight with the writer`

The ancestry stack was rebased directly onto that live runtime:

`12b461bd8 → 3d4bd5010 (I0) → 7ff8bd8b7 (I0A) → 13a0308d7 (I1)`

All nine ancestry artifacts were byte-identical to their admitted canonical counterparts before promotion.

## 2. Preparation witness

Exact candidate:

`13a0308d706c684f21aa53741791cb224334ff82`

Prepared image:

`sha256:8986038381b730aa71b1914b5a6c3f31de26bb4329819eb41450cd4384f0e1d3`

Preparation gates:
- target descends from live baseline;
- disk gate passed with 339 GB free;
- Co-Lab boundaries: 33 passed / 0 failed / 0 warned;
- production-pending migrations: none;
- immutable build context established;
- built image provenance: GIT_COMMIT=13a0308d7;
- production reader remained on 12b461bd8 during preparation.

## 3. Cutover witness

Separate founder authorization was given after preparation.

Cutover command:

`scripts/pre-deploy-gate.sh cutover-maia 13a0308d7`

Cutover gates:
- ancestry re-proved against live 12b461bd8;
- Co-Lab boundaries re-proved 33/0/0;
- no production-pending migrations;
- prepared candidate custody verified;
- rollback image frozen at live baseline image;
- MAIA reader recreated with --force-recreate --no-deps;
- running provenance verified:
  `printenv GIT_COMMIT = Config.Env GIT_COMMIT = asserted SHA = 13a0308d7`.

## 4. Immediate production observation

Running runtime:

`GIT_COMMIT=13a0308d7`

Running image:

`sha256:8986038381b730aa71b1914b5a6c3f31de26bb4329819eb41450cd4384f0e1d3`

Container:
- restart count: 0
- health: healthy
- public https://soullab.life/: HTTP 200
- startup schema compatibility check: PASS
- recent fatal/panic/unhandled error scan: no matches at witness time.

The previously live Writer's Studio commits remain ancestors of the running cut:
- a01e8cd6f
- e47e690c8
- 7be140182
- 12b461bd8

## 5. Schema and ancestry state

Production migration ledger contains:

`20261001000001_developmental_memory_source_exchange.sql`

Applied at:

`2026-10-02 00:20:47.014392+00`

Production column:

`developmental_memories.source_exchange_id uuid NULL`

At immediate witness:
- conversation turns created after cutover: 0
- developmental memories with non-null source_exchange_id: 0

Therefore the correct standing is:

`DEPLOYED / HEALTHY / NOT YET BEHAVIORALLY EXERCISED`

No historical lineage was manufactured.

## 6. Witness ceiling

This record does **not** claim that forward ancestry has yet been observed on a real member turn.

Behavioral witness requires a real, non-Sanctuary member exchange after cutover that:
1. persists one exchange UUID;
2. forms a qualifying developmental memory;
3. records that same UUID in developmental_memories.source_exchange_id;
4. does not rely on backfill or heuristic inference.

No synthetic conversation should be created solely to satisfy this witness.


## 7. Subsequent production supersession

After the I2 cutover witness above, production advanced again outside this lane.

Observed current runtime:

`d4655e6477fa40b8f94c5f8f91be47198288d2af`

Subject:

`Merge pull request #1727 from SoullabTech/chore/production-canonical-lineage-convergence-20261002`

Observed container:
- image: `sha256:d8dbc4b2f1226a25a485e9bdbf509f948d20188414246d867328ee19ec2739ab`
- created: `2026-10-02T12:08:26.421055868Z`
- restarts: 0
- health: healthy
- public `https://soullab.life/`: HTTP 200

This superseding runtime contains both:
- canonical I1 implementation commit `de7349a88dd6e0b23a6be1879055acee1fccb034`;
- canonical I1 merge commit `16eff5cc2ec5684f92f1ab6cca6cd042949a7382`.

Direct source inspection of `d4655e647` confirms the I1 `exchangeId → source_exchange_id` wiring remains present.

At the supersession witness:
- conversation turns created since the original 13a cutover boundary: 0;
- developmental memories with non-null `source_exchange_id`: 0.

Therefore the historical I2 cutover witness remains true for the 13a promotion event, but `13a0308d7` must not be described as the current live runtime after this supersession.

Current behavioral standing remains:

`DEPLOYED IN CURRENT RUNTIME / HEALTHY / NOT YET BEHAVIORALLY EXERCISED`

No historical lineage has been manufactured.
