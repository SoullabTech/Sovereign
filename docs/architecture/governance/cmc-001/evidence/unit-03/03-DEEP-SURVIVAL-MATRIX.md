# CMC-001 · Unit 3 · Artifact 3 — DEEP Survival Matrix
## …and the stop condition it produced

Referent `52a3b924…`. **This artifact terminates at a §XXIII.4 boundary.** Everything below
the horizontal rule marked STOP is *not* traced.

---

## §B-1 · The richest retrieval — `includePatterns: true` / `maxThemes: 10`

`maiaService.ts:1824-1838`:

```ts
relationshipMemory = await loadRelationshipMemory(userId, {
  includeThemes: true, includeBreakthroughs: true,
  includePatterns: true,   // :1829  DEEP path: full context
  maxThemes: 10,           // :1830  More themes for deep work
  maxBreakthroughs: 5      // :1831
});
(meta as any).relationshipMemory = relationshipMemory;   // :1834
```

This is the deepest relationship-memory load in the file (FAST `:684` and CORE `:1419` use
5/2 and do not set `includePatterns`).

**Relationship to the final DEEP-primary model input: none.**

* `formatRelationshipMemoryForPrompt` — the only serializer for this object, used at
  `maiaService:1091` (FAST) and `maiaVoice:892` (CORE) — is **absent from the entire
  `deepPathResponse` range 1788–2295**. Whole-range identifier scan: zero occurrences.
* `consciousnessContext` (`:2034-2043`) has eight fields — `sessionId · userId ·
  conversationHistory · currentDepth · elementalResonance · observerLevel · temporalWindow ·
  metaAwareness` — and **no `relationshipMemory` field and no `meta`**.
* The write at `:1834` is onto `meta`, which the primary generator (`:2052`) never receives.

**Classification: `RETRIEVED_BUT_UNCONSUMED`.** The pattern data enabled by
`includePatterns: true` is loaded, logged (`:1833`), and discarded on the primary path.
It is reachable *only* by the two conditional seams (§B-3), neither of which reads
`relationshipMemory` either — they read the four addenda. **OBSERVED.**

---

## §B-2 · NEW FINDING — `conversationHistory` is consumed as a count, not as content

Unit 2 recorded: *"The only continuity carrier is `conversationHistory` (`effectiveHistory`)."*
That is true of what is **passed**. It is false of what is **consumed**.

`consciousnessContext.conversationHistory = effectiveHistory` (`:2037`) is handed to
`consciousnessWrapper.processConsciousnessEvolution` (`:2052`).

Exhaustive scan of `lib/consciousness/consciousness-layer-wrapper.ts` (blob `42dd2c21…`,
549 lines) for `context.*` member reads yields exactly seven distinct fields:

```
conversationHistory · elementalResonance · metaAwareness · observerLevel
sessionId · temporalWindow · userId
```

`currentDepth` is **never read at all**. And `conversationHistory` is read at exactly
**one** site:

```
:303   context.conversationHistory.length > 3   // detectObserverDeepening — a boolean on length
```

The three phase entry points (`processConsciousnessEvolution:527-547` → recursive observer
`:111`, temporal windows `:215`, meta-consciousness `:220`) build their prompts via
`buildObserverPrompt` (`:306-326`) and siblings. `buildObserverPrompt` interpolates exactly
two things: the integer `level` and the raw `input` string (`:317  Respond to: "${input}"`).

**Classification for `conversationHistory` on DEEP-primary: `RETRIEVED_BUT_UNCONSUMED`.**
Its *length* influences an observer-level integer; **no turn content is placed in any
prompt.** OBSERVED.

Combined with §B-1, the DEEP-primary path carries **no member continuity content of any
kind** into prompt construction — only the current `input` and integers derived from
conversation shape.

---

## §B-3 · Is `MAIA_USE_CLAUDE_CONSULTATION` the only seam?

**Answer: no — it is an auxiliary seam, and one of several.** Three distinct carriers exist,
and the default-on one is not it:

| Seam | Gate | What it carries | Role |
|---|---|---|---|
| **S1 · Claude consultation** `:2085-2144` | `process.env.MAIA_USE_CLAUDE_CONSULTATION === 'true'` **AND** (`ANTHROPIC_API_KEY` \|\| `meta.claudeAvailable`). Source states "DISABLED by default" `:2079`. | C1–C4 joined with `'\n\n'` at `:2097-2102`, passed as the **distinct `contextAddenda` parameter** `:2115` — not a system prompt. | `AVAILABLE_ONLY_TO_OPTIONAL_CONSULTATION` — auxiliary, default-off |
| **S2 · Validation repair** `:2165-2254` | Fires only when `validateAndRepairResponse` fails validation (`:586-593`) | Fresh `MaiaContext` (`:2169-2228`) with C1–C4 (`:2215,:2222,:2226,:2227`) → `buildMaiaComprehensivePrompt` `:2230` → `appendAllContextAddenda` `maiaVoice:1045`; policy append `:2235` | `DISPATCHED_THROUGH_ANOTHER_SEAM` — conditional on failure |
| **S3 · The orchestrator pipeline** `:2052` | **unconditional — this is the primary path** | **None of C1–C5.** See STOP below. | primary carriage |

So S1 is neither the only seam nor the primary one. The primary carriage is S3, and S3 is
where the trace stops.

---

# ── STOP · §XXIII.4 · `STOPPED_UNENUMERATED_ASSEMBLY_SITE` ──

Tracing S3 to the final model request uncovered a context assembly site with its own memory
substrate that **no prior CMC unit enumerated**, and it materially changes the DEEP topology.

### The chain, as far as it was lawfully followed

```
maiaService.ts:2052   consciousnessWrapper.processConsciousnessEvolution(input, consciousnessContext)
  └─ consciousness-layer-wrapper.ts:123   observerPrompt = this.buildObserverPrompt(input, level, context)
     consciousness-layer-wrapper.ts:126   consciousnessOrchestrator.processRequest(input, {
                                            sessionId, userId, observerLevel, observerPrompt, meta })
        └─ consciousness-orchestrator.ts:1011-1026   processRequest(input, context)
             :1018  const orchestratorContext = { sessionId, userId,
                                                  sessionHistory: context.sessionHistory || [] }
             :1025  return await this.orchestrateResponse(input, orchestratorContext)
```

### Two OBSERVED facts that force the stop

**1 · `observerPrompt` is discarded at the orchestrator boundary.**
`processRequest` (`corch.ts:1011`) rebuilds the context from three keys only. `observerPrompt`
is not among them; nor are `observerLevel` or `meta`. And `context.sessionHistory` is **never
set by the caller** (`cwrapper.ts:126-136` passes `sessionId, userId, observerLevel,
observerPrompt, meta`), so `sessionHistory` resolves to `[]` at `:1021`.

The wrapper's own prompt reaches a model **only** via the fallback at `cwrapper.ts:138`
(`orchestrationResult?.message || await this.fallbackGeneration(observerPrompt, input)`).
`synthesize` returns `{ message: woven.content, … }` (`corch.ts:813-814`), so on the success
path `?.message` is truthy and **`fallbackGeneration` does not fire**. On a healthy
DEEP-primary turn, `observerPrompt` reaches nothing.

**2 · `orchestrateResponse` is an independent 10-stage retrieval and synthesis pipeline.**
`corch.ts:149-230` — a second context architecture with its own substrate:

```
:157 assessSpiralState   :160 witness   :163 recallMemories   :166 retrieveKnowledge
:169 analyzePsychologically   :172 processElementally   :175 applySpiralQuest
:178 enhanceWithAI   :188 processReciprocalLearning   :203 processNestedObservation
:219 synthesize → { message: woven.content }
```

with its **own memory recall**, independent of everything the `/list` route built:

```ts
:404  private async recallMemories(input, witnessing) {
:405    if (!this.systems.memoryBridge) return { memories: [], patterns: [] };
:409    return await this.systems.memoryBridge.recall({ input, patterns: witnessing.patterns,
                                                        depth: witnessing.depth });
```

`memoryBridge` is a `MemorySystemsBridge` (`:47`, instantiated `:251`, `connectAll()` `:252`);
`retrieveKnowledge` (`:416-425`) queries an `ObsidianVaultBridge` with `semanticSearch: true`;
`enhanceWithAI` (`:178`) is a further model stage.

### Why this is a stop and not a finding

§XXIII.4 — *"an unenumerated context assembly site materially changes scope."* It does, in
three ways:

1. **It falsifies a load-bearing prior claim.** Unit 2 Artifact 2 recorded, quoting the
   source comment at `maiaService.ts:2091-2093`, *"the local orchestrator draft has no prompt
   seam by construction."* That is true of `deepPathResponse`'s own body and **false of the
   DEEP execution path**, which reaches `buildObserverPrompt` and then an entire orchestrator
   that constructs model input. §III: code outranks comment; the comment was the weaker
   surface and the prior claim inherited its scope. This is a §IV `SURFACE_SUBSTITUTION`
   correction (see `04-CORRECTIONS.md` C-3).
2. **It introduces a second, unsurveyed memory substrate reached from a canonical-live
   route.** Unit 2.5 A-1 established that the ~20 memory-substrate entries below the Oracle
   refusal are unreachable from HTTP. This one is *not* refused — it is on the live DEEP
   path. Whether it overlaps, duplicates, or contradicts the `/list` contributor set is
   exactly the census question, and it is unanswered.
3. **The primary question cannot be completed without it.** "What actually survives into the
   final model request" for DEEP is now a property of
   `consciousness-orchestrator.ts` + `MemorySystemsBridge` + `ObsidianVaultBridge` +
   `AIIntelligenceBridge` + `multiEngineOrchestrator` — four further modules, none surveyed,
   none in this unit's authorized scope.

**Not traced, deliberately:** `witness`, `enhanceWithAI`, `weaveResponse`,
`MemorySystemsBridge.recall`, `ObsidianVaultBridge.query`, `AIIntelligenceBridge`,
`multiEngineOrchestrator`, and whether `sacredCore`/`memoryBridge`/`obsidianVault` are
substantive or stubbed at this referent. Determining which of these performs the terminal
model dispatch — and with what content — is the next bounded unit's question, not this one's.

---

## §B-4 · DEEP classification table (as far as lawfully established)

| Contributor | Classification | Binding evidence |
|---|---|---|
| C1 `conversationalRecallAddendum` | `AVAILABLE_ONLY_TO_OPTIONAL_CONSULTATION` (S1 `:2098`) / also S2 `:2215` | absent from primary; `consciousnessContext:2034-2043` has no addendum field |
| C2 `episodicRecallAddendum` | same — S1 `:2099` / S2 `:2222` | as above |
| C3 `atomsAddendum` | same — S1 `:2100` / S2 `:2226` | as above |
| C4 `relationalContextAddendum` | same — S1 `:2101` / S2 `:2227` | as above |
| C5 `relationshipMemory` (10 themes / 5 breakthroughs / patterns) | **`RETRIEVED_BUT_UNCONSUMED`** | loaded `:1826-1832`, stored `:1834`, never serialized anywhere in 1788–2295; not read by S1 or S2 either |
| C9 `conversationHistory` / `effectiveHistory` | **`RETRIEVED_BUT_UNCONSUMED`** (count-only) | passed `:2037`; sole read `cwrapper:303` `.length > 3`; content never interpolated |
| `currentDepth` | **`RETRIEVED_BUT_UNCONSUMED`** | set `:2038`; zero reads in `cwrapper.ts` |
| `observerLevel`, `elementalResonance`, `temporalWindow`, `metaAwareness` | `RETRIEVED_AND_TRANSFORMED` | read in `cwrapper.ts` for phase selection (`:536`, `:541`) and prompt level (`:307-326`); derived scalars, not member content |
| The orchestrator's own recalled memories | **`UNRESOLVED`** | `STOPPED_UNENUMERATED_ASSEMBLY_SITE` |
| Terminal DEEP model request composition | **`UNRESOLVED`** | same |
