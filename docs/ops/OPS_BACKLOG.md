# Ops Backlog

Small, non-blocking operational improvements + standing deployment invariants.

---

## Deployment Invariants (standing — read before adding flags or deploying)

### `NEXT_PUBLIC_*` feature flags are compile-time, not runtime

In Next.js, `NEXT_PUBLIC_*` values are **inlined at `next build`** — not read at container runtime. Because the app builds **inside** the Docker image, a new public flag is silently baked to its **default** unless it is threaded into the build. Setting it only in `.env.production` (an `env_file` = runtime-only) has **no effect** on an already-built image.

Adding a new `NEXT_PUBLIC_*` flag requires **all** of:
1. `Dockerfile` (builder stage, before `npm run build`): `ARG NEXT_PUBLIC_FOO=<default>`
2. `Dockerfile`: `ENV NEXT_PUBLIC_FOO=${NEXT_PUBLIC_FOO}`
3. `docker-compose.production.yml` → `x-maia-build` build `args:`: `NEXT_PUBLIC_FOO: ${NEXT_PUBLIC_FOO:-<default>}`
4. `.env.production`: the actual value
5. Rebuild (`up -d --build`) — flipping the var without a rebuild does nothing

**Precedent already wired this way:** `NEXT_PUBLIC_ENABLE_EXPLAINER_SCRIPTS` (see `Dockerfile` builder stage).
**Symptom when missed:** flag set in env + rebuilt, yet the feature stays at its default in the browser.

---

## INFRA-OPS — Pin minisforum LAN IP (DHCP reservation)

Current observed LAN IP drifted to `192.168.0.102` (expected `192.168.0.104`).
Add a DHCP reservation on the router to permanently pin the host to the router-forward target.
Goal: make the LAN-IP-drift failure mode structurally impossible.

_Observed not blocking on 2026-06-09 (Caddy was serving real external IPs), so hygiene, not an outage cause._

## PLATFORM — Health-gated / zero-downtime deployment path

Current deploy process (`docker compose ... up -d --build maia`) creates a brief 1–2 minute `502` window during app-container replacement, because Caddy proxies to the new container before Next has bound `:3000`.

**Status — 🟡 designed + implemented, staged for validation (2026-06-09).**
Full design + concrete patch: [`ZERO_DOWNTIME_DEPLOY_2026-06-09.md`](./ZERO_DOWNTIME_DEPLOY_2026-06-09.md).
Approach: a health-gated transient standby (`maia-sovereign-standby`) + atomic `caddy reload`
between a floating upstream pointer (`upstream-maia.caddy`) — the canonical `maia-sovereign`
container name is preserved (so every `docker exec maia-sovereign …` admin script keeps working).
Why not the simpler options: `--wait` only blocks the deployer's shell, and an active health
check on a *single* upstream still 502s — see the doc's option table.

- New files: `scripts/deploy-zero-downtime.sh`, `docker-compose.bluegreen.yml`, `upstream-maia.caddy`.
- Touched: `Caddyfile` (scoped to `soullab.life` + `maia.soullab.life`), `docker-compose.production.yml` (caddy mount).
- Validated locally (`caddy validate`, `compose config`, `bash -n`). **Next:** staging dry-run on the Mac Studio stack → low-traffic adoption on minisforum (one-time ~2 s caddy recreate; see doc §5).

**Follow-up (🔴):** extend the floating upstream to the remaining maia subdomains
(`:80`, `jondi`/`kelly`/`nathan`, `chart`, `elementalalchemy`, `loralee`) + the nostr
write-policy's internal `maia-sovereign:3000` call — they still see a brief blip during the
canonical recreate (same as today; no regression). Mechanical: swap each
`reverse_proxy maia-sovereign:3000 {…}` for `import maia_app[_stream]`.

_Improvement, not a blocker. Do not bundle into feature fixes._
