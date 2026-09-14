# DEPLOYMENT-SAFETY-01 · MIGRATIONS FAIL CLOSED

**Opened by founder ruling** 2026-09-14, after the deployment-custody census
(`a1fe777d`) was accepted with answer **B — coupled**.
**Purpose:** ⛔ *not* to separate merge from schema deployment. To make their
**deliberate coupling fail closed.**

⛔ **NO S3 CHANGE. NO MERGE. NO SCHEMA DEPLOY. NO PRODUCTION MUTATION.**

---

## 1 · THE LAW, AND THE DEFECT IT NAMES

```text
migration success  →  deployment may continue
migration failure  →  deployment MUST STOP · non-zero · no success message
```

Before this repair, `cmd_deploy` and `cmd_update` both caught the runner's
non-zero exit with `if ! deploy_ctx_compose --profile migrate run --rm migrate;
then log_warn …; fi` and fell through to `log_success "Deployment complete!"`.

⭐ That broke the migrations README's own rule — *schema and reader ship
together* — **in the failure direction**: the schema could fail while the reader
continued toward production, and the operator was told the deploy succeeded.
Combined with the runner's `exit 1` on the **first** failing file, one unrecorded
failure silently left every later migration unapplied behind a green deploy.

---

## 2 · THE REPAIR — PROPAGATION ONLY

One shared step, `run_migrations_or_abort()`, called as a **bare command** from
both deploy paths. On failure it states the abort, names that the runner stops at
the first failing file, routes the operator to `rollback` or `migrate`, and
`exit 1`s — so smoke checks are skipped deliberately (⭐ *passing them would only
prove the reader starts, not that its schema exists*).

⛔ **NOT CHANGED**: migration discovery, selection, glob, ordering, the ledger,
manifests, any migration file, the schema/reader architecture, or S3.
`cmd_migrate` needed no change — `set -e` already makes it fail closed.

### ⚠️ WHAT THIS REPAIR CANNOT DO, STATED RATHER THAN IMPLIED

The founder's law includes *"reader must not ship"*. **Propagation alone cannot
deliver that clause**, and it would be dishonest to report otherwise.

```text
build → swap → provenance verify → MIGRATE
                                   ↑ the failure becomes visible only here,
                                     and the reader is already live
```

What the repair delivers: the deploy **fails closed**, emits **no success
message**, and routes to rollback. What it does not deliver: preventing the swap.
⛔ Whether `migrate` should precede the swap is a deploy-**ORDERING** question,
outside the ruling's stated scope, and is **deliberately not decided here** —
naming it is the honest act; quietly reordering the deploy would not be.

---

## 3 · THE WITNESSES — `npm run verify:migrate-fail-closed` · **14 passed · 0 failed**

House method (cf. `verify-deploy-provenance.sh`): the REAL function is sourced
from the REAL script, the compose seam is stubbed, the hostile mutation runs on a
**throwaway copy**, and the real tree is proven untouched by digest.

```text
FAILURE WITNESS
  forced migration failure → non-zero exit (1)
  deployment did NOT continue past a failed migration
  no success message emitted on failure
  the abort is stated to the operator
  the operator is routed to rollback

SUCCESS WITNESS
  migration success → exit 0
  deployment continues normally on success

DISCRIMINATION
  hostile mutation (the pre-repair swallow restored) is DETECTED
```

⭐ **The discrimination case is the one that makes this an instrument.** Without
it, every green line above would also be green against the old, broken script.

Structural, over the committed file: both paths call the step as a bare command
(⛔ not in `$(…)`, not behind `||` or `if !`); each success message comes strictly
**after** it; no swallowing block remains anywhere; `set -e` is in force.

Neighbouring gates re-run unchanged: `verify:deploy-provenance` **27/0** ·
`verify:deploy-lock` **25/0**. ⛔ No production mutation was needed or performed.

---

## 4 · THE TWO PRODUCTION PREFLIGHT READS — ⛔ **NOT PERFORMED. NO ACCESS.**

⚠️ **This session cannot reach production, and will not pretend otherwise.**
Checked directly: there is **no `ssh` binary in this container**, and
`minisforum` **does not resolve** (a LAN name; only `soullab.life` resolves, to a
public address that answers HTTP and gives no ledger). ⛔ Both preflight items are
therefore **UNRESOLVED — blocked on access, not on method**.

⭐ *An unread fact reported as unread is worth more than a plausible inference.*

The exact read-only procedure, to be run by the founder on minisforum. ⛔ Every
statement below is a SELECT or a listing; **nothing writes**, and none returns
authored prose.

**(1) Is anything pending AHEAD of the S3 migrations?**

```bash
# The migration set of the RUNNING commit (not the checkout), as the runner
# would encounter it — shell glob order, which is lexicographic.
ssh soullab@minisforum \
  'docker exec maia-sovereign ls /app/database/migrations | grep "\.sql$" | sort' \
  > /tmp/tree.txt

# The ledger.
ssh soullab@minisforum \
  'docker exec maia-postgres psql -U soullab -d maia_consciousness -tAc \
     "SELECT filename FROM schema_migrations WHERE filename IS NOT NULL ORDER BY 1;"' \
  | sed 's/[[:space:]]*$//' | sort > /tmp/ledger.txt

# Present in the tree, absent from the ledger — i.e. what the next full deploy
# would attempt. Anything sorting BEFORE 20260913000001 would be attempted first
# and, on failure, would block S3 from ever reaching its own schema.
comm -23 /tmp/tree.txt /tmp/ledger.txt
```

Expected answers and what each means:

```text
(no output)                      → nothing pending; S3 would be reached
files all ≥ 20260913000001       → nothing pending AHEAD of S3
any file < 20260913000001        → NAME IT. It runs first; if it fails, S3's
                                   schema never lands and the deploy (before
                                   this repair) still said "complete"
```

⛔ **Do not infer this from the witness shadow.** §5 says why.

**(2) Is a body-requiring developmental Ask reachable in production?**

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab -d maia_consciousness -tAc "
  SELECT
    (SELECT count(*) FROM developmental_readings)                        AS readings,
    (SELECT count(DISTINCT member_id) FROM developmental_readings)       AS members_with_readings,
    (SELECT count(*) FROM developmental_readings r
       WHERE jsonb_path_exists(r.observations,
             \\"\$[*].evidenceRefs[*] ? (@.kind == \\\\\"section\\\\\" || @.kind == \\\\\"passage\\\\\")\\"))
                                                                         AS readings_with_body_refs,
    (SELECT count(*) FROM ask_threads)                                   AS ask_threads,
    (SELECT to_regclass(\\"public.ask_authorization_acts\\") IS NOT NULL) AS s3_tables_present;"'
```

⭐ Counts only — ⛔ no observation text, no evidence content, no member identity.

```text
readings_with_body_refs = 0  → no member can reach the body-requiring path today;
                               the blast radius of the production act is nil
readings_with_body_refs > 0  → the path is live; the act has real exposure and
                               its rollback plan must account for it
s3_tables_present = false    → confirms S3's schema is absent (expected)
```

Surface note from source, ⛔ not a substitute for the read: the Develop room
carries **no founder gate and no middleware gate**
(`app/writers-studio/develop/page.tsx`, `middleware.ts`); authority is ownership
enforced at the API. So exposure is decided by whether such readings **exist**,
not by a feature flag.

---

## 5 · THE 56 — CORRECTION CARRIED FORWARD

⭐ **Accepted and carried:** the 56 migration refusals in the S3 witness came from
replaying the **raw chain against an empty cluster**, which this repository does
not support. The canonical bootstrap is `scripts/bootstrap-database.sh` — apply
`database/baseline/0001_baseline_2026-09-01.sql`, seed the ledger from its
**517-entry manifest**, then migrate the delta; the repo already records that some
migrations are not individually replayable from empty.

⛔ **They are not, and must not again be described as, 56 production-pending
migrations.** What production actually has pending is the unread fact in §4(1).

---

## 6 · STANDING

```text
DEPLOYMENT FAIL-CLOSED        ✅ PASS · 14/0 · hostile mutation DETECTED
  reader-must-not-ship clause  ⚠️ NOT DELIVERED by propagation — migrate runs
                                  after the swap; ordering question NOT opened

PRODUCTION pending-before-S3   ⛔ UNRESOLVED — no ssh, minisforum unresolvable
PRODUCTION S3 ledger state     ⛔ UNRESOLVED — same
PRODUCTION route exposure      ⛔ UNRESOLVED — same

S3 ROUTE-INTEGRATION           ✅ CLOSED · 6ec5ff1d · witness e5241151
MERGE                          ⏸ HOLD
SCHEMA DEPLOY                  ⛔ NOT AUTHORIZED
PRODUCTION                     UNTOUCHED · UNREAD
thread-store finding           OPEN · ROUTED OUT
branch-gate lane               NOT OPENED
```

⛔ No merge follows this. Stop for explicit authorization.
