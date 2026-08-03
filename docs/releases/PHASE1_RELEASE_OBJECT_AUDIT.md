# Phase 1 — Release Object Audit

**Enumeration only. This document makes no deployment recommendation and constitutes no authorization.**

| | |
| --- | --- |
| Production SHA | `7c9dd5192` (2026-08-01 19:59 -0400) |
| Candidate SHA | `bfdf5512c` (2026-08-02 10:14 -0400) |
| Relationship | production **is** an ancestor of candidate (linear, no divergence) |
| Commits | 52 (20 non-merge) |
| Merged PRs | 12 |
| Files changed | 53 |
| Migrations | **1** |

The candidate SHA is pinned here. Canonical moved five times during the day this audit was written
(`fad4fe906` → `099de7aae` → `62eedcf5e` → `9e1611306` → `bfdf5512c`); any later movement produces a
**different release object** and invalidates this enumeration.

---

## 1. Merged PRs in the release object

| PR | Branch |
| --- | --- |
| #869 | `feature/writers-field-prose` |
| #870 | `chore/writers-studio-product-definition` |
| #871 | `fix/db-missing-table-propagates` |
| #872 | `chore/ignore-jest-cache` |
| #875 | `feature/start-writing` |
| #876 | `chore/writers-studio-phase1-charter` |
| #877 | `feature/member-workbench-keep-slice` |
| #878 | `feature/workbench-member-arrangement` |
| #879 | `chore/workbench-walk-probes` |
| #880 | `fix/blank-race-coverage-and-null-title` |
| #882 | `chore/member-field-directive` |
| #883 | `chore/project-reference-biography-record` |

**Observation:** the release object is broader than the Workbench. Four PRs (#870, #876, #882, #883)
are documentation/governance, one (#872) is tooling, one (#871) is a shared-library behavior change,
and the remainder split between the Workbench and the Writer's Field / blank-manuscript path.

---

## 2. Migrations

**One migration.** A quick `deploy-maia` rebuild runs **no** migrations (per `CLAUDE.md`); this
release object therefore cannot be delivered by that path without leaving schema and code out of step.

`database/migrations/20260802000001_manuscript_title_optional.sql`

- `member_manuscripts.title` — `DROP NOT NULL`
- replaces `member_manuscripts_title_check` with `member_manuscripts_title_not_blank`:
  `CHECK (title IS NULL OR length(trim(title)) > 0)`
- re-asserts `member_manuscripts_provenance_check`: `provenance IN ('member_uploaded','member_written')`
- adds column comments on `provenance` and `title`

Direction of change: **widening** (a previously required column becomes optional). Existing rows
remain valid. A rollback that restored `NOT NULL` would fail against any row written with a NULL
title after deployment.

---

## 3. API routes changed

| Route | Status |
| --- | --- |
| `app/api/book-studio/workbench/shelf/route.ts` | M |
| `app/api/book-studio/workbench/tables/route.ts` | M |
| `app/api/book-studio/workbench/tables/[id]/route.ts` | M |
| `app/api/sovereign/manuscripts/route.ts` | M |
| `app/api/sovereign/manuscripts/blank/route.ts` | **A** |
| `app/api/sovereign/manuscripts/blank/__tests__/route.test.ts` | A |
| `app/api/sovereign/manuscripts/[id]/render/route.ts` | M |
| `app/api/sovereign/manuscripts/[id]/render/__tests__/route.test.ts` | M |

One new route (`manuscripts/blank`). No route deleted.

---

## 4. Client components and pages changed

**New:** `app/maia/workbench/page.tsx` · `app/press/manuscript/WriterField.tsx` ·
`app/press/manuscript/__tests__/WriterField.dom.test.tsx` · `app/press/manuscript/__tests__/domSetup.ts`

**Modified:** `app/press/manuscript/WorkingDraftEditor.tsx` · `app/press/manuscript/page.tsx` ·
`app/press/studio/StudioShell.tsx` · `app/press/studio/page.tsx` · `app/press/studio/shellIdentity.ts` ·
`app/press/studio/useCurrentManuscript.ts` · `app/press/studio/__tests__/shellIdentity.test.ts`

**Workbench components (all modified):** `Card.tsx` · `Group.tsx` · `Room.tsx` · `Shelf.tsx` · `Table.tsx`

---

## 5. Library changes

**New:** `lib/workbench/access.ts` · `lib/workbench/arrange.ts` · `lib/workbench/sources/keep.ts` ·
`lib/manuscript/untitledExpression.ts` · four test files

**Modified:** `lib/db/postgres.ts` · `lib/workbench/sanctuary.ts` · `lib/workbench/sources/index.ts`

---

## 6. Security-sensitive changes

### 6.1 Access boundary widened — Workbench (#877)

Three routes moved from `requireFounder()` to `requireArranger()`:
`workbench/shelf`, `workbench/tables`, `workbench/tables/[id]`.

`requireArranger()` admits founder first (preserving the prior path), then any authenticated member,
scoped to their own `arranger_id` rows. This amends `WORKBENCH_ARCHITECTURE_v0.md` §8, which lists
"Founder-only" as a sovereignty invariant.

**Unchanged, still `requireFounder()`:** `drafts/from-group` and all three `workbench/uploads/*` routes.

New member surface reachable at `/maia/workbench`.

### 6.2 Shared-library behavior change — 42P01 (#871)

`lib/db/postgres.ts` previously translated Postgres `42P01` (undefined_table) into a **successful**
`{ rows: [], rowCount: 0 }`. That translation is removed; the error now propagates.

**Blast radius: 709 files import `@/lib/db/postgres`.** This is the widest-reaching change in the
release object and is unrelated to the Workbench. Any caller that relied on the old behavior — a
query against a table not present in a given environment — changes from returning an empty result to
throwing. Callers with their own `catch` are unaffected in shape; callers without one now surface an
error where they previously surfaced emptiness.

Ruling and caller inventory: `docs/ops/DB_MISSING_TABLE_DEGRADATION_AUDIT_2026-08-01.md`.

### 6.3 Nullable title on a member-owned table (#880)

`member_manuscripts.title` becomes nullable; `app/api/sovereign/manuscripts/route.ts` widens its
type to `string | null`. Any consumer that assumed a non-null title is affected.

---

## 7. Schema changes

Exactly one, described in §2. No new tables. No dropped columns. No index changes.

---

## 8. What this audit does not do

- It does not recommend deployment.
- It does not assess readiness, risk, or acceptance.
- It does not rule on whether the release object should be split.
- It does not constitute the Release Record.
