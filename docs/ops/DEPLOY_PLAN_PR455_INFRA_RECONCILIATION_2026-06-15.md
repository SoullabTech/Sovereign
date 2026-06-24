# #455 Execution Plan — Prod Infra Config Reconciliation

**PR:** `reconcile/prod-infra-config-2026-06-14` (tip `c2ba736f8`, base `9e3c2c2b7` = current prod HEAD)
**Status:** PLAN ONLY — **DO NOT EXECUTE** without explicit founder "go #455".

**Three risk multipliers (why this is not a normal deploy):**
1. **Dirty prod working tree** on the *same* files #455 changes (`Caddyfile`, `docker-compose.production.yml` are uncommitted-modified; B1 added more to the compose).
2. **A live client site in the Caddy blast radius** — `jlmasterhandyman.com` / `www` + `jeremy.soullab.life`→redirect (Jeremy Larson's Master Handyman; `palisades-handyman` container; all 3 domains resolve to prod WAN `32.219.7.166`).
3. **B1 edits are local-only right now** (`WHISPER__MODEL=base` + `whisper-hf-cache`) — #455 must be proven to preserve them before any discard.

**Deploy invariant (the one rule):** *No runtime change until backups exist (§1), #455 is proven a faithful superset of the live working tree (§2), and config validates (§3).* The first mutation is §4. If §2 or §3 stops, nothing has changed on prod.

**What #455 actually changes on prod (net, after B1):** adds the `mythic-atlas` service + wires `MYTHIC_ATLAS_URL` on `maia`; parameterizes the postgres bind (`${POSTGRES_BIND:-127.0.0.1}` — resolves to `100.119.226.84`, already set, so no effective change); enhances the **live** Palisades block with security headers + `/var/log/caddy/palisades-access.log`; removes the stray `.bak`. Whisper is already `base` (B1) and #455 matches — **whisper is NOT touched.**

**Authorship note:** in-agent, `curl`/`wget` are blocked — HTTP probes run via `ctx_execute` (public URLs) or piped `node` inside a container (internal). All `ssh soullab@minisforum` from Mac Studio.

---

## 1. Preflight (read-only + backups; no runtime change)

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && \
  echo "=== branch/HEAD ===" && git rev-parse --abbrev-ref HEAD && git rev-parse --short HEAD && \
  echo "=== dirty files ===" && git status --porcelain -- Caddyfile docker-compose.production.yml && \
  echo "=== POSTGRES_BIND present? ===" && grep -E "^POSTGRES_BIND=" .env.production && \
  echo "=== backups ===" && TS=$(date +%Y%m%d_%H%M%S) && \
  cp Caddyfile Caddyfile.pr455-bak.$TS && \
  cp docker-compose.production.yml docker-compose.production.yml.pr455-bak.$TS && \
  echo "BACKED UP @ $TS"'
```
- [ ] Branch = `clean-main-no-secrets`, HEAD = `9e3c2c2b7` (or later, still an ancestor of #455's base).
- [ ] Dirty files = exactly `Caddyfile` + `docker-compose.production.yml` (the expected drift). Anything else → investigate before proceeding.
- [ ] `POSTGRES_BIND=100.119.226.84` present. **If missing → STOP** (parameterized bind would fall to `127.0.0.1` and break Hetzner replication).
- [ ] Both backups created (these are the §6 rollback artifacts). The B1 backup `docker-compose.production.yml.b1-bak.20260615_002752` also remains.

```bash
# #455 contains B1 whisper changes + preserves Palisades?
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git fetch origin reconcile/prod-infra-config-2026-06-14 && B=origin/reconcile/prod-infra-config-2026-06-14 && \
  echo "=== #455 whisper (must be base + cache) ===" && git show $B:docker-compose.production.yml | grep -nE "WHISPER__MODEL|whisper-hf-cache" && \
  echo "=== #455 Palisades routing (must be present) ===" && git show $B:Caddyfile | grep -nE "jlmasterhandyman|palisades-handyman:4321|jeremy.soullab" && \
  echo "=== #455 mythic-atlas wiring ===" && git show $B:docker-compose.production.yml | grep -nE "MYTHIC_ATLAS_URL|mythic-atlas:|container_name: maia-mythic-atlas"'
```
- [ ] #455 has `WHISPER__MODEL: base` + `whisper-hf-cache` (B1 preserved).
- [ ] #455 has `jlmasterhandyman.com` + `reverse_proxy palisades-handyman:4321` + `jeremy.soullab.life` redirect (client site preserved).
- [ ] #455 has `MYTHIC_ATLAS_URL` on maia + the `mythic-atlas` service + `container_name: maia-mythic-atlas`.

## 2. Reconciliation gate ← LOAD-BEARING (prove faithful superset before any discard)

The deploy will **discard prod's local edits in favor of #455's committed versions.** That is safe ONLY if #455 contains everything the live working tree has. The dangerous direction is *"settings in the live working tree that #455 lacks"* — those would be lost.

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && B=origin/reconcile/prod-infra-config-2026-06-14 && \
  echo "=== compose: lines in LIVE working tree but NOT in #455 (would be LOST) ===" && \
  git diff $B -- docker-compose.production.yml | grep -E "^\+" | grep -vE "^\+\+\+" && \
  echo "=== caddy: lines in LIVE working tree but NOT in #455 (would be LOST) ===" && \
  git diff $B -- Caddyfile | grep -E "^\+" | grep -vE "^\+\+\+"'
```
- [ ] The only acceptable "would be lost" line is the **hardcoded** `- "100.119.226.84:5432:5432"` (replaced by #455's `${POSTGRES_BIND:-127.0.0.1}` which resolves to the same value — equivalent, safe).
- [ ] **Whisper base + `whisper-hf-cache` must NOT appear** as "would be lost" (they should be identical in both → absent from the diff). If they appear → #455 doesn't match B1 → **STOP**, reconcile #455 first.
- [ ] **No Palisades/jlmasterhandyman routing line appears** as "would be lost." If any does → **STOP** (client-site risk).
- [ ] Any other meaningful "would be lost" line → **STOP** and reconcile.

Only when this gate is clean, merge #455 and load its files into the working tree:
```bash
# Merge #455 → clean-main (founder decision past advisory-red covenant; build+check-diagrams green).
#   Covenant-gates red = #453 (advisory, not a required check) — documented founder merge.
# Then on prod, replace the dirty files with the now-committed #455 versions:
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git fetch origin clean-main-no-secrets && \
  git checkout -- Caddyfile docker-compose.production.yml && \
  git pull --ff-only origin clean-main-no-secrets && \
  echo "=== confirm working tree now == #455 committed (clean) ===" && git status --porcelain -- Caddyfile docker-compose.production.yml'
```
- [ ] `git checkout --` discards the (now-superseded, proven-equivalent) local edits; `git pull --ff-only` brings #455's committed versions. `git status` for those two files is now **clean**.
- [ ] **If `pull` is not fast-forward → STOP** (unexpected divergence).

## 3. Validation before any restart (protects the live client site)

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && \
  echo "=== compose config ===" && docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production config --quiet && echo COMPOSE_OK && \
  echo "=== caddy validate (DO NOT reload yet) ===" && docker exec maia-caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile && echo CADDY_OK && \
  echo "=== /var/log/caddy writable (for palisades-access.log)? ===" && docker exec maia-caddy sh -c "mkdir -p /var/log/caddy && touch /var/log/caddy/.wtest && rm -f /var/log/caddy/.wtest && echo WRITABLE"'
```
- [ ] `COMPOSE_OK`. **Else STOP** (restore backups via §6, no runtime touched).
- [ ] `CADDY_OK` — Caddyfile syntactically valid. **Else STOP + restore Caddyfile** (a bad Caddyfile would take the client site down on reload).
- [ ] `/var/log/caddy` `WRITABLE`. **If not writable** → either ensure the dir/volume exists, or remove the `log { … palisades-access.log }` block from the Caddyfile before reload (don't let the log path break the live block).

## 4. Deploy (minimal, ordered, client-site-protecting)

Whisper is untouched. Apply only the maia + mythic-atlas + caddy changes.

```bash
# (a) Adopt the running mythic-atlas orphan into the compose project (definition now exists in #455)
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production up -d mythic-atlas 2>&1 | tail -5'
# (b) Recreate maia ONCE to pick up MYTHIC_ATLAS_URL
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production up -d maia 2>&1 | tail -5'
# (c) Caddy: PREFER graceful reload (zero downtime for jlmasterhandyman.com) — applies enhanced Palisades block + re-resolves the recreated maia upstream
ssh soullab@minisforum 'docker exec maia-caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile && echo RELOADED'
#   FALLBACK only if maia upstream 502s after reload: docker restart maia-caddy  (brief all-site blip incl. client)
```
- [ ] (a) mythic-atlas adopted (orphan warning gone; one `maia-mythic-atlas` in the project).
- [ ] (b) maia recreated once, comes up healthy.
- [ ] (c) `RELOADED` (graceful). Use `docker restart maia-caddy` **only** if §5 shows a 502 from maia.
- [ ] Do NOT recreate whisper (the user constraint; B1 is already correct).

## 5. Post-deploy verification

```bash
# soullab app health (internal + external)
ssh soullab@minisforum 'docker exec maia-sovereign sh -c "wget -qO- http://localhost:3000/api/health || true"'   # in-agent: node-fetch variant
#   external: ctx_execute fetch https://soullab.life/api/health
# CLIENT SITE — the critical one
ssh soullab@minisforum 'docker ps --format "{{.Names}}\t{{.Status}}" | grep -E "palisades-handyman|maia-caddy"'
#   external: ctx_execute fetch https://jlmasterhandyman.com (expect 200) + check caddy palisades-access.log now has entries
ssh soullab@minisforum 'docker exec maia-caddy sh -c "tail -3 /var/log/caddy/palisades-access.log 2>/dev/null" || echo "(no log yet)"'
# mythic-atlas reachable FROM maia (the B2 fix)
ssh soullab@minisforum 'docker exec -i maia-sovereign node' <<'NODE'
fetch("http://mythic-atlas:8088/health").then(r=>console.log("mythic-atlas:",r.status)).catch(e=>console.log("mythic-atlas ERR",e.message))
NODE
# postgres bind unchanged (replication safe)
ssh soullab@minisforum 'docker port maia-postgres 5432'   # expect 100.119.226.84:5432
# caddy logs clean (no 5xx / no errors since reload)
ssh soullab@minisforum 'docker logs maia-caddy --since 5m 2>&1 | grep -iE "error|502|503" | tail -10 || echo "(clean)"'
```
- [ ] soullab `/api/health` 200 internal **and** external.
- [ ] **`jlmasterhandyman.com` still serving (200)** + `palisades-handyman` container up + access-log writing. **If client site is down → immediate §6 ROLLBACK.**
- [ ] mythic-atlas returns a status from inside maia (was unreachable before). *(Not a rollback trigger — fails safe — but the whole point of B2.)*
- [ ] `docker port maia-postgres 5432` shows `100.119.226.84` (bind unchanged → Hetzner replication safe).
- [ ] caddy logs clean.

## 6. Rollback

Trigger on: client site down (§5), soullab health down, postgres bind changed, or caddy errors.

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && \
  cp Caddyfile.pr455-bak.<TS> Caddyfile && \
  cp docker-compose.production.yml.pr455-bak.<TS> docker-compose.production.yml && \
  docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production config --quiet && \
  docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production up -d maia mythic-atlas && \
  docker exec maia-caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile'
# then re-verify §5: jlmasterhandyman.com 200 + soullab health 200
```
- [ ] Restore the §1 backups (the pre-#455 working-tree files).
- [ ] `config` validates the restored compose.
- [ ] Recreate affected services from restored files; `caddy reload`.
- [ ] **Re-verify the client site + soullab health are back.** The git merge of #455 can be reverted separately later — runtime restoration is what matters here.

---

### Stop conditions (any one halts before further mutation)
1. `POSTGRES_BIND` missing (§1).
2. **Faithful-superset gate fails** — live working tree has a setting #455 lacks, beyond the equivalent postgres bind (§2). *The whole reason for this plan.*
3. `git pull` not fast-forward (§2).
4. `docker compose config` or `caddy validate` fails (§3) — restore, do not reload.
5. `/var/log/caddy` not writable and log block not handled (§3).
6. **`jlmasterhandyman.com` down after deploy (§5) — immediate rollback** (live client site).
7. soullab health down, or postgres bind changed (§5) — rollback.

### Separate-concerns reminder
- **Whisper is done (B1)** — not in this deploy. **mythic-atlas (B2) rides here.** Palisades is **preserved + enhanced**, never introduced.
- **merged ≠ deployed ≠ working ≠ independently verified** — §5 proves *working*; real client traffic + soullab independent checks remain their own rungs.
