# MEMBER-ADULT-ACK-01 — Exact Migration Review Plan

**Date:** 2026-10-01  
**Status:** BOUNDED INDEPENDENT REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF  
**Production old reader at plan freeze:** `56d0cd679c247a91dfe5a3592ce59e5a488c1fba`  
**Target lineage before this plan:** `73ad34d081c79f8b25fefc278612c853125f2f62`

## Exact production-pending migration

Read-only production-ledger witness on 2026-10-01 established that
`20261001000001_member_acknowledgments.sql` is absent from `schema_migrations`.

The review is bound to exactly one pending file:

1. `database/migrations/20261001000001_member_acknowledgments.sql`

Any migration-byte movement, additional pending migration in the target relation,
old-reader movement, or target movement invalidates applicability and requires a
fresh review/re-witness.

## Deployment ordering

The governed production path remains:

`exact target → build/provenance → admitted migration review + compatibility gate → pending-set re-witness → old-reader re-witness → migration → candidate swap → running provenance/health`

A migration refusal or failure must leave the old reader live and the target reader unswapped.

## Independent review questions

The reviewer must independently establish or reject:

1. The new table, index, functions, triggers, and foreign key are additive with respect to the exact old reader.
2. Creating the foreign key to `members(id)` cannot reject an old-reader-valid member row and does not alter old-reader reads/writes.
3. The migration's DDL lock acquisition is bounded by `SET LOCAL lock_timeout = '5s'`, and a timeout rolls back this file before reader swap.
4. The direct-delete refusal does not block lawful `ON DELETE CASCADE` member erasure.
5. UPDATE and TRUNCATE refusal semantics are confined to the new table and do not alter old-reader behavior.
6. The migration is safe if rerun after a committed migration but failed ledger write: table/index/function/trigger recreation is idempotent for the intended schema.
7. The target reader fails closed if the table is absent and cannot falsely treat an unrecorded acknowledgment as satisfied.
8. The atomic member-creation wrappers cannot create a member without its required adult acknowledgment in the covered registration/OAuth paths.
9. Reader rollback to the exact old reader remains lawful after this migration, with no database down-migration required.
10. With exactly one pending file, the sole committed-prefix state is compatible with the old reader.
11. Any material correctness, locking, privacy, erasure, or rollback concern is recorded as a finding rather than converted into approval.

A verdict of `REVISE` or `BLOCKED` is lawful and must not be converted into approval merely to advance the release.

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
- target `app/api/members/register/route.ts`;
- target `app/api/members/register-email/route.ts`;
- target Google and Apple web/native callback routes that create members;
- exact old-reader versions of those member-creation routes where they exist;
- exact old-reader member-erasure paths that delete from `members`;
- the migration(s) that establish `members.id` as the referenced UUID primary key.

Search may scope discovery, but only physical Reads count as review coverage.

## Production facts supplied to the reviewer

- Production old-reader identity was observed from the running `maia-sovereign` container as `56d0cd679`, resolving to the full SHA above.
- The production migration ledger returned false for the exact pending filename at plan freeze.
- No migration has been applied and no production schema mutation is authorized by this plan.
- The migration is new-table DDL. Any production row-count claim not independently available to the reviewer must be stated as a limitation.

## Required structured result

The review must include:

- verdict;
- findings with severity/evidence/fix;
- physical coverage list;
- limitations;
- `migration_compatibility/v1` bound to the exact old-reader and target commits;
- exact pending path + SHA-256;
- old-reader evidence paths + SHA-256 values;
- `migration-prefix-compatibility/v1` covering the sole possible committed prefix.

Only an admitted `APPROVED` review that survives the mechanical custody,
compatibility, and prefix gate may authorize the migration seam. It never by
itself authorizes deploy.
