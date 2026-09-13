# BCS-01A — Plain-Language Record

**Date:** 2026-09-13 · **Status:** CLOSED · FINAL PASS · **Subject:** `91a266fc`
**Author of §1–2:** founder, verbatim · **Kind:** the lane's readable statement

> Seventeen lane documents are written in governance idiom. This one is not. It exists so the
> result is legible to someone who did not live inside the lane.

---

## 1 · What this lane added

**A governed backend foundation for deeper Writer's Studio intelligence. It did not significantly
change the visible Writer's Studio UI yet.**

- MAIA can now do longer-running analysis safely, instead of needing to understand the whole
  manuscript in one prompt.
- A reading/analysis is explicitly commissioned against a specific manuscript, revision, and
  scope. It cannot silently widen what it reads.
- The manuscript state is frozen for the analysis, so MAIA can always answer: what exact version
  was this based on?
- Long jobs can survive interruptions. Work is partitioned, checkpointed, and can resume rather
  than restarting from zero.
- Worker crashes/timeouts can recover safely without duplicating or corrupting work.
- Cancellation is real and auditable. Asking a job to stop is kept distinct from the job actually
  stopping.
- Member consent can tighten while a job is running. A previously allowed external/material
  crossing cannot continue just because it was allowed at the beginning.
- Every successful analysis unit can now record exactly what manuscript material entered it —
  section, revision, range, and digest — without copying the prose into a second store.
- MAIA can tell whether the manuscript has changed since an analysis was made: `unchanged`,
  `changed`, or `unmeasured`.
- A change does not automatically trigger another analysis. Staleness creates a reason to
  reconsider, not permission to run again.
- We proved one real cognitive output: an evidence-backed recurrence observation — essentially,
  "this element appears repeatedly here and here."
- That observation cannot exist without exact supporting evidence and must pass rules preventing
  partial-coverage inflation or confusing regularity with recurrence.
- The system distinguishes the insight from the machinery that produced it. It is a "recurrence
  observation," not a "job result" or "AI output."
- Those observations cannot automatically enter MAIA's conversation. They still have to cross the
  existing participation/authority boundary truthfully.
- This gives Writer's Studio a foundation for future capabilities like whole-manuscript pattern
  detection, structural reading, developmental reading, and deep analysis without sacrificing
  authorship or provenance.

## 2 · What it did not add yet

- No automatic whole-book recurrence scanner yet.
- No general "deep reading engine" yet.
- No production connection to the real Writer's Studio Work tables yet; the proving lane used a
  controlled provider seam.
- No automatic feeding of these observations into MAIA's replies.
- No change yet to the proposal UX.

---

## 3 · Two precision notes, so §1 stays exact under its own claim discipline

`MARKETING_CLAIM_DISCIPLINE.md` governs internal planning as well as outward copy, so §1 is checked
against the evidence rather than accepted as summary.

**"Worker crashes/timeouts can recover safely."** ⭐ True as the charter's capability name (P5).
⚠️ The implementation term is narrower and deliberately so: **expired-claim recovery**. A missed
heartbeat establishes only that the durable store no longer recognizes a claim as live enough to
retain ownership — never that a process crashed. No `crashed` state is stored, because none could
be truthfully established.

**"Member consent can tighten while a job is running."** ⭐ Proved, and proved on the real material
path. ⚠️ Its recorded ceiling: this holds **for the recurrence acquisition path**. It does not
establish that every material-crossing path in MAIA is wired through that permission seam — that
remains a separate obligation with a separate subject.

⛔ Neither note weakens §1. Both keep it exact — the same discipline the lane applied to its own
instruments.

## 4 · The proposal UX, stated as the next lane's law

```text
MAIA shows the proposed change clearly
  → the writer can edit MAIA's suggestion
  → the writer accepts THEIR resulting version into the manuscript
  → the final text is treated as the writer's version
```

⭐ **The middle step is load-bearing.** Accept-or-reject alone makes the writer a reviewer of
MAIA's text. Editing before accepting makes the resulting words the writer's own. That is the same
distinction the twelve obligations protected, arriving at the surface where a member actually feels
it: **MAIA can perceive, suggest, and accompany; the writer authors the Work.**

⚠️ **Known defect, not yet diagnosed:** `SHOW CHANGE` does not open. ⛔ The panel's visible strings
(`PROPOSED CHANGE` · `SHOW CHANGE` · `KEEP UNCHANGED` · `ACCEPT CHANGES`) return **zero hits** in
this checkout, so the running app is either ahead of `clean-main-no-secrets`, composing those
strings from data, or rendering them from a location not yet swept. ⛔ Not diagnosed from
description — the branch or the rendering file is owed before any repair.
