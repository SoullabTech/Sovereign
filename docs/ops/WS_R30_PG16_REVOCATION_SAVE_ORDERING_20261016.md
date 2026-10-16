# Soullab Writer's Studio R30 — Signed consent + Work revocation/commit ordering on PostgreSQL 16

**Date:** October 16, 2026. **Member-facing target:** maximum five individually approved testers on `soullab.life`.
**Source parents:** R29 `574f299c6152870996e7efb2845f0ad1572a7fed` and the distinct R27 protected commit fence `47e1ca57757d2333f2e8dc8065f5393006e84584`.
**Classification:** isolated source convergence and fictional-only physical PG16 contract qualification. Real-member GO, KMS provisioning, production migrations and external revocation authority **HOLD**.

## What was actually reconciled

The new R30 worktree contains both previously tested safety contracts without overwriting either originating branch:

- R29 `sessionBoundCustodyR29.ts`: cryptographically checks the exact R26 lease plus a separate signer-bound session hash, current approved consent notice hash, latest consent event sequence, Work ID/generation, purpose, server challenge and lease lifetime. Its `rehearseSessionBoundWriteR29` rejects any changed permission while inside a Work fence. The fence in that module is an **injected fictional callback**, not an operational external lock.
- R27 `heldCommitFenceR27.ts`: checks writer's original and second R17 verified admission and deletion epoch after simulated external key latency; calls the synthetic R23 encrypted vault append within an injected held Work lock. Again this has **no deployed independent coordinator**.
- The merge carries the earlier R26 separate-process revoked-old-backup test source. It does not assert that an old raw key is permanently destroyed: a retained raw Work key may still decrypt an older ciphertext copy **outside** the custodian.

The R27 and R29 contracts have **not** been collapsed into one live production entry point. R30 combines their exact source histories and adds a focused, standalone PG16 Work-lock test for ordering semantics. A real independent Work-level coordinator still has to apply both protocols to the same authenticated write, keep current session+consent and external deletion policy fresh throughout, and maintain irreversible per-Work retirement.

## New physical, actual PostgreSQL 16 ordering experiment

`scripts/ops/wsBetaR30Pg16WorkFence.py` requires `R30_ACTUAL_PG_FENCE=fictional-only`, creates a uniquely named disposable `postgres:16.13` Docker container bound only to Mac loopback 127.0.0.1, checks the *final* PostgreSQL PID 1 (not the image's temporary init server), inserts exactly two invented Work rows in isolated fixture tables, and invokes `scripts/ops/__tests__/r30Pg16WorkFenceRace.test.ts` against that database.

That test exercises **real PostgreSQL `BEGIN` / `SELECT ... FOR UPDATE` / `COMMIT` / `ROLLBACK`**, and R29's actual signed-session/consent verification (using synthetic signers and sealed test-only scope). A separate database transaction represents author withdrawal/revocation, which must lock the same Work row and increment consent sequence and deletion epoch.

The **seven actual-PG test cases** verify:

1. Every real-member authorization flag remains `false`.
2. Revocation while a synthetic key operation is delayed completes **before** the Work lock; the final permission check refuses the save, leaving **zero** committed revisions.
3. A newly written consent event sequence refuses even when the previous writer-active flag remains true.
4. A valid in-flight save holding the Work row lock commits **before** an independently started revocation transaction can become effective; the revoker waits for the lock, then advances epoch. The property proven is **no commit after a successfully completed revocation**, not a guarantee that a pending withdrawal request instantly cancels an already-committing save.
5. A failure after a synthetic revision manifest INSERT but before COMMIT rolls the insert back; no partial committed revision remains.
6. Key-service outage before the fence never invokes a writer commit or falls back to ordinary plaintext SQL.
7. Revocation of a different Work does not affect the current Work's own authorization.

**Results:** the fixture was executed **three fresh runs**, each **7/7 tests PASS**, with final Docker container and image-created anonymous volume removed; no production, real member, actual KMS, key access, paid provider or real author text was touched. All fixture writing was metadata/digests, not a real ciphertext Work or original Source recovery test.

## Other qualification

- Union of the exact inherited R27 + R29 access/Studio/custody/recovery suites against the combined R30 worktree: **52/52 suites and 571/571 Jest tests PASS**.
- `tsconfig.r30-work-transaction.json` strict TypeScript: **PASS**.
- All sources remain local; no migration executed, no API route attached, no live KMS or member admission.

Private receipt and logs on founder Mac T7:
- `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R30_PG16_WORK_FENCE_RACE_20261016.json`
- `R30_PG16_WORK_FENCE_JEST_20261016.log`, `R30_PG16_RUN_2_20261016.json`, `R30_PG16_RUN_3_20261016.json`
- `R30_SOURCE_REGRESSION_20261016.log`, `R30_STRICT_TYPES_20261016.log`

## What R30 does NOT prove

- **Not independently administered:** both writer and revoker use the SAME disposable PostgreSQL 16 database and process infrastructure. Its row lock is not a separate administrator, AWS KMS, hardware HSM, external monotonic antirollback register, or an out-of-band audited deletion witness. Restoring an old PG backup could roll the fixture's epoch back; real Work keys might still decrypt archived ciphertext elsewhere.
- **Not a distributed transaction:** a true independent key/revocation service and file-vault append span failure domains. A PG row lock alone cannot atomically coordinate a remote deletion decision and an immutable file-vault write in the face of network partition, app crash or stale lease. The coordinator must supply issuer-authenticated, single-use, durable fence tokens backed by independently maintained revoked epochs and verify completion before acknowledging revocation.
- **Not a full protected editor:** R30's Work rows/revision commits hold fictional identifiers and SHA-256 markers. Full Source/current draft/revision/authorization/editorial SQL/JSONB, file-vault original artifact provenance, WAL/exports and old backups still need complete encrypted migration, no plaintext fallback, old-reader rollback and withdrawn-Work anti-resurrection tests.
- **Not authenticated browser QA:** the PostgreSQL race test does not exercise actual member cookie exchange, Safari/iPhone, MAIA provider, Personal Portal, adjustable columns, Apply/Undo, save/reopen/export, approved consent notice, invitation mail or live sign-in. Those remain exact-image acceptance gates.
- **No external KMS approval:** founder has not approved a specific provider account, administrator separation, Region, retention/deletion governance, disaster recovery or spending ceiling. Synthetic signatures and design preflight cannot constitute consent to provision, charge or enroll real members.

## Next action order

1. Explicit founder/operator decision for operational custody providers, independent administrators, approved cost ceiling, jurisdiction/retention and recovery. Do not connect real keys until this is recorded.
2. Build and physically test a **separate** Work-revocation authority that survives app/PG/vault rollback and serializes key unwrap / writer commit / deletion across *different* operator-controlled environments. Demonstrate after-withdrawal older-backup decryption refusal and surviving-Work recovery.
3. Migrate all legacy author Source/content surfaces and historical copies with no plaintext fallback, certify actual PG16 + vault + Source + external keys disaster restore and previous-image reader rollback.
4. Integrate one exact Studio+Portal+MAIA production image; qualify full Safari/iPhone editorial path, single sign-in, consent, non-Resend invitation delivery, member export/withdrawal and adjustable UI; require founder Class A exact SHA/image GO before admitting up to five writers.
5. Before any production image build, revalidate shared Linux host disk **>=60 GiB free** and leave protected rollback/source/backup assets untouched. Do not overlap another Linux image build or broadly prune storage.

**Release disposition: R30 isolated Work-level PostgreSQL ordering PASS. True external revocation and full real-member beta HOLD.**
