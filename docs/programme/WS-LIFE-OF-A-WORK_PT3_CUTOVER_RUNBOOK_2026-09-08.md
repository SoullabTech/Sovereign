# PT-3 production cutover — runbook (repair 3)

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §XI. Instrument repair 3 authorized.
**Supersedes** the runbooks at `dcce6f97`, `e4207656` and `0819d749`; none is to be run.
**Executed on the production host.** ⛔ This session has no route to production.

> **Every command below is labelled `[MAC]` or `[PROD]`.** B9 was caused by changing one machine's
> checkout and then testing another machine's — a modification does not travel with an SSH connection.

---

## What repair 3 changed

| | Defect | Repair |
|---|---|---|
| **B13** | ⭐ **Hard blocker.** Step 3 ran `ALTER ROLE maia_app` before Step 4's migration, which is the act that **creates** that role (`20260908000001`, line 38). The documented cutover could not complete in its order. | The single installer is **split in two, on opposite sides of the migration**. Staging preserves migration authority and touches nothing else; activation **refuses to run until `maia_app` exists**. |
| **B14** | The preflight *noted* a missing `MIGRATE_DATABASE_URL` and continued toward `PREFLIGHT PASSED` — a false green, since the canonical Compose now sources migrate's credential from it. | The preflight proves the **artifact** and reports phase state without judging it. Readiness is a separate, **fail-closed** verifier that resolves the value **through Compose**, so it answers what the migrate service will actually receive. |
| **B15** | The installer proved source and destination were gitignored, then created a third secret-bearing file whose status it never proved. | The backup moves **outside the repository** to a mode-700 directory, mode-600 file, and activation **refuses** if that path is inside the repo. ⚠️ *Precision: `.gitignore:303` is `.env*`, which does cover `.env.production.pt3-backup` — so it was not in fact committable. The defect was the unproven claim, and the repair is better regardless.* |
| **B16** | The optional prompted password was interpolated into `ALTER ROLE … PASSWORD '<pw>'`. **stdin-safe is not SQL-literal-safe**, and percent-encoding the URI afterwards does nothing about a quote inside the statement. | The arbitrary-password path is **removed**. The credential is a generated 40-character hex string — SQL-literal-safe and URI-safe by construction, validated before use. The class of defect is eliminated rather than escaped around. |
| **B17** | The production checkout was mutated in Step 1 and the "pre-mutation" preflight ran in Step 2; an abort would leave the checkout altered for a later deploy to consume. | **Prove, then change.** The preflight reads the accepted SHA's Compose **out of the snapshot**; bringing the production checkout forward is the first bounded act *after* it passes. |

Carried unchanged from repair 2: the durable Compose architecture (no optional overlay), full-SHA
attribution, the complete pending-set proof, the Experiences hold, discovery-based runtime witnessing,
and every production-safe post-cutover check.

### The temporal law this encodes

```
preserve migration authority → create constrained role → credential it →
remove owner runtime authority → restart runtime
```

Owner runtime authority stays intact until the migration has safely completed. Runtime authority
moves only after the constrained role exists.

---

## Step 0 · `[MAC]` — verify the artifact before pinning

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/writers-studio-experiences-afia8t
ACCEPTED_SHA=<full 40-char sha>
git ls-tree -r --name-only "$ACCEPTED_SHA" | grep -E 'pt3-(cutover-preflight|stage-migration-authority|verify-migration-authority|activate-runtime-authority|post-cutover-witness|cutover-readiness)'
git show "$ACCEPTED_SHA":docker-compose.production.yml | grep -c 'MIGRATE_DATABASE_URL'
```

Six scripts, non-zero count. ⛔ Otherwise the artifact is incomplete.

## Step 1 · `[PROD]` — immutable preflight. Mutates nothing, on any host.

```bash
ssh soullab@minisforum "ACCEPTED_SHA=$ACCEPTED_SHA sh -s" < scripts/witness/pt3-cutover-preflight.sh
```

Refuses a missing, short or branch-shaped SHA; materializes the snapshot from the SHA; removes the
held Experiences migration; computes the **complete pending set** against production; verifies the
accepted tree's Compose, the two-phase scripts, and the credential properties; lists every container
possessing `DATABASE_URL`; prints the **§VII evidence record**.

⛔ `PREFLIGHT FAILED` ends the cutover — **and nothing on production has been touched.**

## Step 2 · `[PROD]` — stage migration authority only

```bash
ssh soullab@minisforum 'sh -s' < scripts/witness/pt3-stage-migration-authority.sh
```

Copies the owner URL into `.env` as `MIGRATE_DATABASE_URL`. ⛔ Leaves `DATABASE_URL` in
`.env.production`, does not touch `maia_app` (it does not exist), restarts nothing.

## Step 3 · `[PROD]` — bring the canonical Compose forward

```bash
ssh soullab@minisforum "cd ~/MAIA-SOVEREIGN \
  && git fetch -q origin claude/writers-studio-experiences-afia8t \
  && git checkout $ACCEPTED_SHA -- docker-compose.production.yml \
  && git diff --stat HEAD -- docker-compose.production.yml"
```

`cmd_migrate` reads production's checkout, so it must be forward before the migration consumes it —
and only now, after the preflight passed.

## Step 4 · `[PROD]` — migration-authority verifier (fail-closed)

```bash
ssh soullab@minisforum 'sh -s' < scripts/witness/pt3-verify-migration-authority.sh
```

Required: **`MIGRATION READY`**. It resolves the credential through Compose, reports the **role**
never the URL, and expects `maia_app` **not** to exist yet.

## Step 5 · `[PROD]` — the governed, attributed migration

Run the three exports the preflight printed — `GIT_COMMIT` is the **full 40 characters** — then:

```bash
cd ~/MAIA-SOVEREIGN && scripts/deploy-production.sh migrate
```

**Verify:**

```bash
docker exec maia-postgres psql -U soullab maia_consciousness -tAc "
SELECT filename, applied_by_commit, applied_run_id, applied_by_authority, left(checksum,12)
  FROM schema_migrations WHERE filename LIKE '20260908%';
SELECT count(*) FROM information_schema.tables WHERE table_name LIKE 'writer_experience%';
SELECT count(*) FROM pg_roles WHERE rolname='maia_app';"
```

⛔ Abort unless: one row, full 40-char commit, **0** Experience tables, **1** `maia_app`.

**Expected backfill** — deviation is a finding: **11** representations (6 custodied, 5 legacy) ·
**17** acts, all `migration_legacy`, **0** with a member actor · **5** `representation_without_arrival` ·
**0** multi-arrival · 2 blank Works and 2 unclaimed arrivals untouched.

## Step 6 · `[PROD]` — activate runtime authority (only now)

```bash
ssh soullab@minisforum 'sh -s' < scripts/witness/pt3-activate-runtime-authority.sh
```

Refuses unless `maia_app` exists and is not a superuser; generates the credential; sets it on stdin;
backs up `.env.production` **outside the repository** at mode 700/600; writes
`MAIA_APP_DATABASE_URL` and removes the owner `DATABASE_URL`. Prints the role and file modes only.

## Step 7 · `[PROD]` — restart runtime

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && \
  docker compose -f docker-compose.production.yml up -d --no-deps \
    maia maia-api rlm maia-embed-worker maia-comms-worker maia-summary-worker maia-media-worker'
```

One compose file — there is nothing else to name. No `--build`.

## Step 8 · `[MAC→PROD]` — readiness verifier, then the post-cutover witness

```bash
git show "$ACCEPTED_SHA":scripts/witness/pt3-cutover-readiness.sh    | ssh soullab@minisforum 'sh -s'
git show "$ACCEPTED_SHA":scripts/witness/pt3-post-cutover-witness.sh | ssh soullab@minisforum 'sh -s'
```

Both must return **`READY`**. `INCONCLUSIVE` is never success. The witness is production-safe — no
`INSERT`, `UPDATE` or `DELETE`, no fixture, no adversarial mutation; refusal is proven from the
catalogue and ordinary draft work by privilege. Block 7 proves durability.

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

Only when Step 7 returns `READY` — including block 7 — may *PT-3 is enforced in code and not in
production* become **PT-3 is structurally enforced in production**. Because durability is now proven
in the same witness, the §VIII hold on ordinary deployment closes with it rather than outliving it.
Encounter stays held until the post-cutover witness is returned.
