# WS2-05B-8B-02a — the editorial review surface

**Status:** **BUILT. Machine floor GREEN on a fixture. The founder witness — the
one that matters — has not been taken.**
**Spec:** `WS2-05B-8B_EDITORIAL_REVIEW_SURFACE_02.md`, section A.
**Depends on:** 02b, `WS2-05B-8B-02b_REAL_READING_WITNESS.md`.

> MAIA does not merely show what she inferred. She explains her reading to the
> writer, shows why, names where she is uncertain, and remains available for
> conversation about it.

The last clause is 02c and is not built. This unit does the first three.

---

## The order, which is the correction

```text
1  editorial synthesis     what she thinks this Work is doing     BUILT
2  structural map          where it divides                       BUILT
3  questions               what she would ask, what she left open BUILT
4  evidence on demand      the sections, and her reasoning        BUILT
5  conversation            02c                                    NOT BUILT
```

8B failed because the room showed the DATA STRUCTURE of a reading rather than
communicating the reading: eleven nested divisions had to be reverse-engineered
out of 174 heading rows before the central claim was visible. The room now opens
on the claim.

---

## What changed, and why each one

**The thesis is first; the account is second.** MAIA's account on the real Work
is ~1,800 characters of unbroken prose and it used to arrive at the top — the
densest thing on the page, first. It is now behind *Read my full reasoning*,
complete and unedited, with her thesis and her strongest findings above it. The
room does not cut her account into headings and does not summarise her tree:
either would be a second reading authored by code, wearing her name.

**Five identical rows became five names.**

```text
before          after
element  43–69  Fire      42–69
element  70–81  Water     70–82
element  82–96  Earth     83–96
element  97–108 Air       97–108
element 109–122 Aether   109–122
```

The titles are still null, because the Work does not name them. The names are
MAIA's `editorialLabel`, and the map says so in one line above it: *"Where your
Work does not name a division, MAIA describes it. Those descriptions are hers —
they are not titles in your manuscript."* Where the Work DOES name a division,
the title is the row's name and her label moves inside `Why?`.

**Her questions became the first thing in the questions panel.** 8B's verdict on
the old panel was that it *"just dumps out cryptic insights without interaction
capabilities"*. The three kinds are now kept apart and ordered by who they are
addressed to:

```text
questions for you       only you can answer these — label, places, what turns on it
stretches she could not settle          the frozen uncertainRegions, in her words
further qualifications, division by division      the per-unit uncertainty tags
```

Collapsing them into one count would be the 8a defect rebuilt one level higher.
A question can now be *read*; being able to *answer* one is 02c.

**Her reasoning became reachable at all.** `rationale` has been in the row since
05B and rendered nowhere: it appeared only once a member had already changed
something, which is exactly backwards. `Why?` shows it on any division.

**Console vocabulary became words.** `⇤` → `Move out`, `+38` → `Show 38
sections`. The aria-labels are unchanged — they were already written for a
person, and 8a's captures find the disclosure by one.

---

## Four defects found by looking at it

None of them had a machine witness. They were found in screenshots, which is the
only instrument for this class. The witness passed every check before and after
each one.

**The `◇` marker shifted rows out of column.** Rendered only where MAIA left
something open, it pushed every unmarked row a character left — so `Air`, the
one division she was sure of, sat out of line and read as a different kind of
thing. The gutter is now always there and the mark is not.

**"Show 1 sections".**

**A gesture offered where it can only refuse.** `promote` refuses `not_nested`
on a top-level division, so `Move out` on those rows could produce nothing but a
refusal — an affordance that lies, repeated down every root row. It now appears
only at depth > 0.

**The tree did not read as a tree.** One `SPACE.base` per level is 12px, so a
Part and the elements inside it landed in almost the same column. On the two
all-untitled fixtures this was invisible; it appeared the moment a fixture with
titled Parts and three real levels was drawn, which is the shape the real
reading has — 22 divisions, three levels deep. **The nesting IS the reading**,
and it was the thing being lost. The step is now `SPACE.roomy`.

---

## The witnesses

**`scripts/ws2-05b-02a-legibility-witness.ts`** — new, read-only by
construction, nine checks. It is a **FLOOR, not the acceptance**: whether a
writer can say what MAIA thinks their book is has no machine witness and none
should be built to fake one. But one half of the 8B defect IS mechanical — five
sibling rows rendering the same text are indistinguishable to anybody — and so
is whether the thesis, the findings and the questions reached the page.

```text
1  the room opens on the thesis, verbatim from the row
2  her full account is present, and behind a disclosure iff there is a letter
3  every finding and every question reached the page
4  same-kind untitled siblings are told apart          ← the 8B defect
5  every label she gave names its row, marked as HER words
6  where the Work names a division, the row shows the WORK's name
7  her reasoning for a division is reachable
8  the map opens on the reading, not on every section
9  the witness wrote nothing and the proposal did not move
```

**Check 4 distinguishes whose failure it is**, and that distinction is the
point. If the reading supplied labels and the page shows one text five times,
the ROOM lost them — a defect, fixable here. If the reading supplied none, the
page showing `element` five times is the faithful render of a reading that
cannot be told apart, and no layout closes it. Scoring the second as a room
failure would make the witness demand that the surface invent the distinction,
which is the exact thing this programme has refused throughout.

### Runs

Two proposals on a synthetic 14-section Work, differing in **one variable**: the
presence of the editorial fields. Both are `adversarialReading` — five untitled
`element` siblings, three uncertain regions, eight tagged divisions, full
coverage — and the second has its labels and letter stripped.

```text
                      02a witness            8a harness
with the letter       PASS · 0 failed        every item green except 11
  check 4             5 × "element" →
                      Fire · Water · Earth · Air · Aether

without it            PASS · 0 failed        every item green except 11
  check 4             n/a — "the reading gave none"; the 8B defect,
                      and it belongs to the reading rather than the room
  check 2             account NOT behind a disclosure, correctly
```

### A third run, because two N/As were hiding a path the real row will take

Both fixtures above are entirely untitled, so **check 6 — where the Work names
a division, the row shows the WORK's name — came back N/A on both.** The real
reading has 10 of 22 divisions titled and runs three levels deep. A witness
green on a shape the subject does not have is the fixture failure this
programme has already found twice; N/A is not a pass.

A third proposal was built to the real row's shape: titled `PART ONE — THE
GROUND` and `PART TWO — THE ELEMENTS` alongside five untitled `element`
siblings, `Contents` and `BACK MATTER` titled, three levels deep.

```text
mixed shape           PASS · 0 failed, 0 n/a     every 8a item green except 11
  check 4             5 × "element" → Fire · Water · Earth · Air · Aether
  check 6             4/4 show the title · 0 show a label in a title's place
  check 7             12 rationales · 12 Why? disclosures
```

**Every check exercised, none skipped** — and it is what surfaced the fourth
defect above. The two untitled fixtures could not have shown it.

**Item 11 is the app-wide favicon unit** — `/icons/favicon-{16,32,48}x32.png`,
red in the 8a baseline, explicitly outside every mandate since. **Item 10 is
UNKNOWN** because it captures section 42 and this fixture has 14 sections.

```text
npm run typecheck    no regressions
jest                 731 tests green across lib/manuscript, lib/writersStudio,
                     app/writers-studio
```

---

---

# The real Work — Mac Studio, `5fb31b248`, 2026-08-31

Three runs on Elemental Alchemy, `a3ae67fd-a21e-4948-8766-4c397d2e4712`, 174
sections. **The machine floor was GREEN on the real row at that commit.**

> **SUPERSEDED BY `173df47ee`, and recorded rather than quietly carried
> forward.** These runs were taken before the density pass. That pass changed
> what the page renders — the stretches and the qualifications now open behind a
> disclosure, the range moved beside the name, `Move out` left the row — so
> **these verdicts describe code that is no longer the code.** They are kept
> because they establish that the accepted 8a target survived the 02a rewrite,
> which is a real fact about that commit. They are **not** the real-row witness
> for the current head, and 8a on `2a427a6f` has to be taken again at
> `173df47ee` before 02a can close.
>
> The distinction the commits keep, kept here too: **a green fixture gate
> establishes bounded mechanics, not real-book acceptance** — and a green
> real-row gate on superseded code establishes neither.

## 8a on its own named gate — `2a427a6f`, the pre-contract reading

```text
Frozen row: form mixed · 11 divisions · 3 uncertain regions · unaccounted 0/174
Reader: claude-opus-5 · prompt 7d4e27cfa81d

every item green, item 11 excepted
  3.1  truncated false vs false; passes 2 vs 2; stated in words
  5    3 regions rendered; the stored text present
  7.1  10 carry tags in the row; 10 rendered
  10   captures written — incl. section 42
  13   revision 0
```

**This is 8a's acceptance target, held.** 3.1, 5 and 7.1 green, every previously
green item still green, on the same frozen proposal 8a was accepted on — after a
rewrite of the room. And because `2a427a6f` predates the editorial contract, the
run doubles as the honest-degradation witness on a REAL pre-contract row: no
letter, no labels, the account in its old place, nothing invented in their
absence.

## 8a on the new reading — `e6cabcc4`

```text
Frozen row: form stable · 22 divisions · 4 uncertain regions · unaccounted 0/174
Reader: claude-opus-5 · prompt a1825a7c2f50

every item green, item 11 excepted
  7    13 of 22 divisions carry no title; the kind is shown, never a
       manufactured name
  7.1  19 carry tags; 19 rendered
  7.2  16/16 free-text kinds survive
  8    174 of 174 drawn, ascending, unique
```

## 02a on the new reading — `e6cabcc4`

```text
PASS — 0 failed, 0 n/a

1  the room opens on the thesis          MAIA's thesis, verbatim
2  her account is present, and second    1 element, behind a disclosure
3  findings and questions                5/5 findings · 5/5 questions · 5 marked
4  same-kind untitled siblings           5 × "element" →
                                         Fire · Water · Earth · Air · Aether
5  every label names its row             13/13 rendered · 13 marked as hers
6  where the Work names a division       9/9 show the title ·
                                         0 show a label in a title's place
7  her reasoning is reachable            22 rationales · 22 Why? disclosures
8  the map opens on the reading          0 of 174 section rows visible
9  the witness wrote nothing             revision 0 · 0 non-GET attempted
```

**Every check exercised on the real row, none skipped.** The fixture work
predicted it: the three-fixture set was built precisely so that no check would
arrive at the real Work untested.

**Item 11's three favicon 404s are red on all three runs**, as they were in 8a's
own baseline. Its own unit.

## One thing these runs do NOT settle

**The dev server on 3105 was already running when the worktree advanced** —
`EADDRINUSE` — so the code under test came from whatever checkout started it.
The evidence says it carries 02a: `data-thesis`, `data-editorial-label`,
`data-row-name` and `data-why` all resolve, and those attributes exist in no
earlier commit. What it cannot distinguish is `a205fef29` from `5fb31b248`,
because **the only difference between them is the indentation step, and no
assertion covers it.**

Every result above therefore stands regardless. The one thing at risk is what a
person SEES: the flat-tree defect was found on a 3-level fixture and is worst
exactly here, at 22 divisions and three levels. **Before the founder witness,
the server must be confirmed on `5fb31b248` or restarted from this worktree.**

---

# The founder read it — first verdict, and the bounded pass that followed

**2026-08-31, on `e6cabcc4`.** The thesis, the labels and the map landed. The
verdict on the page as a whole:

> It's a lot to read.

**The same failure as 8B, one level up.** On the real reading the questions
panel carried 5 questions, 4 stretches and 19 qualifications — twenty-eight
items of "still open", arriving together and saying substantially the same
things three times over. *"Does Part Two begin at the Sacred Flame"* IS the
`35–43` stretch IS the `where this begins` tag on Fire. Keeping the three kinds
distinct was right; showing all three expanded at once rebuilt the dump.

## The bounded pass

**Only the questions stay open.** They are the only ones addressed TO the
member. The stretches and the qualifications collapse to one counted line each —
`Show 4 stretches she could not settle`, `Show 19 further qualifications` — so
their weight is visible without their bulk. Nothing is removed and everything
stays in the DOM, which is also what keeps 8a's assertions true.

**The range travels with the name.** `flex: 1` on the name pushed the kind and
the span to the far right edge, so on a wide screen the eye crossed the whole
row to learn where Fire is — 22 times. A division is a name AND a span.

**Two controls per row, not three.** `Move out` left the reading row for the
`Why?` panel, where the member is already engaged with that division. Three
controls × 22 divisions was 66 buttons competing with her reading; the spec's
own layout names two. It is still offered only at depth > 0, where `promote`
can actually succeed.

```text
all three fixtures    02a PASS · 8a green except item 11
typecheck             no regressions
```

## Two findings that are NOT 02a's, recorded so they are not lost

**"A section that references being at the front of the book is at the back."**
She caught it and the room buried it. Section 161 is headed `PREFACE` and she
places it inside `Bibliography 161–173`; her second finding says section 163
headed `CHAPTER 1: THE JOURNEY BEGINS` contains only citations. So the
apparatus/heading mismatch IS in her reading — stated as *"this run is a
bibliography"*, never as *"a section announcing itself as front matter is
sitting at the back."* Whether those are the same finding is the founder's
judgment: **05B-8b.**

**"Anomalies in Chapter 10, and I have issues with the way it is structured."**
She reads 163–173 as bibliography entries, so she never discusses Chapter 10 as
a chapter at all. If that is wrong it is wrong in the READING, not in the
render — **05B-8b**, and pressing her on it is **02c**.

Neither is a surface defect and neither is fixable here. A room that surfaced
them by inference would be deriving structure from prose, which is the thing the
interpreter exists to stop a client doing.

## Still short of the bar the founder named

*"Apple level"* is a larger bar than one density pass, and the gap should be
named rather than implied:

```text
no hover or focus treatment beyond browser defaults
the control cluster still sits far from its row on a wide screen
no responsive behaviour at narrow widths
the five elements read as five rows, not as one set
keyboard navigation is tab order and nothing more
```

None of that is in this pass. It is a nameable next unit rather than something
to slip in under a witness that has already been taken.

---

# Act 1 re-taken at `96d2ea3eb` — 8a on `2a427a6f`, PASS

Every accepted verdict unchanged after the density pass.

```text
3.1  truncated false vs false; passes 2 vs 2; stated in words
5    3 regions rendered; the stored text present on the page
7.1  10 carry tags in the row; 10 rendered
1, 2, 3, 4, 6, 7, 7.2, 8, 9, 10, 12, 13   all still green
11   the three favicon 404s, as in its own baseline
```

**Item 5 was the one at risk** and it held: the uncertain regions now render
inside a collapsed disclosure, and the assertion counts `data-uncertain-region`
elements and checks the stored text is in `textContent`. Hidden content
satisfies both — which is why the collapse hides rather than unmounts.

# `Why?` — the founder's second finding

> The `Why?` additions don't seem to make sense.

Two separate things are true here, and only one of them is the room's.

## The room's: an edit was answering a question about her reading

`Move out one level` sat INSIDE the `Why?` disclosure for one commit, moved
there to thin the row. **A category error.** A member who asks why she proposed
a division is asking about HER READING; opening that question onto an authoring
gesture answers a question they did not ask. It is back on the row, subordinate
in weight to the two reading controls, and still only where `promote` can
succeed. Fixed.

## Not the room's: the button asks *why* and the field answers *what*

The reader is asked for `rationale` as *"Why this holds together, in your
reading. Not a restatement of evidence."* What `e6cabcc4` actually carries reads
as content description:

```text
awakening and the call   5–20
  Narrative and invitational material: the dream, the call to adventure,
  the nature of change, choosing an authentic path.
```

That is a **what**, not a **why**. It says what is in the range; it does not say
why those sixteen sections hold together as one division rather than two, or
why the boundary falls at 20.

**The room cannot fix that, and must not try.** Manufacturing a reason MAIA did
not give is the same act as manufacturing a title she did not give — the failure
the whole programme is built to prevent, wearing the costume of a fix. This is a
finding about the READING and the CONTRACT, not about the render:

```text
02b   the contract asks for a why; the reading returned a what
      → whether the field's description needs sharpening is a 02b question,
        and it costs a real reading to test
8b    whether that is good enough is the founder's judgment
02c   asking her directly is the actual answer, and it is HOLD
```

**A third statement of the same doubt.** The `Why?` panel also carries `She left
open: where this ends` — which the ◇ marker already says on the row and the
qualifications list says again. Three statements of one caveat. Noted, not cut:
cutting it without the founder looking at the real page again would repeat the
pattern of optimising the data rather than the reading.

---

## What this does NOT establish

**The room has not been read by a person.** The specified acceptance is:

> the founder opens the room and can say what MAIA thinks the structure of the
> book is, what she is unsure about, and can take up one of her questions —
> without decoding the interface first.

`e6cabcc4-a506-4ea7-aa89-9b23b450ca74` is the proposal to open it on. Two of
those three are now buildable-against; the third — *take up one of her
questions* — is 02c and does not exist. A member can read a question and cannot
answer it, and that limit is the honest state of the room rather than something
the layout hides.

```text
02a surface              BUILT
02a density correction   BUILT · 173df47ee
02a machine floor        PASS · three fixtures at the current head
02a 8a on 2a427a6f       PASS at 5fb31b248 · SUPERSEDED · re-take at 173df47ee
02a founder re-witness   STILL NEEDED · the one that matters
02c Ask MAIA             HOLD · a fresh lane, and Kelly calls it
05B-8b semantic judgment HOLD
05B-6 adoption           HOLD · its own fresh lane
```

**The two findings parked outside 02a stay parked.** The PREFACE/bibliography
mismatch and Chapter 10 are both about the reading rather than the render. **No
client inference is to be added to "help" either** — a room that surfaced them
by deriving structure from her prose is the failure the interpreter exists to
prevent, and it would be that failure wearing the costume of a fix.

**The experience-quality gap is named and NOT authorised.** Hover and focus
treatment, the control cluster's distance from its row, responsive behaviour,
the five elements reading as one set, real keyboard navigation: a later unit, if
Kelly opens one. It is not a blocker on 02a and it is not to be slipped in under
a witness already taken.
