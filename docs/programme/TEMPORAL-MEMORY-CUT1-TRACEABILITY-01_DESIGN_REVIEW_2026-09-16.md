# TEMPORAL-MEMORY-CUT1-TRACEABILITY-01 — DESIGN REVIEW / BINDING ADDENDUM

**Date:** 2026-09-16  
**Status:** ⭐ DESIGN REVIEW COMPLETE · implementation not opened · production untouched  
**Authority:** founder instruction to design `TEMPORAL-MEMORY-CUT1-TRACEABILITY-01`. This record reviews the existing design against the live repository seams and binds the design where the earlier record was underspecified. It authorizes **design only** — no migration, product-code change, merge, deploy, ranking change, coefficient change, or reconciliation.

> **Traceability is the instrument for future reconciliation, not the reconciliation itself.**

This record preserves rather than rewrites the sequence. It inherits:

- `TEMPORAL-MEMORY-CUT1-TRACEABILITY-01_CHARTER_AND_CENSUS_2026-09-16.md`
- `TEMPORAL-MEMORY-CUT1-TRACEABILITY-01_DESIGN_2026-09-16.md`
- the ratified law and measured findings of `TEMPORAL-MEMORY-RECONCILIATION-01`
- `MAIA_TEMPORAL_RELATIONAL_MEMORY_PROGRAMME_2026-09-16.md`

Where this review conflicts with the earlier design, **this review governs the implementation candidate**. The earlier design remains as historical design evidence; it is not edited to look as though these findings were known before the runtime seams were inspected.

---

## 0. What survives from the first design

The first design got the central architecture right:

1. the trace gets its **own address** — ⛔ do not overload `conversation_memory_uses.used_as`;
2. the observed comparison is **live top 12 vs decay-neutral top 12**, not `pool − 12`;
3. neutralization means **hold the decay factor at 1**, preserving the `0.40 * significance` term and every other coefficient;
4. the live and neutral views must come from the **same PostgreSQL statement snapshot**;
5. the durable write happens **after** the live selection is decided and cannot acquire retrieval authority;
6. a zero causal difference must be distinguishable from an observer that did not run;
7. memory bodies / member prose do not enter the trace;
8. no ranking formula, coefficient, validity rule, supersession rule, `LIMIT 12`, Cut 2, or member-visible claim is opened.

Those rulings stand.

The code review exposed two places where the design needed stronger custody before implementation.

---

# 1. Runtime finding A — a turn is not the same thing as a Cut-1 invocation

The earlier design says “one row per traced Cut-1 invocation” but its idempotency section then asks for a stable key from the existing **per-turn** identifiers.

That collapses two different units.

The repository proves why the distinction matters:

- the main text route already passes `sessionId + traceId` into `MemoryBundleService.build()`;
- `maiaOrchestrator` generates a `traceId` and passes it into `MemoryBundleService.build()`;
- the voice route already has a stable `turnId` (`x-voice-turn-id`, or server UUID fallback);
- but the voice route can execute **two separate `MemoryBundleService.build()` calls in one spoken turn**:
  1. through `MaiaWisdomProvider.buildVoiceContext()` before Threshold;
  2. again in the R2 canonical-continuity block on the full LLM path.

Those are two real Cut-1 decisions. They may share one member turn, but they are not one retrieval invocation and must not be silently deduplicated into one historical event.

### R1 — the unit of observation is the retrieval invocation

The durable trace therefore carries two identities with different meanings:

```text
message_id / turn_trace_id   which member turn this belongs to
retrieval_id                 which Cut-1 invocation this is
```

`retrieval_id` is generated **once at `MemoryBundleService.build()` entry** and reused for every observation/write attempt belonging to that invocation.

A second call to `MemoryBundleService.build()` during the same turn receives a **new** `retrieval_id`. That is not duplication; it is a second retrieval act.

A persistence retry *inside the same build invocation* reuses the same `retrieval_id` and must be idempotent.

### R1a — do not invent caller-role taxonomy to solve this

The lane does **not** introduce `text_primary`, `voice_wisdom`, `voice_r2`, or another open-ended route vocabulary merely to disambiguate calls. The invocation UUID does the minimum necessary work. Existing `message_id` / `turnId` groups invocations that belonged to the same member turn.

If a later programme needs semantic caller provenance, that is a separate governed question.

---

# 2. Runtime finding B — a causal label is weaker evidence than the observed sets

The first design proposed:

```text
memory_cut1_trace_runs
memory_cut1_decay_exclusions
```

with child rows asserting `reason = decay_cut1_exclusion`.

That is compact, but it stores the **conclusion** while discarding part of the bounded observation that produced it. In particular, a child row containing `neutral_rank`, `live_score`, and `neutral_score` does not by itself preserve the actual historical live boundary or the selected live set. A future auditor would have to trust the instrument’s causal classification rather than re-derive it from the historical decision record.

Exact score ties at the `LIMIT 12` boundary make that distinction important. The live production query has no tiebreaker. This lane may observe that fact; it may not silently add a tiebreaker and call the resulting order historical truth.

### R2 — persist the two bounded observed sets, not a causal child taxonomy

The selected durable object becomes **one append-oriented decision trace row per retrieval invocation**.

Proposed address:

```text
memory_cut1_trace_runs
```

Minimum schema:

```text
retrieval_id        UUID PRIMARY KEY
user_id             UUID NOT NULL
session_id          TEXT NOT NULL
message_id          TEXT NOT NULL
policy_key          TEXT NOT NULL
cutoff              SMALLINT NOT NULL
eligible_count      INTEGER NOT NULL
live_top            JSONB NOT NULL
neutral_top         JSONB NOT NULL
captured_at         TIMESTAMPTZ NOT NULL
created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

Closed constraints:

```text
policy_key = 'developmental_nonvector_decay_v1'
cutoff     = 12
eligible_count >= 1
jsonb_typeof(live_top)    = 'array'
jsonb_typeof(neutral_top) = 'array'
jsonb_array_length(live_top)    BETWEEN 1 AND 12
jsonb_array_length(neutral_top) BETWEEN 1 AND 12
```

Each array item carries only bounded decision evidence:

```json
{
  "memory_id": "<developmental_memories.id>",
  "rank": 1,
  "live_score": 0.000000,
  "neutral_score": 0.000000
}
```

The arrays are ordered by the **observed query result order**. No memory body, excerpt, embedding, entity tags, facet narrative, psychological interpretation, or inferred meaning is stored.

### R2a — causal exclusion is derived from the preserved observation

After the fact:

```text
decay_excluded  = ids(neutral_top) − ids(live_top)
decay_displaced = ids(live_top) − ids(neutral_top)
```

That derivation requires **only the stored historical trace row**, not current `developmental_memories` state.

“Why?” is answerable from the same row:

- the memory’s `neutral_score` placed it in the observed neutral top 12;
- its `live_score` did not place it in the observed live top 12;
- the only formula difference between those two rankings is the predeclared decay neutralization.

No one-to-one `excluded X ↔ displaced Y` relation is manufactured.

### R2b — boundary ties remain visible instead of being repaired here

Because the live query has no tiebreaker, exact equality at a boundary is not silently resolved by this lane.

The trace preserves the scores and the observed set. A later reader can see whether an entrant/exclusion sat exactly at a live or neutral boundary. A boundary-tie case may be an **observed set difference** without licensing a stronger statement that elapsed time was the sole discriminator between two exactly tied rows.

⛔ No `ORDER BY ..., id` is added to production in this lane.

---

# 3. Read design — exact historical comparison, same statement snapshot

The observer lives at the SQL boundary because excluded rows do not otherwise enter Node.

The instrumented non-vector read is one PostgreSQL statement with logically separate CTEs:

```text
LIVE
  current production eligibility predicate
  current production decay-bearing score
  ORDER BY score DESC
  LIMIT 12

NEUTRAL
  same eligibility predicate
  same terms and coefficients
  only calculate_decayed_confidence(...) neutralized to significance
  ORDER BY neutral_score DESC
  LIMIT 12

TRACE PAYLOAD
  eligible_count
  ordered live_top[<=12]
  ordered neutral_top[<=12]
  captured_at from the same statement
```

The member-facing candidate rows remain **LIVE only**.

The trace payload is observational sidecar data. It never enters:

- `allCandidates`
- `rankCandidates`
- `deduplicate`
- `topBullets`
- prompt composition
- permission / Sanctuary decisions
- model input

### R3 — preserve the live query as the baseline oracle

Implementation must retain the pre-instrumentation live query as the OFF oracle for equivalence tests and as the fallback if the observer-specific query fails.

The instrumented query may factor expressions for readability only if F1–F4 below prove the returned live rows are identical. The design does not grant semantic equivalence by inspection alone.

### R3a — observer-read failure is non-authoritative

If the instrumented read fails for an observer-specific reason:

```text
emit content-free `cut1_trace_read_failed`
run the unmodified baseline live query
return that baseline result
```

If the baseline query itself fails, the existing memory-retrieval failure semantics apply. The observer may not turn a trace bug into “no memories.”

A failed observer read yields **no historical trace** for that invocation. Nothing later may reconstruct one and write it as though it were contemporary evidence.

---

# 4. Write design — one atomic row, downstream of selection

After the instrumented read has returned the live rows and trace payload:

```text
1. materialize the same live MemoryCandidate[] as today
2. attempt INSERT of one memory_cut1_trace_runs row
3. if INSERT succeeds → durable trace exists
4. if INSERT fails → emit content-free `cut1_trace_write_failed`
5. return the already-decided live candidates either way
```

Because the selected durable form is a single row, no header/child transaction is required merely for atomicity: one `INSERT` is already atomic.

### R4 — idempotence is by retrieval invocation, not by turn

`retrieval_id` is the primary idempotency key.

A retry of the **same persistence operation** with the same `retrieval_id` may not create a second row.

A uniqueness conflict may be accepted as idempotent only if the already-stored row is equivalent in the bounded decision fields. A conflicting payload under the same `retrieval_id` is an instrumentation failure (`cut1_trace_idempotency_conflict`), not an update opportunity.

⛔ No upsert may overwrite the historical row into agreement.

A new `MemoryBundleService.build()` call — even for the same `message_id` — gets a new `retrieval_id` because it is a new retrieval act.

---

# 5. Turn binding — required for a per-turn claim

`BuildBundleInput.traceId` already exists. The design does not create a second turn-identity system.

### Known binding state from repository inspection

```text
main text route        sessionId + traceId already passed
maiaOrchestrator       traceId generated + passed
voice direct R2 build  turnId exists, not currently passed to MemoryBundle
MaiaWisdomProvider     sessionId passed, turn trace not currently accepted/passed
```

### R5 — binding the existing voice `turnId` is within this Cut-1 lane

An implementation candidate may thread the **already-existing** voice `turnId` through:

```text
stream-conversation
  → MaiaWisdomProvider VoiceContextInput.traceId
  → getMemoryBundle(..., traceId)
  → MemoryBundleService.build({ traceId })
```

and also pass `traceId: turnId` to the route’s direct R2 `MemoryBundleService.build()` call.

This does **not** open Cut 2 and does not authorize a new selection log. It binds the same Cut-1 observer to the turn identity the route already owns.

### R5a — coverage gate

The lane may not claim Clause 2 traceability is repaired while a member-facing, non-Sanctuary `MemoryBundleService.build()` invocation can execute this Cut 1 without a turn trace binding.

If such an invocation is found during implementation census:

```text
record it
leave retrieval behavior unchanged
emit no fabricated per-turn trace
STOP the closure claim
```

Do not add instrumentation to unrelated paths “for symmetry.” The gate applies only to call sites that actually execute this same Cut-1 decision for a member encounter.

---

# 6. Sanctuary and no-retrieval states

Sanctuary remains an absolute upstream boundary.

```text
Sanctuary turn → no cross-session retrieval → no Cut-1 trace row
```

The absence of a trace row on a Sanctuary turn is not a trace failure; Cut 1 was correctly not attempted.

Likewise, this lane instruments the **non-vector developmental Cut 1 only**. If the non-vector eligible pool is empty and the existing code falls through to the vector path, this trace does not claim to describe that separate path.

A later vector-memory trace, if ever needed, requires its own act rather than inheriting this policy key.

---

# 7. Open `used_as` vocabulary — explicitly untouched

The production absence of a CHECK on `conversation_memory_uses.used_as` remains a recorded schema-governance hazard.

This lane:

- does not add a new `used_as` value;
- does not close the vocabulary;
- does not rely on the vocabulary;
- does not reinterpret `conversation_memory_uses` as an exclusion ledger.

Closing that vocabulary may be good future hygiene. It is not required to make Cut-1 exclusion traceability truthful, so it stays routed outside this lane.

---

# 8. Binding falsifiers

An implementation candidate fails if any applicable falsifier fails.

### F1 — selected identities
For the same database state, trace OFF and trace ON return the same ordered live developmental-memory IDs.

### F2 — selected order
The returned order is identical. The observer may not add a production tiebreaker to obtain this result.

### F3 — live scores
Every selected row carries the same live score under OFF and ON.

### F4 — boundary/count
The live result count is identical and remains bounded by the unchanged `LIMIT 12`.

### F5 — observer-read failure independence
Force the instrumented read to fail while the baseline query remains valid. The fallback must return the baseline IDs, order, and scores.

### F6 — trace-write failure independence
Force durable trace insertion to fail. The returned live IDs, order, and scores must remain identical to trace OFF.

### F7 — durable zero
Use an eligible pool in which live and neutral top sets are identical. A trace row must persist with the two equal arrays; set difference must derive to zero.

### F8 — bounded volume
`live_top <= 12` and `neutral_top <= 12`. No rejected pool crosses the application/storage boundary.

### F9 — historical sufficiency
After a trace is written, mutate later database state so a present-day counterfactual differs. The historical trace must still yield the historical live set, neutral set, and derived exclusion set without consulting current ranking state.

### F10 — same-turn multiple invocation honesty
Execute two real `MemoryBundleService.build()` invocations under one `message_id`. Two distinct `retrieval_id` rows must survive; the store may not collapse them into one turn-level trace.

### F11 — persistence retry idempotence
Retry trace persistence for the same `retrieval_id`. No duplicate row is created. A mismatched payload under the same ID is reported and never overwrites the first row.

### F12 — content minimization
No memory body, member-authored prose, excerpt, embedding, or model-generated interpretation enters the trace row or trace-failure logs.

### F13 — no downstream authority
Deleting/ignoring the trace payload before prompt assembly changes observability only. No candidate, permission decision, prompt byte, or model input may depend on trace success.

### F14 — turn-binding coverage
For every member-facing non-Sanctuary call site that executes this Cut 1, the witness must show the trace row is bound to the existing session + turn/message identity. An unbound serving call blocks lane closure.

### F15 — Sanctuary exclusion
A Sanctuary turn produces no Cut-1 retrieval and no Cut-1 trace row.

### F16 — exact-tie honesty
A fixture with an exact boundary tie may not cause the implementation to introduce a new tiebreaker. The stored trace records the observed sets/scores; later causal interpretation must remain bounded by that ambiguity.

### F17 — operational cost
The implementation witness must compare baseline and instrumented query timing on the same representative pools. The repository already treats database queries above 100 ms as slow. If the baseline is below that boundary and the observer newly crosses it, deployment stops for explicit review rather than treating observability cost as free.

---

# 9. Implementation touch map — descriptive, not authority

The smallest likely implementation surface is:

```text
database/migrations/<new>_memory_cut1_trace_runs.sql
lib/memory/MemoryBundle.ts
lib/memory/stores/<new Cut1 trace store>.ts
app/api/voice/stream-conversation/route.ts        [turnId binding only]
lib/voice/wisdom/MaiaWisdomProvider.ts            [turnId binding only]
tests / witness for OFF↔ON equivalence + failures
```

The main text route and `maiaOrchestrator` already possess the required turn trace binding; they should not be touched merely for visual symmetry unless implementation proves a real call-site need.

⛔ No scorer file.  
⛔ No confidence-decay implementation change.  
⛔ No `conversation_memory_uses` semantic change.  
⛔ No Cut-2 trace change.  
⛔ No memory content logging.  
⛔ No retrieval redesign.

---

# 10. What implementation authority must prove before production

A future implementation act should be split into gates rather than one “build it” permission:

```text
I0  schema/migration candidate, unmerged
I1  SQL sidecar + store candidate behind no production deployment
I2  deterministic fixtures: OFF↔ON + zero + max + tie + historical mutation
I3  forced read/write failure witnesses
I4  call-site binding census/witness, including the two voice invocations
I5  read-only/shadow production equivalence + query-cost witness
I6  founder adjudication of evidence
I7  only then merge/deploy authority
```

The lane closes only when production can durably answer its acceptance question from the historical trace itself and the observer has been shown not to perturb the selection it observes.

---

# 11. Standing after design review

```text
lane .................................... OPEN
charter/census .......................... ✅ BOUND
temporal programme ...................... ✅ BOUND
first design ............................ ✅ PRESERVED
runtime design review ................... ⭐ COMPLETE
unit of observation ..................... ✅ RETRIEVAL INVOCATION
turn grouping ........................... ✅ EXISTING message/turn id
invocation identity ..................... ✅ retrieval_id REQUIRED
durable carrier ......................... ✅ ONE BOUNDED TRACE ROW / INVOCATION
live set preserved ...................... ✅ <= 12
neutral set preserved ................... ✅ <= 12
causal exclusion ........................ ✅ DERIVED, NOT ASSERTED AS CHILD TAXONOMY
boundary ties ........................... ✅ PRESERVED AS AMBIGUITY · ⛔ NO FIX
open used_as ............................ ⛔ NOT RELIED UPON · UNCHANGED
observer read failure ................... ✅ BASELINE FALLBACK REQUIRED
observer write failure .................. ✅ NON-BLOCKING REQUIRED
Sanctuary ............................... ✅ NO RETRIEVAL · NO TRACE
voice turn binding ...................... ✅ DESIGN REQUIRED · ⛔ NOT IMPLEMENTED
ranking / coefficient / LIMIT ........... ⛔ UNTOUCHED
Cut 2 ................................... ⛔ UNOPENED
schema migration ........................ ⛔ NOT AUTHORIZED
implementation .......................... ⛔ NOT AUTHORIZED
production .............................. UNTOUCHED
```

## Design sentence

> **Preserve the two bounded decisions that actually happened, bind each retrieval act to the turn without collapsing multiple acts into one, and let causal interpretation remain derivable from evidence rather than hard-coded into the ledger.**
