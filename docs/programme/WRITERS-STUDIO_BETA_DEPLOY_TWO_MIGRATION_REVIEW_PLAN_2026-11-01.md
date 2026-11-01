# Writer's Studio beta deploy · Exact Three-Migration Review Plan (2026-11-01)

```
PURPOSE:   Review-Custody plan for the three production-pending migrations carried by the
           founder-authorized deploy of canonical (founder, 2026-11-01: "Yes, after they
           merge"; "Yes, run the review"; revision 5: "Yes, plan for three").
FILENAME:  The file keeps its revision-1 name ("TWO_MIGRATION") so its custody path does
           not move; the title and content govern.
OLD READER: d49dbc98df5d448a05e13a7df21180c3bde304c6 (live production reader, read 2026-11-01)
NOT:       Authority to deploy, to apply any migration, or to change production.
           Custody states that a review is bound and still applies; it never states that a
           migration is correct.
```

## Exact target relation

The deployment target is supplied externally by the Review-Custody harness and is never
self-identified by a commit SHA embedded in this document. The target must contain this
plan.

The reviewer must establish the exact target relation from immutable git bytes. Any
application, migration, dependency, deploy-script or governance movement after review
invalidates applicability and requires a new review.

## Exact production-pending set

A read-only comparison of production `schema_migrations.filename` with the target's
migration files (2026-11-01, against canonical `335774d53`) found exactly these three
absent, in this order. The deploy lane rederives the pending set immediately before
mutation.

1. `database/migrations/20261002000002_writer_studio_chapter_overview_lens.sql`
   SHA-256 `d45c56cfc84089f758b477430e8912cd864a549c1129a34ab789d2a1f95afaba`
2. `database/migrations/20261030000001_house_pro_studio_catalog.sql`
   SHA-256 `61f1d0744aeaccdd9ffd82baf67e65584534f07f5dfa37c1d0fd429803fa38c1`
3. `database/migrations/20261101000001_writer_studio_journey.sql`
   SHA-256 `0aabe7c9c592efdc8fed196ec76698a8baf0f07071d3b74ec5d300a8eaf8e827`

Any addition, removal, reorder, byte movement, live-reader movement or target movement
refuses this review.

Migration 2 belongs to the House / Pro Studio lane (HOUSE-PRO-STUDIO-01). Migration 3
belongs to WRITERS-STUDIO-SEMANTIC-FIELD-01 (tester journey field, PR #2033), which merged
to canonical after revision 4 was written; no canonical commit carries revision 4's
rollback guard without it. Including both is the founder's decision; this review assesses
only their compatibility.

Production facts for migration 3 (read-only, 2026-11-01, PostgreSQL 16.13):
`writer_studio_journey_answers` and `writer_studio_journey_answers_guard()` do not exist;
`members.id`, `member_manuscripts.id` and `team_messages.id` are all `uuid`;
`gen_random_uuid()` is available. Row counts: `members` 94, `member_manuscripts` 24,
`team_messages` 1.

## Deployment ordering

The target's `scripts/deploy-production.sh` runs the review gate after the exact image is
built and provenance-verified, then migrations, then the candidate swap. A migration
failure therefore leaves the old reader live. The reviewer must confirm this ordering from
the target script rather than from this paragraph.

## Independent review questions

The reviewer must independently establish or reject each of the following:

1. Migration 1's replacement `developmental_readings_commissioned_lens_check` admits every
   lens value the exact old reader can write, and every value present under the previous
   constraint, so it cannot reject an old-reader-valid row or fail on existing rows.
2. Migration 1's replacement `developmental_readings_observations_check()` trigger function
   admits every observation shape the exact old reader writes, including the four-field
   canonical identity group, and refuses nothing the previous function accepted.
3. Migration 2's replacement `house_member_preferences_center_ids_check` and
   `house_member_preferences_shortcut_ids_*` constraints admit every value the exact old
   reader can write and every value valid under the previous constraints.
3a. Migration 3 is purely additive: it creates `writer_studio_journey_answers`, its two
   indexes, its guard function and trigger, and alters, drops or rewrites nothing that
   exists. The exact old reader never reads or writes that table, so its presence (empty
   or not) cannot change old-reader behaviour.
4. All three migrations are each one transaction with `SET LOCAL lock_timeout = '5s'`; a
   lock timeout or any failure rolls the file back and leaves the schema at the prior
   compatible prefix.
5. The target reader is compatible with the final schema: it writes the `overview` lens,
   the `pro-studio` catalog id and journey answers only after the migrations admit them,
   and its journey writes satisfy the table's constraints and append-only trigger.
6. Reader rollback to `d49dbc98d…` is lawful under the conditions in "Reader rollback"
   below: the schema needs no down-migration, and data the target reader writes is handled
   by the guard and repair files, whose order the target's `rollback` command enforces. The
   reviewer establishes whether those conditions are sufficient, including whether the
   guard runs before any tag moves and refuses on failure, and whether the exact old reader
   tolerates stored `overview` readings in every path that loads or displays them. Journey
   answers written by the target reader stay in place on rollback, unread by the old
   reader; they need no guard, and the reviewer establishes whether that is so.
7. DDL lock and constraint-validation risk is acceptable for the observed table sizes, or
   is recorded as a finding: ACCESS EXCLUSIVE on `developmental_readings` and
   `house_member_preferences` during constraint replacement (migrations 1 and 2), and the
   brief SHARE ROW EXCLUSIVE locks migration 3's foreign keys take on `members`,
   `member_manuscripts` and `team_messages`.

## Reader rollback (revision 6)

History, kept: revision 1's review (session `0d88896e-…`) returned `REVISE` because rolling
back to `d49dbc98d…` is lawful for the schema but not unconditionally for data. Revision 2
added a check and repair for `pro-studio`; its review (session `a549010d-…`) returned
`REVISE` because the check matched one id only, an emptied Center would silently show no
places, and the procedure had no enforced order. Revision 3 widened the check to every rule
the old parser enforces and wrote the order down as a manual procedure; its review (session
`943b6013-…`) returned `REVISE` on three findings: thirteen old-reader consumers of stored
readings were not read (F1), the rollback command did not enforce the order and the deploy
script's own recovery message pointed at a bare rollback (F2), and the repair rewrote a valid,
explicitly empty Center to `NULL` when only the row's shortcuts failed (F3). Revision 4
answers all three (it was merged, never reviewed; revision 5 only adds migration 3 and
leaves this section's mechanism unchanged):

- **F1**: the thirteen files are added to "Minimum physical Reads" below.
- **F2**: `scripts/deploy-production.sh rollback` now enforces the order itself (below).
- **F3**: the repair rewrites only the array that fails, so a valid empty Center is kept.

Revision 5's review (session `0e7849ba-…`, target `7f86e1cef`) found all three migrations
`COMPATIBLE` at every prefix and confirmed the guard behaves as described, and returned
`REVISE` on five findings. Revision 6 answers them:

- **F1 (medium)**: the account of stored `overview` readings was wrong in part (the old
  Develop room shows one, and the old Ask writes conversation rows about one). It is
  rewritten consumer by consumer below, with the visible cost named.
- **F2 (medium)**: large old-reader files were only partly read. "Minimum physical Reads"
  now requires them to be read to the end in chunks, and adds the consumers the review
  could not reach.
- **F3 (low)**: rollback now refuses, instead of skipping the guard, when guards exist but
  the restored image's commit cannot be resolved (override: `ROLLBACK_UNKNOWN_COMMIT_ACK=1`).
- **F4 (low)**: after `docker stop`, rollback confirms the reader is not running and refuses
  before the check if it still is.
- **F5 (low)**: the rollback test now also asserts the exact `psql` flags.

**What the old reader rejects.** The exact old reader's `parseIds`
(`lib/house/preferences.ts`) throws on a `center_ids` or `shortcut_ids` array that is longer
than its limit (5 and 18), holds an id outside its 18-id catalog, or holds a duplicate. The
check tests exactly those rules, for every row however it was written.

The old reader's 18 ids:
`writing, relationships, practices, community, studio, decisions, astrology, journal, dream,
reflections, ideas, changes, wisdom, library, divination, living-field, co-lab, anchor`.

**Check and repair, as files.** Both now live at the target, beside the deploy script, keyed
by the full old-reader commit:

- `scripts/rollback-guards/d49dbc98df5d448a05e13a7df21180c3bde304c6.sql`: the read-only
  check. It prints one number, the count of rows the old reader would refuse.
- `scripts/rollback-guards/d49dbc98df5d448a05e13a7df21180c3bde304c6.repair.sql`: the repair,
  one transaction, touching only rows the check counts. In each such row it rewrites only
  the array that fails: unknown ids and duplicates are removed, order is kept, and the array
  is trimmed to the old limits. A Center that loses every place becomes `NULL` (the House
  default), so the member sees the default Center rather than an empty one. A valid array,
  including an explicitly empty Center `{}`, is left exactly as stored. It bumps `revision`
  and `updated_at` so a client holding the old revision sees the change. **A member's Pro
  Studio placement is lost on rollback**; that is the accepted cost of rolling the reader
  back.

**The rollback command enforces the order.** In the target's `cmd_rollback`:

1. It reads the commit of the image it is restoring (`maia-sovereign:previous`): the
   `git.commit` label if present, otherwise the image's baked `GIT_COMMIT`. Production
   images carry no `git.commit` label (read 2026-11-01), so the baked `GIT_COMMIT` (a short
   SHA, `d49dbc98d`) is what resolves; it is matched as a prefix of the guard file's name.
   After this deploy, `:previous` is the `d49dbc98d…` image (read 2026-11-01: it is the
   live `:current` today, and the deploy moves `:current` to `:previous`).
   If guard files exist but neither source resolves to a hex SHA of at least 7 characters,
   it refuses (no stop, no tag move) unless `ROLLBACK_UNKNOWN_COMMIT_ACK=1` is set (F3).
2. If a guard file exists for that commit, it stops `maia-sovereign` first, so the target
   reader can write nothing more. If `docker inspect` still reports it running, it refuses
   before the check (F4). Otherwise it runs the check through
   `docker exec -i maia-postgres psql -U soullab -d maia_consciousness -v ON_ERROR_STOP=1 -At`.
3. If the check prints anything other than `0`, or cannot run, it refuses: no image tag
   moves, the target reader stays stopped, the old reader is not started, and it prints the
   repair command to run before trying again. It never runs the repair itself.
4. Otherwise it swaps the tags and recreates the reader as before, then runs the check again
   once the old reader is healthy; anything other than `0` fails the rollback loudly.

A rollback to a commit with no guard file behaves exactly as before. The deploy script's two
post-swap recovery messages now say that rollback runs this guard.

Members see a short outage between the stop and the old reader starting; that is accepted.

Witness (2026-11-01):

- Production, read-only (`default_transaction_read_only = on`): the guard file returned `0`.
- Local disposable database: inside one transaction rolled back at the end, a temporary
  table shadowing `house_member_preferences` held six rows. The guard counted 4. The repair
  updated those 4, and the guard then returned 0. A Center of only `pro-studio` became
  `NULL`. `{writing, pro-studio, writing}` became `{writing}`. A 19-id shortcut list became
  the old 18. An explicitly empty Center `{}`, in a row failing only on shortcuts, stayed
  `{}` (F3). A `NULL` Center stayed `NULL`. A valid row was not touched (`revision`
  unchanged).
- `scripts/verify-rollback-prod-alias-behavior.sh` (extended): passes against the target
  script, which shows three things:
  - with no guard, rollback behaves as before and does not touch Postgres;
  - with a guard, the reader is stopped and then checked before any tag moves, and the check
    re-runs after the swap;
  - a failing or unreadable check moves no tag and leaves the old reader unstarted;
  - (revision 6) the check runs with the exact `psql` flags; a reader still running after
    the stop is refused before the check; an unresolvable previous commit refuses while
    guards exist, and proceeds only with `ROLLBACK_UNKNOWN_COMMIT_ACK=1`.
  19 passes. The test fails against the revision-5 script.
- `npm run verify:deploy-provenance` 28/0, `verify:deploy-lock` 25/0,
  `verify:deploy-tag-rollback-point` 5/0.

Stored `overview` readings are not repaired: they are the member's own frozen readings, and
deleting or rewriting them to suit an older app is not lawful. Whether every old-reader path
that loads or displays them tolerates them is plan question 6.

**"Tolerates" (revision 6, corrected).** No crash, no corruption or rewrite of any stored
reading, and no write the member did not invoke. A visible refusal, a raw or missing label,
and wrong-but-harmless explanatory text are acceptable rollback costs. A conversation row the
member creates by asking about a reading is a member-invoked write, not a change to the
reading, and is acceptable.

**Per consumer** (the author's reading of the old reader, a claim for the reviewer to test):

- `app/writers-studio/develop/DevelopRoom.tsx`: lists every summary and selects the newest,
  which may be an `overview` reading. `readingView()` (`lib/writersStudio/developPresentation.ts`)
  sets `lensMeaning = LENS_MEANING['overview']`, which is `undefined`, so the reading's
  meaning line reads "undefined." and the list's meaning suffix is empty (`?? ''`). The lens
  name renders as "overview". The only per-lens lookups are string lookups; none dereferences
  a property of the result, so nothing throws. **Accepted cost: wrong explanatory text.**
- `app/api/sovereign/manuscripts/[id]/ask/route.ts`, `review-discuss/route.ts`,
  `lib/manuscript/ask/*` (`developmentalContext.ts`, `developmentalAnchor.ts`,
  `frozenDevelopmentalReading.ts`, `developmentalAskReader.ts`, `threadStore.ts`): none
  validates the lens; the reader prompt names it as a string. Asking about an `overview`
  observation works and writes the usual member-invoked conversation, authorization and
  disclosure rows. The stored reading is not changed.
- `readings/[readingId]/standings/route.ts`, `ObservationDialogue.tsx`, `InsightReadings.tsx`:
  do not reference the lens.
- `chapter-reviews/route.ts`: refuses a manifest naming an `overview` reading with
  `reading_scope_mismatch` (409). The target never writes one: its chapter-review lenses are
  the seven `REVIEW_DEVELOPMENTAL_LENSES` (all lenses except `overview` and `themes`), which
  equal the old reader's seven (all except `themes`). So target-written manifests rehydrate
  in the old reader (`lib/writersStudio/rebuild/chapterReview.ts` fetches by id and does not
  count lenses).
- `lib/writersStudio/studio/realReview.ts`: its payload guard returns false for `overview`
  (unpresentable, a refusal). `wholeReview.ts` / `wholeManuscriptReview.ts`: iterate the old
  lens order and never select an `overview` reading.
- Orientation, lineage and attention-map routes: iterate the old lens list; an `overview` row
  is ignored.
- `app/writers-studio/rebuild/ReviewChooser.tsx`: labels it with its raw id.
- `app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx` (old): `summaryLens()` keeps a
  lens that is in `DEVELOP_FIELDS` (`P4R1DevelopView.tsx`), whose first entry is already
  `'overview'`, and returns `null` for any other; no throw.

No database constraint outside `developmental_readings` is keyed to the lens vocabulary.

Observed production sizes (read-only, 2026-11-01): `developmental_readings` 25 rows,
`house_member_preferences` 3 rows, rows the old reader would refuse 0.

A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into approval to
complete the deployment.

## Minimum physical Reads

The independent reviewer must physically Read, at minimum, every file below **to its last
line**. A file too large for one Read is read in successive chunks (Read with `offset` and
`limit`) until the end; a partly read file counts as unread (revision 5's F2). The large
ones include old `app/writers-studio/develop/DevelopRoom.tsx`,
`app/writers-studio/rebuild/RebuildStudioClient.tsx` and
`app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx`.

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- all three pending migration files;
- `scripts/deploy-production.sh`;
- `scripts/run-sql-migrations.sh`;
- target `lib/manuscript/developmentalReading/store.ts`;
- target `lib/manuscript/developmentalReader/contract.ts`;
- target `lib/house/catalog.ts`;
- target `lib/house/preferencesStore.ts`;
- exact old-reader `lib/manuscript/developmentalReading/store.ts`;
- exact old-reader `lib/manuscript/developmentalReader/contract.ts`;
- exact old-reader `lib/house/catalog.ts`;
- exact old-reader `lib/house/preferencesStore.ts`;
- exact old-reader `database/migrations/20260926000002_writer_studio_work_themes.sql`
  (the previous lens constraint and observation trigger);
- exact old-reader `database/migrations/20260927000001_house_dream_catalog.sql`
  (the previous House constraints);
- exact old-reader `lib/house/preferences.ts` and `app/api/house/preferences/route.ts`
  (how stored House ids are parsed);
- exact old-reader `app/api/sovereign/manuscripts/[id]/readings/route.ts`,
  `app/api/sovereign/manuscripts/[id]/readings/[readingId]/route.ts`,
  `app/api/sovereign/manuscripts/[id]/attention-map/route.ts`,
  `lib/writersStudio/develop/liveLens.ts` and `lib/writersStudio/developClient.ts`
  (where stored readings are loaded and displayed);
- exact old-reader `app/writers-studio/develop/DevelopRoom.tsx`,
  `app/writers-studio/full-redesign/DevelopRoom.tsx`,
  `app/writers-studio/rebuild/RebuildStudioClient.tsx`,
  `app/writers-studio/rebuild/liveReview.ts`,
  `lib/manuscript/developmentalReading/assess.ts` and
  `app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx` (further reading consumers);
- exact old-reader consumers of stored readings named by revision 3's review (F1):
  `app/api/sovereign/manuscripts/[id]/ask/route.ts`,
  `lib/manuscript/ask/developmentalContext.ts`, `lib/manuscript/ask/threadStore.ts`,
  `app/api/sovereign/manuscripts/[id]/review-discuss/route.ts`,
  `app/api/sovereign/manuscripts/[id]/chapter-reviews/route.ts`,
  `app/api/sovereign/manuscripts/[id]/developmental-orientation/route.ts`,
  `app/api/sovereign/manuscripts/[id]/lineage-orientation/route.ts`,
  `app/api/sovereign/manuscripts/[id]/lineage-chapter/route.ts`,
  `lib/writersStudio/studio/realReview.ts`, `lib/writersStudio/studio/wholeReview.ts`,
  `lib/writersStudio/studio/wholeManuscriptReview.ts`,
  `app/writers-studio/rebuild/ReviewChooser.tsx` and
  `app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx`;
- exact old-reader consumers revision 5's review could not reach (F2):
  `app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx` (old, in full),
  `lib/writersStudio/rebuild/chapterReview.ts`, `lib/writersStudio/developPresentation.ts`,
  `lib/manuscript/ask/developmentalAnchor.ts`, `lib/manuscript/ask/frozenDevelopmentalReading.ts`,
  `lib/manuscript/ask/developmentalAskReader.ts`,
  `app/api/sovereign/manuscripts/[id]/readings/[readingId]/standings/route.ts`,
  `app/writers-studio/develop/ObservationDialogue.tsx` and
  `app/writers-studio/insight/InsightReadings.tsx`;
- target `scripts/rollback-guards/d49dbc98df5d448a05e13a7df21180c3bde304c6.sql` and
  `.repair.sql`, and target `scripts/verify-rollback-prod-alias-behavior.sh`;
- target `lib/house/preferences.ts` (the target parser), and target
  `app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx` and
  `app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx` (where the target requests an
  `overview` reading);
- target `lib/writersStudio/journeyServer.ts` (the only target code that writes
  `writer_studio_journey_answers`) and target `scripts/verify-constitution-colab.ts`
  (the post-deploy Co-Lab gate, which also checks that table).

The old-reader paths live beneath `old-reader/<exact-old-reader-SHA>/...` in the
compatibility review bundle. Search may scope discovery but does not witness coverage. If a
question needs another file, the reviewer Reads it and lists it in coverage.

## Required review JSON

The review must carry the ordinary Review-Custody fields:

- `verdict`: `APPROVED | REVISE | BLOCKED`;
- exact `plan_sha256`;
- stable `trace_id` equal to the reviewer session identity;
- non-empty `reviewer`, `summary`, `findings`, `coverage.files`, and explicit
  `limitations`.

It must additionally carry `migration_compatibility` with:

- `instrument = migration-compatibility/v1`;
- verdict `COMPATIBLE` or `INCOMPATIBLE`;
- exact full old-reader commit;
- exact full target-reader commit;
- the exact three ordered pending migration paths and SHA-256 values;
- physically witnessed old-reader evidence with repo path, SHA-256 and exact trace path;
- non-empty rationale and explicit limitations;
- `failure_prefix_compatibility.instrument = migration-prefix-compatibility/v1`;
- verdict `ALL_PREFIXES_COMPATIBLE` only if prefixes 1, 2 and 3 are each established;
- exactly three prefix entries, each bound to its ending migration, with rationale and
  explicit limitations.

The production gate recomputes target migration hashes and old-reader evidence from git
objects. Self-reported hashes do not establish compatibility.

## Closing condition

The plan closes when an independent, physically witnessed review of exactly these three
migrations is admitted against the exact target, or when the review returns `REVISE` or
`BLOCKED` and the deploy is held.
