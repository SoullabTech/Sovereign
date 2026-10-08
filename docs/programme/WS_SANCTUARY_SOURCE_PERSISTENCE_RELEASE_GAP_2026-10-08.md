# Writer's Studio — Sanctuary source-persistence release gap

Status: **LOCAL RESEARCH / NO-GO**. This is not a migration review admission, a deployment candidate approval, or an instruction to apply SQL. Authoritative production ledger is not re-queried in this pass.

## Compared readers and proposed bytes

- Old application as reported in production: `c9e4f7f7e` (production deployment identity not independently revalidated in this pass).
- Materials target base: `937bc77ea`.
- Local Sanctuary correction branch: `fix/materials-beta-server-gate-20261008`, with guarded `POST /api/writers-studio/sources` and `PATCH /api/writers-studio/sources/[id]` still returning HTTP 423.
- New SQL in this commit interval: `database/migrations/20261002000002_writer_studio_chapter_overview_lens.sql` and `database/migrations/20261008000001_sanctuary_source_session_posture.sql`.
- Old reader and old writer are the same running application for prefix-compatibility analysis. The required review-custody evidence remains unadmitted.

## Static, code-grounded defeat candidates

1. **Old writer overlap.** `git show c9e4f7f7e:app/api/writers-studio/sources/route.ts` shows POST immediately calling `ingestWorkbenchUpload` after authentication, with no session-posture gate; the old PATCH calls `writeReviewed` without one. The new columns alone **do not make this old application safe**. Any deployment with the old application still serving source writes needs separately proven traffic fencing or a database-enforced fail-closed writer boundary.
2. **Two independent persistence surfaces.** `lib/workbench/intake.ts` commits a `workbench_uploads` row, writes original bytes, later updates the path, writes reviewed/draft bytes, then updates metadata. `lib/workbench/storage.ts` uses direct `fs.writeFile`. Crashes or query failure between those operations can leave filesystem bytes without the expected DB bookkeeping. In `sources/[id]/route.ts`, `writeReviewed` runs before the DB review update; failure may also leave updated bytes without the expected row state.
3. **No admitted crash journal.** There is no durable operation record and tested orphan reconciliation that a Sanctuary transition can inspect before acknowledging entry. A row lock cannot make filesystem writes part of a PostgreSQL rollback. Releasing the lock after a crash is therefore **not** enough to prove absence of protected bytes.
4. **Pool-client consistency.** The proposed `withSourcePersistenceLease` now hands its lock-owning `PoolClient` to the protected callback, and a mock verifies this identity. But the existing intake helper still calls the independent pooled `query()` API rather than that client. Wiring it unchanged risks pool starvation under concurrent sessions and cannot establish one transactional custody scope.
5. **Session/reader schema gap.** The proposed new auth-session columns default to `unresolved` and revision `0`; isolated migration DDL applied successfully. The shared `maia_consciousness_test` database has not applied them. A valid beta fixture currently receives source-posture GET 503, Sanctuary POST 503 and ordinary POST 423, while all source writing stays blocked. This is a correct *refusal*, not a functional transition proof.
6. **Developmental lens compatibility.** The chapter-overview migration changes `developmental_readings` constraints and trigger validation. Old-writer behavior against all committed migration prefixes has not been attested under `review-custody-migration-gate.ts` / `migration-prefix-compatibility-core.ts`.

## Next governed implementation plan (no unblocking implied)

- **Crash-safe custody:** introduce a durable, server-owned upload operation identity and reconciliation policy before any source bytes can be stored. It must bound DB rows, original/reviewed files, retries and cleanup; prove no late filesystem writes after an acknowledged Sanctuary transition. Preserve the member's intentionally saved, fully admitted originals when extraction alone fails; do not globally delete lawful custody.
- **Single source of authorization:** use a verified auth-session posture and a DB transaction client shared by content DB operations. A separate explicit authoring consent is required if saving from Sanctuary is ever admitted. No client flag grants it.
- **Old-application overlap:** require a proven source-write fence on every active old and new writer throughout each schema migration prefix and traffic cutover. The current old reader lacks the necessary guard.
- **Adversarial test matrix:** missing/revoked/expired sessions; fake ordinary headers; concurrent transitions and writes; interrupted request; process crash after original write and before DB update; crash after reviewed text write; retry and partial-file cleanup; back-to-back mobile/desktop sessions; old application under migrated schema; every committed migration prefix.
- **Acceptance:** release custody triplet, compatibility and prefix evidence, successful authenticated Bring → Keep → Explore without unintended manuscript changes, desktop/mobile visuals without concealing errors, and a deliberately separate cutover authorization.

## Present assertion

**Source POST and PATCH remain held at HTTP 423. Neither the Quick Settings screenshot nor the session-row lease mock authorizes reopening them. Production remains unchanged.**

## Verifier reconciliation — same local lane

`npm run verify:review-custody-migration-binding` initially refused with
`STRUCT_FAIL cmd_migrate` because its static assertion still searched for an
obsolete inline `docker compose ... migrate` in `cmd_migrate`, while the actual
entrypoint invokes the governed `run_migrations_or_abort` helper. The production
deployment script was **not** modified. The verifier now checks all three
entrypoints (`cmd_deploy`, `cmd_update`, `cmd_migrate`) for custody review before
the migration helper, verifies rollback tagging after migration, rejects direct
runner bypasses, and inspects the helper itself for a hard-fail re-witness
before `deploy_ctx_compose --profile migrate run --rm migrate`.

The corrected binding verifier passed **9/9** and `typecheck:review-custody`
passed locally. These are checks of execution ordering only. They do **not**
admit the actual two-migration pending set, demonstrate old-reader compatibility,
or authorize migration execution, traffic cutover, or source writes.

The proposed `withSourcePersistenceLease` now explicitly supplies its lock-
controlling PostgreSQL client to a future writer callback; a mock assertion
shows that the callback receives that exact client. Actual source intake still
uses independent pooled queries and has no crash-safe storage reconciliation,
so the upload endpoints remain blocked.
