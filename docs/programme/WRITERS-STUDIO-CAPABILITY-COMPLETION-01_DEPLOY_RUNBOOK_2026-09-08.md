# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## DEPLOY RUNBOOK — founder-run

**Subject** `claude/writers-studio-capability-clxw8d` @ `7a2ee5dce`
**Production branch at time of writing** `clean-main-no-secrets` @ `379c9b40a`
**Written by** a remote session with **no `ssh` binary** — this session could not
deploy and did not merge. Every command below is yours to run.

**Purpose of deploying:** production has a model key. **The keyed warmth witness
is not possible anywhere else.**

---

## WHAT SHIPS

```text
27 code / script files      Notes v1 · Goals v1 · Goals Support Phase 1
                            + the D1–D4 declaration-truth repair
 3 migrations               20260907000010_writer_notes
                            20260907000011_writer_goals
                            20260907000012_writer_goal_support
57 docs                     the lane record
```

Merges clean into `clean-main-no-secrets` (31 commits, 0 conflicts, verified).

## ⚠️ TWO THINGS TO KNOW BEFORE STEP 1

**1 · The merge is itself latent schema authorization.** Per the 2026-09-07
SCHEMA DRIFT finding, once migrations land on `clean-main-no-secrets` **the next
full deploy applies them — whoever runs it, for whatever reason.** That is the
BRANCH GATE defect, still open. Steps 1 and 2 below are therefore one decision,
not two.

**2 · Code lands before schema, and a failed migrate only warns.**
`deploy-production.sh` orders build → swap → provenance verify → **migrate**,
and a failed migrate `log_warn`s while still printing "Deployment complete!".
**A green deploy is not evidence a migration ran** — hence step 4, which is not
optional here: `Notes` and `Goals` are declared `in-room`, so they are
actionable in the rail, and without their tables the Goals region sits on
"reading…" and both APIs return 500.

---

## 1 · MERGE (Mac Studio)

```bash
git fetch origin
git checkout clean-main-no-secrets
git pull origin clean-main-no-secrets
git merge --no-ff origin/claude/writers-studio-capability-clxw8d
git push -u origin clean-main-no-secrets
```

Expect the push to report *"Bypassed rule violations … 4 of 4 required status
checks are expected."* That is the known open finding about this branch, not a
new fault.

## 2 · FULL DEPLOY (must be the full path — there are migrations)

⛔ **Not** `pre-deploy-gate.sh deploy-maia` — the quick path rebuilds `maia`
only and **runs no migrations.**

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && scripts/deploy-production.sh deploy "$(git rev-parse --short origin/clean-main-no-secrets)"'
```

## 3 · VERIFY THE DEPLOY

```bash
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"'   # < 1 min old
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'          # the SHA you named
ssh soullab@minisforum 'hostname -I'                                             # 192.168.0.104
curl -k https://soullab.life/api/health
```

## 4 · VERIFY THE SCHEMA ACTUALLY LANDED — **not optional**

```bash
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"SELECT tablename FROM pg_tables WHERE tablename IN ('writer_notes','writer_goals');\""

ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint \
    WHERE conrelid='writer_notes'::regclass AND contype='f';\""
```

Expect both tables, and on `writer_notes`:

```text
section_id     ... ON DELETE SET NULL     ← FR-08. If this reads CASCADE, STOP:
                                            a prose edit would delete a
                                            writer's thinking.
manuscript_id  ... ON DELETE CASCADE
living_work_id ... ON DELETE SET NULL
```

And the FR-13 grant column:

```bash
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"SELECT column_name, column_default FROM information_schema.columns \
    WHERE table_name='writer_goals' AND column_name='support';\""
# expect default 'track_only'
```

## 5 · CONFIRM THE WITNESS IS EVEN POSSIBLE

```bash
ssh soullab@minisforum 'docker exec maia-sovereign sh -c \
  "test -n \"\$ANTHROPIC_API_KEY\" && echo key-present || echo NO-KEY"'
```

**If this prints `NO-KEY`, the warmth witness cannot run in production either**,
and Phase 1 stays UNWITNESSED regardless of the deploy.

## 6 · CO-LAB RELEASE GATE — before any tester wave

```bash
ssh soullab@minisforum 'docker exec maia-sovereign sh -c \
  "DATABASE_URL=\"\$DATABASE_URL\" npx tsx scripts/verify-constitution-colab.ts"'
```

Pass condition is the **failed** column, never the total: `0 failed`.

## 7 · THE WITNESS ITSELF

Bound at four layers, on a real Work:

```text
SOURCE     the GIT_COMMIT printed in step 3
ACT        declare a goal · mark one met · release one   (grant = encourage)
RESPONSE   the response produced by that specific act
READ       your experience of the language
```

> **Can MAIA actually sound warm, companionable and alive inside those
> constraints — without making her approval the emotional reward for the
> writer's act?**

Silence is a lawful outcome. **Permanent silence across all three acts is
failure evidence**, not success — record it as such.

## IF IT GOES WRONG

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && scripts/deploy-production.sh rollback'
```

Rollback restores the **image**. It does **not** drop the three tables — they are
additive and touch no existing table, so leaving them in place is safe and
reversible by a later decision rather than under pressure.

## STANDING

```text
MERGE      NOT PERFORMED by this session
DEPLOY     NOT PERFORMED by this session (no ssh available here)
BRANCH     clean-main-no-secrets untouched at 379c9b40a
```
