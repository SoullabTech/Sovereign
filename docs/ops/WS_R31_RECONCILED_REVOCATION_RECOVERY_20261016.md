# Writer's Studio R31 — Reconciled R30 revocation and recoverability lanes

**October 16, 2026 · Local, fictional-only candidate · REAL-MEMBER RELEASE HOLD**

## Source authority and preserved lineage

- New isolated branch: `fix/ws-beta-r31-reconciled-recovery-20261016` on the founder's Mac Studio T7.
- First parent: R30 PostgreSQL Work-row revocation/commit ordering `e205116f0b09b7fc673f75dc4de83124cfb63e23`.
- Second parent: R30 session/consent → immutable encrypted-vault cold reopen + older-backup release-stop `43f89ff986501ef5b7d1e4e708d4cc293cad8139`.
- Both inherit R29's cryptographically session-and-consent-bound R26 lease `574f299c6152870996e7efb2845f0ad1572a7fed`. The original two R30 branches and review evidence remain intact; new merge used Git `ort` with **no conflicts**.
- This merge is **source reconciliation**, not a deployed single atomic Work writer. The R29 checked-session lease, R27 saved Work fence, file-vault storage and old-backup refusal remain independently bounded contracts and fixtures. No single real external revocation coordinator or KMS has been installed.

## Reconciled tests

- Scoped strict TypeScript `tsconfig.r30-convergence.json`, `tsconfig.r30-work-transaction.json`, and `tsconfig.r29-session-consent.json`: **PASS**.
- Merged selected Writer's Studio, protected invitation, consent, session, Source, encrypted-history, withdrawal and security regression: **53 suites PASS, 573 executed tests PASS**; the standalone physical-only suite is skipped in ordinary Jest because it requires the dedicated disposable PG16 launcher. Dedicated physical runner executed separately and PASS.
- Separate R31-named physical evidence preserves pre-existing R30 receipts:
  1. **R31 PG16 Work-row race test:** disposable actual PostgreSQL 16, loopback-only, real SQL locks and transaction boundary with synthetic consent/key lease. All physical test flags PASS, including seven real-PG test cases, fixture removed. `R31_PG16_WORK_FENCE_RACE_20261016.json` (private founder T7 release-r9 folder).
  2. **R31 consented session + vault + cold reopen:** real synthetic `auth_sessions` and approved notice/consent backed by disposable PG16, actual immutable ciphertext file vault, plaintext-negative dump, database SIGKILL/restart and fresh-process recovery; all twelve infrastructure flags PASS, fixture removed. `R31_SESSION_VAULT_PG16_PHYSICAL_20261016.json` (private founder T7 release-r11 folder).
  3. **R31 older-backup revocation:** synthetic separate key-register and encrypted older ciphertext backup; 13 checks PASS; new and previously unspent old leases refuse after Work retirement; current and old signed high-water reject restore. **Deliberate positive proof of limitation:** a separately retained prior raw key still decrypts an old encrypted copy offline. The receipt MUST remain `RAW_KEY_ERASURE_UNPROVEN`, not an erasure or member-release certificate. `R31_OLD_BACKUP_REVOCATION_20261016.json` (private founder T7 release-r11 folder).
- All temporary PostgreSQL containers, image-created disposable volumes, file vaults, signer fixtures and old-backup test directories were removed. No member records, real manuscript data, SMTP, paid model provider, AWS provisioning or live production migration touched.

## Required release stops

1. Founder/operator has **not** approved AWS KMS versus dedicated sovereign custodian, administrators, Region, budget, retention or escrow. Neither provider is installed or authorized by a `continue` response.
2. R29 signed session/consent and R27 local/PG16 Work-level locks do not create **cross-domain, operator-independent atomic revocation** during KMS issuance, file-vault fsync and PostgreSQL commit. A real Work coordinator must implement it and reject revocation-in-flight across app/DB/independent custody failure.
3. R20 found eleven directly reconstructive/history fields, eight derived/editorial and further unclassified text/JSON candidates. All legacy original Source, chapters, drafts, keeps, revision authorizations, editorial JSON, logs, SQL/WAL, exports, offsite/historical backups and provider retention need migration, controlled recovery and no unsafe plaintext fallback.
4. A local disposable PG16 restart is not independent multi-host PostgreSQL + vault + KMS cold restore, prior-reader rollback or irreversibility proof. Retained historical raw keys remain an explicit disclosure path.
5. Full exact-image Next/TypeScript shipping build still has a known inherited **193 global TS diagnostics** (not rerun by R31); no released production image, physical iPhone/Mac Safari complete Studio+Portal+MAIA Apply/Undo/import/save/reopen/export, approved invitation mail or founder Class A source-and-image approval.
6. Host Linux disk fluctuates around the 60 GiB preparation threshold. Recheck before any build and protect rollback/source/backup assets. Do not run broad Docker/image/volume cleanup.

**R31: fictional-source integration/recovery PASS; actual independent key custody and five invited real writers on `soullab.life` HOLD.** Do not modify production, activate real writing, create AWS resources, invite users or make deletion guarantees on this evidence.
