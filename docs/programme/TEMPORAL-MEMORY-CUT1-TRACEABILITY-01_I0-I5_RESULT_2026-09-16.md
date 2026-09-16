# TEMPORAL-MEMORY-CUT1-TRACEABILITY-01 — I0–I5 RESULT

**Date:** 2026-09-16
**Status:** I0–I5 COMPLETE · production runtime/schema still untouched
**Branch:** `feature/temporal-cut1-traceability-01`

> **Traceability is the instrument for future reconciliation, not the reconciliation itself.**

## 1. Scope held

Implemented only the bounded Cut-1 observer selected by the design review:

- own durable carrier: `memory_cut1_trace_runs`;
- one `retrieval_id` per `MemoryBundleService.build()` invocation;
- same-statement LIVE top 12 + decay-neutral top 12;
- baseline query retained as OFF oracle/fallback;
- trace persistence downstream of the already-decided LIVE candidates;
- existing voice `turnId` bound to both voice retrieval invocations;
- voice retrieval-side `conversation_memory_uses` write explicitly remains disabled;
- Sanctuary remains no retrieval / no trace.

No ranking formula, coefficient, `LIMIT 12`, validity/supersession rule, Cut 2 observer, scorer, or `conversation_memory_uses.used_as` semantic was changed.

## 2. I0 — schema candidate

Migration: `database/migrations/20260916023700_memory_cut1_trace_runs.sql`.

The first production shadow attempt exposed a schema-truth mismatch before evidence collection:

```text
developmental_memories.id      uuid
developmental_memories.user_id text
```

The original candidate had `memory_cut1_trace_runs.user_id UUID`. That assumption was rejected and corrected to `TEXT` so the trace carrier preserves the runtime identifier type rather than narrowing it by convenience.

Nothing was written to production by that failed shadow attempt.

## 3. I1 — sidecar + store candidate

`lib/memory/cut1Trace.ts` now carries:

- the exact pre-instrumentation baseline Cut-1 SQL;
- the same-statement observed query;
- bounded trace extraction;
- append-only trace persistence;
- retrieval-invocation idempotence;
- conflict refusal rather than overwrite;
- content-free observer failure signaling.

`MemoryBundle` generates a fresh retrieval UUID at build entry. If a member-turn binding exists, the non-vector path attempts the observer; observer-read failure runs the preserved baseline query, and observer-write failure returns the already-decided LIVE candidates unchanged.

## 4. I2 / I3 / I4 — deterministic + failure + binding gates

Relevant Jest gate:

```text
Test Suites: 5 passed, 5 total
Tests:       42 passed, 42 total
```

This includes the pre-existing M1.5 voice observability contract and F10 Sanctuary contract, plus new witnesses for:

- bounded zero and maximum set differences;
- closed policy key / cutoff schema constraints;
- append-only idempotence and conflict refusal;
- observer-read failure → baseline fallback;
- trace-write failure → LIVE candidates unchanged;
- two builds under one turn → two distinct retrieval ids;
- all four member-facing `MemoryBundleService.build()` call-site bindings;
- both voice retrieval acts bound to the same existing `turnId` without enabling retrieval-side `conversation_memory_uses` writes.

TypeScript no-regression gate:

```text
program files : 4320 (baseline 3965)
errors        : 229  (baseline 239)
new diagnostics: 0
✅ No TypeScript regressions
```

Member-identifier logging gate:

```text
current violations: 534 (all baselined)
new violations:     0
✅ No NEW raw member identifiers reaching logging sinks
```

## 5. I5 — read-only production shadow equivalence

Witness: `scripts/witness/temporal-cut1-traceability-shadow.ts`.

It imports the candidate baseline and observed SQL constants directly. For each production member whose eligible developmental-memory pool exceeds 12, it executes baseline and observed LIVE queries inside the same repeatable-read read-only transaction and compares count + ordered ID/score digests. No memory body is selected or printed.

Result:

```text
TEMPORAL_CUT1_SHADOW
cutoff_pools=14
equivalent=14/14
members_with_top12_score_ties=0
```

Therefore, for every production pool in which Cut 1 is currently an actual cut, the candidate observer returned the same LIVE count, identities, order, and live scores as the preserved baseline query in this witness.

### Query-cost witness

Three representative production pools were measured with database `EXPLAIN ANALYZE`, three runs each:

```text
pool 1073  baseline 10.106,10.871,10.115 ms  avg 10.364
           observed 13.683,13.073,14.149 ms  avg 13.635

pool   39  baseline 0.874,0.875,0.877 ms     avg 0.875
           observed 1.297,1.251,1.249 ms     avg 1.266

pool   14  baseline 0.617,0.616,0.892 ms     avg 0.708
           observed 1.092,0.919,0.989 ms     avg 1.000
```

The observer adds measurable cost, as expected, but no representative query crossed the repository's 100 ms slow-query boundary. The largest measured pool remained under 14.2 ms in all observed runs.

## 6. Evidence adjudication

I0–I5 support the following and no more:

1. the selected durable carrier can be expressed without overloading `conversation_memory_uses`;
2. the runtime sidecar can observe LIVE + neutral bounded sets while returning the same LIVE Cut-1 result on all 14 current production cutoff pools;
3. read and write observer failures are non-authoritative under deterministic tests;
4. all currently identified member-facing Cut-1 call sites have a turn binding, including both voice invocations;
5. Sanctuary remains outside retrieval and therefore outside tracing;
6. current production query cost does not trigger the predeclared >100 ms stop condition.

This does **not** establish member-visible continuity improvement, adjudicate the scorer, answer Cut 2, or authorize any future reconciliation formula.

## 7. Standing

```text
I0 schema candidate ................ ✅
I1 sidecar/store candidate ......... ✅
I2 deterministic fixtures .......... ✅
I3 forced failure witnesses ........ ✅
I4 call-site binding ............... ✅
I5 production shadow equivalence ... ✅ 14/14 cutoff pools
I5 operational-cost stop ........... ✅ NOT TRIGGERED
schema truth correction ............ ✅ user_id UUID assumption rejected → TEXT
ranking / coefficients / LIMIT ..... UNCHANGED
Cut 2 .............................. UNOPENED
production schema .................. UNTOUCHED
production runtime ................. UNTOUCHED
```
