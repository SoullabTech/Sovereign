# F5-CONFORMANCE-REPAIR-01 · P5-D-R2 — DISPOSABLE RUNTIME WITNESS

**Date:** 2026-09-17
**Subject:** repaired P5-D candidate after `32e5eb11b3bfce900fd5c2c95aff1ccbb4060462`
**Environment:** fresh local PostgreSQL 17.7, loopback only, destroyed after witness

## 1 · Migration application

The canonical production-derived baseline bootstrapped successfully and the unmodified repository migration runner applied through both P5 migrations. The post-migration `episode_links` view invariant passed.

## 2 · Ordinary pre-erasure Circle writes

A synthetic member, Circle, membership, shared artifact, inquiry and inquiry response were inserted with no member-erasure tombstone present. All three R2 row shapes accepted ordinary writes:

```text
circle_memberships         1
shared_artifacts            1
circle_inquiry_responses    1
```

This directly falsifies the returned P5-E defect: no trigger attempted to dereference a field absent from the relation it serves.

## 3 · Erased-member refusals

A content-free `member_deletion` manifest + `members` tombstone was then written for the synthetic member. Outside the governed restore lane:

```text
active shared artifact      REFUSED · PASS
live inquiry response       REFUSED · PASS
active membership           REFUSED · PASS
```

The three refusals came from three distinct relation-shaped functions:

- `account_erasure_shared_artifact_state_fence()`
- `account_erasure_circle_response_state_fence()`
- `account_erasure_circle_membership_state_fence()`

## 4 · Governed-restore projections

Inside `SET LOCAL s5.restore_lane='governed'`, updates to the same three synthetic rows produced the constitutional historical states:

```text
shared_artifacts            revoked_at != NULL                 PASS
circle_inquiry_responses    withdrawn_at != NULL               PASS
                            response_text = NULL
                            response_type = NULL
circle_memberships          status = left                      PASS
```

No Circle row was physically deleted by this witness.

## 5 · Witness hashes

```text
bootstrap log SHA-256
73a31a261784c9d3ceaddb469450156abbf94ebe6072dfb410289ec1f02c559a

migration log SHA-256
26cbd5871a8799b0be6dff5395e43965663e33361bf3a699fe79902a06d95280

R2 runtime witness log SHA-256
ee7b17098489b3540ec0e9db3561f4ababcfb24267896c3c4778b9f265a6d02d
```

## 6 · Cleanup

The PostgreSQL cluster was stopped and removed. Port `55478` was closed. No staging or production connection was made and no real member data was read or mutated.
