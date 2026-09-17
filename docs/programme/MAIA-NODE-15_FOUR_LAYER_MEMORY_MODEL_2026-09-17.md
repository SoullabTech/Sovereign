# MAIA-NODE-15 — FOUR-LAYER MEMORY MODEL

**Status:** CANDIDATE. Derivation record beneath `MAIA-MAVEN-01`.
**Lane:** `MAIA-MAVEN-CANON-01` — documentation only. ⛔ Implementation NOT AUTHORIZED.
**Date:** 2026-09-17

---

## ⚠️ 0. Naming hazard — read before citing this record

The phrase **"four-layer"** is already taken in ratified canon.
`docs/canon/FOUR_LAYER_SUBSTITUTION.md` defines **Content / Form / Meta / Frame** — a doctrine
for discriminating Anthropic-default behaviour wearing MAIA vocabulary. It has nothing to do
with memory.

⛔ **Never cite this record as "the four layers" without qualification.** Always write
*"the four-layer memory model (NODE-15)"* or *"the memory standing layers"*. A future session
reading a bare "four layers" in a commit message or prompt could load the wrong doctrine.

⭐ A renaming to **Memory Standing Layers** would remove the hazard structurally. That is a
founder decision, recorded as available and not taken here.

---

## 1. The four layers

### 1.1 Encounter

**What must remain available right now for coherent interaction.** Ephemeral working context.

Examples: capability result set · current referent · selected object · pending confirmation ·
conversational focus.

### 1.2 Conversation History

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

> **No layer automatically grants standing in the next.**

---

## 3. ⭐⭐ Relation to the 12-layer continuity stack — the decisive reconciliation

`docs/canon/MAIA_MEMORY_CANON_v1.0.md` §II already stratifies MAIA's memory into **twelve
layers** (turn · session · conversational · episodic · semantic · relational · developmental ·
pattern · somatic-affective · breakthrough · field/collective · meta).

**These two models are not competing, and NODE-15 does not replace the twelve.** They measure
different axes:

| | Axis | Question answered |
|---|---|---|
| **12-layer continuity stack** (canon) | **CONTENT CLASS** | *What kind of memory is this?* |
| **4-layer standing model** (NODE-15) | **STANDING / AUTHORITY** | *By what authority may this be here?* |

⭐ Any one of the twelve content classes can sit at any of the four standing layers. An episodic
memory can be Encounter-only (retrieved for this turn), History (recorded), Memory (eligible to
return), or Continuation (marked for resumption) — and which it is, is an authority question the
twelve-layer stack does not ask.

**Classification: REFINEMENT.** NODE-15 adds an axis. It does not contradict, reorder, or
deprecate the twelve layers. ⛔ Any future work that treats NODE-15 as a *replacement* for the
continuity stack is misreading both records.

---

## 4. Where the present substrate serves more than one role

The repository's current objects were built before this distinction existed, and several
legitimately carry more than one standing role at once. ⛔ **This is not a contradiction and
not a defect.** It is a statement about sequencing:

> **The present substrate serves more than one conceptual role. Future work must separate the
> authority semantics before changing storage.**

Observed multi-role objects:

| Object | Roles presently blurred |
|---|---|
| `episodic_memories` (`lib/consciousness/memory/EpisodicMemoryService.ts`) | History **and** Memory — recorded event and returnable material in one row |
| member memory atoms (`lib/maia/memoryAtomsLoader.ts`, `return_preference`) | Memory eligibility is explicit here — ⭐ the **clearest existing ancestor** of layer 3 |
| conversation turns | Encounter **and** History — the context window is both working set and record |
| Changes (`lib/studio/changes/types.ts` `ChangeStatus`) | History **and** Continuation — lifecycle state doubles as resumption standing |
| Keeps (`app/api/sovereign/keeps/route.ts`) | History (object) **and** Memory (strong explicit standing) |

⛔ Naming these does not authorize separating them. Storage change is out of scope.

---

## 5. Repository ancestors, per layer

| Layer | Strongest existing ancestor | Note |
|---|---|---|
| **Encounter** | `lib/sanctuary/turnPosture.ts` | ⭐ Already enforces *per-turn* rather than per-session authority, with a private constructor so a posture cannot be forged downstream. The strongest structural precedent in the model. |
| **History** | `app/api/sovereign/studio/history/route.ts` doctrine | *"never reads current state — every act is an immutable record"* |
| **Memory** | `lib/maia/memorySelectionPolicy.ts` + `return_preference` + `lib/anchor/surfacePreference.ts` | Eligibility is already consent-bounded and version-governed |
| **Continuation** | `ChangeStatus` lifecycle; `lib/navigation/houseReturn.ts` | Domain state already confers factual return standing |

⚠️ **Honest limit.** `memorySelectionPolicy.ts` also declares what continuity currently *is*:
*"Current operational continuity is provided through recent conversational context only… does
not constitute durable relational memory."* NODE-15 describes an architecture of standing; it
does not assert that durable relational memory presently exists.

---

## 6. Standing

CANDIDATE · derivation record beneath `MAIA-MAVEN-01` · REFINEMENT of `MAIA_MEMORY_CANON_v1.0`
§II, not a replacement · naming hazard OPEN · ⛔ no storage, schema or retrieval change
authorized · production UNTOUCHED.
