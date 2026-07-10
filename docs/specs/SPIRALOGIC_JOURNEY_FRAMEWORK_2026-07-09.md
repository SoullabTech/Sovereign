# Spiralogic Journey Framework — the fixed spine, the pathway, and the living difference

**Date:** 2026-07-09 · **Status:** FRAMEWORK CANDIDATE (doc only — authorizes nothing; each build step below is its own gate)
**Companion:** `docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_2026-07-09.md` (the extraction this framework is built on)
**Kelly's directive:** *"Move this into a framework to integrate into soullab.life/journey. This can become our Gene Keys."*

---

## 1. The thesis

Gene Keys works because of three structural properties, not its content:

| Gene Keys property | What it is | Spiralogic equivalent |
|---|---|---|
| **Fixed addressing scheme** | 64 hexagrams mapped deterministically to natal positions — same inputs, same profile, every time | Chart → Spiralogic registration (elements, phases, facets) computed by code, never by LLM |
| **Contemplation pathway** | The Golden Path — the profile isn't the product; the *sequence through it* is | The Journey — a composed developmental pathway through the member's own registered profile (`docs/methodology/JOURNEY_COMPOSITION_GUIDE_2026-07-07.md`) |
| **Disciplined constraint** | Rudd never moved the I Ching spine; the synthesis feels alive because the skeleton is rigid | Canon: the registration grammar is the spine that never moves; LLM variation is bounded and leashed; claim discipline governs every surface |

**The category difference we hold that Rudd cannot:** Gene Keys' output is a static PDF contemplated alone. Ours is held by MAIA — the profile becomes standing context for an ongoing relationship. Gene Keys gives you a map and leaves. *The map here is carried by a companion who walks with you* — within sovereignty invariants (no dependency capture, no authority, upward-only meaning).

---

## 2. What exists today (honest inventory — Live / Built-unwired / Doc)

**LIVE:**
- `/journey` route (`app/journey/page.tsx`) — free tier (`config/accessMatrix.ts:250`), renders `SpiralogicEvolutionaryReport`, `ElementalBalanceDisplay`, `SacredHouseWheel`, `BirthDataForm` — **already fed by the deterministic path** (`lib/astrology/engines/spiralogicEngine.ts`, `spiralogicHouseMapping.ts`).
- Soul Portrait, Studio/practice embodiment (deployed `243517c62`, 2026-07-08).
- Sovereign chart computation: `lib/astrology/ephemerisCalculator.ts` (astronomy-engine, in-process, zero external calls).

**BUILT-UNWIRED:**
- `spiralogicEngine.ts` exists but is **not** in the portrait generator's call path — the generator's registration is currently performed by the LLM in prose (Registration Grammar spec, finding C1 — the headline gap).
- Portrait consent substrate (Gate 2 tables merged; Gate 3 helper built, PR #564 unmerged; Gate 4 unbuilt).

**DOC ONLY:**
- Journey Composition Guide (the pathway grammar); Registration Grammar spec with findings lists A (16 latent bugs), B (8 degrees of freedom), C (6 fuzzy-determinism cases); two-embodiments decision (Personal Portal unbuilt).

**The structural insight:** the fixed addressing scheme, the contemplation surface, and the literary reading all exist — *as three unjoined pieces*. `/journey` has the deterministic spine but not the portrait's depth. The portrait has the depth but not the spine. The framework is the joining, not new invention.

---

## 3. The framework — three layers

### Layer 1 — The Fixed Spine (deterministic registration)
One registration function, one source of truth: **birth data → `calculateBirthChart` → `spiralogicEngine` → registered Spiralogic profile.** Same inputs, same profile, everywhere it appears — `/journey`, Soul Portrait, MAIA context. This is the falsifiability claim: identical birth data yields identical registration, testably.

Preconditions (from Registration Grammar findings, each a decision or fix before the spine can be declared):
1. Reconcile the two divergent elemental-balance implementations (finding A10) — one canonical weighting.
2. Name aether's status (finding C4): it has no chart-registration rule anywhere in code — either author the rule (deterministic) or declare aether a named degree of freedom (the emergent fifth, LLM-read but labeled as such). **Kelly's call; the grammar spec's Open Questions section holds it.**
3. Triage list A (latent bugs: boundary placements, truncation-by-insertion-order, echo-without-reconciliation).

### Layer 2 — The Contemplation Pathway (the Journey)
The profile is not the product; the *journey through it* is. Composed per the Journey Composition Guide: the member's registered profile becomes the territory, and the journey is a sequenced contemplation through their own elemental structure — station by station, element by element, at the member's pace.

Constitutional shape (where we diverge from Gene Keys *on purpose*):
- **Member-paced, member-pulled** — the Golden Path is Rudd's sequence imposed on everyone; ours is invitational, and the member may loop, skip, and return freely (developmental process is non-linear; only *authority* is one-directional).
- **Mirror, never verdict** — the registration describes a structure, not a destiny. No diagnosis, no certainty simulation, no "your purpose is X." The profile is a lens the member looks *through*, not a truth pronounced *over* them.
- **The member's language wins** — registration provides vocabulary; it never overwrites the member's own meaning (Invariant 14).

### Layer 3 — The Living Difference (MAIA holds the map)
The registered profile + portrait as standing context MAIA carries into conversation — the layer Gene Keys structurally cannot have. Immutable core (write-once, already in schema) + mutable relational layer whose update semantics are the one genuinely open design question. Gated behind Gates 3/4 and the two-embodiments Personal Portal decision. **This layer ships last and earns its way in** — the spine and pathway must be real first, or MAIA would be carrying an unverified map.

---

## 4. Build sequence (dependency order; each step its own explicit gate)

**Amended 2026-07-09 (Kelly): canonicalize BEFORE wire.** Wiring the engine into the portrait first would make the flagship artifact inherit the engine's current unreconciled state (dual balance implementations, uncoded aether, unratified dominance rule) — and then canonicalization would change the ground truth underneath already-generated portraits. Under the grammar's own versioning logic, the spine must be canonical (conformance suite passing, `grammar_version` stamped) before it becomes ground truth for anything member-facing.

1. **Canonicalize the spine (conformance, not greenfield).** The grammar spec's role is a **conformance suite, not a build spec** — `spiralogicEngine.ts` already exists and runs on `/journey`; a fresh build would rebuild live capability (the worklist's item-1 mistake, one layer up). Delegation prompt (corrected Part D): *"Here is the registration grammar spec. Write the conformance test suite from its invariants and ratified decisions, run it against `spiralogicEngine.ts` as-is, and report every failure classified as spec-hole / engine-bug / undocumented-decision."* This run IS the A10 reconciliation and produces the registration test suite (the tests ARE the addressing scheme, executable). Ratify or overturn each undocumented-decision finding; stamp `grammar_version`.
   - **Precondition — Q1/Q6 (dominance): RATIFIED = C (Kelly, 2026-07-09)** — distribution-only with fence; the grammar records distribution as ground truth, dominance is an interpretive claim governed by a single versioned rule all renderers consume, and the rule may return `none`. Ratification recorded verbatim in `SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md`. "Passing" for dominance behavior is therefore defined: the grammar layer emits no crown; per-renderer crowns are undocumented-decision findings slated for removal. **Collision, verified in code 2026-07-09:** dominance is currently computed *per-renderer at least three times* — `spiralogicEngine.ts:108-114` (`dominant: sorted[0]`), `app/journey/page.tsx:1868` (inline reduce), `components/astrology/ElementalBalanceDisplay.tsx:55-56` (own reduce) — exactly what the C-fence forbids ("dominance defined ONCE in a versioned interpretive rule all renderers consume"). Under C these relocate to the versioned interpretive layer; the conformance run must flag each as undocumented-decision, not grandfather them.
2. **Wire the spine into the portrait**: canonical `spiralogicEngine` output into `generatePortrait.ts` — computed registration becomes ground truth injected into the prompt; the LLM elaborates but cannot contradict; echoed placements reconciled against the computed chart (fixes C1 + C3). *Code change — needs its own go; generator deploy hold stands.*
3. **One spine, two surfaces**: `/journey` and the portrait render from the identical registration object (and, under C, the identical dominance rule). A member's journey page and their portrait can never disagree about their structure.
4. **Compose the first contemplation journey**: per the Journey Composition Guide's "proving journey" pattern — smallest unit exercising the whole constitution. The member's registered profile as territory; elemental stations; member-paced.
5. **MAIA-held profile** (Layer 3): after Gates 3/4, after Personal Portal consent shape is designed. Update semantics spec'd before any write path exists.

**Filing note:** two near-same-named specs now exist — this extraction's companion `SPIRALOGIC_REGISTRATION_GRAMMAR_2026-07-09.md` (code-as-found audit) and the parallel thread's `SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md` (uncommitted; normative grammar, Q0/Q2 decided, INVs, Part D). They are complementary (descriptive vs normative) but the names must be reconciled before either is cited as "the grammar spec."

Rejected en route (recorded so it stays rejected): no Swiss Ephemeris container (astronomy-engine already sovereign); no KuzuDB (Postgres-only invariant); no unbounded LLM registration (the current state, being retired by step 1).

---

## 5. The claim, in claim-discipline vocabulary

- **Live today:** deterministic chart computation; `/journey` rendering the deterministic report; Soul Portrait practice embodiment.
- **Designed:** the fixed spine unification (steps 1–3); the contemplation journey (step 4).
- **Vision:** MAIA carrying the living profile (step 5); the Personal Portal embodiment; *"our Gene Keys"* as the outward name for the whole.

We do not tell tomorrow's story as if it were today's: today we have the organs; the framework is the circulatory system, and it is **Designed**, not Live.
