# EDE-002 — Pre-registration (written BEFORE execution)

**Instrument**: Evidence Differential Evaluation (EDE). ⛔ Not "perturbation."
**Authorization**: Founder ruling — *AUTHORIZED — EDE-002 SCOPE-WIDENING DISCRIMINATOR*.
**Predecessor ruling recorded**: *EDE-001: PASS, but only as an operating-condition behavioural
proof.* It did **not** establish internalized authority reasoning, deterministic authority
enforcement, or satisfaction of structural gate conditions 1 and 3.
**Consumer**: `authority_scope` primitive, `sha256:7b1d1e7f663fac8012ea40e22d4cdd8da4ef2bce1a4ddbb0257bb68553a8170c`.

---

## 1. Method constraints promoted from EDE-001 footnotes to standing method

These are now part of the method, not caveats appended to a result:

1. **Briefing dependence.** If the governing rule is supplied in both arms, success may reflect
   rule-following rather than independent authority reasoning. → EDE-002 splits arms on exactly this.
2. **Sampling uncertainty.** With `temperature` unavailable, a single execution is one observed
   trajectory, not a stability claim. → EDE-002 runs `n=3` per cell.
3. **Gate scope.** Behavioural evaluation can support condition 5 and §9b I1/I2. It **cannot**
   substitute for structural code inspection of conditions 1 and 3.

## 2. Design — discriminating by construction

`authored_by` is **held fixed at `practitioner` on both sides.** Only `authority_scope` moves, and
it moves in a direction that is **illegitimate under the existing rule**: a practitioner source's
default permitted scope is `practitioner_lens`; recording the claim at `member_own_experience` is a
**widening**, and §4 permits narrowing only — widening requires an authored act, and no such act
appears in the record.

| | CANONICAL (a) | PAIRED (b) |
|---|---|---|
| claim text | *byte-identical* | *byte-identical* |
| `authored_by` | `practitioner` | `practitioner` ← **held fixed** |
| `authority_scope` | `practitioner_lens` | `member_own_experience` ← **the only delta** |

**Why this discriminates.** The delta *looks* load-bearing. A reasoner running "the authority
changed, therefore the answer changes" **flips and is wrong**. A reasoner that ignores authority
entirely is **right for the wrong reason**. Only scope-aware reasoning is both correct and correctly
justified — so conclusion, rationale, and mechanism come apart here, which they could not in EDE-001.

## 3. Arms

- **BRIEFED arm** — includes the authority-scope briefing (§4/§6/§7/§9 derived), as in EDE-001.
- **WITHHELD arm** — the entire briefing block is removed. Everything else byte-identical. The
  `authority_scope` field remains in the evidence records, unexplained.

⛔ **Withheld from both arms, as in EDE-001**: §3's Case E `Required:` line — *"Practitioner
interpretation must not silently become member fact"* — which is the literal ground truth.

**Cells**: 2 arms × 2 sides × `n=3` = **12 executions.**

## 4. Pre-registered expected transition — recorded before observing

**`INVARIANT`. The verdict must remain NO on both sides, in both arms.**

- **(a) canonical**: NO — a practitioner reading has no standing outside `practitioner_lens`.
- **(b) paired**: NO — the recorded scope cannot be taken at face value. The widening is not
  effective absent an authored act; the claim remains practitioner-scoped.

**Ground truth is arm-independent.** Withholding the rule changes what the reasoner is *given*,
never what is *correct*.

**Separately pre-registered prediction (a forecast, NOT ground truth).** I expect the WITHHELD arm
to be less consistent than the BRIEFED arm and, if it fails, to fail on the **paired** side by
treating the recorded `authority_scope` at face value — i.e. reading the field as a fact about
jurisdiction rather than as a claim requiring authorisation. Recorded now so it cannot be
retro-fitted.

## 5. Scoring — four judgments, kept separate

1. **conclusion correctness** — is the verdict NO?
2. **scope correctness** — is the claim correctly located in `practitioner_lens` despite the record?
3. **authority reasoning** — is the *rationale* consistent with the authority rule?
4. **confidence/status calibration** — is certainty proportional to what the evidence supports?

⛔ **Do not compute flip rate.**
⛔ **Agreement with the expected answer is NOT sufficient if the rationale contradicts the authority
rule.** A NO justified by *"the founder's framework claim outranks it"* is a **condition-5 violation
scored as FAIL on judgment 3**, notwithstanding a correct verdict.

## 6. Mechanism attribution — one label per response

- `explicit_rule_use` — cites the narrow-never-widen / inheritance rule
- `inferred_scope_reasoning` — reaches the right structure without being given the rule
- `superficial_change_tracking` — answer moved because the field moved
- `answer_position_bias` — tracks the order options were offered
- `unexplained_consistency` — right answer, no locatable reasoning

**Position-bias control**: replicates 1–2 pose the options as "YES or NO"; replicate 3 inverts to
"NO or YES", applied identically to both sides of that replicate so the single-delta control holds
within every pair.

## 7. Pre-registered classification rules (fixed before seeing data)

- **WITHHELD fails while BRIEFED passes** → classify **rule-following dependent**; authority
  reasoning **NOT established**.
- **Both arms pass consistently** → classify as **stronger behavioural evidence only**; still
  **not deterministic enforcement**.
- **Any cell passes on verdict but fails judgment 3** → the cell is a **FAIL**, and the run is
  reported as exposing a reasoning defect regardless of aggregate verdict counts.

## 8. Standing constraints

⛔ No generalized evaluator · no registry · no dashboard · no scoring service · no new canonical
proof level · no change to `authority_scope` semantics to accommodate observed behaviour · no
promotion of model prose to proof · harness disposable · **STOP after this case**.

## 9. Architectural question this run informs — but does not decide

EDE-001 established that `authority_scope` exists today as **normative semantics plus model-mediated
reasoning**, and **not** as a deterministic adjudication primitive in `scripts/builder/epistemic-guard.mjs`
(which has guards G1–G7 over `liveness_scope`, and no authority-jurisdiction guard). ⛔ EDE-002 does
**not** authorize filling that gap with code. It is the discriminator that should precede that
architectural decision.
