# CMC-001 · Unit 6 — Regeneration Path and Comprehensive Prompt Audit

**Mode:** STATIC ONLY. NO REMEDIATION. No repository file modified.
**Frozen mandate:** commit `dbc4d5df3f0806403ee3d14aba4dd573b637dfb0`, blob `8374f1e942c8e4f8b41dab319eb75dabf609681b` — **VERIFIED, digest matches.**
**Canonical referent:** `origin/clean-main-no-secrets` = `52a3b924b7cf52013c1c8b0d635359c2cad672fc` (fetched fresh 2026-08-12).
**Evidence basis:** `STATIC_POSSIBLE`. `observed_status: NOT_OBSERVED`. No runtime witness taken.

---

## 1. Resolved sources (path + blob — identity is never by name)

| Repository-relative path | Blob SHA |
|---|---|
| `lib/sovereign/maiaService.ts` | `e8f5bf6d9badcec949f58d8fa0ac9ba0e01954c1` |
| `lib/sovereign/maiaVoice.ts` | `8ea2f62ab81131513d0ed75926d2850c0c1b3e3c` |
| `lib/sovereign/intelligentVoiceAdaptation.ts` | `232b68c8a89352756a8ff6c54d5b911489d31c4e` |
| `lib/validation/socraticValidator.ts` | `dfea134d6ffb7053d8a953a35e035ca21bfc3ac2` |
| `lib/ai/modelService.ts` | `270fb541004aeebac96f83af2d9b3350b8c7f4db` |
| `app/api/sovereign/app/maia/list/route.ts` | `04b08a20df52bd71ae05074e095e81abe9661379` |

Basename collisions checked: `modelService.ts` resolves to **three** paths in the canonical tree
(`lib/ai/`, `lib/utils/`, `app/api/_backend/src/utils/`). The one bound here is `lib/ai/modelService.ts`,
by the import at `lib/sovereign/maiaService.ts:7` (`from '../ai/modelService'`). `socraticValidator.ts`,
`maiaVoice.ts`, `intelligentVoiceAdaptation.ts` each resolve to a single path. **OBSERVED.**

### Binding lineage

```
app/api/sovereign/app/maia/list/route.ts:1184  getMaiaResponse({sessionId, input, meta})
  ↓ maiaService.ts:2943  switch (processingProfile)
  ↓ maiaService.ts:2967  case 'DEEP' → deepPathResponse(...)
  ↓ maiaService.ts:2158  validateAndRepairResponse(sessionId, input, finalResponse, meta, 'DEEP', regenFn)
  ↓ maiaService.ts:553   validateSocraticResponse(...)  [lib/validation/socraticValidator.ts:60]
  ↓ maiaService.ts:589   if (decision === 'REGENERATE' && repairPrompt && regenerateFn) → regenerateFn(repairPrompt)
  ↓ maiaService.ts:2165-2254  regenFn
      ├ 2169  repairedContext: MaiaContext (17 addendum fields)
      ├ 2230  buildMaiaComprehensivePrompt(input, repairedContext, effectiveHistory)  [maiaVoice.ts:953]
      │        ├ maiaVoice.ts:1038  buildComprehensiveVoicePrompt  [intelligentVoiceAdaptation.ts:224]
      │        └ maiaVoice.ts:1045  appendAllContextAddenda        [maiaVoice.ts:489]
      ├ 2234  adaptResponsePromptWithPolicy(repairedPrompt, policy)   (conditional on `policy`)
      └ 2241  generateText({systemPrompt: repairedPrompt + '\n\n' + repairPrompt, ...})  [modelService.ts:78]
```

---

## 2. Regeneration trigger conditions

`validateAndRepairResponse` invokes `regenerateFn` **iff** all three hold (`maiaService.ts:589`):

1. `validation.decision === 'REGENERATE'`
2. `validation.repairPrompt` is truthy
3. `regenerateFn` was supplied

(2) is implied by (1) — `repairPrompt` is generated whenever decision is `REGENERATE` or `BLOCK`
(`socraticValidator.ts:114`). (3) holds on FAST (`:1355`), CORE (`:1738`) and DEEP (`:2158`).

`decision = 'REGENERATE'` iff `hasCritical || violationCount >= 2` (`socraticValidator.ts:87`).
`BLOCK` (exactly one VIOLATION) does **not** regenerate — the draft is returned unchanged.
Regeneration is therefore **failure-triggered only**. There is no success path to it.

### Which validators can actually fire — the argument surface is starved

`validateAndRepairResponse` builds `ValidateArgs` at `maiaService.ts:568-579`:

```
element:      atlas?.element?.toLowerCase()
facet:        atlas?.facet
phase:        atlas?.phase
confidence:   cognitiveProfile?.rollingAverage ? rollingAverage/10 : undefined
isUncertain:  cognitiveProfile ? stability === 'unstable' : false
// regulation/capacity deliberately NOT passed (comment :578)
```

* **`atlas = (meta as any).atlasContext`** (`:563`). `git grep atlasContext 52a3b924 -- app/ lib/`
  returns exactly **two** hits: this read (`:563`) and a comment at `:2806` reading
  *"NOTE: atlasContext removed - not yet in router interface"*. **There is no writer of
  `meta.atlasContext` anywhere in the canonical tree.** Therefore `element`, `facet`, `phase`
  are **always `undefined`**. `OBSERVED`.
* **`regulation` / `capacity`** are never passed. `OBSERVED`.

Consequences, per detector (`socraticValidator.ts`):

| Layer | Code | Severity | Reachable on canonical? | Gate |
|---|---|---|---|---|
| 1 OPUS_AXIOMS | `NON_IMPOSITION_OF_IDENTITY` | VIOLATION | **YES** | 3 regexes on draft |
| 1 | `EXPLICIT_HUMILITY` | WARNING | YES | ≥3 certainty words |
| 1 | `PACE_WITH_CARE` | WARNING | YES | rushing regex |
| 2 ELEMENTAL | `FIRE_IN_WATER` | CRITICAL | **NO** — `if (!element) return` `:196` | needs `element` |
| 2 | `WATER_IN_FIRE` | WARNING | **NO** | needs `element` |
| 3 PHASE | `FALSE_CERTAINTY_WHEN_UNCERTAIN` | **CRITICAL** | **YES** (conditional) | `isUncertain` && certainty≥2 && complexity==0 |
| 4 CAUTION | `MISSION_DURING_GRIEF` | CRITICAL | **NO** | needs `element==='water'` **and** `regulation==='hypo'` (double-dead) |
| 4 | `SPIRITUAL_BYPASSING` | VIOLATION | **NO** | needs `element==='water'` |
| 4 | `FIRE_PRACTICES_IN_WATER` | CRITICAL | **NO** | element + regulation |
| 4 | `RUSHING_DEVELOPMENT` | WARNING | YES | regex only |
| 5 LANGUAGE | `MIND_MOUTH_COLLAPSE_REFERENT` | **CRITICAL** | **YES** | `/: \./` on draft |
| 5 | `MIND_MOUTH_COLLAPSE_DOUBLE_PERIOD` | WARNING | YES | `/\.\s*\./` |
| 5 | `MIND_MOUTH_COLLAPSE_EMPTY_QUOTE` | **CRITICAL** | **YES** | `/"\s*"/` or `/'\s*'/` |
| 5 | `MIND_MOUTH_COLLAPSE_STUTTER` | **CRITICAL** | **YES** | `(\b\w{4,}\b)(\s+\1){2,}` |
| 5 | `MIND_MOUTH_COLLAPSE_TAUTOLOGY` | WARNING | YES | 3 patterns |
| 5 | `CLINICAL_IN_TENDER` | WARNING | **NO** | needs `element==='water'` |

**Exactly one VIOLATION code is reachable, and it is pushed at most once per call.**
Therefore `violationCount >= 2` is **statically unsatisfiable** on the canonical tree.

> **Regeneration reduces to: at least one CRITICAL, from a set of four —**
> `FALSE_CERTAINTY_WHEN_UNCERTAIN` (requires a cognitive profile with `stability === 'unstable'`),
> and three purely syntactic generation-artifact detectors: a `": ."` sequence, an empty quote
> pair, or a ≥3× repeated 4+-letter word.

Three of the four surviving triggers detect **model output malformation**, not member state.
`INFERRED` (from the above OBSERVED facts): on the canonical tree, continuity is admitted to the
prompt predominantly when the local model **stutters or drops a placeholder**.

---

## 3. The literal comprehensive prompt, segment by segment

`buildMaiaComprehensivePrompt(input, repairedContext, effectiveHistory)` — `maiaVoice.ts:953`.

### Branch A — MAIA-PAI early return (`maiaVoice.ts:962-1032`)

Taken iff `context.conversationContext?.depthConfig && conversationDepth === 'opening' && maxTokens <= 50`.
`repairedContext.conversationContext = (meta as any).conversationContext` (`maiaService.ts:2177`).
`git grep depthConfig` shows the only producer is `lib/consciousness/maiaOrchestrator.ts:521`, and
`app/api/sovereign/app/maia/list/route.ts` never sets `meta.conversationContext`. **Branch A is
not reachable from the canonical-live route** except via client-supplied body `meta` (see §9).
If taken, it returns a hand-written prompt with **zero addenda and zero history** — it never
calls `appendAllContextAddenda`.

### Branch B — normal path

`result = buildComprehensiveVoicePrompt(input, context, context.consciousnessInsights, conversationHistory)`
then `result.prompt = appendAllContextAddenda(context, result.prompt)`.

| # | Segment | Producer (path:line) | Member-derived? |
|---|---|---|---|
| C1 | `VoicePrompts[baseVoiceLevel](context)` — one of four static persona blocks (`casual` / `thoughtful` / `wise_elder` / `consciousness_architect`) | `intelligentVoiceAdaptation.ts:156-215`, selected at `:342`; level from `synthesizeOptimalVoice` `:283` | selection only |
| C1a | *(inside C1)* `${getTemporalContext(context.timezone)}` | `intelligentVoiceAdaptation.ts` (imported helper) | timezone |
| C1b | *(inside C1)* `Previous conversation: ${context.summary \|\| 'New conversation'}` | `:168/:184/:199/:215` | **`repairedContext.summary` is hardcoded to `` `Repair attempt for: ${input}` `` (`maiaService.ts:2172`). The one history slot in the persona block is overwritten with a synthetic repair string.** |
| C2 | `🌟 MULTI-DIMENSIONAL INTELLIGENCE ADAPTATION:` + awareness level, 6 intelligence-dimension percentages, preferred complexity, primary approach | `intelligentVoiceAdaptation.ts:346-353`; profile from `awarenessLevelDetector.detectAwarenessLevel(input, conversationHistory)` `:235` | **derived scores only — no quoted history** |
| C3 | `🧠 CONSCIOUSNESS CONTEXT:` + `Elemental Resonance` / `Observer Level` / `Relationship Depth` (each conditional) | `:356-368`; source = `context.consciousnessInsights` = `{dominantElement, processingStrategy:'deep', relationshipDepth}` (`maiaService.ts:2175`) | **`elementalResonance` and `observerLevel` are NOT on that object → both lines never render. Only `Relationship Depth: N%` renders.** |
| C4 | `🎯 MEMBER ARCHETYPE ADAPTATION (…)` + voice formality/tone, content complexity, perspective | `:372-378`, gated on `context.memberProfile && context.wisdomAdaptation` | profile-derived |
| C5 | `conventionsResult.promptAdditions` | `:381`, from `conversationalConventions.applyConventions(conversationalContext)` `:248`; that context carries `conversationHistory` and `sessionDepth` | **passes history in; whether any of it is quoted into `promptAdditions` is not resolved here — see §11** |
| C6 | `🎭 VOICE INTEGRATION GUIDANCE:` + final voice level, input complexity + reasoning, focus areas, and the fixed "you have FULL access…" paragraph | `:384-394` | no |
| C7 | Each populated `MaiaContext` addendum, in `ADDENDA_SPECS` order, `\n\n`-joined | `maiaVoice.ts:406-430` (24 specs), appended in the loop at `:490-496` | **YES where populated — see §4** |
| C8 | `MEMORY SPEECH-ACT BOUNDARY (non-negotiable): …` | `maiaVoice.ts:507` — unconditional | no |
| C9 | `PLATFORM_KNOWLEDGE_ADDENDUM` | `maiaVoice.ts:514`, constant from `lib/sovereign/platformKnowledge.ts` — unconditional | no |
| C10 | `🏛️ PLATFORM KNOWLEDGE BOUNDARY — standing discipline` | constant `maiaVoice.ts:449`, appended `:518` — unconditional | no |
| C11 | `🪟 INTERFACE HUMILITY — standing discipline` | constant `maiaVoice.ts:473`, appended `:522` — unconditional | no |
| C12 | *(back in maiaService)* `adaptResponsePromptWithPolicy(repairedPrompt, policy)` | `maiaService.ts:2234`, gated on `policy` from `getConsciousnessPolicy` `:372` | no |
| C13 | `'\n\n' + repairPrompt` — the validator's `SOCRATIC VALIDATOR FEEDBACK` block: header, per-rupture code/severity/detected/fix/context, optional elemental guidance, optional phase-transition note, closing instruction | `socraticValidator.ts:492-549`, concatenated at `maiaService.ts:2242` | validator-derived |
| C14 | `userInput` (separate field, not the system prompt) = raw `input` | `maiaService.ts:2243` | **YES — the current turn** |

**Not present anywhere in the produced string:** the `MAIA_RUNTIME_PROMPT` (the 471-line
constant that is the entire system prompt on the Phase-2 path) — Branch B never references it.
The regeneration prompt and the Phase-2 prompt share **no** text.

**`repairedContext.repairGuidance = repairPrompt`** (`maiaService.ts:2183`). `git grep repairGuidance 52a3b924`
returns exactly two hits: that write, and the interface declaration at `maiaVoice.ts:43`.
**It is never read. Declared and inert.** The repair guidance reaches the model only via the
separate C13 concatenation.

---

## 4. Addenda: populated vs. declared

`ADDENDA_SPECS` (`maiaVoice.ts:406-433`) enumerates **24** fields; `appendAllContextAddenda`
iterates all 24, appending each through `safeAddendum` (rejects non-strings, empty, `'undefined'`, `'null'`).

`repairedContext` (`maiaService.ts:2169-2228`) sets **17** of the 24.

Producer column = does any non-`between/chat` canonical producer write the corresponding `meta` key?
(`git grep <field> 52a3b924 -- app/ lib/` excluding `.md`, `__tests__`, `between/chat`, and the
two consuming modules.)

| # | ADDENDA_SPECS field | In `repairedContext`? | Producer on the canonical-live route | Reaches DEEP-repair prompt? |
|---|---|---|---|---|
| 1 | `placeAddendum` | **NO** | `maia/list/route.ts:1222` (`placeAddendum`) | **NO — structurally dropped** |
| 2 | `relationshipModeAddendum` | **NO** | none found | NO |
| 3 | `governorAddendum` | yes | **none** (only `between/chat`) | declared, inert |
| 4 | `guestContextAddendum` | **NO** | none found | NO |
| 5 | `journalContextAddendum` | **NO** | none found | NO |
| 6 | `captureContextAddendum` | **NO** | none found | NO |
| 7 | `astrologicalContextAddendum` (← `meta.astrologyAddendum`) | yes | `maia/list/route.ts:1207` | **YES when non-empty** |
| 8 | `spiralSnapshotAddendum` | yes | **none** (only `between/chat:1623`) | declared, inert |
| 9 | `wuxingSnapshotAddendum` | yes | `maia/list/route.ts:1201` | **YES when non-empty** |
| 10 | `bridgeSnapshotAddendum` | **NO** | route passes `bridgedSnapshot` (different key, raw object) | NO |
| 11 | `therapeuticFrameworkAddendum` | yes | **none** | declared, inert |
| 12 | `reflectionLensAddendum` | yes | **none** | declared, inert |
| 13 | `epistemicPathAddendum` | yes | **none** (only `between/chat:1608`) | declared, inert |
| 14 | `maiaModeAddendum` | yes | **none** | declared, inert |
| 15 | `scribeSessionDiscussionAddendum` | yes | **none** | declared, inert |
| 16 | `studioAddendum` | yes | `maia/list/route.ts:1204` (gated `surface === 'studio'`) | conditional |
| 17 | `knowledgeGateAddendum` | yes | `maia/list/route.ts:1206` | **YES when non-empty** |
| 18 | `memberWebAddendum` | **NO** | `maia/list/route.ts:1206` | **NO — produced then structurally dropped** |
| 19 | `consultationAddendum` | yes | **none** | declared, inert |
| 20 | `fieldWisdomAddendum` | yes | **none** | declared, inert |
| 21 | `conversationalRecallAddendum` | yes | `maia/list/route.ts:987, 1218` | **YES when non-empty** |
| 22 | `episodicRecallAddendum` | yes | `maia/list/route.ts:1013, 1219` | **YES when non-empty** |
| 23 | `atomsAddendum` | yes | `maia/list/route.ts:963, 1216` | **YES when non-empty** |
| 24 | `relationalContextAddendum` | yes | `maia/list/route.ts:881, 1220` | **YES when non-empty** |

**Tally.** Of 24 declared specs: **9 are declared-and-inert** (in `repairedContext` but with no
canonical producer outside `between/chat`); **7 are never placed in `repairedContext`** at all,
two of which (`placeAddendum`, `memberWebAddendum`) **are** produced by the route and are lost at
the `repairedContext` object literal; **6 are live** — astrology, wuxing, knowledge-gate,
conversational recall, episodic recall, atoms, relational context (7 counting the
`surface === 'studio'`-gated studio addendum).

**The four continuity-bearing addenda — `conversationalRecallAddendum`, `episodicRecallAddendum`,
`atomsAddendum`, `relationalContextAddendum` — are all live, all produced by the canonical-live
route, and all reach the DEEP-repair prompt string.** This is the only enumerated site on the
DEEP path where they do so.

**Three route-produced addenda are not in `ADDENDA_SPECS` at all** —
`memoryInfluenceAddendum`, `forwardReadinessAddendum`, `practiceFieldAddendum`
(`maia/list/route.ts:1213, 1214, 1205`). They are interpolated into the **FAST** prompt
(`maiaService.ts:1297`) but are invisible to `appendAllContextAddenda`, so they cannot reach the
DEEP-repair prompt. `OBSERVED`.

**Correction to the count in Unit 5.** Unit 5 said "~15 addenda". The exact figure is **17 fields
set in `repairedContext`**, against **24 iterated specs**, of which **6–7 are live** on the
canonical-live route.

---

## 5. Replacement / merge / append verdict

**Full replacement, with a caveat about what it replaces.**

* `regenerateFn` returns `text` (`maiaService.ts:2253`); `validateAndRepairResponse` assigns
  `finalResponse = await regenerateFn(...)` (`:591`) and returns it as `response` (`:635`).
* `deepPathResponse` uses only `validatedResponse` thereafter (`:2257-2260`). The Phase-2
  `finalResponse` is discarded — no merge, no append, no fallback comparison.
* **Exception (`maiaService.ts:594-597`)**: if `regenerateFn` throws, the catch keeps the original
  and sets `wasRegenerated = false`. Failure is silent to the member.
* The regenerated text is *not* a revision of the Phase-2 text: the model never receives the
  Phase-2 output. `userInput` is the raw member turn (`:2243`) and the only reference to the prior
  draft is the validator's abstract rupture descriptions inside C13. It is a **fresh generation
  under different instructions**, not a repair of a string.

At the outer layer the replacement is itself replaceable — see §6.

---

## 6. Provider characterization — and the third assembly site

### Provider

The regeneration call goes to `generateText` (`lib/ai/modelService.ts:78`), which
`lib/sovereign/maiaService.ts:7` imports. Dispatch order (`modelService.ts:83-192`):

1. `if (MAIA_INFERENCE_MODE)` → `generateTextWithSovereignty(req, MAIA_INFERENCE_MODE, t0)`. Env-gated; unset by default.
2. `if (TEXT_MODEL_PROVIDER === 'openai')` → throws.
3. `if (ENABLE_MULTI_ENGINE && (TEXT_MODEL_PROVIDER === 'multi_engine' || req.meta?.useMultiEngine))` → `generateWithMultipleEngines` (the Ollama fan-out). `ENABLE_MULTI_ENGINE = process.env.MAIA_ENABLE_MULTI_ENGINE === 'true'` — **off unless set**. `git grep useMultiEngine 52a3b924 -- lib/ app/` returns **one** hit: this read. No writer. `OBSERVED`.
4. Moonshot/Kimi — `TEXT_MODEL_PROVIDER === 'moonshot' || req.meta?.useKimi`.
5. **`if (TEXT_MODEL_PROVIDER === 'anthropic')` → `generateWithClaude(...)`.** `TEXT_MODEL_PROVIDER = (process.env.MAIA_TEXT_PROVIDER as …) || 'anthropic'` (`modelService.ts:52-53`) — **`'anthropic'` is the default with no env var set.**
6. On Claude failure (except billing/auth `noFallback` and `SMOKE_NO_FALLBACK`) → `generateWithLocalModel` (Ollama/DeepSeek).

> **Determined independently: the regeneration path is NOT hardwired to Ollama.** It is the
> ordinary `modelService` gateway, whose default provider is **Claude (Anthropic)**, with local
> Ollama only as an error fallback. This is the *opposite* of the Phase-2 finding, where
> `modelService` is bypassed entirely and `multiEngineOrchestrator.ts:246` calls Ollama directly.
> `RUNTIME_BRANCH_UNRESOLVED` only for the env vars (`MAIA_INFERENCE_MODE`, `MAIA_TEXT_PROVIDER`,
> `MAIA_ENABLE_MULTI_ENGINE`) and for whether `ANTHROPIC_API_KEY` is present.

`deepPathResponse` nonetheless returns a hardcoded provider stub
`{provider:'unknown', model:'consciousness-wrapper', reason:'provider_not_threaded_in_deep_path'}`
(`maiaService.ts:2284-2289`) — so even when the member-visible text was produced by Claude, the
sovereignty-audit field says `unknown`. **The provider audit trail is wrong by construction on
this path.** `OBSERVED`.

### Is there a third assembly site? — YES, and it is terminal

`git grep 'generateText(' 52a3b924 -- lib/sovereign/maiaService.ts` yields six call sites:
`1337` (FAST), `1720` (CORE), `1759` (CORE repair), `2241` (DEEP repair), `3382` (shadow),
`3615` (**AIN shape rewrite**).

* `3382` — `runShadowEngines({systemPrompt: shadowSystemPrompt, …})`, fire-and-forget, gated on
  `turnId > 0 && MAIA_SHADOW_MODE !== '0'`. Output is logged for comparison learning, never
  returned. Not member-visible.
* **`3615` — AIN shape rewrite.** Runs in `getMaiaResponse`, *after* the path switch, *after*
  `finalizeMemberFacingText` (`:3058`), *after* persistence (`addConversationExchange`, `:3081`),
  and *after* audio synthesis (`:3069`). Gate:
  `(AIN_SHAPE_TELEMETRY === '1' || NODE_ENV !== 'production')` && `!isRewritePass` && `!shape.pass`
  && `(AIN_SHAPE_REWRITE === '1' || NODE_ENV !== 'production')` && `(shape.flags.menuMode || hardProseMenu)`.
  It calls `generateText({systemPrompt: AIN_NO_MENU_REWRITE_PROMPT, userInput: 'USER INPUT:…\n\nASSISTANT RESPONSE TO REWRITE:…'})`
  and, if the result exceeds 50 chars, executes `text = rewritten.trim()` (`:3623`).
  `text` at `:3713` is the returned member-visible string.

> **`AIN_NO_MENU_REWRITE_PROMPT` is a static constant. The rewrite prompt carries no addenda, no
> history, no member profile — only the current turn and the prior response text.** So the one
> path that admits continuity can itself be superseded by a continuity-free rewrite, and that
> rewrite is enabled by default outside production (`NODE_ENV !== 'production'` satisfies both gates).

**Terminal ordering, OBSERVED:** the string persisted to conversation history (`:3081`) and the
synthesized audio (`:3069`) are both taken **before** the rewrite at `:3623`. When the rewrite
fires, the member reads one text, hears a different one, and the continuity substrate stores the
third (pre-rewrite) one. The `✅ MAIA … response complete: … ${text.length} chars` log at `:3577`
also predates the rewrite.

### One more `buildMaiaComprehensivePrompt` caller — orphaned

`lib/learning/enhanced-maia-service.ts:20` imports it. Its only caller is
`lib/consultation/deep-path-with-consultation.ts:125`, and
`git grep deep-path-with-consultation 52a3b924 -- app/ lib/` returns **zero importers**.
Dead lineage; does not supersede anything. `OBSERVED`.

### RCN early return — bypasses assembly entirely

`maiaService.ts:2844-2878`: when `rcnResult.confidence >= 0.7 && completedNormally`,
`rawResponse = formatRcnForMaia(rcnResult, rcnContext)` and `getMaiaResponse` **returns before the
FAST/CORE/DEEP switch**, reporting `processingProfile: 'DEEP'` for client compatibility. No prompt
is assembled and no model is called for the member-visible text on that branch.
Enumerated here for completeness; it does not bear on the continuity question because it never
reaches any assembly site.

---

## 7. Does continuity enter only on the repair path?

**On the DEEP path, as bound at `52a3b924`: yes, for the enumerated sites — with one prior
exception that is off by default, and one downstream site that can undo it.**

| Site | Carries accumulated continuity? | Reached on a successful turn? |
|---|---|---|
| Phase-2 consciousness wrapper (Unit 5) | **No** — narrowed to `{temporalWindow, observerLevel}` at `consciousness-layer-wrapper.ts:174-177` | yes (the normal path) |
| Claude consultation (`maiaService.ts:2085-2144`) | **Yes** — last-5 exchanges + the four recall addenda | only if `MAIA_USE_CLAUDE_CONSULTATION === 'true'`; **default off** |
| **Regeneration (`:2165-2254`)** | **Yes** — 6–7 live addenda incl. all four recall addenda | **only on validation failure** |
| AIN shape rewrite (`:3615`) | **No** — static rewrite prompt | only on shape failure; can overwrite the above |

So the precise statement is not quite "only when her first response fails validation" — it is
narrower and stranger:

> **MAIA's accumulated continuity reaches a model prompt on the DEEP path only when her first
> response fails a validator whose surviving triggers are, in three cases out of four,
> detectors of her own generation artifacts** — a `": ."`, an empty quote pair, or a stuttered
> word. The fourth requires an unstable cognitive profile. The elemental and caution layers that
> would have made the validator responsive to *member state* are all dead, because
> `meta.atlasContext` has no writer.

And on the FAST/CORE paths the inversion does **not** hold: `maiaService.ts:1297` (FAST) and
`buildMaiaWisePrompt` via the CORE `context` (`:1529-1590`) inject the addenda on the **normal**
turn. The inversion is specific to DEEP. `OBSERVED`.

---

## 8. Corrections to Units 1–5

1. **Unit 5, "~15 addenda"** → exactly **17** fields set in `repairedContext`, against **24**
   iterated `ADDENDA_SPECS`. Corrected with the full table in §4.
2. **Unit 5, "`generateText` defaults to `TEXT_MODEL_PROVIDER = 'anthropic'` (modelService.ts:52-53)"**
   → confirmed, and extended: two earlier gates (`MAIA_INFERENCE_MODE`, multi-engine) can divert
   before Claude is reached, and Claude failure falls back to local Ollama. The claim "produced by
   Claude" is correct only under the default env, which is `RUNTIME_BRANCH_UNRESOLVED`.
3. **Unit 5, "`buildMaiaComprehensivePrompt` … then `generateText(...)`. So when validation fails,
   the member-visible text is produced by Claude"** → **incomplete**. The DEEP-repair text is not
   necessarily member-visible: `maiaService.ts:3615-3625` can replace it wholesale after
   persistence and audio synthesis. Unit 5's A-list stopped at `applySelfletDeliveryGuard`
   (`:2258`), inside `deepPathResponse`; the rewrite lives above it in `getMaiaResponse`.
4. **The in-repo comment at `maiaService.ts:2210-2214`** ("`buildMaiaComprehensivePrompt` →
   `buildComprehensiveVoicePrompt`, which currently does NOT iterate MaiaContext addenda … Field is
   set here for forward-compat") **contradicts the code**: `maiaVoice.ts:1045` calls
   `appendAllContextAddenda`. Per §III, executable code outranks comments — the addenda **do**
   reach the prompt. The adjacent comments at `:2217-2225` state the corrected behaviour. The
   stale comment at `:2210` and the current comment at `:2217` disagree with each other **inside
   the same object literal**. Recorded, not repaired.
5. **`docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md:54`** carries the same superseded
   claim (`✗ does not reach prompt`), while `:97` of the same document records it as closed. The
   document contradicts itself; neither line is authority.

---

## 9. Provenance discontinuities

* **`meta.atlasContext` — read, never written.** A whole validator layer (elemental) plus three
  caution checks depend on it. The only trace of its former producer is the comment at `:2806`.
  The provenance of the *removal* is not recoverable from the tree. `STATIC_POSSIBLE`.
* **`repairGuidance` — written (`:2183`), declared (`maiaVoice.ts:43`), never read.**
* **`placeAddendum` / `memberWebAddendum`** — produced by the canonical-live route, present in
  `ADDENDA_SPECS`, and silently absent from `repairedContext`. Production without consumption.
* **`memoryInfluenceAddendum` / `forwardReadinessAddendum` / `practiceFieldAddendum`** — produced,
  consumed on FAST, invisible to `ADDENDA_SPECS`, therefore unreachable on DEEP-repair. The same
  member-derived material has two different fates depending on tier, with no shared registry.
* **`context.summary` overwritten to `` `Repair attempt for: ${input}` ``** — the persona block's
  `Previous conversation:` slot loses its provenance and is filled with a system-authored string
  that *looks like* a conversation summary to the model.
* **Client-supplied `meta`.** `app/api/sovereign/app/maia/list/route.ts:287` destructures
  `...meta` from the request body and spreads it into the `getMaiaResponse` meta at `:1207`.
  Server-built addenda are placed *after* the spread and so win, but the nine declared-and-inert
  fields have **no** server-side writer, so a client body could populate them. Their prompt
  content would then have client provenance indistinguishable from server provenance.
  `OBSERVED` (structure), `RUNTIME_BRANCH_UNRESOLVED` (whether any client does).
* **Three divergent copies of one turn** (§6): persisted text, audio text, returned text.

---

## 10. Capability candidates (§XVII — RECORD ONLY, no design, no repair)

* `appendAllContextAddenda` (`maiaVoice.ts:489`) is a **single, ordered, log-instrumented registry**
  of which context reaches a prompt — the only such registry in the traced surface. Its
  `ADDENDA_SPECS` list and `safeAddendum` guard are a working pattern for "declare once, inject once".
* The four recall addenda are **already formatted, already produced, and already provenance-tagged
  at the route** (`maia/list/route.ts:963-1043` logs offered-vs-injected counts per layer).
* `INTERFACE_HUMILITY_GUARDRAIL` (`maiaVoice.ts:465`) is an explicit encoding of the §X influence
  taxonomy's "a signal is a question, never a verdict" — a latent-orientation discipline already in prose.
* The `MEMORY SPEECH-ACT BOUNDARY` (`maiaVoice.ts:508`) is an existing, unconditional
  capability-boundary statement, described in-code as a stopgap for an unconfirmed-write covenant.
* The Socratic validator's **Layer 5 linguistic-integrity detectors** are provider-agnostic
  generation-artifact checks that work with no member context at all.

---

## 11. Runtime-only unknowns

* `MAIA_TEXT_PROVIDER`, `MAIA_INFERENCE_MODE`, `MAIA_ENABLE_MULTI_ENGINE`, `ANTHROPIC_API_KEY` —
  decide whether regeneration reaches Claude, the sovereign router, the Ollama fan-out, or the
  local fallback. `RUNTIME_BRANCH_UNRESOLVED`.
* `NODE_ENV`, `AIN_SHAPE_TELEMETRY`, `AIN_SHAPE_REWRITE` — decide whether the §6 terminal rewrite
  is live. Outside production both gates default open. `RUNTIME_BRANCH_UNRESOLVED`.
* The **rate** at which one of the four surviving CRITICAL triggers fires — this is the actual
  frequency with which MAIA receives continuity on the DEEP path. Not statically determinable.
* Whether `cognitiveProfile.stability === 'unstable'` ever holds for real members
  (gates the only member-state-sensitive CRITICAL).
* Whether `conventionsResult.promptAdditions` (segment C5) quotes any conversation history.
  `lib/sovereign/conversationalConventions.ts` was **not** opened in this unit — it receives
  `conversationHistory` and `sessionDepth`. This is a static question, not a runtime one; it is
  deferred to §13, not asserted either way here.
* Whether any client supplies the nine inert addenda via body `meta`.

---

## 12. Stop state

`UNIT_COMPLETE`, with one enumerated site carried forward rather than stopped on.

The AIN shape rewrite (`maiaService.ts:3615`) is a **third member-visible text-producing site**.
It was reached by tracing to terminal output, which is what §6 of this unit's charge required, so
it is reported as an answer rather than as `STOPPED_UNENUMERATED_ASSEMBLY_SITE`. It does not
change the topology of *continuity* — it carries none, and it strengthens rather than reverses
the primary finding. If the census later treats "sites that determine member-visible text" as the
unit of enumeration rather than "sites that assemble context", this site should be re-opened on
its own authority.

One unopened static surface is recorded honestly rather than inferred: segment C5
(`conversationalConventions.applyConventions`).

No repository file was modified. No runtime witness was taken. No repair was proposed.

---

## 13. Next bounded question

> Does `conversationalConventions.applyConventions` (`lib/sovereign/conversationalConventions.ts`,
> canonical `52a3b924`) incorporate any of the `conversationHistory` it receives into the
> `promptAdditions` string returned to `buildComprehensivePrompt`
> (`intelligentVoiceAdaptation.ts:248, 381`) — quoted content, derived scalars, or neither?

*(Single question, statically answerable, closes the one gap in §3's segment table.)*
