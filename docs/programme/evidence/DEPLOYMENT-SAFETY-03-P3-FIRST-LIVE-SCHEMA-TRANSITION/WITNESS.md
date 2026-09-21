# DEPLOYMENT-SAFETY-03 · P3 — FIRST LIVE COMPATIBILITY-GOVERNED SCHEMA TRANSITION

**Date:** 2026-09-21
**Status:** PRODUCTION TRANSITION WITNESSED · PENDING SET SPENT
**Target reader:** `bcd4debfed1285d2ff14829db7f117ffaff05f11`
**Old reader:** `8dd6b93bb4faa6a32bb5c54af85dcebe0a0eda14`

## Exact migration relation

```text
old reader
8dd6b93bb4faa6a32bb5c54af85dcebe0a0eda14

target reader
bcd4debfed1285d2ff14829db7f117ffaff05f11

pending migration
database/migrations/20260921000002_epistemic_join_integration_shadow.sql

migration SHA-256
e93179f834ae9746484403813d534d319c1089c1070fc2404477ac4618c1756b
```

## Production-side admitted review

A production-side review bundle existed before deployment at:

`/tmp/tcf2-bcd-deploy-review/`

Its admitted custody record states:

```text
repo_head     bcd4debfed1285d2ff14829db7f117ffaff05f11
admitted_at   2026-09-21T22:59:27.323Z
verdict       APPROVED
reviewer      independent-production-db-migration-reviewer
review SHA    2ffc5b10488e3d2cb34a2265b0fd8c7e03cc6e661807480b98ed9a3349970f59
high          0
medium        0
low           1
coverage      9
limitations   6
```

The review itself binds:

```text
trace id      3728a636-63a7-445e-922b-370e8261b566
compatibility COMPATIBLE
prefix law    ALL_PREFIXES_COMPATIBLE
old reader    8dd6b93bb4faa6a32bb5c54af85dcebe0a0eda14
target reader bcd4debfed1285d2ff14829db7f117ffaff05f11
pending SHA   e93179f834ae9746484403813d534d319c1089c1070fc2404477ac4618c1756b
```

A post-transition replay of that exact production-side record/review/trace through
`review-custody-migration-gate.ts` returned:

`MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`

with 9 witnessed files, one exact pending migration, and one compatible committed prefix.

## Governed deployment path

The durable deployment lock record states:

```text
started       2026-09-21T23:10:01Z
entry         deploy-production.sh deploy
target        bcd4debfed1285d2ff14829db7f117ffaff05f11
target_sha    bcd4debfe
checkout_head 47aa54dac (informational checkout head)
```

That checkout contains the canonical DS-03 deployment law and has
`8dd6b93b...` as an ancestor.

Its normal deploy path requires all three variables when pending migrations exist:

```text
REVIEW_CUSTODY_RECORD
REVIEW_CUSTODY_REVIEW
REVIEW_CUSTODY_TRACE
```

and refuses with `DATABASE MIGRATION REVIEW REQUIRED` when the triplet is incomplete.

### Evidentiary limitation

The deploy process had exited by the time this witness was assembled, so its
`/proc/<pid>/environ` was no longer recoverable. Therefore this record does not
claim direct post-hoc observation of the exact environment-variable file paths
consumed by that process.

The governed-path conclusion instead rests on the conjunction of:

1. durable lock record proving the normal `deploy-production.sh deploy` path;
2. DS-03-enabled deploy code that refuses any non-empty pending set without a
   complete custody evidence triplet;
3. the production-side admitted exact-target review existing before deploy start;
4. exact relation identity across old reader, target, pending path and pending hash;
5. exact production-side gate replay passing after the transition.

No weaker inference is needed.

## Direct migrate-before-swap timing proof

The production ledger records:

```text
migration applied_at
2026-09-21 23:12:25.449498+00
```

The new target container records:

```text
container created
2026-09-21T23:12:32.96249354Z

container started
2026-09-21T23:12:43.910373415Z
```

Therefore the schema migration committed approximately 7.5 seconds before the
new target container was created and approximately 18.5 seconds before it started.

This is a direct production witness of:

`MIGRATE → SWAP`

not merely an inference from source ordering.

## Schema state after transition

The migration ledger contains:

`20260921000002_epistemic_join_integration_shadow.sql`

at the timestamp above.

The production schema contains:

`public.maia_epistemic_join_integration_shadow_runs`

with:

- primary key;
- unique key on `(turn_id, model_name, architecture_version)`;
- foreign key to the relational-field shadow parent;
- the closed CHECK-constraint set;
- `idx_epistemic_join_integration_shadow_created`.

Post-transition pending set for target `bcd4debf...`:

`0`

## Reader and rollback custody

Current production reader:

`bcd4debfe`

Production image custody:

```text
current
sha256:b99a4a8ba0da65b782b1ff68372cb47bcb82117879516615343ee16045db7de8

prod
sha256:b99a4a8ba0da65b782b1ff68372cb47bcb82117879516615343ee16045db7de8

bcd4debfe
sha256:b99a4a8ba0da65b782b1ff68372cb47bcb82117879516615343ee16045db7de8

previous
sha256:dfd6f221821eef6e8d533f3caf4dc318a998543c1dc972c19817475bd81c6db4

8dd6b93bb
sha256:dfd6f221821eef6e8d533f3caf4dc318a998543c1dc972c19817475bd81c6db4
```

So `:previous` is the exact old-reader image.

The durable lock record remains as audit evidence, while the Linux kernel
`flock` is free after completion.

## Production health

Public production probes after the transition:

```text
/api/health   200 · health=ok · version=bcd4debfe
/api/ready    200 · ready=true · dbSchema=ready
/api/version  200 · commit=bcd4debf
```

Production is healthy and ready.

## Independent corroborating review

A separate Mac-side review of the same relation was also completed and admitted
later, with review SHA:

`6df162e8c6cc79e67a380f409d8fcf9f992727fdc620a4263a5d5003ecb977d8`

That review is corroborating evidence only; this P3 witness does not claim it was
the triplet consumed by the already-completed production deploy.

## Post-P3 canonical freshness

After the transition, `clean-main-no-secrets` advanced from `bcd4debf...` to:

`4c097b4c81402c62e42613e83ae28180fef46f08`

That later advance contains Serving Identity F1 evidence-law work and one
`package.json` change. It contains:

- no migration delta;
- no `deploy-production.sh` change;
- no Review Custody change;
- no migration-compatibility change.

It does not alter the historical P3 result.

## P3 standing

```text
first real pending migration       EXECUTED
review custody                     APPROVED
physical coverage                  WITNESSED
old-reader compatibility           COMPATIBLE
failure-prefix compatibility       ALL PREFIXES COMPATIBLE
migration before swap              DIRECTLY WITNESSED BY TIMESTAMPS
target reader                      bcd4debfe · healthy
pending after transition           0
rollback previous image            exact old reader
production health/readiness        PASS
kernel deploy lock                 FREE
```

**P3 is CLOSED · FIRST LIVE COMPATIBILITY-GOVERNED SCHEMA TRANSITION WITNESSED.**
