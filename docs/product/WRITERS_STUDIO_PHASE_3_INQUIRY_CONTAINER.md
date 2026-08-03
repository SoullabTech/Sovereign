# Writer's Studio Phase 3 — Inquiry Container

## Status

| Status | Meaning | Executable? |
|---|---|---|
| ▶ **`Draft`** | inquiry authorized; instrument not defined | **no** |
| `Frozen` | instrument defined, frozen, versioned | **yes — the only executable state** |
| `Superseded` | replaced by a later version; prior evidence remains judged against it | no |
| `Withdrawn` | retired without replacement | no |

**Current status: `Draft`.**

⭐ Executability is **read from this field**, never inferred from prose, completeness, or the
presence of dimensions. ⭐ `Draft → Frozen` requires completing the Freeze Record (§6) — the
status field is not edited on its own.

> **This document is a CONTAINER.** It holds an authorized question and the structure of the
> instrument that would answer it. It contains **no observation criteria and no steps.**

---

## 1. The authorized inquiry

**Authorized by:** Kelly (founder), 2026-08-03.

> **What observed human/system relationship model is supported by evidence?**

### Scope of that authorization — recorded verbatim

> *This authorization is limited to preserving the inquiry and defining its container. It
> does not authorize observation execution, criteria, Model A/B selection, implementation, or
> deployment.*

(Stated twice by the founder on 2026-08-03, the second adding **deployment** explicitly. The
union of both statements governs: **observation execution · criteria · Model A/B selection ·
implementation · Phase 3 build work · deployment** are all unauthorized.)

### What the authorized inquiry frames — and what it does not validate

A question is not neutral merely because it is phrased as an observation question. Its
wording establishes what counts as relevant evidence, what alternatives are considered, and
what outcome would constitute resolution. Those commitments are recorded here so they remain
visible rather than becoming invisible assumptions.

> ⭐⭐⭐ **The authorized inquiry preserves the existing Model A/B question as the object of
> investigation. It does not assert that Model A/B is the final or correct explanatory model.
> Evidence may refine, replace, or withdraw the frame.**

Framed by this authorization, and **held as the inquiry's shape rather than as validated
conclusions**:

1. the **Model A / Model B** question is the object of investigation;
2. **observation** is the next evidence source;
3. the purpose is **reconciliation**, rather than further unresolved discovery.

⛔ **None of the three is thereby validated.** A later finding that any of them was wrong is
grounds to **revise or withdraw the inquiry** — never grounds to reinterpret the evidence.

## 2. What this container is not

⛔ It does not authorize observation execution · observation criteria · Model A/B selection ·
implementation · Phase 3 build work · **deployment**.

⛔ It is **not** the Phase 1 acceptance instrument. `WRITERS_STUDIO_PHASE_1_WALK_SPECIFICATION.md`
asks *"can the Phase 1 release candidate be accepted after the W8 failure and corrections?"*
That is a **release-acceptance** question. This is a **field-experiment** question. Neither
may borrow the other's steps, numbering, or acceptance semantics.

⛔ Its existence does not advance Phase 3 authorization. **Instrument definition ≠ experiment
execution ≠ authorization to build.**

⛔ **Numbering:** when steps are eventually authored they must use a distinct prefix — **not**
`W` (Phase 1 release walk) and **not** `F` (Correction 3 feature walk). Reusing either would
invite the instruments to be confused. Two prior instances of exactly that confusion are on
record.

## 3. The four artifacts

```text
Inquiry Specification → Observation Subject → Observation Evidence → Founder Decision
```

| # | Artifact | Answers | Where it lives |
|---|---|---|---|
| 1 | **Inquiry Specification** | what will be observed, how, and what would count as evidence | **this document**, once frozen |
| 2 | **Observation Subject** | exactly what was observed — environment identity and build SHA | §5, recorded per run |
| 3 | **Observation Evidence** | what was actually observed | a separate record, one per run |
| 4 | **Founder Decision** | what the evidence supports, and what it authorizes | a separate artifact — ⛔ **not this document** |

> **The evidence record is not the specification. The specification is frozen before
> execution; the evidence records what happened when it was executed.**

⭐ A specification must not contain the decision it eventually feeds.

## 4. Preconditions

To be satisfied and recorded **before** any observation begins. Values are authored by the
founder; the rows are the container.

| Precondition | Value |
|---|---|
| Environment identity frozen | |
| Build SHA under observation | |
| Instrumentation identified | |
| Participant role(s) defined | |
| Observer role(s) defined | |
| Consent boundaries defined | |
| No implementation changes during observation — confirmed | |

⭐ **On the consent row: existing sovereignty and consent invariants apply.** Observation of a
member's real use is already governed by Sanctuary Mode and the Sovereignty Invariants. This
row **records how those existing invariants were satisfied** for a given run — it does **not**
introduce a new Phase 3 consent criterion, and nothing here authors one. Like every other
precondition row, leaving it unfilled leaves the container unready.

## 5. Observation subject

| Field | Value |
|---|---|
| Environment | |
| Build SHA | |
| Observed at | |
| Inquiry specification version this run is judged against | |

⛔ The subject is one named, identified environment — never "whatever is currently running."

## 6. Freeze Record

**Completing this record *is* the act of freezing.** The `Draft → Frozen` transition requires
it — that is what makes freezing an observable, auditable event rather than a change of
adjective.

| Field | Value |
|---|---|
| Status | |
| Version | |
| Frozen by | |
| Date | |
| Reason | |
| Commit SHA of the frozen text | |

*Unfilled means unfrozen. An unfrozen inquiry specification cannot be executed.*

**Completed exactly once.** Never rewritten. Superseding produces a **new version with its
own freeze record**; this one stays as the history of the version it froze.

## 7. Observation dimensions

**Dimension count: ______ (founder-determined).** ⛔ Not inferred, not carried over from any
prior instrument.

The six dimensions below were named by the founder as *likely* subjects of the inquiry. They
are preserved here as **slots**, with evidence criteria **intentionally blank**. ⛔ Naming a
dimension is not defining what would count as evidence for it.

| Dimension | Evidence sought | Criteria |
|---|---|---|
| **Arrival** | what the member encounters first | *(unauthored)* |
| **Orientation** | whether the environment reveals possibilities without prescribing | *(unauthored)* |
| **Agency** | whether the member remains author of direction | *(unauthored)* |
| **Continuity** | whether prior work becomes available appropriately | *(unauthored)* |
| **Relationship** | whether MAIA/support surfaces relationship without becoming authority | *(unauthored)* |
| **Return path** | whether the member can recover meaning later | *(unauthored)* |

### Dimension slot template

> **⟨prefix⟩__ — _(dimension)_**
>
> | Field | Value |
> |---|---|
> | What is observed | |
> | What would count as **supporting** evidence | |
> | What would count as **disconfirming** evidence | |
> | Admissible evidence | |
> | **Inadmissible** evidence for this dimension | |

⭐ The **inadmissible evidence** row is not optional. Both prior walks in this project turned
on it — an endpoint call could not prove a member path, and a programmatic focus could not
prove reachability. Naming what *cannot* count is what prevents an instrumented substitute
from standing in for the thing itself.

## 8. Disposition discipline

⭐⭐⭐ **A failed observation means: *the observed environment did not satisfy the
hypothesis.* It does not mean: *the model was wrong.***

A failed observation may reveal any of four distinct things, which must be recorded
separately and never collapsed:

| Cause | What it implies |
|---|---|
| Implementation defect | the environment, not the model, is at fault |
| Unclear hypothesis | the question needs revision before re-observation |
| Insufficient measurement | the instrument, not the environment, failed |
| Wrong model | the model itself is disconfirmed |

⛔ **Model A / Model B remain unresolved and unselected.** This container holds the question;
it does not answer it. Neither model may be marked as favoured, likely, or leading.

## 9. Outcome

**The completed observation evidence is the only admissible input to a founder decision
about what the observation supports.**

That decision is a separate artifact and is deliberately **not recorded here**.

⛔ **A walk produces evidence; it does not produce authorization.** A completed observation,
however clean, is grounds for a decision — not the decision, and not authorization to build.

## 10. Sequence this sits inside

```text
Phase 1 acceptance walk → evidence → founder acceptance
      → Model A/B reconciliation → Phase 3 authorization → Phase 3 build
```

**This container's existence does not move that sequence.** Phase 1 remains failed at W8 with
an empty, unfrozen acceptance specification. Phase 3 build work remains unauthorized.

⛔ Whether this inquiry may execute *before* Phase 1 acceptance is **a separate founder
decision that has not been made.** Creating the container did not make it.
