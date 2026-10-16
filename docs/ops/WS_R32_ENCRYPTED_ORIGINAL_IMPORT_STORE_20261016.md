# Writer’s Studio R32 — Encrypted Original Source Arrival (HELD, fictional-only)

**October 16, 2026 · Target: five individually invited writers at `soullab.life`.**

**Parent source:** clean R31 `2233750d605ad4710eb4331abef27b3ec5d48bc1`.
**Disposition:** New real-repository encrypted original Source storage *tested* locally. **No real import endpoint, independent KMS, historical migration or member activation.**

## Problem addressed

The active `lib/manuscript/source/arrivals.ts` currently writes original file bytes to an ordinary vault path and extracted Source text, private original filename, MIME/extractor information into ordinary SQL. R31 counted a lower bound of 51 literal SQL writer candidates in 19 application files. The old, member-facing route is **unchanged**; do not claim an active migration merely because a new encrypted prototype passes.

R32 introduces `lib/writersStudio/recovery/heldOriginalSourceR32.ts`, a controlled encrypted-only variant for *fictional, already-owned Work imports*:

- The existing R11 AES-256-GCM `sealWorkSnapshot` encrypts **exact original bytes** in `original_source.bytes` and **exact extracted writing** in `manuscript_source_arrivals.source_text`. Both records share a new unique Source arrival ID and are authenticated against member, Work and generation in the existing WorkSnapshot associated data.
- Separate AES-256-GCM metadata encryption seals *private* original filename, MIME, extractor identifier, Source text SHA-256 and original byte length/hash. Associated data includes the exact member, Work, arrival ID, generation, Work key ID **and the digest of the sealed writing capsule**. Mixing a Work capsule with another metadata capsule refuses.
- The actual existing `writeDurableVaultBytes` publishes **both ciphertext files** with fsync, exclusive final publication and readback verification. The existing `lib/db/postgres.ts` then inserts only opaque identity, arrival, Work, generation, Work key ID, ciphertext file references, two SHA-256 digests and a pair digest, after a second owner rowlock. SQL does not receive original bytes, extracted words, filenames or extractor metadata as arguments.
- The review-only PostgreSQL 16 manifest `docs/ops/WS_R32_ENCRYPTED_ORIGINAL_REVIEW_ONLY.sql` is **outside migrations** and defines an immutable member-owned/source-ID unique pointer table. No production schema is modified.
- Reads require the same owner+Work+arrival/version, signed current deletion-highwater with independently supplied minimum generation, matching ciphertext digests, authenticated GCM and exact record/source-hash/provenance consistency. Foreign owner, revoked Work, wrong key, tampered ciphertext or altered metadata are refused.
- R32 is statically `R32_REAL_WRITER_SOURCE_IMPORT_ENABLED=false` and needs literal `R32_HELD_SOURCE_FIXTURE=fictional-only`. No active Next.js API route imports it.

## Actual isolated PostgreSQL 16 and vault qualification

The driver `scripts/ops/wsBetaR32OriginalPG16.py` creates a randomized `postgres:16.13` container bound only to Mac loopback, a disposable private file vault and an empty fictional schema with two synthetic owners. Its bootstrap gate waits for final PostgreSQL PID1 rather than the temporary image initializer.

**Initial physical phase:** `scripts/ops/__tests__/r32OriginalPG16.test.ts`: **12/12 PASS**.

- Five synthetic arrivals: file labels DOCX, PDF, TXT, MD and voluntarily pasted text. Uploaded *bytes are fabricated test buffers*, not genuine parser-valid DOCX/PDF packages. This tests **encryption, format/MIME validation, private provenance and byte-for-byte recovery**, **NOT real DOCX/PDF parser quality**.
- Fictional original bytes, extracted source, filename, MIME, extractor and text are recovered exactly; ciphertext manifests expose only opaque storage references/digests. Different Writer ownership is enforced.
- Negative controls cover fake/mismatched format and path-bearing filenames, oversized original, wrong key, revoked Work, stale deletion witness, missing key authority, ciphertext modification, SQL owner UPDATE/DELETE immutability and missing/foreign Work access.
- All **five arrival pairs = ten ciphertext objects** were written and verified. The *entire disposable fixture pg_dump* was scanned in memory for synthetic plaintext/filename sentinels; none were found. Vault ciphertext files also lacked those sentinel values.

**Second cold-process phase:** PostgreSQL was stopped with SIGKILL, restarted with the same disposable database and vault, then a fresh Node/Jest process opened the protected Source with an independently *stored but same-Mac, fictional-only test-key file*.

- `scripts/ops/__tests__/r32ColdOriginalPG16.test.ts`: **4/4 PASS**. Work owner, exact DOCX original bytes/source/private provenance, Markdown and paste-only Source survive restart; foreign-reader and current signed revoked-Work requests refuse.
- The temporary test-only key file was in a separate mode-0600 directory outside DB/vault/source, then removed. This is **not real independently administered key escrow, HSM or cloud KMS**. No cross-machine/offsite backup restore was performed.
- Disposable database container/anonymous volume, private file-vault files, and synthetic key escrow directory were all removed and verified absent.

**Source authorization unit tests:** `lib/writersStudio/recovery/__tests__/heldOriginalSourceR32.test.ts`: **7/7 PASS**, including default-off, no SQL/vault access under false flags, forged browser member claim, invalid Work/generation, missing independent authority and no live route import.
**Strict TypeScript:** `tsconfig.r32-encrypted-original.json`: **PASS**.
**Combined Source/Studio/custody regression:** **53/53 suites, 578/578 PASS** (52 inherited suites and seven new R32 negative tests), at current source.
**No user content or credentials:** All materials fictional; no billed model, AWS KMS, SMTP, live DB, real member or production config touched.

Founder-private receipts:
- `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R32_ENCRYPTED_ORIGINAL_PG16_20261016.json` (initial physical)
- `R32_ENCRYPTED_ORIGINAL_PG16_COLD_20261016.json` (physical + post-restart)
- `R32_ENCRYPTED_ORIGINAL_JEST_REPEAT_20261016.log`, `R32_ENCRYPTED_ORIGINAL_COLD_JEST_20261016.log`
- `R32_DISABLED_SOURCE_FENCE_20261016.log`, `R32_STRICT_TYPES_20261016.log`, `R32_COMPLETE_SOURCE_REGRESSION_20261016.log`

## Important limitations and real release STOP

1. **R32 assumes an already existing owner-verified Work.** Soullab's real `recordArtifactArrival` / `recordSuppliedArrival` / pending-unclaimed arrival → same-member `claimArrival` and member deletion/withdrawal laws have not been replaced. **R32 must not be wired into live intake until new/returning Work creation, pending encrypted Source and safe claim/rekey are integrated**, preserving original Source fidelity and user consent.
2. **Source files capped at 8 MiB; extracted text 4 MiB.** The underlying WorkSnapshot maximum is 16 MiB. Neither streaming/chunked large DOCX/PDF import nor supported-format parser robustness has been certified. An overlimit Source refuses: no silent truncation or plaintext fallback.
3. **Real external KMS, per-Work key retirement and independent nonrollbackable deletion witness do not exist** in the operational environment. R32 accepts a synthetic signature/key in tests. The current authority check is not a real cross-domain Work revocation-vs-commit fence: withdrawals during a slow immutable-vault write could race until the separately operated R30 coordinator is integrated and qualified.
4. **Two immutable ciphertexts plus one SQL row are not a distributed atomic transaction.** If SQL insertion fails after vault fsync, encrypted orphans may remain and must be reconciled under explicit deletion/retention law, never broadly pruned.
5. **Other legacy plaintext writers still exist**, including active original Source and extracted text, draft/revision snapshots, editorial Apply/Undo/keeps, and derived editorial/structure JSON. SQL/WAL/replicas/old backups/model-provider traces and previous app images remain out of scope. Complete no-plaintext migration and independent older-backup after-delete refusal are mandatory.
6. **Real-browser/source/MAIA/Portal acceptance not done.** Member sign-in, current consent, DOCX/PDF parser, upload streaming, author-controlled import, save/edit/Undo, reopen/export, adjustable columns, physical iPhone Safari and approved non-Resend invites still require a full exact-source/image workflow. Full global ship TypeScript and production build are not proven by scoped tests.
7. **No production cutover authority.** Founder exact-source and frozen-image Class A GO, rollback/restore, operator-approved external custody and cost/retention policy required before up to five individually verified members on `soullab.life`.

## Next engineering order

**R33** should adapt the encrypted-only original Source capsule into the **pending → owned Work claim** lifecycle, with a separately verified session and independent Work/Source key authority. Preserve the R12 claim race and R14 signed provenance rules; protect any held and unclaimed original file immediately rather than first writing it to the ordinary vault. Start with fictional PG16 and exact Source/claim/ciphertext restoration. No real import handler wiring or SQL migration before an independently witnessed deletion and legacy-content transition.

Then tackle R31 waves B–D, full real Source/SQL/WAL/backup migration, offline/current-key restore and Safari editorial acceptance.

**R32 PASS is the isolated encrypted original Source storage path—not a deployed protected intake, historical migration, independent KMS, or authorization to invite five real writers.**
