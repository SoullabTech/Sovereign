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

---

# 6 · IMPLEMENTATION ✅ CLOSED

> ⭐⭐ **Do not preserve the intention of a future signal by requiring the present system to have a
> place to lie about it.**

## 6.1 · Telemetry preflight — deterministic

```text
rg 'PFI_TELEMETRY|PFITelemetryRecord|logPFITelemetry' . --glob '!node_modules/**' …
→ the type · the emitter · four call sites · one test · this census. NO PARSER.
```

**Ruling therefore: change the shape directly.** Not versioned, not dual-emitted.

## 6.2 · The state now

```text
elementalDominance?    derived copy of a real upstream signal, absent otherwise
fieldWorkSafe          routing DECISION
realm                  routing DECISION
deepWorkRecommended    routing DECISION
routingBasis           profile_derived | conservative_policy_default
source                 routing_only | fallback
```

⭐ **`source` and `routingBasis` are kept distinct** — *source* is what generated the state, *basis*
is what the routing rested on. The code did not prove them identical, so they were not merged.

**Deleted:** `elementalBalance` · `resonanceIndex` · `integrationReadiness` · `integrationCoverage` ·
`signalQuality` · `coherenceLevel` · `reactivityIndex` · `autonomyRatio` · the `pfi_full` identity.
⛔ **None kept as optional.** `pfi_legacy` → **`routing_only`**, which is what it is.

⭐ **`coherenceLevel` did not become a boolean named coherence. The false CONCEPT disappeared;
`fieldWorkSafe` remains because that is what the system decided.** Repairing the number while keeping
the name would have preserved the semantic inflation.

## 6.3 🔴 THREE CONSUMERS THE CENSUS MISSED

⚠️ **My census traced `pfiState.*` and stopped there. It did not follow the DERIVED context, and all
three misses were downstream of it.** The method was right; my application of it was one hop short.

| Missed consumer | What it was doing |
|---|---|
| `fieldOrchestratorTelemetry.ts:61` | wrote `ctx.pfi.coherence` — the `0.7/0.4` alias — into a **persisted database column** `pfi_coherence`, every turn |
| `app/api/sovereign/app/maia/list/route.ts:1816` | 🔴 set an **outbound canon provenance header** to `'pfi_full'` when `processingProfile === 'DEEP'` — **asserting a PFI integration level from the processing TIER, having never consulted PFI at all** |
| `maiaService.ts:2856` | logged `autonomy=${autonomyRatio}` — a constant, printed as a per-turn measurement |

⭐⭐ **The provenance-header one is the worst thing found in this whole sequence.** Every DEEP turn
carried an outbound header claiming full PFI integration — whether PFI ran, failed, or was never
reached. **The label was not merely inflated inside the system; it was asserted to the outside.** It
now reads `direct`; ⚠️ what it *should* say is the canon-headers owner's question, not this pass's.

⚠️ **The persisted column `pfi_coherence` still exists** in
`20260215210000_field_orchestrator_telemetry.sql`. This pass **stops writing false rows** (writes
`null`); dropping the column is a schema act outside this authorization. ⛔ **Historical rows in it
are the old fiction and must not be read as measurements.**

## 6.4 · The canon suite — rewritten, not deleted

⭐ The old suite asserted that four field **NAMES must exist** (`toHaveProperty('resonanceIndex')`).
**That is how a vacant socket becomes self-perpetuating: a test demanded a home for a value nobody
could supply.** It now asserts the opposite, so the sockets cannot quietly return.

Sovereignty over articulation is **canon unchanged** — only its location moved. `autonomyRatio: 1.0`
was a constant policy claim wearing the shape of a measurement; the policy belongs in the
constitution, not in a field a future reader could mistake for evidence, or start varying.

⚠️ **While rewriting it I deleted two unrelated describe blocks by accident** — `Canon Violation
Detection` and `MindContext Type Safety`, 11 tests — by slicing past my target. Caught by counting
`it(` against `HEAD` and restored. **20/20 now.** *A test count is worth checking after any
mechanical edit to a test file.*

## 6.5 · DESIGN-OWED SIGNALS — intent preserved outside the ontology

```text
elemental balance · resonance · integration readiness ·
integration coverage / provenance coverage · signal quality

STATUS   No lawful PFI representation currently exists.
⛔ Do not reintroduce a runtime field until:
     source exists · transformation established ·
     availability semantics exist · authority adjudicated
```

⭐ **A real resonance intelligence will EARN a field from its evidence. It will not inherit a vacant
socket.**

## 6.6 · Gates

`599 passed`, one **pre-existing** failure (`Presence Mode Wiring`, verified failing on the clean
tree before this pass) · typecheck **no regressions** · `check:no-supabase` clean.
⛔ No adapter built · routing thresholds untouched · no 50+ integration · Unified changed only where
the shape required · no producer named · no room cut over.

---

# 7 · PFI-REPRESENTATION-A ✅ CLOSED

> ⭐⭐ **Provenance may be rendered into prose. It may never be recovered from prose.**

## 7.1 · `routingBasis` is now structural

`FieldRoutingDecision` carries a typed `basis`, set at the point the router *knows* whether it read a
profile. The caller reads it. ⛔ **Gone:**
`routing.reasoning.startsWith('No cognitive profile') ? … : …` — a human-readable diagnostic string
parsed to establish provenance, where **a copy edit could silently change the epistemic basis of the
result.** `reasoning` is now marked PRESENTATION ONLY in its own docstring. The compiler confirms
every return path is tagged.

## 7.2 ⭐ The two fallbacks were never two situations

**Census: `getDefaultMindState()` is TEST-ONLY** — nothing in the application called it. So the
contradiction (`fieldWorkSafe: true` there vs `false` in the live `buildFallbackMindState`) was not
two postures for two circumstances. **It was one live fallback and one dead export that the canon
suite kept alive, asserting a posture nothing used.**

**Deleted.** The live constructor is exported and the canon suite now asserts against **the fallback
that actually runs** — better evidence, not merely a redirected import. ⭐ **In uncertainty the
careful posture is `fieldWorkSafe: false`; the permissive default reachable only by tests was the
more dangerous of the two to keep.**

**Inventory verified: 20 `it(` before and after.** *After changing an instrument, verify the
inventory as well as the verdict.*

## 7.3 🔴 THE PATTERN RECURS, AND WORSE — `lib/field/fieldSafetyCopy.ts`

A sweep for prose-derived facts found `getBypassingContextNote()`:

```ts
const reasoning = fieldRouting.reasoning.toLowerCase();
if (reasoning.includes('spiritual bypassing') || reasoning.includes('spiritual')) {
  return `there's a pattern of reaching for the symbolic/spiritual as a way to *transcend*
          difficulty rather than *work through* it …`;
}
```

⭐⭐ **This is not presentation deriving from presentation. It is a MEMBER-FACING PSYCHOLOGICAL
CLAIM — "there's a pattern of reaching for the spiritual to transcend difficulty" — recovered by
substring-matching a diagnostic log string.** It is the same failure class as everything in this
sequence, at the highest stakes yet: **the fabrication is spoken to the member.**

⚠️ **And the match is loose.** `reasoning.includes('spiritual')` fires on **any** reasoning
containing the word — not only on spiritual bypassing. The structural facts it wants
(`bypassingFrequency.spiritual`, `.intellectual`, `stability`) are already on the cognitive profile;
nothing needs to be inferred from prose at all.

⛔ **NOT repaired — outside this amendment.** Recommended as its own lane, **FIELD-SAFETY-COPY-01**,
and it should be adjudicated before UNIFIED-TRUTH given what it says to a person.

## 7.4 · Retained rulings

**`pfi_coherence` NOT dropped.** ⭐ *Do not erase false historical evidence before ensuring nobody
still mistakes it for true historical evidence.* The rows are evidence of **what the system used to
claim** — not evidence of coherence. A narrow telemetry-history census decides later: if nothing
reads it, drop or rename-as-deprecated; if something does, that consumer stops treating old values as
measurements **before** the schema is touched.

**Two laws recorded from the provenance-header finding:**

> ⭐⭐ **Provenance specificity may never exceed the evidence that establishes it.**
> ⭐⭐ **A processing tier is not a source.**

`direct` is the right temporary value: **it says less, but everything it says is true.** ⛔ A
read-only **canon-header census** is owed before producers are drawn — looking for headers deriving
source, capability or provenance from tier/mode/path rather than the participating system. It does
not block the next truth pass.

**Methodological finding, preserved:**

> ⭐⭐ **A passing suite that silently lost eleven tests is not stronger evidence than a red suite;
> it is weaker evidence wearing green. After changing an instrument, verify the INVENTORY as well as
> the verdict.**

## 7.5 · Gates

`599 passed` · one **pre-existing** failure (`Presence Mode Wiring`) · typecheck **no regressions** ·
`check:no-supabase` clean. ⛔ No routing thresholds changed · no field restored · no Unified work.

**Next: UNIFIED-TRUTH** — with `FIELD-SAFETY-COPY-01` flagged as arguably prior.
