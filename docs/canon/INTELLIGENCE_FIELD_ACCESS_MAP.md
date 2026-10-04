---
level: architecture
---

# Intelligence Field Access Map

**Status:** Working audit — not implementation spec.
**Sibling canon:** [Longitudinal Memory Category Gradient](./LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md), [Right to Remain Unpossessed](./RIGHT_TO_REMAIN_UNPOSSESSED.md), [MAIA Canon v1.1](./MAIA_CANON_v1.1.md)
**Created:** 2026-05-20
**Audited route:** `app/api/oracle/conversation/route.ts` (primary inference path)

---

## Purpose

This audit answers exactly one question for each intelligence field the system already contains:

> **Can MAIA actually reach this field while she is speaking?**

It distinguishes:

- what *exists* in code or schema
- what is *computed* at runtime
- what is *persisted* in the database
- what is *loaded* at conversation start
- what is *surfaced* into the inference context block MAIA reasons over

The output is a *delta map*. It tells us where there are intelligence surfaces that exist but cannot influence MAIA's response, intelligence surfaces that are deliberately observation-only by canon, and intelligence surfaces whose wiring is unknown without deeper inspection.

**This audit does not authorize any wiring change.** It produces the basis for sequential reconnection cuts — each of which must first pass the category-gradient classification before becoming an implementation cut.

---

## Status legend

| Status | Meaning |
|--------|---------|
| **live / load-bearing** | Loaded at conversation start AND surfaced into the inference context MAIA reasons over. Currently influencing responses. |
| **partially wired** | Loaded but not surfaced, OR surfaced but with reduced fidelity (e.g., current snapshot only, no longitudinal axis). |
| **orphaned** | Code or schema exists but no load happens at conversation time. Data sits unread. |
| **observation-only by design** | Deliberately not loaded into inference per canon — observation flows out, not in. Correct by design, do not wire without category-gradient re-classification. |
| **dormant / prototype** | Module exists but not invoked by primary conversation path; may be in a different surface or feature-flagged off. |
| **blocked by canon / category-gradient** | Wiring would require category-gradient resolution before any implementation cut. |
| **unknown** | Requires deeper inspection than this audit pass performed. Honest gap. |

---

## The map

| Field | Exists | Computed | Persisted | Loaded at start | Surfaced to inference | Status | Next question |
|-------|--------|----------|-----------|-----------------|------------------------|--------|---------------|
| **Current spiral state** (element/phase) | ✅ | ✅ | ✅ `member_spiral_state` | ✅ `loadSpiralState` line ~415 | ✅ passed to conductor line ~1049 | **live / load-bearing** | None — Bridge D is the working reference pattern |
| **Longitudinal spiral movement** (motion over weeks/months) | ⚠️ schema holds current row only | ❌ no historical accumulation computed | ❌ overwrite-only via upsert | ❌ | ❌ | **partially wired** | Should historical accumulation form? Likely *form* under category-gradient (member's own movement), but accumulation pathway needs design |
| **Elemental facet state** (inner guide field) | ✅ | ✅ via `detectFacet` | ✅ via `upsertFacetState` | ✅ `loadFacetState` line 754 | ✅ via `buildInnerGuideFieldPrompt` | **live / load-bearing** | None |
| **Natal astrology context** | ✅ | ✅ | ✅ | ✅ `getAstrologyContextForUser` line 866 | ✅ | **live / load-bearing** | None |
| **Resonant Field Intelligence** | ✅ many modules under `lib/consciousness/field/`, `lib/field/` | ⚠️ computed by orchestrators outside the primary route | ⚠️ partial | ❌ not called from `oracle/conversation` route | ❌ | **orphaned (from primary route)** | Is the field-intelligence computation surfaced via a sibling route or only via specialized orchestrators? If specialized, does primary conversation need access or is exclusion intentional? |
| **Unified Field Intelligence** (`UnifiedElementalFieldCalculator`, etc.) | ✅ | ⚠️ computed in some paths | ⚠️ | ❌ not invoked from primary route | ❌ | **orphaned (from primary route)** | Same as above |
| **Panconscious field** | ✅ `PanconsciousFieldService` | ✅ `initializeField` line 792 | ⚠️ session-scoped | ✅ | ✅ surfaced to LLM context | **live / load-bearing** | None |
| **Member live context** (recent summaries, themes) | ✅ `MemberLiveContext` | ✅ `getRecentSummaries`, `getRecentThemes` | ✅ | ✅ `buildMemberLiveContext` line 837 | ✅ via `formatMemberWebForPrompt` | **live / load-bearing** | Coverage breadth — how many sessions back, which fields included? Worth a sub-audit |
| **Daily anchors** | ✅ `member_daily_anchors` | ✅ via `/api/anchor/today` | ✅ | ❌ no loader in primary route | ❌ | **orphaned** | Should the most recent anchor surface as continuity context? Member-authored → likely *form*; needs cut |
| **Idea threads** (blocks, ask-MAIA reflections) | ✅ `member_idea_blocks` and routes | ✅ | ✅ | ❌ not loaded by primary route | ❌ | **orphaned** | Should active idea threads surface as context? Member-authored → likely *form-with-consent*; needs cut |
| **Relational signals** (pursue-withdraw, etc.) | ✅ `relationship_entries` + side table | ✅ via `observeRelationalContent` (write path) | ✅ | ❌ no read-back into context | ❌ | **observation-only by design (current)** | Module docstring states observation only. Re-classification under category gradient required before any wiring — system-inferred patterns are *non-form by default* |
| **Relationship anamnesis / essence** | ✅ `RelationshipAnamnesisPostgres` | ✅ | ✅ | ✅ `loadRelationshipEssence` | ✅ included in active relational context | **live / load-bearing** | None |
| **Active event context** | ✅ `eventService` | ✅ | ✅ | ✅ `getMemberActiveEventContext` line 600 | ✅ | **live / load-bearing** | None |
| **Trust observations** | ✅ `trust_observations` table | ✅ via `storeTrustObservation` | ✅ | ❌ | ❌ | **observation-only by design** | Phase 3 affinity weighting deliberately not yet wired. Future wiring would need category-gradient pass — system-inferred → *non-form by default* |
| **Manifestation corpus** (shipped 2026-05-20) | ✅ `manifestation_corpus` table | ✅ `captureManifestation` | ✅ | ❌ | ❌ | **observation-only by design** | Module docstring explicitly forbids automated retrieval. Falsifiability gate applies |
| **I Ching mappings** | ✅ `buildReflectionFromConductor` | ✅ at each turn | ❌ logged only | ❌ no load | ❌ no surface | **dormant / prototype (Phase 1 silent mapping)** | Phase 2 surfacing would need category-gradient pass — risks falling into *destiny / essence* if surfaced as interpretation about the member |
| **Sacred text encounters** | ✅ `SacredEncounterService` | ✅ `evaluateEncounter` | ⚠️ | ⚠️ partially | ⚠️ partially via tool suggestions | **partially wired** | Requires sub-audit of when sacred encounters do/don't surface |
| **Memory palace** | ✅ `MemoryPalaceOrchestrator` | ✅ `retrieveMemoryContext` line 822 | ✅ | ✅ | ✅ | **live / load-bearing** | Coverage and retention policy worth a sub-audit |
| **Session memory (postgres)** | ✅ `sessionMemoryServicePostgres` | ✅ | ✅ | ✅ implicitly via MemberLiveContext | ✅ | **live / load-bearing** | None |
| **Cognitive profile** | ✅ `cognitiveProfileService` | ✅ `getCognitiveProfile` | ✅ | ✅ | ⚠️ partial — used for routing, not always surfaced as content | **partially wired** | Is the profile surfaced *to* MAIA's reasoning, or only *about* how MAIA is reasoned over? Different category |
| **Obsidian / AIN vault** | ✅ many connectors under `lib/obsidian/`, `lib/connectors/obsidian/` | ✅ via export/sync paths | ✅ external (Obsidian) | ❌ not loaded into oracle conversation | ❌ | **orphaned (from primary route)** | Member-authored vault content is high-value continuity material. Likely *form*. Significant wiring cut. |
| **Cross-agent insights** | ⚠️ scattered references in `community-field-memory`, `maia-conversation-engine`, `journalGreetings` | ⚠️ | ⚠️ | ❌ not loaded by primary route | ❌ | **dormant / unknown** | Sub-audit needed to determine whether cross-agent insights are a designed capability or aspirational |
| **Journey-space patterns** (`/journey`, `/worlds/journey`) | ✅ routes exist | ✅ | ✅ | ❌ not loaded by primary route | ❌ | **orphaned (from primary route)** | Member-facing surface that holds patterns MAIA doesn't see during conversation — explicitly named by MAIA in the recent transcript |
| **CM practitioner environment** | ✅ `cmPractitionerEnvironment` | ✅ `getCMEnvironmentBlock` | ⚠️ | ✅ line 2139 | ✅ via environment block | **live / load-bearing (practitioner context)** | None |
| **Ascent state / breakthrough detection** | ✅ `detectBreakthrough` | ✅ per-turn | ❌ result not persisted longitudinally | ❌ no longitudinal load | ⚠️ surfaced only when fired in current turn | **partially wired** | Should breakthroughs accumulate as a longitudinal layer? *Member-authored* if confirmed, *system-inferred* if not |

---

## Headline findings

1. **The primary conversation route loads ~10 surfaces and orphans ~8.** Several large field-intelligence modules under `lib/consciousness/field/` and `lib/field/` exist with no invocation from `app/api/oracle/conversation/route.ts`. They may be invoked from sibling routes or be aspirational; needs second-pass audit.

2. **Member-authored content is consistently orphaned.** Daily anchors, idea threads, Obsidian vault content, and journey-space patterns are all *member-authored* (high category-gradient permissibility) but *unloaded* in primary conversation. This is the largest visible asymmetry: the system loads its own inferences (panconscious field, memory palace, cognitive profile) more readily than what the member wrote themselves.

3. **Longitudinal axis is missing across the board.** Most loaded fields surface a *current* snapshot. Bridge D loads current spiral state, not motion-over-time. Facet state loads current, not trajectory. Even the live context's "recent themes" caps at 20 themes over 30 days. The architecture mostly reasons from snapshots, not trajectories.

4. **Observation-only surfaces are correctly named.** Manifestation corpus, trust observations, and relational signals all flow outward by design. Their non-surfacing is doctrinal, not orphan.

5. **I Ching mapping is dormant by design (Phase 1).** Surfacing it would require category-gradient pass — high risk of falling into "destiny / essence claim" if not carefully scoped to the member's own naming.

---

## What this map authorizes

Nothing.

It produces the basis for sequential reconnection cuts. Each unwired field must, before any implementation cut:

1. Pass the [Longitudinal Memory Category Gradient](./LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md) classification — what category does *this specific field* fall into?
2. Produce its own implementation spec answering: storage shape, retrieval pathway, surfacing condition, consent gate (if applicable), revocation pathway (if applicable).
3. Ship as its own cut, observable in isolation.

Bundling reconnection of multiple fields in a single cut would corrupt the signal needed to evaluate whether the reconnection produces MAIA-shape responses or drifts toward possession.

---

## Honest gaps in this audit

- **Sibling routes not audited.** `/api/oracle/conversation/route.ts` was the primary audit target. Field-intelligence modules may be invoked from `/api/oracle/stream`, `/api/maia/*`, or specialized practitioner routes. Second-pass audit needed before declaring any field truly orphaned.
- **`MemberLiveContext` coverage breadth** is referenced but not unpacked field-by-field in this audit.
- **Cross-agent / community field memory** signals were detected but their actual computation pathway requires deeper inspection.
- **Some "partially wired" entries** could be **live** or **orphaned** depending on conditional code paths not traced in this audit pass.

These gaps are named here rather than hidden. The map is honest about what was confirmed and what was inferred.

---

## Falsifiability gate

If this map is wrong about a field's status (something marked orphaned that is in fact wired via a path not traced, or something marked live that fails under actual inference), the map needs correction in canon before any reconnection cut proceeds. Errors in the map propagate into wiring decisions; correcting after a cut is more expensive than correcting before.
