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
- **Representation & Claim Discipline**: `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` — governs every outward claim (web, decks, case studies, podcasts, demos, onboarding, internal planning). Three instruments: Live/Designed/Vision · Center of Gravity · Failure Test. The line: *"We do not tell tomorrow's story as if it were today's."* Applied in `docs/pitch/CASE_STUDY_LIBRARY.md`.
- **Constitutional Direction of Authority**: `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` — the backbone constraint. Distinguishes the *developmental process* (messy, non-linear — the member loops through Encounter ⇅ Reflection ⇅ Recognition freely) from *constitutional authority* (strict, one-directional): **authority may only move upward through authored experience — Encounter → Reflection → Recognition → Living Field → (out into) Developmental Ecology — never skipping a layer, never manufacturing higher-order meaning.** The member may jump around; the system may not. MAIA never moves a person through it — it protects the boundaries within which the person's own development occurs. Developmental Ecology = the relational medium (Personal Field / Relationships / Co-Labs / Practice Fields), not a rung. Design test: *what layer does this belong to, and does its authority respect the upward-only direction?* Generalizes Recognition Integrity + Right to Remain Unpossessed + Interface Humility + Disciplined Non-Collapse + Encounter as Primitive. **Ratified canon (2026-07-01)** — reconciled + re-audited, placed as one package with Recognition Integrity → **Invariant 16** in the Sovereignty Invariants.

## Known recurring traps (read before debugging)

- **Capacitor + cookies**: `SameSite=Lax` cookies are not sent cross-origin from iOS WebView → use `x-member-id` via `apiFetch()` (`lib/http/apiBase.ts`).
- **Static export limits**: some Next.js routes and middleware are incompatible with `CAPACITOR_BUILD` static export → exclude via `capacitor-patch-routes.sh`.
- **"It forgot me" symptoms**: usually indicate localStorage or cookie loss after rebuilds or WebView resets — check `beta_user`.
- **force-dynamic routes**: any route using `export const dynamic = 'force-dynamic'` must be listed in `EXCLUDED_DYNAMIC_ROUTES` for iOS builds.
- **Worktrees + preflight `.env.docker`**: `npm run preflight` ends with a `docker compose config` validation, and `docker-compose.yml` reads `env_file: .env.docker` — a gitignored file that exists only in the main checkout (`/Users/soullab/MAIA-SOVEREIGN/.env.docker`). In any fresh git worktree that step therefore fails with "env file … .env.docker not found" (confirmed 2026-07-27). Fix: `cp /Users/soullab/MAIA-SOVEREIGN/.env.docker <worktree>/.env.docker`. The preflight step itself (`scripts/preflight-compose-config.sh`) detects the worktree case and prints this exact copy command, so the raw compose error should no longer be the first thing you see.
- **LAN IP drift after power-cycle** (housekeeping check, not always user-impacting): minisforum is expected at `192.168.0.104`. After a power outage or full restart, DHCP can re-lease a different IP (seen: `.102` on 2026-05-29). If the router's port-forward rule for 80/443 is hard-coded to `.104`, external traffic will silently drop. **Verify scope before treating as causal**: if the PWA at soullab.life loads on iOS over cellular, the forward path is intact and IP drift is NOT the user-facing issue (the router may auto-track or have a different forward rule). The hairpin-NAT probe (`curl https://soullab.life from minisforum`) is misleading — most consumer routers disable hairpin by default, so HTTP 000 there does not imply external traffic is broken. Always check `ssh soullab@minisforum 'hostname -I'` after a power event for hygiene, and set a DHCP reservation pinning minisforum to `.104` to make the trap structurally impossible.

## Current priority thread (update each session)

- **LATEST — 2026-07-03**: **Daily Anchor member standing-consent gate — shipped + verified LIVE.** Ambient anchor surfacing is now gated by `member_daily_anchors.surface_preference` (default `member_pulled` = private; member opts in to `contextual_doorway`), mirroring the atoms `return_preference` model — eligibility now originates from a member act, not the `MAIA_ANCHOR_CONTEXT_ENABLED` deploy flag (kill-switch only). Migration `20260702000003`; loader gate in `lib/anchor/loadRecentAnchors.ts`; gesture route `POST /api/anchor/[id]/surface-preference`; UI toggle on `app/maia/anchor/history/page.tsx`; refusal **R08**. Verified 2026-07-03 by 6 prod proofs under an authenticated member (schema+ledger, default-private, authenticated opt-in/return, MAIA-follows-consent). **Behavior change in effect:** existing anchors default private until each member opts in. Shipped via PR #542 (gate+UI), unblocked by PR #559 (migration idempotency fix — encounter triggers + team-scope constraints) after the covenant-gates redesign (#561) dissolved the author-self-approval deadlock. Full detail: memory `project_anchor_consent_gate_live`. *Note: the WISDOM_IS_RECOVERED.md canon cited by the original spec does not exist in the repo — grounded instead on SPIRAL_CONTINUITY_ENGINE §7 + atoms model; no new canon authored.*
- **Date**: 2026-05-24 (evening)
- **Current milestone**: Conversational Phase 2 (prompt influence, default-on, opt-out gate) on branch `feature/conversational-memory-phase2`, awaiting fork resolution + deploy + verification. **Headline framing for the week** (per `docs/architecture/STATE_AND_ROADMAP_2026-05-24.md` §8): *MAIA's memory field has been clarified, bounded, partially operationalized, and protected from premature ontological claims — not completed.* *"All arenas, safe but functional"* directive in effect — discipline reorients from blocking function to guiding it, *and from inflating function to naming it precisely.*
- **Phase 2 commit chain** (currently on `feature/conversational-memory-phase2`; not yet merged to `clean-main-no-secrets` or deployed):
  1. `987b3ff28` — initial Phase 2 (loader extension, block formatter, migration, `[Oracle]` log line). Wired into `app/api/oracle/conversation/route.ts` — **post-audit: that route receives ~zero live traffic; wire was operationally null**.
  2. `5179b162e` — (Kelly) Memory Expansion Plan — 9-layer activation map
  3. `f74ab4204` — (Kelly) wire site correction. Moved Phase 2 to live route `app/api/sovereign/app/maia/list/route.ts` + extracted in FAST tier of `lib/sovereign/maiaService.ts` template literal. Renamed log marker to `[MAIA] conversational-block`. Spec §IX appended documenting the wire-site error + the architectural seam gap (`buildMaiaRuntimeContext` is observer, not orchestrator).
  4. `3ca80a78d` — CORE/DEEP cut. CORE reaches prompt via `buildMaiaWisePrompt` extraction at `lib/sovereign/maiaVoice.ts:884-887`. DEEP `repairedContext` carries the addendum but DEEP prompt builder (`buildComprehensiveVoicePrompt` in `intelligentVoiceAdaptation`) does NOT extract it — prompt injection blocked at DEEP by the addenda-channel divergence documented in `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.B. Observability complete (`PROMPT_BLOCK_CHARS` + `layers.conversational`). The divergence-debt note is the single honest source of truth for what's wired vs. what's not — no second narration on the spec.
- **Coverage after this cut**: FAST + CORE tiers receive Phase 2 in the prompt. DEEP tier carries it in MaiaContext + observability only (not in prompt — see divergence-debt §II.B). Most conversations are FAST/CORE; DEEP fires for explicit-depth requests.
- **Breakthrough memory substrate cut (parallel)** — complete on `feature/conversational-memory-phase2`: route `POST/DELETE/GET /api/sovereign/atoms/[id]/breakthrough` (commit `58d374334`) + loader carries `isBreakthrough` + `formatAtomsForPrompt` renders "marked as a breakthrough by the member" + `memoryHealth.breakthrough` wired at the buildMemoryHealth call site in `app/api/sovereign/app/maia/list/route.ts` + discoverable log marker `[MAIA/sovereign] breakthrough surfaced { memberIdPrefix, markedCount }`. UI placement deferred (member gesture not yet wired; first proof via authenticated `curl` or admin SQL). **Stage-language (Kelly directive 2026-05-26, contact-fidelity progression intact)**: column + API exist = Stage 3 reachable; first marked atom surfacing under authenticated load = Stage 4 verified; repeated marked surfacings across multiple turns = Stage 5 live under member use. *Breakthrough memory remains wired/reachable until a member-marked atom surfaces under authenticated load — do not let the first `breakthrough: ok` row inflate into Live.*
- **Prior session state preserved** (from 2026-05-23):
  - `sem: ok` — semantic memory live
  - `atoms loaded: 8` — atoms surface per turn
  - Default doctrine `0fa544bc4` (Keep = contextual return by default) — unchanged
  - `/maia/orientation` live, all 6 domains quiet, page reports honestly
- **Posture shift (Kelly directive)**: *"yes I want full memory in all arenas in a safe but functional way. No more hardened rules against providing the one thing that makes soulful engagement possible and makes this platform more than a chat bot."* The observation-phase freeze doctrine **remains in force as discipline** (member-marked vs system-inferred, no synthesis, provenance-grounded, no-static-UI-claim-without-verified-state) but is **no longer used to block function**. Each remaining arena (episodic, somatic, field, meta) requires its own Phase 2-equivalent spec following the conversational pattern.
- **Next actions** — refined sequencing (per `docs/architecture/STATE_AND_ROADMAP_2026-05-24.md` §9), in order — **fork → toggle → clarify-engagement-shape → verify → episodic → cleanup**:
  1. **Resolve Phase 2 fork**:
     - **Option A (preferred — generalizable foundation)**: address `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §V — extract shared `appendAllContextAddenda` helper, fix `buildComprehensiveVoicePrompt` to iterate `MaiaContext` addenda, wire atoms end-to-end. Then merge to `clean-main-no-secrets`, deploy, verify §IV gate across all three tiers.
     - **Option B (scoped FAST+CORE only)**: merge `feature/conversational-memory-phase2` to `clean-main-no-secrets`, deploy, verify `[MAIA] conversational-block { emitted: true, surfacedCount: N, ... }` on `sovereign/app/maia/list` for returning members **across FAST + CORE turns only** — DEEP explicitly excluded from the §IV gate. Acceptable *only* if verification claim explicitly names the FAST+CORE scope.
  2. **Member-facing recall toggle** — `conversational_recall_enabled` opt-out surface. Consent infrastructure, not polish. Ships with (1) regardless of fork outcome.
  3. **Clarify engagement shape** (per `docs/architecture/CLARIFY_ENGAGEMENT_SHAPE_2026-05-25.md`) — small parallel routing-layer refinement addressing the sacred-mirror edge case where dense unframed technical input produces felt withdrawal. Detection rule (high lexical density + high structural complexity + no explicit question) → clarification response instead of generic holding. Load-bearing principle: *"Sacred mirror should clarify the requested relation to the material, not default to silence or generic holding when the material is structurally asking to be worked."* Contained, reversible, no schema changes. Gate to builder/architect mode initially.
  4. **Verify production reality** — minisforum-side deploy state, `[MAIA] conversational-block` emission across FAST/CORE (and DEEP only after §V fix). Canonical diagnostic in **Ops diagnostic** below.
  5. **Episodic Phase 2 spec** — and only then. The threshold layer where *"life unfolding"* becomes operationally testable without jumping into field ontology. Follow conversational pattern (Phase 1 observability → Phase 2 prompt influence; locked-answer table; 4-safeguard set; `episodic_recall_enabled DEFAULT TRUE` consent gate).
  6. **Dormant service cleanup** — *after* episodic ships, not before: `QuantumFieldMemory.ts` → rename/gut → `FieldPatternMemoryService.ts` or delete; `ConsciousnessEvolutionService.ts` → `DevelopmentalTrajectoryService.ts` (strip "level increased"); reconcile duplicate `SemanticMemoryService` (consciousness/ vs memory/) — pick one, delete the other.

  **Still held under freeze, not in this sequence**: Coherence/Field layer wire-up (lift conditions per `COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.C unmet); Morphic / Somatic / Achievements (matrix Later with named gates); Pattern Attunement (must emerge downstream of episodic + tact); Tact calibration (sketch only after episodic ships); cross-layer synthesis; any member-facing "field state" / "coherence" / "RFI" / "UFI" surface.
- **Underlying question**: Does cross-session content surfacing, gated by consent and grounded in provenance, produce the felt continuity that makes MAIA more than a chatbot — without crossing into synthesis or interpretive displacement?
- **State of the system (six-category typology, per `docs/architecture/STATE_AND_ROADMAP_2026-05-24.md` §8 + memory `project_six_category_artifact_typology`)** — replaces earlier "honest inventory" framing. Each category is legitimate work; **collapsing 1–5 into 6 is the inflation drift to refuse**:
  - **Cat 1 — Preserved direction** (held, not authorized): 8 directions in `docs/architecture/RELATIONAL_INTELLIGENCE_DIRECTIONS_2026-05-24.md`; 10 held directions in `docs/architecture/PARTICIPATION_WITHOUT_FORECLOSURE_2026-05-24.md` §10; **RFI / UFI** (also documented as anti-drift examples per `SOVEREIGNTY_LAYER_STATE_2026_05_23.md` + `COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md`).
  - **Cat 2 — Canonical primitive** (interface target, no runtime authority): **FIS Field State Primitive** (`docs/canon/FIS_FIELD_STATE_PRIMITIVE.md`); Pattern Primitive; Four-Layer Substitution.
  - **Cat 3 — Built substrate** (service + migration, 0 live callers, preserved under freeze): `EpisodicMemoryService`, `CoherenceFieldService` (per `docs/architecture/MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md`).
  - **Cat 4 — Dormant service** (rename / gut / Later-with-named-gate): `QuantumFieldMemory` (810 LOC, 0 persistence — rename + gut); `MorphicPatternService` (Later — consent + aggregation gate); `SomaticMemoryService` (Later — explicit input source); `AchievementService` (Later — reframe as practice); `ConsciousnessEvolutionService` (Rename → `DevelopmentalTrajectoryService`); `MAIAMemoryArchitecture` (2351 LOC — Observe only); duplicate `SemanticMemoryService` (reconcile).
  - **Cat 5 — Frozen plan** (explicit "does not authorize" language; lift requires Kelly directive): `docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.C; `docs/architecture/MEMORY_EXPANSION_PLAN_2026-05-24.md` §5 — *"full memory field" lives here, not in cat 6.*
  - **Cat 6 — Live runtime authority** (production runtime evidence): atoms loader + `is_breakthrough` schema-bound flag (`crossing_must_be_false` sibling); substrate monitor (`runtime_events`, `deriveStatus` fall-through); Spiral Orientation Cut 2; `memoryHealth.semantic`; contextual return default (`0fa544bc4`); Daily Anchor; field context adapter (flagged); Field Lab + tester gate; Relational Navigation Room; Learning Spine Move 2 reviewer (Loop C); **Corpus Callosum substrate** (parallel multi-agent epistemic emission via `agent_runs` / `integration_passes`; 8 voices — MythicAtlas + MaiaVoice + ShadowAgent + Fire/Water/Earth/Air/Aether — firing same-second under production traffic, WisdomRouter ~49% suggests *selective integration emerging operationally, not broadcast synthesis*; default-on via `CORPUS_CALLOSUM_ENABLED !== '0'`; live on `/api/sovereign/app/maia` FAST + CORE — *unknowns preserved*: BETWEEN path zero rows despite routing-invariant set at boundary, DEEP zero rows, member-facing experiential effect unmeasured; per memory `project_corpus_callosum_substrate_cat6`).
  - **Cat 6 — branch-only, awaiting deploy + verify**: conversational Phase 2 (FAST + CORE reach prompt; DEEP blocked at `buildComprehensiveVoicePrompt` per `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.B).
  - **Strategic read** (load-bearing, Kelly 2026-05-24): *"You are not behind because RFI/UFI are not built. You are safer because you now know they are not built. That distinction may be the most important outcome of the week."*
  - **Inverse drift (omission risk, Kelly 2026-05-25)**: dormant scaffolds get narrative placement; live infrastructure stays invisible until explicitly measured. *Symmetric* to inflation drift, opposite direction. Corpus Callosum substrate (2,382 lifetime turns per elemental voice) and atoms `is_breakthrough` flag are both Cat 6 that went unnamed in earlier framings — system description was under-reporting operational reality. Discipline: any substrate generating production rows must be named explicitly; *"we built X when it's Cat 1-5"* is not the only failure mode, *"we didn't see X was Cat 6"* is the other. **Phrasing rule**: name the mechanism (*parallel epistemic emission*), not the mythology (*emergent consciousness architecture*) — metaphor after measurement, not before.
- **Important not to collapse**: *declaration is not liveness; built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.* Episodic is the first measurable substrate for continuity claims — the threshold layer where "MAIA remembers a life unfolding" becomes operationally testable rather than architecturally aspirational. Until Episodic ships and stabilizes, resonant-field / coherence talk remains mostly metaphorical architecture language; only after that does it begin having a measurable substrate underneath it.
- **Ops diagnostic**:
  ```bash
  # Runtime log markers (atoms / memory health / conversational Phase 2):
  ssh soullab@minisforum 'docker logs maia-sovereign --since 1h 2>&1 | grep -E "MAIA/runtime|atoms loaded|MEMORY_HEALTH|conversational-block"'

  # Corpus Callosum substrate (parallel multi-agent emission rows):
  ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c "SELECT origin_route, processing_profile, count(*) FROM agent_runs WHERE created_at > NOW() - INTERVAL '\''24 hours'\'' GROUP BY 1,2 ORDER BY 3 DESC;"'
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
- **Deploy lane lock (one deploy at a time — structural, not disciplinary)**: every deploy entry point (`deploy-production.sh deploy/update/migrate/rollback` and `pre-deploy-gate.sh deploy-maia`) takes an exclusive non-blocking `flock` on `/home/soullab/MAIA-SOVEREIGN/.deploy.lock` via `scripts/deploy-lock.sh`. A second deploy attempt is **refused** with the holder's PID / start time / entry point / commit printed. The kernel lock is inherited by the docker compose build and auto-releases when the whole deploy tree exits or dies — a crashed deploy cannot leave the lane locked. If a refusal shows a dead holder PID, a child of that deploy (usually the build) is still running: inspect with `fuser -v ~/MAIA-SOVEREIGN/.deploy.lock`. **Never delete the lockfile to force entry** — that detaches the kernel lock from future acquirers and re-opens the 2026-07-09 concurrent-deploy race (five processes wedged on the buildkit lock because parallel sessions' deploys could not see each other).
- **Deploy command — quick `maia`-only rebuild** (run from Mac Studio, executes on minisforum). Canonical quick path is the pre-deploy gate, which acquires the deploy-lane lock, **materializes an explicitly named immutable commit into an isolated build context** (never whatever branch is checked out — 2026-07-27 shared-checkout incident, `docs/ops/IMMUTABLE_SHA_DEPLOY.md`), runs the Co-Lab + disk gates, builds, refreshes rollback tags, swaps, then verifies the running container's `GIT_COMMIT` equals the named SHA. **`deploy-maia` now REQUIRES a SHA argument** — name the fetched remote tip so no `git checkout` of the shared working tree is needed:
  ```bash
  ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
    && git fetch origin clean-main-no-secrets \
    && scripts/pre-deploy-gate.sh deploy-maia "$(git rev-parse --short origin/clean-main-no-secrets)"'
  ```
  The SHA is snapshotted via `git archive`, so a concurrent session checking out a different branch cannot change the build (the deploy-lane flock serializes deploys but does NOT protect the checkout→lock interval — that gap is what the snapshot closes). No SHA + `DEPLOY_ALLOW_HEAD=1` builds the current checkout tip as an explicit ack (still snapshotted + announced). Fast, but rebuilds **only** the `maia` service — it does **not** run migrations or touch other services. It DOES refresh the rollback tags (`maia-sovereign:current`/`:previous`/`:<sha>` via shared `scripts/deploy-tag.sh`) before swapping the container.
  **The bare compose command (`GIT_COMMIT=... docker compose ... up -d --build maia`, with or without the prefix) is retired STRUCTURALLY — it now FAILS at build time.** The Dockerfile's deploy-lane tripwire (`docs/ops/DEPLOY_LANE_TOKEN.md`) refuses any build of `docker-compose.production.yml` that didn't come through `acquire_deploy_lock()` (which exports `DEPLOY_LANE_TOKEN`; the compose build-arg has deliberately no default). Why it was retired: (1) without the `GIT_COMMIT` prefix it baked `GIT_COMMIT=unknown` into the image; (2) it bypassed the deploy-lane lock, so it could race a deploy already in flight; (3) on 2026-07-10 it bypassed the pre-deploy gate and skipped rollback tagging, leaving `maia-sovereign:current` pointing at the wrong image. The failure is loud and safe — the build dies in under a second; the running container is untouched. Check which lane built the live container: `docker exec maia-sovereign printenv DEPLOY_LANE` (→ `deploy-lane`; pre-tripwire images lack the variable). Local dev (`docker-compose.yml`) and staging declare their own lane tokens in-file and are unaffected.
- **Full deploy — canonical path**: `scripts/deploy-production.sh deploy <SHA>`. The complete all-services deploy: it acquires the deploy-lane lock, **materializes the named immutable commit into an isolated build context** (same control as the quick path — `docs/ops/IMMUTABLE_SHA_DEPLOY.md`), exports `GIT_COMMIT` (from the asserted SHA) / `APP_VERSION` (read from the snapshot) / `BUILD_DATE`, builds with the provenance build-args from that snapshot, tags images per-commit for rollback, brings the stack up, verifies running provenance, and runs DB migrations (migrations execute from the snapshot too). `deploy` REQUIRES a SHA (or `DEPLOY_ALLOW_HEAD=1` ack); `update` pulls a branch then builds the pulled tip as an immutable snapshot. Use it for schema changes, multi-service changes, or whenever you want a rollback point — i.e. anything beyond a quick `maia`-only code rebuild. **Post-swap provenance verify is fail-closed on every path** (`deploy`, `update`, `deploy-maia`): if the running container does not report the authorized SHA, the deploy ABORTS before migrations/smoke and points at `rollback` — a mismatch never silently proceeds.
- **macOS dev-stack caveat (immutable-SHA build context)**: the deploy materializes the build context as a `git archive` snapshot under `$TMPDIR`, and the `migrate` service bind-mounts that snapshot's `database/migrations`. On **minisforum (Linux, production) this is transparent** — `/tmp` binds into containers freely. On the **Mac Studio parallel stack**, Docker Desktop must be able to share the snapshot path, or the migrate mount fails; if so, set `DEPLOY_CONTEXT_DIR=<a Docker-Desktop-shared path>` before deploying. Production is unaffected. Full detail + the `DEPLOY_CONTEXT_DIR` / `DEPLOY_ALLOW_HEAD` seams: `docs/ops/IMMUTABLE_SHA_DEPLOY.md`.
- **Verify after deploy**:
  ```bash
  # 1. Container freshness
  ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"'

  # 2. LAN IP sanity (must match router port-forward target, expected 192.168.0.104)
  ssh soullab@minisforum 'hostname -I'

  # 3. Public reachability (external path through DNS + router forward)
  curl -k https://soullab.life/api/health

  # 4. Provenance — what commit is actually live (must be the SHA you deployed, NOT "unknown")
  ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
  ```
  `Created` must show a timestamp under a minute old. `hostname -I` must show `192.168.0.104` as the LAN IP; if it shows anything else, the router's port-forward is pointing at a stale IP and external/iOS traffic will silently fail (see the LAN IP drift trap above). `/api/health` must return fresh JSON with `uptime` near zero. `printenv GIT_COMMIT` must return the short SHA you deployed.

  **Diagnostic — `GIT_COMMIT=unknown` does NOT imply missing provenance wiring.** The chain is already complete: Dockerfile (`ENV GIT_COMMIT=${GIT_COMMIT}`) ← compose (`build.args.GIT_COMMIT`) ← deploy (`scripts/deploy-production.sh` exports it; the quick command must prefix it). `unknown` means the deploy route *bypassed* that chain — almost always the quick command run **without** the `GIT_COMMIT=$(git rev-parse --short HEAD)` prefix. So if you see `unknown`, first verify **which deploy path was used** before suspecting the build-arg wiring.
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

**No invite unless `verify-colab-boundaries.ts` passes 31/31 in production.**

Run inside the container on minisforum:
```bash
docker exec maia-sovereign sh -c 'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-colab-boundaries.ts'
```

Pass condition: `31 passed · 0 failed · 0 warned`

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
