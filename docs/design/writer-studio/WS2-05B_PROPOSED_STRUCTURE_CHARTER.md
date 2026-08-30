# JARVIS / WS2-05B — Proposed Manuscript Structure

**Status:** CHARTER. Design rulings settled; implementation NOT authorized.
**Opens after:** WS2-05A closes on the real-book witness.
**Predecessor evidence:** `86bab2094` — the failed mechanical baseline.

---

## The product truth this unit exists for

> A member should not manually map an obviously structured manuscript into
> chapters. The system does the clerical perception work; the member decides
> whether its proposed structure is right.

Discovered by using the thing. WS2-05A shipped grouping that works — proven on
Elemental Alchemy, zero bytes moved — and then the first real attempt to
organise a 174-section book showed that `+ division → name → from → to → place`,
ten times over, is clerical database mapping wearing a writing tool's clothes.

A Writer's Studio that can see 174 headings and still asks the writer to type
ranges has understood the data and not the job.

---

## Ruling 1 — Two perception tiers, never collapsed into one confidence

Mechanical-only is ruled out as the product solution. `86bab2094` demonstrated
why: it finds real signals and cannot recover the Fire boundary, because
`THE SACRED FLAME` carries meaning that no lexical rule contains.

### Tier 1 — Mechanical evidence

May state only what is establishable from inspectable features:

- explicit structural labels
- runs that look like contents/outline scaffolding
- dense lexical cores
- recurrence and noise regions
- exact positions and counts
- gaps and conflicting signals

Its job is **evidence gathering, not pretending it has found the chapter**. For
Fire it may say:

```text
FIRE
dense lexical core        57–68
FIRE-bearing headings     18
recurrence outside core   strong
possible structural noise 151, 167
boundary confidence       incomplete
```

Useful and auditable. It may **not** extend evidence into a semantic boundary.

### Tier 2 — MAIA structural reading

Boundary-finding warrants MAIA. She may read the headings — and, where needed,
the section text around candidate boundaries — and propose a division, because
this is a semantic reading of the Work rather than a string-classification
problem.

It must be labelled as interpretation:

> **MAIA suggests** Fire runs from 42–69.

Never *Fire is 42–69.*

Beneath it, concise rationale rather than a fabricated universal score:

```text
Why this boundary was suggested
• 42 opens a sustained fire-focused sequence
• fire vocabulary becomes dense through the middle
• 69 closes the sequence before Water begins at 70
• later FIRE references occur in separate summary/outline regions
```

Enough for a writer to judge the proposal without redoing the analysis.

---

## Ruling 2 — "Dense cores, drag the edges" is NOT the v1 experience

It sounds conservative and it leaves the clerical burden exactly where this
unit exists to remove it:

```text
system: Fire is probably 57–68      writer: no, 42–69
system: Water is probably 70–78     writer: no, 70–82
system: Earth is probably 88–96     writer: no, 83–96
```

Repairing both edges of every major division is not automatic organisation; it
is typing ranges converted into dragging handles. Dense cores exist to **help
MAIA and to explain the proposal**. They do not define the member experience.

---

## Ruling 3 — The authority model

```text
MECHANICAL EVIDENCE
  may establish observable signals
  may mark uncertainty and scaffold
  may NOT extend evidence into semantic boundaries

MAIA INTERPRETATION
  may infer likely semantic boundaries
  must remain visibly a proposal
  must preserve supporting evidence and uncertainty
  may NOT write canonical structure

MEMBER
  sees the whole proposed structure
  may adjust any boundary, name or nesting
  one explicit "Use this structure" act
  turns the reviewed proposal into authored structure
```

### Adoption is whole-proposal — this SUPERSEDES the 05A spec

WS2-05 §Q2 required per-unit adoption. Real use overturned it: if the complete
proposed structure is visible before adoption, **one explicit act is enough
authorship**. The member has seen the proposition they are accepting; twenty
confirmations would turn sovereignty into ceremony. Per-unit *correction*
remains available — the member may adjust anything before accepting.

---

## Ruling 4 — Naming, so the architecture cannot repeat the mistake

Stop calling the mechanical module "the detector".

```text
StructureEvidence          ← mechanical, inspectable
        ↓
StructureInterpreter       ← MAIA, semantic, labelled
        ↓
StructureProposal          ← whole-book, correctable
        ↓
member review
        ↓
authored structure         ← manuscript_structure_units + memberships
```

The old name assumed the deterministic code that runs first must also solve
semantic structure. It does not, and naming it that way is how the assumption
survived long enough to be built.

---

## Uncertainty is a first-class output

A proposal may look like:

```text
HIGH CONFIDENCE
  Fire            42–69
  Water           70–82
  Earth           83–96
  Air             97–108
  Aether          109–122

NEEDS YOUR EYE
  Living Spiral   123–147 ?
  148–160         mixed summary / reference material

UNRESOLVED
  161–173         likely duplicate outline / contents material
                  not included in structure
```

Better than forcing every uncertainty into *detected* or *not detected*.

---

## The failed mechanical baseline, entered as evidence

`86bab2094` (`lib/manuscript/structure/detect.ts`, unwired). On Elemental
Alchemy's 174 headings it proposed `Healing 75–84`, `Grades 148–150`,
`Astrology 158–160` and missed every element.

Why: its keyword rule requires a word to appear nowhere outside its run, and
the book revisits its themes — FIRE recurs at 132, 151, 167, so its span covers
most of the manuscript and the candidate is discarded.

Measured on the same headings:

```text
FIRE     18 headings   densest  57–68   83%   also 44 45 48 53 55 132 151 167
WATER     9 headings   densest  70–78   56%   also 133 148 152 168
EARTH    14 headings   densest  88–96   78%   also 82 83 86 134 149 153 169
AIR      11 headings   densest  97–108  58%   also 135 150 154 170
AETHER    7 headings   densest 109–115  57%   also 121 155 171
```

Density is the right signal; exclusivity is not. **And density still
under-reaches** — Fire's core is 57–68 while the chapter is 42–69 and opens at
`THE SACRED FLAME`, a heading with no element word in it.

What *did* work: consecutive-structural-label runs flagged 1–4, 161–164 and
166–173 as regions that cannot be the thing they name. The contents-scaffold
problem is mechanically solvable while the chapter-boundary problem is not, and
those two must not ship under one confidence.

Keep it unwired. Its job is to demonstrate what mechanics know and where they
stop — not to be improved until it somehow finds 42.

---

## Flow

```text
OBSERVE    real manuscript + current 174-section structure
GROUND     what evidence can legitimately suggest a boundary?
MODEL      proposal + confidence + uncertainty + provenance
BUILD      StructureEvidence first, then StructureInterpreter
REVIEW     whole-book proposed structure visible at once
AUTHOR     member edits / accepts
COMMIT     ordinary manuscript_structure_units + memberships
WITNESS    real book organised · zero manuscript bytes changed
           uncertainty still visible
```

## Invariants inherited from 05A, unchanged

- No manuscript text changes. No section ids change. No save boundaries change.
- A division is a contiguous part of the Work; the deferred trigger still
  refuses anything else at COMMIT.
- Delete is leaf-only; promotion is an explicit gesture.
- Unplaced sections are shown, never hidden.
- The proposal itself is disposable until accepted.
