---
name: bounded-job
description: Structure a unit of work so it has a declared scope, an owner-path, a stop condition, and evidence — instead of open-ended drift. Use when starting any multi-step change, when a task is vague or keeps growing, when several lanes or worktrees are in play, or when previous work ended without a clear result. Replaces repeated prose instructions like "verify branch, don't touch production, stop after this job, produce evidence".
---

# Bounded job

The failure mode this prevents is not error. It is **unbounded work**: a job that keeps
finding adjacent problems, ends with a narration instead of a result, and cannot be
verified or reverted as a unit.

## Declare before starting (5 lines, not a document)

```
JOB       one sentence — what will be true after that is not true now
PATHS     the paths this job may write. Anything else is out of scope.
LANE      branch + worktree. One job, one lane.
STOP      the condition that ends it — not "when it feels done"
EVIDENCE  the command whose output will prove it
```

If any line cannot be written, the job is not yet a job. Say so and ask, rather than
starting and discovering the boundary by crossing it.

## While running

- **Scope creep is a finding, not a task.** Adjacent problems get named in the report, not fixed.
- **Guards are structural, not advisory.** The `PreToolUse` hook denies deploy-lockfile
  deletion, bare production compose builds, `@supabase` installs, and protected-branch
  force-pushes. A denial is information: the lane is wrong, not the guard.
- **One deploy at a time** is enforced by `flock` on `.deploy.lock`. Never delete the lockfile.

## Closing

The `Stop` hook prints the changed paths. The report supplies what a diff cannot:

```
result      what is now true
evidence    the command AND its actual output — not a description of the output
validation  npm run typecheck · npm run preflight · npm run smoke · Co-Lab gate (31/31)
status      built | wired | surfacing | verified   <- these are NOT synonyms
next        one thing, or none
```

**Status discipline is load-bearing here.** *Declaration is not liveness; built ≠ wired;
wired ≠ surfacing; surfacing ≠ verified.* A schema column plus an API route is `built`.
The first row observed under authenticated production load is `verified`. Claiming the
higher rung is the characteristic failure of this project, and it is what
`scripts/builder/epistemic-guard.mjs` refuses.

## Deeper

- `references/evidence-and-status.md` — the status rungs and the guard that adjudicates them
- `docs/ops/JARVIS_EPISTEMIC_GUARDRAILS_2026-08-11.md` — G1–G7 enforcement units
