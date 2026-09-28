# AIN-AETHER-CONNECTOR-01R2 — Connector Source Manifest + Field Allowlist Contract

Date: 2026-09-28

Parent connector R1: `9abb694d4bd0d6c26e2acca46b0187fa5cb42868`

## Purpose

R2 defines the exact attributes a future connector would be permitted to request for each declared source class.

> **A connector may not request an attribute merely because the source possesses it; every field must be explicitly necessary for the authorized Aether purpose.**

## Source manifest law

Each source-class manifest entry declares:

- exact field name;
- explicit Aether purpose;
- whether the field is required.

Examples of admissible purposes include:

- identify source;
- bind member scope;
- represent observation;
- represent time;
- represent domain;
- represent source standing.

## Minimum-necessary law

The manifest carries:

> `minimumNecessary: true`

Fields absent from the manifest are not implicitly permitted.

An undeclared field is refused with:

> `field_not_allowlisted:<field>`

## Source-class isolation

A field allowlist belongs to one exact source class.

Permission to read one source class does not imply permission to read another.

## Purpose-binding law

Every declared field must have an explicit purpose.

A field cannot be allowlisted without saying why Aether needs it.

## Zero-record-read law

R2 still performs only manifest adjudication.

Every result records:

- zero record read: true;
- record read executed: false;
- record count read: 0.

## No-side-effect boundary

R2 does not:

- fetch a record;
- connect to an external source;
- persist data;
- deliver member-facing output;
- mutate MAIA;
- open production.

## Next boundary

> **AIN-AETHER-CONNECTOR-01R3 — QUERY PLAN CONTRACT · SOURCE CLASS + FIELD MANIFEST + CONSENT + CARDINALITY LIMIT / ZERO-EXECUTION ONLY**

R3 should define the exact shape of a future connector query—including source class, allowlisted fields, member scope, time window, and maximum record count—while still forbidding execution.
