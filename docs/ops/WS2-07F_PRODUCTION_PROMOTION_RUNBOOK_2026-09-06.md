# WS2-07 · BUILD-07F — production promotion record

> **SUPERSEDED BY EVENTS. This began as a promotion runbook for an act that had not happened. It is
> now the RECORD of a promotion that occurred before its consent checkpoint was given. There is no
> deployment left for this lane to authorize: 07F's runtime and its migration are already in
> production. The prospective founder act that remains is in §2, and it is not the act this document
> originally reserved.**

```text
SUBJECT               BUILD-07F (PR #1229) + PR #1228, integrated
DEPLOYED RUNTIME      66da58b4c4a4979240db460c045dd9daf1cd47d3
07F MIGRATION         APPLIED IN PRODUCTION 2026-09-06 11:36:34+00
DELETE GUARD          LIVE
PRIOR §2 CONSENT      NOT GIVEN — the checkpoint was crossed by deployment
STANDING ACTS         0
07F ACCEPTANCE        NOT STARTED
```

---

## 0 · WHAT ACTUALLY HAPPENED — the consent checkpoint was crossed by a deployment

Established by read-only queries run from the founder's connected Mac Studio on 2026-09-06, not
inferred:

```text
CURRENT CANONICAL      66da58b4c4a4979240db460c045dd9daf1cd47d3
RUNNING GIT_COMMIT     66da58b4c
DEPLOY_LANE            deploy-lane
CONTAINER CREATED      2026-09-06T11:36:04.283455028Z
07F MIGRATION APPLIED  2026-09-06 11:36:34.367017+00
STANDING TABLE         PRESENT
STANDING EVENTS        0

developmental_readings triggers:
  developmental_readings_immutable_check          (07C, intact)
  developmental_readings_no_orphan_delete_check   (07F — the guard reserved for consent)
  developmental_readings_observations             (07C insert-shape check, intact)
```

**The behaviour change this document reserved for an explicit act is already live.** Container
creation and migration application fall in the same deployment window and the lane token is
`deploy-lane`, which is consistent with the full deploy path — but the reads establish *what is
true*, not which invocation caused it, and this record does not claim the latter.

### What is NOT done about it

**The §2 box is not checked retroactively.** It said consent must precede the behaviour change. It
did not. Marking it now would falsify the sequence, and a record that falsifies its own sequence is
worth less than no record.

### The one fact that keeps a clean decision available

```text
STANDING EVENTS = 0
```

No member judgment has been recorded under the new mechanism. Every option — proceed, or reverse —
is still available without destroying a member act, because there is no member act yet. That is the
boundary this record marks, and it closes the moment W3 of the acceptance walk creates the first
event.

### What the interval showed about the design

Between the deploy and these reads, the state was unknown to us. Had the migration NOT run, the live
surface would have degraded to *"Your standing could not be reached. Nothing has been changed."*
with its controls disabled — never to a false "No standing taken." The unknown-vs-UNSET repair
forced through source review did exactly what it was built to do in a situation nobody planned for.
That is a note about the design, **not** a mitigation of the governance fact above.

---

## 1 · The promotion path — RETAINED AS REFERENCE, not an instruction

**There is no deploy or migrate command in this document any more.** The acts it once instructed —
`deploy ccd1c50ce`, and the migrations-only fallback — have been overtaken by reality: production is
already at `66da58b4c` with the migration applied. Naming a target SHA here now would be an
instruction to redo something that is done.

What is worth keeping from that path, because a future promotion in this lane will need it:

```text
FULL vs QUICK      pre-deploy-gate.sh deploy-maia rebuilds only the maia service and runs NO
                   migrations; a schema-bearing commit must go through deploy-production.sh deploy,
                   which snapshots the named commit, builds from it, tags for rollback, verifies
                   provenance on BOTH sides of the swap (fail-closed), and migrates from the same
                   snapshot.
MIGRATION FAILURE  cmd_deploy does NOT abort on it. It warns, prints "Deployment complete!" and runs
                   smoke anyway — so a migration is never evidenced by the deploy's own success
                   message. Verify it independently (§3).
UNADJUDICATED      after any migration ERROR the database state is unadjudicated: each file runs
                   transactionally with ON_ERROR_STOP=1, so a failure inside the file rolls back, but
                   the migration's own COMMIT can succeed and the SEPARATE schema_migrations INSERT
                   can fail — objects present, ledger silent. Inspect both before retry or cleanup.
BENIGN WARNINGS    the runner wraps each file in BEGIN;/COMMIT; and this lane's migrations carry
                   their own, so Postgres emits "there is already a transaction in progress" and
                   "there is no transaction in progress". Warnings, not errors.
```

Any future use of this path is a new act: it names its own SHA, and it takes its own consent.

---

## 2 · FOUNDER AUTHORIZATION — now prospective, because the original act was overtaken

### 2.1 What this section reserved, and what happened to it

> The 07F migration adds a `BEFORE DELETE` trigger to the existing `developmental_readings` table,
> preventing direct deletion of a reading while its Work exists, while preserving whole-Work cascade
> deletion.

- [ ] ~~I knowingly authorize this production behaviour change.~~ **NEVER GIVEN.**

**Left unchecked deliberately and permanently.** The guard went live at 2026-09-06 11:36:34+00
without this act. Checking it now would say consent preceded the change; it did not. The empty box
is the record of that, and this section does not become a retroactive authorization by sitting above
the one below.

What the change means in production — unchanged, and now live:

```text
DELETE FROM developmental_readings WHERE id = R    while its manuscript exists   → REFUSED
DELETE FROM member_manuscripts WHERE id = M        → reading cascade → standing cascade  → PERMITTED
```

No code path in the repository issues a direct delete of a reading, so no running feature changed.
The change is to what a future caller — including a human at `psql` — is able to do.

### 2.2 The act that is actually open now

Prospective, not retroactive, and the founder's alone:

> **I acknowledge that the 07F migration was applied before its explicit consent checkpoint was
> given. I do not retroactively authorize that deployment. I now authorize the 07F standing
> behaviour to remain in production and authorize the production acceptance walk to create standing
> events.**

- [ ] **Given.**

**This gates the WALK, not a deploy.** Until it is given, W1 (read-only provenance and schema) may be
run; **W3 must not** — it creates the first durable member standing act, and `standing_events = 0`
is the boundary that keeps every option open (§0).

If it is not given, stop. The table is empty, so reversal destroys no member act — but reversal
needs its own plan against current canonical, and "drop the table" is not that plan: it would leave
the live 07F surface reaching a resource that no longer exists. See §4.

---

## 3 · Establishing the production state — the reads that produced §0

These are the queries that established §0, and the procedure for re-establishing it. All are
read-only. Container freshness is comparative — an id and a window, never a stopwatch: the deploy
waits for startup, migrates, then runs the full constitutional suite, which legitimately exceeds a
minute, so a threshold would fail a correct deploy and pass a stale one.

```bash
# 1 · container identity and creation window (observed: 2026-09-06T11:36:04.283455028Z)
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Id}} {{.Created}}"'

# 2 · LAN IP sanity (expect 192.168.0.104 — see the drift trap in CLAUDE.md)
ssh soullab@minisforum 'hostname -I'

# 3 · public reachability
curl -k https://soullab.life/api/health

# 4 · provenance and lane (observed: 66da58b4c · deploy-lane)
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT; \
  docker exec maia-sovereign printenv DEPLOY_LANE'

# 5 · the migration is RECORDED (observed applied 2026-09-06 11:36:34.367017+00)
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT filename, applied_at FROM schema_migrations \
    WHERE filename = '\''20260906000001_developmental_observation_standing.sql'\'';"'

# 6 · the objects exist — table + its two guards
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "\d developmental_observation_standing_events"'

# 7 · the guards on the 07C table — 07C's own must SURVIVE alongside 07F's
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT tgname FROM pg_trigger \
    WHERE tgrelid = '\''developmental_readings'\''::regclass AND NOT tgisinternal ORDER BY tgname;"'
```

Observed from (7) — all three, 07C's two intact beside 07F's one:

```text
developmental_readings_immutable_check          (07C)
developmental_readings_no_orphan_delete_check   (07F)
developmental_readings_observations             (07C insert-shape check)
```

If `developmental_readings_immutable_check` ever goes missing, STOP: something removed a 07C
guarantee.

**And the boundary fact, to be re-read immediately before the walk:**

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT count(*) AS standing_events FROM developmental_observation_standing_events;"'
```

Observed **0**. While it is 0, no member judgment exists under this mechanism and every option is
open. W3 of the walk is what ends that.

---

## 4 · Reversal posture — if the §2.2 act is NOT given

This is no longer "rollback after our deploy" — the deploy was someone else's act and canonical has
moved twice since. Reversal now needs its own plan against **current** canonical, and this section
states only what must hold in any such plan.

**Code.** `deploy-production.sh rollback` swaps to `maia-sovereign:previous`, which is *not*
07F-shaped: it is whatever preceded the deploy that carried both units. Reversing 07F specifically
would be a new commit reverting its runtime, deployed as its own act — not a tag swap.

**Never leave the live surface reaching a resource that is gone.** Dropping the table under running
07F code is not a reversal; it is the broken state §0 describes as the quick-path hazard. Runtime
must go first, or not at all.

**Database — asymmetric, deliberately.**

```text
NO standing event exists yet     the migration's documented EMPTY-TABLE-ONLY sequence may be run
ANY standing event exists        leave the table and its guards INERT. Do NOT drop recorded
                                 member acts to roll code back.
```

The reading-delete trigger stays while standing history exists: it is part of the integrity path
that makes the standing stream's own delete guard sound. Dropping it to "clean up" would silently
re-open the hole R1 closed.

No destructive rollback of member standing history is promised, in this record or in the PR. Today
the table is empty, so the first branch applies — but only until W3.

---

## 5 · Two observed facts about the surrounding machinery

Recorded because the runbook should not repeat a claim it cannot verify:

1. **The Co-Lab boundary verifier IS run automatically by the full deploy.** `run_smoke_tests`
   executes `scripts/constitutional-verification.sh` inside the container, and that orchestrator
   registers Co-Lab as a **required** verifier — a failure blocks the release gate:

   ```text
   scripts/verify-constitution-colab.ts | Co-Lab Boundaries | true
   ```

   The legacy filename `verify-colab-boundaries.ts` is **not** the current entry point; the boundary
   matrix lives in `verify-constitution-colab.ts`. On success the deploy reports the constitutional
   gate as PASS and does **not** echo the verifier's detailed per-check output — it captures the
   output and prints it only on failure. Run the verifier manually only if a retained per-check
   Co-Lab witness is wanted:

   ```bash
   ssh soullab@minisforum 'docker exec maia-sovereign sh -c \
     "DATABASE_URL=\$DATABASE_URL bash scripts/constitutional-verification.sh"'
   ```

   Note for reading that output: in the same registry, **`Development` is `required=false`** — it
   warns rather than blocks. More to the point, **it is not evidence for BUILD-07F.** That verifier
   covers Vision Studio, harvests, episodic memory and the authored-vs-inferred developmental
   substrate; it does not verify 07F's standing invariants at all. **07F rests on its own standing
   gates and its own production walk**, and a PASS or a WARN on that line says nothing about this
   unit either way.

2. **`deploy` continues past a failed migration** (§5). This is the single largest hazard in
   promoting a schema-bearing commit through this path, which is why §6 verifies the migration
   independently rather than trusting the deploy's own success message.

---

## 6 · The deployed program — measured, and the two acceptance records it feeds

### 6.1 Bounded integration check, rerun on the DEPLOYED program (read-only, 2026-09-06)

The acceptance subject is now `66da58b4c` — the program actually running in production — so the set
was rerun there rather than carried over from `ccd1c50ce`. #1228's only overlap with 07F is in
`app/writers-studio/develop/DevelopRoom.tsx`: one early return added inside `refusalSentence`, a
pure function over commission outcomes, handling `partition_not_recorded`. It touches no standing
state, no `YourStanding`, and none of 07F's reading-addressed transitions (`beginRefresh`,
`settleLookup`, `adoptInto`). Same file, different concern.

Measured in a detached worktree at `66da58b4c` — no branch moved, nothing deployed:

```text
standing gates + surface + evidence gate   254 checks · 0 failures
persistence falsification                   15 checks · 0 failures
write-boundary falsification                14 checks · 0 failures
npm run typecheck                           no regressions
```

The same set at `ccd1c50ce` gave the same result; the intervening canonical delta is the
Journal/Reflections lane (`lib/maia/presence/place.ts` and its contracts), which touches no 07F file.

This is still a **static** result, not a production one. It says the deployed program satisfies 07F's
own gates when run here; it says nothing about the running container, which is what the walk is for.

### 6.2 #1228's acceptance — a SEPARATE sequence, run FIRST

Not folded into W1–W12b. Its own lane's post-merge witness, run on the shared `66da58b4c` runtime — **if it has not already been completed in its own lane**:

```text
1  Keep a version on the affected Work (the one that reproduced the defect)
2  verify the newest revision carries its section partition
3  DEVELOP reaches the next honest boundary rather than `partition_not_recorded`
```

Run first, because it removes a known obstruction in the very path 07F's walk then needs for
commissioning and re-reading (W9). **Passing this does not count as a 07F witness, and passing 07F
does not close #1228.**

### 6.3 Attribution

```text
DEPLOY / PROVENANCE   shared evidence: exact 66da58b4c runtime
        │
        ├── #1228 ACCEPTANCE   the three steps above
        └── 07F ACCEPTANCE     W1–W12a/b exactly as frozen in the walk spec
```

---

## 7 · The older-ancestor question, closed

Deploying `cb557b8f` to keep the lanes separate was considered, then dropped: authority is preserved
by separate acceptance records, not by forcing production to run an older program — and the older
program was actively worse for 07F's own walk, since without #1228 a Work converted before
2026-09-06 can report `ready` and still refuse `partition_not_recorded` in the path W9 needs.

It is now moot in fact as well as in principle: production runs `66da58b4c`, and there is no
deployment left for this lane to authorize.

---

## 8 · What this record does not do

```text
no retroactive authorization of the deployment that crossed §2
no execution · no production database contact · no minisforum action
no deploy or migrate instruction — those acts are done (§1)
no migration edit · no implementation edit
no 07F closure — the acceptance walk (its own spec) comes first, then a founder act
no opening of BUILD-07G or 07H
```

The next act is the founder's §2.2 decision. Everything downstream of it — #1228's retained witness,
then frozen W1–W12b — waits on that.
