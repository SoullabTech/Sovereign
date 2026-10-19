# WS-VAULT-BACKUP-01 — Encrypted manuscript vault backup & recovery

**Status:** Class A engineering candidate · DEFAULT OFF · **NO PRODUCTION BACKUP PERFORMED** · no installation, cron, systemd timer, or change to member custody.

**Branch:** `feature/ws-vault-encrypted-recovery-20261012` (separate from the immutable Writer's Studio beta target `9520d13691`).
**Owner/authority:** Founder-Steward and independently evidenced Class A review. This document records engineering evidence, **not** an approval or a relaxation of WS-DELETE-01.

## 1. Actual source of truth

- Production manuscript Source files are in Docker volume `maia-sovereign_vault_data`, mounted at `/app/data/vault` inside `maia-sovereign`. Roughly **141 MiB**, **21** vault files at October 12 inventory. **15** ordinary Source files under `manuscript-sources`: **13** referenced by `manuscript_source_arrivals`, **2** unreferenced; all 13 references have bytes present. Investigate the two unreferenced files separately in [#1786](https://github.com/SoullabTech/Sovereign/issues/1786), **do not delete**.
- The Minisforum has ample internal storage and reaches Synology share `//192.168.4.42/soullab-backups` over CIFS at `/mnt/ds225`. NAS PostgreSQL archives have already passed a full isolated 1.1GB restore, but **that test did not back up the file vault**.
- Current nightly backup script copies **PostgreSQL + media**. It does not include `maia-sovereign_vault_data`.
- A public encryption key marked **MAIA Backup** is installed on the Minisforum. **No corresponding private recovery key was verified on either the Minisforum or the Mac Studio.** A public key can encrypt backups but **cannot prove they can ever be decrypted**. Its custodian and offline restore station remain an explicit blocker.
- The NAS CIFS client presents directories/files with permissive projected modes `0755`. Inspect Synology-side ACL and guest access, separately from these client-projected permissions, before stating backup access is private ([#1785](https://github.com/SoullabTech/Sovereign/issues/1785)).

## 2. Backing up without plaintext staging

`scripts/ops/backup-manuscript-vault.sh` defaults to `--preflight`, which checks the **exact** Docker volume, NAS source, public-key presence, filesystem tools, and mount availability without opening file bodies or creating an archive.

After independent authorization, an explicit `--execute` can:

1. Mount `maia-sovereign_vault_data` **read-only** in an ephemeral container, with user ID 1000, no network, no extra Linux capabilities and read-only root. The tar stream includes file bytes, paths, permissions, and directory structure; none are printed as plaintext log metadata.
2. Pipe the TAR stream **directly into GPG public-key encryption (AES-256)** on the Minisforum. No plaintext TAR file is written to internal SSD, NAS, or a third-party service; the key and NAS credentials never enter the reader container.
3. Write ciphertext to a unique pending file on the approved NAS backup folder. Require pipe success, nonempty output, ciphertext hash, filesystem sync, atomic no-clobber link publication and matching ciphertext readback hash. A failed stream is **not** a completed backup.
4. Emit only encrypted artifact hash and byte count. No automatic old-backup pruning and no unexpected member content or names in logs.

It requires explicit Class A, recovery proof, erasure/retention policy, NAS ACL and execution acknowledgments. **These environment declarations alone are not independent approval**; the governing PR, recorded founder authority and actual review must be verified separately before installation or invocation. `--execute` is not authorized at this checkpoint.

`scripts/ops/vault-archive-stream.sh` implements the Docker volume stream separately so the actual volume-reader logic is regression-testable with a disposable Docker volume.

## 3. Executed synthetic tests — 2026-10-12

All positive/negative tests ran on the Minisforum with disposable fixtures, not live member files.

| Check | Witness | Outcome |
|---|---|---|
| Production preflight checks | Existing exact volume + Synology CIFS + MAIA Backup **public** key, no source read | PASS |
| Synthetic archive encryption | Generated fixture with text, nested binary, links; short-lived test GPG key held under tmpfs | PASS |
| Missing private key | Separate empty GPG home cannot decrypt ciphertext | PASS |
| Direct round-trip | Decrypt and restore fixture; content hashes and symbolic-link targets match | PASS |
| Deliberate cipher tampering | Modified ciphertext must fail GPG integrity check | PASS |
| Synology encrypted round-trip | Only fixture ciphertext copied to dedicated NAS fixture directory; hash unchanged; decrypted files match | PASS |
| NAS no-clobber and durable publish | Hardlink and directory fsync succeeded in synthetic NAS directory | PASS |
| Unauthorized real-source operation | `--execute` without governed acknowledgments refused | PASS |
| Read-only Docker volume stream | Synthetic disposable Docker volume read by networkless unprivileged container; exact files recovered; malformed volume id rejected | PASS |
| Docker volume stream **through GPG** | Same unprivileged read-only Docker volume encrypted directly, then decrypted and content verified with disposable recovery key | PASS |
| Current live volume *metadata only* | 21 total files, 0 files unreadable by UID 1000, 0 unreadable dirs | PASS |
| Cleanup | Fixture NAS directory, temporary test secret key and test source directories absent afterward | PASS |

**Not proven:** encrypting live member files, real-key decryption, point-in-time cross-store consistency, backup erasure on a member's deletion, or restore of a real archived production vault. Do not collapse these into a "full backup certified" claim.

### Existing MAIA Backup key challenge (synthetic only)

A 249-byte challenge encrypted to the existing MAIA Backup public key has been copied to the Mac Studio, at:

`~/Documents/MAIA Vault Recovery/MAIA-vault-private-key-challenge-20261012.gpg`

Its companion instructions are in the same folder, with an expected decrypted **synthetic** SHA-256 digest. Ciphertext SHA-256: `72c8c71361bb50ab8915c5b992604f3b84df15bbdef2741510f08306a9976c09`. **The private key is not on the Mac Studio or Minisforum.** A custodian can transfer the harmless encrypted challenge to an already trusted device holding the private key and compare the decrypted synthetic digest. This cannot restore real members' bytes and confers no production authorization.

## 4. Recovery procedure (NOT YET AUTHORIZED)

Independent key custodian must first identify a **separate user-controlled recovery station** that holds the MAIA Backup private key. Do **not** paste the key, passphrase, or seed into chat or import it onto the public Minisforum. Check that the key fingerprint matches the backup's public recipient.

The custodian performs an authorized **synthetic encrypted challenge** to prove private-key decryption without exposing production bytes. Once governance and consent allow a real backup, restore into a fresh, restricted, separate, empty recovery destination rather than the live Docker volume. Decrypt and validate GPG integrity fully before promoting any restored files; compare recovered file hashes and relevant authorized database Source rows without disclosing prose. No automatic restoration over current member work.

A full recovery requires BOTH the PostgreSQL snapshot and the matching file-vault snapshot. Schedule the vault archive **after** the database snapshot, and verify that every file-backed Source reference in that snapshot can be recovered from the vault backup. Exact point-in-time membership and ongoing writes require their own bounded witness before automatic scheduling.

## 5. Retention and deletion — GOVERNANCE STOP

The constituted rule `WS-DELETE-01` states that **Delete Work must remove source bytes and reconstructive provenance**. A monolithic versioned vault backup could otherwise retain copies of deleted Works, making the UI's deletion promise untrue.

**DO NOT authorize a rolling backup or scheduler without an explicit Class A ruling on all of the following:**

- Are uploaded source files and deleted Works permitted to reside in time-bounded backups? If yes, the exact retention window, member disclosure, scope and access authority must be specified; if no, design deletion propagation/cryptographic erasure for archived source bytes before storing real snapshots.
- How does the backup index map a member-governed erasure to **all** copies, including NAS snapshots, temporary artifacts, offsite copies and their encryption keys, without leaking manuscript filenames or content into an unencrypted index?
- How will orphaned arrivals and the two pre-existing unreferenced files be preserved or erased under `WS-DELETE-02` (currently unresolved)?
- Who approves archive deletion or expiry? Do not infer that an age-based auto-sweep is a member authorization.
- What is the test for impossible-to-restore/deleted bytes, and what is the failure response when a replica cannot be removed?

Until decided, leave `--execute` disabled by lack of approved receipts and **do not schedule any live-vault backup**. Preserve originals. A snapshot without restore authority and erasure governance is **not** a privacy-protected finished backup.

## 6. Release gates and deployment relationship

- Exact Writer's Studio beta target stays `9520d13691`; public site stays `c9e4f7f7e` pending Class A reviewer, migration Review-Custody, recovery and Jondi device acceptance (draft [#1784](https://github.com/SoullabTech/Sovereign/pull/1784)).
- Vault-backup changes are a **separate Class A PR** with explicit founder/mentor review. No unrelated migration, route or interface changes. No active production backup script, cron, database, NAS ACL, Docker image, or member manuscript changes.
- Before production act: admit strict review → approve backup erasure/retention law → prove public/private key pair recovery with the custodian → review NAS ACL → backup synthetic/real under explicit authorization → restore offline → verify Source/DB integrity → record evidence → schedule separately if authorized.
- Rollback before execution is trivial: do not install the candidate. After installation, disable only the new job and retain independently governed existing backups. Never delete or overwrite any Source artifacts to perform a rollback.

**No private keys or member manuscript contents belong in this review packet.**
