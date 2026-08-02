# Writer's Studio Phase 1 — Walk Specification

## Specification Status

| Status | Meaning | Executable? |
|---|---|---|
| ▶ **`Draft`** | being authored; steps and/or criteria incomplete | **no** |
| `Frozen` | authored, frozen, assigned a version | **yes — the only executable state** |
| `Superseded` | replaced by a later version; prior evidence remains judged against it | no |
| `Withdrawn` | retired without replacement | no |

**Current status: `Draft`.**

⭐ This field is authoritative. **Executability is read from it, never inferred from prose,
completeness, or the presence of steps.** A specification that looks finished but is not
`Frozen` is not executable.

⭐ **`Draft → Frozen` requires completing the Freeze Record (§3).** The status field is not
edited on its own.

> **This document is a FRAME.** It is the *structure* of the Phase 1 acceptance walk and
> contains **no steps and no pass/fail criteria**. Those are the founder's to author.

**Created:** 2026-08-02, per founder ruling, following
`docs/releases/PHASE1_WALK_DEFINITION_AUDIT_2026-08-02.md` (Option 4 accepted).
**Frame authored by:** Claude. **Criteria to be authored by:** Kelly.

---

## 1. Why this document exists

The 2026-08-02 audit established that canonical trunk held a **record of a failed walk** and
**no specification of the walk itself**. Those are different artifacts. Without a
specification, a rerun cannot honestly claim to execute *"the complete walk"* — *complete*
has no definition.

This document is created **empty on purpose**. Reconstructing steps from the failed-walk
record would not be recovering a specification; it would be authoring one, after the
implementation it judges, from evidence of a failure. That is precisely the substitution
the audit uncovered.

## 2. The four artifacts

Release acceptance requires four distinct artifacts, each with **one** responsibility. None
substitutes for another.

```text
Walk Specification  →  Release Candidate (SHA)  →  Walk Evidence  →  Founder Acceptance Decision
```

| # | Artifact | Answers | Where it lives |
|---|---|---|---|
| 1 | **Walk Specification** | what must be done, in what order, with what pass/fail criteria | **this document** |
| 2 | **Release Candidate** | the explicitly assembled release object, identified by SHA | §4 below, recorded per run |
| 3 | **Walk Evidence** | what happened when *that* candidate was exercised | a separate record, one per run |
| 4 | **Founder Acceptance Decision** | whether the observed behavior is the one we intend | a separate artifact — ⛔ **not this document** |

> **The evidence record is not the specification. The specification is frozen before
> execution; the evidence records what happened when it was executed.**

⭐ **A specification must not contain the decision it eventually feeds.** That is why (4)
lives elsewhere — see §8.

## 3. Freeze-before-execution rule

1. The specification is authored and **frozen** before any candidate is assembled.
2. A frozen specification is **not edited during or after a run.** Findings from a run go
   into the evidence record, never back into the specification mid-flight.
3. Revising the specification produces a **new version**, which applies to subsequent runs
   only. A run is always judged against the version frozen before it began.
4. ⛔ The specification is never written against a particular implementation. It defines how
   **any** candidate is judged. Freezing it before the candidate is assembled is what
   removes the appearance that criteria were tuned to the implementation.

### Freeze Record

**Completing this record *is* the act of freezing.** The `Draft → Frozen` transition
requires it — that is what makes freezing an observable, auditable event rather than a
change of adjective.

| Field | Value |
|---|---|
| Status | |
| Version | |
| Frozen by | |
| Date | |
| Reason | |
| Commit SHA of the frozen text | |

*Unfilled means unfrozen. An unfrozen specification cannot be executed.*

**Completed exactly once.** This record is never rewritten. Superseding the specification
produces a **new version with its own freeze record**; this one stays as the history of the
version it froze.

## 4. Release candidate

The walk evaluates **one named assembled object — never "the current branch."**

| Field | Value |
|---|---|
| Candidate SHA | |
| What it assembles (PRs / corrections) | |
| Assembled by | |
| Assembled at | |
| Specification version this run is judged against | |

## 5. Fixture baseline

Per the walk-fixture baseline protocol: **select and record the baseline before any fixture
mutation.** A destructive step is always last.

| Field | Value |
|---|---|
| Fixture identity (member / work / environment) | |
| Baseline recorded at | |
| Baseline contents (as selected, before any write) | |
| Environment (local / staging / production) | |

⛔ A fixture whose baseline was recorded *after* a mutation is inadmissible. Evidence
gathered against it does not count.

## 6. Step slots

**Step count: ______ (founder-determined).**

⛔ Not inferred from the failed-walk record, and not carried over from any prior numbering.
Steps are added below by the founder, one block per step, in execution order.

### Step slot template

> **W__ — _(name)_**
>
> | Field | Value |
> |---|---|
> | What the member does | |
> | What must be true for a **pass** | |
> | What constitutes a **fail** | |
> | Blocking? (a fail here halts the walk) | |
> | Admissible evidence | |
> | Inadmissible evidence for this step | |

⭐ The **inadmissible evidence** row is not optional. The W8 failure of the prior run turned
on exactly this: an endpoint call was not admissible evidence for a missing member path.
Naming what *cannot* count, per step, is what prevents an instrumented substitute from
standing in for the member's actual path.

### Steps

*(none authored — this section is intentionally empty)*

## 7. Pass/fail recording format

Recorded in the **evidence record**, never in this document.

| Field | Meaning |
|---|---|
| Step | `W__` |
| Verdict | `PASS` · `FAIL` · `NOT REACHED` · `NOT CLEAN` |
| Evidence | what was observed, and how |
| Notes | |

Rules:

- **`NOT REACHED` is not `PENDING`.** Steps after a blocking failure were not attempted;
  they are unknown, not outstanding.
- **Passing steps do not dilute a failure.** Passing seven steps of a walk whose eighth step
  carries the acceptance claim does not produce a partial acceptance.
- **`NOT CLEAN` is a real verdict** — a step that functioned but surfaced a member-facing
  defect is neither a pass nor a fail, and must not be rounded to either.
- A run's verdict is recorded even when the run is abandoned.

## 8. Outcome

**The completed evidence record is the only admissible input to a Founder Acceptance
decision.**

That decision is a separate artifact and is deliberately **not recorded here**. A
specification must not contain the decision it eventually feeds.

⛔ A completed walk with every step passing is *grounds for* acceptance, not acceptance
itself. Acceptance is not inferable from tests, gates, or walk results.

## 9. Prohibitions

- ⛔ Do not extend or edit
  `docs/releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK_2026-08-02.md` into a specification. It
  remains historical evidence of the failed run.
- ⛔ Do not populate §6 by inference from that record, from prior conversation, or from any
  step numbering that has no canonical referent.
- ⛔ Do not execute a walk against an unfrozen specification.
- ⛔ Do not resume a walk mid-sequence after a repair. A repaired candidate is exercised
  from the first step.
