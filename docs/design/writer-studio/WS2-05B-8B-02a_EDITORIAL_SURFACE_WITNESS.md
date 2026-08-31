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

## What this does NOT establish

**The gate 8a actually names is `2a427a6f-86b5-4ba3-a901-267710977f25`**, the
real reading of Elemental Alchemy, and it is not in this container — no
`maia_consciousness`, no copy of the book. The runs above are on a fixture built
to reproduce the adversarial properties, which is the right instrument for
"could the room draw this shape" and **is not** the acceptance 8a specifies.
Running 8a on `2a427a6f` is Kelly's, on the Mac Studio:

```bash
cd /private/tmp/ws2-04a-witness
```

then the reproduction in `WS2-05B-8A_RENDER_FIDELITY_WITNESS.md`, unchanged.

**And the room has not been read by a person.** The specified acceptance is:

> the founder opens the room and can say what MAIA thinks the structure of the
> book is, what she is unsure about, and can take up one of her questions —
> without decoding the interface first.

`e6cabcc4-a506-4ea7-aa89-9b23b450ca74` is the proposal to open it on. Two of
those three are now buildable-against; the third — *take up one of her
questions* — is 02c and does not exist. A member can read a question and cannot
answer it, and that limit is the honest state of the room rather than something
the layout hides.

```text
02a machine floor        PASS · fixture
02a on the real row      PENDING · Kelly, Mac Studio
02a founder witness      PENDING · the one that matters
02c Ask MAIA             HOLD
05B-8b semantic judgment HOLD, behind that witness
05B-6 adoption           HOLD
```
