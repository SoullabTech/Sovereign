# R70.19I — One fictional PostgreSQL snapshot, signed five-volume recovery, current deletion refusal

**October 18, 2026 · isolated Mac Studio PostgreSQL16 · real five-author Writer beta HOLD**

## Problem closed in fiction

R70.19H could verify a legitimate R1W-signed encrypted five-volume
fictional archive and validate a separately signed current Work/deletion
census, but its two test archives were from DIFFERENT original PostgreSQL
generations. In R70.19I the **same disposable canonical PostgreSQL16
database and exported MVCC snapshot** supply BOTH the actual Work/key
census and the `pg_dump --snapshot=...` encrypted SQL archive.

The five synthetic media/vault/voice-notes/workbench/audit-logs scopes
are protected by R1V's existing stable before/after checks and a single
fictional generation, then the existing R1W independent GPG signer
certifies that generation. A separate Ed25519 signer binds the *SQL-derived*
two-Work R1Q roster to the exact R1W certified manifest, both encrypted
component hashes, the exact test source commit, and the ordered file
scopes. Another distinct ephemeral Ed25519 signer authenticates the
current deletion checkpoint and expected roster provided outside the
backup. No signing private key is stored in a receipt or NAS backup.

## Independent recovery entrypoint

`scripts/ops/wsBetaR7019IIndependentSignedRestore.py` implements one
test-only sequence:

1. Verify exact fixture names and default-off mode; do not consult a
   private recovery key or create a database yet
2. Run existing R1W `gpgv` detached-signature validation against the
   separately pinned test public signer and exact encrypted manifest
3. Run `wsBetaR7019IFictionalCensusAuthority.mjs verify`, requiring
   separate valid Ed25519 signatures, the exact capture-time roster,
   manifest+SQL+five-volume hashes, independently expected Work identities
   and current minimum snapshot/deletion generations
4. **Reject any old signed backup containing a later-deleted Work or key
   before private-key access, Docker or a plaintext file**
5. Only for an authorized surviving cohort, use the independently held
   fictional GPG private key and existing R1V physical restore routines
   in a fresh no-network/no-host-mount PostgreSQL16
6. Compare every restored canonical Work/owner/key identity to the
   independently witnessed signed census; restore all five scopes and
   hash the six fictional files against the original capture-time bytes
7. Destroy restored plaintext data, disposable DB and temporary secret
   keyrings even on failures, publishing only counts/refusal categories

## Accepted physical scenarios

- **Survivor:** one exported PG16 repeatable-read snapshot and advisory
  lease, two actual canonical fictional `member_manuscripts` and R1Q
  key rows, five archived file scopes, detached GPGV signature and
  external Ed25519 census/deletion signatures; fresh SQL and file
  recovery passes and matches the signed census.
- **Postbackup deletion:** one actual fictional `member_manuscripts`
  row is deleted after capture (with its R1Q FK key cascade); a newer
  separately signed deletion high-water names that Work. The exact
  valid OLD R1W signed archive is rejected BEFORE the restorer checks
  any private key or starts a new PostgreSQL restore container.
- The original source PG and all five source file scopes are destroyed
  BEFORE either physical restore entrypoint is run. Temporary keys,
  test containers and recovered plaintext are removed afterward.
- All execution remains behind the explicit
  `R7019I_DRIVER=fictional-only`, `R7019I_CAPTURE_FIXTURE=fictional-only`,
  `R7019I_RESTORE_FIXTURE=fictional-only`, and
  `R7019I_FICTIONAL_AUTHORITY=fictional-only` boundaries.

## Still a production and confidentiality HOLD

- This is a SINGLE fictional member with two review-only R1Q wrapped-key
  rows whose bytes are not KMS credentials. It has no account-wide or
  historically complete Work index, nor real consent provenance,
  async/queue writers, external attachment storage, multiple tenants,
  account deletion, real KMS, or site-wide UI/provider behavior.
- The Work-census signer and deletion authority are ephemeral signing
  identities from the same trusted Mac process family. Their "external"
  custody means outside the archive folder **in the test**, NOT a
  durable independent governed off-host ledger. A test script can
  manufacture its own current high-water. It is not a production
  nonrollbackable authority.
- R1V's filesystem stability checks are not a production multi-writer
  write fence; only the fictional database is held on one read-only
  repeatable-read snapshot and fixture advisory lease. Live cross-store
  consistency for all writers and PostgreSQL WAL/PITR remains unproved.
- The real R87 backup has separate accepted database/vault/media/workbench
  restore proofs and 13 Source originals matching, but did NOT archive
  the R1W five-volume scope or complete a fenced generation. It has
  no signed full Work index, current deletion register or offsite key
  escrow and must not be conflated with this synthetic R70.19I point.
- The R1W source code and R70.19H old fixture entrypoints are unchanged;
  only R70.19I's *new* executable enforces this combined order. No
  production restore/admission paths have been replaced or activated.
- The old 02:00 UTC plaintext/gzip backup jobs and NAS history remain
  untouched. Encryption at rest, historical deletion non-resurrection,
  offsite protected-key plus passphrase recovery, independent member
  privacy/security review, signed deploy/rollback and founder GO remain
  hard release requirements.

**Disposition:** fictional one-generation signer/census/deletion/PG+five
file scopes integrated test PASSED; operational security, independent
external deletion authority, complete Writer beta remain HELD.
