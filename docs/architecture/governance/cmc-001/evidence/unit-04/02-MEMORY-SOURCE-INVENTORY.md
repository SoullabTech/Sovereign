# CMC-001 · Unit 4 · Artifact 2 — DEEP Memory Source Inventory

Referent `52a3b924b7cf52013c1c8b0d635359c2cad672fc`. All claims `STATIC_POSSIBLE`
unless marked. **OBSERVED** = read directly in executable code at a bound blob.
**INFERRED** = derived by reasoning over observed code.

Chain traced (and no further):

```
/list → getMaiaResponse → DEEP → deepPathResponse
  → consciousnessWrapper.processConsciousnessEvolution         maiaService:2052
    → [Phase 1 | Phase 3] consciousnessOrchestrator.processRequest   cwrapper:126 / :224
      → orchestrateResponse (10 stages)                        corch:149-230
        → memoryBridge.recall  corch:409   ·  obsidianVault.query  corch:421
      → synthesize → { message }                               corch:790-814
    → response = orchestrationResult?.message                  cwrapper:138 / :238
  → validateAndRepairResponse                                  maiaService:2158
  → applySelfletDeliveryGuard                                  maiaService:2258
  → return { response: guardedResponse }                       maiaService:2260
```

---

## The context boundary — what the orchestrator is *given*

`consciousness-orchestrator.ts:1011-1026`
@ `52a3b92…` blob `33fce86bfde8f1c01c53588403d7f8753582b9f7`

```ts
:1011  async processRequest(input: string, context: any): Promise<any> {
:1013    if (!this.systems.activated) { await this.activate(); }   // lazy, throws on failure
:1018    const orchestratorContext = {
           sessionId: context.sessionId,
           userId: context.userId,
           sessionHistory: context.sessionHistory || []
         };
:1025    return await this.orchestrateResponse(input, orchestratorContext);
```

**OBSERVED.** Three keys survive the boundary. The caller
(`consciousness-layer-wrapper.ts:126-136`, blob `42dd2c21…`) passes
`sessionId, userId, observerLevel, observerPrompt, meta` — so `observerLevel`,
`observerPrompt` and `meta` are dropped, and `sessionHistory` is **never set by any caller**
and therefore resolves to `[]` at `:1021`. Confirms Unit 3's finding.

**Consequence:** *zero* member continuity crosses into the orchestrator. Everything the
`/list` route assembled — C1–C4 addenda, `relationshipMemory`, `conversationHistory`,
atoms, `relationalContext` — stops at `maiaService`/`cwrapper`. The orchestrator's memory
is retrieved **from scratch, from its own substrate**, using only `input` + `userId`.

---

## SOURCE M1 · `memoryBridge.recall` — `MemorySystemsBridge`

`lib/bridges/memory-systems-bridge.ts` @ `52a3b92…` blob `f92022ff0dcca2872d886969c79b5494666f17d7`

### source
Four in-process layers, all constructed in the bridge constructor (`:88-100`) and
initialized by `connectAll()` (`:105-119`):

| Layer | Class | Initial state at `initialize()` | Line |
|---|---|---|---|
| Anamnesis | `AnamnesisLayer` | 8 archetype keys each mapped to `[]` | `:500-519` |
| Session | (inline field) | `this.sessionMemory = []` | `:132` |
| Pattern | `PatternRecognizer` | — | `:565` |
| Collective | `CollectiveMemoryPool` | `this.collectiveWisdom = []` (comment says "seed collective wisdom"; assigns empty) | `:627-633` |

Plus `loadPersistedMemory()` (`:398-420`) which reads
`path.join(process.env.MEMORY_PATH \|\| './memory', 'memory.json')` from the **container
filesystem** into `this.memories` / `this.patterns`.

### retrieval
```ts
corch:404  private async recallMemories(input, witnessing) {
corch:405    if (!this.systems.memoryBridge) return { memories: [], patterns: [] };
corch:409    return await this.systems.memoryBridge.recall({
               input, patterns: witnessing.patterns, depth: witnessing.depth });
```
```ts
membridge:155  async recall(query: MemoryQuery): Promise<MemoryResult> {
:158   const anamnesisMemories  = await this.anamnesisLayer.recall(query);
:159   const sessionMemories    = this.recallSessionMemory(query);
:160   const patternMemories    = await this.patternRecognizer.findPatterns(query);
:161   const collectiveMemories = await this.collectiveMemory.query(query);
:180   memories: allMemories.slice(0, query.depth || 10),
```

### identity / provenance — **NONE**
`interface MemoryQuery` (`membridge:22-28`) = `{ input, patterns?, depth?, timeRange?,
memoryType? }`. **There is no `userId`, no `sessionId`, no member field.**
`interface Memory` (`:38-48`) = `{ id, timestamp, content, type, tags, associations,
emotionalValence, importance, accessed }` — **also no member identity.**
`recallMemories` does not pass `userId`, and the type could not carry it if it did.

> **M1 is member-anonymous by type.** Any content it returned would be
> unattributable to the person MAIA is speaking with. **OBSERVED.**

`this.memories` — the *only* map that `loadPersistedMemory` populates — is **never read by
`recall()`**. Recall reads the four layer objects, none of which `loadPersistedMemory`
touches. Persisted memory is therefore unreachable by retrieval. **OBSERVED.**

### selection — two independent defects
1. **Empty by construction.** All four layers initialize to empty collections and nothing in
   the DEEP request path calls `store()` (`:196`) before `recall()`. Filters at `:521-533`
   and `:635-640` are `.filter(...)` over empty arrays. Result: `allMemories = []`. **OBSERVED.**
2. **Depth-unit mismatch (defect, recorded not repaired — §XIX).**
   `query.depth = witnessing.depth`, a coherence **fraction** in `[0,1]`
   (`sacred-oracle-core-enhanced.ts:392-403`, blob `27a8249e…`: starts at `0.3`, capped
   `Math.min(depth, 1.0)`), consumed at `membridge:180` as an **item count** in
   `allMemories.slice(0, query.depth || 10)`. For any `0 < depth < 1`, `slice(0, 0.3)`
   truncates to index 0 and returns `[]`. The `|| 10` default fires only when depth is
   exactly `0`. **Even a fully populated substrate would return zero memories.**
   OBSERVED (static); the arithmetic is INFERRED from JS `Array.prototype.slice` semantics.
3. `query.patterns = witnessing.patterns` — **`undefined`**. See M3.

### transformation
`detectPatterns` (`:165`), `calculateRecallDepth`, `calculateRelevance`,
`updateWorkingMemory` — all over the empty array. Returns
`{ memories: [], patterns: [], count: 0, depth, relevance }`.

### influence (§X)
**None of the three.** Not explicit recall (no content), not implicit continuity
(no member binding), not latent orientation (no accumulation across encounters —
in-process only, reset per container). The single downstream trace is a metadata integer:
`streams.memories?.count || 0` at `corch:831`.

### serialization
`buildSynthesisInput` (`corch:566-575`) is the **only** path from `memories` to any model:
```ts
:570  if (streams.memories) elements.push(`Memories: ${JSON.stringify(streams.memories).substring(0, 200)}`);
:574  return `Synthesize these consciousness streams: ${elements.join(' | ')}`;
```
`JSON.stringify` → **byte-truncate at 200 chars** → interpolate into an unlabelled string.
Total provenance destruction: no source, no timestamp, no member, no type, no confidence.
Truncation is mid-JSON and can sever a value mid-token. This is a textbook instance of
§XIII's *"structured source information was discarded during serialization"* — and here it
is worse than the legacy case, because the structure discarded was already member-anonymous.

### final carriage
`buildSynthesisInput` output → `aiBridge.generateEnhancedSynthesis` (`corch:475`) →
`streams.enhanced.multiEngineEnhancement`. `synthesize` (`:790-866`) reads that object
**only for metadata** — `Array.from(...keys())`, `orchestrationConfidence`,
`observerCoherence`, `consciousnessDepth` (`:822-828`). Its text is never read.
**M1 reaches a model and reaches no member. Carriage into the delivered response: zero.**

### §XI four questions
- **Provenance** — none. No member binding exists at the type level.
- **Influence policy** — undeclared; effectively nil.
- **Visibility policy** — undeclared; content never surfaces.
- **Assertion policy** — undeclared. Had content existed, it would have been asserted
  through a model with no provenance to warrant it. §X: *depth of synthesis does not
  confer authority of assertion* — here there is neither depth nor authority.

---

## SOURCE M2 · `obsidianVault.query` — `ObsidianVaultBridge`

`lib/bridges/obsidian-vault-bridge.ts` @ `52a3b92…` blob `6485d2083355cd66bb036ce50cb3a578d5f622a8`

### source
Container filesystem, `process.env.OBSIDIAN_VAULT_PATH || ''` (`:66`). Not a member store —
an operator-side knowledge corpus.

`connect()` (`:77-103`): if `vaultPath` is falsy → `console.warn('⚠️ No Obsidian vault path
configured')`, sets `this.initialized = true`, **returns without indexing**. Same on
`!fs.existsSync(vaultPath)`. **Degradation is silent to the member and non-fatal to the
pipeline** — relevant to §XV degradation-visibility. **OBSERVED.**

### retrieval
```ts
corch:416  private async retrieveKnowledge(witnessing, memories) {
:417    if (!this.systems.obsidianVault) return { knowledge: [], connections: [] };
:421    return await this.systems.obsidianVault.query({
              context: witnessing.essence, memories, semanticSearch: true });
```
`query.context = witnessing.essence` — **`undefined`**. See M3. The semantic search
therefore runs against an undefined query term (`vault:108-120` →
`semanticSearch(query.context, 10)`).

### identity / provenance
Not member-scoped by design. Notes carry `tags`/`connections`, no member attribution.

### influence · serialization · carriage
`knowledge` is **omitted from `buildSynthesisInput` entirely** (`corch:566-575` pushes only
`witnessing`, `memories`, `elemental`, `psychological`). It is read at exactly two places:
`findSupportingThreads` (`:889-905`) — where the `if (streams.knowledge?.connections)` block
is an **empty comment body** — and `synthesize` metadata `knowledge: streams.knowledge?.relevance || 0`
(`:832`). **M2 reaches no model and no member.** OBSERVED.

---

## SOURCE M3 · `witness` — `SacredOracleCoreEnhanced` · the one member-scoped retrieval

`lib/sacred-oracle-core-enhanced.ts` @ `52a3b92…` blob `27a8249ea172928b33279c77e34fa1995ead586b`

```ts
corch:396  private async witness(input, context) {
:397    if (!this.systems.sacredCore) throw new Error('Sacred Core not initialized');
:400    return await this.systems.sacredCore.processInput(input, context);
```
```ts
sacred:160  async processInput(input: string, context: any): Promise<any> {
:161    const response = await this.generateResponse(input, context.userId || context.sessionId, context);
:168    return { message, mode, depth, tracking, metadata, wisdomSources };
```

**This is the only stage that receives `userId`** and the only stage that performs a
substantive, member-scoped generation with its own wisdom layers
(`:253` knowledge integration, `:392-403` depth from
`consciousnessEnhancement / elementalWisdom / anamnesisRecall / knowledgeDepth`).

### Two OBSERVED contract violations at the `witness` boundary

The returned object has **six** keys: `message · mode · depth · tracking · metadata ·
wisdomSources`. It has **no `essence`** and **no `patterns`**. Yet:

| Consumer | Reads | Actual value |
|---|---|---|
| `corch:410` `recallMemories` | `witnessing.patterns` | **`undefined`** |
| `corch:421` `retrieveKnowledge` | `witnessing.essence` | **`undefined`** |
| `corch:569` `buildSynthesisInput` | `JSON.stringify(streams.witnessing).substring(0,200)` | first 200 chars of the whole object |
| `corch:830` `synthesize` metadata | `streams.witnessing?.depth` | valid |

The file carries `// @ts-nocheck` at `corch:1` (*"Orchestration prototype, not type-checked"*),
so neither undefined-field read is caught at build time. **OBSERVED.** §III: the executable
read outranks the field name it implies.

### The discarded generation
`response.message` — the one genuine, member-scoped, model-backed utterance produced
anywhere in this pipeline — is **never read by `synthesize`**. `identifyPrimaryTheme`,
`findSupportingThreads`, `discoverEmergence`, `resolveContradictions` and `weaveResponse`
do not reference `streams.witnessing.message`. It survives only as the first ≤200
JSON characters inside `buildSynthesisInput`, i.e. as input to a *different* model whose
output is itself discarded (see Artifact 3).

### influence (§X)
`witness` is the pipeline's only candidate for **implicit continuity** with real
provenance — and its influence is severed twice: once by the missing `essence`/`patterns`
contract, once by `weaveResponse` discarding its message.

---

## SOURCE M4 · `applySelfletDeliveryGuard` — the only member content that reaches the member

`lib/sovereign/maiaService.ts:331-350` @ `52a3b92…` blob `e8f5bf6d9badcec949f58d8fa0ac9ba0e01954c1`

```ts
:335  const requiredAck = selfletContext?.requiredAcknowledgment;
:336  if (!requiredAck) return response;
:343  if (response.includes(requiredAck)) return response.replace(requiredAck, requiredAck + SELFLET_MARKER);
:348  console.log('[SELFLET] Prepending past-self acknowledgment');
:349  return requiredAck + SELFLET_MARKER + response;
```

Applied at `maiaService:2258` — **after** validation, immediately before return.

- **Influence:** `explicit recall` — a past-self acknowledgment presented as remembered.
- **Carriage:** **string concatenation, not model generation.** It bypasses every model in
  the chain. On the DEEP path this is, by elimination, the **only** member-derived content
  that can appear in the delivered response.
- **Assertion policy (§XI):** asserted verbatim and unconditionally. No hedging surface
  exists between the stored acknowledgment and the member's screen.
- The same guard is applied on FAST (`:1368`) and CORE (`:1779`), where it is one carrier
  among several. On DEEP it is the sole carrier. **OBSERVED.**

---

## Sources reachable-but-null

| Source | Site | Why null | Basis |
|---|---|---|---|
| `sessionHistory` | `corch:1021` | never set by any caller | OBSERVED |
| `observerPrompt` | dropped `corch:1018` | not in the three-key rebuild; only reachable via `cwrapper:138` fallback, which does not fire | OBSERVED |
| `meta` (incl. C1–C4 addenda) | dropped `corch:1018` | same | OBSERVED |
| `relationshipMemory` (`includePatterns`, `maxThemes:10`) | `maiaService:1834` | written to `meta`; `meta` dropped at the orchestrator boundary | OBSERVED |
| `conversationHistory` | `cwrapper:303` | consumed as `.length > 3` only | OBSERVED (Unit 3, re-verified) |
| `psychFrameworks` / `elementalOracle` / `spiralQuest` | stages 4/5/6 | not memory substrates; carry no member history into prompt text | OBSERVED |
