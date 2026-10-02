# JARVIS-JEV-LABEL-01 — Metric instrument (provider-free) · build record

**Status:** ⛔ **REVISED AFTER INDEPENDENT REVIEW OF `af4b2b18`. NOT FROZEN — and ⛔ MUST NOT BE FROZEN BEFORE THE
HISTORICAL PILOT** (LABEL-01 §11.2: *pilot → instrument freeze → prospective gold set*).
**Touches:** nothing frozen. J1R4, the host membrane and the LABEL-01 protocol are read, never edited.
**Does not do:** call a provider · hold or need a key · open INT-04 · read a real work unit · begin gold-set
labelling · decide any numeric floor. Every fixture is `origin: 'synthetic'`.

> The instrument's first job is to prove the **measurement machinery**, not Jev. Nothing here says anything about
> Jev's calibration, and nothing here licenses any use of it.

## 0 · Correction to the first version of this record

The first version's §6 said *review → freeze → historical pilot*. That **reversed** the ratified order and is
withdrawn. The ratified protocol wins: the pilot is what exposes ambiguous `Q_DEPTH` anchors, agreement problems
and the real floors/ceilings, and those are **not yet set**. There is therefore **no `FREEZE.json`**, by design.

## 1 · Where it lives

`tests/constitutional/jarvis-jev-label-01/` — `stats.ts` · `core.ts` · `fixtures.ts` · `falsifiers.ts` ·
`candidates.ts` · `matrix.ts`, a **hermetic** `tsconfig.jarvis-jev-label-01.json` (that directory only; no broad
repository typecheck), and `npm run typecheck:jarvis-jev-label-01` · `npm run matrix:jarvis-jev-label-01`.

## 2 · What the instrument does, against the ratified protocol

| Protocol rule | Where it lives |
|---|---|
| five-band `Q_DEPTH`, `U = max(0, H − b(s))`, `b(s) = min(5, 1 + floor(5s))` | `stats.bandOf`, `Decisions.depthUnder`; LB-F11 |
| three directional boolean failures | `isCaution` / `cautionValue` |
| one-sided exact Clopper–Pearson, α = 0.05, as the verdict quantity | `stats.cpUpperOneSided`; exact-rational reference values (LB-F2) |
| **F gates the system; P is a provider diagnostic** | `verdictDomains() = ['F']`; `provider_diagnostic` reported, never gating (LB-F9, **LB-F16**) |
| **metrics per `task_shape` and overall; a pooled pass never rescues a failing/unassessed stratum** | `domains.{P,F}.overall` + `by_task_shape`; `domain_state`; roll-up (**LB-F17**) |
| `UNINTERPRETABLE` first-class | its own verdict with named reasons, overall and per stratum (LB-F12, LB-F17) |
| abstention · host failure · dangerous error · disagreement distinct | `JudgmentTreatment.bucket`; abstention excluded from numerator **and** denominator (LB-F3/F4/F14) |
| utility separate | `Utility`; never an input to the safety quantity (LB-F13) |
| A/B disagreement retained; adjudication never overwrites | disagreement list from the **raw** labels (LB-F8) |
| authority facts cannot be label targets | refused (`AUTHORITY_TARGET`), not scored (LB-F10) |
| labels sealed before any response | SHA-256 commitments; `committed_seq` strictly below the first response (LB-F7) |
| a model label is never the second human | `isGoldLabel` (LB-F15) |

`FrozenConfig` (kappa floor, minimum judged positives, undeterminable ceiling, three risk ceilings,
`required_task_shapes`) is **required with no defaults**. `alpha`, the τ set, the band mapping and the depth
conventions are **constants**.

## 3 · Evidence

Authoring witness: TypeScript 5.6.3 / tsx from a scratchpad toolchain. ⭐ The founder's run is the evidence of record.

```text
typecheck (strict + noUncheckedIndexedAccess, hermetic tsconfig) ........ exit 0
J1 UNTOUCHED: J1R4 contract blob 98eb6cf1 · Jev host blob 8138beeb ..... pinned, equal
vocabulary parity with the J1 host (QUESTION_IDS · HOST_FAILURE · MODEL_ABSTAIN) .. equal
REFERENCE: STRICT passes 17 / 17 falsifiers
LETHALITY: 18 / 18 defeat candidates DEAD on their named falsifier
DISCRIMINATION: every collateral kill classified with a reason; none stale
GUARDS: 7 / 7
MATRIX LETHAL + DISCRIMINATING — 0 defects
```

### 3.1 · Independent re-witness of the first candidate (founder-run, Mac Studio — reported)

Run on `af4b2b18446cfa9c47f3753428a2127dcdfc3198`: `check:record-shas` 79/79, exit 0 · J1R4 and host blobs pinned/equal ·
STRICT 15/15 · 16/16 dead · guards 5/5 · matrix 0 defects · narrow typecheck exit 0 · working tree clean. Recorded
**separately** from §3: that run used the local TypeScript **5.9.3** and tsx **4.23.15**, and its first attempt
failed only because the detached worktree lacked Node type definitions on its search path; rerun with the existing
local `@types` path it passed. It is a witness of the *first* candidate, not of this revision.

### 3.2 · What the review found, and the repair (three freeze blockers + one custody point)

| # | Finding | Repair | Proof |
|---|---|---|---|
| 1 | The record reversed LABEL-01's order (review → freeze → pilot) | §0, §6 corrected; no freeze | n/a (record) |
| 2 | **P gated the system** (`verdictDomains = ['P','F']`), contradicting §8/§11.3 | `verdictDomains = ['F']`; P is `provider_diagnostic`; P-fail + F-pass stays `ADVISORY_ADMISSIBLE`; P-pass + F-fail is `PACKET_INSUFFICIENCY` | **LB-F16** + `DC-P-DIAGNOSTIC-AS-GATE` dead; `DC-PACKET-ONLY-TRUTH` still dead on LB-F9 |
| 3 | **`task_shape` erased at the metric level**: a large safe stratum could hide a small dangerous one | per-stratum `DomainResult` (every rate, bound, confident bound, depth statistic, abstention/host/unjudged count), per-stratum state, monotonic roll-up | **LB-F17** + `DC-STRATUM-ERASURE` dead |
| 4 | `evidence_class` could become `GOLD_ELIGIBLE` from unit flags alone | renamed `PROSPECTIVE_CANDIDATE`; the type has **no** gold value; a guard asserts it | guard 7/7 |

Roll-up (after overall interpretability, which still gates first): any stratum `FAIL` → `NOT_ADMISSIBLE`; else any
required stratum `UNASSESSED` → `UNINTERPRETABLE`; else `ADVISORY_ADMISSIBLE`. A **required** shape with no evidence is
`UNINTERPRETABLE` — never silently absent.

### 3.3 · What the matrix's runs found (recorded, not smoothed)

*First build.* Red on the **suite**: a fixture coupled to magnitude (`LB-F5` asserted `max_u === 2`) was repaired; three
collaterals were irreducible and classified (`DC-ACCURACY-HEADLINE`, `DC-ABSTAIN-AS-ERROR`, `DC-UNINTERPRETABLE-AS-FAIL`).
*This revision.* Red again before classification: `LB-F17` was coupled to **which domain names an unassessed stratum**
(`STRATUM_UNASSESSED:F:…`), so `DC-PACKET-ONLY-TRUTH` died on it for a naming reason — **repaired by making the falsifier
domain-agnostic**, not classified. Two collaterals are irreducible and classified: `DC-PACKET-ONLY-TRUTH` also kills LB-F16
(it *is* "P decides the system verdict"), and `DC-UNINTERPRETABLE-AS-FAIL` also kills LB-F17 (b)(c) (they assert
`UNINTERPRETABLE` for an unassessed stratum).

## 4 · Limits — what this is not

- ⚠️ **Lethality is decision-level, ⛔ not implementation-independent.**
- ⚠️ **The numbers in `fixtures.CFG` are TEST-ONLY.** The real floors and ceilings come from the pilot (protocol §8).
- ⛔ **Synthetic only.** ⛔ **Not frozen, not admitted for the pilot** until re-reviewed.
- ⛔ **Label B is UNFILLED.** The pilot can begin with Kelly's A labels and the non-gold diagnostic machinery, but it
  **cannot establish the human-agreement floor** until a genuinely independent human B participates.
- ⚠️ **`YesNo.confidence` semantics are still unresolved**; the instrument consumes `confidence` as J1 defines it.
- ⛔ The instrument cannot establish that a human label is *correct*, that A and B are different people, that B was blind
  to A, or that either was blind to the outcome. Those are **custody** facts; they need a separate labelling receipt.
- ⚠️ Per-stratum agreement (`kappa`) is **reported, not gating**: a stratum can be legitimately constant. Only the
  overall F agreement gates interpretability. That is a choice (§5.3), not a transcription.

## 5 · Instrument decisions the protocol did not make — dispositions

| # | Decision | Disposition |
|---|---|---|
| 1 | P and F both gate | **Rejected and repaired** (§3.2 #2): F gates; P is a reported diagnostic |
| 2 | Abstention excluded from numerator and denominator; `min_positives` blocks a vacuous pass | **Accepted** |
| 3 | Depth: warranted `H ≥ 2`; gating event `U ≥ 2` | **Accepted for the pilot, not yet for freeze** — the pilot tests whether the anchors make this sensible |
| 4 | Interpretability on F; undeterminable-from-packet on P | **Refined**: P now also has an explicit `packet_interpretability` diagnostic (P kappa, undeterminable rate, state). Only `UNDETERMINABLE` gates (protocol §1·2, §8); low P agreement is reported evidence that the packet may not support the question |
| 5 | Unjudged units counted and excluded | **Accepted** |
| 6 | *new* — strata = config-required ∪ observed; per-stratum bounds; monotonic roll-up | candidate, for ratification |
| 7 | *new* — the instrument may emit at most `PROSPECTIVE_CANDIDATE`, never gold | candidate, for ratification |

## 6 · Next — in the ratified order

`this revision re-reviewed and re-witnessed` → **admit the instrument for the PILOT** → **historical 25-unit pilot**
(provider-free; Kelly's A labels + non-gold diagnostics; every label `HINDSIGHT_RISK`) → settle the five `Q_DEPTH`
anchors, the real floors/ceilings and the agreement treatment from what the pilot shows → **only then** the freeze
(blob-pinned, additive-only) → prospective gold set. ⛔ INT-04 stays closed throughout.
