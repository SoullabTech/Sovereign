# AIN-AETHER-CONNECTOR-01R6 — Witness

Date: 2026-09-28

## Result

R6 completes an inert pre-execution rehearsal using the exact one-shot token from the reviewed query-plan custody chain.

## Rehearsal witness

A valid, unexpired, unconsumed token is accepted by:

> `zero_io_rehearsal`

The resulting receipt is bound to:

- the exact token;
- the exact query;
- the exact reviewed SHA-256 fingerprint.

The token is consumed.

> **ONE-SHOT TOKEN CONSUMPTION — PASS**

## Zero-I/O witness

The receipt records:

- connector I/O attempted: **FALSE**;
- external network call: **FALSE**;
- execution occurred: **FALSE**;
- record read executed: **FALSE**;
- record count read: **0**.

> **TOKEN CONSUMPTION WITHOUT CONNECTOR EXECUTION — PASS**

## Zero-side-effect witness

The receipt records:

- persisted: **FALSE**;
- member-facing delivery: **FALSE**;
- MAIA prompt mutated: **FALSE**;
- production authority: **FALSE**.

## Expiry negative control

At the exact token expiry boundary, rehearsal is refused with:

> `token_expired`

No receipt is created.

## Plan-drift negative control

The query cardinality is changed after token issuance.

The rehearsal is refused with:

> `token_fingerprint_mismatch`

No receipt is created.

> **REVIEWED PLAN CUSTODY SURVIVES TOKEN STAGE — PASS**

## Standing

No connector executor exists.

No external connector was called.

No record was read.

## Verification

Focused R6 rehearsal tests: **6 / 6 PASS**

Generated-evidence tests are added at seal.

## Exact next boundary

> **AIN-AETHER-CONNECTOR-01R7 — CONNECTOR PROGRAMME PRE-EXECUTION CLOSURE · R1–R6 CAPABILITY / MANIFEST / QUERY / REVIEW / TOKEN / REHEARSAL INVARIANTS + ZERO-IO ONLY**

R7 should close the pre-execution connector-design lane before any actual record-read mechanism is discussed.
