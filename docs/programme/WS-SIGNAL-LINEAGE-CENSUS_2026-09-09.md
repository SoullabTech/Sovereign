# SIGNAL-LINEAGE CENSUS — Elemental → PFI → Unified

**Read-only, output-field level. 2026-09-09.** Step 2 of the whole-organism sequence.

> ⭐⭐ **Derivation does not create corroboration.**
> **Two outputs are independent evidence only to the degree that their evidentiary ancestry is
> independent.**

⛔ No producer named. ⛔ Nothing repaired here.

---

# 0 · 🔴 HEADLINE — FIELD-TRUTH-02 DID NOT CLOSE THE FABRICATED EARTH. IT MOVED IT ONE LAYER DOWN.

⚠️ **This corrects a claim made in the previous session turn.** FIELD-TRUTH-02 is correct and stands
— the Elemental Oracle no longer fabricates. But the *effect* I attributed to it does not hold,
because the lineage continues past the bridge.

`lib/sovereign/pfiMindEntrypoint.ts`:

```ts
function normalizeElement(element: string | null | undefined) {
  if (!element) return 'Earth';          // ← Grounding default
  switch (element.toLowerCase()) { ... default: return 'Earth'; }   // ← and again
}
```

**The exact path FIELD-TRUTH-02 created:**

```text
prose with no elemental vocabulary
  → Elemental.dominant = undefined            ✅ FIELD-TRUTH-02 working as ruled
  → `?? meta.element` → still undefined       ✅ handoff falling through correctly
  → buildFieldContext({ element: undefined })
  → normalizeElement(undefined) → 'Earth'     🔴 FABRICATED AGAIN, one layer down
  → PFI.elementalDominance = 'Earth'
  → PFI SUCCEEDS, so ctx.pfi is set           🔴 FIELD-TRUTH-01's gate does not fire
  → Unified one-hot EARTH prescription
  → dominantElement: 'earth' → the prompt
```

⭐ **Honest absence at one layer becomes fabrication at the next, unless every layer honours it.**
FIELD-TRUTH-02 turned `'earth'` into `undefined`; `normalizeElement` turns `undefined` straight back
into `'Earth'`. **Net effect on cognition today: unchanged.**

## 0.1 🔴 AND FIELD-TRUTH-01's GATE IS NARROWER THAN INTENDED

`generatePFIMindState` **does not throw** on internal failure — it *returns*
`buildFallbackMindState()`, which contains `elementalDominance: 'Earth', source: 'fallback'`
(`:199-214`). FIELD-TRUTH-01 gates on `if (!ctx.pfi)`, which only becomes true when the call
**throws or times out**.

⛔ **So a PFI critical failure still produces a fabricated Earth that sails through the gate.** The
state even labels itself `source: 'fallback'` — **and `fieldOrchestrator` never reads `source`.**
*The evidence needed to catch it is already on the object and is discarded.*

**Three live routes to a fabricated Earth remain:**

```text
1  normalizeElement(undefined)        the ORDINARY no-signal path  — created by FIELD-TRUTH-02
2  normalizeElement('unrecognised')   default branch
3  buildFallbackMindState()           PFI internal failure; returns, does not throw
```

⛔ **Repair NOT authorized here.** Recommended as **FIELD-TRUTH-03**, bounded: honour absence in
`normalizeElement`, make PFI's `source: 'fallback'` legible to the orchestrator's prerequisite gate,
and let dependents become absent. ⛔ Do not redesign PFI, do not touch routing, do not tune anything.

---

# 1 · PFI — output by output

⚠️ **AMENDED 2026-09-09 — this table's first version was wrong about the routing lineage, and the
tree is cleaner than it claimed.**

`routePanconsciousField()` **accepts** `element`, `facet`, `archetype` and `bloomLevel` — and
**never reads them.** Verified in `lib/field/panconsciousFieldRouter.ts`: the body reads only
`cognitiveProfile.rollingAverage`, `.stability`, `.bypassingFrequency.spiritual` and
`.bypassingFrequency.intellectual`, returning conservative MIDDLEWORLD defaults when there is no
profile.

⭐ **So the router's outputs are NOT partly-independent elaborations of the Elemental reading — they
are independent OF it, deriving wholly from the cognitive profile.** The correction matters: it means
PFI is **already several epistemic lineages inside one object**, which is precisely the case the
producer-boundary rule was written for.

```text
ELEMENTAL LINEAGE        current text → lexical classifier → PFI.elementalDominance
                                                           → Unified elemental outputs
PROFILE-ROUTING LINEAGE  cognitiveProfile → fieldWorkSafe · realm · deepWorkRecommended
                                          → coherenceLevel · reactivityIndex · integrationReadiness
RESONANCE LINEAGE        current text → its own text-shape analysis
```

| Output | Origin | Derived from | New evidence | Transformation | Claim | Independence |
|---|---|---|---|---|---|---|
| `elementalDominance` | Elemental lexical match on the current turn | `Elemental.dominant` **only** | ⛔ **none** | `normalizeElement()` — a case map | "the member's dominant element" | 🔴 **DERIVATIVE-ONLY** |
| `fieldWorkSafe` | `routePanconsciousField` | ⭐ **`cognitiveProfile` ONLY** | ✅ independent of the text | routing decision | "field work is safe now" | ⭐ **INDEPENDENT of the elemental lineage** |
| `realm` | `routePanconsciousField` | same | ✅ | routing decision | "which realm this is" | ⭐ **INDEPENDENT of the elemental lineage** |
| `deepWorkRecommended` | `routePanconsciousField` | same | ✅ | routing decision | "deep work is indicated" | ⭐ **INDEPENDENT of the elemental lineage** |
| `coherenceLevel` | — | `routing.fieldWorkSafe` **only** | ⛔ **none** | `fieldWorkSafe ? 0.7 : 0.4` | "how coherent the member is" | 🔴 **DERIVATIVE-ONLY** |
| `reactivityIndex` | — | `routing.fieldWorkSafe` **only** | ⛔ **none** | `1 - (fieldWorkSafe ? 0.7 : 0.3)` | "how activated the member is" | 🔴 **DERIVATIVE-ONLY** |
| `integrationReadiness` | — | `routing.deepWorkRecommended` **only** | ⛔ **none** | `? 0.8 : 0.5` | "readiness to integrate" | 🔴 **DERIVATIVE-ONLY** |

⭐⭐ **`coherenceLevel`, `reactivityIndex` and `integrationReadiness` are two-valued re-encodings of a
single boolean.** They are presented as continuous measures on `[0,1]`. **A number that can only ever
be 0.7 or 0.4 is not a measurement of coherence; it is `fieldWorkSafe` wearing a decimal point.**

⚠️ **The census's earlier hypothesis was that PFI would be "a mixture". It is — but not evenly. Three
of its seven outputs carry no new evidence at all, and one of those three is the element itself.**

---

# 2 · UNIFIED — output by output

Runs only at `depth >= 4`, and (post FIELD-TRUTH-01) only when `ctx.pfi` exists.

| Output | Derived from | New evidence | Independence |
|---|---|---|---|
| `elementPressure.*` | the one-hot prescription built from `PFI.elementalDominance` | ⛔ none — the ~24 other inputs are fabricated constants | 🔴 **derivative-only** (of Elemental) |
| `dominantElement` | `getFieldHealthSummary` over the above | ⛔ none | 🔴 **derivative-only** (of Elemental) |
| `coherenceLevel` | same summary | ⛔ none | 🔴 **derivative-only** |
| `interference[]` | thresholds over the above | ⛔ none | 🔴 **derivative-only** |

⭐⭐ **Every Unified output currently traces to one lexical classification of the current turn.**
`dominantElement` is not a second opinion about the member's element — **it is the Elemental Oracle's
answer, returned with a longer provenance chain and more apparent authority.**

---

# 3 · RESONANCE — the one genuinely independent leg

| Output | Derived from | New evidence | Independence |
|---|---|---|---|
| `wordDensity` | the current text | ✅ measured directly | **independent** |
| `elements{}` | the current text | ✅ its own analysis, not Elemental's | **independent** of the Elemental chain |
| `silenceProbability` | the current text | ✅ | **independent** |
| `fragmentationRate` | the current text | ✅ | **independent** |
| *(`intimacyLevel`, internal)* | `exchangeCount / 30` | ⛔ **none** | 🔴 **turn count only** — RESONANCE-TRUTH, step 3 |

⭐ **Resonance is a genuine second observer of the same text.** ⚠️ **But it observes the same
object** — the current turn — so it is independent *of the Elemental chain*, not independent
evidence about the member.

---

# 4 · What this establishes for producer boundaries

> ⭐⭐ **A producer represents one coherent epistemic LINEAGE, not one software MODULE.**

**Four modules do not yield four producers. The lineage graph yields roughly three claims:**

```text
ONE lexical reading of the current turn
  ├─ Elemental.dominant
  ├─ PFI.elementalDominance          derivative-only
  └─ Unified.elementPressure / dominantElement / coherenceLevel / interference
                                     derivative-only
     ⛔ ONE claim. Registering these separately would represent one signal as three,
        and MIPA would see three admitted producers agreeing.

ROUTING over profile · facet · archetype · bloom
  ├─ PFI.fieldWorkSafe · realm · deepWorkRecommended       partly independent
  └─ PFI.coherenceLevel · reactivityIndex · integrationReadiness
                                     derivative-only re-encodings of the above
     ⛔ ONE claim, not four, and the re-encodings should probably not surface at all.

TEXT SHAPE measured directly
  └─ Resonance.wordDensity · elements · silenceProbability · fragmentationRate
     ✅ genuinely independent of the other two.
```

⛔ **Still no names.** The next act is the founder's step 3 (RESONANCE-TRUTH) and step 4
(UNIFIED-TRUTH); boundaries are drawn at step 6.

---

# 5 · Standing

```text
✅ lineage census COMPLETE at output-field level
🔴 FIELD-TRUTH-02's effect on cognition is currently NIL — normalizeElement re-fabricates
🔴 FIELD-TRUTH-01's gate misses PFI's non-throwing fallback
⛔ FIELD-TRUTH-03 recommended, NOT opened
⛔ no producer named · no room cut over · every existing room unchanged
```

---

# 6 · TWO CANVAS FINDINGS (founder, checked against the tree)

## 6.1 · CANVAS-PLACE — observation 5 belongs to the parallel lane

The repository already assigns that failure class to **`WS-WHOLE-MANUSCRIPT-01`**, whose own prior
check 5 was a far-rail navigation defect repaired in `WholeManuscriptSurface.tsx` with **ARRIVAL /
COMMAND / PLACE** separated as distinct falsifiers — *because a rail jump was being undone by its own
completion.*

> ⭐ **This lane exports the law and the witness. That lane owns the surface repair.**

**Portable from D9 / the amended orbit law, usable there:**

```text
an orbit or navigation must not relocate the writer unexpectedly
arriving somewhere is not the same act as issuing a navigation command
the target must ACTUALLY ARRIVE in the viewport, not merely light up in the rail
scroll and place must remain coherent
```

⛔ **Do not patch their Canvas from this lane** — that would collapse the experimental separation.
"Rail indicates the destination but the writer has to hunt for it" is squarely a surface/place/anchor
defect, same family, **same owning lane.**

## 6.2 ⭐ CANVAS-MAIA — the Canvas bypasses canonical participation entirely

**Stronger than "it probably uses the old room."** `AskMaia` → `lib/writersStudio/askClient.ts` →
`/api/sovereign/manuscripts/{id}/ask` → `askMaia` (structure) or `askMaiaDevelopmental` — and those
readers call **`runStructured()` directly**, with their own Writer's Studio system prompt and model.

```text
NO getMaiaResponse · NO CanonicalTurn · NO RoomKind selection
NO writers_studio · NO whole-organism MAIA · NO member-memory organism
NO elemental / PFI / field participation
```

> ⭐⭐ **If the Canvas is calling "MAIA" today, it is not calling MAIA through the wrong room policy.
> It is bypassing room policy entirely.**

⚠️ **This corrects a weaker formulation offered earlier in this lane** (*"through a room policy that
didn't exist"*), which assumed canonical participation was happening at all.

⛔ **And this is NOT automatically a defect.** Those readers were deliberately built with strong
constraints — **frozen reading only · no tools · no manuscript mutation · no rereading · no silent
expansion.** Those are **sovereignty properties worth keeping.**

> ⭐⭐ **Whole MAIA does not mean unbounded MAIA.**

So the eventual migration is **not** `delete askReader → call generic MAIA`. It is:

```text
preserve the encounter's lawful constraints
      + bring them through writers_studio canonical participation
      + give them to the real MAIA organism
```

⭐ A conversation about a frozen developmental observation can still say: *"for this encounter you may
use this observation, its verified evidence, the writer's present words, and lawful ambient
continuity — but you may not silently reread the Work."* **That constraint should become a Writer's
Studio ENCOUNTER / COMMISSION boundary inside canonical MAIA, rather than remaining a standalone
model persona.**

## 6.3 · Convergence — the incorporation answer

⛔ **Hold the surface merge.** The parallel lane closes its own navigation acceptance
(`7 PASS · 1 FAIL`, deploy HOLD). This lane finishes signal lineage, organism design, and the
canonical cognition bridge.

```text
PARALLEL CANVAS                    THIS LANE
accepted production form           writers_studio room + membrane
+ navigation                       + real authenticated MAIA
                                   + lawful whole-organism cognition
                                   + the Writer role
                    ↓  meet  ↓
              PRODUCTION WRITER'S STUDIO
```

> ⭐ **Not one branch swallowing the other. They meet when each has proved the thing it owns.**


---

# 7 · ⚠️ `source: 'pfi_full'` DOES NOT MEAN FULL INTEGRATION

Verified at `lib/sovereign/pfiMindEntrypoint.ts:114-131`. With
`MAIA_PFI_FULL_INTEGRATION=true` the code dynamically imports `ElementalFieldIntegration` and
`MAIAConsciousnessFieldIntegration`, **uses neither**, logs

```text
🧠 [PFI Full] Would integrate 50+ systems (pending canon drift tests)
```

and returns **the same routing-only state** as the legacy path, relabelled `pfi_full` with
`integrationCoverage: 0.8` and `signalQuality: 0.75` — versus `0.2` / `0.7` for the identical
computation on the legacy path.

⭐⭐ **The label and the two numbers are the only difference. `source: 'pfi_full'` is a
representation claim that no integration supports**, and `integrationCoverage` — the field whose
whole job is to say how much of PFI contributed — is a **fixed constant on both paths.**

⛔ **A representation finding, not a repair.** Do not activate that path. It belongs to step 3
(PFI-REPRESENTATION), pinned as lineage debt.

---

# 8 · FIELD-TRUTH-03 — PFI HONOURS ABSENCE ✅ CLOSED

> ⭐⭐ **A fallback may preserve operational posture. It may not manufacture observational content.**
> ⭐⭐ **Honest absence must survive the entire derivation chain.**

**Five Earth defaults were live across the chain. Three are closed here; two were closed earlier.**

```text
1 Unified, missing PFI                     FIELD-TRUTH-01   ✅
2 Elemental fast path, zero matches        FIELD-TRUTH-02   ✅
3 normalizeElement(absent)      → 'Earth'  FIELD-TRUTH-03   ✅ now absent
4 normalizeElement(unknown)     → 'Earth'  FIELD-TRUTH-03   ✅ now absent
5 buildFallbackMindState()      → 'Earth'  FIELD-TRUTH-03   ✅ asserts no element
  (+ getDefaultMindState() in mindContext.ts — same treatment)
```

**A · Elemental dominance.** `PFIMindState.elementalDominance` is **optional**. `normalizeElement`
case-maps a signal that arrived; it has no evidence of its own, so it supplies none — absent and
unrecognised both yield **absence**.

**B · The fallback.** ⭐ **The posture SURVIVES; only the fabricated content goes.**
`fieldWorkSafe: false` · `realm: 'MIDDLEWORLD'` · `deepWorkRecommended: false` remain as lawful
conservative policy — *"in uncertainty, use the careful operating stance."* `elementalDominance:
'Earth'` was never policy; it was an unobserved identity travelling as evidence.

```text
OPERATIONAL DEFAULT   what the system chooses to DO when it cannot know
COGNITIVE SIGNAL      what the system is entitled to say it KNOWS
```

**C · The orchestrator gate, amended.** FIELD-TRUTH-01 asked *"is there a PFI object?"* — which
`buildFallbackMindState()` satisfies, because `generatePFIMindState` **returns rather than throws.**
The prerequisite is now **evidence**:

```text
no ctx.pfi                     → 'PFI prerequisite unavailable'
source === 'fallback'          → 'PFI returned operational posture, not evidence'
element === undefined          → 'no elemental signal to derive from'
```

⭐ **`source` was already on the object. The orchestrator simply never read it** — the evidence
needed to catch this was present and discarded.

**D · Observability.** Four counters where there was one: `pfiFailures` (threw/timed out) ·
`pfiFallbackPosture` (returned, not evidence) · `pfiNoElement` (ran, no signal) ·
`unifiedSkippedNoPfi`. Plus `[field-truth]` markers. **No state can masquerade as another.**

**Witness: `lib/field/__tests__/fieldTruth01.test.ts` · 19 passed**, including ⭐ **THE CHAIN** —
absence originating at the Elemental Oracle now produces a context containing **no occurrence of
"earth" at all.**

⛔ **Untouched, as ruled:** the decimal aliases (`coherenceLevel` 0.7/0.4, `reactivityIndex`,
`integrationReadiness`) · `elementalBalance` 0.6 · `resonanceIndex` 0.5 · the
`integrationCoverage`/`signalQuality` constants · the `pfi_full` identity · Resonance · Unified's
other fabrications · producer registration · room cutover.
