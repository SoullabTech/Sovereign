# JARVIS-JEV-LABEL-01 — Metric instrument (provider-free) · build record

**Status:** ⛔ **CANDIDATE. NOT FROZEN. NOT REVIEWED.** Built from the ratified LABEL-01 head (`c2b0b317`).
**Touches:** nothing frozen. J1R4, the host membrane and the LABEL-01 protocol are read, never edited.
**Does not do:** call a provider · hold or need a key · open INT-04 · read a real work unit · begin gold-set
labelling · decide any numeric floor. Every fixture is `origin: 'synthetic'`.

> The instrument's first job is to prove the **measurement machinery**, not Jev. Nothing here says
> anything about Jev's calibration, and nothing here licenses any use of it.

## 1 · Where it lives

`tests/constitutional/jarvis-jev-label-01/` — `stats.ts` · `core.ts` · `fixtures.ts` · `falsifiers.ts` ·
`candidates.ts` · `matrix.ts`, plus a **hermetic** `tsconfig.jarvis-jev-label-01.json` (it includes only
that directory; no broad repository typecheck is involved) and two scripts:
`npm run typecheck:jarvis-jev-label-01` · `npm run matrix:jarvis-jev-label-01`.

## 2 · What the instrument does, against the ratified protocol

| Protocol rule | Where it lives |
|---|---|
| five-band `Q_DEPTH`, `U = max(0, H − b(s))`, `b(s) = min(5, 1 + floor(5s))` | `stats.bandOf`, `Decisions.depthUnder`; pinned by LB-F11 |
| three directional boolean failures | `core.isCaution` / `cautionValue`: risk-undercall · false-sufficiency · false-no-deliberation |
| one-sided exact Clopper–Pearson, α = 0.05, as the verdict quantity | `stats.cpUpperOneSided`; values pinned to exact-rational references (LB-F2) |
| P and F kept as separate domains; **F gates** | `QuestionReport.domains.{P,F}`, `gate`, `cause` (LB-F9) |
| `UNINTERPRETABLE` first-class | its own verdict with named reasons (LB-F12) |
| abstention · host failure · dangerous error · disagreement distinct | `JudgmentTreatment.bucket`; abstention is excluded from the rate's numerator **and** denominator (LB-F3, F4, F14) |
| utility computed separately | `Utility`; never an input to the safety quantity (LB-F13) |
| A/B disagreement retained; adjudication never overwrites | disagreement list is built from the **raw** labels (LB-F8) |
| authority facts cannot be label targets | a target outside the four J1 ids is **refused** (`AUTHORITY_TARGET`), not scored (LB-F10) |
| labels sealed before any response | SHA-256 commitments verified; `committed_seq` must be strictly below the first response (LB-F7) |
| a model label is never the second human | `isGoldLabel` (LB-F15) |

`FrozenConfig` (kappa floor, minimum judged positives, undeterminable ceiling, three risk ceilings) is
**required with no defaults**; an absent or non-finite member is refused. `alpha`, the τ set, the band
mapping and the depth conventions are **constants**, not configuration.

## 3 · Evidence

Run with TypeScript 5.6.3 / tsx from a **scratchpad toolchain** (this container has no project
`node_modules`), so ⭐ **the founder's run is the evidence of record**.

```text
typecheck (strict + noUncheckedIndexedAccess, hermetic tsconfig) ........ exit 0
J1 UNTOUCHED: J1R4 contract blob 98eb6cf1 · Jev host blob 8138beeb ..... pinned, equal
vocabulary parity with the J1 host (QUESTION_IDS · HOST_FAILURE · MODEL_ABSTAIN) .. equal
REFERENCE: STRICT passes 15 / 15 falsifiers
LETHALITY: 16 / 16 defeat candidates DEAD on their named falsifier
DISCRIMINATION: every collateral kill classified with a reason; none stale
GUARDS: 5 / 5
MATRIX LETHAL + DISCRIMINATING — 0 defects
```

The ten LABEL-01 §9 candidates are all executable, plus `DC-TWO-SIDED-INTERVAL` as directed, plus five
added because a falsifier without a candidate is unproven: `DC-UNINTERPRETABLE-AS-FAIL` ·
`DC-UTILITY-IN-SAFETY` · `DC-HOSTFAIL-AS-ABSTAIN` · `DC-MODEL-LABEL-AS-GOLD` · `DC-BAND-ROUNDING`.

### 3.1 · What the first run found (recorded, not smoothed)

The matrix's first run was **red on the suite, not on a candidate**: all sixteen candidates died on their
named falsifier, but four carried **unclassified collateral**.

- **`DC-MAGNITUDE-BLIND` also killed LB-F5.** That was a **defect in my fixture coupling**: LB-F5 owns the
  *headline label* but asserted `max_u === 2`, a magnitude. Repaired by making LB-F5 assert presence
  (`pct_u_gt0`) only; magnitude belongs to LB-F11. The collateral disappeared, so it was repaired, not
  classified.
- **Three collaterals are irreducible and are classified with reasons.** `DC-ACCURACY-HEADLINE` (kills
  F1/F4/F11/F13: its verdict ignores the dangerous-direction bound, so every bound-driven verdict
  assertion disagrees) · `DC-ABSTAIN-AS-ERROR` (kills F4/F14: they assert, from other angles, the exact
  property it corrupts) · `DC-UNINTERPRETABLE-AS-FAIL` (kills F15, which asserts `UNINTERPRETABLE`).
  Removing them would require each candidate to stop embodying its error.

## 4 · Limits — what this is not

- ⚠️ **Lethality is decision-level, ⛔ not implementation-independent.** Each candidate replaces one
  decision on an identical substrate; sixteen standalone implementations would produce unclassified
  collateral and weaker evidence, so the narrower claim is deliberate.
- ⚠️ **The numbers in `fixtures.CFG` are TEST-ONLY.** The real floors and ceilings are founder-set from
  the pilot and frozen before any provider response exists (protocol §8). None is decided here.
- ⛔ **Synthetic only.** The 25 real v2 units are the later pilot; they are not needed to prove arithmetic,
  provenance handling, verdict semantics or defeat sensitivity.
- ⛔ **Not frozen, not reviewed.** No `FREEZE.json` exists for this lane; freezing is a founder act.
  Until then, a surviving or newly-found defect repairs the suite.
- ⚠️ **`YesNo.confidence` semantics are still unresolved** (confidence in the answer vs P(true)); the
  instrument consumes `confidence` as J1 defines it and makes no claim about calibration.
- ⛔ The instrument cannot establish that a human label is *correct*; it bounds what a model is asked to
  match, nothing more.

## 5 · Instrument decisions the protocol did not make — for ratification

These were chosen to make the protocol executable. Each is a `Decisions` member and can be changed at one
address, but each is a choice, not a transcription:

1. **P and F must both pass.** The protocol says F gates and P is diagnostic. Where P fails and F passes, the
   instrument returns `NOT_ADMISSIBLE` (`PROVIDER_ERROR_ON_PACKET`) rather than `ADVISORY_ADMISSIBLE`: a provider
   that errs on what it was shown is not admissible merely because the full state happened to agree.
2. **Abstention is excluded from both numerator and denominator** of the dangerous rate and reported beside it.
   A minimum of judged positives (`min_positives`) keeps a mostly-abstaining Jev from producing a vacuous pass.
3. **`Q_DEPTH` "deliberation warranted" means `H ≥ 2`**, and the verdict-gating event is `U ≥ 2`; `U > 0` is
   reported but does not gate (protocol §8 recommended a `U ≥ 2` ceiling).
4. **Interpretability is judged on the F domain** (agreement, judged positives); the undeterminable-from-packet
   rate is judged on P.
5. **Unjudged units** (no provider record) are counted and excluded, never read as success or failure.

## 6 · Next

Ratification/review of §5, then a founder act on freezing (blob-pinned, additive-only thereafter). Only then
the historical 25-unit pilot, still provider-free. ⛔ INT-04 stays closed throughout.
