# AIN-AETHER-CONNECTOR-01R4 — Query Plan Hash + Human Review Custody Contract

Date: 2026-09-28

Parent connector R3: `6ed9c1e998485f819bd35f9b33ac9f1aaa0fe326`

## Purpose

R4 binds human review to the exact bounded query plan through a deterministic cryptographic fingerprint.

> **The plan that may someday execute must be exactly the plan that was reviewed; approval cannot mutate the plan and approval cannot itself execute it.**

## Canonicalization law

The fingerprint covers the exact query-plan content in fixed canonical field order:

- query reference;
- connector reference;
- manifest reference;
- member reference;
- consent reference;
- source class;
- ordered field list;
- start time;
- end time;
- maximum record count;
- wildcard flag;
- pagination flag;
- execute flag.

## Fingerprint law

R4 uses:

> `SHA-256`

with canonical version:

> `aether-query-plan-v1`

The resulting digest is the custody identity of the reviewed plan.

## Human review law

A review record must bind:

- review reference;
- human reviewer standing;
- exact query reference;
- exact reviewed fingerprint;
- approval standing;
- review note.

## Drift refusal law

After review, any change to the plan changes the fingerprint.

Examples include:

- adding or removing a field;
- reordering fields;
- widening the time range;
- changing member or consent;
- changing source class;
- increasing record cardinality.

A fingerprint mismatch is refused with:

> `query_plan_fingerprint_mismatch`

## Approval non-execution law

A successful human review may set:

> `approvedForFutureExecutionDesign: true`

It still fixes:

- execution authorized: false;
- record read executed: false;
- record count read: 0.

Human approval is custody evidence, not a read command.

## Side-effect boundary

Review custody grants no:

- persistence;
- member-facing delivery;
- MAIA prompt mutation;
- production authority.

## Next boundary

> **AIN-AETHER-CONNECTOR-01R5 — EXECUTION TOKEN DESIGN · EXACT REVIEWED FINGERPRINT + ONE-SHOT HUMAN AUTHORIZATION / STILL ZERO-RECORD-READ**

R5 should define a one-shot execution token bound to the exact reviewed fingerprint, while still providing no connector executor and reading zero records.
