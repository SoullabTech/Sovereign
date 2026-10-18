# R70.19B — Three real writer entrypoints share one fictional checkpoint lease

**2026-10-18 · Mac Studio · isolated source + disposable PG16/vault only · beta HOLD**

## Source authority and changes
- Exact parent: `b7f1fb8dfe22b6170a76622e715c75d1cf22ffe8` (R70.19 read-only inventory, itself descended from RF01/R1Q Studio source `441616dbf5`).
- Separate branch: `feature/ws-r70-19b-fixture-coherence-20261018`.
- New `lib/writersStudio/recovery/heldR7019BWriterFence.ts`: default-OFF, refused except with explicit `R7019B_WRITER_FIXTURE=fictional-only`, exact loopback disposable `fict@127.0.0.1:PORT/ws_atomic`, nonce-marked local fixture identity, verified physical PostgreSQL16, non-symlink vault in `/private/tmp/ws-r7019b-fixture-<nonce>/vault`, and one exact fictional member and practitioner.
- The fixture uses the **same advisory-lock key** as prior R70.17 Source checkpoint, but the R70.17/R70.18 code remains on a separate branch, **not merged**. That common key alone does not prove whole-Writer integration.
- Three surgical default-off runtime seams only: `persistConfirmedPasteR65` encloses its entire existing transaction in the fixture session lease; the **direct** `saveSectionInTransaction` acquires a transaction-scoped advisory lock before its draft mutations, including higher-level callers; `app/api/studio/files/route.ts` encloses the existing file-byte write AND SQL insert in one fixture session lease. The original route catches asynchronous failures using `return await`.
- All normal runtime paths return to their original behavior when the fixture flag is absent. The additional fencing was not enabled on a live service or real database. No production backup writer was changed.

## Physical acceptance — exact fictional work
- Fresh `postgres:16.13` Docker container and actual canonical manuscript, Source, confirmation receipt, Draft, section, revision and practitioner file migrations; fixture-only stub tables provide the otherwise unrelated team/client/encounter foreign-key references.
- R65 genuine `persistConfirmedPasteR65` must wait while the snapshot holds the shared PG advisory lease, commit exactly one Source + manuscript when released, and preserve idempotent confirmation on retry.
- Genuine `saveSectionInTransaction` (called on the same transaction client, not public wrapper) must wait while the snapshot holds the same lock; after release, draft content and version advance without mixed snapshots.
- Genuine Studio `POST /api/studio/files` implementation tested in Jest with **fictional authentication and Co-Lab stubs only**. Upload bytes and SQL row cannot appear while a snapshot holds the lease. After release they appear together. A forged fixture member is refused before writing bytes.
- A deliberately failed `practitioner_files` INSERT after the real file write leaves an orphan original; a later snapshot **refuses**, never reporting a successful coherent capture. The orphan is removed **only inside the disposable test vault**, and a subsequent fixture check succeeds.
- Capture verifies exact practitioner-owned file bytes and SQL size, refuses nonregular or orphan storage, and always returns `releaseApproved:false` and `wholeWriterBackupComplete:false`.

## Exact verification
- R70.19B physical acceptance: **21/21 PASS**, exit 0, status `R7019B_REAL_WRITER_LEASES_PASS_BETA_HOLD`.
- Final evidence receipt: `/Volumes/T7 Shield/ws-beta-r7019b-physical-pg16-20261018-r4/R7019B_ACTUAL_WRITER_COHERENCE_PG16.json`, mode 0600, SHA-256 `3f36a64382f80ecba376622c27f7cfdd1ed597ea7f55701d842d88409f575dfa`.
- Strict `tsc -p tsconfig.ship.json --noEmit --incremental false`: exit 0, no new errors.
- Focused default-off and invalid-fixture refusal Jest tests: **6/6 PASS**.
- Selected existing Studio privacy, consent, Source, section and transaction boundary regressions: **48/48 PASS** across five suites.
- Existing immutable R70.19 source inventory is **NOT silently rewritten**. Its new branch test asserts precisely five R1S source drift entries (the changed R65, section and Studio route files), 11 unqualified writers and seven unresolved families: **7/7 PASS**. The earlier inventory's CLI deliberately remains a HOLD on this new branch.
- Fixture exits close real test PG pool, remove only named disposable Docker container, marker, database and private vault directory. No production member or provider touched.

## Non-negotiable limitations
1. **Not a release gate**: explicit fixture-only operation; no real user session acceptance, Co-Lab membership, encryption at rest for WAL/temp, or production encryption and backup keys.
2. This coordinates three participating entrypoints, not the complete Source and Draft system. `saveSectionInTransaction` can be invoked after other higher-level mutations have already acquired row locks; its late lease cannot retroactively protect those earlier writes. All higher-level Apply/Undo/Keep/revision/consent and background writer paths remain individually unqualified.
3. Studio's original upload path still writes file bytes before the database row; no production rollback or automatic orphan cleaning was added. Detecting the orphan and refusing backup is not making the upload itself atomic.
4. Fixture uses single fictional member and a mocked authentication boundary. It is not member canary security or distributed multi-host capture certification.
5. No real independent SQL+vault encrypted snapshot has been restored with independently held offsite key and current deletion highwater. Legacy production gzip backups remain unencrypted under their previous verified state.
6. No GitHub push, protected merge, live deployment, cron, NAS or Caddy mutation, production key provision, or beta invitation.

## Next Class A task
Review the R70.18 Source/Draft checkpoint and current RF01/R1Q consent and key-wrapping code against this separate three-writer seam. Inventory and fence every higher-level transaction BEFORE its first mutation (not only the nested section call), file upload/delete, protected proposal and Keep/revision/erasure writer. Then prove cross-member SQL+vault+WAL consistent capture and independent encrypted restore with revoked/deleted data not resurrecting. Only after full source coverage, security review, Mac Safari real-auth acceptance and explicit founder GO can the real manuscript beta hold be reconsidered.

**Disposition: R70.19B isolated participating-writer test PASS. Production backup qualification and real-member Writer's Studio beta HOLD.**
