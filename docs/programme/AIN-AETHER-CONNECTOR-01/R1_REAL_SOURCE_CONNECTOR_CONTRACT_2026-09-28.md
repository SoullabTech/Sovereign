# AIN-AETHER-CONNECTOR-01R1 — Real Source Connector Contract

Date: 2026-09-28

Parent fixture live-adapter closure: `e775aed82695fc11fa7928071b6a89d5e6f87221`

## Purpose

R1 defines what a future real source connector may declare before it is permitted to read any record.

> **A connector may declare what it could read before it is ever allowed to read a record.**

## Connector declaration

A connector may declare source classes such as:

- member-authored text;
- member-confirmed imports;
- system-observed events.

Declaration is capability metadata, not execution authority.

## Zero-read implementation law

R1 explicitly requires:

- record-read implementation: false;
- persistence implementation: false;
- delivery implementation: false;
- prompt-mutation implementation: false;
- production-route implementation: false.

The contract exposes no record-fetching operation.

## Consent binding

Every dry-run request must still be bound to an Aether reflection consent grant matching:

- member reference;
- consent reference;
- purpose.

The consent must preserve the existing no-persistence, no-delivery, no-prompt-mutation, and no-production limits.

## Declared-source law

A dry run may request only source classes declared by the connector.

Undeclared source classes fail closed.

## Dry-run law

The R1 dry run may inspect capability compatibility only.

It must return:

- dry-run only: true;
- record read executed: false;
- record count read: 0.

Any request setting record-read execution to true is refused.

## Side-effect boundary

R1 grants no:

- persistence authority;
- member-facing delivery authority;
- MAIA prompt mutation authority;
- production authority.

## No-record-read boundary

R1 reads zero real records and invokes no external connector.

## Next boundary

> **AIN-AETHER-CONNECTOR-01R2 — CONNECTOR SOURCE MANIFEST + FIELD ALLOWLIST · MINIMUM-NECESSARY ATTRIBUTE DECLARATION / ZERO-RECORD-READ ONLY**

R2 should define the exact fields a future connector would be allowed to request for each source class, before any record-fetch capability is introduced.
