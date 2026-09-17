# F5-CONFORMANCE-REPAIR-01 · P5-E — DISPOSABLE MIGRATION WITNESS

**Date:** 2026-09-17
**Subject:** P5-D candidate `f9a6855828b6f3fb66c2cb16eb16153dc3ae7f7b`
**Environment:** disposable local PostgreSQL 17.7, loopback only, destroyed after witness
**Production baseline source version:** PostgreSQL 16.13

## 1 · Bootstrap

The repository's canonical bootstrap path was used without modification:

```text
scripts/bootstrap-database.sh
baseline: database/baseline/0001_baseline_2026-09-01.sql
manifest: database/baseline/0001_baseline_2026-09-01.manifest
```

Observed:

```text
canonical baseline tables          634
migration ledger rows seeded       504
ledger rows with on-disk checksum  453
ledger-only historical rows         51
bootstrap verdict                  PASS
```

The baseline identifies its source as production PostgreSQL 16.13. The disposable server was
PostgreSQL 17.7. This is forward-version disposable evidence, not an exact production-version witness.

## 2 · Repository migration runner

The repository's own `scripts/apply-migrations.sh` was then run against the disposable database.
All post-baseline migrations reached the P5 pair without an earlier stop.

`20260917000001_account_erasure_ledger.sql` applied successfully.

`20260917000002_account_erasure_p5d_s5_fences.sql` failed at its durable-member fence loop:

```text
ERROR:  "active_patterns" is a view
DETAIL: Views cannot have row-level BEFORE or AFTER triggers.
CONTEXT: SQL statement "CREATE TRIGGER account_erasure_member_fence
         BEFORE INSERT OR UPDATE ON active_patterns
         FOR EACH ROW EXECUTE FUNCTION
         account_erasure_refuse_erased_member_reference('member_id')"
```

Disposable migration log SHA-256:

```text
55046d1388b7d0f30cfe12cd20d68ec6b94c04fd13946a72f958fb409803da06
```

## 3 · Failure class

The failing migration discovers fence targets from `information_schema.columns`. That relation includes
views. The P5-D activation registry, by contrast, is a durable-locus registry and does not classify
`active_patterns`; its v3 lookup returns no direct-locus entry for that name.

The exact disposable trigger population after the migration's explicit exclusions was:

```text
relkind r · ordinary tables   314
relkind v · views              15
```

The 15 non-table objects returned by the authoritative catalog query were:

```text
active_patterns
ain_memory_by_user
developmental_memories_with_decay
ea_practice_stats
episode_links
executor_recent_activity
member_authorship_delta
member_authorship_metrics
pattern_offering_stats
relationship_essence
usage_ledger
v_member_trajectory
v_state_vector_daily
v_state_vector_history
v_threshold_timeline
```

This is not a one-object anomaly. It is a class error: the migration's discovery predicate is wider
than the durable storage authority it is supposed to enforce.

## 4 · Rollback / no partial activation

The migration runner stopped with exit code `3`. Because `20260917000002` wraps its work in a
transaction, PostgreSQL rolled the failed migration back.

Post-failure disposable evidence:

```text
schema_migrations rows                  545
post-baseline applied rows               41
20260917000001 ledger row             PRESENT
20260917000002 ledger row              ABSENT
account_erasure_acts                   PRESENT
account_erasure_member_is_tombstoned   ABSENT
account_erasure_circle_state_fence     ABSENT
P5-D fence triggers remaining                0
```

Therefore the failed application did not leave a partially armed P5-D S5 fence surface.

## 5 · Cleanup

The disposable PostgreSQL server was stopped and its data directory removed. Port `55471` was closed.
No staging or production connection was made, no real member data was read, and no real account was
mutated.

## 6 · Independent reproduction in this continuation

The migration stop was independently replayed after the staged record was discovered; the staged
claim was not accepted as confirmation of itself.

A fresh PostgreSQL 17.7 cluster was created on loopback port `55473` with `LC_ALL=C`, the canonical
baseline and manifest were applied through `scripts/bootstrap-database.sh`, and the repository
migration runner was executed unchanged.

Independent observations matched the staged witness:

```text
baseline tables                         634
seeded migration-ledger rows            504
20260917000001                           APPLIED
20260917000002                           FAILED on active_patterns view
post-failure P5-D fence triggers           0
exact migration target relkind r         314
exact migration target relkind v          15
```

The exact 15 views were independently enumerated and match §3 above. The first broader catalog query
briefly counted 315 ordinary tables because it omitted the migration's explicit
`deletion_manifest_scopes` exclusion; reconstruction of the migration predicate corrected the count
to 314. This correction is recorded so the denominator is reproducible rather than fitted.

Independent migration-log SHA-256:

```text
90fcebf6ed0ebaa13918428707eca9ec01b74f441be102305b400ff6645c767c
```

The second disposable cluster was stopped and removed after the observation; port `55473` was closed.
