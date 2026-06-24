# Bug Pipe Convergence — Monitor canonical (2026-06-11)

**Status:** Decision support. No code changed by this doc. Awaiting Kelly's go on the action plan.

**Principle (proposed):** *Bugs go to Monitor. General feedback may remain separate only if it is not operational bug triage.*

---

## The three live intake destinations today (the split to kill)

1. `components/bugs/BugReportButton.tsx` → `POST /api/bugs` → `bug_reports` → **#bugs Co-Lab mirror** → `/admin/monitor` — **CANONICAL, merged** (PRs #386, #422, #424).
2. `components/feedback/FeedbackSheet.tsx` "Report a Problem" → `POST /api/feedback` → `platform_feedback` → email `problem@soullab.life` + SMS — **legacy/general**.
3. `components/beta/BetaTesterHub.tsx` "Report a Bug" tile → `mailto:beta@soullab.life` — **disconnected**.

Plus the **open, unmerged** #423: `/admin/maia/feedback` triage board over `platform_feedback` — a *second* bug/feedback board.

---

## Capability diff — Monitor vs #423

| Capability | Monitor (`bug_reports`) | #423 (`platform_feedback`) |
|---|---|---|
| Ship state | merged / live | open / unmerged |
| Intake sources | member · claude · system | member only |
| #bugs Co-Lab mirror | yes | no |
| Severity | low/normal/high/critical | none |
| Status states | new · seen · resolved · wont_fix (4) | new→triaged→planned→active→fixed→verified→closed (7) |
| Screenshots | vault + serve + channel summary | vault + serve + email attach |
| Owner assignment | **no** | `assigned_owner` |
| PR link | **no** | `linked_pr` |
| Reviewed/released marker | no (only `resolved_at`) | `reviewed_at` / `reviewed_by` |
| Admin note | `adminNote` | `notes` |
| Route / browser / reporter capture | yes | yes |
| UI shape | list + filter + search + detail | Kanban column board + filter/search/detail modal |
| Non-bug categories | none (bugs only) | 5 (problem/challenge/strength/feature/question) |

Monitor PATCH (`/api/admin/monitor/bugs/[id]`) accepts only `status · severity · adminNote` — confirming owner / PR / reviewed are real gaps.

---

## Verdict

- **Monitor (`bug_reports` / `/api/bugs` / `/admin/monitor`) is canonical.** Keep.
- **#423 does not merge.** It is a duplicate table + board for the same operational job (the exact "where did that report go?" failure mode the intake doctrine forbids).

### Extract from #423 → Monitor Phase 2 (genuine gaps)
- `owner` (assignee) column + PATCH field.
- `pr_url` column + PATCH field.
- A **released/verified** terminal state (supports "New → Reviewing → Fixed → Released") — or a separate `reviewed`/`released` marker orthogonal to status.
- *(Optional, UX)* #423's Kanban column board as a `/admin/monitor` view — Monitor is a list today. Donor code: `app/admin/maia/feedback/page.tsx` (columns, detail modal, category/severity coloring, filters/search).

### Discard as pure duplication
- `platform_feedback`-for-bugs as a table; #423's list/CRUD; #423's vault wiring (Monitor has `lib/bugs/attachments` + its own serve route).

### Decide separately (non-bug feedback)
- `platform_feedback` / `/api/feedback` carries love/feature/question/challenge too. Either (a) keep it **only** for non-bug feedback, or (b) retire it entirely and fold "feature/idea" into Monitor or a future surface. Not operational bug triage either way.

---

## Action plan (pending Kelly's go — nothing executed yet)

1. **Confirm principle** above.
2. **Close #423** (do not merge) — or relabel its branch as the donor for Monitor Phase 2.
3. **Monitor Phase 2** (new branch off clean-main): add `owner` + `pr_url` + released-state to `bug_reports` + PATCH + `/admin/monitor` UI; optionally port the board view.
4. **Re-point bug intake** at `/api/bugs`:
   - `FeedbackSheet` "Report a Problem" → submit to `/api/bugs` (map to `bug_reports`), or remove the "problem" category from FeedbackSheet entirely.
   - `BetaTesterHub` "Report a Bug" tile → `BugReportButton` / `/api/bugs` (kill the `mailto`).
5. **`/api/feedback`** → keep for non-bug feedback only, or retire (decision (b) above).

## Note on #421
`#421` (image attachments in Co-Lab **chat messages**) is unrelated to bugs and stands on its own — not affected by this convergence.
