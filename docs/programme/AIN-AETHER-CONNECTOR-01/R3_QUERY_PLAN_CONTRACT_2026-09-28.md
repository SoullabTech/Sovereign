# AIN-AETHER-CONNECTOR-01R3 — Query Plan Contract

Date: 2026-09-28

Parent connector R2: `20f5d4c754c126da39f90d0585f55f06853fa996`

## Purpose

R3 makes a future connector read inspectable and bounded before any execution capability exists.

> **A future read must be bounded before it is executable: what source, what fields, whose data, what time range, and how many records must all be explicit in advance.**

## Query-plan law

A query plan must name:

- exact connector;
- exact field manifest;
- exact member;
- exact consent;
- exact source class;
- exact allowlisted fields;
- explicit start time;
- explicit end time;
- hard maximum record count.

## Wildcard law

Wildcard access is forbidden.

A source class and exact fields must be named.

## Pagination law

Pagination is forbidden in R3.

The plan cannot silently continue beyond its declared record ceiling.

## Cardinality law

R3 uses a hard design ceiling of:

> **100 records**

A plan above that ceiling is refused before execution exists.

The ceiling is a design bound, not an authorization to read 100 records.

## Time-window law

Both start and end timestamps must parse.

Start must be strictly earlier than end.

No open-ended time range is inferred.

## Field-manifest inheritance

Every planned field must pass the R2 minimum-necessary field manifest.

A valid source class does not permit an undeclared attribute.

## Consent inheritance

The plan remains bound to the member and consent reference.

The existing Aether reflection purpose and zero-side-effect consent boundaries remain intact.

## Zero-execution law

R3 provides no query executor.

Every adjudication records:

- zero execution: true;
- record read executed: false;
- record count read: 0.

## Side-effect boundary

Query planning grants no:

- persistence;
- member-facing delivery;
- MAIA prompt mutation;
- production authority.

## Next boundary

> **AIN-AETHER-CONNECTOR-01R4 — QUERY PLAN HASH + HUMAN REVIEW CUSTODY · IMMUTABLE PLAN FINGERPRINT + APPROVAL DOES NOT EXECUTE**

R4 should bind a reviewed query plan to an immutable fingerprint so later execution design cannot silently widen fields, time range, or cardinality after human review.
