# F5-CONFORMANCE-REPAIR-01 · P5-B — FOUNDER AUTHORIZATION

**Date:** 2026-09-17

```text
FOUNDER ACT            in-session “lets continue” after P5-A closure
P5-A CANDIDATE         8f5bc64854c62ae0f95bc9dabf2fe1803d97a51d
P4 ARCHITECTURE        54e5cb202fe72fb0009e893eb1f3ed2104d1af95
AUTHORIZED             shadow plan builder · domain adapter model · falsifiers

LIVE ROUTE ACTIVATION  NOT AUTHORIZED
CLIENT ACTIVATION      NOT AUTHORIZED
SCHEMA DEPLOYMENT      NOT AUTHORIZED
LEGACY RETIREMENT      NOT AUTHORIZED HERE
PRODUCTION             UNTOUCHED
```

## 1 · Scope spent

P5-B may implement a shadow-only planner that consumes the versioned coverage registry and explicit
read-only facts. It may model domain-specific dispositions and ordering. It may not perform those
dispositions or attach itself to a member-facing route.

The current `/api/members/delete-account` `CONTAINMENT_POSTURE='refuse'` remains binding and unchanged.

## 2 · Registry succession

P5-A registry v1 remains immutable history. P5-B may create v2 with evidence-earned adapter
assignments while preserving `coverageOnly=true` and `activationProhibited=true`.

Only already-earned semantics may change from the v1 refuse seed:

- `auth_sessions` → account/session adapter, revoke before member-row loss;
- `member_settings` / `member_sessions` → account/session adapter, erase as already executed by the canonical route;
- `circle_memberships` → Circles lifecycle revoke/end-membership semantics;
- `circle_inquiry_responses` → Circles lifecycle tombstone semantics;
- the three corresponding account/session CASCADE FK effects may be manifested explicitly.

Everything else remains refuse unless separately adjudicated.

## 3 · Domain expansion rule

A domain adapter may name durable effects that are not direct F5-C identity-column loci when the
subsystem itself proves they are part of the member act. In particular, Circles must plan revocation
of `shared_artifacts.shared_by` even though `shared_by` is not one of the P5-A registry identity
columns.

This is not permission to broaden the registry definition by intuition. Domain expansions must be
named and falsified at their owning subsystem boundary.

## 4 · Shadow-plan acceptance

A P5-B plan must distinguish:

```text
evidence complete / incomplete
lawful refusal / candidate destructive plan
registry locus / FK effect / domain expansion / synthetic account terminal
pre-identity effects / identity-ending effect / post-identity evidence obligations
shadow-plan completeness / activation authority
```

A complete shadow plan is still **not executable authority**. `activationProhibited=true` remains
binding through P5-B.

## 5 · Required falsifiers

P5-B must kill at least:

1. missing locus facts presented as a complete plan;
2. occupied v1-default/refuse locus silently treated as erasable;
3. occupied unadjudicated member FK silently ignored;
4. Circles membership ended before shares/responses are revoked/tombstoned;
5. `shared_artifacts` omitted because it is outside the direct-locus registry;
6. coarse/missing lineage used to guess a derivative deletion;
7. destructive plan requiring S5 presented as activation-ready before S5 integration;
8. shadow planner imported by the live account route or Account Settings;
9. positive-control code mutated to satisfy planner tests.

## 6 · Standing

```text
P5-B SHADOW IMPLEMENTATION   AUTHORIZED
P5-C LEGACY RETIREMENT       CLOSED
P5-D ROUTE/CLIENT ACTIVATION CLOSED
P5-E PRODUCTION              CLOSED
```
