# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R6 — Dispatch Admission Contract

**Date:** 2026-10-03
**Base:** `2eefe1823bc69c02b6931d762f6e592f8af75901` (#1757 head)
**Class:** design + falsifier freeze only
**Standing:** PRE-IMPLEMENTATION · NO DISPATCH

## Purpose

R5A answers one question:

> Which already-routed Work Unit is current-reachable and eligible to attempt dispatch?

R6 answers a narrower next question:

> Are all independently governed preconditions simultaneously true for one dispatch attempt to become admissible?

R6 composes existing truths. It creates no new authority source and performs no effect.

## Required evidence

An R6 admission may be `ADMISSIBLE` only when all of these are true at the same decision boundary:

1. R5A readiness is exactly `READY`;
2. an E1 execution grant exists and is exactly `ACTIVE`;
3. live Builder session admission is exactly `ADMITTED`;
4. W2 lifecycle is still exactly `ROUTED`;
5. the bound route is fresh;
6. the authorized core is fresh.

Any missing or stale condition yields `HELD`.

## Constitutional distinction

The programme now keeps three separate propositions:

- **eligible** — R5A selection evidence;
- **authorized** — E1 one-shot execution grant;
- **admissible to dispatch** — R6 simultaneous precondition composition.

None of those propositions means that dispatch has occurred.

R6 itself therefore may not:

- open a Builder session;
- claim a worktree;
- claim or consume an E1 grant;
- transition W2 to `EXECUTING`;
- launch a provider;
- create a retry;
- widen route, scope, authority, or evidence;
- infer that stale capacity is still available.

## Existing owners retained

R6 does not replace existing mechanisms:

- `session.mjs open` remains authoritative for live concurrency and worktree ownership;
- E1 remains authoritative for human one-shot provider execution authority;
- W2 remains authoritative for lifecycle transition;
- provider execution remains downstream of those guards.

This is intentionally composition, not a second dispatcher.

## Frozen falsifiers

- **R6-F1** — R5A readiness is necessary but insufficient.
- **R6-F2** — ACTIVE E1 grant is independently required.
- **R6-F3** — live session admission is independently required.
- **R6-F4** — own lifecycle must still be ROUTED.
- **R6-F5** — route freshness is rechecked.
- **R6-F6** — authorized-core freshness is rechecked.
- **R6-F7** — R6 decision itself carries no effect.
- **R6-F8** — identical evidence yields identical decision.

Matrix result:

- reference: **8/8 PASS**
- defeat candidates: **8/8 KILLED on named law**
- result: **LETHAL + DISCRIMINATING**

Freeze:
`tests/constitutional/jarvis-o5-r6/FREEZE.json`

## Naming ruling

This unit is named **O5-R6 Dispatch Admission**.

It deliberately does not reuse “R5B,” because `JARVIS-ROUTING-INTELLIGENCE-01 / R5B` already names the distinct Human Provider Execution Authorization programme. Reusing that identifier for orchestration parallelism would collapse two separate authority concepts.

## What is not opened

- no R6 runtime implementation;
- no automatic session open;
- no automatic E1 grant issuance;
- no automatic grant claim;
- no dispatch;
- no R5B parallel scheduling;
- no O6 Verification Supervisor;
- no O7/O8 behavior;
- no merge, deploy, or production mutation.

Closure sentence:

> **R6 may declare one dispatch attempt admissible only when readiness, human execution authority, live session admission, lifecycle, route freshness, and authorized-core freshness are simultaneously proven. R6 itself performs no dispatch.**
