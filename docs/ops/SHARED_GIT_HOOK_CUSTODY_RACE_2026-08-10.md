# SHARED GIT HOOK CUSTODY RACE

**Date:** 2026-08-10 · **Status:** ⛔ **DIAGNOSTIC DEFECT RECORD. Authorizes no remedy.**

> Hook installation is last-writer-wins across concurrent checkouts and worktrees,
> allowing one session to silently replace another session's intended enforcement.

This record exists to preserve evidence and scope the defect. It does **not** choose
a remedy, and must not be read as authorizing one. Making hooks more elaborate is
explicitly not the default answer — the evidence should choose.

**Provenance discipline:** every item under *Observed* was directly observed by the
authoring session. The causal step is marked **inferred** and is not asserted as fact.
No other session's findings are reproduced here.

---

## 1. Observed sequence

```
design-canon added to scripts/setup-githooks.sh   (edit uncommitted at this point)
        ↓
./scripts/setup-githooks.sh run
        → "sovereignty checks installed → pre-commit.old (chaining wrapper preserved)"
        ↓
presence VERIFIED
        → grep 'design-canon' $(git rev-parse --git-common-dir)/hooks/pre-commit.old
        → 24:npm run check:design-canon
        ↓
blocking PROVEN by real commit attempt
        → staged an uncovered member-facing file
        → git commit exited 1, no commit created, HEAD unchanged
        ↓
⟨ interval — this session took no action on the hooks directory ⟩
        ↓
commit 07d4e1dea attempted
        → hook output showed: branch guard · no-supabase · no-openai · "checks passed"
        → design-canon ABSENT from the output
        ↓
commit 07d4e1dea SUCCEEDED (21 files, 8 member-facing surfaces) — gate never fired
        ↓
postcondition check discovered the loss
        → grep 'design-canon' …/hooks/pre-commit.old → NOT PRESENT
        ↓
reinstalled from the now-committed script → design-canon restored at line 24
        ↓
blocking RE-PROVEN → HEAD unchanged on an uncovered file
        ↓
commit 408ce5044 → design-canon visibly ran in the commit output
```

### What was directly observed

- The installed hook **contained** `check:design-canon`, verified by inspection.
- The gate **blocked a real commit**, verified by unchanged `HEAD` — not by exit code.
- The installed hook **later did not contain it**, with no action by this session.
- A commit therefore **passed without a gate that had been verified installed**.
- Reinstalling restored it, and blocking was re-proven.

### What is inferred, not observed

**The mechanism.** A parallel session re-running `setup-githooks.sh` from a checkout
lacking the then-uncommitted edit is the most plausible cause, supported by the
environment reporting another session's dev server in this folder. **This session did
not observe that run.** Alternative explanations — another tool rewriting the hooks
directory, or the beads chaining installer — were not excluded.

*The effect is established. The cause is not.*

---

## 2. Scope — what this defect is NOT

⛔ **This is not "design-canon wasn't canonical yet."**

That reading would make the defect self-resolving once the gate is committed. It is
not. **Two checkouts at different canonical states can still compete for one shared
hooks directory.** A worktree sitting on an older commit that re-runs its own
`setup-githooks.sh` will install *its* canonical hook set, silently changing which
committed gates a different worktree's next commit executes.

The uncommitted edit made this instance easy to see. It is not what made it possible.

### Amplifier measured in this repository

`setup-githooks.sh` deliberately resolves `$(git rev-parse --git-common-dir)/hooks`
so that hooks work from worktrees — correct, and the reason the surface is shared.
This repository currently has **73 worktree roots** (measured 2026-08-10) against
**one** hooks directory. Every one of them can rewrite it.

---

## 3. The pattern

```
correct mechanism + incomplete coverage
                ↓
        false governance confidence
```

The gate was correct. Its installation was verified. It had been proven to block. And
a commit still passed without it — because *coverage of the moment of enforcement*
was never guaranteed.

The uncovered thing here is **commits during custody drift**.

⚠️ **Detection depended on checking the postcondition.** `git commit` returned 0 and
printed "✅ Pre-commit checks passed". Nothing in that output announced a missing
gate — an absent check is silent by construction. Had this session trusted the exit
code, the loss would have gone unrecorded.

---

## 4. Acceptance statement for the future unit

> Concurrent worktrees cannot silently change which committed governance gates
> another worktree's commit will execute. If hook custody differs from the expected
> canonical state, the commit fails closed or the discrepancy is explicitly surfaced.

---

## 5. Candidate remedies — **none chosen**

Recorded to prevent premature convergence, not to shortlist:

- hook version/content verification against the committed canonical state
- a stable dispatcher that delegates to versioned, in-repo checks
- installation locking (cf. the deploy-lane `flock` precedent)
- per-operation canonical execution rather than installed copies
- something else the evidence indicates

**Do not solve this by making hooks more elaborate.** Elaboration increases the
surface that can drift. Let evidence choose.

---

## 6. Standing

Independent of, and not to be merged into, any Builder OS claim-lifecycle or
capacity-coverage work. This record contains only this session's direct observations.
