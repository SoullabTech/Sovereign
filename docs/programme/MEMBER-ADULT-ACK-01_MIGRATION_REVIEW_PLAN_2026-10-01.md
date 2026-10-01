# MEMBER-ADULT-ACK-01 — Exact Migration Review Plan

**Date:** 2026-10-01  
**Status:** BOUNDED INDEPENDENT REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF  
**Production old reader at plan freeze:** `56d0cd679c247a91dfe5a3592ce59e5a488c1fba`  
**Target lineage before this plan:** `5855d5764f927b3d598a641c964f9892a5f8c0e7`

## Exact production-pending migration

A read-only production-ledger witness on 2026-10-01 established that
`20261001000001_member_acknowledgments.sql` is absent from `schema_migrations`.

The review is bound to exactly one pending file:

1. `database/migrations/20261001000001_member_acknowledgments.sql`

Any migration-byte movement, additional production-pending migration in the
target relation, old-reader movement, or target movement invalidates
applicability and requires a fresh review and re-witness.

## Deployment ordering

The governed production path remains:

`exact target → build/provenance → admitted migration review + compatibility gate → pending-set re-witness → old-reader re-witness → migration → candidate swap → running provenance/health`

A migration refusal or failure must leave the old reader live and the candidate
reader unswapped.

## Independent review questions

The reviewer must independently establish or reject:

1. The new table, index, functions, triggers, and foreign key are additive with respect to the exact old reader.
2. Creating the foreign key to `members(id)` cannot reject an old-reader-valid member row and does not alter old-reader reads/writes.
3. DDL lock acquisition is bounded by `SET LOCAL lock_timeout = '5s'`, and a timeout rolls back this file before reader swap.
4. The direct-delete refusal does not block lawful `ON DELETE CASCADE` member erasure.
5. UPDATE and TRUNCATE refusal semantics are confined to the new table and do not alter old-reader behavior.
6. The migration is safe to rerun after a committed migration but failed ledger write: table/index/function/trigger recreation is idempotent for the intended schema.
7. The target reader fails closed if the acknowledgment table is absent and cannot falsely treat an unrecorded acknowledgment as satisfied.
8. Every covered account-creation path requires the member's own 18+ confirmation before creating a new member, and the member row plus `adult_18_plus` acknowledgment are atomic where this lane claims atomicity.
9. Existing-member OAuth linking/sign-in is not incorrectly blocked merely because the member predates the new acknowledgment table; MAIA conversation admission remains the place that requires the missing acknowledgment.
10. Reader rollback to the exact old reader remains lawful after this migration, with no database down-migration required.
11. With exactly one pending file, the sole possible committed-prefix state is compatible with the old reader.
12. Any material correctness, locking, privacy, erasure, or rollback concern is recorded as a finding rather than converted into approval.

A verdict of `REVISE` or `BLOCKED` is lawful and must not be converted into
approval merely to advance the release.

## Account-creation surface in this target

The reviewer must account for every new-member path changed by this lane:

- `app/api/members/register/route.ts`
- `app/api/members/register-email/route.ts`
- `app/api/members/register-local/route.ts`
- `app/api/members/enter/route.ts`
- `app/api/now-what/register/route.ts`
- `app/api/team/invite/[token]/register/route.ts`
- `app/api/auth/signin/google/callback/route.ts`
- `app/api/auth/signin/apple/callback/route.ts`
- `app/api/auth/google/native-callback/route.ts`
- `app/api/auth/apple/native-callback/route.ts`

The relevant entry UI includes `components/auth/UnifiedAuth.tsx`,
`components/auth/SyncAccountPrompt.tsx`,
`components/team/InviteAcceptClient.tsx`,
`app/now-what/arrive/page.tsx`, and
`components/members/AdultConfirmationCheckbox.tsx`.

## Minimum physical Reads

The reviewer must physically Read, at minimum:

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- `database/migrations/20261001000001_member_acknowledgments.sql`;
- `scripts/deploy-production.sh`;
- `scripts/run-sql-migrations.sh`;
- target `lib/members/acknowledgments.ts`;
- target `lib/members/acknowledgmentGate.ts`;
- target `lib/members/adultConfirmation.ts`;
- target `app/api/members/acknowledgments/route.ts`;
- every target account-creation route listed above;
- the target MAIA conversation routes that call the acknowledgment gate;
- the target account-erasure route(s) that ultimately delete a `members` row;
- exact old-reader versions of the account-creation routes listed above where they exist;
- exact old-reader account-erasure path(s);
- the migration(s) establishing `members.id` as the referenced UUID primary key.

Search may scope discovery, but only physical Reads count as review coverage.

## Production facts supplied to the reviewer

- Running `maia-sovereign` reported `56d0cd679`, resolving to the full old-reader SHA above.
- The production migration ledger returned false for the exact pending filename at plan freeze.
- No migration has been applied and no production schema mutation is authorized by this plan.
- Any production row-count or timing claim not independently available from the sealed source bundle must be stated as a limitation.

## Required structured result

The review must include:

- verdict;
- findings with severity, evidence, and remediation;
- physical coverage list;
- limitations;
- `migration-compatibility/v1` bound to the exact old-reader and target commits;
- exact pending path + SHA-256;
- old-reader evidence paths + SHA-256 values supplied by the harness;
- `migration-prefix-compatibility/v1` covering the sole possible committed prefix.

Only an admitted `APPROVED` review that survives the mechanical custody,
compatibility, and prefix gate may authorize the migration seam. It never by
itself authorizes deploy.
