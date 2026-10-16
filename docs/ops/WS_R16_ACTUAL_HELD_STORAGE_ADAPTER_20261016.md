# Writer's Studio — R16 actual PostgreSQL + durable Source-vault integration (HELD)

**Date:** 2026-10-16, America/New_York.
**Classification:** Class A beta storage-security source candidate, **not authorized for real member data**.
**Base:** R15 `2433a785d0d4ebf75a710d0d8e9d434438f3e804`.
**Public fictional R9 source:** `d2020f7bfa66286c5f4b274d2a5fdb17b8c913b2` unchanged.

## Why R16 matters

R10–R15 proved fictional cryptographic recovery, source owner identity, signed current deletion barriers, exact Source bytes and complete original-file provenance, and a crash-resumable pair-aware journal. However, their physical fixtures did not exercise the ACTUAL application PostgreSQL/vault APIs as one system. R16 narrows that gap.

This candidate adds `lib/writersStudio/recovery/heldPairedStoreR16.ts`, which calls the existing `lib/db/postgres.ts` database pool and transaction and existing `lib/storage/fileVault.ts` immutable, durable and readback-verified storage functions.

- Accepts **only a prepared R14 encrypted Work+provenance pair**, verified by R15's full identity, signed-claim, source-provenance and current deletion-high-water checks. It never accepts raw manuscript plaintext as a storage argument.
- Requires a *supplied* `server_verified_member_session` subject. This is **a structural contract, not yet a deployed authenticated session boundary**; the eventual caller must derive it itself from the actual verified session, never from a client header or body.
- Before writing, checks the real database Source/manuscript same-member owner join and rejects known duplicates.
- Writes two **distinct authenticated-ciphertext buffers only** through `writeDurableVaultBytes` (exclusive staged write, fsync, non-overwriting hard-link publish, readback). Verifies both bytes and SHA-256 digests.
- Then locks the member-owned original Source and manuscript rows inside one real `transaction()`, inserts the hashed pair and two vault references, and returns a **held-only** manifest. The database and filesystem cannot form one global transaction, so encrypted orphans after a crash or DB failure remain as reconciliation obligations; no automatic deletion.
- Adds `readHeldPairedCiphertextsR16`: member-scoped SQL join, validates manifest/digests and checks both file contents. It returns **sealed ciphertext only**. Current independent trust is still required to call `openPairedOriginalV2` for decryption.
- Explicit invariant `R16_REAL_MEMBER_PAIRED_STORAGE_ENABLED = false`. The module is unconnected to any app route, producer job or live-beta entry. It does not write/clear the prior R15 retirement outbox and cannot claim key retirement.

## Provisional schema — not applied to production or dark beta

`docs/ops/WS_R16_HELD_PAIRED_STORE_REVIEW_ONLY.sql` defines an isolated insert-only `writers_studio_r16_held_pairs` table with member/Source/manuscript FKs, distinct pending+Work key IDs and cipher paths, exact SHA-256 digest shapes, held-only state, owner/Source join trigger, UPDATE/DELETE refusal, and no `PUBLIC` grant. This SQL is stored in **docs**, not `database/migrations`, to ensure it is not accidentally run during build or deployment. It requires separate migration reconciliation and least-privilege role review before installation.

## Actually executed evidence

- **R16 focused Jest: 10/10 PASS**, including member mismatch, absent external deletion witness, second-file write crash, failed readback, known unowned Source early refusal, ownership change between preflight and row-lock, failed insert, duplicate claim and foreign-member read.
- **Combined R9–R16 regression: 32/32 suites, 399/399 tests PASS.** Existing membership, invitation, consent, Source custody, DOCX import and recovery tests all remain green.
- **Scoped strict TypeScript: PASS**, includes the actual imported PostgreSQL + file-vault code and the native physical test driver.
- **Physical integration: 22/22 checks PASS, five negative controls**, using a new, disposable native PostgreSQL 14 cluster with a private Unix socket and private file-vault root. This invokes **the actual unmocked repository adapter**, not a simulated SQL/stage function. A fictional owner/Work pair was stored and reread, decrypted correctly only under its independent-test signer/deletion checkpoint, and survived immediate PostgreSQL restart; the isolated original-file ciphertext and private provenance hashes remained identical.
- A deliberately inserted fake manuscript sentinel was detected in a **full plaintext-format PostgreSQL dump**; after removing the detection-control table the isolated dump contained neither fictional author prose nor private filename/extractor. This qualifies the test sensitivity, **not** absence of unknown contents from the much larger real-beta database.
- Direct PostgreSQL owner mutation, missing provenance file, foreign session read/write and intentionally introduced plaintext were all refused/detected.
- The new PostgreSQL cluster was stopped and its temporary filesystem removed. No Docker, production, provider API or real member writing was touched.
- Evidence receipts: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R16_*`. Exact output `R16_NATIVE_ACTUAL_STORE_20261016.json`.

## Scope not yet completed — do not call this a live encrypted backup

1. **Production Writer's Studio still stores text.** The deployed R9 Source, manuscript sections, drafts, revisions and editor memories use ordinary SQL text/JSON fields. R16's new encrypted pair *coexists with*, and does not automatically rewrite/delete, those existing plaintext columns or old archives. Complete reconstructive-data classification, WAL/export/replica scans, privacy migration and rollback are required.
2. **No real independent key provider has been installed.** Test Ed25519 and Work keys live only in fictional process memory. The reviewed adapter consumes accepted cryptographic claims but cannot issue or escrow them and cannot witness historical key destruction.
3. **Actual authenticated route not wired.** `assertedBy` must come from server-verified session+consent+invite and an independent custody provider. The current fixture crafts its synthetic subject. No client should be able to call this adapter directly.
4. **No true atomic filesystem/database transaction.** Fsync+DB commit protects against false claims of stored custody, but failure can leave encrypted unreferenced objects. These require durable, member-safe quarantine reconciliation; never infer safe deletion from lack of a database row.
5. **No PG16 parity yet.** R16 actual native exercise used Homebrew PostgreSQL 14, not the Linux PG16 dark release configuration; an independent equivalent run against a disposable PG16 schema is necessary.
6. **No backup/deletion non-resurrection certificate.** R10 showed that old global encrypted SQL and Source archives can resurrect deleted Works if the old shared key remains. R11 surfaced 389 scoped candidate fields, including 68 potentially reconstructive unclassified names. Independent historical archive, WAL/NAS, render/export and provider-retention custody remain open.
7. **Original source physical rehydration and size:** Original bytes+filename and MIME are encrypted in the R14 pair, but legacy `artifact_ref` migrations and streaming manuscripts >16MiB have not been accepted. R15 signed paired-journal backfill and per-Work key rotation are not installed.
8. **Release authority and member experience:** approved exact participation notice, one-use invitation, live real-member session proof, independent trusted storage, beta-only rollback, genuine MAIA Develop/Write/Review/Apply/Undo/save/reopen/export and Safari/iPhone, exact source founder Class A and exact-image GO remain separate.

## Next acceptance sequence — R17 / actual integration

1. Review the actual member-authenticated beta-only service entrance with verified session+consent+invitation, no raw client identity. Keep it disabled while infrastructure is unresolved.
2. Build an authorized service-held R14 metadata signer with key custody outside the app/vault and nonrollbackable external deletion checkpoint; record key registration and revocation semantics; no provider billing/secret access without a deliberate operator gate.
3. Reconcile this review-only schema with actual PG16 migrations, a least-privilege nonlogin database role, and no-plaintext all-store backup adapter. Integrate the R15 pair-aware outbox with durable crash retries rather than an unsecured direct SQL flag.
4. Qualify real PG16 schema, Source files, old reader, rolling rollback, original-file rehydration and full deletion anti-resurrection. Reject all missing negative controls.
5. Only then founder-approve exact source/visual candidate, deploy beta-only under explicit gates, verify the first invited, consenting writer in a real browser and mobile device, and admit the small cohort incrementally.

**Decision: R16 actual stored-pair engineering candidate PASS within the isolated fixture; real-member uploads and permanent-erasure claims remain HOLD.**
