# Zero-Downtime Deploy — eliminating the ~1–2 min 502 window

**Date:** 2026-06-09
**Status:** Implemented on branch, **not yet adopted on minisforum** — staged for review + staging validation.
**Scope:** Improvement, not a blocker. Not bundled with feature work.
**Backlog:** [`OPS_BACKLOG.md`](./OPS_BACKLOG.md) → PLATFORM › zero-downtime deploy.

---

## 1. Problem

Every app deploy causes a ~1–2 minute window where live users get **502 Bad Gateway**.

Current deploy:

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets && git checkout clean-main-no-secrets && git pull \
  && docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production up -d --build maia'
```

**Root cause (confirmed 2026-06-09):** `up -d --build maia` recreates the `maia-sovereign`
container. Docker stops the old container and starts the new one; Caddy (`maia-caddy`)
keeps its upstream pointed at the service name and begins dialing the new container
**immediately**, but Next.js needs ~1–2 min to bind `:3000` (heavy consciousness-engine
init, plus the schema-gate entrypoint in `scripts/entrypoint.sh` which runs
`ensure-migrations.sh` before `node server.js`). During that gap Caddy gets
`dial tcp …:3000: connect: connection refused` → returns 502.

There is only **one** app container, so there is nowhere else for Caddy to route.

---

## 2. Options considered

### Option 1 — Compose healthcheck + `up -d --wait` — ❌ insufficient alone
`--wait` blocks the **deployer's shell** until the container reports healthy. It does
**not** hold traffic cutover: the container has `container_name: maia-sovereign`, so a
recreate is a hard stop→start. The old container is already gone while `--wait` waits,
and Caddy is already routing to the booting container. Users still 502. Useful only as
the *health-gate primitive* inside a real solution.

### Option 3 — Readiness gate so Caddy doesn't route until `:3000` answers 200 — ❌ insufficient alone
With a **single** upstream, a failing active health check just converts
"connection refused" into "no healthy upstream" — still a 502. A readiness gate only
helps when there is a *second*, already-healthy upstream to fall back to. That is
Option 2.

### Option 2 — Blue/green: two app containers, cut Caddy over only after readiness — ✅ the only thing that works
This is the recommended direction. Two variants were weighed:

| Variant | Cutover | Caddyfile | Container name | Verdict |
|---|---|---|---|---|
| **Symmetric blue/green** (`…-blue`/`…-green`, alternating) | 1 | untouched (alias = `maia-sovereign`) | **renamed** → breaks `docker exec/logs/inspect maia-sovereign` across ~12 admin scripts + CLAUDE.md/memory diagnostics | rejected (blast radius) |
| **Floating Docker network alias** (`maia-app`), no Caddy edit | per-deploy alias surgery | minimal sed | preserved | rejected — Docker has no "remove alias"; per-deploy disconnect/reconnect on 2 networks is fiddly + racy. Recurring risk worse than a one-time reviewed change. |
| **Health-gated standby + Caddy graceful reload** ⭐ | 2 (atomic) | one-time scoped import refactor (validated) | **preserved** | **recommended** |

---

## 3. Recommendation — health-gated standby + Caddy graceful reload

The canonical container **keeps its name** (`maia-sovereign`) in steady state, so every
`docker exec maia-sovereign …` admin script keeps working. Cutover is an atomic
`caddy reload` (Caddy drains in-flight requests on reload — never drops a connection).
No Docker network-alias surgery.

```
1. build new image  (maia-sovereign:prod)
2. start transient  maia-sovereign-standby  on the new image
3. health-gate standby on /api/consciousness/health      ← only goes 200 when truly ready
4. point Caddy → standby + `caddy reload`                ← cutover #1 (atomic, zero-drop)
5. recreate canonical maia-sovereign on the new image    ← its 1–2 min boot is now INVISIBLE
6. health-gate canonical
7. point Caddy → canonical + `caddy reload`              ← cutover #2 (atomic, zero-drop)
8. drain keep-alives, stop + remove the standby
```

**Caddy mechanism:** the maia upstream lives in a tiny sibling file
[`upstream-maia.caddy`](../../upstream-maia.caddy) (snippets `maia_app` / `maia_app_stream`)
that the main `Caddyfile` `import`s. The only thing that changes per cutover is the
**upstream address** inside that file (`maia-sovereign:3000` ↔ `maia-sovereign-standby:3000`).
The deploy script rewrites it, runs `caddy validate` (a bad edit can never take Caddy down),
then `caddy reload`.

**Failure behavior is safe by construction:**
- standby never goes healthy → **canonical is never touched**, zero user impact, clean abort.
- canonical never goes healthy after recreate (e.g. pending migration / schema gate) →
  **Caddy stays on the standby**, users keep serving; operator fixes and re-runs.

---

## 4. Files delivered

| File | Change |
|---|---|
| [`scripts/deploy-zero-downtime.sh`](../../scripts/deploy-zero-downtime.sh) | **new** — orchestrator (`deploy` / `status` / `point-canonical` / `cleanup-standby`, `--dry-run`) |
| [`docker-compose.bluegreen.yml`](../../docker-compose.bluegreen.yml) | **new** — `maia-standby` service (`extends` `maia`, name `maia-sovereign-standby`, `profiles: [bluegreen]`) |
| [`upstream-maia.caddy`](../../upstream-maia.caddy) | **new** — floating upstream pointer (the only file rewritten per deploy) |
| `Caddyfile` | `import upstream-maia.caddy` + `soullab.life` / `maia.soullab.life` proxies → `import maia_app[_stream]` |
| `docker-compose.production.yml` | caddy service: mount `./upstream-maia.caddy:/etc/caddy/upstream-maia.caddy:ro` |

**Validated locally:** `caddy validate` → *Valid configuration*; `bash -n` → OK;
`docker compose … --profile bluegreen config` → OK, standby renders as
`maia-sovereign-standby` on `maia-sovereign:prod`, both networks, no published-port
conflict; **without** the profile a normal `up` starts **zero** standby containers.

---

## 5. One-time adoption (on minisforum)

The new base `Caddyfile` `import`s a file that only exists once the new caddy mount is in
place, so caddy must be recreated **once** to pick up both atomically (≈2 s blip across
*all* sites — do it in a low-traffic window):

```bash
# 1. get the files onto minisforum
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git fetch origin clean-main-no-secrets && git checkout clean-main-no-secrets && git pull'

# 2. recreate caddy ONCE — picks up the new mount + the new Caddyfile (import) together
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production up -d caddy'

# 3. verify sites still serve and the pointer is canonical
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && grep reverse_proxy upstream-maia.caddy'   # → maia-sovereign:3000
curl -k https://soullab.life/api/health
```

> ⚠️ Do **not** reload/restart caddy with the new `Caddyfile` *before* the
> `upstream-maia.caddy` mount exists — the `import` would be unresolved. Step 2's
> `up -d caddy` recreate handles both in one shot. (The canonical `maia` app container is
> **not** touched during adoption.)

After adoption, deploy with:

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets && git checkout clean-main-no-secrets && git pull \
  && ./scripts/deploy-zero-downtime.sh deploy'
```

The legacy `up -d --build maia` still works as a fallback (with the old 502 window).

---

## 6. Rollback

- **Mid-deploy, Caddy stuck on standby** (a deploy died): `./scripts/deploy-zero-downtime.sh point-canonical` then `cleanup-standby`.
- **Revert the whole mechanism:** restore the previous `Caddyfile` + `docker-compose.production.yml`, then `up -d caddy`. The app image rollback path (`deploy-production.sh rollback`) is unchanged.

---

## 7. Residual risks / known scope

1. **Subdomains not yet migrated.** This first cut routes only `soullab.life` +
   `maia.soullab.life` through the floating upstream. `:80`, the field subdomains
   (`jondi`/`kelly`/`nathan`), `chart`, `elementalalchemy`, and `loralee` still reference
   `maia-sovereign:3000` directly, so they see a brief blip during step 5's canonical
   recreate — **same as today (no regression)**, just not yet improved. Extending the
   `import` to them is a mechanical follow-up (replace each `reverse_proxy maia-sovereign:3000 {…}`
   with `import maia_app[_stream]`).
2. **nostr write-policy** calls `maia-sovereign:3000` internally → brief unavailability
   during the canonical recreate. Low impact; was already affected by the old 502 window.
3. **Transient double memory** — both app containers run for the ~4–5 min deploy. Confirm
   minisforum headroom (the consciousness engine is heavy).
4. **Two engine boots per deploy** (standby + canonical recreate) ⇒ deploys take ~4–5 min.
   This is the cost of preserving the canonical container name; symmetric blue/green would
   be one boot but renames containers (§2).

---

## 8. Staging validation checklist (run on the Mac Studio parallel stack first)

1. Recreate caddy with the new mount (§5 step 2 against the local stack); confirm caddy
   healthy and sites still serve.
2. `./scripts/deploy-zero-downtime.sh deploy --dry-run` — review the planned actions.
3. Real `deploy` on the local stack while hammering the endpoint in another terminal:
   `while true; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost/api/health; sleep 0.2; done`
   → expect **no 502** for the entire deploy.
4. `./scripts/deploy-zero-downtime.sh status` → canonical live, pointer `maia-sovereign:3000`, no leftover standby.
5. **Abort drill:** make the standby fail readiness (e.g. temporarily break `DATABASE_URL`)
   → confirm clean abort with the canonical untouched.
6. `docker logs maia-caddy` across the deploy → no `connection refused`.

Only after staging passes: adopt on minisforum in a low-traffic window.
