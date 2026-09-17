# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — J8 retrieval witness STOP

**Date:** 2026-09-17  
**Class:** Production retrieval witness + canonical-path repository census.  
**Standing:** **J8 STOP.** J9 and J10 are not open.  
**Production corpus:** J7 PASS — 1,238 rows / 1 source / 1,238 embeddings, frozen chunk-set SHA-256 `87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852`.

## 1 · Gate question

J8 asks whether MAIA can retrieve the intended governed knowledge — and only it — through the production path that actually serves members.

A database similarity query is insufficient. The witness must reach the same retrieval seam the canonical member turn uses.

## 2 · The corpus itself is retrievable

`lib/ain/knowledge/RetrievalService.ts` was exercised against the production database and host Ollama using the exact deployed image.

Witness query:

> What is the crystal of self-knowledge and how do its elemental facets relate to awareness?

Results:

- unfiltered retrieval: **3 / 3** results from Elemental Alchemy;
- `somatic` mode: **3 / 3** results from Elemental Alchemy;
- `care` mode: **3 / 3** results from Elemental Alchemy;
- similarities approximately **0.6932 / 0.6680 / 0.6464**;
- **zero foreign sources** returned;
- `talk` mode: **0 results**.

This proves the 1,238 vectors are usable and the retrieval service can return the governed subject. It does **not** prove the canonical MAIA turn consumes them.

## 3 · Canonical member path is not wired to AIN row retrieval

The production-serving route is `POST /api/sovereign/app/maia/list` (`app/api/sovereign/app/maia/list/route.ts`). Its own comments identify the sibling `/api/sovereign/app/maia/route.ts` as dormant and `/list` as the live sovereign chat path.

Direct census found:

- production `AIN_KNOWLEDGE_GATE_ENABLED=1`;
- `/maia/list` runs `scoreKnowledgeGate(...)` and builds `knowledgeGateAddendum`;
- that addendum is **source-well weighting text only**;
- `/maia/list` does not import or call `retrieveForMode(...)` or `retrieveKnowledge(...)`;
- `/maia/list` has **zero producer** of `ainKnowledgeContext` or `ainKnowledge`;
- its live `getMaiaResponse(...)` meta assembly passes `knowledgeGateAddendum` but not `ainKnowledgeContext` / `ainKnowledge`;
- `lib/sovereign/maiaService.ts` can consume `ainKnowledgeContext`, but does not retrieve `ain_knowledge_chunks` itself;
- the only repository producer of `ainKnowledgeContext` / `ainKnowledge` found by census is `lib/consciousness/maiaOrchestrator.ts`, which is not the canonical `/maia/list` serving path.

Therefore the governed rows are **persisted and searchable but do not presently cross into the canonical member turn**.

## 4 · Secondary retrieval-metadata finding

All 1,238 ingested rows currently carry:

```text
domain: somatic
categories: [somatic, alchemy, shamanic]
```

This metadata comes from `ChunkingService.classifySource()`, which scans the filename plus the first 5,000 characters and assigns the **first matching domain**. `somatic` is tested before `jungian` and `consciousness`.

`RetrievalService` applies both domain and category filters. Its default `talk` mode admits domains `jungian / consciousness / philosophy`, so the current corpus returns **0** in `talk` even though unfiltered, `somatic`, and `care` retrieval succeed.

This is a separate defect from the canonical wiring gap. Fixing only one does not close J8.

## 5 · J3/J4 attestation blind spot exposed by J8

The frozen `chunkSetDigest()` binds only:

- `sourceFile`;
- `chunkIndex`;
- SHA-256 of `chunkText`.

It does **not** bind `domain`, `categories`, `sourceTitle`, or `chunkTokens`, even though `domain` and `categories` materially control whether retrieval can occur.

The J7 transaction did verify stored metadata against the freshly rebuilt chunks, so J7 did what its code promised. But the frozen J3/J4 digest does not independently attest the retrieval metadata that J8 depends on.

This is an evidence-model gap, not authorization to rewrite production rows.

## 6 · Adjudication

**J8: STOP.**

What is proved:

- J7 production corpus exists exactly as committed;
- vectors are valid and semantically retrievable;
- controlled eligible-mode retrieval returns only the governed source;
- the canonical member route is not wired to the AIN retrieval service;
- the current auto-classified retrieval metadata excludes the corpus from `talk` mode;
- the frozen chunk-set digest does not bind retrieval metadata.

What is not proved:

- that a normal canonical MAIA member turn can retrieve Elemental Alchemy;
- that the current domain/category model represents the intended governed retrieval semantics;
- that J3/J4 evidence is sufficient for a repaired retrieval contract.

## 7 · Repair boundary

No production repair is authorized by this STOP record.

Before J8 can be rerun, a governed repair must answer three questions in order:

1. **Canonical seam:** where does bounded AIN retrieval enter `/maia/list` so the existing Knowledge Gate governs *retrieved evidence*, not merely source-weighting instructions?
2. **Retrieval metadata authority:** should `domain` / `categories` be deterministic heuristics, explicitly governed corpus metadata, or another bounded representation?
3. **Attestation:** which retrieval-relevant fields must be frozen in J3/J4 so a later J8 result is evidence of the same governed build rather than an unbound metadata interpretation?

Any repair that changes persisted corpus metadata must use a governed withdrawal/replacement path; direct production `UPDATE` is not an acceptable substitute.

## 8 · Standing

```text
J0 ✅  J1 ✅  J2 ✅  J3 ✅*  J4 ✅*  J5 ✅  J6 ✅  J7 ✅  J8 ⛔ STOP  ·  J9  ·  J10
```

`*` J8 has exposed an attestation question affecting J3/J4 retrieval semantics. Their prior evidence remains historically valid for the exact contract they proved, but J8 cannot close until that question is reconciled for the repaired crossing.

J9 remains closed because representation/provenance cannot be witnessed on a canonical retrieval that does not yet occur. J10 remains independently barred by Law 7 while the alternate Living Library crossing remains unreconciled.
