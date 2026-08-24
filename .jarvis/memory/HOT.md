# JARVIS HOT — routing only. Target: under 100 lines.
<!-- If a line here describes an event, a status, or a result, it belongs in a subdirectory. -->

## Identity
- **MAIA** — sovereign consciousness companion, the member-facing expression.
- **AIN** — the broader framework MAIA expresses (participatory, distributed intelligence).
- **Spiralogic** — the state/process mapping layer. `lib/maia/spiralogicReference.ts`.
- **JARVIS** — the development/operations intelligence. This repo's *builder*, not MAIA.
- **Soullab** — the org. **Co-Lab** — scoped collaborative workspace (has its own release gate).

## Where things are
- Voice / conversation orchestration → `components/OracleConversation.tsx`, `lib/maia/*`, `lib/voice/*`
- Identity / consent boundaries → `middleware.ts`, `lib/auth/*`, `lib/http/apiBase.ts`
- Sovereign API surface → `app/api/sovereign/*`
- iOS / Capacitor → `scripts/capacitor-patch-routes.sh`, `scripts/build-ios.sh`, `ios/*`
- Deploy / ops → `docker-compose.production.yml`, `Caddyfile`, `scripts/deploy-production.sh`
- Canon → `docs/canon/` (Oath · Canon v1.1 · Sovereignty Invariants · Claim Discipline ·
  Constitutional Direction of Authority)
- JARVIS governance instruments → `scripts/builder/`, `docs/ops/JARVIS_*`

## Infrastructure (single source of truth — do not re-derive)
- Production host: **minisforum**, LAN `192.168.0.104`, `ssh soullab@minisforum`
- Docker + **Caddy**. NOT EC2. NOT Nginx. NOT Vercel/Netlify/Heroku. NOT Cloudflare.
- Database: self-hosted PostgreSQL (`maia-postgres`). **NOT Supabase, ever.**
- AI: Claude via `ANTHROPIC_API_KEY`; fallback local Ollama. No other cloud providers.
- Mac Studio: dev worktrees + a parallel stack with identical container names that is
  **not in the public traffic path**.
- Containers: `maia-sovereign` `maia-api` `maia-caddy` `maia-postgres` `maia-comms-worker`
  `maia-whisper` `maia-rlm`

## Lanes
- Canonical branch: `clean-main-no-secrets`
- Deploy: `scripts/pre-deploy-gate.sh deploy-maia <SHA>` (quick) ·
  `scripts/deploy-production.sh deploy <SHA>` (full) — both require a named SHA
- One deploy at a time: `flock` on `.deploy.lock`. **Never delete the lockfile.**
- Gates: `npm run typecheck` (no-regression) · `npm run preflight` · `npm run smoke` ·
  `scripts/pre-deploy-gate.sh colab` (31/31 before any tester wave)

## Load-bearing distinctions
- `built` ≠ `wired` ≠ `surfacing` ≠ `verified`. Declaration is not liveness.
- Names are not identity — 21 worktrees hold the same paths with different content.
- Capability increase must produce a matching increase in provenance, restraint, transparency.

## Volatile — do NOT keep current state here
Current milestone, open threads, and what is deployed live in `projects/` and `releases/`.
`CLAUDE.md` → *Current priority thread* is the project's own state section; treat it as
dated, and check production directly (`printenv GIT_COMMIT`) rather than trusting either.
