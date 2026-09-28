# AIN-AETHER-LIVE-ADAPTER-01R2 — Consent Lifetime + Revocation Contract

Date: 2026-09-28

Parent live-adapter R1: `73a59e9dec61173ee735ebaa134d2cc0fdfa0bc8`

## Purpose

R2 defines the lifetime of live Aether consent before any actual source connector exists.

> **Consent must fail closed over time; silence, age, reuse, or ambiguity cannot extend it.**

## Consent states

R2 distinguishes:

- `valid`;
- `consumed`;
- `expired`;
- `revoked`;
- `invalid`.

## Read-once law

A consent grant scoped to:

> `aether_read_once`

is valid for one authorized use only.

After use, a consumed timestamp is recorded in the lifecycle record and the consent cannot be reused.

A second read fails with:

> `consent_already_consumed`

## Session-read law

A consent grant scoped to:

> `aether_session_read`

may be reused only:

- inside the exact bound session;
- before expiry;
- while not revoked.

A wrong or missing session reference fails closed.

## Expiry law

At or after the exact `expiresAt` boundary, consent is expired.

Expiry is inclusive:

> `now >= expiresAt` → expired

No grace period is inferred.

## Revocation law

A revocation timestamp terminates consent from that point forward even if normal expiry has not yet occurred.

Revocation does not wait for session end.

## Mismatch law

Consent fails closed when:

- request member differs from consent member;
- request consent reference differs from grant;
- lifecycle record belongs to another consent;
- session reference mismatches.

## Time validity law

Malformed timestamps produce invalid consent standing rather than guessed chronology.

Consent that appears to be used before its grant time is invalid.

## No-live-connector boundary

R2 remains fixture-only.

No connector.
No real member source read.
No persistence.
No delivery.
No production.

## Next boundary

> **AIN-AETHER-LIVE-ADAPTER-01R3 — CONSENT-GATED SHADOW READ TRANSACTION · FIXTURE SOURCE READER + READ-ONCE ATOMIC CONSUMPTION ONLY**

R3 should model the full read transaction: validate consent, read one fixture source, create a shadow observation, and consume read-once consent atomically in the transaction result without introducing persistence.
