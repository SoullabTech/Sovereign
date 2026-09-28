# AIN-SOURCE-FABRIC-02R3 — Governed Fusion + Abstention + Callosal Reranking Witness

**Date:** 28 September 2026
**Parent:** AIN-SOURCE-FABRIC-02R2
**Class:** offline benchmark only

## Boundary

R3 coordinates the two already-proven retrieval lanes:

- lexical / BM25;
- local semantic / `nomic-embed-text`.

It adds:

- governed Reciprocal Rank Fusion;
- a conservative metadata-aware callosal reranker;
- focused-vs-distributed evidence sufficiency;
- claim-sufficiency abstention.

It does **not** add graph expansion, community retrieval, a new embedding model, MAIA runtime behavior, Obsidian mutation, or production retrieval.
## Fusion

Each governed lane contributes up to 26 source candidates.

Reciprocal Rank Fusion uses rank position rather than attempting to average incompatible BM25 and cosine scores.

Reference parameters:

- RRF `k = 60`;
- final field size = 8 sources.

The fused record preserves:

- lexical rank;
- semantic rank;
- whether one or both lanes found the source.

This keeps the corpus-callosum exchange inspectable.
## RRF result

Governed RRF over the 72-query benchmark produces:

- must-source recall: **0.9514**
- helpful recall: **0.8403**
- bridge recall: **0.9861**
- counterevidence recall: **1.0000**
- average irrelevant rate: **0.6979**
- source-class diversity: **1.625**
- useful evidence / 1k returned tokens: **7.98**
- permission hard-fail queries: **0**

This materially exceeds the governed semantic-only must-source baseline of **0.9259**.
## Callosal reranking

The first diversity-first reranker was falsified: it increased diversity pressure by displacing stronger evidence and dropped must-source recall to approximately **0.898**.

That design was rejected.

The accepted benchmark reranker is conservative:

- RRF remains primary;
- source metadata overlap is a bounded tie-breaker;
- dual-lane discovery receives a small bounded bonus.

Reference-only parameters:

- metadata weight: **0.003**
- dual-lane bonus: **0.001**

These values are benchmark tuning, not constitutional weights.
## Callosal result

Against plain RRF, the conservative reranker:

- preserves must-source recall at **0.9514**;
- improves helpful recall from **0.8403 → 0.8472**;
- preserves bridge recall at **0.9861**;
- preserves counterevidence recall at **1.0000**;
- lowers irrelevant rate from **0.6979 → 0.6944**;
- raises source-class diversity from **1.625 → 1.639**;
- raises useful evidence / 1k tokens from **7.98 → 8.00**.

The improvement is modest and non-destructive.

That is the accepted R3 criterion.
## Abstention architecture

A single global threshold was tested and rejected.

A broad whole-corpus inquiry can legitimately have moderate evidence spread across many sources, while a local lookup should normally produce more concentrated evidence.

R3 therefore distinguishes:

### Focused inquiry

Evidence is insufficient when all are true:

- lexical and semantic top source disagree;
- semantic top score < **0.68**;
- BM25 top score < **13**;
- top-8 source overlap ≤ **4**.

### Distributed inquiry

For corpus-wide / diversity-style inquiry, evidence is sufficient when:

- top source agrees across lanes; **or**
- average top-3 semantic similarity ≥ **0.64**.

### Claim sufficiency

A request for predictive / destiny authority is rejected when the admitted corpus contains no source class entitled to support that claim.

This is separate from similarity.
## Abstention result

The original lexical and semantic baselines both returned something for all six negative controls.

R3 final result:

- negative controls abstained: **6 / 6**
- valid inquiries falsely abstained: **0**
- remaining negative false positives: **0**

Reason distribution:

- weak distributed evidence: **2**
- weak focused evidence: **3**
- unsupported claim: **1**

The “destined to move to Paris” Dream query is the important case: semantic similarity was relatively high, but the requested claim lacked epistemic standing.

That is a Source Fabric rather than a similarity decision.
## Final R3 field result

With callosal reranking + abstention:

- must-source recall: **0.9514**
- helpful recall: **0.8472**
- bridge recall: **0.9861**
- counterevidence recall: **1.0000**
- irrelevant rate: **0.6111**
- source-class diversity: **1.639**
- useful evidence / 1k returned tokens: **8.00**
- permission hard fails: **0**
- negative false-positive inquiries: **0**
- positive false abstentions: **0**

The lower irrelevant-rate average reflects that unsupported inquiries now return an empty field rather than eight adjacent sources.
## What R3 does not prove

The reference thresholds and reranking weights were tuned while inspecting this fixed benchmark corpus.

Therefore:

> **R3 is an in-corpus architecture proof, not a generalization proof.**

Before runtime use, the abstention and reranking rules require blind or newly constructed queries not used in this tuning cycle.

The constitutional ordering remains valid independently of these numeric values.

No numeric threshold in this witness is promoted to canon.
## Remaining retrieval weakness

R3 still misses some required sources on:

- broad whole-corpus synthesis;
- high-diversity inquiries;
- a small number of claim-boundary queries.

Inspection shows several missing jewels rank outside the final eight in **both** lanes.

That is not a fusion defect.

It is the appropriate target for the later bounded graph/community expansion act.

## Durable evidence

- `r3/r3-results.json`
- `r3/r3-summary.json`
- `lib/ain/source-fabric/benchmark/fusion.ts`
- `lib/ain/source-fabric/benchmark/abstention.ts`
- `scripts/source-fabric/run-r3.ts`
- R3 rule and evidence tests
## Standing

**AIN-SOURCE-FABRIC-02R3 — GOVERNED FUSION PASS · CALLOSAL RERANKING NON-DESTRUCTIVE · ABSTENTION 6/6 NEGATIVE CONTROLS · 0 FALSE ABSTENTIONS · GRAPH EXPANSION STILL CLOSED.**

## Next boundary

> **AIN-SOURCE-FABRIC-02R4 — BLIND ABSTENTION VALIDATION + BOUNDED GRAPH / COMMUNITY EXPANSION ONLY**

Order matters:

1. first validate abstention on unseen synthetic inquiries;
2. then permit one-hop graph/community candidate expansion;
3. route expanded candidates back through permission, provenance, and callosal reranking;
4. no graph edge may grant epistemic authority.

Aether synthesis remains downstream of the governed source constellation.
