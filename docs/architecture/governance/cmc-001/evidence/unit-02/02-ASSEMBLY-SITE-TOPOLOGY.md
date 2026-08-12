# CMC-001 · Phase 1 · Unit 2
## Artifact 2: Assembly Site Topology — FAST / CORE / DEEP

Referent: `52a3b924b7cf52013c1c8b0d635359c2cad672fc`.
`maiaService.ts` blob `e8f5bf6d…`; `maiaVoice.ts` blob `8ea2f62a…`.

Function ranges (OBSERVED, top-level declarations):
`fastPathResponse` 646–1376 · `corePathResponse` 1377–1782 · `deepPathResponse` 1788–2295.

---

## SITE 1 — FAST · `maiaService.ts:1297`

**Shape:** one template literal assigned to `baseSystemPrompt`. It is the *only* string of
this shape in the file; `MAIA_RUNTIME_PROMPT` is dynamically imported at `:871` and
interpolated first.

**Dispatch — `:1337-1347`:**
```
generateText({ systemPrompt: baseSystemPrompt,   // :1338
               userInput: contextPrompt,          // :1339  ← NOT raw input
               meta: { ...meta, currentUserMessage: input, engine: 'deepseek-r1' } })
```

**FAST has TWO continuity channels, not one:**
1. `baseSystemPrompt` (`:1297`) — 33 interpolations, the addenda channel.
2. `contextPrompt` (`:847-867`) — a *second* channel passed as `userInput`, built from
   `memoryContext` / `recentContext` / `recentThreadBlock` / `ainKnowledgeBlock`
   (`:859`, `:863`, `:866`). Sourced partly from `MemoryOrchestrator` (`:798-802`) and
   `TurnsStore.getRecentTurns` (`:720`). **This channel exists only in FAST.**

Contributor order at `:1297` reproduces Unit 1's list exactly. Gating for each is a bare
truthiness read of `meta` (`:1199`, `:1205`, `:1224`, `:1234`, `:1245`, `:1253`) followed
by conditional interpolation `${x ? '\n\n' + x : ''}`. No truncation, no re-serialization
at the site — the strings arrive pre-serialized from the route and are concatenated
verbatim. OBSERVED.

`relationshipContext` is serialized **inside** FAST at `:1090-1092` via
`formatRelationshipMemoryForPrompt(relationshipMemory)`, from `loadRelationshipMemory` at
`:684`.

---

## SITE 2 — CORE · `maiaVoice.ts:531` + `maiaService.ts:1592-1718`

**Shape:** NOT a template literal. A function call plus a linear append chain.

```
adaptivePrompt = buildMaiaWisePrompt(context, input, effectiveHistory)   maiaService:1592
  … then 12 sequential `adaptivePrompt = adaptivePrompt + '\n\n' + X` appends
    :1597 selflet · :1603 sanctuary · :1614/:1620 userIdentification · :1629 maiaMode
    :1636 scribeSessionDiscussion · :1643 wuxing · :1650 astrology · :1657 studio
    :1664 practiceField · :1671 wisdomRouting · :1679 stateVectorContract
  … :1684 adaptResponsePromptWithPolicy()   (policy rewrite of the whole prompt)
  … :1708 += formatFieldAddendum(fieldContext)
```

**Dispatch — `:1720-1730`:**
```
generateText({ systemPrompt: adaptivePrompt,
               userInput: input,             // :1722  ← RAW input, no contextPrompt
               meta: { ...meta, coreProcessing: true, inputComplexity: 'moderate' } })
```

**The continuity contributors enter CORE through a different door.** They are not appended
in `corePathResponse`; they are placed as **fields on the `MaiaContext` object** at
`maiaService.ts:1529-1589` — `conversationalRecallAddendum` `:1581`,
`episodicRecallAddendum` `:1584`, `atomsAddendum` `:1587`, `relationalContextAddendum`
`:1588` — and injected inside `buildMaiaWisePrompt` by
`appendAllContextAddenda(context, adaptedPrompt)` at `maiaVoice.ts:913`.

`ADDENDA_SPECS` (`maiaVoice.ts:406-431`) is the single ordering authority for that channel;
the four continuity fields are entries `:427`, `:428`, `:429`, `:430` — **last four, in
the same relative order as FAST.**

`relationshipContext` is serialized at `maiaVoice.ts:891-896` by the *same*
`formatRelationshipMemoryForPrompt`, fed from `loadRelationshipMemory` at
`maiaService.ts:1419` (`maxThemes: 5, maxBreakthroughs: 2`).

### CORE has two total-bypass guards — OBSERVED, `maiaVoice.ts:532-568`

| Line | Condition | Effect |
|---|---|---|
| `:532-536` | `process.env.MAIA_SAFE_MODE === 'true'` | `return buildSimpleMaiaPrompt(context)` — **returns before `:913`; all 24 addenda dropped** |
| `:543-568` | `depthConfig && depth === 'opening' && depthConfig.maxTokens <= 50` | returns a hardcoded greeting literal — **all 24 addenda dropped** |

Both early-return *above* `appendAllContextAddenda`. On either, CORE reaches the model with
**zero** continuity contributors. The 12 `corePathResponse` appends still run (they operate
on the returned string), so the bypass is partial at the service layer but total for the
addenda channel. `MAIA_SAFE_MODE` is an environment variable — its production value is not
statically determinable → recorded, not resolved.

---

## SITE 3 — DEEP · **no primary prompt seam exists**

`deepPathResponse` contains **no** `systemPrompt` assembly on its primary path.

**Primary generation — `:2045-2058`:**
```
consciousnessResponse = await Promise.race([
    consciousnessWrapper.processConsciousnessEvolution(input, consciousnessContext),  :2052
    timeout 4500ms                                                                     :2054
]);
maiaInitialResponse = consciousnessResponse.response;                                  :2058
```

`consciousnessContext` is fully enumerated at `:2034-2043`:
`sessionId · userId · conversationHistory · currentDepth · elementalResonance ·
observerLevel · temporalWindow · metaAwareness`.

**It contains no addendum field, no `meta`, and no `relationshipMemory`.** Therefore on
DEEP-primary, **none** of the route-built continuity contributors reach the generator.
The only continuity carrier is `conversationHistory` (`effectiveHistory`). OBSERVED.

The code says so itself at `:2091-2093`: *"the local orchestrator draft has no prompt seam
by construction — it weaves templates, it does not read a system prompt."*

On timeout/failure (`:2063-2069`) `maiaInitialResponse` becomes the literal
`"I'm here with you. Let's explore what you're bringing."` — a 4.5s race against a DB/model
stage, with no continuity at all.

### The two DEEP lanes that *can* see continuity — both conditional

**Lane A — Claude consultation (`:2085-2144`).** Gated at `:2082-2085` on
`process.env.MAIA_USE_CLAUDE_CONSULTATION === 'true'` **AND** (`ANTHROPIC_API_KEY` or
`meta.claudeAvailable`). The source states at `:2079` *"Claude consultation is DISABLED by
default"* and logs "MAIA SOVEREIGN" at `:2147` when off. When on, `:2097-2102` joins
**exactly four** contributors —
`conversationalRecallAddendum`, `episodicRecallAddendum`, `atomsAddendum`,
`relationalContextAddendum` — with `'\n\n'` and passes them as
`contextAddenda` (`:2115`), a *distinct parameter*, not a system prompt.

**Lane B — repair only (`:2165-2254`).** The regeneration callback inside
`validateAndRepairResponse`, which runs **only if validation fails** (`:586-593`). It
builds a fresh `MaiaContext` (`:2169-2228`) carrying the same four contributors
(`:2215`, `:2222`, `:2226`, `:2227`) and calls `buildMaiaComprehensivePrompt` (`:2230`),
which reaches `appendAllContextAddenda` at `maiaVoice.ts:1045`.

**Consequence — OBSERVED:** on DEEP, the four continuity contributors reach a model
**only** when the environment flag is on, or when the first response fails validation. On
the default, healthy DEEP turn they reach nothing.

### DEEP retrieves the most and delivers the least

`:1824-1834` loads relationship memory with `maxThemes: 10, maxBreakthroughs: 5` — the
**richest** retrieval of the three paths (FAST/CORE use 5/2) — assigns it to
`(meta as any).relationshipMemory` at `:1834`, and then **never serializes it**:
`formatRelationshipMemoryForPrompt` is absent from the entire 1788–2295 range, and
`consciousnessContext` does not carry it. The load is a pure side effect on the primary
path. OBSERVED.
