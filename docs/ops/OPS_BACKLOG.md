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

## 2026-06-09 — Studio calendar timezone + edit fix — CLOSED

**Shipped:** `ffc4a8c88 fix(studio-calendar): preserve local event time and enable editing` — cherry-picked onto the live `origin/clean-main-no-secrets` tip (clean FF, only `app/studio/calendar/page.tsx` + `app/api/studio/calendar/events/route.ts`), typecheck clean, deployed to minisforum.

**Incident during rollout (resolved):** a ~1–2 min window of `502`s while the app container was replaced/rebooting (Next takes ~1–2 min to bind `:3000` behind consciousness-engine init). Recovered on its own; app stable, `200 OK`, all services healthy. One boot-time DB connect-timeout occurred once and did **not** recur.

**Verification — CLOSED 2026-06-09 (Kelly, production UI):**
1. ✅ Nathan Meeting edited + saved → renders **9:30–10:30 AM** in day grid + Today sidebar. Edit/save + timezone display confirmed.
2. ✅ New event "Follow up" created at **9:00 AM** → displays **9:00 AM** (no −4h shift; verified at 17:48 local). Create path confirmed.
- **Incident CLOSED:** timezone bug resolved, edit capability resolved, deploy verified in production (`ffc4a8c88`). Both criteria directly observed.
- Note (still true): events created *before* this deploy stored at the wrong instant do **not** auto-correct; the edit modal pre-fills the shifted time, so repairing one means re-entering the correct time by hand.

---

## INFRA-OPS — Pin minisforum LAN IP (DHCP reservation)

Current observed LAN IP drifted to `192.168.0.102` (expected `192.168.0.104`).
Add a DHCP reservation on the router to permanently pin the host to the router-forward target.
Goal: make the LAN-IP-drift failure mode structurally impossible.

_Observed not blocking on 2026-06-09 (Caddy was serving real external IPs), so hygiene, not an outage cause._

## CORRECTNESS — `SemanticMemoryService` writes a table that doesn't exist on prod (latent persistence question)

Surfaced 2026-06-10 inside the write-ramp teardown-net verification: `lib/consciousness/memory/SemanticMemoryService.ts` does `INSERT INTO semantic_memories (...)`, but **`semantic_memories` / `semantic_memory_vectors` / `atoms` do not exist on the prod DB** (`information_schema` → 0 rows). That INSERT is a silent no-op — semantic-memory writes via this service are **not being persisted**. Two questions, neither a blocker, neither to lose: (1) is semantic memory persisted *anywhere* on prod, or is this path dead? (2) CLAUDE.md notes a duplicate `SemanticMemoryService` (consciousness/ vs memory/) — the *live* one may target a different existing table. Auth-map / memory-substrate adjacent. Verify before any claim that "semantic memory" is a working layer.

_The kind of real bug that hides inside a ramp-scoping detail._

## PLATFORM — Health-gated / zero-downtime deployment path

Current deploy process (`docker compose ... up -d --build maia`) creates a brief 1–2 minute `502` window during app-container replacement, because Caddy proxies to the new container before Next has bound `:3000`.
Investigate a staged / health-gated deploy (e.g. start new container, wait for `:3000` healthy, then cut over) so deploys are zero-downtime.

> Designed + implemented on branch `feature/zero-downtime-deploy` (2026-06-09) — see that branch's `docs/ops/ZERO_DOWNTIME_DEPLOY_2026-06-09.md`. Kept off this tree to avoid bundling with feature work.

_Improvement, not a blocker. Do not bundle into feature fixes._
