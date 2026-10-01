# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R13 — Structured Verifier Plan

**Date:** 2026-10-01  
**Parent:** EC1-R12 verifier-effect boundary `9ed903cdb3d4`  
**Class:** pure representation/validation substrate  
**Verifier execution:** NONE

## Change

Added `scripts/builder/local-verifier-plan-v1.mjs`.

The module defines a closed, versioned verifier-plan representation:

- `EC1-VERIFY.v1`;
- explicit operation ids;
- explicit operation kinds;
- explicit effect classes;
- closed argument schemas;
- stable canonical digest.

No filesystem, child process, shell, network, environment, clock, or verifier execution exists in this module.

## Initial operation vocabulary

Inspection-class operations:

- `git.diff_check`;
- `git.status_short`;
- `file.exists`;
- `text.contains`.

Representable but held:

- `project.test` — `PROJECT_EXECUTION`.

A plan containing `PROJECT_EXECUTION` validates structurally but returns `HELD_FOR_EFFECT_CONTAINMENT` and is not executable.

Unknown operation kinds, shell command fields, caller-supplied cwd/env, unbounded paths, malformed argument sets, and duplicate operation ids fail closed.

## Proof

`local-verifier-plan-v1-proof.mjs`: **10/10 PASS**.

Proves:

- structured inspection plan admission;
- project execution remains held;
- unknown kind refusal;
- shell/string-command exclusion;
- cwd/env exclusion;
- bounded repository paths;
- stable digest under object-key reordering;
- digest changes when verifier semantics change;
- duplicate operation-id refusal;
- no runtime/effect capability in the plan module.

Regression wall:

- EC1-R12 matrix: **LETHAL + DISCRIMINATING**;
- EC1-R12 freeze: **INTACT**;
- EC1-R11B host-decision proof: **9/9 PASS**;
- EC1-R11B authority-profile proof: **6/6 PASS**.

## Standing

```text
Structured verifier plan:       IMPLEMENTED
Plan canonical digest:          IMPLEMENTED
Inspection operations:          REPRESENTABLE
Project-code execution:         REPRESENTABLE / HELD
Legacy shell auto-migration:    NONE
Verifier runtime:               NONE
Path A dispatch:                STILL UNCHANGED
```

The next act may implement an **inspection-only verifier executor** for the four admitted INSPECT operations. That executor must consume the validated structured plan, use a host-bound worktree, use argv-array execution rather than shell, and remain incapable of project-code execution.
