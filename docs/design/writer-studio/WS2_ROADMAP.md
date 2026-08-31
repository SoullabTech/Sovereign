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
5a  pure presentation      PASS
5b  route corrections      PASS
5b  component              PASS
5c  browser harness        GREEN / COMPLETE
5½  MAIA reader            HOLD
6   adoption               HOLD
```

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

## THEN — likely sequence

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
