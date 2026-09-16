# TEMPORAL-MEMORY-CUT1-TRACEABILITY-01 — I0 SCHEMA ACT

**Date:** 2026-09-16  
**Status:** ⭐ I0 OPENED · schema/migration candidate only · unmerged · runtime untouched  
**Authority:** founder act authorizing the next bounded step after design review: create the Cut-1 trace carrier and constraints only, then stop for inspection before runtime instrumentation.

> **Traceability is the instrument for future reconciliation, not the reconciliation itself.**

## 1. I0 authority

I0 may:

- add exactly one migration candidate for the selected `memory_cut1_trace_runs` carrier;
- encode the closed `policy_key`, fixed `cutoff`, bounded JSON-array, identity, timestamp, and non-negative-count constraints required by the binding design;
- add indexes needed to inspect a trace by member, turn, or capture time;
- document rollback.

I0 may not:

- edit `MemoryBundle.ts` or any runtime caller;
- change retrieval SQL, scores, coefficients, eligibility, or `LIMIT 12`;
- write production data;
- deploy or merge;
- instrument Cut 2;
- reuse or repair `conversation_memory_uses.used_as`;
- add a trigger, background worker, model inference, or member-visible behavior.

## 2. Governing design

Implementation candidate is bound by:

- `TEMPORAL-MEMORY-CUT1-TRACEABILITY-01_DESIGN_REVIEW_2026-09-16.md`
- one durable row per **retrieval invocation**, keyed by `retrieval_id`;
- existing `message_id` / turn trace remains the encounter-level binding;
- `live_top` and `neutral_top` preserve the bounded observed sets; causal exclusion remains derived;
- no memory body or member-authored prose may enter the carrier.

## 3. I0 inspection gates

Before any runtime act may open, the candidate must pass review for:

1. **semantic closure** — only `developmental_nonvector_decay_v1` is admitted;
2. **cut closure** — cutoff is exactly 12;
3. **boundedness** — each JSON array is an array with length 1..12;
4. **count integrity** — `eligible_count >= 1` and may not be less than either observed set length;
5. **identity integrity** — `retrieval_id` is the immutable primary/idempotency key; no overwrite/upsert semantics are created;
6. **content minimization** — schema contains no memory body/excerpt/embedding/interpretation field;
7. **no retrieval authority** — schema alone cannot affect ranking or selection;
8. **rollback** — removing the carrier drops only observational evidence and no serving substrate.

## 4. Stop rule

After the migration candidate and this custody record exist, **STOP**. Runtime instrumentation, migration execution, merge, deploy, and production witness remain unauthorized.
