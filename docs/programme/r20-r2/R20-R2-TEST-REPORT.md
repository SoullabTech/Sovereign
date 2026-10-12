# R20-R2 — Synthetic test report (2026-10-12)

**Source:** `origin/clean-main-no-secrets` `f574a70678`, isolated feature branch `feature/r20-r2-deletion-safe-recovery-20261012`.

## Completed tests

| Test | Observed |
|---|---|
| Focused TS typecheck (`tsconfig.r20-r2.json`) | PASS |
| Work deletion authority (fake SQL transaction) | 7/7 |
| Signed ledger anti-tamper/anti-rollback tests | 16/16 |
| Sealed synthetic restore and archive-custody planning | 13/13 |
| Total automated tests | **36/36** |
| Isolated PostgreSQL 16 migration | PASS; `--network none` and tmpfs |
| Synthetic member Work deletion and child ON DELETE CASCADE | PASS |
| Tombstone + outbox in same synthetic SQL transaction | PASS |
| Outbox UPDATE and DELETE refusal | PASS |
| Failure-induced SQL rollback of deleted Work | PASS |
| Transient synthetic PostgreSQL container cleanup | PASS |
| Shell syntax of PG test harness | PASS |
| Production PostgreSQL, member files, NAS backups | **NOT TOUCHED** |

The synthetic PG test ran on the Minisforum under a newly created disposable container named with prefix `r20-r2-synthetic-`, in DB `r20_r2_synthetic`; the container was automatically removed on exit.

## Tooling qualification

ESLint could not run in the isolated source tree with the existing shared node_modules. ESLint 8.57.1 in that checkout rejects the canonical repo's `eslint.config.mjs` dependency (`ERR_PACKAGE_PATH_NOT_EXPORTED: eslint/config`). This is an environment mismatch, not a passed lint check. Do not claim lint completed until compatible tooling is established.

## Earlier foundational evidence

Prior R20 sealed test: the current production-shaped restoration script returned success with a member-only synthetic deletion resurrected, and again with all three synthetic deleted rows restored after simulated lost ledger. Separate member-scope SQL correction eliminated deleted synthetic rows and hard-refused unknown tables. Source witness archived on Synology under `soullab-backups/maia-backups/restore-reports/R20-RECOVERY-BOUNDARY-20261012.md`.

## Explicit non-claims

These tests do **not** establish an independent authoritative signing service, real monotonic anti-rollback custody, complete derivation and vault-erasure coverage, signed archive high-water marks, deleted-user data purge across all backup locations, or safe production restoration. They provide a bounded synthetic candidate for independent review.

**Gate:** No production migration/restore, merge, push, archive deletion, immutable snapshots or member-data test without fresh scoped human approval and independent evidence.
