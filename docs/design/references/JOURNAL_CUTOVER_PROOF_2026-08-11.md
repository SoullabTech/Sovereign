# Journal Cutover — Proof

**Date:** 2026-08-11 · Frozen candidate `250d08714` · Cutover branch `feature/journal-cutover`
from `origin/clean-main-no-secrets` (base `ef7319ea8`).

## ⚠️ First attempt void — recorded for completeness

The first proof run targeted a preview server matched by name collision to a
**different lane's** worktree (`.claude/launch.json` entry `journal-cutover`,
pre-existing, pointing at `/private/tmp/.../scratchpad/cutover`). `lsof` confirmed the
served process's `cwd` did not belong to this lane before any result was reported.
Full incident: `docs/ops/PREVIEW_NAME_COLLISION_INCIDENT_2026-08-11.md`. That run's
`preview_stop` also killed the other lane's live process — recorded there, not here.

The void run's one side-effect (a kept entry, written via the shared Postgres
regardless of which frontend served the request) was removed along with the rest of
the fixture in final cleanup. **All proof below is from the redone, correctly-scoped
run** against `journal-cutover-closure-lane` (port 3477), `cwd` verified via `lsof`
before treating any result as evidence.

## Fixture

`journal.cutover.ef7319ea8.4b157a` — created solely for this proof, 0 rows before,
seeded with 3 entries (anniversary + 2 corpus-floor), retired immediately after
(5 rows / 2 capsules → all deleted, confirmed 0 rows remaining).

## Proof — every item from cutover unit §5

| Item | Result |
|---|---|
| `GET /journal` → accepted paper Journal | ✅ ivory field `rgb(248,247,245)`, `h1` "What is here today?" |
| arrival → Begin writing → write → Keep this → reading | ✅ |
| leave → return → entry persists | ✅ confirmed on fresh page load after navigating away |
| Browse | ✅ writing default |
| Search | ✅ "3 things here", literal substring match |
| Captures / Scribe / Changes / Decisions | ✅ all reachable, correctly empty for a new member |
| Reflect with MAIA — owned entry | ✅ live `MAIA NOTICED` / `MAIA ASKED` rendered |
| Reflect with MAIA — unauthorized access | ✅ `404 "Entry not found"` — same response whether absent or foreign, no ownership leak |
| Return — deterministic calendar selection | ✅ anniversary rule fired on the seeded entry |
| `Why this?` states literal selection account | ✅ *"Selected by date only... Nothing about the content was measured — no relevance, theme, sentiment, or importance."* |
| Draft persistence | ✅ `localStorage` survives reload; confirmed by reloading, re-entering Writing, and reading the restored value (not by checking a textarea that doesn't exist on Arrival — first attempt at this check was a false negative from that mistake) |
| Journal Audio toast absent | ✅ suppressed on `/journal` |
| `/maia` Audio toast intact | ✅ still shown, confirming the House correction is Journal-scoped, not a regression elsewhere |

## Responsive + accessibility regression (§6)

| Viewport | Axis | Overflow | Contrast | Tap targets | Heading present |
|---|---|---|---|---|---|
| 375×812 | 24 | none | 0 fail | 0 fail | ✅ |
| 768×1024 | 112 | none | 0 fail | 0 fail | ✅ |
| 1280×800 | 368 | none | 0 fail | 0 fail | ✅ |
| 1280×800 @ 200% text | 96 | none | 0 fail | 0 fail | ✅ |

Reduced motion: not re-measured here — already verified in Slice 2 (app-wide
`prefers-reduced-motion` handling in `globals.css` plus the room's own
`motion-reduce:` variants), and this cutover touches no motion-related code.

## Tests (§7)

```
npx jest --config jest.config.js lib/navigation lib/journal lib/mobile
Test Suites: 6 passed, 6 total
Tests:       105 passed, 105 total
```

Includes `journalReachability.test.ts`, updated in this cutover to assert the new
shape (`/journal` renders `JournalRoom`, not `UnifiedJournalView`) — see that file's
own inline documentation for the reasoning. `UnifiedJournalView` remains untouched
and still backs `/labtools/journal`.

## Typecheck (§7)

```
npm run typecheck
program files : 4033 (baseline 3965)
errors        : 231 (baseline 239)
✅ No TypeScript regressions.  (8 fewer than baseline)
```

## Data sovereignty (§8)

No data loss, unauthorized exposure, broken deletion semantics, or provenance
collapse encountered. The general shared-local-database custody defect
(`docs/ops/SHARED_LOCAL_DATABASE_CUSTODY_RACE_2026-08-11.md`) and the preview-name
collision (`docs/ops/PREVIEW_NAME_COLLISION_INCIDENT_2026-08-11.md`) are recorded and
deferred, not solved here, per explicit instruction.

## Result

**PASS.** Every proof item and every regression check succeeds. Cutover branch ready
for PR.
