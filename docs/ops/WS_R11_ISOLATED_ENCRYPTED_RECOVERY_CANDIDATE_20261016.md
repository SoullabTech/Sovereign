# Writer's Studio R11 — isolated encryption/restore contract

**Disposition: technical candidate PASS in bounded fictional tests; real-member release HOLD.**
**Date:** 2026-10-16 (America/New_York)

## Source and authority
- Exact base: public R9 canary source `d2020f7bfa66286c5f4b274d2a5fdb17b8c913b2`.
- Branch: `fix/ws-beta-r11-encrypted-recovery-candidate-20261016`, isolated on T7.
- New source modules: `lib/writersStudio/recovery/workEnvelopeV1.ts`, `deletionBarrierV1.ts`, `recoveryAdmissionV1.ts`.
- **No service/API/DB migration or storage writer imports this code.** Existing public R9 beta and private real-member beta remain unchanged.
- R11 real-member backup admission is statically `CLOSED` in source. Nothing here is a deploy authorization or actual key-custody installation.

## What this candidate demonstrates
- AES-256-GCM authenticated encryption of Work records using an injected 32-byte Work key (never included in the sealed backup). The owner/member UUID, Work UUID and snapshot generation are cryptographic associated data; source bytes, draft text, record IDs and filenames are not emitted in the external envelope.
- Strict, explicit records for **10 provisionally classified PostgreSQL text fields plus original Source bytes**. Any unreviewed field, duplicate record, stale generation, mismatched census, invalid cipher, wrong identity/key or missing deletion trust refuses.
- Signed Ed25519 deletion high-water verification, plus an independently supplied **minimum generation**. Older signed checkpoints, deleted Work IDs and retired key IDs refuse before Work decryption. The independent number is **not yet backed by an independent nonrollbackable service**; a signature alone is insufficient.
- Schema admission deliberately returns `HOLD_UNCERTIFIED_BACKUP` even when the known ten fields are present. A declared row census cannot prove a production query enumerated everything.
- Physical synthetic PostgreSQL 16 rehearsal: separate networkless PG and Source Docker volumes; actual old `pg_dump` + original-file TAR restored a deleted fictional Work, proving global-backup resurrection risk; R11 Work-envelope restore rejected that Work and restored the surviving Work's draft and original bytes exactly.

## Test evidence (T7 R9 build evidence folder)
- `R11_RECOVERY_CANDIDATE_TESTS_20261016.log`: 3 suites / 25 tests PASS.
- `R11_INTEGRATED_WRITER_REGRESSION_20261016.log`: **24 suites / 305 tests PASS** (21 inherited R9 sign-in/ownership/consent/source tests plus 3 R11 suites).
- `R11_PHYSICAL_PG_TEST_20261016.log`: physical PG/Source fixture PASS (1 test), with fixture cleanup assertions.
- `R11_FOCUSED_TSC_20261016.log`, `R11_PHYSICAL_TSC_20261016.log`: focused TypeScript PASS.
- All fixture keys/signers/Works are invented; no member data, provider call or production media/keys touched.

## Full source/reconstructive inventory: still HOLD
- Scoped read-only real-beta metadata scan `R11_SCHEMA_RECONNAISSANCE_20261016.json`: **389 candidate fields**, 10 provisionally classified, 379 other fields, **68 names suggest potentially reconstructable text/JSON**. These are review candidates, not documented leaks.
- `R11_RECONSTRUCTIVE_FIELD_TRIAGE_20261016.md`: 17 direct manuscript/revision, 40 editorial/derived and 11 adjacent-domain candidate names grouped for review. Real relation and retention scope must be decided for each.
- `R11_RELATIONAL_OWNERSHIP_METADATA_20261016.json`: metadata-only relationships across **48 tables**, **119 FKs**; 36 tables do not expose *both* member and Work IDs directly and require a verified ownership join or explicit unrelated-data adjudication.
- Important sources outside ten fields include developmental review snapshots, Apply/Undo recovery before/after bodies, proposal interpretation JSON, client editorial turns and corrections.
- **Unclaimed original-file arrivals:** may have a member but no manuscript/Work yet. They must receive independently governed pending-arrival custody/key/erasure semantics, or an approved changed import path. Never fabricate Work ownership or automatically delete historical unclaimed arrivals.

## Non-negotiable release gates
1. Inventory all relational, JSONB, vault, temporary, render, derived-memory, provider-held, WAL, historical SQL/NAS/offsite and replica copies that can reconstruct writing. Classified unrelated data requires source evidence, not label guesses.
2. Build and test a real source adapter with authenticated owner/Work joins, atomic DB + original-file generation, and a verified all-rows census. New backups must not contain legacy plaintext or a recoverable global SQL dump.
3. Verify key custody outside both backups and app host, cryptographic per-Work key lifecycle, independent signed **nonrollbackable** deletion checkpoint, replay refusal, key recovery for surviving Works, and post-delete irrecoverability under loss/restart/restore.
4. Resolve unclaimed arrivals without source substitution or silent retention/erasure; certify archival and old-reader rollback compatibility.
5. Preserve actual author rights, immutable originals, Apply/Undo, consent withdrawal, portable export, and member-to-member isolation in the actual browser.
6. Only after this is accepted: founder exact-SHA Class A source review, separate exact-image/operator release GO, dark-beta source vault change, then Jondi's member-controlled consented canary.
7. No inferred approval to deploy, invite, bill, alter production, inspect private text/keys, or repeat exhausted paid model calls.

**Decision:** The cryptographic envelope is a useful first integration component. The backup system as a whole is NOT implemented or certified, so the real-member beta remains CLOSED.
