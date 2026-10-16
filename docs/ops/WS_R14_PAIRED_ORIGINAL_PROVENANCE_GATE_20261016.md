# Writer's Studio — R14 paired original-provenance recovery candidate

**Date:** 2026-10-16, America/New_York
**Disposition:** isolated candidate verification PASS; **real-member data recovery, erasure and admission HOLD**.
**Parent:** R13 source `f03b4b942fe16de2adde78c62ec431085aafc6c6`.
**Deployed public fictional-only beta:** R9 source `d2020f7bfa66286c5f4b274d2a5fdb17b8c913b2`, unchanged.

## Purpose and implementation

R13 can durably journal a Source claim and an encrypted manuscript capsule, but its R12 predecessor explicitly refuses to certify that the destination holds the original filename, MIME, extraction method/version and complete provenance. Consequently **R13 must not retire a real pending key or original** from an R12 source capsule alone.

R14 adds two **versioned, isolated** modules, with **no production API, database migration, backup scheduler, signer installation or model dispatch**:

1. `lib/writersStudio/recovery/originalProvenanceV2.ts` — an exact, strictly canonical Ed25519-signed provenance statement binding the approved claim/member/arrival/manuscript, generation, artifact-vs-paste, exact UTF-8 text hash+length, original artifact hash+length, private original filename, MIME, extraction method/version. Source names are preserved without normalizing byte or Unicode forms. Member-supplied text is constrained to the established `member-supplied` / `n/a` extractor convention and cannot invent a file.
2. `lib/writersStudio/recovery/pairedOriginalCustodyV2.ts` — an AES-256-GCM **encrypted companion** for that signed provenance, under the distinct manuscript/Work key. The AAD binds it to the verified claim, member, original arrival, manuscript, generation, key ID and the exact encrypted Work digest. A versioned opaque paired manifest records hashes of BOTH encrypted parts and refuses unreviewed plaintext attributes in either outer envelope. The member filename, MIME and method do not appear in the public companion envelope.

**Restoring** a pair requires verified independently supplied original claim signer + minimum epoch, independently supplied provenance signer + minimum epoch, and independently signed **current deletion high-water with separate minimum generation before either half decrypts**. It verifies exact Source bytes and signed provenance after decrypting. An intact old encrypted pair for a revoked Work must refuse even when the Work key is still physically available.

## Test evidence

- Isolated R14 focused tests: **25/25 PASS across 2 suites**. Includes wrong key, forged/changed filename or MIME, copied provenance, same-key swapped manuscript AAD, cipher alteration, extra plaintext outer fields, withheld independent signer/high-water, stale policy, revoked Work, paste without invented file, and reader downgrade refusal.
- Focused strict TypeScript: PASS.
- Combined R9 + R11 + R12 + R13 + R14 regression: **374/374 PASS across 30 suites**.
- Physical opt-in fixture `scripts/ops/wsBetaR14PhysicalProvenance.ts`: **33/33 PASS**. Uses newly created networkless PostgreSQL 16 and exactly three disposable volumes (DB, encrypted pending Source, encrypted Work). Tests a fictional same-member claim committed in DB, signed metadata from the owner-joined DB record, encrypted paired file readback, manifest persistence, real PG restart and full reconstruction of original file bytes + filename, MIME, method/version.
- Five physical negative scenarios: missing provenance half, mutated encrypted provenance, newer deleted-Work denial, stale signed deletion checkpoint denial, and missing external deletion authority. All **four disposable Docker resources cleaned**. No real members, production volumes or provider keys touched.
- Exact evidence logs under `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/`: `R14_PROVENANCE_TESTS_20261016.log`, `R14_FOCUSED_TSC_20261016.log`, `R14_PHYSICAL_RUN_20261016.log`, `R14_PHYSICAL_PROVENANCE_20261016.json`, `R14_INTEGRATED_REGRESSION_20261016.log`.

## Critical boundaries that remain OPEN

- **No live author storage is encrypted by R14.** A schema-only readback of the actually isolated and empty real-beta PostgreSQL confirms `original_filename`, `mime_type`, `extraction_method`, `extractor_version`, `artifact_ref`, `source_text` remain ordinary `text` columns in `manuscript_source_arrivals`. Empty real-beta Source census: **zero**. An encrypted companion does not remove these reconstructive values from old SQL archives, WAL or snapshots.
- **The companion is not part of the R13 retirement journal.** R13 V1 binds only the Work digest and requires `ORIGINAL_FILENAME_AND_MIME_NOT_CERTIFIED`. A future reviewed pair-aware R14/R15 journal must bind Work AND provenance ciphertext digests; no automated key-retirement or deletion may reuse the old journal without that adaptation.
- **No genuine independent signer or key service exists in this qualification.** Ed25519 signers and AES Work keys are generated **only** in the fictional test process. Caller-supplied trusted epoch is not proof of an independent durable antirollback register; a real signer must authenticate the committed PostgreSQL owner/Source and decryptable original Source **before** issuing any V2 provenance claim.
- **No universal SQL/file/WAL/replica audit.** R11 reconnaissance identified 389 possible content-adjacent fields, including 68 candidate author/editorial fields beyond the initial ten. Some are unrelated and need human technical adjudication, not blanket classification. Render/export data, revision history, provider-held material, filenames stored in relational rows, `artifact_ref` and old global encrypted/plaintext archives require special handling.
- **No automatic original-path restoration guarantee.** The V2 signed contents preserve filename, MIME, extractor and byte integrity, but the old storage `artifact_ref` reference and physical custody rehydration are **not** certified. Do not promise original DOCX download solely from this test.
- **Size/streaming:** Existing v1 Work capsule is capped at 16 MiB before physical envelope encoding; real large illustrated manuscripts need reviewed chunking, nonce sequencing, section counts and crash-safe streaming before admission.
- **Legacy reader:** a V1 single-Work reader explicitly refuses the full V2 package. Stripping V2 provenance and restoring only the old inner Work ciphertext would lose lineage; the downgrade/rollback must be separately witnessed.
- **Consent, access and launch:** Founder-approved exact member-facing notice, trusted provider processing terms, independent backup keys and all-replica deletion non-resurrection, individual invitation, device/browser editorial acceptance and founder exact-source + exact-image cutover authority remain OPEN.

## Next integration order (R15)

1. Review and version a pair-aware durable **manifest + outbox** in PostgreSQL, with signer-bound ownership and verified hashes of both ciphertext objects; recover after power loss without dropping private metadata.
2. Design a limited-privilege real key-custodian interface and independently administered antirollback checkpoint with durable trust roots *outside* Writer's Studio backup replicas. No permission bypass or new cloud key, billing or provider dispatch is implied.
3. Migrate the currently empty dark real-beta lane only after a reviewed encrypted writer adapter is ready; prove DB+vault+WAL+replica no-plaintext negative tests, independent encrypted offsite restore and cryptographic/key deletion non-resurrection.
4. Test old/current reader reversibility, first member consent/identity, real iPhone Safari and the entire MAIA Develop → Write → Review → Apply/Undo → reopen/export journey.
5. Founder Class A source signoff on an exact SHA and separate exact-image release GO; admit one verified tester before broader cohort.

**Outcome:** R14 cryptographic source and fictional physically persisted provenance recoverability PASS. **Live encrypted custody, key retirement, deletion completion and real-member beta launch remain HOLD.**
