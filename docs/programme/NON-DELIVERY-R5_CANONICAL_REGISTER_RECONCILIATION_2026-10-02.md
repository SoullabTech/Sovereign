# NON-DELIVERY-R5 — Canonical Register Reconciliation

**Date:** 2026-10-02
**Base:** commit:`e55ff89213237c84e4bcffbbc9090ccd11ba169a`
**Posture:** evidence reconciliation only; no runtime mutation

## Purpose

Reconcile `docs/ops/NON_DELIVERY_REGISTER.md` with mechanisms already merged to canonical and with fresh read-only runtime evidence.

This record distinguishes:
- mechanism implemented
- destination configured
- provider accepted
- human receipt witnessed

Those states are not interchangeable.

## Canonical changes already admitted

- Human-safety delivery substrate: PR #1671, merge commit:`15a9175fb917cd9aa84a2735f7b3cf91a964b49b`.
- Server crisis contract: PR #1633, merge commit:`5c3d31c2a777ee62780906d8e07ba7b5fff47537`.

Rows that still call #1671 a "repair candidate" are therefore stale.

## S1 — prototype crisis pipeline

Current source still does not establish `PersonalOracleAgent` as canonical live member ingress.

However, the pipeline's missing-practitioner/missing-dependency path now invokes the merged content-free `deliverHumanSafetyAlert()` fallback.

Fresh production configuration census:
- Twilio SID/token configured
- Twilio from-number configured
- `SAFETY_ALERT_PHONE` absent
- safety Slack webhook absent

Disposition:
**OPEN · FALLBACK IMPLEMENTED · LIVE REACHABILITY UNPROVEN · RECIPIENT/WITNESS OWED**

The row remains because an exercised prototype path would still fail to reach a human with current production recipient configuration.

## S2 — teen safety alert

The previous "no caller" statement is false on current canonical.

`components/OracleConversation.tsx` has a live caller when teen support enters crisis mode. It invokes `alertSoullabTeam()`, which posts a strict content-free event to authenticated `/api/safety/human-alert`.

Current production has no configured safety recipient, so delivery cannot presently reach a designated human.

Guardian delivery remains separate Phase 2 work.

Disposition:
**OPEN · LIVE PRODUCER + DELIVERY MECHANISM IMPLEMENTED · RECIPIENT/WITNESS OWED**

## S3 — practitioner safety notice

Current `lib/notifications/safety.ts` invokes `deliverHumanSafetyAlert()` on:
- practitioner not found
- missing practitioner email
- provider refusal
- send exception

The independent fallback mechanism is merged.

Current production still lacks a designated safety recipient, and practitioner email remains affected by E1.

Disposition:
**OPEN · FALLBACK IMPLEMENTED · RECIPIENT/WITNESS OWED**

## S4 — circuit breaker

Truth semantics remain correct: `humanNotified` becomes true only when its callback returns true.

Current reachable callback implementations remain non-delivering on canonical.

PR #1713 is the current-base Class-A repair candidate, but admission is held by the distinct-second-human custody requirement.

Disposition:
**OPEN · TRUTHFUL NON-DELIVERY · CLASS-A REPAIR HELD FOR CUSTODY**

## E1 — Resend transport

Fresh read-only production witness on 2026-10-02:

- running artifact: commit:`d4655e6477fa40b8f94c5f8f91be47198288d2af`
- `RESEND_API_KEY`: present
- host-level authenticated Resend domains probe: HTTP 400
- provider response: `validation_error` / API key invalid
- latest delivery-ledger attempt: 2026-10-01 20:53:13 UTC, `auth:email-code`, `resend`, `refused`, `provider_auth`, `validation_error`
- last ledger `accepted`: 2026-09-29 00:40:17 UTC

The in-container curl path also has a CA-bundle defect; that result is not used as the credential verdict. The host-level authenticated probe supplies the credential verdict.

Disposition:
**OPEN · CONFIRMED OUTAGE**

## E2 — uptime monitor

Current canonical monitor code supports independent Twilio SMS and Slack in addition to Resend and fails its test semantics when no independent channel accepts the alert.

The live Mac Studio monitor is running under launchd and its private monitor config currently has:
- Twilio transport configured
- one `ALERT_PHONES` SMS destination
- one email destination

A controlled `--test` witness was then run on 2026-10-02 at 11:15 UTC while Resend remained unavailable.

Observed:
- DOWN SMS transport response: HTTP **201**
- RECOVERED SMS transport response: HTTP **201**
- DOWN email response through Resend: **401**
- RECOVERED email response through Resend: **401**
- monitor verdict: independent channel accepted both alerts

This proves independent provider acceptance while the email transport is unavailable. It does **not** prove that the human recipient saw either SMS.

This monitor configuration is distinct from the production app's `SAFETY_ALERT_PHONE` configuration.

Disposition:
**OPEN · INDEPENDENT PROVIDER ACCEPTANCE WITNESSED · HUMAN RECEIPT UNCONFIRMED**

## E6 — Reply-To routing

Closure witness on current canonical:

`node --test scripts/reply-to-contract.test.mjs`

Result: **5/5 PASS**.

The test proves:
1. practitioner-branded booking mail replies to practitioner;
2. system booking notices reply to support;
3. scheduled practitioner-authored sends use practitioner email with support fallback;
4. scheduled self-test replies to authenticated sender;
5. session follow-up resolves practitioner Reply-To with support fallback.

The structural closure condition is met. E1 may still block transport, but that is a separate register line.

Disposition:
**CLOSED — REMOVE E6 FROM REGISTER IN THIS CHANGE**

## O1 — build/deploy alerts

The #1671 behavior is merged: missing/broken required SMTP no longer prevents optional Slack/Telegram attempts. Required SMTP still governs successful 200 semantics.

Production configuration/witness remains owed.

Disposition:
**OPEN · FALLBACK LOGIC IMPLEMENTED · CONFIG/WITNESS OWED**

## O2 — Postgres standby

Fresh read-only witness on 2026-10-02:

- production artifact: commit:`d4655e6477fa40b8f94c5f8f91be47198288d2af`
- primary bind: `100.119.226.84:5432`
- `wal_level=replica`
- `max_wal_senders=10`
- `wal_keep_size=64MB`
- `pg_stat_replication=0`
- standby `100.118.111.37:22` times out

Current-base recovery preparation is PR #1722. Its preflight exits 2 at the host-reachability gate and authorizes no reseed while the host is unreachable.

Disposition:
**OPEN · CONFIRMED · RECOVERY PREPARED, HOST RECOVERY REQUIRED**

## Summary

The register's present pattern is no longer "four safety paths end at a console log or unread row."

Current truth:
- S1-S3 have implemented human-delivery mechanisms but no configured production safety recipient and no human-receipt witness.
- S4 remains a reachable truthful non-delivery; its repair is held at the Class-A custody boundary.
- E1 remains a confirmed provider-auth outage.
- E2 has an independent monitor path with provider acceptance witnessed for both DOWN and RECOVERED SMS alerts; only human receipt remains unconfirmed.
- E6 is structurally closed and leaves the register.
- O1 has merged fallback logic but still lacks production configuration/witness.
- O2 remains physically unavailable.

The register remains a record of unresolved consequence, not a list of hypothetical code gaps.
