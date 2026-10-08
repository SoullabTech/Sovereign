# Writer's Studio — Sanctuary persistence protocol (engineering hold)

Status: design and negative enforcement implemented; **functional authorization not admitted**. No production change.

## Boundary and authority

- The existing `auth_sessions` cookie or validated session-token header establishes member identity. `x-member-id`, a browser Sanctuary toggle, any browser-provided posture flag, or account *default* is not authority to persist content.
- Establish a *server-owned, session-bound* posture state. Missing records, migrated legacy sessions, invalidated sessions, failed lookup or failed lock acquisition fail closed to Sanctuary.
- An explicit user request to leave Sanctuary may update that server-owned state through an authenticated transition endpoint. The UI must show the **server-acknowledged** state, not an optimistic local toggle. A return to Sanctuary must take precedence over pending actions.
- If source saving during Sanctuary is intended as a distinct, explicit authoring gesture, it must be governed as a separate exception; do not treat this as implicitly authorized by Keep, a default setting, or a client boolean.

## Concurrency law (non-negotiable)

- The state transition and each content persistence act must serialize on the *same authenticated session lock*. The check and all content writes (DB row, original bytes, extraction, reviewed bytes, declaration) must be covered by a protocol that prevents a concurrent Sanctuary transition from committing first while an upload persists afterward.
- A single `SELECT` before asynchronous filesystem storage is **not** a sufficient guard. A database transaction around one statement is **not** sufficient if filesystem work continues after the lock is released.
- Avoid holding a normal connection-pool transaction while executing ingestion through separate pooled `query()` connections unless deadlock/pool starvation is analyzed and defeated.
- Crash semantics: avoid orphaned bytes, allow safe retry/reconciliation, never claim a rejected write did not persist unless the persistent state proves it. A failed extraction may retain a deliberately authorized original, but never a Sanctuary original.
- Revocation, expiry, multiple devices, concurrent toggles, and replay must have explicit tests. Use DB-controlled state, not per-process maps.

## Existing current code

- `lib/sanctuary/currentClientPosture.ts` explicitly reads only localStorage: advisory UI, not server authority.
- `lib/sanctuary/turnPosture.ts` derives posture from request metadata and treats absent signals as ordinary; it must **not** be reused to authorize uploaded content.
- `app/api/writers-studio/sources/route.ts` POST and `sources/[id]/route.ts` PATCH now fail closed with HTTP 423. The existing source GET and DELETE remain available.
- `lib/workbench/intake.ts` writes an initial row and storage bytes before returning: reopening it requires a coherent session/posture/ingestion boundary, not simply moving the guard.
- Beta access applies to source POST and source_upload belonging POST. There are no production deploy or migration permissions in these patches.

## Release admission tests

1. Legacy/unresolved/revoked/expired session cannot write, including a forged `sanctuary:false` request.
2. Ordinary mode server-acknowledged; successful authorized upload persists exactly one original and one owned record.
3. Sanctuary mode refuses before byte persistence; no object, DB row, reviewed transcription, or belonging appears.
4. Rapid ordinary -> Sanctuary during large upload: either upload linearizes fully before the transition is acknowledged, or is wholly refused; no writes after acknowledged Sanctuary transition.
5. Concurrent tabs/devices, duplicated request and interrupted upload do not bypass #4.
6. Re-entering ordinary does not retroactively publish Sanctuary content.
7. Browser walk (authenticated) covers Bring -> Keep -> Explore, the original manuscript hash unchanged until explicit Apply, and a denied Sanctuary attempt.

## Migration / release boundary

A new authoritative state table or column must be migration-reviewed alongside the pending `20261002000002_writer_studio_chapter_overview_lens.sql`. Old running readers/writers must be evaluated against the changed schema and fail-closed enforcement. No quick prepare/cutover and no local proof is production authorization.

## Current disposition

**HOLD**: 423 guards are deliberate until a concurrency-safe backend protocol, user-visible state synchronization and browser evidence are admitted. Do not toggle `sourceUploadPostureAuthorized()` to `true` as a shortcut.
