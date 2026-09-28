# AIN-AETHER-CONNECTOR-01R5 — Execution Token Design Contract

Date: 2026-09-28

Parent connector R4: `11432108863db88231dfb036166a51057988b9d1`

## Purpose

R5 separates exact-plan review custody from a future one-shot execution authorization.

> **Review says “this plan is acceptable”; an execution token says “this exact reviewed plan may cross the next gate once.” Neither is the execution itself.**

## Token issuance prerequisites

A token may be issued only when:

- the query plan still matches its exact R4 reviewed fingerprint;
- the R4 human review remains approved;
- a fresh human execution authorization exists;
- that authorization names the exact query reference;
- that authorization carries the exact current plan fingerprint;
- that authorization has a valid issued-at time;
- that authorization has an explicit expiry later than issue time;
- the authorization explicitly grants the next design-gate crossing.

## One-shot law

Every issued token carries:

> `oneShot: true`

Initial state:

- consumed: false;
- execution eligible: true.

After explicit token consumption:

- consumed: true;
- execution eligible: false.

A consumed token cannot be reused.

## Expiry law

A token is unusable at or after its exact expiry boundary.

> `now >= expiresAt` → token expired

No grace period is inferred.

## Fingerprint custody law

The token carries the exact R4 query-plan fingerprint.

If the plan changes after token issuance, next-gate validation refuses it with:

> `token_fingerprint_mismatch`

## Fresh-human-authorization law

R4 review approval does not itself create an R5 token.

A distinct human execution authorization is required.

This preserves:

> review custody ≠ execution authorization

## No-executor law

R5 explicitly requires:

- connector execution implemented: false;
- execution occurred: false;
- record read executed: false;
- record count read: 0.

The token is a custody object for the next gate only.

## Side-effect boundary

Token issuance grants no:

- persistence authority;
- member-facing delivery authority;
- MAIA prompt mutation authority;
- production authority.

## Next boundary

> **AIN-AETHER-CONNECTOR-01R6 — EXECUTION REHEARSAL SINK · TOKEN CONSUMPTION + ZERO-IO / ZERO-RECORD-READ RECEIPT ONLY**

R6 should consume a valid one-shot token into an inert execution rehearsal sink and produce an auditable receipt proving that token consumption, expiry, and replay protection work without connector I/O.
