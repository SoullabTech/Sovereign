# DESIGN STUDY — LOCATION · FOCUS · THREAD

**Authorized as hours, not a programme. Run on the real Elemental Alchemy chapter, in the accepted
Field + Orbit surface, behaviour unchanged. Three treatments, one walk, one falsifier.**

> ⭐⭐ **HARD FALSIFIER — at no moment should the writer have to ask whether a visual mark represents
> location, attention, or conversation. If a treatment makes two of those meanings look the same,
> reject it.**

⛔ **No market research.** Scrivener / Ulysses / Notion / Obsidian solve a different interaction
problem, and letting conventional editor UI decide this would pull us back toward permanent sidebars,
selected-row states and inspector chrome — the gravitational centre this room exists to escape.
**Prototype research, not market research.**

## 1 · The falsifier, made measurable

Rather than judging by eye alone, each mark's **geometry** and **hue family** are read from computed
style at the moment MAIA is engaged — when all three meanings are on screen at once. **Two marks
collide when they share BOTH.**

```text
                LOCATION            FOCUS               THREAD
treatment A     hrule / none        box / gold          fill / none        ✓ distinct
treatment B     fill  / none        (none)              fill / none        ✗ REJECT
treatment C     hrule / neutral     bracket / gold      margin-rule/green  ✓ distinct
```

⚠️ **The instrument was wrong on its first run and was repaired before its verdict was trusted.** It
guessed the colour property from the geometry's name, so it read `borderTopColor` off a
background-painted margin rule and reported MAIA's green as **neutral**. Since the collision test
keys on hue, that fault could have manufactured or masked a collision. It now takes the first colour
property that is actually painted, whatever the mark is made of.

## 2 · 🔴 B REJECTED — and the eye agrees with the measurement

**Section-primary puts two grey fills on one screen**: the section MAIA is attending to, and the
section the writer is in. In the screenshot they are stacked directly above one another and are
**indistinguishable** — you cannot tell whether a shaded block means *"you are here"* or *"MAIA is
looking at this."*

⭐ **This is the ambiguity that opened the study** (*"which one is my focus?"*), reproduced exactly,
and it is inherent to the treatment rather than to the implementation: once the section is the
primary carrier of meaning, every other meaning that wants a section has to borrow the same form.

⭐ **One thing in B is worth keeping**: Focus as an **inset underline** rather than a box reads well
and stays inside the prose. It is a candidate for C's Focus form if brackets prove fussy.

## 3 · ⭐ RECOMMENDATION — C, with named repairs

C is the only treatment that separates the three by **meaning** rather than merely avoiding a clash:

```text
LOCATION   where am I in the Work?        rail row + a quiet horizontal boundary
                                          horizontal geometry · muted ink · structural
FOCUS      what are we looking at?        gold brackets around the passage
                                          vertical geometry · accent · in the text
THREAD     what are we pursuing?          MAIA green in the MARGIN, never on the words
                                          marginal geometry · maia · beside the text
```

> ⭐ **Structure says where. Focus says here. MAIA says what we're exploring about here.**
> A section is structural geography. Focus is an intentional relational gesture. The thread is the
> conversation arising around that gesture. **None may borrow another's form.**

⭐ **The strongest single move is that MAIA stops marking the Work at all.** Her attention lives in
the margin and in her orbit. That alone removes the largest source of competing centres, because her
evidence highlight was the mark most likely to be mistaken for the writer's own.

## 4 · ⚠️ EXECUTION DEFECTS IN MY C — the scheme passed, the drawing did not

Visible in `study-C-3-maia.png`, and **not** arguments against the scheme:

| | |
|---|---|
| 🔴 the drag handles now paint as **solid gold blocks** | `.h { background: var(--accent) }` reads as two filled squares beside the passage — a fourth strong mark, and the heaviest thing on screen |
| 🔴 the brackets are **asymmetric** | `::before` sits under the handles at the column edge while `::after` floats ~26px past the right margin; they do not read as a pair |
| 🔴 a **full-height vertical rule** runs the whole section | `.sec .body:focus-visible { box-shadow: inset 2px 0 0 accent }` — the editing caret's own affordance, in the SAME gold as Focus, spanning far more than the frame |
| ⚠️ the green margin rule was **off-screen** during the walk | MAIA's evidence was sections 8/1/2/4 while the viewport held 5 — so THREAD's mark went unwitnessed by eye, though it was measured |

⭐ **The third one is the real finding.** `:focus-visible` is *location* information — where the caret
is — drawn in the *Focus* hue and geometry. **It fails the falsifier for a reason none of the three
treatments introduced: it was already there.** Any treatment adopted must re-form it as location.

## 5 · Standing

```text
✅ study run on the real chapter, behaviour unchanged
✅ B REJECTED by measurement and by eye
✅ C recommended, subject to §4
⛔ not adopted into the prototype — the founder's walk decides
⛔ integration not begun · no production change
```

**Owed before adoption:** repair §4, then re-walk A and C on the founder's own acts — *read · jump ·
select a sentence · widen · Ask MAIA · Work with an observation · close MAIA · continue writing* —
and pick by which one stops being noticed first.
