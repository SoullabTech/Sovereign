# PARKED — the second PDF extractor (`lib/workbench/extract/pdf.ts`)

**Status:** PARKED · not a finding · deliberately outside PDF-CLEAN
**Recorded:** 2026-09-07, during PDF-CLEAN
**Founder ruling:** *"The separate workbench extractor is now a known parallel
surface, not part of this repair. Record it as a follow-up candidate rather
than silently widening PDF-CLEAN."*

## What was observed

PDF-CLEAN characterized `pdf-parse@2.4.5` and repaired the extraction site the
Writer's/Author Studio import actually uses:

```text
app/api/sovereign/manuscripts/ingest/route.ts:44
  → lib/manuscript/ingest/parseUpload.ts → extractPdfText()
```

A second, independent PDF extractor exists:

```text
app/api/book-studio/workbench/uploads/route.ts:29
  → lib/workbench/extract/pdf.ts → extractPdf()
```

It is a parallel implementation, not a shared helper. `parseUpload.ts` does not
call it; the only textual link is a comment in `parseUpload.ts` citing it for
the ESM/CJS dynamic-import workaround.

## What is NOT claimed here

- **Not claimed** that the workbench extractor carries the same defect. It was
  not characterized. It was not run. Nobody has looked at its output.
- **Not claimed** that it is unused, or that it is used. Its route exists; its
  live traffic was not measured.
- **Not claimed** that the two should be unified. That is a design question
  this note has no authority to answer.

The only claim: **a second extraction surface exists, and PDF-CLEAN did not
touch it.** Silence about it would have been the drift; the note is the fix.

## The follow-up candidate, if opened

```text
1  characterize lib/workbench/extract/pdf.ts the same way — real pdf-parse,
   a subject whose author text includes a marker-shaped line
2  determine whether app/api/book-studio/workbench/uploads is live at all
3  only then decide: same repair, shared helper, or retire one surface
```

Step 3 is not prejudged. Two extractors may be correct if the surfaces have
genuinely different requirements; that has not been established either way.

## The invariant that transfers regardless

> Never remove page-marker-looking text AFTER extraction. By then author text
> and parser text may be indistinguishable.

Characterized, not assumed: on a three-page subject whose page 2 carried an
author-written `-- 2 of 3 --`, the aggregate `result.text` placed the author's
line and a synthetic one two lines apart, byte for byte identical. Any future
work on any extractor inherits this — the repair belongs before the flattening,
not after it.
