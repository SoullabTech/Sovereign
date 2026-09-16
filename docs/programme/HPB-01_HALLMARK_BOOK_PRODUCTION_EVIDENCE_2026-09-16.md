# HPB-01 — Hallmark Book Production Evidence

**Date:** 2026-09-16
**Branch:** `feature/ws-hallmark-book-production-01`
**Base:** `892c88ee449c`
**Status:** implementation sealed for review; no deployment or migration application authorized

## Production authority

Member-book export now prefers the current section-addressable working draft. Imported source is used only when no section-addressable draft exists. If an addressable draft exists but its section rows cannot be loaded, export refuses rather than silently substituting older source prose.

The render source carries stored `heading_depth` and `heading_signal`. Markdown assembly preserves confirmed depth 1/2/3 and keeps unknown structure subordinate instead of manufacturing a chapter.

Production provenance separates manuscript identity from physical composition: source hash covers words plus stored structure; the render ledger migration adds `production_profile`, `source_authority`, and `source_revision`.

## Publication semantics and preflight

Explicit publication headings may identify front/back-matter roles. Body prose cannot promote itself into a Copyright object. Part/Chapter roles require confirmed top-level structural evidence, and Chapter recognition requires an actual numbered/Roman chapter designation rather than any heading beginning with the word “Chapter.”

The read-only production preflight reports ambiguous or duplicate copyright statements; it does not rewrite, deduplicate, or choose legal language for the author.

**Open Hallmark blocker:** the current Elemental Alchemy front matter contains multiple copyright representations. A human must choose the canonical publication object before a future Final/print-ready act.

## Deterministic physical profile

`hallmark-6x9-v1` uses repository-pinned Spectral 400/600 regular/italic font assets embedded into the PDF. Remote Google Fonts are removed before render. Paged.js waits for the font set before pagination.

Two Chromium/Paged.js parser hazards were found and repaired:

1. page geometry and nested margin-box furniture are kept in separate `@page` rules;
2. Google Fonts import removal handles semicolons inside the URL rather than leaving corrupt CSS before the first `@page` rule.

Hallmark rendering enables a page-size assertion: if Paged.js's measured page box differs from requested physical dimensions, export refuses before PDF emission.

## Physical witness

Real renderer smoke after the repairs:

- Paged.js page box: **576 × 864 CSS px** = **6 × 9 in**
- emitted PDF MediaBox (`pdfinfo`): **432 × 648 pt** = **6 × 9 in**
- page count: 3
- PDF font table: Spectral Regular/SemiBold embedded and subsetted
- guarded render completed without page-size refusal

The smoke artifact was deleted after inspection.

## Gates

Focused HPB/render/model tests: green. Exact render route suite: **9/9 green**.
TypeScript no-regression: **229 errors vs 239 baseline; 0 regressions**.
Design canon: green. Internal imports: green. Backend imports: green. No-Supabase: green. `git diff --check`: green.

The repository-wide Jest corpus is not globally green on this base. HPB head reports **43 failed / 413 passed** suites. A completed run at clean base `892c88ee449c` reports the same **43 failed / 413 passed** top-line result; comparison of the final 43 failure records is identical. HPB adds passing coverage and introduces no new failing suite relative to its base.

## Not authorized by this record

This record does not authorize production deployment, database migration application, canonical-copyright selection, legal-text rewriting, final print-ready designation, KDP upload, or modification of the author’s front matter.
