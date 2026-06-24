# Co-lab Decision → Task — Deploy Runbook (CANONICAL)

**Status:** PREP — execute manually, step by step. **Do not automate. Hold until the parallel build is confirmed settled + Kelly's go.**
**Date:** 2026-06-06 · **Canonical home:** this file (`docs/ops/`). A pointer lives at `docs/architecture/COLAB_DECISION_LOOP_DEPLOY_RUNBOOK_2026-06-06.md`.
**Ships:** conversation → decision → find → task (one store, two lenses). **Risk class:** migration + prod parity, not design.

> Consolidated from two earlier drafts. Sources reconciled; a **phantom-migration hazard** (below) that neither draft caught is now the load-bearing step.

---

## ⚠️ Phantom-migration hazard (read first — verified read-only 2026-06-06)

`20260321000004_team_message_kinds.sql` is **recorded in `schema_migrations` on prod, but its columns are ABSENT**:
- `team_messages.message_kind` = **MISSING**, `team_dm_messages.message_kind` = **MISSING**
- yet `schema_migrations` has the filename recorded (`tmk_recorded=1`)

The migrate runner (`apply-migrations.sh`) tracks applied migrations **by filename**, so it will **SKIP** this one → **a normal deploy does NOT add `message_kind`** → tagging a message as `decision` (and the Decision badge / capture UX) **will 500 on prod**. This MUST be remediated manually (Step 3). The drift is otherwise **isolated** — a prod↔local audit found *only* `message_kind` missing across all team tables.

## Reconciled prod truth

| Item | Prod state | Action |
|---|---|---|
| Base tables (`team_*`, `studio_decisions`, `studio_tasks`) | present | none |
| ADHD migration `20260211000001` (`energy_match`, status CHECK allows `pending`) | **applied** | none (local-only gap; fixed local) |
| `20260606000001_colab_decision_task_provenance` (6 `source_*` cols) | not recorded, not applied | runner **will apply** on deploy ✓ |
| `20260321000004_team_message_kinds` (`message_kind` ×2 + CHECKs) | **PHANTOM — recorded but absent** | **manual remediation (Step 3)** — runner will skip |

## Migration mechanism (confirmed — do not rely on `up -d --build` alone)

- Runner: `scripts/apply-migrations.sh` — globs `database/migrations/*.sql`, advisory-locked, idempotent, records by `filename` in `schema_migrations`.
- Deploy: `scripts/deploy-production.sh deploy` → runs compose **`migrate` profile** (`--profile migrate run --rm migrate`) → build → up.
- Boot gate: `scripts/entrypoint.sh` → `ensure-migrations.sh` (REQUIRED set). Co-lab migration is **deliberately NOT in REQUIRED**, so a migrate failure won't block app boot — only Co-lab routes 500, isolated.
- ⚠️ **`docker compose ... up -d --build maia` alone does NOT run migrations.**

---

## Sequence (run from Mac Studio repo root unless noted)

### 1. Confirm the loop is WHOLE on ORIGIN (not a local branch)
⚠️ **Verify against `origin/clean-main-no-secrets`, never a local ref** — local can be tens of commits behind, which once masked the missing convert endpoint. Fetch, then confirm **all six** Co-lab files are on origin:
```bash
git fetch origin clean-main-no-secrets
for f in "app/api/team/channels/[channelId]/decisions/route.ts" "app/api/team/decisions/route.ts" \
         "app/api/team/decisions/[decisionId]/tasks/route.ts" "app/team/decisions/page.tsx" \
         "components/team/TeamDecisionsView.tsx" "database/migrations/20260606000001_colab_decision_task_provenance.sql"; do
  git ls-tree -r origin/clean-main-no-secrets --name-only | grep -qFx "$f" && echo "OK  $f" || echo "MISSING  $f"
done
```
All six must print `OK` — **especially the convert endpoint `[decisionId]/tasks/route.ts`** (the "Make task" backend; `ad23b1a96` shipped the other five, this was added in `d44505475`). Any `MISSING` → STOP and commit it before deploying. The "Make task" button is in `TeamDecisionsView` regardless, so a missing endpoint = a 404 in the live loop.

Confirm the migrate set newer than prod's latest recorded (`20260531000001`) is the intended set:
```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git fetch -q origin clean-main-no-secrets && git checkout clean-main-no-secrets && git pull -q && \
  comm -23 <(ls database/migrations/*.sql | xargs -n1 basename | sort) \
           <(docker exec maia-postgres psql -U soullab maia_consciousness -tAc "SELECT filename FROM schema_migrations" | sort)'
```

### 2. Back up prod DB
```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && ./scripts/deploy-production.sh backup'
```

### 3. ⚠️ Remediate the phantom migration (BEFORE deploy)
The runner will skip `20260321000004` (recorded). Run its idempotent SQL directly to add `message_kind` to both tables (`ADD COLUMN IF NOT EXISTS` + CHECK):
```bash
ssh soullab@minisforum 'docker exec -i maia-postgres psql -U soullab maia_consciousness' < database/migrations/20260321000004_team_message_kinds.sql
```
Confirm immediately:
```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -tAc "SELECT table_name||'\''.message_kind'\'' FROM information_schema.columns WHERE column_name='\''message_kind'\'' AND table_name IN ('\''team_messages'\'','\''team_dm_messages'\'') ORDER BY 1;"'
```
Expect both `team_dm_messages.message_kind` and `team_messages.message_kind`.
*(Alternative: `DELETE FROM schema_migrations WHERE filename='20260321000004_team_message_kinds.sql'` then let Step 4's runner re-apply. Direct-run above is preferred — no dependence on the runner for the fix.)*

### 4. Deploy — TARGETED maia only (do NOT use the full-stack deploy)
⚠️ **`./scripts/deploy-production.sh deploy` FAILS for this repo** (confirmed 2026-06-06): it runs a full-stack `docker compose up` that tries to pull an unrelated service image (`palisades-handyman:prod`) → `pull access denied` → the whole `up` aborts *before* maia is recreated and *before* the migrate profile runs. Prod is left untouched (old maia keeps serving) — a safe failure, but nothing deploys. **A failed full-stack deploy ≠ a failed maia deploy. Fix forward with the narrowest command that touches only maia.**

a. Pull clean-main on minisforum, then apply the migration **directly** (the migrate profile never runs when the full-stack up aborts):
```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git fetch origin clean-main-no-secrets && git checkout clean-main-no-secrets && git pull --ff-only'
ssh soullab@minisforum 'docker exec -i maia-postgres psql -U soullab maia_consciousness < ~/MAIA-SOVEREIGN/database/migrations/20260606000001_colab_decision_task_provenance.sql'
```
(Direct apply is idempotent; it does **not** record into `schema_migrations` — the next successful full migrate run records it idempotently. Verify the columns in Step 5, not the migration record.)

b. Recreate **only maia** — `--no-deps` so it cannot pull/start `palisades-handyman` or any other service:
```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production up -d --build --no-deps maia'
```
Confirm the convert endpoint is in the running build (the d44505475 differentiator; `GIT_COMMIT` env is `unknown`, so verify functionally):
```bash
ssh soullab@minisforum 'docker exec maia-sovereign sh -lc "ls /app/.next/server/app/api/team/decisions/[decisionId]/tasks/route.js"'
```

### 5. Verify — schema (expect the 8 columns) + migration recorded
```bash
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -tAc \"SELECT table_name||'.'||column_name FROM information_schema.columns WHERE (table_name='team_messages' AND column_name='message_kind') OR (table_name='team_dm_messages' AND column_name='message_kind') OR (table_name='studio_decisions' AND column_name IN ('source_message_id','source_channel_id','captured_by_member_id')) OR (table_name='studio_tasks' AND column_name IN ('source_decision_id','source_message_id','source_channel_id')) ORDER BY 1;\""
```
Must return all 8:
```
studio_decisions.captured_by_member_id
studio_decisions.source_channel_id
studio_decisions.source_message_id
studio_tasks.source_channel_id
studio_tasks.source_decision_id
studio_tasks.source_message_id
team_dm_messages.message_kind
team_messages.message_kind
```
And the colab migration recorded:
```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -tAc "SELECT count(*) FROM schema_migrations WHERE filename=$$20260606000001_colab_decision_task_provenance.sql$$;"'   # expect 1
```
Standard CLAUDE.md checks: container `Created` < 1 min; `hostname -I` includes `192.168.0.104`; `curl -k https://soullab.life/api/health` fresh. **If any check fails → STOP.**

### 6. Beta operating-loop receipt (post-deploy, real UI)
1. In a channel, post a decision → tag it `decision`. 2. **Capture as Decision**. 3. Open **Decisions** → it appears. 4. **Make task** → assignee → create. 5. Card shows `1 task`; task is assigned + links back.
Server-side confirmation:
```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since 30m 2>&1 | grep -E "Co-lab/decision-capture|Co-lab/decision-task"'
# engineer-capable proof (non-practitioner capture): a channel-origin decision with practitioner_id NULL
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -tAc "SELECT count(*) FROM studio_decisions WHERE source_channel_id IS NOT NULL AND practitioner_id IS NULL;"'
# provenance retained
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -tAc \"SELECT title, assignee, source_decision_id IS NOT NULL, source_message_id IS NOT NULL, source_channel_id IS NOT NULL FROM studio_tasks WHERE source_decision_id IS NOT NULL ORDER BY created_at DESC LIMIT 3;\""
```

---

## Rollback / safety
- `20260606000001` is additive + idempotent (`ADD COLUMN IF NOT EXISTS`, `DROP NOT NULL`, `CREATE INDEX IF NOT EXISTS`); `20260321000004` likewise. Safe to leave even if the app deploy is rolled back.
- Co-lab migration is **not** in `ensure-migrations.sh` REQUIRED → a migrate failure does not block whole-app boot (Co-lab routes isolated).
- App rollback: redeploy prior image / `git revert` the feature commit + rebuild `maia`. Schema can stay.
- Full schema revert (only if needed): drop the 6 `source_*` columns + their indexes; re-add `studio_decisions.practitioner_id NOT NULL` **only if** no NULL rows exist.

## Do-not list
- No auto-deploy. Each step is a human decision.
- Don't trust `up -d --build` to migrate — use `deploy-production.sh deploy` (or the migrate profile).
- Don't skip Step 3 — the runner will silently skip the phantom `20260321000004`.
- Single convert path only: `/api/team/decisions/[decisionId]/tasks`. Don't re-add `sourceDecisionId` to `/api/studio/tasks`.
- Leave the legacy prod-only `team_dm_messages.message_type` column untouched.

## Known minor inconsistency (reconcile later)
Two task endpoints default different statuses: `/api/studio/tasks` → `pending`, team endpoint → `todo`. Both valid on prod (ADHD constraint applied). Cosmetic; reconcile if task surfaces unify.
