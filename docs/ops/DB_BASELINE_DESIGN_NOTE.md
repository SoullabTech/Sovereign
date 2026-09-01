# Canonical schema baseline — design note

Answers four questions. Diagnosis: `DB-EMPTY-BOOTSTRAP-01` (`75a8a67c2`).

## 1. What point does the baseline represent?

The current known-good schema of the production database `maia_consciousness`,
captured 2026-09-01, against trunk `8b31d931c`.

It is a **snapshot of reality, not recovered history.** It does not claim to be
the historical genesis of any table. Five tables (`developmental_memories`,
`integration_passes`, `studio_people`, `studio_meetings`,
`manuscript_draft_sections`) have no genesis DDL anywhere in the repository; the
baseline captures their present shape and says so, rather than inventing
migrations that would present reconstruction as recovery.

Artifact: `database/baseline/0001_baseline_2026-09-01.sql` — canonical and
independently inspectable. The runner may orchestrate applying it; the runner is
not where the schema lives.

## 2. How do we prove it contains schema only?

Three checks, all enforced by `scripts/verify-bootstrap.sh`:

- generated with `pg_dump --schema-only --no-owner --no-privileges`;
- no data statements — asserted by rejecting any `COPY`/`INSERT` at statement
  position (dollar-quoted function bodies legitimately contain `INSERT`, so the
  check is anchored, not a bare grep);
- after loading into an empty database, `sum(n_live_tup)` across all public
  tables is `0`, except the migration ledger the baseline deliberately seeds.

## 3. Which migrations run after it?

All of them — unchanged. The baseline seeds `schema_migrations` with every
migration filename and its current SHA-256, so `apply-migrations.sh` sees them as
already applied and skips them. Migrations authored after the baseline apply
normally with no special casing.

This is why no existing migration is edited, renumbered, or deleted. The 32
empty-replay failures and the ordering defects are left exactly as they are; the
baseline makes them unreachable rather than pretending they were fixed. They stay
recorded in the diagnosis.

The cut line is therefore a ledger fact, not a filename convention.

## 4. What CI command proves empty → usable?

```bash
npm run db:verify-bootstrap
```

Creates a throwaway database, applies the baseline, runs `npm run db:migrate`,
then asserts the app's own gate: every entry in `database/required_migrations.txt`
is present in `schema_migrations`, and the tables the gate depends on exist. Drops
the database. Non-zero exit on any failure.

No step may copy from `maia_consciousness`. That is the falsifier: a blank
PostgreSQL instance becomes a bootable MAIA database using only committed
artifacts.
