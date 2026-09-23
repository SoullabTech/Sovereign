# NAS Recovery and First Mirror — 2026-09-23

Lane: workstation storage relief, NAS leg. Companion to
`docs/ops/WORKSTATION_STORAGE_RELIEF_2026-09-22.md`. Founder-run on the Mac Studio
with Claude directing; every number below was read from DSM or from a Studio
terminal during the act, not inferred.

Standing at close: **NAS reachable and Healthy · two mirrors count-verified ·
nightly database backup job found alive · nothing deleted on the T7 or the NAS.**

## 1. What the NAS is

| Fact | Value |
|---|---|
| Model | Synology DS225+ (2-bay), DSM 7 |
| Server name | `SOULLABMAIA` |
| Address | `192.168.0.103` on LAN 1, **DHCP** (no reservation yet) |
| Drives | 2 × Seagate IronWolf Pro 16 TB (`ST16000NT001`), reported 14.6 TB each |
| Pool | Storage Pool 1, **SHR, 1-drive fault tolerance**, 14.5 TB |
| Volume | Volume 1 `MAIA_STORAGE`, 108.3 GB used, 13.9 TB free |
| Shares | `homes`, `MAIA`, `soullab-backups` |
| SMB | enabled, workgroup `WORKGROUP`, WS-Discovery on |
| Accounts | `admin` Deactivated · `guest` Deactivated · `maia-backup` "Password pending" (description `backup`) · `SOULLABAIN` Normal |
| Last data scrub | 2026-06-11 18:33 |

Minisforum (production) is `192.168.0.104`, confirmed in-session. The NAS is a
storage tier; it is not a build worker and production does not depend on it.

## 2. Recovery sequence, as it happened

1. NAS answered on 445/5000/5001 but the remembered credentials were refused, and
   Keychain held only a prior Guest entry. Guest is deactivated on the NAS.
2. **Mode-1 reset** (pinhole held ≈4 s to one beep). Clears the admin password and
   network settings only; data untouched. Mode 2 (a second hold, three beeps)
   reinstalls DSM and was explicitly not performed.
3. Before the reset, drive tray 2 was found partly unseated and pushed home. DSM
   therefore booted with a pool that had lost and regained a member.
4. Post-boot: STATUS LED orange, continuous beep. DSM: **Volume 1: Degraded**,
   "Insufficient number of drives: 1", drive 1 Healthy and carrying the volume,
   drive 2 outside the pool.
5. Storage Manager → Storage Pool 1 → Repair → Drive 2 (`ST16000NT001`, 14.6 TB)
   → **Fast Repair**. Completed in minutes because only 108 GB was in use.
   Pool and volume now **Healthy**, both drives Healthy.
6. Adaptive MFA re-armed itself on first login (recovery email on file). `admin`
   remains Deactivated, which is DSM's recommended posture; `SOULLABAIN` is the
   working account. New passwords live in the password manager, never in chat.

Informational only: DSM notes the drives are not on Synology's compatibility list.

## 3. What was already on the NAS

**`soullab-backups`** — the one integration that was actually working:

- `maia-backups/postgres/` — nightly `maia_YYYYMMDD_020001.sql.gz` (≈349 MB each,
  filename in UTC, lands 22:00 local) plus `weekly_YYYYMMDD.sql.gz`; latest
  `maia_20260923_020001.sql.gz` at 2026-09-22 22:00. **The minisforum backup job
  is live.**
- `maia-backups/manifests/` — one manifest per run, same cadence.
- `maia-backups/media/` — last written 2026-07-08.
- `maia-backups/restore-reports/` — **empty**, directory dated 2026-06-11. An
  earlier draft of this record read that date as "restore tests stopped in June";
  §3a corrects it: **no restore test has ever run.** Finding, not an emergency.
- `maia_backup_20260214_214015.sql.gz` — a single 238 MB dump from February.
- 7.8 GB total.

**`MAIA`** — scaffolding created 2026-02-09, partly filled:

| Folder | Content | Size |
|---|---|---|
| `Archives/` | `claude_BACKUP_20260121` | 4.9 GB |
| `Backups/` | `pg-backups`, `PostgreSQL` (older dumps, predate the nightly job) | 2.3 GB |
| `Dev_Assets/` | `demo-sites` | 4.6 GB |
| `Models/` | `models`, `personaplex-mlx` — **not** the T7 Ollama store | 63 GB |
| `Clients/`, `Knowkledge/` (sic), `Media/` | empty | — |

Nothing in either share was modified, moved or deleted by this lane.

### 3a. The backup job, recovered from the minisforum (read-only, 2026-09-23)

Found by `crontab -l`, `ls /etc/cron.d`, `mount`, `cat /etc/fstab` and `cat` of
the script over SSH. Nothing on the minisforum was changed.

| Fact | Value |
|---|---|
| Mount | `//192.168.0.103/soullab-backups` → `/mnt/ds225`, CIFS 3.0, `fstab` with `_netdev,x-systemd.automount`, credentials file `/etc/cifs-credentials-ds225`, **NAS user `maia-backup`** |
| Scheduler | `/etc/cron.d/maia-backup` (root): `0 2 * * * root /usr/local/bin/maia-backup` (02:00 UTC) |
| Script | `/usr/local/bin/maia-backup` — copied verbatim to `scripts/ops/minisforum-maia-backup.sh` |
| What it does | `pg_dump maia_consciousness \| gzip` → `postgres/maia_<ts>.sql.gz`; `rsync -a --delete` of the `/app/data/media` volume → `media/`; manifest per run; aborts if unmounted or < 10 GB free |
| Retention | 14 daily · 8 weekly (Sunday copy) · 12 monthly (1st) |
| Last run | 2026-09-23 02:00:45 UTC, 334 MB dump, media 316 MB, manifest written |
| Write test after the NAS reset | `WRITE_OK` |

**Findings (none repaired here):**

1. **No restore test has ever run.** `restore-reports/` is empty; the directory
   was created with the tree on 2026-06-11. The script contains no restore step.
   Repo has `scripts/restore-db.sh` and `scripts/restore-governed.sh`; neither is
   scheduled. Until one runs against a disposable database, the nightly dump is a
   file, not a backup.
2. **`maia_20260918_020002.sql.gz` is 72 MB and `gzip -t` reports
   `unexpected end of file`** — yet `/var/log/maia-backup.log` for that run reads
   `PostgreSQL backup complete: … (333M)` and the run finished normally with a
   manifest. **The dump was complete when the script measured it and was
   truncated afterwards, silently.** The same run's manifest, written at
   02:01:04, already lists the file at **72M**, so the loss is localized to the
   NAS write path in the eight seconds between the cached measurement and the
   manifest — not to PostgreSQL, whose output the local twin proves complete.
   **Standing: CONFIRMED SILENT NAS-PATH TRUNCATION · EXACT TRANSPORT/STORAGE
   CAUSE NOT YET ATTRIBUTED.** Candidate mechanism, ⛔ not proven: the mount is
   `cifs … soft,retrans=1,cache=strict`; writes return success into the page
   cache, `du -sh` measured that cache, and the flush on close/writeback is
   where a `soft` mount fails instead of retrying, while bash never checks the
   close of a `>` redirection. Without a kernel/CIFS error line or a NAS-side
   event log this cannot be distinguished from an SMB disconnect/reconnect or a
   NAS storage event (the tray slip is undated). ⭐ What is established
   regardless of cause: *the script's success line, the manifest's `Size:`,
   and any weekly/monthly `cp` of that file all vouch for bytes that never
   reached the disk.* An earlier draft guessed an interrupted `pg_dump`; the
   log rules that out. Commit `a220965c` worded the CIFS mechanism as fact;
   superseded by this paragraph, not deleted from history.
   ⛔ **FORENSIC HOLD: the 18 Sep NAS file (75,497,472 B, SHA-256
   `4ba0b752…c88d1`) is not to be repaired, overwritten, renamed or deleted
   until R1 closes.** Retention would delete it on ~2 Oct; R1 closes first or
   the file is copied aside with its hash before then.
   **R1 must integrity-sweep every retained dump** (`gzip -t` + last line
   `PostgreSQL database dump complete`) because the failure class is silent.
   **Exact evidence (read 2026-09-23):** NAS file size **75,497,472 B = 72 × 1 MiB**,
   the mount's `bsize` — writeback stopped on a block boundary; mtime
   02:00:57.9, one second after the script logged `(333M)` from the page cache.
   The local duplicate job's dump from the same minute
   (`database/backups/maia_backup_20260918_020002.sql.gz`) is 348,249,742 B and
   `gzip -t` clean — **the day was saved by the job item 3 calls debris.**
   **Sweep result:** every retained dump on the NAS is gzip-intact except the
   18th. ⚠️ The sweep's first version reported `tail=INCOMPLETE` for **all**
   files — the instrument's defect (`tail -1` returned pg_dump's trailing blank
   line), not the backups'; corrected to `tail -3 | grep`. Recorded because an
   instrument that fails on the healthy case is the C21 class again.
3. **Two dump jobs fire at the same minute.** The user crontab also runs the
   repo's `scripts/backup-postgres.sh` at `0 2 * * *` into
   `~/MAIA-SOVEREIGN/database/backups/` on the minisforum's **own disk**
   (30-day retention, ~330 MB/night ≈ 10 GB standing). Two concurrent
   `pg_dump`s of one database, one of them growing production's disk.
4. **`scripts/health-check.sh` watches a third path**, `~/maia-backups`, which
   does not exist on the minisforum, so `LAST_BACKUP=none` is reported forever
   regardless of either job's health.
5. **`maia-backup` shows "Password pending" in DSM.** The CIFS session survived
   the reset (write test OK), but the next reconnect (NAS reboot, DSM update,
   network blip) re-authenticates as this user. If DSM requires a password change,
   the mount fails and the script exits at its mount check with nothing but a log
   line on the minisforum. ⛔ **Do not install the pending DSM update until this
   account's state is confirmed.** The 02:00 UTC run on 2026-09-24 is the first
   scheduled test after the reset.

## 4. Mirrors written (copy-only, T7 retained as the working copy)

Method: `rsync -rltv --exclude '.DS_Store' --exclude '._*'` from the T7 to the
SMB mount (`-rlt` rather than `-a` because SMB cannot take ownership bits), then
an independent file-count and byte-sum on both sides with the same exclusions.

| Source (T7) | Destination (NAS `MAIA`) | Files | Bytes | Result |
|---|---|---|---|---|
| `worktree-bundles/` | `Dev_Assets/worktree-bundles/` | 18 / 18 | 5,119,721 / 5,119,721 | **VERIFIED** |
| `archive-2026-09-23/` (Messages + Voice Memos) | `Archives/mac-studio-2026-09-23/` | 35,883 / 35,883 | 69,694,771,113 / 69,694,771,113 | **VERIFIED** |

35,883 = the 35,236 Messages files + 647 Voice Memos files counted on the T7 when
that archive was made, so the chain Studio → T7 → NAS is closed by count.

Two incidents during the archive copy, both harmless and recorded because they
are the kind of thing that later reads as a mystery:

- The Studio restarted mid-copy. rsync resumed idempotently; the completing run
  reported `sent 798,745,079 bytes · total size 69,694,771,178 · speedup 87.25`,
  i.e. the pre-restart run had already landed almost everything.
- A second rsync was started in another window by mistake and died with
  `io_read_flush / rsync_sender`. One verification pass taken while its temp file
  still existed read `35,884 / 69,694,771,178`; the next clean pass read the exact
  match above. Only the clean pass is the evidence of record.

### 3b. NAS-BACKUP-01 / R1 — witness 1: retained-dump integrity sweep (2026-09-23)

Founder-run on the Studio against the SMB mount, read-only. Per file:
`gzip -cd` exit status (integrity) and presence of pg_dump's closing marker
`PostgreSQL database dump complete` in the last 8 lines (completeness).

| Population | Result |
|---|---|
| 16 daily `maia_*` | **15 intact + complete · 1 truncated + incomplete (`maia_20260918_020002`, 75,497,472 B)** |
| 2 monthly | intact + complete |
| 7 weekly (`weekly_20260920` = 348,913,338 B, byte-identical to `maia_20260920`) | intact + complete |

The truncation did not propagate: the 18th was a Friday, so no weekly or monthly
`cp` was taken from it. Sizes grow monotonically 335 → 349 MB across the
fortnight except the 18th, consistent with one isolated write failure.

⚠️ Two instrument defects surfaced before this table was obtained, both in the
sweep and neither in the backups: `tail -1` matched pg_dump's trailing blank
line, and on macOS `zcat` reads only `.Z` files and silently produced nothing on
`.gz`. Each made every healthy file read INCOMPLETE. The version above
(`gzip -cd … | tail -n 8`, `PIPESTATUS`) is the instrument of record.

### 3c. NAS-BACKUP-01 / R1 — witness 2: restore into a disposable (2026-09-23)

Founder-run on the Studio, `scripts/ops/nas-restore-witness.sh`, report
`logs/restore-witness-20260923T141322Z.txt` (Studio-local). The restore went
through `scripts/restore-governed.sh` (R20 governed lane, `RESTORE_DB_URL`
against the disposable), ⛔ not a raw `psql`.

| | |
|---|---|
| Dump | `maia_20260923_020001.sql.gz`, 349,343,168 B, SHA-256 `32cb5bc6…ce5fed` (NAS and local copy identical) |
| Target | `pgvector/pgvector:pg16`, fresh container, **no published ports**, destroyed on exit |
| Restore | exit 0, **29 s**; R20 sweep: 0 rows refused resurrection |
| Extensions | `pgcrypto`, `plpgsql`, `vector` |
| Public tables | 668 |
| Row counts (counts only) | `members` 94 · `maia_turns` 175,035 · `developmental_memories` 2,235 · `schema_migrations` 548 |
| Verdict | **PASS** |

First restore test in the life of this backup job. Standing after R1:
**witness 1 PASS (24/25 intact; the 18th is the known truncation) · witness 2
PASS (latest dump restores and looks like MAIA's schema)**. ⛔ R1 changed
nothing: no script, cron, retention, mount option, credential, DSM setting or
duplicate-job decision. Those are R2's questions, each its own act. ⚠️ The
disposable engine hang before this run was the Studio's Docker Desktop socket
left stale by the reboot (`~/.docker/run/docker.sock` dated 18 Sep); fixed by
killing the backend, removing the socket and relaunching — unrelated to the
NAS or the dump.

**Note on R2 (not opened):** the two silent-failure classes R1 established —
a write that reports success before it reaches the disk, and a manifest that
copies that report — are both closed by the same shape: write to a temp name,
`fsync`, re-read from the NAS (`gzip -t` + closing marker + size), then rename
into place, and record the *verified* size. That is the repair to propose,
against the verbatim copy in `scripts/ops/minisforum-maia-backup.sh`, ⛔ after
a founder act.

## 5. Open items (none authorized here; each needs its own act)

1. **DHCP reservation** on the router for the NAS at `.103` and the minisforum at
   `.104`. The NAS is on DHCP after the reset; the mount path and the production
   port-forward both depend on addresses that nothing currently pins.
2. **Auto-mount on the Studio**: Finder → Connect to Server favourites for
   `smb://192.168.0.103/MAIA` and `/soullab-backups`; System Settings → Login Items
   for both volumes. Not done yet.
3. **DSM update** pending (badge on Update & Restore). Deferred during the repair
   and the mirror; it reboots the NAS.
4. **Data scrubbing**: schedule monthly (Storage Manager → Schedule Data
   Scrubbing). Not run now — it reads every block on both disks.
5. **Backup restore test**: never run (§3a-1). Schedule `scripts/restore-db.sh`
   or `restore-governed.sh` against a disposable database and write the report.
6. **`maia-backup` account** is "Password pending" and IS the minisforum's CIFS
   identity (§3a-5). Confirm its DSM state; if a change is forced, change it and
   `/etc/cifs-credentials-ds225` in one act, then `mount -o remount /mnt/ds225`.
6a. **Reconcile the dump jobs** (§3a-3/4). Earlier wording called the local
   user-cron job debris; §3a-2 shows it is the only copy of 18 Sep. The question
   is now whether it becomes a deliberately staggered second tier (different
   minute, different medium, its own integrity check) or is retired once the
   NAS job verifies its own writes. `health-check.sh`'s `~/maia-backups` path is
   still wrong either way.
7. **Ollama model store** (75 GB on the T7, `/Volumes/T7 Shield/...`) has no NAS
   twin; `MAIA/Models` holds a different 63 GB set. Candidate second mirror.
8. **LaCie** (3.4 TB, mounted) — uninventoried. **Time Machine** target —
   undecided. `Knowkledge` typo — cosmetic, leave until a naming pass.

## 6. What this lane did not do

No deletion on the T7. No deletion or rename on the NAS. No change to the
minisforum backup job. No change to production. No DSM update. No scrub.
