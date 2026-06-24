# Production Drift — Reconciliation (Phase 1: Understand)

- **Date**: 2026-06-14
- **Trigger**: #446 (Sanctuary fix) deploy aborted — `git checkout clean-main` refused to overwrite local infra changes on minisforum.
- **Reframe (Kelly)**: this is a **configuration-management problem**, not a deployment problem. #446 *exposed* it; it did not create it. Reconcile topology before releasing. *"Increased access creates increased responsibility."*
- **Status**: Phase 1 complete (read-only investigation). Phases 2–3 require decisions (below). **Nothing on prod has been changed.**

## What production actually is

| Fact | Value |
|---|---|
| Checked-out branch | **`fix/studio-calendar-timezone-edit`** @ `60a3769fb` — **not** `clean-main-no-secrets` |
| Divergence | prod-branch is **8 ahead / 102 behind** clean-main (`bd40ef104`) |
| Running container | built **2026-06-13 15:19Z**, `GIT_COMMIT=unknown` (build-arg unwired — known issue) |
| Uncommitted, box-only | `docker-compose.production.yml`, `Caddyfile` (+ 4 untracked `Caddyfile.bak.*`) |

**How it got here (reflog, 2026-06-13): deliberate, not accidental.** On 06-13 someone cherry-picked the self-hosted monitoring dashboard, the monitoring expansion, and the `/status` page onto the prod checkout, then `checkout`'d `fix/studio-calendar-timezone-edit` and fast-forwarded to `60a3769fb`. Production was *intentionally* placed on this branch to run those features.

## Drift #1 — prod runs 8 commits that clean-main lacks (the load-bearing one)

These are **live in prod, absent from clean-main**:
```
60a3769fb fix(partner-view): partnerSlugs on MasterField + kelly/nathan
44bd76e5c feat(admin): CTO operations dashboard + independent monitor script
33044bedf feat(status): MAIAUptime public status page at /status
119aa6002 feat(monitoring): expand dashboard + voice health
c0d59be2a feat(admin): self-hosted system monitoring dashboard
c652f095b feat(admin): role-based admin auth + password UX
90bcce4de feat: video room URL in settings + Open Video Call
e58b3107a fix: seed vault dir 0777 (userns-remapped containers)
```
**Consequence:** a bare `checkout clean-main` would **regress all eight** live features. Classification: **system state** — must be reconciled *into* clean-main before any switch (PR/merge, or confirm they already exist there under different SHAs).

## Drift #2 — `docker-compose.production.yml`: Postgres bound to Tailscale

```diff
   maia-postgres (pgvector/pgvector:pg16)
+    ports:
+      - "100.119.226.84:5432:5432"
```
**Why:** exposes Postgres on minisforum's **Tailscale IP** for the **Hetzner standby streaming replication**. **Classification: machine-specific** — `100.119.226.84` is minisforum's tailnet IP; committing it verbatim to the shared branch would break any other host. **Do NOT commit as-is.** Options: (a) parameterize — `- "${POSTGRES_TAILSCALE_BIND:-127.0.0.1}:5432:5432"` via `.env.production`; (b) a committed-and-documented `docker-compose.override.yml` on the prod box. Recommend (a).

## Drift #3 — `Caddyfile`: Palisades Handyman routing

Swaps the canonical domain (now `jlmasterhandyman.com` canonical; `jeremy.soullab.life` 301-redirects to it) and renames the upstream container `palisades` → `palisades-handyman`. Authored ~2026-06-01 (`Caddyfile.bak.jeremy.20260601152428` — Jeremy involved). **Classification: system state** (general routing, not machine-bound) — belongs in clean-main's `Caddyfile`. Verify the `palisades-handyman` service/container name is what's actually running before committing.

**Untracked cruft:** 4 `Caddyfile.bak.*` (2026-02-24, 2026-06-01) — manual backups; remove or gitignore.

## Phase 2 — bring it under source control (server state → system state)

1. **Reconcile the 8 commits into clean-main** — cherry-pick/PR them (or confirm equivalents already present). *This is the gating step; without it, clean-main is not a superset of prod and the switch regresses.*
2. **Caddyfile** → commit the handyman routing change to clean-main (after confirming `palisades-handyman` is live).
3. **Postgres Tailscale bind** → parameterize via env (keeps the shared compose host-agnostic; replication preserved).
4. **`.bak` files** → gitignore/remove.
5. Wire `GIT_COMMIT` build-arg so future containers are commit-identifiable (separate, known fix).

## Phase 3 — deliberate release (only after Phase 2)

Deploy clean-main as one intentional release = #446 + the 8 reconciled commits + the 101 others (Portal `/home` #439, scheduling, etc.). In a window, verify in order: **(1)** replication survives (Postgres still bound to Tailscale), **(2)** Caddy routing intact (soullab.life + jlmasterhandyman.com), **(3)** the **#446 runtime gate** — sanctuary turn → 0 `maia_turns` / 0 `expansion_events` / 0 relational signals / 0 atoms / no raw-text Sentry.

## Decisions needed (Kelly)

- **The 8 commits:** PR them into clean-main, or are equivalents already there? (Determines whether the switch is safe.)
- **Postgres bind:** parameterize (recommended) vs. committed override file.
- **Caddy/handyman change:** commit as-is to clean-main? (Confirm container name.)
- **Urgency:** is the Sanctuary leak a present risk (members actively in Sanctuary now) → tactical patch B accepted; or days-scale → fix topology first (this plan).
