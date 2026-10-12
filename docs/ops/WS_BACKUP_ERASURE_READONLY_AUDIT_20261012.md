# WS-BACKUP-ERASURE-02 — Read-only audit and synthetic design witness

**12 October 2026 · Class A engineering evidence · NOT a production authorization**

**Founder authority:** WS-BACKUP-ERASURE-01 (#1791) accepts the principle that completed **Delete Work** must leave no recoverable reconstructive material in Soullab-controlled live stores, historical backups, snapshots, replicas, or retained recovery keys. This report does not constitute approval of a specific implementation, retention duration, WS-DELETE-02 disposition, member-data capture, real restore, migration, or beta deployment.

## Source-read trace (read-only)

Reviewed exact Writer's Studio candidate **9520d13691702400c41be8c4652994fbf8a8f30e**, including:

| Source path | Key finding |
|---|---|
| lib/manuscript/source/eraseManuscript.ts | SQL and Work declaration removal happen transactionally; file-path erasure obligations enter vault_erasure_queue; queue/sweeper concern live file bytes, **not** archived snapshots. The sweep exception logs an artifact reference and error; content-minimal logging needs review. |
| lib/manuscript/source/arrivals.ts | Original artifact bytes and extracted source text are joined by relational custody; unclaimed uploads initially have no manuscript ID. |
| lib/storage/fileVault.ts | Original file bytes reside separately on a shared vault filesystem; durable Source writer verifies the stored bytes and publishes without replacement. |
| database/migrations/20260824000001_manuscript_source_custody.sql | PostgreSQL manuscript_source_arrivals stores **source_text** in a column. A complete SQL dump is reconstructive without any Source file. |
| database/migrations/20260907000001_vault_erasure_queue.sql | Erasure queue addresses live vault paths, not archived DEKs, database dump generations, or offsite replicas. |
| docs/programme/WS-DELETE-01_TOTAL_ERASURE_RULING_2026-09-07.md | A deleted Work must not be merely hidden, archived or retained as an orphan blob. WS-DELETE-02 unclaimed-arrival disposition remains open. |

Reviewed separate draft backup candidate **ad3b3c1edc4c81de42f2dc62981dd017302dd51f**:
- scripts/ops/backup-manuscript-vault.sh performs a whole Docker-volume TAR stream, wrapped in one GPG encryption recipient. That old recipient is **CF8F15836A03DC444E521B600A8285A96F374F2D**.
- docs/ops/WS_VAULT_ENCRYPTED_BACKUP_RECOVERY_20261012.md explicitly calls the backup default-off and retains erasure/retention, ACL, replica and key-custody STOP conditions.
- The new recovery key **7ADD6F1AB22516325DEFA11DCF168AFB05582362** has separately passed a MacBook synthetic recovery challenge, but is **not** the old recipient and has **not** been approved or installed for production.

**No member file contents, private keys, plaintext database backups, or manuscript prose were read or uploaded for this audit.**

## Live metadata-only witness (Minisforum and Synology CIFS)

| ID | Read-only observation | Impact |
|---|---|---|
| R1 | Public container is maia-sovereign:prod at commit **c9e4f7f7e**. | The design is not deployed. |
| R2 | Public source vault is Docker volume **maia-sovereign_vault_data** mounted at **/app/data/vault**; total files **21**. | File-vault backup is separate from PostgreSQL. |
| R3 | Of those 21 files, **15** are in manuscript-sources and **6** are in bugs. | A whole-volume backup captures unrelated bug material and breaches narrow scope unless separately authorized. |
| R4 | Previous content-free Source inventory: **13 referenced files, 2 historical unreferenced files**, zero missing for referenced files (#1786). | Preserve unknown files pending Class A custody review; no automatic sweeping. |
| R5 | Nightly 02:00 cron calls **/home/soullab/MAIA-SOVEREIGN/scripts/backup-postgres.sh**. Static inspection: full pg_dump, gzip, retention cleanup, **no GPG**, no source-volume inclusion, no exclude-table flags. | Current schedule does not provide deletion-compatible encrypted SQL+Source snapshots. |
| R6 | NAS **maia-backups/postgres** currently contains **26 .sql.gz** files; CIFS client projects **0755** on all 26. | Compressed SQL is not protected by the inspected GPG pathway. Effective Synology ACL and guest access **unknown**, not inferred from CIFS modes. |
| R7 | NAS is mounted from **//192.168.4.42/soullab-backups**. | Synology snapshot schedules, immutable versions, offsite copies and server ACL were **not** available from the CIFS view. |

**STOP:** Existing SQL backups can reconstruct deleted manuscript content even if all original Source files are removed or future vault backups become per-Work encrypted. Merely changing the new vault script's recipient does not repair that problem.

## Candidate architecture (REQUIRES INDEPENDENT REVIEW)

Compare three paths:

1. **One global GPG over all Source + SQL** — **not admissible** under the accepted total-erasure law. Older generations remain decryptable with the global recovery credential after individual Work deletion.
2. **Per-Work encryption before all persistent writes** — plausible design candidate. Each Work has a separate AES-GCM data key. Both structured manuscript text/drafts/derivatives and source bytes are encrypted prior to database, WAL, vault, caches, staging and backups. Backup ciphertext alone and the global transport key cannot decrypt a deleted Work. A live, independently replicated, *non-rollbackable and non-escrowed* key+erasure authority keeps keys for active Works and irrevocably withdraws them for deleted Works. Restore must consult the current erasure barrier, never the ledger shipped inside an older backup. Any replica acknowledgment failure leaves deletion **pending**, not completed.
3. **Per-Work encrypted backup only, but plaintext live SQL/old SQL dumps** — **not admissible** until all existing/historical reconstructive copies and snapshots are resolved. Backup-time encryption cannot make previously retained plaintext SQL disappear.

A key-service design can fail in hidden ways: backups of key escrow, memory dumps, snapshots of older key registers, WAL entries, multiple replicas that can restore old keys, or an encryption bypass in rendering/export. None of these are proven absent in production.

## Executed synthetic proof — 14/14 PASS

Exact branch test: **scripts/ops/test-ws-backup-erasure-model.mjs**, run using **Node.js 22 on the Mac Studio**, on fictional fixtures only. It uses built-in **node:crypto** AES-256-GCM and **node:test**. No application, database, Docker, NAS, production key, or member data was touched by the tests.

| Test | Observed fixture result |
|---|---|
| 01 Active SQL + Source jointly recover with matching SHA-256 | PASS |
| 02 Deleted Work not restored from prior snapshot; unrelated Work survives | PASS |
| 03 Delete during archive capture aborts publication | PASS |
| 04 A pre-delete snapshot cannot roll back the authority's tombstone | PASS |
| 05 Offline replica leaves deletion **pending**, not falsely complete | PASS |
| 06 Existing plaintext SQL archive blocks certification | PASS (expected refusal) |
| 07 Archived individual Work encryption key blocks certification | PASS (expected refusal) |
| 08 Unknown/unclaimed Source blocks ordinary capture | PASS (expected refusal) |
| 09 Authenticated archive tampering fails | PASS |
| 10 Encrypted SQL/Source hash mismatch fails closed | PASS |
| 11 Crash before publication yields zero published recovery points | PASS |
| 12 Missing non-rollback authority blocks restore | PASS |
| 13 NAS outage blocks capture | PASS |
| 14 Wrong global transport key fails to decrypt archive | PASS |

**Interpretation:** The executable model supports a feasible set of constraints **under assumed trust and key isolation**; it does **not** prove that Soullab's current architecture implements them. Real historical compressed SQL, WAL, key escrow, snapshots, storage permissions, and independent real-vault restore remain unresolved.

## Independent review and remaining gates

- **Class A source review:** actual production backup writers, all reconstructive DB tables/WAL/derivatives, encrypted asset scope, and independent key custody.
- **Legacy backup custody:** 26 compressed SQL archives, effective Synology server ACL, immutable snapshots, offsite copies, and recipient mismatch. Do not delete old backups without separate custody ruling.
- **Backup design test:** ensure *every* reconstructive field is encrypted prior to any restorable storage and that no backup/snapshot can resurrect a deleted data-encryption key.
- **WS-DELETE-02:** separately decide member action vs purpose-bound expiry for abandoned arrivals; classify two unknown historical files without deleting or presuming ownership.
- **PITR/recovery:** independently validate SQL+Source point-in-time consistency, non-rollback deletion barrier, failure-prefix ordering, and no plaintext disk staging.
- **Explicit release:** PR #1784 must remain tied to exact commit 9520d13691, with its own migration Review-Custody and Jondi acceptance. PR #1789 remains default-off.

**JARVIS / Kelly's World target (not installed):** Today: governing rule accepted and release held; Work: audit and 14/14 model; Graph: WS-DELETE-01 → #1791 → #1793 → #1788 → #1784; Monitor: NAS SQL/ACL, orphan files, real restore; System: old vs new recovery recipient, key custody, authority boundaries.

**No live member backup, restore, key installation, schema migration, ingress change, delete, scheduler, or public beta promotion is authorized by this report.**


## Adversarial recheck — 5 unsafe counterexamples, 12 Oct 2026

The additional test file **scripts/ops/test-ws-backup-erasure-counterexamples.mjs**
is a **deliberately unsafe** set of fictional scenarios. The exact committed
file was fetched back from GitHub blob **4c42f5dc4243803ec188c84cfb592c90f6db586b**
and executed with Node on the Mac Studio: **5 tests PASS, 0 fail**.
A PASS here means the **failure mechanism was reproduced in a synthetic
counterexample**, not that the system is safe.

| Counterexample | Witness | Disposition |
|---|---|---|
| C1 Existing plaintext SQL snapshot | Plaintext remains readable after destroying the new Work key | BLOCK real backup/deletion certification |
| C2 Individually escrowed Work key | Old ciphertext decrypts despite live key revocation | Audit every historical key copy, NAS snapshot and replica |
| C3 Deletion after initial restore check | In-memory staged plaintext survives when erasure occurs before publication | Require authority-fenced **atomic restore publication**, not a check followed by unchecked publication |
| C4 Whole-database + vault encrypted with one common master key | Old global key decrypts a Work even after its per-Work key is deleted | A monolithic global archive cannot satisfy single-Work erasure |
| C5 Old authority snapshot | Restoring a historical key register/tombstone set can reintroduce erased content | Key+erasure authority must not be rolled back with PostgreSQL, vault or NAS backup |

**Necessary admission criterion:** an adversary with *all* retained historical
Soullab-controlled ciphertext, SQL dumps, snapshots and master recovery credentials
must fail to reconstruct a deleted Work. This criterion requires evidence about actual
existing backups, not only new encrypted backup design.

### Synology second-pass read-only access witness

- Live SMB mount is **//192.168.4.42/soullab-backups** via **SMB 3.0**,
  with client-projected **file_mode=0755, dir_mode=0755, uid=1000, gid=1000**.
- An SSH **BatchMode** authentication check to Synology returned unavailable;
  it did not provide privileged DSM/snapshot or effective SMB ACL evidence.
- Five candidate snapshot-directory locators on the SMB mount were not present.
  **This does not prove the NAS lacks snapshots or replica jobs.**
- Server-side DSM snapshot retention, immutable snapshot status, effective
  user/guest rights, backup reader identity and Hyper Backup/replication jobs
  remain **NOT VERIFIED**. These require a custodian-led DSM read-only witness.

### Review stop conditions strengthened

1. Distinct reviewer must read **both** the 14-case model and the five deliberate
   vulnerability counterexamples; neither set is a real implementation.
2. Do **not** claim cryptographic erasure or successful deletion for production
   while any historical unencrypted/escrowed reconstructive backup remains.
3. Real disaster-recovery design must prevent publication of content deleted
   **during** restore, requiring a fencing/authority binding that stays valid
   through the commit itself.
4. No routine global GPG key switch or whole-vault tar scheduling is authorized.
   The new key's separate-Mac recovery proof is a different issue.
5. Synology's own DSM snapshot/permissions/replication evidence and explicit
   WS-DELETE-02 disposition remain release blockers.

This supplement is an engineering self-audit, **not an independent human
review approval**.
