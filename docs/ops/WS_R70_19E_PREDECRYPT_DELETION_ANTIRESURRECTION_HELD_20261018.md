# R70.19E — Deletion non-resurrection: signed historical ciphertext **pre-decryption HOLD**

**October 18, 2026 · Mac Studio · isolated code and read-only ciphertext fixture · actual Writer beta HOLD.**

## Parent, source and bounds
- Exact parent: `8e7b183303036f09c0bc6fc7f4ef7e4f34bed7d4` (accepted isolated R70.19D fictional Writer mutation/recovery suite, 44/44 after test-path correction).
- Own checkout and branch: `/Volumes/T7 Shield/ws-beta-r70-19e-deletion-antiresurrection-20261018`; `feature/ws-r70-19e-fictional-predecrypt-erasure-20261018`.
- Added `lib/writersStudio/recovery/heldR7019EPreDecryptErasureGate.ts`: a *default-OFF test-only* pre-decryption admission contract. It calls the checked-in R11 `requireCurrentRestoreAuthorization`, requiring BOTH independently pinned current deletion highwater and a separately expected complete Work/key census. No hook has been installed in the production app or real recovery executable.
- Added negative unit tests and a source-code fixture driver that **reads the already accepted R70.19D encrypted generation**, without any private key, PostgreSQL access, Docker container or real member material.
- Explicit compilation constants `R7019E_PRODUCTION_DECRYPT_ADMISSION_ENABLED=false` and `R7019E_PRODUCTION_ANTIRESURRECTION_PROVEN=false`. `NODE_ENV=test` and `R7019E_ERASURE_FIXTURE=fictional-only` are both mandatory test conditions; it CANNOT promote a production restore.

## Core safety boundary
A correctly signed *old* encrypted backup can contain a Work that was deleted after the backup was made. Integrity alone is not enough. The recovery path must refuse **before** requesting any decryption private key or creating a PostgreSQL/file-vault restore if any of these controls fails:
- The backup census is missing, altered, signed by the wrong key, contains duplicate/unsorted Work IDs or lacks an independently expected Work.
- The exact ciphertext and manifest digests, source commit or generation identity differ from the independently signed census.
- The independently pinned **minimum archive generation** has advanced past this backup (a perfectly signed and intact old archive is still too old).
- The separately signed current deletion checkpoint is absent/stale, or its signing key is not independently trusted.
- A Work or its encryption key is revoked under the current checkpoint, even if the old archive's own checkpoint declared the Work valid.
- The Work/member/key census fails to match an external separately trusted index. A backup cannot declare its own membership completeness.
- The test-only mode or external authority is absent or malformed. Refusal occurs BEFORE the fictional restore callback.

## Accepted isolated tests
- 16/16 negative and positive gate unit tests (including omitted-Work assault against an independently expected Work index, revoked key/work, stale signed archive, wrong signer, tampered ciphertext, current checkpoint mismatch, missing independent scope and disabled-by-default).
- 16/16 read-only *physical encrypted-file* checks on the accepted R70.19D fixture at `/Volumes/T7 Shield/ws-beta-r7019c-r7019d-exact-8e7b183-20261018/complete-16a01dab3c9e`. The existing real encrypted PostgreSQL/vault ciphertext and manifest pass R70.19C publication/integrity checks, then the new gate refuses known simulated revocations before the fictional restore callback. The encrypted source files are byte-identical before and after. Forged GO flags in a separately re-signed copy of the manifest and missing fixture mode also refuse.
- Selected recovery and authority regressions (R11 deletion barrier, R11 restore admission, R24 external custody and R26 adapter) passed together with the new gate: 59/59 tests across five suites.
- Source-only signing private keys and fictional claimed Work IDs are generated or declared inside the test process and are never persisted in backup/receipt files.
- Only a count/bool receipt is published at `/Volumes/T7 Shield/ws-beta-r7019e-stale-generation-20261018-r3/R7019E_STALE_SIGNED_BACKUP_PREDECRYPT_HELD.json`. No proprietary member data, private keys, decrypted SQL, vault contents, filenames from member materials or provider requests were read.

## Important limitations — no false production claim
1. **Not proof of a full database Work census.** The two Work IDs and encryption-key IDs signed in the R70.19E read-only physical test are **fictional test assertions**, not independently enumerated from the decrypted R70.19D PostgreSQL archive. The gate explicitly reports `signedWorkCensusPhysicallyCompleteProven=false`. A malicious or defective real census signer could omit deleted rows without a separately audited actual capture-time census.
2. **Not an actual production external deletion ledger.** The independent floor and signed deletion checkpoint are synthesized by test harness with transient Ed25519 private keys in the SAME Mac process. They are separate logical identities, **not durable independent off-machine trust**, and their generation can be manipulated by the tester. No real ledger, retention law, revocation publisher or operator-pinned signing authority was installed.
3. **No actual decryption/restoration was attempted in this R70.19E test.** Only the optional fictional callback was demonstrably gated; production consumers can bypass it until independently reviewed end-to-end integration requires preflight before touching private keys or PostgreSQL. The parent R70.19D proves separately that the fictional encrypted PostgreSQL/vault generation cold-restores.
4. **Historic replica deletion is unsolved.** Refusing recovery does not destroy or secure old plaintext/gzip backups, NAS recycle, offsite archives or snapshots. External deletion/retention highwater and key destruction remain unproved.
5. **No live privacy/release certification.** Complete writer inventory (proposals, queues, account deletion, signed/protected generations), current genuine authenticated Mac Safari, provider consent, independently administered restoration host, WAL/PITR, current production key/NAS/cron custody, independent security signoff, exact signed deployment and founder release GO all remain HOLD.

## Next Class A engineering act
Extend the fictional PostgreSQL16 snapshot driver to export and **independently sign the actual complete member/Work/key/source index at the same capture point**, bind it to the encrypted database+vault generation, and verify its records after fresh restore. Then wire a required external-deletion preflight into the actual fixture cold-restore entrypoint, showing an old valid backup with a post-backup deletion fails before private key access and that an unrelated surviving Work remains restorable. Test partial source and stale signed authority, failed journal commits, recovery across separately trusted computers and current deletion highwater. Never install an operational key/cron or admit real writing by passing test-only gates.

**Disposition: isolated signed old-ciphertext pre-decrypt ordering gate PASS, true independent production deletion non-resurrection and real-member Writer's Studio beta HOLD.**
