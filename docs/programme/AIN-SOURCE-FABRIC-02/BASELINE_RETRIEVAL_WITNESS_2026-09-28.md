# AIN-SOURCE-FABRIC-02R2 — Chunking + Baseline Retrieval Witness

**Date:** 28 September 2026
**Parent:** AIN-SOURCE-FABRIC-02R1
**Class:** offline benchmark only

## Boundary

This act created:

- deterministic Markdown chunking;
- a bounded oversized-source policy;
- an in-memory BM25 lexical baseline;
- an in-memory local semantic baseline using Ollama `nomic-embed-text`;
- raw-discovery and governed-aperture variants;
- fixed benchmark evidence artifacts.

It changed no production index, database, Obsidian source, MAIA prompt, House retrieval path, or Indra runtime.
## Fixed chunk corpus

The 26-source corpus becomes:

- **1,735 chunks**
- approximately **95,808 tokens**
- chunking hash: `e1d6d7da2b04ecb77543738b301f803cc6b551d2d194f5ededf4c2c3ffd8a685`

Normal sources are fully represented.

The 8.5 MB Elemental Alchemy manuscript is deliberately capped at **80 deterministic chunks** so it cannot dominate by volume alone.

The bounded sample explicitly retains the Lambspring / Edinger / individuation evidence required by the benchmark.
## Baselines

### Lexical

Reference BM25 over the fixed chunks.

Source ranking collapses chunk results by **best chunk per source** before returning the top 8 sources.

### Semantic

Local `nomic-embed-text`:

- 768-dimensional embeddings;
- same fixed chunk corpus;
- cosine similarity;
- same best-chunk-per-source collapse;
- top 8 sources.

No reranker, graph expansion, temporal graph, hybrid fusion, or abstention threshold is present yet.
## Overall governed result

| Metric | BM25 | Semantic |
|---|---:|---:|
| Must-source recall | **0.8773** | **0.9259** |
| Helpful recall | 0.7986 | 0.8160 |
| Counterevidence recall | 1.0000 | 1.0000 |
| Bridge recall | 0.9722 | **1.0000** |
| Permission hard-fail queries | **0** | **0** |
| Average irrelevant rate | 0.7222 | **0.7014** |
| Useful evidence / 1k returned tokens | **5.95** | 5.46 |
| Negative-control false-positive queries | 6 / 6 | 6 / 6 |

Semantic is stronger on overall coverage.

BM25 is more context-efficient in this simple top-8 configuration.

Neither baseline has a satisfactory abstention mechanism.
## Permission result

Raw discovery deliberately ignored query apertures.

The result:

- raw BM25: **4 hard-fail queries**
- raw semantic: **6 hard-fail queries**

After Source Fabric aperture filtering:

- governed BM25: **0 hard-fail queries**
- governed semantic: **0 hard-fail queries**

Must-source recall was unchanged by governance for each method.

This is direct evidence for the constitutional ordering:

> **permission is a gate, not a relevance weight.**
## Query-family differences

Semantic retrieval materially improved:

- semantic paraphrase: **1.00** must recall vs BM25 **0.833**
- temporal supersession: **0.917** vs **0.750**
- global / corpus-wide inquiry: **0.806** vs **0.528**
- diversity: **0.722** vs **0.667**

BM25 remained extremely strong on:

- exact lexical: **1.00**
- graph-bridge fixtures: **1.00** must recall
- analogy fixtures: **1.00** must recall

The simple semantic model did not dominate every associative-style fixture.
## Corpus-callosum crossover

On must-source recall:

**BM25 uniquely outperformed semantic on 3 queries:**
- `G6`
- `A3`
- `D5`

**Semantic uniquely outperformed BM25 on 7 queries:**
- `S5`
- `C2`
- `T5`
- `P4`
- `P5`
- `D6`
- `B2`

**62 queries tied.**

The disagreement is not noise: the unique wins occur on different inquiry structures and recover different required jewels.
## Oracle-union diagnostic

A diagnostic union of the two governed top-8 lists—not a production hybrid ranker—reaches:

- **0.963 must-source recall**
- **66 / 72 queries with full must-source coverage**
- 2 queries improved beyond the better single lane

Family-level union reaches full must coverage on:

- exact lexical;
- semantic paraphrase;
- cross-source;
- graph bridge;
- temporal supersession;
- analogy;
- permission control;
- ablation.

Remaining weakness is concentrated in:

- contradiction;
- global;
- diversity.

This provides empirical support for coordinated parallel retrieval.
## The abstention problem

Both baselines returned at least one source for all six negative controls.

That means:

> **retrieval relevance alone does not know when the corpus has no answer.**

The next architecture needs an explicit abstention / evidence-sufficiency layer.

The system must be able to say:

> “I found adjacent material, but nothing in the admitted corpus actually supports this inquiry.”

This is as important as improving recall.
## Interpretation

The first real tournament supports the bilateral architecture:

### Analytic contribution

BM25 preserves rare exact terms and several useful cross-domain anchors with high context efficiency.

### Associative contribution

Semantic retrieval improves paraphrase, global synthesis, current-state / temporal queries, and several cross-source relations.

### Corpus-callosum implication

Neither lane should replace the other.

The next layer should coordinate both result sets, remove redundancy, enforce abstention, preserve counterevidence, and rerank for inquiry-specific usefulness.

Aether synthesis remains downstream of that governed source constellation.
## Durable evidence

- `baseline/chunk-manifest.json`
- `baseline/baseline-results.json`
- `baseline/baseline-summary.json`
- `baseline/complementarity-diagnostic.json`
- `scripts/source-fabric/run-baseline.ts`
- `lib/ain/source-fabric/benchmark/chunking.ts`
- `lib/ain/source-fabric/benchmark/baselines.ts`

Local embedding vectors are cached only under `/tmp` and are not committed.

## Verification

Full contract + benchmark + baseline evidence suite:

> **36 / 36 PASS**

## Next boundary

> **AIN-SOURCE-FABRIC-02R3 — GOVERNED LEXICAL+SEMANTIC FUSION + ABSTENTION + CALLOSAL RERANKING ONLY**

No graph expansion yet.

First prove that the two existing lanes can coordinate well before adding a third source of complexity.
