# Spiralogic Registration Grammar — v1 Spec
**Status:** CORE DECIDED (Kelly, 2026-07-09) — Q0/Q2 authored; Q3/Q7 resolved by consequence; **Q6 RATIFIED = Option C (Kelly, 2026-07-09 — see Ratification block below)**; Q1/Q4/Q5 carry proposed defaults awaiting ratify-or-edit (Q4 simplifies at the grammar layer under C; Q5's weighting question relocates to the interpretive layer for summaries, while distribution weights remain the 1.0 default pending its own ratify).
**Deliverable:** pure function `registerChart(positions: ChartPositions) → SpiralogicProfile` — deterministic, no LLM, fully unit-tested, **Built-unwired**.

## The constitutional sentence (canonical, Kelly 2026-07-09)

> Spiralogic registration v1 defines the twelve zodiac signs as a deterministic 4×3 elemental grammar: Fire, Water, Earth, and Air each express through three phases corresponding to cardinal, fixed, and mutable modality. Aether is not treated as a thirteenth phase-bearing element, but as the integrative coherence field through which elemental registrations are witnessed, synthesized, and brought into relation. Planet, house, aspect, and dignity may modulate interpretation but do not alter the base elemental-phase registration.

**The hierarchy (registration vs. modulation):**
```text
sign element + modality  = primary Spiralogic registration   ← the grammar (this spec)
planet                   = function being expressed           ← modulation
house                    = field of life                      ← modulation
aspect                   = relational tension/support         ← modulation
dignity                  = ease/friction of expression        ← modulation
aether                   = integrative coherence field        ← not a phase; the condition that lets phases relate
```
Modulation layers are **out of scope for v1 registration** — they belong to interpretation (rendering / MAIA), never to the base profile.

## DECIDED — Q0: Aether

Aether is **not** phase-bearing. It is outside phase *because it is the condition that lets phases relate* — not absence, position. The platform-native grammar is **4×3 + Aether**, matching the runtime vocabulary already live (`element_N`, N∈{1,2,3}; aether as integrative element in Bridge D).

**Constitutional guard (binding on implementation):** v1 computes **no aether score, index, or coherence metric**. Aether's place in the profile is structural (the ontology names it; MAIA's witnessing inhabits it), never numeric. This is the RFI/UFI discipline applied at the grammar layer — a computed "coherence field value" is exactly the drift this system refuses.

**Source check (2026-07-09):** thesis §VII defines grammar as downstream formalism — *"Grammar is not Spiralogic… one way Spiralogic becomes intelligible… Grammar exists in service of life, never the reverse"* — and neither §III nor §VII assigns the three phases semantics that conflict with cardinal/fixed/mutable (initiating/sustaining/adapting). The modality mapping is confirmed compatible with the source, not just convenient. §III also supplies this spec's revision clause, adopted verbatim: **"Reality has authority over the model. If lived experience repeatedly exceeds the architecture, the architecture must change."** That is what `grammar_version` exists to make safe.

## DECIDED — Q2: The mapping

`element = sign element · phase = modality` (Cardinal→1, Fixed→2, Mutable→3):

| Sign | Registration | | Sign | Registration |
|---|---|---|---|---|
| Aries | Fire 1 | | Libra | Air 1 |
| Leo | Fire 2 | | Aquarius | Air 2 |
| Sagittarius | Fire 3 | | Gemini | Air 3 |
| Cancer | Water 1 | | Capricorn | Earth 1 |
| Scorpio | Water 2 | | Taurus | Earth 2 |
| Pisces | Water 3 | | Virgo | Earth 3 |

This table is the grammar. It is closed, total over the zodiac, and version-frozen as `grammar_version: 1`.

## RESOLVED BY CONSEQUENCE

- **Q3 — Cusp rule:** sign membership is ecliptic longitude in half-open 30° intervals `[0°, 30°)` — a body at 29°59′59.99″ Aries is Fire 1; at exactly 0°00′00″ Taurus is Earth 2. No split weights, no ambiguity; determinism is arithmetic. *(INV-5 satisfied structurally.)*
- **Q7 — House system:** **moot for registration.** Houses modulate interpretation only (per the hierarchy); no house system is selected, needed, or frozen by this grammar.

## PROPOSED DEFAULTS — ratify or edit

- **Q1 — What registers (closed set, v1):** the ten classical-through-modern bodies — Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto. Angles (ASC/MC), nodes, Chiron, asteroids: **excluded from v1 registration** (candidates for v2, as modulation or extension). **Retrograde: modulation, not registration** — a retrograde Mars in Leo is Fire 2, full stop.
- **Q4 — Unknown birth time:** registration survives almost intact, because signs (unlike houses) barely move within a day. Rule: compute at civil noon local; emit `mode: 'noon'`; **if the Moon changes sign that day, compute the profile under BOTH Moon branches.** The distribution carries the split weight (`moonUncertain: true`), and **every derivation must agree across branches or degrade explicitly: if dominance differs between branches, `dominant_element: null` with `reason: 'moon_ambiguous'`.** The split is the one principled exception to no-splits because it is epistemic (we don't know), not ontological (the grammar is undecided) — and the branch-propagation rule keeps INV-1 honest: same degraded input → same explicitly-degraded output, no silent coin-flip. *(Simulation: a one-sign Moon shift changes the equal-weights dominance outcome in ~39% of charts, so this rule will fire often — correctly.)* **Under Option C this rule simplifies at the grammar layer (both branch distributions emitted with the flag; no dominance here to degrade) — but `moonUncertain` MUST travel with the distribution, because the interpretive layer inherits the degradation obligation; the flag does not evaporate in transit.** ASC/MC were already excluded by Q1.
- **Q5 — Weighting:** **all registered bodies weigh 1.0.** No luminary weighting in v1 — "prevents the grammar from becoming interpretive too early" applies to weights before anything else. Luminary emphasis is a named v2 candidate requiring its own ratification.
- **Q6 — Profile semantics (three-way authorship choice, informed by the pre-ratification data above):** the profile is always the **distribution** (weight per each of the 12 phases) plus `grammar_version`, `mode`, and input fingerprint. The open choice is what the grammar says about *dominance*:
  - **Option A — ratify as proposed:** equal weights + strict-dominance-else-null. Honest and maximally non-interpretive, accepting that ~1 in 4 members has no dominant element (and knowing outers contribute cohort-constant weight).
  - **Option B — luminaries 2×:** Sun and Moon weigh 2.0. Null rate drops to ~18%; person-level signal rises (Sun/Moon are the fastest-moving, most individual placements). A named, versioned weighting constant — one deliberate step toward tradition, still fully deterministic.
  - **Option C — the grammar doesn't do dominance (with the single-home fence):** emit the distribution ONLY; `dominant_element` leaves the registration layer entirely and becomes an interpretive derivation. Strongest reading of "prevents the grammar from becoming interpretive too early" — the data argues a dominance crown that's null for 25% of members and flips on a one-sign Moon shift in 39% of charts is a fragile artifact of the crowning rule, not a property of the person; the distribution is the stable object. C also dissolves Q1's weighting question at this layer (weights become an interpretive-rule concern, versioned there). **Mandatory fence (C's only real cost is relocating the decision to the least-governed layer — three renderers on branches):** dominance and every other summary derived from the distribution is defined **once**, in a single versioned interpretive rule (`interpretation_version`, companion to INV-8's two provenance axes) that ALL renderers consume. The grammar emits distribution + ambiguity metadata; exactly one versioned place turns that into summaries. No renderer may define its own — the same member must never get different "dominant elements" across surfaces. The null-rate table above transfers to that layer as its design input (strict-crowning ⇒ ~25% null; luminaries-2× ⇒ ~18%).

## RATIFICATION — Q6 = Option C (Kelly, verbatim, 2026-07-09)

**C = distribution-only with fence.** Meaning: no automatic "dominant element" crown in the base grammar; the grammar records **distribution** deterministically; any dominance claim belongs to a **versioned interpretive rule**, defined once, then consumed by every renderer; if the rule cannot produce a stable result, it returns **no dominance**, not a forced winner.

Canonical sentence (Kelly):

> Spiralogic Journey v1 does not infer elemental dominance directly from raw balance totals. It records elemental distribution as ground truth. Dominance, when shown, is an interpretive claim governed by a single versioned dominance rule consumed by all renderers. The rule may return `none` where no stable dominance is warranted.

**Resolution of the live collision (Kelly's directive):** the three renderer-local crowns — `spiralogicEngine.ts:108-114` (`dominant: sorted[0]`), `app/journey/page.tsx:1868` (inline reduce), `components/astrology/ElementalBalanceDisplay.tsx:55-56` (own reduce) — are removed and all dominance language routes through one shared interpretive function (`interpretation_version`, per the fence). *"C preserves determinism without pretending certainty where the chart is actually threshold-sensitive."*

**Consequences applied:** the Boundary-cases row "Tie for dominant → `null` + `tied: [...]`" relocates to the interpretive layer (the grammar has no dominance to tie). Q4's branch rule simplifies at the grammar layer as already noted (both branch distributions emitted; `moonUncertain` travels; the interpretive layer inherits the degradation obligation).

## Pre-ratification data (Monte Carlo, N=100k, 2026-07-09)

Null-dominance rate under strict-dominance-else-null, realistic sign distributions (Mercury/Venus sun-locked; population and 1985-cohort outer variants agree within 2pts):

| Weighting | No dominant element |
|---|---|
| Equal weights (Q5 default) | **~25–28%** |
| Luminaries 2× (Sun, Moon) | ~18–19% |

A one-sign Moon shift flips the dominance outcome in **~39%** of charts (drives Q4's branch rule).

**Post-ratification confirmation (second pass, N=100k, 2026-07-09):** the deliberation's B-killing claim was checked, not just reasoned — luminaries-2× lowers base nulls (25.4%→18.0%) but raises Moon-branch divergence **38.4%→52.1%**: under B, more than half of ambiguous-Moon charts would degrade to `moon_ambiguous`. B trades the symptom for a worse disease. This table now serves as the **interpretive layer's design input** (per the C fence), where the dominance rule is authored.

**Two standing constraints for whoever authors that rule (from the closing deliberation, 2026-07-09):**
1. The 52% figure is not just the record of why B lost — it is a live constraint on ANY crowning rule, all of which sit on the same Moon instability. It argues the single versioned rule should prefer **graded language** (predominant / strong / mixed, with explicit ambiguity handling) over crown-or-null, and should treat `moon_ambiguous` as a **first-class output**, never an error path. The measurement that killed B is the founding datum of the layer C created.
2. When the conformance-first delegation surfaces how the three named crown sites currently **disagree with each other**, read that disagreement report as *evidence for the fence* — the same member already gets different dominance answers across surfaces today — not merely as bugs to fix.

**What this means:** under the proposed defaults, "your dominant element" does not exist for one chart in four — a product fact, not a bug, but one to choose knowingly. Equal weighting also means the three generational outers (near-identical across a birth cohort) contribute 30% of every profile with almost no person-level signal. The Q1/Q6 ratification is therefore a genuine three-way authorship choice (see Part B).

## Invariants (test-suite table of contents)

- **INV-1 Determinism:** identical birth data → identical profile, byte-for-byte. Includes version identity: a v1 profile is never re-read as if v2 produced it (`grammar_version` mandatory).
- **INV-2 Totality:** every body in the Q1 closed set registers to exactly one phase (Moon-uncertain split being the sole, flagged exception).
- **INV-3 Output shape (amended by Q6=C ratification):** distribution + `grammar_version` + `mode` + input fingerprint — **no derivations at the grammar layer** (a conformance test asserts the profile has no `dominant_element` key). Summaries live in the single versioned interpretive rule (`interpretation_version`), whose derivations must be pure functions of the distribution.
- **INV-4 Ontology-closed:** emitted vocabulary ⊆ {fire,water,earth,air}×{1,2,3} ∪ {aether-as-structural-position}. Adding vocabulary is a schema change, not a code change.
- **INV-5 Cusp determinism:** half-open intervals; boundary tests at 29°59′59.99″ and 0°00′00″ exactly.
- **INV-6 Degraded input explicit:** unknown time → `mode:'noon'` (+ `moonUncertain` when applicable); never a silent guess.
- **INV-7 No aether metric:** the profile contains no computed aether/coherence value. A test asserts its absence.
- **INV-8 Two provenance axes, same row:** wherever a portrait (or any artifact) stores a rendered interpretation of a profile, its provenance row carries BOTH `grammar_version` (which grammar computed the profile) AND the model-provenance label (which model rendered the prose). A portrait's identity is fully specified by both axes; re-rendering under a new model never silently implies re-registration under a new grammar, and vice versa. *(Registration function itself only emits `grammar_version`; the row-level pairing binds at the portrait schema — noted here so Gate 3's schema work inherits it as a requirement, not a suggestion.)*

## Boundary cases

| Case | Rule |
|---|---|
| 0°00′00″ of a sign | belongs to that sign (half-open interval) — INV-5 |
| Unknown birth time | `mode:'noon'`; Moon split-flagged if sign-ambiguous — Q4 |
| Retrograde body | registers normally; retrograde is modulation — Q1 |
| Tie for dominant | *relocated to the interpretive layer by Q6=C ratification — the grammar has no dominance to tie; the versioned dominance rule owns tie semantics (`none` where no stable dominance is warranted)* |
| Historical dates / timezone edges | belong to `ephemerisCalculator` (IANA-historical, shipped `2fec1425c`); the grammar consumes positions, never computes them |

## RATIFIED — Fresh build (Kelly, 2026-07-09, post-conformance)

The conformance report (`SPIRALOGIC_REGISTRATION_CONFORMANCE_REPORT_2026-07-09.md`: 12 findings — 7 undocumented-decision, 2 engine-bug, 3 spec-hole) concluded, and Kelly ratified: **build `registerChart` fresh in `lib/spiralogic/registration/`**. Kelly's reasoning, recorded: seven undocumented decisions means adaptation is seven relitigations inside a live `/journey` dependency; fresh build makes them spec questions answered on paper first; the adapt path would preserve exactly one twelve-row table — "a fresh build wearing the old file's name, minus the safety of a new home."

**Three preconditions (Kelly's chips), all satisfied before the build fires:**
1. **The table must not fork.** The sign→element mapping is the only shared artifact. Chosen mechanism (keeps zero edits to live code): an **equivalence test** that imports both the engine's `SIGNS_TO_ELEMENT` and the new grammar table and asserts they agree, sign by sign.
2. **Engine reclassified — role, not logic.** `lib/astrology/engines/spiralogicEngine.ts` is formally an **interpretive-layer candidate**: its position in the architecture survives; its crown-or-balance logic does NOT get grandfathered as the C-fence's single versioned rule. The replacement dominance rule is designed against the null-rate table and must speak in graded language with first-class ambiguity.
3. **The seven undocumented decisions are triaged** (conformance report, Triage section): 0 adopted / 4 relocated / 4 rejected; only finding 6 (competing `vector`/`circle`/`spiral` ontology → relocate-with-rename) carries a ⚠️ for Kelly's later call, and it is excluded from `registerChart` either way. The fresh function may not silently re-decide any of the seven.

*(The `toFixed(2)` degree-30.00 upstream bug was decision-independent and is already fixed in `ephemerisCalculator.ts` — round-then-clamp.)*

## Spec-hole resolutions — PROPOSED DEFAULTS (authored 2026-07-09, awaiting ratify-or-edit; the build treats these as the contract)

- **SH-10 — `ChartPositions` input contract:** `{ bodies: Record<Q1Body, number>; mode: 'timed' | 'noon'; moonBranches?: [number, number] }`. Longitudes are ecliptic degrees in `[0, 360)`, full precision. `registerChart` resolves signs **internally** via half-open 30° arithmetic on the raw longitude (INV-5 becomes testable at the grammar layer; the function never consumes an upstream rounded degree). `moonBranches` is present **iff** `mode:'noon'` and the Moon is sign-ambiguous that day — it replaces `bodies.Moon`, each branch contributing weight 0.5 (`moonUncertain: true` emitted).
- **SH-11 — Out-of-vocabulary input: THROW.** Missing Q1 body, non-finite longitude, or longitude outside `[0, 360)` → typed `RegistrationInputError`. The grammar refuses rather than repairs; the Q4 Moon split (explicit, flagged) remains the sole sanctioned degradation. This specifies the fix-shape for conformance Finding 9's silent-drop class.
- **SH-12 — Distribution serialization + input fingerprint:** distribution carries **raw weights, never percentages** (Finding 8 lesson), all 12 keys always present, key naming `fire_1 … air_3` (matches the live `element_N` runtime vocabulary). Canonical byte representation for INV-1: JSON with lexicographically sorted keys, weights via `Number.prototype.toString()`. `input_fingerprint` = SHA-256 over the canonical serialization of `{bodies (sorted), mode, moonBranches}`.

## Post-build standings (Kelly, 2026-07-09, after the 38/38 fresh build)

- **Refuse-not-repair RATIFIED AS A PATTERN, not just two behaviors** (covers SQ-2, SQ-3, and future input-contract questions at this layer): the registration layer *throws* on any input it cannot register totally — silent repair was the old engine's deepest sin (a 9-body chart masquerading as total registration). "Throws" is the registration-layer expression of sacred-refusal-vs-system-failure. The Q4 Moon split remains the sole sanctioned degradation because it is explicit and flagged.
- **SQ-1 (export `SIGNS_TO_ELEMENT`) is BUNDLED INTO THE WIRING CROSSING**, not done loose now — the fix touches live `spiralogicEngine.ts`, and live-file edits are licensed only inside that crossing. Until then the read-source equivalence pin stands (Built-unwired discipline applied to a test).
- **Finding 6's rename is load-bearing:** "phase" is reserved as the 12-distribution's word; the house-keyed ontology, whatever it becomes, may not collide with it inside the interpretive layer.

## Wiring crossing — REQUIRED MECHANISM (record now, build at the crossing)

*"Ground truth the LLM cannot contradict" is an intention; intentions about generative output are guarded-behavior, not structural incapacity.* The wiring (registerChart → generatePortrait) must therefore carry a mechanism on at least one side, ideally both:

1. **Injection:** registration output enters the prompt as immutable facts; the model is instructed to render, never compute.
2. **Verification (the strong side):** a post-generation check that the prose asserts no placement or elemental claim contradicting the computed profile — mechanically checkable precisely because the profile is deterministic. **A portrait that contradicts its chart FAILS TO SHIP, not ships wrong.** This arrives as an acceptance test of the wiring crossing, and is the moment the portrait row earns its two-axis provenance stamp (INV-8) for real.

## Delegation contract

**CORRECTED 2026-07-09 (Kelly) — conformance-first, not greenfield.** A live deterministic engine already exists (`lib/astrology/engines/spiralogicEngine.ts`, wired to `/journey` + `/api/astrology/reading`); the original prompt below would have rebuilt live capability blind. The corrected first prompt:

> "Here is the registration grammar spec. Write the conformance test suite from its invariants and ratified decisions, run it against `spiralogicEngine.ts` as-is, and report every failure classified as **spec-hole / engine-bug / undocumented-decision**."

Every failure is exactly one of those three. The decision between adapting the engine and building fresh in `lib/spiralogic/registration/` is made AFTER the conformance report, not before.

*Original (greenfield) contract, superseded — retained because it still governs the build IF the conformance report concludes fresh-build:*

> "Here is the registration grammar spec (SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md). Write the test suite from the Invariants and Boundary sections first — one test section per INV — then implement `registerChart` as a pure function in `lib/spiralogic/registration/`. Report every ambiguity as a numbered spec question keyed to Q0–Q7. Build to Built-unwired: no imports from MAIA retrieval paths, no DB writes, no route. The sign table in this spec is the grammar; if the implementation ever needs information not in this spec, that is a spec hole to report, not a judgment call to make."

**Out of scope, explicitly:** portrait read-API (Gate 3 — Kelly-gated crossing), rendering (branch consolidation review), ontology DB schema (item 2 — seeded by this spec's vocabulary, built after the function proves it), house/aspect/dignity modulation (v2+, each its own ratification).
