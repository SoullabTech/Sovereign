# MAIA Host — Controlled Maintenance Window · Execution Plan

**Status: `EXECUTION PLAN / NOT AUTHORIZATION TO EXECUTE`**

This document records *how* the window runs if and when it is opened. It does not open it. Scheduling and authorization are a separate founder act.

**Authored**: 2026-08-12 · **Host**: `Kellys-Mac-Studio.local` — established as the production host for `soullab.life` (DNS `32.219.7.166` = host public IP; `life.soullab.upnp-forward` LaunchAgent present)

---

## Governing rule

> **Each recovered capability is proven before the next system is changed.**

Progression: **production → backup → edge → off-site durability.** Then the window ends.

The window restores a trustworthy floor under MAIA. **It is not the night everything gets fixed.**

---

## State at authoring

| Fact | Value |
|---|---|
| Production | **Healthy and serving.** `https://soullab.life` → HTTP 200; `http://` → 308 |
| Docker management API | **Wedged.** Desktop process alive, sockets present, API unresponsive. Containers unaffected |
| Last good backup | **Aug 10 03:00**, 6,124,539 bytes, `maia_backup_20260810_030005.sql.gz` |
| Backup gap | **~37 hours** — the Aug 11 03:00 run wedged and left a 0-byte artifact |
| Backup history | 38 files, daily, consistent size through Aug 10 |
| Off-site tiers | **Not running.** `/Volumes/LaCie` and `/Volumes/soullab-backups` not mounted; `backup-to-nas.sh` absent from canonical and all reachable history |
| Docker-free backup path | **Not available.** Host `127.0.0.1:5432` is Homebrew postgresql@17 (74d uptime), **not** the container. Local `pg_dump` is 14.19 against a pg16 container |

**Causality, preserved:** the backup did not wedge Docker. Docker's pre-existing failure wedged the backup. This distinction governs the separate scheduler-reliability audit.

---

## Sequence — this exact order

### 1. Controlled Docker Desktop restart
Acknowledge **temporary production interruption** explicitly before starting. `soullab.life` is served from this host; a restart takes it down. Confirm production recovers normally before proceeding.

### 2. Fresh production backup — *before* changing any backup machinery
Run the known-good `scripts/backup-database.sh`. Prove a fresh backup completes: exit status, non-zero file size, and structural validity where the format supports it.

**Do not modify backup machinery before the current database is provably protected.** The mechanism that worked through Aug 10 is the one to prove with.

### 3. Verify the live Caddy configuration
Compare the running container's `/etc/caddy/Caddyfile` against blob `b8c7b8706e2b3a55730fc26f1884b65934f9d714`. Close `LIVE_EDGE_UNRESOLVED` → `LIVE_EDGE_PASSES` or `LIVE_EDGE_BLOCKS`.

### 4. Repair or replace the off-site backup mechanism
Build from **current requirements**.

> The quarantined `backup-to-nas.sh` (`~/Desktop/maia_quarantine_20260214/scripts/`) is **evidence and input, not deployable code.** It carries useful ideas — three-tier destinations, phantom-empty cleanup, cron PATH and macOS sandbox fixes — and six months of untested assumptions. Do not restore it wholesale.

### 5. Prove an off-site backup end-to-end
To an **intended, identity-confirmed** mounted destination. Verify structural validity, not by inspecting records.

### 6. Handle the Aug 11 zero-byte artifact
`maia_backup_20260811_030005.sql`, 0 bytes. Act **only under an explicit cleanup policy**. Not opportunistically, not as tidying.

---

## Stop conditions

Halt the window and report if any occurs:

1. Production does not recover normally after the Docker restart.
2. Production database identity is uncertain — **two databases named `maia_consciousness` are known to exist**, one on the host-native postgresql@17 and one expected in the container. Backing up the wrong one produces a valid-looking, worthless artifact.
3. The fresh backup fails.
4. Live Caddy configuration differs materially from the expected blob.
5. Off-site destination identity or mount state is uncertain.
6. **Any step would require inspecting member data.** Exit status, file size, and structural validity only.
7. **Security remediation begins accidentally during maintenance.**

---

## Explicitly out of scope

**SECREM-001 implementation.** Authorized but paused; a separate subsequent act, gated on T3 as a hard falsification test. It must not be folded into this window.

Also out of scope: runtime continuity witness · corpus-callosum / elemental integrity audit · the four referred defect records (all `AUTHORED / UNASSIGNED`, local, unpushed) · the scheduler-duplication reliability audit (three LaunchAgents plus a cron fallback for one job).

---

## After the window

**SECREM-001 implementation with T3** → **runtime continuity witness** → **deeper MAIA rehabilitation**.

Nothing in this plan authorizes any of them.
