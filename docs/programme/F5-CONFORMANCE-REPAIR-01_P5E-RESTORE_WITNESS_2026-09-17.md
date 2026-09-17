# F5-CONFORMANCE-REPAIR-01 - P5-E GOVERNED RESTORE REHEARSAL - WITNESS

**Date:** 2026-09-17
**Subject:** `846910281623d7418a3839cf5c16a117a73191bc`
**Environment:** fresh local PostgreSQL 17.7, loopback only

## 1 - Preconditions earned

The canonical baseline bootstrapped successfully and the unmodified migration runner applied the complete repository migration set. The narrow synthetic target/control topology was seeded.

A targeted pre-erasure backup containing only the synthetic member/account/session and Circle tables was captured before erasure:

```text
size        9,739 bytes
SHA-256     2fa8bc9f7a01fbe9ce6e676296cc07ca260bab7f47cff3efbb6414322dc45459
```

`pg_dump` emitted only its standard circular-FK warning for `members`; it produced the dump successfully.

The R3 read-only preflight on the same database returned:

```text
outcome                candidate_destructive_plan
activationReady        true
blockers               0
runtimeSchemaProblems  0
dispositionCount       614
```

The R4 executor then completed successfully and established the erased state:

```text
state           completed
httpStatus      200
accountChanged  true
```

Immediately before restore:

```text
target member      absent
auth_sessions       absent
member_settings     absent
member_sessions     absent
member tombstone    present
membership          left
shared artifact     revoked
response            withdrawn + payload NULL
```

## 2 - Governed restore invocation

The repository's unmodified restore entrypoint was used:

```text
RESTORE_AUTHORIZED_BY=P5-E-RESTORE-DISPOSABLE-20260917
RESTORE_DB_URL=<disposable PostgreSQL 17.7 URL>
scripts/restore-governed.sh pre-erasure-targeted.sql
```

The script successfully preserved the live deletion-governance tables, then opened the governed restore lane and began replaying the older dump.

## 3 - Restore failure

The first restored `members` row fired `account_erasure_refuse_erased_member_row()`. The dump had already executed:

```sql
SELECT pg_catalog.set_config('search_path', '', false);
```

The trigger function calls `account_erasure_member_is_tombstoned()` without a schema qualification. PostgreSQL therefore failed to resolve it in the empty search path:

```text
ERROR: function account_erasure_member_is_tombstoned(text) does not exist
CONTEXT: PL/pgSQL function public.account_erasure_refuse_erased_member_row() line 3 at IF
```

A direct reproduction proved the dependency is broader than that one call site. Even this schema-qualified helper invocation fails with `search_path=''`:

```sql
SELECT public.account_erasure_member_is_tombstoned(...);
```

because the helper itself queries `provenance_tombstones` without schema qualification.

The restore-time P5-D function family contains the same mutable-search-path dependency class:

- `account_erasure_member_is_tombstoned()` -> unqualified `provenance_tombstones`;
- `account_erasure_refuse_erased_member_reference()` -> unqualified helper call;
- `account_erasure_refuse_erased_member_row()` -> unqualified helper call;
- `account_erasure_shared_artifact_state_fence()` -> unqualified `provenance_tombstones`;
- `account_erasure_circle_response_state_fence()` -> unqualified `provenance_tombstones`;
- `account_erasure_circle_membership_state_fence()` -> unqualified `provenance_tombstones`.

## 4 - No-resurrection state after failed restore

The restore stopped on the first target member insert. Post-failure state remained:

```text
target member        0
auth_sessions         0
member_settings       0
member_sessions       0
member tombstone      1
erasure act           1
membership            left
shared artifact       revoked
response              withdrawn + payload NULL
control member        1
```

So this failure did not resurrect the erased account or weaken Circle historical state. It did, however, prevent the governed restore from completing; anti-resurrection is therefore not yet fully witnessed through the complete restore path.

## 5 - Secondary operational observation

The restore script creates a mode-`0600` temporary preservation dump for governance tables. Because this run exited before the final cleanup line, that file remained on disk after failure:

```text
size        3,543 bytes
mode        0600
SHA-256     e1bc96576d67c05b193d9702e6c09d22ccc02b0761539c215f7a4ca7417349de
```

The file belongs only to the disposable synthetic rehearsal and is removed during cleanup. This is recorded as failure-cleanup debt; it is not the search-path blocker itself.

## 6 - Evidence hashes

```text
bootstrap log
73a31a261784c9d3ceaddb469450156abbf94ebe6072dfb410289ec1f02c559a

migration log
b4c091335f131a1ca5626cf195a4e71e2f5e1997c736933af02fef0d76f037ae

seed log
58cb0f6014ff79570e124553aa1662138b614e5bf9e329c0f3dc728b14a57a0a

pre-erasure targeted dump
2fa8bc9f7a01fbe9ce6e676296cc07ca260bab7f47cff3efbb6414322dc45459

read-only preflight log
f9e3d0a32bd4b0035be5e74257f83b98950f2e134d6b9b73ca1bc41d05acad16

executor log
9ef743318ab1e65a57c0aeb56dd515b4c8827a7c318f230782944ddab36864c6

pre-restore state
4be86411ad40b953df36c63b53b9e91756aa1c933ce02c882b08038c95b9bea5

restore log
7323e61a2cc330b2878b0d6d014b715dcb070a0df7efb21305f3628d93f23dd0

PostgreSQL log
a9929907139e643ed46f2992a7415cffe1eefa2a8ca5caca05ef59e7b3cfd628
```
