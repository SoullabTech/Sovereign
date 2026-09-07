# PARKED — TOC entries may be promoted into manuscript structure

**Status:** PARKED · characterization required **before cohort expansion**
**Not:** a someday note, and not a defect — the hypothesis below is unestablished
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
