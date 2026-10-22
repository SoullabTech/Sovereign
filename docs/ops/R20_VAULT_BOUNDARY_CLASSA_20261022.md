# Class A — File-vault path containment (source candidate; release HOLD)

**Date:** October 22, 2026
**Base:** public canonical Git commit `ffcab520e346cf2d7cee1f293e509c68afc44ab3`
**Issue:** [#1915 — file-vault out-of-root read/write/erasure](https://github.com/SoullabTech/Sovereign/issues/1915)

## Scope and source provenance

This review candidate changes only the canonical shared file-vault helper and adds a fictional regression suite. The **original canonical** `lib/storage/fileVault.ts` has SHA-256 `65b03446e678c5d57590528b0f74b930fcd2d968ce728c492ecbb93df7660010`, identical to the version in the uncommitted Writer/Jarvis worktree. Thus the change can be reviewed on canonical source without importing the 406 uncommitted Writer paths.

Fictional reproductions against the uncorrected helper confirmed three boundary failures: reading through an under-root parent symlink, erasing a fictional file physically outside the vault via both deletion methods, and writing through a `../outside` namespace. **No production or real member content was accessed.**

## Candidate behavior

- Confine reads and destructive operations to a physically resolved vault root; reject lexical traversal and symlinked directory/leaf components.
- Refuse multi-linked regular files as ambiguous erasure custody.
- Treat a missing file **inside an available vault** as already erased, but refuse a missing vault root. Do not misstate an unavailable mount as a successful member erasure.
- For writes, validate namespace segments/file IDs/extensions, create directories stepwise, verify they are not symlinks, write owner-only mode `0600`, and use exclusive creation to reject overwrite or planted leaf symlinks.
- Preserve best-effort deletion's nonthrowing caller contract and strict deletion's failure/refusal contract.
- Use standard Node filesystem APIs and do not require external native packages or source changes to unrelated feature areas.

## Fictional acceptance evidence

- `lib/storage/__tests__/fileVaultConfinement.test.ts`: 10 new tests.
- Existing `lib/storage/__tests__/destroyVaultBytes.test.ts`: six tests.
- **16/16 Jest tests PASS** across two suites in the isolated canonical source.
- **Strict TypeScript PASS** for the modified helper and regression suite (`--types jest,node`).
- Separate prior fictional 10-group tests passed macOS and network-disabled Linux ARM64 for the same proposed helper behavior, with no protected files.
- Full GitHub CI and independent human Class A review: **OPEN** until this exact candidate is reviewed.

## Explicit remaining security risks

1. **TOCTOU:** `lstat` / `realpath` followed by `readFile`, `unlink` or `writeFile` is not an atomic directory-handle operation. A malicious or concurrent process with write permission inside the vault can swap parent directories between checks and I/O. Safe use requires independent directory ownership/permission and paused-worker acceptance; more robust descriptor-relative/native access needs review before claiming race-free confinement.
2. **Mount identity:** Validating an accessible path is not proof that the expected vault volume is mounted. Recovery must verify the permitted mount/source identity independently; an empty mountpoint does not count as a completed erasure of the intended vault.
3. **Writer compatibility:** Existing namespaces and ID/extension naming must be reviewed and tested on the genuine admitted live source overlay before enabling this in production.
4. **Broader R20:** This patch alone does not qualify the new coherent database+vault recovery. See [#1914](https://github.com/SoullabTech/Sovereign/issues/1914) for two-pass authenticated decryption review, and the required full two-target PostgreSQL-and-vault witness.
5. **Sensitive file rights:** Storage mount access must remain restricted; no member files, backup bytes, credentials or real deletion ledgers were used in this source review.

## Release disposition

**CLASS A / DRAFT / HOLD.** Do not automatically merge or deploy. Do not widen tester admission, activate Proton Mail, or substitute this isolated canonical patch for independent review of the live Writer overlay. The October 16 database-only R20 restore evidence is narrower and does not establish full coherent vault recovery.
