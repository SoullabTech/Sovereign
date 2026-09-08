# PT-3 — production census result · §VII return

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §VI–VII.
**Observed:** 2026-09-08, founder-run, read-only, on production `maia_consciousness` (minisforum).
**Status:** ⛔ Nothing mutating performed. **DEPLOY and CUTOVER remain HELD.**

> ⭐ **Headline: the ambiguous category is empty. Production has ZERO Works with more than one
> arrival.** §VII.8 — whether any case requires founder reconciliation rather than deterministic
> migration — answers **no, not one**. The backfill is fully deterministic against this production
> state, and the machinery built to refuse guessing will correctly produce nothing.
>
> ⚠️ **But two blockers were found that are not in the data.** See §7 and §9.

---

## §VII.1 — The production legacy census

| | |
|---|---|
| Works | **13** — 6 with a Historical Source, 7 without |
| `source_custody` | 6 `source_custodied` · 7 `legacy_interpreted_import` (agree exactly with the above) |
| Arrivals | **8** — 6 artifact-backed, 2 member-supplied, **2 unclaimed**, 0 refs without hash |
| Sections | **1137** across **11** Works · 8 without heading · **549 carrying `heading_depth`** |
| Works with sections but no arrival | **5** — genuine `legacy_interpreted_import` |
| Orphans / contradictions | 0 / 0 / 0 · **2 drafts whose Work has no sections** |
| Currency decided by sort order | **0** |
| Migration ledger | **528 rows · 525 without checksum · attribution columns NOT PRESENT** |

The numbers reconcile exactly: 11 Works with sections = 6 with an arrival + 5 without; 13 − 11 = the
2 blank member-written Works, matching the 2 drafts without sections.

## §VII.2 — Every multiple-arrival ambiguity

**None. Zero rows in 3, 3b and 3c.**

No Work in production carries more than one Historical Arrival, so the old
`ORDER BY created_at ASC` never chose between candidates on any real Work. §VII.7's
`works_whose_currency_is_decided_by_sort_order` independently confirms it: **0**.

⭐ **This is a substantive result, not an absence.** The reconciliation machinery, the DIVERGENT
disposition and §III's transitional fail-open were all built for a category production does not
contain. **They will apply to zero Works** — and they should stay, because the next import can create
one, and the law should exist before the case does.

## §VII.3 — Runtime credential topology

All four runtime services — `maia-sovereign`, `maia-api`, `maia-comms-worker`, `maia-rlm` — hold
`DATABASE_URL` with role **`soullab`**, and none holds `MAIA_APP_DATABASE_URL`.

**Every runtime service runs as the owner.** That is the pre-cutover state and, per §VI, not a fault.

## §VII.4 — Migration credential topology

`.env.production` declares exactly one database variable: `DATABASE_URL` (role `soullab`). `migrate`
loads that same file. `maia_app` **does not exist**; `manuscript_sections` is owned by `soullab`; the
PT-3 migration is **not applied**.

✅ One thing is already right: the app credential is **not** in the universally-loaded env file, so
the §VIII.A trap has not been walked into.

## §VII.5 — Which services load which authority

**One authority, loaded by everything.** Runtime and migration are the same role from the same file.
There is no separation to preserve yet — which is precisely what cutover creates.

**Verdict: `NOT YET CUT OVER` — 5 pre-cutover conditions, 0 defects.**

---

## §VII.7 — Does any production shape invalidate the tested backfill?

**No shape invalidates it. Every production category was already simulated**, and the one production
characteristic the simulation lacked has now been tested directly.

| Production category | Count | Simulated |
|---|---|---|
| one arrival + sections | 6 | ✓ (fixture A) |
| **multiple arrivals** | **0** | ✓ (fixture B — simulated a case production does not have) |
| sections, no arrival | 5 | ✓ (fixture C) |
| blank member-written | 2 | ✓ (fixture D) |
| unclaimed arrival | 2 | ✓ (fixture E) |
| all six §9 hazard shapes | 0 each | n/a |

⚠️ **The one gap, closed by a run rather than an argument.** The simulation's sections carried NULL
`heading_depth` / `heading_signal`; production has **549 sections with depth**. The refusal trigger
is scoped `UPDATE OF heading, body, position, heading_depth, heading_signal, manuscript_id`, and the
backfill's UPDATE sets **only** `representation_id` — so the trigger does not fire. Verified on a
depth-bearing fixture: `sections with representation_id 4/4` · **`depth+signal preserved
byte-identical 4/4`** · 1 act, 0 member actors · 1 reconciliation row.

`duplicate (manuscript_id, position) pairs = 0`, so the move to `UNIQUE (representation_id, position)`
will build without conflict.

### Predicted backfill output, for comparison after it runs

| | |
|---|---|
| Representations created | **11** — 6 `source_custodied`, 5 `legacy_interpreted_import` |
| Sections given `representation_id` | **1137** |
| Lifecycle acts | **17** — 11 `extraction` + 6 `arrival`, **all `migration_legacy`, all with NULL actor** |
| Reconciliation rows | **5** `representation_without_arrival` · **0** `multiple_legacy_arrivals` |
| Untouched | 2 blank Works · 2 unclaimed arrivals |
| Works left on transitional compatibility | **0** |

Any deviation from those numbers is a finding.

## §VII.8 — Does any case require founder reconciliation?

**No arrival case does.** Zero multi-arrival Works means zero DIVERGENT dispositions.

The **5 `representation_without_arrival`** rows are recorded as evidence, not as questions. Each is a
Work whose sections have no Historical Source behind them — genuine pre-WS-01 history. The backfill
preserves each as operative with a `migration_legacy` act and **flags that it is uncustodied**. That
is a fact worth surfacing to those members eventually; it is **not** a decision the migration needs.

⚠️ **One ledger fact that is a founder question, not a data one:** 525 of 528 applied migrations have
no checksum and **none has attribution**, because the columns do not exist yet. The runner adds them
idempotently, so **every future migration is attributed and every past one stays unattributable.**
That is correct and must not be repaired — fabricating attribution for 528 historical acts is exactly
the laundering §V forbids. **The 2026-09-07 provenance question remains permanently unanswerable, and
this makes it the last one.**

---

## §7 — ⚠️ BLOCKER 1: the deploy lane will run the code before the migration

`scripts/deploy-production.sh deploy` orders **build → swap → verify → migrate**. The new code's
scoped reads reference `manuscript_sections.representation_id` and `source_operative_representation()`
— **neither exists until the migration runs.** Demonstrated against a pre-migration database:

```
ERROR:  column "representation_id" does not exist
```

**Nine shipped files carry that dependency**, covering manuscript list, detail, render, candidates,
draft creation, preparation, conversion and section save — most of Writer's Studio, against a
production holding a real book of 262 sections.

And per CLAUDE.md, a failed migrate step only `log_warn`s and still prints `Deployment complete!` —
**so the broken window is not necessarily transient.**

`deploy-production.sh migrate` is not a clean escape: it takes no SHA, builds nothing, and mounts
`$PROJECT_DIR/database/migrations` — **the shared working tree's** migrations, whatever branch is
checked out. Using it would require checking the branch out in the shared tree (the 2026-07-27
hazard) and would apply the Experiences migration too.

⭐ **The clean path is two ordinary deploys:** first a commit carrying **only**
`20260908000001_pt3_source_custody_enforcement.sql` on top of current production — its code is
unchanged, so the swap is inert and the migrate step lands the schema. Verify the predicted numbers
above against production. **Then** deploy the code. ⛔ Not authorized here; returned for ruling.

## §9 — ⚠️ BLOCKER 2: deploying PT-3 would also deploy Experiences

Both migrations sit on one branch. `migrate` applies **every pending migration in the snapshot**, so a
deploy carrying the PT-3 code would also apply `20260908000002_writer_experiences.sql` — creating the
Experience tables in production, which §XVI holds.

⭐ **This is the 2026-09-07 structural finding recurring with a name on it:** *merging a migration to
the deployable branch is, in effect, authorizing it to be applied by whoever deploys next.* The
founder gate sits on the deploy decision; nothing gates the branch. **The two-deploy path above also
fixes this**, because the migration-only commit carries neither the code nor the Experiences schema.

⛔ No repair to the branch gate is authorized here. It is named so the next deploy does not discover
it the way September's did.

---

## Standing

**PT-3 is enforced in code and not in production.** Production is `NOT YET CUT OVER`, with 0 defects
and 5 expected pre-cutover conditions. §VII items 1–8 are answered. Two blockers are returned for
ruling before any production mutation. Nothing was changed.
