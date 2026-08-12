# CMC-001 · §XXXIV — Artifact 2: Runtime Contract Trace + Path Map

Referent for every claim below: `origin/clean-main-no-secrets @ 52a3b924b7cf52013c1c8b0d635359c2cad672fc`

---

## 1. What `MaiaRuntimeContext` actually is

`lib/maia/maiaRuntimeContext.ts:156-173` — the contract type:

```
routeId · routeKnown · registryEntry · member · provider · promptBlock · memoryHealth · builtAt
```

`promptBlock` (`:124-147`) is `{ chars: number, layers: { <11 booleans> } }`.

**OBSERVED, load-bearing:** `summarizePromptBlock` (`:292-324`) reduces each addendum to
`!!addendum` and `addendum?.length ?? 0`. **No addendum content is retained in the
returned context.** `buildMaiaRuntimeContext` returns the context (`:249`), emits a
console log (`:243`, `:341-367`) and pushes to an in-process ring buffer (`:247`,
`recordRuntimeTurn`).

**INFERRED (from the above, no contrary surface found):** `MaiaRuntimeContext` is an
**observability contract, not a carriage contract**. It inventories which continuity
blocks existed at line 1125 of the route; it is not the channel by which any of them
reaches the model.

**OBSERVED confirmation of the separate carriage channel:** the same eleven addendum
*strings* are passed independently to `getMaiaResponse` via `meta` at
`app/api/sovereign/app/maia/list/route.ts:1184-1238`. The runtime context object is
never passed to `getMaiaResponse`.

**Consequence for §XXXIV.4 ("continuity-bearing fields actually defined by that
contract"):** the contract defines *eleven named continuity/context slots* plus
`memoryHealth`. It defines them as **presence + size**, not as content.

The eleven `promptBlock.layers` slots (`:128-146`):
`memoryInfluence · forwardReadiness · atoms · relationalContext · memberWeb ·
astrology · studio · knowledgeGate · wuxing · conversational · episodic`

---

## 2. `memoryHealthExpected` / `atomsExpected` (§XV, §XXXIV.7)

### Definition
`lib/maia/maiaRuntimeContext.ts:107-108` — `RouteRegistryEntry` type members, both `boolean`.
Values set per route at `:68-69`, `:81-82`, `:98-99`. No default; both are required
fields of the type.

### Validator / consumer
**OBSERVED — exhaustive search of the canonical tree:**
```
git grep -n "memoryHealthExpected" 52a3b92  → 4 hits, ALL in lib/maia/maiaRuntimeContext.ts (68, 81, 98, 107)
git grep -n "atomsExpected"        52a3b92  → 4 hits, ALL in lib/maia/maiaRuntimeContext.ts (69, 82, 99, 108)
```
**There is no consumer.** No code reads either field. `registryEntry` is placed on the
returned context (`:162`, `:235`) but the whole entry is never destructured or inspected
anywhere in the tree. `emitObservabilityLog` (`:341-367`) does not log them.
`formatRuntimeContextForResponse` (`:376-387`) does not include `registryEntry` at all.

### CI / runtime enforcement
**OBSERVED:** the CI guard exists and IS wired — `package.json:102` `"ci:guard"` runs
`scripts/ci/maia-route-guard.test.ts`, and `package.json:103` `"preflight"` invokes
`npm run ci:guard`. But the guard's two assertions (`scripts/ci/maia-route-guard.test.ts:113-158`)
check only (a) at least one route calls `getMaiaResponse()` and (b) the registry has at
least one `callsMaiaResponse: true` entry. **Neither `*Expected` field is asserted.**

**OBSERVED comment-vs-code divergence** (recorded, not averaged — §III):
`maiaRuntimeContext.ts:34-37` and `:55-57` describe a CI guard that "will use this
registry to error on routes classified canonical-live or live-secondary that are not in
this list", attributed to "step 6"/"step 7" and marked *deferred* at `:18-19`. The
executable guard at `52a3b92` does not implement that check. The comments are
self-describing as deferred, so this is a **stated deferral, not a contradiction**;
no §IV retraction is triggered. Code is the surface of record: enforcement is absent.

### Failure / degradation semantics
**Determined statically. `memoryHealthExpected` and `atomsExpected` have NO failure
semantics, because they have no consumer.** If atoms fail to load on
`sovereign/app/maia/list` — where `atomsExpected: true` — nothing compares the
expectation against reality. The declaration is inert.

`STOP NOTE (§XV / §XXXV.B):` the residual question "does any *deployed* build carry a
consumer absent from source, or does any *runtime* telemetry consume these fields?"
cannot be answered without runtime witness or a bound deployed referent. **Deferred, not
guessed.** No induced failure was performed or is proposed.

---

## 3. Memory health — the real degradation surface (separate from the above)

`lib/maia/memoryHealth.ts` (blob `32a71eb1e96231cf3f1249eda751a688119c64a7`)

- `LayerStatus = 'ok' | 'empty' | 'error'` (`:38`); 12 layers + `continuityConfidence` (`:60-74`)
- `BASE_CHAIN = [recentTurns, episodic, semantic, relational, developmental]` (`:141-147`)
- `deriveConfidence` (`:156-172`): 0 degraded → `high`; 1 → `medium`; ≥2 → `low`; error+≥2 → `low`
- `isBaseChainDegraded` (`:211-217`): true when **>1 base-chain layer is `'error'`**
  (note: `'empty'` does not count here, but does count in `deriveConfidence` — two
  different degradation predicates over the same chain)

### Degradation visibility — OBSERVED
Route consumption of `memoryHealth` is complete and enumerable
(`app/api/sovereign/app/maia/list/route.ts`, all hits): `1084` build · `1116-1119`
`isBaseChainDegraded` → **`console.warn` / `console.log` only** · `1133` passed into
`buildMaiaRuntimeContext` · `1528-1529` placed in the API response payload.

**`memoryHealth` is NOT in the `meta` passed to `getMaiaResponse` (`:1189-1237`).**

### COMMENT-VS-CODE CONFLICT — recorded per §III, not averaged
`lib/maia/memoryHealth.ts:203-210` states:
> "If the base chain has more than one layer in 'error' state for an authenticated
> member, **the response must amplify the §VI fallback block in the prompt.**
> **The handler uses this to decide whether to inject extra §VI emphasis.**"

**The handler does not.** At `route.ts:1116-1120` the sole consequence of
`isBaseChainDegraded(memoryHealth) === true` is a `console.warn`. No prompt block is
injected, amplified, or altered. No branch downstream reads the value.

Authoritative surface per §III (executable code outranks comments for branch behavior):
**degradation is log-only and invisible to the member and to the model.**
The comment is retracted as evidence of behavior. Recorded in the correction ledger.

---

## 4. Canonical continuity path map (`/list`)

```
client POST  (body.relationshipContextId optional — explicit member handoff)
  │
  ▼  app/api/sovereign/app/maia/list/route.ts
  ├─ 873-901  relationalContextAddendum   ← getMemberActiveRelationalContext
  │                                          → formatRelationalContextForPrompt
  ├─ 908-968  memoryInfluenceAddendum     ← loadRecentDevelopmentalMemories +
  │                                          loadRecentThemeSignals
  │                                          → buildMemoryInfluencePlan().promptBlock
  ├─ 959-967  atomsAddendum               ← loadMemberMemoryAtomsForPrompt
  │                                          → formatAtomsForPrompt
  ├─ 976-996  conversationalRecallAddendum← loadPriorCrossSessionExchanges(uid,sid,6)
  │                                          → formatPriorExchangesForPrompt
  ├─ 1004-1022 episodicRecallAddendum     ← loadRecentMarkedEpisodes(uid,5)
  │                                          → formatMarkedEpisodesForPrompt
  ├─ 1051-1058 forwardReadinessAddendum   ← detectForwardReadiness(message)
  ├─ 1084-1115 memoryHealth               ← buildMemoryHealth(12 layer inputs)
  │
  ├─ 1125-1152 buildMaiaRuntimeContext(...)   ── OBSERVABILITY BRANCH (dead-ends:
  │                                               log + ring buffer + response field)
  ├─ 1179      assertProviderAvailable()
  └─ 1184-1238 getMaiaResponse({ meta: { ...eleven addendum STRINGS... } })
                 │
                 ▼  lib/sovereign/maiaService.ts (blob e8f5bf6d…, 3737 lines)
                 2808  processingProfile = maiaConversationRouter(...)  ← RUNTIME-DETERMINED
                 2943  switch (processingProfile)
                   ├─ 'FAST' → fastPathResponse  (:646)   assembly site :1297
                   ├─ 'CORE' → corePathResponse  (:1377)  separate assembly site
                   └─ 'DEEP' → deepPathResponse  (:1788)  separate assembly site
                   (:2980 fallback → fastPathResponse)
```

### FAST-path final assembly — OBSERVED, `lib/sovereign/maiaService.ts:1297`
A single template literal. Continuity contributors in **assembly order**:

`MAIA_RUNTIME_PROMPT` → userIdentification → placeAddendum → modeAdaptation →
timeAwareness → cognitiveScaffolding → **relationshipContext** → selflet →
sanctuaryInstruction → wisdomInjection → knowledgeField → epistemicPath →
spiralSnapshot → therapeuticFramework → reflectionLens → governor → maiaMode →
scribeSessionDiscussion → wuxingSnapshot → astrology → practiceField → studio →
knowledgeGate → memberWeb → fieldWisdom → **conversationalRecall** → **episodicRecall** →
**atoms** → **relationalContext** → **memoryInfluence** → **forwardReadiness** →
stateVectorContract → youthPrompt

---

## 5. `relationalContext` vs `relationshipContext` — RESOLVED (§XXXIV.6)

**They are TWO DISTINCT CONTRIBUTORS with different producers, different substrates,
different entry conditions, and two different positions in the SAME assembly string.**
Neither is dropped; neither is a rename of the other.

| | `relationalContext` | `relationshipContext` |
|---|---|---|
| variable at assembly | `relationalContextAddendum` | `relationshipContext` |
| producer | `getMemberActiveRelationalContext` — `lib/relationships/relationshipContextService.ts` (blob `b2b89ba7…`), called at `route.ts:877` | `loadRelationshipMemory` → `formatRelationshipMemoryForPrompt`, `maiaService.ts:684` and `:1090-1092` |
| built where | the **route** (`route.ts:881`) | **inside maiaService** (`maiaService.ts:1090`) |
| entry condition | `userId && !isSanctuary && typeof body.relationshipContextId === 'string' && length>0` — **explicit member handoff only** (`route.ts:873-875`) | `userId && !isSanctuary` — **ambient, every authenticated non-sanctuary turn** (`maiaService.ts:682`) |
| carriage | route `meta.relationalContextAddendum` → read at `maiaService.ts:1253` | never crosses the route boundary; local to maiaService |
| substrate | Relationship Field entries + relationalObserver inference | relationship-memory store (encounters/themes/breakthroughs) |
| assembly position (FAST) | **late** — between `atoms` and `memoryInfluence` | **early** — right after `cognitiveScaffolding` |
| in `MaiaRuntimeContext.promptBlock` | **YES** (`relationalContext` layer) | **NO — invisible to the runtime contract** |

**§IV `SURFACE_SUBSTITUTION` trap explicitly avoided and recorded:** the producer file
for `relationalContext` is *named* `relationshipContextService.ts`, and the client body
field is *named* `relationshipContextId`. Filename and field name both point at the
*other* contributor's name. The resolution above is derived from executable dispatch
(`route.ts:877-882`, `maiaService.ts:1090-1092`, `:1253`, `:1297`), not from naming.

**Second-order finding:** `relationshipContext` is a continuity contributor that is
ambient, cross-session, present on every authenticated turn, and **entirely absent from
the runtime contract's inventory.** The contract's 11-slot `promptBlock` therefore does
not enumerate the full continuity surface of `/list`.
