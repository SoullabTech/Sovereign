# F5-CONFORMANCE-REPAIR-01 - P5-D-R3 RUNTIME SCHEMA AUTHORITY - DISPOSABLE WITNESS

**Date:** 2026-09-17
**Returned gate:** `09e4f884bab49b74edad7004fa0e6ece0a0ff3ee`
**Environment:** fresh local PostgreSQL 17.7, loopback only

## 1 - Canonical runtime census

The canonical production-derived baseline bootstrapped successfully and the unmodified repository migration runner applied through both P5 migrations. A bidirectional census then compared v3 source provenance with the fully migrated PostgreSQL execution graph.

```text
direct loci - source v3            319
direct loci - runtime              318
runtime-only direct loci             0
source-only direct loci               1  dream_entries
direct identity shape drift           0

FK declarations - source v3         289
FK effect groups - source v3        264
FK constraints - runtime            316
FK effect groups - runtime          294
runtime-only FK groups               36
source-only FK groups                  6
constraint-count drift groups          2
```

The two count-drift groups are `pattern_ledger|CASCADE` and `practitioner_clients|SET NULL`. Source-only and runtime-only groups remain recorded rather than reconciled by assumption.

Census log SHA-256:

```text
77b0ea97d892012e7ef4537ac67969cb4a913007cd0bc786eb26bb43edc99e03
```

## 2 - Frozen runtime authority

R3 generated `config/governance/account-erasure-runtime-authority.v1.json` from that migrated schema. It does not replace v3. V3 remains the source/migration provenance plane; the R3 object is execution authority.

```text
runtime authority version    account-erasure-runtime-authority-v1-r3
current direct loci          318
stale source loci              1
runtime constraints          316
runtime effect groups        294
runtime-only groups           36  all explicit refuse
source-only groups              6
count-drift groups              2
```

Authority fingerprints:

```text
source registry SHA-256
2513ac5d41122133d88bef3d02139b905be6855a4776c083d687450985af1972

baseline + migration corpus SHA-256
22c2e2a1eb474be6ca671132ec0e90869da627b01d341531142580a42d0b5372

runtime schema fingerprint SHA-256
41303bf59001b3fded22f37dd2fbd68e05af13057365d3b23a67795068724302
```

Any drift in v3 or the baseline/migration corpus invalidates the static R3 authority gate. At runtime the collector independently compares every direct locus and exact FK constraint against the frozen graph before erasure planning.

## 3 - FK identifier representation repaired

The runtime catalog query now casts `att.attname` to text before aggregation:

```text
array_agg(att.attname::text ORDER BY ord.ordinality)::text[]
```

Therefore a local FK column arrives as `['member_id']`, never the string `'{member_id}'`. The identifier guard remains intact.

## 4 - Mandatory read-only preflight

A synthetic target member occupied only previously adjudicated account/session and Circle participation seams. A separate synthetic control member owned the Circle and inquiry, so the target did not occupy unadjudicated creator custody.

The R3 read-only preflight returned:

```text
outcome                candidate_destructive_plan
activationReady        true
blockers               0
runtimeSchemaProblems  0
registryVersion        account-erasure-runtime-authority-v1-r3
frozen dispositions    614
active Circle ids       1
```

Occupied direct loci were exactly:

```text
auth_sessions
circle_inquiry_responses
circle_memberships
member_sessions
member_settings
```

Occupied runtime FK effects were exactly the three already-earned account/session CASCADE effects:

```text
auth_sessions|CASCADE
member_sessions|CASCADE
member_settings|CASCADE
```

No runtime-only `refuse` effect was occupied.

The preflight was non-mutating:

```text
account_erasure_acts  0
member tombstones     0
target member         1
```

Witness hashes:

```text
seed log SHA-256
8003bcf835d50ab860bb512a1d3122db6673e41149c23eba839454ed257ee3ae

preflight log SHA-256
27273d21ad69fbb6212927e14a468c737076bce0b484a9168cbf8ca80a4f5c77
```

## 5 - Claim boundary

This witness proves the R3 runtime-authority reconciliation and read-only activation gate. It does not prove executor completion or governed restore behavior; those remain P5-E runtime acts after R3 closes. No production/staging data was read or mutated.
