# KELLY'S WORLD — LIVING FIELD LIBRARY 01 · R10 Work Unit Evidence Precision · 2026-10-01

## Purpose

Remove the R9 blocker without changing C1 or inventing a new Grokker execution class.

R10 separates two scopes that W0.v2 previously conflated:

- **repository read authority** remains file-level in `scope.allowed_paths`;
- **provider evidence disclosure** may now be line-range precise in optional `scope.evidence_selectors`.

Existing Work Units with no line ranges retain their previous shape and whole-file behavior.

## Canonical propagation

When Desktop receives an evidence focus such as:

`docs/programme/X.md:41-47`

it now derives:

- `allowed_paths: ["docs/programme/X.md"]`
- `evidence_selectors: [{ ref:"docs/programme/X.md", selector:{type:"lines",start:41,end:47} }]`

The selector survives W0.v2 creation, W2 lifecycle transitions, and W3 route binding unchanged.

## E1 disclosure

E1 still binds evidence to the exact canonical SHA.

When selectors are absent:
- existing whole-file materialization remains unchanged.

When selectors are present:
- each selector must refer to a file inside `allowed_paths`;
- the exact SHA-bound file is read;
- invalid/reversed/out-of-range selectors fail closed;
- only selected ranges are written into the temporary provider sandbox;
- inline local providers receive absolute source line gutters, source SHA, and fragment hash;
- non-selected lines are not placed in the provider prompt.

The evidence grammar deliberately mirrors the already-proven Precision Context Router rather than creating new selector semantics.

## Falsifiers

The old whole-file-only behavior remains as a named defeat candidate and is still killed by the Grokker precision guard.

New acceptance proves:
1. W0.v2 keeps file-level authority and exact range disclosure distinct;
2. legacy non-range input does not gain an `evidence_selectors` field;
3. selectors survive create → bounded → authorized → routed;
4. E1 local Qwen prompt contains the selected absolute lines;
5. a known symbol outside the selected range is absent from the prompt.

## Witness

Combined R10 / canonical target suite: **25/25 PASS**.

Included:
- Desktop canonical W0.v2 tests;
- E1 provider-execution tests;
- Grokker deliberative precision tests;
- Builder W0.v2 proof;
- Builder W0→W5 e2e proof and its 24 required falsifiers.

Syntax checks and `git diff --check`: PASS.

## Standing

**R10 PASS.**

The R9 evidence-widening blocker is closed.

R10 does not create, authorize, or execute a deliberative Grokker Work Unit. It only makes such a Work Unit capable of preserving the already-authorized source packet.

No merge or deploy is authorized.

## R10A — filesystem coordinate preservation

A further falsifier covers filesystem-reading executors such as the contained OpenCode path.

Selected evidence is materialized under the original repository-relative filename with blank, non-disclosing lines outside the authorized ranges. This preserves the canonical source line coordinates without copying non-selected source text into the sandbox.

Therefore:
- direct inline providers receive numbered canonical fragments;
- filesystem-reading providers see the same authorized text at the same canonical line numbers;
- unselected lines remain absent;
- `path:LINE` provenance does not change meaning across executor types.

Dedicated selector-carry tests: **7/7 PASS**.

The broader target gate is green:
- Desktop canonical W0.v2: **7/7**
- E1 provider execution: **12/12**
- Builder W0.v2 proof: **12/12**
- W0→W5 composition: **12/12 composition assertions + 24/24 required falsifiers**

A prior combined-process E1 run showed two neutral-root sentinel failures caused by test-order contamination; the E1 suite rerun in isolation passed **12/12**. No production/runtime behavior was changed to accommodate that test artifact.
