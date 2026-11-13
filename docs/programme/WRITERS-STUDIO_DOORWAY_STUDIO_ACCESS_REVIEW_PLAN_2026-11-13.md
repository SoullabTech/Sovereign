# Writer's Studio deploy 2026-11-13 (second): review plan for the exact one pending migration

**Date:** 2026-11-13
**Status:** BOUNDED INDEPENDENT REVIEW PLAN. NO DEPLOYMENT AUTHORITY BY ITSELF.

**Live old reader:** supplied by the harness through the bundle's `MIGRATION_COMPATIBILITY_CONTEXT.json`. The reviewer
establishes it from the bundle, and the deploy lane re-witnesses it before mutation.

**Founder authorization:** ledger #1938, College Essay controlled beta.
- PR #2280: "Yes, build it". An invitation can carry Writer's Studio access.
- PR #2279: "Fix it first".
- PR #2281: the More menu layout fix.

All three were merged to canonical after the previous deploy (`a67406ff7`). So was PR #2276 (Studio paths, from the Writer's Studio arrival lane), which is code only and adds no migration.

## Exact target relation

The target is the canonical merge commit of the PR that adds this plan. It must differ from its own first parent only
by this documentation file, and that first parent must add no migration beyond the one below. The reviewer
establishes the relation from immutable git bytes where it can, and otherwise says so.

## Exact production-pending set

1. `database/migrations/20261113000010_studio_doorway_invitation_studio_access.sql`
   sha256 `1bb1aabd9ee36a34a8028abe658efc4608c6c5088cebe82a090a30022acc9062`

It has a sibling `_rollback.rollback`. The file carries its own `BEGIN … COMMIT` with `SET LOCAL lock_timeout = '5s'` first.

## What the migration does

It adds `grants_writers_studio boolean NOT NULL DEFAULT false` to the existing `studio_doorway_invitations` table, and
a CHECK `studio_doorway_invitation_studio_access_shape`: `NOT grants_writers_studio OR (studio = 'writer' AND
issuer_member_id IS NOT NULL)`. It uses a constant default and does no backfill.

## Production facts supplied to the reviewer

Read-only, 2026-11-13, under `BEGIN READ ONLY`. Counts and schema only.
- Live: `a67406ff7`.
- The ledger's newest applied migration is `20261113000005_writers_studio_maia_usage.sql`.
- `studio_doorway_invitations.grants_writers_studio` does not exist.
- `studio_doorway_invitations` has 0 rows, and `studio_doorway_redemptions` has 0 rows.
- `STUDIO_DOORWAYS_ENABLED` is unset (the doorway routes return 404).

## Deployment ordering

As implemented in `scripts/deploy-production.sh`:
1. Target materialization.
2. Build and image provenance.
3. Admitted review and compatibility checks.
4. Pending-set and old-reader re-witness.
5. Migration while the old reader is live.
6. Rollback tags and swap.
7. Running provenance, health and smoke tests.

## Independent review questions

1. **Additive.** Confirm the migration only adds a defaulted column and a CHECK. Confirm that, at 0 rows, the CHECK
   validates trivially. Judge the lock at 0 rows.
2. **Old reader.** The exact old reader's `CLAIM_INVITATION_SQL` (`lib/studios/doorwayInvitations.ts`), the issue
   script and `app/api/doorway/register/route.ts` don't name the new column. Confirm that their INSERT names its
   columns and that the default satisfies the CHECK for every row the old reader writes.
3. **Target behaviour.** In target `app/api/doorway/register/route.ts`, when a claimed invitation carries
   `grants_writers_studio`:
   - Is exactly the owner act applied, in the sign-up transaction, using `applyChange` with permission
     `writers_studio`, grant true, plus `writeAudit`, with the invitation's issuer as the actor?
   - Does a refusal abort the sign-up and give the use back?
   - Can anything else, such as another Studio, a member without an invitation, or a different email, obtain
     Writer's Studio access through this path?
4. **Issuer authority.** In target `scripts/studios/issue-doorway-invitation.ts`: is `--studio-access` limited to
   Writer's Studio, and does it verify that the issuer is a founder or CTO? Does the CHECK hold the same line at the
   database?
5. **Prefix compatibility.** The single prefix 1 is compatible with the exact old reader still being live.
6. **Rollback.** Image rollback is to `a67406ff7`, and the schema stays. Judge what that reader does with a row
   where `grants_writers_studio = true`. The rollback file drops the column, and the code must be rolled back first.

A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into approval.

## Minimum physical Reads

- This plan, and `MIGRATION_COMPATIBILITY_CONTEXT.json`.
- The migration above.
- `scripts/deploy-production.sh` and `scripts/run-sql-migrations.sh`.
- Target files:
  - `lib/studios/doorwayInvitations.ts`
  - `app/api/doorway/register/route.ts`
  - `scripts/studios/issue-doorway-invitation.ts`
  - `lib/admin/memberPermissions.ts`
  - `lib/writersStudio/betaAccessServer.ts`
- Exact old-reader files:
  - `lib/studios/doorwayInvitations.ts`
  - `app/api/doorway/register/route.ts`
  - `scripts/studios/issue-doorway-invitation.ts`

## Required review JSON

Use the ordinary Review-Custody fields, plus `migration_compatibility` with:
- `instrument = migration-compatibility/v1`;
- the exact commits;
- `pending` = the one path with its SHA-256;
- the `old_reader_evidence` actually read;
- `failure_prefix_compatibility` with exactly **one** prefix entry bound to that path and SHA-256.

## Closing condition

An admitted `APPROVED` review with `COMPATIBLE` and `ALL_PREFIXES_COMPATIBLE` licenses the migrate-before-swap
sequence for this exact pending set only.
