# R70.19F — Signed, actual snapshot-time manuscript/key census + pre-decryption deletion refusal

**18 October 2026 · Isolated Mac Studio/T7 checkout · fictional PostgreSQL16 + vault · release HOLD**

## Parent authority and scope
- Parent exact accepted isolated R70.19E pre-decryption deletion refusal: `02020f5f617b4d16c2d26065f5aa791ecc5da874`.
- Candidate checkout: `/Volumes/T7 Shield/ws-beta-r70-19f-real-fixture-work-census-20261018`, branch `feature/ws-r70-19f-signed-pg-census-predecrypt-20261018`. No production deployment, GitHub merge, cron, NAS, customer, real key or manuscript changes.
- The real PostgreSQL **canonical `member_manuscripts`** table and **R1Q review-only `ws_managed_work_key_wrappings_r1q`** table are loaded into a one-member disposable localhost PG16 fixture. R1Q has an actual database foreign key enforcing Work and member ownership. All Work-key rows contain **fabricated opaque wrapped bytes and synthetic provider identifiers**, NOT real external KMS material, managed decrypt keys or working KMS credential.
- `lib/writersStudio/recovery/heldR7019FActualPgCensus.ts` runs inside the **same REPEATABLE READ READ ONLY PostgreSQL session** that holds the R70.19B advisory writer/capture lease. It rejects missing wrapping, extra/multiple key epochs, duplicate keys, foreign member, missing source table, mismatched canonical row counts, wrong transaction isolation or a capture on a different unlocked client. It enumerates every fictional `member_manuscripts` row in this exact SQL fixture and the matching review-only `key_id`. These IDs originate from **actual SQL rows**, never an authored two-ID test array.

## Signed census meets actual SQL+vault ciphertext
- `scripts/ops/wsBetaR7019FPhysicalPG16.ts` is a new opt-in fictional-only driver based on the previously verified 44-check R70.19D physical run. It exercises the genuine R65 import, Source arrival/claim, section-save, Studio file upload, Keep/Unkeep, Studio metadata/soft delete and legacy revision workflows with fictional identity stubs.
- It first proves the SQL registry refuses an existing manuscript with no R1Q wrapping; **then** creates one synthetic review-only wrapping for each of the two actual Works. This is an intentional fixture-only construction, not a policy for real member keys.
- In one live lease and one MVCC transaction, it verifies actual Source/Draft/Keep and file-vault bytes, enumerates the Work-key roster, exports a PostgreSQL snapshot, and encrypts `pg_dump --snapshot=<same MVCC point>` plus the vault into one GPG encrypted generation.
- Before the lease is released, it signs a **canonical list of actual SQL member/Work/key IDs** and the exact plaintext-manifest SHA-256, encrypted SQL SHA-256, encrypted vault SHA-256, source head and test epoch with a separate transient Ed25519 fixture signer. Only its **public** signing key and the signed fictional census are persisted alongside private fixture evidence; the signing private key remains in process memory. No proprietary prose or plaintext Work key enters the index.
- The generation uses the accepted R70.19C encrypted format (3 files) unchanged; the census signature is a **separate private test-sidecar**, not a production trust certificate. The independently expected Work roster supplied to preflight is a separate copy of observed SQL rows, **not** a remotely governed ledger. Capture epoch 20 and current deletion epoch 22 are synthetic test clocks, not production irreversible monotonic generations.

## Two disjoint physical acceptance scenarios
**A. Surviving manuscript(s):**
1. A signed current deletion checkpoint revokes only an unrelated fictional Work absent from the backed-up database.
2. An omitted-Work signed census and an externally stale minimum archive epoch each refuse before restore.
3. The original SQL container and vault are destroyed; the actual fixture restore entrypoint, with `R7019F_CENSUS_FIXTURE=fictional-only`, now **requires** the verified R70.19E census and independently supplied current deletion authority **before accessing the private GPG key or creating a fresh restore container**.
4. New PG16 and vault recover the original bytes. The restored PostgreSQL `member_manuscripts` and `ws_managed_work_key_wrappings_r1q` owner/Work/key rows are queried from the **restored database**, then compared byte-for-byte as UUID identities against the previously verified signed snapshot roster. A missing/mismatched/extra key row refuses. This does not certify real member Work account credentials or a production KMS.
5. Initial precommit result: **52/52 checks PASS**. Private fictional recovery keyrings, restored original bytes and containers removed; encrypted test generation remains private on T7.

**B. Deleted manuscript after backup:**
1. Complete identical encrypted snapshot is captured and its actual Work roster signed.
2. A canonical `DELETE FROM member_manuscripts` physically deletes one fictional Work in the test-owned PostgreSQL database **after** the backup; R1Q's FK cascade removes its synthetic managed-key record.
3. A newly signed test-only current deletion checkpoint revokes either that exact Work or its exact key ID. Both cases refuse the earlier valid encrypted recovery generation before decryption or new restore container.
4. The source test DB and vault are removed, and the prior ciphertext remains sealed. The test **never attempts to restore** a known deleted Work under a weaker fabricated authority.
5. Initial precommit result: **53/53 checks PASS** with all temporary keys, plaintext and test containers destroyed.

## Additional regression checks
- `heldR7019FActualPgCensus.test.ts` checks exact joined SQL-row ownership, no wrapping, extra key epochs, duplicate IDs, foreign members, bad MVCC/lock and restored index mismatch.
- R70.19E signed deletion and all normal governance/security/source tests must pass on the exact frozen R70.19F commit. The normal Writer Studio release routes remain unchanged in deployed code: this stage modifies only the **isolated fixture** and its preflight; **no production restore code is universally guarded yet**.

## Mandatory production HOLD remains
1. **Not platform-wide Work coverage.** Only the fixture's canonical manuscript plus R1Q review-only key rows are physically enumerated. Other living Works, private proposals, unsigned/legacy versions, Keep histories, account deletion, background jobs, source/vault namespaces, historical media and WAL/PITR are NOT enumerated.
2. **Not an external current deletion ledger.** The two signing identities, trusted public keys, Work roster and synthetic highwater epochs are held on the SAME MAC in the test and are not independently protected against an attacker rewriting a newer valid signed checkpoint. No production key custodian, registrar, immutable offsite ledger or real erasure publication exists.
3. **Not a real deletion sweep.** The physical test runs a direct canonical SQL Work delete and FK cascade. It does not assert the real `eraseManuscript` workflow, async erasure queue or historic NAS/plaintext backups were fully retired. Older recoverable ciphertext exists until external policy/authority refuse it.
4. **Not signed off-host disaster recovery.** The encryption writer's public-only keyring, transient signing keypair and recovery keypair are all created and destroyed locally on the Mac. The restored PG16 is a fresh local Docker container, not an independently administered trusted host.
5. **Not a production release.** All real-member beta, encrypted cron cutover, signed immutable and independently anchored manifest, genuine Mac Safari authentication/consent/MAIA processing witness, independent security review and founder-only GO stay **HOLD**.

**Disposition: real fictional SQL-key capture-time signed census + gated recovery / post-backup deletion refusal PASS when exact-commit receipts are attached. Whole production backup, independent deletion safety and real-member Writer's Studio beta remain HOLD.**
