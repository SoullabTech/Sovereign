# Writer's Studio — R13 crash-resumable custody transition (held candidate)

**Date:** 2026-10-16 America/New_York
**Disposition:** R13 isolated source + physical fictional PostgreSQL rehearsal PASS. **Actual encrypted real-member recovery and admission HOLD.**
**Base:** R12 local `eca940e244c38adb4d50c728e44739e91392c28c`. Public fictional beta source `d2020f7bfa66286c5f4b274d2a5fdb17b8c913b2` remains separate.

## Implemented in new held source

- `lib/writersStudio/recovery/transferJournalV1.ts`: an Ed25519-signed, monotonic, optimistic-concurrency **OUTBOX journal** for the already authenticated R12 Source claim. The full record binds member, pending arrival, manuscript, distinct pending/Work key IDs, claim generation and encrypted Work digest.
- Five required steps, in order: `claim_committed` → `work_capsule_verified` → `retirement_owed` → `key_retirement_witnessed` → `pending_bytes_erasure_witnessed` → **`review_ready_not_released`**.
- Each step requires independently attributed evidence, signed by the scoped storage, key-custodian or recovery-checkpoint signer, plus an external minimum generation. A genuine old receipt can be retried idempotently. Conflicting revisions, foreign members, altered evidence, incorrect signers, and skipped states refuse.
- The candidate deliberately has **no production-complete state**. `R13_REAL_MEMBER_TRANSFER_ENABLED = false`, `heldTransferCompletionStatement()` can never authorize imports, backups or actual erasure.
- PostgreSQL and external storage/key services cannot take part in one atomic transaction. **Real integration must durably record the next retirement obligation in the same SQL transaction that advances the journal**, and must not delete pending Source before an independently verified surviving Work copy and key-retirement authority exist.

## Actual physically isolated evidence

- Fixture: `scripts/ops/wsBetaR13PhysicalJournal.ts`, opt-in only with `R13_PHYSICAL_FIXTURE=fictional-only`.
- Runs only against fresh, uniquely named **local networkless Docker PostgreSQL 16 and three synthetic volumes** (database, pending encrypted Source, manuscript encrypted Source). Refuses pre-existing target containers/volumes; no production/network/file mounts.
- R12 claim is first committed under a same-member SQL join. A signed claim is then created from that committed fictional fact; R12 rewrap prepares a new Work key capsule and R13 initializes the full journal from verified claim.
- **37/37 physical checks PASS.** Work ciphertext is persisted and reread before advancing. A PostgreSQL restart before journal promotion recovers the full version-zero record without process state. Signed readback then advances by CAS exactly once; stale competing writer cannot advance again.
- Retirement-outbox failure injection aborts the entire SQL transaction without a false debt; successful journal + outbox update commits in one SQL transaction. A second PostgreSQL restart reconstructs the exact owed state and outbox.
- Fixture-only database trigger refuses **phase skipping**, member/work/key identity substitution and nonmonotonic revision, even if a caller fabricates a future revision. The trigger is NOT a production migration and has NOT been installed.
- **Stop gate demonstrated:** without the independently held key signer, a pending key retirement cannot be attested; the old pending encrypted original is preserved and the journal remains `retirement_owed`. The test does not fabricate a successful retirement or deletion.
- All four synthetic Docker objects (one container and three named volumes) were cleaned and checked absent. No real member, provider, key vault, Caddy, backup scheduler or product configuration was accessed.

## Tests and receipts

- R13 journal tests: 13/13 PASS, including strict signer segregation, stale/forged proof refusal and no path to real-member completion.
- Strict scoped TypeScript (journal, source claim, fixture, tests): PASS.
- Full inherited R9+R11+R12 plus R13 combined regression: **28/28 suites, 349/349 tests PASS** (fresh test receipt; exit zero).
- Evidence in founder T7 folder `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/`: `R13_PHYSICAL_JOURNAL_20261016.json`, `R13_PHYSICAL_RUN_20261016.log`, `R13_JOURNAL_UNIT_20261016.log`, `R13_STRICT_TYPES_20261016.log`, `R13_INTEGRATED_REGRESSION_20261016.log`. This note is source-only; evidence logs are deliberately outside Git.

## IMPORTANT unresolved design and release gates

1. **Original metadata completeness:** R12 prepared manuscript capsule still declares `ORIGINAL_FILENAME_AND_MIME_NOT_CERTIFIED`. The R13 physical fixture MUST NOT retire the real pending original or key while original filename/MIME and custody rights are not independently preserved.
2. **Actual key authority absent:** the R13 fixture generates only ephemeral fictional Ed25519 keys. There is no installed independent service, attested key retirement, permanent external high-water or future-proof nonrollbackable signer. Signature validation is not sufficient by itself.
3. **Real durable runtime not wired:** journal writes/trigger/outbox are a physical **fixture**, not an admitted migration, production app repository, rollback-compatible reader or operator-owned release. Source-level reducer does not perform I/O. Complete workflow must be bound to server-verified member identity, source claim, physical file storage and scope-restricted database role with event-provenance/ownership.
4. **Past plain backups can reconstruct:** R10 proved old global encrypted SQL+Source archives can still restore deleted Work. R11 found ten primary fields and 68 additional possible derived/JSON content fields; none are certified for protected per-Work backup in the actual R9 system. PG WAL/NAS snapshots and provider-held material are still separate unknown copies.
5. **Public release requirements:** exact source custody and migration review, authenticated original import → MAIA proposal → Apply/Undo → save/reopen/download on real external Safari/iPhone, independent real SQL+Source restore, effective irrevocable deletion, approved participation notice, actual named member consent, staged rollback and founder exact-SHA source plus exact-image canary approvals.

## R14 next action

- Extend the Work capsule to preserve original filename, MIME and complete provenance with no extra plaintext restore path. Reconcile R11 field census and revise the physical fixtures together.
- Provide a narrow reviewed SQL schema (separate from current migrations) and real server-signed claim/outbox writer that can recover on restart without client-supplied identity; no direct owner-wide DB grants.
- Establish independent durable Work-key escrow, revocation witness and externally signed nonrollbackable generation. Only then qualify actual pending-capsule erasure with all historical backups accounted for.
- Keep R9 publicly deployed for **fictional canary only**; real member beta remains dark.

**No merge, push, production migration, live key access, original-file mutation or invitation is authorized by these synthetic PASS results.**
