# MAIA System Architecture
## Technical Blueprint for Sovereign Relational Intelligence

**Classification:** Technical Reference — Collaborators and Institutional Partners
**Date:** March 2026
**Version:** 1.0

---

## 1. What This Document Is

This blueprint describes the technical architecture of the MAIA platform in terms sufficient for:

- Engineering collaborators evaluating the system
- Institutional partners assessing deployment feasibility
- Clinical or therapeutic organizations evaluating governance and safety
- AI researchers studying sovereignty-respecting system design

It is not a complete API reference. It is an architectural map: how the system is structured, why each decision was made, and how the parts fit together toward the platform's stated mission.

---

## 2. System Overview

MAIA is a **multi-layer relational intelligence platform** built on a self-hosted, privacy-first infrastructure. It combines:

- A **voice-native conversation engine** with depth-adaptive routing
- A **persistent consciousness model** tracking member state across sessions
- A **practitioner operating system** for professional case and session management
- A **symbolic knowledge library** spanning multiple wisdom traditions
- A **collective intelligence layer** for consent-gated community sensemaking

The entire system runs on self-hosted infrastructure (Docker + Caddy on a local Mac Studio in current production). No user data transits managed cloud services. No third party sits between users and their data.

---

## 3. Infrastructure Architecture

### 3.1 Production Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Mac Studio Host                       │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  maia-   │  │  maia-   │  │  maia-   │              │
│  │  caddy   │  │sovereign │  │   api    │              │
│  │ :80/:443 │  │  :3000   │  │  :3001   │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │                    │
│  ┌────▼──────────────▼──────────────▼────┐              │
│  │           Docker bridge network        │              │
│  └────────────────────┬──────────────────┘              │
│                        │                                 │
│  ┌─────────────────────▼───────────────────────────┐   │
│  │              maia-postgres (:5432)               │   │
│  │         Self-hosted PostgreSQL database          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Supporting services:                                   │
│  ├── maia-whisper      (speech processing)              │
│  ├── maia-rlm          (relational logic module)        │
│  └── maia-comms-worker (background tasks)               │
└─────────────────────────────────────────────────────────┘
```

**Key architectural decision:** Caddy handles TLS termination with automatic Let's Encrypt certificate management. No Nginx. No managed proxy. The domain `soullab.life` resolves directly to the Mac Studio's public IP.

**Why self-hosted:** Sovereignty is not a policy position — it is a technical guarantee. When data never leaves the host machine, no terms-of-service change, acquisition, or legal demand can retroactively compromise user privacy. The architecture enforces what the ethics require.

### 3.2 Domain Architecture

| Domain | Service | Purpose |
|--------|---------|---------|
| `soullab.life` | maia-sovereign | Main application |
| `api.soullab.life` | maia-api | API backend |
| `oldhead.soullab.life` | legacy | Legacy redirect |

### 3.3 Deployment Model

Deployment is deliberate and manual:

```bash
cd ~/MAIA-SOVEREIGN
git pull
docker compose -f docker-compose.production.yml up -d --build maia
```

CI/CD is intentionally deferred. The self-hosted runner pattern will be implemented when the deployment volume warrants it. Until then, human review precedes every production change.

---

## 4. Application Architecture

### 4.1 Framework

- **Next.js 16** with Turbopack (App Router)
- **TypeScript** throughout
- **PostgreSQL** via `pg` npm package (no ORM, direct SQL)
- **No Supabase, no managed database services**

The codebase enforces this via `npm run check:no-supabase` (pre-commit hook).

### 4.2 Request Flow

```
Client (browser / iOS WebView / Capacitor)
         │
         ▼
   Caddy (TLS termination)
         │
         ▼
   Next.js App Router
         │
    ┌────┴─────────────────────────────────┐
    │                                       │
    ▼                                       ▼
Route handlers                      API routes
(pages, layouts)              (app/api/**/ route.ts)
                                           │
                              ┌────────────┼────────────┐
                              │            │            │
                              ▼            ▼            ▼
                         lib/maia/    lib/voice/   lib/db/
                         (oracle)    (conductor)  (postgres)
```

### 4.3 iOS / Mobile

The application is also deployed as an iOS app via Capacitor:

- Static export built for native WebView (`CAPACITOR_BUILD=true`)
- Dynamic routes excluded via `capacitor-patch-routes.sh`
- Authentication uses `x-member-id` header (not cookies, which are blocked cross-origin in iOS WebView)
- `apiFetch()` in `lib/http/apiBase.ts` handles the header injection transparently

---

## 5. AI Model Orchestration

### 5.1 Primary Intelligence Layer

**Primary model:** Claude (Anthropic) via `ANTHROPIC_API_KEY`
**Fallback:** Local Ollama (DeepSeek models) when API unavailable

No OpenAI. No other cloud AI provider. The sovereignty ethic extends to AI infrastructure.

### 5.2 Conversation Processing Paths

Three tiers based on complexity and depth:

| Tier | Latency | Use Case | Features Active |
|------|---------|----------|-----------------|
| **FAST** | <2s | Grounding, brief check-ins | Basic oracle, no memory palace |
| **CORE** | 2–6s | Most conversations | Full oracle, hypothesis feedback, lens injection |
| **DEEP** | 6–20s | Complex depth work | Full oracle + memory palace + anamnesis + astrology |

The **Depth Classifier** (`lib/consciousness/depthClassifier.ts`) routes each request:

```
Incoming message
      │
      ▼
DepthClassifier
      │
      ├── [lightweightContext flag?] → Tier A (threshold) → FAST path
      │
      ├── [7 awareness levels: 1-3] → Tier A (threshold) → CORE path, neutral lens
      ├── [awareness levels: 4-5] → Tier B (core) → CORE path, lens-active
      └── [awareness levels: 6-7] → Tier C (deep) → DEEP path, full stack
```

Special biases:
- **Care mode:** Tier A bias for exchanges 1–4 (containment before depth)
- **Relational phase 1:** Tier A bias (orientation before intensity)

### 5.3 Voice Processing

```
Member speaks
      │
      ▼
Browser SpeechRecognition (STT)
      │
      ▼
Oracle conversation route
      │
      ▼
AI processing (depth-routed)
      │
      ▼
TTS Provider selection:
  ├── OpenAI Alloy (default, cloud)
  └── Kokoro (local fallback / member preference)
      │
      ▼
Audio stream → browser
```

Member can select TTS provider in settings. Local Kokoro preference is persisted server-side for cross-device consistency.

### 5.4 The Conductor

`lib/voice/conductor.ts` manages elemental state via hysteresis buffer:

- Maintains a sliding window of element signals
- Applies hysteresis to prevent rapid oscillation
- If `persistedState` exists (from DB) and buffer is empty, seeds from database
- Prevents element reset on server restart

This is the **Bridge D anti-regression pattern** — the system remembers where the member was structurally, not what they said.

---

## 6. The Consciousness Model

### 6.1 Persistent Member State

The platform maintains a **non-content model of member position**:

```sql
-- member_spiral_state
dominant_element    TEXT        -- fire/water/earth/air/aether
phase               INTEGER     -- 1-12 (Spiralogic spiral phases)
motion              TEXT        -- ascending/stuck/breakthrough (nullable)
intensity           REAL        -- 0-1 signal strength (nullable)
relational_phase    INTEGER     -- 1=orientation, 2=capacity, 3=autonomy, 4=seasonal return
autonomy_streak     INTEGER     -- consecutive autonomous sessions
return_count        INTEGER     -- returns after autonomy
```

**What is never stored:** conversation content, member statements, psychological assessments. Only structural position.

**Why this matters:** The system can greet a returning member with genuine continuity — "you're in a water phase, mid-ascending" — without having recorded what they said. Position without surveillance.

### 6.2 Therapeutic Lens System

Members select a framework preference (`therapeutic_lens` in `member_settings`):

| Framework | Influence |
|-----------|-----------|
| Jungian | Shadow, archetype, individuation framing |
| Somatic | Body awareness, sensation, regulation |
| Narrative | Story structure, authorship, reframing |
| IFS | Parts work, self-leadership |
| Transpersonal | Spiritual emergency, expanded states |
| Systemic | Relational fields, family patterns |
| Existential | Meaning, choice, mortality |

**Tier discipline:** Lens is only active for Tier B (core) and Tier C (deep). Tier A remains lens-neutral — containment first, framework second.

### 6.3 Conversation Modes

| Mode | Posture | Prompt Stance |
|------|---------|---------------|
| **Talk** | Dialogue — the member leads | Responsive, questioning, co-exploring |
| **Care** | Counsel — the member needs holding | Warm containment, pacing, regulation |
| **Note** (Scribe) | Documentation — the member is processing | Reflective capture, structure, synthesis |

Mode is member-selected. Mode influences depth routing bias, voice hint (speed/timbre), and prompt stance.

### 6.4 Relational Maturation Model

The relational phase tracks where the member is in their relationship with the system:

| Phase | Name | Character |
|-------|------|-----------|
| 1 | Orientation | New to the system; needs grounding |
| 2 | Capacity | Established use; exploring depth |
| 3 | Autonomy | Using system less; living life more |
| 4 | Seasonal Return | Periodic depth visits from stability |

Phase 3 is not failure. It is the goal. The system tracks autonomy streaks precisely because increasing independence is the success metric — not engagement.

---

## 7. Memory Architecture

### 7.1 Memory Types

| Type | Storage | Scope | Governed By |
|------|---------|-------|-------------|
| Session context | In-memory (conversation route) | Current session | Cleared on session end |
| Episode memory | PostgreSQL | Conversation turns | Member consent settings |
| Spiral state | PostgreSQL (`member_spiral_state`) | Structural position | Always; no content |
| Hypothesis ledger | PostgreSQL | Accumulating inferences | Confidence decay, explicit rules |
| Memory palace | PostgreSQL + vector index | Long-arc narrative | Anamnesis pipeline |
| Collective field | PostgreSQL (anonymized) | Group patterns | Consent gates |

### 7.2 Sanctuary Mode

Sanctuary Mode is an architectural boundary, not a setting:

- **Toggle UI** activates a session flag
- Flag is checked at every oracle route entry point
- If active: conversation proceeds normally, zero persistence writes occur
- Metadata only: session start/end timestamp, duration — never content
- Nothing from a Sanctuary session can enter any memory layer, including by user request during the session

This is the platform's proof of trust. Sanctuary Mode cannot be selectively applied — it is absolute or off.

### 7.3 Memory Governance

All memory writes are governed by:
- **Confidence thresholds** before hypothesis promotion
- **Decay policies** on inferences not reinforced
- **Explicit influence rules** on what can affect conversation generation
- **Member-accessible review** (planned: Continuity View)

---

## 8. Database Architecture

### 8.1 Database

- **Engine:** PostgreSQL (self-hosted in Docker)
- **Connection:** `postgresql://soullab@localhost:5432/maia_consciousness`
- **Client:** `lib/db/postgres.ts` (direct `pg`, no ORM)

### 8.2 Migration System

Migrations are tracked in `schema_migrations` table:

```bash
# Audit for drift
comm -23 \
  <(ls ~/MAIA-SOVEREIGN/database/migrations/ | sort) \
  <(docker exec maia-postgres psql -U soullab maia_consciousness -tA \
    -c "SELECT filename FROM schema_migrations ORDER BY filename;" | sort)
```

Current state: 257 migrations, all recorded.

### 8.3 Key Tables

| Table | Purpose |
|-------|---------|
| `members` | Identity, credentials, onboarding state |
| `member_settings` | Preferences, therapeutic lens, TTS provider |
| `member_spiral_state` | Structural consciousness position |
| `member_astrology` | Birth data (consent-gated) |
| `conversations` | Session records |
| `episode_memories` | Conversation turn indexing |
| `hypothesis_ledger` | Accumulating inferences |
| `circles` | Community containers |
| `circle_members` | Consent-gated membership |
| `studio_clients` | Practitioner case records |
| `studio_sessions` | Session documentation |

---

## 9. Authentication and Identity

### 9.1 Authentication Stack

```
Member identity resolution priority:
1. Session cookie (getCurrentSession()) — primary
2. x-member-id header (Capacitor/iOS) — mobile fallback
3. JWT bearer (API-to-API) — service integration
```

### 9.2 Authentication Methods

| Method | Implementation | Use Case |
|--------|---------------|----------|
| Passkey + password | Custom (SHA256, PostgreSQL) | Primary onboarding |
| WebAuthn | Browser/device passkeys | Step-up verification |
| Apple/Google/Microsoft OAuth | NextAuth adapters | Social sign-in |
| Biometric | Native + WebAuthn | Mobile quick-access |

**No third-party identity providers hold member data.** OAuth tokens are used for authentication only; no member data is sent to OAuth providers.

### 9.3 Onboarding Flow

```
/begin → /intro-maia → /intro-daimon → /test-elemental → /faq → /onboarding → /maia
```

One-time, sequenced, cannot be skipped. Completion flag stored in both PostgreSQL (`members.onboarded`) and localStorage (session cache). Cross-device via server state; localStorage is cache only.

---

## 10. Practitioner Architecture (Studio)

### 10.1 Studio API Surface

61 API routes across:
- Client management (import, bulk ops, lifecycle)
- Session briefing and synthesis (pre/post-session AI support)
- Changes tracking (I Ching hexagram interpretation chains)
- Decision consulting (mentor panels)
- Voice notes with draft summaries
- Calendar integration (Google/Microsoft)
- Team management with role-based access
- Safety logging (clinical documentation)
- Session metrics and proof signals

### 10.2 Multi-Tenant Portal System

White-label client portals at `/portal/[slug]/`:

- Each practitioner gets a branded subdomain-equivalent path
- Client-facing UI is isolated from practitioner Studio view
- Practitioner branding, intake forms, and session tools
- Consent architecture mirrors member-level sovereignty

### 10.3 Supervision Architecture

Clinical oversight infrastructure:
- Safety logging with structured documentation
- Escalation pathways (incident flag → review)
- Case consultation threads
- Regulatory documentation export

This makes Studio deployable in contexts with clinical oversight requirements.

---

## 11. Collective Intelligence Layer

### 11.1 Circles

Consent-gated small group containers:

- Member creates or joins a Circle with explicit consent
- Each Circle has configurable visibility (members only, public summary, private)
- Content sharing is member-initiated, never pushed
- Circle membership is revocable at any time

### 11.2 Field Analytics

Current state: individual field state tracking (element, phase, relational position).
Emerging: collective field state aggregation for Circle groups.

The design principle: **collective sensemaking without collective surveillance**. A Circle can understand its shared state without any individual member's content becoming visible to others. Aggregation happens over structural markers only — same governance as individual spiral state.

---

## 12. Symbolic Knowledge Library

### 12.1 Integrated Wisdom Systems

| System | Traditions |
|--------|-----------|
| Astrology | Western (natal/transit), Vedic (dasha/gochara), Mayan (day-keeper), Chinese (BaZi/Da Yun) |
| Divination | I Ching (64 hexagrams), Tarot (major/minor arcana), Runes |
| Developmental | Spiralogic (12 phases, 5 elements, relational maturation) |
| Therapeutic | Jungian, Somatic, Narrative, IFS, Transpersonal, Systemic, Existential |

### 12.2 How Library Frameworks Influence the Oracle

Frameworks are not static references. They shape conversation generation:

1. Active frameworks are registered in `FRAMEWORK_REGISTRY`
2. Therapeutic lens selection activates specific framework modules
3. Framework influence is injected into system prompt for Tier B/C only
4. Depth tier governs which frameworks are active (lightweightContext gates heavy systems)

### 12.3 Epistemic Positioning

The platform holds an explicit epistemic stance:

> MAIA may engage symbolic, mythic, or depth-psychological language without claiming truth-status over the human.

This is not a disclaimer — it is an architectural constraint on how MAIA frames its outputs. The system is designed to offer reflection and framing, not interpretation as authority.

---

## 13. Governance and Sovereignty Architecture

### 13.1 The Sovereignty Stack

| Layer | Mechanism |
|-------|----------|
| Data sovereignty | Self-hosted infrastructure; no third-party data transit |
| Memory sovereignty | Consent-based persistence; Sanctuary Mode absolute boundary |
| Identity sovereignty | No third-party identity holder; OAuth for auth only |
| AI sovereignty | Local Ollama fallback; no OpenAI |
| Economic sovereignty | No engagement-optimization metrics; autonomy streak as success signal |

### 13.2 Enforcement

Sovereignty is not policy — it is enforced by code:

- `npm run check:no-supabase` — blocks managed DB imports at commit time
- Pre-commit hooks enforce sovereignty on every commit (`scripts/setup-githooks.sh`)
- `npm run preflight` — full sovereignty check before deploy
- Sanctuary Mode flag checked at oracle route entry, not as middleware

### 13.3 Canon and Oath

All changes to the platform are governed by:

- **MAIA Canon v1.1** (`docs/canon/MAIA_CANON_v1.1.md`) — structural principles
- **MAIA Oath** (`docs/canon/MAIA_OATH.md`) — irreducible standard
- **Sovereignty Invariants** (`docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`) — relational power constraints

The oath is not aspirational. Changes that violate it are invalid regardless of technical merit.

---

## 14. Deployment Models for Institutional Partners

### 14.1 Current Production Model

Single-tenant, self-hosted on operator's infrastructure. The canonical deployment is the Mac Studio running Docker + Caddy. Any organization with equivalent infrastructure (a dedicated server, a private cloud VM, or on-premise hardware) can deploy an identical stack.

### 14.2 White-Label Institutional Deployment

The portal system supports institutional white-labeling today. The deployment path for a retreat center, coaching school, or clinical practice:

1. Deploy MAIA stack on institution's infrastructure
2. Configure domain and Caddy certificates
3. Create institutional admin account
4. Configure white-label portal for each practitioner
5. Enroll practitioners through Studio practitioner onboarding

Data never leaves institutional infrastructure. The institution controls all member data.

### 14.3 Federation (Roadmap — 2028)

The long-term architecture supports federation: multiple independent MAIA deployments sharing:
- Library frameworks and symbolic systems
- Practitioner certification standards
- Research insights (anonymized, aggregated)

Without sharing:
- Member data
- Conversation records
- Personal state models

Federation is how the platform scales without becoming the centralized system it was designed to resist.

---

## 15. Technical Gaps and Roadmap

### Priority 1: Runtime Intelligence Alignment

The depth classifier, therapeutic lens, and relational phase model exist in code. Members do not yet consistently feel the difference between Tier A and Tier C, or between Care mode and Talk mode.

**Required work:** Systematic evaluation against real transcripts. Prompt engineering tightly coupled to tier/mode/lens. Regular regression testing against the existing 73-test matrix.

### Priority 2: Continuity View

Spiral state, relational phase, and element history are stored but invisible to members.

**Required work:** A sparse, symbolic member-facing view of their journey. Not gamification — honest evidence of movement. Element over time, phase transitions, relational maturation markers.

### Priority 3: Collective Field Instruments

Circles exist. Collective state aggregation does not.

**Required work:** Aggregate spiral state across Circle members. Surface collective element/phase in Circle view. Maintain individual consent throughout — no member's state is visible to others, only the aggregate.

### Priority 4: Wisdom Keepers Integration Protocol

Human lineage holders need formal governance protocols, not advisory roles.

**Required work:** Define Wisdom Keeper roles, contribution protocols, attribution standards, and compensation models. Implement Library contribution workflow. Establish first three lineage relationships with formal agreements.

---

## Appendix A: Key File Locations

| System | Primary File |
|--------|-------------|
| Oracle conversation | `app/api/oracle/conversation/route.ts` |
| Depth classifier | `lib/consciousness/depthClassifier.ts` |
| Voice conductor | `lib/voice/conductor.ts` |
| Spiral state persistence | `lib/consciousness/spiralStatePersistence.ts` |
| Member auth | `lib/auth/session.ts` |
| API base (Capacitor) | `lib/http/apiBase.ts` |
| Database client | `lib/db/postgres.ts` |
| Spiralogic reference | `lib/maia/spiralogicReference.ts` |
| Studio client API | `app/api/studio/clients/route.ts` |
| Circles | `app/api/commons/circles/route.ts` |

## Appendix B: Technology Stack Summary

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | Next.js 16 + Turbopack | Performance, App Router, server components |
| Language | TypeScript | Type safety across full stack |
| Database | PostgreSQL (self-hosted) | Sovereignty; no managed service |
| DB client | `pg` (direct SQL) | No ORM abstraction obscuring data model |
| AI primary | Claude (Anthropic) | Alignment, capability, API quality |
| AI fallback | Ollama (DeepSeek) | Local sovereignty when API unavailable |
| Voice TTS | OpenAI Alloy + Kokoro | Quality + local fallback |
| Voice STT | Browser SpeechRecognition | No external audio processing |
| Mobile | Capacitor (iOS) | Native packaging, WebView bridge |
| Proxy | Caddy | Auto-TLS, clean config, no middleman |
| Containers | Docker + docker-compose | Reproducible, portable, sovereign |
| Auth | Custom + WebAuthn | No third-party identity holder |
