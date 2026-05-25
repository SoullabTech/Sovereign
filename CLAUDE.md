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

- **Date**: 2026-05-24 (evening)
- **Current milestone**: Conversational Phase 2 (prompt influence, default-on, opt-out gate) on branch `feature/conversational-memory-phase2`, awaiting fork resolution + deploy + verification. **Headline framing for the week** (per `docs/architecture/STATE_AND_ROADMAP_2026-05-24.md` §8): *MAIA's memory field has been clarified, bounded, partially operationalized, and protected from premature ontological claims — not completed.* *"All arenas, safe but functional"* directive in effect — discipline reorients from blocking function to guiding it, *and from inflating function to naming it precisely.*
- **Phase 2 commit chain** (currently on `feature/conversational-memory-phase2`; not yet merged to `clean-main-no-secrets` or deployed):
  1. `987b3ff28` — initial Phase 2 (loader extension, block formatter, migration, `[Oracle]` log line). Wired into `app/api/oracle/conversation/route.ts` — **post-audit: that route receives ~zero live traffic; wire was operationally null**.
  2. `5179b162e` — (Kelly) Memory Expansion Plan — 9-layer activation map
  3. `f74ab4204` — (Kelly) wire site correction. Moved Phase 2 to live route `app/api/sovereign/app/maia/list/route.ts` + extracted in FAST tier of `lib/sovereign/maiaService.ts` template literal. Renamed log marker to `[MAIA] conversational-block`. Spec §IX appended documenting the wire-site error + the architectural seam gap (`buildMaiaRuntimeContext` is observer, not orchestrator).
  4. `3ca80a78d` — CORE/DEEP cut. CORE reaches prompt via `buildMaiaWisePrompt` extraction at `lib/sovereign/maiaVoice.ts:884-887`. DEEP `repairedContext` carries the addendum but DEEP prompt builder (`buildComprehensiveVoicePrompt` in `intelligentVoiceAdaptation`) does NOT extract it — prompt injection blocked at DEEP by the addenda-channel divergence documented in `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.B. Observability complete (`PROMPT_BLOCK_CHARS` + `layers.conversational`). The divergence-debt note is the single honest source of truth for what's wired vs. what's not — no second narration on the spec.
- **Coverage after this cut**: FAST + CORE tiers receive Phase 2 in the prompt. DEEP tier carries it in MaiaContext + observability only (not in prompt — see divergence-debt §II.B). Most conversations are FAST/CORE; DEEP fires for explicit-depth requests.
- **Prior session state preserved** (from 2026-05-23):
  - `sem: ok` — semantic memory live
  - `atoms loaded: 8` — atoms surface per turn
  - Default doctrine `0fa544bc4` (Keep = contextual return by default) — unchanged
  - `/maia/orientation` live, all 6 domains quiet, page reports honestly
- **Posture shift (Kelly directive)**: *"yes I want full memory in all arenas in a safe but functional way. No more hardened rules against providing the one thing that makes soulful engagement possible and makes this platform more than a chat bot."* The observation-phase freeze doctrine **remains in force as discipline** (member-marked vs system-inferred, no synthesis, provenance-grounded, no-static-UI-claim-without-verified-state) but is **no longer used to block function**. Each remaining arena (episodic, somatic, field, meta) requires its own Phase 2-equivalent spec following the conversational pattern.
- **Next actions** — refined sequencing (per `docs/architecture/STATE_AND_ROADMAP_2026-05-24.md` §9), in order — **fork → toggle → verify → episodic → cleanup**:
  1. **Resolve Phase 2 fork**:
     - **Option A (preferred — generalizable foundation)**: address `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §V — extract shared `appendAllContextAddenda` helper, fix `buildComprehensiveVoicePrompt` to iterate `MaiaContext` addenda, wire atoms end-to-end. Then merge to `clean-main-no-secrets`, deploy, verify §IV gate across all three tiers.
     - **Option B (scoped FAST+CORE only)**: merge `feature/conversational-memory-phase2` to `clean-main-no-secrets`, deploy, verify `[MAIA] conversational-block { emitted: true, surfacedCount: N, ... }` on `sovereign/app/maia/list` for returning members **across FAST + CORE turns only** — DEEP explicitly excluded from the §IV gate. Acceptable *only* if verification claim explicitly names the FAST+CORE scope.
  2. **Member-facing recall toggle** — `conversational_recall_enabled` opt-out surface. Consent infrastructure, not polish. Ships with (1) regardless of fork outcome.
  3. **Verify production reality** — minisforum-side deploy state, `[MAIA] conversational-block` emission across FAST/CORE (and DEEP only after §V fix). Canonical diagnostic in **Ops diagnostic** below.
  4. **Episodic Phase 2 spec** — and only then. The threshold layer where *"life unfolding"* becomes operationally testable without jumping into field ontology. Follow conversational pattern (Phase 1 observability → Phase 2 prompt influence; locked-answer table; 4-safeguard set; `episodic_recall_enabled DEFAULT TRUE` consent gate).
  5. **Dormant service cleanup** — *after* episodic ships, not before: `QuantumFieldMemory.ts` → rename/gut → `FieldPatternMemoryService.ts` or delete; `ConsciousnessEvolutionService.ts` → `DevelopmentalTrajectoryService.ts` (strip "level increased"); reconcile duplicate `SemanticMemoryService` (consciousness/ vs memory/) — pick one, delete the other.

  **Still held under freeze, not in this sequence**: Coherence/Field layer wire-up (lift conditions per `COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.C unmet); Morphic / Somatic / Achievements (matrix Later with named gates); Pattern Attunement (must emerge downstream of episodic + tact); Tact calibration (sketch only after episodic ships); cross-layer synthesis; any member-facing "field state" / "coherence" / "RFI" / "UFI" surface.
- **Underlying question**: Does cross-session content surfacing, gated by consent and grounded in provenance, produce the felt continuity that makes MAIA more than a chatbot — without crossing into synthesis or interpretive displacement?
- **State of the system (six-category typology, per `docs/architecture/STATE_AND_ROADMAP_2026-05-24.md` §8 + memory `project_six_category_artifact_typology`)** — replaces earlier "honest inventory" framing. Each category is legitimate work; **collapsing 1–5 into 6 is the inflation drift to refuse**:
  - **Cat 1 — Preserved direction** (held, not authorized): 8 directions in `docs/architecture/RELATIONAL_INTELLIGENCE_DIRECTIONS_2026-05-24.md`; 10 held directions in `docs/architecture/PARTICIPATION_WITHOUT_FORECLOSURE_2026-05-24.md` §10; **RFI / UFI** (also documented as anti-drift examples per `SOVEREIGNTY_LAYER_STATE_2026_05_23.md` + `COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md`).
  - **Cat 2 — Canonical primitive** (interface target, no runtime authority): **FIS Field State Primitive** (`docs/canon/FIS_FIELD_STATE_PRIMITIVE.md`); Pattern Primitive; Four-Layer Substitution.
  - **Cat 3 — Built substrate** (service + migration, 0 live callers, preserved under freeze): `EpisodicMemoryService`, `CoherenceFieldService` (per `docs/architecture/MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md`).
  - **Cat 4 — Dormant service** (rename / gut / Later-with-named-gate): `QuantumFieldMemory` (810 LOC, 0 persistence — rename + gut); `MorphicPatternService` (Later — consent + aggregation gate); `SomaticMemoryService` (Later — explicit input source); `AchievementService` (Later — reframe as practice); `ConsciousnessEvolutionService` (Rename → `DevelopmentalTrajectoryService`); `MAIAMemoryArchitecture` (2351 LOC — Observe only); duplicate `SemanticMemoryService` (reconcile).
  - **Cat 5 — Frozen plan** (explicit "does not authorize" language; lift requires Kelly directive): `docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.C; `docs/architecture/MEMORY_EXPANSION_PLAN_2026-05-24.md` §5 — *"full memory field" lives here, not in cat 6.*
  - **Cat 6 — Live runtime authority** (production runtime evidence): atoms loader + `is_breakthrough` schema-bound flag (`crossing_must_be_false` sibling); substrate monitor (`runtime_events`, `deriveStatus` fall-through); Spiral Orientation Cut 2; `memoryHealth.semantic`; contextual return default (`0fa544bc4`); Daily Anchor; field context adapter (flagged); Field Lab + tester gate; Relational Navigation Room; Learning Spine Move 2 reviewer (Loop C).
  - **Cat 6 — branch-only, awaiting deploy + verify**: conversational Phase 2 (FAST + CORE reach prompt; DEEP blocked at `buildComprehensiveVoicePrompt` per `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.B).
  - **Strategic read** (load-bearing, Kelly 2026-05-24): *"You are not behind because RFI/UFI are not built. You are safer because you now know they are not built. That distinction may be the most important outcome of the week."*
- **Important not to collapse**: *declaration is not liveness; built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.* Episodic is the first measurable substrate for continuity claims — the threshold layer where "MAIA remembers a life unfolding" becomes operationally testable rather than architecturally aspirational. Until Episodic ships and stabilizes, resonant-field / coherence talk remains mostly metaphorical architecture language; only after that does it begin having a measurable substrate underneath it.
- **Ops diagnostic**:
  ```bash
  ssh soullab@minisforum 'docker logs maia-sovereign --since 1h 2>&1 | grep -E "MAIA/runtime|atoms loaded|MEMORY_HEALTH|conversational-block"'
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

## Infrastructure (Single Source of Truth)

**⚠️ STOP — READ THIS BEFORE ANY INFRASTRUCTURE ASSUMPTIONS ⚠️**

### What we DO NOT use (NEVER assume these)
- **NOT EC2** — The server is NOT an AWS EC2 instance
- **NOT Nginx** — We use Caddy, NOT Nginx
- **No managed hosting platforms** (Vercel, Netlify, Heroku) — we control deployment
- **No managed databases** (Supabase, PlanetScale, Neon) — PostgreSQL is self-hosted
- **No CDN/proxy middlemen** (Cloudflare) doing MITM on traffic

### What we DO use
- **Production host**: **minisforum** (LAN: `192.168.0.104`), accessed via `ssh soullab@minisforum`. Running Docker + **Caddy** (auto TLS via Let's Encrypt).
- **Public DNS for `soullab.life`** routes to the LAN's public IP → router forwards :443/:80 to minisforum. Mac Studio is **not** in the public traffic path.
- **Domain**: `soullab.life` (apex), `api.soullab.life`, `oldhead.soullab.life`, etc.
- **Reverse proxy**: **Caddy** in Docker container (`maia-caddy`) on minisforum.
- **Database**: Self-hosted PostgreSQL in Docker (`maia-postgres`) on minisforum.
- **Containers**: Docker and docker-compose.

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
- **Deploy command** (run from Mac Studio, executes on minisforum):
  ```bash
  ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
    && git fetch origin clean-main-no-secrets \
    && git checkout clean-main-no-secrets \
    && git pull \
    && docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production up -d --build maia'
  ```
- **Verify after deploy**:
  ```bash
  ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"'
  curl -k https://soullab.life/api/health
  ```
  `Created` must show a timestamp under a minute old, and `/api/health` must return fresh JSON with `uptime` near zero.
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
