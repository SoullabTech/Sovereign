# Results — AIN Context/Memory Behavioral Contribution Probe

**Protocol frozen at commit `c16b6be14` before first run.** Executed 2026-08-11. 40 items × 3 variants × 3 model arms + retrieval-only arm. **0 API errors**, 0 exclusions.

Model: `claude-opus-5` · Embedder: `nomic-embed-text` (768-dim, local Ollama) · K=4 · pooled store 160 atoms · seed 20260811.

## Deviations from the frozen protocol

Recorded, not silently amended. All three were discovered by failed runs; failed-run artifacts retained in `raw_failed_run_D1/` and `raw_failed_run_D3/`.

| ID | Deviation | Cause |
|---|---|---|
| **D-1** | `temperature: 0` removed | API returns HTTP 400 — *"`temperature` is deprecated for this model"* on `claude-opus-5`. **Consequence: sampling determinism was not achieved.** Results are single-sample, not reproducible-by-construction. |
| **D-2** | `max_tokens` 64 → 512 | The model emits a `thinking` block before the text block; 34 of 64 tokens went to thinking on a trivial item, risking answer truncation. |
| **D-3** | Text extraction now joins all `type==='text'` blocks | Original extractor read `content[0].text`, which is the `thinking` block. It silently returned `''` for all 120 calls, scoring every arm 0/40 — including the full-context ceiling. Caught because **Arm D at 0/40 was implausible**, not because anything errored. |

D-3 is worth keeping visible: a scoring pipeline that returns a uniform null result across all arms looks like a clean negative finding. The ceiling arm is what exposed it. Any future rail should keep a known-good ceiling for exactly this reason.

## Primary result

| Arm | Configuration | Pair-correct (flip rate) |
|---|---|---|
| **A** | Claude + AIN retrieval path | **13/40 = 0.325** |
| **B** | Claude, no context | **0/40 = 0.000** |
| **D** | Claude + full item context, no retrieval | **36/40 = 0.900** |

- **Attribution delta (A − B): +0.325**, 95% CI **[0.200, 0.475]** — excludes zero.
- **A − D: −0.575**, 95% CI **[−0.725, −0.425]** — excludes zero.

Single-side accuracy: A canonical 13/40, A perturbed 14/40; D canonical 37/40, D perturbed 37/40; B 0/40 both sides.

**Arm B abstained honestly on 80/80 items** — it answered `UNKNOWN` every time rather than guessing. The floor is a real floor, not noise.

## Retrieval-only measurements (Arm C)

| Measure | Value |
|---|---|
| Median Jaccard, retrieved set canonical vs perturbed | **1.000** |
| Mean Jaccard | 1.000 |
| Mean cosine displacement, **load-bearing** edit | **0.0549** |
| Mean cosine displacement, **control** (non-load-bearing) edit | **0.1538** |
| Load-bearing atom recall@4 | **0.475** |
| Mean own-item atoms in top-4 | **1.50** of 4 |

## Falsification adjudication (against pre-registered criteria)

**H1 FALSIFIED?** Criterion: median Jaccard ≥ 0.9 **AND** attribution-delta CI contains zero.
Median Jaccard = 1.000 ✓. CI = [0.200, 0.475], excludes zero ✗. → **Not falsified by this conjunction.**

**H0 FALSIFIED?** Criterion: attribution-delta CI excludes zero **AND** mean cosine displacement significantly larger for load-bearing than control edits.
CI excludes zero ✓. Displacement LB (0.055) is **~3× smaller** than control (0.154) — the opposite of the required direction ✗. → **H0 not falsified.**

**Neither criterion triggered. H0 survives.** No post-hoc threshold adjustment was made.

## What actually happened

The positive attribution delta is real but **uninformative about architecture**, exactly as pre-registered: B sits at a structural floor because the load-bearing facts exist only in memory. `A > B` here means *"supplying relevant facts beats supplying none"* — a statement about information, not about AIN.

The informative comparison is **A vs D**, and it is decisively negative. Given the identical facts, removing the retrieval layer nearly triples performance: 0.325 → 0.900.

The mechanism is unambiguous:

- **A correct when the load-bearing atom was retrieved: 27/38 (71%)**
- **A correct when it was not: 0/42 (0%)**

Retrieval surfaced the decisive fact **47.5%** of the time. Of four retrieved atoms, on average only **1.5** came from the relevant item — the other 2.5 were cross-item distractors. When the decisive fact was missing, Arm A did not hallucinate; it correctly said `UNKNOWN`. The failure is **retrieval recall**, not model reasoning and not fabrication.

The embedding measurement explains why. A minimal edit that **reverses the correct answer** (`Thursday`→`Tuesday`) moves the vector by 0.055. An incidental edit that **changes nothing** (`Oak Street`→`Pine Street`) moves it by 0.154 — roughly three times as far. The embedding space is systematically *less* sensitive to the semantically load-bearing change than to a decorative one. Cosine proximity in this space does not track logical relevance.

## Permitted statements (from the frozen interpretation table)

- **A > B** → AIN context/memory contributes behaviorally on this rail — *contextual scaffolding gain*. **Qualified: B is at a structural floor; this comparison is close to trivially true and should not be cited as an architectural result.**
- **A < D** → **Retrieval selection loses most of the information the store contained.** This is the substantive finding.
- Embedding geometry does not track load-bearing relevance on this rail.

**None of the above establishes learned geometry.** No result here is evidence of learned representation geometry, internal manifold formation, training effects, weight adaptation, or Sophontic-like architecture. AIN contains no training code; a behavioral rail cannot create one.

## Limits

1. **D-1 means results are single-sample under model-default sampling.** Effect sizes are large relative to the CIs, but exact reproduction is not guaranteed. Re-running would strengthen this.
2. Synthetic corpus of deterministic 2-hop inferences. Real member memory is messier and often has no single correct answer; low flip rate here does not imply MAIA's felt continuity is worthless — continuity and deductive retrieval are different jobs.
3. K=4 over a 160-atom pool is a deliberately hard setting chosen to equalize context volume with Arm D. A larger K would likely raise A. **This measures the configuration as specified, not the best achievable configuration.**
4. This rail reimplements AIN's retrieval seam using AIN's embedder and rendering shape; it is not the live production stack.
5. Nothing here tests Sophontic's claims, which remain unusable pending release artifacts.

## STOP

Analysis ends the unit. No architectural implementation follows automatically from this result. In particular, the low recall@4 is **not** authorization to retune production retrieval — that would be a separate, scoped change with its own review.
