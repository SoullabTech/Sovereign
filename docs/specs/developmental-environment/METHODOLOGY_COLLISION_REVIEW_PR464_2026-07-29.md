# Methodology Collision Review — Environmental Field Studies ⟷ PR #464

**Date:** 2026-07-29 · **Type:** read-only review, pre-push gate
**Lane A:** `chore/field-study-method-candidate` — Environmental Field Studies (this lane)
**Lane B:** PR #464 `docs/personal-field-methodology` @ `3c9496784` — Personal Field case-study
protocol + RAPPORT calibration rubric (open since 2026-06-15)

**Nothing in Lane B was modified, fetched into this branch, or harmonized.** Review was
conducted by reading `git show 3c9496784:<path>` only.

---

## Verdict: **Outcome 2 — shared foundation, different applications**

Not Outcome 1 (distinct domains): the two share a substantial and non-accidental
methodological substrate. Not Outcome 3 (competing protocols): they do not govern the
same act, and neither claims canonical status.

**Proceed independently, cross-cited. Do not merge, fold, or unify.**

---

## 1. Do they govern the same act?

No. The decisive difference is the **object of study**.

| | **Lane A — Environmental Field Studies** | **Lane B — PR #464** |
|---|---|---|
| **Object of study** | The software environment: routes, states, components, transitions | **People**: participants' real attending-episodes (case-study protocol); a human learner's competency growth (RAPPORT rubric) |
| **Method** | Code reading + browser walk + measurement | Interviews, 3-day attending diaries, verbatim transcripts, two-coder open coding |
| **Sample** | n/a — one environment | N≈10–15 cases across 5–8 participants |
| **Who observes** | An AI observer, constrained by a confabulation guard | Human interviewers and reviewers |
| **Purpose** | Reveal the environment's grammar before redesign | Derive the field-object/verb model the redesign must answer to; calibrate a learnable human competency |
| **Output** | Corrections · founder questions · architectural opportunities · pattern candidates | A field model grounded in episodes; five competency lines across sessions |
| **Canonical claim** | None — "Candidate, not ratified" | None — "Diagnostic instrument. Precedes redesign." |

They are complementary, not competing: Lane B asks *what are people actually attending to?*
Lane A asks *what is this environment actually organizing around?* A complete answer for a
surface like Personal Field needs both, run separately.

---

## 2. The shared substrate (name it once, do not duplicate it)

The convergence is real and worth recording. Five principles appear independently in both,
arrived at six weeks apart, by different routes:

| Principle | Lane A | Lane B |
|---|---|---|
| **Classify before you interpret** | Observations and inferences never share a paragraph | *"Fill Phase A entirely from the transcript before you read the scores or write one word of interpretation"* |
| **Inference must be marked, and is weaker evidence** | Class C may not support rulings | `PROVENANCE: verbatim ☐ paraphrased ☐ inferred ☐ (inference MUST be marked)`; inferred objects excluded from primary counts |
| **Fix the instrument before the evidence** | Observation Declaration, immutable for the sitting | §6 decision rules **pre-registered** — *"so the conclusion is not fitted to the hypothesis after the fact"* |
| **Each signal earns only the rung it stands on** | Five evidence classes; *built ≠ wired ≠ surfacing ≠ verified* | *"What each measure actually proves (don't conflate them)"* — practice / transfer / durable learning / generalization; *"Surfacing ≠ verified — all the way up"* |
| **Observe the behavior; never author the meaning** | Confabulation guard — state the interface characteristic, defer the felt claim to human observation | Meaning-attribution guard — the system may notice *"you've reopened this three times"*; it may never conclude *"you are grieving"* |

### Instrument drift, found twice

The sharpest convergence. Lane B names **"the expanding ruler"** — as the learner improves the
facilitator's standard quietly rises, so scores drift against a moving instrument; its backstop
is verbatim transcripts, which *cannot be rescaled*. Lane A names **instrument divergence** — the
method can move underneath a sitting while the product holds still; its backstop is a content
fingerprint verified at close.

Same failure mode, independently identified, in two different research acts, solved two
different ways.

> **Emerging pattern candidate 001**
> An instrument that is not fixed independently of its evidence will drift toward its own
> hypothesis, and the drift is invisible from inside the study.
> **Observed in:** Environmental Field Studies · Personal Field case-study protocol (#464)
> **Surfaced by:** instrument-integrity fingerprint · the expanding-ruler caution
> **Cross-instrument:** yes — different instruments, different domains
> **Status:** Candidate

Per the method's own guard, cross-instrument convergence is the strong kind. This is the first
entry in the cross-study register, and it did not come from applying the method to a field — it
came from comparing two methods.

---

## 3. Contradictions found: none. Two hazards to hold.

**Hazard 1 — terminology collision (real, unresolved).**
Both lanes use *field*, and they mean different things. In Lane B, "Personal Field" is a
**product surface** — the member's field of attention. In Lane A, a "field" is the **unit of
study**. So *"a field study of Personal Field"* is ambiguous in a way that will confuse a later
agent. Lane B says *session* / *run-sheet* / *protocol*; Lane A says *sitting* / *study*.
Recorded here rather than resolved by fiat — near-identical concept names are on Lane A's own
list of structural causes of confusion, and this one is now on the list.

**Hazard 2 — do not let Lane A's ethics rule bleed onto Lane B.**
Lane A forbids reading member content to characterize experience, because its observer is an AI
with no consent basis and its object is an environment. Lane B's object *is* people, gathered
under an interview consent basis of its own. Harmonizing the two rules would wrongly forbid
legitimate human research. **Different act, different consent basis.** The rules must stay in
their lanes.

---

## 4. Disposition

- Lane A proceeds to PR as a candidate-method tooling lane.
- Lane A's method doc gains a single cross-reference naming the shared substrate (below), so
  that the convergence is recorded once rather than re-derived as duplicate canon.
- **PR #464 is not touched**: not folded in, not amended, not rebased, not harmonized.
- If #464 later moves toward ratification, the shared substrate should be lifted to a common
  ancestor document rather than copied into both — but that is a founder question, not a
  reviewer's call, and it is not urgent while both remain candidates.
