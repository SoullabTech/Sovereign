# WS-ORGANISM — WHOLE-ORGANISM FIELD CENSUS

**Read-only. 2026-09-09. Authorized by founder ruling under the ten-point migration rule.**

> ⭐⭐ **The whole organism may know. The room decides what may speak.**

⛔ **NO PRODUCER IS NAMED IN THIS DOCUMENT.** Provenance is established first; names come after.
⛔ **NOTHING IS CHANGED.** No room cut over, no addendum removed, no engine touched.

---

## 0 · The seam, as it actually is

`lib/field/fieldOrchestrator.ts` (391 lines) does **two jobs**, and the ruling separates them:

```text
1  COMPUTE / GATHER   what do PFI, Resonance, Unified actually know this turn?   → the organism
2  PARTICIPATE        put that material into MAIA's prompt                       → canonical turn
```

**Evidence for job 2, verbatim (`:383-390`):**

```ts
export function formatFieldAddendum(field: FieldContext | null): string {
  ...
  const json = JSON.stringify(field);
  return `\n\n[Field Intelligence]\n${json}`;
}
```

Called at `lib/sovereign/maiaService.ts:1491` and `:1919` as
`baseSystemPrompt += formatFieldAddendum(fieldContext)` / `adaptivePrompt += …`.

🔴 **The compute layer grants itself participation by string concatenation, entirely outside the
producer registry.** The whole `FieldContext` — `meta` included — is serialized to JSON and appended.
There is no room check, no authority axis, no consent basis, no partition.

> ⭐ **Field engines may produce knowledge. They may not decide for themselves whether that knowledge
> enters an encounter.**

**Depth gates (`:163-164`):** `pfi` always · `resonance: depth >= 3` · `unified: depth >= 4`.
**Sanctuary (`:170-179`):** returns meta only, no signals. ✅ correct today.

---

## 1 · ELEMENTAL INTELLIGENCE — ⚠️ not in this seam at all

`ElementalOracleBridge` is invoked **separately** in `maiaService.ts:844-852`
(`processAll({ includeAll: true })`), **not** through `fieldOrchestrator`.

⚠️ **The census's first finding is that "the field seam" is not one seam.** There are **two**
independent paths from organism to prompt, and the ruling's diagram assumed one. Elemental must be
censused on its own terms before it can be grouped with the other three.

| | |
|---|---|
| SOURCE | `lib/bridges/elemental-oracle-bridge` |
| OBSERVATION | the current turn's text (pattern classification) |
| TRANSFORMATION | classification — needs its own reading before `observed / computed / inferred` is asserted |
| AVAILABILITY | ⛔ **NOT ESTABLISHED — do not assume `actual` because it runs on real text** |
| AUTHORITY | ⛔ not established |
| MEMBER-ABOUT | ⚠️ **likely yes** — an elemental reading is a claim about the person |
| ROOM RELEVANCE | ⛔ undecided |

⛔ **Owed: a separate census pass. It is not covered by anything below.**

---

## 2 · PFI — the one leg with a real observation base

| | |
|---|---|
| SOURCE | `generatePFIMindState` (`lib/sovereign/pfiMindEntrypoint.ts:94`) |
| OBSERVATION | member id · session id · current text · conversation history · cognitive profile · element · facet · archetype · bloom level — **all real inputs** |
| TRANSFORMATION | **inferred** — panconscious field routing over a profile |
| AVAILABILITY | **`actual`** when the engine returns; **`unavailable`** when it throws (failure is caught and non-fatal, `:222`) |
| AUTHORITY | **`infer`** — `elementalDominance`, `coherenceLevel`, `realm`, `deepWorkRecommended` are readings, not measurements |
| MEMBER-ABOUT | ⭐ **YES** — every one of its five outputs is a claim about the member |
| ROOM RELEVANCE | ⛔ undecided. Under WS-ROOM-02 an inferring, member-about signal is **not** ambient continuity |

---

## 3 · RESONANCE FIELD — mostly actual, with one laundered value

| | |
|---|---|
| SOURCE | `ResonanceFieldGenerator.generateField` (`:236`) |
| OBSERVATION | **the current text**, plus `exchangeCount` |
| TRANSFORMATION | computed from text |
| AUTHORITY | **`compute`** for the text-derived signals |
| MEMBER-ABOUT | text-shape signals: **no**. Intimacy: **yes** |

```text
resonance.elements            DERIVED   from the current text
resonance.wordDensity         ACTUAL    measured on the current text
resonance.silenceProbability  DERIVED   from the current text
resonance.fragmentationRate   DERIVED   from the current text
```

🔴 **`intimacyLevel = Math.min(1, exchangeCount / 30)` (`:234`).** Intimacy is a **pure function of
turn count**. Nothing observed it; nobody consented to it; it rises whether the exchange deepened or
went badly.

> ⭐⭐ **This is the exact pattern WS-ROOM-02 excluded `retrieved.relationship_memory` for — encounter
> frequency laundered into relational truth — and here it is live, unguarded, and feeding a
> generator whose output is appended to the prompt.**

⚠️ Also `userWeather: ''` and `userState: ''` are passed as **empty strings, not absences**
(`:237-240`) — the engine cannot distinguish "no weather" from "weather unknown".

---

## 4 · UNIFIED FIELD — 🔴 the one that must not be called full

`:262-263` says it in its own words: *"The real UEFC expects 50+ system outputs — we provide what's
available so the calculator returns meaningful (if partial) results."*

**Item-level census of what is handed to the calculator (`:264-318`):**

| Input | Availability | Basis |
|---|---|---|
| `fieldIntelligence.sacredThreshold` | **derived** | `pfi.fieldWorkSafe ? 0.3 : 0.1` |
| `fieldIntelligence.relationalField.soulEmergence` | **derived** | `pfi.deepWorkRecommended ? 0.7 : 0.2` |
| `unifiedIntelligence.elementalPrescription.*` | **derived** | one-hot `0.8 / 0.2` from the PFI element |
| `affectDetector.archetypalRouting` | **derived** | `ctx.pfi?.element` |
| `relationalField.emotionalVelocity` | 🔴 **unavailable → `0.5`** | nothing observes emotional velocity |
| `voiceAnalyzer.consciousnessIndicators` (×3) | 🔴 **unavailable → `0.5`** | **no voice observation exists in a typed encounter** |
| `voiceAnalyzer.prosodyMetrics.spectralCentroid` | 🔴 **unavailable → `0`** | same |
| `somaticResponse.windowOfTolerance` | 🔴 **unavailable → `0.5`** | no lawful somatic source |
| `healthData.overallVitality` | 🔴 **unavailable → `0.5`** | no health signal |
| `circadianOptimizer.circadianPhase` | 🔴 **unavailable → `0.5`** | not computed |
| `fascialField.*` (×2) | 🔴 **unavailable → `0.5`** | no source |
| `cognitiveLightCone.goalCoherence` | 🔴 **unavailable → `0.5`** | no source |
| `realTimeMonitor.presenceQuality` / `sacredResonance` | 🔴 **unavailable → `0.5` / `0.3`** | no source |
| `collectiveIntelligence.fieldCoherence.overallCoherence` | 🔴 **unavailable → `0`** | no live collective-field observation |
| `masterConsciousness.unifiedFieldStrength` | 🔴 **unavailable → `0`** | no source |
| `advancedConsciousnessDetection.fieldQuality` | 🔴 **unavailable → `'normal'`** | ⚠️ **a fabricated categorical** |
| `consciousnessLevelDetector.coherenceTrend` | 🔴 **unavailable → `'stable'`** | ⚠️ **a fabricated categorical** |
| ~12 further stubs | 🔴 **unavailable → `0`** | `bioelectricDialogue`, `therapeuticStressMonitor`, `conversationPatternAnalyzer`, `resonanceField.emotionalTone`, `symbolExtraction`, `wisdomSynthesis`, `archetypalFieldResonance`, `realTimeMonitoring`, `morphoresonantField`, `patternRecognition`, `consciousnessEmergencePredictor`, `frameworkConvergence: []` |

**Roughly 4 derived inputs and 24+ fabricated ones.** The calculator's outputs —
`elementPressure`, `dominantElement`, `coherenceLevel`, `interference` — are then appended to the
prompt **with no marking whatsoever**.

### 4.1 🔴 THE WORST FINDING — a fabricated element, not merely a neutral number

```ts
const pfiElement = ctx.pfi?.element?.toLowerCase() ?? 'earth';   // :266
affectDetector: { archetypalRouting: ctx.pfi?.element ?? 'Earth' }, // :285
```

**PFI failure is caught and non-fatal** (`:222`) — the run continues with `ctx.pfi` undefined.
**Unified's gate is `depth >= 4`, independent of whether PFI succeeded.** So when PFI fails at turn
4+:

```text
PFI fails  →  logged, swallowed
           →  Unified still runs
           →  pfiElement defaults to 'earth'
           →  elementalPrescription is one-hot EARTH
           →  healthSummary.dominantElement is computed from that
           →  "[Field Intelligence] … dominantElement: earth" enters MAIA's prompt
```

> ⭐⭐ **A `0.5` is a fabricated magnitude. `?? 'earth'` is a fabricated IDENTITY — the system names
> an element for the member that nothing observed, and it is indistinguishable in the prompt from one
> that was.** This is F-ABSENCE with a name attached, and it is strictly worse than the placeholder
> numbers the ruling anticipated.

⚠️ **Frequency unknown.** Nothing counts PFI failures; the `console.warn` is not aggregated. **How
often production has spoken a defaulted element is unmeasured, and this census does not claim it is
rare.**

---

## 5 · What the census establishes

1. ⭐ **There are TWO organism→prompt paths, not one** — `fieldOrchestrator` and the Elemental Oracle
   bridge. Closing one does not close the other.
2. ⭐ **Availability is genuinely item-level.** In a single bundle, `wordDensity` is measured from
   the current text while `windowOfTolerance` is invented — *"Unified Field: partial"* is not a
   usable statement about either.
3. 🔴 **Two fabrication kinds, not one:** neutral magnitudes (`0`, `0.5`) **and** fabricated
   categoricals (`'normal'`, `'stable'`, `'earth'`). The second kind reads as an observation in
   prose and is the more dangerous.
4. 🔴 **`intimacyLevel = turns/30`** is the laundering pattern WS-ROOM-02 already ruled against,
   live in a different subsystem.
5. ⛔ **No producer can be named yet.** Unified alone spans derived-from-PFI, measured-from-text and
   pure-fabrication in one object — *"the census may discover that one of those must become several
   producers"* is not hypothetical here; it is already true.

## 6 · Built alongside — the axis only

`lib/field/signalAvailability.ts`: `SignalAvailability = 'actual' | 'derived' | 'unavailable'`,
item-level `FieldSignal` carrying `id`, `availability`, optional `value` and a required `basis`, with
`forCognition()` / `forReceipt()`.

⭐ **An `unavailable` signal has no `value` field at all** — not `null`, not `0`. The type makes the
fabrication unrepresentable rather than merely discouraged.

⛔ **Nothing is wired to it.** It is the vocabulary the census needs, not a change to any path.

## 7 · Standing

```text
✅ census run for PFI · Resonance · Unified          ⛔ Elemental census OWED (separate path)
✅ ACTUAL/DERIVED/UNAVAILABLE axis added             ⛔ no producer named
⛔ no room cut over    ⛔ no shadow built    ⛔ formatFieldAddendum untouched
⛔ existing rooms unchanged — Writer's Studio did not rewrite any other MAIA encounter
```

---

# 8 · FIELD-TRUTH-01 — the fabricated elemental identity is contained

**Founder ruling 2026-09-09: this is a live defect in every existing room, not something to carry
forward. Fixed now, in its own lane.**

> ⭐⭐ **When a prerequisite is absent, downstream intelligence becomes UNAVAILABLE — not generic.
> Absence of an elemental reading is not Earth.**

**The repair, conservatively scoped:**

```text
PFI succeeds       → Unified runs its current PARTIAL path (remaining fabricated inputs still owed)
PFI fails/absent   → Unified DOES NOT RUN
                   → unified = UNAVAILABLE, basis "PFI prerequisite unavailable"
                   → the absence is counted and logged
```

`ctx.pfi?.element?.toLowerCase() ?? 'earth'` and `ctx.pfi?.element ?? 'Earth'` are **gone**. ⛔ No
fallback element, and no `'unknown'` masquerading as a real enum value either — the leg does not run.

⭐ **The absence is recorded on `FieldContext.unavailability`, and `formatFieldAddendum()` strips it
before serializing.** Handing MAIA *"somatic tolerance: unavailable"* would turn an absence into
subject matter. So the record is receipt evidence only — and because the field is stripped, **this
change adds nothing whatsoever to any existing room's prompt.**

⭐ **PFI failures are now counted** (`getFieldTruthCounters()`, plus a stable `[field-truth]` log
marker). The census could not say how often production had spoken a defaulted element because
nothing counted; that is no longer true going forward. ⚠️ **It says nothing retrospectively.**

**Witness — `lib/field/__tests__/fieldTruth01.test.ts` · 13 passed.** Including: Unified is never
invoked when PFI failed · no `dominantElement` appears anywhere in the context · the absence is
recorded with its reason · `unified` is absent from `meta.sources` · both counters increment ·
Resonance is unaffected · the addendum contains no trace of the absence · with PFI present the
prescription derives from the **observed** element and the existing partial path is unchanged ·
Sanctuary stays meta-only.

⛔ **Deliberately NOT done, and pinned by a test so removing them stays a visible decision:** the
remaining fabricated Unified inputs (`windowOfTolerance: 0.5`, `unifiedFieldStrength: 0`,
`fieldQuality: 'normal'`, `coherenceTrend: 'stable'`) are **still there**. ⛔ Also untouched: the
turn-count intimacy defect · Elemental Oracle · producer registration · room cutover · any broader
Unified rewrite.

---

# 9 · ELEMENTAL INTELLIGENCE — census pass (read-only)

**Founder ruling: same whole-organism lane, separate pass. Do not fold into PFI; do not call it
`actual` merely because it reads real text.** ⛔ **Elemental Oracle changes were explicitly NOT
authorized under FIELD-TRUTH-01, so nothing below is repaired.**

## 9.1 🔴 THE TOPOLOGY IS NOT FOUR INDEPENDENT LEGS

The census's §1 said Elemental reaches cognition by a second seam. Reading the call sites shows
something stronger: **Elemental is upstream of the other three.**

```text
Elemental Oracle  (maiaService.ts:850, fastMode)
        │  .dominant
        ▼
(meta as any).elementalResult                        ← the untyped channel CMT-01 exists to close
        │
        ▼  maiaService.ts:1914
buildFieldContext({ element: elementalResult?.dominant ?? (meta as any)?.element })
        │
        ▼
PFI  routePanconsciousField({ element, ... })  →  elementalDominance
        │
        ▼
Unified  one-hot elementalPrescription from the PFI element  →  dominantElement
        │
        ▼
[Field Intelligence] { … } appended to the prompt
```

⭐⭐ **One classification of the current text becomes three apparently independent corroborating
signals by the time it reaches cognition.** PFI's `elementalDominance` and Unified's
`dominantElement` are not second and third opinions; they are the same reading, re-emitted with more
authority at each hop and marked nowhere.

⚠️ It also **transits `(meta as any)`** — so the value crossing from Elemental into the field chain
does so through exactly the untyped channel this programme has been closing.

## 9.2 · The census, per the ruling's schema

| | |
|---|---|
| SOURCE | `ElementalOracleBridge.processAll` (`lib/bridges/elemental-oracle-bridge.ts`) |
| INPUT ACTUALLY OBSERVED | the current turn's text **only** — no memory, no profile, no history |
| TRANSFORMATION (fast) | **regex keyword counting.** Per element a keyword list is matched; `score = matches.length`; `intensity = min(1, score/5)` |
| TRANSFORMATION (full) | parallel per-element processing via the AI bridge, then `findDominantElement` by intensity |
| OUTPUT SEMANTICS | `dominant` (an element name) · `elements[].intensity` · `archetype` · matched keywords as "symbols" · `synthesis` |
| MEMBER-ABOUT | ⭐ **YES.** *"Fire resonance detected"* with an archetype attached is a claim about the person, not about the text |
| AVAILABILITY | **fast: `derived`** — from keyword counts on one turn. ⛔ **NOT `actual`**; nothing observes an element, a lexical proxy is counted |
| AUTHORITY | ⭐ **`infer`.** A keyword tally is `compute`; **naming the member's dominant element from it is inference**, and the axes must not be collapsed |
| ROOM RELEVANCE | ⛔ **not admissible to Writer's Studio as constituted** — inferring, member-about, and single-turn. Under WS-ROOM-02 it is at best **invited**, never ambient |

## 9.3 🔴 THE SAME FABRICATED EARTH, ON THE NORMAL PATH

`elemental-oracle-bridge.ts:376`:

```ts
let dominantElement = 'earth'; // Default
...
if (score > maxScore) { maxScore = score; dominantElement = element; }
```

`maxScore` starts at `0`. **If no keyword matches — no `anger|passion|burn`, no `fear|shame|hide` —
no branch is ever taken and `dominant` is returned as `'earth'`.**

> ⭐⭐ **FIELD-TRUTH-01 closed the FAILURE route to a fabricated Earth. This is the SUCCESS route to
> the same fabrication, and it fires far more often — it is the ORDINARY path for any text that does
> not happen to contain those words.** For a manuscript passage about writing, zero matches is the
> expected case.

⚠️ **And the two code paths disagree about absence.** `findDominantElement` (`:732`), used by the
full path, returns **`''`** when nothing dominates — an honest empty. The fast path returns
**`'earth'`**. **Same question, two answers, neither marked**, and the fabricating one is the one the
FAST tier uses.

⚠️ `elementalResult?.dominant ?? (meta as any)?.element` (`:1914`) uses **nullish** coalescing, so an
honest `''` from the full path **passes through as an element** rather than falling back. ⛔ Not
repaired; recorded.

## 9.4 · What this census establishes

1. ⛔ **Elemental cannot be named as a producer yet** — and now for a stronger reason than "provenance
   unestablished": **its output is not independent of PFI's or Unified's.** Registering three
   producers would represent one signal as three.
2. ⭐ **`derived` and `infer`, not `actual`** — the ruling's warning was correct and specific.
3. 🔴 **A second live fabricated-identity defect exists, of the same class the founder just ruled
   must be fixed, on a hotter path.** ⛔ **Repair NOT authorized here** (FIELD-TRUTH-01 excluded
   Elemental Oracle changes). **Recommended as `FIELD-TRUTH-02`**, its own bounded lane:
   remove the `'earth'` default, reconcile the two paths' absence semantics on the honest one, and
   fix the nullish-vs-falsy hand-off at the call site — nothing else.
4. ⚠️ **The `(meta as any)` transit is a third finding** and belongs to the CMT-01 lane, not this one.

**Standing:** Elemental census COMPLETE (read-only) · no producer named · nothing repaired ·
`FIELD-TRUTH-02` recommended and **not** opened · every existing room unchanged.

---

# 10 · FIELD-TRUTH-02 — honest elemental absence

> ⭐⭐ **No evidence of an element is not evidence of Earth.**

**Authorized and closed 2026-09-09.** `10` tests · `lib/bridges/__tests__/fieldTruth02.test.ts`.

| | Before | After |
|---|---|---|
| FAST, zero matches | `'earth'` | **absent** (`undefined`) + `dominantAbsentReason: 'no_elemental_signal'` |
| FULL, no dominance | `''` | **absent** (`undefined`) — same semantics as FAST |
| Handoff `?? meta.element` | `''` is not nullish → **sentinel forwarded as an element** | `undefined` falls through correctly |
| Outcomes | indistinguishable in logs | **three counted**: engine failure · success/no signal · success/signal |

⭐ **`undefined`, not `''`.** An empty string is more honest than *"earth"* but it is still a
value-shaped sentinel — and the `??` at the call site treated it as a real answer. **Absence must not
need to masquerade as data.** The type now permits no value at all.

⛔ **The meta-route fallback stays as existing behaviour, and is annotated at the call site as a
DIFFERENT SOURCE.** Nothing presents it as an Elemental Oracle reading. **The untyped transit itself
remains CMT-01 debt, unrepaired.**

⛔ **Untouched, as ruled:** keyword vocabulary · thresholds · PFI · Unified beyond respecting absence
· `(meta as any)` · producer registration · room cutover.

## 10.1 ⚠️ FOUND WHILE WRITING THE WITNESS — base-form-only vocabularies

`/\banger|rage|…|burn\b/` matches **base forms only**. **"burned" does not match "burn"; "raging"
does not match "rage".** An unmistakably fiery passage — *"The forest burned for three days, raging
through the pines"* — scores **zero** and now correctly returns absent.

⛔ **NOT repaired** (vocabulary changes are explicitly out of scope). ⭐ **Recorded because it bears
directly on how often "no signal" actually fires** — and therefore on how often the old code was
returning a fabricated Earth. **The rate is higher than the keyword lists suggest.**

⚠️ **Three of the witness's own probes failed on first run** because the prose contained keywords
(*"I think"* → air; *"structure"* / *"whole"* → earth / aether). Instrument faults, verified as such
before any product change — the standing rule.

---

# 11 · ⭐⭐ TWO LAWS FROM THE LINEAGE FINDING

## 11.1 · DERIVATION DOES NOT CREATE CORROBORATION

> **Two outputs are independent evidence only to the degree that their evidentiary ancestry is
> independent.**

The mental model of *"four intelligences corroborating one another"* is **disproved**. The actual
graph carries lineage: current text → Elemental lexical classification → PFI routing → Unified
transformation. **One ancestral signal emerges three times looking like consensus.**

⭐ *Three modules saying "Earth" is not three votes if all three got Earth from the same keyword
classifier.*

**Consequence, binding on producer design:**

> ⭐⭐ **A producer represents one coherent epistemic LINEAGE, not one software MODULE.**

⛔ **The SIGNAL-LINEAGE CENSUS is owed before any whole-organism producer is named**, at
**output-field level**, because one subsystem may mix ancestries:

```text
ORIGIN         what observation first generated this signal?
DERIVED FROM   which earlier signal(s) does this output depend on?
NEW EVIDENCE   what additional independent observation entered here?
TRANSFORMATION what did this subsystem actually add?
CLAIM          what does the resulting value claim?
INDEPENDENCE   independent / partly independent / derivative-only
```

## 11.2 · THE WORK IS NEVER IMPLICITLY EVIDENCE ABOUT THE WRITER

> ⭐⭐ **The Work may be evidence about the Work without becoming evidence about the writer.**

The elemental sibling of *"the Work is never implicitly instruction"*, and possibly the most
important Writer's Studio boundary yet.

```text
⛔ WRONG AMBIENT MOVE    manuscript language → elemental state of the WRITER
✅ LAWFUL WRITERLY MOVE  manuscript language → elemental qualities, movement,
                         balance OF THE WORK
✅ INVITED               the writer asks "what does this reveal about where I am?"
                         → member-about elemental inquiry becomes invited
```

⭐ **The intelligence stays. The referent changes.** *"The forest burned for three days"* must not
become *"Kelly is in Fire."*

⚠️ **This is not repaired and cannot be repaired by FIELD-TRUTH-02**, which only stopped the
fabrication — it did not change what a reading is *about*. A test pins that distinction so it stays
visible.

---

# 12 · SEQUENCE

```text
1 ✅ FIELD-TRUTH-01   fabricated Earth on PFI failure                     CLOSED
2 ✅ FIELD-TRUTH-02   fabricated Earth on the ordinary Elemental path     CLOSED
3 ⛔ SIGNAL-LINEAGE CENSUS   Elemental → PFI → Unified, output by output
4 ⛔ RESONANCE-TRUTH         turn-count "intimacy"; empty-string userWeather/userState
5 ⛔ UNIFIED-TRUTH           remaining invented measurements and categoricals
6 ⛔ WRITER REFERENT RULING  Work-about vs member-about
7 ⛔ ONLY THEN               canonical producer boundaries
```
