# DEPLOYMENT-SAFETY-02 · O1 — CANDIDATE-PINNED SCHEMA-FIRST RUNBOOK

**Founder ruling** 2026-09-14 — **O1 selected, bounded to this exact production
act.** ⛔ O2, O3, O4, O5 NOT authorized.
**§1 closed by the founder's read-only production query:** `t|t|t|t|t|t` — all six
objects present. The two older files are **ledger/schema divergence only**.

⛔ **NO PRODUCTION WRITE · NO MIGRATION EXECUTION · NO MERGE · NO SCHEMA DEPLOY ·
NO S3 CHANGE · NO O2/O3 IMPLEMENTATION.** This act derives and proves the
runbook. Executing it is a separate founder act.

---

## 1 · THE CUSTODY POINT, CLOSED

`deploy <SHA>` materializes an immutable named candidate. `cmd_migrate` takes no
SHA and runs compose from the **shared production checkout**. Sequencing them by
hand — *pull, migrate, deploy `<SHA>`* — would reintroduce exactly the
checkout/provenance ambiguity the deploy path was built to eliminate.

⭐ **The runbook materializes the candidate ONCE and derives both the migration
tree and the reader image from that single snapshot.** The mechanism already
exists and needed no invention: `docker-compose.production.yml` bind-mounts

```yaml
${MAIA_BUILD_CONTEXT}/database/migrations:/app/database/migrations:ro
${MAIA_BUILD_CONTEXT}/scripts/run-sql-migrations.sh:…:ro
```

so after `deploy_ctx_assert_and_materialize <SHA>`, the migrations that RUN are
the candidate's **by construction** — and `deploy_ctx_compose` independently
refuses any compose file outside the snapshot ("refusing a two-source deploy").

---

## 2 · THE RUNBOOK — `scripts/s3-schema-first-runbook.sh <SHA>`

```text
lock ─ materialize <SHA> ─ assert pending set ─ BUILD ─ verify image
     └─ MIGRATE (fail closed) ─ tag ─ SWAP ─ verify running ─ Co-Lab gate
```

⭐ **Build precedes migrate deliberately.** A build failure must cost no schema
change at all — and building is not swapping: no container is replaced until the
migrations have succeeded.

⭐ **Act scope is data, and it is re-read at execution time.** The five expected
filenames are hardcoded; the pending set is recomputed from the *candidate's own*
tree against the live ledger and must match exactly. ⛔ A sixth pending file, or a
narrower set, stops the act before any migration. **That refusal is what keeps a
one-off safe set from being promoted into an unproven universal deployment law.**

⛔ `deploy-maia` is never invoked — it runs no migrations, so it cannot fail
closed on one. ⛔ No `DEPLOY_ALLOW_HEAD`: this act names its candidate or does
nothing.

### Failure semantics

```text
build fails       → no migration, no swap; current reader untouched
migration fails   → candidate reader NEVER becomes live; current reader live
swap fails        → current reader live against the already-proved-compatible
                    SUPERSET schema (census §3: all five additive or widening)
verify fails      → same, and the operator is routed to a READER rollback;
                    ⛔ no schema rollback is implied
success           → candidate reader and S3 schema agree
```

### Execution (a separate founder act, not performed here)

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && scripts/s3-schema-first-runbook.sh <SHA-of-the-merged-candidate>'
```

⚠️ The SHA must be one whose tree contains all five files — i.e. **after** the S3
merge. ⛔ The merge itself remains on HOLD and is still the founder's act.

---

## 3 · THE PROOF — `npm run verify:s3-runbook` · **19 passed · 0 failed**

The REAL function is traced out of the REAL script with every docker-touching
seam stubbed. No docker, no database, no network, no production.

```text
ORDER      MIGRATE strictly precedes SWAP
           BUILD precedes MIGRATE
           happy path exits 0

CUSTODY    migrations run from the materialized snapshot of the named SHA
           build, migrate and swap all derive from ONE snapshot
           the running container is verified against the SAME named SHA

FAILURE    migration failure → candidate reader NEVER becomes live · non-zero
           build failure     → no migration and no swap
           swap failure      → non-zero, after a migration that succeeded
           provenance failure→ non-zero

ACT SCOPE  a sixth pending file refuses before any migration
           a different pending set refuses — this is not a general path
           no SHA → refuses before the lock

⭐ DISCRIM  a swap-before-migrate mutant is DETECTED

STATIC     deploy-maia never invoked
           DEPLOY_ALLOW_HEAD never consulted
           deploy-production.sh UNCHANGED — ⛔ no O2 shipped
           runbook untouched by the harness
```

⭐ **The discrimination case is what makes this an instrument.** Without it every
other green line would also be green against swap-before-migrate.

Neighbours re-run unchanged: `verify:migrate-fail-closed` **14/0** ·
`verify:deploy-provenance` **27/0** · `verify:deploy-lock` **25/0**.
S3 untouched; Class-B freeze diff **EMPTY**.

### ⚠️ Two harness corrections worth recording

The static scans failed on their first run **because the runbook documents its own
compliance** — the C21 lesson, twice:

1. the header states *"deploy-maia is FORBIDDEN"* and *"No DEPLOY_ALLOW_HEAD"*;
   a raw-source scan read the prohibition as the behaviour. **Comments are now
   stripped first**, the same discipline C6/C21 already use.
2. `DEPLOY_ALLOW_HEAD` still appears inside the **refusal message**. ⭐ Rather than
   launder the string, the check was corrected to ask the right question: the law
   is that no code path **consults** the variable. The inherited escape inside
   `deploy_ctx_assert_and_materialize` is unreachable because the empty-SHA case
   returns before materialize is called — **proved dynamically** by the "no SHA"
   trace, where no `materialize` step appears at all.

---

## 4 · WHAT THIS DELIBERATELY IS NOT

⛔ **Not a new deployment path.** `scripts/deploy-production.sh` is byte-unchanged
and still orders swap → migrate. The harness asserts that, so shipping O2 by
accident would turn this proof red.

⛔ **Not O3.** No `reader-compatible` bit was added. The founder's reasoning is
recorded because it is the durable part: *compatibility is relational — this
migration against which currently-running reader?* A permanent yes/no would turn
today's proved relationship into a timeless property it does not possess, and it
would still not govern the `deploy-maia` quick path.

⚠️ **The quick-path gap is still open and still not owned here**: `deploy-maia`
runs no migrations, so ordering custody over `deploy`/`update` does not reach it.

---

## 5 · STANDING

```text
DEPLOYMENT-SAFETY-02        O1 SELECTED · runbook DERIVED and PROVED
§1 reconciliation           ✅ RESOLVED — ledger-only divergence (6/6 true)
pending set                 CLOSED · exactly five
old-reader compatibility    PROVED for this set
runbook proof               ✅ 19 / 0 · discrimination case passes
deploy-production.sh        UNCHANGED (⛔ O2 not shipped)
O3 / O4 / O5                ⛔ NOT IMPLEMENTED
deploy-maia                 ⛔ FORBIDDEN for this act, and asserted absent
quick-path gap              OPEN · NOT OWNED

S3 ROUTE-INTEGRATION        ✅ CLOSED · 6ec5ff1d · untouched
DEPLOYMENT-SAFETY-01        ✅ PASS · 856db2cc
MERGE                       ⏸ HOLD
SCHEMA DEPLOY               ⛔ NOT YET AUTHORIZED
PRODUCTION WRITE            ⛔ NONE IN THIS ACT
```

Stop for authorization.

---

# ADDENDUM · THREE CUSTODY GAPS REPAIRED (founder inspection, 2026-09-14)

⭐ **All three were real, and the 19/0 harness did not prove what it appeared to.**
The witness is now **48 / 0**. ⛔ `deploy-production.sh` remains byte-unchanged.

## G1 · The runbook was not itself candidate-pinned

⭐⭐ *`git fetch` updates refs, not the working tree.* The old command pinned the
**payload** to the candidate while the **shell authority performing the act** came
from whatever the shared checkout held. "One SHA governs the whole act" was not
literally true.

**Repair — self-pinning, then self-proving.** Phase 0 re-execs out of a disposable
detached worktree at the named commit; phase 0b, running pinned, **proves it**:
the worktree HEAD must equal the named commit, and this file plus
`deploy-context.sh`, `deploy-lock.sh`, `deploy-tag.sh` must **hash-match that
commit's blobs** (`git hash-object` vs `git rev-parse <sha>:scripts/<f>`).
⭐ A hostile launcher that sets `RB_PINNED=1` to skip the worktree is refused by
the hash comparison — **not by convention**. The worktree is removed on exit.

## G2 · The post-migration claim was stronger than the mechanism

⛔ Proving *swap failure → non-zero* is not proving *old reader remains live*. `up -d`
can fail after doing work, and provenance fails **after** the swap.

⭐ **And `tag_images_for_rollback` cannot establish rollback custody**: all three
`docker tag` calls end in `|| true`, so its exit code says nothing about whether
`:previous`, `:current` and `:<sha>` are truthful.

**Repair — custody is PROVED before the boundary, not inferred.** Between migrate
and swap: capture the **live reader's** image id, run the tagging, then assert
`:previous` == the pre-act reader and `:current` == `:<sha>` == the built
candidate. ⛔ Any mismatch **refuses before the swap**. No live reader to capture
also refuses.

⭐ **And the failure statement now says only what was established.**
`rb_recovery_required` states: the five-file set applied; that schema is the
proved-compatible superset so restoring the previous reader is safe and no schema
rollback is implied; `:previous` was proved truthful before the crossing. Then
⛔ *"The live reader's state is UNKNOWN to this script — read it, do not assume
it"*, with the two commands to read it. ⛔ Automatic rollback is not part of this
act, as ruled.

## G3 · The "Co-Lab release gate" was not a gate

It warned and then printed that the act was complete. **Repair:** Co-Lab failure →
non-zero · `RECOVERY REQUIRED` · ⛔ no completion claim. Only a passing gate
reaches *"act complete"*.

## The witness — **48 passed · 0 failed**

Beyond the original nineteen:

```text
PIN            unpinned invocation re-execs from the candidate BEFORE the lock
               pin failure → nothing else runs
SOURCE CUSTODY a stale/shared-checkout source refuses before the lock
               self-provenance asserted on every pinned run
               ⭐ the REAL check refuses a SHA that is not the running tree's commit

ORDER          build → migrate → rollback custody → swap
ROLLBACK       pre-act live reader captured and passed to the proof
               custody failure REFUSES before the swap · non-zero
               no capturable live reader → refuses before the swap
   ⭐ REAL      accepts truthful tags; REFUSES an untruthful :previous, :current
               or :<sha> — the `|| true` tagging defect, caught

COMPLETION     ⭐ only the happy path declares "act complete"
               build · migrate · custody · swap · provenance · Co-Lab failures
               each CANNOT declare it
RECOVERY       the statement does NOT claim the old reader is still live
               and says its state is UNKNOWN and must be read
```

⚠️ One check was deliberately **left unscored**: the positive real-provenance case
against this tree's own HEAD, because a working copy with uncommitted edits
legitimately fails it — a pass there would have proved nothing. The discriminating
negative case carries it instead.

## The exact production command

⛔ The earlier paste failed on shell line-continuation and a literal `<SHA>`
placeholder. **One line, real SHA, no angle brackets:**

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git fetch origin clean-main-no-secrets && scripts/s3-schema-first-runbook.sh THE_REAL_MERGE_SHA'
```

Replace `THE_REAL_MERGE_SHA` with the merge commit that carries all five files.
⭐ The shared checkout's copy of the script is only a bootstrap: it re-execs the
candidate's copy, which then proves its own provenance — so a stale checkout is
**safe by refusal**, and `git fetch` alone (no checkout) is sufficient.

## Standing after the repair

```text
runbook source custody      ✅ CLOSED — pinned and self-proved
rollback-target custody     ✅ CLOSED — proved before the swap boundary
Co-Lab failure semantics    ✅ CLOSED — it gates completion
witness                     ✅ 48 / 0 · discrimination intact
deploy-production.sh        UNCHANGED · neighbours 14/0 · 27/0 · 25/0
S3                          untouched · Class-B freeze diff EMPTY

MERGE                       ⏸ HOLD
SCHEMA DEPLOY               ⛔ NOT AUTHORIZED
PRODUCTION                  UNTOUCHED — no write in this act
```

Stop for authorization.

---

# CORRECTION · THE BOOTSTRAP COMMAND WAS WRONG

The founder ran the command exactly as given. Result:

```text
bash: line 1: scripts/s3-schema-first-runbook.sh: No such file or directory
```

⭐ **Nothing was written, and the failure was loud — which is the designed
behaviour — but the command itself was my error and is corrected here.**

**Why it failed, plainly:** the runbook lives only on
`chore/s3-class-b-phase-20260913`. ⛔ It is **not on `clean-main-no-secrets`**, so
the shared checkout has no copy to bootstrap from. And `git fetch` updates refs,
never the working tree — the very fact G1 was repaired for, applied here to the
bootstrap step I had not thought through.

⚠️ **The sequencing fact underneath it:** *the runbook that performs the
post-merge act lives inside the thing being merged.* Fetching is not enough; a
copy must reach disk.

## The corrected command — bootstrap from the object store, not the checkout

⭐ Materialize the candidate as a worktree and run the runbook **from inside it**,
so every helper it sources is present and is the candidate's:

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git fetch origin clean-main-no-secrets && SHA=THE_REAL_SHA && WT=$(mktemp -d) && git worktree add --detach "$WT" "$SHA" && "$WT/scripts/s3-schema-first-runbook.sh" "$SHA"; RC=$?; git worktree remove --force "$WT"; exit $RC'
```

⭐ This is **belt and braces, not a replacement for the pin**: the runbook still
re-execs into its own disposable worktree and still hash-proves itself and its
helpers against the named commit. The outer worktree only solves *getting a copy
on disk*. ⛔ It weakens nothing.

Verified mechanically here: a worktree at `5928e852` carries the runbook, and
invoking it **with no SHA refuses with exit 2 and touches nothing** — so the
bootstrap path is exercisable without any production action.

## ⛔ ONE THING THIS DOES NOT DECIDE — WHICH SHA

Two orders are lawful and they are **not** the same act:

**(A) Merge first, then run.** The SHA is the merge commit on
`clean-main-no-secrets`. ⭐ This is what "merge the proved candidate and deploy its
schema as one act" means.

**(B) Run the branch head without merging.** ⛔ `5928e852` is **not** the proved S3
candidate — `6ec5ff1d` is; the branch has since added the DEPLOYMENT-SAFETY-01
and -02 work. Deploying the branch head would put production on a non-canonical
commit, and merge would still be owed afterwards.

⛔ **Not chosen here.** Naming the difference is the act; picking between them is
the founder's.

**Both branch heads carry all five migration files** — verified: the two
divergence files and the three S3 files are present at `5928e852`, and the two
divergence files are already on canonical.

## Standing — unchanged by this correction

```text
runbook + witness           ✅ 48 / 0
bootstrap command           ✅ CORRECTED (worktree, not checkout)
candidate SHA               ⛔ NOT CHOSEN — (A) merge-first or (B) branch head
MERGE                       ⏸ HOLD
SCHEMA DEPLOY               ⛔ NOT AUTHORIZED
PRODUCTION                  UNTOUCHED — the failed invocation wrote nothing
```

---

# ADDENDUM 2 · RECOVERY-CUSTODY REPAIR (founder inspection, 2026-09-14)

⭐ **The defect was real and verified in code before repairing.** `cmd_rollback`
retags `:previous → :current` and restarts, while the compose service is
`image: maia-sovereign:prod` (`x-maia-image`), which it never touches — so the
advertised recovery could restart the **candidate**. The general primitive is
recorded as a separate routed-out finding
(`ROLLBACK_IMAGE_ALIAS_MISMATCH_FINDING_2026-09-14.md`) and ⛔ **not repaired here.**

## What changed — the act now owns its recovery

```text
build → verify image → CAPTURE pre-act reader → PIN + VERIFY o1-recovery-<sha>
      → MIGRATE → SWAP → verify → Co-Lab → (advisory role tags) → complete
```

- **Capture + pin before anything crosses.** The pre-act reader's image id is
  tagged `maia-sovereign:o1-recovery-<sha>` and the tag is **verified** to resolve
  to that exact image. ⛔ Failure refuses before migration *and* before the swap.
- **Recovery is an operation, not an instruction to trust:**
  `scripts/s3-schema-first-runbook.sh recover <SHA>` retags the pinned image onto
  **`:prod`**, restarts `maia`, then verifies the running `GIT_COMMIT` against the
  commit the recovery image itself reports, and that the container is running.
  ⭐ Self-describing — no side file to go stale, and it runs standalone without the
  pin, because in an emergency the act is to restore an image already proved.
- **The late-failure message now names the act's own operation and explicitly
  warns the operator OFF `deploy-production.sh rollback`.**
- ⭐ **Shared role tags moved to AFTER a verified, gated success.** Before the swap
  they were shared metadata a refusal might leave half-moved; after success they
  describe reality. Since recovery no longer depends on them, a problem there is
  reported as **advisory** and does not fail a completed act. ⛔ This satisfies
  *"do not leave shared role tags falsely describing deployment state on a
  pre-swap refusal"* **structurally** — they are never touched pre-swap at all.

## Witness — **58 passed · 0 failed**

New propositions:

```text
ORDER        build → capture + recovery tag → migrate → swap
             recovery-tag failure refuses before migration AND before the swap
             no capturable live reader → same refusal
ROLE TAGS    every pre-swap refusal leaves :current/:previous untouched
             they are written only AFTER a verified, gated success
RECOVERY ⭐   retags the captured image onto :prod
             restarts maia
             confirms the restored commit and that the reader is running
⭐⭐ DISCRIM   a recovery that only moves :current/:previous and leaves :prod on
             the candidate — exactly what the general primitive does — is
             DETECTED as a FAILED recovery
INSTRUCTION  names the act's own operation; rules out the general rollback
```

The recovery operation is exercised **for real** against stubbed docker, so what
is proved is *"recovery retags `:prod` and confirms"*, ⛔ not *"a message mentions
rollback"*.

⚠️ **Two shell defects this pass produced and fixed, worth recording because both
are the same species:** `"${VAR:-<this act's SHA>}"` — bash resumes quoting rules
inside `${…:-word}`, so the apostrophe opened a single quote and swallowed the
rest of the file; and `"…THIS ACT'"'"'S…"` — the `'"'"'` idiom escapes a quote
inside **single** quotes and corrupts a **double**-quoted string. ⭐ Both were
caught by `bash -n` before anything ran.

## The final production command — canonical first (ruling A)

```text
1. merge the authorized branch state to canonical
2. capture the resulting canonical SHA
3. fetch canonical on minisforum
4. bootstrap the runbook from a detached worktree at THAT SHA
5. invoke the runbook with THAT SAME SHA
```

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git fetch origin clean-main-no-secrets && SHA=CANONICAL_MERGE_SHA && WT=$(mktemp -d) && git worktree add --detach "$WT" "$SHA" && "$WT/scripts/s3-schema-first-runbook.sh" "$SHA"; RC=$?; git worktree remove --force "$WT"; exit $RC'
```

Recovery, if a late failure occurs:

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && WT=$(mktemp -d) && git worktree add --detach "$WT" CANONICAL_MERGE_SHA && "$WT/scripts/s3-schema-first-runbook.sh" recover CANONICAL_MERGE_SHA; RC=$?; git worktree remove --force "$WT"; exit $RC'
```

⛔ `CANONICAL_MERGE_SHA` is a name to substitute, not a literal. ⛔ No branch-head
deployment.

## Standing

```text
actual recovery execution   ✅ PROVED — retags :prod, restarts, confirms
general rollback primitive  ⚠️ ROUTED OUT · lane not opened
witness                     ✅ 58 / 0 · both discrimination cases intact
deploy-production.sh        UNCHANGED · neighbours 14/0 · 27/0 · 25/0
S3                          untouched

MERGE                       ⏸ HOLD — awaiting authorization
SCHEMA DEPLOY               ⛔ NOT AUTHORIZED
PRODUCTION                  UNTOUCHED
```

Stop for authorization.
