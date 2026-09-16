# REAL-WORK-ACCEPTANCE-01 — 🔴 OPENED AND FAILED

**Failure point: the first exact-passage editorial gesture, in production.**

```
production            ae27205d9 · editorial flag 1
Work                  55742458-be2c-406a-a158-d0438cf02892  "Writing Presence Test"
STAGE 2               ✅ REMAINS CLOSED — this is not an activation defect
REAL-WORK-ACCEPTANCE  🔴 OPENED AND FAILED
```

## The witness, founder's words, verbatim

Before the click:

```
selected locus   198 · Chapter 10: The Living Spiral
MAIA scope       this Work
```

Immediately after "Work on an exact passage →":

```
selected locus   199 · I. The Living Spiral      ← changed
center scope     Whole manuscript                ← contradicts "exact passage"
right panel      THIS PASSAGE
passage label    Elemental Alchemy Elemental Alchemy
```

> "So this is not just 'it scrolled a little.' The interface silently changed the
> thing you were working on and then gave mutually inconsistent scope signals."

## ⭐ THE EXPERIENCE FRACTURE, CAPTURED

> "The exact moment your attention left Chapter 10 was when you clicked
> 'Work on an exact passage →' and the Studio jumped somewhere else."

⭐ This is the named deliverable of the walk, and it arrived on the first real
gesture. ⛔ It is not a by-product of the defect hunt — it IS the finding.

## Two candidate defects, kept separate

**D1 — exact-passage entry does not preserve the member-selected locus.**
198 was chosen by the member; 199 was chosen by the system. ⛔ The member's
selection is the one thing an "exact passage" gesture exists to honour.

**D2 — editorial entry can present `Whole manuscript` while claiming `THIS PASSAGE`.**
Two scope signals, mutually inconsistent, shown simultaneously. ⛔ Not cosmetic:
the member cannot know what a subsequent act would apply to.

⚠️ D1 and D2 are NOT assumed to share a cause. Recorded as two.

## What is known from source ALREADY READ, and nothing more

- `CanvasClient.tsx:1091` — the affordance is gated on `editorialEnabled` ALONE.
  ⛔ Not on a selected passage.
- `CanvasClient.tsx:1342` / `SectionWritingSession.tsx:136` — in Whole mode the
  outline highlight is `outlinePlace`, **never `writing.activeId`**; and
  `activeId` is what the conversation receives (`:1084`).

⛔ **NO FURTHER SOURCE READING WAS DONE.** Diagnosis is not opened.

## State preservation

⛔ Not done, and deliberately: no typing into MAIA · no send · no adoption ·
no second click · no manual navigation back · no "see if it fixes itself".

## Standing

```
STAGE 2                      ✅ CLOSED (unchanged — production artifact is sound)
① ② ③                        ⛔ SUPERSEDED — the walk stopped at the defect
④ no auto-relationship       ✅ WITNESSED
REAL-WORK-ACCEPTANCE-01      🔴 FAILED at first editorial gesture
D1 locus handoff             ⛔ INVESTIGATION NOT OPENED
D2 contradictory scope       ⛔ INVESTIGATION NOT OPENED
repair                       ⛔ NOT AUTHORIZED
```

⛔ A production defect found by the witness is the witness working. It is not
grounds to reopen Stage 2, and it is not grounds to repair without an act.
