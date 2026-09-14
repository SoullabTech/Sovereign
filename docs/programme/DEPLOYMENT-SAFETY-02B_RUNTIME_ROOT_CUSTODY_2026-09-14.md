# DEPLOYMENT-SAFETY-02B · RUNTIME ROOT / DEPLOY-LANE CUSTODY

**Founder ruling** 2026-09-14, on the first O1 production attempt at
`3f4b722680337408c3970045fc6845ccdf5d4d09`.
⛔ **No production act · no S3 change · no migration change · no
`deploy-production.sh` change · no general-rollback repair.**

---

## 1 · THE DEFECT — ONE SUBSTITUTION, THREE CORRUPTIONS

⭐⭐ **Two roots are deliberately different, and the bootstrap conflated them.**

```text
CODE / DEPLOYMENT STRUCTURE   the immutable candidate snapshot
OPERATIONAL RUNTIME ROOT      /home/soullab/MAIA-SOVEREIGN
```

The bootstrap worktree that gets the runbook onto disk is the **candidate** root.
`PROJECT_DIR` defaulted to `$SCRIPT_DIR/..`, so running from that worktree
silently made it the **runtime** root too:

```text
.deploy.lock        → /tmp/tmp.7G8p3TanOH/.deploy.lock   ⛔ NO MUTUAL EXCLUSION
.env.production     → absent, so compose parsed with no operational env
runtime project dir → wrong bind/runtime root
```

Confirmed in the live log (`[deploy-lock] acquired /tmp/tmp.7G8p3TanOH/.deploy.lock`)
and in code: `DEPLOY_LOCK_FILE="${DEPLOY_LOCK_FILE:-$PROJECT_DIR/.deploy.lock}"`
is frozen **when `deploy-lock.sh` is sourced**, not when the lock is acquired.

⚠️ **The build failure was the SMALL symptom.** Had `.env.production` happened to
be present, the act would have migrated and swapped **outside the deploy lane,
silently.** ⭐ A missing secret is what made an invisible defect visible.

⛔ **This defect is mine.** It arrived with the bootstrap correction three acts
earlier — I closed the "runbook source custody" hole and opened a runtime-root
hole in the same stroke.

---

## 2 · THE REPAIR

⭐ **Order is the repair.** The assertion runs **before any helper is sourced**,
because correcting `PROJECT_DIR` afterwards would be too late for the lock path.

```text
SCRIPT_DIR = pinned candidate location
        ↓
require explicit PROJECT_DIR          ⛔ no fallback to $SCRIPT_DIR/..
canonicalize (pwd -P)
assert IDENTITY == production runtime root
assert .env.production exists
assert docker-compose.production.yml exists
assert git worktree top == PROJECT_DIR
        ↓
source deploy-lock.sh · deploy-context.sh · deploy-tag.sh
        ↓
assert DEPLOY_LOCK_FILE == $PROJECT_DIR/.deploy.lock
```

⭐⭐ **IDENTITY FIRST, SHAPE SECOND — the founder's correction, and it is the
load-bearing one.** *Presence proves shape, not identity.* A lookalike directory
holding a `.env.production` and a compose file would pass a shape test, so the
canonical path must match the production root before the file checks run at all.

**Preserved unchanged:** `SCRIPT_DIR` and all four helpers stay **candidate-pinned
and hash-proved**; `DEPLOY_SOURCE_REPO` stays the real production repo;
`MAIA_BUILD_CONTEXT` stays the immutable candidate archive.

⭐ **`recover` carries the same custody for free** — the assertion is at load time,
so the forward act and the recovery path are covered by one gate. That matters:
`rb_recover` reads the runtime compose and env straight from `PROJECT_DIR`, so a
recovery launched from a temp worktree would have operated on the wrong root.

**Stale prose corrected.** Four claims said *five* where the governed array holds
three. All now derive from `${#RB_EXPECTED_PENDING[@]}`:

```text
Pending set matches the exact proved act scope (N files)
Migrating the exact proved act scope from the candidate snapshot (N files)
the exact proved migration set applied successfully
```

⭐ *The array remains the law; prose must accurately describe it* — and a success
line that misnames what it verified is the same species of defect as a guard that
does not check.

---

## 3 · THE WITNESS — **76 passed · 0 failed**

⭐⭐ **The gap that let the first act through is now lethal.** The harness stubbed
the lock and never asked **where** it landed, so a lock in a throwaway directory
passed every check.

```text
RUNTIME ROOT — refusals, each proved to happen BEFORE any helper or lock
  PROJECT_DIR unset                                  refuses
  PROJECT_DIR = a pinned temp worktree               refuses
  PROJECT_DIR = a LOOKALIKE dir with the right files refuses   ⭐ identity, not shape
  PROJECT_DIR = a nonexistent path                   refuses
  recover from a temp root                           refuses

RUNTIME ROOT — the good case
  the deploy-lane lock resolves to the production root's .deploy.lock
  the lock path is INSIDE the verified runtime root
  PROJECT_DIR has NO fallback — supplied, or the act refuses

PROSE
  no stale five-file claim survives
```

Each refusal is asserted twice: non-zero exit **and** no `acquired` line — a
refusal that still took a lock would fail.

All prior properties remain green: self-pin and hash-proof of all four helpers ·
exact-three act scope in both directions · build → recovery pin → migrate → swap
→ provenance → Co-Lab → complete · both discrimination cases (swap-before-migrate,
recovery leaving `:prod` on the candidate).

Neighbours: `verify:migrate-fail-closed` **14/0** · `verify:deploy-provenance`
**27/0** · `verify:deploy-lock` **25/0**.
⛔ Untouched: the four deployment helpers, `deploy-production.sh`, S3
route/application code, every migration, and the CLAUDE.md anchor.

---

## 4 · WHAT THE FAILED ACT ESTABLISHED — A POSITIVE RESULT

⭐ **The corrected three-file act scope PASSED against the real production ledger.**
DS-02A is substantively vindicated by the very run that failed.

```text
candidate               3f4b722680337408c3970045fc6845ccdf5d4d09
self-pin                ✅ runbook + 4 helpers hash-matched
exact-three act scope   ✅ PROVED IN REAL PRODUCTION
lock                    ❌ WRONG PATH  → this lane
build                   ❌ failed (no operational env)
migration               ❌ NONE
recovery image          ❌ NONE
swap                    ❌ NONE
production reader       ✅ UNCHANGED
production schema       ✅ UNCHANGED
```

⛔ What remains is **operational-root custody, not another S3 or schema question.**

---

## 5 · THE CORRECTED COMMANDS

`PROJECT_DIR` is now explicit — the act refuses without it.

```bash
# THE ACT
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git fetch origin clean-main-no-secrets && WT=$(mktemp -d) && git worktree add --detach "$WT" NEW_SHA && PROJECT_DIR=$HOME/MAIA-SOVEREIGN "$WT/scripts/s3-schema-first-runbook.sh" NEW_SHA; RC=$?; git worktree remove --force "$WT" >/dev/null 2>&1; exit $RC'

# RECOVERY, only on a late failure
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && WT=$(mktemp -d) && git worktree add --detach "$WT" NEW_SHA && PROJECT_DIR=$HOME/MAIA-SOVEREIGN "$WT/scripts/s3-schema-first-runbook.sh" recover NEW_SHA; RC=$?; git worktree remove --force "$WT" >/dev/null 2>&1; exit $RC'
```

⛔ `NEW_SHA` is this repair's merge-result SHA, captured from the merge — never a
re-resolved canonical tip.

---

## 6 · STANDING

```text
DS-02B repair            ✅ MADE · witness 76/0
runtime root custody     ✅ identity-verified before any helper is sourced
deploy-lane lock         ✅ proved to land in the production lane
recover                  ✅ same custody
stale prose              ✅ corrected, derived from the array

canonical admission      ⏸ PR owed
PRODUCTION ACT           ⏸ HELD until this merges and its SHA is captured
PRODUCTION               UNTOUCHED
```

⚠️ **This is the fourth deployment lane.** Per the founder's standing line: no
fifth unless the next act discovers an actual falsifier. The goal is to close S3
and return to Writer's Studio.

---

# CORRECTION · THE IDENTITY WAS STILL CONFIGURABLE (founder review, pre-admission)

⭐⭐ **The first DS-02B cut wrote the root as `${RB_PRODUCTION_ROOT:-…}` — so the
caller could redefine what "the production root" means:**

```bash
RB_PRODUCTION_ROOT=/tmp/lookalike PROJECT_DIR=/tmp/lookalike  scripts/…runbook.sh
```

⛔ A guard whose whole purpose is *identity cannot be manufactured by an
environment variable* was itself manufacturable by an environment variable. ⛔ And
I used that very seam in my own witness to build a fixture root — **the test seam
was living inside production authority.**

## The repair

```bash
readonly RB_PRODUCTION_ROOT="/home/soullab/MAIA-SOVEREIGN"
```

No `${…:-…}`, no override. `readonly` with a literal makes an exported value
inert — bash overwrites it at the assignment (verified directly).

**The harness now mutates a DISPOSABLE COPY** whose literal points at a fixture
root. Functional checks run against that copy; ⭐ the STATIC checks and the digest
guard run against the real file, so production authority carries no test seam.

## ⚠️ AND THE PROBE EXPOSED A WEAKNESS IN MY OWN ASSERTION

Checking discrimination directly showed the pre-repair form **accepted** the
lookalike (`Runtime root verified`) and *still exited non-zero later* — so a
check written as *"refused ⇔ non-zero exit"* would have passed it.

⭐ **The exit code was never the discriminator. The guard's own verdict is.**
Every runtime-root assertion now keys on `Runtime root verified` / `not the
production runtime root`, never on `$?`.

## Witness — **80 passed · 0 failed**

```text
RUNTIME ROOT
  unset · temp worktree · lookalike · nonexistent · recover-from-temp   refuse
  the lock resolves to the production root's .deploy.lock
  an environment override CANNOT redefine the production root
  the production root is a readonly LITERAL in the real runbook
  the real runbook derives NOTHING about its root from the environment

⭐⭐ DISCRIMINATION
  the pre-repair overridable form IS detected as accepting a lookalike
  swap-before-migrate mutant                       DETECTED
  recovery leaving :prod on the candidate          DETECTED
```

Neighbours: 14/0 · 27/0 · 25/0. ⛔ Untouched: the four helpers,
`deploy-production.sh`, S3 code, every migration, the CLAUDE.md anchor.

⚠️ **Head moved** — the authorized head for #1288 is superseded by this correction.
The new head needs inspection before the protected merge gate is renewed.
