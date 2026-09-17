# F5-CONFORMANCE-REPAIR-01 · P5-A — FOUNDER IMPLEMENTATION AUTHORIZATION

**Date:** 2026-09-17

```text
FOUNDER ACT            in-session "lets continue"
P4 SELECTED OBJECT     54e5cb202fe72fb0009e893eb1f3ed2104d1af95
AUTHORIZED CUT         P5-A ONLY

P5-A                   durable act/disposition substrate + invariants + registry coverage guards
P5-B                   CLOSED
P5-C                   CLOSED
P5-D                   CLOSED
P5-E / PRODUCTION      CLOSED
```

## 1 · Authority spent

The founder continuation occurs immediately after P4 named its next exact gate as founder
authorization, return, or rejection of P5 implementation. The act is therefore spent narrowly on
P5-A, the first implementation cut predeclared by P4.

This authorization permits source/schema candidate work required to build and falsify:

- a durable account-erasure act that survives the member row;
- an immutable/frozen per-domain plan;
- append-only execution / verification / owed-custody evidence;
- a versioned member-bound storage + member-FK coverage registry;
- mechanical guards that fail on unclassified schema drift;
- tests proving the P5-A invariants and relevant P4 mutants.

## 2 · What remains closed

This act does **not** authorize:

- changing `/api/members/delete-account` behavior;
- changing Account Settings member-visible behavior;
- executing Circle revocation from account closure;
- retiring or redirecting `/api/sovereignty/delete-my-memory` yet;
- writing S5 manifests from account closure;
- executing any account-erasure plan;
- lineage repair;
- schema deployment or migration application;
- production reads, writes, backfills, cleanup, rollout, or deploy.

The existing account-closure refusal posture remains the live behavior until P5-D is separately
opened after P5-B/P5-C evidence.

## 3 · Registry posture

P5-A is a **coverage** act, not a mass disposition ruling.

Every currently discovered durable member-bound locus and every migration-declared FK effect to
`members(id)` must be represented in the registry. Existing loci without an adjudicated adapter are
seeded conservatively as `refuse`; this means *known, covered, activation-blocking*, not *forever
retained* and not *safe to delete*.

The dedicated erasure act itself is explicitly `retain`: the constitutional record must survive the
member row it accounts for.

No future schema addition may become executable merely because the guard can discover it. A new
locus/FK must appear as an explicit registry diff before governance passes.

## 4 · P5-A acceptance

P5-A may close only if:

1. F5-C baseline anti-vacuity reproduces **634 tables / 302 member-bound**;
2. the current repository union is fully represented in the registry;
3. F5-R1 migration-FK anchors reproduce **243 tables / 264 table-action pairs** with
   **161 CASCADE · 24 RESTRICT · 47 NO ACTION · 32 SET NULL**;
4. every raw migration declaration of `REFERENCES members(id)` is fingerprinted by source location
   and classified;
5. the ledger refuses plan mutation after freeze, history rewrite, direct deletion, and truncate;
6. `completed` is structurally refused while required verification is absent or custody is still
   owed;
7. no member-facing or account-deletion execution behavior changes;
8. repository pre-commit and CI sovereignty gates invoke the registry guard.

## 5 · Standing

```text
P5-A IMPLEMENTATION     AUTHORIZED
P5-B..E                 CLOSED
CURRENT FAIL-CLOSED     PRESERVE
SCHEMA DEPLOYMENT       NOT AUTHORIZED
PRODUCTION              UNTOUCHED
```
