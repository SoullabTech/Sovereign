# R1V — Minisforum-specific encrypted complete-Work backup replacement (review-only)

**October 18, 2026 — code prepared, production HARD-DISABLED.**
**R1T base:** `abd9ddfc93c431a4ae2f8f5574aa6b163bf19529` (fictional encrypted DB+vault/restore).
**Live backup cutover:** **HOLD**. **Writer’s Studio five-person real-manuscript beta:** **HOLD**.

## What this source actually prepares

An executable **server-specific backup candidate**, plus a **separately executable independent restore** and a server-custody preflight. The writer knows the exact inspected Minisforum layout but **rejects `--live` unconditionally at source level**. There is no production-enabled environment variable, override, cron installer, restart code, data migration, or source key in these files.

### Exact inspected Minisforum bindings

| Source | Runtime binding | Future production coverage |
|---|---|---|
| PostgreSQL | Container `maia-postgres`, database `maia_consciousness`, role `soullab`, volume `maia-sovereign_postgres_data` | Consistent **custom-format pg_dump** encrypted as a stream. WAL/PITR and file/database coherence must be separately qualified. |
| Media | `maia-sovereign_media_data` -> `/app/data/media` | Encrypted file archive |
| Writer/Source vault | `maia-sovereign_vault_data` -> `/app/data/vault` | Encrypted file archive |
| Voice notes | `maia-sovereign_voice_notes_data` -> `/app/storage/voice-notes` | Encrypted file archive |
| Workbench | `maia-sovereign_workbench_data` -> `/app/data/workbench` | Encrypted file archive |
| Audit log files | `maia-sovereign_audit_data` -> `/app/data/audit-logs` | Encrypted file archive |

**Important uncovered sources:** the read-only AIN bind at `/app/data/ain-vault`, audiobook assets, Community Commons, unclaimed import files, any external object or email storage, and all historic NAS/local/recycle/offsite backups require separate source/erasure review. A vault volume list alone cannot certify the completeness of every member Work, attachments, sources, export or deletion lineage.

### How the new candidate works

- `scripts/ops/wsBetaR1VMinisforumEncryptedBackup.py`: prints a *read-only planned topology*, and has a **hard-coded `R1V_PRODUCTION_CUTOVER_RELEASED=False`** which rejects `--live` before opening production Docker/NAS/storage. Its only executable backup mode demands an exact T7 fictional directory, a network-disabled **`ws-r1v-src-XXXXXXXX`** Docker PostgreSQL fixture with no mounts and a verified `soullab.fixture=r1v` label, five private fake file-volume roots, and an approved **test public encryption recipient only**. It disallows the real `maia-postgres` container even if a caller supplies the name.
- Both streams encrypt directly into separate `.gpg` files using an approved public GPG recipient and AES-256. No plaintext database dump or tar staging. Backups refuse if the writer keyring contains the private decryption key. They acquire an exclusive test lock, inspect all five file roots, reject symlinks/hardlinks/special files and changes between snapshot phases, then publish `complete/<generation>` **only after** database ciphertext, file ciphertext and a private manifest exist. Failed dump, file tar, invalid key and deliberately injected failures after either component never publish a complete generation. Temp ciphertext staging is cleaned; existing completed points are never pruned.
- `scripts/ops/wsBetaR1VIndependentColdRestore.py`: a **separate command**, also fixture-only, checks the exact three files, manifest identity, all five required volume names and per-file ciphertext SHA-256/bytes **before** decryption. It refuses missing/tampered points, wrong private key, directory escapes, symlinks/unsafe tar paths and non-fixture Docker destinations. It streams decrypted custom-format SQL to a **new** PostgreSQL 16 database and independently rebuilds the five file roots; no plaintext intermediate tar or SQL archive is written.
- `scripts/ops/wsBetaR1VFiveVolumeRestorePG16.py`: creates the **fictional source**, with two invented SQL rows and six files distributed across all five volume categories; generates an ephemeral private key in an **independent non-backup folder**, gives the writer only its public key, injects failures, verifies one complete generation, **destroys the original source database and file roots**, and runs the independent restore executable. It checks exact rows and file hashes, then deletes its temporary decrypted output, private keys and Docker containers.
- `scripts/ops/wsBetaR1VMinisforumCutoverPreflight.py`: **offline-only** decision model for the actual installed server layout. It checks real script hashes, mount paths, cron states, application-writer quiescence, capacity, separate recovery-key custody, unsigned-manifest and SQL/files/WAL consistency limits, and a named founder change-window authorization. It cannot change cron or connect to the server. The live sanitized audit correctly produces **HOLD**.
- `scripts/ops/__tests__/wsBetaR1VMinisforumBackupSafety.test.cjs`: local source-law assertions for all fail-closed and scope constraints.

**Manifest honesty:** the fixture's SHA-256 manifest is **NOT externally signed** or immutable. A party controlling both ciphertext and JSON can replace both and recalculate hashes. **Independent tamper-evident signatures and separately retained evidence** must be designed and witnessed before a live recovery point can be trusted. The fixture also cannot prove a coherent DB/WAL/files snapshot across concurrent real writes; contents were synthetic and locally quiescent only.

## Live read-only inventory pinned 18 October 2026

- Installed root/NAS writer `/usr/local/bin/maia-backup`, SHA-256 `5f09ddcff7d0c50c2cf92657bbdea2caaebdffa74d6390f378fda708343c340f`, root cron SHA-256 `9d13aecae92f0b4619f3ac65d38dadd8b5a9c8407eecab234b4e141e9f4086ac`, scheduled **02:00 UTC daily**. Uses `pg_dump | gzip` plus `rsync -a --delete` of **only the media** volume; does not explicitly encrypt SQL or include the other four named file volumes.
- Installed separate user backup script `/home/soullab/MAIA-SOVEREIGN/scripts/backup-postgres.sh`, SHA-256 `f7288be2e117d63de82ade4b16628502303b4827c2732cdd5fc5c828526c78f9`, also scheduled **02:00 UTC daily**; creates an intermediate plaintext `.sql` before gzip, without a declared `pipefail` or full-file-vault capture.
- Server root `/` approximately **92% used**, **80 GB free**, 8 GB swap almost full; NAS mounted at `/mnt/ds225` over CIFS with approximately **14 TB free**. Two root and user `.sql.gz` destinations contain a **minimum of 60 unencrypted compressed SQL archives**, before old raw SQL, NAS recycle/snapshots and other backups. Existing older archives must not be deleted before retention/legal/erasure review.
- Source Docker mounts and running application processes were verified from metadata by **read-only, unprivileged SSH**. No member content was opened. The available SSH identity lacks noninteractive sudo; production write changes require distinct operator authority.

## Controlled future cutover — sequence, not execution

**Stage A. Operator decisions and secure key custody.** Select a long-lived production recovery public recipient and a **separately held, independently tested off-host private recovery key**, including rotation/revocation/second-custodian process. Never generate the recovery private key inside a cron script or leave it on the source host. Verify the exact certificate/fingerprint and public-only writer keyring with independent witness. Approve storage, signing/immutability, offsite durability, alarms, restore and costs. Do not use an arbitrary GPG key from the R1V fixture; those private keys have been destroyed.

**Stage B. Complete source/erasure census and snapshot protocol.** Resolve the source-vault, originals, attachments, voice, media, workbench, audit logs, pending/unclaimed imports, AIN bind, Commons, reader exports and offsite copies. Verify real PostgreSQL dump coverage plus WAL strategy. Define an operator-controlled quiescence barrier for **all** database/file writers (at least `maia-sovereign`, `maia-api`, media/comms/summary workers, staging and RLM). Freeze new editorial and consent mutations, prevent outside file writes, and prove all DB and file snapshots correspond to one generation. The R1V writer intentionally has **no code that pauses live services**; stopping or restarting services is separately authorized, with proper availability communications.

**Stage C. Production-specific code and one-time fictional canary.** Independently review the source hard-disabled production branch, receiver key custody, Linux `root`/container permissions, an exclusive cross-cron operational lock, exact Docker mount paths and NAS mount identity/ACLs. Decide whether ciphertext is staged to the NAS or a separately encrypted offsite target. Include both file archive and SQL, cryptographically signed generation completion after durable remote storage, retry without releasing partial points, and no archive pruning. Rehearse against production-shaped **fictional** services in a nonproduction Linux environment. A new, separately approved source change will be required to unlock `--live` after all these gates; this R1V commit cannot execute a real backup.

**Stage D. Independent real-scope restore.** Before any real-member Write/Apply, independently restore encrypted SQL and **every** required original/attachment/vault/media file plus consent/revision/erasure history, from **off-host ciphertext** and a separately held key, into a new isolated destination. Prove no cross-member leakage, playback/Undo integrity, erasure/nonresurrection after restore, and source and media foreign-key consistency. Reject points with missing or unsigned manifests, key loss, wrong recipient, incomplete WAL/attachments or concurrent edits. The R1V fixture's independent restore proves the mechanism, **not** real production readiness.

**Stage E. One controlled switch of TWO jobs.** After independent review and new writer success, the sole release operator selects a maintenance window **not overlapping current 02:00 UTC SQL jobs**. Recheck both installed script and root cron hashes. Under separately approved admin privileges, pause/disable **both** the root/NAS and user gzip jobs as a single controlled change, install the exact signed and reviewed ciphertext writer, configure just one schedule with alerting, then observe its first complete encrypted recovery point and a second independent restore. Preserve old NAS/local copies until retention/erasure authority separately determines their disposition. Do not run legacy root rsync `--delete` as a cleanup tool. Explicit rollback protects backup continuity while **never silently reopening private manuscripts to plaintext backups**. No instruction in this packet authorizes performing those steps now.

**Stage F. Release approval.** A five-person real-manuscript Writer beta remains HOLD until actual authenticated member-owned Review/Apply/Undo, provider-consent/attribution, conventional security, testable backups/restoration, strong erasure/retention and independent release custody are accepted. Advanced per-Work KMS remains an optional separately governed upgrade; it does not waive ordinary encryption or make an untested backup acceptable.

## Checklist (all operational actions remain unapproved)

- [x] Real server/volume/cron identities inspected **read-only**.
- [x] Candidate writer knows exact Minisforum DB and five writable file volumes.
- [x] Live execution hard-disabled; no production credentials or key inside source.
- [x] Fictional public-key encryption + independent cold restore after source deletion passed.
- [x] Failure injection, wrong-key, missing-volume and ciphertext-tamper refusals passed.
- [ ] Live Source/attachment/WAL scope coherent and complete.
- [ ] Real off-machine key custodian, signed manifest, durable offsite storage and recovery verified.
- [ ] External writer freeze and restore/nonresurrection proven on real-scope fiction.
- [ ] Two old cron writers changed together under **separate exact operator authorization**.
- [ ] New encrypted live recovery point and independent offsite restore qualified.
- [ ] Member-facing editing and release custody approved for real five-person beta.

**No production SQL/NAS/vault contents were accessed, no backup cron or Docker service was restarted, no AWS/KMS/model usage, no GitHub push, no real member invitation, and no deployment occurred.**
