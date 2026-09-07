# PARKED — TOC entries may be promoted into manuscript structure

**Status:** PARKED · characterization RUN 2026-09-07 · hypothesis LARGELY FALSIFIED
**Not:** a someday note, and not a defect — see the result section, which
disconfirms most of what this note originally proposed
**Recorded:** 2026-09-07, observed during the PDF-CLEAN production witness
**Repair authorized:** none

## Observed

A real 217-page book imported through production Writer's Studio
(`ELEMENTAL_ALCHEMY_interior_217pp_NEWCH10.pdf`, manuscript
`e2f9f288-bf60-40c1-ada1-d35cf8bb2d1a`, production `e535e6246`) produced **175
detected sections**. The outline's early ordering:

```text
0  Untitled section
1  PART ONE — THE GROUND
2  Chapter 7 Earth — The Element of Stability and Groundedness
3  BACK MATTER
4  Chapter Summaries by Elemental Type
5  A VIVID DREAM AND A NEW UNDERSTANDING
...
8  Chapter 1: The Journey Begins
```

Chapter 7 at index 2 and BACK MATTER at index 3, with Chapter 1 at index 8.

## Hypothesis — not established

Front-matter / table-of-contents lines satisfy the existing heading heuristics
in `lib/manuscript/ingest/segment.ts` and are promoted into manuscript
structure. Both branches of its heading regex would admit them:

```
/^(#{1,3}\s+.+|[Cc]hapter\s+\w+.*|[A-Z][A-Z0-9 ,'&\-—:]{3,80})$/
```

A TOC line reading `Chapter 7 Earth — The Element of Stability and
Groundedness` matches the chapter branch; `BACK MATTER` matches the caps
branch. Nothing distinguishes a contents listing from the heading it names.

## NOT established

- how many of the 175 are TOC-derived
- whether body headings are duplicated later in the same manuscript
- whether true manuscript order is corrupted, or merely prefixed by front matter
- whether 175 sections is actually unusable in practice

The last one matters most and is the easiest to overstate. An early framing of
this finding called it "the difference between a usable outline and an unusable
one." That was a conclusion, not an observation, and it is withdrawn here.

## Boundary

```text
not caused by PDF-CLEAN
pageJoiner:'' changed parser PRESENTATION, not heading RECOGNITION
predates the repair; unaffected by it
no repair authorized
```

## The characterization to run before cohort expansion

Read-only, and answerable in SQL against the already-persisted manuscript — no
lane, no re-import, no code:

```sql
SELECT heading, count(*), min(position), max(position)
  FROM manuscript_sections
 WHERE manuscript_id = 'e2f9f288-bf60-40c1-ada1-d35cf8bb2d1a'
   AND heading IS NOT NULL
 GROUP BY heading HAVING count(*) > 1
 ORDER BY min(position);
```

A duplicated heading with a wide `min`/`max` position gap is the TOC-echo
signature: once in the contents, once at the real chapter. No duplicates at all
would mean 175 is legitimate structure and the hypothesis is wrong.

Then decide by magnitude, which is the point of characterizing before repairing:

```text
40-100 false structural sections  → open the lane immediately
a handful of TOC echoes           → a much smaller intervention
no duplicates                     → the hypothesis is wrong; close this note
```


---

# Characterization RESULT — 2026-09-07

The query above was run against production. **The hypothesis is largely
falsified**, and this section is kept rather than the note being deleted,
because a tested-and-disconfirmed hypothesis is the useful record.

```text
4 duplicated headings out of 175

heading                              n   first   last    reading
─────────────────────────────────────────────────────────────────────────
Chapter Summaries by Elemental Type  2       4    151    wide gap · echo-shaped
INTRODUCTION                         2      48    163    wide gap · echo-shaped
INTEGRATING THE ELEMENTS             2      27     39    12 apart · NOT echo
INTELLIGENCE                         2     157    158    adjacent · NOT echo
```

## What this disconfirms

The note predicted that TOC promotion would show up as many duplicated
headings — "40-100 false structural sections opens the lane immediately".
There are **four**, and only two carry the wide first/last gap that a contents
listing plus its real chapter would produce. By this note's own decision rule
that is the "a handful of TOC echoes" branch: no lane.

## What it does NOT explain, and what the residual actually is

The observation that opened this note was the ORDERING:

```text
2  Chapter 7 Earth — The Element of Stability and Groundedness
3  BACK MATTER
8  Chapter 1: The Journey Begins
```

None of those three is in the duplicate list. Each appears exactly ONCE. So
they are not echoes of anything, and duplication cannot be the mechanism. The
proposed explanation was wrong.

The residual question is therefore narrower and different in kind:

```text
WAS   are TOC lines being duplicated into structure?      → answered: barely
IS    does extraction order follow the book's reading      → unanswered
      order, or does front matter place single-occurrence
      chapter references early?
```

Two candidate explanations, neither established:

1. The PDF's text layer genuinely presents this material early — a contents
   page whose entries are the ONLY occurrence of those exact strings, with the
   real chapter headings worded differently enough not to collide.
2. Extraction order does not follow reading order for this document.

These are distinguishable by reading the first ~15 headings by position
against the book's actual front matter. That is a read-only check and still
requires no repair.

## Separate, smaller observation

`INTELLIGENCE` duplicated at adjacent positions 157 and 158 looks like a
heading split across two printed lines (e.g. `EMOTIONAL` / `INTELLIGENCE`)
rather than anything to do with contents pages. Noted, not chased.

## Standing conclusion

```text
TOC duplication        NOT a material problem — 4 of 175
175 sections           no evidence they are mostly false
ordering anomaly       real, unexplained, narrower than proposed
repair                 still not authorized, and now less likely to be needed
cohort risk            LOWER than this note originally implied
```
