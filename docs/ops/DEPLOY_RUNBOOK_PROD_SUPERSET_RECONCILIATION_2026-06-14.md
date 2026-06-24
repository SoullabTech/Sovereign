# Deploy Runbook — Prod Fork → clean-main Superset Reconciliation

**Scope:** Deploy `origin/clean-main-no-secrets` (reconciled superset) onto **minisforum**, replacing the ~100-commit-behind prod fork. Includes #454 (admin-auth security port) + #451 (session-room consent gate) + their migrations.

**Status:** DRAFT — **DO NOT EXECUTE** without explicit founder instruction. Merging past advisory-red Covenant Gates (#453) authorized the *merge only*, never this deploy.

**Authorship note:** When run via the Claude Code agent, `curl` HTTP probes are blocked and must be routed through `ctx_execute`; in a normal operator shell, run them directly. All `ssh soullab@minisforum` commands run from Mac Studio.

**Why this is not a normal deploy:** This is a *reconciliation disguised as a deploy* — the exact shape that reverted ~100 live commits in the #447 incident. The load-bearing gate is §3: **prod HEAD must be an ancestor of clean-main**. If it is not, STOP — clean-main is not a true superset and deploying would delete live work.

**Deploy invariant (the one rule):** *No mutation until the backup exists (§2), the superset is proven (§3), and infra drift is preserved (§4).* The first prod mutation is **§5** (`git checkout` + migrate); §1–§4 are strictly read-only / additive. §3 is the decisive gate; §4 must not be skipped. If §3 or §4 stops, nothing has changed on prod yet — that is the point.

---

## 1. Preconditions

- [ ] Founder has explicitly authorized **this deploy** (separate from the merge decision).
- [ ] `gh pr view 454 --json state` = MERGED; merge commit `9e3c2c2b7` confirmed ancestor of `origin/clean-main-no-secrets`.
- [ ] Required checks green on the merged commit: `build` ✅, `check-diagrams` ✅. (`covenant-gates` red is expected — #453, advisory only.)
- [ ] Tailscale path to minisforum verified: `ssh soullab@minisforum 'hostname -I'` returns and shows `192.168.0.104` as LAN IP (router port-forward target). Tailscale `100.119.226.84` is the out-of-band fallback.
- [ ] Maintenance window noted; no other migration run in flight (advisory lock `724001`).
- [ ] `.env.production` present on prod and **not** about to be clobbered (gitignored — confirm in §4).

## 2. Backups / snapshots

The pre-migration DB dump **is the DB rollback artifact** (migrations here are forward-only; no down scripts).

```bash
# DB dump (pg_dump → gzip, existing script)
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && bash scripts/backup-postgres.sh'
# Capture: .sql.gz path, size, exit 0. Expect ~270MB+, exit 0.

# Baseline row counts (compare again in §8/§11)
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
 "SELECT (SELECT count(*) FROM members) members, (SELECT count(*) FROM maia_sessions) sessions, (SELECT count(*) FROM atoms) atoms;"'

# Record current running image + commit for app rollback target (§12)
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Id}} {{.Image}} {{.Created}}"'
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git rev-parse HEAD'   # = PROD_HEAD, save it
```

- [ ] DB dump exists, exit 0, size sane.
- [ ] Baseline counts saved.
- [ ] `PROD_HEAD` commit + current image id saved (rollback targets).

## 3. Final content-superset check  ← **LOAD-BEARING GATE**

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git fetch origin clean-main-no-secrets'
# Commits live on prod but NOT in clean-main. MUST be empty.
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git log --oneline origin/clean-main-no-secrets..HEAD'
```

- [ ] Output is **empty** → prod HEAD is an ancestor of clean-main → superset confirmed → proceed.
- [ ] **If non-empty → STOP** (stop condition: superset violation). Those commits would be lost. Reconcile them into clean-main via PR first; do not deploy.

Spot-check the security content is actually present (not just a merge bubble):

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git show origin/clean-main-no-secrets:lib/admin/adminAuth.ts | grep -c "auth_sessions"'   # >0
```

## 4. Infra-file preservation

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git status --porcelain'
```

- [ ] If any **tracked** infra file is modified/uncommitted (`Caddyfile`, `docker-compose.production.yml`, Dockerfiles): **STOP** (stop condition: uncommitted infra not preserved). Capture with `git stash list`/`git diff > /tmp/prod-infra.patch`, decide intentionally, then re-evaluate.
- [ ] Confirm `.env.production` is gitignored and will survive checkout: `git check-ignore .env.production` returns the path. Back it up anyway: `cp .env.production ~/.env.production.bak.$(date +%s)` *(run on prod; date is fine there)*.
- [ ] Diff prod infra vs clean-main so no live infra change is silently reverted:
  `git diff HEAD origin/clean-main-no-secrets -- Caddyfile docker-compose.production.yml` — review every hunk.

## 5. Migration plan (expand-before-deploy)

Migrations are **additive** (new tables/columns), so apply them **before** the app rebuild — old code ignores new schema; new code needs it present. The runner is idempotent and only applies files absent from `schema_migrations`.

```bash
# Switch prod repo to the superset (brings migration files + new source)
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git checkout clean-main-no-secrets && git pull --ff-only origin clean-main-no-secrets'

# Preview pending migrations (files vs applied table; both inputs sort-normalized for comm)
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -tAc \
 "SELECT filename FROM schema_migrations" | sort > /tmp/applied.txt; \
 cd ~/MAIA-SOVEREIGN && ls database/migrations/*.sql | xargs -n1 basename | sort > /tmp/ondisk.txt; \
 comm -23 /tmp/ondisk.txt /tmp/applied.txt > /tmp/pending.txt; echo PENDING:; cat /tmp/pending.txt'
```

Pin the **reviewed expectation** and assert PENDING matches it exactly — a reconciliation deploy will happily surface old backlog migrations nobody intended to ship today.

```bash
# Known-intended set for THIS deploy. Append a backlog file ONLY after you have read + approved it.
printf '%s\n' \
 20260612100001_admin_roles.sql \
 20260614000001_session_agreements.sql \
 20260614000002_session_join_tokens.sql \
 | sort -u | ssh soullab@minisforum 'cat > /tmp/expected.txt'

ssh soullab@minisforum 'diff /tmp/expected.txt /tmp/pending.txt && echo "PENDING == reviewed expectation ✅"'
```

- [ ] `diff` empty → PENDING equals the reviewed set → proceed. **Non-empty → STOP** (stop condition: pending list differs from reviewed expectation).

```bash
# Historical-integrity preflight (read-only): recent applied tail + orphans (recorded but file gone = fork divergence)
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
 "SELECT filename, applied_at FROM schema_migrations ORDER BY applied_at DESC LIMIT 8;"'
ssh soullab@minisforum 'echo ORPHANS:; comm -13 /tmp/ondisk.txt /tmp/applied.txt'
```

- [ ] Recent tail sane; no unexpected ORPHANS. The runner additionally **hard-aborts** on any file whose content changed after it was applied (`❌ Migration file changed after it was applied` → `SELECT 1/0`) — treat that abort as this same stop condition. Do **not** "fix" it by editing history; investigate the divergence.

```bash
# Apply via throwaway psql client on the compose network (does NOT depend on the app image shipping migrations).
# Confirm network name first:
ssh soullab@minisforum 'docker network ls | grep maia'   # expect maia-sovereign_default (or similar)

ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && set -a && . ./.env.production && set +a && \
 docker run --rm --network maia-sovereign_default -v "$PWD:/repo" -w /repo \
   -e DATABASE_URL="$DATABASE_URL" postgres:16 bash scripts/apply-migrations.sh' 2>&1 | tee /tmp/migrate.log
```

- [ ] Output ends with `✅ All migrations applied + invariants verified`.
- [ ] `episode_links is a VIEW` invariant passed.
- [ ] **Any `❌` (checksum mismatch / apply error / invariant fail) → STOP** (stop condition: migration fails). Do not rebuild. Assess; restore from §2 dump only if schema corrupted.

## 6. Rebuild plan

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && docker compose -p maia-sovereign \
 -f docker-compose.production.yml --env-file .env.production up -d --build maia'
```

- [ ] Build succeeds; `maia-sovereign` recreated (note: this triggers the Caddy stale-DNS trap — §7 is mandatory, not optional).

## 7. Caddy restart (mandatory)

Rebuilding recreates `maia-sovereign`; long-running `maia-caddy` can keep a stale Docker-DNS view → **HTTP 502 for all of soullab.life** even though the app is healthy.

```bash
ssh soullab@minisforum 'docker restart maia-caddy'
```

- [ ] Caddy restarted **after** the rebuild.

## 8. Health checks

```bash
# Container freshness (must be <1 min old)
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}} {{.State.Health.Status}}"'

# Internal app health (inside the container — bypasses Caddy DNS)
ssh soullab@minisforum 'docker exec maia-sovereign sh -c "wget -qO- http://localhost:3000/api/health || curl -s localhost:3000/api/health"'

# Public health (external path: DNS → router → Caddy → app)
curl -k https://soullab.life/api/health     # agent: route via ctx_execute
```

- [ ] Container Created <1 min; health `healthy`/running. **Else STOP** (stop condition: maia container unhealthy).
- [ ] Internal `/api/health` 200 with fresh `uptime`.
- [ ] Public `/api/health` 200 JSON. **502/timeout → STOP** (stop condition: public health fails) → re-run §7, re-check; if still failing, roll back (§12).
- [ ] Row counts match §2 baseline (no data loss from migration).

## 9. Admin-auth proof  *(keep separate from §10)*

**Endpoint contract (verified live 2026-06-14 — corrected from the original draft):** `GET /api/admin/auth` is a *status* endpoint — it returns **HTTP 200 always**, with the answer in the **body**: `{"isAdmin":false}` vs `{"isAdmin":true,"via":…,"role":…}` (`// 200 not 401 — client just checks the boolean`). **Do NOT assert on its status code.** For a status-code gate, use a genuinely *gated* data endpoint: `GET /api/admin/research/overview` → `401 {"error":"Unauthorized"}` unauthed, `200` with a valid session.

Security-critical property (the #449 fix): a bare `x-member-id` — **even carrying a real admin's UUID** — must NOT grant admin, because it carries no session proof. Test with a *real* admin UUID so "knowing an admin's id" is proven insufficient.

```bash
# Real admin UUID (knowing it must not be enough):
#   ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -tAc \
#     "SELECT id FROM members WHERE admin_role IS NOT NULL LIMIT 1"'
# In-agent (curl is blocked) — probe inside the app container against localhost:3000 via piped node fetch.
# Operator (curl) hits the public path:
#   curl -s https://soullab.life/api/admin/auth -H 'x-member-id: <REAL-ADMIN-UUID>'                                  # expect {"isAdmin":false}
#   curl -s -o /dev/null -w '%{http_code}\n' https://soullab.life/api/admin/research/overview -H 'x-member-id: <REAL-ADMIN-UUID>'  # expect 401
```

- [ ] `auth` no-header **and** bare real-admin `x-member-id` → **`{"isAdmin":false}`**.
- [ ] `overview` no-header **and** bare real-admin `x-member-id` → **401 `Unauthorized`**.
- [ ] **If `isAdmin:true` for a bare x-member-id, or the gated endpoint returns 200/data for it → STOP + ROLL BACK** — the #449 escalation has regressed (stop condition #6).
- [ ] **Positive (needs a valid session cookie):** `auth` → `{"isAdmin":true,…}` and `overview` → 200. Requires a real/minted admin session token; mark **deferred** if unavailable.

## 10. Consent-path proof  *(keep separate from §9)*

`GET /api/session/join/[token]` returns `videoLink` **only** when the ledger shows the client *accepted the current `agreement_version`*. Reveal is governed by the ledger gate, never by token existence. A revise bumps `agreement_version`, making prior tokens/decisions stale.

Use a disposable test session + token (issue via the studio agreement flow). For each state, GET the join surface and inspect `videoLink`.

```bash
J() { curl -k -s "https://soullab.life/api/session/join/$1" | python3 -c 'import sys,json;d=json.load(sys.stdin);print("videoLink=",d.get("videoLink"),"state=",d.get("decision",{}).get("state") if isinstance(d.get("decision"),dict) else d.get("linkBlockedReason"))'; }
```

- [ ] **pending** (no decision yet): `J <token>` → `videoLink=None`. *(reveal on pending → STOP)*
- [ ] **refuse**: `POST /api/session/join/<token>/refuse`, then `J <token>` → `videoLink=None`. *(reveal on refuse → STOP)*
- [ ] **accept (current version)**: `POST /api/session/join/<token>/accept`, then `J <token>` → `videoLink=<url>` (link present).
- [ ] **revise → new version**: bump agreement via `POST /api/studio/sessions/<sessionId>/agreement` → confirm session `current_version` incremented and a new token is issued at the new version.
- [ ] **stale token**: GET the *pre-revise* token (`J <old_token>`) → `videoLink=None` (token_version < current_version). *(stale token reveals link → STOP)*

Stop conditions for this section: **consent pending/refuse reveals link**, or **stale token reveals link** → ROLL BACK (consent boundary breached).

## 11. Cleanup

- [ ] Delete disposable test session/tokens created in §10.
- [ ] Re-run §2 baseline counts; confirm only expected deltas.
- [ ] Record in ops log: deployed commit (`git rev-parse HEAD` on prod), image id, migration log path (`/tmp/migrate.log`), proof results.
- [ ] Confirm scheduled DB backup cron still intact (`crontab -l` on prod — do not clobber the maia-reminders job).
- [ ] Leave `~/.env.production.bak.*` for one cycle, then prune.

## 12. Rollback plan

Prefer **app rollback first** (additive migrations are backward-compatible — old code ignores new tables/columns; full DB restore is rarely needed):

```bash
# App: return to the pre-deploy prod commit + rebuild
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git checkout <PROD_HEAD> && \
 docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production up -d --build maia && \
 docker restart maia-caddy'
# then re-run §8 health.
```

- DB restore (only if schema/data corrupted): stop app, restore the §2 `.sql.gz` into `maia-postgres`, then app rollback above. Forward-only migrations mean restore = the only true DB down-path.
- Caddy-only fault (app healthy, public 502): `docker restart maia-caddy` alone usually resolves.

- [ ] Rollback target `PROD_HEAD` + image id are the ones saved in §2.

## 13. Stop conditions (any one halts the deploy)

1. Prod has **uncommitted infra changes** not preserved (§4).
2. **Superset violation** — prod HEAD not an ancestor of clean-main (§3). *(the #447 trap)*
3. **Migration fails** — any `❌`, checksum mismatch, or invariant failure (§5).
4. **maia container unhealthy** after rebuild (§8).
5. **Public health fails** (502/timeout) and not resolved by Caddy restart (§7/§8).
6. **Bare x-member-id returns 200** (§9) — admin privilege-escalation regression.
7. **Consent pending/refuse reveals link** (§10) — consent boundary breach.
8. **Stale token reveals link** (§10) — versioning/consent breach.
9. **Migration backlog surprise** (§5) — PENDING differs from the reviewed expectation, the runner aborts on a changed-after-apply checksum, or `schema_migrations` shows unexpected orphan/historical rows. Reconciliation deploys surface old backlog migrations nobody meant to ship; an unexpected set halts **before** apply.

On any stop: do not proceed to the next section. For §3/§4 stop before any mutation. For post-migration/post-rebuild stops (4–8): roll back per §12, then diagnose.

---

### Separate-concerns reminder
- **Admin-auth proof** (§9) and **consent proof** (§10) are independent gates — both must pass; neither substitutes for the other.
- **merged ≠ present · present ≠ deployed · deployed ≠ proven.** Each rung has its own gate: *present* = §3 superset check; *deployed* = §6–§8 rebuild + Caddy + health; *proven* = §9 + §10. Collapsing any rung is how the prior failures slipped through — keep them distinct.
- **Open structural item:** #453 (durable non-author approver) remains the fix that makes Covenant Gates green legitimately. Not a blocker for this deploy; do not let the override become the operating model.
