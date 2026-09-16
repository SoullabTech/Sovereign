# Declared Membership — Ratification

**Status:** ✅ RATIFIED · Constitutional
**Ratified:** 2026-09-16
**Founder authority:** Kelly W. Nezat — authorization in `SOURCE-CUSTODY-PII-01` closure: “continue — authorized for all.”
**Origin:** `DECLARED_MEMBERSHIP_CANDIDATE_2026-09-15.md`

## Ratified invariant

> **Membership must be declared and mechanically checked; it may never be inherited solely from location, container, naming, or access mode.**

The underlying rule is: **containers do not confer standing. Standing comes from explicit admission under a rule.**

This ratification preserves the candidate as the historical proposal. It does not rewrite that earlier record as though authority existed before this act.

## Constitutional standing

This becomes **Sovereignty Invariant 17 — Declared Membership** in `MAIA_SOVEREIGNTY_INVARIANTS.md`.

It governs any architecture in which something acquires membership, standing, admissibility, or authoritative inclusion because it is inside a container or bears a label: corpus sources, agent context carriers, worktrees, sandboxes, source directories, replicas, registries, queues, or later equivalents.
## Enforcement obligation

A new container-shaped boundary is not complete merely because it has a name or a filter. It must ship with:

1. a human-readable declaration of what may belong;
2. a mechanical check that enforces that declaration;
3. default exclusion when no declaration exists;
4. defence-in-depth detectors that may refuse a bad declaration but are never treated as the primary boundary;
5. a witness that kills a default-admit mutant;
6. when the boundary can produce an empty or sharply reduced output, a composition witness proving the downstream consumer handles that output lawfully before destructive or authoritative action.

The sixth requirement is the lesson of both corpus pipelines: a correct fail-closed guard can make the containing system less safe if a downstream consumer assumes non-empty input.

## Scope boundary

This invariant governs **admission and standing**. It does not by itself authorize a complete Sovereign Agent Boundary implementation, model routing change, repository-history rewrite, or new data-retention policy. Those acts require their own mechanisms even when Invariant 17 governs their boundaries.

## Evidence

The ratification rests on the four independent proofs preserved in the candidate plus the later composition findings from AIN corpus and Living Library ingestion. The operative implementation at ratification is `lib/corpus/admission.ts`, consumed by all current bulk `data/ain/source` ingestion paths and guarded by mutant/composition tests.
