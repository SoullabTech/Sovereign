# AIN-AETHER-REMOTE-TRANSPORT-01R3R1 — Remote Tunnel Routing Repair Witness

Date: 2026-09-28 (America/New_York)
Branch: `feature/ain-aether-remote-transport-01-20260928`
Frozen first-probe witness: `8f781f40147040a46b54c2615f4cce852ac8d7aa`

## Boundary

R3R1 was authorized for local/tunnel diagnostics only after the first real remote probe failed closed. No second external endpoint request was authorized.

The health-only sandbox origin remained unchanged:

- endpoint ref: `aether-sandbox-health-01`
- local origin: `http://127.0.0.1:3843`
- permitted health operation: `HEAD /health`
- datastore: none
- member routes: none
- record surface: none
- production credentials: none
- committed origin git object: `0a57ae895e73bee5115696fc22b31319589886a3`

## Root cause

The failed quick tunnel had been started with `--url http://127.0.0.1:3843`, but cloudflared also loaded the machine's default `~/.cloudflared/config.yml`.

That default config is the production World Gate configuration. It declares Soullab production hostnames followed by:

`- service: http_status:404`

Because the temporary `*.trycloudflare.com` hostname matched none of the declared production hostnames, it reached the catch-all 404 rule instead of the explicit health origin.

This explains the first witness exactly: Cloudflare returned 404 and the sandbox identity headers were absent. The health server itself remained healthy and unchanged.

## Repair

The failed quick-tunnel process was stopped. The health origin was left running unchanged.

A new quick tunnel was started with an explicitly isolated config path and sole origin:

`cloudflared tunnel --config /tmp/aether-r3-cloudflared-empty.yml --no-autoupdate --url http://127.0.0.1:3843`

The resulting process settings contain the isolated config path and `url:http://127.0.0.1:3843`; they do not contain the production credentials file or production ingress table.

The tunnel registered successfully over QUIC and supplied the fresh exact HTTPS host:

`non-give-investigator-cole.trycloudflare.com`

No HTTP request was sent to that host during R3R1.

## Fresh custody

Operator endpoint intake: **PASS**

Sandbox endpoint custody: **PASS**

- sandbox standing confirmed: TRUE
- zero real-member data confirmed: TRUE
- zero production data confirmed: TRUE
- production credentials rejected: TRUE
- ready for first/next governed probe: TRUE
- real network probe authorized by custody object: FALSE
- real network probe executed in R3R1: FALSE

The custody object remains deliberately non-authorizing; human authorization is still required before the next real probe.

## R3R1 adjudication

**REMOTE TUNNEL ROUTING REPAIR · PASS**

The first-probe failure is explained by configuration precedence/catch-all routing, the sandbox origin is unchanged, a fresh isolated tunnel is registered, and fresh endpoint custody passes.

R3 itself remains open because the repaired remote route has not yet been witnessed by an external `HEAD /health`.

## Exact stop

No second external network probe was sent.

No production or staging route was touched. No datastore, member route, member identifier, request body, production credential, record read, persistence action, member-facing delivery, or MAIA mutation was introduced.

## Exact next boundary

`AIN-AETHER-REMOTE-TRANSPORT-01R3R2 — SECOND REAL HEAD /health PROBE · EXACT FRESH HOST ONLY`

Only after explicit founder authorization, send exactly one `HEAD https://non-give-investigator-cole.trycloudflare.com/health`, require status 200/204, zero response body, exact endpoint ref `aether-sandbox-health-01`, and environment `sandbox`; then stop and adjudicate R3 from that single witness.