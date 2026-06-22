# Authorized Actions: Certification Protocol

- **Status as of 2026-06-18** — living procedure; update as executors graduate.
- **Type**: governance procedure (companion to `AUTHORIZED_ACTIONS_LDV.md`). Procedure, not philosophy.
- **Relationship**: **LDV** says *what exists, what is designed, where we're going.* **This doc** says *how something earns the move from Designed → Live.*

## Principle

An executor earns the Live column by **evidence, not inheritance.** Each executor runs the full ladder on its own; passing for Calendar does not pre-certify Email. "Done" is defined by the evidence below — not by intuition, and not by "it worked once."

## The ladder — required evidence per rung

| # | Rung | Required evidence | Calendar |
|---|------|-------------------|----------|
| 1 | Code-verified | Implementation present; `typecheck` clean | ✓ |
| 2 | Negative-path verified | An unauthorized / unauthenticated request is *refused* (e.g. 401), shown at runtime | ✓ (claim-only POST → 401) |
| 3 | Positive-path runtime-certified | An authorized request *succeeds* through the real consent gate, shown at runtime | ✓ |
| 4 | Boundary-certified | The persisted footprint / side effects are *exactly* those intended, asserted against the DB / external state | ✓ (`local_only` / `private` / no external id) |
| 5 | Conversationally certified | MAIA emits the proposal *naturally* from a live turn — not a hand-built payload | ✓ (scheduling msg → `propose_calendar_event` draft) |
| 6 | Production-certified | Deployed; verified in production; observed in real field use | ⏳ |

A rung is certified only when its evidence is **reproducible** and attached to a **named artifact** (commit / row / log marker), per the project's verification-artifact discipline.

## What counts as certification (and what doesn't)

- Certification is **per-executor** *and* **per-environment claim**: "runtime-certified on the proposal branch" ≠ "production-certified."
- **Code-verified ≠ runtime-certified.** Wired-and-typechecked is rung 1, not rung 5.
- A single success is not certification unless it is reproducible and its evidence is recorded.
- **Inheritance is not certification:** a shared component passing for one executor does not certify another.

## Acceptable failure modes (a failed cert is not always a code defect)

A certification can legitimately fail for reasons that are *not* implementation bugs. The protocol must distinguish them:

- **Environment lag** — the code is correct but the environment (DB schema, env vars, deployed artifact) is behind. A fail-fast gate failing here is *working as intended.*
- **Missing credential / fixture** — no valid session, no test member, missing key.
- **Cache / memoization** — a process cached an earlier state and must be reset to re-observe truth.

### Worked example — the schema-gate episode (2026-06-18)

During Calendar's rung-5 cert:
1. The code was correct.
2. The cert failed: the *local dev DB* lagged one required migration — `lib/db/schemaGate.ts` returned 503.
3. **The gate prevented a misleading success** — it refused to run a conversational turn against a stale schema rather than produce a half-valid result.
4. Applying the migration didn't immediately fix it: `ensureSchemaReady` **memoizes its result per-process**, so the running server returned the *cached* 503 until restarted.

Lesson: a correct implementation can legitimately fail certification because of environment state, and a fail-fast gate is a **feature, not a flake.** Record the environment fix (migration applied, server restarted) as part of the cert evidence — certification is of *code + environment*, not code alone.

## Regression detection

- Each rung's evidence should be **re-runnable** (a script / request / query), so a later change is re-certified, not assumed.
- **Negative-path (rung 2) is the cheapest regression sentinel:** if an unauthorized request ever *succeeds*, the consent boundary has regressed.
- Stale "wired / inert" comments are a documentation regression — keep comments matched to wiring (cf. the corrected proposal-loop comments).

## How a new executor graduates into Live

1. Implement (rung 1).
2. Run rungs 2–5 on a branch, recording evidence for each.
3. Only then merge → deploy → observe (rung 6).
4. Do **not** extract a generalized framework until **two materially different** executors have independently cleared 1–6. Calendar is internal; the next should be **email or messaging** — third-party footprint, Non-transferable Authority, revocation-before-execution.

## Status

Calendar: rungs **1–5 cleared on the proposal branch**; rung 6 (production) pending. No other executor has begun the ladder.
