# R34 — Interrupted encrypted Source claim: local recovery qualification

**October 16, 2026.** Parent R33: `1422ef2ccd2a8b7604b5c80d0d5164ebd309b89d`. Intended beta: five individually invited writers at `soullab.life`. **Operational release: HOLD.**

## Purpose

R33 can commit a pending Source claim, rewrap original bytes in the R32 encrypted Work vault, then mark its pending record as rewrap verified. R34 handles an interruption **after the R32 ciphertext and SQL manifest exist but before that final R33 state update**. A blind retry could create duplicate encrypted vault objects or fail the unique Work-generation constraint.

`heldClaimReconcilerR34.ts` is a disabled, route-unconnected, fictional-only reconciler. It **never saves a new Work, deletes ciphertext, or retires an encryption key**.

## Exact local recovery sequence

1. R33 decrypts and authenticates the member-owned pending Source with the supplied signed deletion highwater.
2. The existing R33 post-commit signature verifier checks the exact database-minted claim ID, owner, arrival, destination Work/version, epoch and Source/original hashes. Work and pending keys must be different.
3. R32 opens only the previously persisted, owner-scoped Work Source using its current supplied deletion proof; both immutable ciphertext objects, AES-GCM, private filename, MIME, extractor, text and original bytes must authenticate.
4. Original/pending and owned/Work plaintext bytes and private metadata must match *exactly*. A missing R32 SQL manifest yields a **HELD** result even if loose encrypted orphan objects exist; mismatched content refuses without mutation.
5. In one real PostgreSQL transaction, lock the pending row, owned destination manuscript and exact immutable R32 Work manifest in that order. Verify committed claim identity, version and pair digests again before marking `rewrap_verified_awaiting_retirement`.
6. Repeated or concurrent recovery for the **same** validated Work is idempotent. Conflicting owner, claim, version or digest refuses. Every return explicitly says `retirement:NOT_PERFORMED` and `releaseApproved:false`.

## Physical acceptance (fictional data only)

The R34 runner uses a uniquely named disposable `postgres:16.13` Docker container bound to Mac loopback, review-only R32/R33 tables and a separate private fixture vault. It never contacts production.

- First Node process: **15/15 physical tests passed**, including missing R32 manifest, unreferenced ciphertext, forged signed claim, revoked Work, foreign ownership, different-but-valid Work content, ciphertext tamper, and two competing recovery calls with no duplicate Work.
- A third invented Work was persisted with its pending claim deliberately unfinished. The test then performed a **controlled PostgreSQL container restart** and ran a fresh Node test process against the same disposable database and encrypted vault.
- Fresh-process phase: **6/6 passed**—exact original bytes/private provenance recovered, unchanged claim finalized, repeat was idempotent, foreign member/current revocation/wrong key refused.
- Source gate: **8/8 tests passed**; no real-member activation flag or active Next API route. Inherited Studio/identity/custody regression: **55 suites, 593 tests passed**. Scoped strict TypeScript: **PASS**.
- Entire fictional PostgreSQL dump and all 13 encrypted vault objects lacked the fabricated original/prose/filename markers. Temporary database, container/anonymous volume, vault and mode-0600 synthetic test-key directory removed.

**Private evidence on the founder Mac Studio T7:** `R34_PG16_COLD_RECONCILE_20261016.json`, `R34_PG16_COLD_PHASE1_JEST_20261016.log`, `R34_PG16_COLD_PHASE2_JEST_20261016.log`, `R34_COMPLETE_SOURCE_REGRESSION_20261016.log`, `R34_STRICT_TYPES_20261016.log`. No real member writing or keys are in those receipts.

## Unwaived release blockers

The test uses fabricated signer/keys and a same-Mac test file—not a separately administered KMS, external monotonic deletion register, cross-domain Work revocation lock, sudden power-loss test or independent off-site restoration. There is no authenticated live Source route; structurally typed `server_verified_member_session` input is **not** a secure browser admission on its own.

A published ciphertext pair without an R32 SQL manifest remains an **encrypted orphan requiring independently authenticated custody reconciliation**, not a candidate for automatic deletion or guessed ownership. R34 cannot certify pending-key retirement, raw-key unavailability, R14 independently signed original provenance, larger streamed DOCX/PDF parsing, or erasure from older backups.

Legacy Source, drafts, revisions, kept passages, Apply/Undo, editorial JSON, SQL/WAL/logs/replicas and historical backups are not migrated by R34. All real-member paths remain disabled. Full Safari Mac/iPhone Studio + Personal Portal + MAIA, approved non-Resend invitations and consent, independently governed custody, complete exact-image build and rollback, and separate founder Class A cutover approval are still required.

**Next:** qualify durable encrypted orphan registry and independently witnessed pending-key retirement; then continue the no-plaintext draft and editorial API migration. No production, AWS, real member or invitation change authorized.
