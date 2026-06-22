# Authorized Actions: Live / Designed / Vision

- **Status as of 2026-06-18** — living note; update as certification stages land.
- **Type**: architecture note (status + direction). **Not canon.**
- **Evidence discipline**: **Live** = runtime-demonstrated on the proposal branch · **Designed** = architected, not built · **Vision** = strategic direction. Items tagged *(code-verified)* are wired and type-checked but **not yet runtime-demonstrated**.
- **Source**: branch `feature/consent-gated-calendar-proposal`; spec `docs/specs/CALENDAR_AUTHORIZED_ACTION_SPEC_2026-06-18.md`; certification ladder Stages 1–6.

We have identified something more fundamental than a Calendar feature: a constitutional execution pathway between conversational understanding and real-world action.

---

## Live (runtime certified on the proposal branch)

We have runtime-certified the first Authorized Actions executor: **Calendar.**

Demonstrated:

- The user reviews and edits an explicit **Proposal Card** before any state changes occur.
- **Nothing executes without explicit human confirmation.**
- The **consent gate and executor have been runtime-certified.**
- Proposal-created calendar events are **structurally prevented in code** from propagating to external calendar sync. Enforced by multiple independent guards:
  - the proposal path never calls the external sync function;
  - proposal-created rows are pinned `private`;
  - the sync function short-circuits on `private`;
  - the Studio edit path does not modify disclosure.
  - *(This is a code-enforced guarantee, not a database constraint — it must be protected from drift; the stale "inert/unused" comments were corrected for exactly this reason.)*
- The consent boundary has been **verified in both directions**:
  - authenticated confirmation **succeeds**;
  - unauthenticated / claim-only writes are **rejected (401)** — demonstrating the boundary is *actively enforced*, not merely present.
- Proposal-created events remain **local, reversible, and auditable**.

**Stage 4 — live conversational emit — certified 2026-06-18.** A natural scheduling message ("put lunch with Nathan on my calendar next Tuesday at 12:30pm for an hour") produced a `propose_calendar_event` proposal end-to-end: correct title, start/end, and resolved timezone (America/New_York), returned to the client as an **editable draft** ("take a look, edit anything that's off, and confirm when it's right") — write-incapable, nothing persisted until confirm. The full pathway — conversation → proposal → review → confirm → bounded execution — is now **demonstrated, not inferred.**

This certification exists on the proposal branch and **has not yet been deployed to production.**

---

## Designed

A single constitutional execution pathway:

**Conversation → Intent → Proposal → Human Review/Edit → Confirmation → Authorized Executor**

Rather than each capability inventing its own execution model, consequential actions follow one constitutional pathway with explicit human authorization before execution.

---

## Vision

- Conversation becomes MAIA's **universal interface.**
- Authorized Actions becomes MAIA's **universal execution layer.**
- Every consequential action follows the same constitutional sequence:

  **Understand → Propose → Reveal the footprint → Human authorizes → Executor performs**

This remains a strategic direction, not a completed implementation.

---

## Engineering Discipline

Calendar establishes the first certified executor. It proves the pattern is **possible**; it does not yet justify extracting a **generalized framework**.

The next proving ground should be **email or messaging**, because they introduce materially different concerns Calendar intentionally avoids:

- third-party consequences
- external footprint
- Non-transferable Authority
- revocation before execution

Only after **two materially different executors** have been independently certified should the Authorized Actions framework be generalized.

---

## Remaining Milestone

**Stage 4 is complete (2026-06-18)** — the entire constitutional pathway, conversation through bounded execution, has been demonstrated end-to-end on the proposal branch.

Remaining: **Stage 5 — production deployment** (merge the proposal branch, deploy, verify in production), then **Stage 6 — field use.**

---

## Certification Protocol

Every Authorized Action executor completes the same ladder before it is considered Live. Each rung certifies a *different* property, so "done" is defined by evidence, not intuition:

1. **Code-verified** — implementation exists and typechecks.
2. **Negative-path verified** — unauthorized / unauthenticated execution is refused.
3. **Positive-path runtime-certified** — authorized execution succeeds.
4. **Boundary-certified** — footprint and side effects are exactly those intended.
5. **Conversationally certified** — MAIA emits the proposal naturally in a live interaction.
6. **Production-certified** — deployed and validated in the field.

Calendar has cleared **1–5 on the proposal branch**; rung 6 remains. The ladder is reusable for every future executor (email, messaging, contacts, tasks, Studio actions) — a shared, evidence-based definition of "done."

## Why "Live / Designed / Vision"

The naming is more than a communication device; it is a **governance tool.** It gives the team a shared vocabulary for distinguishing **what has been demonstrated**, **what has been architected**, and **what remains directional** — reducing the risk that design intent is mistaken for implemented capability.
