# AIN-AETHER-LIVE-ADAPTER-01R3 — Consent-Gated Shadow Read Transaction Contract

Date: 2026-09-28

Parent live-adapter R2: `07c666b980923c6b783d6b62041feb9d300b3182`

## Purpose

R3 models consent validation, fixture-source read, shadow admission, and read-once consumption as one fail-closed transaction.

> **If any stage fails, the transaction produces no shadow observation and no partial consent consumption.**

## Transaction order

1. validate consent lifecycle;
2. read the exact fixture source;
3. verify source member matches consent member;
4. admit the source through the R1 read-only shadow membrane;
5. consume read-once consent only after every prior stage succeeds.

## Atomicity law

Consent consumption is part of the successful transaction result.

Failures preserve the original lifecycle record unchanged.

## Negative paths

R3 refuses without consumption when:

- consent is expired, revoked, invalid, consumed, or mismatched;
- the source does not exist;
- source member does not match consent member;
- shadow admission rejects the source content.

## Side-effect boundary

Even a committed transaction authorizes no:

- persistence;
- member-facing delivery;
- MAIA prompt mutation;
- production authority.

The only transaction outputs are a read-only shadow and updated in-memory consent lifecycle.

## Fixture-only boundary

No real connector or member record is used.

## Next boundary

> **AIN-AETHER-LIVE-ADAPTER-01R4 — SHADOW OBSERVATION → SYNTHETIC-RUNTIME COMPATIBILITY ADAPTER · LIVE-SHAPED FIXTURE ONLY + AUTHORITY NON-ESCALATION**

R4 should prove an admitted read-only shadow can enter the already-closed runtime observation membrane without gaining standing or side-effect authority.
