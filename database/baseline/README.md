# Canonical schema baseline

`schema.sql` here is a **present-day reconstruction** of the MAIA schema. It is not
a migration, and it makes no claim about how the schema came to be. It exists so
that one property holds:

> A completely empty PostgreSQL database can be turned into the MAIA schema from
> the repository alone.

## Why it exists

Several relations were created directly against live databases and their genesis
DDL never entered `database/migrations/` — `developmental_memories`,
`integration_passes`, `studio_people`, `studio_meetings`,
`manuscript_draft_sections` among them. Later migrations reference and evolve
those tables. The migration tree is therefore an **amendment log**, not a
constructive schema: replayed into an empty database it fails partway through.

The honest repair is not to author fake genesis migrations for tables whose
origins are lost. It is to state plainly that the current schema is the starting
point, capture it as a reviewed artifact, and run forward from there.

## Files

| file | meaning |
|---|---|
| `schema.sql` | schema-only dump of the known-good database — no data, no owners, no privileges |
| `CUT_LINE` | the migration filenames `schema.sql` subsumes, read from the source database's own `schema_migrations` |

`CUT_LINE` is generated, never hand-edited. It records what the source database
said it had applied — not what happens to be on disk — so the baseline never
claims to subsume a migration that was never actually applied to it.

## How it is used

`scripts/apply-migrations.sh` has a bootstrap phase that fires **only** when the
target database has recorded no migrations *and* has no relations in `public`
apart from `schema_migrations`. It applies `database/init/`, then `schema.sql`,
then stamps every name in `CUT_LINE` into `schema_migrations` with that file's
current on-disk checksum. The runner then proceeds normally, skipping the
subsumed migrations and applying everything after the cut line.

On any database that already has a schema the phase is inert. Production cannot
enter it.

Stamping the cut line is also what reconciles the two senses of "required" that
had come apart: the entries in `database/required_migrations.txt` are recorded as
applied, so `runtime-required` and `constructible-from-source` describe the same
set again.

## Refreshing it

```bash
# where the known-good database lives
DATABASE_URL=postgres://... scripts/capture-baseline.sh

# then, against a disposable empty database
DATABASE_URL=postgres://... scripts/test-empty-db-reconstruction.sh
```

Refresh it when the cut line has drifted far enough that replaying the tail is
slow, or after a schema repair that the tree cannot express. Refreshing is a
reviewed act: the diff of `schema.sql` is the review surface.

## What must never happen

Nothing may be copied out of a live database to make
`scripts/test-empty-db-reconstruction.sh` pass. The test's only legitimate
inputs are this directory, `database/init/`, and `database/migrations/`. If it
fails, a migration depends on something no migration creates — that is the
defect returning, and it is fixed by adding the DDL, not by widening the test.
