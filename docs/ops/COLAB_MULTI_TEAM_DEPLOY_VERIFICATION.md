# Co-Lab Multi-Team — Deployment & Production Verification

**PR:** [Sovereign#409](https://github.com/SoullabTech/Sovereign/pull/409) — `feat/colab-team-switcher`
**Status when this file was written:** implementation-verified (local), **NOT production-verified.**

## Claim discipline (read first)

The precise, honest claim today:

> The code path has been verified against the real route handlers in an authenticated **local** session with a faithful post-migration schema. **Production has not yet crossed the team-scoping boundary**, so production multi-team behavior remains **unverified**.

- The **implementation** is Live (proven locally).
- "Multi-team works in production" is **Designed**, pending deploy.
- **Do not check any box in §3–§4 until prod has actually run the migration and been observed.** Marking a box = "observed on prod," not "expected to work."

## Migration ↔ code coupling (the load-bearing risk)

The migration adds `team_channels.team_id` and makes it **`NOT NULL`**. The new code **reads and writes** that column. Therefore:

| State | Result |
|---|---|
| New code + migration applied | ✅ correct |
| New code + migration **not** applied | ❌ runtime errors (`team_id` column missing) |
| Old code + migration applied | ❌ channel creation 500s (old INSERT omits `team_id`) |

This is why `20260611000001_colab_channels_team_scope.sql` is now registered in `database/required_migrations.txt`: the schema gate (`scripts/ensure-migrations.sh` + `lib/db/schemaGate.ts`) will **refuse to boot the new code until the migration is recorded in `schema_migrations`.** That makes "new code + un-migrated schema" structurally impossible. The deploy order below applies the migration *before* the app serves.

---

## §1 — Merge (founder gate)

- [ ] #409 reviewed and approved by a non-author (covenant gate)
- [ ] Squash-merged into `clean-main-no-secrets`

## §2 — Deploy + migration (on minisforum)

Migrations run via the one-off `migrate` service; the app's schema gate then enforces them at boot.

- [ ] Pull + run the migration service:
  ```bash
  ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
    && git fetch origin clean-main-no-secrets && git checkout clean-main-no-secrets && git pull \
    && docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production run --rm migrate'
  ```
- [ ] Confirm the migration is recorded:
  ```bash
  ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -tAc \
    \"SELECT 1 FROM schema_migrations WHERE filename='20260611000001_colab_channels_team_scope.sql';\""   # expect: 1
  ```
- [ ] Build + start the app (schema gate must pass — it now requires the migration above):
  ```bash
  ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
    && docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production up -d --build maia'
  ```
- [ ] Container freshness (`Created` < 1 min), `hostname -I` shows `192.168.0.104`, `curl -k https://soullab.life/api/health` fresh

## §3 — Prod schema verification (after migrate, before declaring anything)

Run against the prod DB. Replace nothing is marked verified until these return as expected.

- [ ] `team_id` is `NOT NULL`:
  ```sql
  SELECT is_nullable FROM information_schema.columns
   WHERE table_name='team_channels' AND column_name='team_id';   -- expect: NO
  ```
- [ ] Per-team slug uniqueness in, global one gone:
  ```sql
  SELECT conname FROM pg_constraint WHERE conrelid='team_channels'::regclass AND contype='u';
  -- expect: team_channels_team_id_slug_key  (NOT team_channels_slug_key)
  ```
- [ ] No orphaned channels (all backfilled), and default team = earliest:
  ```sql
  SELECT count(*) FROM team_channels WHERE team_id IS NULL;                 -- expect: 0
  SELECT id, name FROM studio_teams ORDER BY created_at ASC, id ASC LIMIT 1; -- the default workspace
  ```
- [ ] Existing members seeded into the default workspace (roster preserved):
  ```sql
  SELECT count(*) FROM studio_team_members
   WHERE team_id = (SELECT id FROM studio_teams ORDER BY created_at ASC, id ASC LIMIT 1);
  ```

## §4 — Prod functional verification (authenticated, real member)

Mirror the local E2E, on prod. Use a real authenticated session. Clean up any test workspace/channel afterward.

- [ ] **No regression:** the default workspace shows today's channels; `#general` is still visible to everyone (incl. members not explicitly enrolled).
- [ ] **Switcher** renders, lists the member's workspaces + "New workspace".
- [ ] **Create a workspace** → `#general` auto-seeded → it appears in the switcher and lands on `#general`.
- [ ] **Create a channel** in the new workspace → visible there, **not** in the default workspace (no leakage).
- [ ] **Switch back** to the default workspace → original channels intact, count unchanged.
- [ ] **Landing fix:** switching to a team that has channels but no `#general` lands on its first channel (not a "not found" page).
- [ ] **Roster stays global:** the "Team · N" count does not change when switching workspaces.
- [ ] **Security:** a forged/foreign `teamId` on channel creation falls back to the default workspace (does not plant a channel in a team the member isn't in). Watch for `[auth] … claim does not match` only on genuine mismatch.
- [ ] Delete any test workspace + channels created during this pass.

## §5 — Rollback

- The migration is additive and destroys no data. The **app** and the **migration must move together** (see coupling table). To roll back, revert *both* the app image and (optionally) the schema — reverting the app alone while the schema stays migrated leaves old channel-creation code unable to satisfy `team_id NOT NULL`.
- Because the migration is registered as required, a rolled-back (old) image will pass the gate (the migration is still recorded), but its channel-creation path will 500. Prefer **roll forward** (fix + redeploy) over partial rollback.

## §6 — Only after §3–§4 pass

- [ ] Update status from "implementation-verified" → "production-verified" (with the date and who observed it).
- [ ] Note the observed default-workspace name + channel/member counts for the record.
