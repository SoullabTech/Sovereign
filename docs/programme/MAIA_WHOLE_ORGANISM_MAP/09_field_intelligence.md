# Field Intelligence — whole-organism map page

**Phase:** 1 (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 §5) · **Date:** 2026-09-06 · **Method:** read-only
census of code, prompts, copy, migrations and dated records. **Stop rule:** a defect found here
creates no permission to repair it. Nothing in this page changes MAIA.

**Evidence classes:** A = replicated external research · B = single/vendor/conceptual · C = human
witness under study ethics · D = interpretive doctrine · E = runtime fact (code path, migration,
production record). **Observation status:** WALKED (runtime witnessed, dated) · READ (code/prompt/
copy read at a named path) · UNKNOWN (with the reason). **Category:** Cat 1–6 (six-category typology).

Commit read: `b22ca001` (branch `claude/maia-human-experience-arch-12g5r6`). No network, no database.

## 0 · What this subsystem is (E, READ) — paths, entry points, what is live vs designed vs dormant

"Field" names at least seven distinct things in the repo. They are separated here because the founder's question cannot be answered for "Field" as one thing.

| # | Thing called "field" | Path (entry) | Cat | Status | What it actually does |
|---|---|---|---|---|---|
| F1 | **Field orchestrator** (`[Field Intelligence]` prompt JSON) | `lib/field/fieldOrchestrator.ts:154–391`; wired `lib/sovereign/maiaService.ts:1478–1500` (FAST) and `:1903–1925` (CORE) on the canonical route | **6** | READ (live code path; production rows UNKNOWN — no DB) | Builds `{pfi, resonance?, unified?, meta}`; appended verbatim as JSON (`:383–391`); telemetry to `field_orchestrator_telemetry` (migration `database/migrations/20260215210000_field_orchestrator_telemetry.sql`); admin `field_verify` action `app/api/admin/command-center/actions/route.ts:6,9` |
| F2 | **Talk-mode field awareness** ("CURRENT FIELD STATE") | `lib/sovereign/maiaService.ts:1035–1073`; detector `lib/maia/talkModeFieldIntelligence.ts:38–83,287` | **6** | READ | Keyword counts → one element + phase + "Detection confidence: NN%"; default ON (`TALK_MODE_FIELD_INTELLIGENCE !== 'false'`, `:1037`) in dialogue mode |
| F3 | **Field context adapter** (flagged) | `lib/maia/fieldContextAdapter.ts`; sole consumer `app/api/oracle/conversation/route.ts:853–856` gated `MAIA_FIELD_CONTEXT_ENABLED === 'true'`; compose note `docker-compose.production.yml:197–202` | 6-flagged on a **~zero-traffic route** (CLAUDE.md: `oracle/conversation` "receives ~zero live traffic") | READ | Retrieves Obsidian-vault *concept titles* keyed by element (`lib/spiralogic/core/spiralogic-engine.ts:649–677`) → prompt block "## Field Context (Spiralogic — element…)" + "**Vault wisdom (from AIN field):**" (`fieldContextAdapter.ts:151–209`). This is corpus retrieval labelled "field" — cross-ref `11_soul_corpus.md` |
| F4 | **CoherenceFieldService** | `lib/consciousness/memory/CoherenceFieldService.ts:42–403`; migration `20260115000005_coherence_field_readings.sql`; sole consumer `lib/consciousness/memory/MemoryPalaceOrchestrator.ts` (Path B, `oracle/conversation`) | **3** | READ | `coherenceScore = max(0, 1 − 2·variance)` of five levels (`:257`); `substrateMap.ts:228–230` "underutilized-consciousness", `:383–391` "Service preserved; no live consumer wired." Zero writers on the canonical route (grep `coherence_field_readings` → only the service) |
| F5 | **FIS Field State primitive** | `docs/canon/FIS_FIELD_STATE_PRIMITIVE.md` | **2** | READ (doctrine, D) | Six-dimension interface target; "governs no implementation"; core invariant "agents do not define it." No `FieldState` type in `lib/` implements it (the `FieldState` symbols found — `lib/relationships/*`, `lib/community/field-state-calculator.ts`, `lib/consciousness/field/*` — are unrelated shapes) |
| F6 | **Field Lab + tester gate** | `app/maia/field-lab/page.tsx:1–22` (anti-funnel invariant header); gate `components/maia/field-lab/FieldLabFrame.tsx:9–17` (`labs.preview` ← `members.tester`); `lib/auth/tester.ts:1–10`; relay `lib/maia/fieldLab/governance.ts:1–17`; rooms `relational-navigation`, `your-threads`, `project-field`, `legacy-field` | **6** (CLAUDE.md Cat 6 "Field Lab + tester gate") | READ; last dated gate record `docs/architecture/STUDIO_ACCESS_AUDIT_2026-07-16.md:111` | Surface-visibility gate only. `tester.ts:7–9`: *"do not read this flag inside conversation, oracle, or interpretation pipelines"* |
| F7 | **Other member-facing "field" words** | `app/relationships/[id]/page.tsx:237` "No field state yet. Check in to begin sensing the field." (field_tone = one of ten words chosen by the LLM, `lib/consciousness/relationalCheckin.ts:141–144`); `app/maia/mandala/page.tsx:247` "Field Coherence:" label whose value is a presence flag (`userPresence ? 'present' : 'away'`); monitor pages `app/pfi-monitor`, `app/consciousness-monitor`, `app/maia/realtime-monitor` (iOS-excluded, `scripts/capacitor-patch-routes.sh:590–598`; web gating UNKNOWN); public copy `app/accounted-for/page.tsx:1016` (Field-as-configuration stated as hypothesis) | mixed | READ | None of these computes a relation among elemental signals |

**RFI / UFI:** no code symbol `RFI`/`UFI` exists in `lib/`, `app/`, `components/`. The closest is `lib/consciousness/field/UnifiedElementalFieldCalculator.ts` (the "unified" source of F1). No member-facing "RFI/UFI" surface exists — freeze confirmed.

**Field ↔ elemental voices:** F1 imports only `pfiMindEntrypoint`, `resonance-field-system`, `UnifiedElementalFieldCalculator` (`fieldOrchestrator.ts:16–25`). No import path from Corpus Callosum `agent_runs` / elemental voice outputs into any field computation was found. Field does not read the parallel voices; the voices do not read Field.

**Sanctuary:** F1 returns meta-only (`fieldOrchestrator.ts:168–180`); F2 has no Sanctuary check (`:1037`).

## 1 · The founder's question for this subsystem

**Is Field genuinely representing relations among signals, or just another interpretation layer?**

**Answer (E, READ): a label on scalars.** The *shape* of relational computation exists — `calculateElementalInterference` is genuinely pairwise (`UnifiedElementalFieldCalculator.ts:341–374`, cross-term `2·a·b·cos(π|a−b|)` at `:379–387`). Its *inputs* are projections of one categorical value. Trace, source by source, of what varies with the member:

| F1 source | Member-varying input | Everything else | Path |
|---|---|---|---|
| `pfi` | `element` = `(meta as any)?.element` (FAST `:1489`) / `elementalResult?.dominant` (CORE `:1914`) — passed through `normalizeElement` (`pfiMindEntrypoint.ts:166`); `coherence` = `routing.fieldWorkSafe ? 0.7 : 0.4` (`:174`) where `fieldWorkSafe` derives from `cognitiveProfile.rollingAverage` / `stability` / bypass frequencies (`lib/field/panconsciousFieldRouter.ts:50–110`), or `false` when profile is null (`:55–62`) | `elementalBalance: 0.6`, `resonanceIndex: 0.5` — placeholders (`pfiMindEntrypoint.ts:180–182`) | one element + one cognitive-altitude bucket |
| `resonance` (depth ≥ 3) | `exchangeCount = depth` only | `elements` is a **lookup table by turn count** (`lib/maia/resonance-field-system.ts:100–135`: <N turns → Air 0.5; <30 → Water 0.4; intimacy>0.7 → Earth 0.6); `userWeather`/`userState` are passed as `''` (`fieldOrchestrator.ts:239–243`) so the text branches never fire | zero signal from the utterance |
| `unified` (depth ≥ 4) | `pfi.element` → one-hot `elementalPrescription` 0.8 / 0.2 (`fieldOrchestrator.ts:276–282`) | ~30 inputs hardcoded (`:269–318`: `windowOfTolerance: 0.5`, `sacredResonance: 0.3`, `fieldCoherence: 0`, …); `fireElementBalance = elementalPrescription.fire` (`UnifiedElementalFieldCalculator.ts:199`); `unifyingField = sacredResonance = 0.3` (`:280`) | one element |

Arithmetic consequence (READ, computed from the formula): `f(0.8, 0.2) = 0.76 > 0.6` → flagged; `f(0.2, 0.2) = 0.40` → not; `allToAether = (0.8+0.6)·0.3/4 = 0.105 < 0.5` → never. So the "interference signals" emitted into the prompt (`fieldOrchestrator.ts:352–356`) are exactly *the pairs containing the dominant element*. "fire-water resonance" carries no information beyond "fire was dominant." The `coherenceLevel` string is a function of the same one-hot. **Nothing in F1 reads Fire, Water, Earth, Air as independent observations of the same utterance; nothing computes a relation among differentiated signals.**

F2 is a single-winner keyword count with confidence `maxScore/(total+1)` capped at 0.9 (`talkModeFieldIntelligence.ts:83`). F4 computes balance (variance) across five levels — a summary scalar, not a relation, and has no live writer. F3 is retrieval keyed by element — a corpus lookup. F7 items are presence flags or one-word LLM labels.

**Verdict:** as built, "Field" is an interpretation layer wearing the vocabulary of the hypothesis (`ELEMENTAL_PARALLEL_PROCESSING_HYPOTHESIS_2026-09-06.md §2` "the relations among the fields may carry more information than their isolated contents"). The hypothesis is *not tested by this code* — H1/H2 (E5/E6) remain the way to find out. The FIS canon's own falsifiability gate already names this outcome: *"A `FieldState` object with dimensions that have no real sources would be sophisticated falsification"* (`FIS_FIELD_STATE_PRIMITIVE.md`, last section). F1 is that object, shipped under a different name.

## 2 · The nine questions

| # | Question | Answer | Evidence |
|---|---|---|---|
| 1 | Human phenomenon served | Intended: attunement as adaptive fit (v0.2 §1.2) — sensing "where the person is" before responding. Hierarchy: Self (interior state). Actual: F1/F2 serve *MAIA's routing*, not a member phenomenon; the member never sees them | E READ `maiaService.ts:1066–1067` ("provided as reference context for your conversational choices") |
| 2 | v0.2 principle | Supports (in intent) P3, P11. Violates P6 (elicits model-side confidence not warranted: "Detection confidence: 72%" from keyword ratio), P12 clause "what do I know" (JSON presents constants as readings). Risks AP15 (resonance `intimacyLevel = min(1, exchangeCount/30)`, `fieldOrchestrator.ts:236` — deepening scripted by turn count, not by anything the member did) | E READ |
| 3 | Self / World capacity | Self: neutral-to-negative — no member-facing surface, so no capacity is returned; the pre-framing is invisible. World: absent — no field computation reads relationships, place, or others (F7 relationships `fieldTone` is a separate subsystem) | E READ |
| 4 | Influence (P4′ 1–9) | 1 intent transparency: **absent** (member never told a "field state" shaped the turn). 2 no exploitation of susceptibility: **unknowable from inside** — `fieldWorkSafe` lowers intensity for low cognitive-altitude profiles (`panconsciousFieldRouter.ts` comment "Very low cognitive altitude → middleworld only") — protective in intent, but a hidden per-member calibration (Invariant 15 "calibration authority"). 3 no relational-feedback optimization: **met** (no learning loop). 4 inspectable shifts: **absent**. 5 meta-preferences: **absent**. 6 process endorsement: **absent**. 7 dispensability: **met** (fails silent; `try/catch` never breaks hot path `:1497`). 8 corrective friction: **absent** (F1/F2 add confidence, never doubt). 9 hermeneutical expansion: **absent** (nothing reaches the member) | E READ |
| 5 | What it remembers | F1: nothing per member — computes per turn; writes telemetry rows (memberId, sessionId, path, meta) to `field_orchestrator_telemetry` (`fieldOrchestratorTelemetry.ts:45`). F4 would persist per-turn elemental levels + "balancingRecommendations" (`CoherenceFieldService.ts:78–120`) — no live writer. F2: nothing | E READ; row counts UNKNOWN |
| 6 | Authority × Time | F1 JSON enters the prompt with no authority marker and no time marker; `coherence: 0.4` reads as a measurement. Class: **derived presented as observed**. Nothing verbatim beneath it | E READ `fieldOrchestrator.ts:383–391` |
| 7 | Useful difference or validation drift | Neither directly; but F2's "Recommended move type" (`wisdomFieldMoves`) and F1's `deepWorkRecommended` steer toward a Soullab move — a soft framing pressure (AP14-adjacent), not agreement | E READ `:1048–1064` |
| 8 | Elementally differentiated or reductive | **Reductive in the exact sense H1 warns about**: one winner-take-all element per turn; Elements used as content categories via keyword lists (`talkModeFieldIntelligence.ts:46–62`: Fire = "vision, future, passion…"), contradicting §2.11 "not domains." Descriptive only; no runtime claim | E READ |
| 9 | Evidence a human experiences the intended effect | **None (class C absent).** No witness record for F1/F2. Field Lab rooms have a spec (`docs/specs/FIELD_LAB_CONVERSATIONAL_INTERVIEW_SPEC_2026-06-26.md`, cited `legacy-field/page.tsx:17`) but no dated member-witness record was found in `docs/programme` | UNKNOWN |

## 3 · R11 design audit (each: FOUND / NOT FOUND / UNKNOWN, with path)

| Item | Finding | Path |
|---|---|---|
| agreement drift | NOT FOUND — no agreement mechanism in field code | — |
| validation loops | NOT FOUND | — |
| memory-amplified sycophancy | NOT FOUND — F1 is stateless per turn; F4 dormant | `fieldOrchestrator.ts:154` |
| hidden shaping objectives | **FOUND** — `fieldWorkSafe` / `deepWorkRecommended` / `maxSymbolicIntensity` adjust intensity per cognitive-profile bucket, never disclosed (`lib/field/panconsciousFieldRouter.ts:50–110`); F2 "Recommended move type" (`maiaService.ts:1062–1064`) | as listed |
| approval optimization | NOT FOUND — no objective function | — |
| emotional capture | **FOUND (structural risk, not measured)** — `intimacyLevel = min(1, exchangeCount/30)` drives `resonance.elements` toward Earth "silence, presence" and lengthens `pauseDuration` with turn count (`resonance-field-system.ts:117–125, 452`) — a scripted deepening independent of the member's state | `fieldOrchestrator.ts:236`; `resonance-field-system.ts:100–135` |
| excessive reassurance | NOT FOUND in field code | — |
| historical pattern becoming identity | NOT FOUND live; **designed** in F4 (`balanceQuality: 'water_flooding'`, `elementalDeficiency`, `analyzeElementalPatterns` `CoherenceFieldService.ts:187`) — AP17 risk if ever wired | `CoherenceFieldService.ts:10–40` |
| "you said before" becoming leverage | NOT FOUND | — |
| MAIA more central rather than returning capacity outward | **FOUND (by omission)** — all field intelligence is MAIA-facing; no surface returns a differentiated reading to the member for them to confirm/contest (the hypothesis §7 developmental aim) | `fieldContextAdapter.ts`, `fieldOrchestrator.ts` — no member consumer |

## 4 · Embodies v0.2 (what already does the right thing, with path)

- **Sanctuary hard-stop** in F1 (meta-only, `fieldOrchestrator.ts:168–180`) — v0.2 §4 "Sanctuary excluded absolutely."
- **Tester flag invariant** — *"do not read this flag inside conversation, oracle, or interpretation pipelines"* (`lib/auth/tester.ts:7–9`) — P4′-3, Invariant 15.
- **Field Lab anti-funnel header** (`app/maia/field-lab/page.tsx:8–20`: no popularity sort, no badges, no leaderboard, no digests) — AP15, Invariant 3.
- **Declared baton-pass governance** (`lib/maia/fieldLab/governance.ts:1–17`, `THE_GOVERNING_UNCERTAINTY.md`) — P12/claim discipline in executable form.
- **Fail-silent + hard cap + timeout** (`fieldOrchestrator.ts:10–13`, `:1497`) — P4′-7 dispensability.
- **Prompt preserves MAIA's own judgment**: *"Your response emerges from your own intelligence, informed by this field sensing"* (`maiaService.ts:1067`).
- **FIS canon invariant** *"agents do not define it"* and its falsifiability gate (`FIS_FIELD_STATE_PRIMITIVE.md`) — P12; the doctrine already predicts this page's finding.
- **Public copy stays on the ladder**: `/accounted-for:1016` states Field-as-configuration as investigated hypothesis, not as built.
- **Drift alarms** on vault-unreadable / engine-init-failed (`fieldContextAdapter.ts:100–112`) — honest reporting of incompleteness (Invariant 16).

## 5 · Contradicts v0.2 (what does the wrong thing, with path and the principle/AP violated)

| Contradiction | Path | Principle / AP |
|---|---|---|
| Constants and one-hot projections injected as if measured: `coherence: 0.4|0.7`, `coherenceLevel`, `interference: ['fire-water resonance']` | `fieldOrchestrator.ts:276–282, 352–356, 383–391`; `pfiMindEntrypoint.ts:174, 180–182` | P12 (what do I know); P6 (calibrated trust); Invariant 16 "non-fabrication of orientation signal"; FIS falsifiability gate |
| "Detection confidence: NN%" from keyword ratio presented to the model as a confidence | `maiaService.ts:1057`; `talkModeFieldIntelligence.ts:83` | P6; §2.8 (trust warranted by reality) |
| Elements operationalized as keyword content categories (Fire = vision/passion…) | `talkModeFieldIntelligence.ts:46–62`; `maiaService.ts:1076–1082` | §2.11 "not domains of a person's life"; H1 "reductive collapse" |
| Intimacy scripted by turn count; silence/pause lengthened accordingly | `fieldOrchestrator.ts:236`; `resonance-field-system.ts:117–125, 452` | P9 (no manufactured reciprocity); Invariant 3; AP15 |
| Per-member intensity calibration by "cognitive altitude" with no disclosure | `panconsciousFieldRouter.ts:50–110` | P4′-1, P4′-4; Invariant 15 (calibration authority) |
| Feature comment claims dormant systems are "activated" by telemetry | `lib/consciousness/fieldMonitorTelemetry.ts:1–14` | Claim discipline (declaration ≠ liveness) |
| Member-facing label "Field Coherence:" bound to a presence flag | `app/maia/mandala/page.tsx:247` | P12; Marketing Claim Discipline (a word above its rung in UI) |
| Designed (not live) per-turn elemental "deficiency/excess" + "balancingRecommendations" | `CoherenceFieldService.ts:24–33, 70–76` | AP17 (recurrence as identity) if wired; Invariant 14 (imposed framework) |

## 6 · Unknown (what cannot be known from reading; what instrument would answer it)

| Unknown | Instrument |
|---|---|
| Whether the `[Field Intelligence]` JSON changes MAIA's response at all | Shadow zero-diff: run FAST/CORE with and without the addendum on held-out transcripts; blind-rate difference (offline; feeds E6-style method) |
| Whether the `unified` branch ever completes within the 250 ms timeout in production (depth ≥ 4) | `SELECT sources FROM field_orchestrator_telemetry` — no DB access this phase |
| Production row counts / paths for `field_orchestrator_telemetry` | same query; ops diagnostic |
| Whether `meta.element` is populated on FAST (if null, `pfi.element` defaults to Earth `pfiMindEntrypoint.ts:201`) | log line `[field-orchestrator] [FAST]` meta + `pfi.element` histogram |
| Whether `cognitiveProfile` is non-null for most members (determines `fieldWorkSafe` and thus `coherence`) | `cognitive_profiles` row coverage query |
| Whether monitor pages (`pfi-monitor`, `consciousness-monitor`, `realtime-monitor`) are reachable by non-admin members on web | middleware/entitlement walk (not done) |
| Any member witness of Field Lab rooms | class C record — none found |

## 7 · Smallest evidence-producing intervention per gap

| Gap | Principle/AP | Human impact (1–5) | Architectural leverage (1–5) | Risk (1–5, never 0; higher = riskier) | Evidence state (observed / inferred / unknown) | Confidence (high / medium / low) | Smallest intervention | Experiment it feeds (E1–E10 or new) |
|---|---|---|---|---|---|---|---|---|
| G1 Field JSON is a label on one scalar, presented as measurement | P12 · P6 · Inv 16 · FIS gate | 3 | **5** | 1 | observed (code) | high | **Shadow ablation, zero diff**: log response digest with vs without `[Field Intelligence]` on the same turn (offline replay of consented/synthetic transcripts); no runtime change | new **E11 "Field ablation"** → gates Phase 6 design |
| G2 Elements reduced to keyword categories; no parallel readings | H1 · §2.11 · P11 | 4 | 5 | 1 | observed | high | Offline: hand-code 50 transcript turns with Fire/Water/Earth/Air *simultaneously* (raters) vs F2's single winner; measure disagreement | **E5** (H1 descriptive validity) |
| G3 Intimacy scripted by turn count | P9 · Inv 3 · AP15 | 3 | 3 | 1 | observed | high | Read-only: histogram of `resonance.elements`/`silenceProbability` by depth from telemetry (or replay); document that it is text-independent | E2 (timing as ethical variable) |
| G4 Undisclosed per-member intensity calibration (`fieldWorkSafe`) | P4′-1/4 · Inv 15 | 3 | 3 | 2 | observed (mechanism) / unknown (coverage) | medium | Coverage query: fraction of turns with `cognitiveProfile != null`; if ≈0, the calibration is inert and the finding downgrades | new E12 "calibration inventory" (feeds Influence gap class, Phase 2) |
| G5 No member-facing return of any differentiated reading (capacity stays inside MAIA) | P4′-9 · P5 · H3 | 4 | 4 | 3 | inferred | medium | Design-only (no build): a Field Lab room spec where the member confirms/contests a four-reading card; founder stop before build | E6 (H2) — after E5 |
| G6 Dormant F4 would write "deficiency/excess/recommendations" per turn | AP17 · Inv 14 | 2 | 2 | 1 (while dormant) | observed | high | Add to Cat 4 cleanup list (rename/gut, `CoherenceFieldService`) — proposal only, sequenced after Episodic per CLAUDE.md | — (Phase 2 register row) |
| G7 "Field Coherence:" label bound to presence flag | P12 · claim discipline | 1 | 1 | 1 | observed | high | Copy audit line item | E3 (copy audit) |

## 8 · Provenance — files read, records cited, commit

Code (READ): `lib/field/fieldOrchestrator.ts` · `lib/field/fieldOrchestratorTelemetry.ts` · `lib/field/panconsciousFieldRouter.ts` · `lib/sovereign/pfiMindEntrypoint.ts` · `lib/sovereign/maiaService.ts` (1035–1092, 1470–1500, 1898–1925) · `lib/maia/resonance-field-system.ts` · `lib/consciousness/field/UnifiedElementalFieldCalculator.ts` · `lib/maia/talkModeFieldIntelligence.ts` · `lib/maia/fieldContextAdapter.ts` · `lib/spiralogic/core/spiralogic-engine.ts` (649–677) · `lib/consciousness/memory/CoherenceFieldService.ts` · `lib/maia/substrateMap.ts` · `lib/auth/tester.ts` · `lib/maia/fieldLab/governance.ts` · `components/maia/field-lab/FieldLabFrame.tsx` · `app/maia/field-lab/page.tsx` · `app/maia/field-lab/legacy-field/page.tsx` · `app/relationships/[id]/page.tsx` · `lib/consciousness/relationalCheckin.ts` · `app/maia/mandala/page.tsx` · `app/accounted-for/page.tsx` (1016) · `app/api/oracle/conversation/route.ts` (853–856) · `app/api/admin/command-center/actions/route.ts` · `scripts/capacitor-patch-routes.sh` (583–600) · `docker-compose.production.yml` (195–206) · `lib/consciousness/fieldMonitorTelemetry.ts` · migrations `20260115000005_coherence_field_readings.sql`, `20260215210000_field_orchestrator_telemetry.sql`.

Doctrine / records (D, READ): `docs/canon/FIS_FIELD_STATE_PRIMITIVE.md` · `docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.C–0.D · `docs/research/human-experience/frameworks/elemental-experience/ELEMENTAL_PARALLEL_PROCESSING_HYPOTHESIS_2026-09-06.md` · `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` (Inv 3, 14, 15, 16) · `docs/programme/MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md` (107, 206) · `docs/architecture/STUDIO_ACCESS_AUDIT_2026-07-16.md` (111) · `CLAUDE.md` priority thread (Cat 6 list; freeze).

Not done: no database query, no production log, no route walk. Commit `b22ca001`.
