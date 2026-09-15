# `AIN-CONTEXT-01` · A6 — F1b ADJUDICATION · DEEP STANDING

**Date:** 2026-09-15 · **Authority:** founder adjudication 2026-09-15, R1–R7
**Standing: ⚠️ A6 IMPLEMENTED · ACCEPTANCE HELD ON COVERAGE, NOT FUNCTIONALITY**

---

## 1. Adjudication as ruled

**R1 · F1b ✅ GREEN — ADMITTED FOR THE EXECUTED PATH.** Shallow sessions do not
manufacture absence; authoritative depth does not saturate with the retrieval window;
represented material is accounted against the actual cognitive aperture; omitted durable
material is represented as known absent; omission is not represented as nonexistence.
At depth 200: `200 durable · 4 represented · 196 known absent`. F1a reversed on the
commensurable probes.

**R2 · Instrument corrections** are admitted as instrument defects, not product failures,
and remain visible in the acceptance record §2. ⭐ The **unchanged** absence probe set
carries the direct RED→GREEN comparison.

**R3 · GREEN boundary, ratified as programme discipline:**

> A behavioral witness proves only the behavior it executes. GREEN does not imply
> compilation, reachability, or integration outside that graph.

**R4 · Evidence classes, none to be silently upgraded:**

```text
behavioral contract exercised by F1b   WITNESSED
CORE path                              WITNESSED
FAST threading                         ENTAILED
DEEP threading                         ENTAILED
getMaiaResponse integration            ENTAILED
full project type gate                 NOT RUN in this environment
```

**R5 · DEEP divergence.** Not an A6 repair obligation merely because A6 encountered it.
⛔ But A6 may not claim DEEP delivery unless delivery through the **actual primary DEEP
serving path** is witnessed. Missing coverage is recorded, never absorbed.

**R6 · Acceptance held** pending four witnesses: project gate · FAST reach · actual DEEP
standing · `getMaiaResponse` threading.

**R7 · Already established:** the central proposition is behaviorally demonstrated. ⭐ The
remaining question is **reach, not semantics.**

---

## 2. ⛔⛔ DEEP: A6 DOES NOT REACH THE PRIMARY SERVING PATH

Established from source, and reported now rather than after a witness, because the
founder's instruction is to **stop and adjudicate** rather than repair.

### 2.1 The primary DEEP path carries no addenda channel

`deepPathResponse` produces MAIA's initial response through
`consciousnessWrapper.processConsciousnessEvolution(input, consciousnessContext)`.
`ConsciousnessContext` has **no addenda field of any kind**, so
`sessionContinuityAddendum` has no carrier into it. This is §II.C of
`ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` — pre-existing, and the same reason
`episodicRecallAddendum` is documented in that file as *"observability-only there"*.

⛔ A6 did not create this and does not repair it.

### 2.2 ⭐⭐ And the second carrier is a near-match I walked into

A6 replaced DEEP's `sessionMetadata.turnCount` — which had been the window-derived
`effectiveHistory.length + 1` — with the authoritative depth.

**`turnCount` is declared in `claudeConsciousnessService`'s `sessionMetadata` interface
and is never read.** It reaches no prompt. The consultation destructures
`sessionMetadata` and never consults that field.

⭐⭐ **That is the same shape R4 made me refuse on `MaiaContext.turnCount`: a
conveniently present field, declared, unassigned-or-unread, whose semantics and consumers
are undefined.** I refused it at CORE and then walked into it at DEEP. The A6 edit there
is not wrong — it removes a false number from a struct — but ⛔ **it is not delivery, and
it must not be counted as DEEP coverage.**

*A write site is not a delivered signal.* The founder's sentence, met on the first
occasion it could have been violated.

### 2.3 Honest DEEP standing

```text
DEEP primary path   ⛔ A6 DOES NOT REACH COGNITION
                       ConsciousnessContext has no addenda carrier (§II.C)
                       sessionMetadata.turnCount is declared and never read
DEEP repair path    ✅ sessionContinuityAddendum set on repairedContext, and
                       buildMaiaComprehensivePrompt appends it via appendAllContextAddenda
```

⛔ **No repair attempted.** Adding the field to `ConsciousnessContext`, or wiring the
orchestrator to the addenda channel, would be closing §II.C under authority inherited from
A6 — precisely what R5 forbids. ⚠️ Routed out for its own act.

### 2.4 What this does to A6's accepted coverage

A6's coverage claim must narrow, explicitly:

```text
CORE   claimed — witnessed by F1b
FAST   claimed — witness owed (structurally delivered; see §3)
DEEP   ⛔ NOT CLAIMED on the primary path · claimed only on the repair path
```

⭐ The tier that matters most is FAST — ACT 1 established it serves most turns — and it is
structurally sound. The tier A6 does **not** reach is the least-trafficked one. ⛔ That is
mitigation, not coverage, and it is not offered as a reason to close.

---

## 3. FAST: structurally delivered, witness owed

`contextPrompt` is built with the continuity block as its prefix in **all three**
assembly branches, and is passed directly as `userInput` to `generateText`. There is no
intervening narrowing stage.

⚠️ **Structural, not witnessed.** Per R3 this is ENTAILED and may not be upgraded. The
witness is F1c (§4).

---

## 4. Remaining acceptance work

| # | Witness | Method |
| --- | --- | --- |
| 1 | Project type/build gate | ✅ **PASS** — 229 vs baseline 239, no regressions, exit 0 |
| 2 | FAST reach | ✅ **WITNESSED** — F1c: `depth=200 represented=3 absent=197` at the wire |
| 3 | Actual DEEP standing | ⛔ **WITNESSED AS NOT REACHED** — F1c: 10 wire calls, none carried the block |
| 4 | `getMaiaResponse` threading | ✅ **WITNESSED** — authoritative depth at the wire proves the thread |

⭐ All four discharged. Record: `AIN-CONTEXT-01_A6_F1c_REACH_WITNESS_2026-09-15.md`.
⚠️ Item 3 is discharged **as a witness**, ⛔ not as coverage — see §2.4.

**F1c method.** A loopback HTTP server implementing Ollama's `/api/chat` captures exactly
what reaches the model, with `OLLAMA_BASE_URL` pointed at it. ⛔ **No source is modified
and no provider is called** — the stub sits at the wire, downstream of all prompt
assembly, which is the same containment the S3 lane used.

⛔ These are acceptance witnesses only. Not authorization to redesign retrieval, widen
apertures, alter DEEP architecture, or repair unrelated context machinery.

---

## 5. Standing

```text
A6                        IMPLEMENTED · ACCEPTANCE HELD
F1b                       GREEN · admitted for the executed path
DEEP primary              ⛔ NOT REACHED · WITNESSED by F1c · ⛔ NOT REPAIRED · routed out
sessionMetadata.turnCount near-match · declared and never read · not delivery
FAST                      ✅ DELIVERED · WITNESSED at the wire by F1c
Project gate              ✅ PASS · 229 vs 239 · 0 regressions · exit 0
Production                UNTOUCHED
Merge · deploy            ⛔ NOT AUTHORIZED
```

> Passing behavior, compiling code, reaching production paths, and satisfying the
> architecture are four different proofs. None may stand in for another.
