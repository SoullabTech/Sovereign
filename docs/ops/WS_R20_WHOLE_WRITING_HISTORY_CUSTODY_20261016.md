# Writer's Studio R20 — Whole-writing-history custody perimeter

**Date:** October 16, 2026
**Parent:** R19 `9fbdb71c950c276d5508eda9ad65618af27de3db`
**Destination intention:** five invited writers on `soullab.life`
**Decision:** **STOP — real writer content still not certified for admission**

## What changed

R19's actual closed beta PG16 schema metadata inventory identified seven direct text-compatible fields that would prevent a truthful claim of encrypted manuscript custody. R20 broadens this perimeter across historical revisions, preserved verbatim passages, before/after recovery text and derived editorial content. The new source is `lib/writersStudio/recovery/historicalContentCoverageR20.ts`, a pure, fail-closed extension of the R19 metadata verification.

**Actual previously captured dark-beta metadata** was evaluated locally; this iteration did not query the server or select any manuscript rows. Result:

- **11 direct manuscript/history/private-provenance fields** observed and required for the future migration plan, including original Source and filename, current chapter, continuous and section-level drafts, revision history, keeps, proposed and expected edits, and recovery before/after copies.
- **8 contextual/editorial fields**, including proposed-edit rationale and JSON context, structural interpretation/evidence, chapter headings and structural titles. These may contain derivations or private author wording; they are *review-required*, not all proven to be raw plaintext.
- **29 remaining R19-prioritized fields not yet classified by the R20 registry**. Not one of these is automatically declared safe or eligible for exclusion.
- The broader underlying schema census recorded **918 text/JSON/binary candidate fields**. Only a targeted subset is reviewed by this gate, so the inventory is deliberately not described as exhaustive.

R20 refuses missing/inconsistent metadata or any of the 19 identified fields. If valid, it returns `HOLD_HISTORICAL_PLAINTEXT_AND_DERIVED_COPIES` with `canAdmitRealWriters=false` and `canTreatEncryptedPairAsSoleCustody=false`. It cannot return GO. Even an eventual ciphertext-only new writer cannot be considered secure while old SQL, WAL, exports, unclaimed Source, rollback images or offsite backups retain independent reconstructive copies.

## Tests and operational boundaries

- R20 metadata/source-focused negative controls **8/8 PASS**.
- Carried-forward selected R9–R19+R20 regression **35 suites / 425 tests PASS**.
- Strict targeted TypeScript **PASS**.
- A read-only local CLI evaluated the existing private R19 metadata snapshot, producing a private receipt; it has **no DB connection and no runtime route**.
- No production, public Caddy, database migration, vault, mail, model, member record, custody key, browser invitation or authorization setting changed.

Private metadata receipt: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R20_REAL_SCHEMA_HISTORY_HOLD_20261016.json`.
Tests: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R20_INTEGRATED_REGRESSION_20261016.log`.

## Next implementation, not another census

**R21 should implement an isolated, fail-closed, actually encrypted writer-only content path and paired restoration** covering every direct writing source and historical revision, without modifying live plaintext routes. It must tie each member/Work/arrival/section/revision ownership to server-verified session + current signed consent and invite; an independent key custodian and separately signed, nonrollbackable deletion epoch are mandatory. Do not describe fictional signers as independent authority.

Before R21 can be used for real writing: review every prioritized derived/JSON field and classify any secondary copy/export, qualify actual PG16 migration + least-privilege writer ownership and paired Source vault, perform restore from independent full DB/vault/key backup with exact legacy reader rollback, confirm access on withdrawal and irreversible deletion non-resurrection. Stop if ordinary author text can still be written to legacy SQL, old replica, WAL or provider memory without an approved custody policy.

Then run one enforced, exact-image integrated production build, true Safari Mac/iPhone Develop/Write/Review/MAIA/Apply/Undo/save/reopen/export qualification, and obtain founder exact commit/image cutover approval. Keep `soullab.life` on its current healthy production image meanwhile. A five-person beta does not waive member custody.

**R20 result is a more accurate safety perimeter, not encryption, a production migration, or permission to launch.**
