# Writer’s Studio R23 — File-vault/SQL-history convergence (HELD)

**October 16, 2026 · Soullab five-member, invitation-only beta · target `soullab.life`**

**Status:** R23 isolated-source and fictional PostgreSQL 16 qualification PASS; real member custody and production release HOLD.

## Decision — one candidate storage architecture

Two separate R21 implementations previously passed bounded tests but stored historical content differently:

- **R21 SQL JSONB history**, inherited by R22 `31346f4a2a0064420ca28651eccc5b651374e796`: authenticated WorkSnapshot ciphertext lives in PostgreSQL JSONB; owner-locked revisions, generation chain, current deletion witness.
- **R21 durable file-vault history** `4d0a0e102fa38788cc5a93c529f743eb76b96bdf`: authenticated WorkSnapshot ciphertext lives in immutable, fsync/readback-verified file vault; PostgreSQL contains only owner, Work, generation, key, ciphertext reference and digest. Existing physical PG16 + vault recovery evidence passed.

**R23 selects encrypted file-vault bytes with a PostgreSQL owner/version/cryptographic-integrity manifest as the candidate architecture** for manuscript/history. This extends the already governed original Source vault direction, avoids placing encrypted prose in multiple database JSON fields, and makes immutable vault data and PostgreSQL metadata separately witnessable. This is a proposal for the eventually approved system, **not a production migration**.

R23 combines the vault approach with the SQL R21 version-chain and R22 verified-session composition. It **does not overwrite or merge away** the alternative code and its evidence. An old R21 SQL/JSONB history reader must not be assumed to read R23 vault ciphertext, and rollback cannot discard newer Writer Works.

## What was actually built

- New isolated `lib/writersStudio/recovery/heldVaultHistoryR23.ts`: uses actual repository PostgreSQL pool/transaction and existing immutable `lib/storage/fileVault.ts` to persist AES-256-GCM WorkRecord snapshots **in the vault**, with ciphertext-only database parameters. It checks ownership before vault publication and again under Work row lock, serializes version append and stores the previous ciphertext SHA-256. Historic reads check both metadata and previous digest, current signed deletion checkpoint, member/Work/generation and authenticated GCM.
- `docs/ops/WS_R23_VAULT_HISTORY_REVIEW_ONLY.sql` defines a **fictional-only, not-deployed** PG16 table outside `database/migrations`. A trigger refuses update/delete, forged/nonexistent revision predecessors, foreign-member Work and extra prior hash on first revision. No public privileges granted.
- New `lib/writersStudio/recovery/reviewVaultHistoryServiceR23.ts` uses real R17 source-side session/allowlist/latest-consent review, exact main-host HTTPS, origin and method; requires a scoped fictional custody provider for each append/reopen and passes the verified member identity to the selected vault backend.
- Both R23 service and R23 storage require exact fictional-only fixture environment gates and have real-member activation constants `false`; **no live Next.js route, Caddy config, member entitlement, database migration, or independent key custodian is connected**. Founder's witness role by itself is not permission to write someone else's manuscript.
- A failed database insert after a durable ciphertext file write can leave an encrypted orphan. The synthetic vault is cleaned after each fixture, but **production orphan reconciliation is still required**. Do not claim complete atomicity across PostgreSQL and filesystem.

## Verified evidence

1. Actual disposable local `postgres:16.13` with filesystem vault, fictional writers and keys; loopback-only test exposure, no real membership, credentials or content.
2. **21/21 physical checks PASS**, with **10 negative control categories** including uninvited/foreign member read/write refusal, wrong key, missing/stale external checkpoint, signed deleted-Work, generation replay, forged predecessor direct SQL, concurrent same-generation submissions (one winner), ciphertext tampering, owner-mutation refusal.
3. Two generations chain exact predecessor ciphertext hashes; authenticated owned writer content roundtrips; full isolated `pg_dump` excludes fictional prose; real PG16 SIGKILL/restart retains owner, ciphertext digest and vault files.
4. Disposable PG16 container, its test image-created volume and temporary local file-vault content removed. Initial failed fixture attempts were held and cleaned before corrected successful qualification.
5. R23 verified-session-to-vault focused **11/11 unit tests PASS**. Carried selected Writer's Studio/custody/security regression **39 suites, 461/461 PASS**. Scoped strict TypeScript **PASS**.
6. Evidence: private `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R23_PG16_VAULT_HISTORY_20261016.json`, `R23_INTEGRATED_REGRESSION_20261016.log`; no member records or credentials in this documentation.

## Real-member release NOT proven — stop rules

- **No independently deployed, revocable Work-key/KMS and nonrollbackable deletion-highwater authority.** Test Ed25519 signers and GCM keys live only in temporary fictional process memory.
- **No actual production-identity-to-PG16 end-to-end writing journey:** R23's R17 check uses mock session/consent in unit tests; the physical PG16 fixture uses manufactured fictional trusted context. Do not conflate the separate tests.
- **No all-store encrypted migration:** existing plaintext Source, chapter, draft, revisions, selected authorizations, 11 direct and 8 derived/editorial history fields, remaining unclassified JSON, SQL/WAL/offsite backups, exports/provider retention must be reconciled before real imports.
- **No independent cold restore or old-image rollback/anti-resurrection witness:** link integrity alone is not full backup/deletion custody, and a prior SQL/JSONB history reader cannot consume this new vault format. Original Source file provenance/streaming and pending key retirement remain distinct requirements.
- **No complete Writer’s Studio + Portal + MAIA browser approval:** Mac and iPhone Safari, Chrome, Develop/Write/Review, Apply/Undo, import, save/reopen, download, withdrawal and recovery remain mandatory.
- **Linux production build-space gate remains below 60 GiB**; no blanket prune of images, containers, named volumes, backups or pinned rollback artifacts. No member invitations, DNS changes or main-host cutover permitted until exact source + exact image qualified and founder approved.

**Next candidate R24:** independently governed scoped key/deletion authority; PG16/revision/Source migration and durable orphan handling; immutable original Source and old-backup restore/rollback; then actual browser/member canary on `soullab.life`. Scope remains **five individually verified invited testers**, not a wider public launch.
