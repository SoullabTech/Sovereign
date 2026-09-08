# PT-3 production cutover — runbook

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §IX. Bounded production cutover authorized.
**Executed by:** the founder, from the Mac Studio. ⛔ **This session cannot execute it** — no `ssh`
binary, no route to the LAN. Everything below is prepared so the run is exact.

> **Scope (§XII):** the PT-3 authority transition only. Not Encounter, Restore, hierarchy, intention
> authority, lineage, Experience deployment, unrelated schema, or unrelated application deployment.

---

## ⚠️ Two blockers found preparing this. Both would have tripped §X.

### B1 — the governed migrate path would also have applied the Experiences migration

`cmd_migrate` mounts `${MAIA_BUILD_CONTEXT:-.}/database/migrations` and the runner applies **every**
pending file it finds. Two are pending: `20260908000001_pt3_source_custody_enforcement.sql` and
`20260908000002_writer_experiences.sql`. **§XII does not authorize Experience deployment**, so an
ordinary `deploy-production.sh migrate` would have breached the ruling that authorized it.

⭐ This is the 2026-09-07 structural finding again: *merging a migration to the deployable branch
authorizes whoever migrates next to apply it.*

**Resolved without leaving the governed path.** `cmd_migrate` neither sets nor resets
`MAIA_BUILD_CONTEXT`, so an exported value passes through to compose. Step 1 therefore materializes
an immutable snapshot, **removes the Experiences migration from that snapshot**, and points the
governed path at it. The lane lock, the attributing runner and the ledger all still apply. The
snapshot is a temp directory; production's branch is untouched.

### B2 — attribution could not have reached the migrate container

The `migrate` service had **no `environment:` block**, only `env_file: .env.production`. An exported
`GIT_COMMIT` never crossed the container boundary, so the runner would have recorded
`applied_by_commit = 'unknown'` — **§X's "migration attribution is absent" abort condition**, tripped
by the very step meant to satisfy §IX.1.

**Fixed** in `docker-compose.production.yml`: the migrate service now receives `GIT_COMMIT` and
`MIGRATION_RUN_ID`, with empty defaults so it is inert when unset. Neither is a secret; they are the
two facts that make an owner-level schema act attributable.

⚠️ **`COMPOSE_FILE` is the CHECKOUT's compose file, not the snapshot's**, so the checkout must carry
that fix before step 1. The runner, by contrast, is mounted from the snapshot and arrives with it.

---

## Step 0 — bring the checkout's compose file forward (required by B2)

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/writers-studio-experiences-afia8t
git checkout origin/claude/writers-studio-experiences-afia8t -- docker-compose.production.yml
git diff --stat HEAD -- docker-compose.production.yml    # expect: only the migrate environment block
```

One file, additive, inert when unset. It leaves the working tree differing from its branch until the
branch merges — noted deliberately rather than left to be discovered.

## Step 1 — apply the PT-3 migration through the governed path (§IX.1)

```bash
ssh soullab@minisforum bash -s <<'REMOTE'
set -euo pipefail
cd ~/MAIA-SOVEREIGN
git fetch origin claude/writers-studio-experiences-afia8t
SHA=$(git rev-parse --short origin/claude/writers-studio-experiences-afia8t)

SNAP=$(mktemp -d /tmp/pt3-cutover.XXXXXX)
git archive origin/claude/writers-studio-experiences-afia8t | tar -x -C "$SNAP"

# §XII — Experience deployment is NOT authorized. It leaves this snapshot.
rm -f "$SNAP/database/migrations/20260908000002_writer_experiences.sql"

echo "pending 2026-09-08 migrations in the snapshot (must be exactly one):"
ls "$SNAP/database/migrations/" | grep '^20260908'

export MAIA_BUILD_CONTEXT="$SNAP"
export GIT_COMMIT="$SHA"
export MIGRATION_RUN_ID="pt3-cutover-$(date -u +%Y%m%dT%H%M%SZ)"
echo "commit=$GIT_COMMIT run=$MIGRATION_RUN_ID"

scripts/deploy-production.sh migrate
REMOTE
```

**Verify before continuing** — attribution present, and no Experience table created:

```bash
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -tAc \"
SELECT filename, applied_by_commit, applied_run_id, applied_by_authority, left(checksum,12)
  FROM schema_migrations WHERE filename LIKE '20260908%';
SELECT count(*) AS experience_tables FROM information_schema.tables
 WHERE table_name LIKE 'writer_experience%';\""
```

⛔ **Abort if** `applied_by_commit` is null or `unknown`, if two rows appear, or if
`experience_tables` is not `0`.

**Expected backfill, from the accepted census** — any deviation is a finding:

| | |
|---|---|
| representations | **11** — 6 `source_custodied`, 5 `legacy_interpreted_import` |
| lifecycle acts | **17** — all `migration_legacy`, **0 carrying a member actor** |
| reconciliation rows | **5** `representation_without_arrival`, **0** multi-arrival |
| untouched | 2 blank Works · 2 unclaimed arrivals |

## Step 2 — establish `maia_app`'s credential out of band (§IX.2)

```bash
ssh soullab@minisforum
read -rs -p 'maia_app password: ' PW && echo
docker exec -e PW="$PW" maia-postgres psql -U soullab -d maia_consciousness \
  -c "ALTER ROLE maia_app WITH LOGIN PASSWORD '$PW';"
unset PW
```

⛔ **Never** put this in a migration, in source control, in a document, or in witness output. The
migration deliberately mints no password.

## Steps 3–5 — the runtime seam, and keeping the two authorities apart (§IX.3–5)

Create a **runtime-only** env file — not `.env.production`, which every service loads:

```bash
umask 077
cat > ~/MAIA-SOVEREIGN/.env.production.runtime <<'EOF2'
MAIA_APP_DATABASE_URL=postgresql://maia_app:<password>@postgres:5432/maia_consciousness
EOF2
```

Then, for **`maia`, `maia-api`, `comms-worker`, `rlm` only**, add that file to `env_file:` and remove
`DATABASE_URL` from their environment. `migrate` keeps `.env.production` and does **not** receive the
runtime file — §IX.5: runtime and migration authority must stay distinguishable.

⛔ Do not add `MAIA_APP_DATABASE_URL` to `.env.production`.

## Step 6 — restart only what activates the credential (§IX.6)

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && \
  docker compose -f docker-compose.production.yml up -d --no-deps \
    maia maia-api comms-worker rlm'
```

⚠️ An authority cutover, not a deployment opportunity. No `--build`, no other change. ⛔ Note that a
bare `up` takes **no lane lock and runs no provenance verify** (the 2026-09-07 finding) — acceptable
here only because no image changes.

## Step 7 — re-run the cutover verifier (§IX.7)

```bash
git show origin/claude/writers-studio-experiences-afia8t:scripts/witness/pt3-cutover-readiness.sh \
  | ssh soullab@minisforum 'sh -s'
```

Required: **`READY`**. `NOT YET CUT OVER` means a service still lacks the credential or still holds
the owner's. `INCONCLUSIVE` is never success.

## Step 8 — the post-cutover acceptance witness (§IX.8)

```bash
git show origin/claude/writers-studio-experiences-afia8t:scripts/witness/pt3-post-cutover-witness.sh \
  | ssh soullab@minisforum 'sh -s'
```

⭐ **Production-safe by construction.** It issues **no** INSERT, UPDATE or DELETE, creates no fixture,
and runs no adversarial mutation against member data. Per §IX.8, refusal is proven from the
**catalogue** — grants, ownership, role membership, trigger presence — since the destructive
falsifier was already proven on disposable infrastructure.

One deliberate narrowing: it proves *ordinary draft work remains possible* **by privilege**
(`INSERT`/`UPDATE` on all three descendant tables), **not** by writing to a member's draft. Writing
would demonstrate more and cost more than the ruling permits.

Six blocks: runtime runs as `maia_app` · protected Source unmutable by ordinary authority · the seam
still available · the backfill matched prediction and laundered nothing · lawful work intact · the
schema act attributable and **no Experience table present**.

---

## §X abort conditions, and where each is caught

| Abort condition | Caught by |
|---|---|
| data shape inconsistent with the census | Step 1 backfill comparison |
| backfill creates member-attributed history from legacy inference | Step 8 block 4 (`actor_member_id IS NOT NULL` on a `migration_legacy` act) |
| a legacy representation would be hidden | Step 8 block 4 (sections with no operative representation) |
| migration must choose between competing Sources | census: **zero** multi-arrival Works |
| runtime still receives owner authority | Steps 7 and 8 block 1 |
| `maia_app` can escalate | Step 8 block 2 (`rolsuper`, role membership) |
| app credential in the universal environment | Step 7 |
| attribution absent for the new migration | Step 1 verify, Step 8 block 6 |
| verifier reports DEFECT or INCONCLUSIVE | Steps 7 and 8 exit codes |

⛔ **Do not solve an unexpected production state by weakening the constitutional boundary.** Stop and
return the evidence.

## §XI — when the canonical sentence may change

Only when Step 8 returns `READY` may

> *PT-3 is enforced in code and not in production*

become

> **PT-3 is structurally enforced in production.**

Until then the first sentence stands. After cutover, return the post-cutover witness before Encounter
opens (§XII).
