# AIN-AETHER-CONNECTOR-01R4 — Witness

Date: 2026-09-28

## Result

R4 establishes immutable review custody for the exact bounded query plan.

## Fingerprint witness

The exact plan is canonicalized under:

> `aether-query-plan-v1`

and fingerprinted with:

> **SHA-256**

The digest is 64 hexadecimal characters.

> **DETERMINISTIC PLAN FINGERPRINT — PASS**

## Human review witness

A human review record binds to:

- the exact query reference;
- the exact fingerprint;
- explicit approval;
- a review note.

The exact reviewed plan passes custody adjudication.

> **EXACT PLAN REVIEW BIND — PASS**

## Drift negative control

After review, the plan changes:

> `maxRecords: 25 → 50`

The current fingerprint no longer matches the reviewed fingerprint.

R4 refuses custody with:

> `query_plan_fingerprint_mismatch`

The same mechanism covers field, time-range, source, member, consent, and other plan drift.

> **POST-REVIEW MUTATION — REFUSED**

## Approval non-execution witness

Even with an approved exact plan:

- approved for future execution design: **TRUE**;
- execution authorized: **FALSE**;
- record read executed: **FALSE**;
- record count read: **0**.

> **HUMAN APPROVAL ≠ EXECUTION**

## Side-effect witness

Review custody grants:

- persistence authority: **FALSE**;
- member-facing delivery authority: **FALSE**;
- MAIA prompt mutation authority: **FALSE**;
- production authority: **FALSE**.

## Verification

Focused R4 review-custody tests: **6 / 6 PASS**

Generated-evidence tests are added at seal.

## Exact next boundary

> **AIN-AETHER-CONNECTOR-01R5 — EXECUTION TOKEN DESIGN · EXACT REVIEWED FINGERPRINT + ONE-SHOT HUMAN AUTHORIZATION / STILL ZERO-RECORD-READ**

The next act should separate reviewed-plan custody from any future execution authorization.
