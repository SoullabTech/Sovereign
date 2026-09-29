# AIN-AETHER-REMOTE-TRANSPORT-01R2 — Sandbox Endpoint Handshake Contract

Date: 2026-09-28

Parent R1: `7473ef93118455de7a5208fd9c85e8d44a08b947`

## Purpose

R2 defines and validates the first zero-record sandbox handshake shape.

> **The first remote call may prove “this is the sandbox endpoint,” but it may not yet ask the sandbox for a member record.**

## Request law

The handshake request is fixed to:

- method: `HEAD`;
- scheme: `https`;
- exact R1 sandbox host;
- port: `443`;
- path: `/health`;
- member identifier included: false;
- query parameters included: false;
- request body included: false;
- production credentials included: false.

## Response law

An admissible response must provide only:

- HTTP 200 or 204 standing;
- exact sandbox endpoint reference;
- environment: sandbox;
- response body bytes: 0;
- member record returned: false;
- production data returned: false.

## Identity law

The returned endpoint reference must match the exact configured sandbox endpoint identity.

A mismatch is refused with:

> `endpoint_identity_mismatch`

## Zero-record law

The handshake cannot request or return member data.

It records:

- record read executed: false;
- record count read: 0;
- response body bytes: 0.

## Current execution standing

No concrete sandbox endpoint is configured in the repository yet.

Therefore R2 validates the handshake against an injected probe client only.

No external network request has been made.

This is intentional: the system does not invent or guess a sandbox host.

## Side-effect boundary

R2 grants no:

- persistence authority;
- member-facing delivery authority;
- MAIA prompt mutation authority;
- production authority.

## Exact next boundary

> **AIN-AETHER-REMOTE-TRANSPORT-01R3 — CONCRETE SANDBOX ENDPOINT CUSTODY · OPERATOR-SUPPLIED HOST + IDENTITY ATTESTATION + FIRST REAL HEAD /health PROBE**

R3 should require a real operator-supplied sandbox endpoint before any external network call is made.
