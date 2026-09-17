# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — J8 repair charter

**Date opened:** 2026-09-17
**Class:** Contained repository repair. No deploy. No production corpus mutation.
**Base:** `27f9408e33ca05eaf0c73b306dfa016f48948a3e` — J8 STOP frozen before repair.
**Branch:** `feature/jarvis-gkf-j8-repair-20260917`

## 1 · Repair subject

J7 proved the governed Elemental Alchemy corpus exists exactly in production. J8 then proved two different facts that must not be collapsed:

1. the vectors are semantically retrievable and return zero foreign sources when queried through an eligible retrieval path;
2. the canonical member route `/api/sovereign/app/maia/list` does not retrieve `ain_knowledge_chunks`, and the historical `ainKnowledgeContext` seam reaches FAST only.

J8 therefore remains **STOP** until the canonical route can retrieve the governed subject and carry the same bounded evidence into FAST, CORE, and DEEP cognition.

## 2 · Repair laws

1. **Governed identity outranks heuristic taxonomy.** Canonical retrieval is allowlisted by exact governed source identity, not by the legacy `domain` / `categories` classifier.
2. **Gate and evidence remain distinct.** `collective.knowledge_gate` says which wells are weighted; `retrieved.governed_knowledge` says what governed source material was actually retrieved.
3. **No ambient table trust.** Rows merely present in `ain_knowledge_chunks` are not thereby eligible for canonical retrieval.
4. **One meaning across tiers.** FAST, CORE, and DEEP may have different native prompt seams, but the governed block must carry the same source identity, excerpts, and epistemic framing.
5. **Retrieval is read-only in this repair.** No retrieval analytics write is introduced; no schema change, metadata rewrite, re-embedding, or corpus replacement is authorized.
6. **Historical evidence is not rewritten.** J7 remains bound to the executable hashes that actually crossed production. A new repair changes future executable identity; it does not retroactively alter J7.

## 3 · Contained implementation

- introduce a runtime-safe governed-source registry shared by ingestion and retrieval;
- add an exact `source_file` allowlist to `RetrievalService`;
- add a bounded governed retrieval/formatting service with source provenance;
- wire governed retrieval into the canonical `/maia/list` route under the existing Knowledge Gate enablement and sanctuary refusal;
- register a distinct canonical-turn producer: `retrieved.governed_knowledge`;
- carry the governed block into FAST, CORE, and DEEP through each tier's native cognition seam;
- add focused tests for source identity, allowlisting, provenance formatting, canonical participation, and tier reachability.

## 4 · Explicit non-scope

⛔ No deploy.
⛔ No production database write or row update.
⛔ No change to the 1,238 committed chunks or embeddings.
⛔ No direct correction of `domain=somatic` / categories.
⛔ No J8 PASS until the repaired code is deployed and independently witnessed on the canonical route.
⛔ No J9 or J10 opening.

The legacy `scripts/embed-ain-knowledge.ts` same-table writer and the Living Library alternate crossing remain separate Law 7 debts. They must be contained before J10, but are not silently repaired in this J8 seam change.
