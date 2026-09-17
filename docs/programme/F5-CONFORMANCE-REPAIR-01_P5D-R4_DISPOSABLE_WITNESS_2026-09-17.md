# F5-CONFORMANCE-REPAIR-01 - P5-D-R4 EVIDENCE REFERENCE PARAMETER TYPING - DISPOSABLE WITNESS

**Date:** 2026-09-17
**Returned gate:** `a2a4ab36bfd6bfc2d1b568918c53471c29d55da9`
**Environment:** fresh local PostgreSQL 17.7, loopback only

## 1 - Source repair

`recordCompletionEvidence()` no longer reuses one SQL parameter across UUID and text contexts.

The three evidence writes now use independent typed parameters:

```text
disposition_succeeded
  act_id       $1::uuid
  rows         $2::jsonb
  S5 evidence  $3::text

verification_succeeded
  act_id       $1::uuid
  rows         $2::jsonb
  S5 evidence  $3::text

act_completed
  act_id       $1::uuid
  evidence_ref $2::text
```

The ordinary evidence branch is explicitly text: `p5d-poststate-census`.

## 2 - Fresh runtime preconditions

A fresh canonical PostgreSQL 17.7 bootstrap and full migration run succeeded. The narrow synthetic target/control topology was seeded exactly as in the returned P5-E witness.

The R3 read-only preflight returned:

```text
outcome                candidate_destructive_plan
activationReady        true
blockers               0
runtimeSchemaProblems  0
dispositionCount       614
```

## 3 - Executor result

The governed executor completed:

```text
state           completed
httpStatus      200
accountChanged  true
actRef          1793410d-3ba9-4b2b-955e-81240c987a8d
```

Post-state identity/account rows:

```text
target member      0
auth_sessions       0
member_settings     0
member_sessions     0
control member      1
```

The durable act survived with runtime authority `account-erasure-runtime-authority-v1-r3` and request reference `P5D-R4-DISPOSABLE-20260917`.

## 4 - Immutable plan and completion evidence

```text
plan rows              614
S5-required plan rows   10
refused plan rows         0

plan_frozen               1
execution_started          1
disposition_succeeded    614
verification_succeeded   614
act_completed              1
```

Disposition outcomes:

```text
executed               7
fk_effect_satisfied  294
observed_absent       312
retained                1
```

Evidence-reference distribution:

```text
disposition_succeeded
  act UUID text                 10
  p5d-poststate-census         604

verification_succeeded
  act UUID text                 10
  p5d-poststate-census         604

act_completed
  act UUID text                  1
```

The S5/ordinary partition exactly matches the 10 `requires_s5=true` plan rows and 604 ordinary plan rows.

## 5 - S5 and Circle post-state

One deletion manifest survived. Tombstones were present for:

```text
auth_sessions                      1
member_settings                    1
member_sessions                    1
members                            1
shared_artifacts:revoked           1
circle_inquiry_responses:withdrawn 1
circle_memberships:left            1
```

Circle historical state was preserved as:

```text
membership       left
shared artifact  revoked
response         withdrawn
response_text    NULL
response_type    NULL
```

## 6 - Evidence hashes

```text
bootstrap log
73a31a261784c9d3ceaddb469450156abbf94ebe6072dfb410289ec1f02c559a

migration log
b5505cd5340fbac4c7f8a1e0056fe4c4e16ead60364333851dfcc8e7491c8ab1

seed log
8003bcf835d50ab860bb512a1d3122db6673e41149c23eba839454ed257ee3ae

preflight log
f9e3d0a32bd4b0035be5e74257f83b98950f2e134d6b9b73ca1bc41d05acad16

executor log
63584b27da599d0011188bd367b68ee8dc0751267fc4b7f06a6f8053d4f73074

post-state log
c3ddb5184bf9456235638c1dc9ee8be5676806f29a6a20be0817189012c2f705
```

## 7 - Claim boundary

R4 proves durable synthetic executor completion and the repaired evidence-reference typing. It does not prove governed restore anti-resurrection; restore rehearsal remains closed until a new P5-E continuation. No production/staging data was read or mutated.
