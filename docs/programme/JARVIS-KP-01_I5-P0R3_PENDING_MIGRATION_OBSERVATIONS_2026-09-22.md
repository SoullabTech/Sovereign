# JARVIS-KP-01 / I5-P0R3 — PENDING-MIGRATION OBSERVATIONS (ROUTED OUT)

STATUS: RECORD · repository truth only (⛔ no production read, ⛔ not a review, ⛔ not an admission)
**Date**: 2026-09-22
**Occasion**: `I5-P0R3 STOPPED PRE-DEPLOYMENT · SEAM PROPERTY GREEN · GOVERNED DEPLOYMENT BLOCKED ON UNADMITTED PENDING MIGRATION`

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

Observations on `database/migrations/20260921000001_developmental_reading_observation_identity_compatibility.sql`
(on canonical `fa5274fd`, introduced by `7a91d699 fix(writers-studio): persist canonical observation identity`).

⛔ **This is not a review and admits nothing.** It is repository shape, recorded for
whoever opens the review lane. ⛔ *The lane that finds a fact does not thereby own it.*

## 1. ⭐⭐ It replaces a TRIGGER FUNCTION and attaches NO trigger

| fact | value |
|---|---|
| top-level DDL | exactly one: `CREATE OR REPLACE FUNCTION developmental_readings_observations_check()` |
| returns | `TRIGGER`, plpgsql body L23–167 |
| `CREATE TRIGGER` / `DROP TRIGGER` | **0** |
| file-level transaction | `BEGIN;` L20 … `COMMIT;` L172 |
| `IF (NOT) EXISTS` guards | 0 (moot — `CREATE OR REPLACE` is idempotent by construction) |

⭐ **Consequence the review must face**: with no trigger statement, this changes the
behaviour of an **already-attached** trigger **in place**. There is no new object and
no rollout window — **at `COMMIT`, the currently-running old reader begins executing
the new validation function.**

Under the ratified `gate → migrate → tags → swap → verify` ordering, the function is
replaced **before** the new code swaps in, so the **old** reader runs against the
**new** validation for the whole deploy window. That is exactly the surface
`migration_compatibility` and `failure_prefix_compatibility` exist to adjudicate.

⛔ **Direction not asserted.** A `..._check()` trigger function that *tightens*
validation can start refusing writes the old reader previously made; one that
*loosens* does the opposite. Which of these it is requires reading the body's
semantics, **which is the review's job, not this record's.**

⚠️ The file carries its **own** `BEGIN`/`COMMIT`, which by the 2026-09-14 routed-out
finding **overrides the runner's intended boundary**. Named, ⛔ not adjudicated.

## 2. ⭐ Prefix collision with an I5 seam migration

```
20260921000001_developmental_reading_observation_identity_compatibility.sql   ← pending
20260921000001_epistemic_join_persistence.sql                                 ← I5 SEAM
20260921000002_epistemic_join_integration_shadow.sql                          ← I5 SEAM
```

Two migrations share the prefix **`20260921000001`**, and one of them is inside the
**declared I5 seam**. That is presumably why the deploy law demands a
`failure_prefix_compatibility` attestation here.

⭐ **The ledger keys on `filename`, not prefix** (`scripts/apply-migrations.sh:101`,
`WHERE filename = :'filename'`, plus a `checksum` column), so the pending file
**cannot** be mistaken for the applied one and **cannot** be silently skipped. The
concern is therefore **ordering/prefix semantics under failure**, ⛔ not ledger
identity. Recorded so the review does not spend effort on a collision that is not
there, and does spend it on the one that is.

## 3. The pending migration does NOT touch I5's tables

Zero matches for `epistemic_join` / `relational_field` in the file. It is a
**different lane's schema**, meeting I5 only at the deployment gate and the prefix.

## 4. ⚠️ THE STRUCTURAL SHAPE, named ⛔ not opened

I5's §I.2 freshness can be satisfied **only** by a governed deploy, and the governed
deploy is blocked by **another lane's** unadmitted migration sitting on canonical.
So I5 is now blocked on work it does not own and cannot perform.

⭐ This is the **2026-09-07 finding from the other side.** That finding was: *merging
a migration to canonical authorizes whoever deploys next to apply it.* The mirror is:
**a migration that reaches canonical without its admission evidence blocks every
lane's deploy until that evidence exists.** The same channel, failing closed instead
of open — which is the safer direction, and still a coupling nobody chose.

⛔ No lane opened. ⛔ No repair proposed. ⛔ Not I5's to fix.

## 5. Standing

`I5-P0 NOT READY · BLOCKED ON PRODUCTION FULL-SEAM FRESHNESS` ·
`I5-P0R3 STOPPED PRE-DEPLOYMENT` · seam property **GREEN** (A/B/C preflight, six-blob
custody 6/6) · §I.3 **SATISFIED** · §I.2 **NOT SATISFIED** · deployment **BLOCKED on
an unadmitted pending migration** · B1 / B2 **UNREPAIRED** · `--apply` **NOT RUN** ·
flags **ALL OFF** · rows **NONE** · instrument **NOT FROZEN** · ⛔ R4 · ⛔ I5-P1 ·
**PRODUCTION UNCHANGED BY R3.**
