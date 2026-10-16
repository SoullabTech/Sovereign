# Writer's Studio — R12 Source ownership + pending-import custody

**Date:** 2026-10-16 (America/New_York)
**Classification:** Class A source/custody change; isolated beta candidate, not deployed.
**Parent:** R11 isolated `fe170709b97c602368d6cdac9482a8fd8ef765fc`.
**Live fictional public R9 remains:** `d2020f7bfa66286c5f4b274d2a5fdb17b8c913b2`.

## Changes implemented on held R12 branch

1. `lib/manuscript/source/arrivals.ts` is an **actual application source change, not merely a helper**. `claimArrival()` now locks pending arrival and separately verifies same-member destination under one PostgreSQL transaction. It verifies original Source bytes and extracted text against their stored hashes; statuses change in the same transaction, with rollback if either row update fails. Existing UI/API does not change until a separately approved deployment. `discardUnclaimedArrival()` already locks arrival rows; the shared row lock serializes claim against discard.
2. The prior source comment incorrectly called unreferenced original bytes *harmless sweepable orphans*. R12 states the binding policy accurately: unknown-custody bytes stay preserved pending explicit retention/erasure adjudication. No historical original was moved or destroyed.
3. `pendingArrivalEnvelopeV1.ts` creates a **separate** AES-256-GCM namespace for member UUID + pending-arrival UUID + snapshot generation. It protects exact extracted/pasted text and original uploaded bytes, filename and MIME inside the encrypted payload; a paste never invents upstream file provenance. No manuscript ID is manufactured before writer confirmation.
4. `pendingClaimTransferV1.ts` requires a separately trusted signed, *committed* same-member claim receipt, an independent claim-generation floor, confirmed Source/file hashes and a distinct new manuscript encryption key. It constructs an **in-memory prepared** per-manuscript capsule. It does not write that capsule, grant admission, erase the old pending file or retire the pending key. Its result explicitly marks those obligations as `REQUIRED_NOT_WITNESSED`. A paste correctly marks the pending file obligation `NOT_APPLICABLE_PASTE`.
5. The rewrap currently contains original Source bytes and extracted text, **not** guaranteed complete private filename/MIME and source-lineage metadata in the destination capsule. It explicitly marks `ORIGINAL_FILENAME_AND_MIME_NOT_CERTIFIED`. Do not treat it as a complete replacement backup or allow its old pending copy to be deleted on this evidence.

## Tests and exact evidence

- R12 focused ownership + pending encrypt + signed-rewrap: **3 suites / 31 tests PASS**.
- R9+R11+R12 regression: **27 suites / 336 tests PASS**.
- R12 strict scoped TypeScript: **PASS** including the modified actual `arrivals.ts`.
- R12 physical PostgreSQL 16 networkless synthetic SQL premise: **14 checks PASS**; reproduces the original FK-alone cross-member attachment possibility, verifies verified same-owner transaction, rollback following zero-row destination update, claim/discard lock race, and cleanup. This simulates SQL logic and **is not an end-to-end live application/import test**.
- R11 inherited recovery candidate: 305/305 tests and separate physically isolated SQL+original-file recovery PASS; no real key authority.
- Full test logs, physical JSON, prior R9 run baseline and read-only relational schema census under founder's T7 `ws-beta-release-r9-build-20261015/`.

## Integrity and privacy boundaries still CLOSED

- **No real pending/Work encryption integration.** Existing R9 PostgreSQL and file vault writers still store plaintext, so this branch does not supply compliant real encrypted backups. R11 and R12 modules are currently not connected to SQL backup/restore routes, consent, MAIA or live encryption keys.
- **No complete ownership census.** R11 read-only inspection found 389 potentially relevant schema fields; 68 unclassified names worth high-priority review. A 48-table/119-foreign-key metadata audit found 36 tables needing a verified Work/owner join or documented non-Work exclusion. No private rows were read. JSONB/derived caches/provider copies, original filenames/MIME, new revision fields and historical plaintext remain unclassified.
- **No database/vault/key atomic transition.** A prepared capsule does not mean pending storage was retired. The actual crash-resumable, idempotent transition, tombstone and key-erase witnesses must be established separately. No automatic deletion of old Source or per-Work key.
- **No independent authority.** Claim receipt signer, nonrollbackable high-water and encryption-key custodian are fictional interfaces here, not installed external independently held hardware/cloud authorities.
- **Original writer rights preserved by stopping rather than guessing.** Pending imports have separate Source custody; multiple `living_works` may refer to one manuscript. Canonical encryption material subject is the verified `member_manuscripts.id`, not an invented or arbitrary `living_works` ID.
- **No production migration, public cutover, real beta member enrollment, email, model call or Source-vault mutation** in this R12 preparation. Existing old production unknown-custody Sources remain preserved. The real-member beta stays dark with admissions closed.

## Next acceptance order

1. Bind actual verified session to the origin and target with persistent, durable claim/transfer receipt after the real DB commit. Protect old pending key until new Work capsule and original bytes are durably stored and reread. Crash-fault every publish/claim/retire boundary; refuse non-atomic completion.
2. Finish relational/JSON/file-derived reconstructive inventory, metadata and prompt-copy treatment; independently prove no plaintext exists in the generated backup, WAL, snapshots or temporary files.
3. Establish independent key custody, authenticated antirollback signature generation, offsite encrypted SQL+original-Source paired snapshot, recovery test and all-replica deletion non-resurrection. Negative controls must reconstruct from old global backups and prove refusal for deleted Work.
4. Verify old/new reader and rollback, real iPhone Safari if offered, member-owned external import → edit → saved version → MAIA proposal Apply/Undo → reopen/export, revocation and self-custody.
5. Founder Class A **exact-SHA source review** and separate **exact-image canary GO** before any real writer, provider credential or production change.

**Disposition:** R12 source, crypto and physical SQL qualification PASS within tested scopes. Full encrypted recovery and member beta launch HOLD.
