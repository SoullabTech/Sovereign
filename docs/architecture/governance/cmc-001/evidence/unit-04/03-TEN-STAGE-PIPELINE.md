# CMC-001 · Unit 4 · Artifact 3 — The 10-Stage Pipeline: what each stage does to memory

`lib/orchestration/consciousness-orchestrator.ts:149-230`
@ `52a3b924b7cf52013c1c8b0d635359c2cad672fc` blob `33fce86bfde8f1c01c53588403d7f8753582b9f7`

Entry guard: `orchestrateResponse` throws `'Systems not activated'` if
`!this.systems.activated` (`:150`). `processRequest` (`:1013`) lazily calls `activate()`
(`:119-146`), which runs ten initializers in series and **re-throws on any failure**
(`:143 throw new Error('System activation failed: …')`). The singleton
(`:1067 export const consciousnessOrchestrator = new ConsciousnessOrchestrator()`)
means activation is once-per-process.

| # | Stage | Line | What it does to memory | Reaches a model? | Reaches the member? |
|---|---|---|---|---|---|
| 0 | `assessSpiralState` | `:157` / `:344` | Returns `{position:'uninitialized',depth:0}` if `spiralQuest`/`fractalField` absent. Otherwise per-user spiral position. Not a memory substrate. | no | no |
| 1 | `witness` | `:160` / `:396` | **M3.** Only stage receiving `userId`. Produces a real member-scoped generation. Its `message` is discarded; it lacks the `essence`/`patterns` fields stages 2–3 read. | yes (internal) | **no** |
| 2 | `recallMemories` | `:163` / `:404` | **M1.** Member-anonymous recall over four empty in-process layers; `patterns: undefined`; `depth` fraction misused as item count. | via stage 7 only | **no** |
| 3 | `retrieveKnowledge` | `:166` / `:416` | **M2.** Vault query with `context: undefined`; silently no-ops when unconfigured. Result omitted from stage 7 input. | **no** | **no** |
| 4 | `analyzePsychologically` | `:169` / `:428` | Framework analysis of `input` + `witnessing`. Not member history. | via stage 7 | no |
| 5 | `processElementally` | `:172` / `:444` | Elemental Oracle over `input`/`psychological`/`knowledge`. | via stage 7 | no |
| 6 | `applySpiralQuest` | `:175` / `:365` | Quest mechanics. Note `input: context.input` (`:373`) — `orchestratorContext` has no `input` key → `undefined`. Second contract slip. | no | no |
| 7 | `enhanceWithAI` | `:178` / `:461` | **The only stage that puts memory into a model.** `buildSynthesisInput` → `JSON.stringify(...).substring(0,200)` per stream, four streams, joined ` \| `. Result → `aiBridge.generateEnhancedSynthesis`. **Its textual output is never read again.** Wrapped in `try/catch` returning `{ai:false}` on failure (`:497-500`) — silent degradation. | **yes** | **no** |
| 8 | `processReciprocalLearning` | `:188` / `:582` | Ecosystem learning over all prior streams. Contributes metadata only (`:844-850`). | — | no |
| 9 | `processNestedObservation` | `:203` / `:622` | Nested observers; `extractConsciousnessPatterns`, `identifyMetaPatterns`. Metadata only (`:851-861`). | — | no |
| 10 | `synthesize` | `:219` / `:790` | **Stubbed.** See below. | no | `message` only |

---

## Stage 10 — the terminal finding

`synthesize` (`:790-814`) calls four helpers and then `weaveResponse`:

```ts
:794  const primaryTheme      = this.identifyPrimaryTheme(streams);
:797  const supportingThreads = this.findSupportingThreads(streams, primaryTheme);
:800  const emergentInsight   = this.discoverEmergence(streams);
:803  const resolution        = this.resolveContradictions(streams);
:806  const woven = await this.weaveResponse(primaryTheme, supportingThreads, emergentInsight, resolution);
:813  return { message: woven.content, metadata: { … } };
```

All five are non-functional at this referent. **OBSERVED**, each read in full:

| Helper | Line | Body | Output |
|---|---|---|---|
| `identifyPrimaryTheme` | `:869-887` | six theme counters all initialized to `0`; the analysis step is the comment `// Analyze each stream for theme presence` with no code | `reduce` over all-zero values returns the **first key**: constant `{primary:'transformation', weights:{all zero}}` |
| `findSupportingThreads` | `:889-905` | three `if` blocks — elemental, **`streams.memories?.patterns`**, **`streams.knowledge?.connections`** — each containing only a comment | constant `[]` |
| `discoverEmergence` | `:908-917` | comment only | constant `{insight:'emergent pattern detected', confidence:0.85, novelty:0.72}` |
| `resolveContradictions` | `:919-927` | comment only | constant `{method:'dialectical-integration', resolved:true}` |
| `weaveResponse` | `:929-947` | **ignores all four parameters** | constant `{ content: 'Woven consciousness response', structure:{…} }` |

Therefore:

```
corch:813   message: woven.content  ===  'Woven consciousness response'
```

**a compile-time string constant, independent of input, member, and every stage above it.**

`generateSystemPrompt` (`:973-990`) — which names *"Deep memory patterns and recall"* and
*"Vast knowledge from the Obsidian Vault"* — is **dead code**. Repo-wide
`git grep 'generateSystemPrompt' 52a3b92… -- lib/orchestration` returns exactly one hit:
its own definition. It is `private` and uncalled. **§III/§IV: this prose is a comment-class
surface and carries no claim about behavior.** OBSERVED.

---

## Propagation of the constant

```
corch:813        message = 'Woven consciousness response'
cwrapper:138     const response = orchestrationResult?.message || await this.fallbackGeneration(...)
```
`?.message` is a non-empty string → **truthy** → `fallbackGeneration` (`:518-521`, the only
route by which `observerPrompt` could reach a model) **does not fire**. Confirms and
extends Unit 3. Identical at `cwrapper:238` for Phase 3. **OBSERVED.**

```
maiaService:2058  maiaInitialResponse = consciousnessResponse.response
maiaService:2076  let finalResponse   = maiaInitialResponse
```
Claude consultation (S1) is gated `MAIA_USE_CLAUDE_CONSULTATION === 'true'` (`:2083`),
documented DISABLED by default. So on the default configuration
`finalResponse === 'Woven consciousness response'` on entry to validation.

---

## Does the validator rescue it? — **No.** S2 does not fire.

`validateAndRepairResponse` (`maiaService:553-601`) regenerates **only** when
`validation.decision === 'REGENERATE'` (`:588`), which requires
`hasCritical || violationCount >= 2` (`:86-88` of `lib/validation/socraticValidator.ts`
@ `52a3b92…` blob `dfea134d6ffb7053d8a953a35e035ca21bfc3ac2`).

Every one of the five layers is a **pathology detector**. Applied to the draft
`'Woven consciousness response'`:

| Layer | Line | Trigger | Fires? |
|---|---|---|---|
| 1 · Opus axioms — identity | `:135-152` | `/\byou are\s+\w+ing\b/`, `/\bi (can tell\|sense you'?re…)/`, `/(clearly\|obviously\|definitely)\s+you/` | no |
| 1 · explicit humility | `:155-160` | ≥3 certainty words | no (0) |
| 1 · pace with care | `:170` | `/you (need to\|must\|should) (immediately\|now\|right away)/` | no |
| 2 · elemental alignment | `:189-253` | early-returns unless `args.element` set; then needs count ≥3 | no (0 elemental keywords) |
| 3 · phase awareness | `:259-283` | early-returns unless `args.isUncertain`; then needs certaintyCount ≥2 | no (0) |
| 4 · caution compliance | `:298-371` | grief/mission, bypassing, fire-practices, rushing regexes | no |
| 5 · language resonance | `:383-479` | `/: \./`, `/\.\s*\./`, `/"\s*"/`, triple-repeat `\b\w{4,}\b(\s+\1){2,}`, tautology, clinical-in-water | no |

`ruptures = []` → `isGold = true` → `decision = 'ALLOW'` → `summary = '⭐ GOLD - Perfect
alignment'` (`:99-101`). The constant is **passed through as a perfect response**.

Determined statically by reading each regex against the literal draft. **No code was
executed.** `evidence_basis: STATIC_POSSIBLE`; the regex/draft matching is INFERRED from
JS `RegExp` semantics over an OBSERVED constant and OBSERVED patterns.

> **Correction to Unit 3.** Unit 3 §B-3 classified S2 (validation repair) as a live
> conditional carrier of C1–C4. It is a carrier *if it fires*. At this referent, on the
> DEEP-primary path, **it cannot fire**, because the draft it is asked to judge is a
> three-word constant containing no detectable pathology. The addenda C1–C4 therefore have
> **no reachable carriage on the DEEP-primary path at all** — neither S1 (default-off) nor
> S2 (unreachable) nor S3 (drops `meta` at `corch:1018`).

---

## The competing branch — the 4.5 s race

`maiaService:2051-2071`:
```ts
:2051  consciousnessResponse = await Promise.race([
:2052    consciousnessWrapper.processConsciousnessEvolution(input, consciousnessContext),
:2053    new Promise((_, reject) => setTimeout(() => reject(new Error('consciousness-stage-timeout')), 4500))
:2055  ]);
…
:2063  } catch (err) {
:2067    maiaInitialResponse = `I'm here with you. Let's explore what you're bringing.`;
```

The first DEEP request in a process must complete `activate()` — ten bridge initializers
including `ObsidianVaultBridge.connect()`/`indexVault()`, `AIIntelligenceBridge.initialize()`,
and file-system I/O — **plus** all ten pipeline stages **plus** the stage-7 model call,
inside 4500 ms. If it exceeds that, or if any initializer throws (`corch:143` re-throws),
the catch fires and the member receives the **second constant**.

**Both branches are constants.** Which one a real member receives depends on wall-clock
timing and bridge availability and is therefore **`RUNTIME_BRANCH_UNRESOLVED`** — but it is
not census-material, because neither branch carries member memory.

---

## Phase routing — where the orchestrator is and is not used

`processConsciousnessEvolution` (`cwrapper:527-548`):

| Condition | Phase | Orchestrator? | Response source |
|---|---|---|---|
| `context.metaAwareness \|\| metaTriggers.length > 0` | 3 `processWithMetaConsciousness` `:203` | **yes** `:224` — *unless* `metaTriggers.length === 0`, in which case it delegates to Phase 2 (`:214-217`) | constant |
| `hasTemporalPatterns \|\| observerLevel >= 4` | 2 `processWithTemporalWindows` `:158` | **no** | `aiBridge.generateLayerWisdom` `:174` and `:186` — **a genuine model response** |
| else | 1 `processWithRecursiveObserver` `:111` | **yes** `:126` | constant |

**Refinement to Unit 3 §B-2**, which stated all three phase entry points route through
`buildObserverPrompt` and the orchestrator. **Phase 2 never calls the orchestrator.** It
builds `buildTemporalPrompt` per layer, calls `aiBridge.generateLayerWisdom` directly, then
synthesizes via `buildTemporalSynthesisPrompt` (`:181-188`). Phase 2 is the only DEEP phase
that produces a real generated response — and it too carries no member memory, only `input`
and the temporal window. **OBSERVED.**
