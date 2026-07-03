# Migration Ledger Reconciliation — 2026-07-03

Remediation runbook for the failed migration chain during the deploy of `d758ad480`.
The code fix (trigger idempotency) ships via PR. **The production steps below mutate
the prod database and must be run by the release driver, one driver, after the PR
merges to `clean-main-no-secrets` and minisforum has pulled it.**

## Root cause

`scripts/apply-migrations.sh` runs the whole chain in one `psql` invocation under
`\set ON_ERROR_STOP on`. It records a file in `schema_migrations` **only when it
applies the file itself**. Migrations applied out-of-band (directly against prod,
never through the script) are therefore absent from the ledger and get re-applied
on every deploy.

`20260629000001_encounters.sql` was applied out-of-band. Its tables/indexes use
`IF NOT EXISTS` and its function uses `CREATE OR REPLACE` (all no-ops on re-run),
but its four `CREATE TRIGGER` statements were **not** idempotent. On re-run the
chain aborted at the first one:

```
trigger "trg_encounters_updated_at" for relation "encounters" already exists
```

Because of `ON_ERROR_STOP`, **every migration ordered after that file did not
apply** — prod schema fell behind the deployed code for those features.

## Findings (verified read-only against prod on 2026-07-03)

Diff of `database/migrations/*.sql` vs `schema_migrations` → **20 unapplied**
(everything numerically ≥ `20260629000001`). Probing prod for each migration's
objects shows **almost the entire tail was already applied out-of-band** — the
objects exist, only the ledger rows are missing.

Non-idempotent DDL is confined to **triggers and constraints** (all `CREATE
TABLE`/`CREATE INDEX` are `IF NOT EXISTS`). Classification of the 20:

| Migration | Non-idempotent DDL | Prod state | Action |
|---|---|---|---|
| `20260629000001_encounters` | 4 triggers | applied out-of-band | **fixed in PR** (idempotent) → re-applies harmlessly, self-records |
| `20260630000005_memory_atoms_scope` | 3 constraints | fully applied (constraints + trailing idx exist) | **RECORD** |
| `20260630000006_practitioner_files_team_scope` | 3 constraints | fully applied | **RECORD** |
| `20260630000008_member_relationships` | 1 trigger | fully applied | **RECORD** |
| `20260630000009_relationship_content` | 1 trigger | fully applied (incl. trailing `relationship_space_artifacts`) | **RECORD** |
| `20260701000001_practice_fields` | 1 trigger | fully applied | **RECORD** |
| `20260702000002_member_memory_atoms_response` | 2 constraints | fully applied | **RECORD** |
| `20260702000004_soul_portrait_path_b_foundation` | 1 trigger | **absent** (`soul_portraits` does not exist) | re-run **APPLIES** fresh |
| the other 12 tail migrations | none (idempotent) | mixed / out-of-band | re-run **no-ops + self-records** |

Data migrations in the tail are safe to re-run: the `UPDATE` backfills are
idempotent-in-effect, and `20260630000002_provision_practitioner_colabs` is
self-guarded (`WHERE NOT EXISTS ... role='owner'`; its own header says "safe to
re-run").

## Why the task's literal 3→4 ordering must be reversed

If we make only `encounters` idempotent and re-run **before** recording, the chain
re-aborts at the next out-of-band migration (`20260630000005` — `ADD CONSTRAINT`
on an already-existing constraint). **The 6 out-of-band, fully-applied migrations
must be recorded first**, then the re-run applies only the genuinely-missing set
(`soul_portrait` + the idempotent no-ops) and reaches 0 failures.

`encounters` is deliberately **not** pre-recorded: the PR changes its file (new
checksum), so the idempotency-fixed version re-applies harmlessly on the re-run
and self-records with the correct checksum. Recording it now with the old prod
checksum would trip the script's "changed after applied" guard post-merge.

## Production steps (run on minisforum, one driver, after PR merge + pull)

Prereq: PR merged to `clean-main-no-secrets`; on minisforum
`git checkout clean-main-no-secrets && git pull`.

### 1. Record the 6 out-of-band, fully-applied migrations

Compute each file's SHA256 on the host (same as `apply-migrations.sh`) and insert
a ledger row. `ON CONFLICT DO NOTHING` makes this itself idempotent.

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && for f in \
  20260630000005_memory_atoms_scope.sql \
  20260630000006_practitioner_files_team_scope.sql \
  20260630000008_member_relationships.sql \
  20260630000009_relationship_content.sql \
  20260701000001_practice_fields.sql \
  20260702000002_member_memory_atoms_response.sql; do \
    sum=$(sha256sum "database/migrations/$f" | awk "{print \$1}"); \
    docker exec maia-postgres psql -U soullab maia_consciousness -c \
      "INSERT INTO schema_migrations(filename, checksum) VALUES ('"'"'$f'"'"', '"'"'$sum'"'"') ON CONFLICT (filename) DO NOTHING;"; \
  done'
```

### 2. Re-run the migration chain

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && ./scripts/deploy-production.sh migrate'
```

Expect: the 6 recorded files log "Skipping (already applied)"; `encounters`
re-applies (DROP/CREATE trigger) and records; `soul_portrait_path_b_foundation`
applies fresh; the remaining idempotent tail no-ops and self-records; the
`episode_links` invariant passes. **0 failures.**

### 3. Verify

```bash
# Ledger now contains all 20 tail files (0 rows returned = fully reconciled)
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && comm -23 \
  <(ls database/migrations/*.sql | xargs -n1 basename | sort) \
  <(docker exec maia-postgres psql -U soullab maia_consciousness -t -A \
      -c "SELECT filename FROM schema_migrations ORDER BY filename;" | grep -v "^$" | sort)'

# soul_portraits now exists (the one genuinely-applied feature)
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness \
  -c "SELECT to_regclass('"'"'public.soul_portraits'"'"') IS NOT NULL AS soul_portraits_exists;"'
```

## Note on the 44 "in-ledger, file-missing" rows

The ledger has 432 rows vs 407 files; 44 ledger entries reference files that no
longer exist (old renamed/removed migrations, e.g. `20260215000002_therapeutic_lens.sql`).
This is a pre-existing, separate condition — harmless to the apply chain (the
script only iterates files on disk) and **out of scope** for this remediation.
