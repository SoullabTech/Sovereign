# HPB-04 — Book Production Surface Evidence

**Date:** 2026-09-16
**Base:** combined HPB-02/03 head `a05f811ae41c`
**Branch:** `feature/ws-hallmark-book-production-04`

## Purpose

Elemental Alchemy — Hallmark Edition remains the acceptance target. HPB-04 turns the existing Press → Book tab from passive download controls into an author-facing production room.

The room uses current draft-section identities. It never substitutes source-section ids, title matching, or position guessing for author-owned production decisions.

## Member-facing acts

- inspect current production blockers
- assign one publication role to one section or one contiguous section span
- clear an assigned role explicitly
- omit exact draft sections from produced artifacts without deleting manuscript text
- download Proof PDF / EPUB while blockers remain
- download Final PDF / EPUB only after production preflight is clean

## Browser witness

Real HPB-04 branch code was served locally at 3114. Only member-data API responses were intercepted with synthetic Hallmark-shaped data; the page, BookProductionPanel, layout, copy, controls, and scrolling were the real branch implementation.

Desktop 1440×1000:
- front-matter viewport 518 px; content 1197 px
- independent scroll verified 0 → 260
- document width remained 1440 px; no horizontal overflow
- Proof PDF enabled
- Final PDF disabled while blockers remained

Mobile 390×844:
- front-matter viewport 518 px; content 1258 px
- independent scroll verified 0 → 260
- document width remained 390 px; no horizontal overflow
- Proof PDF enabled
- Final PDF disabled while blockers remained

Evidence images:
- `docs/design/contracts/screenshots/book-production-desktop.png`
- `docs/design/contracts/screenshots/book-production-mobile.png`

## Gates

- focused HPB-04 suites: 36 / 36 passed
- TypeScript no-regression: 229 vs baseline 239; zero regressions
- design canon: green with one Book Production Experience Contract
- internal imports: green with existing warn-only debt
- backend imports: green
- no-Supabase: green
- blank-database reconstruction: green; all migrations applied cleanly and app schema gate satisfied
- `git diff --check`: clean

## Omit law

`omit` is a reversible production disposition. The assigned draft section remains visible in the Book Production workspace and remains manuscript text. It is excluded only from produced artifacts and from the Final preflight population. Clearing `omit` restores it to production without reconstructing or rewriting anything.

## Not authorized

This record does not authorize production deployment, migration application, automatic role assignment, legal-text repair, manuscript deletion, KDP upload, or designation of Elemental Alchemy as Final. Cover-art custody is a successor production slice, not part of HPB-04.
