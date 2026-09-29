# AIN-AETHER-REMOTE-TRANSPORT-01R3 — Concrete Sandbox Endpoint Custody Preflight

Date: 2026-09-28

Parent R2: `62423e90ddb70dfa7f4d94fa7daefaafda2c183d`

## Purpose

This preflight defines the operator custody record required before the first real sandbox network probe.

> **A real network call may occur only after the exact sandbox endpoint is explicitly supplied and attested as containing no real member or production data.**

## Required operator attestation

The custody record must include:

- human operator standing;
- attestation reference;
- exact endpoint reference;
- exact host;
- environment: `sandbox`;
- real member data present: false;
- production data present: false;
- production credentials accepted: false;
- exact health path: `/health`;
- explicit attested standing;
- non-empty operator note.

## Fail-closed law

No attestation means:

> `operator_sandbox_endpoint_attestation_required`

Real member data, production data, or production-credential acceptance all block readiness.

## Readiness is not probe authority

Even a complete valid attestation yields only:

> `readyForFirstProbe: true`

It still records:

- real network probe authorized: false;
- real network probe executed: false.

A separate probe act remains required.

## Current standing

No operator-supplied remote sandbox endpoint is present.

`staging.soullab.life` is explicitly disqualified because repository documentation states it shares the production database.

The isolated local test database is valid for local verification, but it is not a remote sandbox host.

## Exact next boundary

> **OPERATOR ENDPOINT SUPPLY — exact remote sandbox host + endpoint identity + zero-real-data attestation**

Only after that supply may R3 proceed to the first real `HEAD /health` probe.
