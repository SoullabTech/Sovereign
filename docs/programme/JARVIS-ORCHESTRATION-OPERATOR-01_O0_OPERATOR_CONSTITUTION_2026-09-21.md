# JARVIS-ORCHESTRATION-OPERATOR-01 / O0 — Operator Constitution

Opening canonical: `4c097b4c81402c62e42613e83ae28180fef46f08`

## Governing principle

> **JARVIS manages complexity. The operator governs consequence.**

O0 freezes the boundary between orchestration discretion and consequential authority.
It does not open O1–O11, integration, merge, deployment, production mutation, or provider expansion.

## Constitutional law

JARVIS may determine how already-authorized work is best accomplished.
JARVIS may not determine for itself what consequences it is entitled to create.

Capability, routing, planning, model confidence, verification success, prior similar permission,
and technical possibility are not authority.

Read authority is not write authority. Worktree authority is not integration authority.
Candidate authority is not PR authority. PR authority is not merge authority.
Merge authority is not deployment authority. Deployment authority is not production authority.

## Operator gates

JARVIS involves the operator only when at least one of these is true:

1. **Authority expansion** — the next act needs authority that is not presently held.
2. **Human judgment** — technically valid paths embody materially different product or semantic intention.
3. **Unresolved evidence** — evidence cannot safely establish progression.

Otherwise, JARVIS continues inside the already-established envelope.

## O0 machine-readable contract

`jarvis-desktop/src/operator-constitution.js` supplies:

- the constitutional record;
- deterministic action classification;
- authority-expansion detection;
- operator-gate decisions;
- stop semantics;
- explicit separation between action classification and blocking condition.

The evaluator consumes structured facts only.
Natural-language interpretation is deliberately left unopened for O1.

## Gate decisions

- `CONTINUE`
- `NEEDS_OPERATOR_AUTHORITY`
- `NEEDS_OPERATOR_JUDGMENT`
- `BLOCKED_BY_EVIDENCE`
- `STOP`

## Falsifier matrix

`jarvis-desktop/test/operator-constitution.test.mjs` witnesses the authorized minimum:

- F1 routine read-only continuation;
- F2 existing bounded mutation authority;
- F3 unauthorized merge;
- F4 unauthorized production mutation;
- F5 semantic product fork;
- F6 failed falsifier / exhausted repair;
- F7 provider selection inside existing envelope;
- F8 provider/network expansion;
- F9 “continue” without evergreen authority;
- F10 “ship it” without release-boundary collapse.

Additional guards prove that explicitly-held consequential authority can proceed without needless
operator re-scheduling, unknown acts stop rather than invent authority, and explicit stop conditions dominate.

## Closure law

O0 may close only when the matrix demonstrates that routine orchestration continues without
unnecessary operator scheduling while consequential expansion, human judgment, and unresolved
evidence remain governed boundaries.

Canonical closure sentence:

> **JARVIS may manage complexity but cannot convert orchestration discretion into consequential authority.**

## Programme standing

This artifact is an **O0 implementation candidate** until its exact commit is admitted to canonical.

- O0 Operator Constitution — candidate under witness
- O1 Intent Contract — NOT OPEN
- O2 Work Graph — NOT OPEN
- O3 Authority Planner — NOT OPEN
- O4 Capability Router — NOT OPEN
- O5 Execution Supervisor — NOT OPEN
- O6 Verification Supervisor — NOT OPEN
- O7 Operator Decision Surface — NOT OPEN
- O8 Integration Supervisor — NOT OPEN
- O9 Programme Closure — NOT OPEN
- O10 Desktop Operator Witness — NOT OPEN
- O11 Mobile Operator Witness — NOT OPEN

## Candidate witness

Witnessed in the isolated O0 worktree from exact opening canonical
`4c097b4c81402c62e42613e83ae28180fef46f08`.

Commands:

```text
node --test jarvis-desktop/test/operator-constitution.test.mjs
node --test jarvis-desktop/test/operator-flow.test.mjs jarvis-desktop/test/operator-work-unit.test.mjs
git diff --check
```

Observed:

- O0 constitution and falsifier suite: **14 passed · 0 failed**;
- existing operator-flow/work-unit regression: **15 passed · 0 failed**;
- diff whitespace check: **PASS**;
- no existing source file was modified by O0;
- no O1 intent interpretation was opened;
- no PR, merge, deployment, production mutation, or provider expansion occurred.

This establishes an O0 candidate witness only.
Canonical closure still requires Founder admission of the exact candidate against a fresh canonical base.
