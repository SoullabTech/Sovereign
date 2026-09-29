# AIN-AETHER-REMOTE-TRANSPORT-01R2 — Witness

Date: 2026-09-28

## Result

R2 establishes the exact sandbox handshake protocol and verifies it through an injected sandbox probe client.

## Request witness

The accepted request is exactly:

```text
HEAD https://<exact-sandbox-host>:443/health
```

with:

- member identifier: **ABSENT**;
- query parameters: **ABSENT**;
- request body: **ABSENT**;
- production credentials: **ABSENT**.

> **ZERO-RECORD HANDSHAKE SHAPE — PASS**

## Response witness

The accepted response carries:

- sandbox endpoint identity;
- HTTP 204;
- body bytes: **0**;
- member record returned: **FALSE**;
- production data returned: **FALSE**.

> **SANDBOX IDENTITY RESPONSE — PASS**

## Negative controls

R2 refuses:

- endpoint identity mismatch;
- non-zero response body;
- member record returned during handshake.

## Network standing

The repository does not currently contain a concrete sandbox endpoint.

Therefore:

> **NO EXTERNAL NETWORK REQUEST WAS EXECUTED**

The handshake client used in tests is injected and non-networked.

## Verification

New R2 tests:

> **5 / 5 PASS**

Connector namespace:

> **84 / 84 PASS**

## Exact next boundary

> **AIN-AETHER-REMOTE-TRANSPORT-01R3 — CONCRETE SANDBOX ENDPOINT CUSTODY · OPERATOR-SUPPLIED HOST + IDENTITY ATTESTATION + FIRST REAL HEAD /health PROBE**

The first real network call should occur only after a concrete sandbox host is supplied and explicitly attested as containing no real member data.
