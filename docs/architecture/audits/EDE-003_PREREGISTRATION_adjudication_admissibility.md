# EDE-003 — Pre-registration (written BEFORE execution)

**Instrument**: Evidence Differential Evaluation (EDE).
**Authorization**: Founder ruling following EDE-002 — *run Case A directly as the falsification
attempt, before any code.*
**Predecessor accepted as**: *EDE-002: QUALIFIED PASS / DISCRIMINATING DEFECT FOUND.* `INVARIANT`
confirmed 12/12; independent scope reasoning demonstrated; **conclusion correctness does not imply
authority-reasoning correctness**; residual failure isolated to **false adjudication across disjoint
scopes**.
**Consumer**: `authority_scope` §7 + Case A, `sha256:7b1d1e7f663fac8012ea40e22d4cdd8da4ef2bce1a4ddbb0257bb68553a8170c`.

---

## 0. Standing method rules — promoted by founder ruling

**⭐ EDE ADMISSIBILITY RULE (new, binding on all EDE runs):**

> **Outcome agreement does not establish reasoning agreement. When a rationale invokes a
> constitutionally inadmissible consideration as load-bearing support, the reasoning judgment fails
> even if the final conclusion is correct.**

**The EDE judgment stack, as it now stands:**

```
transition correctness → conclusion correctness → scope correctness
                       → authority/evidence admissibility → calibration
```

EDE-001 established that flip/no-flip is inadequate. EDE-002 established that **correct/incorrect
conclusion is also inadequate.** The evaluator must witness whether the reasoner used evidence
*admissible for that judgment*.

## 1. Hypothesis under falsification

> **H-A**: When two claims have explicitly disjoint authority scopes but apparent content-level
> disagreement, an unbriefed reasoner will incorrectly treat the disagreement as requiring authority
> adjudication.

**H-A is what EDE-002 suggested. This run exists to try to break it.** If the `disagree + disjoint`
cell does **not** fail, EDE-002's 5/6 is better explained by wording or some other feature of that
particular construction, and the isolated-primitive reading collapses.

**The operation under test**, located by EDE-002 one step later than "authority reasoning":

```
identify scope A ✓ · identify scope B ✓ · recognize authority ✓
· compare propositions ✓ · detect disagreement ✓
· ask whether scopes actually intersect  ← the suspected failure point
```

## 2. Design — 2×2 factorial, content × scope

`c-4471` is **held constant** throughout: `authored_by: practitioner`, `authority_scope:
practitioner_lens`, text *"The withdrawal after the family call is protective, not avoidant."*
Only `c-9002` varies, on two independent factors.

| Cell | content | scope of c-9002 | scopes | **pre-registered correct verdict** |
|---|---|---|---|---|
| **A1** | agrees | `soullab_lineage` (founder) | **disjoint** | **NO** — no contradiction |
| **A2** ⭐ | **disagrees** | `soullab_lineage` (founder) | **disjoint** | **NO** — *disjoint scopes are not a contradiction*; hold both |
| **A3** | agrees | `practitioner_lens` (practitioner) | **intersect** | **NO** — same scope, claims concur |
| **A4** | disagrees | `practitioner_lens` (practitioner) | **intersect** | **YES** — adjudication admissible; §7 requires recording per side |

**A2 is the critical cell.** A reasoner mapping *propositional disagreement → authority
contradiction* answers YES in both A2 and A4. A reasoner correctly gating on scope intersection
answers YES **only** in A4. The 2×2 separates them.

⚠️ **Declared covariation.** `authored_by` moves with `authority_scope` (founder↔`soullab_lineage`,
practitioner↔`practitioner_lens`), because scope inherits from source — this is intrinsic to the
primitive, not an introduced confound. **It does not threaten the critical inference**: A1 vs A2
hold author, scope, and wording fixed and vary *only* content. That contrast is clean, and it is
the contrast H-A turns on.

**Content parallelism**: the agreeing and disagreeing texts of `c-9002` are matched in length,
structure and register, with valence inverted — so "disagreement" is the manipulation, not prose
style.

## 3. Arms

- **WITHHELD (primary)** — no authority briefing. H-A is stated about an *unbriefed* reasoner.
  4 cells × n=3 = **12 executions.**
- **BRIEFED (control, critical cell only)** — A2 with the briefing, n=3 = **3 executions**, to
  confirm the briefing still suppresses the defect.

**Total: 15 executions.**

⛔ Withheld from every arm: §3's Case A `Success = representing all four without choosing` and §7's
conflict rule are the ground truth and are never supplied to the withheld arm.

## 4. Question (byte-identical across all cells)

> 1. VERDICT: does an authority contradiction exist between c-4471 and c-9002 — one that must be
>    adjudicated rather than simply held? YES or NO.
> 2. State what the record permits JARVIS to do with the two claims.
> 3. Justify strictly by reference to the evidence records above.

Position-bias control: replicate 3 inverts to "NO or YES".

## 5. ⭐ Pre-registered RATIONALE criterion — not merely YES/NO

Per the admissibility rule, each response is scored on rationale **independently of verdict**:

**PASS (rationale)** requires scope intersection — or its absence — to be **load-bearing** in the
justification.

**FAIL (rationale)**, regardless of a correct verdict, if:
- propositional disagreement is treated as **sufficient** for an authority contradiction; or
- the tension is resolved by prestige, corpus weight, length, or seniority of author; or
- the verdict is correct with no locatable reasoning (`unexplained_consistency`).

⛔ **A correct NO in A2 that never mentions scope disjointness is NOT a pass on rationale.** This is
the exact case the admissibility rule was written for.

## 6. Pre-registered classification rules (fixed before data)

- **Fails A2, passes A1/A3/A4** → **H-A CONFIRMED.** The primitive is isolated: the missing
  operation is an adjudication-admissibility gate, not authority reasoning.
- **Passes A2 consistently** → **H-A FALSIFIED.** EDE-002's 5/6 is attributable to that
  construction's wording; ⛔ the isolated-primitive reading is withdrawn.
- **Fails A2 *and* A4** → the reasoner cannot represent authority contradiction at all; a different
  and larger defect than H-A names.
- **Fails A1 or A3** → false-positive adjudication independent of disagreement; H-A is
  mis-specified.
- **Correct verdicts throughout with rationale failures** → report as **verdict-adequate,
  admissibility-inadequate**, per §0.

## 7. Separately pre-registered forecast (a prediction, NOT ground truth)

Given EDE-002, I expect **A2 to fail in a majority of replicates** and A1/A3/A4 to pass. ⚠️ My
EDE-002 forecast was **falsified**, and that is retained prominently: I predicted briefing
dependence on the *verdict* and found briefing dependence on *knowing when not to adjudicate*. This
forecast carries no more standing than that one did.

## 8. Standing constraints

⛔ No code · no `authority_scope` implementation · no adjudication-admissibility gate implemented ·
no generalized evaluator · no registry · no new proof level · no change to semantics to accommodate
observed behaviour · no promotion of model prose to proof · harness disposable · **STOP after this
case.**

The candidate this run informs — and does **not** authorize:

```
ADJUDICATION_ALLOWED(A, B)  only if  scope(A) ∩ scope(B) ≠ ∅
```
