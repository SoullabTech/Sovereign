# REVIEW-CUSTODY-01 · STEP 3R — MATERIAL REVIEW FINDING DISPOSITION

**Date:** 2026-09-21
**Status:** DISPOSITION COMPLETE · REMEDIATION NOT OPENED
**Predecessor:** `788e1aba248b61e33c6a0ba9eea6fdcdaec5f9d0`
**Purpose:** resolve what the first real Step 3C `REVISE` findings mean now,
without changing migration bytes, deployment order, production schema, or runtime.

## Question 1 — is the reviewed migration still pending?

No.

Read-only production observation from the Minisforum:

```text
running app GIT_COMMIT
  1faec4016

schema_migrations
  20260916123000_turn_taking_preferences.sql
  applied_at = 2026-09-17 02:12:39.929005+00
```

The migration is therefore historical in production, not awaiting execution.

The resulting production schema was also read directly:

```text
member_voice_preferences rows = 5

conversational_space  text     NOT NULL  DEFAULT 'natural'
floor_control_mode    text     NOT NULL  DEFAULT 'automatic'
learn_turn_rhythm     boolean  NOT NULL  DEFAULT true
```

Both reviewed CHECK constraints are present with the expected value sets.

**Disposition of F1 for this migration:** the possible lock/validation exposure was
a historical execution risk. With only five current rows, no evidence supports
describing the present table as large. No claim is made about its row count at the
September 17 application instant because that historical fact was not measured.

**Disposition of F2 for this migration:** the missing-column write window is no
longer live for this migration because the columns are present in production.

**Disposition of F3:** absence of a companion rollback file remains a low-severity
historical repository fact; no rollback is required merely to close this review.

## Question 2 — is the deployment-ordering class still real?

Yes.

The exact source of the currently running production commit `1faec4016` orders
both normal production paths as:

```text
deploy:
  deploy_ctx_compose up -d
  deploy_ctx_verify_running
  run_migrations_or_abort

update:
  deploy_ctx_compose up -d
  deploy_ctx_verify_running
  run_migrations_or_abort
```

So the generic production path remains **swap → verify reader → migrate**.

A read-only comparison of the current production container's 494 migration files
against the production ledger found **zero pending migration files**. The ordering
risk is therefore **current in architecture but dormant in production today**.

This distinction is controlling:

> The reviewed migration is historical. The ordering defect class is current.
> There is no presently pending migration exercising that defect.

## Prior repository standing

`DEPLOYMENT-SAFETY-02_ORDERING_CUSTODY_CENSUS_2026-09-14.md` already reached
the same general boundary before REVIEW-CUSTODY existed:

- moving migrate before swap buys failure-before-reader properties;
- doing so globally is not lawful merely because one pending set is additive;
- the missing fact is **old-reader compatibility with the pending schema**;
- a machine-readable compatibility fact per migration was identified as the
  smallest general mechanism that could make migrate-before-swap fail closed;
- static inference from SQL shape was rejected as too fallible.

The later S3 O1 runbook proved `build → migrate → swap` for one explicitly
reviewed compatible set. That is evidence the ordering is mechanically achievable,
not authority to generalize the special runbook to every migration.

The Step 3C independent reviewer therefore **rediscovered an already-open
deployment-custody problem from a different evidence path**. That convergence
strengthens the finding; it does not create new remediation authority.

## Step 3R disposition

```text
reviewed migration            APPLIED 2026-09-17 · historical
target columns/constraints    PRESENT in production
current row count             5
current production pending    0 migration files
generic deploy order          swap → verify → migrate
ordering risk class           CURRENT · DORMANT TODAY
Step 3C verdict               REVISE remains truthful
Step 3 success condition      NOT MET
production mutation           NONE
```

The `REVISE` record is preserved. It is not retroactively changed to
`APPROVED` merely because the migration has already executed.

The authorized drift witness remains unavailable: the admitted record is
`REVISE`, and there is no approved state to make stale.

## What is now closed

**Step 3R — material finding disposition is CLOSED.**

What remains open is not uncertainty about this reviewed migration. It is the
generic deployment-ordering problem and the still-unmet Step 3 approval→drift
success condition.

No alternate already-applied migration should be selected merely to manufacture
an approval witness. The next genuine Step 3C completion opportunity is a
naturally pending migration reviewed before production execution, unless a
separate Founder act first opens deployment-ordering remediation.
