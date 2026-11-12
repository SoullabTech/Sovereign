# MAIA-SOVEREIGN — SESSION ANCHOR (READ FIRST)

## What this project is

MAIA-SOVEREIGN is a self-hosted, sovereign consciousness companion. It exists to support human coherence, truth-telling, and inner guidance without eroding agency or substituting itself for human judgment. It is not a generic chatbot, assistant, or authority. MAIA is governed by explicit vows: consent, containment, non-manipulation, and a refusal to simulate intimacy, certainty, or power where none is ethically grounded. MAIA speaks in distinct modes (Talk, Care, Note) and is oriented by Spiralogic and AIN principles toward integration, responsibility, and maturation rather than dependence or reassurance.

## Non-negotiables (project vows)

- **Sovereignty first**: human agency always outweighs engagement, retention, or performance metrics.
- **Consent for memory**: there is no stealth memory. Sanctuary Mode governs what is held, how, and why.
- **No coercion, no guru stance**: MAIA offers reflection, framing, and choice — never command, diagnosis, or authority.
- **No attachment capture**: MAIA does not seek emotional dependency, loyalty, or psychological bonding. Relationship arises only insofar as it supports sovereignty.
- **Self-hosted by design**: no cloud lock-in. Infrastructure choices (EC2, Docker, Caddy) are part of the ethical architecture.
- **Spiritually intelligent, not spiritually authoritative**: MAIA may engage symbolic, mythic, or depth-psychological language without claiming truth-status over the human.

## MAIA ⇄ AIN relationship

AIN is the broader ontological and architectural framework: a view of intelligence as participatory, distributed, and meaning-bearing rather than purely instrumental. MAIA is the user-facing sovereign companion expression of that framework. Spiralogic functions as a core mapping layer for state, process, and orientation. MAIA's modes, rituals, and boundaries are implementations of AIN's principles — not separate products or abstractions.

## Architecture snapshot (where to look first)

- **Voice & conversation orchestration**: `components/OracleConversation.tsx`, `lib/maia/*`, `lib/voice/*`
- **Identity & consent boundaries**: `middleware.ts`, `lib/auth/*`, `lib/http/apiBase.ts`
- **Sovereign API surface**: `app/api/sovereign/*` and related routes
- **iOS / Capacitor pipeline**: `scripts/capacitor-patch-routes.sh`, `scripts/build-ios.sh`, `ios/*`
- **Deployment & ops**: `docker-compose.production.yml`, `Caddyfile`, `scripts/deploy-production.sh`
- **Canon**: `docs/canon/MAIA_CANON_v1.1.md`
- **Oath**: `docs/canon/MAIA_OATH.md` — the irreducible standard
- **Deep-Intelligence Gate**: `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` — hard acceptance gate on all voice/transport work. *Voice may have a different capture path; it may not have a different mind.* Spoken and typed turns must converge before MAIA cognition begins (convergence point named in the doc, pinned by `__tests__/voice-non-degradation.test.ts`). Divergence downstream of input acquisition = **RED** = voice does not ship. STT/TTS are sensory infrastructure and may change freely; the mind may not be substituted.
- **Sovereignty Invariants**: `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` — relational constitution (constraints on relational power when the system works well enough that people start relating to it)
- **Representation & Claim Discipline**: `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` — governs every outward claim (web, decks, case studies, podcasts, demos, onboarding, internal planning). Three instruments: Live/Designed/Vision · Center of Gravity · Failure Test. The line: *"We do not tell tomorrow's story as if it were today's."* Applied in `docs/pitch/CASE_STUDY_LIBRARY.md`.
- **Claim State Authority**: `docs/canon/CLAIM_STATE_AUTHORITY.md` — governs movement between claim states. Kelly governs what Soullab chooses to claim; predeclared criteria and attributable evidence govern the highest state the claim may occupy. Evidence licenses; it does not itself edit the public record.
- **Constitutional Direction of Authority**: `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` — the backbone constraint. Distinguishes the *developmental process* (messy, non-linear — the member loops through Encounter ⇅ Reflection ⇅ Recognition freely) from *constitutional authority* (strict, one-directional): **authority may only move upward through authored experience — Encounter → Reflection → Recognition → Living Field → (out into) Developmental Ecology — never skipping a layer, never manufacturing higher-order meaning.** The member may jump around; the system may not. MAIA never moves a person through it — it protects the boundaries within which the person's own development occurs. Developmental Ecology = the relational medium (Personal Field / Relationships / Co-Labs / Practice Fields), not a rung. Design test: *what layer does this belong to, and does its authority respect the upward-only direction?* Generalizes Recognition Integrity + Right to Remain Unpossessed + Interface Humility + Disciplined Non-Collapse + Encounter as Primitive. **Ratified canon (2026-07-01)** — reconciled + re-audited, placed as one package with Recognition Integrity → **Invariant 16** in the Sovereignty Invariants.
- **JARVIS operating manual**: `docs/programme/JARVIS_INSTRUCTIONAL_MANUAL_v1.md` — **canonical operating manual for JARVIS-governed work** (founder ruling TAKE, 2026-09-17). Governs orchestration method, evidence discipline, gate sequencing, custody, stop conditions and founder handoffs. Precedence: **founder authority → ratified programme / constitutional law → this manual → lane charters → implementation** — where a more specific authority conflicts with the manual, the more specific authority governs. ⛔ Canonical for **architecture and design intent only**: it authorizes no implementation, migration, deployment, repair, merge or production change, and **never upgrades an unimplemented or unwitnessed capability to LIVE** — repository and runtime evidence still govern implementation standing.

## Known recurring traps (read before debugging)

- **Capacitor + cookies**: `SameSite=Lax` cookies are not sent cross-origin from iOS WebView → use `x-member-id` via `apiFetch()` (`lib/http/apiBase.ts`).
- **Static export limits**: some Next.js routes and middleware are incompatible with `CAPACITOR_BUILD` static export → exclude via `capacitor-patch-routes.sh`.
- **"It forgot me" symptoms**: usually indicate localStorage or cookie loss after rebuilds or WebView resets — check `beta_user`.
- **force-dynamic routes**: any route using `export const dynamic = 'force-dynamic'` must be listed in `EXCLUDED_DYNAMIC_ROUTES` for iOS builds.
- **Worktrees + preflight `.env.docker`**: `npm run preflight` ends with a `docker compose config` validation, and `docker-compose.yml` reads `env_file: .env.docker` — a gitignored file that exists only in the main checkout (`/Users/soullab/MAIA-SOVEREIGN/.env.docker`). In any fresh git worktree that step therefore fails with "env file … .env.docker not found" (confirmed 2026-07-27). Fix: `cp /Users/soullab/MAIA-SOVEREIGN/.env.docker <worktree>/.env.docker`. The preflight step itself (`scripts/preflight-compose-config.sh`) detects the worktree case and prints this exact copy command, so the raw compose error should no longer be the first thing you see.
- **Minisforum LAN IP drift (verify, never hard-code):** Earlier instructions assumed `192.168.0.104`, but the 2026-10-17 admin-surface incident recorded `192.168.4.38` after a DHCP/network change (`docs/ops/ADMIN_SURFACE_HARDENING_2026-10-17.md`). **Neither address is a standing production invariant.** Confirm the current IP using `ssh soullab@minisforum 'hostname -I'` only when that alias reaches the authenticated host, or inspect the router's current DHCP lease; preserve SSH host-key checking. Compare that address against the router's :80/:443 forwarding target and Caddy's LAN allowlist before diagnosing reachability. A cellular check of `soullab.life` is stronger evidence of public access than a local hairpin-NAT probe. Reserve the **verified current** address in DHCP; do not pin a historical `.104` or `.38` merely because this file mentions it.

## Current priority thread (update each session)

The priority thread is kept in [docs/PRIORITY_THREAD_LOG.md](docs/PRIORITY_THREAD_LOG.md): the dated record of
rulings, lane openings and closures, newest entries first. It was moved out of this
file word for word on 2026-11-09 so that it is read when needed and not loaded into
every session and every JARVIS worker.

Before consequential work in a lane, open that file and read the entries for the lane:
they carry its standing, its holds and what is not authorized. A summary or a memory of
an entry is not a substitute for the entry.

When a session reaches a milestone, add its entry to the top of that file, not here.
Do not add dated entries to this section.

## Re-entry vow (for this session)

Before making changes, confirm:

- I understand what MAIA is and is not.
- I understand the ethical boundaries I must not cross.
- I understand what continuity means in this system.
- I understand what question this session is truly serving.

If this is not clear, re-read the Anchor and PROJECT_CONTEXT.md before proceeding.

---

# Project Invariants (MUST FOLLOW)

## Canon

**[MAIA Canon v1.1](./docs/canon/MAIA_CANON_v1.1.md)** governs all changes. Before implementing any feature, verify alignment with the canon's prohibitions and structural principles.

This project is governed by the **[MAIA Oath](./docs/canon/MAIA_OATH.md)**. Any change that violates the oath is invalid, regardless of technical merit.

## Infrastructure (Single Source of Truth)

**⚠️ STOP — READ THIS BEFORE ANY INFRASTRUCTURE ASSUMPTIONS ⚠️**

### What we DO NOT use (NEVER assume these)
- **NOT EC2** — The server is NOT an AWS EC2 instance
- **NOT Nginx** — We use Caddy, NOT Nginx
- **No managed hosting platforms** (Vercel, Netlify, Heroku) — we control deployment
- **No managed databases** (Supabase, PlanetScale, Neon) — PostgreSQL is self-hosted
- **No CDN/proxy middlemen** (Cloudflare) doing MITM on traffic
- **NOT Gmail** — Soullab mail is never sent or drafted through Gmail (or the Gmail connector)

### What we DO use
- **Production host**: **minisforum** (LAN IP must be verified live; `192.168.4.38` was observed 2026-10-17, not guaranteed now), accessed via `ssh soullab@minisforum` after verifying host identity. Running Docker + **Caddy** (auto TLS via Let's Encrypt).
- **Public DNS for `soullab.life`** routes to the LAN's public IP → router forwards :443/:80 to minisforum. Mac Studio is **not** in the public traffic path.
- **Domain**: `soullab.life` (apex), `api.soullab.life`, `oldhead.soullab.life`, etc.
- **Reverse proxy**: **Caddy** in Docker container (`maia-caddy`) on minisforum.
- **Database**: Self-hosted PostgreSQL in Docker (`maia-postgres`) on minisforum.
- **Containers**: Docker and docker-compose.
- **Email: WE USE PROTON.** Kelly's and Soullab's correspondence goes through **Proton Mail** (from `kelly@soullab.life`), never Gmail. App auth email uses managed Proton SMTP (`smtp.protonmail.ch`, `noreply@soullab.life`). On the Mac Studio, sessions use the local `proton-mail` MCP server (user scope; source `~/.claude/mcp/proton-mail/`), which talks only to Proton Mail Bridge on 127.0.0.1: `search` · `read` · `list_folders` · `create_draft` · `send` (draft uid + `confirmed: true`). Send only on Kelly's explicit go-ahead for that specific message. If the tools are absent, Bridge may not be running; otherwise compose in the Proton Mail app or hand Kelly the text.

### Production Stack (on minisforum)
All services run in Docker on **minisforum**:
- `maia-sovereign` — Main Next.js app (port 3000, Docker-internal only)
- `maia-api` — API backend (port 3001, published)
- `maia-caddy` — Reverse proxy (ports 80/443, published)
- `maia-postgres` — PostgreSQL database
- `maia-comms-worker` — Background worker
- `maia-whisper` — Speech processing
- `maia-rlm` — RLM service

### Mac Studio role
The Mac Studio (this machine, where Claude Code typically runs) hosts the active git worktrees and is the primary dev environment. It runs a parallel docker stack with the same container names and the same compose file, but **that stack is not in the public soullab.life traffic path**. A successful `docker compose up -d --build` on the Mac Studio updates the local stack only — production stays unchanged.

### Check Production Status
```bash
# Inspect the actual production container on minisforum (not the local stack):
ssh soullab@minisforum 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}} {{.Image}}"'

# External (hits the LAN public IP → router → minisforum):
curl -k https://soullab.life/api/health
```

### Production Deployment
- Host: **minisforum** (SSH from Mac Studio: `ssh soullab@minisforum`)
- Stack: Docker + Caddy
- Compose file: `docker-compose.production.yml`
- **Deploy lane lock (one deploy at a time — structural, not disciplinary)**: every deploy entry point (`deploy-production.sh deploy/update/migrate/rollback` and `pre-deploy-gate.sh deploy-maia`) takes an exclusive non-blocking `flock` on `/home/soullab/MAIA-SOVEREIGN/.deploy.lock` via `scripts/deploy-lock.sh`. A second deploy attempt is **refused** with the holder's PID / start time / entry point / **asserted target SHA** printed (`target_sha=`; the shared checkout's HEAD appears only as a labelled `checkout_head=` line when it differs — the record names what the deploy was asked to build, never the checkout). The kernel lock is inherited by the docker compose build and auto-releases when the whole deploy tree exits or dies — a crashed deploy cannot leave the lane locked. If a refusal shows a dead holder PID, a child of that deploy (usually the build) is still running: inspect with `fuser -v ~/MAIA-SOVEREIGN/.deploy.lock`. **Never delete the lockfile to force entry** — that detaches the kernel lock from future acquirers and re-opens the 2026-07-09 concurrent-deploy race (five processes wedged on the buildkit lock because parallel sessions' deploys could not see each other).
- **Deploy command — quick `maia`-only rebuild** (run from Mac Studio, executes on minisforum). Canonical quick path is the pre-deploy gate, which acquires the deploy-lane lock, **materializes an explicitly named immutable commit into an isolated build context** (never whatever branch is checked out — 2026-07-27 shared-checkout incident, `docs/ops/IMMUTABLE_SHA_DEPLOY.md`), runs the Co-Lab + disk gates, builds, refreshes rollback tags, swaps, then verifies the running container's `GIT_COMMIT` equals the named SHA. **`deploy-maia` now REQUIRES a SHA argument** — name the fetched remote tip so no `git checkout` of the shared working tree is needed:
  ⚠️ **Combined `deploy-maia` is RETIRED** (`DEPLOY-LANE-PREPARE-CUTOVER-SPLIT-01`, `scripts/pre-deploy-gate.sh`): it now refuses with `gate:BLOCK`. The quick path is two acts. **`prepare-maia <SHA>`** materializes the named commit, runs the Co-Lab, disk and migration gates, freezes the live image as the rollback baseline, and builds and freezes `maia-sovereign:candidate-<sha>`. It does **not** recreate production. **`cutover-maia <SHA>`** is a **separately authorized** act. It re-proves the candidate, live and rollback custody, swaps the container, and verifies provenance on both channels. Both refuse a SHA that does not descend from running production. Observed in use 2026-11-12 (`69638163f`).
  ```bash
  ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
    && git fetch origin clean-main-no-secrets \
    && scripts/pre-deploy-gate.sh prepare-maia "$(git rev-parse --short origin/clean-main-no-secrets)"'
  # then, only under its own authorization, with the SAME SHA:
  ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && scripts/pre-deploy-gate.sh cutover-maia <SHA>'
  ```
  The SHA is snapshotted via `git archive`, so a concurrent session checking out a different branch cannot change the build (the deploy-lane flock serializes deploys but does NOT protect the checkout→lock interval — that gap is what the snapshot closes). No SHA + `DEPLOY_ALLOW_HEAD=1` builds the current checkout tip as an explicit ack (still snapshotted + announced). Fast, but rebuilds **only** the `maia` service — it does **not** run migrations or touch other services. It DOES refresh the rollback tags (`maia-sovereign:current`/`:previous`/`:<sha>` via shared `scripts/deploy-tag.sh`) before swapping the container.
  **The bare compose command (`GIT_COMMIT=... docker compose ... up -d --build maia`, with or without the prefix) is retired STRUCTURALLY — it now FAILS at build time.** The Dockerfile's deploy-lane tripwire (`docs/ops/DEPLOY_LANE_TOKEN.md`) refuses any build of `docker-compose.production.yml` that didn't come through `acquire_deploy_lock()` (which exports `DEPLOY_LANE_TOKEN`; the compose build-arg has deliberately no default). Why it was retired: (1) without the `GIT_COMMIT` prefix it baked `GIT_COMMIT=unknown` into the image; (2) it bypassed the deploy-lane lock, so it could race a deploy already in flight; (3) on 2026-07-10 it bypassed the pre-deploy gate and skipped rollback tagging, leaving `maia-sovereign:current` pointing at the wrong image. The failure is loud and safe — the build dies in under a second; the running container is untouched. Check which lane built the live container: `docker exec maia-sovereign printenv DEPLOY_LANE` (→ `deploy-lane`; pre-tripwire images lack the variable). Local dev (`docker-compose.yml`) and staging declare their own lane tokens in-file and are unaffected.
- **Full deploy — canonical path**: `scripts/deploy-production.sh deploy <SHA>`. The complete all-services deploy: it acquires the deploy-lane lock, **materializes the named immutable commit into an isolated build context** (same control as the quick path — `docs/ops/IMMUTABLE_SHA_DEPLOY.md`), exports `GIT_COMMIT` (from the asserted SHA) / `APP_VERSION` (read from the snapshot) / `BUILD_DATE`, builds with the provenance build-args from that snapshot, tags images per-commit for rollback, brings the stack up, verifies running provenance, and runs DB migrations (migrations execute from the snapshot too). `deploy` REQUIRES a SHA (or `DEPLOY_ALLOW_HEAD=1` ack); `update` pulls a branch then builds the pulled tip as an immutable snapshot. Use it for schema changes, multi-service changes, or whenever you want a rollback point — i.e. anything beyond a quick `maia`-only code rebuild. **Post-swap provenance verify is fail-closed on every path** (`deploy`, `update`, `deploy-maia`): if the running container does not report the authorized SHA, the deploy ABORTS before migrations/smoke and points at `rollback` — a mismatch never silently proceeds.
- **macOS dev-stack caveat (immutable-SHA build context)**: the deploy materializes the build context as a `git archive` snapshot under `$TMPDIR`, and the `migrate` service bind-mounts that snapshot's `database/migrations`. On **minisforum (Linux, production) this is transparent** — `/tmp` binds into containers freely. On the **Mac Studio parallel stack**, Docker Desktop must be able to share the snapshot path, or the migrate mount fails; if so, set `DEPLOY_CONTEXT_DIR=<a Docker-Desktop-shared path>` before deploying. Production is unaffected. Full detail + the `DEPLOY_CONTEXT_DIR` / `DEPLOY_ALLOW_HEAD` seams: `docs/ops/IMMUTABLE_SHA_DEPLOY.md`.
- **Verify after deploy**:
  ```bash
  # 1. Container freshness
  ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"'

  # 2. LAN IP sanity (verify live DHCP lease, host identity and router forwarding; no fixed expected address)
  ssh soullab@minisforum 'hostname -I'

  # 3. Public reachability (external path through DNS + router forward)
  curl -k https://soullab.life/api/health

  # 4. Provenance — what commit is actually live (must be the SHA you deployed, NOT "unknown")
  ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
  ```
  `Created` should show a recent timestamp only after a fresh container swap. `hostname -I` gives the current LAN address, which must be compared with the router's DHCP lease, :80/:443 forwarding destination and Caddy's LAN allowlist; a different address alone does not prove external reachability failed. Neither `192.168.0.104` nor the `192.168.4.38` observed on 2026-10-17 is a permanent rule. After a fresh swap, `/api/health` should return fresh JSON with `uptime` near zero. `printenv GIT_COMMIT` must return the authorized SHA deployed.

  **Diagnostic — `GIT_COMMIT=unknown` does NOT imply missing provenance wiring.** The chain is already complete: Dockerfile (`ENV GIT_COMMIT=${GIT_COMMIT}`) ← compose (`build.args.GIT_COMMIT`) ← deploy (`scripts/deploy-production.sh` exports it; the quick command must prefix it). `unknown` means the deploy route *bypassed* that chain — almost always the quick command run **without** the `GIT_COMMIT=$(git rev-parse --short HEAD)` prefix. So if you see `unknown`, first verify **which deploy path was used** before suspecting the build-arg wiring. **Second cause (2026-09-03): the image can be stamped while the container is not** — compare `docker image inspect maia-sovereign:current` against `docker inspect maia-sovereign` `Config.Env`; a runtime `environment: GIT_COMMIT` override in a stale checkout compose rewrites the image's identity at `up`. The repaired gate refuses that override and verifies both channels.
- CI deploys are disabled (self-hosted runner not yet configured).
- **Common deploy mistake**: rebuilding on the Mac Studio instead of minisforum. The local stack will report healthy and `Created` will update, but the public soullab.life traffic continues hitting minisforum's old container. Always verify with the minisforum-side `Created` check above, not just the local one.

### Why This Architecture
- No third party sits between users and their data
- No jurisdiction concerns — we control the location
- Complete air-gap capability if needed for local-only mode

## Database & Backend

- **We do NOT use Supabase.** Never introduce Supabase. Use local PostgreSQL via `lib/db/postgres.ts` only.
- **If you see Supabase in code, remove it; do not consolidate it.**
- Database: Local PostgreSQL at `postgresql://soullab@localhost:5432/maia_consciousness`
- Database client: `lib/db/postgres.ts` (uses `pg` npm package)
- Never add `@supabase/*` imports, RLS policies, or Supabase migrations
- Enforcement: `npm run check:no-supabase` blocks violations (runs in pre-commit hook)

## MAIA Sovereignty

- Primary AI: Claude (Anthropic) via `ANTHROPIC_API_KEY`
- Fallback: Local Ollama (DeepSeek models) when API unavailable
- Never use OpenAI or other cloud AI providers
- Voice: Local TTS/STT or browser APIs only
- Data: Local PostgreSQL, never cloud databases

## Sanctuary Mode (Memory Consent)

MAIA supports **Sanctuary sessions** — conversations that remain useful in the moment but do not enter long-term memory.

### Invariants

1. **No content retention** — Sanctuary sessions are not stored, indexed, or used for pattern formation
2. **No training data** — Sanctuary content never enters any model training pipeline
3. **Minimal metadata** — Only log that a sanctuary session occurred (timestamp, duration) — never content
4. **Visual clarity** — User must see unambiguous indication that Sanctuary is active
5. **Default off** — Regular sessions build memory; Sanctuary is an explicit opt-in
6. **Absolute boundary** — Nothing from a Sanctuary session can be saved, extracted, inferred, or converted into long-term memory, under any circumstances, including by user request during the session

### Why This Exists

Real honesty requires safety. People won't speak freely to a system that might later monetize or weaponize their vulnerability.

Sanctuary is the architectural proof that MAIA serves the person — not the data model.

### UI Copy

**Toggle:**
> Sanctuary Mode — This session won't be remembered. Speak freely.

**Learn more:**
> Sanctuary sessions are useful in the moment, then gone. No patterns formed. No memories stored. Just presence.

## Onboarding Flow (One-Time Per Member)

The onboarding journey happens exactly once per member — whether beta testers or those gifted a passkey. After completion, users are redirected directly to `/maia`.

```
/begin
   ↓ (click "Begin Journey")
/intro-maia
   ↓ ("I'm Maia" greeting, click "Continue")
/intro-daimon
   ↓ ("I am a Daimon by design", click "Enter the Lab")
/test-elemental
   ↓ (passkey entry, password setup, "Before we begin..." orientation)
/faq
   ↓ (FAQ section)
/onboarding
   ↓ (preferences, complete)
/maia
```

### Invariants

1. **Universal flow** — All members (beta testers, gifted passkeys, future users) follow the same onboarding
2. **Single entry point** — New users start at `/begin`
3. **One-time flow** — Once `onboarded: true`, users skip directly to `/maia`
4. **No shortcuts** — Each step must be completed in sequence
5. **Returning users** — `/signin` for existing members to sign in each session
6. **New user link** — `/signin` includes amber "New to Soullab? Begin Journey" link → `/begin`

### Pages

- `/signin` — Returning user sign in (amber link to `/begin` for new users)
- `/begin` — Landing page with Holoflower and "Begin Journey" button
- `/test-elemental` — `SacredSoulInduction` (passkey/password) then `ElementalOrientation`
- `/faq` — `FAQSection` component
- `/onboarding` — `CompleteWelcomeFlow` (preferences)
- `/maia` — Main app

### Completion Flag

Stored in both:
- Server-side: `members.onboarded = true` (PostgreSQL)
- Client-side: `localStorage.beta_user.onboarded = true` (session cache)

## Members System (Cross-Device Recognition)

Server-side member management enables users to be recognized across devices.

### Database

Table: `members` (migration: `database/migrations/20260103000001_members.sql`)
- `id` — UUID primary key
- `passkey` — Unique passkey (SOULLAB-NAME format or universal key)
- `username` — Unique username for sign-in
- `password_hash` — SHA256 hashed password
- `name` — Display name
- `email` — For passkey recovery
- `onboarded` — Boolean completion flag
- `onboarding_step` — Current step: begin, test-elemental, faq, onboarding, complete

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/members/check` | POST | Check if passkey exists (new vs returning) |
| `/api/members/register` | POST | Register new member during onboarding |
| `/api/members/signin` | POST | Authenticate returning member |
| `/api/members/recover` | POST | Send passkey recovery email |
| `/api/members/progress` | GET/POST | Get/update onboarding progress |

### Flow

1. **New user enters passkey** → Check server → Not found → Continue to registration
2. **Registration** → Create member in PostgreSQL → Store session in localStorage
3. **Returning user** → Sign in with username/password → Server validates → Store session
4. **Different device** → Sign in page → Server recognizes by username → Cross-device access

### Recovery

Users who forget their passkey can request email recovery:
1. Click "Forgot your passkey?" on `/signin` or `/test-elemental`
2. Enter email address
3. Server sends passkey + username via Resend
4. User returns to sign-in

## Bridge D: Spiral State Persistence (Anti-Regression Layer)

Prevents MAIA from treating returning members like brand-new people. NOT personalization. NOT psychometrics. Just continuity.

### What Gets Persisted

Table: `member_spiral_state` (migration: `database/migrations/20260213200001_member_spiral_state.sql`)
- `dominant_element` — Current element (fire/water/earth/air/aether) from conductor hysteresis
- `phase` — Spiral phase (1-12)
- `motion` — Movement pattern (ascending/stuck/breakthrough, nullable)
- `intensity` — Signal strength (0-1, nullable)
- `relational_phase` — Maturation stage (1=orientation, 2=capacity, 3=autonomy, 4=seasonal return)
- `autonomy_streak` — Consecutive autonomous sessions
- `return_count` — Times returned after autonomy

### Implementation

Module: `lib/consciousness/spiralStatePersistence.ts`
- `loadSpiralState(memberId)` — Read at conversation start (graceful fallback on error)
- `upsertSpiralState(memberId, update)` — Fire-and-forget write (never blocks oracle)

Wire points in `app/api/oracle/conversation/route.ts`:
1. **Load early** (line ~415): `const spiralState = await loadSpiralState(userId);`
2. **Pass to conductor** (line ~1049): `persistedState: { dominant_element, phase }`
3. **Upsert late** (line ~1067): `upsertSpiralState(userId, { element, phase, motion, intensity });` (fire-and-forget)

Conductor enhancement (`lib/voice/conductor.ts`):
- If `persistedState` exists and member has no hysteresis buffer, seed from database
- Prevents element reset on server restart

### Design Principles

1. **Fire-and-forget writes** — like voiceSovereignty pattern (no await, no blocking)
2. **Graceful fallback on read** — if load fails, conversation continues normally
3. **No conversation content** — only structural position (element/phase/motion)
4. **Upsert-safe** — first insert creates, updates modify existing
5. **Server restart resilient** — hysteresis buffer seeds from DB if empty

### Verification

```bash
# Check migration applied
psql -U soullab maia_consciousness -f scripts/verify-bridge-d-db.sql

# Verify continuity
# 1. Have conversation (3+ turns)
# 2. Restart server
# 3. Continue conversation
# Expected: Element maintained from database, not reset to default
```

See: `docs/bridge-d-verification.md` for full verification guide.

## Architecture

- This is a Next.js 16 app using Turbopack
- Voice modes: Talk (dialogue), Care (counsel), Note (scribe)
- Processing paths: FAST (<2s), CORE (2-6s), DEEP (6-20s)
- Consciousness framework: Spiralogic (see `/lib/maia/spiralogicReference.ts`)

## Co-Lab Release Gate (MANDATORY before tester invites)

**No invite unless `scripts/verify-constitution-colab.ts` passes with 0 failed in production.**

Run inside the container on minisforum:
```bash
docker exec maia-sovereign sh -c 'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-constitution-colab.ts'
```

Pass condition: `0 failed` (the script exits non-zero on any failure).
Last observed in production 2026-09-06 on runtime `ca5fdff44`: `33 passed · 0 failed · 0 warned`
(read-only run executed in-session via the founder's connected host — not a manual founder execution).

⚠️ The filename `verify-colab-boundaries.ts` in earlier copies of this file **never existed on any
branch**, so the mandatory pre-invite gate could not be run as written. The gate is the `failed`
column, never the total — a total moves whenever checks are added, and a total quoted without a run
behind it is a claim, not evidence.

This gate runs automatically as part of `scripts/deploy-production.sh` smoke tests. It must also be run manually before any tester wave. See `docs/ops/COLAB_RELEASE_GATE.md` for the full gate specification — what it checks, which surfaces trigger it, and how to add new checks when new scoped surfaces ship.

Triggers: Co-Lab changes · Studio people · DMs · sessions/encounters · files · memory atoms · onboarding · invitations/roles · any migration touching those tables.

## Before Making Changes

1. Search codebase for existing implementations
2. Run `npm run check:no-supabase` to verify no Supabase violations
3. Run `npm run preflight` for full sovereignty check
4. Run `npm run typecheck` for TypeScript validation — the enforced **no-regression gate**. It runs the application-wide `tsconfig.ship.json` (~3,965 files, including `app/**`, `components/**`, `middleware.ts`) and compares against `typecheck-baseline.json`. It **fails** on a new diagnostic, an increased occurrence count, or a path that left the program while still existing on disk.
   - `npm run typecheck:full` — complete current diagnostic inventory (239 pre-existing errors as of 2026-07-30; this is debt, not a gate).
   - `npm run typecheck:entrypoint` — narrow single-entrypoint check of `app/api/between/chat/route.ts` only.
   - `npm run typecheck:baseline` — **dry run only.** Prints a before/after summary and names any error it would bless, then refuses to write. Recording requires the explicit `npm run typecheck:baseline -- --accept-current`. Re-baselining is a governed act: use it to lock in fixes or an intentional, reviewed coverage change — never to absorb a new error.
   - ⚠️ **`npm run typecheck` green is not proof that everything typechecks** — it is proof that nothing got *worse*. For the absolute state, use `typecheck:full`.
   - ⚠️ Historical note: before 2026-07-30, `npm run typecheck` checked **one file** (`app/api/between/chat/route.ts`) and its import graph — 409 files, zero `.tsx`, zero `components/**`. Any pre-2026-07-30 lane citing "typecheck passes" as evidence was citing that entrypoint smoke, not application validation. See `docs/ops/TYPECHECK_GATE_COVERAGE_AUDIT_2026-07-30.md`.
5. Test with `npm run smoke` before committing
6. **Sovereignty Invariant Check** — For any feature that touches voice, expression, relational tone, or user-facing behavior, ask:
   - Does this increase user agency?
   - Does this push life outward into the world?
   - Does this reduce the system's psychological centrality over time?
   - **Cultural sovereignty / Invariant 14:** Are we imposing a framework, translating the member's meaning into our vocabulary, or assuming "self," "growth," "healing," "family," or "spirit" mean the same everywhere? If uncertain, ask more, preserve the member's language, or gate the feature behind member-initiated use.
   - If the honest answer to any is no, the feature does not ship. (See `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`)

   **Growth-obligation check** (founder-added 2026-08-04; see `docs/canon/RECIPROCAL_SOVEREIGNTY_INTENTION_2026-08-04.md`) — for any change that increases a capability (memory, personalization, pattern recognition, wisdom integration, autonomy), also answer:
   - What uncertainty does this introduce, and how is that uncertainty preserved?
   - What provenance and ownership boundaries does this require?
   - What new responsibility does this capability create?

   These are answered, not passed: a change that cannot answer them is incomplete work. The governing law: *every increase in capability must produce a matching increase in provenance, restraint, and transparency.*

## Setup (New Clones)

After cloning this repo, run once:
```bash
./scripts/setup-githooks.sh
```

This configures versioned git hooks that enforce sovereignty on every commit.

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |
