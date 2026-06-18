# Reconciliation scripts

Operator-run scripts that **reconcile the running database with the schema this
project already declares**. They are deliberately kept *out of*
`database/migrations/` so the migration runner (`scripts/apply-migrations.sh`)
never applies them automatically — reconciliation is a deliberate act, not part of
an unattended deploy.

## Why this category exists

A normal **feature migration** evolves the design. A **reconciliation** does not —
it repairs drift between what the schema declares and what the live database
actually has. These are different responsibilities and we keep them separate.

The sharpest line is **schema vs. data**:

- Adding a constraint is **schema reconciliation** — safe, idempotent, automatable.
- Deleting or nulling rows is **data reconciliation** — destructive or
  semi-destructive, and must not happen automatically before an operator has seen
  the audit.

Once a single step both deletes rows *and* reconciles schema, it has crossed that
line. We don't cross it silently.

## The methodology (reusable beyond the database)

1. **Recover declared intent** — what does the source say should be true?
2. **Measure live reality** — what is actually there?
3. **Explain every divergence** — name each gap, don't paper over it.
4. **Classify each divergence** as *schema*, *data*, or *application*.
5. **Repair only one class per change** whenever practical.
6. **Verify** the running system now matches the declared intent.

## Phases for the comms spine

| Phase | Script | Effect |
|------:|--------|--------|
| 1. Observe | `comms-spine-reconcile-report.sql` | **Read-only.** Lists missing constraints; classifies each FK orphan as SET-NULL-repairable (non-destructive) or DELETE-required (destructive); flags duplicate tuples blocking UNIQUEs. |
| 2. Approve + repair (data) | `comms-spine-orphan-repair.sql` | Mutates **data only**. SET NULL runs freely; DELETE is **fail-closed** behind `maia.confirm_orphan_delete = 'yes'`. Every change recorded in `spine_fk_repair_audit` (reversible). |
| 3. Reconcile (schema) | `../migrations/20260617000003_comms_spine_constraints.sql` | Adds **schema only** (UNIQUE + FK + partial indexes). Auto-applied by the runner. **Halts** with a clear diagnostic if any FK-blocking orphan remains — it never repairs data itself. |

### Run order

```bash
# 1. Observe — changes nothing
psql -U soullab maia_consciousness -X \
  -f database/reconcile/comms-spine-reconcile-report.sql

# 2. Repair data. Without the SET, deletes are refused and the script halts.
#    Add the SET only after reviewing phase 1's delete-class rows.
psql -U soullab maia_consciousness -X -v ON_ERROR_STOP=1 \
  -c "SET maia.confirm_orphan_delete = 'yes';" \
  -c "BEGIN;" -f database/reconcile/comms-spine-orphan-repair.sql -c "COMMIT;"

# 3. Reconcile schema (or just let the next `npm run db:migrate` apply it)
psql -U soullab maia_consciousness -X -v ON_ERROR_STOP=1 \
  -c "BEGIN;" -f database/migrations/20260617000003_comms_spine_constraints.sql -c "COMMIT;"
```

Each script is idempotent: on an already-reconciled database every phase is a clean
no-op (report shows "all present", repair finds 0 orphans, schema migration skips
every constraint).

### Verify

```sql
-- expect rows for both 'f' (foreign key) and 'u' (unique)
SELECT contype, count(*) FROM pg_constraint
WHERE conrelid::regclass::text LIKE 'comms_%' GROUP BY contype;
```
