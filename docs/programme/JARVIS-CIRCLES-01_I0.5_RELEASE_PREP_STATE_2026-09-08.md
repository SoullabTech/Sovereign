# I0.5 · RELEASE PREPARATION — STATE OF RECORD

**Date** 2026-09-08 · **Lane** `JARVIS-CIRCLES-01`
**Status** ⛔ **PREPARED, NOT VERIFIED, NOT MERGED, NOT DEPLOYED.**

```
canonical            e535e6246
production           e535e6246          ← production has caught up to canonical
release candidate    d58488db97176295f210fe672d7e5243a5e30589
  parents            e535e6246          current canonical
                     1725a0857          original verified I0.5 tip

RECONCILE        PASS
SCOPE            CLEAN / ISOLATED   (founder-asserted — see §2)
63/63 RERUN      BLOCKED BY TOOL SAFETY BOUNDARY
PR               NOT OPENED
MERGE            NOT DONE
DEPLOY           NOT DONE
PROD WITNESS     NOT DONE
```

> **No authority has been advanced on evidence we do not possess.** The candidate exists; the witness
> does not.

## 1 · Why the rerun stopped, and why that is correct

The connected-machine safety layer refused every operation needed to construct a production-derived
shadow: moving a production dump to the Mac · creating a disposable same-host Postgres shadow · later
schema/dump handling for an existing local witness database. **The safer variants were tried first;
production was not touched.**

⭐ **The gate was not weakened.** No other test was relabelled "63/63", and the refusals were not routed
around. The witness contract — read from the committed instrument itself — requires: **the committed
verifier · the three Circle migrations in order · all 63 required obligations discharged by PASS · zero
failed/warned/skipped · rolled-back fixtures · a disposable shadow.** Anything less is a weaker test
wearing the same number, which is exactly what FR-14 exists to prevent.

**Loose ends, recorded rather than tidied away:**

- One empty local database `maia_i05_shadow_d58488db` was created before the first schema-copy failed
  on a **PostgreSQL client-version mismatch**. **No schema and no candidate migration were applied to
  it.** Destructive cleanup was not attempted after the safety layer began refusing database
  operations. ⚠️ It is a stray empty artifact awaiting cleanup — not evidence of anything.
- ⚠️ **The client/server version mismatch is an operational blocker that will recur.** Until the client
  matches the production server major version, the shadow cannot be constructed by that route at all.

## 2 · ⚠️ Two findings from this session, stated as findings

### 2.1 The candidate is not on `origin`

`d58488db` is **not reachable from this clone after a full fetch**, and **no ref on `origin` points at
it**. It exists only on the machine that built it.

Consequences, both real:

- **It cannot be deployed by the SHA-named path.** `pre-deploy-gate.sh deploy-maia <SHA>` and
  `deploy-production.sh deploy <SHA>` both `git fetch origin` and then materialize a **named commit**.
  An unpushed SHA is not materializable.
- **It is not preserved.** A verified-but-unpushed candidate can be lost to a disk, a checkout, or a
  branch switch — and would then have to be rebuilt and re-verified from scratch.

⭐ **Pushing it costs nothing and advances no authority.** A pushed commit is not a merge and not a
deploy. Recommended as the next act, before the witness.

### 2.2 The scope claim is founder-asserted, not verified here

The candidate is reported to contain the original I0.5 history and **not** the later Salon/interior
doctrine (`SALON_DESIGN_THREAD_v0.1.md`, `CIRCLE_INTERIOR_FUNCTION_MODEL_v0.1.md`).

⛔ **This session could not verify that**, because the object is absent from this clone — a file-presence
probe against an unreachable commit returns "absent" for **everything**, including files that are
certainly in it. **That is not evidence of clean scope; it is evidence of nothing.** Recorded as
founder-asserted, verifiable the moment the candidate is pushed.

## 3 · The lane branch and the candidate have diverged — deliberately

| | |
|---|---|
| `claude/jarvis-circles-programme-reouzc` (head `3fd03ff9e`) | the **doctrine record** — FR-19…FR-35, both design records, the journeys, D-K3. Also carries its own reconcile merge of canonical. |
| `d58488db` | the **release candidate** — I0.5 only. |

⛔ **The lane branch is NOT the release path.** Its earlier reconcile merge was correct at the time and
is now superseded for release purposes; it remains the record. **Do not deploy the lane branch.**

## 4 · Remaining sequence — all founder acts

1. **push** `d58488db` (preserves it; makes it deployable; makes §2.2 verifiable) — advances no authority
2. **rerun** the 63-obligation witness against it on a disposable shadow — blocked on the client-version mismatch
3. **open PR · merge**
4. **deploy**, then a **production witness bound to the actual deployed SHA**
5. **clean up** the stray empty `maia_i05_shadow_d58488db`

⛔ No doctrine folded in. ⛔ Steps 2–5 need a connected machine; this session has neither `DATABASE_URL`
nor `node_modules`.

---

# UPDATE · 2026-09-08 — MERGED. DEPLOY HELD.

```
CANDIDATE       321cb1536      "fix(circles): let canonical migration runner own ledger writes"
PR              #1258 MERGED
CANONICAL       891b33ee0      ← now the canonical tip

63/63           PASS · 0 failed · 0 warned · 0 skipped · exit 0
BOOTSTRAP       empty-database reconstruction PASS · exit 0
RESIDUE         removals 0 · shares 0 · inquiries 0 · responses 0
CI              Docker build · TS no-regression · empty-DB reconstruction ·
                Covenant · Sovereignty · JARVIS adjudication · diagrams — ALL PASS
BACKUP          /home/soullab/MAIA-SOVEREIGN/backups/maia_backup_20260907_140424.sql

DEPLOY          HELD — serialized by an active cohort witness
PRODUCTION      e535e6246 UNCHANGED · 4 circles · 4 memberships · 0 shares/inquiries/responses
                removal_table ABSENT · withdrawn_at ABSENT · integrating rows 0
PROD WITNESS    PENDING DEPLOY
LOCAL SHADOWS   RETAINED UNTIL PROD WITNESS
```

**Verified independently from the artifacts** (not taken on assertion): `891b33ee0` is the canonical
tip and carries the #1258 merge · `321cb1536` exists with that message · **on canonical all three
Circle migrations contain zero `schema_migrations` references**, while the pre-repair versions on the
lane branch contain one each.

## ⭐ The defect was NOT base drift. It was a witness-method coverage gap.

The three migrations each ended with:

```sql
INSERT INTO schema_migrations (filename, applied_at)
VALUES ('…sql', NOW()) ON CONFLICT (filename) DO NOTHING;
```

while `scripts/run-sql-migrations.sh` **already owned** ledger insertion and checksum.

⚠️ **I checked, and the runner did not change during the reconcile window.** `git diff 39daacae5
e535e6246` touches **no migration-runner file**. The double-write was therefore **latent from the
moment those migrations were authored** — it was never introduced by canonical moving.

So why did it survive **three** prior `63/63` passes and fail only now? Because of **how the shadow was
built**. Every earlier witness restored a **production schema dump** and applied the migrations on top:
`schema_migrations` already existed, already held rows, and `ON CONFLICT DO NOTHING` absorbed the
redundant write silently. **Empty-database reconstruction builds from nothing** — a different path,
which is exactly where the conflict surfaces.

> ⭐ **Shadow-from-production-dump cannot see bootstrap defects. Empty-database reconstruction is a
> DIFFERENT obligation, not a redundant one.**

**My reconcile check was scoped to data, not to the executor.** It asked *did canonical add
migrations?* (no) and *does canonical touch circle files?* (no) — both true, both insufficient. **A
migration and its runner are not independent artifacts.** Recorded as a standing rule:

> **A reconcile that checks migrations for commutation must also check whether the thing that RUNS
> them has changed hands, changed contract, or already does what the migration does.**

## Deploy hold is legitimate, not an obstacle

The full deploy of `891b33ee0` was attempted and **correctly refused before changing anything** — the
single deploy lane is held by `COHORT PRE-WITNESS HOLD · target e535e6246 · remote PID 2455108 · local
PID 44567`. **The holder is live, not stale**: another lane is conducting the Writer's Studio cohort
production witness against `e535e6246`, including current-runtime PDF import/custody/navigation checks.

⛔ **Production cannot move without invalidating that witness.** The holder was not killed and the lock
was not deleted — which is exactly the rule the deploy-lane doctrine exists to enforce.

> Nothing remains wrong with I0.5 itself. The remaining blocker is **legitimate cross-lane production
> custody**, and overriding it would destroy evidence another lane is presently establishing.

## ⚠️ The lane branch is now stale on those three migrations

`claude/jarvis-circles-programme-reouzc` still carries the **pre-repair** migrations with the
self-registering `INSERT`. Harmless while the lane is a doctrine record and not a release path — but
anyone running the verifier from the lane branch against an **empty** database would hit the same
bootstrap failure. Fixed by merging canonical (`891b33ee0`) into the lane whenever convenient.

## Remaining sequence

1. **cohort witness completes** → deploy lane releases (another lane's act)
2. **deploy `891b33ee0`** → production witness bound to the **actual deployed SHA**
3. **release local shadows** and clean up `maia_i05_shadow_d58488db`


---

# UPDATE · 2026-09-08 10:15 EDT — lane still held. Two rules ratified.

## Two rules ratified as project-wide doctrine → `docs/ops/MIGRATION_WITNESS_DOCTRINE.md`

1. **A migration must be verified both against an upgrade-shaped database and against the canonical
   empty-bootstrap executor path. Neither witness subsumes the other.**
2. **A reconcile checks migration + executor + ledger semantics — not merely migration-file
   commutation.**

⭐ **These are not Circle rules.** They were learned here and apply to every lane that authors a
migration, so the authoritative statement lives in `docs/ops/`, not only in the Circle rulings file.
⛔ Promoting them into `CLAUDE.md`'s **Before Making Changes** section is a **founder act** — that
section is global project invariants — and has not been done.

## Lane check, 10:15 EDT — still legitimately held

```
COHORT PRE-WITNESS HOLD
target        e535e6246
local holder  ACTIVE
remote lock   HELD
production    e535e6246
```

The Writer's Studio cohort witness is **still actively working** — most recent machine activity is in
the PDF import / file-selection flow. ⛔ Nothing was deployed; the lock was not released; its owner was
not killed; production was not changed.

## The stale-migration cleanup is deferred, and the reason is better than "convenient"

Jarvis noted the doctrine lane still carries the pre-repair self-registering migrations and suggested
merging canonical in *"whenever convenient."* **Founder ruling: not now.** It is **harmless,
non-release-path drift**, and

> ⛔ **touching another lane while its production witness is still active buys us nothing.**

Reconcile after the production act, not before.

## The sequence, unchanged

```
cohort witness finishes
        ↓
owning lane releases deploy lock
        ↓
deploy 891b33ee0 via the FULL deploy path
        ↓
verify running SHA = 891b33ee0
        ↓
verify all 3 production migrations + schema effects
        ↓
run the Circle production witness
        ↓
close I0.5
        ↓
drop disposable I0.5 shadows / stray empty DB
        ↓
optionally reconcile the doctrine lane with canonical
```

> ⛔ **Nothing moves until that first arrow actually occurs.**
