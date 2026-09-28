# AIN-SOURCE-FABRIC-01 — Existing Retrieval Substrate Census

**Date:** 28 September 2026
**Base:** `956ed92ac36121e0df4cfa64e40cb2d9d1642ebb`

## Existing constitutional direction

ADR 004 already rules:

> one knowledge-ingestion / retrieval engine, many scopes.

The canonical direction is the `library_*` substrate.

Source Fabric therefore must govern and orchestrate that substrate rather than introduce a parallel RAG engine.

## Verified present Library capabilities

`LibraryService` currently provides:

- local embeddings over `library_chunks.embedding`;
- PostgreSQL full-text search over `content_tsv`;
- source provenance in every returned chunk;
- source-level distillates;
- source review / quality fields in the Library model;
- global retrieval authority filtering;
- search logging;
- optional source-type filters;
- existing element-context boost logic.

## Important current limitation

The current top-level `search()` does **not** yet fuse lexical and semantic result sets.

Observed behavior is:

1. semantic search first;
2. full-text search only if semantic returns no chunks.

Therefore the repository has both semantic and lexical machinery, but the present orchestration is fallback-based rather than a true fused hybrid ranker.

Source Fabric must not document fused hybrid behavior as already live.

## Authority path

`globalRetrievalAuthority.ts` constrains global Library retrieval to exact governed source path + SHA-256 pairs admitted by the corpus declaration.

This is materially important:

> storage in `library_sources` does not itself grant global retrieval authority.

Both semantic and full-text Library queries consume this authority boundary.

## Not verified as present Source Fabric capabilities

This act does not claim current live support for:

- fused lexical + semantic ranking;
- multi-vector / late-interaction retrieval;
- a canonical property graph for all knowledge;
- temporal graph validity and supersession;
- hierarchical graph communities;
- source-diversity reranking;
- contradiction-preserving top-k selection;
- query-time source-use receipts;
- automatic Obsidian incremental graph indexing.

Those remain later implementation / benchmark work.

## Consequence

The correct architecture is additive in **governance**, not additive in retrieval stacks:

```text
existing library_* substrate
        ↓
future retrieval adapters / indexes
        ↓
Source Fabric broker
        ↓
Indra permeability
        ↓
Crystal Center
```

The broker contract remains valid if the underlying retrieval technology changes.
