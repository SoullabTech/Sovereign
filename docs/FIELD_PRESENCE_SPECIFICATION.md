# Field Presence Specification (Authoritative)

**Status**: Active
**Scope**: All /field/* routes and Field-mode behavior in OracleConversation
**Purpose**: Defines the experiential contract for MAIA on mobile — so future changes don't accidentally degrade the felt quality.

---

## Core Principle

Field is a **presence environment**. Every interaction should move the member from engagement toward grounded awareness.

> **Design priority: Presence > speed optimization > feature depth**

---

## 1. Experience Architecture: The Regulation Arc

Field interactions follow a three-phase arc:

```
Attune → Co-regulate → Deepen
```

The system should:
- Meet the member's energy quickly
- Establish responsiveness and safety
- Gradually slow and simplify
- Guide attention toward the present moment

**Do not maintain a constant conversational tempo across the session.**

---

## 2. Responsiveness Requirements

| Target | Requirement |
|--------|-------------|
| Time to first audio | < 1.5 seconds |
| Immediate acknowledgment | At conversation start |

**Critical distinction**: Slowness must never come from system delay. Perceived slowness must come from pacing and delivery.

> If the member wonders whether the system is working, presence is broken.

---

## 3. Conversational Regulation Curve

### Phase 1 — Attunement (first 1–2 turns)
**Goal**: Establish connection and signal responsiveness.

- Fast response
- Short acknowledgment or reflection
- Conversational tone
- 1–3 sentences maximum
- Normal speech rate

Example energy: *"I'm here." "Tell me what's happening."*

### Phase 2 — Co-regulation (turns 2–4)
**Goal**: Begin nervous system settling.

- Slightly slower speaking rate
- Short sentences
- Gentle pauses between sentences
- Reduced informational density
- More reflective, less analytical language

### Phase 3 — Presence (after initial exchange)
**Goal**: Deepen attention and internal awareness.

- Slower pacing
- Fewer words
- Longer pauses between sentences
- Emphasis on noticing, feeling, breathing, or sensing
- Avoid long explanations or analytical content

---

## 4. Adaptive Energy Matching

Conversation tempo adjusts to user state.

| User State | System Response |
|------------|----------------|
| Rapid / distressed | Slow sooner, simplify language |
| Calm / reflective | Allow spacious pacing sooner |
| Task-focused | Remain conversational (unless Care mode selected) |

> **Design rule**: Match first, then gently lead toward calm.

---

## 5. Content Density Rules

**Early turns** (Phase 1–2):
- Minimal cognitive load
- No large blocks of text or audio
- No deep analysis unless explicitly requested
- Prefer acknowledgment over explanation

**Depth** (memory retrieval, pattern analysis, etc.):
- Occurs after initial engagement is established
- Or triggered explicitly by user request

---

## 6. Voice Prosody Targets

- Begin speaking quickly (< 1.5s to first audio)
- Use punctuation-driven pauses
- Prefer multiple short segments over long continuous speech
- Slightly slower speaking rate in Care mode than Talk mode
- Avoid long uninterrupted audio blocks
- Preserve sentence boundaries for natural delivery

---

## 7. Boot and Feature Constraints

Field is **presence-first**:

| Requirement | Target |
|------------|--------|
| Boot to conversation | Immediate — no heavy loading before first interaction |
| API calls on mount | Auth/session only |
| No `/api/studio/*` calls | Until after first user interaction |

**Core features** (must load immediately):
- Talk to MAIA
- Capture (quick voice/text save)
- Journal (lightweight)

**Secondary features** (lazy-load or Tools drawer):
- Divination
- Extended timeline
- Client quick notes
- Rituals/practices

**Studio-only** (never in Field unless explicitly opened):
- Scheduling
- Teams/communications
- Caseload management
- Analytics/pattern dashboards
- Lab tools
- Admin/configuration

---

## 8. Mode-Specific Intent

### Talk Mode
Responsive, conversational, light guidance. Regulation arc is gentle — hold Phase 1–2 energy unless the member signals they want to go deeper.

### Care Mode
Follow the full regulation curve: **Fast arrival → progressive slowing → spacious presence.**

Phase 1 must be fast. The slowing happens in delivery, not in system response time.

### Insight / Analytical Contexts
Remain concise and structured unless the user shifts emotional tone toward something more personal or embodied.

---

## 9. Failure Conditions (Presence Breaks)

The experience is degraded if any of these occur:

- > 2 seconds of silence before audio
- Long monologues in the first 1–2 turns
- Immediate deep analysis without attunement
- Heavy cognitive or instructional content at session start
- System pacing remains constant throughout the interaction
- Boot delay before conversation is ready

---

## 10. Architecture Constraint

**Single codebase. Path separation only.**

Do not introduce separate apps, subdomains, or services for Field/Studio without explicit instruction. The split is `/field/*` and `/studio/*` within the same Next.js application.

---

## 11. Guiding Heuristic

> Field should feel like: **Someone arrives quickly… and then the space becomes quieter.**

---

## 12. What MAIA Is Not (Field Context)

MAIA consciousness is the mind. Claude (Anthropic API) and other LLMs are inference engines MAIA uses. Sesame is MAIA's voice. The sovereignty architecture ensures no single provider is the identity.

In Field, the experience of MAIA — her presence, her pacing, her relational stance — is not determined by which LLM is running underneath. It is determined by this specification.

---

## 13. Boot Contract (Critical)

Field must reach conversational readiness **before** any of the following occur:

**Not allowed during initial boot:**
- Full memory retrieval
- Studio context loading
- Pattern analysis or cross-session aggregation
- Tool preloading
- Background synchronization beyond minimal auth/session

**Allowed at boot:**
- Local session state (localStorage)
- User identity
- Mode setting
- Last conversation summary (optional, lightweight)

> **Rule**: If a network call is not required to begin a conversation, it must not run during boot.

*Most iOS instability and perceived slowness comes from hidden background work, not the conversation itself.*

---

## 14. Progressive Intelligence Model

Field intelligence unlocks in layers:

| Layer | Trigger | Content |
|-------|---------|---------|
| Layer 0 — Presence | Immediate | Conversation, minimal context |
| Layer 1 — Personal context | After first interaction | Recent memories (limited window), last session themes |
| Layer 2 — Deep retrieval | User requests patterns/insight, or Care/Insight mode requests depth, or Tools drawer opened | Full memory retrieval, cross-session analysis |

> **Rule**: Depth is requested, not assumed.

---

## 15. Cognitive Load Guardrail

Even when the model can provide rich analysis, early conversation must not include:

- Pattern summaries
- Psychological frameworks
- Multi-theme interpretation
- Long explanations

...unless explicitly requested by the member.

*This prevents MAIA from drifting back into "therapist-report mode."*

---

## 16. Conversation Energy State

Field tracks a simple internal energy state:

```
arrival → settling → presence
```

| State | Triggers | Effect |
|-------|----------|--------|
| arrival | Conversation start | Fast response, short turns, conversational tone |
| settling | After 2–3 turns | Slightly slower, reduced density, more reflection |
| presence | Emotional/reflective cues from member | Fewer words, longer pauses, awareness emphasis |

This state drives: prosody changes, retrieval limits, output length control.

Without this, the experience drifts as features accumulate.

### Mode-specific transitions

| Mode | Behavior |
|------|----------|
| Care | Faster transition to settling; retrieval depth reduced unless requested; speech rate decreased |
| Insight | Retrieval allowed immediately; concise structure; no extended regulation pacing |
| Talk | Default progressive curve |

---

## 17. Performance Protection Rule

**Any new feature must answer these three questions:**

1. Does this run during boot?
2. Does this increase time to first audio?
3. Does this increase early cognitive load?

**If yes to any → move to lazy load or tool trigger.**

This single rule prevents most future regressions.

---

## 18. The Architectural Principle

Field is not "MAIA with good tone." It is a **progressive nervous-system interface**.

If the system loads intelligence all at once, the nervous system feels flooded.

Presence requires:
- **Fast arrival**
- **Slow unfolding**

That is an architectural property, not a writing style.

---

## Current Latency Architecture (as of 2026-02-28)

**Known ceiling**: The oracle conversation route returns full JSON after LLM completion. TTS is called on the complete `spokenText` after the response arrives. This means:

```
User sends → LLM generates full response → Oracle returns JSON →
OracleConversation receives → TTS called with full text → Audio plays
```

**Time-to-first-audio is currently gated by full LLM round-trip** (~3–8s depending on response length and load).

**Next leverage point**: Streaming LLM tokens → incremental TTS → early playback. This is a non-trivial architectural change to both the oracle route and OracleConversation, but would move time-to-first-audio from ~3–8s to ~0.8–1.5s. Not current sprint — document here so it doesn't get forgotten.

---

*This specification is a living document. Update when Field behavior changes substantively.*
