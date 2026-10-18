# R70.19G — Coexistence review of signed five-volume backup and Writer Work-census protections

**18 October 2026 · isolated code-only integration · real manuscript beta HOLD**

## Exact lineages reconciled (not production-promoted)

- Base: committed R70.19F `7c6d3dfd247ebd6d75f0f21575c88fd4d3afa215`; its accepted prior R85/R91/R86 ancestor is `55d36a79b80dccf3b165885a573af1a6d948e955`.
- Applied three additive, existing commits **without merging parallel worktree changes**:
  - R1T `abd9ddfc9`: fictional encrypted database/file-vault physical restore
  - R1V `764d6fbd5`: held five-volume backup writer, explicit production/cutover refusal
  - R1W `1e9eee64306197a0f52e7b547ee3bdd279d786fa`: detached OpenPGP Ed25519 independently pinned signer verification, including signature checks before decryption
- Integration delta: 18 new files, 2668 lines, **no overwritten existing R70.19F file**. No production installation, GitHub push, NAS archive read, decrypted member content, key access or member invitation.

## What source coexistence demonstrates — and what it does not

The R1T/R1V/R1W source-law and disabled-mode checks can run alongside R70.19F Work/key signed snapshot tests. But **there is no single verified production recovery protocol**; the two designs are deliberately not treated as interchangeable.

### Precise protocol incompatibilities

1. **Archive shape:** R1W's signed four-component certified generation consists of `postgres.pgdump.gpg`, `files.tar.gpg`, `manifest.json`, and `manifest.sig`; its R1V manifest enumerates **five** file scopes: `media`, `vault`, `voice-notes`, `workbench`, and `audit-logs`. R70.19E's signed Work-census gate instead expects the R70.19C fictional manifest with `database.pgdump.gpg` and `vault.tar.gpg` and separate `sql`/`vault` fields. Neither verification accepts the other's manifest format today.
2. **Signer scope:** R1W verifies an independently pinned **GPG/OpenPGP signer fingerprint** for the five-volume manifest. R70.19E verifies a separate **Ed25519 signed member/Work/key census** and a separately signed **current** deletion high-water with an externally supplied minimum. Merely validating both signatures would not bind their generations, Work roster, and current deletion epoch.
3. **Runtime ordering:** R1W's restore driver calls its `verify_signed` followed by R1V restore; **it does not invoke R70.19E's independent-current-deletion preflight**. R70.19E remains fixture-only and only gates its own fictional restore callback. A valid old R1W signed point could still resurrect a later-deleted Work unless a single pre-decrypt authority path is developed and proven.
4. **Physical scope:** R87's accepted real encrypted backup comprised PostgreSQL, `vault`, `media`, and `workbench` only (four archives); it is **not equal** to the five-volume file scope described by R1W. Missing/optional `voice-notes` and `audit-logs` must be explicitly inventoried, consented, and included or proven absent before calling any operational backup complete.
5. **Signer and key independence:** All R1W/R70.19F signing keys and deletion high-waters in the tests are synthetic on the same Mac. R87's actual private GPG key has been restored from Mac Keychain/FileVault, but a second independently recoverable passphrase and offsite key escrow are still absent.
6. **Current capture/mutation authority:** The R70.19F fictional Work roster covers the actual fixture PostgreSQL `member_manuscripts` and review-only R1Q key rows, **not all active Soullab Work, external file namespaces, erasure/consent state, NAS retention, WAL/PITR, or asynchronous background writers**. No all-member writer lease or cross-volume quorum is qualified on production.

**Therefore: additive source and compile compatibility ≠ one recoverable and deletion-safe shipping implementation.**

## Minimum requirements for a qualified future bridge

- One externally signed **complete** backup manifest encompassing PostgreSQL/WAL strategy and *all* required on-disk namespaces, with immutable GPG ciphertext hashes, exact source commit, generation/epoch and member Work census bound together.
- A **separately governed, nonrollbackable current** Work/key/consent deletion authority and independently obtained allowed Work roster. A signed old checkpoint alone is not sufficient.
- Verify manifest/signatures, current deletion floor and Work census **before** requesting recovery private keys or starting PostgreSQL restoration. Prevent a valid signed old archive from restoring a deleted Work even when the signer remains trusted.
- Recover a surviving Work only after the same complete census is verified against actual restored SQL rows and vault originals; introduce a deliberate post-capture revocation and reproduce both refuse/survivor cases under one source generation.
- Enforce consistent cross-store writer fences, file-vault object sealing, immutability and restore ordering for all members and background/async processes, not just fictional single-member snapshots.
- Place the operational independent signer, current deletion authority and recovery key/passphrase into separately auditable custody; prove recovery from losing the Mac Studio.
- A separate founder-approved production transition is needed for signed image, two-member canary, two existing 02:00 plaintext backup writers, NAS historical disposition and recurring encrypted restore alerts.

## Qualification scope

Existing R1T/R1V/R1W source-only guards (31 tests), and selected R70.19F/R70.19E/Writer release Jest tests (205 tests) passed in this isolated source combination. Strict shipping TypeScript passed with error suppression disabled. These are scoped code and policy regressions; a complete joint signed physical recovery exercise **has not yet occurred in this branch**.

**Disposition: R70.19G source coexistence and safety review; default OFF, no production eligibility or real-data private beta GO.**
