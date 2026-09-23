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
- `maia-backups/restore-reports/` — last written **2026-06-11**. The backups have
  not been restore-tested in three months. Finding, not an emergency.
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
5. **Backup restore test**: `restore-reports` stopped 2026-06-11 while the dumps
   kept landing. Find the job that wrote the reports and why it stopped.
6. **`maia-backup` account** is "Password pending". Determine whether the
   minisforum job authenticates as it (rsync/SMB) before touching it.
7. **Ollama model store** (75 GB on the T7, `/Volumes/T7 Shield/...`) has no NAS
   twin; `MAIA/Models` holds a different 63 GB set. Candidate second mirror.
8. **LaCie** (3.4 TB, mounted) — uninventoried. **Time Machine** target —
   undecided. `Knowkledge` typo — cosmetic, leave until a naming pass.

## 6. What this lane did not do

No deletion on the T7. No deletion or rename on the NAS. No change to the
minisforum backup job. No change to production. No DSM update. No scrub.
