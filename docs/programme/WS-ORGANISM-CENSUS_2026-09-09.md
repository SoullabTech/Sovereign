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
