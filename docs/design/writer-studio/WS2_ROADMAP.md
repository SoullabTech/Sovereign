# Writer's Studio — Roadmap

**As of 2026-08-31.** Kelly's sequencing, recorded so it survives the session
that produced it.

> The key shift: we are past building the room. We are now building the sequence
> by which a pile of safely writable material becomes a legible, developable,
> revisable Work.

---

## NOW — close WS2-05A · Authorial Structure

Proven on the real 174-section manuscript:

```text
Fire = 42–69, 28 sections grouped
manuscript digest unchanged   8d0bc84f45bef77a94551b42bbc5bfeb | 380343
stable &s=<uuid> navigation observed
substrate / concurrency / contiguity / delete invariants green
```

Two browser witnesses remain:

```text
reload:  same section / top of book
Back:    left the Work / retraced sections
```

Both pass → **WS2-05A — PASS · founder-witnessed locally.**

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

### 05B board — Kelly's ruling, 2026-08-31

```text
05B-1  evidence                     PASS
05B-2  interpretation host          PASS
05B-3  proposal persistence         PASS
05B-4  review operations            PASS
05B-5  review surface               PASS  (5a · 5b · 5c)
05B-5½ real MAIA structure reader   PASS · REAL-WORK WITNESSED · CLOSED
05B-6  sovereign adoption           HOLD
05B-7  end-to-end adoption witness  HOLD
05B-8a render fidelity            FAIL · baseline in
                                  WS2-05B-8A_RENDER_FIDELITY_WITNESS.md
                                  repair NEEDS bounded surface authority
05B-8b founder judgment of the    HOLD behind 8a
       reading itself
```

**8b is held behind 8a deliberately.** The room renders none of the three
uncertain regions and none of the ten divisions' uncertainty tags, so what is on
screen is a cleaned-up, more-certain version of the reading MAIA actually made.
Judging "did she perceive my book" through that surface would be judging a
different reading.

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

Holds in force: **6 HOLD** (requires explicit adoption authority). 5½ is closed;
**05B-8**, the founder judgment of what MAIA perceived, is openable and is the
next honest act. `TYPECHECK-BASELINE-DIAGNOSTIC-IDENTITY-01` sits outside
this sequence entirely.

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
