# Writer's Studio beta deploy · Production witness (2026-11-01)

```
DEPLOYED:  3dd8dd2875769322d3eb6748e48c9f4a2a51f1c4 (canonical, after #2037)
OLD READER: d49dbc98df5d448a05e13a7df21180c3bde304c6 (now maia-sovereign:previous)
PLAN:      docs/programme/WRITERS-STUDIO_BETA_DEPLOY_TWO_MIGRATION_REVIEW_PLAN_2026-11-01.md
           revision 6, SHA-256 7ff3b3091ac88a3d6e799f83ec97c405e8579ee6570ca018caf0fccb051992f3
STANDING:  deployed and verified by its operator; not yet walked in a browser.
```

The plan is left byte-for-byte as reviewed, because the admitted review is bound to its
SHA-256. Corrections to it are recorded here (§4), not edited into it.

## 1. Review custody

- Independent reviewer: a separate `claude -p` process, Read/Grep/Glob only, session
  `fdad71f0-0019-4940-b616-738e75b09995`, 82 Read events, run from the compatibility bundle
  for `3dd8dd287`.
- Verdict **APPROVED**; migration compatibility **COMPATIBLE**; failure prefixes
  **ALL_PREFIXES_COMPATIBLE**; findings high 0 · medium 0 · low 6.
- Admitted 2026-11-01T20:05:19Z. Coverage witness: 66 attested files each carry a read event.
  `admit` was run with `--repo-root` set to the bundle root, because that is where the reviewer
  read; run from the target worktree it refused all 66 (a path-root mismatch, not a missing
  read).
- History: revisions 1–5 each returned REVISE (sessions `0d88896e`, `a549010d`, `943b6013`,
  `0e7849ba`; revision 4 was merged unreviewed). No REVISE was converted into approval.

## 2. Deploy

Run on minisforum through `scripts/deploy-production.sh deploy 3dd8dd287…` with
`REVIEW_CUSTODY_RECORD/REVIEW/TRACE` set; full log
`~/review-custody-3dd8dd2/deploy-20261101T200622Z.log` on minisforum, captured from its first
line. Exit 0.

Before it, the shared checkout's `scripts/deploy-production.sh` and
`scripts/rollback-guards/` were brought to the target versions (the other deploy helpers
already matched). The checkout's live `Caddyfile`, `docker-compose.production.yml` and
`scripts/backup-postgres.sh` edits were not touched.

Witnessed in the log, in order: built-image provenance `GIT_COMMIT=3dd8dd287`; the review
gate ("Migration review custody + old-reader compatibility apply to the exact pending set");
old reader re-witnessed immediately before migration; migrations; swap; smoke tests.

## 3. Production state after the deploy (read 2026-11-01)

- Live: `GIT_COMMIT=3dd8dd287`, container created 20:16:24Z, `DEPLOY_LANE=deploy-lane`.
- Tags: `current` and `prod` = `e89bfe621c65` (`3dd8dd287`); `previous` = `f4eb199e3b61`
  (`d49dbc98d`).
- Ledger: `20261002000002_writer_studio_chapter_overview_lens.sql` 20:14:18.920Z ·
  `20261030000001_house_pro_studio_catalog.sql` 20:14:18.995Z ·
  `20261101000001_writer_studio_journey.sql` 20:14:19.066Z, all before the swap.
- Smoke: health, version, ready, main page, build-status lock and constitutional verification
  PASS. WARN: `/api/build/alert` is unconfigured (no `INTERNAL_ALERT_TOKEN` on the deploy
  host), so deploy alerts are not delivered (already in `docs/ops/NON_DELIVERY_REGISTER.md`).
- Co-Lab release gate (`scripts/verify-constitution-colab.ts`, in the container):
  **32 passed · 0 failed · 0 warned**, including the new journey checks.
- Rollback data guard for `d49dbc98d`, read-only: **0** rows the old reader would refuse.
- `writer_studio_journey_answers`: 0 rows.

## 4. Corrections to plan revision 6 (the review's low findings)

- **F1.** The plan says the rollback test gives "19 passes". It gives **16**; the author
  miscounted when adding the revision-6 cases. The behaviours the plan lists are the ones
  covered.
- **F2.** Three imprecisions in the per-consumer account, none changing the "tolerates"
  verdict:
  - (a) In the old `DevelopRoom.tsx`, the header line (`${view.lensMeaning}.`) reads
    "undefined.", but the reading panel (`{view.lensMeaning}.` in JSX) renders only ".".
  - (b) The target's chapter-review lenses equal the old `wholeReview.ts` seven, but the old
    reader's full lens list has eight (with `themes`). The old chapter-reviews POST route and
    `RebuildStudioClient` use the eight, so a target-written seven-reading manifest still
    rehydrates by id, but old UI text counts toward eight.
  - (c) Old stored-reading consumers not on the reading list (`observationAddress.ts`,
    `standing/store.ts`, `insightCanvas.ts`, `InsightReading.tsx`, the themes modules and
    route) were checked by the reviewer by read or grep and do not branch on the lens.
- **F5.** The plan says the old reader's behaviour cannot change because it never touches the
  journey table. More exactly: it never reads or writes the table, but the table's foreign
  keys now act on the old reader's deletes. Deleting a member cascades to that member's
  answers; deleting a manuscript or Co-Lab message sets the reference to NULL. The reviewer
  traced these through the append-only trigger and the CHECK: they pass, and old-reader
  deletes are not blocked.

## 5. Follow-up changes in the same PR as this record

- **F3.** `cmd_rollback` now says plainly, in a comment and a log line, that a guard covers
  only the commit it is named for, and that a rollback to any other commit runs no data
  check.
- **F4.** When the guard refuses, its message now also gives `docker start maia-sovereign`
  for an operator who decides to keep the current release.
- **F6.** In `lib/writersStudio/journeyServer.ts`:
  - Sharing records the share only if the answer is still unshared and not withdrawn. If
    nothing is recorded (a double submit or a withdrawal in between) or recording fails, the
    Co-Lab copy just posted is soft-deleted again.
  - Two simultaneous revisions of one version now return `not_current` instead of a server
    error, without logging the writer's text.
  - The route already validated the share kind.

These follow-ups change no migration. They take effect on the next deploy.
