# R70.19H — Independently pinned signed R1W fixture and current Work deletion gate

**October 18, 2026 · isolated Mac Studio source, fictional ciphertext only.**
**Production restoration, recurring backup cutover, and real private manuscript beta remain HOLD.**

## Scope and exact source

Parent baseline: committed, locally qualified R70.19G `f2ddae9ad6ef7d237ca0bfd01dc933b58359d0cf`.
This bounded correction adds a **new, default-OFF test-only gate** and negative
fixtures. It neither edits the existing R1W restorer nor asserts that all
Writer mutations or member assets are covered.

- Physical R1W fixture: `/Volumes/T7 Shield/ws-beta-r1w-exact-tamper-20261018/certified/20261018T062721Z-40d252ba`
- Out-of-bundle, pinned R1W GPGV public signer:
  `/Volumes/T7 Shield/ws-beta-r1w-independent-signed-recovery-review-20261018/R1W_FICTIONAL_PUBLIC_SIGNER.gpg`
- Pinned signer fingerprint: `35B4553EFB55A54ACF387D6EC15EA2942448481F`
- Exact fictitious R1W source commit:
  `1e9eee64306197a0f52e7b547ee3bdd279d786fa`

The earlier R1W **cold-restore test** at
`ws-beta-r1w-exact-signed-cold-restore-20261018` was signed with a
**different fictional test identity**. That bundle intentionally cannot be
verified with this review's later pinned signer and should never be mixed
with it. This lane verifies the correctly paired **tamper-fixture** bundle.

## What the test really does

1. The R1W Python public-verification entrypoint runs `gpgv` against the
   fixture's detached signature and independently pinned public signer,
   validating encrypted PostgreSQL, encrypted five-volume archive, and the
   original R1W manifest. **No decryption private key is consulted.**
2. Its verified generation, exact R1W manifest SHA-256, both encrypted
   component SHA-256s and five ordered file scopes are bound in a new
   canonical R70.19H *fictional* Work/key census with a separate Ed25519
   signature. An unsigned JSON boolean cannot manufacture a verified
   physical R1W witness.
3. Before any fictional restore callback, a second independently supplied
   Ed25519 signer, signed current deletion checkpoint, minimum snapshot
   generation, minimum deletion generation and independently expected
   sorted Work/key roster must all match. Existing
   `requireCurrentRestoreAuthorization` checks revocation for each Work
   and key in the signed census.
4. A valid old R1W signed archive is still refused when any included
   Work/key is now revoked, the independent minimum generation advances,
   the signer is incorrect, the externally expected roster differs, or the
   ciphertext/manifest hashes are changed.
5. An unrelated Work that remains authorized may reach an **in-memory
   fictional callback**, whose return value explicitly states that no
   physical PostgreSQL restoration occurred.

## Why this is deliberately NOT a production restoration

- The R1W five-volume fixture's PostgreSQL contains only two invented
  `fictional_works` rows. Its new R70.19H signed Work identities are
  **generated in Jest**, not independently enumerated from that PostgreSQL
  archive. R70.19F separately proves SQL-derived capture-time Work census
  in a different fictitious snapshot. **The two physical datasets have not
  been unified**. No full-production Work census is claimed.
- The census signer and deletion authority use separate ephemeral
  in-process signing keys. They are **not independently governed, durable,
  off-host trust roots** or real consent/erasure authority.
- The new bridge does not modify or install the original R1W Python
  restoration entrypoint. Its existing optional fixture-only restore path
  does not universally enforce this new current-deletion check. Never
  treat a passing callback as a production restore admission.
- The test verifies signatures and hashes using path-based file reads.
  For production it would also need immutable source storage or locked,
  verified file handles through the entire decryption boundary to defeat
  time-of-check/time-of-use substitution.
- The GPG-signed R1W manifest does not itself contain a complete signed
  capture-time Work roster or independently anchored source commit. The
  *separately signed fictional census* binds the verified R1W manifest
  digest, but cannot retroactively prove complete original capture.
- R87 real recovery covered PostgreSQL plus vault/media/workbench, **not**
  every R1W five-volume scope (voice-notes and audit-logs), nor WAL, current
  deletion ledger, key escrow, historical gzip/plaintext backups, or all
  background Writer/consent mutation routes.
- Production flags remain:
  `R7019H_PRODUCTION_RESTORE_BRIDGE_ENABLED=false`,
  `R7019H_CURRENT_EXTERNAL_ERASURE_AUTHORITY_CERTIFIED=false`,
  `R7019H_ALL_PRODUCTION_WORKS_CENSUSED=false`.

## Acceptance

Run in an isolated exact-source checkout on the Mac containing the approved
fictional R1W test bundle and signer public key:

```bash
R7019H_PHYSICAL_FIXTURE=fictional-only \
  ./node_modules/.bin/jest --config jest.config.js --runInBand \
  lib/writersStudio/recovery/__tests__/heldR7019HSignedR1WDeletionBridge.test.ts
```

Without the physical-fixture opt-in, only the default-off refusal test is
allowed; other tests are visibly skipped, not silently certified.

**Next bounded engineering milestone, R70.19I:** Within a single
fictional generation, obtain the Work/key census from the **same real
PostgreSQL fixture** encrypted in the five-volume signed recovery point,
bind it to the manifest and current independently witnessed deletion
floor, and require the pre-decrypt gate inside the one allowed physical
restore entrypoint. Prove post-backup deletion refuses before GPG key or
Docker; prove unrelated survivors restore. Full-member coverage,
off-machine escrow, WAL, historical replicas and deployment remain
separate Class A requirements.

**Disposition: fictional signed-R1W/census/deletion ordering verified,
no production decryption authority, no five-tester real-writing admission.**
