# HPB-02 — Front Matter and Final Production Gate Evidence

**Date:** 2026-09-16
**Base:** canonical merge `a0e3aa45e5bb`
**Branch:** `feature/ws-hallmark-book-production-02`

## Purpose

Elemental Alchemy — Hallmark Edition is the acceptance target. A book may be proofed while publication matter is unresolved, but it may not be called final until legal/front-matter ambiguities are resolved by explicit author-owned production roles.

## Product law

- Proof rendering remains available for inspection.
- Final rendering runs a non-mutating production preflight first.
- Final rendering refuses while any production blocker remains.
- Body prose never grants itself a publication role.
- Explicit production roles may disambiguate front matter without rewriting manuscript text.
- Copyright-like text is detected more broadly than copyright authority, including damaged import markers.
- Import-navigation debris such as repeated `.xhtml` references blocks final production.

## Real Elemental Alchemy witness

Read-only preflight was run against both 262-section `ELEMENTAL_ALCHEMY` manuscripts. Their early front matter produced the same result.

Body begins at section index 15 (`Part One — The Ground`). Before it, unresolved publication candidates include indices 0, 1, 2, 3 and 10.

The actual blockers are:

1. `damaged_copyright_text` at index 1 (`Copyright � 2026…`).
2. `copyright_not_governed` across indices 1 and 4.
3. `duplicate_copyright_statements` across indices 1 and 4.
4. `front_matter_roles_unresolved` at indices 0, 1, 2, 3 and 10.
5. `import_navigation_artifact` at index 10 (`Chapter Summaries by Elemental Type`, containing multiple `.xhtml` references).

The preflight did not mutate either manuscript and did not choose which legal text is canonical.

## Physical v2 witness

A synthetic governed proof using `hallmark-6x9-v2` rendered successfully:

- PDF MediaBox: 432 × 648 pt = 6 × 9 in.
- Spectral Regular/SemiBold embedded and subsetted.
- Governed title page retained title-page scale.
- Governed Copyright body rendered at restrained legal-page scale.
- Chapter opening retained chapter scale.
- Page-size assertion did not fire.
- Temporary artifact deleted after inspection.

## API contract

`POST /api/sovereign/manuscripts/:id/render` now accepts optional `stage: 'proof' | 'final'`.

- omitted stage remains `proof` for backward compatibility.
- `proof` renders even if production blockers remain.
- `final` returns 409 with the exact preflight report when blockers remain.
- `final` renders only when preflight is clean.
- render provenance records `production_stage`.

## Migration

`20260916000003_manuscript_render_production_stage.sql` adds nullable `production_stage` with `proof|final` constraint. Legacy rows remain valid. Rollback SQL is included in the migration.

## Gates before seal

Focused renderer + route suites: 39/39 green.
TypeScript no-regression: 229 vs baseline 239; zero regressions.
Design canon: green.
Internal imports: green with pre-existing warn-only debt.
Backend imports: green.
No-Supabase: green.
`git diff --check`: green.
Empty database reconstruction (`npm run db:verify-bootstrap`): green; blank PostgreSQL database reached a bootable MAIA schema with all required migrations present.

## Not authorized by this record

No production deployment, migration application, legal-text rewrite, canonical copyright selection, manuscript deletion/merge, KDP upload, or final-edition designation is authorized by this record.
