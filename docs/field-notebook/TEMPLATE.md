# Field Notebook — Entry Template

A **field notebook**, not a research notebook. It records what reality did — including
observations that *weaken* the current architecture. Its obligation is to preserve disconfirming
evidence, not to recruit support for a thesis.

**Status: Corpus Standard** (promoted 2026-06-18, after the schema survived four refusal cases and
one generative case and produced a correction its predecessor could not express). This schema is
the **method** used to study the architecture — *not* part of MAIA's constitution. The two evolve
on different clocks: do not promote a schema finding into a constitutional article, or read a
constitutional principle as a schema rule.

Every entry records **two separate trajectories** — and they are not the same thing:

```
  Reality → Observation → Epistemic Outcome        ("what we learned")
  Promotion Claim → Verification → Constitution     ("what changed in the architecture")
```

The architecture can stay frozen while our understanding moves (a verified-live duplicate
implementation changes no principle but changes what we *know*). Keep the two apart.

## Three axes, all of which can move down

- **Epistemic Outcome** — what reality did to a *claim*. Exactly one *per claim* (an entry that
  tests several claims lists each). The four are mutually exclusive:
  - **Confirmed** — observation supports the prediction.
  - **Diverged** — observation reveals a fact the prediction was silent on (orthogonal surprise).
  - **Falsified** — observation contradicts the prediction (the principle itself is wrong here).
  - **Underdetermined** — observation is insufficient to decide. *(The scientist's normal state —
    do not round it to "held.")*
- **Confidence delta** — what the observation did to our warrant: **up** (corroborated) · **same**
  (held) · **down** (demoted). Carries a `last reviewed` date so stale-high-confidence is visible.
- **Promotion** — which architectural layer a finding changed (Operation · Certification ·
  Evidence · Constitution), as a lifecycle: Claimed → Verified → possibly **Refuted/Demoted**.
  Mirrors Proposed ≠ Accepted ≠ Implemented ≠ Verified ≠ Constitutional.

> *A framework that cannot describe what would prove it wrong is not yet ready to explain why it is right.*

---

```
# NNNN — <Title>

- Date opened:
- Last reviewed:
- Status:        open | divergence-found | demoted | promoted | reconciled
- Entry type:    internal-engineering | internal-design | internal-governance | member-constitutional-case
- Confidence:    L0 interesting · L1 repeated pattern · L2 strong evidence · L3 candidate principle · L4 verified  (may decrease)

## Context
What problem were we trying to solve?

## Constitutional Prediction
Which principle(s) predicted the design? (doc path + section)

### Expected Observation
If the principle holds here, we should see…

### Potential Falsifier
If this principle were wrong here, we would expect… (a concrete, checkable observation)

## Decision
What did we actually build — or refuse?

## Observation
What happened in practice. **Cite how it was verified** (prod query · git · doc line · read).

## Epistemic Outcome
Headline: Confirmed | Diverged | Falsified | Underdetermined
  — the headline tracks the entry's **load-bearing claim** (its *purpose*), not its
    most-easily-verified claim (its *mechanism*). A construction whose mechanism is live but whose
    purpose is unmeasured headlines **Underdetermined**, not Confirmed — else the corpus re-acquires
    the inflation bias through the back door. (Rule earned by 0005.)
Per claim (when the entry tests more than one):
  - <claim> → <outcome>  (confidence: up | same | down)

## Divergence
Where reality differed from, or exceeded, the prediction. (Elaborates a Diverged/Falsified outcome.)

## Promotion
**Claimed**     — Level / Date / Rationale
**Verified**    — Level / Date / Evidence / Verified by
**Refuted / Demoted** (if reality lowered or overturned the claim) — Level / Date / Evidence / What it overturned

## Case Authorship   (required for member-constitutional-case; omit for internal entries)
- ☐ Member-authored   ☐ Jointly authored   ☐ Steward summary approved by member
- Approval date:

## Confidence note
Why this level; what would move it up or down. Last reviewed: <date>.

## Self-audit  (guards the corpus against becoming a history of refusals)
If this were the only surviving artifact, what **mistaken picture** of the architecture would a
future reader reconstruct? — and what **generative case** would restore the whole? (Name it; it
becomes a pointer to the aspiration-entry that should exist.)

## Open Questions
What still isn't known.
```
