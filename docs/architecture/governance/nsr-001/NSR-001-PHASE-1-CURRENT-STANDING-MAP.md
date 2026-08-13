# NSR-001 — PHASE 1: CURRENT STANDING MAP

**Status: `PHASE_1_SEALED — PRE-NORMATIVE`** · 2026-08-12
**Mode:** READ-ONLY. No mutation performed. No topology, no required yield, no proposed standing.

## Referents

| Referent | Value |
|---|---|
| Canonical (source of all code claims below) | `52a3b924b7cf52013c1c8b0d635359c2cad672fc` |
| Production (source of all runtime claims below, via A0/A1) | `3d1e2734829626e29873a655ee189c9a091d1247` |
| Sealed ledger blob read | `chore/cmc-001-custody` @ `bc97422c587669d11316f41b3b5992949336e52d` |

### Ledger referent note — recorded, not amended

The sealed ledger states local HEAD `2c1cf89f3609ee68cf9e52f68213b26dc8d53d92`. The branch resolves today to `bc97422c5876…`. The branch advanced after sealing. Per the immutability instruction the ledger is **not amended**; this is recorded as a property of the input. All ledger-admitted blobs were read at `bc97422c` and their content matched the admitted objects.

### Method note

Every row below was re-derived from `git show`/`git grep` at `52a3b924`, not inherited from prior findings. Runtime rows are bound to A0 (`1a5cafca…`) and A1 (`246df2cb…`) and carry their ledger qualifiers. Where a prior asserted collision failed re-derivation, that is stated.

---

## THE CENTRAL STRUCTURAL FINDING

Two objects in the "awareness" family are routinely spoken of together. **They are different objects, fed by different tables, with opposite jurisdictions.** Conflating them is the largest single hazard in this map.

| | **A. `cognitiveProfile.rollingAverage`** | **B. `ConsciousnessPolicy`** |
|---|---|---|
| Feed table | `cognitive_turn_events` | `bead_events` (30-day window) |
| Producer | `logCognitiveTurn`, fire-and-forget, `maiaService.ts:2605/2629` | `getConsciousnessPolicy`, `maiaService.ts:372` |
| Underlying signal | heuristic Bloom classification of member's own message | Spiralogic element distribution of member's beads |
| Abstention floor | **none** | **`if (totalBeads < 20) return null`** |
| Terminal jurisdiction | **AUTHORITY/GATE** — terminates the turn | **INFLUENCE** — appends prompt text |
| Can end an encounter? | **Yes** | **No** |

**Proximity warning, per founder framing:** B sits adjacent to A in the same file and the same conceptual family. B's standing is materially different from A's and is recorded at depth below so that it is not rebuilt as collateral.

---

## THE MAP

### ROW 1 — `cognitiveProfile.rollingAverage` (surfaced as `cognitiveAltitude`)

| Column | Content |
|---|---|
| **OBJECT** | `lib/consciousness/cognitiveProfileService.ts:83` — `rollingAverage = await getAverageCognitiveLevel(userId, window)`, default window 20 |
| **DENOTES** | The arithmetic mean of up to the last 20 heuristic Bloom's-taxonomy level classifications applied to **the member's own messages**, read from `cognitive_turn_events`. It does **not** denote altitude, consciousness level, developmental stage, or capacity. The name `cognitiveAltitude` appears at 4 sites and is a **rename at the point of use** — no code computes an "altitude". |
| **ONTOLOGICAL CLASS** | `HEURISTIC` + `OBSERVATION` + `INFLUENCE` + **`AUTHORITY/GATE`** |
| **EVIDENCE STATUS** | `PROVEN` (mechanism); the *validity* of the Bloom classifier as a measure of anything is `UNRESOLVED` — no validation artifact found |
| **CURRENT STANDING** | Terminates member encounters. Via `enforceFieldSafety` → `routePanconsciousField`: `avg < 2.5` ⇒ `fieldWorkSafe = false` ⇒ `maiaService.ts:2500` early-returns a canned boundary message **before Bloom, before the router, before generation**. Also re-regulates the processing tier (Row 3) and sets `communityCommonsEligible`, `deepWorkRecommended`, `fieldWorkSafe`. |
| **WARRANT** | **NONE FOUND** |

**Jurisdiction trace — `computed → available → passed → consulted → acted upon → depended upon → gated`**

| Stage | Site | Warrant found |
|---|---|---|
| computed | `cognitiveProfileService.ts:83` | — |
| available | `CognitiveProfile` interface exported | — |
| passed | 12 call sites of `getCognitiveProfile` across `app/api/*` and `lib/*` | — |
| consulted | `processingProfiles.ts:77` — logs `avg=` only | — |
| acted upon | `processingProfiles.ts:234ff` — DEEP-tier→CORE-tier and FAST-tier→CORE-tier re-regulation | NONE FOUND |
| depended upon | `enforceFieldSafety` takes `CognitiveProfile` as its sole capacity input | NONE FOUND |
| **gated** | `panconsciousFieldRouter.ts:71` `avg < 2.5 ⇒ fieldWorkSafe=false`; `maiaService.ts:2500` early return | **NONE FOUND** |

Both files carry a single authoring date, `2025-12-14` (`1c738f222` "Phase 2: Intelligence Integration Complete"; `686bcc9f5`). **There is no commit, comment, ADR, or canon entry in which a decision is taken to let this average decide whether a member may be answered.** The gate arrived inside a feature-integration commit. Per founder framing, that absence is the finding.

Two further properties of the gate, recorded without characterisation:

- The thresholds `2.5` / `4.0` / `0.4` are literals in `panconsciousFieldRouter.ts`. No derivation is present.
- `enforceFieldSafety` is **fail-open on error** (`catch` → `console.warn`, continue) but **fail-closed on absence**: `isFieldWorkSafe(null) === false`. A member with no `cognitive_turn_events` rows yields `getCognitiveProfile → null`; the `if (cognitiveProfile)` guard then skips the gate entirely in `maiaService`, so absence-of-data does **not** block there — but `isFieldWorkSafe`/`isDeepWorkRecommended`, if called directly, return `false`. The two helpers and the main path disagree on the meaning of null. `UNRESOLVED`.

**Outcome: `CURRENT_STANDING_HAS_NO_FOUND_WARRANT`**

---

### ROW 2 — `ConsciousnessPolicy` / `adaptResponsePromptWithPolicy`

Recorded at depth per founder instruction: this is a candidate warranted standing and must be distinguishable, later, from one nobody examined.

| Column | Content |
|---|---|
| **OBJECT** | `lib/sovereign/maiaService.ts:372` `getConsciousnessPolicy` · `lib/consciousness/awareness-levels.ts:401` `adaptResponsePromptWithPolicy` |
| **DENOTES** | A 30-day distribution of the member's `bead_events` by `spiralogic_element`, reduced to `{awarenessLevel, awarenessName, dominantElement, explicitness, tone, personalBaseline, totalBeads}`. It denotes **what the member has been engaging with lately**, not what they are capable of. |
| **ONTOLOGICAL CLASS** | `REPRESENTATION` + `INFLUENCE` |
| **EVIDENCE STATUS** | `PROVEN` (mechanism, and prompt arrival). Corroborated by A1's exact admitted claim — *"Prior conversation history was appended into the Turn-2 CORE prompt before Claude generation"* — which establishes that the CORE prompt-assembly path this block joins does reach generation. **A1's claim is about conversation history, not about this block**; that this specific text reaches the model is `PARTIAL` — proven by construction (string concatenation into `adaptivePrompt`, `maiaService.ts:1684`), not by witness. |
| **CURRENT STANDING** | Appends a `[CONSCIOUSNESS POLICY]` block to the system prompt on the FAST-tier (`:1303`), CORE-tier (`:1684`), CORE regeneration (`:1751`) and DEEP regeneration (`:2235`) paths. It shapes **register and disclosure** — whether frameworks are named, which element opens, whether to ask more questions. **It cannot block, cannot re-route, cannot end a turn, and cannot change which tier runs.** |
| **WARRANT** | **PARTIAL — and materially stronger than any other influencing representation in this map.** Three grounds are present *in the mechanism itself*: (1) an explicit **abstention floor** — `if (totalBeads < 20) return null`, and `if (result.rows.length === 0) return null`; the object declines to speak about a member it has insufficient evidence about, which is the discipline absent from Row 1. (2) A **declared sample size carried to the point of use** — `[SAMPLE SIZE: ${policy.totalBeads} beads]` is written into the prompt itself, so the consumer receives the evidence base alongside the claim. (3) **Jurisdiction matched to class** — a representation is granted influence over voice and nothing more; the `explicitness` ladder (`implicit` / `on_request` / `explicit`) governs only how much of MAIA's own machinery is disclosed. No founder-canon citation authorising it was found; the warrant is structural, not documentary. |

**Jurisdiction trace:** `computed → available → passed → consulted → acted upon`. **The chain stops before `depended upon` and before `gated`.** Nothing downstream requires the policy to be non-null; every call site is guarded `if (policy)`.

**Outcome: `CURRENT_STANDING_APPEARS_WARRANTED`** — for the influence it has, at the scope it has, with the abstention floor it has. This is a capacity to **protect from** rehabilitation. Recorded specifically: were Row 1's gate to be removed, **nothing in Row 2 needs to change**; they share a file and a vocabulary but no data, no table, and no code path.

---

### ROW 3 — DEEP-tier (the mechanism)

| Column | Content |
|---|---|
| **OBJECT** | `lib/consciousness/processingProfiles.ts:15` — `export type ProcessingProfile = 'FAST' \| 'CORE' \| 'DEEP'`; dispatched at `maiaService.ts:2943` `switch (processingProfile)` → `deepPathResponse` |
| **DENOTES** | A resource/latency allocation label selecting one of three response-assembly functions. `estimatedTime` 1500 / 4000 / 15000 ms. It denotes **which code path and budget**, nothing about the member. |
| **ONTOLOGICAL CLASS** | `MECHANISM` (dispatch) + `TELEMETRY` (persisted to `agent_runs.processing_profile`, `maia_turns.processing_profile`) |
| **EVIDENCE STATUS** | `PROVEN` as mechanism. **`CONTRADICTED` as a live capacity.** A0: `maia_turns.processing_profile` all-time — CORE 172,356 / FAST 1,006 / **DEEP 8**, and those 8 fall only in 2026-04-11 → 06-04. Last 30 days (n=622): CORE 453 / FAST 169 / **DEEP 0**. Independently corroborated by `maia_sessions.conversation_history` meta (n=4,225): DEEP 8. |
| **CURRENT STANDING** | Reachable but effectively unexercised. Entry requires `cognitiveProfile.fieldWorkSafe && textLength > 400 && profile === 'CORE'` (`processingProfiles.ts`, up-regulate branch) — i.e. **DEEP-tier is downstream of Row 1's gate**: the accumulated Bloom average is a necessary condition for the deepest response path. Exit is easy: `avg < 2.5` or bypassing `> 0.4` down-regulates DEEP-tier→CORE-tier. |
| **WARRANT** | Mechanism warranted as ordinary dispatch. The **binding of DEEP-tier eligibility to `fieldWorkSafe`** carries `WARRANT: NONE FOUND`, and inherits Row 1's status. |

**Label-collision hazard — re-derived and CONFIRMED in the running image.** A0 reads deployed `/app/lib/sovereign/maiaService.ts`: line 2860 persists `processingProfile: 'RCN'`, line 2870 returns `'DEEP'` to the client *"for client compatibility"*. Same source at canonical `52a3b924:lib/sovereign/maiaService.ts:2860/2870`. So a client-visible `DEEP` can denote RCN. A0 further establishes `logMaiaTurn` is called only at line 3352, after the RCN early-return, so RCN can never reach `maia_turns` **by construction** — and the one surface RCN does write shows zero RCN across 4,225 exchanges. **Corollary, carried from A0: the 8 DEEP rows are genuine DEEP-tier, not disguised RCN.**

**Outcome: `CAPACITY_EXISTS_IN_UNEXPECTED_FORM`** — DEEP-tier is present, dispatchable, gated behind an unwarranted representation, and in practice not used.

---

### ROW 4 — DEEP-dimension (the phenomenological heuristic)

| Column | Content |
|---|---|
| **OBJECT** | No object found. |
| **DENOTES** | — |
| **ONTOLOGICAL CLASS** | — |
| **EVIDENCE STATUS** | `NOT_PRESENT` |
| **CURRENT STANDING** | None. The literal `'deep'` occurs in ~20 unrelated local union types — `responseDepth: 'surface'\|'moderate'\|'deep'\|'profound'` (`lib/ain/awareness-adjustment.ts:21`), `witnessingDepth` (`lib/beta-user-controls.ts:21`), `conversationState` (`lib/agents/PersonalOracle/modules/types.ts:114`), `currentDepth` (`FractalDevelopmentTypes.ts:105`), `experienceTier` (`beta-user-controls.ts:7`). **These share no type, no import lineage, and no relation to `ProcessingProfile`.** Each is local to its module. |
| **WARRANT** | N/A |

**Outcome: `NO_EVIDENCE_FOR_PROPOSED_DISTINCTION`.** DEEP-dimension as a coherent phenomenological reality with its own representation does not exist in this codebase. Per founder framing this locates precisely where intention and implementation diverge, and does **not** contradict the founder architecture. **Notation consequence:** the previously asserted "DEEP collision" is confirmed as a *name* collision between DEEP-tier and the many local `'deep'` enums — **not** a collision between two implemented systems.

---

### ROW 5 — `paradoxes_held`

| Column | Content |
|---|---|
| **OBJECT** | `lib/services/corpusCallosumService.ts:86` (type), `:496` (derivation), `:183/:201` (INSERT into `integration_passes`) |
| **DENOTES** | Re-derived at source, line 496: `paradoxesHeld: tensionsNamed.length > 0 ? ['elemental_oppositions_held'] : []`. It denotes **the boolean fact that at least one elemental/epistemic tension was named**, rendered as a single constant string. It does **not** denote any paradox, nor which, nor that anything was held. |
| **ONTOLOGICAL CLASS** | `REPRESENTATION` + `TELEMETRY` |
| **EVIDENCE STATUS** | `PROVEN` |
| **CURRENT STANDING** | **Write-only.** Re-derived independently of the refusal registry: the only occurrences of `integration_passes` across `lib/`, `app/`, `api/` are the INSERT at `corpusCallosumService.ts:180` and a bare `SELECT count(*)` in `scripts/walk/silence-probe.ts:110`. No FROM/JOIN reader, no prompt path, no member surface. Corroborated by `tests/constitutional/refusal-registry/refusal-02-integration-passes-no-readers.ts` (grade A). |
| **WARRANT** | Warranted **as telemetry**, by the absence of any consumer — enforced structurally, and guarded by a standing constitutional check whose `hostileForkMustChange` clause makes adding a reader a visible diff. Writing is additionally gated by `contentWritable(posture, …)` (Sanctuary S1). |

**Compression note (recorded as standing, not judgement):** the reduction from *paradoxes a member is holding* to the literal `'elemental_oppositions_held'` is total — **what survived is one bit; what became unrecoverable is the entire content**. The jurisdiction the reduced object acquired is **none**, because nothing reads it. Compression without jurisdiction.

**Outcome: `CURRENT_STANDING_APPEARS_WARRANTED`** (as write-only telemetry) — with the qualifier the refusal registry itself carries: passing *does not* establish that the underlying multi-agent synthesis is governed, only that this log has no readers.

---

### ROW 6 — `selfObservation` / `witnessCapacity`

| Column | Content |
|---|---|
| **OBJECT** | `lib/consciousness/memory/ConsciousnessEvolutionService.ts:41` · `lib/consciousness/memory/MAIAMemoryArchitecture.ts:431` · `database/migrations/20260115000003_consciousness_evolution.sql:20` (`witness_capacity` JSONB default `{"selfObservation":0,…}`) |
| **DENOTES** | Two different things under one name. `ConsciousnessEvolutionService.ts:41` declares `selfObservation: number; // 0-1`. `MAIAMemoryArchitecture.ts:431` declares `selfObservation: number; // 1-10`. **This is a genuine, re-derived scale collision between two independent declarations** — and it is consequential: `MAIAMemoryArchitecture.ts:1440` unlocks an achievement at `witnessCapacity.selfObservation >= 8`, a threshold that is unreachable on the 0-1 scale and ordinary on the 1-10 scale. Seeded default at `:1622` is `4` (1-10 scale). |
| **ONTOLOGICAL CLASS** | `REPRESENTATION` (+ latent `AUTHORITY/GATE` at the `>= 8` unlock) |
| **EVIDENCE STATUS** | `UNRESOLVED` — the collision is `PROVEN` at type level; whether either is ever populated in the member request path is **not established**. No producer was found: `getCognitiveProfile`-style call sites exist, but no writer of `witness_capacity` in `lib/`/`app/` surfaced. |
| **CURRENT STANDING** | `observed`. The repo's own `lib/maia/substrateMap.ts:233,238` classifies both modules `underutilized-consciousness` with notes "Topology — unmapped" and "Growth tracking — unmapped". Neither is imported by `maiaService.ts`. |
| **WARRANT** | **NONE FOUND** |

**Outcome: `UNRESOLVED`** — the scale collision is real and load-bearing *if* the path is ever activated. No warrant is manufactured for the `>= 8` threshold.

---

### ROW 7 — Awareness-state detection (the plural)

| Column | Content |
|---|---|
| **OBJECT** | At least five independent detectors: `lib/ain/awareness-levels.ts:182` · `lib/consciousness/awareness-detection.ts:209` · `lib/consciousness/awareness-levels.ts:553` · `lib/sovereign/awarenessLevelDetection.ts:115` · `lib/intelligence/AwarenessLevelDetector.ts:318`. **Two distinct singletons are both exported as `awarenessLevelDetector`** (`lib/sovereign/awarenessLevelDetection.ts:761` and `lib/intelligence/AwarenessLevelDetector.ts:318`). |
| **DENOTES** | Five different functions producing differently-shaped "awareness" values from different inputs. `lib/ain/awareness-levels.ts:12` and `lib/awareness/awarenessModel.ts:11` both carry deprecation comments redirecting to `awareness-detection.ts`. |
| **ONTOLOGICAL CLASS** | `HEURISTIC` + `OBSERVATION` |
| **EVIDENCE STATUS** | `PARTIAL` |
| **CURRENT STANDING** | **Only one reaches the member.** `inferAwarenessLevel`, via `getConsciousnessPolicy` (Row 2), reaches the prompt. `lib/sovereign/awarenessLevelDetection.ts` is consumed only by `bloomCognitionDemo.ts` (a demo), `conversationalConventions.ts`, and `intelligentVoiceAdaptation.ts` — **and `maiaService.ts` imports none of those three.** `lib/ain/knowledge-gate.ts:228,255` calls `detectAwarenessLevel` and is a gate, but on knowledge admission, not on the member. `claudeClient.ts:136-138` reads `consciousnessPolicy` **for a log string only**. |
| **WARRANT** | For the one live path: inherits Row 2 (`PARTIAL`, structural). For the four dormant detectors: **NONE FOUND** — and none needed, as they influence nothing. |

**Outcome: `CAPACITY_EXISTS_IN_UNEXPECTED_FORM`** — the capacity is not missing; it is quintuplicated, four-fifths inert, with a name collision between two exported singletons.

---

### ROW 8 — Elemental integration

| Column | Content |
|---|---|
| **OBJECT** | `app/api/_backend/src/agents/AetherAgent.ts:359,398,417-430` (`elementalIntegration: true`, `integrationScore` from a 0.5 baseline plus increments) · `app/api/_backend/src/agents/ArchetypalTypologyAgent.ts:892,934-970` (`calculateElementalBalance`) |
| **DENOTES** | Heuristic scalars assembled from additive constants (`+0.3`, `+0.2`, `(uniqueElements/5)*0.2`, clamped to `[0.1, 1.0]`). |
| **ONTOLOGICAL CLASS** | `HEURISTIC` |
| **EVIDENCE STATUS** | `PARTIAL` |
| **CURRENT STANDING** | Confined to `app/api/_backend/src/agents/`. **Not on the `lib/sovereign/maiaService.ts` request path.** The live elemental influence on the member is a different object: `policy.dominantElement` and `policy.elementalOpening` from Row 2, drawn from `bead_events`, not from these agents. |
| **WARRANT** | **NONE FOUND** — and no jurisdiction requiring one. |

**Outcome: `CAPACITY_EXISTS_IN_UNEXPECTED_FORM`** — elemental integration as a *computed score* exists but is off-path; elemental influence on the member exists but comes from bead distribution.

---

### ROW 9 — Cross-domain machinery

| Column | Content |
|---|---|
| **OBJECT** | Two unrelated objects sharing a prefix. **(a)** `lib/symbolic/crossDomainGovernance.ts` + `lib/symbolic/symbolicTelemetry.ts` (`domain: SymbolicDomain \| 'cross_domain'`; alarm kind `cross_domain_mostly_blocked` at `:329,394-399`). **(b)** `lib/maia/prompts/knowledgeFieldBlock.ts:72` — `const crossDomain = detectedDomains.length >= 2`, consumed at `:91`. |
| **DENOTES** | (a) a governance/telemetry domain tag over symbolic synthesis, with a blocked-rate alarm. (b) a two-line boolean — "the input touched at least two detected domains" — which conditions prompt text. |
| **ONTOLOGICAL CLASS** | (a) `AUTHORITY/GATE` + `TELEMETRY`; (b) `OBSERVATION` + `INFLUENCE` |
| **EVIDENCE STATUS** | (a) `PROVEN`, and **governed** — `promptIngressGovernance.ts:78` carries the same domain type, and a dedicated test suite exists (`tests/symbolic/crossDomainGovernance.test.ts`). (b) `PROVEN`. |
| **CURRENT STANDING** | (a) blocks/permits symbolic synthesis by domain, with explicit ingress governance and telemetry that alarms when cross-domain synthesis is mostly blocked — i.e. **the gate watches itself**. (b) toggles a branch of prompt construction. |
| **WARRANT** | (a) **PARTIAL and structurally present** — a named governance module, a typed ingress boundary, a test suite, and a self-monitoring alarm. Recorded as a second capacity to **protect**. (b) **NONE FOUND**, but the object holds only `INFLUENCE` over prompt phrasing and never escalates. |

**Outcome (a): `CURRENT_STANDING_APPEARS_WARRANTED`. Outcome (b): `CURRENT_STANDING_HAS_NO_FOUND_WARRANT`** — at low stakes.

---

### ROW 10 — `realityCheckAgent` / developmental note

| Column | Content |
|---|---|
| **OBJECT** | `lib/reality/realityCheckAgent.ts` — `generateRealityCheck(scores, band, userContent, cognitiveAltitude?)`, and `generateDevelopmentalNote` at `:251-280` |
| **DENOTES** | A function mapping `cognitiveAltitude` (Row 1's Bloom average) onto five hard-coded second-person developmental addresses to the member — *"You're in a knowledge-gathering phase…"*, *"You're operating at a metacognitive level…"* — bucketed at `<=2`, `<=4`, `<=6`, `<=8`, else. |
| **ONTOLOGICAL CLASS** | `HEURISTIC` + `PHENOMENOLOGICAL CLAIM` (it tells the member what developmental phase they are in) |
| **EVIDENCE STATUS** | `PROVEN` that the code exists; `PROVEN` that it is unreachable. |
| **CURRENT STANDING** | **`NOT_PRESENT` in the running architecture.** Re-derived: the only importer of `realityCheckAgent` anywhere in the tree is `test-reality-hygiene.ts:17`. Every other reference is markdown (`REALITY_HYGIENE_DEPLOYED.md`, `REALITY_HYGIENE_COMPLETE_SUMMARY.md`, `REALITY_HYGIENE_INTEGRATION_COMPLETE.md`, and two others). No `lib/`, `app/`, or `api/` consumer exists. |
| **WARRANT** | N/A — no standing to warrant. |

**Outcome: `NOT_PRESENT`.** Recorded because five in-repo documents describe this as deployed. **Documentation asserting deployment is contradicted by import lineage; per authoritative-surface discipline, dispatch outranks documentation.** The highest-stakes object in this row — a machine telling a member their developmental phase from a 20-turn message average — **does not run.**

---

## SUMMARY OF OUTCOMES

| Row | Object | Outcome |
|---|---|---|
| 1 | `cognitiveProfile.rollingAverage` / `cognitiveAltitude` | `CURRENT_STANDING_HAS_NO_FOUND_WARRANT` |
| 2 | `ConsciousnessPolicy` / prompt adaptation | **`CURRENT_STANDING_APPEARS_WARRANTED`** |
| 3 | DEEP-tier | `CAPACITY_EXISTS_IN_UNEXPECTED_FORM` |
| 4 | DEEP-dimension | `NO_EVIDENCE_FOR_PROPOSED_DISTINCTION` |
| 5 | `paradoxes_held` | **`CURRENT_STANDING_APPEARS_WARRANTED`** (write-only telemetry) |
| 6 | `selfObservation` / `witnessCapacity` | `UNRESOLVED` (scale collision, no producer found) |
| 7 | Awareness-state detection | `CAPACITY_EXISTS_IN_UNEXPECTED_FORM` (5 detectors, 1 live) |
| 8 | Elemental integration | `CAPACITY_EXISTS_IN_UNEXPECTED_FORM` (off-path) |
| 9a | Cross-domain governance | **`CURRENT_STANDING_APPEARS_WARRANTED`** |
| 9b | `knowledgeFieldBlock` crossDomain | `CURRENT_STANDING_HAS_NO_FOUND_WARRANT` (low stakes) |
| 10 | `realityCheckAgent` | `NOT_PRESENT` |

### The protected set (do not rebuild)

Recorded per founder instruction, so that a later phase reading this map as a repair list does not rebuild what already works:

1. **Row 2 — `ConsciousnessPolicy` prompt adaptation.** Warranted by an explicit abstention floor, a sample size carried into the prompt, and jurisdiction matched to class. **Independent of Row 1 in data, table, and code path.**
2. **Row 5 — `paradoxes_held` as write-only telemetry.** Warranted structurally, guarded by refusal R02.
3. **Row 9a — symbolic cross-domain governance.** Warranted by typed ingress boundary, test suite, and a self-monitoring blocked-rate alarm.

### Where description became jurisdiction

One object completes the full chain: **Row 1**. A heuristic classification of the member's own sentences became, without any located decision, the condition on whether the member is answered at all, and the condition on access to the deepest response path. Every intermediate step is locally reasonable. **No commit, comment, or canon entry marks any transition.**

---

## SEALED

Phase 1 complete. Pre-normative. No `REQUIRED YIELD`, no proposed standing, no topology, no rehabilitation design.
