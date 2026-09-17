# F5-CONFORMANCE-REPAIR-01 - P5-E FINAL EXECUTOR WITNESS

**Date:** 2026-09-17
**Subject:** `396d2c2cc7cee6fe100a3168ad30c363dd338029`
**Environment:** fresh local PostgreSQL 17.7, loopback only

## 1 - Preconditions

Canonical bootstrap and the full migration chain passed. A synthetic target member occupied only the previously adjudicated account/session and Circle participation seams. A separate synthetic control member owned the Circle and inquiry.

A pre-erasure data-only backup was captured before executor invocation:

```text
SHA-256 d9e616a75e06b82ee3770d3a305e20644c0b662fd2d4dc486623ac918a55a98b
```

The R3 read-only preflight on this exact database returned:

```text
outcome                candidate_destructive_plan
activationReady        true
blockers               0
runtimeSchemaProblems  0
registryVersion        account-erasure-runtime-authority-v1-r3
dispositionCount       614
```

Pre-execution mutation check: `account_erasure_acts=0`, member tombstones `=0`.

## 2 - Executor result

`executeAccountErasure()` was invoked once for the synthetic target. PostgreSQL aborted the governed transaction with SQLSTATE `22P02`:

```text
invalid input syntax for type uuid: "p5d-poststate-census"
```

PostgreSQL identified the exact statement:

```sql
INSERT INTO account_erasure_execution_events (
  act_id, disposition_id, event_type, result_code, evidence_ref
)
SELECT $1::uuid, x.id::uuid, 'disposition_succeeded',
       CASE WHEN x.domain_key = 'member_fk_effect' THEN 'fk_effect_satisfied'
            WHEN x.planned_disposition = 'no_op' THEN 'observed_absent'
            WHEN x.planned_disposition = 'retain' THEN 'retained'
            ELSE 'executed' END,
       CASE WHEN x.requires_s5 THEN $1 ELSE 'p5d-poststate-census' END
...
```

The same UUID/text parameter-reuse pattern also exists in the subsequent `verification_succeeded` insert. The current witness did not reach that statement because the first insert failed.

## 3 - Failure class

The parameter `$1` is contextually bound as UUID by `$1::uuid` for `act_id`, then reused bare inside a `CASE` whose result is intended for text column `evidence_ref`. PostgreSQL therefore attempts to coerce the alternate text branch `p5d-poststate-census` to UUID.

This is an execution-evidence parameter typing defect. It does not alter the R3 runtime-authority verdict, the frozen plan, the Circle ordering law, or S5 semantics.

## 4 - Rollback / durable failure evidence

After the transaction aborted:

```text
target member             1
auth_sessions              1
member_settings            1
member_sessions            1
Circle membership          active
shared artifact revoked    false
response withdrawn         false

account_erasure_acts       1
account_erasure_dispositions 0
deletion manifests         0
provenance tombstones      0
terminal event             act_failed / execution_transaction_rolled_back
```

The durable act was minted before the destructive transaction, so the failed attempt remains traceable. The plan, S5 evidence and all destructive mutations rolled back.

## 5 - Evidence hashes

```text
pre-erasure backup
  d9e616a75e06b82ee3770d3a305e20644c0b662fd2d4dc486623ac918a55a98b

read-only preflight log
  036725d93f2fcc26428978bde9a326201962d78bf69240b6ff7b8c2f4c15c915

executor log
  2aabfc9cf8070a328f36a14e3d5996e8622df780e0e154f4c54959d5358dad52

PostgreSQL log
  011308b96baf33955511ba6fa9691d65f5477550a0a583f1b90d924d131448
```

## 6 - Restore standing

The pre-erasure backup was not replayed. There is no lawful completed erasure to restore against, and P5-E authorization requires stop-on-failure.
