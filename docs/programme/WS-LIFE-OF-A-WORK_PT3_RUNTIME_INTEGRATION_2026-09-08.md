# PT-3 runtime integration — build on canonical

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §VII–§XIV. PT-3 runtime integration authorized.
**Base:** `d326fc47` — current canonical (`clean-main-no-secrets`), **not** the Experiences branch.
**Status:** BUILT · witnessed on disposable infrastructure · ⛔ **PRODUCTION UNCHANGED. DEPLOY HELD.**

> **The finding that changes the cutover, not its instrument.** PT-3 is a **protocol change between
> the application and the database**. Both halves were built together; production has to cross the
> boundary together. "Apply the migration and switch credentials" was never the cutover.

---

## B22 — the application half was never in the cutover

The old runbook migrated the schema, activated `maia_app`, moved the environment and recreated
containers — **against the existing production image**, which was built with no
`MAIA_APP_DATABASE_URL` path and the old direct-`INSERT` import. Recreating a container does not
give it code it was never built with.

This integration is that missing half, built **on canonical** so PT-3 can ship without carrying the
separately-held Experiences work.

## B23 — three pools, not one, would have reconnected as the owner

`lib/database/postgres.ts` gated entry on `DATABASE_URL`; once the owner variable is withdrawn the
URL branch is never taken and the pool falls through to individual `POSTGRES_*` parameters whose
default user is **`soullab`**. The census also found **five runtime pools, not three** — the ruling
was right to say not to assume:

| Pool | Before | Now |
|---|---|---|
| `lib/db/postgres.ts` | correct | correct |
| `lib/skills/skillsRuntime.ts` | correct | correct |
| `lib/database/postgres.ts` | 🔴 gated on `DATABASE_URL` → fell through to `soullab` | either URL is authority |
| `lib/learning/maiaTrainingDataService.ts` | 🔴 **never audited** — same gate | either URL is authority |
| `lib/memory/beads-sync/server.ts` | 🔴 **never audited** — owner variable only | either URL is authority |

⭐ **A grant census could never have caught this.** The grants would have been perfect while the
application quietly reconnected around them. So `scripts/witness/pt3-runtime-pool-witness.ts`
**deletes `DATABASE_URL` from its own environment** — reproducing the post-cutover world — and asks
each pool `SELECT current_user`:

```
DATABASE_URL removed from the environment — this is the post-cutover world.
PASS  lib/database/postgres.ts                  current_user=maia_app
PASS  lib/db/postgres.ts                        current_user=maia_app
PASS  lib/learning/maiaTrainingDataService.ts   current_user=maia_app
PASS  lib/memory/beads-sync/server.ts           current_user=maia_app
PASS  lib/skills/skillsRuntime.ts               current_user=maia_app
READY — every runtime pool connects as maia_app with the owner variable absent.
```

## B24 / B25 — the transition boundary

Old app + `maia_app` = **broken import** (the seam is required; direct `INSERT` is revoked).
Old app + owner authority + new schema = **unlawful writes** (the owner is not stopped by privilege,
so the old direct-`INSERT` path keeps creating representation-less sections).

Neither order is safe, so the cutover has a real quiescence boundary.

⚠️ **The existing `safe-mode` toggle is not it.** It disables geocode, astrology, deep memory,
exports, advanced voice, embeddings and RLM — **it does not refuse Source writes.** Using it would
have looked like quiescence while the old import path kept running.

`scripts/witness/pt3-quiesce-source-writes.sh` **stops** the database-bearing runtime — discovered by
credential possession, never a remembered list — verifies none is running, and records the set for
release. A stopped container cannot write. It is an outage, deliberately; §IX forbids relying on speed.

## B26 / B27 — two instruments that could still green falsely

- **B26** — readiness counted a global `observed`, which the configuration and database blocks also
  incremented, so it could reach `READY` **without ever seeing a running container** while claiming
  authority is discovered by possession. A separate `runtime_seen` counter now makes zero runtime a
  defect, matching the post-cutover witness.
- **B27** — the accepted census's predictions were printed through unconditional `ok(...)`: displayed
  beside the actual value and never compared. **A sentence stating the expected answer is not a
  falsifier** — the third time this lane has caught that shape. Seven deterministic backfill facts
  are now `expect()` assertions that fail on difference; live-changing facts are tested as
  **invariants** instead, so production numerology stays out.

## §XIII — the launcher was the last mutable dependency

Witnesses are piped from the accepted SHA and the migration SQL and runner arrive inside
`MAIA_BUILD_CONTEXT` — but the owner-level mutation is launched by the **production checkout's**
`deploy-production.sh`. The preflight now checksums that script and its helpers against the accepted
artifact and refuses on difference.

---

## Evidence, on this integration tree

| | |
|---|---|
| `npm run typecheck` | 0 regressions |
| jest — manuscript · writers-studio | **95 suites · 1654 tests · 0 failed** |
| `pt3-source-custody-falsifier` — **original attacks, unchanged** | **25 passed · 0 failed · 0 structurally-unenforced** |
| `pt3-enforcement-witness` | **29 passed · 0 failed** |
| `pt3-runtime-pool-witness` | **5/5 pools connect as `maia_app`** |

**No weakening of the database boundary was made to keep old application code working.** The old
import path was replaced, not accommodated.

## Scope (§VII)

**In:** the five pools · the governed seam (`lifecycle.ts`) · import through `extractRepresentation`
· erasure through `commissionErasure` · operative-representation reads · the PT-3 migration ·
compose authority separation and healthchecks · the attributing runner · the cutover instruments.

⛔ **Out, and absent from this tree:** the Experiences migration · Experience runtime, tests and
records · the doorway change and its record · every unrelated Writer's Studio feature · Encounter.
Verified by name, not by intention.

## Required production sequence (§X)

```
1  immutable preflight (also proves the launcher)
2  stage migration authority
3  build the PT-3 image from this SHA — prepared, not started
4  quiesce Source-write paths            ← the outage begins
5  bring canonical Compose forward
6  migration-authority verifier → MIGRATION READY
7  apply exactly the PT-3 migration
8  verify backfill · attribution · zero Experience tables
9  activate the PT-3 image
10 prove the running image is this SHA
11 activate the maia_app credential
12 recreate/discover all database-bearing runtime
13 release quiescence                    ← the outage ends
14 readiness → READY
15 post-cutover witness → READY
```

The governing law: **there must be no live state in which the old Source-writing application
operates against the new constitutional schema.**

⛔ Nothing here is deployed. **PT-3 is enforced in code and not in production.** The Experiences
migration remains held; Encounter remains held.

---

# Repair 5 — final bounded integration repair (§XIV: B28–B33, §III)

**Authority:** FOUNDER RULING — Writer's Studio, 2026-09-08 §XIV. Twelve permitted changes.
**Unchanged, by ruling:** PT-3 Source doctrine · grants and seam semantics · lifecycle ontology ·
Experience code · the Experience migration HOLD · the doorway · Encounter · unrelated runtime
behaviour. No application logic was touched in this repair. No migration was authored or edited.

## What changed, and why each was a defect and not a preference

### B28 — owner secrets left the universal environment (§VI)
`.env.production` is loaded by every service in `docker-compose.production.yml`. While it carried
`POSTGRES_PASSWORD`, withdrawing `DATABASE_URL` withdrew a *variable*, not *authority*:
**owner authority is any credential material sufficient to authenticate as the database owner.**
Custody is now service-specific, as **required `env_file` entries** — not interpolated variables, so
a missing file is a hard failure rather than a silently empty credential (§XIII):

| file | contents | loaded by |
|---|---|---|
| `.env.postgres` | `POSTGRES_PASSWORD` | `postgres` only |
| `.env.migrate` | owner `DATABASE_URL` | `migrate` only |
| `.env.production` | `MAIA_APP_DATABASE_URL` | every service |

### B29 / B30 / B31 — the cutover became one act
`scripts/pt3-cutover.sh`. **One** `acquire_deploy_lock "pt3-cutover"` held across ten steps, so no
deploy, update, rollback or migrate can enter between them; the kernel releases it when the process
tree exits. The image is **built before quiescence** and started only at the single release act.
Every failure after the migration commits calls `die_quiesced()` — the runtime stays stopped and
says so, because per §X **the pre-PT-3 image is not a rollback target**: the old protocol writes
Source by direct `INSERT` and does not understand the seam.

The migration runs as the compose command directly rather than through
`deploy-production.sh migrate`, which would re-acquire the same lock and contend with its own parent.

The launcher also **refuses to run unless it is byte-identical to the accepted commit's copy** in
the snapshot. Every witness already ran from the snapshot; the launcher is invoked from a shared
checkout that can be on any branch, which is B19's asymmetry one level up.

### B32 — the deterministic counts moved to where they are true
The exact backfill census (11 representations · 6 custodied · 5 legacy · 17 acts, all
`migration_legacy` · 0 member actors · 5 `representation_without_arrival` · 0 multi-arrival ·
2 unclaimed arrivals) is asserted by `scripts/witness/pt3-verify-backfill.sh` **at step 7, while
quiesced, before the single release act.** If the backfill is wrong, member writes never reopen.

That verifier **checks its own precondition** — a recorded quiescence and a stopped
`maia-sovereign` — and returns `REFUSED` otherwise. *A comment claiming when a number is true is
not a falsifier.*

The post-cutover witness, which runs after release, now tests **invariants**: laundering, actor
presence, custody-matches-arrival, no hidden representation, no orphan section, every representation
recorded, reconciliation completeness expressed as a condition rather than a number, truthful
arrival claims. Live totals are tested as **floors** (append-only: the record may grow, never
shrink); only the genuinely **sealed** sets — those the migration alone produces — are still tested
by equality, and the script says which is which and why. Block 5's four unconditional `ok()` lines
(the B27 defect surviving where nobody re-read) are now gates, and its denominator is derived live
instead of remembered as `11`.

### B33.A — `setup` no longer reconstructs the defect
`deploy-production.sh setup` generated `POSTGRES_PASSWORD` into `.env.production` and rewrote the
owner `DATABASE_URL` from it. **`setup` was the act that handed the entire runtime owner authority**,
and it would have silently rebuilt what this cutover removes. It now generates owner material
directly into `.env.postgres` / `.env.migrate` at mode 600, strips owner keys from
`.env.production`, and refuses to touch anything once custody exists.

### B33.B — a constitutional verifier no longer needs owner authority
Every `verify-constitution-*.ts` reads `MAIA_APP_DATABASE_URL` before `DATABASE_URL`; the harness
forwards whichever the runtime holds; the documented command forwards nothing. The old form
`DATABASE_URL="$DATABASE_URL" …` would post-cutover forward an **empty string**, and each verifier
would fall back to its local default — *a green run against the wrong database*, which is worse than
a red one. *A constitutional verifier should not require resurrection of owner authority merely to
pronounce the release constitutional.*

### §III — the pool witness can no longer drift away from the code it names
It claimed "every runtime pool connects as `maia_app`" while genuinely constructing two of five; the
other three ran a connection expression **re-typed into the witness itself**. Now three legs, named
separately in the verdict:

- **DISCOVERY** — pool constructors are found by scanning `lib/` and `app/`. A sixth pool fails the
  witness rather than going unwitnessed. Narrowing the scan to pass is explicitly refused in text.
- **SOURCE** — each file is read. The rule is not "mentions `MAIA_APP_DATABASE_URL`" (a comment
  satisfies that, and `lib/database/postgres.ts` has one) but that **no `process.env.DATABASE_URL`
  is reachable except through `process.env.MAIA_APP_DATABASE_URL ||`**.
- **EXERCISE** — the two importable modules actually connect, with `DATABASE_URL` deleted from the
  process. The other three are reported as *source-asserted*, never as exercised.

### B29 — the runbook now describes the instrument
`docs/programme/WS-LIFE-OF-A-WORK_PT3_CUTOVER_RUNBOOK_2026-09-08.md` is four steps: verify the
artifact · preflight · bring Compose forward · **run the orchestrator** · the two witnesses. The
prior eight-step manual sequence is superseded and is not to be run.

## What was verified here, and what was not

| gate | result |
|---|---|
| `npm run check:no-supabase` | clean |
| `npm run typecheck` | `229 errors · baseline 239 · 10 fixed · 0 regressions` |
| `npx jest` (full suite) | 37 failing suites — **identical set before and after this change**, verified by running the suite against the stashed tree; **0 introduced** |
| `sh -n` / `bash -n` on every changed script | parses |
| `git check-ignore` on all 17 consumed paths | none ignored (the B8 lesson) |

⛔ **NOT run here, and not claimed:** the PT-3 falsifier, the enforcement witness, the runtime pool
witness and the backfill verifier all require a PostgreSQL instance and a Docker daemon. This
environment has neither (`pg_isready` → no response; no `docker.sock`). Their code is reviewed and
parses; **that is a claim about the instruments, not about a database.** *Absence of observation is
not evidence of compliance.*

## Standing

⛔ Nothing is deployed. **PT-3 is enforced in code and not in production.**
The Experiences migration remains held and the orchestrator aborts the cutover if any
`writer_experience%` table appears. Encounter remains held. The cutover pin stays HELD pending the
founder's act.

---

# Repair 6 — B34–B38 (founder exact-tree review of `8e0b585…`)

**Authority:** FOUNDER RULING — Writer's Studio, 2026-09-08 §IX. Nine bounded repairs.
**Accepted and untouched:** the §XIV operational architecture — one orchestrator, one deploy-lane
lock, image preparation before outage, quiescence before migration, backfill checked while quiesced,
service-specific owner custody, credential activation while stopped, one release point, forward-only
recovery. PT-3 Source doctrine, grants, seam semantics, lifecycle ontology, Experience code, the
Experience HOLD, the doorway and Encounter are unchanged.

## B34 — the census had the wrong boundary, not the wrong list

The strengthened pool witness reported five sites and was internally sound **for the roots it
searched**. Production also builds a **second image** — `maia-api:prod`, from `apps/api/Dockerfile`
— and `apps/api/src/db/postgres.ts` held exactly the owner-era pool this lane exists to eliminate:
`DATABASE_URL` only, falling back to a URL naming the **owner** role. After activation withdrew
`DATABASE_URL`, that service would not have crossed to `maia_app`.

Two consequences, and the second is the one that matters:

- **Correcting the source is not enough.** `maia-api` is a separate image. The orchestrator built
  only `maia`, so the repair would have existed in the repository and not in the platform.
- **The API image stamped no `GIT_COMMIT`.** An image that cannot say which commit it is cannot
  participate in an immutable-SHA transition. Treating it as exempt is how a second production
  runtime stays permanently outside the boundary.

Repairs: the API pool is constrained-first; `apps/api/Dockerfile` carries `GIT_COMMIT` /
`APP_VERSION` / `BUILD_DATE` / `DEPLOY_LANE`; compose passes them; the orchestrator builds **both**
images and provenance-verifies both **before quiescence**, and proves both running services after
release. Discovery now walks every production source root — `lib`, `app`, `apps`, `components`,
`server`. ⛔ *The repair to a future finding is another root, never one more hardcoded path bolted
onto a still-blind scan.* Verified: discovery finds exactly six sites, and all six pass the
constrained-first source law.

## B35 — the branch is transport, never authority

Preflight's object-fetch still defaulted to the Experiences lane, so a clean production checkout
would fetch a branch not containing the accepted commit and abort for a reason that reads like a
missing artifact. Default bound to `claude/pt3-runtime-integration`; `CUTOVER_BRANCH` overrides;
`ACCEPTED_SHA` remains the sole authorization and `git archive` still runs from the SHA.

## B36 — the preflight demanded what only a later step could install

It compared the accepted `deploy-production.sh` against the host's and recorded a defect if they
differed — while the sequence ran it *before* the forward step, and while this repair *changes that
file*. A precondition its own procedure cannot satisfy is not a gate. The forward step also brought
only Compose across, leaving B33's durability repair uninstalled.

Now three questions, each asked where it can be answered:

| where | question |
|---|---|
| immutable preflight | does the **accepted** launcher have the required architecture? (host divergence reported, not judged) |
| forward step | install the bounded operational surface — Compose **and** `deploy-production.sh`, `deploy-lock.sh`, `deploy-tag.sh`, `pt3-cutover.sh` |
| orchestrator step 0 | fail closed unless every installed host file is byte-identical to the snapshot |

*prove artifact → install bounded operational surface → prove installed surface → mutate.*

**Also found and repaired in the same place:** three instruments were still checking B28's
*superseded* mechanism (`MIGRATE_DATABASE_URL` interpolated from `.env`). `pt3-verify-migration-authority.sh`
is fail-closed, so on a correctly staged cutover it would have **aborted**; the preflight and the
readiness witness would have reported a correct architecture as a gap. All three now follow the
`.env.migrate` / `.env.postgres` custody they are meant to police.

## B37 — owner-secret staging failed open

Staging emitted `WARN`, wrote an **empty** `.env.postgres`, and continued. Activation only warned
about missing custody **after** removing owner material from `.env.production`. Under a required-
`env_file` architecture that means the database returns with no owner password — discovered
mid-outage, past the point of no return, on the strength of a warning printed several steps earlier.

Both are aborts now. Staging refuses **before the outage begins**, when nothing has been mutated.
Activation proves both files exist, are non-empty, carry their key and are owner-only **before** it
removes anything. *No production boundary may depend on somebody noticing a warning.*

## B38 — two sets were being answered by one

`maia-caddy` is deliberately left **up** through the outage so it serves a refusal rather than a
network black hole. That is right. But it loads `.env.production`, and **a running container never
rereads an env file** — so after activation cleanses that file, Caddy still holds the owner material
it was created with.

- **Source-writing runtime** — stopped at quiescence.
- **Owner-credential holders** — recorded *before* the transition, recreated *after* the cleanse,
  then re-discovered until none remains.

Caddy is in the second set and not the first. Possession is tested for **every form** of owner
material: `DATABASE_URL`, `POSTGRES_PASSWORD`, `MIGRATE_DATABASE_URL`, and any URL authenticating as
the owner role — derived from `pg_tables`, never hardcoded. Variable **names** are printed; values
never are. Postgres and the governed migration authority are the explicit exceptions.

## §XI — the final witness now proves connections, not variable names

Configuration checks cannot see a pool reconnecting around its configuration — the exact B23/B34
failure mode. The witness now asks the database: **no** TCP client backend on any role but
`maia_app`, **and at least one** actually connected as `maia_app`. Observing zero application
connections is a defect, not a pass.

## Verified here / not verified here

| gate | result |
|---|---|
| `npm run check:no-supabase` | clean |
| `npm run typecheck` | `229 errors · baseline 239 · 0 regressions` |
| `apps/api` `tsc --noEmit` | exit 0 |
| `npx jest` (full suite) | 37 failing suites — **identical set** to the pre-change baseline; 0 introduced |
| pool discovery, simulated over the real tree | **6 sites** found: the five plus `apps/api/src/db/postgres.ts` |
| constrained-first source law, all six | PASS — one `DATABASE_URL` read each, every one guarded |
| `sh -n` / `bash -n` on every changed script | parses |

⛔ **NOT run here, and not claimed:** the falsifier, enforcement witness, pool witness, backfill
verifier and post-cutover witness need PostgreSQL and a Docker daemon; this environment has neither.
Per §XI they are to be run against disposable infrastructure before production execution.
*Absence of observation is not evidence of compliance.*

## Standing

⛔ Nothing is deployed. **PT-3 is enforced in code and not in production.**
Experiences migration HELD. Encounter HELD. The cutover pin awaits the founder's act.
