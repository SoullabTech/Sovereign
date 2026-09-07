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
