# WS2-05B-8B-EDITORIAL-REVIEW-SURFACE-02

**Status:** **SPECIFIED. One blocking discovery, recorded below. Not built.**
**Supersedes:** `WS2-05B-8B-READABILITY-01`, whose witness failed —
`WS2-05B-8B_READABILITY_FINDING.md`.

```text
PURPOSE
Turn a valid MAIA structural interpretation into an
author-editor conversation a writer can understand,
question, inspect, and respond to.

ORDER
1. editorial synthesis
2. structural map
3. questions / uncertainties
4. evidence on demand
5. conversation with MAIA

NOT
raw serialization
diagnostic console
canonical structure editor
adoption surface
```

**Governing sentence.**

> MAIA does not merely show what she inferred. She explains her reading to the
> writer, shows why, names where she is uncertain, and remains available for
> conversation about it.

The 8a fidelity harness remains underneath as a **non-regression gate**. It is no
longer the product specification — and treating it as one is how the room came to
be built for a machine.

---

## The doctrinal correction this unit rests on

> "Do not invent manuscript titles" does not mean "MAIA may not describe what she
> perceives."

Those are different things, and conflating them is what produced five rows
reading `element`. The distinction now stands as:

| | whose words | may be null | ends up in the Work |
|---|---|---|---|
| `title` | the **Work's** | yes, and null is honest | yes, on adoption |
| an editorial **label** | **MAIA's**, describing | — | **never** |

A label is what an editor calls a section when writing to you about it. It is not
a name being written into your manuscript.

---

> **Resolved 2026-08-31 — see `WS2-05B-8B-02b_EDITORIAL_READING_CONTRACT.md`.**
> The blocking discovery below is no longer a discovery: `editorialLabel` and
> `editorialSynthesis` are in the reader contract, offline-witnessed, and
> awaiting one real reading. **02a remains HOLD behind that reading**, for the
> reason stated at the end of this document.

## BLOCKING DISCOVERY — the labels do not exist anywhere

The specified map reads:

```text
├── Fire                                   43–69   ◇
├── Water                                  70–81   ◇
├── Earth                                  82–96   ◇
```

**`Fire` is not in the proposal.** Not as `title` (null), not as `kind`
(`"element"`, five times), not anywhere in the frozen row. It exists only inside
MAIA's account prose — *"an elemental sequence in the book's own order — Fire
(43–69), Water (70–81)…"*.

So the surface has exactly three ways to render that row, and two are forbidden:

1. **Parse the labels out of her account** — inference. The room would be
   deriving structure from prose, which is the thing the interpreter exists to
   stop a client doing. Refused.
2. **Invent them from the section headings inside the range** — the room writing
   names. Refused, and it is the exact failure the null-title rule prevents.
3. **Have MAIA emit them.** The only honest option.

**Therefore 8B-02 cannot be built as pure surface work.** The editorial layer
needs a field that does not exist, and the reader needs to be asked for it:

```text
ProposedUnitDraft
  title          the Work's own words, null rather than invented   (exists)
  kind           free text in the Work's vocabulary                (exists)
  label          MAIA's own description of this division           ← MISSING
                 for writing to the member ABOUT the Work.
                 never written into the manuscript.
```

That is a schema change plus a reader change plus a new reading — **5½
territory, not Custody-B**. It is the single largest thing standing between the
current room and the specified one, and no amount of layout closes it.

**Until it exists**, the map can honestly show only:

```text
├── element                                43–69   ◇
```

…which is the defect this unit was opened to fix.

---

## What separates cleanly, and what does not

**A · Pure surface, buildable against today's row**

- the editorial letter's *shape* — the frozen account given headings and seams to
  read by, with the full text behind *Read my full reasoning*
- the review queue as cards rather than diagnostic strings
- plain-language controls: `Why?` · `Show sections` in place of `⇤` and `+38`
- evidence on demand, which already works

Nothing here needs a new field. It is roughly half the specified page, and it
does not fix the `element` rows.

**B · Needs the reader — a new field and a new reading**

- editorial labels on divisions (`Fire`, `Water`, …)
- arguably a structured letter rather than one prose blob: if MAIA is to write an
  editorial letter, she should be asked for its parts — *what I think this book is
  doing*, *my proposed reading*, *how sure I am* — rather than have the room cut a
  paragraph into sections it did not author

**C · A capability that does not exist at all — *Ask MAIA***

The largest piece, and the one with real boundary questions before any of it is
designed:

- Does answering a question consume body scope? She has read 4 of 8 sections; a
  question about section 42 may require reading it.
- Does an answer become part of the frozen record, a separate artifact, or
  nothing?
- The frozen interpretation must remain byte-identical. A conversation *about* a
  reading must never silently become a revision *of* it.
- `Ask MAIA` must not be a path to adoption. 6 is HOLD.

**None of C should be designed by inference from the mock.** It is its own unit.

---

## Sequencing, proposed — not authorised

```text
8B-02a  editorial surface, today's row      pure surface · A above   HOLD
8B-02b  editorial labels + structured letter reader + schema · B     BUILT
8B-02c  Ask MAIA                            new capability · C above SEPARATE
```

**Authorised in the reverse order, and built that way**: 02b first, so the
surface is designed against a reading that can be communicated rather than made
smarter to compensate for one that cannot.

A alone will not pass the human witness — the `element` rows survive it. B is
what makes the map legible. C is what makes it a relationship rather than a
report.

**Doing A first and calling it progress would repeat this unit's own mistake**:
shipping the half that is easy to gate and discovering afterwards that the writer
still cannot read it.

---

## Acceptance

**Mechanical:** the 8a harness on the same frozen proposal —
`2a427a6f-86b5-4ba3-a901-267710977f25` — every accepted verdict held, revision 0,
interpretation byte-identical.

**Human, and there is no proxy for it:** the founder opens the room and can say
what MAIA thinks the structure of the book is, what she is unsure about, and can
take up one of her questions — without decoding the interface first.

8b stays HOLD behind that.
