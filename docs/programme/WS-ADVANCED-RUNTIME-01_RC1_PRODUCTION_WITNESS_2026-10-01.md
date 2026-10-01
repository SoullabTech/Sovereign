# WS-ADVANCED-RUNTIME-01 / RC1 — Production Witness

**Date:** 2026-10-01 · **Status:** RC1 LIVE · migrations APPLIED · ⛔ cohort walk not yet done
**Target:** `03f0fd3abce16fcc1132481836b2e6ff8d364cd7` · **Old reader:** `975a208b8`
**Act:** founder-run from the Mac Studio, `scripts/deploy-production.sh deploy 03f0fd3ab…` with the admitted custody evidence (`docs/programme/evidence/WS-ADVANCED-RUNTIME-01-RC1-REVIEW/`).

## Witnessed (transcript, run 1, swap ~14:35Z)

- Immutable snapshot of `03f0fd3ab`. The built image provenance is verified as `GIT_COMMIT=03f0fd3ab`.
- `MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`: 3 pending, all witnessed, 3 prefixes attested.
- `Old reader re-witnessed immediately before migration: 975a208b8…`
- Migrations ran **before** the candidate swap: `20260925000005` → `20260925000006` → `20260926000004`, then `Applied 3 new migrations`. Migration 2's pre-succession refusal did not fire.
- Rollback tags refreshed (`:previous` = old reader, `:current` = `:03f0fd3ab`).
- Running provenance: `printenv == Config.Env == asserted 03f0fd3ab`.
- Smoke: health · version · ready · main page · both build-route locks · constitutional verification (Co-Lab + Memory + Relationships + Development + MAIA) all **PASS**.

## Run 2 (~14:48Z, same SHA)

The deploy was re-run against the identical SHA. `REVIEW-CUSTODY: no production-pending migrations`, `No pending migrations`, provenance re-verified, smoke all PASS. It was idempotent, with no schema movement.

## Observations (⛔ not repaired here)

1. **`maia-postgres` was recreated in run 1, not crashed.** Founder read: `started=2026-10-01T14:34:47Z restarts=0 oom=false`. The ledger survived intact (565 rows → 568). The recreate happened at the first `docker compose … run migrate` (pending-set read), which brings up `depends_on: postgres`.
   - Compose recreates a running service only when its computed config hash differs from the container's label. `docker-compose.production.yml` is byte-identical between `975a208b8` and `03f0fd3ab`. `deploy_ctx_compose` pins `-p maia-sovereign`, `--project-directory ~/MAIA-SOVEREIGN` and `--env-file .env.production`, so bind paths and interpolation are stable. Run 2 (same path, ~13 min later) did **not** recreate it.
   - **Inference (⚠️ not established):** the pre-14:34 container was created by an invocation outside `deploy_ctx_compose` that interpolated differently. The leading candidate is a compose call without `--env-file .env.production`, which would bind `${POSTGRES_BIND:-127.0.0.1}` to localhost instead of `100.119.226.84`. If so, the Hetzner standby could not have been streaming before 14:34.
   - ⛔ **Founder read after the deploy: `pg_stat_replication` → 0 rows.** No standby is streaming **now**, even though Postgres is bound to `100.119.226.84` again. A configured, live standby would have reconnected within seconds of 14:34Z. So the standby is down, unreachable, refused (auth or `pg_hba`), or stuck on WAL that has already been removed. **Disaster recovery is currently not established.** This outranks every other open item.
   - **Founder probe, ~15:15Z, settles it: the cause is the standby host, ⛔ not the recreate.** Tailscale reports `ubuntu-8gb-fsn1-2` (`100.118.111.37`) as **offline, last seen 7d ago**, which is before the 14:34Z recreate. The primary side is correct: `wal_level=replica` · `max_wal_senders=10` · `listen_addresses=*` · `pg_hba` line 129 allows `replicator` from `100.118.111.37` (md5) · bound to `100.119.226.84:5432`. There are **no replication slots**, so there is no WAL-retention disk risk, and with `wal_keep_size=64MB` the standby needs a **fresh base backup** when it returns. The localhost-bind hypothesis is moot for this outage.
   - **Backups:** cron runs `scripts/backup-postgres.sh` nightly at 02:00. Files are present daily from 09-24 to 10-01, each ~350 MB gz, with consistent sizes. ⚠️ They sit on the **same disk** as the primary. An off-host copy of the 10-01 dump now exists on the Mac Studio: `gunzip -t` passed, and the file ends with pg_dump's closing `\unrestrict` line, so the dump is complete. A fresh `-Fc` dump was also taken. The Mac's `pg_restore` is too old to read it (`unsupported version (1.15)`); that is a client-version limit, ⛔ not evidence of corruption.
   - Check: the standby's own logs for its last successful connection before 14:34Z, and `docker events --filter container=maia-postgres` on minisforum if its buffer still reaches back.
2. **F2/S3-O1 runner shape observed live.** Each file's own `BEGIN/COMMIT` nests inside the runner's transaction (`already a transaction in progress` / `no transaction in progress`). This matches the reviewer's F2 and S3-O1 observation (3). It was harmless this run.
3. **Ledger vs files:** `568 already applied, 516 total`. This is the known bookkeeping gap.
4. **Post-deploy branch movement.** ⚠️ `feature/ws-advanced-runtime-rc1-20261001` advanced to `928b183f4` after the review. That includes `5e0ec61f`, which **edits the bytes of `20260925000005`**, a migration that is now applied in production, and also edits the review plan. The runner skips by filename, so that `lock_timeout` change can never execute in production. The repository would then carry a migration file that differs from what ran. That commit is a provenance-drift hazard, so it must not be merged as-is. Lock posture belongs in a new migration or in the runner. **Disposed:** founder ruled *drop the edit*. Reverted on the RC1 branch as `18dd59c4`. The migration bytes are verified identical to `03f0fd3ab` (sha256 `39c5c91d…`) and the plan is restored, so the custody binding holds again.
5. `LIVEKIT_API_KEY/SECRET` unset; alert send failed. Both pre-existing and non-critical.

## Owed

- Cohort walk of the advanced Studio (Home → current Work, A2 relationships, return state, Review conversation).
- Disposition of observation 4 before `928b183f4` is merged anywhere.
