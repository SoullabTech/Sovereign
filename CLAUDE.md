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
- **Sovereignty Invariants**: `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` — relational constitution (constraints on relational power when the system works well enough that people start relating to it)

## Known recurring traps (read before debugging)

- **Capacitor + cookies**: `SameSite=Lax` cookies are not sent cross-origin from iOS WebView → use `x-member-id` via `apiFetch()` (`lib/http/apiBase.ts`).
- **Static export limits**: some Next.js routes and middleware are incompatible with `CAPACITOR_BUILD` static export → exclude via `capacitor-patch-routes.sh`.
- **"It forgot me" symptoms**: usually indicate localStorage or cookie loss after rebuilds or WebView resets — check `beta_user`.
- **force-dynamic routes**: any route using `export const dynamic = 'force-dynamic'` must be listed in `EXCLUDED_DYNAMIC_ROUTES` for iOS builds.

## Current priority thread (update each session)

- **Date**: 2026-03-16 (evening)
- **Current milestone**: 4-phase sequencing confirmed working. Participatory theme detection deployed. Typecheck clean.
- **Last changes** (this session, commits on `main`):
  1. `d0097f39` — **participatory marker expansion**: ~60 natural-language variants added to `THEME_LANGUAGE_MARKERS` across all 6 themes. Ops script (`scripts/check-maia-state.sh`) and email normalization tests committed.
  2. `725216b1` — **typecheck fix**: removed untyped continuity-stack fields from `between/chat` AIN telemetry call. Typecheck now zero errors.
- **AIN shape results** (4-phase sequencing is working):
  - 2h window (330 turns): mirror=70%, bridge=33%, next_step=**30.7%**, pass=**13.6%**
  - Baseline was: bridge=22%, next_step=1%, pass=0.2%
  - Question answered: yes, 4-phase sequencing moved next_step from 1% → 30%
- **Participatory theme signals**: 0 rows after rebuild (expected — new markers not yet exercised). Check again after 24–48h of traffic using `./scripts/check-maia-state.sh`.
- **Next action**: Observe theme signal volume over next 24–48h. Run `./scripts/check-maia-state.sh 48` to evaluate marker expansion impact.
- **Underlying question**: Do expanded participatory markers produce 10–25 signals per 170 turns (vs 1 previously)?
- **State of the system**: All layers live. Container rebuilt with expanded markers. Worktrees pruned (~120 stale removed). 34 commits ahead of origin/main pushed. Typecheck clean.
- **Ops diagnostic**:
  ```bash
  ./scripts/check-maia-state.sh 48   # theme signals + AIN aggregate
  ```

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

**[Claude Code Governance](./docs/canon/CLAUDE_CODE_GOVERNANCE.md)** — Treat Claude Code as executor/diagnostician/patcher, not architect or system memory. Reusable session openers live in `.claude/prompts/`.

## Infrastructure (Single Source of Truth)

**⚠️ STOP — READ THIS BEFORE ANY INFRASTRUCTURE ASSUMPTIONS ⚠️**

### What we DO NOT use (NEVER assume these)
- **NOT EC2** — The server is NOT an AWS EC2 instance
- **NOT Nginx** — We use Caddy, NOT Nginx
- **No managed hosting platforms** (Vercel, Netlify, Heroku) — we control deployment
- **No managed databases** (Supabase, PlanetScale, Neon) — PostgreSQL is self-hosted
- **No CDN/proxy middlemen** (Cloudflare) doing MITM on traffic

### What we DO use
- **Production**: Mac Studio running Docker + **Caddy** (auto TLS via Let's Encrypt)
- **Domain**: `soullab.life` (apex), `api.soullab.life`, `oldhead.soullab.life`, etc.
- **Reverse proxy**: **Caddy** in Docker container (`maia-caddy`)
- **Database**: Self-hosted PostgreSQL in Docker (`maia-postgres`)
- **Containers**: Docker and docker-compose

### Production Stack (Local Mac Studio)
All services run in Docker on the Mac Studio:
- `maia-sovereign` — Main Next.js app (port 3000, Docker-internal only)
- `maia-api` — API backend (port 3001, published)
- `maia-caddy` — Reverse proxy (ports 80/443, published)
- `maia-postgres` — PostgreSQL database
- `maia-comms-worker` — Background worker
- `maia-whisper` — Speech processing
- `maia-rlm` — RLM service

### Check Production Status
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
curl http://localhost/api/health          # via Caddy
curl https://soullab.life/api/health      # external
```

### Production Deployment
- Stack: Docker + Caddy (local Mac Studio)
- Compose file: `docker-compose.production.yml`
- **Deploy command** (local):
  ```bash
  cd ~/MAIA-SOVEREIGN
  git pull
  docker compose -f docker-compose.production.yml up -d --build
  ```
- CI deploys are disabled (self-hosted runner not yet configured)

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

## Before Making Changes

1. Search codebase for existing implementations
2. Run `npm run check:no-supabase` to verify no Supabase violations
3. Run `npm run preflight` for full sovereignty check
4. Run `npm run typecheck` for TypeScript validation (do not run single-file `tsc` - it bypasses path mappings)
5. Test with `npm run smoke` before committing
6. **Sovereignty Invariant Check** — For any feature that touches voice, expression, relational tone, or user-facing behavior, ask:
   - Does this increase user agency?
   - Does this push life outward into the world?
   - Does this reduce the system's psychological centrality over time?
   - If the honest answer to any is no, the feature does not ship. (See `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`)

## Setup (New Clones)

After cloning this repo, run once:
```bash
./scripts/setup-githooks.sh
```

This configures versioned git hooks that enforce sovereignty on every commit.
