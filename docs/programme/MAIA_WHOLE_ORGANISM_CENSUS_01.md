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
| DEEP | `buildMaiaComprehensivePrompt` → `buildComprehensiveVoicePrompt` | does **not** iterate `MaiaContext` addenda | `maiaService.ts:~2405` |

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

**The only test applied to any contribution is whether its string is non-empty.** Nothing
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

### 5.3 Thirteen prompt-bearing fields the authoritative route never produces

Of the ~32 fields read by the prompt builders, the following are **never assigned by
`/list`**. They can only arrive through the client `...meta` rest-spread:

```text
relationshipModeAddendum      governorAddendum            guestContextAddendum
journalContextAddendum        captureContextAddendum      astrologicalContextAddendum
spiralSnapshotAddendum        bridgeSnapshotAddendum      therapeuticFrameworkAddendum
reflectionLensAddendum        epistemicPathAddendum       maiaModeAddendum
scribeSessionDiscussionAddendum   consultationAddendum    fieldWisdomAddendum
```

Tracing their producers repository-wide returns a single answer for most of them:
**`app/api/between/chat/route.ts`** — the intentional live *secondary* surface. Two
(`consultationAddendum`, `maiaModeAddendum`) have no producer on either route.

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
context block. The element MAIA "senses" is calculated up to five times per turn by five
different engines, reconciled zero times, and permitted to influence the response once.

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

The two live surfaces are close to complementary: `/list` is memory-rich and
Spiralogic-absent; `/between` is Spiralogic-rich and memory-thin. Any future claim of "one
unified cognition seam" built only against `/list` would leave the surface that actually
carries elemental orientation outside the map.

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

None of these were touched.

## 10. Gate 3 adjudication packet — integration shape

The census answers the shape question. It does not choose what to do about it. Three
options are put forward, unranked, for founder adjudication:

**A · Discernment seam first.** Build a single adjudicating composition point that all tiers
pass through, with relevance and conflict resolution, before attribution is wired. P6
attribution then lands on one seam. Largest change; makes "unified cognition" true rather
than described.

**B · Attribution on the existing accumulation.** Wire provenance framing into the three
existing mechanisms as they stand. Smaller, reversible, and honest about what it is — but it
attaches truthful labels to a pile, which is precisely the risk named at lane open: solving
provenance and shipping a very sophisticated memory-fed chatbot.

**C · Consolidate to one mechanism, then attribute.** Collapse FAST/CORE/DEEP onto a single
composition mechanism (no discernment yet, one membership), then apply the attribution
kernel. Splits the work: makes one seam exist before deciding what it should be able to
refuse.

The census's own reading is that **B alone cannot satisfy the Unified Intelligence
Invariant**, because there is no unified path for memory to participate in — but that is an
observation for adjudication, not a decision taken here.

## 11. Status

```text
PART 1  spine · composition rule · elemental question · discernment question ·
        /between differential · defect register                          COMPLETE

REMAINING FOR PART 2 (not yet traced)
  · per-intelligence 14-field evidence tables for relational, developmental,
    somatic-affective, Resonant Field / Unified Field, symbolic beyond divination
  · DEEP tier interior (buildComprehensiveVoicePrompt membership)
  · runtime confirmation of the source-only findings above
  · Corpus Callosum participation on /between

EVIDENCE CLASS OF EVERYTHING ABOVE
  SOURCE ONLY, at d5741ce6c. No runtime probe. No production access from this session.
  No lived witness. Nothing here is a runtime claim.
```

The stop condition — one evidence-backed graph from the live member turn to the model
response with every major contributor truthfully labeled — is met for the spine (§7) and
not yet met for the full domain set.

Per the lane's own terms: *if the answer turns out to be "there is no unified cognition seam
today; there are several smart systems accumulating context before the model," that is a
successful census result.* That is the answer.
