# PT-3 production cutover — runbook (repair 5, orchestrated)

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §XIV. Final bounded integration repair.
**Supersedes** every earlier runbook (`dcce6f97`, `e4207656`, `0819d749`, `ceee18cc`, and repair 4's
eight-step manual sequence); none is to be run.
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

## Step 2 · `[MAC→PROD]` — bring the canonical Compose forward

```bash
ssh soullab@minisforum "cd ~/MAIA-SOVEREIGN \
  && git fetch -q origin claude/pt3-runtime-integration \
  && git checkout $ACCEPTED_SHA -- docker-compose.production.yml \
  && git diff --stat HEAD -- docker-compose.production.yml"
```

The one file that must exist on production's checkout, because the migrate service reads it.
It declares `env_file: .env.migrate` for migrate and `.env.postgres` for postgres — **required
files, not interpolated variables**, so a missing one is a hard failure rather than a silent empty
credential (§XIII).

## Step 3 · `[PROD]` — ⭐ THE CUTOVER. One command, one lock, one outage.

```bash
ssh soullab@minisforum bash -lc "'
  export ACCEPTED_SHA=<full 40-char sha>
  export MAIA_BUILD_CONTEXT=<SNAP from preflight>
  export MIGRATION_RUN_ID=<run id from preflight>
  bash $MAIA_BUILD_CONTEXT/scripts/pt3-cutover.sh
'"
```

The orchestrator performs, under a single held deploy-lane lock:

| | Act | Runtime |
|---|---|---|
| 1 | stage owner authority into `.env.migrate` / `.env.postgres` | serving |
| 2 | verify migration authority (fail-closed; resolved role must **be** the protected tier's owner; a pre-existing `maia_app` aborts) | serving |
| 3 | **build** the PT-3 image — prepared, not started | serving |
| 4 | **QUIESCE** — the outage begins; the stopped set is recorded | stopped |
| 5 | apply exactly the PT-3 migration, attributed | stopped |
| 6 | verify migration, attribution and scope (one row · full 40-char commit · **0** Experience tables · **1** `maia_app`) | stopped |
| 7 | ⭐ **assert the deterministic backfill** — `pt3-verify-backfill.sh` | stopped |
| 8 | generate the `maia_app` credential; move runtime authority out of the universal environment | stopped |
| 9 | ⭐ **RELEASE** — the single release act; the recorded set returns on the new image | serving |
| 10 | prove the running image and the constrained authority | serving |

⛔ **Any failure before step 9 leaves the runtime QUIESCED, deliberately.** The script says so.
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
| an application pool reconnecting as the owner | `pt3-runtime-pool-witness.ts` — discovery + source + exercise |
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
