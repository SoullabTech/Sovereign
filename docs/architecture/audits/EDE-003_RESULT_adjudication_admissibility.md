# EDE-003 — Result (executed)

**Companion**: `EDE-003_PREREGISTRATION_adjudication_admissibility.md` — on disk before execution,
unedited.
**Status**: ✅ **EXECUTED.** 15 runs: 4 cells × n=3 withheld, + 3 briefed control on the critical cell.
**Headline**: ⭐ **H-A IS FALSIFIED IN ITS STATED FORM — and the falsification is more useful than a
confirmation would have been.** The defect is not over-adjudication on disjoint scopes. It is
**under-adjudication everywhere**, produced by a different operative theory than the one canon holds.

---

## 1. Verdict matrix

| arm | cell | factors | expected | observed (n=3) | match |
|---|---|---|---|---|---|
| withheld | **A1** | agree + disjoint | NO | NO · NO · NO | **3/3** ✅ |
| withheld | **A2** ⭐ | disagree + disjoint | NO | NO · NO · **YES** | **2/3** |
| withheld | **A3** | agree + intersect | NO | NO · NO · NO | **3/3** ✅ |
| withheld | **A4** | disagree + intersect | **YES** | NO · NO · NO | **0/3** ❌ |
| briefed | **A2** | disagree + disjoint | NO | NO · NO · NO | **3/3** ✅ |

**Factor-isolation control**: A1 vs A2 differ in 4 lines, **all inside the `c-9002` text block**;
author, scope and every other line byte-identical. The content factor is cleanly isolated.

## 2. H-A — falsified

> **H-A**: an unbriefed reasoner will incorrectly treat disagreement across disjoint scopes as
> requiring authority adjudication.

**A2 answered NO in 2 of 3 replicates.** The unbriefed reasoner did **not** systematically
over-adjudicate on disjoint scopes. Per the pre-registered rule, H-A is **not confirmed**, and the
"isolated primitive" reading it supported is **withdrawn as stated**.

⚠️ **My forecast was falsified for the second consecutive run** — I predicted A2 would fail in a
majority of replicates. It passed in a majority. Both EDE-002's and EDE-003's forecasts are now on
the record wrong, and they stay there.

## 3. ⭐ What was actually found: a rankability theory, not a jurisdiction theory

The rationales make the mechanism unambiguous. Unbriefed, the reasoner operates a **different
operative theory** of what constitutes an authority contradiction:

> **A4 · rep1**: *"A contradiction requiring adjudication presupposes an authority differential or a
> supersession marker that lets one claim displace the other. The records contain neither."*
> **A4 · rep2**: *"But that is not an* authority *contradiction… Nothing in the record ranks one
> above the other… Adjudication requires an authority differential the record does not contain."*
> **A4 · rep3**: *"An* authority *contradiction requires a differential in authority… Adjudication
> would require a tiebreaker the evidence does not contain."*

| | canonical theory (§7) | the model's unbriefed theory |
|---|---|---|
| contradiction exists iff | **scope sets intersect** | **the record supplies a way to rank or resolve** |
| disjoint scopes | not a contradiction | not a contradiction *(no ranking available)* |
| identical scopes | **contradiction — record per side** | **not a contradiction** *(no differential available)* |

⭐ **The two theories agree on every disjoint case and diverge on every intersecting case.** That
single fact explains the whole matrix: A1 ✅, A2 ✅ (mostly), A3 ✅, **A4 ❌ 3/3**.

**It also re-explains EDE-002.** There, the model invoked content-conflict as load-bearing support.
Under a rankability theory that is not an error of enthusiasm — it is the *only* conflict-relevant
fact available when no jurisdictional gate exists. EDE-002's 5/6 and EDE-003's A4 0/3 are **the same
defect seen from two sides**, not two defects.

**The briefing installs the canonical theory cleanly.** Briefed A2, 3/3, verbatim: *"Two claims
conflict only if their scope sets intersect. `practitioner_lens` and `soullab_lineage` are disjoint;
disjoint scopes are not a contradiction."* All three briefed runs additionally flagged, unprompted,
that neither claim holds `member_own_experience` — so *"the member's account of her own withdrawal
remains unmet and must be shown as such rather than filled in by either claim."*

## 4. ⚠️ An evaluator defect, declared — my A4 ground truth is contestable

`authority_scope` §7 says: *"Where scopes do intersect, record per side: provenance · authority_type
· authority_scope · proof state."* **§7 does not require resolution even on intersection.** My
question asked whether a contradiction exists *"one that must be adjudicated rather than simply
held"* — which conflates *a conflict is admissible* with *a conflict must be resolved*. On the
second reading, the A4 answers are substantively right: they retained both claims, refused to
fabricate a tiebreak, and escalated to the practitioner.

**Both readings are reported; neither is suppressed.**

- As an **evaluator defect**: A4's expected verdict was mis-specified against §7, and the cell does
  not cleanly measure what it was built to measure.
- As a **reasoning finding**: independent of the verdict, the *rationales* invert §7's direction —
  they treat scope **identity** as a reason no conflict exists, where §7 makes scope **intersection**
  the condition under which one does. That finding rests on quoted rationale, not on my verdict key,
  and survives the defect.

Per the EDE admissibility rule, the rationale evidence is what carries here.

## 5. Rationale scoring — pre-registered criterion (scope intersection must be load-bearing)

| cell | verdict | rationale |
|---|---|---|
| A1 (withheld) | ✅ 3/3 | ✅ 3/3 — *"differing `authority_scope` values alone do not generate contradiction"* |
| **A2 (withheld)** | 2/3 | ⚠️ **0/3 clean** — both correct verdicts were reached via *"no precedence ordering between them"*, **not** via disjointness. Correct answer, non-canonical route |
| A3 (withheld) | ✅ 3/3 | ✅ 3/3 — rep2 states a correct conjunctive rule: *"contradiction requires competing authority* and *incompatible content"* |
| A4 (withheld) | ❌ 0/3 | ❌ 0/3 — rankability theory, explicitly |
| **A2 (briefed)** | ✅ 3/3 | ✅ **3/3 canonical** — disjointness load-bearing and quoted |

⭐ **The critical cell A2 passed on verdict and failed on rationale in every replicate.** This is the
admissibility rule earning its place on its first application: a 2/3 verdict pass conceals a 0/3
rationale pass. Under EDE-001's or EDE-002's scoring, A2 would have read as a clean result.

**Position control**: the single YES in the entire withheld set fell on the inverted-order replicate
(A2 rep3, *"NO or YES"*). But A4 rep3 used the same inversion and answered NO. ⚠️ **Unresolved at
n=1** — recorded as a possible position sensitivity, not a finding.

## 6. ⭐ Architectural consequence — the proposed gate targets the half that already works

The candidate under consideration was:

```
ADJUDICATION_ALLOWED(A, B)   only if   scope(A) ∩ scope(B) ≠ ∅
```

This is a **blocking** condition: it refuses adjudication when scopes are disjoint. EDE-003 shows
the unbriefed reasoner **already refuses** in exactly that case — A1 3/3, A2 2/3, briefed A2 3/3.
The observed failure is the **affirmative** direction: recognising that intersecting scopes
constitute an admissible contradiction requiring per-side recording (A4, 0/3).

> **A necessary-condition gate cannot fix a defect in the sufficient direction.** Implementing the
> gate as specified would build the half the reasoner already performs, and leave the half it fails
> untouched.

⛔ **This is not a recommendation to build the affirmative half either.** It is a correction to the
target. If a deterministic primitive is ever authorized, EDE-003 says its useful content is
`scope(A) ∩ scope(B) ≠ ∅  ⇒  conflict is admissible and must be recorded per side` — the §7
obligation the model does not hold unaided — and **not** the disjointness refusal, which is the part
model reasoning already supplies.

## 7. Execution path

| | |
|---|---|
| Harness | `…/scratchpad/ede-003.mjs` — disposable; results in `ede-003-result.json` |
| Path | Anthropic Messages API, direct `fetch`; key from `MAIA-SOVEREIGN/.env` |
| Model requested / served | `claude-opus-5` / `claude-opus-5`, all 15 calls |
| Sampling | ⚠️ NOT pinned — `temperature` deprecated for this model. n=3 per cell |
| Executions | 15; several truncated at `max_tokens` with verdict and core rationale intact |
| Checkout | `feature/labtools-redesign` @ `87a972013` |

## 8. Classification

> **EDE-003: H-A FALSIFIED · DEFECT RELOCATED, NOT DISSOLVED.**
> The unbriefed reasoner does not over-adjudicate across disjoint scopes. It operates a
> **rankability** theory of authority contradiction in place of canon's **jurisdictional-overlap**
> theory. The two agree wherever scopes are disjoint and diverge wherever they intersect — which
> explains EDE-002's residual defect and EDE-003's A4 in one mechanism.
> ⚠️ Verdict-level ground truth for A4 is contestable against §7 and is declared as an evaluator
> defect; the finding rests on rationale evidence, which is unaffected.
> ⛔ No deterministic enforcement established. ⛔ Structural gate conditions 1 and 3 untouched.
> ⛔ The proposed admissibility gate is **mis-targeted** as specified.

⛔ No code written. No `authority_scope` implementation. No semantics changed to accommodate
observed behaviour. No model prose promoted to proof.

**STOP.**
