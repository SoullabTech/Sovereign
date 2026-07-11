# Candidate Invariant — Context Assembly as the OS⇄Intelligence Contract

**Date:** 2026-07-08
**Status:** **CANDIDATE** — governance standing, no implementation. Not ratified. Not enforceable today (see precondition).
**Type:** Candidate constitutional invariant. Governs the boundary where a human meets MAIA, not MAIA's internal cognition.
**Depends on:** [[CONTEXT_ASSEMBLY_SEAM_GAP_2026-07-08]] (the substrate this rule waits on).
**Grounds in:** verified finding [`WHAT_NOW_ENCOUNTER_INTELLIGENCE_AUDIT_2026-07-08.md`](./WHAT_NOW_ENCOUNTER_INTELLIGENCE_AUDIT_2026-07-08.md).

---

## The three statuses, kept distinct (do not collapse)

The value of this document is the separation. Collapsing any two of these into one is the drift it exists to prevent.

### 1. Verified finding — *what was true, and what is now true*
**As audited (pre-`75b130ae3`):** What Now? constructed a thin, **context-zero** MAIA path — a ~770-token static inline prompt + transcript through `getLLMProvider().generateSimple()` (a pure passthrough), no memory/atoms/profile/relationship/field.
**As of `75b130ae3` (2026-07-08, committed, flag-gated):** the room now composes `MAIA_RUNTIME_PROMPT` + a **new bespoke `assemblePresenceContext()`** — a *third* private assembler built from existing shared loaders. So the surface is still **constructing its own conversational intelligence** — the violation the invariant names is not gone, it has *moved up a level* from "no context" to "privately re-assembled context." *(Structural finding — code audit, not production-behavior verified. See [[CONTEXT_ASSEMBLY_SEAM_GAP_2026-07-08]] §Extraction-read update.)*

### 2. Seam-gap — *why the rule is not yet enforceable*
The real MAIA assembly exists but is **inlined inside `app/api/sovereign/app/maia/list/route.ts`** (~lines 249–1008), and a **partial extraction** exists for the Living Field only (`lib/maia/living-field/encounterContext.ts`). **`buildMaiaRuntimeContext` is not yet the assembly subsystem** — it consumes an assembled context, it does not own assembly. There is no single shared entry to route through. *(See seam-gap note for the three-state table.)*

### 3. Candidate invariant — *the governance truth we are proposing*
> **No encounter surface constructs its own conversational intelligence. Every encounter surface obtains MAIA through AIN OS Context Assembly.**

This is a **candidate**, not ratified canon. It states the contract we intend; it does **not** claim the contract is currently kept or currently keepable.

---

## What the invariant means (and does not)

- **"Encounter surface"** = a place where a human meets MAIA (What Now?, Living Field, Vision Studio, Relationship Spaces, a partner platform like Larry's Green Paw). It does **not** mean MAIA's internal multi-agent substrate (Corpus Callosum voices, reviewer, elemental agents) — those are MAIA's cognition, not surfaces.
- **"Conversational intelligence"** = the assembled world + the constitutional envelope the model wakes into. A surface may decide *presentation and entry*; it may not manufacture *the intelligence*. This is the [[project_constitutional_direction_of_authority]] rule at the OS boundary: a surface may **situate** (provide context upward), never **synthesize** (manufacture higher-order meaning).
- **"AIN OS Context Assembly"** = the (not-yet-extracted) single subsystem that answers: where am I · who am I with · what relationship exists · what memories matter · what tools are available · what developmental state exists · **what governance and capabilities apply** · what constitutional boundaries bind. Assembly must include the constitutional envelope, or "context" smuggles governance.

## Why this is the load-bearing insight, not a room fix

The contract, kept, means **one MAIA, many contexts** — every present and future surface inherits the same coherent intelligence rather than speciating its own parallel engine. It reframes open questions already held elsewhere:
- **Larry does not need another MAIA — he needs a Context Assembly profile** (Green Paw: audience, purpose, language, tools, governance, relationship = advisor). The intelligence is unchanged; the world she wakes into differs. This is the [[project_ain_os_field_tenancy_candidate]] falsifier — *can a second platform stand up without new primitives?* — answered in the affirmative **only after** the extraction makes profiles a real seam.
- Fixing only What Now? would satisfy nothing structural. The rule's whole point is that the fix is an **extraction**, done once, inherited by all.

## Explicit non-claims (the anti-inflation guard)

- This invariant is **not enforceable today.** Enforcement requires extracting Context Assembly into a shared subsystem first (see seam-gap §"extraction path"). That extraction is **not authorized by this document.**
- This document authors **no code** and mandates **no refactor.**
- Ratification is deliberately deferred: **draft-then-sit.** Ratify only after the extraction path is understood — i.e., after we know whether `encounterContext.ts` generalizes without new primitives.

## Path to ratification (sequence, not schedule)

1. Sit with this framing (current step).
2. Design the extraction: generalize `encounterContext.ts` → AIN OS Context Assembly, main `/maia` route as first caller, envelope (governance + capabilities) included.
3. Confirm the Field-tenancy falsifier: a second surface/profile obtained with **no new primitives**. — *Provisional YES (2026-07-08): `assemblePresenceContext` proves a new surface can assemble from existing loaders with zero new primitives. Corrected seed: the convergence layer is the **memory-loader/orchestrator set**, not `encounterContext.ts` (which is field-scoped). See seam-gap §Extraction-read update.*
4. Only then: ratify the invariant into `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` and enforce (What Now? becomes the first surface migrated onto the subsystem, not patched in place).
