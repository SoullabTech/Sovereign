# R68 — Writer beta production storage and recovery readiness

**October 17, 2026 | Founder Mac Studio | R67 source parent 14de056ad4524267efbaefc92429e8a424e35b24 | Production beta HOLD**

## Governing decision

The first Writer's Studio beta may use properly governed **standard managed security**, rather than first building a fully sovereign, independently self-hosted key service. That decision does NOT waive the requirement to observe actual production encryption at rest, TLS and identity isolation, encrypted and recoverable backups, deletion/retention and a truthful member notice. Standard security is not zero-access or end-to-end encryption.

The accepted R67 release checker explicitly reports the standard-private launch as OPERATIONAL_EVIDENCE_HOLD: productionStorageVerified=false, encryptedBackupsAndRestoreVerified=false, and activeProtectedRouteBindings=[]. R68 leaves every one of those gates closed.

## Source-only inventory (real source, NO real backup contents)

R68 implements scripts/ops/wsBetaR68StorageSourceReadiness.mjs.

It reads exactly ten known checked-in backup, restore and storage source files, emits their SHA-256 source hashes and **risk classifications only**, and never opens production environment variables, SQL data, member writing, backup paths, credentials, NAS files or Docker. The two commands are --audit (read-only classification) and --release-gate (always exits 2/HOLD, never GO). A green source audit is NOT a production encryption attestation.

| Existing repository source | Source-level limitation |
| --- | --- |
| scripts/backup-db.sh | PostgreSQL SQL dump piped through gzip; gzip is NOT encryption |
| scripts/backup-postgres.sh | Temporarily writes a plaintext SQL file before gzip |
| scripts/backup-database.sh | Data-only SQL inserts and schema exported as gzip, not encrypted |
| scripts/setup-backup-cron.sh | Contains a routine that copies DATABASE_URL into crontab and could overwrite existing crontab |
| scripts/restore-db.sh | R20 default refuses an ungoverned restore, but an explicit old override still exists |
| scripts/restore-governed.sh | Governed restore code exists, but actual installed use and real restore remain unverified |
| scripts/ops/ws-backup-exact-shell-preflight-oci.sh | Only a held shell preflight on entirely synthetic mocked environment |
| scripts/ops/test-ws-backup-transition-fixture.mjs | Only a fictional in-memory NAS/backup transition model |
| lib/storage/fileVault.ts | File-vault location alone does not prove actual disk encryption |
| lib/storage/encrypted-backup.ts | App-level encrypted backup code does not certify full PostgreSQL, WAL, vault, snapshots and keys |

These are **possible repository execution paths**, not claims that each listed job is running on Linux production. The actual installed backup binary, cron/timer, PostgreSQL and volume keys require an independently authorized read-only inventory. R68 neither disables nor replaces any live job and never deletes or exports historical backups.

Ten focused source-gate/negative-control tests prove missing/mutated source, injected approval checkboxes, false application-backup confidence and unmarked restore execution do NOT turn source evidence into a production GO. Together with the original beta and backup-transition release-safety tests, 66/66 Node tests passed before exact-commit requalification.

## Physical fictional PG16 database + Source recovery

New fixture: scripts/ops/wsBetaR68FictionalEncryptedRestorePG16.mjs.

The test creates two exclusively test-owned PostgreSQL16 Docker instances from the cached image, each with **no network, no published port and no host database bind mounts**. Fictional SQL contains three manuscript sections. A separate encrypted Source-vault object is constructed using a synthetic Source key. Actual pg_dump content is kept ONLY in process memory, bundled with the encrypted Source and sealed in a distinct AES-256-GCM backup envelope under another synthetic key. Plain SQL and Source bytes are never written as the archival files.

A fresh Node process reads test-only mode-0600 escrow, decrypts the archive, separately authenticates the encrypted Source, checks section/Source digests and restores SQL into the OTHER disposable PostgreSQL16 instance.

Negative controls must each refuse BEFORE writing any destination database:
- Incorrect backup encryption key
- Tampered encrypted archive bytes
- Backup containing SQL but omitting original Source
- Old archive whose deletion epoch is below an explicitly supplied hypothetical current highwater

The fixture verifies the destination remains empty after each refusal. Then the good backup must restore all three versions and match original Source/section hashes in a fresh process, while leaving the original database untouched. Only the script's random-ID-labeled containers, test archive and same-host fake escrow are removed. A metadata-only local receipt records counts and cleanup.

Precommit physical acceptance: **21/21 checks PASS**, including all four negative controls and cleanup. This is a **procedure rehearsal**, not proof of operational key management, a separate disaster-recovery site, actual encrypted backup jobs, historic plaintext remediation, production vault coverage, real deletion authority or offsite restore. The fake backup and Source keys share the test host; none are independently operated by a production KMS.

## Real production evidence required — metadata first

Before any live action, a separately authorized production inspection should record **only** metadata and exact redacted source checksums: no database URL, credential, manuscript title/text, SQL dump, encryption key, or backup contents.

| Required independent evidence | Status |
| --- | --- |
| Current production TLS, authenticated member scoping and active DB host | NOT VERIFIED |
| SQL/database, WAL/temp and physical volume encryption at rest | NOT VERIFIED |
| Source, Draft, Keep, private proposal, file vault and temporary exports at rest | NOT VERIFIED |
| Actual installed backup jobs and whether their outputs are encrypted rather than gzip-only | NOT VERIFIED |
| NAS/offsite copies, snapshots, recycle and older plaintext SQL/archive locations | NOT VERIFIED |
| Managed encryption-key access, audit, retention, and backup deletion limitations | NOT VERIFIED |
| Restoring an ACTUAL encrypted SQL+vault backup at a separate isolated recovery destination | NOT VERIFIED |
| Member ownership, consent, deletion-barrier/anti-resurrection and rollback-reader preservation | NOT VERIFIED |
| Independent security reviewer and exact truthful current member notice | NOT VERIFIED |

The safe sequence is read-only service/job/volume/copy inventory; explicit review of uncovered plaintext archives and replication/retention; separately approved encryption or backup changes; real **isolated restore** and current-member/deletion checks; independent security and founder source/image canary GO.

Do not stop installed backups, install a proposed root job, rotate keys, delete old files, mount NAS or run a raw restore on the live database from this R68 effort. A new encrypted backup does NOT retroactively encrypt prior plaintext gzip copies or authorize their deletion.

## Other launch blockers unchanged

- The full unsuppressed shipping TypeScript/Next.js build still fails; R67 exact source reports 177 inherited diagnostics.
- A true authenticated PC3 writer import → Develop → Write → Review → separately approved Apply/Undo/Save/Export using appropriately governed standard storage is not yet demonstrated. R64's synthetic encrypted writer and R65's conventional pasted Source remain **different custody pathways**. No silent downgrade or guessed migration between them.
- Historical unencrypted Source/Draft/Keeps/MAIA SQL/WAL/log/export/backup/old-reader records need an explicit nonresurrection plan.
- A genuine Mac and physical iPhone Safari experience, independently governed restore, private/member retention notice, reviewer, founder exact signed image and staged two-writer approval remain outstanding.
- The more sovereign per-Work key/deletion/freshness architecture remains preserved for voluntary future upgrade but is not a mandatory prerequisite for the **standard private beta**.

All local fixture and source evidence is preserved under the R68 evidence root on the founder's T7. No real members, provider calls, production DB, NAS, credentials, installed root scripts or GitHub releases were touched.

**Disposition: R68 can qualify a source inventory and fictional backup/restore procedure for future engineering. Real production storage and the five-tester Writer's Studio beta remain HOLD.**
