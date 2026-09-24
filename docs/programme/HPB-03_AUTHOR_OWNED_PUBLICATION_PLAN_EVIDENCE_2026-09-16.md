# HPB-03 — Author-Owned Publication Plan Evidence

**Date:** 2026-09-16
**Base:** HPB-02 head `3adeb8d7f`
**Branch:** `feature/ws-hallmark-book-production-03`

## Governing law

Publication roles are author-owned production metadata. They do not rename, rewrite, reorder, delete, summarize, or infer manuscript prose.

A role is attached by exact current draft-section identity. If a draft section disappears, its placement disappears through the foreign key; the system never guesses a replacement section from heading text, position, or similarity.

## Durable model

`manuscript_publication_objects` stores one durable role per manuscript (`half-title`, `title-page`, `imprint`, `copyright`, etc.). It stores no manuscript prose.

`manuscript_publication_members` binds that role to one or more exact `manuscript_draft_sections.id` values. Selected sections must be current, unique, contiguous, and not already assigned to another role.

The author may explicitly replace or clear a role. Other publication-role decisions remain unchanged.

## API

`/api/sovereign/manuscripts/:id/publication-plan`

- GET reads the owned manuscript's publication plan.
- POST assigns one role to exact section IDs.
- DELETE clears one named role.
- stale section IDs, non-contiguous selections, and cross-role overlap refuse rather than guessing.
- all mutations remain member-scoped and ownership-gated.

## Render integration

The working-draft render read joins saved publication placement by exact `draft_section_id` and passes the resulting role to Hallmark preflight and composition.

One role may span several contiguous sections. The renderer opens one publication-matter wrapper for the whole contiguous span; it does not manufacture multiple title pages from a multi-section title-page assignment.

The role vocabulary is shared between publication-plan storage and rendering to prevent ontology drift.

## Visible-title authority

Pandoc previously synthesized a visible title block from document metadata. Once an author-owned title page exists, that would produce two title pages.

HPB-03 removes automatic visible title generation:

- PDF Pandoc conversion emits a body fragment only; title/author remain document metadata in the outer HTML.
- EPUB keeps title/author metadata but uses `--epub-title-page=false`.
- visible title matter must therefore come from the author-owned publication plan/manuscript.

This physical change advances the production profile to `hallmark-6x9-v3`.

## Physical v3 witness

A real renderer smoke used four manuscript sections:

- title-page section 1: `Elemental Alchemy`
- title-page section 2: author/imprint lines
- governed Copyright section
- confirmed Chapter 1 section

Result:

- **3 PDF pages**, not 4: both contiguous title-page sections occupied one title-page object.
- no automatic Pandoc title page preceded the governed title page.
- page 2 was Copyright.
- page 3 was Chapter 1.
- PDF MediaBox: **432 × 648 pt** = **6 × 9 in**.
- production profile: `hallmark-6x9-v3`.
- temporary artifact deleted after inspection.

## Gates

- focused publication-plan / renderer / render-route suites: **51 / 51 passed**
- TypeScript no-regression: **229 vs baseline 239; 0 regressions**
- Design canon: green
- Internal imports: green with pre-existing warn-only debt
- Backend imports: green
- No-Supabase: green
- `git diff --check`: green
- blank database reconstruction: green; all migrations applied and app schema gate passed

## Migration

`20260916000004_manuscript_publication_plan.sql` creates publication objects and exact draft-section placements.

Rollback:

```sql
DROP TABLE IF EXISTS manuscript_publication_members;
DROP TABLE IF EXISTS manuscript_publication_objects;
```

## Not authorized by this record

No publication role is assigned to Elemental Alchemy by this work. No manuscript wording is changed. No migration application, production deployment, legal-text repair, copyright selection, front-matter deletion/merge, KDP upload, or final-edition designation is authorized.
