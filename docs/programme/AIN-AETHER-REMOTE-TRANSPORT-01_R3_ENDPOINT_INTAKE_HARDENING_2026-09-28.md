# AIN-AETHER-REMOTE-TRANSPORT-01R3 — Endpoint Intake Hardening

Date: 2026-09-28

Parent R3 custody preflight: `cf4a0ba5afe1251820d700f8fbee16344e967683`

## Purpose

This increment hardens the operator-supplied endpoint intake so the first real sandbox probe cannot accidentally target local, shared-staging, or production infrastructure.

> **Endpoint supply must fail closed before network custody can advance.**

## Accepted endpoint shape

The intake accepts only a base URL that is:

- HTTPS;
- port 443 or implicit 443;
- host-only, with no path;
- no query string;
- no fragment;
- accompanied by explicit zero-real-member-data attestation;
- accompanied by explicit zero-production-data attestation;
- accompanied by explicit rejection of production credentials.

## Explicitly forbidden hosts

The intake rejects:

- `localhost`;
- `127.0.0.1`;
- `::1`;
- `soullab.life`;
- `www.soullab.life`;
- `staging.soullab.life`.

This encodes the repository's standing that shared staging is not an isolated environment.

## Intake result

A successful intake produces an operator sandbox endpoint attestation suitable for the existing R3 custody gate.

It still does not authorize or execute a network probe.

## Verification

New endpoint-intake tests:

> **5 / 5 PASS**

Connector namespace:

> **93 / 93 PASS**

Full Aether + Source Fabric population:

> **683 / 683 PASS**

## Standing

> **R3 ENDPOINT INTAKE HARDENED · FIRST REAL PROBE STILL BLOCKED AWAITING OPERATOR-SUPPLIED REMOTE SANDBOX URL**

No network request was executed.
