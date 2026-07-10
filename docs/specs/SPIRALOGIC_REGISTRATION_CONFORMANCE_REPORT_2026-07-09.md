# Spiralogic Registration Grammar — Conformance Report
**Date:** 2026-07-09
**Spec:** `docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md` (Q6 RATIFIED = Option C)
**Target (AS-IS, zero changes):** `lib/astrology/engines/spiralogicEngine.ts`
**Suite:** `__tests__/spiralogic-registration-conformance.test.ts` — run via jest (`ts-jest`, repo `jest.config.js`)
**Result:** 37 tests — **23 passed · 12 failed · 2 todo** (todos = not-testable-at-this-layer, per method)

Tests were derived from the spec's sign table, INV-1..8, ratified decisions and proposed defaults — not from engine behavior (no grandfathering). One `[DOC]`-prefixed test pins observed tie behavior for citation; it is labeled non-conformance.

## Per-INV verdict table

| INV | Verdict | Evidence |
|---|---|---|
| INV-1 Determinism | **PARTIAL** | Identical input → deep-equal output: PASS. Version identity: FAIL — no `grammar_version` anywhere (Finding 6). |
| INV-2 Totality | **PARTIAL** | Element axis of the Q2 sign table: 12/12 signs conformant (`SIGNS_TO_ELEMENT`, spiralogicEngine.ts:14-27). Q1 closed set: PASS (Chiron/North Node excluded from the balance loop despite `PLANET_WEIGHTS` entries). Phase axis: FAIL — no phase concept exists (Finding 1). Q5 weights: FAIL (Finding 2). Unknown-sign bodies vanish silently: FAIL (Finding 5). |
| INV-3 Output shape | **FAIL** | No `distribution`/`grammar_version`/`mode` (Findings 1, 6); interpretive content emitted from registration layer (Finding 7); lossy percent normalization — proven fixture sums to 99 (Finding 4). |
| INV-4 Ontology-closed | **PARTIAL** | Element vocabulary closed over {fire,water,earth,air}: PASS. Phase vocabulary: FAIL — emits `vector`/`circle`/`spiral` (Finding 8). Dominance crown emitted: FAIL, pre-flagged (Finding 3). |
| INV-5 Cusp determinism | **NOT TESTABLE AT THIS LAYER** | Engine consumes pre-resolved sign strings; longitude→sign lives upstream in unexported `longitudeToZodiac` (`lib/astrology/ephemerisCalculator.ts:78-89`). Assertable slice (sign passthrough; degree cannot flip registration; 29°59′59.99″ and 0°00′00″ fixtures): PASS. Upstream observation recorded below. |
| INV-6 Degraded input explicit | **FAIL** | No `mode` field, no `moonUncertain`, missing body = silent skip (`if (planet.data?.sign)`, :91) (Findings 5, 6). |
| INV-7 No aether metric | **PASS** | Recursive scan: no numeric `aether` or `coherence` key anywhere in the result. `coherencePractices` is prose, not a metric — the *name* is noted under Finding 7, but the constitutional guard (no computed value) holds. |
| INV-8 Two provenance axes | **NOT TESTABLE HERE** | Binds at the portrait schema (Gate 3). The function-level slice — emitting `grammar_version` at all — fails under INV-1/INV-3. |

## Findings

Classification counts: **undocumented-decision 7 · engine-bug 2 · spec-hole 3.**
Each finding also carries the structural-absence vs computational-divergence distinction.

### Undocumented-decision

1. **No 12-phase registration exists — the 4×3 grammar is structurally absent.** `spiralogicEngine.ts:14-27, 74-117`. Modality (cardinal/fixed/mutable) appears nowhere; the engine collapses the spec's core object (weight per 12 phases) into a 4-element balance, so Aries/Leo/Sagittarius are indistinguishable. *(structural absence — the single largest gap.)*
2. **Non-equal planet weighting.** `spiralogicEngine.ts:59-72` (`PLANET_WEIGHTS`: Sun/Moon 3, Jupiter/Saturn 2, Venus/Mars 1.5, Mercury/outers 1). Diverges from Q5's proposed default (all 1.0) and is itself an unratified, unversioned weighting scheme — exactly what Q5 says requires its own ratification. *(computational divergence.)*
3. **Dominance/deficiency crowns — pre-flagged per delegation contract.** `spiralogicEngine.ts:108-116` (`dominant: sorted[0]`, `deficient: sorted[last]`); on an exact tie the crown falls to element-array insertion order (fire beats water — pinned by the `[DOC]` test). Both renderer-local crowns verified still present: `app/journey/page.tsx:1868-1869` (inline `reduce`) and `components/astrology/ElementalBalanceDisplay.tsx:55-57` (own `reduce`). Under Q6=C all three are relocated to the single versioned interpretive rule. `deficient` is never mentioned in the spec at all — same class. *(computational divergence at :108; the renderer crowns are the fence's target.)*
4. **No provenance or degradation vocabulary.** `SpiralogicEngineResult` (:45-54) has no `grammar_version`, `mode`, `moonUncertain`, or input fingerprint — a v-current profile is indistinguishable from any past or future one, and degraded input is inexpressible. *(structural absence.)*
5. **Interpretive content emitted from the registration layer.** `coherencePractices` (:119-159, prescriptive prose), `currentPhase` (:224-236 — element derived from *house* facets, not sign registration), `activeFacets` (house-based, though Q7 rules houses moot for registration). Violates the spec's registration-vs-modulation hierarchy: interpretation "never [belongs] to the base profile." *(structural — the engine is an interpretive renderer wearing a registration name.)*
6. **Competing phase ontology.** `currentPhase.stage ∈ {vector, circle, spiral}` (via `SPIRALOGIC_FACETS`, `lib/astrology/spiralogicMapping.ts:32ff`) — vocabulary outside the closed {1,2,3} ontology, keyed to houses rather than modality. *(structural — a second "phase" concept the spec does not know about.)*
7. **Interface divergence.** `runSpiralogicEngine(intake, birthChart?)` is async, requires an unused-for-balance `AstrologyIntake`, and returns `null` on missing chart — vs the spec's pure sync `registerChart(positions) → SpiralogicProfile`. *(structural, minor.)*

### Engine-bug

8. **Lossy, non-conserving normalization.** `spiralogicEngine.ts:99-106`: raw weights are destroyed by `Math.round` into percentages; proven fixture (fire 5.5 / water 5.5 / earth 5 / air 1 of 17) yields 32+32+29+6 = **99**. Derivations (`dominant`/`deficient`) are computed *after* rounding. Consequence: the distribution is not a weight object, doesn't sum to its own whole, and near-ties can be created or erased by rounding before crowning.
9. **Silent drop of missing or unknown-sign bodies.** `spiralogicEngine.ts:90-97` (`if (planet.data?.sign)` + unmatched `SIGNS_TO_ELEMENT` lookup): a body with no sign or a typo'd sign (`"Ophiuchus"`) contributes nothing — no throw, no flag. Consequence: a 9-body chart silently masquerades as a total registration, violating INV-2 and INV-6's "never a silent guess."

### Spec-hole

10. **`ChartPositions` input type and the Moon-branch input contract are undefined.** The spec's `registerChart(positions)` never defines `positions`, and Q4's both-branch rule requires an input that can carry *two* Moon positions — no shape is specified for who computes the branches or how they arrive. Consequence: Q4 conformance cannot be tested end-to-end until the input contract is authored.
11. **Out-of-vocabulary input behavior unspecified.** The sign table is "closed and total over the zodiac," but the spec doesn't say what `registerChart` does with input outside it (throw vs explicit degradation flag). The suite accepted either; the engine does neither. Consequence: Finding 9's *fix* is currently unspecifiable.
12. **"Input fingerprint" is named but never defined** (Q6: "plus `grammar_version`, `mode`, and input fingerprint") — no algorithm, field list, or stability rule; likewise the distribution's serialization (raw weights vs normalized; key naming) is unspecified. Consequence: INV-1's byte-for-byte claim has no canonical byte representation to hold it to.

### Upstream observation (out of scope, recorded)

`lib/astrology/ephemerisCalculator.ts:78-89` (`longitudeToZodiac`, unexported): sign via `Math.floor` is correctly half-open (29.9999972° → Aries), but `degree: Number(degree.toFixed(2))` rounds 29.9999972 → **30.00**, emitting `degree: 30` inside a sign — a representation escaping [0°, 30°). Does not affect sign-based registration; would matter to any future degree-sensitive consumer.

## Recommendation (recommendation only — decision is Kelly's)

**Build fresh** (`lib/spiralogic/registration/`, per the superseded greenfield contract, Built-unwired). The engine shares exactly one thing with the spec — the 12-row sign→element mapping — and everything else the spec requires (phases, equal weights, distribution object, provenance, explicit degradation, layer discipline) is structurally absent, while everything the engine actually does (weights, crowns, facets, practices, house-derived `currentPhase`) is interpretive work the spec explicitly excludes from registration. Adapting in place would mean gutting a live renderer that `/journey` and `/api/astrology/reading` depend on for its *interpretive* output shape; a fresh ~100-LOC pure function carries near-zero risk, and `spiralogicEngine.ts` then becomes an honest candidate for the C-fence's interpretive layer (where its crowns are consolidated or removed) rather than a false claimant to the grammar layer.

---

## TRIAGE OF THE SEVEN UNDOCUMENTED DECISIONS (2026-07-09, precondition to the ratified fresh build)

Kelly ratified **fresh build** 2026-07-09 with this triage as an explicit precondition: each undocumented decision resolves **adopt into spec / relocate to interpretive layer / reject** BEFORE the build, so the fresh function cannot silently re-decide them. Six of seven verdicts follow mechanically from already-ratified decisions; one is flagged for Kelly.

| # | Finding | Verdict | Basis |
|---|---|---|---|
| 1 | 4×3 grammar absent (element-only collapse) | **REJECT** | Superseded by ratified Q2 table — mechanical |
| 2 | Non-equal PLANET_WEIGHTS (Sun/Moon 3, Jup/Sat 2…) | **RELOCATE** | Becomes named *candidate weighting* for the versioned interpretive rule (design input alongside the null-rate table). Grammar layer keeps Q5 default 1.0 — mechanical under C + Q5 |
| 3a | Dominance + deficiency crowns | **RELOCATE** | To the single versioned interpretive rule (`interpretation_version`), per ratified C. `deficient` travels with it as same-class summary — mechanical |
| 3b | Insertion-order tie-break (fire beats water) | **REJECT** | Ratified C: the rule "returns no dominance, not a forced winner" — a silent array-order coin-flip is the exact behavior C forbids — mechanical |
| 4 | No provenance/degradation vocabulary | **REJECT** | Spec's `grammar_version`/`mode`/`moonUncertain` stand (INV-1/3/6) — mechanical |
| 5 | Interpretive content in registration layer (coherencePractices, house-based currentPhase, activeFacets) | **RELOCATE** | Interpretive-layer functions; they remain in the engine's second life and never enter `registerChart` — mechanical from the ratified hierarchy |
| 6 | Competing phase ontology (`vector`/`circle`/`spiral`, house-keyed) | **RELOCATE WITH RENAME — ⚠️ FLAGGED FOR KELLY** | The concept may survive as interpretive-layer vocabulary, but must not be called "phase" (reserved for grammar {1,2,3}, INV-4). Kelly may reject the concept outright later; either way it is excluded from `registerChart`, so the build is not blocked. **EVIDENCE ADDENDUM (2026-07-10, source check — evidence, not ruling):** the vocabulary is NOT a code invention — it originates in Kelly's own `docs/book-studio/ELEMENTAL_ALCHEMY_MANUSCRIPT.md`, **modality-keyed** (vector=cardinal "arrow of volition"; life/aether as "the mutable astrological state as a spiral of vector and circle"; elemental-intelligence table tags each element's three levels (vector)(circle)(spiral)) — i.e. the SAME ontology as ratified phases 1/2/3, under its manuscript name. The manuscript never uses astrological houses (all 17 "house" hits are literal buildings or publishers); the house-keying in `SPIRALOGIC_FACETS` (`lib/astrology/spiralogicMapping.ts`) is entirely the code's elaboration. This finding is therefore a *wrong citation*, not a hallucination: real vocabulary, mis-keyed. One concept, not two. Correction clause (travels with any ruling): the house-keyed version never survives *as phase vocabulary* — it dies by ruling, not omission. **✅ RULED — PHASE NAMES (Kelly, 2026-07-10):** vector/circle/spiral survives as the interpretive-layer **display vocabulary for phases 1/2/3**, modality-keyed per the manuscript (vector=cardinal=1, circle=fixed=2, spiral=mutable=3), versioned under `interpretation_version`. The grammar schema stays numeric {1,2,3}; the names never enter the registration layer. The house-keyed `SPIRALOGIC_FACETS` version is corrected at the engine's interpretive-layer refit per the correction clause. The ⚠️ is closed; the interpretive-rule build inherits the names in one pass. |
| 7 | Async/intake-coupled/null-returning interface | **REJECT** | Spec's pure sync `registerChart(positions) → SpiralogicProfile` stands — mechanical |

**Net: 0 adopted, 4 relocated, 4 rejected (3 splits into both).** Reality disagreed in seven named places and the spec won all seven at the grammar layer — but two engine concepts (weighting, crowning) get honest second lives as *inputs to* the interpretive layer's design, not grandfathered rules.

**Engine reclassification (Kelly's directive):** `spiralogicEngine.ts` is formally renamed in the spec as **interpretive-layer candidate** — its *role* survives; its crown-or-balance logic does NOT get grandfathered as the single versioned rule. The replacement rule is designed against the null-rate table (~25–28% strict-null; Moon-branch divergence data) and must speak in graded language with first-class ambiguity, which the engine as written cannot do.

**Upstream observation — FIXED (2026-07-09, decision-independent per Kelly):** `longitudeToZodiac` degree now rounds-then-clamps (`Math.min(Number(degree.toFixed(2)), 29.99)`), so the emitted degree can no longer escape [0°, 30°). Sign resolution (unrounded, half-open) was already correct and is unchanged. Fix verified by direct evaluation (29.9999972→29.99; 15.57→15.57; 0→0). Uncommitted, travels with this branch's working tree.

## COMPLETE DISPOSITION LEDGER (added 2026-07-10 — all 12 findings exit with a stated disposition)

Notation check: the triage table above covers ONLY the seven undocumented decisions (its 0 adopt / 4 relocate / 4 reject sums to eight verdicts because finding 3 split into 3a/3b). The remaining five findings were dispositioned elsewhere; recorded here so nothing exits the ledger silently:

| # | Class | Disposition |
|---|---|---|
| 1–7 | undocumented-decision | Per triage table above (finding 6 still ⚠️ awaiting Kelly on the concept's interpretive-layer survival) |
| 8 | engine-bug (lossy rounding, sums to 99, crown-after-round) | **Remains in the live engine — deliberately unfixed there.** Fresh `registerChart` is structurally immune (raw weights, no normalization, no crown). Fix belongs to the engine's interpretive-layer refit / renderer-consolidation crossing, NOT to a patch on a live `/journey` renderer outside a gate |
| 9 | engine-bug (silent drop of missing/unknown-sign bodies) | Same posture as 8: live engine keeps the behavior until its refit; `registerChart` closes the class structurally via SH-11 (throws `RegistrationInputError`) |
| 10 | spec-hole (ChartPositions undefined) | **CLOSED by SH-10** (proposed default, implemented in `registerChart`, ratification pending in the six accepts) |
| 11 | spec-hole (out-of-vocabulary behavior unspecified) | **CLOSED by SH-11** (throw; refuse-not-repair; ratification pending) |
| 12 | spec-hole (fingerprint + serialization undefined) | **CLOSED by SH-12** (raw weights, fire_1…air_3 keys, SHA-256 canonical fingerprint; ratification pending) |

Audit rule this satisfies: a finding may be fixed, deferred-with-named-home, or superseded — but never merely absent.
