# MAIA-WHOLE-ORGANISM-CENSUS-01

```text
LANE      MAIA-WHOLE-ORGANISM-CENSUS-01
BASE      clean-main-no-secrets @ d5741ce6c
BRANCH    claude/maia-whole-organism-census-01
MODE      READ ONLY
REPAIRS   FORBIDDEN
OPENED    2026-09-04 (founder authorization, this session)
STATUS    PART 1 COMPLETE — spine traced, decisive questions answered
```

## 0. Hard census rule

> Finding a missing wire, duplicate cognition path, dormant intelligence, false authority
> claim, or architectural defect during the census does not authorize repairing it.
> Record it. Complete the map. Adjudicate afterward.

Nothing in this lane repairs anything. Every finding below is recorded for adjudication,
including the ones that look like one-line fixes. Especially those.

## 1. The frozen question

> What actually contributes to MAIA's ordinary sovereign act of cognition, where does each
> contribution enter, what does it produce, what authority does it have, and how does it
> reach — or fail to reach — the response?

## 2. Scope law

> "Whole organism" means the complete set of intelligence contributions capable of shaping
> the authoritative ordinary MAIA turn, plus a differential map of intentional live
> secondary cognition paths. It does not mean every intelligence-related module in the
> repository.

| | Surface | Treatment |
|---|---|---|
| Primary | `POST /api/sovereign/app/maia/list` | full call-graph trace, full intelligence table, full cognition-authority map |
| Secondary differential | `POST /api/between/chat` | cognition entrypoint, orchestration seam, contributors, memory participation, model path, divergences only |

No convergence work. No `/between` repair.

## 3. Prior art classification

`docs/programme/MAIA_JARVIS_MEMORY_ORGANISM_FULL_OPERATIONALIZATION.md`

```text
STATUS   GOVERNING PRIOR ART · MEMORY PROGRAMME CHARTER  (not superseded)

MAY CONTRIBUTE      programme law · diagnostic chain · continuity doctrine ·
                    prior hypotheses · discovery targets · historical witness refs

MAY NOT CONTRIBUTE  current live callers · current /list participation ·
WITHOUT RE-PROBE    current cognition authority · current arrows between systems ·
                    current runtime status
```

Every current-state claim in this census was retraced at `d5741ce6c`. No architectural
claim is inherited.

## 4. Method — trace order

Walked backward from response authority, per the lane instruction, and only then named the
intelligences the paths instantiate. The ontology was never searched first; every
contributor below was reached from a caller.

```text
/list response  (jsonWithCors, route:1897)
  ↑
model invocation  (exactly one: getMaiaResponse, route:1365)
  ↑
tier dispatch  (maiaService:3183 switch on routerResult.profile)
  ↑
prompt assembly  (three different mechanisms — see §5.1)
  ↑
inputs: meta object (~32 prompt-bearing fields) + in-service computation
  ↑
producers
```

## 5. The spine

### 5.1 One model invocation, three prompt-assembly mechanisms

There is exactly one model-bearing call in the authoritative route:
`getMaiaResponse()` at `app/api/sovereign/app/maia/list/route.ts:1365`, wrapped in
`withTimeoutLabeled`. Everything that can shape the response reaches it through one flat
`meta` object.

Inside `getMaiaResponse`, tier dispatch (`lib/sovereign/maiaService.ts:3183`) sends the turn
to one of three paths, and **each assembles its prompt by a different mechanism with a
different membership**:

| Tier | Mechanism | Membership | Site |
|---|---|---|---|
| FAST | inline template literal | ~32 fields, hard-coded in the literal | `maiaService.ts:1443` |
| CORE | `appendAllContextAddenda` iterating `ADDENDA_SPECS` | 27 declared fields | `maiaVoice.ts:414` |
| DEEP | three stages, three memberships — see §12 | local draft: none by construction · consultation: 7-field recall subset · repair: full `appendAllContextAddenda` | `maiaService.ts:2239`, `:2277`, `maiaVoice.ts:950` |

> **Amended in Part 2.** Part 1 stated DEEP does not iterate `MaiaContext` addenda. That was
> inherited from the session anchor rather than retraced, and is wrong: §II.B and §II.C of
> the addenda-divergence note were both closed. §12 records what DEEP actually does.

This is not one seam. It is three, inside a single route, and their memberships differ.

### 5.2 The composition rule is presence, not discernment

The FAST prompt is a single template literal of the form:

```ts
${MAIA_RUNTIME_PROMPT}${userIdentification}${placeAddendum ? '\n\n' + placeAddendum : ''}...
${atomsAddendum ? '\n\n' + atomsAddendum : ''}${divinationCastAddendum ? ... }...
```

`appendAllContextAddenda` is the same rule expressed as a loop:

```ts
for (const spec of ADDENDA_SPECS) {
  const safe = safeAddendum(context[spec.field]);
  if (safe) { out += `\n\n${safe}`; console.log(spec.log(safe)); }
}
```

**Once a contribution has reached live prompt assembly, the composition layer performs no
common relevance or discernment adjudication; it tests presence and appends according to
static source order.** This is a statement about the final composition seam only. Upstream
producers do carry real governance — consent gates, eligibility filters, Sanctuary refusals,
`return_preference`, `member_response_status`, ranked selection in `MemoryBundleService` —
and the partition lane proved several of them. What is missing is a *shared* adjudication
across sources at the point where they meet. Nothing at that seam
asks whether a contribution belongs in this moment, whether two contributions conflict,
whether one should yield to another, or whether the turn is better served by silence. There
is no relevance test, no adjudication, no arbitration, no ordering by salience — the order
is the literal's source order, or the static `ADDENDA_SPECS` order.

The route's own runtime telemetry already concedes the gap. `[MAIA] context-inventory`
(`maiaService.ts:~3170`) emits `evidenceProviders` — and then:

```ts
representationsConsidered: null,
representationsOffered:    null,
```

Considered-but-withheld is not computed, because nothing is ever withheld.

### 5.3 Fifteen prompt-bearing fields the authoritative route never produces

> **Amended in Part 2.** Part 1 said thirteen; the block below contains fifteen. Verified
> split at `d5741ce6c`: **12** are produced only by `app/api/between/chat/route.ts`; **3**
> have no producer anywhere — `scribeSessionDiscussionAddendum`, `consultationAddendum`,
> `maiaModeAddendum`.

Of the ~32 fields read by the prompt builders, the following are **never assigned by
`/list`**. They can only arrive through the client `...meta` rest-spread:

```text
relationshipModeAddendum      governorAddendum            guestContextAddendum
journalContextAddendum        captureContextAddendum      astrologicalContextAddendum
spiralSnapshotAddendum        bridgeSnapshotAddendum      therapeuticFrameworkAddendum
reflectionLensAddendum        epistemicPathAddendum       maiaModeAddendum
scribeSessionDiscussionAddendum   consultationAddendum    fieldWisdomAddendum
```

Tracing their producers repository-wide returns a single answer for twelve of them:
**`app/api/between/chat/route.ts`** — the intentional live *secondary* surface. Three
(`scribeSessionDiscussionAddendum`, `consultationAddendum`, `maiaModeAddendum`) have no
producer on either route and are read-only dead fields.

The Spiralogic snapshot, the Decision Governor (Spiralogic posture constraints), Field
Wisdom (collective field intelligence), the Spiral × Wu Xing bridge, relationship mode,
therapeutic framework and epistemic path are therefore **structurally absent from the
authoritative ordinary MAIA turn** and present only on the secondary surface.

## 6. Decisive question 1 — is Elemental intelligence actually cognition?

Neither of the two hypotheses put to the census is what the source shows. On `/list` there
are **five distinct elemental/phase computations**, no two of which are reconciled against
each other, and **four of the five never reach the prompt at all**.

| # | Engine | Site | Produces | Fate |
|---|---|---|---|---|
| 1 | Mythic Atlas classification | `maiaService.ts:~2940` | primary, facet, archetype, element, phase, confidence, gap | logged. Explicitly withheld from the router: *"atlasContext removed — not yet in router interface (future: elemental routing)"* |
| 2 | `ElementalOracleBridge.processAll` (the 8-voice corpus-callosum source) | `maiaService.ts:829` (FAST), `:1579` (CORE) | `dominant` element + `traceData.elementalAgents` | assigned to `meta.elementalResult` whose sole consumer is corpus-callosum logging. Source comment: *"This gives corpus callosum trace data without blocking the response."* Never in the prompt |
| 3 | `analyzeFieldIntelligence` (Talk Mode) | `maiaService.ts:1021` | element, phase, userState, spiralScale, complexity, confidence, recommended wisdom move | assembled into a full `fieldAwareness` block at `:1030` and then **discarded — dead assignment**. Its only other reference is the comment at `:1134`: *"fieldAwareness intentionally NOT appended — too diagnostic for early exchanges"* |
| 4 | I Ching mapping from ElementalOracle dominant | `maiaService.ts:~1648` (CORE) | hexagram profile | *"Phase 1 — silent mapping only… No user-facing output."* Logged |
| 5 | Wu Xing snapshot | produced by the route | Five-Element state | **reaches the prompt** as `wuxingSnapshotAddendum` |

Two further consequences follow from the same trace:

- The **Conductor** (`lib/voice/conductor.ts`) — the hysteresis-bearing element/phase
  authority — has no caller in the authoritative path. Its only callers are
  `app/api/oracle/conversation/route.ts` and `app/admin/platform-overview/page.tsx`.
- **Bridge D spiral-state persistence** (`loadSpiralState` / `upsertSpiralState`) is
  likewise absent from `/list`; its callers are `oracle/conversation`, `spiralogic-report`
  and `members/spiral-state`.

Both are wired into the route the Surface Authority census (2026-09-04) established as
receiving effectively no live traffic.

**Answer.** On the authoritative surface, Spiralogic/Elemental intelligence is neither
orientation-that-changes-discernment nor state-rendered-as-context. It is
**computed and discarded**, with one exception (Wu Xing) that enters as an undifferentiated
context block. There are **five distinct elemental/phase engines across the `/list` cognition
path**, unreconciled, with any given turn invoking the applicable subset — engines 2 and 3
are FAST-path, engine 4 is CORE-path, engines 1 and 5 are tier-independent, so no single
execution invokes all five. What holds for every turn is that the engines never reconcile
against one another and at most one is permitted to influence the response.

## 7. Decisive question 2 — is there one discernment authority?

No. The shape is the second diagram, and worse in one respect: the contributors do not even
accumulate into a single pile.

```text
memory / atoms / recall ─┐
divination (3 blocks) ───┤
member web ──────────────┤
astrology ───────────────┼──► flat `meta` object ──► tier dispatch ──┬─ FAST template literal ──► model
Wu Xing ─────────────────┤                                            ├─ CORE ADDENDA_SPECS loop ──► model
knowledge gate ──────────┤                                            └─ DEEP builder (no addenda) ─► model
practice field ──────────┤
relational context ──────┘

Mythic Atlas ────────────► log
ElementalOracle (8) ─────► agent_runs (post-generation)
talkModeFieldIntelligence ► discarded
I Ching ─────────────────► log
Conductor ───────────────► not called on this route
```

There is exactly one thing in the path that resembles adjudication, and it is a **safety
gate, not a discernment seam**: `enforceFieldSafety` (`maiaService.ts:~2690`) can refuse the
turn outright and return a boundary message before generation. It decides *whether MAIA may
speak*, never *what belongs in what she says*.

The deliberation hook that would have introduced arbitration is present and inert —
`shouldDeliberate` is computed, logged, and its committee call is commented out
(`maiaService.ts:~2984`, `// TODO Phase 2`).

## 8. Differential — `/api/between/chat`

```text
COGNITION ENTRYPOINT   lib/consciousness/maiaOrchestrator.generateMaiaTurn
                       (+ generateSimpleMaiaResponse in safe mode)
CALLS getMaiaResponse  NO — separate spine, 2,665 lines, its own model path
```

| Contributor | Classification |
|---|---|
| Spiral snapshot, Governor, Field Wisdom, Bridge snapshot, relationship mode, therapeutic framework, epistemic path | **SECONDARY-ONLY** |
| Memory atoms | **DIVERGENT IMPLEMENTATION** — `/between` calls the same `formatAtomsForPrompt`, but appends the block into the memory-orchestrator addendum slot (`route.ts:1889`) rather than carrying an `atomsAddendum` field |
| Memory orchestrator, forward readiness, developmental memories, theme signals | SHARED WITH PRIMARY (different assembly) |
| Conversational recall, episodic recall, member web, divination, knowledge gate, practice field, studio, astrology, Wu Xing | **PRIMARY-ONLY** |
| Corpus Callosum / ElementalOracle | UNKNOWN — not traced in this bounded pass |

The two live surfaces are close to complementary in what they *produce*: `/list` is
memory-rich and Spiralogic-absent; `/between` is Spiralogic-rich and memory-thin.

> **Amended in Part 2 — this is the census's most consequential correction.** Part 1 said
> `/between` "does not call `getMaiaResponse` at all… a separate spine." That was inferred
> from the route file, which imports `generateMaiaTurn`. `generateMaiaTurn` itself calls
> `getMaiaResponse` (`lib/consciousness/maiaOrchestrator.ts:480`). **The two surfaces do
> converge, one level deeper than Part 1 traced.** `/between` is not a parallel spine; it is
> a richer pre-composition layer wrapping the same single model invocation. §13 records what
> survives that hand-off and what does not.

## 9. Recorded, not repaired

| # | Finding | Class |
|---|---|---|
| C-1 | `fieldAwareness` computed every dialogue FAST turn and discarded — dead assignment | dead computation |
| C-2 | Five unreconciled elemental/phase engines per turn | duplicate cognition |
| C-3 | Three addenda-composition mechanisms with three memberships inside one route | duplicate cognition path |
| C-4 | 13 prompt-bearing fields unreachable on the authoritative route; 2 have no producer anywhere | missing wire / dead field |
| C-5 | Conductor and Bridge D spiral persistence live only on a route with no meaningful traffic | stranded intelligence |
| C-6 | Deliberation hook computed and inert (`// TODO Phase 2`) | dormant arbitration |
| C-7 | `representationsConsidered` / `representationsOffered` hard-coded `null` | unimplemented discernment telemetry |
| C-8 | `meta.endpoint` reports `/api/sovereign/app/maia` on the `/list` route (pre-existing, already annotated in source) | false attribution |
| C-9 *(Part 2)* | `facetDecision` — the Spiralogic circulatory governor — is passed into `getMaiaResponse` and read by nothing | dropped at convergence |
| C-10 *(Part 2)* | Twelve fields present on FAST/CORE are absent from DEEP-primary; Wu Xing, the only elemental contribution reaching any prompt, is among them | tier-boundary semantic loss |
| C-11 *(Part 2)* | The full addenda set reaches DEEP only via the *repair* path, i.e. only after a validation failure | inverted membership |
| C-12 *(Part 2)* | Ranked `MemoryBundle` read on FAST only; CORE and DEEP annotate that they do not read it | stranded selection |
| C-13 *(Part 2)* | `scribeSessionDiscussionAddendum`, `consultationAddendum`, `maiaModeAddendum` read by prompt builders, produced by nothing | dead fields |

None of these were touched. C-9 through C-13 were found in Part 2 and are registered, not
repaired, under the same rule.

## 10. Superseded

The preliminary A/B/C Gate 3 packet written in Part 1 is replaced by §15. It was written
before the DEEP interior and the `/between` spine had been traced, and both traces changed
the option set.

---

# PART 2

```text
AUTHORIZED   2026-09-04 (founder), read-only, repairs forbidden
BASE         same — clean-main-no-secrets @ d5741ce6c
GOVERNING    For every intelligence: does it alter orientation, selection, intention or
QUESTION     response formation — or is it merely computed / contextualized / logged?
```

## 12. The DEEP interior

DEEP is not one prompt. It is three stages with three different memberships, and the tier's
memory behaviour depends on which stage a turn reaches.

| Stage | Site | What reaches it | Participation |
|---|---|---|---|
| 1 · local consciousness draft | `consciousnessWrapper.processConsciousnessEvolution`, `maiaService.ts:2239` | `consciousnessContext` only — depth, elementalResonance, observerLevel, temporalWindow, metaAwareness. **No addenda by construction**: source states the local orchestrator *"weaves templates, it does not read a system prompt"* | produces the draft; no memory |
| 2 · Claude consultation | `consultClaudeForConsciousness`, `maiaService.ts:2277` | `contextAddenda` = a **7-field recall subset**: conversational recall, episodic recall, atoms, 3 divination blocks, relational context | ACTIVE — this is the only prompt seam on DEEP-primary |
| 3 · validate & repair | `validateAndRepairResponse` → `buildMaiaComprehensivePrompt` → `appendAllContextAddenda`, `maiaVoice.ts:950` | **full** ADDENDA_SPECS membership | CONDITIONAL — runs only when validation fails |

**What changes semantics at the tier boundary.** Twelve fields that reach FAST and CORE do
not reach DEEP-primary at all: `memberWebAddendum`, `knowledgeGateAddendum`,
`wuxingSnapshotAddendum`, `astrologyAddendum`, `practiceFieldAddendum`, `studioAddendum`,
`placeAddendum`, `memoryInfluenceAddendum`, `forwardReadinessAddendum`, plus the three
dead fields. Wu Xing — the *only* elemental contribution that reaches the prompt on
FAST/CORE — is therefore absent on DEEP. A member who asks for depth gets less elemental
and less contextual grounding than one who does not, and receives the full addenda set only
if the first attempt fails validation.

`analyzeMessageComplexity` selects DEEP for the turns most likely to need orientation.

## 13. `/between` — the required Part 2 finding

**Does MAIA already contain a better cognition/discernment seam on the secondary spine that
should be extracted, shared or converged rather than rebuilt?**

**Yes, partially — and its best output is destroyed at the shared convergence point.**

`generateMaiaTurn` (`lib/consciousness/maiaOrchestrator.ts:245`) performs real
pre-composition work that has no equivalent on `/list`:

| Mechanism | Site | Kind of authority |
|---|---|---|
| `computeFacetDecision` → `FacetDecisionPacket` | `:288`, from `lib/consciousness/FacetDecisionLoop.ts:201` | **decision-shaped Spiralogic** — `activeFacet`, `posture`, `integrityFlags` (`water_rush_risk`, `threshold_collapse_risk`), `languageHints`, `handoff`, `regulation`. Labelled in source *"Spiralogic circulatory governor"* |
| `MemoryBundleService.build` | `:145` | **ranked** multi-bucket selection, not presence-append |
| `resolveMemoryMode` | `:115` | server-side allowlist — *"client can request, but server decides"* |
| `retrieveForMode` | `:208` | mode-filtered knowledge retrieval (care→therapeutic, talk→jungian/philosophy, divination→astrology/enneagram) |
| `calculateThroughline` / `assessStakes` / `getDepthConfig` | `:105-107` | conversational-kernel orientation |
| MCP enrichment | `:174` | biometric correlation, timing guidance, task context |

`facetDecision` is passed *into* the `getMaiaResponse` call at `:525`, inside the same
object as `conversationContext`. Then:

```text
facetDecision    read in maiaService.ts: 0    read in maiaVoice.ts: 0
activeFacet      0    0
integrityFlags   0    0
languageHints    0    0
```

Every `posture` hit in `maiaService.ts` is either Sanctuary `TurnPosture` or the
`governorAddendum` *text* — never the structured facet decision. **The most decision-shaped
Spiralogic object in the system is computed on the secondary spine, handed across the
convergence point, and dropped there unread.**

The ranked memory bundle fares better but not much: `meta.memoryContext` is read at
`maiaService.ts:861` on **FAST only**. CORE and DEEP each carry an explicit source
annotation that they do not read it. So `/between`'s ranked selection survives only when the
turn routes FAST.

**Corpus Callosum on `/between`** — traced to the same `logAgentRun` / `logCorpusCallosumTrace`
services reached through `getMaiaResponse`; no separate emission path found on the
orchestrator. Recorded as **SHARED, post-generation** rather than a distinct contributor.
This is the least deeply traced item in Part 2 and is marked accordingly in §14.

## 14. Evidence tables — remaining domains

Field key: **SR** = surface reach · **IS** = integration shape · **Alters?** = alters
orientation / selection / intention / response formation, vs computed-contextualized-logged.

### Relational intelligence
```text
SUBSTRATE      loadRelationshipMemory + formatRelationshipMemoryForPrompt
ENTRYPOINT     maiaService.ts:747 (FAST), :1579 (CORE), :2023 (DEEP)
/list CALLER   yes, unconditional where userId present
INPUT          stored relationship memory for the member
OUTPUT         relationshipContext prose block
SEAM           FAST template literal (unconditional ${relationshipContext}); CORE via context
AUTHORITY      contextual
DISCERNMENT    none — no relevance test
PROVENANCE     none carried into the prompt text
MODEL REACH    yes (FAST/CORE); DEEP-primary no
SR             /list primary; relationalContextAddendum is a separate member-handed-off act
IS             direct model context
EVIDENCE       source only — UNWITNESSED
ALTERS?        contextualized only
STATUS         LIVE
```

### Developmental intelligence
```text
SUBSTRATE      loadRecentDevelopmentalMemories + loadRecentThemeSignals → memoryOrchestrator
ENTRYPOINT     list/route.ts:945 → buildMemoryInfluencePlan → memoryInfluenceAddendum
/list CALLER   yes
OUTPUT         [MAIA/sovereign] developmental-block log + memoryInfluenceAddendum
SEAM           FAST template literal ONLY — PBR-002 records it as structurally unable to
               reach CORE/DEEP prompts (availableButNotComposed)
AUTHORITY      contextual on FAST; absent elsewhere
DISCERNMENT    plan-level candidate flags (shouldUseMemory, contradictionDetected,
               reinforcementCandidate); no cross-source adjudication
MODEL REACH    FAST only
SR             both (/between shares the loaders)
IS             direct model context (FAST) / computed-and-stranded (CORE, DEEP)
EVIDENCE       source only — UNWITNESSED
ALTERS?        selection at plan level; response formation only on FAST
STATUS         PARTIAL
```

### Somatic-affective intelligence
```text
SUBSTRATE      memoryPlan.somaticCandidate flag only (list/route.ts:979)
ENTRYPOINT     none — no somatic loader, no somatic addendum, no producer in the registry
OUTPUT         a boolean inside the memory-plan log line
MODEL REACH    none
SR             none
IS             unknown / not implemented
EVIDENCE       source only — UNWITNESSED
ALTERS?        no
STATUS         DORMANT — the flag exists; the intelligence does not
```

### Resonant Field / Unified Field intelligence
```text
SUBSTRATE      lib/consciousness/field/MAIAFieldInterface.ts, QuantumFieldPersistence.ts,
               lib/field/* (ResonanceFieldOrchestrator, fieldCoherenceTensor,
               panconsciousFieldRouter, fieldOrchestrator)
/list CALLER   NO. Callers are app/api/maia/memory-enhanced-response/route.ts and
               app/api/between/chat/route.enhanced.backup.ts (a backup file)
IN-PATH KIN    enforceFieldSafety IS in the path — but it is a safety refusal, not field
               intelligence participating in cognition
MODEL REACH    none on either live surface
SR             separate surface
IS             dormant
EVIDENCE       source only — UNWITNESSED
ALTERS?        no (enforceFieldSafety alters whether MAIA speaks at all — recorded
               separately in §7)
STATUS         SEPARATE-SURFACE / DORMANT
```

### Symbolic intelligence beyond divination
```text
DIVINATION     three provenance-separated blocks (intent / cast / interpretation) reach
               FAST, CORE and DEEP-consultation. The only symbolic material with an
               unbroken path to cognition. STATUS: LIVE
I CHING (auto) buildReflectionFromConductor at maiaService.ts:~1648 (CORE) —
               "Phase 1 — silent mapping only. No user-facing output." STATUS: SHADOW
MYTHIC ATLAS   archetype/facet classification — logged; withheld from the router.
               STATUS: SHADOW
DREAMS         available.dreams hard-coded false — "layer not wired". STATUS: NOT WIRED
ALTERS?        divination: yes (contextualized, member-invoked). Others: no.
```

### Corpus Callosum (re-stated with Part 2 evidence)
```text
SR             both — reached through the shared getMaiaResponse, no separate /between path
IS             shadow only, post-generation
ALTERS?        no
EVIDENCE       source only — UNWITNESSED. Least deeply traced item in Part 2.
STATUS         SHADOW
```

## 15. The actual graph

```text
                    ┌──────────────── /between/chat ────────────────┐
                    │  generateMaiaTurn                             │
                    │    facetDecision (posture, integrity, handoff)│──► DROPPED at boundary
                    │    MemoryBundle (ranked)                      │──► FAST only
                    │    retrieveForMode (mode-filtered)            │──┐
                    │    throughline / stakes / depthConfig         │──┤
                    │    12 Spiralogic+context addenda              │──┤
                    └───────────────────────────────────────────────┘  │
                                                                       ▼
  /list ──► ~20 server-produced addenda ─────────────────────────► getMaiaResponse()
                                                                       │
                                              enforceFieldSafety ──────┤ (may refuse turn)
                                              Mythic Atlas ────────────┤► log
                                              routerResult ────────────┤ FAST | CORE | DEEP
                                                                       │
        ┌──────────────────────────────────────────────────────────────┤
        ▼                          ▼                                   ▼
   FAST template literal      CORE ADDENDA_SPECS loop            DEEP 3 stages
   ~32 fields, presence       27 fields, presence                 1 no addenda
   + ElementalOracle ► log      + ElementalOracle ► log            2 seven-field subset
   + talkModeField ► DISCARDED  + I Ching ► log                    3 full set, on failure
        │                          │                                   │
        └──────────────────────────┴───────────────────────────────────┘
                                   ▼
                                 model
```

Contributor labels:

| | ACTIVE | CONDITIONAL | CONTEXT-ONLY | SHADOW | DORMANT | SEPARATE-SURFACE |
|---|---|---|---|---|---|---|
| | memory atoms, conversational recall, episodic recall, divination, relational memory, member web, knowledge gate, practice field, astrology, Wu Xing, place | developmental (FAST only), ranked memory bundle (FAST only), DEEP full addenda (on validation failure) | every one of the ACTIVE column — none is adjudicated at the composition seam | Mythic Atlas, ElementalOracle / Corpus Callosum, I Ching, `representations*` telemetry | somatic, dreams, deliberation hook, `talkModeFieldIntelligence` (discarded), 3 dead fields | Resonant/Unified Field, Conductor, Bridge D spiral persistence |

**UNRESOLVED:** the Corpus Callosum path on `/between` (§14); whether any client actually
supplies the 12 `/between`-only fields to `/list` via the meta spread.

## 16. Runtime confirmation

**None obtained. Everything in Parts 1 and 2 is SOURCE ONLY at `d5741ce6c`.**

This session has no production access: no `ssh`, no `DATABASE_URL`, the LAN is unreachable.
The authorized runtime channels — `[MAIA] context-inventory`, `[MAIA/sovereign] *-block`,
`[MAIA/shadow]`, `agent_runs` — can each attest part of this map without content inspection,
data mutation, synthetic member activity or new instrumentation, and none of them was read.

```text
EVERY STATUS IN §14 AND §15   UNWITNESSED
```

Source truth does not become runtime truth by confidence. The findings most worth a runtime
check, in order: (1) that `facetDecision` is absent from every `/list` and `/between` turn's
effect — observable as its absence from any prompt-side log; (2) `availableButNotComposed`
non-empty on CORE/DEEP turns, which the existing inventory line already emits; (3) DEEP
stage-2 vs stage-3 frequency, observable from the existing `deep-consultation recall-addenda`
line.

## 17. Gate 3 packet — refreshed

Part 2 changes the option set, because the answer to the required finding was yes.

**A · Build a discernment seam from scratch.** Now clearly wasteful in part: `FacetDecisionLoop`
already computes posture, integrity risk, regulation and handoff, and `MemoryBundleService`
already ranks. A from-scratch seam would rebuild what exists.

**B · Attribution on the existing accumulation.** Confirmed by both parts as unable to reach
the completion state. Retained only as a possible *interim* step, never as an end state.

**C · Consolidate `/list`'s compositions to one mechanism, then attribute.** Still coherent,
and now measurably larger than Part 1 implied: not three memberships but five (FAST, CORE,
DEEP×3).

**D · Converge on the existing seam — extract `FacetDecisionLoop` + ranked bundle to the
shared convergence point.** Newly available on Part 2's evidence. `getMaiaResponse` is
already the single convergence point for both live surfaces. The work is not to invent
discernment but to (i) make `getMaiaResponse` *read* the decision packet it is already
handed, and (ii) give `/list` a producer for it. This is the smallest change with the
largest architectural yield, and it is the only option that makes the existing Spiralogic
governor participate rather than be recomputed.

**Not adjudicated here.** The census's own reading is that D dominates A, and that D and C
are complementary rather than exclusive — but Gate 3 is the founder's, and Part 2 ends
without choosing.

## 18. Status

```text
PART 1    ACCEPTED · amended in place (5 corrections: 2 founder-directed wording,
          1 founder-directed count with a different verified split, 2 errors Part 2
          exposed — the DEEP row and the /between convergence claim)
PART 2    COMPLETE — DEEP interior · /between spine · required finding answered ·
          5 domain evidence tables · reconciled graph · refreshed Gate 3 packet
GATE 2    MET on source. NOT MET on runtime — every status is UNWITNESSED.
GATE 3    packet ready for adjudication
P6        CLOSED
REPAIRS   none made
```

The comforting assumption is falsified twice over. MAIA's intelligences do not converge
merely because they exist — and where the architecture *does* converge, at
`getMaiaResponse()`, the richest orientation object in the system arrives and is not read.
