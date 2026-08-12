# MAIA COGNITIVE RANGE DISCOVERY — Evidence Record

READ-ONLY discovery unit. No repository file modified. No DEEP activation. No production contact.

## 0. Reference binding

| Item | Value |
|---|---|
| Repo | `/Users/soullab/MAIA-SOVEREIGN` |
| Remote | `https://github.com/SoullabTech/Sovereign.git` |
| Canonical ref | `origin/clean-main-no-secrets` |
| Canonical SHA | `52a3b924b7cf52013c1c8b0d635359c2cad672fc` |
| Local HEAD | `d41b8b3551e13847ff8fc73a42b5c7219eb95123` on `feature/labtools-redesign`, 467 dirty paths |
| Deployed commit given | `3d1e2734829626e29873a655ee189c9a091d1247` |

**OBSERVED — reference hazard.** `3d1e2734…` exists as a commit object but `git merge-base --is-ancestor 3d1e2734… origin/clean-main-no-secrets` returns false. The deployed production commit is **not an ancestor of canonical**. Every statement below is bound to canonical `52a3b924…`, not to the deployed artifact. Any claim about what production runs is INFERRED until the deployed tree is bound directly.

All file claims below carry path + canonical SHA. Key blob identities:

- `lib/consciousness/processingProfiles.ts` — blob `f43869243e475c0815eefd3eb9d40bcff5c87884`, 9984 bytes
- `lib/ain/awareness-levels.ts` — blob `03231cb3a4e62779e1cd7a5e1a5d10989b63a94c`, 10512 bytes
- `lib/consciousness/awareness-levels.ts` — blob `3ee205fcad47c341a513d5ffadd38cd884a127b6`, 20517 bytes
- `lib/ain/awareness-levels-local.ts` — blob `aacea7fa1fb4bc7cf3d171a40a3a4cdf40d4a4b7`, 15802 bytes

---

## 1. Shared substrate — vocabulary inventory

Kept unified per founder instruction; both territories draw on it.

### 1a. The profile axis

| Concept | Location | Actual semantics | Active | Controls |
|---|---|---|---|---|
| `ProcessingProfile = 'FAST'\|'CORE'\|'DEEP'` | `lib/consciousness/processingProfiles.ts` | Exclusive union type. One value per turn. | ACTIVE | Which of three response functions runs |
| `MaiaConversationRouter.chooseProcessingProfile()` | same file | Keyword/length/turn-count classifier + cognitive-profile modulation | ACTIVE | Sole producer of the profile value |
| `profileToConsciousnessLevel()` | same file | FAST→1, CORE→3, DEEP→5 | ACTIVE at one call site only (`app/api/oracle/conversation/route.ts:32`) | Nominal model-tier bridge |
| `processingProfileOverride` | `lib/sovereign/maiaService.ts:539`, `lib/consciousness/maiaOrchestrator.ts:114` | HTTP-boundary override string, e.g. `'BETWEEN'` | ACTIVE | Overrides the *recorded* profile, not the executed path |
| `ORACLE_PROFILE = 'DEEP'`, `ORACLE_LEVEL = 5` | `app/api/oracle/conversation/route.ts:154-155` | Hard-pinned constants. Comment: `OPTION A: ORACLE = DEEP = OPUS - Always use premium model` | ACTIVE on that route | Pins label + level unconditionally; router never consulted |

**Fourth and fifth profile values exist in the wild.** `'BETWEEN'` (`maiaOrchestrator.ts:603,653,697,748,794`) and `'RCN'` (`maiaService.ts:2860`) are written to telemetry but are **not members of the `ProcessingProfile` union** and have **no execution path** in the `switch`. They are recording labels only.

### 1b. The awareness/consciousness axis — four parallel systems

| System | Location | Scale | Status |
|---|---|---|---|
| `ConsciousnessLevel = 1..5` | `lib/consciousness/ConsciousnessLevelDetector.ts` | 5-level: Asleep → Teaching/Transmuting | Active; governs **language complexity**, explicitly not cognition. Header: *"adapt MAIA's language complexity"* |
| Legacy 5-level `AwarenessLevel` | `lib/ain/awareness-levels.ts` | 5-level | **`@deprecated` in file header**, retained for back-compat |
| Canonical 7-level `AwarenessLevel` | `lib/consciousness/awareness-levels.ts` | 7-level: Newcomer → … | Declared *"SINGLE SOURCE OF TRUTH"*; carries `meta_awareness: boolean \| 'emerging'` per level |
| `detectAwarenessLevelLocal` | `lib/ain/awareness-levels-local.ts` | 5-level semantic | LLM-based replacement for regex detection |

**Basename collision confirmed.** `awareness-levels.ts` exists at two paths with different blob SHAs, different scales (5 vs 7), and the 5-level one deprecated in favour of the 7-level one. Also present: `lib/intelligence/AwarenessLevelDetector.ts`, `lib/sovereign/awarenessLevelDetection.ts`. Name alone is not identity here.

Additional detectors: `lib/consciousness/cognitiveProfileService.ts` (Bloom-based cognitive altitude), `lib/consciousness/cognitiveEventsService.ts` (persistence for the above), `lib/consciousness/bloomCognition.ts` (`metaPatternScore`).

### 1c. Elemental / integration / emergence

| Concept | Location | Status |
|---|---|---|
| Fire/Water/Earth/Air/Aether agents | `lib/agents/elemental/{Fire,Water,Earth,Air,Aether}Agent.ts`, `lib/consciousness/ElementalProcessors/` | Present. ~40+ elemental modules under `lib/`. |
| `ElementalOracleBridge` | `lib/bridges/elemental-oracle-bridge.ts` | ACTIVE — imported `maiaService.ts:83`; invoked in DEEP path with 8000ms timeout, and in CORE path with `fastMode: true` |
| `elementalRouter`, `conversationElementalTracker` | `lib/consciousness/elemental-context-router.ts`, `conversation-elemental-tracker.ts` | ACTIVE — imported `maiaService.ts:9-10` |
| `CorpusCallosumPrinciple` | `lib/core/CorpusCallosumPrinciple.ts` | **Doctrine only.** Zero runtime importers. Only self-reference in its own docstring at line 424. |
| `corpusCallosumService` | `lib/services/corpusCallosumService.ts` | ACTIVE but **telemetry only** — `logAgentRun`, `logIntegrationPass`, `logCorpusCallosumTrace` all write to `agent_runs` |
| `CORPUS_CALLOSUM_ENABLED` | `maiaService.ts:3494` — `process.env.CORPUS_CALLOSUM_ENABLED !== '0'` | Default ON; gates **logging**, not integration |
| Weather | `lib/maia/inner-weather-recognition.ts`; `app/api/stellium/cosmic-weather/route.ts`; several `.md` in `lib/consciousness-computing/` | Present as member-facing *inner weather* recognition and as astrological cosmic weather. **No coupling to the profile axis found.** |

**Critical distinction — OBSERVED.** `lib/core/CorpusCallosumPrinciple.ts` states the McGilchrist firewall doctrine explicitly:

> **InhibitionMatrix** = Corpus callosum analog — Maintains agent differentiation, Prevents merger into generic voice, Creates creative tension through separation
> **Separator** = Hemispheric isolation enforcement — Each agent runs in complete isolation, No shared state, no cross-talk, Only Aether (prefrontal analog) sees all outputs
> **Coherence Gate** = Prefrontal integration — Orchestrates distinct voices WITHOUT merging, Integration happens at crown (Aether), not corpus callosum, Consciousness emerges in the TENSION between differentiated…
> **Integration happens at the crown (PFC), not between the elements.** **The elements must stay differentiated for consciousness to emerge.**

This is exactly the founder's "integrate without homogenizing" constraint, already written down. **It has no importers.** `InhibitionMatrix`, `Separator`, and `Coherence Gate` are named in the doctrine; the runtime `corpusCallosumService` implements none of them — it implements `INSERT INTO agent_runs`.

---

## 2. What FAST actually means today

**OBSERVED.** `fastPathResponse()` — `lib/sovereign/maiaService.ts:646`.

Selected when: empty message; OR greeting-pattern AND length < 60; OR length < 60 AND no `[?.!]`; OR turnCount < 3 with no CORE keyword hit.

What it does: single model call, `engine: 'deepseek-r1'`. Loads relationship memory with `includePatterns: false` — comment: *"FAST path: skip patterns for speed"*. `estimatedTime: 1500`.

FAST is a **context-narrowing and latency policy**. It reduces which memory is loaded and makes one model call.

## 3. What CORE actually means today

**OBSERVED.** `corePathResponse()` — `lib/sovereign/maiaService.ts:1377`. Log line: `CORE PATH: Normal MAIA conversation with light awareness`.

Selected when: message matches any of ~22 `corePatterns` substrings (`meaning`, `purpose`, `anxiety`, `panic`, `depression`, `relationship`, `family`, `marriage`, `work`, `job`, `career`, `direction`, `stuck`, `burned out`, `overwhelmed`, `healing`, `transformation`, `confused`, `don't know what to do`, …); OR length > 150; OR as the terminal default.

What it does: parallel context fetch, then `generateText({...})`. Calls `ElementalOracleBridge` with `fastMode: true`. `estimatedTime: 4000`.

CORE is the **default operating regime**. Consistent with the runtime evidence of 72.8%: `textLength > 150` alone is sufficient, and CORE is also the final `else`.

## 4. What DEEP actually means today — PRIORITY

**OBSERVED.** `deepPathResponse()` — `lib/sovereign/maiaService.ts:1788`. Log line: `DEEP PATH: Full consciousness orchestration + Claude consultation activated`. `estimatedTime: 15000`.

Three selection routes:

1. **Explicit invitation** — `wantsDeep`: message contains any of 11 exact lowercase substrings: `take me deeper`, `go deep with me`, `go as deep as you can`, `i want to go deep`, `shadow work`, `guide me into the shadow`, `help me with my trauma`, `take me into the roots`, `ritualize this`, `let's do a ritual`, `initiation work`. Header comment: `ULTRA-RESTRICTIVE DEEP invitations only`.
2. **Core-wound** — `looksLikeCoreWound && relationshipDeveloped`: `textLength > 700` AND one of 6 hints (`pattern that keeps repeating`, `i always end up`, `no matter what i do`, `core wound`, `deepest fear`, `i don't want to keep living this way`) AND `turnCount >= 5`.
3. **Cognitive up-regulation** — `cognitiveProfile.fieldWorkSafe && textLength > 400 && profile === 'CORE'` → DEEP.

Two down-regulations demote DEEP→CORE: `rollingAverage < 2.5`; or `spiritualBypass > 0.4 || intellectualBypass > 0.4`.

What DEEP actually executes, in order:

1. `getConsciousnessPolicy(effectiveUserId, input)` — full depth
2. `loadRelationshipMemory` — with patterns (unlike FAST)
3. `TurnsStore.getRecentTurns(effectiveUserId, 10)` — cross-session recall
4. `conversationElementalTracker.processMessage(...)`
5. `ElementalOracleBridge.activate()` then parallel elemental processing, `ELEMENTAL_TIMEOUT_MS = 8000`
6. `consciousnessWrapper.processConsciousnessEvolution(...)` racing a 4500 ms timeout
7. **Claude consultation — DISABLED BY DEFAULT.** `maiaService.ts`: `const enableClaudeConsultation = process.env.MAIA_USE_CLAUDE_CONSULTATION === 'true';` preceded by `MAIA SOVEREIGNTY: Claude consultation is DISABLED by default` and `To re-enable: Set MAIA_USE_CLAUDE_CONSULTATION=true in .env`

**Consequence — OBSERVED.** The step named in DEEP's own banner ("+ Claude consultation") is off unless an env var is set. Under default configuration DEEP is: *more memory + cross-session recall + elemental bridge + a local consciousness wrapper on a 4.5 s leash*. Its provider on the wrapper branch reports `provider: 'unknown', model: 'consciousness-wrapper'` — a literal, not a configured model. This is the "provider fields record models that match nothing configured" hazard the mandate warned about, located.

**DEEP today is a context-breadth and orchestration-count policy, not a depth-of-attention policy.** Nothing in it holds contradiction, returns to unfinished material, or attends beneath the stated problem. It loads more and calls more.

## 5. Why DEEP is effectively absent from production

Statically determinable to a **necessary-condition chain**. Three independent suppressors:

**Suppressor A — the up-regulation path is env-gated shut. OBSERVED chain:**

1. `lib/consciousness/cognitiveEventsService.ts:18` — `const COGNITIVE_EVENTS_ENABLED = process.env.MAIA_ENABLE_COGNITIVE_TURN_EVENTS === '1';` — opt-in, **default off**
2. Line 128 — `getUserCognitiveProgression()` returns `null` immediately when disabled
3. Line 75 — `logCognitiveTurn()` also no-ops when disabled, so `cognitive_turn_events` never fills
4. `cognitiveProfileService.ts` — `if (!progression || progression.length === 0) return null;`
5. `processingProfiles.ts` — the entire cognitive-adjustment block is inside `if (cognitiveProfile)`; with `null`, it is skipped
6. Therefore **DEEP selection route 3 can never fire**, and the two down-regulations also never fire

This is self-sealing: the flag that would populate the table is the same flag that gates reading it. Even switching it on yields `fieldWorkSafe` only after enough turns accumulate `rollingAverage >= 4.0` with both bypass frequencies `< 0.3`.

**Suppressor B — the surviving paths are exact substring matches.** With route 3 dead, DEEP requires a member to type one of 11 fixed phrases, or write >700 characters containing one of 6 fixed phrases at turn ≥ 5. Members in distress do not reliably produce the literal string `initiation work`. 8 all-time rows is the expected order of magnitude for 11 magic phrases.

**Suppressor C — CORE's catchment is near-total.** `textLength > 150` alone routes to CORE, and CORE is the terminal `else`. The DEEP core-wound branch needs >700 chars — but any message over 150 chars that misses the 6 hint phrases has already become CORE.

**INFERRED, not observed:** that `MAIA_ENABLE_COGNITIVE_TURN_EVENTS` is unset in the production environment. Reading production env is out of scope. Suppressors B and C hold regardless of that variable.

**Separate reporting hazard — OBSERVED.** `maiaService.ts:2870` returns `processingProfile: 'DEEP', // Report as DEEP for client compatibility` on the RCN early-return, while line 2860 records `processingProfile: 'RCN'`. So the `DEEP` label and the DEEP execution path are already decoupled in at least one direction. Any historical DEEP row must be checked against `agent_runs.source`/`agent_name` before being read as evidence that `deepPathResponse()` ran.

**Telemetry provenance — OBSERVED.** Router-computed profile reaches `agent_runs` via `maiaService.ts:3517` `processingProfile: processingProfileOverride ?? processingProfile` → `logCorpusCallosumTrace` → `logAgentRun` → `INSERT INTO agent_runs (… origin_route, processing_profile …)` (`corpusCallosumService.ts:120-151`). Canonical live route is `/api/sovereign/app/maia/list` (`docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md`, Tier 1 `canonical-live`, "Primary route the frontend hits for all MAIA chat turns", calls `getMaiaResponse()`). So the A0 counts do measure the router. `/api/between/chat` overrides to `'BETWEEN'`; `/api/oracle/conversation` pins `'DEEP'` but does **not** call `maiaService` — it is a separate ingress and its rows, if any, are label-pinned rather than router-derived.

## 6. EXPANSIVE — inventory only

**Nothing corresponding exists as a mode, profile, capacity, or enum.**

- Zero occurrences of `EXPANSIVE` as an identifier or string literal in TypeScript at canonical.
- All hits are the English adjective in prose or prompt text. Complete list of locations:
  - `app/api/_backend/src/agents/PersonalOracleAgent.ts:973, 2646`
  - `app/api/_backend/src/config/archetypalVoiceProfiles.ts:80` — `"Sharp mental clarity with expansive thinking"`
  - `app/api/_backend/src/config/promptTemplates.ts:349` — `expansive: { maxSections: 6, targetWords: 100 }` — a **verbosity** setting
  - `app/api/_backend/src/core/InternalPrismOrchestrator.ts:117` — `cognitiveStyle: 'associative, expansive, experimental'`
  - `app/api/_backend/src/oracle/core/MayaConsciousEvolution.ts:111, 180, 191, 314` — `max_tokens: choice.approach.includes('expansive') ? 200 : 100`
  - `app/api/_backend/src/oracle/archetypes/BreneOrchestrator.ts:8`, `protocols/ElementalResonance.ts:287`, `services/AdaptiveConversationService.ts:172`, `services/AdaptiveProsodyEngine.ts:195, 1536`, `services/ConversationalPipeline.ts:2390`, `services/archetypeRecognition.ts:41, 57`

Where "expansive" is operationalised at all, it means **more words / more tokens** (`targetWords: 100`, `max_tokens: 200`). It is a length dial, not a span-of-field concept. All under `app/api/_backend/`.

## 7. HIGH — inventory only

**Nothing corresponding exists as a mode, profile, or capacity.**

`'HIGH'` as a literal appears only as an unrelated magnitude:
- `lib/safety/SafetyOrchestrator.ts:10,23` — `HIGH = 'HIGH'`, `HIGH: { value: 3, name: 'HIGH' }` — safety severity
- `lib/consciousness/modeNodeConfiguration.ts:233` — `emphasis: 'HIGH'`

Adjacent higher-order material that exists but is **not** a HIGH capacity:
- `lib/consciousness/awareness-levels.ts:76-130,173,182` — `meta_awareness: boolean | 'emerging'` as a **property of the member's** developmental level, not of MAIA's processing
- `app/api/_backend/src/ain/collective/PatternRecognitionEngine.ts:64,373,378` — `detectMetaPatterns(emergentPatterns, fieldState)`, patterns-among-patterns over the **collective** field
- `lib/consciousness/bloomCognition.ts:151` — `metaPatternScore`
- `lib/consciousness/CollectiveIntelligenceProtocols.ts:257,494` — `'meta_awareness'`, `'recognizing transcendent implications and higher-order emergence'`
- `app/api/_backend/src/spiralogic/ElementalAgentOrchestrator.ts:645` — `'Meta-cognitive awareness enables higher-order pattern recognition'` (an insight string)
- `app/api/_backend/src/ain/services/aether-service/index.ts:303` — `// Activate higher-order protocols`

None are reachable from the member turn path, and none are governed by the profile axis.

## 8. Relationship to Fire/Water/Earth/Air — DEEP focus

**OBSERVED:** the profile axis **gates whether elemental processing happens, and how fast**, rather than modifying, sequencing, or integrating the lanes.

- FAST: no `ElementalOracleBridge` call
- CORE: `ElementalOracleBridge` with `fastMode: true`
- DEEP: `ElementalOracleBridge.activate()` + parallel elemental processing under `ELEMENTAL_TIMEOUT_MS = 8000`, plus `conversationElementalTracker.processMessage`

So of the mandate's five candidate relations, the answer is a sixth: **DEEP is an on/off gate upstream of the elemental lanes.** It does not modify each lane, does not operate after them, does not control integration, and is not orthogonal — it decides whether they run at all, on a timeout.

A second, separate elemental pathway runs in `maiaOrchestrator.ts` — `gebser-analysis` (element `air`, `epistemicMode: 'structured'`), `elemental-field-summary` (element `aether`, `epistemicMode: 'meta'`), `conversational-elemental` (`epistemicMode: 'relational'`) — each conditioned on `complexityAnalysis.requiredLayers.includes(...)`, i.e. governed by a **complexity analysis that is not the processing profile**. This is a competing depth-like axis. It reports `processingProfile: processingProfileOverride ?? 'BETWEEN'` on every one of its `logAgentRun` calls, so its rows never carry FAST/CORE/DEEP at all.

**Two independent gating systems for elemental processing exist and do not reference each other.**

## 9. Relationship to corpus callosum and Weather — DEEP focus

**Corpus callosum — OBSERVED.** Two artifacts share the name and share nothing else:

- `lib/core/CorpusCallosumPrinciple.ts` — the differentiation-preserving doctrine (InhibitionMatrix / Separator / Coherence Gate; integration at the crown, not between elements). **Zero importers.** Not executed.
- `lib/services/corpusCallosumService.ts` — `logAgentRun` / `logIntegrationPass` / `logCorpusCallosumTrace`, writing `agent_runs`. Gated by `CORPUS_CALLOSUM_ENABLED !== '0'` (default on). **This is an observability layer.** It records that several agents ran; it performs no integration.

The runtime "corpus callosum" is a **trace writer**. The founder's constraint — integrate without averaging, voting or scoring — is therefore neither satisfied nor violated by the running system: **no integration step exists to evaluate.** The doctrine that would satisfy it is written, unimported, and adjacent.

DEEP's relation: `deepPathResponse` produces `consciousnessData.corpusCallosumTrace`, and `maiaService.ts:3501-3510` prefers `meta.elementalResult.traceData` and falls back to that trace. So **DEEP is the main producer of corpus-callosum trace richness** — via `elementalAgents` and `elementalSynthesis`. With DEEP at 0%, the corpus-callosum trace has been running on the CORE/`fastMode` fallback throughout the measured window. Whatever integration fidelity the trace was designed to capture, it has not been exercised.

**Weather — OBSERVED.** No coupling to the profile axis. `lib/maia/inner-weather-recognition.ts` recognises the member's inner weather; `app/api/stellium/cosmic-weather/` is astrological. Nothing named Weather is emitted by, gated on, or read by FAST/CORE/DEEP. **The mandate's protection ("Weather is not HIGH") is not currently at risk in code, because neither concept is implemented as a capacity.** Nothing in the repository collapses them, and nothing in the repository connects them.

## 10. Is depth / span / altitude supported, contradicted, or unresolved?

**Unresolved for DEEP; not yet a live question for span and altitude.**

What the evidence does settle: the existing axis is **not** a depth axis. `ProcessingProfile` is a three-valued exclusive union consumed by a `switch` with `default → FAST`. Its members differ by *how much context is loaded and how many subsystems are invoked*, and its own type declares CORE the middle of a monotone ladder (`FAST→1, CORE→3, DEEP→5`). Any depth semantics attributed to it are attributed by name only.

What the evidence does **not** settle: whether depth is best modelled as an axis at all. The repository contains at least four competing graduated scales — `ProcessingProfile` (3), `ConsciousnessLevel` (5, language complexity), deprecated `AwarenessLevel` (5), canonical `AwarenessLevel` (7, with `meta_awareness`) — plus `complexityAnalysis.requiredLayers` as a fifth, differently-shaped gate. **The repository already contains a stronger and conflicting concept than "depth": the canonical 7-level developmental scale, which is a property of the member, not of the turn.** Whether DEEP should be a turn property or a relationship property is a genuine open question the code does not answer.

## 11. Cognitive capacity vs provider / compute — separation status

**OBSERVED: the separation exists in fact and is violated in doctrine.**

Fact — the router is provider-blind. `chooseProcessingProfile()` returns only `{ profile, reasoning, estimatedTime, meta }`. No model name, no token budget, no provider. The profile selects a *function*; each function chooses its own engine (FAST → `deepseek-r1`; CORE → `generateText({...})`; DEEP → `consciousnessWrapper` + optional Claude). Per the route authority map, provider routing is `getMaiaResponse() → modelService.ts → MAIA_TEXT_PROVIDER` env var — **orthogonal to the profile**.

Violation in doctrine — three places assert the ladder the mandate rejects:
1. `profileToConsciousnessLevel()`: FAST→1, CORE→3, DEEP→5, with the comment *"for LLM model selection (Sonnet 4.5 vs Opus 4.5)"*
2. `app/api/oracle/conversation/route.ts:800-826`: `OPTION A: ORACLE = DEEP = OPUS - Always use premium model`, logging `profile=DEEP -> level=5 (Opus routing)`
3. `estimatedTime` (1500/4000/15000 ms) is carried on the cognitive result, fusing latency policy into the capacity object

So the four things the mandate asks to be separated currently stand as: *how MAIA thinks* = which of 3 functions; *which model runs* = env var, mostly independent; *token/context allocation* = hardcoded per function (`includePatterns: false`, `maxThemes: 3`, `ELEMENTAL_TIMEOUT_MS`); *latency/cost tolerance* = `estimatedTime` + timeouts, fused into the capacity object. The separation is real but accidental, and the naming actively works against it.

`lib/rlm/budgetRouter.ts` (`RCN_BUDGETS: Record<RcnMode, BudgetLimits>`, `applyCorpusTuning`, escalation) is the one place in the repository where a **budget** axis is modelled explicitly and separately from a capacity axis. It is scoped to RCN only. It is the closest existing prior art for the separation the mandate wants.

## 12. Candidate architecture options — reported separately, none selected

### Territory 1 — DEEP (live)

Canon does not settle this. Four options, stated with what each costs.

**D-i. Resurrect as-is.** Set `MAIA_ENABLE_COGNITIVE_TURN_EVENTS=1`, let profiles accumulate, allow route 3 to fire. Cheapest. But it restores a DEEP whose content is "more context + more subsystems + a disabled Claude step" — it would raise the DEEP *rate* without establishing that depth of attention occurred. It also cannot be validated: with `MAIA_USE_CLAUDE_CONSULTATION` false, the resurrected DEEP is not the DEEP the banner describes.

**D-ii. Resurrect the trigger, redesign the payload.** Keep the three selection routes, replace `deepPathResponse`'s body with something that attends rather than accumulates — return to unfinished material, hold contradiction, track what lies beneath. Requires defining what "attending" means operationally, which is a founder question, not a code question.

**D-iii. Replace the trigger.** Retire the 11 magic phrases. Depth becomes a property of the *relationship* (canonical 7-level scale, already built and already declared single-source-of-truth) rather than of the *message*. This is the option the existing codebase most nearly already supports, and it aligns with the `deepWorkRecommended` gate that `cognitiveProfileService.ts` computes and **nothing currently reads**.

**D-iv. Dissolve the profile axis.** Let context loading, elemental invocation, and memory reach be independently determined, and stop labelling turns. `complexityAnalysis.requiredLayers` in `maiaOrchestrator.ts` is already a working example of exactly this shape.

Against Model A / B / C as posed: **Model A (exclusive modes) is what exists** — the `switch` enforces it. Model B (regime + co-occurring capacities) has partial precedent: the RCN/BETWEEN labels already escape the union, and `requiredLayers` is already a co-occurring set. **Model C is live**: the repository's own `requiredLayers` topology is set-valued rather than scalar, and is better evidence-supported than either A or B — but it currently governs a different subsystem, and whether it should govern depth is unproven.

### Territory 2 — EXPANSIVE and HIGH (later)

**No options offered.** Per instruction, recording only. There is nothing to reconcile: neither concept exists in any form at canonical. The only nearby operationalisations are `targetWords`/`max_tokens` for "expansive" (a verbosity dial, in `_backend`) and safety severity for `HIGH`. Building on either would be building on a name collision.

## 13. Contradictions with existing founder/canonical material

1. **`CorpusCallosumPrinciple.ts` is unimported doctrine.** The founder constraint "integrate without homogenizing; preserve meaningful disagreement" is already written in the repository, precisely, with named mechanisms (InhibitionMatrix, Separator, Coherence Gate). The runtime component bearing the same name is a telemetry writer. A future unit that "implements the corpus callosum" would need to know which of the two it means.
2. **`profileToConsciousnessLevel` asserts the ladder the mandate forbids.** FAST→1/CORE→3/DEEP→5 "for LLM model selection (Sonnet vs Opus)" is exactly `bigger model = deeper`.
3. **`ORACLE_PROFILE = 'DEEP'` pinned.** `/api/oracle/conversation` declares every turn DEEP without consulting the router — a second, contradictory definition of DEEP in the same tree.
4. **Two `awareness-levels.ts`, 5-level vs 7-level**, one deprecated in favour of the other, plus two more detector modules. The declared "SINGLE SOURCE OF TRUTH" has at least three living rivals.
5. **`'BETWEEN'` and `'RCN'` are written to a column whose CHECK constraint forbids them.** `database/migrations/022_maia_training_tables.sql:16` and `db/migrations/20240101000000_maia_learning_system.sql:24` both declare `CHECK (processing_profile IN ('FAST','CORE','DEEP'))`, while `maiaOrchestrator.ts` writes `'BETWEEN'` and `maiaService.ts:2860` writes `'RCN'`. Either those inserts target a different table (`agent_runs`, whose migration `020_ain_shape_telemetry.sql:20` declares `processing_profile TEXT` unconstrained), or they fail. **Unresolved statically; needs runtime confirmation.**
6. **`// @ts-nocheck` on the canonical live route.** `MAIA_ROUTE_AUTHORITY_MAP.md` documents that `/api/sovereign/app/maia/list` shipped an unresolvable import that passed typecheck and would have failed at runtime, and states the concealing mechanism is still present. Static reachability claims about the canonical route are weaker than they appear.
7. **Deployed commit is not an ancestor of canonical.** Recorded in §0; every production claim in this document is INFERRED.

## 14. Questions genuinely requiring founder ruling

1. **Is DEEP a property of the turn or of the relationship?** The message-keyword trigger says turn. The canonical 7-level scale and `deepWorkRecommended` say relationship. Both are built. Only one is read.
2. **Should the down-regulations survive?** `avg < 2.5 → CORE` and `bypass > 0.4 → CORE` currently mean a member in spiritual bypass is *refused* depth. That may be exactly right as care, or exactly wrong as gatekeeping. It is an ethical ruling, not an engineering one.
3. **Which "corpus callosum" is canonical** — the unimported differentiation doctrine, or the telemetry service that owns the name in the running system?
4. **Does `estimatedTime` belong on the cognitive result at all?** Removing it is the smallest concrete act that would separate capacity from latency policy.
5. **Should `/api/oracle/conversation`'s pinned `DEEP`/Opus be reconciled with, or excluded from, the profile axis?** It is currently a second definition of the same word.
6. **Is `complexityAnalysis.requiredLayers` the intended shape for cognitive range** (a set of co-occurring layers) rather than a scalar profile? The repository already runs this topology in `maiaOrchestrator`. Adopting it would be adopting something already proven to run, but it is a topology decision reserved to the north-star stage.
7. **Do EXPANSIVE and HIGH get built as capacities, or are they properties of an integration step that does not yet exist?** Not answerable from this repository — there is nothing there.

## 15. What must wait for A1 / runtime evidence

1. **Whether `MAIA_ENABLE_COGNITIVE_TURN_EVENTS` is set in production.** Determines whether Suppressor A is active or whether `cognitive_turn_events` holds data. Env read, not repo read.
2. **Whether `MAIA_USE_CLAUDE_CONSULTATION` is set.** Determines whether the 8 historical DEEP rows executed the Claude step or only the local wrapper.
3. **Provenance of the 8 all-time DEEP rows.** Which of the three selection routes fired; whether any are RCN early-returns mislabelled `DEEP` (`maiaService.ts:2870`); which `origin_route`. Requires `SELECT origin_route, agent_name, source, created_at FROM agent_runs WHERE processing_profile='DEEP'`.
4. **Whether the CHECK constraint rejects `'BETWEEN'` / `'RCN'`,** i.e. which physical table each write lands in, and whether writes are silently failing. Contradiction 5.
5. **Whether `/api/oracle/conversation` receives any traffic.** If it does, DEEP-labelled rows exist that never touched `deepPathResponse`, and the 0% figure is measuring only one of two ingresses.
6. **Actual distribution of member message lengths and turn counts.** Confirms Suppressor C quantitatively — how much traffic clears 150 chars (→CORE) versus 700 (the DEEP core-wound floor).
7. **Whether the deployed tree's `processingProfiles.ts` matches blob `f43869243e…`.** The deployed commit is off-canonical; the router may differ from what is analysed here.
8. **Whether `CORPUS_CALLOSUM_ENABLED` is `'0'` in production,** which would mean the trace evidence used for any future integration work does not exist for the measured window.

---

## CLASSIFICATION

Reported per territory, per founder instruction.

### Territory 1 — DEEP / CORE / FAST: **B**

*Pieces exist, but DEEP requires architectural reconciliation.*

The machinery is real and reachable: a router, three distinct execution paths, a cognitive-profile service, elemental invocation, and trace capture. It is not vapour. But DEEP as built is a **resource-allocation policy wearing a depth name**, its only adaptive trigger is sealed behind a self-referencing env flag, its signature step is disabled by default, its label is already emitted by a path that does not run it, and a second definition of `DEEP` is pinned on another route. Reconnection alone would raise the DEEP rate without producing depth of attention — so **A is not available**. The pieces are not fundamentally opposed to the intent either: the canonical 7-level scale, `deepWorkRecommended`, and `requiredLayers` are all plausible substrates that already exist and are simply unread — so **C overstates it**. And the question is well-enough evidenced to be actionable, which is what distinguishes this from **D**. What is missing is a ruling on what DEEP *is*, not more investigation.

### Territory 2 — EXPANSIVE / HIGH: **D**

*Evidence insufficient; do not design yet.*

Not "insufficient" in the sense of unfinished searching — the search is complete and the answer is clean: **neither concept exists in any form at canonical.** `EXPANSIVE` has zero identifier occurrences; its only operational uses are `targetWords: 100` and `max_tokens: 200`, i.e. verbosity, all under `app/api/_backend/`. `HIGH` exists only as safety severity and a UI emphasis flag. The meta-pattern and meta-awareness material that is present belongs to the member's developmental profile or to collective-field analysis, and is unreachable from the member turn path.

There is therefore nothing to restore, nothing to reconcile, and no repository evidence that could discriminate between candidate designs. Designing here would mean designing from the founder's prose alone, and the two available name-collisions (verbosity, severity) are traps rather than foundations. **D is the accurate finding, not a deferral.**

### Not performed

Reconciliation of `DEPTH × SPAN × ALTITUDE` with `Fire × Water × Earth × Air → corpus callosum → Weather`. Reserved to the north-star stage per founder instruction. This document surfaces what the evidence supports and leaves the topology open.
