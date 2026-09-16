# WS-HALLMARK-INTEGRATION-01 — Canonical Integration Evidence

**Date:** 2026-09-16
**Branch:** `feature/ws-hallmark-integration-20260916`
**Canonical base:** `93b2000f1cfa` (`clean-main-no-secrets` at integration opening)
**Purpose:** carry the sealed Writer’s Studio rebuild, Develop workbench, review continuity, and HPB-01 book-production authority onto the current clean canonical tree without importing unrelated old-branch ancestry.

## Integration law

The old feature branch was not merged wholesale. Its merge base predated current canonical work and would have carried unrelated continuity history. A fresh branch was opened from `clean-main-no-secrets`, and only the Writer’s Studio dependency chain was replayed.

Canonical wins where newer canonical behavior exists, unless the Writer’s Studio capability explicitly requires an additive seam. Two conflicts were adjudicated:

- `lib/maia/canonical-turn/producerRegistry.ts`: canonical retained; conflict was non-semantic whitespace.
- `lib/manuscript/editorialRuntime/thread.ts`: canonical projected-body correctness retained; the exact selection-range opening door was added on top.
- `HomeView.tsx`: canonical first-writer Begin reachability retained while the shared module-scoped `BeginAndImport` immersive composition was integrated. The canonical regression test was updated to assert the behavior rather than the superseded local variable name.

## Acceptance evidence

Writer’s Studio / Hallmark population on the integrated tree:

- **73 suites passed**
- **1,183 tests passed**
- render-route ownership/provenance suite: **9/9 passed**
- TypeScript no-regression: **229 errors vs 239 baseline; 0 regressions**
- design canon: passed
- internal imports: passed with the repository’s existing warn-only unresolved aliases
- backend imports: passed
- no-Supabase gate: passed
- `git diff --check`: passed

Physical Hallmark smoke on the integrated tree:

- production profile: `hallmark-6x9-v1`
- PDF MediaBox: **432 × 648 pt = 6 × 9 in**
- Spectral Regular / SemiBold: embedded and subsetted
- guarded render completed; therefore Paged.js’s measured page box matched the requested physical dimensions
- smoke artifact deleted after inspection

## Stack comparison

Against the sealed stacked branch, Writer’s Studio behavior is equivalent. The integration intentionally retains newer canonical history outside the Studio lane. The substantive Writer’s Studio addition beyond the sealed stack is the canonical `WS-EMPTY-BEGIN-REACH-01` regression test, adapted to the shared `BeginAndImport` implementation.

## Migration rollback

This integration contains two unapplied migrations. Merge does not itself authorize applying them.

For `20260916000001_writer_studio_chapter_review_runs.sql`:

```sql
DROP TABLE IF EXISTS writer_studio_chapter_review_runs;
```

This removes review-run manifests only; frozen developmental readings remain in their existing store.

For `20260916000002_manuscript_render_production_provenance.sql`, after reverting application code:

```sql
ALTER TABLE manuscript_renders
  DROP CONSTRAINT IF EXISTS manuscript_renders_source_authority_check,
  DROP COLUMN IF EXISTS source_revision,
  DROP COLUMN IF EXISTS source_authority,
  DROP COLUMN IF EXISTS production_profile;
```

This removes added production-provenance fields; existing render rows remain.

## Explicitly not authorized by this record

No production deployment, migration application, canonical copyright selection, legal-text rewrite, KDP upload, or final print-ready designation is authorized by this integration record.
