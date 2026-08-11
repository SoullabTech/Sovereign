# ain-perturbation-harness

Domain A corpus for the relational geometry program. **Cat 1 research artifact.** No production dependency, no model calls, no training.

Spec: `docs/specs/RELATIONAL_GEOMETRY_SPECIFICATION.md` · Program: `docs/specs/RELATIONAL_GEOMETRY_PROGRAM_2026-08-11.md`

```bash
node ain-perturbation-harness/src/build-corpus.mjs   # deterministic; same seeds -> identical output
node ain-perturbation-harness/src/verify.mjs         # exit 1 on any construction error
```

## The one design decision everything rests on

**The episode state is structured data. Prose is rendered from it.** No generator model touches the corpus.

If presentation variants were model-generated, any variance in a system under test would be confounded with the generator's choices — and the harness would be measuring two things while reporting one. Rendering mechanically means the only difference between two presentation variants is exactly the feature the transform names.

**Ground truth is derived from structure, never hand-keyed.** This is what makes structural transforms self-validating: reverse the roles and the correct answers move automatically, because they were always a function of the roles. A hand-written answer key can disagree with its own transform. A derivation cannot.

## What `verify.mjs` enforces before any model is contacted

A harness that cannot fail before touching a model is not an instrument. Everything checkable without a model is checked without one:

1. Presentation transforms **must not** move ground truth.
2. Null controls must not move ground truth **and must change the text** — otherwise a deterministic system scores null stability 1.0 trivially and the noise floor measures nothing.
3. `A-S1` must be an **involution**: applied twice it must return baseline structure *and* baseline text. Failure refutes the declared group-like structure (spec §2 R3).
4. Structural items whose ground truth does not move are **weak, not wrong** — reported and excluded from sensitivity scoring rather than silently diluting it.
5. No two conditions of a seed may render identical text. `A-S1x2` is exempt: identical text there *is* the closure proof.
6. Deferred conditions must be declared.

Four real construction defects were caught this way during the first build — including an `A-P2` that never changed the text at all, and name/pronoun incongruence (*"Marcus … she"*) that would have perturbed models for reasons unrelated to relational structure.

## Corpus v1

102 items / 6 seeds — 6 baseline · 48 presentation · 24 structural · 24 null. **18 scorable structural items.**

⚠️ **Declared coverage gap:** `A-P5` (metaphor) and literary register are **deferred**, because they cannot be rendered mechanically without a generator model. Presentation-invariance figures from this corpus therefore **do not cover metaphor**. Recorded in the manifest, not silently dropped.

## Domain B — composition

```bash
node ain-perturbation-harness/src/build-domain-b.mjs
node ain-perturbation-harness/src/verify-b.mjs
```

192 triples / 576 probe items / 24 undefined pairs, from 6 operators over 6 seeds.

For every ordered pair `(τ1, τ2)`: `S0 --τ1--> S1 --τ2--> S2`, plus the composite `S0 ⟶ S2`. Three probe items per triple, all asking the same closed-vocabulary question — *what changed between these two descriptions?* **The composite's ground truth is derived from S0 vs S2 directly, never assembled from the steps.** That is what lets the corpus expose:

```
characterize(S0 → S1)   CORRECT
characterize(S1 → S2)   CORRECT
characterize(S0 → S2)   WRONG
```

`R∘R` is the sharpest case: two correct `roles_reversed` steps whose composite is **nothing changed**. **30 triples** have a composite that differs from the union of their steps — those are the teeth.

### Composition classes are findings, not criteria

| class | n |
|---|---|
| `composition_returns_identity` | 18 |
| `composition_defined` | 156 |
| `composition_order_sensitive` | 6 |
| `composition_information_losing` | 12 |
| `composition_undefined` | 24 (recorded separately) |

Closure is **not** an acceptance criterion — "everything composes" would be a result, and a suspicious one. `verify-b` instead asserts **coverage**: a class with zero instances is undetectable, which is a gap in the instrument rather than a fact about the algebra.

`W` (witness bound to the current recipient) exists solely because the other five operators all commute. Without a role-dependent operator, order-sensitivity was untestable. `W∘R ≠ R∘W`: the witness lands on the agent in one order and the recipient in the other.

### What verify-b caught

It refuted **the declared structure of my own operators, twice.** `V` and `A` were declared involutions but were not: flipping back restored the coarse class while writing a *canonical* type and detail rather than the original. `V` collapses `{withdraws, confronts}`; `A` collapses `{betrays, breaks_promise, withholds}`. So `V∘V` reported "nothing changed" while the rendered text differed. Fixed by stashing `{type, detail}` so the operators are involutions on the **full state** — not by weakening the claim.

## Domain A is frozen

Corpus identity `d30a95a50e4364c8…`, commit `c8ed036cf`. The renderer was extended for Domain B (instigator, witness, absent response); every branch is a strict no-op for A, verified by hash on each rebuild. **No improvements to A while B is in use** unless the verifier exposes an actual defect — a benchmark that keeps moving cannot be compared against.

## Scoring

```bash
node ain-perturbation-harness/src/score.mjs --selftest
node ain-perturbation-harness/src/score.mjs --run <run.json> [--json]
```

Model-agnostic: it knows nothing about any provider and consumes a normalized answer record. Domain A answers are participant **names as presented**; the scorer inverts them to role keys via `item.names`, so invariance is measured on **roles** and a rename can never look like a changed judgment.

Reports a **profile, never a scalar** — a system that is highly invariant but structurally insensitive is doing something very different from one that is sensitive but noisy. Every figure is `correct / scorable`, never a bare percentage.

```
DOMAIN A   baseline_accuracy · presentation_invariance · structural_sensitivity
           reversal_sensitivity · null_robustness
DOMAIN B   step_accuracy · composition_consistency · identity_return
           order_sensitive · information_loss
           steps-right / composite-wrong          <- the diagnostic B exists for
```

Two rules baked in:

1. **Unscorable is not incorrect.** A missing answer is `unanswered`, reported separately, never folded into the error count.
2. **Eligibility comes from ground truth, not transform labels.** A structural transform that leaves ground truth unchanged is not a failed sensitivity case — it is not a sensitivity case at all.

Invariance and robustness are measured against the **baseline answer**, not against truth: the question is stability of judgment, and a system can be stably wrong. Accuracy is reported separately by `baseline_accuracy` so the two never blur.

### The self-test proves the metric has teeth before any model exists

`--selftest` synthesizes two runs and asserts the scorer separates them:

| run | steps | composition | identity-return | caught |
|---|---|---|---|---|
| `oracle` (answers from ground truth) | 384/384 | **192/192** | 18/18 | 0 |
| `local_matcher` (steps correct, composite = union of step labels) | 384/384 | **162/192** | **0/18** | **30** |

`local_matcher` is exactly the failure mode Domain B was built to catch: locally competent, globally inconsistent. It is perfect on every step and caught on precisely the 30 teeth triples. If the scorer could not separate these, it would not be an instrument regardless of what any model later scores.

### ⚠️ Declared scoring gap

`undefined_case_handling` reports **`NOT_SCORABLE`**. The corpus records 24 undefined operator pairs but emits **no probe items** for them, so a model confidently inventing a defined composite cannot be observed. Closing this needs a Domain B v2 amendment adding an applicability probe. B is frozen at `d6164dd8e` — unfreezing is a founder decision, not a scorer decision.

## Not yet built

The model adapter, and first baseline.
