# Writer's Studio R32 — First encrypted Source-import path (fictional only)

**October 16, 2026 · Local isolated candidate · real-member / production release HOLD**

## Source lineage and objective

R32 begins from the clean merged R31 recovery source `47d245153a9822ab7666e89c2b72ced09ece9631` and merges the separate R31 legacy-write inventory `2233750d605ad4710eb4331abef27b3ec5d48bc1`. Both historical branches are retained without changes.

This is the first bounded Wave A implementation from the four-stage migration worklist, not a claim that legacy Source import or all writer routes are encrypted. The inherited lexical source scanner identified **51 literal legacy SQL write candidates in 19 non-test source files** in its original sample. Running the reconciled scanner directly against R32 source returned **51 candidate writes across the same 19 files (311 TS/TSX files scanned)**, HOLD. Those are lower bounds, not 51 confirmed leaks. Scanner self-tests 4/4 PASS. The scanner's normal output command refused to overwrite the earlier private receipt and that pre-existing evidence was preserved; the newer inspection used a read-only `run_scan()` call.

## New, separate encrypted Source writer

- `lib/writersStudio/recovery/heldEncryptedSourceR32.ts` stores a **fictional** imported Source in the existing authenticated AES-256-GCM WorkSnapshot codec and immutable fsync/readback `fileVault`. It preserves original binary bytes, extracted Source text, and private provenance (filename, declared DOCX/PDF/TXT/MD format, MIME, extractor/version). All are sealed **before** any database write.
- A new explicit `soullab.ws.r32.private-original.v1` encrypted **payload inside the existing R11 `original_source.bytes` record** carries original binary bytes and private metadata. This was a deliberate compatibility fix: the first R32 implementation expanded the R11 field registry and failed three inherited recovery/classification tests. That change was **reverted**; the existing 11-field R11 registry, previous readers and older envelopes remain byte-for-byte unchanged. R32 also uses the existing `manuscript_source_arrivals.source_text` encrypted WorkRecord designation, without writing to the actual legacy arrival table.
- PostgreSQL 16 holds only member ID, Work ID, Work key ID, random opaque ciphertext reference and ciphertext SHA-256 in the **review-only** `writers_studio_r32_held_sources` table. Trigger enforces same-member ownership and immutable INSERT-only history. This SQL is in `docs/ops/WS_R32_ENCRYPTED_SOURCE_REVIEW_ONLY.sql`, deliberately **outside** `database/migrations`.
- The adapter checks the member's held-only structural subject, Work ownership before vault publication and again under a real DB row lock, current externally signed deletion high-water (in physical tests: ephemeral fictional signer), vault readback and ciphertext digest before restoring exact source and filename. It refuses a second import for a Work at preflight, and the database has an independent one-Source-per-Work uniqueness constraint. A concurrent loser can still leave an encrypted orphan; R32 does **not** resolve durable orphan reclamation or cross-domain atomic deletion.
- The only writer entrypoint requires `R32_ENCRYPTED_SOURCE_FIXTURE=fictional-only`; compile-time `R32_REAL_SOURCE_IMPORT_ENABLED=false`. **No active Next.js route imports this module; no real writer content can enter the new table.**
- The R11 snapshot envelope is limited to a maximum 16 MiB packed record set. R32 conservatively refuses combined original+extracted input greater than 7 MiB with `r32_large_source_requires_chunked_encryption`. It never truncates an author file or falls back to ordinary SQL. Production DOCX/PDF streaming/chunked encryption and format-specific extraction remain unimplemented.

## Actual fictional PostgreSQL 16 qualification

`scripts/ops/wsBetaR32PG16EncryptedSource.ts` exercises the unmocked repository PostgreSQL pool/transaction, immutable vault and held encrypted import/reopen against a disposable Docker `postgres:16.13`, loopback-only Mac port and fictional two-member/Work database. The test's original file is a **manufactured DOCX-like byte sequence**, not a real parser/extraction/Office conformance test.

- **13/13 physical checks PASS; 8 negative controls:** duplicate Source, cross-member read and import, wrong same-ID key bytes, stale external deletion epoch, revoked Work, oversized input and direct SQL owner mutation.
- Exact original bytes, extracted fictional author text and private filename roundtrip. Full fixture `pg_dump` and sealed vault ciphertext do not contain the source text, original bytes, filename or extractor label. The actual PostgreSQL server survives SIGKILL/restart with Source manifest and vault ciphertext still present.
- All synthetic Docker container/volume and temporary private vault content cleaned at completion; real production, real member data, paid model providers, AWS, SMTP, real KMS, public routes and member identities not touched.
- Focused R32/source-compatibility plus earlier R11 recovery tests: **23/23 PASS**.
- Combined inherited selected Writer's Studio security/source/consent/recovery regression after compatibility repair: **54 suites / 580 tests PASS**.
- Scoped strict TypeScript `tsconfig.r32-encrypted-source.json`: PASS.
- Private physical receipt: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R32_PG16_ENCRYPTED_SOURCE_20261016.json`; combined Jest `R32_ENCRYPTED_SOURCE_SELECTED_REGRESSION_20261016.log`.

## Why this is NOT ready for real writers

1. Existing production **still invokes `lib/manuscript/source/arrivals.ts`**, inserting source text and original filename into legacy SQL; create/edit/revisions likewise still use legacy plaintext columns. R32 is an isolated alternative route-unconnected writer, not an activated replacement or data migration. Earlier SQL/WAL/replica/export/backups are unaddressed.
2. **Independent production Work key authority does not exist.** R32's fixture uses a manufactured key and Ed25519 deletion signer's process-memory identity, not a governed KMS or current independent high-water under failure/rollback. The structural `server_verified_member_session` subject is not an unforgeable token; real route must mint it internally after exact R17/R29 session/invitation/consent checks.
3. Owner Work row lock plus file vault fsync cannot independently serialize revocation and remote KMS grant or offer a single atomic PG16/vault transaction. This cannot be promoted until a real cross-domain R30 coordinator and orphan reconciliation are operational.
4. Current R32 file-size and fabricated DOCX-like input test do not implement real DOCX/PDF/TXT/MD ingestion, extraction, warnings, content streaming, parsing fidelity or large original-document recovery.
5. New encrypted-only Source creation is not yet joined to existing Work lifetime/version semantics or to the held R16 pending arrival/claim/provenance signatures. Older Reader's Studio and MAIA require a separately reviewed backward-compatible read bridge, no silent loss of original Source or Apply/Undo.
6. Complete legacy Source/current draft/sections/revision keeps/proposals/authorizations/derived editorial JSON, logs/WAL/export/old-backup encryption migration, older-image rollback, offsite multi-domain recovery and historical key retirement remain independent STOP conditions.
7. Full production shipping TypeScript/build and exact image browser Mac/iPhone Safari Studio/Personal Portal/MAIA validation, approved notice, invitation-only transport, real KMS custody/budget, founder exact-source/image authorization still required.

**R32 advances new fictional original-Source encryption while keeping the actual five-person beta closed. Production and prior work are unchanged.**
