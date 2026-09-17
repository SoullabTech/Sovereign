# F5-CONFORMANCE-REPAIR-01 · P5-E — FOUNDER AUTHORIZATION

**Date:** 2026-09-17
**Founder act:** continuation after P5-D candidate PASS at `f9a6855828b6f3fb66c2cb16eb16153dc3ae7f7b`

```text
P5-D SUBJECT                 f9a6855828b6f3fb66c2cb16eb16153dc3ae7f7b
P5-E MODE                    DISPOSABLE APPLICATION / RESTORE / ROLLOUT-READINESS WITNESS
PRODUCTION MUTATION          CLOSED
STAGING MUTATION             CLOSED
REAL MEMBER DELETION         CLOSED
CANONICAL MERGE / DEPLOY     CLOSED
```

## 1 · Authority spent

The founder's continuation opens P5-E only far enough to test whether the P5-D candidate can actually
be applied, executed, recovered and falsified in a disposable environment. This act converts the
repository-only candidate into runtime evidence without spending production authority.

P5-E may:

- create and destroy local/disposable PostgreSQL clusters and databases;
- apply the canonical baseline and repository migrations to those disposable databases;
- apply migrations `20260917000001_account_erasure_ledger.sql` and
  `20260917000002_account_erasure_p5d_s5_fences.sql`;
- seed synthetic members/content/Circle relationships solely for falsification;
- exercise the governed executor/SQL semantics against synthetic rows;
- create disposable backups and perform governed restore rehearsals;
- inspect migration compatibility, ledger state, S5 fences, Circle tombstones and restore outcomes;
- write tests/witness scripts needed to make those observations repeatable;
- record a rollout-readiness decision based on the earned evidence;
- commit and push P5-E evidence/corrections to the existing F5 candidate branch.

## 2 · Explicitly not authorized

This act does **not** authorize:

- connecting to or reading production merely because P5-E is open;
- applying migrations to production or staging;
- deleting, mutating, backfilling or inspecting any real member account;
- historical incident investigation against live data;
- changing the 313 refuse-by-default direct-locus dispositions;
- repairing unresolved lineage by assumption;
- canonical merge, release, deploy, branch promotion or production rollout.

## 3 · Required stop conditions

P5-E must STOP and return if a disposable witness shows that:

- either migration cannot apply cleanly to the canonical bootstrap path;
- the executor can report completion without durable ledger/S5 evidence;
- Circle representation can resurrect active after governed restore;
- an erased member can resurrect after governed restore;
- a failed/refused act mutates the synthetic member state;
- restore requires weakening an existing constitutional subsystem; or
- rollout would require production facts not yet authorized for collection.

A disposable PASS may establish **rollout readiness**. It does not itself authorize production.
