# TEMPORAL-MEMORY-CUT1-TRACEABILITY-01 — CHARTER + SUBSTRATE CENSUS (read-only)

**Opened**: 2026-09-16, founder act, on the closure of `TEMPORAL-MEMORY-RECONCILIATION-01`.

> ⭐⭐ **Traceability is the instrument for future reconciliation, not the reconciliation itself.**

---

## 1. Sole job

> **Make Cut-1 decay exclusions durably traceable per turn, without changing which memories are
> selected.**

Observational recording only. The lane **may not**:

- change the ranking formula · change decay coefficients · change `LIMIT 12`
- change validity or supersession · redesign retrieval
- add "symmetry" instrumentation to other paths
- open Cut 2 · infer member-visible consequences

## 2. Acceptance condition

> For a given turn, after the fact, we can answer: **which otherwise-valid memories were excluded
> from Cut 1 because of the decay-bearing ranking, and why?**

And the evidence must be **durable enough that we do not need to reconstruct the historical turn
from current database state.** A counterfactual run is not an answer to this question — that is the
distinction the closed lane exists to have established.

## 3. Sequencing this lane serves

```
diagnosis  →  traceability  →  observe real exclusions over time  →  only then reconciliation
```

Without traceability a behavioural change would be judged against a counterfactual rather than a
historical record, undoing the evidentiary distinction just established. **Reconciliation stays
unopened.**

## 4. Out of scope, named so they are not absorbed

Stage B / Cut 2 (UNANSWERED, ⛔ not negative) · `IMMUTABLE`+`NOW()` · incommensurable
`rankCandidates` scores · partial `recall_count` feedback · detect→ask API with no member route.

---

## 5. SUBSTRATE CENSUS — read-only, repository truth only

⛔ No live or shadow database was read. ⛔ Nothing below is a recommendation; §7 states what is
owed before any design.

**Decisive question, asked of every candidate:** *does it durably record, for a historical turn,
which otherwise-valid memories Cut 1 excluded?*

### 5.1 `selectionTrace` — ⛔ NO, structurally
In-process value on the returned bundle, built at `MemoryBundle.ts:164` after `deduped`/`topBullets`
— correctly so. But `deduped` derives from rows the SQL already truncated to 12. **It is downstream
of Cut 1 and structurally blind to it.** Emitted only as a log line
(`[voice:memory_selection:<turnId>]`) from the voice route; logs are not durable storage.

### 5.2 `conversation_memory_uses` — ⭐ the closest existing object, and it records SURVIVORS
Durable table. Written by **three** call sites — `lib/sovereign/maiaService.ts:886`,
`lib/memory/MemoryBundle.ts:131`, `app/api/voice/stream-conversation/route.ts:1319` — so unlike
`selectionTrace` it **already reaches the text path**. Carries per-row `user_id · session_id ·
message_id · memory_table · memory_id · used_as · retrieval_score · semantic_score · recency_score ·
confidence_score`.

⛔ **But `recordRetrievedCandidates()` is handed `allCandidates`, which are already the survivors of
the SQL `LIMIT 12`.** The table records what was retrieved, never what was excluded. Its writer is
also gated on `traceId && sessionId`, and it silently drops candidates with empty ids.

### 5.3 ⚠️ A finding that is an affordance and a hazard at once
Production's table carries **no CHECK on `used_as`** — the baseline
(`0001_baseline_2026-09-01.sql:5068`) shows only a `session_id` non-empty CHECK and the primary key.
The six-value CHECK written in `20251231_memory_architecture_enhancements.sql` is **not what
production runs**; `20260113000003b_conversation_memory_uses.sql` re-created the table without it.

⭐ So a new `used_as` value would need **no migration to a constraint**.
⚠️ **And that is precisely the hazard.** An open vocabulary means a semantic category could enter
the durable record **without a governed act** — the same defect class as permission arriving through
a convenient adjacent field. ⛔ **The census names this; it does not propose using it.** Whether an
exclusion record belongs in this table at all, and whether an open vocabulary should be closed
before anything relies on it, are design questions this act does not answer.

### 5.4 Other durable per-turn objects — ⛔ NO
`agent_runs` / `integration_passes` (Corpus Callosum emission, different subsystem, no memory-cut
semantics) · `runtime_events` (substrate monitor) · container logs (rotate; not storage).

### 5.5 The structural fact any design must face
The live Cut-1 SQL applies `ORDER BY score DESC LIMIT 12` **in the database**. The excluded rows
never enter the application process at all — there is nothing in Node to record. **Any durable
exclusion record must therefore be produced at or below the SQL boundary**, and doing so without
changing which twelve rows are selected is the lane's actual engineering problem.

---

## 6. Census verdict

**No existing object answers the acceptance condition.** The nearest — `conversation_memory_uses` —
has the right durability, the right per-turn keys, the right score columns and text-path coverage,
and records the **wrong side of the cut**. ⛔ Permitted is not authorized: this establishes only
that nothing already does the job.

## 7. Owed before any design act

1. A ruling on whether the exclusion record extends an existing object or takes its own address.
2. A ruling on the open `used_as` vocabulary (§5.3) — closed before reliance, or left open by
   explicit decision.
3. A bounded-volume answer: the excluded set is *pool − 12* per turn per member, unbounded above.
   ⛔ Not designed here; named because a per-turn record with no bound is a storage decision, not a
   detail.
4. A falsifier that would fail a candidate which changes selection — **the lane's central risk is a
   recording mechanism that perturbs the thing it records.**

## 8. Standing

```
lane .......................... OPEN
census ........................ ✅ COMPLETE · READ-ONLY
design ........................ ⛔ NOT OPENED
behaviour change .............. ⛔
ranking change ................ ⛔
scope ......................... one cut · one path
reconciliation ................ ⛔ UNOPENED
production .................... UNTOUCHED
```
