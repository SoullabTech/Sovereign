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
