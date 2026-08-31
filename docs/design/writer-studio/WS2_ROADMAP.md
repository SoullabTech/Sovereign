# Writer's Studio — Roadmap

**As of 2026-08-31.** Kelly's sequencing, recorded so it survives the session
that produced it.

> The key shift: we are past building the room. We are now building the sequence
> by which a pile of safely writable material becomes a legible, developable,
> revisable Work.

---

## CLOSED — WS2-05A · Authorial Structure

Proven on the real 174-section manuscript:

```text
Fire = 42–69, 28 sections grouped
manuscript digest unchanged   8d0bc84f45bef77a94551b42bbc5bfeb | 380343
stable &s=<uuid> navigation observed
substrate / concurrency / contiguity / delete invariants green
```

**WS2-05A — PASS · founder-witnessed locally. CLOSED.**

**Corrected 2026-08-31 (Kelly).** This section previously read *"two browser
witnesses remain — reload, Back"*, and a later reading of the roadmap repeated
it as an open item. It is not: 05A closed founder-witnessed on the real
manuscript, and **05A-R1 — map continuity / restore / sticky controls — PASS ·
machine-verified** subsequently put those continuity properties into the browser
harness. **Do not reopen 05A.**

Nesting, promotion and leaf-deletion stay labelled substrate-proven unless the
walker says they were exercised in the room.

---

## NEXT — JARVIS / WS2-05B · Proposed Structure of a Work

Not "find chapters". See `WS2-05B_PROPOSED_STRUCTURE_CHARTER.md`.

```text
mechanics finds evidence
      ↓
MAIA interprets organizing grammar
      ↓
member reviews the whole proposal
      ↓
Use this structure
      ↓
05A authored structure
```

Must support chapters, parts, movements, acts and scenes, essays, poems,
entries, irregular mixed structures, arbitrary vocabulary, arbitrary depth —
and **"no larger structure yet" as a legitimate outcome.**

Preserves:

```text
STRUCTURE   where the Work divides
THREADS     what recurs across those divisions
```

`86bab2094` remains the failed mechanical baseline and GROUND evidence, not
shipped behaviour.

### The board — Kelly's ruling, 2026-08-31 (superseding the 05B-only board)

```text
FOUNDATION / WRITING SUBSTRATE
  WS2-04A  section-addressable writing            CLOSED
  WS2-04B  real-book Canvas writing               PASS · founder-witnessed
  04B-0    legacy scaffold normalization          BUILT + EXECUTED LOCALLY
                                                  witness / production
                                                  authorization still separate

AUTHORIAL STRUCTURE
  WS2-05A  writer creates and edits structure     PASS · CLOSED
  05A-R1   map continuity / restore / sticky      PASS · machine-verified

MAIA PERCEIVES STRUCTURE
  05B-1    mechanical StructureEvidence           PASS
  05B-2    interpretation host / six readings     PASS
  05B-3    immutable proposal persistence         PASS
  05B-4    proposal review operations             PASS
  05B-5    presentation · HTTP boundary · browser PASS
  05B-5½   real MAIA StructureReader              PASS · real Work · CLOSED

EDITORIAL RELATIONSHIP
  05B-8a   render fidelity                        PASS · target accepted on the
                                                  real proposal; favicon 404s
                                                  remain unrelated baseline-red
  05B-8B-02b  editorial reading contract          PASS · REAL-WORK WITNESSED
                                                  Fire / Water / Earth / Air /
                                                  Aether · structured synthesis
                                                  · no authorial leakage
  05B-8B-02a  editorial review surface            BUILT a205fef29
                                                  machine floor PASS on a
                                                  fixture; 8a on the real row
                                                  and the FOUNDER WITNESS both
                                                  outstanding
  05B-8B-02c  ask MAIA about the reading          NEXT once 02a is witnessed
  05B-8b   founder semantic judgment              HOLD · behind 02c

SOVEREIGNTY BOUNDARY
  05B-6    adoption                               HOLD
```

### The ordering correction — 02c comes BEFORE final 8b

**Kelly, 2026-08-31, overturning the sequence recorded at `a55d9962f`.** That
one read `02a → 8b → 02c → 6`, on the reasoning that 8b needs a room the founder
can read. True as far as it goes, and it stopped a step short:

> Being unable to question the editor was part of why the reading did not make
> sense.

The 8B verdict on the old questions panel was that it *"just dumps out cryptic
insights without interaction capabilities"* — so the missing conversation was
never only a missing feature, it was half the reason the reading did not land.
A report you cannot interrogate is not yet an editorial relationship.

```text
02a  a readable editorial report
      ↓
02c  converse with MAIA about it
      ↓
8b   judge whether her reading is right
```

An opinion may well form before 02c. **The program gate does not fire before the
writer can ask:**

```text
Why does Fire begin at 42?
Why do you think those Part labels belong to the real architecture?
What made you change your reading from the previous proposal?
Show me what you saw around this seam.
```

That last question is the one with teeth: the reading MOVED between
`2a427a6f` and `e6cabcc4` — `stable` not `mixed`, 22 divisions not 11, the
Work's own PART names adopted where the earlier reading refused them — and
02b's record leaves open whether the editorial contract caused it or it is
ordinary variance. A writer who can ask her is in a different position from one
who cannot.

**02a already carries this limit visibly rather than hiding it:** a member can
read one of her questions and cannot answer it. That was recorded as the honest
state of the room; this ruling makes it a gate rather than a footnote.

**The room was built for a machine.** Every iteration was shaped by what the 8a
harness can assert — attributes, counts, order — and all of that is satisfiable
by a page no writer can use. The harness stays as a non-regression gate; it is
not the product specification.

**MAIA should act like an editor, not a database viewer**: editorial synthesis,
then a structural map, then her questions, then evidence on demand, then
conversation. And the doctrinal correction the unit rests on — *"do not invent
manuscript titles" does not mean "MAIA may not describe what she perceives"* —
the Work's words are a `title`, MAIA's description is a `label`, and a label is
never written into the manuscript.

**Blocking, and now resolved by 02b:** the labels did not exist. `Fire` is
nowhere in the frozen row — not title, not kind — only inside her account prose.
Rendering it required either inference or a new reader field, so 8B-02 was never
pure surface work. 02b added the field: `editorialLabel` on every division and an
`editorialSynthesis` on every reading, required of MAIA at the tool schema and
refused by the parser when malformed or missing, and structurally unable to reach
the member's copy or the manuscript. The contract hash moved
`7d4e27cfa81d… → a1825a7c2f50…`.

**What that does not settle:** whether MAIA can honestly ground a label on that
book, or declines to `null` — which the contract permits. That is a fact about
the next real reading, not about the code, and 02a stays HOLD behind it. *Don't
make the surface smarter to compensate for an under-specified reading.*

**8a proved fidelity; it did not prove intelligibility.** The room shows the data
structure of MAIA's reading rather than communicating the reading: eleven nested
divisions have to be reverse-engineered out of 174 heading rows before the
central claim is visible. A founder who cannot see the claim cannot fairly accept
or reject it, so 8b is pending rather than merely unblocked.

**8b was held behind 8a deliberately, and is now released.** The room rendered
none of the three uncertain regions and none of the ten divisions' uncertainty
tags, so what was on screen was a cleaned-up, more-certain version of the reading
MAIA actually made; judging "did she perceive my book" through that surface would
have been judging a different reading. It now shows the whole one.

5½ closed 2026-08-31 on Elemental Alchemy, both runs recorded in
`WS2-05B-5HALF_STRUCTURE_READER_WITNESS.md`. **5½ passing is not a reason to
open 6.** The next honest act is 05B-8: did MAIA perceive the organizing grammar
of this Work? That is a founder judgment, not a test result.

`05a6bfc09` is where 5c closed. What it establishes:

- the HTTP envelope is real — `previewOnly` and `expectedReviewRevision` have
  semantic types at ingress rather than relying on JavaScript coercion;
- a reading is discoverable without becoming another application surface —
  summaries only, the existing panel role, no production POST;
- absence means absence — `ReadingsEntry` renders null, so the Canvas never
  implies an interpreter exists merely because the schema does;
- 5c tested COMPOSITION, not pieces. Its three findings were a prop vanishing
  at a component boundary, a semantic attribute inverted, and assertions that
  never executed across the browser/tsx serialization boundary.

> A negative DOM assertion against a component incapable of forwarding the
> attribute is a false witness. The component was fixed; the assertion was not
> weakened.

**Do not advance into 5½ or 6 from this commit.** 5½ requires the reader; 6
requires adoption authority, and neither is authorised by 5c being green.

Parked, deliberately outside this unit:
`docs/ops/TYPECHECK_BASELINE_DIAGNOSTIC_IDENTITY_01.md` — the typecheck gate
keys on a presentation artifact, so the same tree passes or fails depending on
whether `.next` exists. 5c discovered it; discovering it is not permission to
redesign the gate.

---

## THE GOVERNING BOUNDARY

> **Perception may become increasingly whole-work; authorship does not thereby
> become implicit.**

MAIA may perceive structure, repetition, unresolved promises, energy and
development across the entire Work. None of those perceptions becomes manuscript
bytes by being correct, by being whole-work, or by being adopted into the
roadmap. 05B already enforces this structurally — the frozen interpretation is
evidence, the reviewed copy is authorship, and no route can turn one into the
other — and everything below inherits it.

`07` and `08` are where that stops being automatic. They are qualitatively
different from perception work because they can alter the actual manuscript:
**census first, proof first, explicit authority first.**

## THE ORDERING — strict

Each unit depends on the one above it. Nothing below is opened because something
above went green; green proves bounded work, it does not confer permission.

```text
5½  MAIA reader                      CLOSED 2026-08-31 · real-Work witnessed
 ↓
8a  render fidelity                  PASS · target green on the real proposal
 ↓
8B-02b editorial reading contract    PASS · REAL-WORK WITNESSED
                                     proposal e6cabcc4
 ↓
8B-02a editorial surface             BUILT a205fef29 · machine floor PASS
                                     8a on the real row and the founder
                                     witness both outstanding
 ↓
8B-02c Ask MAIA about the reading    NEXT once 02a is witnessed
                                     conversation ABOUT a proposal
                                       ≠ revision OF it
                                       ≠ adoption
 ↓
8b  founder semantic judgment        HOLD — behind 02c, not before it
 ↓
6   adoption                         HOLD — needs explicit adoption authority
 ↓
06  read divisions whole
 ↓
07  import-artifact census           read-only; only THEN any authorised normalisation
 ↓
08  split / merge real writing units
 ↓
    section-aware checkpoint
 ↓
    developmental notes + threads
 ↓
    whole-work intelligence
 ↓
    revision
 ↓
    expression / publish
```

Holds in force: **6 HOLD** (requires explicit adoption authority).

**Superseded twice, and recorded rather than quietly edited** — a roadmap that
silently rewrites its own past reads as though it always knew.

*First:* this section read *"5½ is closed; 05B-8 is openable and is the next
honest act."* True when written, false within the day — 8a found the room
rendering a cleaner, more certain reading than the one MAIA made, and 8B found
that even a faithful render was not legible. *Render fidelity ≠
intelligibility.*

*Second:* it then read `02a → 8b → 02c`, on the reasoning that 8b needs a room
the founder can read. Kelly's correction, same day: a report you cannot
interrogate is not yet an editorial relationship, and being unable to question
the editor was itself part of why the reading did not land. **8b now sits behind
02c.**

`TYPECHECK-BASELINE-DIAGNOSTIC-IDENTITY-01` and the three app-wide favicon 404s
sit outside this sequence entirely.

---

## THEN — the units, in that order

### WS2-06 · Division Reading View

Read an authored division continuously — *"show me Fire as a whole"* — while
editing stays section-authoritative underneath. The developmental experience of
reading a chapter or movement whole, without creating a second writable
manuscript.

### WS2-07 · Print Scaffold Census — read-only first

Survey the real draft for `-- N of 216 --` markers, orphan page numbers, other
mechanically identifiable print furniture, and — **separately, because they are
ambiguous** — hard line-wraps. No cleanup until the census proves what is safe.

### WS2-07B · Print-scaffold normalisation, if justified

Mechanically proved only, and explicitly authorised, **because it changes
manuscript bytes.**

### WS2-08 · Section Split / Merge

Only when needed. Changes the actual writing boundaries, so it gets 04A's
standard: byte-exact preservation, provenance preservation, conflict-safe,
transactional, no orphaned text, real-book witness. This is what eventually
allows "make this whole chapter one editable unit", if that turns out to be
desirable.

### SECTION-AWARE-CHECKPOINT

Still separate and pending. "Keep a version" becomes section-authoritative
without resurrecting whole-manuscript writes. Deliberate, never a side effect of
another unit.

---

## After the manuscript mechanics — the developmental intelligence layer

**Development / Explore** — notes attached to sections and divisions,
questions, developmental threads, unresolved passages, motifs and themes,
relationships across non-contiguous material, and MAIA observations that remain
distinct from manuscript text.

**Whole-Work perception** — where the Work loses energy; what repeats; which
promises never resolve; where a theme disappears; what a section contributes to
the whole; what is missing between two movements. **Without silently rewriting
the Work.**

**Review / Revision** — revision passes, comparing states, developmental goals,
change tracking at useful granularity, *"show me what changed in Fire since the
last keep"*.

**Expression / Publish** — clean reading manuscript, export, print and eBook
preparation, front and back matter, publishing views, eventually production
pipelines.

---

## The arc

```text
05A  AUTHOR STRUCTURE              almost closed
 ↓
05B  PERCEIVE / PROPOSE STRUCTURE
 ↓
06   READ DIVISIONS WHOLE
 ↓
07   CLEAN IMPORT ARTIFACTS
 ↓
08   SPLIT / MERGE WRITING UNITS
 ↓
     SECTION-AWARE CHECKPOINT
 ↓
DEVELOPMENTAL NOTES + THREADS
 ↓
WHOLE-WORK INTELLIGENCE
 ↓
REVISION
 ↓
EXPRESSION / PUBLISH
```
