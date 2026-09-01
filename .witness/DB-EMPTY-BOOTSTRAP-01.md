# DB-EMPTY-BOOTSTRAP-01 — Repository cannot reconstruct schema from empty database

```text
STATUS      NEW · diagnosis owed
MANDATE     ARCHAEOLOGICAL — diagnosis before repair
AUTHORITY   Repair NOT authorized. Do NOT author
            CREATE TABLE developmental_memories yet.
DISCOVERED  2026-09-01, as a prerequisite blocker of the WS2 02c-2R Mac
            Studio canonical successor witness (attempt 1)
AT SHA      58ac95a779278bda427fb869aa188e618442d756
```

## Observed

`npm run db:migrate` (→ `scripts/apply-migrations.sh`) against a genuinely
empty PostgreSQL 17.7 database halts at migration 36 of 459, exit 3:

```
database/migrations/20251231_memory_architecture_enhancements.sql:123
ERROR:  relation "developmental_memories" does not exist
```

Line 123 is `ALTER TABLE developmental_memories ADD COLUMN IF NOT EXISTS
visibility ...`. The migration assumes the table exists; it neither creates
nor guards it.

## Established by search (not inferred)

- No `CREATE TABLE developmental_memories` exists anywhere in the repository:
  not in any of the 459 files in `database/migrations/`, not in
  `database/init/` (sole file: `001_extensions.sql`), not in
  `database/schemas/` (sole file: `clinical-database-schema.sql`).
- `apply-migrations.sh` iterates `database/migrations/` only. There is no
  bootstrap-schema step preceding it.
- The migration is NOT listed in `database/required_migrations.txt` (10 entries),
  so the ledger does not define it as an empty-database bootstrap primitive.
- The table DOES exist in the live `maia_consciousness` schema (confirmed via
  `to_regclass` against a schema-only clone).
- It is consumed by live application code: `app/api/memory/patterns/*`
  (list, feedback, evidence), `app/api/memory/stale-preferences`,
  `app/api/members/delete-account`, `app/api/members/migrate-data`,
  `app/api/members/export-data`, `app/api/community/user-stats`.

## What this does and does not establish

Establishes: the migration chain is reproducible **forward from production**,
never **from empty**. That property had not been exercised until a witness
demanded a genuinely fresh database.

Does NOT establish: the historically correct DDL for `developmental_memories`.
Deriving a `CREATE TABLE` from the seven consumers would be **reconstruction,
not recovery**. The live schema's current shape is a candidate witness to that
DDL but has not been adjudicated as the historical one.

## First mandate — archaeology

1. Determine where `developmental_memories` originally came from: git history
   of `database/`, deleted/renamed migrations, old bootstrap SQL, Prisma or
   other schema history, deploy scripts, archived dumps, Supabase-era setup
   paths.
2. Determine whether other tables also depend on vanished historical substrate
   — the failure at migration 36 means migrations 37-459 are entirely
   unexercised against empty. This is very likely not one missing table.
3. Determine whether the correct repair is a baseline schema, a squashed
   bootstrap, a recovered historical migration, or something else.

## Evidence retained

- Scratch DB `maia_ws2_02c_2r_witness_58ac95a77` — left un-dropped, holding the
  36-migration partial state at the point of failure.
- Full runner log (1038 lines) from the failing run.

## Containment

This defect must not consume the 02c-2R runtime witness. That witness was
resumed on an explicitly different substrate (schema-only clone) and its
evidence record states plainly that it does not attest empty-database migration
reproducibility. See `WS2-02c-2R_MAC_STUDIO_WITNESS.md`.
