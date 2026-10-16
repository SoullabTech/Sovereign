# Soullab Writer’s Studio — R27 Managed KMS Proposal and Provisioning Stop Gate

**October 16, 2026** · Prepared from R25 `bf21ed22e28d0c66edc319c3bfb2659913583e11`.
**Scope:** Invitation-only five-person beta at `soullab.life`.
**Authority:** PREPARE AND REVIEW ONLY. The founder has not approved a live AWS account, any key/resource creation, spending, privileged access, real member enrollment, migration or deployment.

## Architectural decision for review

Use AWS KMS as the **managed planning baseline**, with a separately governed revocation register and fresh independent signing authority. This is an optional operational architecture to be explicitly selected and approved; **no AWS resource exists because of R27**. A dedicated hardware-backed sovereignty solution can later implement the identical external receipt contract without changing the Work data model.

The current R26 uncommitted external signing/KMS contract is being developed in parallel. R27 is a **separate, nonconflicting offline topology validator**, not an alternative secret-issuing service or a basis for turning on existing feature gates. Do not merge or overwrite an unfinished R26 source tree.

### Proposed trust domains

1. **Application domain (A):** hosted Soullab API and PostgreSQL/file vault. Validates the current authenticated member, exact approved invitation and consent, same-Work ownership, intended operation and chapter version. It has *no KMS administrator credentials*, deletion-register administrator credentials, provider configuration override or signing private keys. It may process a Work key in authorized, short-lived memory only, not logs or SQL.
2. **Work-key authority (B):** separate account/operator with symmetric KMS wrapping key(s) and an Ed25519 key-lease signing key. The custodian validates a signed, one-time, session-bound authorization request, rechecks live consent and revocation, and returns a narrowly scoped grant. Each Work needs an independently enforceable retirement policy. Evaluate per-Work KMS wrapping keys for this small pilot; a single still-active shared wrapping key is **not** sufficient evidence of per-Work cryptographic deletion.
3. **Deletion register (C):** separately operated current, monotonic Work/key revocation record. Conditionally advances an epoch; permits no rollback or missing-Work fallback; denies unwrap for deleted Work across restored historic snapshots. A conditional-write register, even with strong reads, does not by itself withstand its own administrator deleting/recreating or restoring it, so externally anchored auditing and independently operated signing remain mandatory.
4. **Freshness witness (D):** separately administered signer that consults *current* authoritative deletion data, binds a short-lived nonce, Work, key and high-water epoch, and signs a proof. Neither a document from an old backup nor a cached signed receipt is sufficient.

For R27’s **conservative four-account AWS topology check**, these roles must use separate proposed 12-digit account identifiers and exact same-Region KMS key ARNs. This is a structural design test, **not proof that four accounts actually exist or have independently administered operators**. A later, separately reviewed architecture could use a non-AWS independent witness; do not weaken the actual independence requirement merely to match an account count.

### Cryptographic and AWS integration details

- Symmetric Work-key wrapping: AWS KMS `SYMMETRIC_DEFAULT`. Encrypt/decrypt with a nonsensitive authenticated `EncryptionContext` consisting of **opaque Work digest, coarse service label and generation**, not names, titles, medical information, prose or filenames. Context appears in plaintext in CloudTrail logs. Per-Work wraps, key rotation/retirement and old-key reauthorization are separately witnessed.
- Work content: existing application AES-256-GCM WorkSnapshot ciphertext is stored in the immutable/fsync-verified file vault. PostgreSQL holds only ownership, Work and version, cipher reference and digest, and predecessor digest. **R23** already uses this candidate storage architecture in fictional fixtures; do not enable the legacy plaintext writer.
- Signed key lease, deletion checkpoint and freshness proof: AWS KMS `ECC_NIST_EDWARDS25519`, `SIGN_VERIFY`, `ED25519_SHA_512`, `MessageType: RAW`. The Node Ed25519 verifier expects the **same canonical, un-prehashed bytes**; do not substitute `ED25519_PH_SHA_512`/`DIGEST`. Pin issuer public keys and permitted key ARNs out of the application database/backups. AWS KMS asymmetric signing does **not** accept a KMS encryption context; Work, member, purpose, generation, nonce and policy digest must be included in signed bytes instead.
- Account access: use least-privilege cross-account KMS key policy *and* external caller IAM policy; do not assume either alone grants access. Source application credentials must not have `kms:PutKeyPolicy`, `kms:ScheduleKeyDeletion`, broad `kms:*`, or access to the deletion/signature administrator roles.
- Revocation: a single authoritative Region with conditional epoch advances and **strongly consistent primary-key GetItem** for current status; do not use an eventually consistent GSI or multi-Region eventual-consistency table for authorization. Sign a high-water snapshot, bind a fresh minimum epoch, and externally anchor the append-only status in independently controlled immutable audit storage. Archive **only opaque key/work digests and epoch numbers**, never prose, names or source bytes.
- Concurrency: a post-key-call session/consent recheck is required before the app writes. Even a recheck has a time-of-check/time-of-use gap: real acceptance must prove the external Work-level coordinator serializes a new revocation against in-flight authoring grants and prevents an old lease from committing after revocation. No production-grade atomicity is claimed until that distributed fence is demonstrated.

### Exact first live authority tests — not yet run

1. **Isolation/ownership:** app backup and Docker environment yield no signing keys or deletion ledger administrator access. Missing/outage of B/C/D refuses authoring, never falls back to plaintext.
2. **Freshness:** revoke during a deliberately delayed KMS unwrap; verify the edit is refused before the SQL/cipher-vault commit. Replay an otherwise valid grant across members, Work, generation, stale session, changed consent notice, nonce and purpose; all refuse.
3. **Nonresurrection:** restore an earlier DB/vault snapshot and KMS wrap from before deletion. Show B refuses unwrap even if the old wrapped Work-key bytes survive; witness C/D reports the current minimum epoch, not the backup’s. A deletion notice must accurately describe any legal retention exceptions.
4. **Surviving Work disaster recovery:** restore a surviving Work from independently stored PostgreSQL and encrypted Source vault, verify exact original files/filenames/extractor provenance, revisions, Develop/Write/Review, Apply/Undo and export with a newly authorized key grant. Test KMS downtime and loss of a key-administrator workstation.
5. **No legacy exposure:** audit the 11 directly reconstructive, 8 derived/editorial and 29 as-yet-unclassified prioritized R20 fields, plus original Source, SQL/WAL, backup copies, exports and model-provider retention. Migrate or block legacy plaintext Work writers. No release on partial encryption.
6. **Full exact-image acceptance:** approved member consent wording, working approved non-Resend email transport, five individually verified identities, Safari Mac + actual iPhone, adjustable columns and full Studio/Portal/MAIA journeys, frozen source and image digests, production capacity/recovery check, explicit Class A founder source and cutover GO.

### R27 engineering evidence

The new pure `lib/writersStudio/recovery/managedKmsTopologyR27.ts` cannot provision a KMS or authorize real writing. It enforces **only the proposed design shape**: issuer/account separation, KMS ARNs matching scope and Region, Ed25519 RAW choice, no sensitive encryption context, strongly consistent conditional revocation design, independently anchored audit and revalidation of consent after the external operation. If the design is consistent, it returns `PLAN_CONSISTENT_NOT_OPERATIONAL` with `releaseApproved=false` and `provisioningApproved=false`; otherwise it returns `REFUSED_TOPOLOGY`, also with no approval. Its success does **not** verify that proposed accounts, IAM policy, cryptographic signers or deletion systems actually exist. The parallel R26 cryptographic contract tests are separately owned.

R27 focused `10/10 PASS`; scoped strict TypeScript `PASS`; inherited selected writer/signup/custody regression `43 suites / 487 tests PASS`.

### Operator decisions still required

The founder must separately approve the custody operator/provider, exact AWS organizational/account arrangement or hardware alternative, security administrators and their separation, region and cross-border implications, budget/cost ceiling, backup and catastrophic-loss policy, real member retention/deletion promises, and whether an external key service may receive member/Work identifiers. After that, use an independently reviewed change to **provision** keys and witness resources, obtain actual operational test receipts, and only later consider an exact-image deploy GO.

**Disposition:** R27 provider-specific preflight design PASS; **actual managed KMS, offsite antirollback, protected real writing, and five-member production beta remain HOLD.** No provisioning/activation/spend authorization is implied by “continue.”

## Official technical references

- AWS KMS key specs and Ed25519: https://docs.aws.amazon.com/kms/latest/APIReference/API_CreateKey.html
- AWS KMS Sign `ED25519_SHA_512` with `RAW`: https://docs.aws.amazon.com/kms/latest/APIReference/API_Sign.html
- AWS KMS encryption context (logged non-secret plaintext): https://docs.aws.amazon.com/kms/latest/developerguide/encrypt_context.html
- KMS cross-account permissions: https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-modifying-external-accounts.html
- DynamoDB consistency: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html
- Conditional updates: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html
- AWS KMS key deletion caveats: https://docs.aws.amazon.com/kms/latest/developerguide/deleting-keys.html
