# Deploy obligations and defects — 2026-08-01

Recorded during the #857 production verification. Neither item is part of that
verification; both are logged here so they are not carried as memory.

**The distinction this record exists to preserve:**

1. **`living_works` absent is SAFE NOW** — because there are no runtime callers.
2. **It becomes a HARD DEPLOY GATE** before any declaration gesture or Living
   Work route reaches production.
3. **The no-argument deploy exit-code defect is operational debt** — real, but
   not part of #857 and not gating it.

Do not collapse (1) into (2): "safe now" is a statement about the current caller
set, not about the migration. The moment a caller exists, (1) expires and (2)
binds. Do not collapse (3) into either: it is unrelated debt that surfaced on the
same morning.

---

## OBLIGATION 1 — `living_works` migration must run through the full guarded path

**State as observed 2026-08-01, production:**

- `to_regclass('public.living_works')` → `MISSING`
- Migration exists on trunk: `database/migrations/20260801000001_living_works.sql`
  (landed via #856, commit `c39f41f2a`)
- The commit that shipped it deployed through the **quick lane**
  (`pre-deploy-gate.sh deploy-maia`), which **runs no migrations**.

**Why the gap is currently safe — and only currently:**

`living_works` has **zero runtime callers**. The only reference on trunk is
`lib/livingWork/domain.ts`, a pure domain model with no route, loader, or query
wiring. Nothing at runtime touches the absent table, so the deployed code cannot
fault on it.

**The obligation:**

> The `living_works` migration MUST be applied through the full guarded
> deployment path (`scripts/deploy-production.sh`, which acquires the deploy
> lane lock and runs migrations) **before** the declaration gesture — or any
> other Living Work route, loader, or query — is deployed.

Deploying a Living Work runtime caller through the quick lane would ship code
against a schema that does not exist. The quick lane cannot close this gap; it
does not run migrations at all.

**Discharge condition:** `to_regclass('public.living_works')` returns non-null in
production, applied via the full deploy path, verified before the first runtime
caller ships.

---

## DEFECT 1 — `scripts/deploy-production.sh` exits 0 when given no command

**Observed:**

```
$ scripts/deploy-production.sh
MAIA Sovereign - Production Deployment

Usage: scripts/deploy-production.sh <command>
...
$ echo $?
0
```

The script prints its usage block and **exits 0**. It performs no deploy.

**Why this matters:** exit 0 is the success signal. A caller — a human reading a
tail, a wrapper script, a CI step, an agent — reads "exit code 0" as "the deploy
happened." On 2026-08-01 this produced exactly that false reading: a deploy was
invoked with no command, reported success, and changed nothing. The running
container was still four commits and nine hours stale while the log said the
deploy had completed.

This is the general failure named in
`feedback_representation_bound_to_referent`: **a command succeeding is not
evidence that the state transition occurred.**

**Fix (not bundled into #857):** the no-argument and unknown-command paths should
print usage to stderr and `exit 1` or `exit 64` (`EX_USAGE`). Only a real,
completed deploy should exit 0.

**Explicitly out of scope for the #857 verification.** Logged here for separate
scheduling.
