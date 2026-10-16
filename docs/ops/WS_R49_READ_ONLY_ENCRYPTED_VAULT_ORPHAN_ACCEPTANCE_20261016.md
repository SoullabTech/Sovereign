# Writer's Studio R49 — Read-only encrypted-vault orphan and manifest recovery inspection

**October 16, 2026 · Local fictional-only qualification PASS · Real-member beta HOLD**

## Why this matters

R35's immutable Work vault writes authenticated ciphertext and fsyncs it **before** the PostgreSQL version+receipt transaction commits. That order protects already committed Source and prevents a failed SQL transaction from being misreported as a successful author edit, but it deliberately leaves an encrypted **orphan** when the vault publication succeeds and its SQL manifest/receipt later fails. An unknown orphan is neither evidence that an edit was successfully adopted nor authority to delete or reattach its bytes. A missing/corrupt *referenced* ciphertext file is a distinct and more serious consistency failure.

R47 separately develops **durable Undo** and R48 independently reserves **spent Apply reconciliation**. R49 does not edit those concurrent worktrees or duplicate their token state machines. It qualifies the separate filesystem/manifest evidence needed before anyone can declare a protected revision recoverable.

## Frozen source and boundaries

- Based on immutable clean accepted R45/R46 integration `5d0bafd5a9cb1353def83d607f6c4a7074d73bec`. The original accepted branch and in-progress R47/R48 worktrees were **not changed**.
- R49 isolated candidate at `/Volumes/T7 Shield/ws-beta-r49-encrypted-orphan-inventory-20261016`, branch `fix/ws-beta-r49-encrypted-orphan-inventory-20261016`.
- Source module `lib/writersStudio/recovery/heldVaultInventoryR49.ts` uses a PostgreSQL **REPEATABLE READ READ ONLY transaction** to inspect only R35 structural heads/manifests. It checks source-managed version generation, predecessor digest continuity, immutable ciphertext filenames and SHA-256, and separately enumerates only its recognized encrypted-vault namespace. The filesystem portion is read-only; **SQL and filesystem observations are not globally atomic**.
- The scope is **strictly limited to fictional PostgreSQL 16 on Mac localhost** with two exact R35 fixture flags plus an additional explicit R49 flag, under a marker-owned disposable `ws-r35-physical-r49-*/vault` directory within the system's canonical temp root. It checks both the namespace and root against symlinks. Unknown filenames, symbolic links, unreadable/oversized files and nonregular entries trigger review, never automatic scanning outside the declared namespace.
- The module never decrypts original writing, visits other namespaces, contacts MAIA or KMS, writes a real SQL row, deletes, reattaches, restores, changes filesystem permissions, or claims real-member activation. `R49_REAL_ORPHAN_REPAIR_ENABLED=false` is permanent in this candidate, and **every** outcome includes `canDelete=false`, `canRelink=false`, `canPublish=false`, `canAdmitRealWriter=false`, and `releaseApproved=false`.
- The result contains **counts only**: number of structural heads and versions, valid ciphertext, unreferenced ciphertext, missing and hash-corrupt committed ciphertext, invalid manifests, broken history chains, head mismatches and unsafe files. It never includes author prose, private original filenames, Work/member UUIDs, vault-relative references or token digests.
- **Important scope limit:** this first inventory does not independently join manuscript ownership against canonical owner authority, guarantee a stable filesystem snapshot under concurrent writes, validate offsite backups/replicas/WAL, or prove original Source/keeps/proposals and all R20 classified fields have migrated. Those are not waived by a matching SHA-256.

## Tests

- R49 pure classifier and fail-closed source unit suite: **15/15 PASS**. It covers an initially consistent synthetic snapshot (which still holds release), one additional unreferenced vault object, missing referenced file, corrupted digest, invalid traversal/reference path, unknown/unreadable object, version gap or broken predecessor, wrong head generation, owner changes along a chain, head without versions, zero-record no-GO, precise fictional-only environment refusal, production database refusal, real vault-root refusal and non-disclosing output.
- Actual independent `postgres:16.13`, R35 AES-256-GCM/fsync vault and synthetic Work writer: **43/43 physical application/infrastructure/custody checks PASS**, including R35's original author autosave, revision and 15 negative controls.
- Before an injected failure, R49 observes **2 synthetic Work heads, 9 valid committed ciphertext generations, 0 unreferenced objects**.
- Then a deliberately failing SQL receipt trigger forces **a successful encrypted file publication with an aborted SQL transaction**. R49 identifies **1 unreferenced encrypted object**, 9 valid referenced ciphertexts, no missing or corrupt committed object. It does not mutate the retained orphan or clear any recovery debt.
- Next the disposable fixture alters one referenced ciphertext. R49 distinguishes **1 corrupted referenced object plus 1 unreferenced object**, with no automatic repair. Finally it injects a fixture-owned symbolic link: R49 flags the unexpected object without following or removing it.
- Bounded plaintext probes on the complete **fictional** SQL dump and sealed vault confirm absence of invented author content, notes and client idempotency strings. This does **not** prove privacy outside the fixture or real provider/backup policies.
- Inherited R35–R46/R45 selected security and Studio regression: **71/71 suites, 749/749 tests PASS**; focused R49 unit suite included. Scoped strict `tsconfig.r49-orphan-inventory.json` (inspector, tests and physical runner): **0 errors**.
- Full repository `tsconfig.ship.json`: **193 inherited errors (exit 2)**, normalized ordered file/error-code/message sequence exactly equal to R45, canonical SHA256 `695ea8f398339d681a7882328449e6af9c8f168fa483839911780d6951566908`; **zero newly introduced errors, NOT a passing production build**.
- Test driver `scripts/ops/wsBetaR49PG16OrphanInventory.ts` writes an **R49-unique private evidence receipt** under `/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R49_READ_ONLY_ORPHAN_INVENTORY_PG16_20261016.json`. Temp PostgreSQL container/data, synthetic private vault and its test marker/symlink are all deleted on completion. Existing R35, R45, R47 and R48 receipts are not overwritten.
- First acceptance was measured on pinned parent `5d0bafd5a9cb1353def83d607f6c4a7074d73bec` with the uncommitted R49 changes. **Run exact final implementation-commit PG16 acceptance separately** before promoting the local source qualification.

## What remains blocked

1. **No automated orphan action.** A ciphertext object not referenced by a SQL manifest could be a pending write, interrupted journal, replayed prepublication, or unrelated custody item. Relinking or deletion needs a separately approved authenticated Work/source-intent ledger, multi-process fence, immutable backup and explicit retention/erasure policy. A mere matching file hash is not enough.
2. **Durable author outcome is still separate.** R47 Undo and R48 spent-Apply recovery are being developed independently. Neither a SPENT token nor an R49 observed cipher object proves the author edit completed. The application must verify its signed, versioned, member-owned result before telling the writer Apply/Undo succeeded.
3. **Operational keys/deletion remain independent.** R49 uses synthetic same-Mac keys only. No external independently held Work key, separately governed antirollback deletion high-water, multi-node revocation/write fence or offsite immutable ciphertext/DB/key restore has been accepted. Old raw keys paired with old backups can still decrypt offline.
4. **Actual Writer Studio and privacy migration remain incomplete.** The current live routes still contain legacy plaintext-capable Source, Draft, revision, keeps, editorial, export, WAL, logs and provider paths. The bounded source inventory found 51 literal SQL write candidates across 19 files (30 drafts/revisions). A fictional vault scan is not a production Source-custody audit.
5. **Founder-approved real beta gate unwaived.** Real Mac and physical iPhone Safari, exact chosen-word review and genuine MAIA/Develop/Write/Review/Undo, approved member participation notice, Proton-only invitation, production image build with no new failures, rollback and offsite recovery, independent custody operator and explicit Class A launch approval remain required.

**Disposition: R49 read-only orphan evidence and reference integrity detection PASS in isolated fictional PG16. Real writing, automated erasure/repair and production deployment remain HOLD.**


## Exact committed source acceptance and handoff

- Actual implementation source commit `bf6f28955745a63a8f28bd10cc3524c946f11726` (precommit sovereignty, provider, PHI-pattern and design-contract checks PASS).
- Full isolated PostgreSQL 16 and encrypted vault test **rerun against this exact commit**, exit 0: **43/43 physical checks PASS, 15 negative-control categories exercised**. Temporary PG16 container, encrypted vault, marker, suspicious fixture symlink and disposable metadata all removed; 0 real member/model/mail/production touches.
- Final exact-source private receipt `/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R49_READ_ONLY_ORPHAN_INVENTORY_PG16_20261016.json`, mode 0600, SHA256 `71328b64284f4378e8401120a282dc5f181897596e2de762c74dd6d1efd37f9b`. The original precommit receipt was preserved as `R49_READ_ONLY_ORPHAN_INVENTORY_PRECOMMIT_20261016.json`.
- Portable one-commit review patch `/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R49_READ_ONLY_VAULT_INVENTORY_REVIEW_20261016.patch`: **47,380 bytes**, SHA256 `41fa32efdcc2851e55f0ddacbc9bb042456ae54e6734e5b00a040dde5d720768`. `git apply --cached --check` against the pristine pinned R45/R46 `5d0bafd5...` parent: **PASS**. No merge, push or deployment.
- The source remains **read-only and fixture-only**. Do not interpret a consistent bounded ciphertext/digest observation as globally completed deletion, complete source migration, owner-identity proof, or a go-live authorization.
