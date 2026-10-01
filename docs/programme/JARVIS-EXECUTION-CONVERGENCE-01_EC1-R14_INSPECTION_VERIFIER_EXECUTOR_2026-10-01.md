# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R14 — Inspection-Only Verifier Executor

**Date:** 2026-10-01  
**Parent:** EC1-R13 structured verifier plan `7e6487ee4cac`  
**Class:** bounded inspection execution  
**Project-code execution:** FORBIDDEN

## Change

Added `scripts/builder/local-verifier-inspection-v1.mjs`.

The executor consumes only a validated `EC1-VERIFY.v1` plan whose operations are all `INSPECT`.

Implemented operations:

- `git.diff_check` via argv-array `git diff --check`;
- `git.status_short` via argv-array `git status --short`;
- `file.exists` with bounded/realpath containment;
- `text.contains` with bounded/realpath containment and a 2 MiB read ceiling.

## Boundaries

The executor refuses a plan containing `PROJECT_EXECUTION` before any operation runs.

It contains no:

- shell;
- `bash -c` / `sh -c`;
- `eval`;
- `spawn`;
- npm/npx/tsx/tsc;
- Node project-test execution;
- caller-supplied cwd/env.

The worktree must be an existing absolute host-supplied path. Existing targets are resolved through `realpath`; a symlink that resolves outside the worktree is refused without reading the external target.

## Proof

`local-verifier-inspection-v1-proof.mjs`: **8/8 PASS**.

Proves:

- all four admitted inspection operations execute;
- missing files fail truthfully;
- project execution is refused before operation dispatch;
- lexical path escape is refused;
- symlink/realpath escape is refused;
- host worktree must exist and be absolute;
- text reads are bounded;
- source contains no shell/eval/project execution surface.

## Standing

```text
Structured verifier plan:       IMPLEMENTED
Inspection verifier executor:   IMPLEMENTED
Project execution verifier:     BLOCKED
Legacy verification shell:      UNCHANGED / NOT ADMITTED TO NEW PATH
Path A delegate ordering:       NEXT CENSUS
Runtime candidate dispatch:     STILL NOT WIRED
```

The next act must determine how the legacy local-native delegate orders patch application, verification, repair, candidate commit, and result writing. No integration is admitted until the structured verifier can replace—not merely duplicate—the legacy shell verifier on the converged path.
