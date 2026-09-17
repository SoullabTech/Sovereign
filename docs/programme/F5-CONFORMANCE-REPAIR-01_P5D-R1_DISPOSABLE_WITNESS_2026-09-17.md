# F5-CONFORMANCE-REPAIR-01 · P5-D-R1 — DISPOSABLE WITNESS

**Date:** 2026-09-17
**Returned gate:** P5-E migration STOP at `d349f48ce`
**Repair:** S5 fence-target authority
**Environment:** disposable local PostgreSQL 17.7, loopback only, destroyed after witness

## 1 · Repair shape

The generic member-reference fence no longer discovers targets from `information_schema.columns` alone. It now resolves relation authority through `pg_catalog.pg_class` / `pg_namespace` / `pg_attribute`.

The relation taxonomy is explicit:

```text
r  ordinary table       generic fence target
p  partitioned table    generic fence target
v  ordinary view        projection; never row-trigger target
m  materialized view    projection; never generic row-trigger target
i/I index kinds         catalog structures; non-target
S  sequence             catalog/storage structure; non-target
c  composite type       type relation; non-target
t  TOAST                 storage internal; non-target
other identity-bearing relation kind → migration RAISE / STOP
```

The existing exclusions remain unchanged: `account_erasure_acts`, `deletion_manifest_scopes`, `circle_memberships`, and `circle_inquiry_responses`. Circle state continues through the dedicated `account_erasure_circle_state_fence` mechanism.

## 2 · Adversarial discriminator witness

Against a disposable database with the repaired migration already applied:

```text
synthetic partitioned table (relkind=p)
  account_erasure_member_fence installed                 PASS

synthetic materialized view (relkind=m)
  account_erasure_member_fence absent                    PASS

synthetic foreign table with member_id (relkind=f)
  migration exit                                         3
  error                                                   unsupported identity-bearing relation kind(s)
  named object                                            r1_foreign_identity(relkind=f)
                                                        PASS
```

This proves that R1 does not merely special-case the fifteen views observed by P5-E.

## 3 · Fresh canonical bootstrap + full migration runner

A second clean PostgreSQL 17.7 cluster was initialized after the final repair. The repository's canonical paths were used without alteration:

```text
scripts/bootstrap-database.sh
scripts/apply-migrations.sh
```

Observed bootstrap:

```text
baseline tables                       634
seeded migration-ledger rows          504
rows with on-disk checksum            453
ledger-only historical rows            51
bootstrap                              PASS
```

Observed migration result:

```text
20260917000001_account_erasure_ledger.sql        APPLIED
20260917000002_account_erasure_p5d_s5_fences.sql APPLIED
repository post-migration invariant              PASS
migration runner                                 PASS
```

Post-state:

```text
generic member fences                  314
generic fence relkinds                 r only
view/materialized-view generic fences  0
Circle special-state fences            3
  shared_artifacts
  circle_inquiry_responses
  circle_memberships
unsupported current relation kinds     0
```

The catalog's exact lawful generic-target count was also `314`, equal to the installed generic-trigger count.

Disposable witness log SHA-256 values:

```text
bootstrap  73a31a261784c9d3ceaddb469450156abbf94ebe6072dfb410289ec1f02c559a
migrate    88791d20b51c668ad0d815744661d1d27aa4a9f24fdf6dd31ab3858be54b3ab7
```

## 4 · Discarded environment attempt

One pre-witness attempt accidentally selected Homebrew PostgreSQL 14.19 through `/opt/homebrew/bin`. The production-derived baseline uses column-list `ON DELETE SET NULL` syntax that PostgreSQL 14 cannot parse. The baseline blob was verified byte-identical to HEAD; no R1 conclusion was drawn from that run. The final witness explicitly pinned PostgreSQL 17.7 server and client binaries end-to-end.

## 5 · Cleanup / containment

Every disposable cluster used for the final witness was stopped and removed. No staging or production connection was made. No real member row was read or mutated. No executor or governed-restore rehearsal was run under R1 authority.
