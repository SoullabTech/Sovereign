# R35 — Editorial encryption and legacy Draft HTTP semantics reconciled (review only)

**October 16, 2026 · Source-only local integration PASS; actual browser and five-member production HOLD.**

## Clean lineage

- R33 encrypted author-controlled Save/Apply/Undo: `88f33c92a2b22bec355503fc734c499c0b4db7bb`.
- R34 source-only original Draft HTTP-route compatibility: `50a31e2bd090d1ac49e3239199de4be4541510f0`.
- Both merged without conflicts into `fix/ws-beta-r35-editorial-route-compatibility-20261016`, preserving original worktrees. R34 was already separately completed; R34 WebKit review remains a separate dirty worktree that R35 does not edit or claim to qualify.

## Actual result

Selected integrated R33/R34 Writer's Studio source/auth/consent/encrypted-history/legacy-response tests: **56 suites, 605 tests PASS**; scoped strict TypeScript `tsconfig.r34-route-parity.json` PASS. No browser, backend service deployment or real member data exercised in this R35 run.

The R33 backend proves synthetic immutable encrypted full-text version chain with explicit fixture author confirmation and reversible Apply/Undo; the R34 **pure and intentionally nonwritable** source gate keeps legacy HTTP semantics visible: `baseRevisionId`, optimistic version, idempotency key/replay, payload digest, frozen section IDs, checkpoint count, source partition and restore rules. A separate R34 response is always `canWrite=false`, even on validation PASS.

**Important architectural gap:** Putting these two modules into one Git worktree is NOT connecting a verified member's real UI button to encrypted storage. The legacy Draft and Editorial routes are unchanged; existing ordinary plaintext SQL persists. A full replacement must accept and produce the exact legacy response/idempotency and checkpoint semantics, with independently minted author gesture, current session+consent, real Work-key/withdrawal authority, and external vault/PG16 atomicity. The source test does not certify a functional editor, WebKit/Safari, authentic MAIA 2–4 proposals, changed-word diff or adjustable columns.

## Required next engineering gate

1. First build a **fictional-only route adapter** translating one real section-addressable Draft action into a R33 encrypted append while preserving the R34 version/hash/idempotency/checkpoint and frozen-section contract; prove a duplicate request does not append a duplicate encrypted history version.
2. Test explicit author Apply/Undo from an actual browser event and the exact session/consent bound request, without accepting a caller-forged `authorConfirmed=true`. Keep real writing disabled.
3. Physically qualify PG16, encrypted fsync/readback vault, replay ledger, restart, foreign member refusal, Work withdrawal/key outage and no SQL/WAL/plaintext fallback, including durable encrypted-orphan reconciliation.
4. Only after finishing Source/draft/revision/keeps/derived/old-backup migration, independent operational KMS and cold restore, real Mac/iPhone Safari + Portal + MAIA workflow, clean enforced image, rollback and founder source/image GO may five invited members enter `soullab.life`.

**No AWS keys, KMS resources, billable provider calls, production routes, DNS, identities, real manuscripts, tester emails or deployments were changed.**
