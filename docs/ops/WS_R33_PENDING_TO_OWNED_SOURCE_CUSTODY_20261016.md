# Writer’s Studio R33 — Encrypted pending original to owned Work, claim-ID-bound

**October 16, 2026**. Parent: R32 `71b55e8c7c59f371a1235a75d95484343fc00f91`.
**Destination:** up to five invited consenting real beta writers on `soullab.life`.
**Decision:** isolated **FICTIONAL-ONLY** storage/claim prototype PASS; live writer admission, operational key custody and deployed Source migration **HOLD**.

## Actual source advance

R32 could securely persist Source once a member already owned a manuscript. It did **not** protect the initial moment when a member imported a file before deciding which Work should own it.

R33 adds `lib/writersStudio/recovery/heldPendingClaimR33.ts` plus `docs/ops/WS_R33_ENCRYPTED_PENDING_REVIEW_ONLY.sql`, deliberately **outside** deployed `database/migrations`. It reuses the existing authentic R12 pending-AES-GCM envelope and signed claim/rewrap check, the canonical R32 authenticated original Source Work capsule, the existing fsync and exclusive-publication file vault and actual PostgreSQL row-lock transactions.

The four deliberately explicit states/acts are:

1. **Encrypted pending arrival:** only verified-structured member identity, random arrival UUID, separate *pending* key and signed arrival-scoped deletion high-water are admitted in an exact opt-in test fixture. The original bytes, extracted text, private filename and MIME reside in the R12 authenticated pending envelope. A separately encrypted private metadata capsule retains extractor ID and exact original/source digests/lengths, authenticated to member, arrival, generation and the encrypted pending envelope digest. SQL receives only opaque identities, two ciphertext refs and SHA-256 pair integrity values—never manuscript text, filename, MIME or extractor.
2. **Member-owned Work claim:** actual PostgreSQL transaction locks the pending row **first** and the member-owned destination manuscript **second**. A foreign or duplicate claim refuses and the pending file remains recoverable. The transaction server-mints a fresh `claim_id` and records exact Work ID, Work generation and claim epoch, moving to `claim_committed_awaiting_rewrap`. **This is not completed Work custody.**
3. **Independent claim receipt and distinct-key rewrap:** after that database COMMIT, a separately signed R12-format claim must match the **exact database-minted claim ID**, member, arrival, Work, generation, epoch, Source-kind and original/extracted content digests. The old R12 `prepareClaimedArrivalRewrap` verifier enforces different pending and Work keys and validates exact pending source. R32 then seals and saves the recovered bytes and original provenance under the destination Work key using its actual PG16+immutable-vault adapter.
4. **Rewrap verified but pending retirement NOT done:** under a new PostgreSQL transaction, an exact owner/arrival/Work/generation/journal join to the durable R32 ciphertext manifest must pass before the pending row can enter `rewrap_verified_awaiting_retirement`. The pending ciphertext and pending key are **preserved**. R33 never declares key retirement, file erasure or final antiresurrection. The review table's trigger forbids DELETE, changing an owner/cipher-ref/digest, changing the committed claim ID, or skipping the owner-checked claim/rewrap sequence.

This removes the prior ambiguity in which a correctly signed receipt for a related Work/arrival might fail to identify the exact committed claim transaction. R33 now verifies the persisted, server-minted `claim_id` as well.

## Physical PostgreSQL 16 and ciphertext evidence

`scripts/ops/wsBetaR33PendingClaimPG16.py` creates an empty, uniquely named, loopback-only disposable `postgres:16.13` Docker container, applies only R32+R33 **review** SQL, and creates a private disposable ciphertext vault. A synthetic writer has **no Work initially**. Another synthetic member owns a different Work.

The Jest physical integration `scripts/ops/__tests__/r33PendingClaimPG16.test.ts` passed **12/12** checks covering:

- File-like original imported and encrypted *before* any Work existed; later same-member Work creation, claim, separately signed post-commit receipt and Work-key rewrap
- Independent paste-only pending arrival promoted to a separately owned Work, without fabricating an uploaded original
- Foreign access and claims; wrong Work ownership; repeated claim; direct SQL retirement/state mutation; forged/altered claim ID or content digest; attempting to reuse pending key as Work key
- Altered vault ciphertext refusal, exact Work Original/Source/private provenance readback, Work-key/foreign owner refusal and unretired pending Source recoverability
- SQL owner and claimed-scope checks plus immutable reference/accounting rules
- An in-memory full **fictional** database dump and all **eight** pending+Work ciphertext files contained none of the fabricated original filename/prose/extractor sentinels

The source and mime labels are fabricated and are not certified DOCX or PDF parser-valid packages. No actual manuscript or member record was read.

**Final receipt:** `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R33_PENDING_CLAIM_ID_FINAL_PG16_20261016.json`; log `R33_PENDING_CLAIM_ID_FINAL_JEST_20261016.log`. Earlier R33 physical receipts are superseded: the final run also confirms that SQL will not let a committed `claim_id` be altered.

**Default-off/route isolation tests:** `heldPendingClaimR33.test.ts` **7/7 PASS**, checking missing dual fictional flags, fake browser `server_verified_member_session` assertion, invalid Work/arrival/generation, missing signed pending authority, and no active import API routes importing R32/R33.
**Combined inherited R32/Studio/security regression:** **54 suites / 585 tests PASS**.
**Strict scoped TypeScript:** PASS.
**Scope of cleanup:** randomized disposable PostgreSQL 16 container and anonymous test volume plus fictional local vault removed. No external cloud, SMTP, paid model, real KMS, production SQL, source file, or live member admission.

## Release-critical limitations: all STOP

1. **The structured session label is not a secure real browser principal.** Current R33 code is **not** an authenticated HTTP service and both `R33_REAL_MEMBER_PENDING_CLAIM_ENABLED=false` and the R32 real-import flag remain false. A future trusted server route must independently mint member identity and verify current exact invitation, consent and origin; never accept typed client assertions.
2. **Claim signer, claim epoch and pending/Work encryption/deletion witnesses are synthetic in the fixture.** No independently administered operational signer, nonrollbackable claim register, Work-key holder, retirement or fresh external revocation coordinator exists. The supplied claim epoch is not externally authoritative.
3. **Pending arrival deletion has separate semantics from an owned Work.** This test uses arrival UUID as pending authority scope in the existing Work recovery barrier, but does not certify the real external custodian's pending namespace, independently witnessed member withdrawal, or lifetime and erasure policy for unclaimed files.
4. **The transaction is not cross-domain atomic.** A DB commit of claim can precede Work rewrap, and an encrypted R32 Work may be saved before R33 final state marking. Interrupted transfers must be reconciled using immutable pair/claim evidence. **Never auto-delete pending originals, auto-retire keys, or silently create a second Work/Source during retry.** A durable crash-resume/orphan reconciler remains outstanding.
5. **Signed R14 provenance is not operationally qualified.** R33 guards private filename/MIME/extractor with authenticated metadata and verifies R12 Source digests, but independently signed provenance, original postclaim lifecycle retirement, previous Work backup erasure and separately governed cold restoration remain unproved.
6. **No large-file streaming:** current original 8 MiB, extracted text 4 MiB, R11 WorkSnapshot total 16 MiB. Overlimit fails closed. Real DOCX/PDF parser and accessible import UI must be qualified separately.
7. **Every other plaintext writer remains:** real `recordArtifactArrival`, current drafts, version revisions, keeps, MAIA editorial JSON, Apply/Undo and structure remain in the R31 migration inventory. Existing SQL/WAL/exports/old backups and previous app readers may still reconstruct writing. No plaintext fallback may be left for a real cohort.
8. **Real hosted acceptance pending:** production-level independent deletion key/Work commit-coordinator, freeze and enforce production TypeScript/image, reliable approved non-Resend invitation mail, current participation notice, Mac/iPhone Safari Studio+Portal+MAIA Develop/Write/Review/Apply/Undo/import/save/reopen/export, oldest-backup withdrawal negative, previous image rollback and exact founder Class A cutover GO. Recheck shared Linux >=60 GiB before any image build.

## Next legitimate work

**R34:** Build a recoverable **claim-commit / Work-rewrap journal reconciler** on the same fictional PostgreSQL 16 + vault substrate, with strict owner/session/claimID/cipher digest matching, crash-after-vault-before-SQL and crash-after-Work-before-state-mark tests. Then implement/qualify an independently administered pending and Work key-retirement policy. Do not extend the live import route until no-plaintext legacy migration is ready.

**R33 outcome:** demonstrably encrypted pending → member-owned Work on an actual disposable PG16, with signed post-commit exact claim and preserved pending custody. **Not** real KMS, key retirement, offsite recovery, live Source import or five-real-tester deployment.
