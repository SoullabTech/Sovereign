# Continuity & Disaster-Recovery Runbook

Living document. Status as of **2026-06-11**. Update each rung as it is proven.

## Model: two independent tracks

Disaster recovery requires **both**:

- **Fidelity track** — *"If I possess the backup artifact, can I reconstruct the system faithfully?"*
- **Survival track** — *"Will the artifact still exist after the production host is lost?"*

A faithful backup that lives only on the production host shares the failure domain of the system it protects. **Fidelity without survival is not disaster recovery.** Keep the two assessments separate; do not let a strong Fidelity result imply Survival.

## Current proven state (2026-06-11)

| Capability | Status | Evidence |
|---|---|---|
| Backup generation | ✅ proven | `database/backups/maia_backup_20260611_220118.sql.gz` (277 MB gz, 38.5 s, `rc=0`, 531 tables) |
| Scheduled automation | ✅ live | additive user crontab `0 2 * * *` on minisforum → `database/backups/backup.log` (installer hardened in **PR #433**) |
| Backup fidelity | ✅ substantially | restore dry-run: 0 errors, 531 tables, **8/8** baseline counts exact — `database/backups/restore_dryrun_report_20260611.txt` |
| Restore procedure (same-host) | ✅ proven | see dry-run report |
| **Off-host survival** | ❌ not started | DS225 not wired; backups are local-only single-disk |
| **Fresh-host recovery** | ❌ not proven | gated on off-host |
| **App usability after recovery** | ❌ not proven | not exercised |

Parity baseline for all comparisons: `database/backups/baseline_20260611_2157Z.txt`.

## Off-host wiring plan (Survival track — DS225)

Operator prerequisites (the current blocker): **SMB share enabled on DS225 + share path + credentials.**

1. Mount the share on minisforum (CIFS), persisted via `/etc/fstab` with a `chmod 600` credentials file:
   `mount -t cifs //<DS225_HOST>/<SHARE> <MOUNT_POINT> -o credentials=<credfile>,uid=soullab,iocharset=utf8`
2. Extend the backup job to copy + verify **after** a successful dump:
   - `rsync` the newest `maia_backup_*.sql.gz` to `<MOUNT_POINT>/maia/`
   - compute `sha256sum` on both sides; a mismatch logs `FAILED`.
   - apply independent retention on the off-host copy.
   - Guard behind a presence check on `<MOUNT_POINT>` so a missing mount **degrades gracefully** (local backup still succeeds) rather than failing the whole job.
3. Treat the **off-host** copy as the recovery source of truth.

This is a follow-up to PR #433 (do not bundle; different risk surface).

## Acceptance tests for the remaining rungs (explicit, measurable)

### T1 — Off-host survival
- After a scheduled run, `<MOUNT_POINT>/maia/maia_backup_<latest>.sql.gz` exists and its `sha256sum` matches the local copy.
- Fetch that artifact to a host that is **not** minisforum; it arrives intact (sha256 matches).
- **PASS** = an intact copy of today's backup is retrievable without touching minisforum.

### T2 — Fresh-host recovery
- On an **isolated** postgres (clean container/host with no access to the original DB), restore from the **DS225** copy:
  `createdb maia_restore && zcat <artifact> | psql -d maia_restore`
- **PASS** = `rc=0`, 0 `ERROR` lines, **531** tables, all 8 baseline counts match, **and** a full all-table row-count diff vs a recorded source snapshot shows zero deltas (the exhaustive completeness measurement the local dry-run did *not* perform).

### T3 — Application usability
- Point a MAIA app instance at the restored DB and bring it up.
- **PASS** = app boots; `/api/health` green; a designated **continuity test account** signs in; a session loads with its memory/atoms; practitioner-facing continuity (clients, scribe sessions) renders correctly.

## Targets to measure (currently unmeasured)
- **RPO** — with the daily 02:00 job, worst-case data loss ≈ 24 h. Tighten only if warranted.
- **RTO** — dry-run data-load was ~21 s for a 932 MB DB; full RTO = provision host + fetch from DS225 + restore + boot app. Measure end-to-end during T2 + T3.

## The first dated continuity-recovery baseline
Achieved when **T1 + T2 + T3 all pass** and the result is recorded with: artifact id, sha256, source vs restored counts (incl. the full all-table diff), the T3 usability checklist, and the measured end-to-end RTO. *That record* — not "a backup exists" — is the milestone.

## Operational note (evidence over assumption)
Two incidents this work reinforce one rule: **verify the actual path/state before concluding a component failed.**
- `GIT_COMMIT=unknown` looked like missing provenance wiring; it was a deploy path bypassing wiring that already existed (PR #431).
- A `docker exec -i` stdin-theft in the *test harness* made a faithful backup look unrecoverable; checking observable state (scratch DB absent, no log) corrected the false negative.
Both: a default/`unknown`/`failed` result is a pointer to *which call path produced it*, not a conclusion about the component.
