# WS2-07 · BUILD-07F — production promotion runbook

> **PREPARATION ONLY. Nothing in this document has been executed. Production promotion is NOT
> authorized; the consent checkpoint in §2 has NOT been given. Every command below is run by the
> founder from the Mac Studio against minisforum — this runbook is written by an agent with no
> shell on either host and no production database contact.**

```text
UNIT             BUILD-07F  DEVELOPMENTAL DECISIONS
CANONICAL        cb557b8fb057a8c5944abd1e1e9b479aa66091ef
DEPLOY TARGET    cb557b8f
SOURCE / CI      ACCEPTED · MERGED (PR #1229, exact-head CI 8/8)
MIGRATION        20260906000001_developmental_observation_standing.sql
STATE            PRODUCTION DEPLOY NOT AUTHORISED
```

---

## 1 · Why this is the FULL deploy path, not the quick one

```text
scripts/pre-deploy-gate.sh deploy-maia <SHA>     ← NOT THIS
scripts/deploy-production.sh deploy cb557b8f     ← THIS
```

The quick path rebuilds **only** the `maia` service and **runs no migrations**. 07F ships a schema
change, so a quick deploy would put code that reads and writes
`developmental_observation_standing_events` in front of a database that does not have it. The full
path acquires the deploy-lane lock, materializes the named commit into an isolated snapshot, builds
from that snapshot, tags for rollback, verifies provenance on both sides of the swap, and runs
migrations from the same snapshot.

---

## 2 · FOUNDER AUTHORIZATION — the behaviour change this deploy makes

**This is a consent item, not a consequence of merging. It has not been given.**

- [ ] **I knowingly authorize this production behaviour change.**

> The 07F migration adds a `BEFORE DELETE` trigger to the existing `developmental_readings` table,
> preventing direct deletion of a reading while its Work exists, while preserving whole-Work
> cascade deletion.

What that means in production, stated plainly so the consent is informed:

```text
DELETE FROM developmental_readings WHERE id = R    while its manuscript exists   → REFUSED
DELETE FROM member_manuscripts WHERE id = M        → reading cascade → standing cascade  → PERMITTED
```

- It is the **only** place 07F alters the behaviour of an existing production object. Everything
  else in the migration is additive.
- No code path in the repository issues a direct delete of a reading, so no running feature changes.
  The change is to what a future caller — including a human at `psql` — is able to do.
- It is required for the accepted D3 ruling to be structurally true rather than inferred from the
  absence of a route: the standing stream's own delete guard permits erasure exactly when its
  reading is already gone, and that inference is only sound if a reading cannot be removed while
  the Work stands.
- Reversing it later is one `DROP TRIGGER` — but see §7: while standing history exists, this trigger
  is part of the integrity path and should not be dropped merely to roll code back.

**Until this box is checked by the founder, do not proceed past this section.**

---

## 3 · Preconditions

```text
1  canonical is still cb557b8fb                     git fetch && git rev-parse origin/clean-main-no-secrets
2  the deploy lane is free                          a refusal prints the holder; NEVER delete .deploy.lock
3  .env.production exists, no REPLACE_ME values     the script refuses otherwise
4  run from the Mac Studio, executing on minisforum  ssh soullab@minisforum
5  §2 consent given
```

If canonical has moved, STOP: this runbook is bound to `cb557b8fb`, and a different SHA is a
different act.

---

## 4 · The sequence, and what each step guarantees

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && ./scripts/deploy-production.sh deploy cb557b8f'
```

| step | guarantee |
|---|---|
| `acquire_deploy_lock` | one deploy at a time; the record names the **asserted** SHA, not the checkout |
| `deploy_ctx_assert_and_materialize` | builds a `git archive` snapshot of the named commit — a concurrent checkout cannot change what is built; exports `GIT_COMMIT` |
| dependency audit | blocks on moderate+ vulnerabilities (`SKIP_AUDIT=1` overrides — do not use silently) |
| `pre-deploy-gate.sh disk` | refuses before the storage-expanding build |
| compose build (from snapshot) | image stamped with `GIT_COMMIT` / `APP_VERSION` / `BUILD_DATE` |
| `deploy_ctx_verify_image` | **pre-swap**: the built image carries the asserted stamp, or abort with the old container untouched |
| `tag_images_for_rollback` | `maia-sovereign:current` / `:previous` / `:<sha>` refreshed **before** the swap |
| `up -d` + `deploy_ctx_verify_running` | **post-swap, fail-closed**: the running container reports `cb557b8f`, or ABORT before migrations |
| `--profile migrate run --rm migrate` | applies pending migrations from the snapshot, recording each in `schema_migrations` |
| `run_smoke_tests` | HTTP-level post-deploy checks |

---

## 5 · STOP CONDITIONS

**The most important one first, because the script does not enforce it:**

> ⛔ **A FAILED MIGRATION DOES NOT ABORT THE DEPLOY.** `cmd_deploy` logs a warning block and then
> prints `Deployment complete!` and runs smoke tests anyway. For a schema-bearing deploy this is the
> hazard that matters: the new code would already be serving against a database without the table.
> **Read the migration output. Do not treat `Deployment complete!` as evidence that the migration
> applied.** §6 verifies it independently.

Also STOP — do not "fix forward" — on any of:

```text
deploy-lane refusal                    inspect the holder; never delete the lockfile
disk gate refusal                      free space first
pre-swap image verify failure          nothing swapped; investigate the build
post-swap provenance failure           the script aborts and points at `rollback` — take it
running GIT_COMMIT ≠ cb557b8f          rollback, then diagnose
any ERROR in the migration output      §7 rollback posture; the table may be half-created
smoke failures naming maia-sovereign   investigate before declaring the deploy good
```

**Expected benign output, so it is not misread as failure.** `run-sql-migrations.sh` wraps each file
as `-c "BEGIN;" -f "$f" -c "COMMIT;"`, and 07F's migration carries its own `BEGIN;`/`COMMIT;` (the
convention its sibling migrations follow). Postgres therefore emits:

```text
WARNING:  there is already a transaction in progress
WARNING:  there is no transaction in progress
```

Those are warnings, not errors; `ON_ERROR_STOP=1` does not trip on them, and the file's own
transaction is what commits. An `ERROR:` line is a different matter and is a STOP.

---

## 6 · Verification after the deploy — provenance, then schema

Run all of these. The first four are the standing post-deploy checks; the rest are specific to this
unit and are what actually establishes that 07F is present.

```bash
# 1 · container freshness (expect a timestamp under a minute old)
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"'

# 2 · LAN IP sanity (expect 192.168.0.104 — see the drift trap in CLAUDE.md)
ssh soullab@minisforum 'hostname -I'

# 3 · public reachability
curl -k https://soullab.life/api/health

# 4 · provenance — MUST be cb557b8f, never "unknown"
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'

# 5 · the migration is RECORDED (independent of the deploy's exit status)
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT filename, applied_at FROM schema_migrations \
    WHERE filename = '\''20260906000001_developmental_observation_standing.sql'\'';"'

# 6 · the objects exist — table + its two guards
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "\d developmental_observation_standing_events"'

# 7 · the middle-link guard is on the 07C table, and 07C'\''s own immutability trigger SURVIVES
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT tgname FROM pg_trigger \
    WHERE tgrelid = '\''developmental_readings'\''::regclass AND NOT tgisinternal ORDER BY tgname;"'
```

Expected from (7) — **both** rows, the second being the one this deploy adds:

```text
developmental_readings_immutable_check
developmental_readings_no_orphan_delete_check
```

If `developmental_readings_immutable_check` is missing, STOP: something removed a 07C guarantee.

---

## 7 · Rollback posture

**Code.** `./scripts/deploy-production.sh rollback` swaps back to `maia-sovereign:previous`. The
rollback tags are refreshed before the swap, so this is available immediately after the deploy.

**Database — asymmetric, deliberately.**

```text
NO standing event exists yet     the migration's documented EMPTY-TABLE-ONLY sequence may be run
ANY standing event exists        leave the table and its guards INERT. Do NOT drop recorded
                                 member acts to roll code back.
```

The reading-delete trigger stays while standing history exists: it is part of the integrity path
that makes the standing stream's own delete guard sound. Dropping it to "clean up" would silently
re-open the hole R1 closed.

No destructive rollback of member standing history is promised, in this runbook or in the PR.

---

## 8 · Two observed facts about the surrounding machinery

Recorded because the runbook should not repeat a claim it cannot verify:

1. **The Co-Lab release gate is not invoked by any deploy script.** `verify-colab-boundaries.ts`
   appears in no `scripts/*.sh`; `CLAUDE.md`'s statement that it "runs automatically as part of
   `scripts/deploy-production.sh` smoke tests" does not match the code as of `cb557b8fb`. Separately,
   **07F does not trigger that gate** — it touches no Co-Lab table, no studio people, DMs, sessions,
   files, memory atoms, onboarding or invitations. If the founder wants it run, it is manual:
   `docker exec maia-sovereign sh -c 'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-colab-boundaries.ts'`.
   Correcting `CLAUDE.md` is outside this act's scope and is left as a finding.
2. **`deploy` continues past a failed migration** (§5). This is the single largest hazard in
   promoting a schema-bearing commit through this path, which is why §6 verifies the migration
   independently rather than trusting the deploy's own success message.

---

## 9 · What this runbook does not do

```text
no execution · no production database contact · no minisforum action
no quick-path deploy · no migration edit · no implementation edit
no 07F closure — the acceptance walk (its own spec) comes first, then a founder act
no opening of BUILD-07G or 07H
```
