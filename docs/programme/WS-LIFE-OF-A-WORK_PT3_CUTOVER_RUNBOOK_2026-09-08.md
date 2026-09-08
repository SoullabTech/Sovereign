# PT-3 production cutover — runbook (repair 7, orchestrated)

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §IX (B39–B40), on top of §IX (B34–B38) and §XIV.
**Supersedes** every earlier runbook (`dcce6f97`, `e4207656`, `0819d749`, `ceee18cc`, repair 4's
eight-step manual sequence, and repairs 5–6); none is to be run.
**Executed on the production host.** ⛔ This session has no route to production.

---

## ⭐ What repair 5 changed: the cutover is one act, not eight

| | Defect | Repair |
|---|---|---|
| **B29** | The eight steps were **eight separate operator acts**, each acquiring and releasing its own authority, with the outage window defined by nothing. Between any two, an ordinary deploy could enter the lane and build a different SHA on top of a half-migrated database. | `scripts/pt3-cutover.sh` holds **one** `acquire_deploy_lock "pt3-cutover"` across the whole sequence. The lane is closed from the first act to the last, and the kernel releases it when the process tree exits — a crashed cutover cannot wedge it. |
| **B30** | Quiescence began before the image existed, so the outage covered the **build**. | The image is built at step 3, **prepared and not started**, before step 4 quiesces. The outage is the migration and the swap, not the compile. |
| **B31** | Two scripts could each release the runtime; a partial failure could reopen member writes onto a half-migrated schema. | **One** release act exists (step 9). Every failure path calls `die_quiesced()`, which leaves the runtime stopped and says so. |
| **B32** | The backfill was compared to the census in the **post-cutover** witness — after release, when the numbers had already begun to move with lawful member use. | `scripts/witness/pt3-verify-backfill.sh` asserts the exact counts at step 7, **while quiesced, before any member can write**. If the backfill is wrong the runtime never reopens. The post-cutover witness now tests **invariants**, so it stays true forever instead of failing on the first lawful import. |
| **B33.A** | `deploy-production.sh setup` generated `POSTGRES_PASSWORD` into `.env.production` and rewrote the owner `DATABASE_URL` from it — so `setup` was the act that handed the whole runtime owner authority, and would have silently reconstructed the defect this cutover removes. | Owner material is generated straight into `.env.postgres` and `.env.migrate` (mode 600); `setup` strips owner keys from `.env.production` and refuses to touch anything once custody exists. |
| **B33.B** | The constitutional verifiers were invoked as `DATABASE_URL="$DATABASE_URL" …`. Post-cutover that forwards an **empty string**, and each verifier falls back to its local default — a green run against the wrong database. | Every `verify-constitution-*.ts` reads `MAIA_APP_DATABASE_URL` first; the harness forwards whichever the runtime holds; the documented command forwards nothing. *A constitutional verifier must not require resurrection of owner authority merely to pronounce the release constitutional.* |
| **§III** | `pt3-runtime-pool-witness.ts` claimed "every runtime pool connects as `maia_app`" while genuinely constructing **two of five**; the other three ran a connection expression **re-typed into the witness**, which drifts from the files it names. | Three separate legs, named separately in the verdict: **DISCOVERY** scans `lib/` and `app/` for pool constructors so a sixth pool fails the witness instead of going unwitnessed; **SOURCE** reads each file and requires that no `process.env.DATABASE_URL` is reachable except through `process.env.MAIA_APP_DATABASE_URL ||`; **EXERCISE** connects the two importable modules for real. The three others are reported as source-asserted and never as exercised. |

## ⭐ What repair 6 changed: the census had the wrong boundary

| | Defect | Repair |
|---|---|---|
| **B34** | ⭐ **There are six runtime pools, not five.** The strengthened witness scanned `lib/` and `app/` — internally sound for the roots it searched, and blind to the fact that production also builds a **separate image**, `maia-api:prod` from `apps/api/Dockerfile`. `apps/api/src/db/postgres.ts` read `DATABASE_URL` only, with an owner-named fallback. After activation the API would not have crossed to `maia_app` — and correcting the source without rebuilding **that** image would have left the fix in the repository and not in the platform. The API Dockerfile also stamped no `GIT_COMMIT`, so it could not participate in an immutable-SHA transition at all. | Discovery now walks every **production source root** (`lib`, `app`, `apps`, `components`, `server`) — and the correct response to a future finding is another root, never one more hardcoded path bolted onto a still-blind scan. The API pool is constrained-first; the API image carries `GIT_COMMIT`/`APP_VERSION`/`BUILD_DATE`/`DEPLOY_LANE`; the orchestrator **builds and provenance-verifies both images before quiescence** and proves both running services afterwards. |
| **B35** | The runbook fetched `claude/pt3-runtime-integration` while the preflight still defaulted its object-fetch to `claude/writers-studio-experiences-afia8t`. A clean production checkout would fetch a branch not containing the accepted commit, then abort for a reason reading like a missing artifact. | Default bound to the PT-3 lane; `CUTOVER_BRANCH` overrides. **The branch may make the object reachable; it never determines which object is authorized.** `ACCEPTED_SHA` remains the sole authority. |
| **B36** | The preflight required the accepted `deploy-production.sh` to *already* be installed on the host — while the sequence ran it *before* the forward step, and while this repair *changes that file*. Another internally impossible gate. And the forward step brought only Compose across, leaving B33's durability repair uninstalled. | Three questions, each asked where it can be answered: the **preflight** proves the accepted artifact's *architecture* (host divergence reported, not judged); the **forward step** installs the bounded operational surface; the **orchestrator's step 0** fails closed unless every installed host file is byte-identical to the snapshot. *prove artifact → install bounded surface → prove installed surface → mutate.* |
| **B37** | Staging emitted `WARN`, wrote an **empty** `.env.postgres`, and continued; activation only warned if custody was missing *after* owner material had already been removed. Under a required-`env_file` architecture that means the database returns with no owner password — discovered mid-outage, past the point of no return, on the strength of a warning printed several steps earlier. | Both are aborts. Staging refuses **before the outage** if either credential cannot be positively established. Activation proves `.env.migrate` and `.env.postgres` exist, are non-empty, carry their key and are owner-only **before** it removes anything. *No production boundary may depend on somebody noticing a warning.* |
| **B38** | ⭐ **Two different sets were being answered by one.** `maia-caddy` is deliberately left **up** through the outage so it serves a refusal rather than a black hole — correct — but it loads `.env.production` and **a running container never rereads an env file**, so it kept the owner material it was created with. | The sets are now distinct and both recorded: **source-writing runtime** (stopped at quiescence) and **owner-credential holders** (recorded before the transition, recreated after `.env.production` is cleansed, re-discovered until none remain). Possession is tested for **every form** of owner material — `DATABASE_URL`, `POSTGRES_PASSWORD`, `MIGRATE_DATABASE_URL`, and any URL authenticating as the owner role derived from `pg_tables` — reporting **variable names only, never values**. Postgres and the governed migration authority are the explicit exceptions. |
| **§XI** | The final witness proved variable *names*. A pool can reconnect around its configuration — the B23/B34 failure mode a grant census cannot see. | It now asks the database who is actually connected: **no** TCP client backend on any role but `maia_app`, **and at least one** actually connected as `maia_app`. Zero observed application connections is a defect, not a pass — *absence of observation is not evidence of compliance.* |

## ⭐ What repair 7 changed: the cutover now speaks production's own Compose

| | Defect | Repair |
|---|---|---|
| **B39** | ⭐ **The release path was not the production invocation.** The ordinary deploy runs `docker compose -p maia-sovereign --project-directory "$PROJECT" -f "$COMPOSE" --env-file "$PROJECT/.env.production"`. The PT-3 stop / recreate / release acts ran `docker compose -f "$COMPOSE"`. That is not the same interpretation of the same file: `env_file:` hands variables to the **container**, while `${...}` in an `environment:` or `ports:` value is resolved by **Compose itself**, from the shell and `--env-file`, never from a service's `env_file`. So caddy's `DOMAIN=${DOMAIN:-localhost}` would resolve to `localhost`, and an `environment:` entry produced by `${...}` overrides what the same service would have loaded through `env_file`. The outcome available at step 10 or 11 was **correct PT-3 database authority with wrong unrelated production configuration** — a cutover that quietly re-pointed the proxy while proving the boundary held. | One helper, `scripts/witness/pt3-compose.sh`, carrying the deploy path's contract verbatim: project name, `--project-directory` on the project dir, Compose file from the snapshot when one is materialized, `--env-file .env.production` always, and a refusal if that file is absent. **All six** PT-3 Compose acts now go through it — build, migrate, stop, release, recreate, and the migration-authority `config` probe, because asking *"what will migrate receive?"* through a different invocation answers a different question. ⛔ Not repaired by copying more variables into `.env`: that would make two invocations agree by coincidence. *A cutover may change authority; it may not change configuration merely because its Compose invocation differs from production's.* |
| **B40** | The runbook's Step 3 put `$MAIA_BUILD_CONTEXT` inside a locally double-quoted `ssh …"'…'"` argument, so the **Mac's** shell expanded it before the remote `export` ran. Unset locally, the transmitted command became `bash /scripts/pt3-cutover.sh`. It fails safely, before anything is touched — but the runbook's one-command path was not executable as written. | The runbook no longer maintains a second, independently quoted form. It instructs the operator to open a session and paste **the block the successful preflight printed**, whose values are already literal. *One executable instruction is better than two almost-equivalent ones.* |
| **§IX** | `is_exempt()` matched `*migrate*` — a name substring broader than the law's stated exception, which is postgres and the **governed migration service**. | Keyed on the Compose **service identity** (`com.docker.compose.service` ∈ `postgres`, `migrate`), which is what the migrate service actually has: it declares no `container_name`. |

Carried unchanged: the temporal law, the two-phase authority split, generated-credential safety,
backup custody outside the repository, prove-before-change, durable Compose with no overlay,
full-SHA attribution, the complete pending-set proof, and the Experiences hold.

---

## Step 0 · `[MAC]` — verify the artifact before pinning

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/pt3-runtime-integration
ACCEPTED_SHA=<full 40-char sha>
git ls-tree -r --name-only "$ACCEPTED_SHA" | grep -E 'pt3-(cutover|cutover-preflight|stage-migration-authority|verify-migration-authority|activate-runtime-authority|quiesce-source-writes|verify-backfill|cutover-readiness|post-cutover-witness|runtime-pool-witness)'
git show "$ACCEPTED_SHA":docker-compose.production.yml | grep -c 'env.migrate'
```

⛔ Anything missing means the artifact is incomplete. Set `ACCEPTED_SHA` once; it governs the run.

## Step 1 · `[MAC→PROD]` — immutable preflight. Mutates nothing, on any host.

```bash
git show "$ACCEPTED_SHA":scripts/witness/pt3-cutover-preflight.sh \
  | ssh soullab@minisforum "ACCEPTED_SHA=$ACCEPTED_SHA sh -s"
```

⛔ `PREFLIGHT FAILED` ends the cutover — **and nothing on production has been touched.**
Record its §VII evidence block: `MAIA_BUILD_CONTEXT`, full `GIT_COMMIT`, `MIGRATION_RUN_ID`.
Preflight materializes the snapshot; **step 3 runs the orchestrator out of that snapshot**, not out
of the checkout, and the orchestrator refuses to run at all unless it is byte-identical to the
accepted commit's copy. The shared checkout can be on any branch; the transition may not be.

## Step 2 · `[MAC→PROD]` — install the bounded operational surface (B36)

```bash
ssh soullab@minisforum "cd ~/MAIA-SOVEREIGN \
  && git fetch -q origin claude/pt3-runtime-integration \
  && git checkout $ACCEPTED_SHA -- docker-compose.production.yml \
       scripts/deploy-production.sh scripts/deploy-lock.sh scripts/deploy-tag.sh \
       scripts/pt3-cutover.sh scripts/witness/pt3-compose.sh \
  && git diff --stat HEAD -- docker-compose.production.yml scripts/"
```

Not Compose alone: **B33's ordinary-deploy durability lives in `deploy-production.sh`**, so
installing only Compose would leave `setup` able to write owner material back into
`.env.production` the next time anyone ran it.

Compose declares `env_file: .env.migrate` for migrate and `.env.postgres` for postgres — **required
files, not interpolated variables** — so a missing one is a hard Compose failure rather than a
silent empty credential (§XIII). Nothing here is proven by this step; **step 3 proves it**.

## Step 3 · `[PROD]` — ⭐ THE CUTOVER. One command, one lock, one outage.

⭐ **B40 — run the block the preflight printed, verbatim.** A successful preflight ends by emitting
the exact next command with `ACCEPTED_SHA`, the snapshot path and the run id already substituted as
literals. Open a session on the host and paste it there; do not wrap it in a quoted `ssh …"…"`
argument, because the local shell would expand `$MAIA_BUILD_CONTEXT` before the remote `export`
ran — the transmitted command became `bash /scripts/pt3-cutover.sh`, which fails safely and is
still not executable as written.

```bash
ssh soullab@minisforum
```

then, on the host, paste the preflight's block unchanged — it looks like this, with real values:

```bash
export ACCEPTED_SHA="<full 40-char sha>"
export MAIA_BUILD_CONTEXT="/tmp/pt3-cutover.XXXXXX"
export MIGRATION_RUN_ID="pt3-cutover-<timestamp>"
bash "$MAIA_BUILD_CONTEXT/scripts/pt3-cutover.sh"
```

⛔ Do **not** retype these values from memory or from an earlier run: the snapshot path and run id
are produced by the preflight that just passed, and pairing them with a different snapshot is how a
transition ends up governed by a tree nobody reviewed.

The orchestrator performs, under a single held deploy-lane lock:

| | Act | Source runtime |
|---|---|---|
| 0 | ⭐ **fail-closed host verification (B36)** — every installed operational file byte-identical to the snapshot, or nothing is mutated | serving |
| 1 | stage owner custody into `.env.migrate` / `.env.postgres` — ⭐ **aborts before the outage** if either cannot be established (B37) | serving |
| 2 | verify migration authority (fail-closed; resolved role must **be** the protected tier's owner; a pre-existing `maia_app` aborts) | serving |
| 3 | ⭐ **build BOTH images** — `maia-sovereign:prod` and `maia-api:prod` — and provenance-verify both against the accepted SHA. Prepared, not started (B34) | serving |
| 4 | ⭐ **record the owner-credential holders** (B38) — the set that must be recreated later, including Caddy | serving |
| 5 | **QUIESCE** — the outage begins; the stopped source-writing set is recorded | stopped |
| 6 | apply exactly the PT-3 migration, attributed | stopped |
| 7 | verify migration, attribution and scope (one row · full 40-char commit · **0** Experience tables · **1** `maia_app`) | stopped |
| 8 | ⭐ **assert the deterministic backfill** — `pt3-verify-backfill.sh`, which refuses unless the runtime really is stopped | stopped |
| 9 | generate the `maia_app` credential; remove **all** owner material from the universal environment | stopped |
| 10 | ⭐ **shed stale owner credentials** — recreate every surviving holder (Caddy) until none possesses owner material in any form (B38) | stopped |
| 11 | ⭐ **RELEASE** — the single release act; the recorded set returns on the new images | serving |
| 12 | prove **both** running images are the accepted SHA, and that live connections authenticate as `maia_app` | serving |

⛔ **Any failure between step 5 and step 11 leaves the runtime QUIESCED, deliberately.** The script
says so. Failures at steps 0–4 abort with production untouched and no outage begun.
Per §X, the pre-PT-3 application image is **not an authorized rollback target** once the migration
has committed: stay quiesced, report, recover forward.

The step-7 counts are deterministic **only** because no member can write at that moment:
**11** representations (6 custodied · 5 legacy) · **17** acts, all `migration_legacy`, **0** with a
member actor · **5** `representation_without_arrival` · **0** multi-arrival · 2 blank Works and
2 unclaimed arrivals untouched.

## Step 4 · `[MAC→PROD]` — the two acceptance witnesses

```bash
git show "$ACCEPTED_SHA":scripts/witness/pt3-cutover-readiness.sh    | ssh soullab@minisforum 'sh -s'
git show "$ACCEPTED_SHA":scripts/witness/pt3-post-cutover-witness.sh | ssh soullab@minisforum 'sh -s'
```

**Both must return `READY`.** `INCONCLUSIVE` is never success — a verifier that observed nothing
has proved nothing. The post-cutover witness is production-safe: no `INSERT`, `UPDATE` or `DELETE`,
no fixture, no adversarial mutation. Refusal is proven from the catalogue, ordinary draft work by
privilege, the backfill by **invariants**, and block 7 proves the boundary survives an ordinary
deploy — that it is a property of the file every service already loads, not of remembering a flag.

## §IX — the Experiences hold survives

`20260908000002_writer_experiences.sql` stays pending and unapplied, and step 6 aborts the cutover if
any `writer_experience%` table appears. ⛔ **A later ordinary `migrate` would apply it.** Before any
future production migration the lane must compute **pending ∩ authorized** and never treat *pending*
as *authorized*. PT-3 finishing authorizes nothing about it.

## §X abort conditions → where caught

| Condition | Caught by |
|---|---|
| tree differs from the reviewed artifact | Step 1 preflight (full SHA, no default) + launcher checksum |
| a second migration pending | Step 1 preflight (computed set) · orchestrator step 6 |
| data shape inconsistent with the census | ⭐ orchestrator step 7, **while quiesced** |
| member-attributed history from legacy inference | step 7 · post-cutover witness block 4 (invariant) |
| a legacy representation hidden | step 7 · post-cutover witness block 4 (invariant) |
| competing Sources | census: zero multi-arrival Works · step 7 |
| runtime still receives owner authority | orchestrator step 10 · witness blocks 1 and 7 |
| an application pool reconnecting as the owner | `pt3-runtime-pool-witness.ts` — discovery across all production roots + source + exercise; and witness block 1's live `pg_stat_activity` role check |
| a second production runtime outside the census | discovery roots include `apps/`; orchestrator step 3 builds and stamps both images; step 12 and witness block 1 prove both |
| a surviving container holding stale owner material | orchestrator steps 4 and 10; witness block 1 sweeps every owner-material form |
| the cutover changing unrelated production configuration | `pt3-compose.sh` — every PT-3 Compose act uses production's own invocation (B39) |
| owner custody missing at the moment it is needed | orchestrator step 1 (before the outage) and step 9 (before removal) — aborts, not warnings |
| `maia_app` can escalate | witness block 2 |
| owner credential in the universal environment | witness block 7 · `deploy-production.sh setup` no longer writes it |
| attribution absent | orchestrator step 6 · witness block 6 |
| DEFECT or INCONCLUSIVE | exit codes |

⛔ **Do not solve an unexpected production state by weakening the constitutional boundary.**

## §XI — the canonical sentence

Only when the orchestrator completes **and** both Step 4 witnesses return `READY` may
*PT-3 is enforced in code and not in production* become
**PT-3 is structurally enforced in production**.
Because durability is proven inside the same witness, the §VIII hold on ordinary deployment closes
with it rather than outliving it. Encounter stays held until the post-cutover witness is returned.
