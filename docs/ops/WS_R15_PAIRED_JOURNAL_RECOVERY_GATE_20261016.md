# Writer's Studio — R15 pair-aware durable recovery journal

**Date:** 2026-10-16, America/New_York
**Disposition:** isolated source and physical fictional recovery tests PASS. Real-member encryption, true key retirement, deletion non-resurrection, and launch HOLD.
**Base:** R14 clean local source `f8772b4ce0da0f611f4d8f696ec6b7cf1e021fed`.
**Deployed public fictional beta:** unchanged R9 source `d2020f7bfa66286c5f4b274d2a5fdb17b8c913b2`.

## What's implemented

- New versioned `lib/writersStudio/recovery/pairedTransferJournalV2.ts` deliberately **does not reuse** R13's single-ciphertext journal. R15 binds **both** the sealed manuscript digest and the separate sealed original-provenance digest, plus a cryptographic pair digest, in an authenticated claim/member/arrival/manuscript identity and monotonic revision.
- `beginHeldPairedTransferV2()` refuses to start unless the R14 paired capsule has exact expected opaque fields, verifies both ciphertext hashes, independently signed committed Source claim and epoch, separately signed original filename/MIME/extraction provenance, and current independently verified deletion high-water **before decrypting either component**. This remains only a source-level interface with test-generated independent witnesses.
- A **five-step, signed, monotonic OUTBOX protocol**: `claim_committed → pair_verified → retirement_owed → key_retirement_witnessed → pending_erasure_witnessed → review_ready_not_released`. The first advancement requires an actual separate readback of both ciphertexts and the exact pair digest; a Work-only proof is insufficient.
- Every proof is signed and verified by the appropriate scoped storage, key-custodian, or recovery-checkpoint signer. The witness must supply a strictly validated external minimum generation. Forged member/Work/key/ciphertext identity, altered provenance hash, missing independent signer, stale proof, phase skipping, and revoked Work all refuse. Even **idempotent replay** must pass signature validation again.
- **Permanent release stop:** `R15_REAL_MEMBER_TRANSFER_ENABLED = false`. No function can return a real-member GO or actual key-erase success. A journal at `review_ready_not_released` can only say `REVIEW_READY_NOT_AUTHORIZED`.

## Executed evidence

1. Focused R15 journal tests: **15/15 PASS** (one suite).
2. Combined R9 + R11 + R12 + R13 + R14 + R15 regression: **31/31 suites, 389/389 tests PASS**. Includes existing membership, invitation, consent, import, edit custody and encryption tests.
3. Strict scoped TypeScript: PASS.
4. **Physical crash/recovery test: 38/38 PASS** on a fresh, local, native **PostgreSQL 14** cluster bound **only** to a private temporary Unix-domain socket; no TCP port, Docker, production database, member data, provider use or external key service. `scripts/ops/wsBetaR15NativePostgres.ts` requires explicit `R15_NATIVE_FIXTURE=fictional-only`.
5. Six physical negative-control categories: (a) database trigger rejects fake completion and provenance substitution; (b) crash after the Work file alone refuses full provenance custody; (c) tampered provenance ciphertext refuses; (d) stale concurrent CAS refuses; (e) injected retirement-outbox transaction failure rolls back without fake debt; (f) key retirement cannot advance without an independent key signer.
6. The full journal, signed pair digests, pending encrypted original and retirement outbox survive hard PostgreSQL stop/restart. The test can decrypt the invented original file and exact private filename only with the signed current synthetic deletion authority. It stops at **`retirement_owed`**, preserving the pending original.
7. The native PostgreSQL instance was shut down and its newly created temporary database and encrypted synthetic files were removed. No actual Source deletion, credential movement, app deployment or backup mutation was performed.
8. Governance and source-control qualification are separate; see exact commit receipt after review.

**Evidence folder:** `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/`:
- `R15_PAIRED_JOURNAL_UNIT_20261016.log`
- `R15_FOCUSED_TSC_20261016.log`
- `R15_INTEGRATED_REGRESSION_20261016.log`
- `R15_NATIVE_RUN_20261016.log`
- `R15_NATIVE_POSTGRES_20261016.json`

## Operational substrate and a safety hold

The Mac Studio had an overlapping **cold Docker virtual-disk copy** running. Docker Desktop was not initially available; bringing it up briefly exposed the concurrency risk. The Docker app was then stopped, and the physical R15 test was executed through native PostgreSQL instead. The experimental Docker test source was archived separately as `R15_DOCKER_PHYSICAL_UNRUN_20261016.ts` **without a PASS claim or inclusion in this source candidate**. The concurrent cold Docker backup was not used as R15 evidence; its completion and integrity are NOT certified by this run. Do not start Docker solely for R15 while an external cold-copy operation is active.

## What's NOT qualified

- **Independently operated keys/signers do not yet exist.** Every Ed25519 and AES key in these tests is invented in a process. An in-process witness is not a real independent custodian or a nonrollbackable externally managed deletion high-water.
- **Not connected to live Writer's Studio.** Neither the R15 journal nor its fixture SQL trigger is installed in the dark-beta PostgreSQL. No server-verified Source/Work event signer, least-privilege journal DB role, encrypted writer adapter, production schema migration, or real Work upload/restore is activated.
- **Full DB privacy is still unproven.** Existing R9 Source text, original filename, MIME, extractor, artifact reference, drafts, revision history and derived data remain ordinary relational fields. R11's scoped inventory found 389 candidate writer-adjacent fields, of which 68 unclassified field names merit review. An encrypted pair is not proof that PostgreSQL SQL dumps, WAL, replicas, exports or historical global backups are free of reconstructable writing.
- **Historical backup resurrection remains a blocker.** R10 showed deleted fictional writing can be reconstructed from older whole-archive copies when the global key is retained. Key revocation must be independently durable and cover all copies, not only the current active document pair.
- **Original artifact custody and scale:** R14 stores verified original filename/MIME/extractor and bytes inside the sealed pair, but migration of existing `artifact_ref`, original-file restoration into a governed vault, streaming >16MiB large books, and multi-chunk ciphertext integrity are not certified.
- **PostgreSQL parity and rollback:** This R15 physical rehearsal ran native PG14, not the PG16 Linux release database. The code must pass a separate PG16 beta-equivalent isolated run after the Docker/remote-substrate conflict is resolved. Old-reader rollback cannot drop the signed provenance companion.
- **Live provider/editorial/browser acceptance:** no real-member invitation, consent approval, paid MAIA model call, public cutover, real iPhone Safari, or writer import → Develop → Write → Review → Apply/Undo → save/reopen/export acceptance was performed here.

## R16 next acceptance order

1. **Real runtime adapter:** implement server-session-bound, scoped, authenticated claim and a versioned pair-journal writer/readback in a separate beta-only, migration-reviewed SQL schema. Bind all Source, Work and metadata identities to the same owner; refuse unsigned client authority.
2. **Independent authority:** choose a custodian and actual durable key/antirollback service *outside* the app and existing backup media; prove custody of surviving Work keys and irreversible retired Work refusal using multiple old backups. Installation, cost and permissions require an explicit operator gate.
3. **Whole-system coverage:** design an encrypted logical database + original Source backup that excludes all reconstructive plaintext, includes revision/editorial/JSONB/WAL/replica copies and streams large works. Physically compare hashes and test deletion non-resurrection plus old/new reader and rollback.
4. **Release path:** record exact-source founder Class A review and distinct exact-image canary GO; approve participation notice and one-use member invitation; perform first writer's complete browser/mobile/MAIA experience; expand cohort only from measured success.

**Decision:** R15 is a bounded, meaningful recovery-engineering PASS. It is not permission to invite a writer or label any real manuscript permanently deleted.
