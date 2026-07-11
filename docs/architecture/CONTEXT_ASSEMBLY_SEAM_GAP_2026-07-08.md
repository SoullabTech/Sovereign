# Context Assembly — Seam-Gap Note

**Date:** 2026-07-08
**Status:** Substrate report (verified structural finding, code audit — not production-behavior verified).
**Type:** Not canon. Not a plan. A statement of *where the mechanism actually lives today*, so the companion candidate invariant ([[CONTEXT_ASSEMBLY_INVARIANT_CANDIDATE_2026-07-08]]) cannot pretend to be enforceable before its substrate exists.
**Companion:** verified finding documented in [`WHAT_NOW_ENCOUNTER_INTELLIGENCE_AUDIT_2026-07-08.md`](./WHAT_NOW_ENCOUNTER_INTELLIGENCE_AUDIT_2026-07-08.md).

---

## Why this note exists

The candidate invariant says *every encounter surface must obtain MAIA through AIN OS Context Assembly.* That rule is only meaningful if "AIN OS Context Assembly" names a thing. Today it names a **fragment**, not a subsystem. Writing the rule without writing this note would let a governance truth outrun its mechanism — the exact drift this project refuses. This note is the honest precondition that travels with the rule.

---

## The three states of assembly today (verified by code audit)

Context assembly — the act of deciding *where am I, who am I with, what memories matter, what boundaries apply* before the model is called — currently exists in **three different states across three surfaces**. There is no single owner.

| Surface | Where assembly lives | State |
|---|---|---|
| **Main `/maia`** (`app/api/sovereign/app/maia/list/route.ts`) | **Inlined in the route** (~lines 249–1008): memory bundle, atoms, BaZi, astrology, cognitive profile + field safety, practice field, relationship anamnesis — assembled locally, then handed as a finished `meta` object to `getMaiaResponse()`. | Rich, but **route-owned**, not extracted. |
| **Living Field** (`lib/maia/living-field/encounterContext.ts`) | **Partially extracted** into a shared module — *"Shared context assembly for the Living Field's conversational surfaces… context assembly, not synthesis."* | A real first extraction, but **scoped to Living Field surfaces only.** |
| **What Now?** (`app/api/now-what/interview/route.ts`) | **Bespoke thin inline prompt** — `TWELVE_DISCIPLINES` + `RESPONSE_GRAMMAR` + one `PHASE_LENS` line, ~770 static tokens + transcript, then `getLLMProvider().generateSimple()` directly (line 319). | ⚠️ **STALE as of `75b130ae3` — see Extraction-read update below.** Was context-zero; now composes a **third bespoke assembler** (`assemblePresenceContext`), flag-gated. |

## The load-bearing facts

1. **`buildMaiaRuntimeContext` is not the assembly subsystem.** It *consumes* an already-assembled context and validates it; it does not *own* assembly. (Documented separately as the "observer, not orchestrator" seam.) Enforcing the invariant is not "call `buildMaiaRuntimeContext`" — the thing to call does not yet exist as a universal entry.

2. **`generateSimple()` adds nothing.** Per the audit, it is a pure passthrough — no base preamble, no memory, no tools. Whatever the *caller* assembles is the entire world the model receives. So What Now?'s thinness is total, not partially backstopped.

3. **A partial extraction already exists and is the correct seed.** `encounterContext.ts` proves the extraction is feasible and that the vocabulary + authority discipline ("context assembly, not synthesis") are already in place. The subsystem is not a green field — it is a **generalization of an existing Living-Field-scoped module up to an AIN OS primitive.**

## What the invariant therefore depends on (the extraction path — NOT authorized here)

The invariant becomes enforceable only after Context Assembly is a single shared entry that:
- both `/maia` and What Now? (and future surfaces) call, and
- generalizes `encounterContext.ts` beyond the Living Field, and
- includes the **constitutional envelope** (governance + capability selection), not only situational context — otherwise "context" quietly smuggles governance.

Until that extraction is designed and understood, the invariant holds **Candidate** status only. This note does not authorize the extraction; it names it.

---

## Extraction-read update (2026-07-08, later same day) — the falsifier, answered

Ran the read the docs called for: `encounterContext.ts`, `/maia` route, and What Now? side by side. Two results, one of which corrects the table above.

### Correction: What Now? is no longer context-zero
Commit **`75b130ae3`** ("Stage 1 MAIA presence — reconnect room to constitutional runtime (flagged, ephemeral)", 2026-07-08, **committed, clean tree**) reconnected the room. On `PRESENCE_ENABLED && mode==='turn'` it now composes `MAIA_RUNTIME_PROMPT` + `assemblePresenceContext(memberId, message)` + the room's own prompt. So the "verified finding" of context-zero is now **historically true but temporally stale** — it describes the room before `75b130ae3`. The audit doc is not wrong; it is dated.

### The four-implementation reality
`assemblePresenceContext` (now-what, lines ~297–340) is a **third** private assembler. It hand-composes: `loadRecentDevelopmentalMemories` + `loadRecentThemeSignals` → `buildMemoryInfluencePlan`; `loadMemberMemoryAtomsForPrompt` → `formatAtomsForPrompt`; `loadPriorCrossSessionExchanges` → `formatPriorExchangesForPrompt`. This is **the drift the candidate invariant names, caught live** — a surface growing its own conversational intelligence rather than calling a shared one.

### The falsifier — *does it generalize without new primitives?* — provisional YES, with a correction to the seed
- **YES, no new primitives are required.** `assemblePresenceContext` is built **entirely** from loaders that already exist and that `/maia`'s route also composes. It is a working proof that a shared assembly can be stood up for a new surface with zero new primitives.
- **BUT the seed is not `encounterContext.ts`.** That module is **field-scoped by signature** (`buildEncounterContext(memberId, fieldKey)`) and queries Living-Field tables directly (`personal_living_field_sources`, `member_living_field_affinity`, field expression/history/states). A non-field surface (What Now?, main `/maia`) cannot adopt it without a synthetic `fieldKey` and unused joins. It is a *surface-specific composition at the wrong altitude*, not the universal base.
- **The real convergence layer already exists: the memory-loader / orchestrator set** (`memoryLoaders`, `memoryOrchestrator`, `memoryAtomsLoader`, `conversationalRecallBlock`). Both `/maia` **and** `assemblePresenceContext` already compose these same functions. The extraction is therefore **not** "generalize `encounterContext` up" — it is "define one Context Assembly entry that composes the existing loader primitives + the constitutional envelope (`MAIA_RUNTIME_PROMPT`), parameterized by a Field Configuration/profile, and route all three surfaces through it." `encounterContext.ts` becomes a *caller* of that entry, not its ancestor.

**Net:** the invariant is more urgent (drift is committed and flag-gated toward deploy), and the extraction path is now concrete and primitive-free — a *convergence* of three existing compositions onto one entry, not a green-field build.

> **Checkpoint (2026-07-08).** Provisional yes: Context Assembly generalizes through the shared loader/orchestrator layer, not through `encounterContext.ts`. The next build is not to promote the Living Field extractor, but to converge private assemblers behind one parameterized Context Assembly entry.
>
> *Deliberately not traced (different question, not needed for the falsifier): `PRESENCE_ENABLED` production state, and the constitutional-envelope half (governance/capability selection). Both are pre-deploy / pre-felt-encounter concerns, not extraction-read concerns.*

---

## Implementation pass 1 (2026-07-08) — interface-first, one embodiment

Approach (per Kelly's guidance): the extraction target is an **interface, not an implementation**. No assembler is promoted; the smallest contract all three can honestly satisfy *without changing behavior* is derived from their common output shape (named blocks + provenance + emptiness signal) and the callers become its clients.

- **Interface defined (additive, zero behavior change):** `lib/maia/context-assembly/contextAssembly.ts` — `AssembledBlock`, `AssembledContext`, `ContextAssembler<Profile>`, plus `assembledContext()` / `renderAssembledContext()` helpers. Asserts zero authority. This file is the invariant; callers are embodiments.
- **First embodiment (behavior-preserving):** `assemblePresenceContext` (What Now?, the freshest duplication) now builds `AssembledBlock[]` from the shared loader layer and renders via `renderAssembledContext()`. Output is **byte-identical** — same blocks, same order, same `\n\n` join; the only addition is provenance keys that never reach the prompt text. Chosen first because it is the safest client (flag-gated `PRESENCE_ENABLED`, ephemeral, read-only).
- **Verification:** project typecheck clean on both touched files (baseline errors elsewhere unchanged). Not browser-observable (API route + lib); no preview.
- **Not touched (next, harder adopters):** `/maia`'s order-sensitive `addenda` (the real test — per-block boundaries like `SYMBOLIC_LENS_BOUNDARY`, ordering handed to `buildMaiaRuntimeContext`) and `encounterContext.ts` (field-scoped). These convergences are where the interface either holds or teaches us something — deferred deliberately, not forgotten.

**Standing after pass 1:** the interface exists and has one honest client. It has *not* yet earned enforcement — that requires `/maia` adopting it without behavior change. Still CANDIDATE. Commit remains held pending review.

## What is NOT proven / open

- This is a **structural** audit (three read-only code traces). It is not production-behavior verified.
- The scope boundary of "encounter surface" vs. MAIA's *internal* multi-agent substrate (Corpus Callosum voices, reviewer, elemental agents) is asserted, not yet tested against every caller.
- Whether `encounterContext.ts` can generalize without new primitives is the open design question — and is itself the falsifier for the AIN OS Field-tenancy candidate.
