# TEMPORAL-MEMORY-CUT1-TRACEABILITY-01 — PRODUCTION WITNESS + CLOSURE

**Date:** 2026-09-16  
**Status:** ⭐ PRODUCTION WITNESSED · LANE CLOSED  
**Authority:** founder authorized completion of the lane, including deployment/witness acts, after the bounded design and merge adjudication.

> **Traceability is the instrument for future reconciliation, not the reconciliation itself.**

This record closes only the Cut-1 traceability lane. It does not adjudicate the scorer, alter decay, open Cut 2, or claim member-visible continuity improvement.

## 1. Production referent

The running `maia-sovereign` container was created from the deployment context for:

```text
98542ff06  clean-main-no-secrets
```

That ancestry contains PR #1301, `Temporal memory Cut-1 traceability`.

Production PostgreSQL contains `memory_cut1_trace_runs`.
At witness time it already contained 14 rows created by the deployed runtime.
## 2. Structural production witness

Observed from production, read-only:

```text
trace rows ......................... 14
distinct retrieval_id .............. 14
distinct turn bindings ............. 14
distinct members in witness ........ 1
bad policy_key rows ................ 0
bad cutoff rows .................... 0
unbound session/message rows ....... 0
max live_top length ................ 12
max neutral_top length ............. 12
rows bound to matching member session 14 / 14
```

The only keys present in stored bounded-set entries are:

```text
memory_id · rank · live_score · neutral_score
```

No memory body or member-authored prose is carried in the trace payload.
## 3. Historical sufficiency and recoverability

Using only the durable trace rows, with no join to current ranking state:

```text
derived historical exclusion events .... 14
retrievals with an exclusion ............ 14
distinct excluded memories .............. 1
```

The historically excluded memory was then checked separately for recoverability:

```text
distinct excluded ............. 1
still present ................. 1
content recoverable ........... 1
currently valid ............... 1
```

This preserves the distinction established by the predecessor lane:

> **Historical traceability comes from the recorded turn. Recoverability comes from the surviving memory. A current counterfactual is neither.**
## 4. Zero case and failure honesty

No natural zero-difference retrieval occurred in this production witness window: all 14 stored traces had a one-row set difference.

That is recorded as an absence of natural production evidence, not repaired by fabricating a synthetic member turn. The zero case was already proven in the deterministic pre-deploy suite: equal live/neutral bounded sets persist as a durable trace row, making `zero exclusions` distinguishable from `observer did not run`.

Production container logs contained no:

```text
cut1_trace_read_failed
cut1_trace_write_failed
cut1_trace_idempotency_conflict
cut1_trace_read_slow
```

A future observer failure does **not** inherit this closure as evidence of compliance. It is a traceability incident for that invocation and must be treated as such.
## 5. Adjudication

The lane's sole job is now satisfied in production:

- Cut-1 temporal exclusions are durably recorded per retrieval invocation;
- each record is bound to an existing member encounter identity;
- the historical live and neutral bounded sets are sufficient to derive the exclusion later without reconstructing from current state;
- the excluded memory remains recoverable;
- the observer has not changed ranking, coefficients, `LIMIT 12`, validity, supersession, Cut 2, or prompt content;
- no production observer failure was present in the witnessed container window.

Therefore the specific Clause 2 non-conformance established by `TEMPORAL-MEMORY-RECONCILIATION-01` — silent Cut-1 exclusion with no durable historical record — is **repaired for the witnessed production path**.

This does not mean decay has been adjudicated as the right availability policy. Reconciliation remains unopened.

## 6. Gestalt / dynamic-intelligence boundary

The new programme law in `MAIA_TEMPORAL_RELATIONAL_MEMORY_GESTALT_LAW_2026-09-16.md` governs every later behavioural memory lane.

This Cut-1 observer is compliant by construction because its trace data does not participate in cognition. It records the historical decision but does not influence candidate selection, present-field interpretation, prompt assembly, or MAIA's response.

Future memory work must preserve the stronger law:

> **Memory may deepen MAIA's orientation to the present. It may never become the fixed lens through which she sees the present.**
## 7. Standing

```text
TEMPORAL-MEMORY-CUT1-TRACEABILITY-01
  design ............................ ✅
  implementation .................... ✅ MERGED
  production runtime ................. ✅ 98542ff06
  production schema .................. ✅
  durable historical traces .......... ✅ 14 witnessed
  member-turn binding ................ ✅ 14 / 14
  bounded payload .................... ✅
  trace-table historical sufficiency . ✅
  recoverability ..................... ✅
  natural zero-difference witness ..... ⛔ NOT YET OBSERVED
  deterministic zero-case ............ ✅
  observer failures in witness ........ 0
  ranking / coefficients / LIMIT ..... UNCHANGED
  Cut 2 .............................. UNOPENED
  member-visible improvement ......... NOT CLAIMED
  lane ............................... ⭐ CLOSED

TEMPORAL RECONCILIATION
  behavioural scorer changes ......... ⛔ UNOPENED
  prerequisite historical evidence ... ✅ NOW AVAILABLE
```
