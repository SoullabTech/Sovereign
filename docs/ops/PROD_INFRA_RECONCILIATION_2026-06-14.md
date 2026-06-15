# Production Infra Config — brought under source control (2026-06-14)

This reconciles production's live `Caddyfile` and `docker-compose.production.yml` into the repo, removing the "hidden server state" condition that turned the #451 deploy into a reconciliation. **Goal: prod config == repo config**, so future deploys need no backup/restore of server-only files.

## What was reconciled

### Caddyfile — Palisades Handyman routing
Prod had a canonical-domain swap + container rename that was never committed. Brought into source, **with the security posture restored**:
- `jlmasterhandyman.com` is canonical → reverse-proxies `palisades-handyman:4321` (was `palisades:4321`).
- `jeremy.soullab.life` → redirects to `jlmasterhandyman.com`.
- HSTS / X-Frame-Options / X-Content-Type-Options / Referrer-Policy / Permissions-Policy and access logging are kept on the proxied site (prod had dropped these; restored per review).

### docker-compose.production.yml — Postgres bind (parameterized)
Prod published Postgres on minisforum's Tailscale IP for the Hetzner standby's streaming replication. Brought into source as a **parameter**, not a hardcoded IP:
```yaml
ports:
  - "${POSTGRES_BIND:-127.0.0.1}:5432:5432"
```
- Default `127.0.0.1` — a missing value never exposes Postgres beyond localhost (fail-safe).
- **Deploy requirement**: set `POSTGRES_BIND=100.119.226.84` in prod's `.env.production` (server-only, not in git). If unset at deploy, Postgres binds localhost-only and the Hetzner standby loses its replication connection.

Clean-main's compose improvements are retained (multilingual `WHISPER__MODEL=base`, `MYTHIC_ATLAS_URL`, `NEXT_PUBLIC_SHOW_BETA_BADGE`) — prod's file was behind on these; this stops that drift.

## Server-side cleanup (ops step, not a code change)
Stale backups on minisforum should be removed (now `.gitignore`d so they can't be committed):
`Caddyfile.bak.2026-02-24-153727`, `Caddyfile.bak.20260601*` (×3), `Caddyfile.deploy-bak.*`, `docker-compose.production.yml.deploy-bak.*`.

## Deploying this PR (when authorized — not now)
1. Ensure `POSTGRES_BIND=100.119.226.84` is in prod `.env.production`.
2. Standard deploy — and because infra now lives in source, **no backup/restore of Caddyfile/compose is needed**; a clean `git checkout` no longer clobbers prod-only state.
3. Verify: handyman site loads, Postgres reachable on the Tailscale IP (standby replication healthy), Caddy clean.

## Why this is the highest-leverage follow-up
It removes the root cause behind the #451 deploy surprise: production was running off a feature branch with uncommitted, server-only infra changes. Once this lands and prod tracks a canonical branch, the fork→superset reconciliation pattern can't silently recur.
