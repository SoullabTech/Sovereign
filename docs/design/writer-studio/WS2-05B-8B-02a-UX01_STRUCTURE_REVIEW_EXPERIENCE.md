# WS2-05B-8B-02a-UX01 · STRUCTURE REVIEW EXPERIENCE

**Status:** **BUILT. Machine floor green on three fixtures. The founder witness
is outstanding — and it is the acceptance.**
**Mandate (Kelly, 2026-08-31):** redesign only the presentation and interaction
hierarchy of the existing frozen Structure Review. **No semantic-reading
changes, no adoption, no Ask MAIA.**

**Acceptance, in his words:**

> Within one screen, can a writer understand what MAIA thinks the work is, see
> where she is uncertain, know what requires the writer's attention, and inspect
> deeper reasoning without being forced to read it?

---

## What was wrong, and it was not density

02a put the thesis first and the room still failed a reader. Four unlike things
were competing as equals — her overall reading, her reasoning, the structural
map, and the questions that require the author — and the page was not saying
which mattered.

**The clearest symptom was `Why?`.** Twenty-two identical buttons turn
EXPLANATION into a repeated control, and a repeated control becomes furniture.
For one commit an authoring gesture was living inside one of them, conflating
two questions that must never share an affordance:

```text
Why does MAIA see it this way?     about her reading
What do I want to do with it?      about my structure
```

## Understand → Orient → Inspect → Respond

**UNDERSTAND.** `MAIA's read` — her thesis, at a 70ch measure. Long lines cost
comprehension and the opening prose was running the width of the display.

**ORIENT.** `1 question for you · 2 uncertain seams · 14 of 14 sections
accounted for`, directly under the thesis and **above** the invitation to read
more prose. The questions are the only things on the page nobody but the author
can answer, and they used to arrive below the whole structural tree. The count
is not a summary and does not pretend to be: it says how much is waiting and
offers to take you there.

`Read MAIA's reasoning` then folds her findings AND her account together —
~3,000 characters on the real reading — complete, unedited, and not competing
with the map at page load.

**INSPECT.** Selection replaces repetition. A row is selected; one inspector
answers for it: what MAIA calls it, how she reads it, what she left open, what
she reasoned from, and any question attached to sections inside it. **One
explanation surface instead of twenty-two disclosures.**

The outline goes back to being an outline: a chevron, a name, a kind, a range, a
count. **The count is metadata, not a button.**

**RESPOND.** `Questions for you` open; `2 uncertain seams` and `8 reading notes`
counted and folded. Three kinds, still three, and only the one addressed TO the
member is expanded.

## Five decisions worth stating

**What the chevron means, and it is one thing: SHOW WHAT IS INSIDE.** A division
holding divisions opens by default — that tree IS the reading. A division
holding sections stays closed — those are the evidence for it, and 174 at once
is the serialization this whole unit exists to stop. Different defaults, one
meaning.

**Only exceptions are marked, and the mark goes on the DEEPEST division.** Range
containment alone lit up five rows for one question, because `body` contains
sections 3 and 4 and so does the Part and so does the division inside it. A
signal on five rows for one question is the failure being corrected. The
inspector still shows a question on any division whose range contains it —
that is context rather than signal, and can afford to be generous.

**Five siblings of one kind are one thing.** A faint rule down the group, not
five cards. The point is that they belong together; colour would add noise where
restraint carries the meaning.

**The authoring gesture lives in the inspector and is marked as a different kind
of thing** — under `your structure`, below a rule, separated from everything she
said.

**`Ask MAIA about this` is ABSENT, not disabled.** It is 02c. A greyed-out
control promising it would be the room advertising a capability the programme
has not built.

## Language

```text
Why?                                    removed entirely
Show 28 sections                        28 sections + chevron
Show 4 stretches she could not settle   4 uncertain seams
Show 19 further qualifications          19 reading notes
What she is still asking                Questions for you
WHAT MAIA THINKS YOUR WORK IS DOING     MAIA's read
Move out one level (inside Why)         inspector, under `your structure`
```

**MAIA's prose stays relational; the interface vocabulary goes conventional.**
*"What she would stand behind"* is editorial voice and belongs to her. `Why?` as
twenty-two identical buttons was not voice, it was furniture.

## Keyboard, focus, hover, narrow screens

Rows are real buttons. `:focus-visible` draws a ring — selection is the room's
primary gesture and it has to be reachable and visible from the keyboard, not
merely clickable. Hover responds on the whole row. Below 900px the inspector
stops being a column and becomes a section beneath the outline.

## The witnesses

```text
                      02a legibility      8a fidelity
with the letter       PASS 0 failed       green except item 11
without it            PASS 0 failed       green except item 11
mixed shape           PASS 0 failed 0 n/a green except item 11

typecheck             no regressions
jest                  359 green in the studio suites
```

### One witness check changed, and the claim did not

Check 7 counted `[data-why]` disclosures, one per division. UX01 replaced
twenty-two of those with selection and one inspector, so counting them would
report a defect on a room that reaches her reasoning perfectly well.

**The check now follows the claim rather than the markup:** it SELECTS each
division carrying a rationale and asserts the inspector shows that exact text.
That is stronger than what it replaced — it exercises the path a member takes
rather than the presence of an element — and it is **not** the test bending to
the implementation, because the sentence being asserted is the same sentence.

## An open question this pass did not settle

**`uncertain` appears on nearly every row.** She tagged 19 of 22 divisions in
the real reading, so a faithful render marks 19 rows — and a mark on 19 of 22 is
close to no mark at all, which is the principle this pass was built on.

**It is not the room's to fix.** Dropping the marker would hide what she said;
the tags are hers and 8a asserts they render. Whether a reading that qualifies
almost every division is telling the author much is a question about the
READING — 8b, and worth putting to her in 02c.

## Ruling — Kelly, 2026-08-31, on `a823917e5`

```text
architecture              PASS · source-reviewed
fixture witness           PASS
8a non-regression floor   PASS except known favicon item 11
real-book readability     NOT YET WITNESSED
02a overall               HOLD at founder witness
02c                       HOLD
fresh Jarvis lane         NOT YET
```

**The `19 of 22 uncertain` discomfort is preserved deliberately, and is not to
be touched:**

> If nearly every division is qualified, is MAIA actually giving the author
> useful discrimination? The room should not solve that by hiding marks.

It belongs to 02c / 8b, not to UX01.

**And no re-import**, asked and answered: re-importing would mint new section
uuids and destroy the stable identities that both frozen proposals and the
witness machinery name. Chapter 10 and the PREFACE-at-the-back are already in
the sections — 172 and 161. What is at issue is her READING of them.

**The four questions the founder witness answers**, and they are not
implementation details:

```text
1  Do I understand MAIA's thesis quickly?
2  Can I understand the structure without decoding the interface?
3  When I select a division, does the inspector help me understand what
   MAIA thinks and why?
4  Does the page feel like an editorial conversation waiting to happen,
   rather than a data structure with nicer controls?
```

**A note for question 3: Chapter 10 is not selectable, and that is the finding
rather than a bug.** Her reading contains no Chapter 10 — she places 163–173 in
`Bibliography`, so `CHAPTER 10: THE LIVING SPIRAL` at 172 is a bibliography
entry in her structure, not a division. Selecting `Bibliography` is where it
lives in this reading. That gap between her reading and the book the author
knows he has is **8b**, and it is the sharpest one on the board.

## What this does NOT establish

**The founder witness.** Every screenshot here is a 14-section fixture. The real
row is 174 sections and 22 divisions, and the last four defects in this unit
were all found by a person looking at a page, not by an assertion.

```text
UX01 machine floor      PASS · three fixtures
UX01 on the real row    PENDING · Mac Studio
UX01 founder witness    PENDING · the acceptance
02c Ask MAIA            HOLD · a fresh lane, and Kelly calls it
05B-8b                  HOLD
05B-6 adoption          HOLD · its own fresh lane
```

---

## 02a FINAL SURFACE CLOSEOUT — the founder witness, and the two things it left

**Date**: 2026-08-31 · on the real row (174 sections, 22 divisions).

The witness returned **CORE EXPERIENCE: PASS**. The reading is clear, the map is
understandable, selecting a division makes her reasoning intelligible, and the
author can see where he disagrees with her without the interface getting in the
way. Two surface defects remained, and both were about *saying*, not about
cognition. Neither the frozen reading nor any proposal changed.

### 1 · `Move out one level` → the consequence, in the book's own names

The operation was useful and the label was unreadable: it named a **tree
mechanic** and asked the writer to hold a model of depth in order to predict a
change to their manuscript. The inspector now says what will happen.

```text
your structure

Currently inside the elemental practice sequence

[ Move outside “the elemental practice sequence” ]

it would then sit here
PART THREE — THE SPIRAL
    the elemental practice sequence
    the elemental practice sequence's former child — this division
```

Where the division sits in the **middle** of its parent, the panel says so in
place of the button, using the same words the operation's own refusal would
return — rather than accepting the click and answering with a rejection.

**One rule, two readers.** `promoteShape` now lives in
`lib/manuscript/structure/review.ts` and is read by both
`applyReviewOperation` (which enforces it) and the inspector (which previews
it). A preview that could disagree with the edit would be the room promising an
outcome the server refuses, so the two cannot be written separately. Pinned by
tests that assert the preview's verdict against the operation's own behaviour.

Book order still decides where it lands — a division taken from its parent's
start stands *before* it, one taken from the end stands *after* — and the
preview shows that order rather than a list.

### 2 · `question` / `uncertain` → what is actually open

Two bare adjectives that named the **data** and told the writer nothing. They
also ran together into `questionuncertain` the moment two of them met on one
row. The states behind them were always legitimate; only the saying was
decoration.

| was | is |
|---|---|
| `question` | `a question for you` · `3 questions for you` |
| `uncertain` | `left open: where this ends` · `left open: where this begins +2 more` |

The language is the inspector's own (`UNCERTAINTY_SAYS`), so a row and its
inspector call the same open reading by the same name. **Nothing is
suppressed**: where several readings are open the first is shown with a count of
the rest, the full list stays in the row's title/aria-label, and the inspector's
*what she left open* panel still lists every one. A mark is separated by its own
rule so two marks can never read as one phrase, and the row wraps rather than
hiding a mark on a narrow screen — a mark that disappeared would suppress the
signal it exists to carry.

### What this closeout did not do

No new cognition. No `Ask MAIA`. No change to the interpretation, the proposal,
the reviewed tree, or adoption. `promoteShape` is an extraction of a rule that
was already there, not a new judgement.

```text
UX01 machine floor        PASS · three fixtures
UX01 on the real row      PASS · founder witness, core experience
02a surface closeout      BUILT eeb452dcb · both defects repaired
                          PENDING · founder re-witness. 02a does not
                          close until that returns.
02c Ask MAIA              NEXT LANE · and Kelly calls it
05B-8b                    HOLD
05B-6 adoption            HOLD · its own fresh lane
```

### The requirement 02c inherits

The witness also named the missing capability, and it is not more 02a:

> From any place in MAIA's reading, I can talk with her about what she sees and
> what I might do next — edit, develop, restructure, investigate, or leave alone
> — while I remain the author.

Every question in *questions for you* is the obvious entry point. The boundary
that lane must hold:

```text
conversation ABOUT the reading
        ≠ changing the frozen reading
        ≠ changing the reviewed proposal
        ≠ changing the manuscript
        ≠ adoption
```
