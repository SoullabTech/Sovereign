# ADR 004: Converge on a Single Knowledge Engine

**Status:** Accepted (2026-06-27) — implementation [DESIGNED], not built.

**Relates to:** `docs/architecture/PERSONAL_WISDOM_LIBRARY.md` (§0 "one engine, many scopes", §11) · `docs/specs/PERSONAL_WISDOM_LIBRARY_IMPL_2026-06-27.md` (§2).

---

## Decision

There is **one** knowledge-ingestion/retrieval engine. AIN canonicalizes on the **`library_*` pipeline** and parameterizes it by ownership (platform / practitioner / member) and scope.

- The second engine, **`ain_knowledge_*`** (`lib/ain/knowledge/RetrievalService.ts`), is **declared legacy**.
- Its callers are migrated to `library_*` **incrementally**; it is **retired when caller count reaches zero** — not deleted abruptly.
- All ownership scopes flow through the single engine. The existing global corpus becomes the `platform` scope; per-owner scopes are the same engine with an owner/scope predicate.

---

## Context

Verification (2026-06-27) found **two parallel RAG engines**, both global and both pgvector-backed:

- **`library_*`** — hybrid retrieval (`library_chunks.embedding` pgvector + `content_tsv` full-text), a distillation layer (`library_distillates`, with `reviewed_by` / `quality_score`), a consent sublayer on `library_sources`, and search logging. Retrieval in `lib/library/LibraryService.ts`.
- **`ain_knowledge_*`** — embedding + retrieval only; no distillation, consent, or review layer.

The Personal Wisdom Library requires the engine to be parameterized by owner and scope (it currently is not — retrieval reads the whole global pool). Adding scope, ownership, and visibility to **two** engines doubles the governance surface and guarantees drift: two retrieval stacks inevitably diverge in ranking, filtering, and policy. The governance commitments (consent, review, provenance, promotion) must live in exactly one place.

`library_*` is the richer substrate and already carries the governance primitives the architecture depends on. Building those a second time into `ain_knowledge_*` would duplicate the very thing this architecture exists to avoid.

---

## Consequences

**Positive**
- One retrieval path to scope-filter, secure, and maintain.
- Owner / scope / visibility, promotion, and consent are added in a single place.
- Reuses the existing distillation, consent, and review layers rather than rebuilding them.
- Directly serves the architecture's simplifying insight — *reduce systems, don't add one.*

**Transitional / negative**
- A migration window in which both engines run.
- Requires a **caller-migration checklist**: enumerate importers of `lib/ain/knowledge/RetrievalService.ts` and move each to `LibraryService`.
- Requires an explicit **retirement criterion** (zero live callers + a deprecation window) before `ain_knowledge_*` is removed.
- Embedding dimensions/model must be reconciled if the two engines differ, before content is unified.

---

## Alternatives considered

1. **Keep both engines, add scope to each.** Rejected — double maintenance and inevitable drift of two retrieval/governance stacks; contradicts the unification goal.
2. **Build a new unified engine from scratch.** Rejected — discards a working, production `[LIVE]` substrate and its governance primitives; highest cost, highest risk.
3. **Canonicalize on `ain_knowledge_*` instead.** Rejected — it is the thinner engine, lacking distillation, consent, and review; would require porting those from `library_*`.

---

## Notes

This ADR records the *decision* to converge. The mechanics of the convergence and the per-owner scope parameterization (schema, retrieval predicate, ingest threading) live in the implementation spec, not here. This ADR remains valid even if those mechanics change.
