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
2. **`maia_20260918_020002.sql.gz` is 72 MB** against 320–334 MB for every
   neighbour. `set -o pipefail` is on, so a failed `pg_dump` would exit non-zero,
   but `gzip` had already written whatever arrived. Most likely `pg_dump` was cut
   off at 02:00 UTC on 18 Sep (22:00 local, 17 Sep). Retention deletes it in days;
   the question of what interrupted it does not expire. Check `/var/log/maia-backup.log`
   for that run and `gzip -t` the file.
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
6a. **Consolidate the dump jobs** (§3a-3/4): one job, one destination, one health
   check reading it. The NAS job is the keeper; the local user-cron job and the
   `~/maia-backups` path in `health-check.sh` are the debris.
7. **Ollama model store** (75 GB on the T7, `/Volumes/T7 Shield/...`) has no NAS
   twin; `MAIA/Models` holds a different 63 GB set. Candidate second mirror.
8. **LaCie** (3.4 TB, mounted) — uninventoried. **Time Machine** target —
   undecided. `Knowkledge` typo — cosmetic, leave until a naming pass.

## 6. What this lane did not do

No deletion on the T7. No deletion or rename on the NAS. No change to the
minisforum backup job. No change to production. No DSM update. No scrub.
