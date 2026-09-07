# SEGMENTATION-QUALITY-01 — the 175 ↔ 262 divergence

**Status:** CHARACTERIZATION OPEN · read-only · no repair authorized
**Opened:** 2026-09-07 by founder act · source `3027ceaff`

## Why this is a new lane, not a reopening

`SEGMENTATION-TOC` closed with *"four spurious sections out of 175 · not a
material problem · cohort risk NO."* **That conclusion is not inherited here.**
The 262 observation is broader than the hypothesis that lane tested, and
"no cohort risk" cannot be carried forward without reconciliation.

## The question

> Why did the same book appear as **175 sections** in one witnessed state and
> **262** in another?

## Observed

```text
                175 Work                        262 Work
manuscript      e2f9f288-bf60-40c1-…            55742458-be2c-406a-…
filename        ELEMENTAL_ALCHEMY_interior_     (unknown — needs production)
                217pp_NEWCH10.pdf
custody         Sep 7 14:04:04Z                 "Initialized verbatim from
                                                 source · Sep 6, 9:19 PM"
source chars    383,083                         (unknown)
extractor       pdf-parse 2.4.5                 (unknown)
runtime         e535e6246                       Sep 6 — PREDATES that deploy
pages           217pp (filename)                "~214 pages at latest keep"
Work            (none declared)                 "Test", ELEMENTAL_ALCHEMY
versions kept   —                               2
```

**These are different manuscript ids, created a day apart.** That alone means
this is not one import observed twice.

## SETTLED FROM SOURCE

### Q3 · Count provenance — NOT a projection artifact

Two id namespaces meet in the outline column (`lib/writersStudio/outlineRows.ts:4-12`):

```text
manuscript_sections.id        the immutable Source
manuscript_draft_sections.id  the writing surface's navigation identity
```

The rail's `Structure` count is Source (`canvas/page.tsx:455`
`railCounts.structure = sections.length`, from `useManuscriptSections`). The
outline's row count is DRAFT (`page.tsx:668` `sections={writeMount.rows}`, built
by `navigableRows()`).

**Both screenshots show the two agreeing** — 175/175 and 262/262. So neither
number is a projection inflating the other. Two genuinely different persisted
results.

### Q2 · Segmentation is deterministic over text

`lib/manuscript/ingest/segment.ts` is a pure function of the input string:
mechanical heading detection, no randomness, no clock, no external state. Given
identical text it returns identical cuts. **A divergence therefore implies the
TEXT differed, or the CODE differed — not that segmentation is unstable.**

### Q2b · Runtime differed — established

The Sep 6 import predates the `e535e6246` deploy (Sep 7 03:00Z), which carried
PDF-CLEAN. So the two imports ran on **different runtimes**. Note carefully what
this does and does not imply: PDF-CLEAN suppressed synthetic `-- N of M --`
markers, and those lines **cannot match the heading regex** (they begin `--`).
So the marker change alone does not explain extra sections. Runtime difference is
established; its causal relevance is **not**.

## REQUIRES PRODUCTION — cannot be answered from source

I have no host access. These are the queries; anyone with access can run them
read-only.

**Q1 · Same artifact, or merely the same book?**

```sql
SELECT m.id, a.original_filename, a.artifact_hash, a.artifact_size,
       a.extraction_method, length(a.source_text) AS chars, a.created_at
  FROM manuscript_source_arrivals a
  JOIN member_manuscripts m ON m.id = a.manuscript_id
 WHERE m.id IN ('e2f9f288-bf60-40c1-ada1-d35cf8bb2d1a',
                '55742458-be2c-406a-a158-d0438cf02892');
```

`artifact_hash` equal → same bytes. Unequal → **different artifact**, and the
lane likely closes there.

**Q3b · Persisted counts, both namespaces**

```sql
SELECT manuscript_id, 'source' AS ns, count(*) FROM manuscript_sections
 WHERE manuscript_id IN ('e2f9f288-…','55742458-…') GROUP BY 1
UNION ALL
SELECT manuscript_id, 'draft', count(*) FROM manuscript_draft_sections
 WHERE manuscript_id IN ('e2f9f288-…','55742458-…') GROUP BY 1;
```

**Q4 · First 30 entries from each**

```sql
SELECT manuscript_id, position, heading
  FROM manuscript_sections
 WHERE manuscript_id IN ('e2f9f288-…','55742458-…') AND position < 30
 ORDER BY manuscript_id, position;
```

**Q5/Q6 · Where body chapters begin, and what accounts for 87**

```sql
SELECT manuscript_id, min(position) AS first_chapter
  FROM manuscript_sections
 WHERE manuscript_id IN ('e2f9f288-…','55742458-…')
   AND heading ~* '^chapter\s+1\b'
 GROUP BY 1;
```

## Classification — UNRESOLVED

One of these, on the evidence above:

```text
[ ] different artifact                     ← leading candidate (different ids,
                                             different day, 217pp vs ~214)
[ ] different runtime / code               ← established as FACT, relevance unproven
[ ] different projection / UI count        ← RULED OUT (Q3, source-settled)
[ ] different input representation
[ ] same input + same code, divergent      ← would be the serious finding
[x] UNRESOLVED — pending Q1, Q3b, Q4, Q5/Q6
```

## What is NOT authorized

No regex changes. No heading heuristics. No front-matter suppression. The first
question is not *"how do we get 262 down"* — it is *why the two differ*.

## Launch bearing

If Q1 returns **equal hashes** — same bytes, different result — segmentation
outranks Find for launch, and the earlier "no cohort risk" is withdrawn. If the
hashes differ, this is two different files and the reprioritization needs
re-argument on its own merits.

---

# RESOLUTION — 2026-09-07 · founder-run production queries

## Classification

```text
[x] different artifact
[x] different input representation
[ ] same input + same code, divergent
[ ] projection / UI inflation          ← already ruled out from source
```

The lane's leading candidate was correct. **Not two outcomes from one file.**

```text
                  262 Work                    175 Work
artifact          ELEMENTAL_ALCHEMY.md        …_interior_217pp_NEWCH10.pdf
hash              72f4e044…9be9a90b           e139cac7…a8a6224
bytes             389,056                     15,828,565
extraction        utf8-decode                 pdf-parse-getText
chars             386,470                     383,083
Source / Draft    262 / 262                   175 / 175
```

Different bytes, different formats, different extraction representations.

## The 87 is exactly accounted for

```text
262 Markdown              175 PDF
  24  H1                  151  ALL-CAPS boundaries
  25  H2                   23  chapter signals
 211  H3                    1  preamble
   1  chapter signal
   1  preamble
 ───                      ───
 262                      175

261 detected boundaries − 174 = 87
```

Deterministic segmentation responding to two materially different
representations. **No instability, no invented structure.**

## The finding that changes the launch question

```text
Chapter 1 begins   Markdown position 16 · PDF position 8
```

So **8 of 87** extras precede Chapter 1. The other **79 are body**.

This is therefore NOT mainly "front matter accidentally became sections." The
`.md` explicitly marks its own front matter — the three `Elemental Alchemy` H1s
and Permissions/Dedication/Disclaimer/Contents are all markdown headings the
author's file contains. **The segmenter invented nothing.**

The real question is the 211 H3s becoming 211 peer rows:

> **Should every structural heading in an imported manuscript become a
> first-class Writer's Studio section — or is some of it subordinate structure
> WITHIN a section?**

## Lane closes here — and hands to an existing lane

`SEGMENTATION-QUALITY-01` is **CHARACTERIZED / CLOSED**. The divergence is
explained; no repair is warranted for it; `SEGMENTATION-TOC`'s PDF finding needs
no withdrawal, because no same-input inconsistency exists.

**The successor question is already a lane.** `WS2-08` — Hierarchical Manuscript
Structure — records exactly this requirement:

> *"a Work may be addressable at fine-grained section level while remaining
> coherently organized as chapters and subchapters authored or confirmed by the
> member."*

And its substrate is already **live in production**:

```text
migration 20260906000001   applied 2026-09-06 13:36:01Z
manuscript_sections.heading_depth    1..3 | NULL
manuscript_sections.heading_signal   markdown | chapter | caps | member
```

The counts above were read from those columns. WS2-08A landed them; **08B —
member-confirmed imported hierarchy — is designed and on HOLD pending an
explicit founder act.**

So the recommended #1 is not a new characterization lane. It is a founder act on
**WS2-08B**, which already carries the requirement, the data, and the ruling that
ALL-CAPS is a boundary with depth NULL and never a chapter by default.

## Revised order

```text
1  WS2-08B   section granularity / hierarchy — EXISTING LANE, founder act
2  FIND      still launch-critical for large Works
3  D-01      Versions truthfulness repair
4  Ask MAIA + vocabulary
5  D-02      copy repair
```
