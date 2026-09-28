# AIN-AETHER-LIVE-ADAPTER-01R2 — Witness

Date: 2026-09-28

## Result

R2 establishes deterministic consent lifetime and revocation behavior using fixture-only records.

## Read-once witness

A read-once grant is valid before first use.

It reports:

- valid: **TRUE**;
- consume on use: **TRUE**;
- reusable: **FALSE**.

After one consumption, the same consent evaluates as:

> **CONSUMED**

and cannot be reused.

> **READ-ONCE MEANS ONCE — PASS**

## Session witness

A session-scoped consent is reusable while:

- the session reference matches;
- the consent is unexpired;
- the consent is not revoked.

A different session reference is refused.

> **SESSION SCOPE DOES NOT LEAK ACROSS SESSIONS — PASS**

## Expiry witness

At the exact expiry boundary the grant evaluates as:

> **EXPIRED**

No implicit grace period is introduced.

## Revocation witness

A session grant revoked before normal expiry evaluates as:

> **REVOKED**

on the next attempted use.

> **REVOCATION OVERRIDES REMAINING LIFETIME — PASS**

## Standing

No real connector or member data is involved.

R2 establishes only the consent lifecycle semantics that a future source reader must obey.

## Verification

Focused R2 consent-lifecycle tests: **5 / 5 PASS**

Generated-evidence tests are added at seal.

## Exact next boundary

> **AIN-AETHER-LIVE-ADAPTER-01R3 — CONSENT-GATED SHADOW READ TRANSACTION · FIXTURE SOURCE READER + READ-ONCE ATOMIC CONSUMPTION ONLY**

The next act should prove consent validation and shadow read can be treated as one fail-closed transaction before any real connector exists.
