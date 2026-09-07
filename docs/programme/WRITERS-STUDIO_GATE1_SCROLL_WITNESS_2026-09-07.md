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

## RESULT — ✅ PASS · founder witness, 2026-09-07

> **"glitch is fixed"** — Kelly, walking the subject.

```text
SUBJECT           717cef35 on localhost:3100
OBSERVER          founder · first-person
CRITERION         founder-authored BEFORE the walk, unchanged after it
VERDICT           PASS
```

⚠️ **On the force of the pre-registration, precisely.** The criterion was
authored by the **walker**, in the message preceding the walk, and is recorded
here **verbatim and unaltered**. That is what makes it pre-registered. This
session's *commit* of it may or may not have landed before the click — that is
immaterial and is **not** claimed either way, because the recorder did not write
the criterion. ⛔ Recording someone else's fixed criterion is not the same as
having set it, and the file must not be read as if this session had.

## WHAT IS AND IS NOT CLOSED

```text
✅ CLOSED   the behavioural defect — the page stays where the founder puts it
            across repeated Manuscript/outline selections, on the axis that
            actually moves
```

⛔ **NOT closed, and not claimed:**

- **Keyboard navigation** was not exercised. The outline row is
  `role="button" tabIndex={0}`; arrow-key traversal is a different focus path
  from a pointer click and no observation covers it.
- **Other rooms** were not walked. `preservingScroll` guards the sectioned
  writing surface only; a continuous draft mounts `Worktable`, which was not
  the subject.
- **Production** was not observed. This is a `localhost:3100` witness on a
  local build. *Witnessed ≠ deployed*, and the same discipline that kept
  "verified" apart from "deployed" for Circles applies here.

## STANDING

```text
GATE 1 · SCROLL WITNESS   ✅ PASS   founder-witnessed on 717cef35
GATE 2 · SCHEMA CUSTODY   ✅ CLEAR  all five migrations already applied
STUDIO REGRESSIONS        ZERO     44 suites · 686 tests
GLOBAL TYPECHECK          RED      pre-existing · truthfully recorded, not relabelled
DEPLOY                    ELIGIBLE under the no-new-regressions policy
```


---

# ⛔ WITHDRAWN — WRONG SUBJECT. And a correction this session owes.

**2026-09-07, on reading the founder's actual checkout.**

```text
FOUNDER CHECKOUT   build/ws-home-redesign-slice-a @ f7028f5d5
CONTAINS 717cef35  NO
CONTAINS 77f72055  NO
```

The witness recorded above as `PASS on 717cef35` **was not performed on
`717cef35`**. It was performed on a branch containing neither of this session's
commits. The verdict stands as a fact about the founder's screen; ⛔ **the
subject attribution does not, and is withdrawn.** *A witness is a reading of a
subject, and naming the wrong subject voids the binding even when the observation
is sound.*

## ⭐ THE CORRECTION THIS SESSION OWES

This session wrote, in a commit message and in this file, that the first repair
*"shipped, threw no error, and the jump survived"* — offered as demonstrated
proof that it had guarded the wrong axis.

**That premise was false.** The founder's *"screen still jumps"* report came from
a build that **never contained the first repair**. The repair did not fail; it
was never run. So:

> ⛔ **The claim was reasoned, not witnessed.** It read a founder report as
> evidence about code the founder was not running — the exact error class this
> lane has now hit three times, committed here by the session that had been
> naming it in others.

The technical observation may still be true — the surviving branch fixes this
with `preventScroll` alone (`f8d772f7`), and its remeasure at
`SectionWritingSurface.tsx:234` collapses `height:auto` **with no scroll guard**,
which is the second cause this session identified. But it is now **a hypothesis
with no supporting observation**, and the founder's PASS on that very branch is
evidence *against* its reproducibility. ⛔ It must not be carried forward as
established.

## STANDING, CORRECTED

```text
GATE 1                  ⛔ NOT WITNESSED for this branch
CANVAS MATERIAL 77f72055 ⛔ SUPERSEDED by founder convergence ruling 3246996a
SCROLL FIX 717cef35      unwitnessed · possibly redundant · not established
DEPLOY ELIGIBILITY       ⛔ WITHDRAWN — it was stated of the wrong subject
```
