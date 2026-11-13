# Writer's Studio deploy 2026-11-13: review plan for the exact six pending migrations

**Date:** 2026-11-13
**Status:** BOUNDED INDEPENDENT REVIEW PLAN. NO DEPLOYMENT AUTHORITY BY ITSELF.
**Live old reader:** supplied by the harness through the bundle's
`MIGRATION_COMPATIBILITY_CONTEXT.json`, and deliberately not named here, because a plan that names a live
release goes stale when another lane deploys. The reviewer establishes the exact old reader from
the bundle, and the deploy lane re-witnesses it immediately before mutation.
**Founder authorization:**
- Ledger #1938, 2026-11-13 (College Essay controlled beta): Liam Kane's Writer's Studio access and the
  doorway invitation; PR #2267 (Work-wide "MAIA asks, never rewrites").
- In session the same day: "Deploy all 10", then "Yes, all five" for the first five migrations, then "Yes, include it" for the sixth
  (#2273, Writer's Studio MAIA usage meter); together, this exact six-migration pending set,
  which includes two migrations from the Writer's Studio Free lane (#2264/#2268).

The first deploy attempt (`deploy-production.sh deploy 5574be88fa`) built and verified image provenance,
then was refused by this gate before any mutation. This plan is the lawful route through it.

## Exact target relation

The harness supplies the deployment target. The target must contain this plan and the six migrations
below. The gate reads the plan from the target commit, so the target is the canonical merge commit of
the PR that adds the **Revision 2** section below. That PR also carries the F2 erasure fix. The target
must differ from its own first parent only by this file, `app/api/members/delete-account/route.ts` and
its test `app/api/members/delete-account/__tests__/route.test.ts`, and that first parent must add no
migration beyond the six below. Canonical moves often, so no fixed base is named here. The
reviewer establishes the exact relation from immutable git bytes where it can, and otherwise says so.
Any movement after review invalidates applicability.

## Exact production-pending set

In filename order, which is the order `scripts/run-sql-migrations.sh` applies:

1. `database/migrations/20261113000001_studio_doorway_invitations.sql`
   sha256 `41cb17c713cb724b1236b30a5b7e4f04bce983c08a8fcf6fc76bcd5a31e96220`
2. `database/migrations/20261113000002_writers_studio_beta_grant_events.sql`
   sha256 `7fc709d85ba32b46dda82bce86adaf7da882946363534b9b956cc9e388c77a74`
3. `database/migrations/20261113000003_living_work_maia_revisions_paused.sql`
   sha256 `92ed97505239ef4fa83a3de9cf07e78cb4d8a2f32882e3f59254ef74f3d9e2a1`
4. `database/migrations/20261113000003_writers_studio_pro_tastes.sql`
   sha256 `8dd410e08b9e2b25f2778c548d709b36e1e794e089f6d4b5fffd843c82b3fa2e`
5. `database/migrations/20261113000004_writers_studio_pro_requests.sql`
   sha256 `3b0a39c994c39598c56e56975ddc54ef6c026d3a798709c0ad72cc2daa831d23`
6. `database/migrations/20261113000005_writers_studio_maia_usage.sql`
   sha256 `06aa409d767544c2391754dce994ef48e1342adb96843e3f7e79a7a24d4e0d36`

Items 3 and 4 share the prefix `20261113000003`. The reviewer confirms that filename order is
deterministic and matches the order above, and that neither migration depends on the other.

Each of the six has a sibling `*_rollback.rollback` file in `database/migrations/`. Each file carries
its own `BEGIN … COMMIT` with `SET LOCAL lock_timeout = '5s'` first. Each commits independently, so a
failure can leave any prefix applied.

## What each migration does

**1. `studio_doorway_invitations`.** Creates `studio_doorway_invitations`, which holds hash-only invitation
codes and invited-email hashes. It has CHECKs on studio, hash shape, uses and the grant shape, and no foreign
key to `members`. It also creates `studio_doorway_redemptions`: FK `studio_doorway_invitations(id)` with no
ON DELETE (so RESTRICT), FK `members(id)` ON DELETE CASCADE, UNIQUE `member_id`, and one index.

**2. `writers_studio_beta_grant_events`.** Creates an append-only grant/extend/revoke log: FK `members(id)`
ON DELETE CASCADE, an expiry-shape CHECK and an index. A BEFORE UPDATE OR DELETE trigger refuses every
UPDATE, and refuses DELETE while the member row still exists. A BEFORE TRUNCATE trigger refuses truncation.

**3. `living_work_maia_revisions_paused`.** Adds `maia_revisions_paused boolean NOT NULL DEFAULT false` to
the existing table `living_works`. It is a constant default, with no backfill statement.

**4. `writers_studio_pro_tastes`.** Creates one row per member (PK `member_id`, FK `members` ON DELETE CASCADE)
with a one-outcome CHECK. It is read only when `WS_PRO_TASTE_ENABLED=true`.

**5. `writers_studio_pro_requests`.** Creates `writers_studio_pro_requests` (FK `members` ON DELETE CASCADE,
note length CHECK) and a partial unique index on open requests. It is read only when `WS_PRO_ASK_ENABLED=true`.

**6. `writers_studio_maia_usage`.** Creates an append-only usage log of MAIA acts: FK `members` ON DELETE CASCADE,
CHECKs on act name, token counts and model, and an index on `(member_id, occurred_at DESC)`. It is written by
`lib/writersStudio/maiaMeter.ts` only when the meter mode is exactly `shadow`, and it never refuses an act.

## Production facts supplied to the reviewer

Read-only: counts and schema only, taken 2026-11-13 under `BEGIN READ ONLY`. No member content.

- PostgreSQL `16.13`. `gen_random_uuid()` is available.
- None of `studio_doorway_invitations`, `studio_doorway_redemptions`, `writers_studio_beta_grant_events`,
  `writers_studio_pro_tastes` or `writers_studio_pro_requests` exists.
- `living_works.maia_revisions_paused` does not exist.
- `living_works` has 26 rows and one non-internal trigger, `r20_refuse_writer_tombstoned`.
- `members` exists and has 94 rows.
- Ledger (`schema_migrations`): the newest applied migration is `20261111000002_editorial_pass_runs.sql`.
  No `20261113…` migration is recorded.

## Deployment ordering (as implemented in `scripts/deploy-production.sh`)

1. Exact target materialization.
2. Build, and pre-swap image provenance.
3. Admitted migration review, compatibility, and all-prefix compatibility.
4. Exact pending-set re-witness.
5. Exact old-reader re-witness.
6. Migrations, in the order above, **while the old reader is live**.
7. Rollback tags and candidate swap.
8. Running provenance, health and smoke tests.

A failed migration must leave the candidate unswapped and the old reader live.

## Independent review questions

1. **Additive.** Establish that no migration drops, rewrites or backfills existing data. The only change
   to an existing table is the `living_works` column. Establish whether, on PostgreSQL 16, a constant
   `DEFAULT false` with `NOT NULL` avoids a table rewrite, and whether the existing trigger is affected.
2. **Lock-timeout law.** Each migration sets `lock_timeout` inside its transaction before any DDL.
   `ALTER TABLE living_works` takes an ACCESS EXCLUSIVE lock. The new FKs to `members` take
   SHARE ROW EXCLUSIVE on `members`. Judge the lock risk at 26 and 94 rows.
3. **Old reader and `living_works`.** The exact old reader's INSERTs into `living_works` name their columns,
   and its reads do not break on an extra NOT NULL DEFAULT column. Read the old-reader files named below.
   Search may scope the work, but read the files you rely on.
4. **Old reader's member deletion.** The old reader deletes a member with `DELETE FROM members` in
   `app/api/members/delete-account/route.ts`. Judge whether that still succeeds for a member who has rows
   in any new table:
   - in particular, whether the `writers_studio_beta_grant_events` BEFORE DELETE guard ("refuses DELETE
     while the member row still exists") permits the ON DELETE CASCADE row removal that the member delete
     triggers;
   - and whether `studio_doorway_redemptions` CASCADE then still holds under its RESTRICT FK to invitations.

   Between migration and swap, all new tables are empty. Also judge the window after swap.
5. **Prefix compatibility.** Prefixes 1, 1–2, 1–3, 1–4, 1–5 and 1–6 are each compatible with the exact old reader
   still being live.
6. **Target reader against the final schema.** The target's writers and readers produce statements consistent
   with the columns, CHECKs, triggers and indexes:
   - `lib/studios/doorwayInvitations.ts`, `app/api/doorway/register/route.ts`, `app/api/doorway/check/route.ts`;
   - `lib/writersStudio/betaGrants.ts`;
   - `lib/manuscript/editorialRuntime/workRevisionPause.ts`, `app/api/sovereign/living-works/route.ts`,
     `app/api/sovereign/living-works/[id]/route.ts`;
   - `lib/writersStudio/proTaste.ts`;
   - `app/api/sovereign/writers-studio/pro-request/route.ts`.
7. **Member-visible change and consent.** From the target code, what can a member newly do? Is anything
   written without the member's own gesture or an operator/founder act? Specifically:
   - invitations are issued only by an operator script;
   - `maia_revisions_paused` is written only by the member's PATCH;
   - pro tastes and pro requests are written only behind their flags.

   Which runtime flags gate each new surface, and what are their defaults?
8. **Rollback.**
   - Rollback is `scripts/deploy-production.sh rollback` to the previous image, with the schema left in place.
     Each migration also has a `_rollback.rollback` file.
   - Judge what the old reader would do with rows the target wrote. Name anything lost or blocked, including
     whether a non-empty `writers_studio_beta_grant_events` would block an old-reader account deletion.
   - Removing `living_works.maia_revisions_paused` while the target is live would break the target's Works
     list, which selects it. Confirm that the rollback ordering stated in PR #2267 (code first, then column)
     is required.

A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into approval.

## Minimum physical Reads

- This plan.
- `MIGRATION_COMPATIBILITY_CONTEXT.json`.
- The six migrations above.
- Target `lib/writersStudio/maiaMeter.ts`.
- `scripts/deploy-production.sh`.
- `scripts/run-sql-migrations.sh`.
- Target: `lib/studios/doorwayInvitations.ts`, `app/api/doorway/register/route.ts`, `lib/writersStudio/betaGrants.ts`,
  `lib/manuscript/editorialRuntime/workRevisionPause.ts`, `app/api/sovereign/living-works/route.ts`,
  `app/api/sovereign/living-works/[id]/route.ts`, `lib/writersStudio/proTaste.ts`,
  `app/api/sovereign/writers-studio/pro-request/route.ts`, `app/api/members/delete-account/route.ts`.
- Exact old reader: `app/api/members/delete-account/route.ts`, `app/api/sovereign/living-works/route.ts`,
  `app/api/sovereign/living-works/[id]/route.ts`, `app/api/sovereign/manuscripts/route.ts`.

Old-reader paths live beneath `old-reader/<exact-old-reader-SHA>/...` in the bundle. Search may help find
files, but it does not count as coverage.

## Required review JSON

**Ordinary Review-Custody fields:** `verdict`, `plan_sha256`, `trace_id` = reviewer session id, `reviewer`,
`summary`, `findings`, `coverage.files`, `limitations`.

**`migration_compatibility`:**
- `instrument = migration-compatibility/v1`;
- `verdict`: COMPATIBLE or INCOMPATIBLE;
- the exact full old-reader and target commits;
- `pending` = the six paths, each with its SHA-256, in the order above;
- `old_reader_evidence` = the old-reader files read, each with repo path, SHA-256 and trace path;
- `rationale`;
- `limitations`;
- `failure_prefix_compatibility`, with:
  - `instrument = migration-prefix-compatibility/v1`;
  - verdict `ALL_PREFIXES_COMPATIBLE` only if all six prefixes are established;
  - exactly **six** prefix entries, prefix *n* bound to the *n*th migration's path and SHA-256, each with
    `through_path`, `through_sha256`, `rationale` and `limitations`.

## Existing evidence may inform, not substitute

- **PR #2267:** 5 new runtime tests including a negative; the editorial, living-works and Writer's Studio
  suites green apart from one failure that is identical on `8ecc0c49d2`; CI green including Empty database
  reconstruction.
- **#2260, #2261, #2264, #2268:** CI green on merge.

None of this was an independent review of the migration act. This review covers the migration act only.

## Revision 2: dispositions of the first review (founder, 2026-11-13)

The first independent review was bound to Revision 1 of this plan at `3e4f163106` (plan sha256
`b8df4b47…`, reviewer session `467fc299-e689-48aa-bff3-84a7f3fab770`). It returned
APPROVED · COMPATIBLE · ALL_PREFIXES_COMPATIBLE with 2 medium and 4 low findings. Review Custody refused
admission (`MATERIAL_UNDER_APPROVED`). The founder ruled "Accept, re-review" and "and fix", and dispositioned
the findings as follows:

- **F1 (medium): accepted, with a rollback rule.** An image rollback to a reader older than #2267 does
  not enforce `living_works.maia_revisions_paused`, so a Work set to "MAIA asks, never rewrites" would
  silently receive wording proposals again. This cannot be fixed in the old reader. **Rule:** any rollback
  past this deploy must be preceded by telling every writer whose Work has the setting on; at deploy time
  that is at most one writer, in the College Essay controlled beta. Any rollback also follows PR #2267's
  stated order: code first, then column.
- **F2 (medium): fixed in this target.** On account erasure, `app/api/members/delete-account/route.ts` now
  deletes, in a savepoint before the member row, the member's `studio_doorway_redemptions` row and every
  `studio_doorway_invitations` row whose `email_sha256` equals the hash of the member's email and which no
  other member has redeemed. **Accepted residual:** the email hash stays unsalted, and spent or expired
  invitations are not otherwise purged; both are recorded follow-ups for the doorway lane.
- **F3–F6 (low): noted, no change.**
  - F3: invitation sign-up skips `/begin`, per founder rulings R1/R2 of 2026-11-12.
  - F4: the founder's session runs `scripts/verify-constitution-colab.ts` and requires 0 failed before any
    invitation is issued, whatever the deploy's smoke step logs.
  - F5: `WS_BETA_GRANT_MODE` stays `legacy`. No grant-bearing invitation is issued while #1938 Gate 4 holds.
    The beta invitee is admitted through the existing roster.
  - F6: the 5-second lock wait is accepted; a timeout fails safe, before the swap.

Additional independent review question for Revision 2:

10. **F2 fix.** Read target `app/api/members/delete-account/route.ts` and judge:
    - whether the new cleanup can block or abort an otherwise valid erasure;
    - whether it can delete an invitation another member redeemed;
    - whether it runs before `DELETE FROM members`.

11. **Sixth migration (#2273).** Read target `lib/writersStudio/maiaMeter.ts` and judge:
    - what it records, and from which member acts;
    - which runtime setting turns recording on, and its default;
    - whether anything is recorded under Sanctuary posture or without a member's own act;
    - whether the old reader's account deletion still succeeds with rows present.

The pending set is the six migrations above. The sixth, `20261113000005_writers_studio_maia_usage.sql`,
was merged to canonical after Revision 1 was reviewed.

The re-review must re-read everything listed under Minimum physical Reads; the target
`app/api/members/delete-account/route.ts` is already on that list.

## Closing condition

An admitted `APPROVED` review with `COMPATIBLE` and `ALL_PREFIXES_COMPATIBLE` licenses the migrate-before-swap
sequence above for this exact pending set and no other. It is not a statement that any migration or feature
is correct.
