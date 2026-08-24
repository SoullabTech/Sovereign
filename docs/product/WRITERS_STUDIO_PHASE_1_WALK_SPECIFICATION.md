# Writer's Studio Phase 1 — Walk Specification

## Specification Status

| Status | Meaning | Executable? |
|---|---|---|
| ▶ **`Draft`** | being authored; steps and/or criteria incomplete | **no** |
| `Frozen` | authored, frozen, assigned a version | **yes — the only executable state** |
| `Superseded` | replaced by a later version; prior evidence remains judged against it | no |
| `Withdrawn` | retired without replacement | no |

**Current status: `Frozen` — version 1.0, frozen 2026-08-24. See the Freeze Record (§3).**

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
| Status | `Frozen` |
| Version | 1.0 |
| Frozen by | Kelly (founder) — criteria authored by the founder, 2026-08-24; transcribed by Claude, who authored none of them |
| Date | 2026-08-24 |
| Reason | The 2026-08-02 audit left this frame stepless and unfrozen, so the freeze's own remedy ("re-run the complete walk from W1") had no referent. Phase 3A then established that the original acceptance question — *can a writer bring material in, preserve the original source, and create a working draft* — had been judged against the wrong referent: `manuscript_sections` is an immutable **interpretation**, not the arrival, and the arrival can already have been discarded. This version therefore adds the static precondition **P0 — Source custody** ahead of any member step. That is a correction to the *evidence* for a founder criterion present from the beginning, not a new criterion invented after implementation. |
| Commit SHA of the frozen text | `31cea0e41323b6a19dbc8412cfa3710d034fe0a0` — the freezing commit; sealed here per §3.1 |

*Unfilled means unfrozen. An unfrozen specification cannot be executed.*

### §3.1 — How the commit identity is recorded

The SHA of the commit containing the frozen text cannot be written *into* that same text — the
insertion would change the commit. The freeze is therefore completed in two commits, and the
distinction is auditable:

1. **The freezing commit** carries the whole frozen text: the precondition, the steps, the
   criteria, the founder gates, and every Freeze Record field except this one.
2. **The sealing commit** replaces `PENDING_SEAL` with the freezing commit's SHA and changes
   **nothing else**. The criteria are byte-identical across the two.

The specification is unfrozen between the two commits, and nothing is executed there.

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

**Step count: 8 member acts (founder-determined), preceded by the static precondition P0.**

⛔ This is a **fresh specification with a fresh referent.** It does not reuse, renumber or
inherit `W1–W16` or `C1–C9`. Those name steps of runs whose specification never existed; per
`PHASE1_WALK_DEFINITION_AUDIT_2026-08-02`, they *"must not be used as a release gate."*

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

### P0 — Source custody *(static precondition; evaluated before any member step)*

> **For an imported Work, the candidate must preserve what actually arrived independently of any
> segmentation or interpretation, and no arriving text may be silently discarded before the
> member begins working.**

| Field | Value |
|---|---|
| What is evaluated | The candidate's substrate, not a member's experience of it |
| **Pass** | The arrival is preserved independently of interpretation, and omission is detectable |
| **Fail** | Any arriving text can be discarded before the member begins, or the only preserved artifact is itself an interpretation |
| Blocking? | **Yes.** A failed P0 makes the candidate non-executable; A–H are `NOT REACHED` |
| Admissible evidence | A persisted original artifact, or an equivalent lossless arrival witness; hashes and provenance; an extraction comparison capable of **detecting omission** |
| **Inadmissible evidence** | `manuscript_sections` being immutable · a UI label reading "Source" · section counts · successful HTTP responses · the absence of later `UPDATE`s |

⭐ P0 exists because a human walk cannot repair a substrate falsehood. A writer looking at
something labelled *Source* has no way to perceive that it is an interpretation with text
already missing. Passing a member walk over that would be ceremony: the interface would pass
what the architecture disproves.

---

### The eight member acts

Every act is **blocking**: the first failure stops the walk, and every later act is
`NOT REACHED`.

> **A — Arrive**
>
> | Field | Value |
> |---|---|
> | What the member does | Enter Writer's Studio through the ordinary member path |
> | **Pass** | The writer understands where they are, what they are working on, and how to begin or continue — without needing system knowledge |
> | **Fail** | A dead end, an unexplained layer jump, or *"where do I type / where do I go?"* |
> | Blocking? | Yes |
> | Admissible evidence | Human observation plus an uninterrupted screen witness |
> | **Inadmissible** | A direct URL or deep link used to bypass the member path |

> **B — Begin**
>
> | Field | Value |
> |---|---|
> | What the member does | Start with no imported material; click the empty writing field and write |
> | **Pass** | An ordinary click puts the writer into writing; no programmatic help and no hidden setup is required |
> | **Fail** | A visible field cannot be entered naturally, or requires a workaround |
> | Blocking? | Yes |
> | Admissible evidence | Mouse / keyboard / browser witness |
> | **Inadmissible** | DevTools focus · a script · an endpoint call |

> **C — Bring in**
>
> | Field | Value |
> |---|---|
> | What the member does | Import a known manuscript through the member-facing path |
> | **Pass** | The member can bring existing writing in and can distinguish what arrived from what is editable. **P0 must already have established that the arrival itself was preserved** |
> | **Fail** | Import requires technical intervention, or the Source/Draft relationship is misleading |
> | Blocking? | Yes |
> | Admissible evidence | Human walk plus P0 provenance evidence |
> | **Inadmissible** | UI appearance alone as proof of source fidelity |

> **D — Work**
>
> | Field | Value |
> |---|---|
> | What the member does | Make a meaningful edit and continue writing |
> | **Pass** | The editable Work changes; the preserved arrival does not. Saving behaves as promised |
> | **Fail** | Source is overwritten · an edit disappears · authorship becomes ambiguous |
> | Blocking? | Yes |
> | Admissible evidence | Human action plus a source/draft comparison |
> | **Inadmissible** | Direct database or API mutation |

> **E — Leave and return**
>
> | Field | Value |
> |---|---|
> | What the member does | Write something identifiable, leave normally, then later return through the Studio |
> | **Pass** | The same Work returns with the writing intact, and the member lands in the place and context they were actually using |
> | **Fail** | Wrong Work or state · lost text · continuity that depends on list position rather than identity |
> | Blocking? | Yes |
> | Admissible evidence | Human re-entry witness |
> | **Inadmissible** | Deep-linking directly to the expected destination · manipulating storage |

> **F — Save for later**
>
> | Field | Value |
> |---|---|
> | What the member does | On something encountered in the Work, choose **Save for later** |
> | **Pass** | It remains contained where that gesture promises; it does **not** silently become Personal or Field memory |
> | **Fail** | The system promotes or reclassifies it without another member act |
> | Blocking? | Yes |
> | Admissible evidence | The member gesture plus read-only substrate corroboration |
> | **Inadmissible** | SQL or API used to manufacture the state |

> **G — Keep in my Field**
>
> | Field | Value |
> |---|---|
> | What the member does | Deliberately choose **Keep in my Field** on something they want to carry across |
> | **Pass** | A distinct, explicit gesture creates the lawful Field relationship/object, with provenance back to the member act |
> | **Fail** | No crossing occurs · the wrong thing crosses · the system or MAIA can make the crossing for them |
> | Blocking? | Yes |
> | Admissible evidence | A visible member gesture plus read-only custody/provenance evidence |
> | **Inadmissible** | An endpoint call standing in for the gesture |

> **H — History and restoration**
>
> | Field | Value |
> |---|---|
> | What the member does | Make a meaningful change, create a recoverable point, then restore an earlier state |
> | **Pass** | Every meaningful change remains attributable; restoration **creates** history rather than rewriting it; nothing appears that the member did not author or authorize |
> | **Fail** | History is rewritten · unexplained changes appear · restore destroys provenance |
> | Blocking? | Yes |
> | Admissible evidence | Human actions plus an append-only history witness |
> | **Inadmissible** | Direct revision insertion · database editing |

**Why B and C are both entry conditions.** Importing material and starting blank exercise
different claims, and the blank surface is specifically where real clickability must be
witnessed. Neither substitutes for the other.

---

### Founder gates — after A–H

⛔ **These are not agent-scored procedural steps. No technical test can pass either of them.**

> **G1 — Felt grammar.** The founder walks the visible Workbench and action language in context.
> The question is not *"does each button function?"* It is:
>
> - Do I know what each action means **before** using it?
> - Does the language name **my act**, rather than an implementation?
> - Are distinct blast radii represented as **distinct gestures**?
> - Does anything imply authority the system or MAIA does not possess?
> - Does the vocabulary **disappear** once I am working, rather than making me operate software?

> **The final felt criterion** — preserved exactly as previously established:
>
> ### **Did you forget the software and feel like you were writing your book?**
>
> ⛔ A complete procedural walk with a **No** here **is not accepted.**

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
