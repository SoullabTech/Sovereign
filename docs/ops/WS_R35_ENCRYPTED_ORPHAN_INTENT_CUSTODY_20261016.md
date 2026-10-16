# R35 — Metadata-only encrypted orphan intentions and verified-Work observations

**October 16, 2026** · Parent R34 `d3385e73602268a2466e9e419ac149d750ce3db5`.
**Closed beta target:** at most five individually approved consenting writers on `soullab.life`.
**Decision:** **FICTIONAL-ONLY PASS / real protected writing, pending-key retirement and production release HOLD.**

## Why this is necessary

R32 and R33 now encrypt original Source before and after Work ownership and preserve claim intent. R34 can reconcile a completed R32 Work ciphertext pair if the final R33 state transition was interrupted. But after a crash **before the R32 SQL manifest exists**, isolated encrypted vault files may remain without database custody. Trying to guess ownership from a filename, digest, or unverified archive would violate the founder's retained-but-unclaimed custody and deletion rule. A scheduled cleanup, indiscriminate orphan sweep or "no SQL row → safe to delete" is prohibited.

R35 introduces a **pre-publication, metadata-only intention** that can later be paired with a separately authenticated, existing R32 Work. It preserves the distinction between *expected future ciphertext*, *verified existing Work*, and *actual independently witnessed key retirement*.

## Implemented source contract

`lib/writersStudio/recovery/heldOrphanIntentR35.ts` exports three held-only operations:

1. `beginHeldOriginalWriteIntentR35`: exact fictional flags required; obtains real R33 authenticated pending Source readback and post-claim cryptographic verification from `verifyHeldSignedCommittedClaimR33`. It generates a *keyed* HMAC of Source and original digests/private provenance under the fictional pending Work key (not a plaintext Source hash outside encryption). PostgreSQL locks R33 pending row first and owned destination Work second, then inserts a single immutable intention identified by exact member, arrival, DB-minted claim ID, Work/version, pending and destination key IDs and keyed HMAC. Exact duplicate invocation reuses the same intention; changed claim, member or Source is refused. **The intention is recorded before the fixture caller publishes R32 ciphertext**.
2. `observeHeldExistingOriginalR35`: **requires that matching prewrite intent to exist BEFORE calling R34**; otherwise no R33 transition is allowed. R34 verifies the exact signed claim and decrypts both the pending original and R32 Work original with separately supplied signed current deletion authority. If the R32 owner-scoped SQL ciphertext manifest is missing, return `HELD_WORK_MANIFEST_ABSENT` even if orphan files are present. If authentic and equal, owner-/claim-/cipher-digest-locked PostgreSQL inserts a single append-only Work observation recording the exact previously reconciled R32 manifest ID and both ciphertext file digests. Replays and concurrent observers reuse only that same observation.
3. `assessPendingKeyRetirementR35`: returns `RETIREMENT_HOLD_EXTERNAL_WITNESS_REQUIRED`, `keyRetired:false`, `ciphertextErased:false`, `releaseApproved:false` in **every** case. There is no key deletion operation, no inferred erasure from SQL state and no automatic vault cleanup.

`docs/ops/WS_R35_HELD_ORPHAN_INTENTS_REVIEW_ONLY.sql` is a **newly reviewed, hypothetical PG16 schema, not a production migration**. It creates two strictly append-only tables with owner/claim/Work constraints and triggers. One stores intentions; the other stores matching ciphertext observations. Source text, original file bytes, private filename, MIME, extractor and model notes never appear in the SQL insert statements. This does not prove that arbitrary DB administrators cannot forge SQL metadata, and is not an independently administered custody witness.

There is no public route, no enabled real-member feature flag, no new key provider, and no production data call.

## Verified physical test

Driver `scripts/ops/wsBetaR35PG16OrphanIntent.py` creates a new, uniquely named, loopback-only disposable `postgres:16.13` container, applies only R32+R33+R35 **review-only** SQL, and creates an isolated private file vault and separately marked, mode-0600 synthetic-only test fixture directory.

**First physical phase:** `scripts/ops/__tests__/r35PG16OrphanIntent.test.ts`: **15/15 PASS**. Synthetic file import + committed owner claim first, then metadata-only intent BEFORE R32 Work files are published. Repeats refuse changing identity, consent-bound Source or claim. Missing R32 SQL manifest yields HOLD, even with unregistered ciphertext in the vault. A real R32 authenticated Work with identical original Source is recognized by two simultaneous observers; exactly one immutable receipt is added, the second sees the existing receipt, and no new Work or duplicate ciphertext is written. Invalid/foreign claims, changed pending key, current signed Work revocation, correct AEAD but different source, forged SQL observation, or changed source binding refuse. Direct SQL UPDATE/DELETE of committed intentions and observations refuses. Two other invented Works test differing Source and recovery staging.

**Fresh-process phase:** PostgreSQL is restarted using the same disposable volume, then a new Node/Jest process reads an unfinished third Work Source, original filename/bytes, exact R33 claim and R35 prewrite intent from persisted PG + encrypted file vault. `scripts/ops/__tests__/r35ColdPG16OrphanIntent.test.ts`: **6/6 PASS**. Only then is a verified observation recorded. A second attempt reuses that receipt, foreign member and wrong Work-key access refuse, and retirement remains permanently HELD by the fixture.

**Plaintext check:** the *entire fictional PostgreSQL logical dump*, and all **13** resulting encrypted vault objects, were scanned in memory for fabricated original text, filenames and extractor markers; none were found. The disposable PG16 container/anonymous volume, entire private vault and ephemeral same-Mac synthetic fixture key folder were removed.

**Route/default-off tests:** `lib/writersStudio/recovery/__tests__/heldOrphanIntentR35.test.ts`: **9/9 PASS**, testing all fictional flags, key identity separation, wrong identity, missing journal and no active Next API route or automatic encryption/write/delete or key retirement.
**Inherited Studio/Source/custody/consent/security regression:** **56 suites / 602 tests PASS**.
**Strict scoped TypeScript:** PASS.
**Standard precommit governance:** required on the isolated local source commit; do not consider the candidate qualified if the checks fail.

Private founder-held evidence:
- `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R35_PG16_ENCRYPTED_ORPHAN_INTENT_20261016.json`
- `R35_PG16_ORPHAN_INTENT_PHASE1_JEST_20261016.log`, `R35_PG16_ORPHAN_INTENT_PHASE2_JEST_20261016.log`
- `R35_ORPHAN_INTENT_SOURCE_GATES_20261016.log`, `R35_SELECTED_REGRESSION_20261016.log`, `R35_STRICT_TYPES_20261016.log`

## Precisely what is NOT established

- **Not automatic prevention of orphan creation.** The test calls `beginHeldOriginalWriteIntentR35` prior to `persistHeldOriginalR32`, but the legacy R32 writer does not yet enforce that ordering. No live Writer's Studio route or ordinary manuscript importer has been migrated. An interruption between the two vault file publications (or between encrypted publishing and R32 SQL insertion) can still leave an orphan; the intention only makes its expected owner/claim possible to investigate with separately signed evidence. No loose ciphertext gets auto-promoted.
- **Not real session authentication or external key trust.** R32/R33/R34/R35 use a fixture-only structured session subject and process-generated signer/Work keys. Operational member session, exact notice/consent, external Work-level KMS grant, separately administered deletion epoch and cross-domain Work-vs-withdrawal atomicity are absent.
- **Not cryptographic erasure.** An old backup or a retained raw pending key could decrypt archived ciphertext offline even after a new SQL row or alleged key destruction. A separate operator-controlled, pinned root, monotonic current revocation ledger, scoped unwrap-denial and deletion legal policy must be installed, and the oldest-backup replay tested. The receipt CANNOT certify irreversible deletion.
- **Not migration of plaintext history.** The active importer, drafting, revisions, keeps, MAIA editorial Apply/Undo, context JSON, SQL/WAL/replicas/exports and historical backups/previous app readers remain outside this new path. R31's 51 literal SQL writer candidates and other dynamic paths still require review, full encrypted cutover and reliable member withdrawal treatment.
- **Not real parser/browser readiness.** Big DOCX/PDF streaming, authentic parser corpus, original signed R14 provenance, full Studio + Personal Portal + MAIA Safari Mac/iPhone journey, approved non-Resend invitations, member notice, source+image enforced production build, rollback, disk headroom and exact founder Class A production GO are unqualified.
- **Not orphan recovery without a DB manifest.** A registration record may support investigation, not ownership inference. If the R32 database anchor is missing, return HOLD; creating it requires a separate independently signed and physically verified custody contract. Never auto-delete.

## Next engineering order

1. Integrate the intention into a **single, verified server-owned, fictional-only new-Source writer** that cannot reach R32 vault publication before a matching intent, with tested duplicate/restart outcomes; no existing real HTTP route replacement until full consent/old data migration.
2. Define independently administered pending-key retirement and encrypted-orphan custody review, prove backup antiresurrection and surviving-work disaster recovery with separate system/operator identities; founder explicit provider, jurisdiction, budget, custodians and retention approval required before actual KMS creation.
3. Reconcile separately developed editorial R35–R36 branches with this Source lineage under the same release gate; migrate plaintext Source/Draft/Edit/revision services completely and preserve author-controlled Apply/Undo, re-open, export, semantic zoom and adjustable columns.
4. Qualify one exact integrated production image, Safari/iPhone, invited member account and consent/mailer, independent rollback, and founder exact-image GO for **at most five** writers.

**R35 physical source-custody progress PASS. Real member beta on `soullab.life` remains HOLD.**
