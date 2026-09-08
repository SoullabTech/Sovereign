# PT-3 production cutover — runbook (repair 4)

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §XI. Instrument repair 4 authorized (§IX).
**Supersedes** the runbooks at `dcce6f97`, `e4207656`, `0819d749` and `ceee18cc`; none is to be run.
**Executed on the production host.** ⛔ This session has no route to production.

> **Every command below is labelled `[MAC]` or `[PROD]`.** B9 was caused by changing one machine's
> checkout and then testing another machine's — a modification does not travel with an SSH connection.

---

## What repair 4 changed

| | Defect | Repair |
|---|---|---|
| **B18** | ⭐ **The success condition was internally impossible.** `pt3-cutover-readiness.sh` still governed the *superseded* design: it called `MAIA_APP_DATABASE_URL` in `.env.production` a **defect** and hardcoded four service names — yet the runbook required it to return `READY` after a cutover that establishes exactly that architecture. | Rewritten to the constituted model: authority **discovered by possession**, the constrained credential in `.env.production` is the **durable design**, owner authority there is a defect after activation, migration authority stays separate in `.env`, and no overlay may exist. `READY` only when the real topology satisfies it. |
| **B19** | The runbook pinned the tree, then invoked preflight, staging, verification and activation **from the Mac Studio's current checkout** — so the scripts that stage credentials and move authority could come from whatever was in the shared checkout. B3's defect, one level down. | **Every** executed script is now piped from `git show "$ACCEPTED_SHA":…`. No branch checkout on the Mac. Only production's Compose is brought forward, because the governed migrate path consumes the production-host checkout. |
| **B20** | The verifier accepted **any** non-empty resolved credential as `MIGRATION READY`, printing the role without requiring it. A mistakenly staged constrained credential would have read as ready. An unexpected pre-existing `maia_app` produced only a `NOTE`. | The resolved role must **equal the protected tier's actual owner** — derived from `pg_tables`, not a hardcoded `soullab`, so the check follows the boundary. A pre-existing `maia_app` is now `ABORT — RECONCILIATION REQUIRED`. |
| **B21** | Activation edits `.env.production`, but a **running** container keeps its old environment until recreated. The runbook recreated seven remembered services while the witness defines the set by possession — and fourteen services load that file, so caddy, oldhead, demo or palisades could keep the owner URL and fail the final witness. | A discovery script recreates **exactly the containers that possess owner authority**, then **re-discovers** and requires none to remain. Execution now follows the same law as the witness, instead of a list one size larger than the last stale list. |
| **§VII** | The migration step relied on the operator inferring the host from a `[PROD]` heading, though the snapshot path is a production-host `/tmp/…`. | The migration is given as an explicit production-host command carrying the three non-secret values preflight returns. |
| **§VIII** | The closing paragraph said "Step 7 returns READY"; Step 7 is the restart. | Corrected — acceptance is the **two `READY` witnesses**. |

Carried unchanged: the temporal law, the two-phase authority split, generated-credential safety,
backup custody outside the repository, prove-before-change, durable Compose with no overlay,
full-SHA attribution, the complete pending-set proof, and the Experiences hold.

---

## Step 0 · `[MAC]` — verify the artifact before pinning

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/writers-studio-experiences-afia8t
ACCEPTED_SHA=<full 40-char sha>
git ls-tree -r --name-only "$ACCEPTED_SHA" | grep -E 'pt3-(cutover-preflight|stage-migration-authority|verify-migration-authority|activate-runtime-authority|recreate-credential-bearing-runtime|cutover-readiness|post-cutover-witness)'
git show "$ACCEPTED_SHA":docker-compose.production.yml | grep -c 'MIGRATE_DATABASE_URL'
```

Seven scripts, non-zero count. ⛔ Otherwise the artifact is incomplete.

> **B19 — every step below pipes its script from `$ACCEPTED_SHA`.** Nothing executes from a working
> checkout. Set `ACCEPTED_SHA` once and it governs the whole run.

## Step 1 · `[MAC→PROD]` — immutable preflight. Mutates nothing, on any host.

```bash
git show "$ACCEPTED_SHA":scripts/witness/pt3-cutover-preflight.sh \
  | ssh soullab@minisforum "ACCEPTED_SHA=$ACCEPTED_SHA sh -s"
```

⛔ `PREFLIGHT FAILED` ends the cutover — and **nothing on production has been touched.**
Record its **§VII evidence block**: `MAIA_BUILD_CONTEXT`, full `GIT_COMMIT`, `MIGRATION_RUN_ID`.

## Step 2 · `[MAC→PROD]` — stage migration authority only

```bash
git show "$ACCEPTED_SHA":scripts/witness/pt3-stage-migration-authority.sh | ssh soullab@minisforum 'sh -s'
```

⛔ Leaves `DATABASE_URL` in `.env.production`, touches no role, restarts nothing.

## Step 3 · `[MAC→PROD]` — bring the canonical Compose forward

```bash
ssh soullab@minisforum "cd ~/MAIA-SOVEREIGN \
  && git fetch -q origin claude/writers-studio-experiences-afia8t \
  && git checkout $ACCEPTED_SHA -- docker-compose.production.yml \
  && git diff --stat HEAD -- docker-compose.production.yml"
```

The one file that must exist on production's checkout, because `cmd_migrate` reads it.

## Step 4 · `[MAC→PROD]` — migration-authority verifier (fail-closed)

```bash
git show "$ACCEPTED_SHA":scripts/witness/pt3-verify-migration-authority.sh | ssh soullab@minisforum 'sh -s'
```

Required: **`MIGRATION READY`**. It requires the resolved role to **be** the protected tier's owner,
and **aborts** if `maia_app` already exists.

## Step 5 · `[PROD]` — the governed, attributed migration (§VII, host-explicit)

The snapshot lives on the production host. Substitute the three values preflight printed — none is
a secret:

```bash
ssh soullab@minisforum bash -lc "'
  export MAIA_BUILD_CONTEXT=<SNAP from preflight>
  export GIT_COMMIT=<full 40-char sha from preflight>
  export MIGRATION_RUN_ID=<run id from preflight>
  cd ~/MAIA-SOVEREIGN && scripts/deploy-production.sh migrate
'"
```

**Verify:**

```bash
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -tAc \"
SELECT filename, applied_by_commit, applied_run_id, applied_by_authority, left(checksum,12)
  FROM schema_migrations WHERE filename LIKE '20260908%';
SELECT count(*) FROM information_schema.tables WHERE table_name LIKE 'writer_experience%';
SELECT count(*) FROM pg_roles WHERE rolname='maia_app';\""
```

⛔ Abort unless: **one** row, **full 40-character** commit, **0** Experience tables, **1** `maia_app`.

**Expected backfill** — deviation is a finding: **11** representations (6 custodied, 5 legacy) ·
**17** acts, all `migration_legacy`, **0** with a member actor · **5** `representation_without_arrival` ·
**0** multi-arrival · 2 blank Works and 2 unclaimed arrivals untouched.

## Step 6 · `[MAC→PROD]` — activate runtime authority (only now)

```bash
git show "$ACCEPTED_SHA":scripts/witness/pt3-activate-runtime-authority.sh | ssh soullab@minisforum 'sh -s'
```

Refuses unless `maia_app` exists and is non-superuser. Generates the credential, sets it on stdin,
backs `.env.production` up **outside the repository**, writes `MAIA_APP_DATABASE_URL`, removes owner
`DATABASE_URL`. Prints the role and file modes only.

## Step 7 · `[MAC→PROD]` — recreate whatever possesses owner authority (B21)

```bash
git show "$ACCEPTED_SHA":scripts/witness/pt3-recreate-credential-bearing-runtime.sh | ssh soullab@minisforum 'sh -s'
```

Discovers the containers that actually hold `DATABASE_URL`, recreates exactly those, then
re-discovers and requires none to remain. ⛔ Not a service list — the same law the witness applies.

## Step 8 · `[MAC→PROD]` — the two acceptance witnesses

```bash
git show "$ACCEPTED_SHA":scripts/witness/pt3-cutover-readiness.sh    | ssh soullab@minisforum 'sh -s'
git show "$ACCEPTED_SHA":scripts/witness/pt3-post-cutover-witness.sh | ssh soullab@minisforum 'sh -s'
```

**Both must return `READY`.** They now describe the same architecture, so both can truthfully do so.
`INCONCLUSIVE` is never success. The post-cutover witness is production-safe — no `INSERT`, `UPDATE`
or `DELETE`, no fixture, no adversarial mutation; refusal proven from the catalogue, ordinary draft
work proven by privilege, and block 7 proves durability.

## §IX — the Experiences hold survives

`20260908000002_writer_experiences.sql` stays pending and unapplied. ⛔ **A later ordinary `migrate`
would apply it.** Before any future production migration the lane must compute
**pending ∩ authorized**, never treat *pending* as *authorized*. PT-3 finishing authorizes nothing
about it. A permanent migration-selection mechanism may be constituted separately; for this cutover,
explicit exclusion plus the complete pending-set proof is the discipline.

## §X abort conditions → where caught

| Condition | Caught by |
|---|---|
| tree differs from the reviewed artifact | Step 0 · preflight §IX.1–2 (full SHA, no default) |
| a second migration pending | preflight §IX.4 (computed set) |
| data shape inconsistent with the census | Step 4 backfill comparison |
| member-attributed history from legacy inference | witness block 4 |
| a legacy representation hidden | witness block 4 |
| competing Sources | census: zero multi-arrival Works |
| runtime still receives owner authority | preflight coverage list · verifier · witness blocks 1 and 7 |
| `maia_app` can escalate | witness block 2 |
| app credential in the universal environment | ⭐ inverted: `.env.production` is now *where the constrained credential belongs*, and the **owner** credential's presence there is the defect — witness block 7 |
| attribution absent | Step 4 verify · witness block 6 |
| DEFECT or INCONCLUSIVE | exit codes |

⛔ **Do not solve an unexpected production state by weakening the constitutional boundary.**

## §XI — the canonical sentence

Only when **both Step 8 witnesses** return `READY` — including the post-cutover witness's durability block — may *PT-3 is enforced in code and not in
production* become **PT-3 is structurally enforced in production**. Because durability is now proven
in the same witness, the §VIII hold on ordinary deployment closes with it rather than outliving it.
Encounter stays held until the post-cutover witness is returned.
