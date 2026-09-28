# AIN-AETHER-CONNECTOR-01R2 — Witness

Date: 2026-09-28

## Result

R2 establishes a minimum-necessary field manifest before any connector record-read capability exists.

## Allowlist witness

For `member_authored_text`, the fixture manifest permits only:

- `recordRef`;
- `memberRef`;
- `text`;
- `createdAt`;
- `domain`.

Each field carries an explicit Aether purpose.

> **MINIMUM-NECESSARY FIELD DECLARATION — PASS**

## Undeclared-field negative control

The same source request adds:

> `email`

The dry run is refused with:

> `field_not_allowlisted:email`

The source class being permitted does not make every source attribute permissible.

> **SOURCE ACCESS ≠ ATTRIBUTE ACCESS — PASS**

## Source-class witness

The manifest also defines a separate field set for `system_observed_event`, including explicit source-standing representation.

Field permissions remain source-class-specific.

## Zero-read witness

All manifest adjudication still records:

- record read executed: **FALSE**;
- record count read: **0**.

> **ZERO REAL RECORD READ — PASS**

## Standing

No connector has executed.

No record has been fetched.

## Verification

Focused R2 manifest tests: **5 / 5 PASS**

Generated-evidence tests are added at seal.

## Exact next boundary

> **AIN-AETHER-CONNECTOR-01R3 — QUERY PLAN CONTRACT · SOURCE CLASS + FIELD MANIFEST + CONSENT + CARDINALITY LIMIT / ZERO-EXECUTION ONLY**

Before any execution exists, R3 should make the future query itself inspectable and bounded.
