# GATE 1 — SCROLL WITNESS · PRE-REGISTERED

**Pre-registered before the walk, deliberately.** The W-03 packet established the
discipline in this lane: a criterion written after the observation is a criterion
fitted to the observation. The subject and the pass/fail line are fixed here so
the result can only confirm or falsify — never be interpreted into a pass.

```text
SUBJECT       717cef35 (or later) on localhost:3100
WALKER        Kelly · first-person perception
RECORDER      Jarvis · this session performs NO part of the observation
```

⛔ **This session cannot perform this witness.** No browser, no access to
`localhost:3100`, no sight of the founder's 174-section manuscript. Any statement
from here about what the page does is a prediction, not evidence.

## PROTOCOL (founder-authored)

1. Put the page at the top so the **top of the left Studio rail is visible**.
2. Click **4–5 different** Manuscript/outline rows, including one farther down.
3. Watch the **page-level position**, not whether the outline panel scrolls.

## ⭐ PASS CRITERION — the distinction is the whole test

> **The outline MAY move internally to reveal the selected row.
> The surrounding Studio page MUST stay where you put it.**

```text
PASS   rail top + header stay fixed, while the outline centres its selected row
FAIL   the rail top or header moves at all
```

⚠️ **A test that forbade all movement would fail the correct behaviour.** The
reveal is *supposed* to move the outline's own scrollport — that is the feature.
The defect was never movement; it was movement **escaping its column**. The two
are separable only because the repair scoped them, and the criterion has to be
written to that seam or it measures the wrong thing.

## WHAT A PASS FALSIFIES

The prior behaviour, reported twice by the founder:

> *"the whole field shifts upward unless I reset"* (2026-09-07)
> *"screen still jumps on Manuscript item selection"* (2026-09-07, after the
> first repair shipped)

⭐ **The second report is why this is pre-registered.** The first repair guarded
`window.scrollY` — an axis that is 0 for this entire session, because `<main>`
carries `overflow: auto`. It threw no error, passed every test then existing, and
changed nothing. **A guard on the wrong axis is indistinguishable from a working
guard until something measures the axis that actually moves.**

⛔ So a pass here is **not** "the tests are green" — they were green last time
too. It is the founder's eye on the axis that moves.

## ON A FAIL

⛔ **Do not repair on the spot.** A third repair guessed at from a description is
how the second one happened. A fail reopens observation: which element moved
(rail · header · writing plane), on which click, and whether the outline moved
with it. Perception first, mechanism second.

## STANDING

```text
GATE 2 · SCHEMA CUSTODY   ✅ CLEAR
GATE 1 · SCROLL WITNESS   ⏳ OWED — founder act, not performable here
DEPLOY                    HOLD on Gate 1 alone
```
