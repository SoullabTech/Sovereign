# R1W — independent signing and verification of encrypted recovery points (HOLD)

**18 October 2026 | source-only security integration for the completed R1V Minisforum fixture.**
**Parent R1V:** `764d6fbd5b283efcda22896525d71e7c051bbddb`.
**Release:** **HOLD. No real KMS, production backup, private signing key or member data used.**

## Why R1W exists

R1V passed **57/57** checks for an encrypted PostgreSQL 16 backup plus all five live-shaped writable file-volume categories, and successfully restored **2 fake SQL rows plus 6 fake files** after the original source was destroyed. But its manifest held only **SHA-256 hashes**. A party who can alter ciphertext and that JSON can replace both and recompute hashes. The current production backup jobs remain two **unencrypted** gzip-only SQL writers; the successful R1V fixture has not been installed. R1W adds an explicitly separate cryptographic signature/verification step, **without turning on the production writer**.

## What was added

- `scripts/ops/wsBetaR1WSignedGeneration.py` — **fictional-only** signing authority. Reads the already-accepted R1V completed encrypted point and re-verifies both ciphertext hashes, five-file-volume scope, completion metadata and all held release flags. The signer must use a **separately provided signing private-key home** outside the writer's directory, plus an independently specified public keyring and pinned 40-character signer fingerprint. It copies **only ciphertext and its existing R1V manifest** into a new, private `.r1w.pending.*` directory, emits detached **OpenPGP Ed25519** signature `manifest.sig`, verifies the actual GPGV `VALIDSIG` signer fingerprint against the pinned value, rechecks original ciphertext equality, and only then atomically publishes a new `certified/<generation>/` with exactly **four** files. Three injected failure stages cannot publish or retain a pending point. No signer private key or unencrypted content enters the certified bundle.
- `scripts/ops/wsBetaR1WSignedIndependentColdRestore.py` — **separate executable**. Requires external GPGV public keyring, exact authorized signing fingerprint and the four-file certified point. It checks scope, permission, ciphertext SHA-256 and actual GPGV signature **before** reading the recovery key location, touching a test PostgreSQL container or creating a restored file. Only after signature verification does it reuse the R1V independently reviewed fixture-only PostgreSQL + safe tar extract routines. No fallback to unsigned R1V points, trusted issuer from the archive itself, keyless decrypt or production PostgreSQL.
- `scripts/ops/wsBetaR1WSignedGenerationTamperFixture.py` — tests missing/altered manifest, ciphertext, signature, symlinks, weak permissions, extra files, forged production-approval flags, copied/replayed generations, signer fingerprint mismatch, and an adversary with a **different valid signing key** even when the verifier public keyring contains both public keys. Wrong-signer attempts refuse before PostgreSQL access. All modified sample points are copies in isolated T7 folders and removed afterward.
- `scripts/ops/wsBetaR1WSignedColdRestorePG16.py` — end-to-end **REAL disposable PG16**: with new fictional SQL and five file-volume roots, it calls the R1V encryption writer using a test public encryption recipient, then calls the independent signature authority using a **separate fictional Ed25519 signer**, verifies the certified point, destroys the original fake SQL database and five original file roots, and restores into a new PostgreSQL 16 container plus five private file directories via the new signed-only restorer. It verifies exact two-row and six-file contents. The signature key, decryption key, restored plaintext and test containers are destroyed.
- `scripts/ops/__tests__/wsBetaR1WSignedRecoverySafety.test.cjs` — default-off, exact pinned signer, filename, restoration ordering and code-custody source laws. No actual backup or AWS operations.

## Explicit trust model

The backup writer possesses **only a public encryption key**, not the decryption private key or signing private key. A separately controlled signer verifies ciphertext hashes and signs the R1V source manifest. A recovery operator independently pins the allowed signer fingerprint and knows the trusted **public signing key** without retrieving it from inside the backup. This guarantees the manifest bytes come from that signer, assuming the private signing key remains secret; it does **not** certify the signer's real-world independence or underlying database/file snapshot consistency.

**R1V's manifest correctly continues to record `manifestIndependentlySigned=false`: it was NOT signed at the time the writer produced the unsigned point.** R1W's separate detached attestation confers only a **fictional signed/certified** status, not permission to call it a live production/complete historical Work backup. An attacker who knows only backup ciphertext cannot forge the pinned detached signature; a compromised signer could still sign dishonest data, so independently governed signer custody, immutable offsite signed receipts and dual control remain necessary.

## Current integration with other beta work

The separate ongoing **R19/R20 key-custodian** lanes are still source candidates and are not silently merged here. The separate **R70.19 fictional cross-writer coherence** lane addresses the more difficult SQL+vault/source commit-barrier problem and likewise is not qualified for real-production mutation. R1W is a bounded signed-backup custody enhancement, not a substitute for those governance gates. The R1S strict Next.js full build, R1T fictional SQL+vault recovery and R1V five-volume real PostgreSQL tests remain separately preserved.

## Qualification and remaining blockers

| Gate | R1W disposition |
|---|---|
| Detached signature independently verified using pinned public fingerprint | FICTIONAL PASS |
| Wrong signer (even valid under multi-key keyring), altered ciphertext, forged GO, replay, missing signature | FICTIONAL PASS |
| Separate signed-only cold restore: actual PG16 + five fake file volumes, source deleted first | FICTIONAL PASS |
| Separate ephemeral signing and encryption/recovery private keys, test keys deleted | FICTIONAL PASS, **same physical Mac in test** |
| Production key custodian, signer on independent machine, immutable offsite evidence | **HOLD** |
| Consistent actual PostgreSQL/WAL, full Source/attachments/vault/erasure snapshot | **HOLD** |
| Privileged Minisforum writer service/cron replacement from two gzip jobs | **HOLD; NOT IMPLEMENTED OR AUTHORIZED** |
| Old SQL/NAS/recycle/snapshot retention and deletion nonresurrection | **HOLD** |
| Genuine model source and current member-approved encrypted Apply/Undo | **HOLD** |
| Writer beta five-person release | **HOLD** |

**Security note:** R1W's signed `certified` point is not an S3 Object Lock, immutable filesystem or cloud audit log. Replacing/deleting the whole signed generation or signer public-key trust distribution can still cause denial of service or rollback to an older valid signature. A production release must pin a trusted **latest-generation ledger** and prevent restore resurrection across erasure epochs. A possible file change between verification and decryption also remains a production immutable-snapshot/open-descriptor concern. Cryptographic integrity of a completed fixture does not guarantee cross-store commit coherence.

## Next bounded safe step

1. Reconcile the separately developed R19/R20 custodian and R70.19 writer-fence work into a **new isolated** merge-review lane, preserving their fail-closed flags and custody. No parallel lane or active production branch should be reset/overwritten.
2. Qualify a real recovery signer/verification public key independently of the backup writer, plus a signature/manifest provenance ledger with immutable offsite retention, key rotation and revoked-Work semantics. Do not generate a real recovery private key automatically or insert it into a cron job.
3. Prove the SQL/Source/vault/WAL and erasure consistency barrier on production-equivalent fictional Linux services, including interrupted writers, rescinded consent, lost key and failed file/archive capture.
4. Re-review exact current Minisforum scripts, cron, keys, mounted paths and operational authority, and separately seek founder approval for production implementation, independent cold restore and eventual controlled dual-cron retirement. The current R1V/R1W source **has no production execution mode**.
5. Only then pursue protected Writer real-member release tests, actual model attribution and a separate founder beta GO.

**No real SQL, manuscripts, live Docker, production NAS, cron, KMS, cloud, paid API, GitHub push, protected merge or beta invitation was touched or requested by R1W.**
