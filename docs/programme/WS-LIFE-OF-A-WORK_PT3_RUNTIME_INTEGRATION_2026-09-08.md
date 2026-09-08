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

---

# Repair 7 — B39, B40 (founder exact-tree review of `47bb7b1a…`)

**Authority:** FOUNDER RULING — Writer's Studio, 2026-09-08 §IX. Two repairs, plus the §IX
exemption hardening. B34–B38 are ACCEPTED and untouched; no PT-3 architecture is reopened.

## B39 — the release path was not the production invocation

The ordinary deploy runs Compose as `deploy_ctx_compose()` does:

```
docker compose -p maia-sovereign --project-directory "$PROJECT" \
               -f "$COMPOSE" --env-file "$PROJECT/.env.production" …
```

The PT-3 stop / recreate / release acts ran `docker compose -f "$COMPOSE" …`. **That is not the
same interpretation of the same file**, because `env_file:` and interpolation are different
mechanisms:

- `env_file:` hands variables to the **container**;
- `${...}` inside an `environment:` or `ports:` value is resolved by **Compose itself**, from the
  shell and `--env-file` — never from a service's `env_file`.

So `caddy`'s `DOMAIN=${DOMAIN:-localhost}` resolves to `localhost` under an invocation that omits
`--env-file`, and an `environment:` entry produced by `${...}` overrides what the same service would
otherwise have loaded through `env_file`. The state available at step 10 or 11 was therefore
**correct PT-3 database authority with wrong unrelated production configuration** — a cutover that
quietly re-pointed the proxy while proving the boundary held. Not an acceptable cutover.

**Repair:** one helper, `scripts/witness/pt3-compose.sh`, carrying the deploy path's contract
verbatim — project name, `--project-directory` on the project dir, the Compose file from the
immutable snapshot when one is materialized, `--env-file .env.production` always, and a refusal if
that file is absent. **All six** PT-3 Compose acts go through it:

| act | where |
|---|---|
| build both images | orchestrator step 3 |
| apply the migration | orchestrator step 6 |
| stop the source-writing set | `pt3-quiesce-source-writes.sh` |
| release that set | `pt3-quiesce-source-writes.sh release` |
| recreate owner-credential holders | `pt3-recreate-credential-bearing-runtime.sh` |
| resolve what migrate will receive | `pt3-verify-migration-authority.sh` |

The last one matters as much as the mutating five: asking *"what will migrate actually receive?"*
through a different invocation answers a different question.

⛔ **Not repaired by copying more variables into `.env`.** That would make two invocations agree by
coincidence; this makes them the same invocation.

*A cutover may change authority. It may not change configuration merely because its Compose
invocation differs from the one production is normally interpreted under.*

Verified by stubbing `docker` and running the helper: argv is byte-for-byte the deploy path's shape
(`-p` → `--project-directory` → `-f` → `--env-file`), the snapshot Compose is preferred when one is
materialized and the host's used otherwise, and a missing `.env.production` is a refusal, not a
silent different interpretation.

## §IX — the exemption is an identity, not a substring

`is_exempt()` matched `*migrate*`, which is broader than the law's stated exception (postgres, and
the **governed migration service**). It is now keyed on the Compose service label
`com.docker.compose.service ∈ {postgres, migrate}` — which is the migrate service's actual identity,
since it declares no `container_name`.

## B40 — the runbook's Step 3 expanded the wrong shell

Step 3 placed `$MAIA_BUILD_CONTEXT` inside a locally double-quoted `ssh … "'…'"` argument, so the
**Mac's** shell expanded it before the remote `export` ran; unset locally, the transmitted command
became `bash /scripts/pt3-cutover.sh`. It fails safely, before anything is touched — but the
runbook's one-command path was not executable as written.

**Repair:** the runbook no longer maintains a second, independently quoted form. It instructs the
operator to open a session on the host and paste **the block the successful preflight printed**,
whose values are already literal. The preflight's emitted block was tidied to paste cleanly, and it
now warns against retyping a snapshot path or run id from an earlier run — *pairing them with a
different snapshot is how a transition ends up governed by a tree nobody reviewed.*
*One executable instruction is better than two almost-equivalent ones.*

## Verified here / not verified here

| gate | result |
|---|---|
| `sh -n` / `bash -n` on all eleven PT-3 scripts | parses |
| `pt3_compose` argv simulation (stubbed `docker`) | matches `deploy_ctx_compose`'s shape exactly; snapshot preference and the missing-`.env.production` refusal both behave |
| residual bare `docker compose` in PT-3 scripts | **none** |
| `git check-ignore` on every consumed path | none ignored |
| `npm run check:no-supabase` · `npm run typecheck` · `npx jest` | unchanged — this repair touched shell and docs only |

⛔ **NOT run here, and not claimed:** the falsifier, enforcement witness, pool witness, backfill
verifier, readiness and post-cutover witnesses need PostgreSQL and a Docker daemon. This environment
has neither. Per §X.5 they remain explicitly unrun until disposable infrastructure is provided.
*Absence of observation is not evidence of compliance.*

## Standing

⛔ Nothing is deployed. **PT-3 is enforced in code and not in production.**
Experiences migration HELD. Encounter HELD.

---

# Repair 8 — witness-only: the Source-currency invariants were wrong

**Authority:** FOUNDER RULING — Writer's Studio, 2026-09-08 §IV–§X (disposable rehearsal).
**Scope:** `pt3-post-cutover-witness.sh`, one disposable regression fixture, this record and the
runbook. ⛔ **The migration is not defective and was not touched** — nor the lifecycle schema, seam,
backfill, application behaviour, grants, roles, Experience or Encounter. *The migration survived
the test; do not modify it to make the old witness pass.*

## What the rehearsal found

Running the repair-6 block-4 invariants against the **real backfill output** on a disposable
database, two fired on a lawful state:

| | actual | asserted |
|---|---|---|
| I4 "every Work with sections has an operative representation" | **1** | 0 |
| I6 "every representation is recorded in the lifecycle" | **1** | 0 |

Both on the multi-arrival Work. `20260908000001…:527,536` guards its currency-act inserts with
`count(arrivals) <= 1` and writes a `multiple_legacy_arrivals` reconciliation row instead; the
table's own comment says the Work then *"has no governed currency and is running on transitional
compatibility"*. Currency derives only from lifecycle acts, so no act means no operative
representation — **by design**.

The invariants therefore reported the system's refusal to manufacture authority as a §X abort
condition. That is the exact failure PT-3 exists to prevent, committed by the instrument meant to
prove it — and an instrument that convicts a truthful refusal pressures someone to make the system
decide what it has no authority to decide.

## The law, as ratified

> **No currency is not the same thing as missing currency.** The witness must distinguish an
> authored or refused absence from an accidental one.

A Work carrying Source sections must be in one of three states:

| | state | evidence |
|---|---|---|
| 1 | **OPERATIVE** | `source_operative_representation()` resolves |
| 2 | **AMBIGUOUS LEGACY** | an **open** `multiple_legacy_arrivals` record: the migration refused to decide |
| 3 | **WITHDRAWN** | governed history records the member-directed withdrawal that ended currency |

Anything else is an unexplained loss of Source authority and remains a defect. **State 3 is the
founder's extension to my proposed correction**, and it matters: `source_withdraw_representation()`
writes `operative = false`, so an intentionally withdrawn single-representation Work also lawfully
has sections and no currency. Excepting only ambiguity would have repaired one witness case while
leaving the invariant constitutionally wrong.

I6 is likewise replaced: an unacted representation is permissible **only** where the system recorded
why it refused to infer an act.

## The exception is not an escape hatch

Merely excluding reconciliation rows would let any absence be excused by writing one. So the record
itself is now tested, in both directions:

- every open `multiple_legacy_arrivals` must describe a Work that really has **more than one**
  arrival, and that really has **no** governed currency;
- every representation with no act must **have** such an open record.

> **Unresolved ambiguity is a valid state. Unrecorded ambiguity is a defect.**

## One definition, two readers

`scripts/witness/pt3-currency-invariants.sh` holds the SQL; the post-cutover witness and the
regression both source it. A re-typed invariant drifts — this lane has corrected that defect three
times and would have introduced it a fourth by writing these queries twice. The witness returns
**INCONCLUSIVE** if the file is absent rather than pretending it can judge, so the runbook's Step 4
now runs both witnesses **from the snapshot** instead of piping them over ssh.

## The regression, and why the failures matter most

`scripts/witness/pt3-currency-absence-regression.sh` — disposable databases only. Without negative
controls the repair degrades into *"NULL is always okay"*, which it is not: **NULL must be
explainable.**

| fixture | required |
|---|---|
| multi-arrival · unacted rep · open ambiguity | PASS |
| governed withdrawal · sections retained | PASS |
| sections, no currency, no withdrawal, no ambiguity | **FAIL (detected)** |
| representation with no act and no ambiguity record | **FAIL (detected)** |

Its teardown goes through `source_commission_erasure()`, because PT-3 refuses a bare `DELETE` on the
protected tiers even to the owner — and it deliberately does **not** delete
`source_lifecycle_acts`, which is append-only by design. *An instrument must not fight the law it
exists to verify.* Two defects in my own first draft were found and fixed by running it: a naive
teardown that left four fixtures behind, and a double quote inside a shell-quoted SQL comment that
silently truncated the teardown statement.

## Evidence

**Executed on this SHA:**

```
pt3-currency-absence-regression.sh   18 expectations · 18 PASS · exit 0 · residue 0
  multi-arrival PASS · withdrawal PASS · negative control DETECTED · unrecorded DETECTED
repaired invariants vs the real legacy backfill   unexplained-absence 0 · unrecorded 0
                                                  ambiguity-is-real 0 · ambiguity-has-no-currency 0
```

**Inherited from `744c8012a80e7f8b6b0a8dd52dc585c45a77c6fb`** — carried forward because the blobs
are byte-identical, **not** re-executed here: the original falsifier (`25 passed · 0 failed ·
0 structurally-unenforced`), the enforcement witness (`29 passed · 0 failed`), the runtime pool
witness (`READY`, six sites), the PT-3 migration, and all six pool sources.

⛔ **Still unexecuted:** the full Docker/Compose cutover composition, the Docker-bound quiesced
backfill script, readiness `READY` and post-cutover `READY`. Image layers cannot be obtained —
`403 Forbidden` from the organization egress policy. Infrastructure blocker, not a PT-3 defect and
not a passing witness.

## Standing

⛔ **PT-3 is enforced in code and not in production.** Production cutover HELD.
Experiences HELD. Encounter HELD.

---

# Repair 9 — B41, B42 (founder exact-tree review of `7af1a344…`)

**Authority:** FOUNDER RULING — Writer's Studio, 2026-09-08 §IX. Witness-only, again.
⛔ Migration, lifecycle schema, seam, backfill, application runtime, grants, roles, Experience and
Encounter unchanged. **The PT-3 migration is not defective.**

## B41 — the old I4 was still alive, twelve lines further down

Block 4 asked the ratified question through the shared definition. Block 5 then independently
computed `resolved == with_secs` under the label *"every Work with Source resolves through the
seam"* — **the old I4, restated in different words**, and still convicting both lawful absences:

| | block 4 | block 5 (old gate) |
|---|---|---|
| multi-arrival ambiguity | PASS | **DEFECT** |
| governed withdrawal | PASS | **DEFECT** |

The witness contradicted itself. Measured on the legacy-backfill shadow, the deleted gate reads
`operative 2 of 3 Works with Source` — it would have failed a correct system.

> **⛔ One law, one executable definition.**

That is the whole reason `pt3-currency-invariants.sh` exists: so the same invariant cannot survive
elsewhere under different wording. The gate is **deleted, not rewritten**. What remains in block 5
is a census — Works carrying Source · operative · explained non-operative — that reports shape and
**decides nothing** about which absence is lawful.

## B42 — a stale lawful withdrawal could mask a newer unexplained loss

`PT3_WITHDRAWN` read *"some representation of the Work has a latest act of kind withdrawal"*. That
proves too little:

```
representation A   extraction(true) → withdrawal(false)      lawful, and OLD
representation B   later replacement(false), nothing after   the real, unexplained loss
→ source_operative_representation() = NULL, excused by A
```

The invariant answers a **temporal** question — *why is there no currency NOW* — so the explaining
act must be the Work's **most recent** representation-level act under the lifecycle's own global
ordering (`occurred_at DESC, id DESC`), and must be a governed member withdrawal: `act='withdrawal'`,
`operative=false`, `provenance='member_act'`, actor present. `COALESCE(…, false)` because a Work with
sections and no acts at all has no explanation and must not drop out of the count on a NULL.

**The old four fixtures could not catch this** — none contained a withdrawal followed by anything.

## The fifth control, and proof that it falsifies

Case 5 builds A-withdrawn-then-B-lost and requires the absence to be **DETECTED**. Proven
discriminating on the same fixture shape, in a rolled-back transaction:

```
operative currency present                    : f
OLD predicate says WITHDRAWN (would EXCUSE)   : t
NEW predicate says WITHDRAWN (would EXCUSE)   : f
```

A control that passes under both predicates proves nothing; this one fails under the old and passes
under the new. Cases 1–4 unchanged.

## Evidence executed on this SHA

```
pt3-currency-absence-regression.sh          23 expectations · 23 PASS · exit 0
  MULTI-ARRIVAL              EXPLAINED
  WITHDRAWAL                 EXPLAINED
  NEGATIVE                   DETECTED
  UNRECORDED REPRESENTATION  DETECTED
  STALE WITHDRAWAL           DETECTED

shared invariants vs the real legacy-backfill shadow
  unexplained absence 0 · unrecorded representation 0 · false ambiguity 0 · ambiguity with currency 0

teardown
  live fixture residue    0
  lifecycle tombstones    RETAINED BY LAW — source_lifecycle_acts is append-only; the acts of an
                          erased fixture survive as history naming no live row and carrying no
                          content. That is not residue, and the report no longer calls it zero.
```

**Inherited from `744c8012…`, byte-identical blobs re-verified, NOT re-executed here:** falsifier
`25 · 0 · 0` · enforcement `29 · 0` · pool witness `READY`, six sites · the PT-3 migration.

⛔ **Still unexecuted:** the integrated Compose cutover, the Docker-bound quiesced backfill,
readiness `READY`, post-cutover `READY`. Image layers remain `403 Forbidden` from the organization
egress policy. No amount of further source review substitutes for those.

## Standing

⛔ **PT-3 is enforced in code and not in production.** Production HELD · Experiences HELD ·
Encounter HELD.

---

# Repair 10 — B43, B44, B45 (founder exact-tree review of `8ea28a14…`)

**Authority:** FOUNDER RULING — Writer's Studio, 2026-09-08 §XI. Witness-only.
⛔ Migration, lifecycle schema, seam, backfill, application runtime, grants, roles, Experience and
Encounter unchanged. **PT-3 migration and runtime are not defective.**

> The two semantic findings are one law: **an explanation cannot merely be nearby in history. It
> must bind to the state it actually explains.** Closed once, in the shared definitions.

## B43 — latest-act was still not causality

`source_withdraw_representation()` checks ownership and belonging, then appends
`withdrawal · operative=false`. It does **not** require the subject to have been operative. So a
lawful late seam call could be made to look like the explanation for a loss it did not cause:

```
representation A   extraction(true) → replacement(false)    already inactive
representation B   replacement(false)                       the real, unexplained loss
later              withdrawal(A, false)                     lawful, governed — and causally irrelevant
```

The Work's latest act is now a governed withdrawal, so repair 9 read **EXPLAINED**.

`PT3_WITHDRAWN` now also asks what the withdrawn representation's state **was**: past any trailing
withdrawal rows (repeated calls must not break the explanation), its latest preceding
non-withdrawal act must have left it `operative = true`.

| | |
|---|---|
| `extraction(true) → withdrawal(false)` | explains the absence |
| `replacement(false) → withdrawal(false)` | explains nothing |

## B44 — the ambiguity record explains a subject, not a Work

I6 excused any unacted representation whose **Work** carried an open `multiple_legacy_arrivals`
record. The migration refuses currency for **one** backfilled representation built from **one**
selected arrival — so a later, unacted representation inherited the old excuse by sharing a
`manuscript_id`, which is precisely the generic *"ignore this"* marker §VII exists to prevent.

The exception is now subject-bound: the record must be open, on the same Work, the representation
must have existed **no later than** `noticed_at` (equality is required — the migration creates both
in one transaction, so the two timestamps are the same `now()`), and where the migration named
`earliest_arrival_id`, the representation must be the one built from it. Verified against the real
backfill: `arrival_matches = t`, `predates = t`.

## B45 — the stale `*migrate*` exemption

Repair 7 narrowed migration authority to the Compose service identity, but this witness kept its own
copy of the old substring rule, so a container merely **named** `maia-migrate-helper` could hold
owner material and vanish from the final constitutional census. Same defect class as B41, in the
exemption instead of the invariant. It now calls `pt3_is_exempt()` — the already-accepted definition.
**One rule, one executable definition.**

## Cleanup is asserted, not predicted (§IX)

The success line printed `residue 0` **before** the EXIT trap ran, and `cleanup()` swallows its own
errors with `|| true` — so the number was a claim about what was about to happen. Cleanup is now
called explicitly on the success path and the fixture tables are **read afterwards**; a non-zero
reading exits 1. Lifecycle tombstones are reported separately, and the count is now labelled for
what it is — accumulated across every run on the disposable database, because the table is
append-only and does not reset.

## The new controls falsify

A control that passes under both the old and new definitions proves nothing. Both were proven
discriminating on their own fixture shapes, in rolled-back transactions:

```
CASE 6  operative currency: f
        repair-9  predicate says EXPLAINED : t
        repair-10 predicate says EXPLAINED : f

CASE 7  two unacted representations on one genuinely ambiguous Work
        repair-9  I6 detects : 0   (both excused by sharing the Work)
        repair-10 I6 detects : 1   (only the later, unbound one)
```

Cases 5 and 6 are opposite directions of the same law: an **earlier** withdrawal must not excuse a
**later** loss; a **later** withdrawal must not excuse an **earlier** one.

## Evidence executed on this SHA

```
pt3-currency-absence-regression.sh          30 PASS · 0 FAIL · exit 0
  MULTI-ARRIVAL                  EXPLAINED
  WITHDRAWAL                     EXPLAINED
  NEGATIVE                       DETECTED
  UNRECORDED REPRESENTATION      DETECTED
  STALE WITHDRAWAL               DETECTED
  NON-CAUSAL LATE WITHDRAWAL     DETECTED
  LATE UNACTED REP ON AMBIGUITY  DETECTED

shared invariants vs the real legacy-backfill shadow
  unexplained absence 0 · unrecorded representation 0 · false ambiguity 0 · ambiguity with currency 0

teardown
  live fixture residue   0 — ASSERTED by reading the fixture tables after cleanup
  lifecycle tombstones   retained by law
```

**Inherited from `744c8012…`, byte-identical blobs re-verified, NOT re-executed:** falsifier
`25 · 0 · 0` · enforcement `29 · 0` · pool witness `READY`, six sites · the PT-3 migration.

⛔ **Still unexecuted:** the integrated Compose cutover, the Docker-bound quiesced backfill,
readiness `READY`, post-cutover `READY`. Image layers remain `403 Forbidden` from the organization
egress policy.

## Standing

⛔ **PT-3 is enforced in code and not in production.** Production HELD · Experiences HELD ·
Encounter HELD.

---

# Repair 11 — B46 (runbook only)

**Authority:** FOUNDER RULING — Writer's Studio, 2026-09-08 §X–§XI. **Documentation-only.**
⛔ No executable changed: every PT-3 script and the migration are byte-identical to
`133c793dc28245f4c8234facda9b7d10169b67f4`, proven by `git hash-object`. The `30/30` regression is
therefore **not rerun**; it stands as evidence for unchanged blobs.

## B46 — Step 4 repeated B40 one step later

Step 3 fixed B40 by opening an interactive production session and pasting the literal block the
preflight printed, so `MAIA_BUILD_CONTEXT` exists **in the remote shell**. Step 4 then went back to
`[MAC→PROD]`:

```bash
ssh soullab@minisforum "sh $MAIA_BUILD_CONTEXT/scripts/witness/pt3-cutover-readiness.sh"
```

The double quotes make the **Mac's** shell expand `$MAIA_BUILD_CONTEXT` before SSH — and the runbook
never establishes it as a Mac-shell variable; it only ever tells the operator to export it inside the
production session. Unset locally, the transmitted command becomes `sh /scripts/witness/…`: safe,
and broken. The same class B40 already eliminated, reintroduced by a second remote-command form.

**Repair:** Step 4 is now `[PROD]` and stays in the session opened for Step 3, where the preflight's
exports are still live. No second quoting layer exists to get wrong.

```bash
sh "$MAIA_BUILD_CONTEXT/scripts/witness/pt3-cutover-readiness.sh"

PT3_ACCEPTED_SHA="$ACCEPTED_SHA" \
  sh "$MAIA_BUILD_CONTEXT/scripts/witness/pt3-post-cutover-witness.sh"
```

This also preserves the sibling requirement: the post-cutover witness runs from its materialized
snapshot and can source both `pt3-currency-invariants.sh` and `pt3-compose.sh`. Piped over stdin it
has neither and returns **INCONCLUSIVE** rather than pretending to judge.

The only remaining occurrences of the `ssh "… $MAIA_BUILD_CONTEXT …"` shape in the tree are the two
places that **describe** the defect — this repair note and the preflight's own warning.

## Evidence

```
executables vs 133c793d          14 files · all byte-identical
inherited subjects vs 744c8012    4 files · all byte-identical
commit change set                 2 documentation files
                                  · the cutover runbook
                                  · this record (the B46 audit/closure note)
```

> **Record correction (founder, same day).** This block first read
> `working tree change set 1 file · the runbook`. It was measured before the record you are reading
> was added to the same commit, so it counted the tree at the moment of measurement and then the
> commit grew. The count is corrected in place rather than deleted — *a witness is a reading at a
> time, and the honest repair is to date it.* No technical consequence follows: both files are
> documentation and no executable moved.

**Carried forward, not re-executed:** regression `30 PASS · 0 FAIL · exit 0` across seven cases ·
shared invariants on the legacy shadow `0 · 0 · 0 · 0` · live fixture residue `0` asserted ·
falsifier `25 · 0 · 0` · enforcement `29 · 0` · pool witness `READY`, six sites.

⛔ **Still unexecuted:** integrated Docker/Compose cutover rehearsal, the Docker-bound quiesced
backfill, readiness `READY`, post-cutover `READY`. Image-layer `403 Forbidden` remains the
infrastructure blocker, and no further source review substitutes for it.

## Standing

⛔ **PT-3 is enforced in code and not in production.** Production HELD · Experiences HELD ·
Encounter HELD.
