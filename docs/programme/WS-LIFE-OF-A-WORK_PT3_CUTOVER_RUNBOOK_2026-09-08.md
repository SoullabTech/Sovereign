# PT-3 production cutover — runbook (repaired)

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §I–§X. Cutover authorized in principle;
bounded instrument repair authorized; the previous runbook's execution held.
**Executed by:** the founder, on the production host. ⛔ This session has no route to production.

> **Supersedes `dcce6f97`'s runbook**, which must not be run: it sourced its "immutable" snapshot
> from a mutable branch ref (§II).

---

## What was repaired, and one thing the repair found

| | Defect | Repair |
|---|---|---|
| **B3** | The snapshot was built from `origin/<branch>` — whatever occupied that name at execution time. Attribution without authorization. | `ACCEPTED_SHA` is **required, full 40 characters, and has no default**. The branch may be fetched so the object is local; it may not determine the tree. |
| **B4** | Verification was `grep '^20260908'` — proof about one date, not about the pending set. | The preflight computes **presented files minus production's `schema_migrations`** and requires the result to be exactly the PT-3 migration. Evaluated at execution time, never from an earlier observation. |
| **B5** | Adding `.env.production.runtime` does not remove `DATABASE_URL`; `.env.production` kept supplying it. | `docker-compose.pt3-cutover.yml` sets `DATABASE_URL: ""` as a **literal** (never `${DATABASE_URL:-}`, which would let a shell value flow back in) and supplies `MAIA_APP_DATABASE_URL` fail-closed. |
| **B6** | Four worker healthchecks ran `psql $DATABASE_URL`. Blanking it would mark correctly constrained workers unhealthy — pressuring someone mid-cutover to restore the owner credential to get a green container. | The health definition moves with the authority: those healthchecks now use `MAIA_APP_DATABASE_URL`. |
| **B7** | `ALTER ROLE … PASSWORD '$PW'` put the secret through shell interpolation. | `\password maia_app` — psql prompts and encodes it; the secret never becomes a shell or SQL argument. |

### ⭐ The repair found a fifth thing: the cutover set was three services too small

The ruling named four services, because the earlier verifier **asked about a hardcoded list of four**.
A compose audit shows **seven** ordinary runtime services inherit `.env.production` and use the
database:

```
maia · maia-api · rlm · maia-embed-worker · maia-comms-worker · maia-summary-worker · maia-media-worker
```

`maia-embed-worker`, `maia-summary-worker` and `maia-media-worker` were never in the observed set —
each with a `psql $DATABASE_URL` healthcheck, so each demonstrably uses the database. All seven are
covered by the override, and **both instruments now discover which containers possess the owner
credential rather than assuming a list.** §IX.4 of the prior ruling anticipated exactly this.

⚠️ **Also still true, and named so it is not discovered later:** `scripts/deploy-production.sh`
passes `-f "$COMPOSE_FILE"` alone, so **an ordinary deploy after cutover does not name the override
and hands the owner credential back to runtime.** Folding the override into the base compose is the
required follow-up act. Until then the post-cutover witness is what detects the reverted state.

---

## Step 0 — bring the checkout's compose forward

`cmd_migrate` reads `$PROJECT_DIR`'s compose, not the snapshot's, so the attribution passthrough must
be in the checkout or the migration records `commit=unknown` (§X abort).

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/writers-studio-experiences-afia8t
git checkout <ACCEPTED_SHA> -- docker-compose.production.yml
git diff --stat HEAD -- docker-compose.production.yml   # expect: only the migrate environment block
```

## Step 1 — preflight (§IX, ten conditions). Mutates nothing.

```bash
ACCEPTED_SHA=<full 40-char sha of the accepted repair commit>
ssh soullab@minisforum "ACCEPTED_SHA=$ACCEPTED_SHA sh -s" \
  < scripts/witness/pt3-cutover-preflight.sh
```

It refuses a missing SHA, a short SHA and a branch name; materializes the snapshot **from the SHA**;
removes the held Experiences migration; computes the complete pending set against production;
verifies the attribution passthrough, the runtime seam, healthcheck authority and the credential
step; lists every running container that possesses `DATABASE_URL` and whether the override covers it;
and prints the **§VII evidence record** — pinned commit, excluded migration, computed pending set,
PT-3 checksum, run id.

⛔ **`PREFLIGHT FAILED` ends the cutover.** It prints the exact `MAIA_BUILD_CONTEXT`, `GIT_COMMIT` and
`MIGRATION_RUN_ID` for Step 2; use those, not values of your own.

## Step 2 — the governed, attributed migration (§IX.1)

Run the three exports the preflight printed, then:

```bash
cd ~/MAIA-SOVEREIGN && scripts/deploy-production.sh migrate
```

**Verify before continuing:**

```bash
docker exec maia-postgres psql -U soullab maia_consciousness -tAc "
SELECT filename, applied_by_commit, applied_run_id, applied_by_authority, left(checksum,12)
  FROM schema_migrations WHERE filename LIKE '20260908%';
SELECT count(*) AS experience_tables FROM information_schema.tables
 WHERE table_name LIKE 'writer_experience%';"
```

⛔ Abort if `applied_by_commit` is null or `unknown`, if two rows appear, or if `experience_tables`
is not `0`.

**Expected backfill** — deviation is a finding: **11** representations (6 custodied, 5 legacy) ·
**17** acts, all `migration_legacy`, **0 carrying a member actor** · **5** `representation_without_arrival` ·
**0** multi-arrival rows · 2 blank Works and 2 unclaimed arrivals untouched.

## Step 3 — establish the credential (§IX.2, B7)

```bash
ssh -t soullab@minisforum 'docker exec -it maia-postgres psql -U soullab -d maia_consciousness'
```

then, inside psql:

```
\password maia_app
```

⛔ The password must not appear in shell history, command arguments, SQL, a file, migration history,
witness output, or the repository.

## Step 4 — the runtime credential, in Compose's interpolation file only (§IX.3)

```bash
umask 077
printf 'MAIA_APP_DATABASE_URL=postgresql://maia_app:%s@postgres:5432/maia_consciousness\n' '<password>' \
  >> ~/MAIA-SOVEREIGN/.env
```

⚠️ `~/MAIA-SOVEREIGN/.env` is **Compose's interpolation file**, not `.env.production`. It is read
when Compose renders the file and injected only where the override names it. ⛔ Do **not** put it in
`.env.production`, which every service loads.

## Step 5 — apply the seam and remove owner authority (§IX.4, §IX.6)

```bash
cd ~/MAIA-SOVEREIGN
cp <SNAP>/docker-compose.pt3-cutover.yml .          # <SNAP> from the preflight evidence block
docker compose -f docker-compose.production.yml -f docker-compose.pt3-cutover.yml \
  up -d --no-deps maia maia-api rlm \
                  maia-embed-worker maia-comms-worker maia-summary-worker maia-media-worker
```

Seven services. No `--build`. No other change — this is an authority cutover, not a deployment
opportunity. ⛔ `migrate` is deliberately not in the override and keeps owner authority (§IX.5).

## Step 6 — cutover verifier (§IX.7)

```bash
git show <ACCEPTED_SHA>:scripts/witness/pt3-cutover-readiness.sh | ssh soullab@minisforum 'sh -s'
```

Required: **`READY`**. `INCONCLUSIVE` is never success.

## Step 7 — post-cutover acceptance witness (§IX.8)

```bash
git show <ACCEPTED_SHA>:scripts/witness/pt3-post-cutover-witness.sh | ssh soullab@minisforum 'sh -s'
```

Production-safe by construction: no `INSERT`, `UPDATE` or `DELETE`, no fixture, no adversarial
mutation. Refusal is proven from the catalogue — grants, ownership, role membership, trigger presence.
Ordinary draft work is proven **by privilege**, never by writing to a member's draft.

It now **discovers** every database-using container instead of asking about a list, so a service left
behind — or a later deploy that reverted the cutover — shows up as a `DEFECT`.

---

## §VIII — the Experiences hold survives this cutover

After PT-3, `20260908000002_writer_experiences.sql` remains **pending and unapplied**, deliberately.

⛔ **A later ordinary `migrate` would pick it up.** Before any future production migration, the
pending set must be computed again, and if Experience deployment is still unauthorized the migration
must again be excluded or structurally withheld. PT-3 finishing authorizes nothing about it.

## §X abort conditions → where each is caught

| Condition | Caught by |
|---|---|
| tree differs from the reviewed artifact | Preflight §IX.1–2 (full SHA required) |
| a second migration pending | Preflight §IX.4 (computed set) |
| data shape inconsistent with the census | Step 2 backfill comparison |
| member-attributed history from legacy inference | Witness block 4 |
| a legacy representation hidden | Witness block 4 |
| competing Sources | census: zero multi-arrival Works |
| runtime still receives owner authority | Preflight coverage list · verifier · witness block 1 |
| `maia_app` can escalate | Witness block 2 (`rolsuper`, role membership) |
| app credential in the universal environment | Verifier |
| attribution absent | Step 2 verify · witness block 6 |
| verifier or witness DEFECT/INCONCLUSIVE | exit codes |

⛔ **Do not solve an unexpected production state by weakening the constitutional boundary.**

## §XI — the canonical sentence

Only when Step 7 returns `READY` may *PT-3 is enforced in code and not in production* become
**PT-3 is structurally enforced in production.** Encounter stays held until the post-cutover witness
is returned.
