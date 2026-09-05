# WS2-07 · BUILD-07D — the first natural classifier decline · finding

> **Observed at `9c27572ce`, 2026-09-05. A live reading by `claude-opus-5` produced an observation
> the phenomenon taxonomy did not name, and the observation was KEPT — whole, evidenced, limited,
> and unlabelled. Nothing in the commission asked for a decline. This is the first unprompted
> decline in the lane's history.**

```text
READING     acda940f-bee8-411c-acfe-88bb4abb96e2
WORK        05a303f6-1f44-46d8-92e5-f1ab5fb68c05
LENS        structure          REVISION 2          FROZEN 2026-09-05T03:29Z
READER      claude-opus-5      CLASSIFIER claude-opus-5
CONTRACT    reading contract v2 — phenomenon optional per observation, omission only
DATABASE    maia_gatea_scratch
```

## 1 · The row, not the rendering

```text
7 obs · 1 declined · positional-asymmetry · positional-asymmetry · movement ·
unresolved-thread · positional-asymmetry · register-shift · (none)
```

Queried as `NOT (o ? 'phenomenon')` — the **key is absent**, not null. That is the v2 contract's
distinction and it was checked in persistence before any claim was made from the screen. Six
siblings carry their labels; the seventh carries none.

## 2 · The observation

> Each of the four read sections opens with a single bare word on its own line — Arrival, Council,
> Tomas, Water — and the four name different orders of thing: an event, an institution, a person, an
> element. The naming convention is uniform across the read run while what it names shifts category
> at each step.

Resting on four sections at exact character ranges. Declining five things: author intent, reader
effect, editorial consequence, whole-work pattern, outside coverage.

This is not a degraded observation. It is complete by every measure the contract asks for —
evidence, bounds, and a claim that can be checked against the text. What it lacks is a name in the
eight-phenomenon family, and the family was not stretched to give it one.

## 3 · Why it matters

The governing principle of the reading contract is that **observation has ontological priority over
classification: the taxonomy may describe a developmental observation, but it may neither manufacture
one nor veto one.** Until now that was demonstrated only by construction — every live reading in the
lane named a phenomenon (8 of 8 in Gate B(a), 5 of 5 in B(b)), which is precisely why the decline had
to be seeded by script to witness the rendering at all
(`WS2-07-BUILD-07D_V2_RENDER_WITNESS_2026-09-05.md`).

Here the classifier declined on its own and the reading survived intact. The taxonomy's veto is not
merely removed in code; it has now been observed not exercising itself.

## 4 · The rendering

o7 sits in ordinary position between o6 (`REGISTER SHIFT`) and the end of the reading, with the
`Current` state chip and **nothing** where a phenomenon label would be: no placeholder, no
"unclassified", no "unknown", no empty chip, no degraded or error styling. Its text, RESTS ON and
DOES NOT ESTABLISH all render in full.

## 5 · Distinguishable from the fixture

The constructed decline sits in the same table, one row below:

```text
structure   · reading · reader=claude-opus-5      · classifier=claude-opus-5      · rev 2
development · reading · reader=walk-fixture-model · classifier=walk-fixture-model · rev 1
```

Provenance alone separates them. No record built on this finding can borrow the fixture's
authority, and no screenshot of the fixture may migrate into a claim about live behaviour.

## 6 · What this does NOT establish

- **Nothing about frequency.** One decline in one reading. It does not establish how often the
  classifier declines, under which lenses, or on what kinds of material.
- **Nothing about correctness of the decline.** That this observation *ought* to be unnameable within
  the family is not established here; only that the classifier declined and the system kept the
  observation whole.
- **Nothing about the family's adequacy.** A single decline is not evidence that the eight-phenomenon
  family needs extending — and `unclassifiable` remains a refusal condition, never a ninth phenomenon.
- **Not production evidence.** Local dev, scratch database, one member, one Work.
