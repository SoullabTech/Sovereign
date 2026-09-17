# MAIA-NODE-15 — THE STANDING MODEL

**Status:** CANDIDATE. Derivation record beneath `MAIA-MAVEN-01`.
**Lane:** `MAIA-MAVEN-CANON-01` — documentation only. ⛔ Implementation NOT AUTHORIZED.
**Date:** 2026-09-17
**Amended:** 2026-09-17 by founder adjudication **R4** — see
`MAIA-MAVEN-CANON-01_FOUNDER_ADJUDICATION_2026-09-17.md`.

---

## 0. ⭐ Naming — RESOLVED under R4

This record was first authored as *"the four-layer memory model"* and is renamed. The hazard it
flagged has been ruled rather than annotated.

**Founder ruling R4:**

> **Four-Layer = Content / Form / Meta / Frame**, permanently reserved to
> `docs/canon/FOUR_LAYER_SUBSTITUTION.md`.
> **One canonical term, one canonical referent.**

Maven does not reuse the noun. The structure is renamed for **what the four things actually
do**: they confer **standing** — the authority by which material may be present, retained,
return, or be resumed.

| | Before | After |
|---|---|---|
| Model | "four-layer memory model" | **the Standing Model** |
| Members | "layers" | **standings** |
| File | `…_FOUR_LAYER_MEMORY_MODEL_…` | `…_STANDING_MODEL_…` (renamed via `git mv`) |

⭐ **"Layer" is dropped entirely, not merely re-prefixed.** That word is doubly claimed: by
`FOUR_LAYER_SUBSTITUTION.md` and by the twelve-layer continuity stack in
`MAIA_MEMORY_CANON_v1.0.md` §II. A name like *"four memory layers"* would have collided with
both. **"Standing" collides with neither and states the function.**

⚠️ **The name is this lane's selection under R4, not a founder-chosen word.** R4 ruled the
principle and left the term open ("*the constitutional principle is more important than the
final name*"). The term is confined to these programme records and no source identifier, so a
one-line founder ruling can still change it at zero cost. ⛔ Do not wire it into code before it
is confirmed.

---

## 1. The four standings

### 1.1 Encounter

**What must remain available right now for coherent interaction.** Ephemeral working context.

Examples: capability result set · current referent · selected object · pending confirmation ·
conversational focus.

### 1.2 History

**What happened in a retained interaction.**

> Stored does not imply future memory eligibility.

### 1.3 Memory

**What may legitimately return across encounters.** Requires governed standing.

### 1.4 Continuation

**What has standing to be deliberately resumed.** Requires explicit member authority or
canonical domain authority.

---

## 2. Governing law

> **Encounter supports presence.**
> **History records what happened.**
> **Memory governs what may return.**
> **Continuation governs what may be resumed.**

And:

> **No standing automatically grants the next.**

---

## 3. ⭐⭐ Relation to the twelve-layer continuity stack

`MAIA_MEMORY_CANON_v1.0.md` §II already stratifies MAIA's memory into **twelve layers** (turn ·
session · conversational · episodic · semantic · relational · developmental · pattern ·
somatic-affective · breakthrough · field/collective · meta).

**The two models are not competing, and the Standing Model does not replace the twelve.** They
measure different axes:

| | Axis | Question answered |
|---|---|---|
| **Twelve-layer continuity stack** (canon) | **CONTENT CLASS** | *What kind of memory is this?* |
| **The four standings** (NODE-15) | **STANDING / AUTHORITY** | *By what authority may this be here?* |

⭐ Any of the twelve content classes can hold any of the four standings. An episodic memory can
be Encounter-only (retrieved for this turn), History (recorded), Memory (eligible to return), or
Continuation (marked for resumption) — and which it holds is an authority question the
twelve-layer stack does not ask.

**Classification: REFINEMENT.** The Standing Model adds an axis. It does not contradict,
reorder, or deprecate the twelve layers. ⛔ Future work that treats it as a *replacement* for the
continuity stack is misreading both records.

---

## 4. ⭐ R1 makes the standings load-bearing

Founder ruling **R1** (START_FRESH) turns this model from a description into a mechanism:

> **Continuity may remain available without becoming present.**

The base chain may be **queried** — so `MAIA_MEMORY_CANON_v1.0.md` §II is satisfied — while the
retrieved material is **held outside generative context**, so no Memory standing is converted
into Encounter standing.

⭐⭐ **That is a crossing, and it is now named as one.** Memory → generative context is a
boundary transit, and R1 refuses it under START_FRESH. This places START_FRESH under the same
discipline as `lib/disclosure/disclosureBoundary.ts` rather than inventing a parallel one:
*availability is not permission.*

⛔ **The dangerous reading R1 forecloses:** MAIA claiming to start fresh while retrieved history
silently shapes the response. Under R1 that is not a tuning failure — it is an unauthorized
crossing.

---

## 5. Where the present substrate serves more than one standing

The repository's objects were built before this distinction existed, and several legitimately
carry more than one standing at once. ⛔ **Not a contradiction and not a defect** — a statement
about sequencing:

> **The present substrate serves more than one conceptual role. Future work must separate the
> authority semantics before changing storage.**

| Object | Standings presently blurred |
|---|---|
| `episodic_memories` (`lib/consciousness/memory/EpisodicMemoryService.ts`) | History **and** Memory — recorded event and returnable material in one row |
| member memory atoms (`lib/maia/memoryAtomsLoader.ts`, `return_preference`) | Memory eligibility is explicit here — ⭐ the **clearest existing ancestor** of standing 3 |
| conversation turns | Encounter **and** History — the context window is both working set and record |
| Changes (`lib/studio/changes/types.ts` `ChangeStatus`) | History **and** Continuation — lifecycle state doubles as resumption standing |
| Keeps (`app/api/sovereign/keeps/route.ts`) | History (object) **and** Memory (strong explicit standing) |

⛔ Naming these does not authorize separating them. Storage change is out of scope.

---

## 6. Repository ancestors, per standing

| Standing | Strongest existing ancestor | Note |
|---|---|---|
| **Encounter** | `lib/sanctuary/turnPosture.ts` | ⭐ Already enforces *per-turn* rather than per-session authority, with a private constructor so a posture cannot be forged downstream. The strongest structural precedent in the model. |
| **History** | `app/api/sovereign/studio/history/route.ts` doctrine | *"never reads current state — every act is an immutable record"* |
| **Memory** | `lib/maia/memorySelectionPolicy.ts` + `return_preference` + `lib/anchor/surfacePreference.ts` | Eligibility already consent-bounded and version-governed |
| **Continuation** | `ChangeStatus` lifecycle; `lib/navigation/houseReturn.ts` | Domain state already confers factual return standing |

⚠️ **Honest limit.** `memorySelectionPolicy.ts` also declares what continuity currently *is*:
*"Current operational continuity is provided through recent conversational context only… does
not constitute durable relational memory."* The Standing Model describes an architecture of
standing; it does not assert that durable relational memory presently exists.

---

## 7. Standing of this record

CANDIDATE · derivation beneath `MAIA-MAVEN-01` · renamed under **R4**, term subject to founder
confirmation · REFINEMENT of `MAIA_MEMORY_CANON_v1.0` §II, not a replacement · **R1** applied at
§4 · ⛔ no storage, schema or retrieval change authorized · production UNTOUCHED.
