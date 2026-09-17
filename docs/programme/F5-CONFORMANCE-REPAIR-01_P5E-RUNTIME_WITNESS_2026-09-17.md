# F5-CONFORMANCE-REPAIR-01 · P5-E RUNTIME REHEARSAL — DISPOSABLE WITNESS

**Date:** 2026-09-17
**Candidate:** `87f4ef0514360fb66cd16cb5e3d197ae6fc781c2`
**Environment:** disposable local PostgreSQL 17.7 · loopback only · destroyed after witness

## 1 · Bootstrap / migration

A fresh canonical bootstrap and repository migration run completed successfully, including both account-erasure migrations. This confirms the R1 migration stop remains discharged.

## 2 · Synthetic pre-erasure seed

The rehearsal used one synthetic target member and one synthetic control member. The intended target state was limited to adjudicated seams only: auth session, member settings/session, active Circle membership, one shared artifact, and one inquiry response.

Seeding stopped at the first Circle membership insert. PostgreSQL raised:

```text
ERROR:  record "new" has no field "shared_by"
CONTEXT: PL/pgSQL assignment in account_erasure_circle_state_fence()
```

The installed trigger function is shared by `shared_artifacts`, `circle_inquiry_responses`, and `circle_memberships`, but directly references fields that do not exist on every `NEW` row type:

```text
CASE TG_TABLE_NAME
  WHEN 'shared_artifacts' THEN NEW.shared_by::text
  ELSE NEW.member_id::text
END
```

This is a record-shape defect in the S5 Circle fence, not a synthetic-data authorization failure.

## 3 · State after failure

The failed insert occurred before any governed erasure act was invoked.

```text
target member row          1
auth session               1
member settings            1
member session             1
Circle membership          0
account-erasure acts       0
member tombstones          0
```

No executor invocation occurred. No account deletion occurred. No restore rehearsal occurred.

Evidence SHA-256:

```text
bootstrap  73a31a261784c9d3ceaddb469450156abbf94ebe6072dfb410289ec1f02c559a
migrate    5b431bbbd1f8f32bc5df20ccc152664e392a806f8fec0d21fbf60629f0532786
seed       f3238da955d83e42058a6983440711ae65ae1a5e1481d07df83c52c31a71fa56
```

## 4 · Cleanup

The disposable PostgreSQL server was stopped and its data directory removed. Port `55477` was closed. Production and staging were never contacted.
