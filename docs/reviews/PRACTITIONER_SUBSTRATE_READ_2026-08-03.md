# Phase 1 — Existing Practitioner Substrate: Reading Findings

**Task:** reading, not design. ⛔ No schema proposed here.
**Date:** 2026-08-03 · All claims **[O] observed** (files read this session) unless marked **[I]**.

---

## 1. `20260624000001_practitioner_observation_provenance.sql` — answered

**The migration is not about practitioner wisdom at all.** It extends `member_memory_atoms` so a facilitator's observation *about a member* can enter *the member's* memory. Different axis: it governs what a practitioner may say about a client — not what the platform may say from a practitioner's material.

Its stated constitutional intent: observations enter as **"witnessed"** — *"facilitator saw this, not: this is unquestioned truth about the member."*

### Against the six questions

| Question | Present? | Evidence |
|---|---|---|
| source relationship? | ❌ **No** | `epistemological_status` is *how it was known*, not *what relationship it claims to a source*. Adjacent axis, not the same one. |
| ownership? | ⚠️ partial | `facilitator_id` = authorship. No `license`, `rights_status`, no rights concept. |
| origin? | ✅ **Yes** | `facilitator_id` + `source_type = 'practitioner_observation'` |
| confidence? | ⚠️ partial | `provisional` as a status value; separately `practitioner_growth.confidence NUMERIC(3,2)` |
| promotion? | ❌ **No** | Nothing moves between registers. Closest is `practitioner_growth.acknowledged BOOLEAN` — a *has-seen* flag. |
| attribution? | ⚠️ stored, render unverified **[I]** | `facilitator_id` persists; whether it reaches composed context is unread. |

### ⭐ The reusable seed

```sql
epistemological_status CHECK IN (
  'observed',    -- witnessed directly by a facilitator in session
  'reported',    -- shared by the member in their own words
  'inferred',    -- derived from patterns (system-generated)
  'provisional', -- low confidence or flagged for member review
  'claimed'      -- asserted by the member as their truth
)
```

**An epistemic-register vocabulary already exists in this system, is constitutional in intent, and is deployed.** The Wisdom Field's source-relationship axis should be recognizably a sibling of this — same instinct, different question. ⛔ Do not invent a parallel unrelated vocabulary.

**Verdict: the gap is CONFIRMED.** Origin exists; relationship, rights, and promotion do not.

---

## 2. 🔴 `practitioner_growth` — MAIA asserting development claims about the practitioner

**[O]** `20260110000001_practice_sessions.sql`:

```sql
growth_type CHECK IN (
  'pattern_identified',   -- "Recurring tendency noticed"
  'strength_developing', 'edge_emerging', 'modality_expanding',
  'style_evolution',      -- "How their approach is changing"
  'client_type_affinity'  -- "Types of clients they work well with"
)
observation      TEXT NOT NULL   -- "MAIA's cross-session insight"
confidence       NUMERIC(3,2)
acknowledged     BOOLEAN DEFAULT FALSE   -- "Practitioner has seen this"
```

**[O]** `session_insights.insight_type` includes `'blind_spot'` — *"Did you notice…?"* — plus `growth_edge`, `strength_spotted`, `practitioner_pattern` (*"You tend to X when clients Y"*).

🔴 **This is the surface the product definition said must never be built, already specified in a migration.** MAIA generates developmental claims *about* the practitioner, attaches a numeric confidence, and the only human control is a boolean meaning *seen*.

Two problems, both structural:

1. **Direction of authority inverted.** Invariant 16: authority moves upward through *authored* experience; the system never manufactures higher-order meaning. `pattern_identified` + `confidence 0.85` is manufactured higher-order meaning about a person.
2. **`acknowledged` is the same rejected control shape.** It proves someone *saw* a thing — never that they *agreed*, and never that they authorized anything. Identical in kind to gating on readiness `status` or revision history, both rejected in `c327dd526`.

⚠️ **[I] Not established:** whether any of this is wired to a live writer or surfaced to practitioners. Migration presence ≠ runtime. **This needs a liveness check before it is called a problem in production** — but it is unambiguously a problem in the design.

---

## 3. `modality_vocabulary` — a seeded ontology, opt-out by default

**[O]** `modality_vocabulary` ships `is_system = TRUE` rows: `somatic · breathwork · movement · cognitive · mindfulness · parts_work · narrative · relational · family_systems · gestalt · expressive · imaginal · dreamwork`.

**[O]** `practitioner_insight_preferences.modality_vocabulary TEXT[]` **defaults to 10 of them.**

⚠️ This is a somatic/depth-therapy ontology, pre-selected on the practitioner's behalf. Invariant 14 (cultural sovereignty), concretely, in seed data — not a hypothetical. An executive coach, a spiritual director, and a teacher each inherit a vocabulary describing someone else's practice, opt-out rather than opt-in.

⭐ It is also the closest existing thing to a **Language Field**, and the closest existing thing to *practitioner-configurable vocabulary*. The mechanism is right; the defaults are the problem.

---

## 4. `studio_practitioner_observations` / `studio_field_signals` — a second, unrelated model

**[O]** `20260312000001_studio_practitioner_loop.sql` defines its own observation model: `observation_type CHECK IN ('in_session','relational_field','somatic_shift','pattern_notice','interruption','repair','other')`, plus `studio_field_signals.source CHECK IN ('client','practitioner','maia')`.

⚠️ **`source` here is the closest thing in the codebase to an origin axis on a practitioner-facing table** — three values, no relationship, no rights.

⚠️ There are now **three unrelated observation models**: `member_memory_atoms` (+provenance), `studio_practitioner_observations`, `practitioner_growth`/`session_insights`. **[I]** Whether they were meant to converge is unknown. Any Wisdom Field design must decide which it extends rather than adding a fourth.

---

## 5. Map: existing capability + missing sovereignty layer

| Developmental capability | Substrate | Sovereignty layer |
|---|---|---|
| Observation capture | ✅ 3 models | ❌ no promotion |
| Reflection | ✅ `practitioner_notes`, inquiry responses | ❌ no register |
| Pattern recognition | ✅ `practitioner_growth`, `session_insights` | 🔴 **MAIA-authored, confidence-scored** |
| Experiments | ✅ `studio_change_experiments` (hypothesis, intervention_type) | ❌ no path to method |
| Practitioner vocabulary | ✅ `modality_vocabulary` | ⚠️ system-seeded, opt-out |
| Prompt/question library | ✅ `prompt_library` | **[I]** unread |
| Epistemic register | ✅ `epistemological_status` | ⚠️ member axis only |
| **Promotion event** | ❌ **nothing anywhere** | — |
| **Rights / relationship** | ❌ **nothing anywhere** | — |

> **Confirmed: the missing piece is not capability. It is epistemic transition control.** Nothing in this system distinguishes *"I noticed something while practicing"* from *"this is now part of my teaching."*

---

## 6. Next reads (still **[I]**)

1. Is `practitioner_growth` wired to a live writer? — decides whether §2 is a live defect or a design defect.
2. `composeLessonContext` (`programAuthoringService.ts:482`) — confirm `author` is dropped.
3. `prompt_library` / `prompt_library_items` semantics.
4. `lib/practitioner/features.ts` — existing toggle registry?
