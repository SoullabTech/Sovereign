# CMC-001 · Unit 5 — Phase-2 Terminal Composition Audit

**Mode:** STATIC ONLY. NO REMEDIATION. No files modified.
**Frozen mandate:** commit `dbc4d5df3f0806403ee3d14aba4dd573b637dfb0`, blob `8374f1e942c8e4f8b41dab319eb75dabf609681b` — **VERIFIED, digest matches.**
**Canonical referent:** `origin/clean-main-no-secrets` = `52a3b924b7cf52013c1c8b0d635359c2cad672fc` (fetched fresh 2026-08-12).
**Working tree:** `feature/labtools-redesign` @ `d41b8b3551e13847ff8fc73a42b5c7219eb95123` — NON-canonical, not used as evidence.
**Evidence basis:** `STATIC_POSSIBLE` throughout. `observed_status: NOT_OBSERVED`. `referent_binding: origin/clean-main-no-secrets@52a3b924`.

---

## 1. Resolved sources (path + blob, per SOURCE-IDENTITY-RESOLUTION-DISCIPLINE)

| Repository-relative path | Blob SHA |
|---|---|
| `lib/wisdom-engines/ai-intelligence-bridge.ts` | `e80573e46bc14db9c0e1c368c5e6b8940bd50540` |
| `lib/consciousness/consciousness-layer-wrapper.ts` | `42dd2c210cf22cd2c2d0a3e8a800fa6b9e32c29f` |
| `lib/ai/multiEngineOrchestrator.ts` | `b07d4b04bdb97a2e39a7d22239afb7356d6ba53b` |
| `lib/ai/modelService.ts` | `270fb541004aeebac96f83af2d9b3350b8c7f4db` |
| `lib/consciousness/response-cache.ts` | `3d29e29532491b117dd4233c90e482e061a2b32c` |
| `lib/consciousness/orchestration-optimizer.ts` | `c802c02ddd29a8026d6c19f6d3a02ff95db5bfd1` |
| `lib/consciousness/MAIA_RUNTIME_PROMPT.ts` | `095db1a4ba65684f91b245e9da30ae78759df40a` |
| `lib/ai/claudeClient.ts` | `7a04210da6dab028ad6521ecea7ff3664ec5dc38` |

The bridge blob `e80573e4…` resolves to exactly one path in the canonical tree. Confirmed by
`git ls-tree -r 52a3b924 | grep ai-intelligence-bridge` — single hit. **OBSERVED.**

### Binding import lineage (execution identity, not name)

```
lib/sovereign/maiaService.ts:8      import { consciousnessWrapper, type ConsciousnessContext }
                                      from '../consciousness/consciousness-layer-wrapper'
lib/sovereign/maiaService.ts:2052   consciousnessWrapper.processConsciousnessEvolution(input, consciousnessContext)
                                      ↓
consciousness-layer-wrapper.ts:550  export const consciousnessWrapper = new ConsciousnessLayerWrapper()
consciousness-layer-wrapper.ts:7    import { AIIntelligenceBridge } from '../wisdom-engines/ai-intelligence-bridge'
consciousness-layer-wrapper.ts:104  this.aiBridge = new AIIntelligenceBridge()      ← direct construction, NOT getInstance()
consciousness-layer-wrapper.ts:541  Phase 2 → processWithTemporalWindows(input, context)
consciousness-layer-wrapper.ts:174  this.aiBridge.generateLayerWisdom(layer, temporalPrompt, {…})
                                      ↓
ai-intelligence-bridge.ts:212       generateLayerWisdom()
ai-intelligence-bridge.ts:19-22     import { generateWithMultipleEngines } from '../ai/multiEngineOrchestrator'
ai-intelligence-bridge.ts:266       generateWithMultipleEngines({systemPrompt, userInput, meta}, type, layer)
                                      ↓
multiEngineOrchestrator.ts:335      export async function generateWithMultipleEngines(...)
multiEngineOrchestrator.ts:143      this.generateWithSpecificEngine(engineParams, config.model)
multiEngineOrchestrator.ts:246      fetch(`${OLLAMA_BASE_URL||'http://localhost:11434'}/api/chat`)   ← THE MODEL CALL
```

**Two independent callers of the bridge exist** (`lib/bridges/elemental-oracle-bridge.ts:15`,
`lib/orchestration/consciousness-orchestrator.ts:49`). Neither participates in the Phase-2
lineage above. Named identity `AIIntelligenceBridge` therefore resolves to three distinct
call sites; only the `consciousness-layer-wrapper.ts:104` construction is the Phase-2 one.
**OBSERVED.**

---

## 2. The literal prompt at the Phase-2 model call

The HTTP body actually sent (`multiEngineOrchestrator.ts:249-260`):

```json
{
  "model":   "<ENGINE_CONFIGS[engineKey].model>",
  "messages": [
    { "role": "system", "content": "<MAIA_RUNTIME_PROMPT>" },
    { "role": "user",   "content": "<prompt.userPrompt>" }
  ],
  "stream": false,
  "options": { "temperature": <meta.temperature>, "num_predict": 2048 }
}
```

**The messages array has exactly two elements and is structurally fixed. No conversational
turns travel as messages. No history channel exists here.** `OBSERVED`,
`multiEngineOrchestrator.ts:251-254`.

### Per-segment producers

| # | Segment | Producer (path:line) | Member-derived? |
|---|---|---|---|
| S1 | `messages[0].content` = entire `MAIA_RUNTIME_PROMPT` | `lib/consciousness/MAIA_RUNTIME_PROMPT.ts:123` (471-line module constant), interpolating `AIN_INTEGRATIVE_ALCHEMY_PROMPT` at `:466` and `MEMORY_CANON_GUARD_PROMPT` at `:470` | **No** — static |
| S2 | `Input: "` … `"` wrapper | `ai-intelligence-bridge.ts:356` | frame only |
| S3 | *(nested)* `You are the ${layer} consciousness layer responding from the ${windowDescription} temporal window.` | `consciousness-layer-wrapper.ts:355`; `windowDescription` from `TEMPORAL_WINDOWS` `:87-92` | No |
| S4 | *(nested)* four conditional window lines (`past_integration`/`future_sensing`/`eternal`/`present`) | `consciousness-layer-wrapper.ts:357-360` | No |
| S5 | *(nested)* `Observer Level: ${context.observerLevel}` | `:362`; value = `Math.max(1, Math.min(effectiveHistory.length + 1, 7))` from `maiaService.ts:2040` | **Scalar count only** |
| S6 | *(nested)* `Layer: ${layer}` / `Temporal Window: ${window}` | `:363-364` | No |
| S7 | *(nested)* `Input: "${input}"` | `:366` | **YES — the raw current turn, and the only member content in the prompt** |
| S8 | *(nested)* `Respond authentically from this specific temporal-layer perspective.` | `:368` | No |
| S9 | `\n\nGenerate a ${layerConfig.approach} response as the ${layer} layer.` | `ai-intelligence-bridge.ts:370`, `approach` from `LAYER_PROMPTS` `:61+` | No |
| S10 | `\nKeep response under 150 words.` | `:371` | No |
| S11 | `\nDo not give advice or instructions.` | `:372` | No |
| S12 | `\nSpeak from the perspective of this specific consciousness layer.` | `:373` | No |

`prompt.userPrompt` = S2(S3…S8) + S9 + S10 + S11 + S12. Note S7 is **double-nested and
double-quoted**: the member's turn sits inside `Input: "` inside `Input: "`.

### Segments composed but NOT consumed

* **`prompt.systemPrompt`** — `buildPrompt` returns `layerConfig.system` (`ai-intelligence-bridge.ts:377`),
  it is passed to `generateWithMultipleEngines` (`:267`), threaded into `engineParams`
  (`multiEngineOrchestrator.ts:132-140`) — and then **never read**. The engine substitutes
  `MAIA_RUNTIME_PROMPT` (`:252`). **The nine `LAYER_PROMPTS[*].system` texts never reach any
  model on this path.** Passing is not consumption. `OBSERVED`.
* **`prompt.maxTokens: 200`** (`ai-intelligence-bridge.ts:380`) — never passed; `num_predict`
  is hardcoded `2048` (`multiEngineOrchestrator.ts:258`). Declared, not consumed.

### The three dormant continuity branches

`buildPrompt` (`ai-intelligence-bridge.ts:358-368`) contains exactly the mechanism that would
reintroduce continuity:

```
if (context?.sessionHistory) userPrompt += `\n\nConversation context: ${context.sessionHistory.slice(-3).join(' -> ')}`
if (context?.emotionalTone)  userPrompt += `\n\nEmotional tone: ${context.emotionalTone}`
if (context?.patterns)       userPrompt += `\n\nRecognized patterns: ${context.patterns.join(', ')}`
```

On the Phase-2 path the `context` argument is the **object literal constructed at
`consciousness-layer-wrapper.ts:174-177`**:

```
{ temporalWindow: effectiveWindow, observerLevel: context.observerLevel }
```

and for the synthesis call at `:186-189`: `{ temporalSynthesis: true, window: effectiveWindow }`.

Neither literal carries `sessionHistory`, `emotionalTone`, or `patterns`. **All three branches
are statically unreachable on this path.** `OBSERVED`.

---

## 3. Where continuity is lost — the precise site

`maiaService.ts:2034-2043` builds a **fully populated** `ConsciousnessContext`:

```
sessionId, userId, conversationHistory: effectiveHistory, currentDepth,
elementalResonance, observerLevel, temporalWindow, metaAwareness
```

That object reaches `processWithTemporalWindows` intact and is *available* to it.
`processWithTemporalWindows` consumes `context.temporalWindow` (`:165`) and
`context.observerLevel` (`:176`, `:196`) and **nothing else**.

> **The loss site is the object-literal narrowing at `consciousness-layer-wrapper.ts:174-177`,
> not `buildTemporalPrompt`.** By the time `buildTemporalPrompt` runs, only the two scalars
> remain. This is a refinement of the reconciliation finding, which located the loss at
> `buildTemporalPrompt`'s consumption of `observerLevel` alone. `buildTemporalPrompt` is
> downstream of the loss, not its cause.

Dropped at that boundary: `sessionId`, `userId`, `conversationHistory` (full turn array),
`currentDepth`, `elementalResonance`. Zero conversational, episodic, atom, relational, or
relationship content survives into the prompt. The only trace of history is
`observerLevel` — an integer derived from `effectiveHistory.length`, i.e. **a count, not
content, and carrying no source identity.**

---

## 4. Content-affecting input inventory

Anything capable of changing the returned text.

| # | Input | Site | Effect |
|---|---|---|---|
| A1 | **`responseCache.checkCache(input, baseOrchestration, context)`** | `ai-intelligence-bridge.ts:222-236` | **Can bypass the model entirely** and return `cacheHit.entry.consensus` as the layer response. See §5. |
| A2 | `orchestrationOptimizer.analyzeComplexity(input, context)` | `:239`; optimizer `:57-66` | Scores the input; `personalContext: context?.sessionHistory?.length ? 0.3 : 0` → **always 0 here** (fourth dormant continuity branch). Feeds A3. |
| A3 | `orchestrationOptimizer.optimizeOrchestration(complexity, systemResources, context?.userPreferences \|\| {})` | `:250-254`; optimizer `:88-132` | Selects `orchestrationType` → selects **which and how many models answer**. |
| A4 | **Hardcoded mock `systemResources`** | `:242-247` — `{availableRAM:16000, cpuLoad:0.4, modelLoadTime:2000, networkLatency:50}` | Constant fake telemetry drives A3's downgrade/upgrade logic. Comment at `:241` admits "Mock for now". |
| A5 | `selectEngines(type, elementalLayer)` | `multiEngineOrchestrator.ts:203-229` | `primary`→1 model; `dual_reasoning`→2; `creative_synthesis`→3; `full_orchestra`→6; `heavy_analysis`→4. |
| A6 | `ENGINE_CONFIGS[*].temperature` | `:48-91`, applied `:137` | **Overrides** `prompt.temperature` from `LAYER_PROMPTS`. Per-model temperature wins. |
| A7 | `buildConsensus` | `:286-308` | Not a merge — returns the single highest-`weight` engine's text. |
| A8 | `multiResponse.consensus \|\| multiResponse.primaryResponse` | `ai-intelligence-bridge.ts:301` | Selection between two different candidate texts. |
| A9 | Per-engine failure swallow | `multiEngineOrchestrator.ts:145-148` | Failed engine yields `''`; silently reduces the pool. |
| A10 | `primaryResponse \|\| 'Multi-engine processing failed'` | `:178` | **Literal constant** can become the layer response. |
| A11 | Orchestrator catch → `generateWithLocalModel(params)` | `:189` | Different code path, single local model. |
| A12 | `emergencyFallback(layer, input)` | `ai-intelligence-bridge.ts:344`, `435-451` | **Nine literal constants** (e.g. `"I sense depth in what you're sharing. What wants to emerge?"`) returned on any throw. |
| A13 | **200-character truncation of every layer response** | `consciousness-layer-wrapper.ts:383` — `response.substring(0, 200)` | The synthesis prompt sees only the first 200 chars of each layer, plus `...`. |
| A14 | `buildTemporalSynthesisPrompt` + second `generateLayerWisdom('consciousness', …)` | `:182-189` | A **second** model round trip; its output is the Phase-2 `response`. |
| A15 | `detectTemporalPatterns(input)` regex | `:302-308` | Member wording (`remember\|past\|before\|history\|ancestors`, etc.) selects the window → selects the layer set (`:310+`) → selects prompts and engines. |
| A16 | `Promise.race` 4500 ms timeout | `maiaService.ts:2051-2056` | Ollama's own timeout is **30000 ms** (`multiEngineOrchestrator.ts:239`). On loss, `maiaInitialResponse` = literal `"I'm here with you. Let's explore what you're bringing."` (`:2067`). |
| A17 | Claude consultation block | `maiaService.ts:2085-2144` | **Default OFF** (`MAIA_USE_CLAUDE_CONSULTATION === 'true'`). See §6. |
| A18 | `maiaIntegrateConsultation` | `:2126-2130` | Rewrites `finalResponse` when A17 runs. |
| A19 | **`validateAndRepairResponse` + regeneration callback** | `:2158-2255` | Can **replace the text wholesale**. See §6. |
| A20 | `applySelfletDeliveryGuard(validatedResponse, selfletContext)` | `:2258` | Final post-hoc transform on the member-visible string. |

Per Phase-2 turn the model is contacted `(layers × engines) + (1 × engines)` times —
for `full_orchestra` with 3 layers that is **24 Ollama requests inside a 4.5 s budget.**

---

## 5. The cache is not member-scoped

`lib/consciousness/response-cache.ts` blob `3d29e295…`:

* `:35` `private cache = new Map<string, CacheEntry>()` — in-process; `:360`
  `export const responseCache = new ResponseCache()` — module singleton, shared by every
  request served by that process.
* `:37-38` `semanticThreshold = 0.85`, `freshnessThreshold = 0.7`; freshness decays over a
  6-hour `maxAge`.
* `:301-309` `generateContextHash(context)` hashes **only** `{sessionId, userId}` — both
  `undefined` in the Phase-2 context literal, so every Phase-2 entry hashes identically.
* `:279-287` `isContextCompatible`: `if (context?.sessionId && cachedContextHash !== currentContextHash) return false;` — because `context.sessionId` is **undefined on this path, the guard is skipped** and the function returns `true` ("General responses can be used across contexts").

**Consequence (INFERRED from static control flow, not observed):** two different members whose
turns produce ≥0.85 semantic similarity within 6 hours on the same process can receive the
*same cached generated text*, and the second member's text is returned **without any model
call**. The one guard designed to prevent this is disabled precisely because Phase 2 strips
`sessionId` at `consciousness-layer-wrapper.ts:174-177`.

**Recorded as a defect. NOT repaired** (§XIX). This is a candidate for a separately
authorized unit; it is not within this unit's authority to act on.

---

## 6. Does continuity disappear before the call, or is any restored?

### Verdict

> **Continuity disappears completely before the Phase-2 model call, and nothing restores it
> before or during dispatch. Continuity is reintroduced only *after* dispatch, by two
> mechanisms that are respectively default-disabled and failure-triggered — and when either
> fires, it does not enrich the Phase-2 output, it *replaces* it.**

### Before the call — total loss, four dormant branches

Loss at `consciousness-layer-wrapper.ts:174-177`. Dormant reintroduction sites, all
statically unreachable on this path:

1. `buildPrompt` `sessionHistory` → `ai-intelligence-bridge.ts:358-360`
2. `buildPrompt` `emotionalTone` → `:362-364`
3. `buildPrompt` `patterns` → `:366-368`
4. `analyzeComplexity` `context?.sessionHistory?.length` → `orchestration-optimizer.ts:66`

Nothing between `buildPrompt` and the `fetch` adds member content. `MAIA_RUNTIME_PROMPT` is a
static module constant and contributes no member data — though it does interpolate
`MEMORY_CANON_GUARD_PROMPT` (`:470`), i.e. **the model is instructed how to handle memory
while being given none.**

### After the call — two conditional restoration paths

**Path 1 — Claude consultation (`maiaService.ts:2085-2144`). DEFAULT OFF.**
Gate: `process.env.MAIA_USE_CLAUDE_CONSULTATION === 'true'` (`:2083`); comment at `:2079-2081`
states it is disabled by default. When enabled it passes:
* `conversationContext: effectiveHistory.slice(-5).map(...)` (`:2110-2113`) — **conversational continuity, last 5 exchanges**
* `contextAddenda` = join of `conversationalRecallAddendum`, `episodicRecallAddendum`,
  `atomsAddendum`, `relationalContextAddendum` (`:2096-2102`) — **episodic, atom and relational continuity**

So the full continuity payload is assembled in `meta` and is *available* at this seam, and is
consumed **only** if the env gate is on.

**Path 2 — Socratic validator regeneration (`:2158-2255`). FAILURE-TRIGGERED.**
`validateAndRepairResponse(sessionId, input, finalResponse, meta, 'DEEP', regenFn)`. The
`regenFn` (`:2165-2254`) builds `repairedContext` carrying ~15 addenda — including
`epistemicPathAddendum`, `spiralSnapshotAddendum`, `therapeuticFrameworkAddendum`,
`wuxingSnapshotAddendum`, `astrologicalContextAddendum`, `knowledgeGateAddendum`,
`fieldWisdomAddendum`, and the recall addenda at `:2227` — then calls
`buildMaiaComprehensivePrompt(input, repairedContext, effectiveHistory)` (`:2230`) and
`generateText({systemPrompt: repairedPrompt + '\n\n' + repairPrompt, userInput: input, …})`
(`:2241-2252`).

`generateText` defaults to `TEXT_MODEL_PROVIDER = 'anthropic'` (`modelService.ts:52-53`).
**So when validation fails, the member-visible text is produced by Claude from a
full-continuity prompt, and the Phase-2 Ollama text is discarded entirely.**

### The consequence for this unit's premise

Phase 2 is **not** the terminal composition site for the member-visible response. Its output
is `maiaInitialResponse` (`:2058`), an *intermediate*. The member-visible string is
`applySelfletDeliveryGuard(validatedResponse, …)` (`:2258`, returned `:2261`).

---

## 7. Model call characterization

| Property | Finding | Evidence |
|---|---|---|
| Provider | **Ollama only.** `POST ${OLLAMA_BASE_URL \|\| 'http://localhost:11434'}/api/chat` | `multiEngineOrchestrator.ts:235, 246` |
| Reaches Claude/Anthropic? | **No** — not on the Phase-2 dispatch | trace §1 |
| Reaches `modelService.generateText`? | **No.** `ai-intelligence-bridge.ts:264` tests `this.multiEngineEnabled`, a **hardcoded instance field `= true`** at `:45`, never reassigned anywhere in the file. The `else` branch calling `generateText` (`:304-308`) is **statically unreachable** from `generateLayerWisdom`. | `:45`, `:264`, `:304` |
| Env gating | **Bypassed.** `ENABLE_MULTI_ENGINE`, `MAIA_ORCHESTRATION_TYPE`, `MAIA_TEXT_PROVIDER` all live in `modelService.ts:52-58` and gate `generateText` only. The bridge imports `generateWithMultipleEngines` **directly** (`:19-22`), routing around all of them. | `:19-22`, `modelService.ts:52-58` |
| Models | `deepseek-r1:latest`, `qwen2.5:7b`, `gemma2`, `llama3.1-8b`, `llama3.1-70b`, `mistral:7b-instruct-q8_0`, `nous-hermes2-mixtral:8x7b` | `multiEngineOrchestrator.ts:48-91` |
| Parameters | `temperature` = per-engine `ENGINE_CONFIGS` value (overrides layer temp); `num_predict: 2048`; `stream: false`; 30 s `AbortController` | `:137`, `:239`, `:255-259` |
| **History as messages?** | **No.** Two-element fixed array. No turn replay, no assistant messages. | `:251-254` |
| Response extraction | `data.message?.content?.trim() \|\| ''` — empty string on shape mismatch | `:270-271` |
| Provider attribution | Deployed audit surface reports `provider:'unknown'`, `model:'consciousness-wrapper'`, `reason:'provider_not_threaded_in_deep_path'` | `maiaService.ts:2284-2289` |

---

## 8. Corrections to Units 1–4

* **C5-1 — corrects the AI-engine audit doc, not a census unit.**
  `docs/architecture/AI_ENGINE_PARTICIPATION_AUDIT_2026-05-26.md:61` states MultiEngineOrchestrator is
  "Gated by `MAIA_ORCHESTRATION_TYPE` — unset in prod" and that `ai-intelligence-bridge` is
  therefore "dormant in prod" (`:78`). **False for this path.** The bridge's own
  `multiEngineEnabled = true` field (`ai-intelligence-bridge.ts:45`) makes the orchestrator the
  *only* branch, and the import at `:19-22` bypasses `modelService`'s env gates entirely.
  This is `SURFACE_SUBSTITUTION` — a doc table substituted for the executable dispatch (§III, §IV).
  Prior findings resting on "bridge is dormant in prod" must not be carried forward.

* **C5-2 — refines the reconciliation's loss-site claim.**
  Reconciliation held that `buildTemporalPrompt` consumes only `context.observerLevel`. Confirmed,
  but the *loss* occurs earlier, at the object-literal narrowing `consciousness-layer-wrapper.ts:174-177`.
  Continuity is already gone when `buildTemporalPrompt` is entered. Naming `buildTemporalPrompt`
  as the loss site misdirects any future bounded question.

* **C5-3 — corrects any claim that `LAYER_PROMPTS[*].system` is the Phase-2 system prompt.**
  It is composed (`:377`) and passed (`:267`) but **discarded**; `MAIA_RUNTIME_PROMPT` is
  substituted at `multiEngineOrchestrator.ts:252`. Availability is not composition.

* **C5-4 — corrects Unit 4 Artifact 3's "Phase 2 … produces a real generated response."**
  Qualify: it produces a generated response **only if a local Ollama daemon answers within
  4.5 s**. Otherwise A10/A12/A16 return literal constants. Phase 2 is *capable* of reaching a
  model; that it *does* is `RUNTIME_BRANCH_UNRESOLVED`.

* **C5-5 — corrects this unit's own framing premise.**
  "Phase-2 Terminal Composition" presupposes Phase 2 is terminal. It is not; see §6 and §11.

---

## 9. Provenance discontinuities

1. **No identifier of any kind reaches the model.** No `sessionId`, `userId`, memory IDs, or
   atom IDs appear in either message. The sole member content is the raw current turn (S7).
2. **`observerLevel` is a count masquerading as depth.** `min(effectiveHistory.length+1, 7)`
   (`maiaService.ts:2040`). It carries the *quantity* of history into the prompt with none of
   its content and no source identity — an influence with no provenance to justify it (§VIII).
3. **Cache entries have no member provenance** (§5). `contextHash` is constant across all
   Phase-2 traffic, so a stored response cannot be attributed to, or fenced to, a member.
4. **Provider provenance is explicitly unthreaded** (`maiaService.ts:2284-2289`), so Phase-2
   text cannot be attributed to a model after the fact even in principle.
5. **`MEMORY_CANON_GUARD_PROMPT` is present without any memory** (`MAIA_RUNTIME_PROMPT.ts:470`).
   Memory *posture* is canonized into the system prompt on a call carrying zero memory —
   influence policy without substrate.
6. **200-char truncation** (A13) destroys most of each layer's output before synthesis, with no
   marker beyond a literal `...`.

---

## 10. Capability candidates (§XVII — RECORD ONLY, no design, no repair)

* `buildPrompt`'s three dormant branches (`ai-intelligence-bridge.ts:358-368`) — an existing,
  written continuity-composition mechanism that is merely unfed.
* `analyzeComplexity`'s `personalContext` term (`orchestration-optimizer.ts:66`).
* The already-assembled recall addenda quartet at `maiaService.ts:2096-2102`.
* `buildMaiaComprehensivePrompt`'s ~15-addendum context (`:2180-2230`) — a full continuity
  assembly that Phase 2 does not use but the regeneration path does.

Recording these is not a proposal to connect them.

## 11. Runtime-only unknowns

* Whether `OLLAMA_BASE_URL` resolves to a reachable daemon in the deployed environment —
  determines whether Phase 2 yields a model response or a constant. `RUNTIME_BRANCH_UNRESOLVED`.
* Whether 3-layer × up-to-6-engine fan-out ever completes inside the 4.5 s race (A16).
* Whether `MAIA_USE_CLAUDE_CONSULTATION` is set in production (decides Path 1, §6).
* Validator failure rate — decides whether Path 2 regeneration is the *de facto* member path.
* Whether cross-member cache reuse (§5) has actually occurred.
* Which phase real members receive (`metaAwareness`/`metaTriggers` vs. `observerLevel >= 4`).

## 12. Stop state

**`STOPPED_UNENUMERATED_ASSEMBLY_SITE`** (§XXIII.4; §XXXV.G).

All twelve enumerated questions are answered *for the Phase-2 dispatch itself*. The stop is
declared because the unit's premise is falsified by its own evidence: the validator
regeneration path at `maiaService.ts:2165-2254` is a **second, fully-featured context assembly
site** — `buildMaiaComprehensivePrompt` with ~15 addenda including the full recall quartet,
dispatched to a **different provider** (`generateText` → `anthropic`) — whose output
**replaces** the Phase-2 text rather than enriching it. That materially changes the topology:
Phase 2 is not the terminal composition site for the member-visible response.

Characterizing that site requires its own bounded unit. No repair proposed (§XIX).

## 13. Next bounded question

> On the DEEP path, under what exact conditions does `validateAndRepairResponse`
> (`lib/sovereign/maiaService.ts:2158`, blob-bound at canonical `52a3b924`) invoke its
> regeneration callback — and when it does, what is the literal prompt produced by
> `buildMaiaComprehensivePrompt(input, repairedContext, effectiveHistory)`, which of its ~15
> addenda are populated versus merely declared, and does the regenerated Claude response fully
> replace the Phase-2 text in every case?

*(Single question, statically answerable, no remediation implied.)*
