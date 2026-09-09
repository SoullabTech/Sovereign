# PFI-REPRESENTATION — CONSUMER CENSUS (step 1, read-only)

> ⭐⭐ **If a number contains no information beyond a boolean, the boolean is the knowledge and the
> number is presentation.**

**Authorized: census every consumer of the eight questionable numeric fields BEFORE changing their
type.** ⛔ *No guessing from imports or interfaces — that lesson was just learned with the router.*
Every row below was established by tracing values that actually flow from `generatePFIMindState()`.

## 1 · ⚠️ RAW NAME COUNTS ARE MISLEADING — and that is the first finding

```text
elementalBalance  590 hits      coherenceLevel  260 hits      autonomyRatio  51 hits
```

**Almost none are PFI.** `elementalBalance` belongs to `CollectiveConsciousnessBridge` and
`elementalOperators`, entirely different objects that share the name. **A name-based census would
have reported a vast blast radius and been wrong by two orders of magnitude.**

## 2 · The actual consumers

Only **two** sites read a `PFIMindState` value, plus one console line:

```text
lib/field/fieldOrchestrator.ts:265-274   → ctx.pfi → JSON.stringify → the PROMPT
lib/sovereign/pfiMindEntrypoint.ts:60-79 logPFITelemetry() → console
lib/sovereign/maiaService.ts:2856        console.log(source, realm, autonomyRatio)
```

| Field | Consumers | Class |
|---|---|---|
| `elementalDominance` | orchestrator → prompt | **COGNITIVE** |
| `fieldWorkSafe` | orchestrator → prompt · telemetry | **COGNITIVE + TELEMETRY** |
| `realm` | orchestrator → prompt · telemetry · console | **COGNITIVE + TELEMETRY** |
| `deepWorkRecommended` | orchestrator → prompt | **COGNITIVE** |
| `coherenceLevel` | orchestrator → prompt as `coherence:` · telemetry | 🔴 **COGNITIVE + TELEMETRY** |
| `reactivityIndex` | telemetry only | **TELEMETRY ONLY** |
| `autonomyRatio` | telemetry · console | **TELEMETRY ONLY** |
| `elementalBalance` | — | ⭐ **UNUSED** |
| `resonanceIndex` | — | ⭐ **UNUSED** |
| `integrationReadiness` | — | ⭐ **UNUSED** |
| `integrationCoverage` | — | ⭐ **UNUSED** |
| `signalQuality` | — | ⭐ **UNUSED** |

## 3 · ⭐⭐ WHAT THE CENSUS CHANGES ABOUT THE PLAN

**(a) FIVE OF THE EIGHT HAVE ZERO CONSUMERS.** `elementalBalance` (0.6), `resonanceIndex` (0.5),
`integrationReadiness`, `integrationCoverage` (0.2/0.8) and `signalQuality` (0.7/0.75) are
**constructed on every turn, typed as required, and read by nothing.** They exist only because the
type demands them. **Removal is deletion, not migration.**

**(b) ⭐ THERE IS NO OPERATIONAL / TONE / TIMING CONSUMER AT ALL.** The ruling provisioned for *"if
some existing response-shaping code genuinely needs `fieldWorkSafe true → 0.7`"* via a
`legacyPfiTuning()` compatibility adapter. **The census finds no such code.** ⛔ **No adapter is
needed, and building one would create the compatibility surface it was meant to preserve.**

**(c) ONLY ONE ALIAS REACHES COGNITION.** `coherence: pfiState.coherenceLevel` at
`fieldOrchestrator:271` — a two-valued recoding of `fieldWorkSafe`, serialized into
`[Field Intelligence]`. ⭐ **Removing that one line removes every numeric alias from the prompt.**
`reactivityIndex` and `integrationReadiness` never reach cognition at all.

**(d) TELEMETRY IS THE ONLY REAL MIGRATION.** `PFITelemetryRecord` requires
`autonomyRatio`, `coherenceLevel` and `reactivityIndex` as `number`. Per the ruling, telemetry
**reports the true variable**: `fieldWorkSafe` and `deepWorkRecommended` with their **basis**
(profile-derived vs conservative-policy-default), not boolean recodings named coherence and
reactivity.

## 4 · The structural defect underneath

`PFIMindState` **requires** seven numbers, so even `buildFallbackMindState()` — which knows
nothing — must populate them. ⭐ **The type compels fabrication.** That is why the same defect kept
reappearing at every layer: *the shape demanded a value where the system had none.*

## 5 · Standing

```text
✅ census complete, by tracing values rather than names
⛔ nothing changed · no field removed · no type altered · no adapter built
⛔ pfi_full still claims achieved integration
⛔ producer names not drawn · no room cutover
```

**Falsifier for the implementation pass:** ⭐⭐ *No number may appear in canonical PFI cognition
unless changing that number could reflect a change in EVIDENCE rather than merely a change in a
hard-coded mapping.*
