# AIN-AETHER-REMOTE-TRANSPORT-01R1 — Witness

Date: 2026-09-28

## Result

R1 establishes the first sandbox-only remote transport declaration while keeping network execution absent.

## Endpoint identity witness

The contract requires an endpoint explicitly marked:

- sandbox: **TRUE**;
- HTTPS: **TRUE**;
- port 443: **TRUE**;
- real member data present: **FALSE**;
- production data present: **FALSE**.

> **SANDBOX ENDPOINT IDENTITY — PASS**

## Egress custody witness

The egress allowlist must contain exactly the sandbox endpoint host.

A second host is refused with:

> `egress_allowlist_must_match_exact_sandbox_host`

> **EXACT-HOST EGRESS ALLOWLIST — PASS**

## Zero-request witness

At R1:

- remote request implementation present: **FALSE**;
- record reader present: **FALSE**;
- remote request executed: **FALSE**;
- record read executed: **FALSE**;
- record count read: **0**.

> **REMOTE CAPABILITY DECLARATION ≠ NETWORK EXECUTION**

## Verification

Focused R1 transport tests: **5 / 5 PASS**

Full Aether + Source Fabric population:

> **669 / 669 PASS**

## Exact next boundary

> **AIN-AETHER-REMOTE-TRANSPORT-01R2 — SANDBOX ENDPOINT HANDSHAKE DESIGN · EXACT HOST/TLS IDENTITY + HEAD/HEALTH-STYLE ZERO-RECORD PROBE ONLY**

The first actual network operation, if authorized, should verify only the sandbox endpoint itself and return no member record.
