# CMC-001 · Unit 4 — Evidence Reconciliation and Runtime Boundary

Mandate: commit `dbc4d5df3f0806403ee3d14aba4dd573b637dfb0`, blob
`8374f1e942c8e4f8b41dab319eb75dabf609681b` — **digest verified, matches launch authority.**
Canonical referent: `origin/clean-main-no-secrets` @ **`52a3b924b7cf52013c1c8b0d635359c2cad672fc`**
(fetched fresh by this unit). Working tree branch `feature/labtools-redesign` @ `d41b8b35` — **not used as evidence.**
Deployed referent: **`DEPLOYED_REFERENT_UNBOUND`** (§II). No runtime witness taken.
Repository files modified: **none.**

Default evidence fields for every claim below unless stated:
`evidence_basis: STATIC_POSSIBLE` · `route_status: REGISTERED_CANONICAL_LIVE` ·
`observed_status: NOT_OBSERVED` · `evidence_date: 2026-08-12` ·
`referent_binding: origin/clean-main-no-secrets @ 52a3b924…`

---

## 1. Import lineage — proving path identity (OBSERVED)

`tsconfig.json` @ `52a3b924`: `"paths": { "@/*": ["./*"] }` → `@/` = repository root.

| Hop | Site | Import statement | Resolves to |
|---|---|---|---|
| H1 | `app/api/sovereign/app/maia/list/route.ts:88` blob `04b08a20df52bd71ae05074e095e81abe9661379` | `import { getMaiaResponse } from '@/lib/sovereign/maiaService'` | `lib/sovereign/maiaService.ts` |
| H2 | `lib/sovereign/maiaService.ts:8` blob `e8f5bf6d9badcec949f58d8fa0ac9ba0e01954c1` | `import { consciousnessWrapper, type ConsciousnessContext } from '../consciousness/consciousness-layer-wrapper'` | `lib/consciousness/consciousness-layer-wrapper.ts` |
| H3 | `lib/consciousness/consciousness-layer-wrapper.ts:8` blob `42dd2c210cf22cd2c2d0a3e8a800fa6b9e32c29f` | `import { consciousnessOrchestrator } from '../orchestration/consciousness-orchestrator'` | `lib/orchestration/consciousness-orchestrator.ts` |
| H4 | `lib/orchestration/consciousness-orchestrator.ts:1067` blob `33fce86bfde8f1c01c53588403d7f8753582b9f7` | `export const consciousnessOrchestrator = new ConsciousnessOrchestrator()` (class `:85`) | the singleton actually called at cwrapper `:126` / `:224` |

All eight Unit-4 blob SHAs re-derived independently and **match** (`git rev-parse 52a3b924:<path>`).

Production reachability of the DEEP branch (OBSERVED):
`getMaiaResponse` (`maiaService:2379`) → `case 'DEEP':` (`:2966`) → `deepPathResponse(...)` (`:2967`);
`deepPathResponse` is defined at `:1788` and the next function boundary is `determineConsultationType` at `:2296`,
so lines **1788–2295** are its body and every citation below in `2020–2260` lies inside it. OBSERVED by
line-range containment against the function-boundary listing.

---

## 2. The three "verified" claims — re-derived

### C1 · `weaveResponse` — **INDEPENDENTLY_VERIFIED**

`lib/orchestration/consciousness-orchestrator.ts` @ blob `33fce86bfde8f1c01c53588403d7f8753582b9f7`, **lines 929–947**:

```ts
929  private async weaveResponse(
930    primaryTheme: any,
931    supportingThreads: any[],
932    emergentInsight: any,
933    resolution: any
934  ): Promise<any> {
935    // The actual weaving of all elements into Maya's voice
936
937    return {
938      content: 'Woven consciousness response',
939      structure: { opening:'witnessing', development:'elemental-psychological',
940                   insight:'emergent', closing:'integration' }
946    };
947  }
```

Four declared parameters. Body is one comment plus one object literal. **No parameter identifier
appears anywhere in the body.** Return `content` is a compile-time string constant. OBSERVED.

Consumed at `:806` `const woven = await this.weaveResponse(primaryTheme, supportingThreads, emergentInsight, resolution)`
and `:814` `message: woven.content`.

Alternate-implementation check (OBSERVED):
- `git grep -n 'weaveResponse' 52a3b924` → exactly **two** code hits, both in this file (`:806` call, `:929` definition).
  `lib/oracle/ConversationIntelligenceEngine.ts` defines `weaveResponses` (plural) — a **different symbol**, not on this path.
- `git grep -n "Woven consciousness response" 52a3b924` → exactly **one** hit: `:938`.
- Method is `private`; class `ConsciousnessOrchestrator` (`:85`) has no subclass at this referent
  (no `extends ConsciousnessOrchestrator` in the tree).
- **No feature flag, branch, or wrapper alters `weaveResponse`.** It is unconditional.

### C2 · `processRequest` context reconstruction — **INDEPENDENTLY_VERIFIED**

Same file, **lines 1011–1026**:

```ts
1011  async processRequest(input: string, context: any): Promise<any> {
1013    if (!this.systems.activated) { await this.activate(); }
1018    const orchestratorContext = {
1019      sessionId: context.sessionId,
1020      userId: context.userId,
1021      sessionHistory: context.sessionHistory || []
1022    };
1025    return await this.orchestrateResponse(input, orchestratorContext);
1026  }
```

Callers (OBSERVED): `cwrapper:126-136` passes `{sessionId, userId, observerLevel, observerPrompt, meta{…}}`;
`cwrapper:224-236` passes `{sessionId, userId, orchestrationType, metaConsciousness, metaTriggers, observerLevel, meta{…}}`.
**Dropped at the boundary:** `observerLevel`, `observerPrompt`, `meta`, `orchestrationType`,
`metaConsciousness`, `metaTriggers`. `sessionHistory` is set by **no caller** → resolves to `[]`.
Three keys survive; two of them are identifiers, one is empty. OBSERVED.

### C3 · `orchestrationResult?.message ||` short-circuit — **INDEPENDENTLY_VERIFIED (with a scope correction, see §4)**

`lib/consciousness/consciousness-layer-wrapper.ts` @ blob `42dd2c210cf22cd2c2d0a3e8a800fa6b9e32c29f`:

- `:138` (Phase 1) `const response = orchestrationResult?.message || await this.fallbackGeneration(observerPrompt, input);`
- `:238` (Phase 3) `const response = orchestrationResult?.message || await this.fallbackGeneration(metaPrompt, input);`
- `:518-521` `private async fallbackGeneration(prompt, input) { return await this.aiBridge.generateLayerWisdom('consciousness', prompt, { fallback: true }); }`

`orchestrationResult.message === 'Woven consciousness response'` (28 chars, non-empty) → truthy →
right operand of `||` is **never evaluated** → `fallbackGeneration` does not execute → `observerPrompt` /
`metaPrompt` never reach a model. OBSERVED. This is the **only** call site of `fallbackGeneration`
on this path, therefore `observerPrompt` and `metaPrompt` are **dead content** on Phases 1 and 3.

---

## 3. The agent-only claims — resolved

| # | Claim | Disposition | Basis |
|---|---|---|---|
| A1 | `MemoryQuery` has no member field | **INDEPENDENTLY_VERIFIED** | `lib/bridges/memory-systems-bridge.ts` blob `f92022ff…` `:22-28` = `{input, patterns?, depth?, timeRange?, memoryType?}`. `Memory` `:38-48` = `{id,timestamp,content,type,tags,associations,emotionalValence,importance,accessed}`. Neither carries `userId`/`sessionId`/member identity. `recall(query)` `:155` receives only what `corch:409-413` passes: `{input, patterns, depth}`. OBSERVED. |
| A2 | Socratic validator returns GOLD on the constant | **INDEPENDENTLY_VERIFIED** (residual noted) | Decision arithmetic OBSERVED at `lib/validation/socraticValidator.ts` blob `dfea134d…` `:86-98` (`REGENERATE` iff `hasCritical \|\| violationCount>=2`) and `:100` `const isGold = ruptures.length === 0`. Independent re-derivation: all **23** compilable regex literals in the file were extracted and evaluated against the exact draft `'Woven consciousness response'` — **0 matches**. Counter-based triggers require ≥3 certainty words / ≥3 elemental keywords; the draft has three words, none of them such. Layers 2 and 3 early-return unless `args.element` / `args.isUncertain` is set. Residual: the count/gate branches are INFERRED from reading, not executed. Load-bearing consequence — **the validator cannot regenerate the constant** (`maiaService:589` requires `decision === 'REGENERATE'`) — is verified. |
| A3 · M1 | `memoryBridge.recall` is member-anonymous and returns ≈0 rows | **PARTIALLY VERIFIED.** Member-anonymity: **INDEPENDENTLY_VERIFIED** (=A1). Row-count: **AGENT_EVIDENCE_ONLY with a CORRECTION.** | `membridge:185` `memories: allMemories.slice(0, query.depth \|\| 10)`. `query.depth = witnessing.depth` (`corch:412`) and `witnessing.depth = response.depth` (`sacred:171`), computed by `calculateDepth` (`sacred:394-403`) which returns `Math.min(0.3 + {0,0.15}+{0,0.10}+{0,0.10}+{0,0.05}, 1.0)` → **∈ [0.3, 1.0]**. `slice(0, 0.3…0.99)` truncates to 0 → empty; `slice(0, 1.0)` → **1 row**. **Correction to Unit 4:** its "`depth ∈ (0,1)` → zero rows" is imprecise — depth can reach exactly 1.0, yielding one row. Also `depth` is never 0, so the `\|\| 10` fallback is unreachable. The claim that the four underlying layers are empty was **not re-derived by this unit** → AGENT_EVIDENCE_ONLY. |
| A3 · M2 | `obsidianVault.query` runs on an undefined search term | **INDEPENDENTLY_VERIFIED** | `corch:421-425` passes `{ context: witnessing.essence, memories, semanticSearch: true }`. `witnessing` is the return of `sacredCore.processInput` (`corch:401`), whose return object is `lib/sacred-oracle-core-enhanced.ts` blob `27a8249e…` `:168-175` = `{message, mode, depth, tracking, metadata, wisdomSources}`. `git grep -n 'essence' 52a3b924:lib/sacred-oracle-core-enhanced.ts` → **zero hits**. Therefore `witnessing.essence === undefined`. OBSERVED. Same for `witnessing.patterns` (`corch:411`) — not in the producer's return. |
| A3 · M3 | `witness` is the one member-scoped retrieval, and its generation is discarded | **INDEPENDENTLY_VERIFIED** | `corch:396-402` `witness()` → `sacredCore.processInput(input, context)`; `sacred:160-165` calls `generateResponse(input, context.userId \|\| context.sessionId, context)` — **member-scoped**. Its `message` is returned into `streams`, but `synthesize` (`:790-814`) never reads `streams.witnessing.message`; `:814` takes `woven.content` only. OBSERVED. |
| A3 · M4 | `applySelfletDeliveryGuard` concatenates member content unmediated | **INDEPENDENTLY_VERIFIED** | `maiaService:331` definition; `:343-344` `if (response.includes(requiredAck)) return response.replace(requiredAck, requiredAck + SELFLET_MARKER);` `:349` `return requiredAck + SELFLET_MARKER + response;`. Applied at `:2258` **after** validation, so it is not validator-mediated and not model-mediated. OBSERVED. |
| A4 | Cross-module contract mismatch masked by `// @ts-nocheck` | **INDEPENDENTLY_VERIFIED** | `corch:1` `// @ts-nocheck`; `cwrapper:1` `// @ts-nocheck`. Producer/consumer field mismatch shown in M2/M3 rows. OBSERVED. |

---

## 4. The terminal composition boundary — traced BACKWARD

Starting at the member-visible response and working back:

```
T0  member-visible text
T1  app/api/sovereign/app/maia/list/route.ts  → NextResponse.json(...)  (route blob 04b08a20…)
T2  getMaiaResponse  maiaService:2379 → case 'DEEP': :2966 → deepPathResponse(...) :2967
T3  deepPathResponse returns  :2260-2261   { response: guardedResponse, … }
T4  guardedResponse = applySelfletDeliveryGuard(validatedResponse, selfletContext)   :2258
T5  validatedResponse ← validateAndRepairResponse(sessionId, input, finalResponse, meta, 'DEEP', regenFn)  :2158
        regeneration gate  :589  requires validation.decision === 'REGENERATE'  → NOT met (A2)
T6  finalResponse = maiaInitialResponse   :2076
        Claude consultation seam  :2079-2083  gated on MAIA_USE_CLAUDE_CONSULTATION — documented DISABLED by default
T7  maiaInitialResponse = consciousnessResponse.response   :2058
        OR, on race rejection at :2054, the literal  "I'm here with you. Let's explore what you're bringing."  :2067
T8  consciousnessResponse ← Promise.race([ consciousnessWrapper.processConsciousnessEvolution(input, consciousnessContext),
                                           4500 ms timeout ])   :2051-2056
T9  processConsciousnessEvolution   cwrapper:527-547   ← THE BRANCH POINT
```

### T9 — the branch point (OBSERVED, `cwrapper:531-546`)

```ts
532  const metaTriggers = this.detectMetaTriggers(input, context);
533  const hasTemporalPatterns = this.detectTemporalPatterns(input) !== null;
536  if (context.metaAwareness || metaTriggers.length > 0)  → processWithMetaConsciousness   (Phase 3)
541  if (hasTemporalPatterns || context.observerLevel >= 4) → processWithTemporalWindows     (Phase 2)
546  return await this.processWithRecursiveObserver(input, context)                          (Phase 1)
```

`processWithMetaConsciousness` `:213-216`: **if `metaTriggers.length === 0` it delegates to Phase 2.**

Inputs to the branch, from `maiaService:2034-2043`:
- `observerLevel = Math.max(1, Math.min(effectiveHistory.length + 1, 7))` (`:2040`) → `>= 4` once history length `>= 3`
- `temporalWindow` = `'eternal'` if `conversationContext.profile.conversationPhase === 'transcending'` else `'present'` (`:2041`)
- `metaAwareness` = `conversationPhase === 'transcending' || dominantElement === 'aether'` (`:2042`)
- `detectTemporalPatterns` (`:329-335`) matches `/remember|past|before|history|ancestors/i`, `/future|tomorrow|will|potential|becoming/i`, `/eternal|timeless|always|forever|infinite/i`, `/now|present|current|here|immediate/i` — **substring, unanchored**; `/here/i` also matches "there"/"where", `/will/i` matches "will".
- `detectMetaTriggers` (`:392-411`) — five doubled-word/recursion patterns.

**Resolved terminal selection (OBSERVED, static, complete):**

| Condition | Phase | Terminal content |
|---|---|---|
| `metaTriggers.length > 0` | 3 → orchestrator | **constant** `'Woven consciousness response'` |
| `metaTriggers.length === 0` ∧ `metaAwareness` | 3 → delegates to 2 | model-generated |
| `metaTriggers.length === 0` ∧ ¬`metaAwareness` ∧ (`hasTemporalPatterns` ∨ `observerLevel>=4`) | 2 | model-generated |
| `metaTriggers.length === 0` ∧ ¬`metaAwareness` ∧ ¬`hasTemporalPatterns` ∧ `observerLevel<4` | 1 → orchestrator | **constant** `'Woven consciousness response'` |
| any phase exceeding 4500 ms | race reject `:2054` | **constant** `"I'm here with you. Let's explore what you're bringing."` |

### What can actually change the returned content

Applying the required distinctions — *loaded · transformed · passed · available · consumed · in a model prompt · capable of changing returned content*:

**Phase 1 / Phase 3-with-triggers — content-affecting inputs: NONE.**
`input` is passed to `processRequest` `:1011`, forwarded to `orchestrateResponse` `:1025`, reaches the
model at stage 7 (`corch:475` `aiBridge.generateEnhancedSynthesis`) — that output is **consumed by nothing**
that reaches `:814`. `synthesize` `:806` calls `weaveResponse`, which ignores its four arguments.
So even the member's own current message **cannot change one character** of the returned text.
The only member-derived material that can appear is `selfletContext.requiredAck`, concatenated at
`maiaService:349` **after** validation, by string arithmetic, with no model mediation.

**Phase 2 (and Phase 3-without-triggers) — content-affecting inputs, exhaustively:**
`buildTemporalPrompt` (`cwrapper:347-368`) receives the full `context: ConsciousnessContext` — which
carries `conversationHistory`, `currentDepth`, `elementalResonance` — and **consumes exactly one field:
`context.observerLevel`** (`:362`), an integer derived from history **length**, not history content.
The rest of the prompt is `input` verbatim (`:366`), the `layer` name, and the `window` label.
`buildTemporalSynthesisPrompt` (`:371-389`) consumes `input`, `window`, layer names, and the per-layer
responses **truncated to 200 characters** (`:383`).
→ **`conversationHistory` is passed and available but never consumed.** This is the mandate's
"availability is not composition" case, OBSERVED at a single line.

**Therefore, across all phases of this path, the content-affecting input set is:**
1. the member's current `input` (verbatim; Phase 2 only)
2. `observerLevel` — an integer = history **length**, capped at 7
3. `temporalWindow` / `metaAwareness` — branch selectors derived from `conversationContext.profile`
4. `selfletContext.requiredAck` — the sole member-memory content reaching the member, by concatenation
5. wall-clock timing (the 4500 ms race) — selects between an orchestrator terminal and a second constant

**Not content-affecting on this path** (loaded and/or passed, never consumed into any prompt that
reaches the member): `MemoryBundle`, `relationshipMemory`, atoms, C1–C4 addenda, `relationalContext`,
`conversationHistory` content, astrology/WuXing context, `knowledgeFieldNote`, cognitive profile,
`observerPrompt`, `metaPrompt`, `meta`, and the entire M1/M2/M3 substrate. The one prompt seam that
could carry them — the Claude consultation at `:2087-2100` — is default-disabled (`:2079-2083`).

---

## 5. Reclassification of Unit 4

**"Substrate census / continuity loss" is necessary but not sufficient. A stronger finding is supported,
and Unit 4's headline is simultaneously too broad in one dimension and too narrow in another.**

**Supported, stated precisely:**

> On the canonical `/list` → `getMaiaResponse` → DEEP → `deepPathResponse` →
> `consciousnessWrapper.processConsciousnessEvolution` path at
> `origin/clean-main-no-secrets @ 52a3b924…`:
>
> **(a)** When phase routing selects Phase 1, or Phase 3 with at least one meta-trigger, the
> examined consciousness-orchestration path **terminates in a compile-time string constant**
> (`'Woven consciousness response'`, `corch:938`) that is **independent of the member, the input,
> and every substrate the census enumerated** — not a response composed from its purported
> consciousness substrates. A second constant (`maiaService:2067`) is returned whenever the
> 4500 ms race rejects.
>
> **(b)** When phase routing selects Phase 2, a genuine model-generated response **is** produced —
> so Unit 4's unqualified "the DEEP-primary path returns a constant" is **too broad** — but that
> response is composed from `input` + an integer `observerLevel` + a window label **and no member
> continuity whatsoever**, because `buildTemporalPrompt` consumes only `context.observerLevel`
> from the context object it is handed.
>
> **(c) Therefore the continuity-loss finding is the more general one: it holds on *every* phase
> of this path.** The constant-response finding is the sharper one but holds on a *subset* of
> phases. Unit 4 conflated their scopes.

**Explicitly NOT supported and NOT claimed:** that MAIA's FAST or CORE paths behave this way; that
`between/chat` behaves this way; that this is what deployed production does
(`DEPLOYED_REFERENT_UNBOUND`); that Phase 2 is or is not the statistically dominant branch in
production — that requires runtime evidence this unit is not authorized to take.

---

## 6. Impact on Units 1–3 (reconciliation, not re-audit)

Reviewed only for dependence on this path composing the substrates investigated.

| Finding class | Classification | Reason |
|---|---|---|
| Route/registry identity of `/list`; DEEP selection; assembly-site topology | **Still independently meaningful** | Structural facts about the route, unaffected by what the terminal returns. |
| The 33-contributor `maiaService` system-prompt assembly census | **Still independently meaningful** | It characterizes an assembly site. But note: on DEEP the assembled prompt has no consumer with the consultation gate off — see next row. |
| Unit 3 §B-3: S2 (validator repair) is a live conditional carrier of C1–C4 | **Interpretation changed — CORRECTED** | Verified here: on Phases 1/3 the draft is a three-word constant, 0/23 regexes match, `decision !== 'REGENERATE'`, so S2 **cannot** fire. Carrier status is not merely conditional; it is unreachable on the constant-producing phases. On Phase 2 it remains conditional and genuinely live. |
| C1–C4 addenda channel reaching the member on DEEP | **True but currently downstream/inert on this path** | S1 default-off (`:2079-2083`), S2 unreachable on Phases 1/3, S3 dropped at `corch:1018`. **Correction to Unit 4:** it declared "no reachable carriage on the DEEP-primary path at all" — this is **too strong**; on Phase 2 the addenda are still not carried, but for a *different and separately provable reason* (`buildTemporalPrompt` consumes only `observerLevel`), not because of `corch:1018`. Same conclusion, different mechanism; the mechanism matters for any later repair unit. |
| `relationalContext` / `relationshipContext` duality | **Requires later re-verification** | Not re-derived by this unit. Untouched. |
| Serialization/provenance discontinuities D1–D8 | **Still independently meaningful** (D1, D5, D6, D7, D8); **downstream/inert** (D2, D3, D4 — they describe transformations upstream of a terminal that discards them on Phases 1/3) | D6 carries the numeric correction in §3 A3·M1. |
| Unit 2.5 Oracle conversation classification | **Not reopened** | Independent of this execution path. |

---

## 7. Basename / source-identity evidence rule

**The hazard is real and is a repository condition, not investigator error.** OBSERVED at `52a3b924`:

- **10,671** tracked files; **327** basenames are shared by two or more files; **2,581** files
  (24.2% of the tree) sit in a basename-collision set.
- Worst offenders are structurally unavoidable in Next.js: `route.ts` ×924, `page.tsx` ×519,
  `index.ts` ×130, `types.ts` ×76.
- Domain-meaningful collisions exist and are the dangerous class: `SpiralogicOrchestrator.ts` ×4,
  `PersonalOracleAgent.ts` ×4, `UnifiedMemoryInterface.ts` ×3, `modelService.ts` ×3,
  `sessionManager.ts` ×3, `memory.ts` ×3, `prompts.ts` ×3.
- The prior `awareness-levels.ts` incident is confirmed as a genuine two-path collision:
  `lib/ain/awareness-levels.ts` **and** `lib/consciousness/awareness-levels.ts`.

**The `memoryBridge` incident is a distinct and worse failure mode.** `memoryBridge` is not a
basename at this referent at all — `git ls-tree` shows exactly one path matching `memory.?bridge`:
`app/api/_backend/src/services/psiMemoryBridge.ts`. `memoryBridge` is an **object property**
(`this.systems.memoryBridge`, `corch:405-409`) whose implementation is bound by an **import**, not by a
filename. A filename search for an identifier that is not a filename returned a substring match in an
unrelated tree (`_backend`). So the class is broader than basename collision: **identifier-to-file
searching is unsound in this repository.**

Minimum evidence-discipline rule CMC-001 requires (no renaming, no cleanup):

> **CMC-001 Evidence Rule — SOURCE IDENTITY BY RESOLUTION, NOT BY NAME.**
> A file may be cited as evidence only as `<repository-relative path> @ <canonical SHA> · blob <blob SHA>`.
> A basename alone, a substring match, or a property/identifier name never establishes source identity.
> When a claim concerns behavior invoked through an identifier (`x.y()`, an imported symbol, a DI
> property), the citation must additionally exhibit the **import or assignment statement that binds
> that identifier**, resolved through the tsconfig `paths` alias map, to the cited repository-relative
> path. Where a basename resolves to more than one path at the referent, the collision set must be
> enumerated in the record even when the correct member is obvious.

This rule is satisfied throughout §§1–4 above.

---

## 8. Contradictions

No §XXIII stop condition triggered. No canonical surface contradicted another. Recorded discrepancies
are **corrections to prior agent evidence**, per §IV `SURFACE_SUBSTITUTION` handling, not evidentiary conflicts:

1. **Scope overreach (Unit 4 → corrected).** "The DEEP-primary path terminates in a constant" is true
   only for Phase 1 and Phase 3-with-triggers. Phase 2 produces a model-generated response.
   Unit 4's own artifact 3 contained a "Phase routing" subsection and a note that Phase 2 is
   orchestrator-free, so the error is in the **headline framing and the §2 answer table**
   ("deliver to the member: Nothing from any of it"), not in the underlying reading.
2. **Numeric imprecision (Unit 4 → corrected).** `slice(0, query.depth)` with `depth ∈ [0.3, 1.0]`
   yields 0 rows, except at exactly `depth === 1.0`, which yields 1. And `depth` is never falsy,
   so the `|| 10` branch is unreachable.
3. **Mechanism misattribution (Unit 4 → corrected).** The addenda fail to reach the member on Phase 2
   because of `buildTemporalPrompt:362`, not because of `corch:1018`. Same outcome, different cause.
4. **Unverified inheritance (flagged, not resolved).** Unit 4's claim that all four M1 memory layers
   initialize empty was not re-derived here and remains `AGENT_EVIDENCE_ONLY`. It is not load-bearing
   for the terminal-composition finding (which holds regardless of whether M1 returns rows, because
   `weaveResponse` ignores them), but it **is** load-bearing for any future substrate-repair reasoning.

---

## 9. Exact next bounded unit

> **CMC-001 Unit 5 — Phase-2 terminal composition and phase-selection frequency bound.**
>
> One question: *On the canonical `/list` → DEEP → Phase 2 (`processWithTemporalWindows`,
> `cwrapper:157-198`) path, what is the complete set of content-affecting inputs to
> `aiBridge.generateLayerWisdom`, and does any member-continuity substrate reach it?*
>
> Authoritative surface: `lib/wisdom-engines/ai-intelligence-bridge.ts` @ blob
> `e80573e46bc14db9c0e1c368c5e6b8940bd50540` (`generateLayerWisdom` internals, model dispatch,
> and whether the options object contributes to the prompt), plus `lib/ai/multiEngineOrchestrator.ts`.
> Static only. Bounded to Phase 2. **No runtime witness, no repair, no `between/chat`.**
>
> Rationale: Phase 2 is now the only branch of this path on which member continuity could still
> be composed, and it is the branch Unit 4 never traced. Until it is traced, the census cannot
> state whether MAIA's DEEP path has *any* live continuity carriage.

**No repair proposal. Nothing custodied. Unit 5 not started.**

---

## Stop state

`UNIT_COMPLETE` — reconciliation complete within the authorized static envelope.

Boundaries held: no runtime witness · no production write · no repair · no architectural design ·
no MFR-001 or frontier material · no `between/chat` · no refused Oracle lane ·
**zero repository files modified.**
