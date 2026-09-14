# Retirement record — three migrations, retired before first protected execution

**Founder ruling** 2026-09-14 · Option 2 (retire + replace) · lane
`claude/proposal-authorization-schema`.

⛔ **THIS DIRECTORY IS NOT A MIGRATION DIRECTORY.** Nothing here executes. The
files carry a `.sql.retired` extension and live outside `database/migrations/`,
so neither the runner's `for f in /app/database/migrations/*.sql` nor a
recursive `*.sql` glob can reach them.

---

## Why they were retired

> **Retired before first protected execution because the active migration
> sequence contains two incompatible ontologies under one table name and cannot
> bootstrap to completion. Their schema effect exists historically in the frozen
> local `maia_focus_witness`, outside its migration ledger; that witness is not
> reconciled.**

On a blank database, in filename order:

```
20260910000004   applies · creates the OFFER ontology
20260913000002   NOTICE: relation already exists, skipping
                 ERROR:  column "work_id" does not exist
                 → the runner stops; each migration is its own transaction
20260913000003   never reached
                 → and any later repair migration is unreachable
```

⛔ **That is why a forward repair migration could not have fixed this.** On a
fresh database, *afterward* does not exist.

⭐⭐ **`IF NOT EXISTS` is what made it quiet.** It exists to skip *the same*
table; it cannot tell "already created" from "a different object is squatting on
this name", so the guard that makes re-running safe is the guard that hid the
collision.

---

## The files, with hashes as retired

```
7c0ff4e9256654d5bce72af5757b96302611ea3d5203ee703ace3447c2558f45
  20260910000004_manuscript_revision_proposals.sql.retired

1b65504ed1ef993f41e445d8c08afeb89b7d209426963874b4d275d260e9746b
  20260913000002_manuscript_revision_proposals.sql.retired

e59b94d2953c7403dfdd66c882d5086f70f9d08358785a8b239015daf40f73fc
  20260913000003_revision_proposal_execution_authority.sql.retired
```

⭐ Contents are byte-identical to their last active state. ⛔ Nothing was edited
on the way out — a retired file that had been "tidied" would no longer be the
evidence.

---

## What replaces them

```
20260910000004  the OFFER ontology   → manuscript_revision_offers
                                       (new migration, ratified identity)
20260913000002  the AUTHORIZATION    → manuscript_revision_authorizations
20260913000003  execution_authority  → ⛔ NOTHING. Retired BY CONSTRUCTION:
                                       there is no authorization row before an
                                       explicit member act, and absence is
                                       stronger than a flag
```

⭐ **`20260914000001_proposal_succession.sql` is NOT retired** and is unchanged.

---

## ⛔ What must not be done

```
⛔ do not move these back into database/migrations/
⛔ do not rename them to .sql
⛔ do not edit them
⛔ do not backfill any ledger to mention them
⛔ do not reconcile maia_focus_witness, which carries the effect of
   20260913000002/00003 outside its own ledger, with 4 rows · 2 accepted
```

⚠️ **`maia_focus_witness` is FROZEN AS EVIDENCE.** Its inconsistency — a schema
its ledger does not account for — is part of what it witnesses.

---

## State at retirement

```
production                ledger ABSENT · schema ABSENT · rows NONE
walk · maia_consciousness ledger ABSENT · schema ABSENT · rows NONE
maia_07a_witness          ledger ABSENT · schema ABSENT · rows NONE
maia_focus_witness        ledger ABSENT · schema PRESENT · 4 rows · 2 accepted
```

⭐ **No protected database had executed or adopted any of them**, which is what
made correcting the executable history lawful rather than a rewrite of
production history. ⛔ **But "they never ran anywhere" is false**, and the last
row is why.

Full readings: `docs/programme/PROPOSAL-AUTHORIZATION-MIGRATION-STATE-01_2026-09-14.md`.
