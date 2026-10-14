# WS-BACKUP-OPS-01 — Class A backup-writer transition and rollback rehearsal

**2026-10-12 · Engineering candidate / SYNTHETIC ONLY / NO PRODUCTION AUTHORITY**

**Founder authority:** WS-BACKUP-ERASURE-01, issue #1791, ratifies **completed Delete Work = irrecoverable across ALL reconstructive backups and replicas**. It does **not** approve the format of a new backup, a retention period, old backup deletion, deployment, or live-vault capture.

**Workstream:** #1796 (live backup binding drift); #1793 (deletion-compatible backup architecture); #1785 (Synology ACL/history); #1788 (actual Source-vault recovery); distinct draft PRs #1794 (architecture fixtures), #1789 (default-off whole-vault backup), #1784 (Writer's Studio beta). The exact Writer's Studio beta image remains **9520d13691702400c41be8c4652994fbf8a8f30e**. This document does not change it.

## A. Genuine read-only source trace and currently installed bindings

Source physically read, without executing the backup writer, from the Minisforum:

| Actual path | SHA-256 observed October 12 | Custody/status |
|---|---|---|
| \`/usr/local/bin/maia-backup\` | \`5f09ddcff7d0c50c2cf92657bbdea2caaebdffa74d6390f378fda708343c340f\` | LIVE root-owned 0755, June 11 mtime; invoked by root \`/etc/cron.d/maia-backup\` at 02:00 |
| \`/home/soullab/maia-backup-hardened-20261011.sh\` | \`a43e6d0fd8ada224764f18bf661417d3a5836c6d9abeff6a81062ee04d2e002f\` | HELD separate 146-line candidate, soullab-owned 0700 |
| \`/home/soullab/install-maia-backup-hardened-20261011.sh\` | \`81da5d86c170fddd447c3d62ea13ebeba9c5534a6f4e7d39c4c123a27bb3d0f4\` | FOUR-LINE explicit **STOP R20** and \`exit 1\`; do **not** bypass |
| \`/home/soullab/MAIA-SOVEREIGN/scripts/backup-postgres.sh\` | SHA not pinned in this packet | LIVE independent user cron 02:00, local backup directory |

All three pinned live/held/installer scripts passed **nonexecuting** \`bash -n\` on Minisforum, but parser success is not runtime or safety certification.

### What the *installed* writer actually does

- Root cron runs at **02:00 daily**, with a separate user cron also running at **02:00**. These are **two independently scheduled PostgreSQL backup jobs**, not a single interchangeable job.
- Installed NAS writer emits full \`pg_dump | gzip\` to \`/mnt/ds225/maia-backups/postgres\`, not per-Work ciphertext. No Source vault, deleted-Work barrier, or certified cross-store consistency.
- It mirrors a separate **media** directory with \`rsync -a --delete\`; under some circumstances this can permanently remove destination media backup bytes. **Do not infer this is the manuscript Source vault**.
- Daily \`maia_*.sql.gz\` older than 14 days, weekly copies older than 56 days, monthly copies older than 365 days are passed to \`find -delete\`. This is **not** proof of complete erasure from Synology's Recycle Bin, older copies, or key escrow.
- Locally, the user cron writes \`pg_dump | gzip\` to an ext4 filesystem and prunes older than 30 days. Its 32 observed compressed SQL files are each mode 0600; local directory mode 0775. Block-device path did not establish full encryption at rest.
- NAS observed 26 active \`.sql.gz\` files (~8.76 GB) with SMB client-projected permissions \`0755\`; Synology DSM UI guest/user groups had No Access on the share, but effective end-to-end access tests are still due.
- DSM Recycle Bin contains **30.37 GB / 120 files** under a recycled \`maia-backups\` tree and **6,029 bytes / 5 files** under recycled encrypted-release-backups. Their manuscript contents, if any, were not opened. \`soullab-backups\` shared-folder encryption was unchecked in DSM. Synology Snapshot Replication listed no snapshots for that share. Volume-level and other offsite encryption remain unverified.
- An unrelated offsite GPG script exists, but no direct invocation was found in inspected crontabs/systemd metadata. This does not prove no historical offsite copies.
- The preparation-only **hardened candidate** adds preflight, staged gzip checks, timestamp collision refusal, manifest, process lock and media \`rsync\` **without** \`--delete\`, and disables SQL retention pruning. **This is not deletion-safe**, because media and historic SQL may remain forever after member erasure; the separate STOP R20 installer correctly refuses installation.

**Important:** Differences between the installed writer and the held candidate are architectural, not a simple routine code update. Neither is a demonstrated WS-DELETE-01-compliant replacement. The current service must not be casually stopped or replaced.

## B. Proposed transition — gates required before any real change

This is the *future* decision sequence, not an executable operations command.

1. **Exact identity and independent review:** Pin the live root writer SHA, held installer STOP behavior, cron identity, media namespace, and candidate SHA. An independent human reviewer reads the actual code and records a trace/verdict; a requested \`@Soullab\` review is not itself approval.
2. **Recoverability first:** Verify a last-good, recent **database and manuscript Source** restore into disposable isolation, with Source/DB reference consistency, recovery key custody, and no unrecoverable gaps. The new GPG key's successful MacBook synthetic test does **not** certify old-key SQL, Source or live backup restoration.
3. **Historical-copy inventory:** Include 32 local + 26 active NAS SQL archives, weekly/monthly copies, 30.37 GB Recycle Bin tree, unknown snapshots/offsite copies, and retained individual keys. Address actual \`find -delete\` semantics and avoid silently pruning evidence. Await separate Class A disposition.
4. **Design fully admitted:** An exact replacement must protect all reconstructive SQL + Source bytes before any backup/replica/WAL/temp write or account for unavoidable historical plaintext; supply per-Work revocation or equivalent, a nonrollback erasure ledger, and **atomic restore-publication fence**. Explicit WS-DELETE-02 and retention decisions required. A master GPG wrapper around complete SQL and TAR is not adequate.
5. **Preserve backup creation:** Separately attest both root and user jobs, establish writer interaction/collision policy, restore verified backup job after any failed staging, and forbid disabling routine backup creation without compensating authorized coverage.
6. **Fixture replay before live installation:** Create disposable fake archives, manifests, Source hashes and backup-job descriptors. Inject NAS outage, SQL errors, disk exhaustion, duplicate backup IDs, partial archive publication, media sync failure, retention conflict, missing approval, stale pinned SHA, stale deletion barrier, and rollback failure. All data stays synthetic and no production script is invoked.
7. **Governed cutover gate:** Only after independent reviewer approval, exact source and script custody checks, and a separate authorized change window may an operator stage a reviewed candidate. Capture exact rollback image, verify its recoverability, atomically switch binding and run one constrained live backup/restore acceptance sequence. None of that is approved here.
8. **Roll back safely:** If any monitored post-stage requirement fails, independently authorize return to the pinned prior writer while preserving all archived data, logging a nonreconstructive failure receipt. Never roll back the immutable erasure ledger or resurrect a deleted Work. Do not delete temporary *real* files merely to make audit results look clean.
9. **Promotion:** Only after observed production restore and deletion safeguards plus Jondi's real-device tests and PR #1784's independent migration acceptance may beta cutover be separately considered.

### Stop behavior before/after each failure

| Failure prefix | Required operator outcome |
|---|---|
| Live or staged candidate SHA differs from reviewed identity | **STOP**, no executable swap |
| Existing backup continuity or restore unavailable | **STOP**; retain previous functioning writer and archives |
| Missing Class A, historic SQL disposition, NAS ACL, Source restore, or deletion-barrier approval | **STOP**; no destructive/pruning or source backup |
| NAS disconnected, insufficient space, PostgreSQL unavailable | **STOP** before swap, no published incomplete recovery point |
| Candidate fixture writes incomplete gzip/TAR or misses SQL/Source match | Reject candidate, preserve previous verified recovery point |
| Crash before archive/manifest complete | Do not publish a complete backup receipt |
| Candidate canary or media stage fails after fixture swap | Restore *synthetic* old pointer; no archive deletion; failure recorded |
| Old archive exists with same ID | Never overwrite (no-clobber) |
| Old key, old SQL plaintext or deleted Work appears recoverable | Refuse erasure certification and release |
| NAS replica/authority not reachable during member Delete Work | Expose **pending/owed**, never “deleted” |
| Abort or rollback attempts to restore prior deletion authority | **REFUSE** rollback of member-erasure barriers |

## C. Executed in-memory synthetic fixture

Path: \`scripts/ops/test-ws-backup-transition-fixture.mjs\`, using only Node.js builtin \`node:test\` and \`node:crypto\`.

**Fixture properties:** no filesystem, shell, network, service, Docker, private key, or NAS access. All archives are fictional strings and hashes in memory; “swap” only changes a JS object field. Production mode is **unconditionally refused**. A fully approved **hypothetical future writer**, distinct from both currently installed/live and held candidate, is used *only* to demonstrate the intended transition state machine. Test receipt flags are simulated booleans and **not real authorization**.

**Executed on Mac Studio from exact source fetched back from GitHub:** **28/28 PASS, 0 failures**.

Categories: live/held/STOP-pinned identity; refusal of live and held candidate under strict erasure; independent reviewer and historical custody gates; candidate SHA/live drift; competing jobs; in-fixture last-good and canary success; archive immutability; failure before stage, during streaming, during media, before manifest, NAS/db/space/erasure-authority unavailable; rollback after simulated swap; duplicate archive no-clobber; production-mode refusal; synthetic-only and no temp residue.

**Interpretation:** This is *engineering model coverage of desired invariants*, **not** a test of the real bash backup scripts against fixtures, not a real encrypted SQL+Source design, not a live-source restore, and not independent Class A approval. As built, the held candidate remains **REJECTED**, even if all fixture gates are set to true. A later separate lane must demonstrate the exact reviewed shell implementation in an isolated disposable filesystem and with a protected sample database before any production action.

## D. Required independent reviewer disposition

Reviewer must produce an authentic source-read trace of:
- \`/usr/local/bin/maia-backup\` SHA \`5f09ddc...\`
- \`/home/soullab/maia-backup-hardened-20261011.sh\` SHA \`a43e6d0...\`
- Explicit \`STOP R20\` installer SHA \`81da5d8...\`
- 02:00 root + user cron, their separate sinks, and offsite-script status
- Current Source custody + SQL reconstructed fields and deletion queue
- #1791 governing invariant, historic plaintext/recycled content, WS-DELETE-02 status
- The 28-case synthetic witness assumptions and the 19-case prior Class A audit (#1794).

**No merged PR, production script install, cron reschedule, NAS/Recycle Bin archive pruning, global key switch, schema migration, member source-capture or beta deployment is permitted on this packet alone.**

**Kelly's World / JARVIS future human-readable surface (not installed):**
- Today: “Live backup identity drift — independent Class A acceptance needed”
- Work: “Synthetic transition rehearsal 28/28; exact shell rehearsal and restore still owed”
- Graph: #1791 → #1793/#1794 → #1796 → #1788/#1785 → #1784
- Monitor: root/user backup availability, NAS archive + recycled copy inventory, erasure authority, offsite uncertainty
- System: pinned writer hashes, STOP R20 installer, new-vs-old GPG keys, rollback and trust boundaries.
