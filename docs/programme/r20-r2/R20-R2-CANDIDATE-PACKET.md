# R20-R2 — Deletion-safe production recovery: isolated engineering candidate

**Date:** 2026-10-12
**Source authority:** `origin/clean-main-no-secrets` at `f574a70678`
**Worktree:** `/Users/soullab/jarvis-r20-r2-20261012`
**Branch:** `feature/r20-r2-deletion-safe-recovery-20261012`
**Disposition:** **SYNTHETIC CANDIDATE — NO PRODUCTION AUTHORITY**.

## Governing question

A historical backup must never silently resurrect a Work or other material that the member deliberately deleted. Under unresolved identity, time, custody, schema or deletion-authority conditions, restoration must refuse rather than complete with warnings.

The prior R20 witness proved two fail-open paths in the existing governed-restoration script (with synthetic rows only): (a) a member-only scope was skipped and (b) losing the original deletion ledger allowed previously erased data to return. This engineering candidate is designed to close those boundaries, subject to the outstanding integration and custody gates below.

## Four connected candidate components

### 1. Deletion authority (candidate code wired, NOT deployed)
- `lib/recovery/r20-r2/recordWorkDeletionAuthority.ts` creates a minimal deletion manifest, parent Work/manuscript tombstones, and an append-only external-attestation outbox obligation under the same PostgreSQL transaction.
- `lib/manuscript/source/eraseManuscript.ts` calls it after a successful delete and before transaction commit; any failure aborts and rolls back deletion.
- `database/migrations/20261012000001_r20_r2_deletion_authority_outbox.sql` adds an append-only sequence/manifest reference and mutation-refusal trigger. **Never apply to production under this packet.**
- Parent tombstones rely on actual `ON DELETE CASCADE` constraints; complete derivative/vault coverage is not yet verified. No signature/attestation is minted in the DB transaction itself.

### 2. Independent continuity (cryptography works; external authority NOT connected)
- `lib/recovery/r20-r2/signedLedger.mjs` verifies Ed25519 signatures for the content-minimal deletion ledger and a distinct independently signed head.
- Requires caller-supplied trusted signing keys, a pinned head digest, and an externally known high-water floor. Invalid, stale, tampered, unsupported or content-bearing checkpoint material is rejected.
- Test signing keys are ephemeral. No production key has been generated, imported, stored, registered or deployed.
- The actual independently controlled monotonic head, signing service, event exporter, witness availability and outage behavior remain to be built.

### 3. Sealed restoration (synthetic simulation only)
- `lib/recovery/r20-r2/sealedRestore.mjs` allows only fabricated-data fixtures under an explicitly synthetic target.
- It verifies backup digest and signed deletion authority, suppresses forbidden records via named table/owner mappings, asserts zero resurrection, and preserves unrelated synthetic controls. It always returns `promotionAllowed: false`.
- `scripts/ops/r20-r2/member-sweep-synthetic.sql` is separately proven in an isolated PostgreSQL 16 fixture and throws on unknown member-scoped tables. It is **not** part of the live restore script.
- Existing `scripts/restore-governed.sh` remains unchanged. A full production-shaped, isolated restore using the new gate and exhaustive table/vault model is still required.

### 4. Archive custody (planning without destructive side effects)
- `lib/recovery/r20-r2/archiveCustody.mjs` classifies known and unattributed archive custody states and never deletes files.
- A potentially contaminated archive cannot even become eligible for a separate manual purge review until verified clean continuity and scoped human authorization are present.
- Historic NAS archives lack signed deletion-watermark metadata; **unknown is held**, never treated as clean.
- Snapshot Replication production schedules and immutable retention remain off until deliberate deletion rights are shown end-to-end.

## Evidence obtained

- Work-deletion transaction tests, schema outbox synthetic PostgreSQL transaction/rollback tests, Ed25519 signature and anti-rollback negative tests, synthetic sealed-recovery tests, archive custody tests.
- Earlier R20 disposable PostgreSQL proof reproduced both fail-open restore conditions and proved a provisional member-scope corrective sweep; no production data or real manuscripts involved.
- All disposable test containers were destroyed. Production route, migration, web service, database, NAS backup schedule and member content were left unchanged.

## Authority gaps — all BLOCK production

1. **External trust anchor:** outbox exporter, key rotation, independent signer(s), durable signed and anti-rollback ledger with exact commit-to-checkpoint admission semantics. An archived database cannot be its own source of erasure authority.
2. **Deletion coverage:** every Write/Develop/Review, source/vault, render, draft, linked Living Work, media, offline Cabin, and derived artifact path must be enumerated; tombstoning only the parent is not automatically total erasure without verified cascade and file handling.
3. **Member-facing truth:** no "total erasure complete" claim while contaminated snapshots/replicas remain or async vault destruction is unscheduled. Unknown class fails closed, not silently retained.
4. **Restore seal:** clone into quarantined DB; verify source hashes and signed external authority; deny release while any targeted row/bytes remain; prove nondeleted content survived; no ungoverned `psql` bypass.
5. **Archive retirement:** metadata-only inventory and explicit decision of whether clean new recovery continuity exists before authorized destruction of contaminated old backups. Include Mac/LaCie, NAS snapshots, offsite replicas, encrypted media.
6. **Independent review:** real file-read trace, compatibility/regression witness, constitutional Class A privacy review, explicit human adjudication of exact commit before any merge or production migration. No self-approval.

## JARVIS review mandate

Review the exact isolated branch **read only**, using independent local GPT-OSS and Qwen passes where available. Review especially: transaction rollback and outbox invariants; scope mapping; Ed25519 canonicalization and anti-rollback assumptions; fake authority/real authority confusion; deletion of media/vault/children; archive continuity; offline Cabin branch; operational alerts. Produce file-read trace, findings, compatibility score, counterexample cases and verdict. Preserve the production/no-member-data membrane.

No merge, push, production change, restore, archive deletion, immutable snapshot activation or automatic expansion of evaluation authority is authorized by this packet.

## Kelly's World propagation — staged only

- **Today:** founder gate — independent R20 restore/privacy review required.
- **Work:** R20-R2 bounded candidate with test evidence and unresolved authority gaps.
- **Graph:** deletion act → manifest/tombstone/outbox → independently signed head → quarantined recovery → deliberate archive custody.
- **Monitor:** backups pass operational checks; production restoration remains HELD; report missing signer/high-water and failed vault sweeps distinctly.
- **System:** R20 Grade B stays visible until independent evidence clears production authority.

**No live Kelly's World UI was modified.**
