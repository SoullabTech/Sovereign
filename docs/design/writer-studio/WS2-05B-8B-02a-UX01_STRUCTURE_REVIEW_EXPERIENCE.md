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
