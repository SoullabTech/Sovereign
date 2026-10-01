# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R16 — Structured Local-Native Runtime

**Date:** 2026-10-01  
**Parent:** EC1-R15 structured candidate order `2f5a5325ca9a`  
**Class:** bounded runtime implementation  
**Scope:** structured inspection-only local-native path

## Change

R16 introduces an explicit optional packet mode:

`verification_mode: "structured-v1"`

with a validated `verification_plan` using the frozen EC1-R13 contract.

Legacy packets remain unchanged and continue to require `verification_commands`.

## Delegate behavior

For local-native structured-v1 only:

- the toolless Qwen worker runs as before;
- NPA1 patch/edit admission runs as before;
- both legacy `eval` verifier loops are skipped;
- the legacy model repair turn is skipped;
- the admitted candidate is committed by JARVIS while `test_results` remains `not_run`;
- the result contract records `verification_mode: structured-v1`.

The legacy branch keeps its original verifier and repair behavior.

## Runtime behavior

Structured packet admission requires:

- explicit `tests.run` authority;
- a valid structured verifier plan;
- an inspection-executable plan only; `PROJECT_EXECUTION` remains refused.

After delegate completion the runtime:

1. validates result mode and requires `test_results=not_run`;
2. independently proves NPA1 evidence, changed paths, exact base/parent lineage, one JARVIS candidate commit, commit actor/message, clean worktree, and patch-ledger custody;
3. does **not** replay legacy verifier commands;
4. executes EC1-R14 structured inspection against the committed candidate;
5. rechecks candidate HEAD and clean worktree after inspection;
6. advances to VERIFIED only on structured verifier PASS;
7. rolls back to the canonical base on structured verifier failure.

## Proof

Focused R16 contract proof: **11/11 PASS**.

Full hermetic `executeRun()` success walk: **3/3 PASS**.

Full hermetic verifier-failure/rollback walk: **3/3 PASS**.

Legacy/native regression wall:

- existing native runtime proof: **8/8 PASS**;
- native edit admission: **35/35 PASS**;
- native prompt proof: **26/26 PASS**;
- Work Unit v1 proof: **38/38 PASS**;
- Desktop local-native wire suite: **6 PASS / 9 environment-dependent SKIP / 0 FAIL**;
- EC1-R14 inspection verifier: **8/8 PASS**;
- EC1-R13 verifier plan: **10/10 PASS**;
- EC1-R15 matrix: **LETHAL + DISCRIMINATING**;
- EC1-R15 freeze: **INTACT**;
- `bash -n scripts/ain-delegate.sh`: PASS.

## Explicit limits

R16 does **not**:

- execute `project.test` or any project code;
- execute npm/npx/node-test/tsx/tsc through the structured verifier;
- migrate historical shell commands;
- expose structured-v1 as a renderer action;
- wire the EC1-R11B host execution decision into dispatch yet;
- wire W4 projection;
- claim crash-after-candidate-commit recovery;
- replace legacy Path A globally.

## Standing

```text
structured-v1 packet admission:       IMPLEMENTED
legacy shell on structured path:      BYPASSED / PROVEN NOT CALLED
legacy repair on structured path:     BYPASSED
candidate-before-verifier order:      IMPLEMENTED
custody-before-verifier:               IMPLEMENTED
inspection-only verifier:             IMPLEMENTED
structured success → VERIFIED:         PROVEN
structured failure → rollback/FAILED:  PROVEN
legacy behavior:                       REGRESSION-GREEN
project execution verifier:            BLOCKED
host execution-decision dispatch wire: NOT YET WIRED
W4 projection:                         NOT YET WIRED
crash recovery after candidate commit: NOT YET IMPLEMENTED
```

The next act should bind the EC1-R11B host decision to the actual structured-v1 dispatch boundary. Only after that should EC1-R4 W4 shadow projection be wired to successful structured runs.
