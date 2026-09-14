# Operational finding — `maia_focus_witness`'s ledger is not a complete account

**Found during** `PROPOSAL-AUTHORIZATION-MIGRATION-STATE-01`, 2026-09-14.
⛔ **Routed OUT of Step 2 deliberately: it does not block the architecture.**

## The reading

```
maia_focus_witness · PostgreSQL 17.7 (Homebrew) · 2026-09-14T09:34:11-04:00

schema_migrations
  20260913000002_manuscript_revision_proposals           ABSENT
  20260913000003_revision_proposal_execution_authority   ABSENT

actual schema
  manuscript_revision_proposals                          PRESENT · 14 columns
  mrp_acceptance_whole                                   PRESENT
  mrp_execution_authority_vocabulary                     PRESENT
  mrp_inspection_only_never_accepted                     PRESENT
  mrp_execution_authority_immutable (trigger)            PRESENT
  4 rows · 2 accepted
```

## The finding, stated exactly

> **`maia_focus_witness.schema_migrations` is not a complete account of that
> database's schema-changing acts.**

⛔ **It does not generalize.** Production's ledger and schema **agreed** in this
census — all four migrations absent, all three tables absent. Nothing here
licenses a claim that production's ledger is unreliable.

⚠️ **And it is a local witness database, not a protected environment.** Exposure
is nil. The mechanism resembles the 2026-09-07 drift (schema arriving without a
recorded authorizing act), but the consequence does not, and the two must not be
spoken of in one breath.

## ⛔ What must not be done to it

It is **frozen as evidence** by founder ruling. No ledger backfill, no
corrective migration, no rename, no row alteration. Its inconsistency is part of
what it witnesses.

## The open question, parked

If the EW-F1a schema arrived without a ledger row, **what else in that database
arrived the same way?** ⛔ Not pursued — it is forensic, it blocks nothing, and
the Step 2 architecture does not depend on the answer.
