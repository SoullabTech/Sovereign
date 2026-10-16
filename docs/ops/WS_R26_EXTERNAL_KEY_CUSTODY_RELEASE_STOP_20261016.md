# Writer’s Studio — R26 independently verified key/deletion contract
**2026-10-16, EDT · ISOLATED RESEARCH CODE PASS / REAL-WRITER KEY CUSTODY HOLD**

## Why this matters
A prior Writer's Studio storage prototype could encrypt writing locally, but an attacker recovering an older database, a vault copy and a retained key could resurrect material a writer had deleted. Ordinary local encryption and app-side tombstones do not establish revocation-safe custody. R26 adds a **verifiable protocol contract** for independent key-use and antirollback witnesses; it does **not** set up an actual external key-management service.

## Exact source scope
- Parent R25 `bf21ed22e28d0c66edc319c3bfb2659913583e11` preserves invitation → password → verified sign-in → voluntary consent and former member's authenticated download/delete path, alongside selected held R23 encrypted file-vault + SQL integrity manifest architecture.
- New `lib/writersStudio/recovery/externalCustodyContractR26.ts` verifies a domain-separated, signed **Work-key lease** that binds exact verified writer/member, Work, key ID, operation (append or read), Work generation, SHA-256 of ephemeral random Work key, SHA-256 of signed deletion checkpoint, short expiry and a fresh **server-generated 256-bit challenge**.
- A separately signed **current minimum-generation witness** binds the same member/Work/key/checkpoint/challenge. The existing signed deletion checkpoint is verified via `requireCurrentRestoreAuthorization` before any restoration or decryption. All three signer PUBLIC keys must be Ed25519 and byte-distinct; unknown envelope fields, bad signatures, wrong purposes, wrong keys, expired/stale attestations, deleted Works, retired keys and rollback attempts refuse.
- New `lib/writersStudio/recovery/heldExternalCustodyAdapterR26.ts` is a strictly **fictional-only, no-network** adapter into R23's existing held key-custodian interface. It generates a new random challenge *inside* its method; a caller never passes one through the member's browser. This does NOT install an independent operator or key-management connection.
- Existing R17 verified-session/active invitation/accepted-consent source and R23 held-vault composer are exercised in a composition unit test. Absent session, withdrawn/not invited, cross-origin POST, forged signature and malformed scope are refused **before** held storage. The downstream SQL/vault call is mocked here; prior actual fictional R23 PG16 + file-vault physical tests remain separate.
- `R26_REAL_MEMBER_KEY_CUSTODY_ENABLED=false` and `R26_REAL_HELD_KMS_ADAPTER_ENABLED=false`. All R15/R21/R22/R23 real-member history flags likewise remain false. No live Next.js API routes reference the new R26 verifier, adapter or held vault. No real-member grant, route, SQL migration, provider credentials or public service are created by this candidate.

## Test evidence
- R26 direct signed-grant falsifiers: **15/15 PASS** with fabricated in-process Ed25519 signers, key and deletion fixtures.
- R26 adapter into the R23 held-custodian type: **9/9 PASS** including random fresh challenges, exact signature verification, untrusted-operator failures and Work revocation.
- R26 release-source isolation: **2/2 PASS**, asserting all real-member switches false and no live API route imports the held-vault/key code.
- R26 verified R17 identity → R23 composer → signed fictional key → mocked held storage: **6/6 PASS**. A forged browser member ID cannot replace server-verified identity.
- Selected combined R25/R26 source regressions: **46/46 suites, 509/509 tests PASS**. Scope-specific `tsconfig.r26-external-custody.json` TypeScript: **zero errors**.
- Selected evidence logs in isolated R26 worktree: `R26_FOCUSED_EXTERNAL_CUSTODY_20261016.log`, `R26_BRIDGE_AND_ISOLATION_JEST_20261016.log`, `R26_VERIFIED_WRITER_TO_VAULT_JEST_20261016.log`, `R26_FULL_SELECTED_SECURITY_REGRESSION_20261016.log`, `R26_STRICT_CUSTODY_TYPES_20261016.log`. All fictional with no real accounts.

## What these signatures do NOT prove
1. **Independence**: three separately generated test signing keys in the same Mac process do NOT constitute independent organizations, administrators, managed HSMs or a true external deletion register. The code verifies cryptographic claims from caller-supplied trusted roots; an independent governance and provisioning process must establish and protect those roots.
2. **Nonrollbackability**: a signed `minimumGeneration` is only as trustworthy as a current, externally witnessed and monotonic service that actually maintains it. A restored or replayed response from the same backup system may not be treated as fresh. The short lease and server challenge help reject stale replay; they cannot independently implement durable antirollback authority or a globally consumed-nonce register.
3. **Irreversible deletion**: accepting a revoked-Work checkpoint is not proof that every old ciphertext/backup and historical key has lost the ability to decrypt. This needs independent key-retirement evidence and physical negative recovery tests across older backups.
4. **Whole-content privacy**: original source, chapters, current and prior drafts, editorial JSON, keeps, prior correspondence, logs, WAL, exports and all replicas remain to be protected. R20 identified **11 direct**, **8 derived/contextual** and **29 prioritized unclassified** fields from a wider **918 candidate** metadata-field inventory. Those are investigation counts, not 918 confirmed plaintext leaks.
5. **True end-to-end acceptance**: R26 does not call a remote custodian, open real PostgreSQL, send a model prompt, run a live browser, invite a real writer, recover an offsite vault, or migrate an active manuscript. It is code for a future independent adapter and its fail-closed boundaries.

## Operator decision required before proceeding to any live grant
A separate, explicit founder/qualified-operator authorization is needed to select and fund a real independently governed KMS/key holder, durable signer/high-water custodian, administration and recovery structure. Document at least: administrators and separation of duties, costs, key residency and storage location, emergency recovery, escrow and retirement terms, incident reporting, ongoing audit, and a source-vault backup policy. No such selection, spend or install is implied here.

## Next legitimate qualification order
1. Independent operator approves an actual trust service and publishes separately controlled, pinned versioned public roots and durable signed minimum epoch, with private signing keys never inside Soullab source, server env, app DB/vault or the same disaster-recovery media.
2. Exercise a controlled two-domain integration with an **actual** service that authenticates the verified writer/Work and provides short-lived scoped leases, and proves that an expired/revoked invitation, withdrawn consent, key-service outage, stale witness and wrong user cannot release Work keys.
3. Integrate the complete held Source/chapter/draft/revision/keep/editorial storage path without a plaintext fallback, with a migration plan and reader rollback that preserves older writing and prevents revival of deleted Work.
4. Restore separately encrypted PostgreSQL and original-file vault from independent offsite backup into an isolated machine; verify surviving originals/revisions and **refuse decrypting deleted material from at least one older pre-deletion backup**, using fresh remote antirollback and key-retirement checks.
5. Obtain founder-approved exact participation notice and independent privacy/security review, qualified Proton Mail invitation delivery, first-time writer end-to-end Safari/Chrome/MAIA verification, Linux-host storage headroom and exact-source/image reversible cutover.

**Verdict:** Protocol and local guard tests PASS; a truly independent custodian, external deletion witness, production-safe storage path, offsite restoration, verified erasure and five-member launch remain **HOLD**.
