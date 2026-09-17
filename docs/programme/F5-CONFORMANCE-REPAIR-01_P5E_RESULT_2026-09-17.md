# F5-CONFORMANCE-REPAIR-01 · P5-E — RESULT

**Date:** 2026-09-17
**Authority:** `F5-CONFORMANCE-REPAIR-01_P5E_FOUNDER_AUTHORIZATION_2026-09-17.md`
**Subject:** `f9a6855828b6f3fb66c2cb16eb16153dc3ae7f7b`

```text
P5-E DISPOSABLE BOOTSTRAP          PASS
P5-A MIGRATION APPLICATION         PASS
P5-D S5 MIGRATION APPLICATION      FAIL
P5-E VERDICT                       RETURN / STOP
RESTORE REHEARSAL                  NOT RUN
EXECUTOR RUNTIME WITNESS           NOT RUN
PRODUCTION READ / WRITE            NONE
STAGING READ / WRITE               NONE
REAL MEMBER DELETION               NONE
ROLLOUT DECISION                   NOT EARNED
```

## 1 · Gate reached

The canonical production-derived baseline bootstrapped successfully into a disposable PostgreSQL 17.7
database: **634 tables and 504 seeded migration-ledger rows**. The repository migration runner then
applied all required post-baseline migrations through P5-A.

`20260917000001_account_erasure_ledger.sql` applied cleanly.

P5-E stopped on `20260917000002_account_erasure_p5d_s5_fences.sql` exactly as the founder authorization
required when a candidate migration cannot apply cleanly.

## 2 · Defect

The P5-D S5 migration discovers direct member-reference fence targets using `information_schema.columns`.
That discovery includes views. It then attempts to install a row-level `BEFORE INSERT OR UPDATE` trigger
on every discovered name.

The first failing view is `active_patterns`:

```text
ERROR:  "active_patterns" is a view
DETAIL: Views cannot have row-level BEFORE or AFTER triggers.
```

The full candidate set contained **314 ordinary tables and 15 views**. Therefore this is a discovery-
authority mismatch, not an isolated `active_patterns` exception.

The v3 erasure registry does not classify `active_patterns`, which is consistent with its purpose as a
durable custody registry. The migration widened its own target population beyond that authority.

## 3 · Independent reproduction

A second fresh disposable PostgreSQL 17.7 cluster independently reproduced the same stop using the
canonical bootstrap and unmodified migration runner. The exact target predicate resolved to **314
ordinary tables and 15 views**, and failed on `active_patterns` before any P5-D fence survived rollback.

Independent migration-log SHA-256:

```text
90fcebf6ed0ebaa13918428707eca9ec01b74f441be102305b400ff6645c767c
```

The independent reproduction resolves the migration-application verdict; it does not widen P5-E
authority beyond the stop condition.

## 4 · Rollback was clean

After the failed migration:

- P5-A's account-erasure ledger remained applied;
- P5-D had no migration-ledger row;
- no P5-D fence functions remained;
- no P5-D fence triggers remained.

The disposable server and database were then destroyed.

## 5 · Constitutional consequence

P5-D remains a repository candidate, but **P5-E does not ratify it for rollout**. The source-level
falsifiers were insufficient to catch that `information_schema.columns` includes non-table relations.

No claim may now be made that:

- the P5-D migrations apply cleanly to the canonical bootstrap path;
- S5 account-erasure fences are deployable;
- disaster recovery has been rehearsed;
- account erasure is production-ready; or
- F5 erasure conformance is closed in runtime.

## 6 · Required bounded repair

The next repair must be smaller than P5-D itself:

```text
P5-D-R1 · S5 FENCE TARGET AUTHORITY
```

It must make the fence population mechanically equal to lawful durable storage targets, not every
`information_schema.columns` relation. A viable correction must at minimum prove:

1. views/materialized non-table surfaces cannot enter the row-trigger population;
2. ordinary/partitioned durable tables that carry governed identity columns remain fenced;
3. Circle special-state tables remain excluded from the generic physical-row fence and keep their
   dedicated state-preserving S5 semantics;
4. the migration still fails closed on an unexpected durable storage kind rather than silently skipping it;
5. a clean disposable bootstrap + full migration run reaches and applies both P5 migrations;
6. only after that may P5-E resume executor and governed-restore rehearsal.

This result does **not** authorize that repair by itself. It records the return condition and the exact
next decision boundary.

## 7 · Standing

```text
P5-A  durable ledger + coverage registry       COMPLETE
P5-B  shadow planner + governed adapters       COMPLETE
P5-C  legacy authority retirement              COMPLETE
P5-D  canonical governed integration           CANDIDATE · RETURNED BY P5-E MIGRATION WITNESS
P5-E  disposable/runtime/restore witness       STOPPED AT MIGRATION APPLICATION

P5-D-R1 S5 fence-target repair                 CLOSED · NEW FOUNDER CONTINUATION REQUIRED
P5-E restore rehearsal                         CLOSED
P5-E production witness                        CLOSED
CANONICAL MERGE / DEPLOY                       CLOSED
PRODUCTION                                     UNTOUCHED
```
