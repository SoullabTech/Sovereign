# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R12 — Verifier Effect Boundary

**Date:** 2026-10-01  
**Parent:** EC1-R11B local candidate decision custody `c0351dcd5f0a`  
**Class:** pre-implementation constitutional instrument  
**Runtime changes:** NONE

## Real-home census

The current delegation home contains **187 verification commands across 52 packets**.

Observed command families include:

- `git` — 47;
- `grep` — 29;
- `node` — 25;
- shell negation (`!`) — 23;
- `test` — 18;
- direct `tsx` — 13;
- `sed` — 9;
- direct `tsc` — 8;
- `npm` — 7;
- `npx` — 5;
- plus compound shell logic and one `bash` command.

This is not a single verifier language. It is a historical arbitrary-shell surface.

## Source finding

Path A currently executes verifier strings through both:

- `bash -lc <command>` in `validateNativePatchResult()`;
- shell `eval "$vcmd"` in `ain-delegate.sh`.

After each verifier, Path A proves only that the candidate Git HEAD/worktree did not change.

A clean Git worktree cannot prove that the verifier did not:

- call the network;
- mutate a database or file outside the repository;
- touch credentials or keychain state;
- modify another checkout;
- create some other external effect.

Therefore exact command-string binding is necessary but insufficient as effect authority.

## Ruling

> Legacy `verification_commands` remain historical execution evidence. They do not become the executable verifier contract of the converged path.

The converged path requires a **structured verifier plan** with explicit operation identity and effect class.

Initial effect classes:

- `INSPECT` — eligible for later bounded admission when operation identity is known and no shell is used;
- `PROJECT_EXECUTION` — representable, but **not executable yet** until its external-effect containment is separately proven.

This distinction preserves liveness without pretending that `node --test`, `npm test`, `tsx`, or project code are read-only merely because they are called verification.

## Frozen laws

- **V1** legacy shell verifier strings are not directly executable in the converged path;
- **V2** a lawful verifier plan is structured and versioned;
- **V3** unknown verifier operation identities are refused;
- **V4** shell/eval/string-command semantics are explicitly recognized as outside the structured verifier seam;
- **V5** verifier cwd and environment are host-supplied, not caller-controlled;
- **V6** known inspection operations may eventually execute; project-code execution remains blocked without its own effect containment;
- **V7** clean Git state is not proof of absence of external verifier effects;
- **V8** the host execution decision must bind the exact verifier plan;
- **V9** historical shell commands are never auto-translated into new authority;
- **V10** project-execution operations remain representable for later adjudication rather than disappearing from the model.

## Matrix

Reference: **10/10 PASS**.  
Defeat candidates: **10/10 killed on named law**.  
One collateral death is classified: a verifier-plan validator that refuses everything also makes future project-execution plans unrepresentable.  
Matrix: **LETHAL + DISCRIMINATING**.  
Freeze: **INTACT**.

## Standing

```text
EC1-R11B host decision custody:    IMPLEMENTED / NOT WIRED
Legacy verification shell:         HISTORICAL ONLY
Structured verifier plan:          CONSTITUTION FROZEN
INSPECT execution:                  NOT YET IMPLEMENTED
PROJECT_EXECUTION:                  BLOCKED ON EFFECT CONTAINMENT
shell/eval in converged path:       FORBIDDEN
runtime local-candidate dispatch:   STILL BLOCKED
```

The next act may implement only the **structured verifier-plan representation and inspection-only validator**. It may not run project code, shell, npm, npx, node tests, tsx, tsc, or arbitrary commands yet.
