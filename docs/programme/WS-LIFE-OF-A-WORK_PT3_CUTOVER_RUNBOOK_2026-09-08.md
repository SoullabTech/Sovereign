# PT-3 production cutover — runbook (repair 2)

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §I–§XII. Instrument repair 2 authorized.
**Supersedes** the runbooks at `dcce6f97` and `e4207656`; neither is to be run.
**Executed on the production host.** ⛔ This session has no route to production.

> **Every command below is labelled `[MAC]` or `[PROD]`.** B9 was caused by changing one machine's
> checkout and then testing another machine's — a modification does not travel with an SSH connection.

---

## What repair 2 changed

| | Defect | Repair |
|---|---|---|
| **B8** | `docker-compose.pt3-cutover.yml` was absent from the pinned tree — the preflight required a file the artifact did not contain. **Cause: `.gitignore:145` matches `docker-compose.*.yml`**, so `git add -A` silently swallowed it and I asserted completeness without checking the commit. | The overlay is **deleted**, not re-added. See B12 — it was the wrong mechanism, and its disappearance is what exposed that. |
| **B9** | Step 0 edited the Mac Studio checkout; the preflight then tested `$HOME/MAIA-SOVEREIGN` on production. | Compose is brought forward **on the production host**, from the accepted SHA, and the preflight verifies it there. Every command is host-labelled. |
| **B10** | Step 3 said "never in shell history", then Step 4 had the operator type the password into a `printf`. Raw interpolation into a URI could also corrupt the connection string. | `scripts/witness/pt3-install-runtime-credential.sh`: non-echoing (or generated, URI-safe by construction), delivered to psql **on stdin**, percent-encoded, written only to gitignored files at mode 600, and it prints the **role**, never the password or URL. |
| **B11** | The preflight required a full 40-character SHA and then `cut -c1-9` before attribution. | `applied_by_commit` is `TEXT`; all 40 characters are stored. The short form is printed alongside, never instead. |
| **B12** | An ordinary deploy passes `-f "$COMPOSE_FILE"` alone, so the next routine deployment would have omitted the overlay and handed owner authority back to runtime. | ⭐ **Closed structurally — see below.** |

### ⭐ B12: the boundary is now a property of the file every service already loads

There is **no overlay**. `.env.production` is loaded by all fourteen services. After cutover it
carries the **constrained** credential and **no owner credential**, so every ordinary runtime service
loses owner authority by loading the file it has always loaded. `migrate` alone gets the owner
credential back, from `~/MAIA-SOVEREIGN/.env` — Compose's own interpolation file, which is not
injected into containers.

**The failure mode is inverted on purpose.** Forget `MIGRATE_DATABASE_URL` and *migration* fails,
loudly. Nothing that can be forgotten weakens the boundary, because there is no second file to name.

Two base-compose edits carry it, and **both are inert until the credential moves**:

- `migrate` gains `DATABASE_URL: ${MIGRATE_DATABASE_URL:-}`.
- The four worker healthchecks become `psql "${MAIA_APP_DATABASE_URL:-$DATABASE_URL}"` — constrained
  when present, owner while it is not. §VI's trap is closed: no one is ever pressured to restore
  owner authority to make a container green.

---

## Step 0 · `[MAC]` — verify the artifact you are about to pin

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/writers-studio-experiences-afia8t
ACCEPTED_SHA=<full 40-char sha>
git ls-tree -r --name-only "$ACCEPTED_SHA" | grep -E 'pt3-(cutover-preflight|post-cutover-witness|install-runtime-credential|cutover-readiness)'
git show "$ACCEPTED_SHA":docker-compose.production.yml | grep -c 'MIGRATE_DATABASE_URL'
```

Four scripts, and a non-zero count. ⛔ If either fails, the artifact is incomplete — stop.

## Step 1 · `[PROD]` — bring the production checkout's compose forward

`cmd_migrate` reads **production's** `$PROJECT_DIR` compose, not the snapshot's.

```bash
ssh soullab@minisforum "cd ~/MAIA-SOVEREIGN \
  && git fetch -q origin claude/writers-studio-experiences-afia8t \
  && git checkout $ACCEPTED_SHA -- docker-compose.production.yml \
  && git diff --stat HEAD -- docker-compose.production.yml"
```

Expect only the migrate `environment:` block and the four healthchecks.

## Step 2 · `[PROD]` — preflight (§IX, ten conditions). Mutates nothing.

```bash
ssh soullab@minisforum "ACCEPTED_SHA=$ACCEPTED_SHA sh -s" \
  < scripts/witness/pt3-cutover-preflight.sh
```

It refuses a missing, short, or branch-shaped SHA; materializes the snapshot **from the SHA**;
removes the held Experiences migration; computes the **complete pending set** against production;
verifies the attribution passthrough, the authority separation, healthcheck authority, the absence
of any optional overlay, and the credential installer's properties; lists every running container
possessing `DATABASE_URL`; and prints the **§VII evidence record**.

⛔ `PREFLIGHT FAILED` ends the cutover. Use the exports it prints — including the **full** SHA.

## Step 3 · `[PROD]` — install the credential and move the authority (§V)

```bash
ssh -t soullab@minisforum 'sh -s' < scripts/witness/pt3-install-runtime-credential.sh
```

Generates a URI-safe credential (or `PT3_PROMPT_FOR_PASSWORD=1` to type one, unechoed), sets it via
stdin, moves the owner URL out of `.env.production` into `.env` as `MIGRATE_DATABASE_URL`, writes
`MAIA_APP_DATABASE_URL` into `.env.production` at mode 600, keeps a backup, and prints the role only.

⛔ It refuses to run if either destination is not gitignored.

## Step 4 · `[PROD]` — the governed, attributed migration (§IX.1)

Run the three exports the preflight printed, then:

```bash
cd ~/MAIA-SOVEREIGN && scripts/deploy-production.sh migrate
```

**Verify before continuing** — full SHA recorded, exactly one row, zero Experience tables:

```bash
docker exec maia-postgres psql -U soullab maia_consciousness -tAc "
SELECT filename, applied_by_commit, applied_run_id, applied_by_authority, left(checksum,12)
  FROM schema_migrations WHERE filename LIKE '20260908%';
SELECT count(*) FROM information_schema.tables WHERE table_name LIKE 'writer_experience%';"
```

**Expected backfill** — deviation is a finding: **11** representations (6 custodied, 5 legacy) ·
**17** acts, all `migration_legacy`, **0** with a member actor · **5** `representation_without_arrival` ·
**0** multi-arrival · 2 blank Works and 2 unclaimed arrivals untouched.

## Step 5 · `[PROD]` — restart runtime to pick up the new authority (§IX.6)

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && \
  docker compose -f docker-compose.production.yml up -d --no-deps \
    maia maia-api rlm maia-embed-worker maia-comms-worker maia-summary-worker maia-media-worker'
```

One compose file — there is nothing else to name. No `--build`, no other change.

## Step 6 · `[MAC→PROD]` — cutover verifier (§IX.7)

```bash
git show "$ACCEPTED_SHA":scripts/witness/pt3-cutover-readiness.sh | ssh soullab@minisforum 'sh -s'
```

Required: **`READY`**. `INCONCLUSIVE` is never success.

## Step 7 · `[MAC→PROD]` — post-cutover acceptance witness (§IX.8)

```bash
git show "$ACCEPTED_SHA":scripts/witness/pt3-post-cutover-witness.sh | ssh soullab@minisforum 'sh -s'
```

Production-safe: no `INSERT`, `UPDATE` or `DELETE`, no fixture, no adversarial mutation. Refusal is
proven from the catalogue; ordinary draft work is proven **by privilege**, never by writing to a
member's draft. It **discovers** every database-using container, and block 7 proves durability —
owner credential gone from `.env.production`, constrained credential present, no overlay.

---

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
