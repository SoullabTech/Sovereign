# Now What? — Navigation & Arrival Architecture

```text
Status: DRAFT — NOT RULED
Purpose: Experience architecture — the bridge between constitution work and UI/UX
Implementation authorization: none
Supersession authority: none
```

**Authored by:** Kelly (founder), 2026-08-03. **Recorded by:** Claude.
⛔ Not ratified. Acceptance criteria in §6 are **unauthored slots** — recording a question is
not authoring what counts as passing it.

---

## 0. Two flags before the content

### 0.1 ⚠️⚠️ "Phase 3" now names three different things

| Referent | What it is | State |
|---|---|---|
| **Writer's Studio Phase 3** | *Projects Become Real* — project chooser, project-bound Canvas | recorded, **not authorized** |
| **Phase 3 inquiry** | *What observed human/system relationship model is supported by evidence?* | inquiry authorized, container canonical, **instrument undefined** |
| **Phase 3 — Experience Architecture** | this document's framing | **new, unreconciled** |

⭐⭐⭐ **Founder direction, 2026-08-03: "Phase 3" must not survive as a shared term for this
work.** The reason is not cosmetic — *the system already uses phases as governance objects.
If a CEO hears "Phase 3" in three contexts, he cannot know whether he is hearing roadmap,
research, or implementation.*

⏳ **Rename target — two candidates offered, not chosen:** *Now What? Experience Architecture
— Stage 2* · *Now What? Product Experience Architecture*. This document's title avoids
"Phase 3" already; the final name is a founder selection and has not been made.

⛔ Whether the other two referents also rename is unresolved. **Do not resolve it by
building.**

### 0.2 ⚠️ An unverified citation

The framing cites the constitution draft as identifying a blocked sequence — *navigation
model not started, first-30-seconds not started, Slice 0 not started.* **Checked against
canonical `docs/canon/AIN_OS_CROSS_LAYER_DESIGN_CONSTITUTION_DRAFT.md`: zero occurrences of
"not started", "blocked", "first-30", "Slice 0", or "navigation model."** §5 names Navigation
Architecture as a layer; §11 marks Data, Security and UI Pattern as placeholders. The blocked
sequence lives in some other artifact or in recollection. **Recorded, not resolved** — the
statements below stand on their own merit, not on that citation.

---

## The governing question

> **Can Larry and a client enter AIN OS through familiar doors while experiencing a
> fundamentally different relationship model?**

⭐⭐⭐ **Familiar outside. Transformative inside.** The navigation does not teach the
philosophy — **the experience reveals it.**

⭐⭐ **Where this method differs.** Normal software starts: *"What screens do we need?"*
AIN OS starts: **"What relationship are we trying to preserve, and what must the system never
accidentally do?"** Then the screens become simpler. *This is why the work takes longer.*

## 1. Larry navigation map

Larry needs familiar nouns:

```text
Clients
Programs
Sessions
Notes
Resources
Timeline
```

Underneath, the same six doors carry:

```text
Relationship
Authorship
Continuity
Consent
Meaning
```

⛔ Not at the door: *Developmental Field* · *Relational Intelligence Engine* · *Epistemic
Architecture*.

## 2. Client navigation map

The client's doors are their own material, not a mirror of Larry's:

```text
Your work with Larry

What you are carrying:
  - your reflections
  - your chosen focus
  - your commitments

Your relationship:
  Larry is accompanying you through:
  Leadership Transition
```

## 3. Two views, one relationship

Larry sees:

```text
Clients

Senja

Working with Larry:
  Leadership Transition Program

Current process:
  Week 4 — Integration

Shared:
  - commitments
  - notes
  - resources
  - sessions
```

⭐⭐⭐ **Same relationship. Different authority.**

### Shared relationship objects

| Object | Shared | Client-private | Practitioner-private |
|---|---|---|---|
| Commitments | ✅ | | |
| Notes | ✅ | | |
| Resources | ✅ | | |
| Sessions | ✅ | | |
| Reflections | | ✅ | |
| Chosen focus | | ✅ | |
| Client's Field | | ✅ | |

⚠️ **This table is descriptive of the design intent, not a ruled access model.** The
authoritative boundary is the consent architecture, not this grid.

## 4. First 30 seconds

Defined **before** screens are built. **The first screen is not a dashboard — it is a
threshold.**

| Who | The arrival question |
|---|---|
| **Larry** | *Can I immediately understand what this place is and what I can do?* |
| **Client** | *Do I feel accompanied, not observed?* |

Sketch:

```text
Welcome back, Senja.

Your work with Larry

Continue where you left off.

[Open your work]
```

⛔ Absent by design: AI explanation · analytics · progress score.

## 5. Interaction principles

External patterns are **borrowed for the problem they solve, then translated** — never
imported with their ownership model attached.

| Source | What is borrowed |
|---|---|
| Apple | remove friction |
| Airbnb | make roles and trust explicit |
| Duolingo | easy return |
| Notion | flexible workspace |
| Linear | clarity and focus |

### Translation table

| Normal software | AIN OS |
|---|---|
| "Recommended next step" | **"You may want to revisit…"** |
| "Client status: progressing" | **"Current shared work"** |
| "I noticed a pattern." | **"These two moments both mention…"** |

⭐ Each translation moves the sentence from *system asserts* to *member notices*. The
grammatical shift is the constitutional one.

## 6. Acceptance criteria before Slice 0 build

⛔ **Criteria are unauthored.** The questions are the founder's; what counts as a passing
answer is not yet written.

### Slice 0 — Client Home

| Shows | Does **not** show |
|---|---|
| relationship | private reflections |
| selected program / process | AI interpretations |
| client's own carried material | scores |
| shared items | progress metrics |
| | inferred patterns |

### Slice 0 — Larry Home

| Shows | Does **not** show |
|---|---|
| relationship | client's private focus |
| program placement | private Field |
| shared material | hidden activity |

### The principle Slice 0 must prove

> **The client can have a meaningful experience while remaining the author of their own inner
> material.**

| Criterion | What would count as passing |
|---|---|
| Larry arrival | *(unauthored)* |
| Client arrival | *(unauthored)* |
| Authority separation | *(unauthored)* |
| Absence of prohibited affordances | *(unauthored)* |
| Return without friction | *(unauthored)* |

⭐ Related instrument, already canonical:
`docs/product/walks/NOW_WHAT_PRACTICE_WORKSPACE_LARRY_WALK_01.md` (#929) — the acceptance
*questions* for both parties, likewise with criteria unauthored. ⛔ **Two acceptance surfaces
now exist for the Larry experience.** Which governs is unruled; see §0.1.

## 7. What this document does not do

⛔ Does not authorize implementation, a Slice 0 build, screens, schema, or deployment · does
not rule the access model in §3 · does not author acceptance criteria · does not resolve the
Phase 3 naming collision · does not supersede any canon.

⚠️ **Standing gates unchanged:** no new implementation lane opens until Phase 1 is a finished
release object (**Phase 1 is failed at W8**) · the Now What? Client Home lane is
design-through-Phase-1, **not implemented** · the absent `coach_*` tables are a **protected
boundary** whose absence gate `1d` asserts · the Larry IP one-pager gates activation.

## 8. Ratification

⬜ **Not ratified.**

| Field | Value |
|---|---|
| Ratified by | |
| Date | |
| Sections in force | |
| §0.1 Phase 3 naming resolved | |

*Unfilled means unruled. Nothing here governs, and nothing here authorizes build.*
