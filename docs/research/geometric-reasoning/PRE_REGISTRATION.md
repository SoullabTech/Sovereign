# Pre-Registration — AIN Context/Memory Behavioral Contribution Probe

**Frozen:** 2026-08-11, committed **before** any run. Any deviation after this commit is recorded as a deviation, not edited in.

## Purpose (binding)

Measure the **behavioral contribution of the AIN context/memory path**, not model-weight geometry.

Positive results may **not** be reinterpreted as evidence of learned representation geometry, internal manifold formation, training effects, weight adaptation, or Sophontic-like model architecture. AIN contains no training code (`AIN_INTERSECTION_MAP.md`); no behavioral result on this rail can create one.

## Primary question

Does **A** outperform **B** on the pre-registered paired reasoning metric?

## Arms

| Arm | Configuration |
|---|---|
| **A** | Claude + AIN context/memory path: query embedded via AIN's own `generateLocalEmbedding` (`nomic-embed-text`), cosine top-K retrieval over the **full pooled atom store** (all items), rendered into the prompt |
| **B** | Same Claude, same question, **no context injected** — memory contribution disabled |
| **C** | Retrieval layer alone, no model: cosine displacement + retrieved-set Jaccard, canonical vs perturbed vs control |
| **D** | *(additional comparator, pre-registered here before first run)* Claude + **all four atoms of the correct item supplied directly**, no retrieval |

**Why D is added.** A vs B alone is uninterpretable on this corpus: the load-bearing facts exist only in memory, so B is expected near-floor and `A > B` would be trivially true. D is the information ceiling — the same facts with the retrieval layer removed. `A` vs `D` isolates what AIN's *retrieval* adds or destroys, which is the actual question of interest. Declaring D now, unrun, keeps the comparison honest rather than discovering the need for it after seeing results.

## Corpus (frozen)

`corpus.json` — **40 items**, hand-authored, synthetic. No member content, no production IDs (Sanctuary).

Each item carries 4 atom-like statements, one of which is **load-bearing**, and a question requiring a 2-hop inference from it.

Three variants per item:
- **canonical** — baseline
- **perturbed** — the load-bearing atom edited minimally (≤3 tokens); **the correct answer must change**
- **control** — a *non*-load-bearing atom edited by comparable token magnitude; **the correct answer must not change**

The control variant exists to satisfy the second conjunct of the H0-falsification criterion: generic edit-sensitivity must not be mistaken for load-bearing sensitivity.

Pooled store = all 40 × 4 = **160 atoms**, so retrieval must genuinely discriminate.

## Prompt contract (frozen)

Identical question text across A, B, D. Arms differ **only** in the context block.

- A: `Context from memory:\n{retrieved atoms, newline-bulleted}\n\n{question}`
- B: `{question}`
- D: `Context from memory:\n{all 4 item atoms, newline-bulleted}\n\n{question}`

System prompt, all arms: *"Answer with the single word or shortest phrase that answers the question. If the context does not determine the answer, reply exactly: UNKNOWN."*

`UNKNOWN` is a first-class response, not a failure to parse. It lets B abstain honestly rather than guess, which is what makes floor-level B interpretable.

## Model / version

`claude-opus-5`, `temperature: 0`, `max_tokens: 64`. Model id recorded per response.

## Retrieval parameters (frozen)

- Embedder: `nomic-embed-text` via local Ollama, called through AIN's own `generateLocalEmbedding` semantics (768-dim, verified)
- Similarity: cosine
- **K = 4** (matches the number of atoms per item, so A and D receive equal context volume — any A/D gap is selection quality, not context length)

## Randomization / order

Item order shuffled once with a **fixed seed (`20260811`)**, same order for all arms. Variant order within item fixed: canonical → perturbed → control.

## Scoring (frozen)

- Answers normalized: lowercase, trim, strip trailing period/quotes. Exact match against the expected string or its declared aliases in `corpus.json`.
- **Pair-correct** (the flip-rate unit): an item scores 1 **only if** canonical *and* perturbed are **both** correct. One side right is matching, not reasoning.
- **Control-correct**: scored separately; the control variant must return the canonical answer.
- **Flip rate** = pair-correct / 40, per arm.
- **Attribution delta** = flip_rate(A) − flip_rate(B); 95% CI by bootstrap over items, 10,000 resamples, fixed seed.
- Retrieval metrics (C): median Jaccard of retrieved atom-id sets (canonical vs perturbed), and mean cosine displacement for load-bearing vs control edits.

## Exclusions (frozen)

- API error or timeout after 2 retries → item marked `ERROR`, excluded from that arm's denominator, count reported.
- Malformed/unparseable output is **not** excluded — it scores incorrect.
- No item may be dropped after seeing its score.

## Falsification criteria (frozen, restated from `DECISIVE_EXPERIMENT.md`)

**H0** (ordinary retrieval + prompting explains everything) — predicted in advance.
Retrieval is blind to minimal load-bearing edits: median Jaccard(canonical, perturbed) ≥ 0.9.

**H1 is FALSIFIED if:** median Jaccard ≥ 0.9 **AND** the attribution delta's 95% CI contains zero.

**H0 is FALSIFIED if:** the attribution delta's 95% CI excludes zero **AND** mean cosine displacement is significantly larger for load-bearing than for magnitude-matched control edits.

Mixed or ambiguous outcomes are reported as ambiguous. **No post-hoc threshold adjustment.**

## Interpretation table (frozen)

| Outcome | Permitted statement |
|---|---|
| A > B | AIN context/memory contributes behaviorally — *contextual scaffolding / memory-mediated reasoning gain* |
| A ≈ B | No demonstrated contribution on this rail |
| B > A | AIN context/memory may impair performance on this rail |
| A < D | Retrieval selection loses information the store contained |

**None of the above establishes learned geometry.**

## Preservation

Raw model outputs and the **exact context string supplied per item per arm** are written to `raw/` and retained.

## STOP

Analysis terminates the unit. No architectural implementation follows automatically from any result.
