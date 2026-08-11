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

## Not yet built

Scoring (`score.mjs`), the model runner, and Domain B triples. Domain B is where the composition test lives — the program's candidate cheapest decisive falsifier.
