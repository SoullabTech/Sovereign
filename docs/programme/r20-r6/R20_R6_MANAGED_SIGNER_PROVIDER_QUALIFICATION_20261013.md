# R20-R6 — Managed signing-service provider qualification

13 October 2026 | Founder-led Class A engineering | **DESIGN / MOCKED CRYPTO ONLY, NO SERVICE PROVISIONED**

## Outcome

**Preferred managed signer: AWS KMS, dedicated isolated signing account, with three role-separated Ed25519 signer identities.**
**Preferred independent high-water: Google Cloud Storage metadata-only, irreversibly locked object/bucket retention under separately administered GCP credentials.**
These are a recommended architecture for further acceptance, not an authorization to create an account, key, storage bucket, irreversible retention lock, network endpoint, cloud subscription or member-data operation. The existing PostgreSQL standby VPS is not available as the signer. This recommendation requires further actual custody proof.

Why this pair:
- Current AWS KMS API supports ECC_NIST_EDWARDS25519, Ed25519 raw signing algorithm ED25519_SHA_512 and retrieving public verification keys. This can match current R20 Ed25519 signatures **only for bounded raw payloads**.
- AWS KMS private signing keys are protected within the managed key service and cannot be exported in raw private form; production access still depends on correct account, key policy, service-role authorization and independent release review.
- Google Cloud Storage Bucket Lock / Object Retention Lock provides retained object version protection with immutable retention settings after lock, in an account/provider separated from AWS. Unlike writable local snapshots, a locked object can protect content-minimal signed HEAD commitments through a defined period. Locked retention may be irreversible, may incur ongoing obligations, and is not equivalent to a perpetually nonrollbackable trusted "latest" pointer.
- Google Cloud KMS supports EC_SIGN_ED25519 only at SOFTWARE protection level according to Google's algorithms matrix, not in its HSM category; AWS is the more direct fit for preserving the existing protocol and managed protected key custody.
- AWS S3 Object Lock COMPLIANCE is a possible **second** immutable store, but a Google Cloud cross-provider anchor gives better separation from AWS KMS administrative failure domains. Object Lock also protects individual versions rather than guaranteeing that latest listing results cannot be concealed.

Sources verified against provider documentation (2026-10-13):
- AWS KMS key specs: https://docs.aws.amazon.com/kms/latest/developerguide/symm-asymm-choose-key-spec.html
- AWS KMS Sign API: https://docs.aws.amazon.com/kms/latest/APIReference/API_Sign.html
- AWS KMS pricing: https://aws.amazon.com/kms/pricing/
- GCP KMS algorithm support: https://docs.cloud.google.com/kms/docs/algorithms
- GCS Bucket Lock: https://docs.cloud.google.com/storage/docs/bucket-lock
- GCS Object Retention Lock: https://docs.cloud.google.com/storage/docs/object-lock
- S3 Object Lock compliance considerations: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html

## Critical protocol limit

AWS KMS Sign accepts a RAW message up to 4096 bytes. Its ED25519_SHA_512 signing must use MessageType=RAW to retain PureEdDSA semantics. The existing R20-R3 ledger uses Ed25519 over the **canonical JSON of the full growing deletion-event array**. It inevitably grows beyond 4096 bytes. Do **NOT** silently start signing SHA256(ledger) or substitute ED25519_PH_SHA_512 for the legacy format: old readers verify different bytes and would be incorrect.

R6 adapter deliberately restricts itself to bounded HEAD and PIN messages, not the entire cumulative ledger. A later R7 protocol must separately version canonical ledger commitments, exact event integrity (hash chain/Merkle root), independently pinned previous signed HEAD, compatibility migrations and verify-before-publish semantics. Old signed ledger receipts must remain verifiable under their original key/algorithm/byte contracts.

## Proposed four custody compartments

1. **Minisforum / authenticated application** — authenticated member action and exact Work ownership; atomic commit of content-minimal deletion manifest and outbox in PostgreSQL. Never supply arbitrary caller signed JSON as proof of member consent. No live member prose is sent to KMS/GCS.
2. **Dedicated AWS security account** — R20 signing gate plus three distinct AWS KMS Ed25519 keys, strict least-privilege key policies and authenticated request validation. Only a purpose-bound service role may sign bounded checkpoint objects and prove exact transaction/outbox custody. Restrict arbitrary direct KMS:Sign access, separate deployment/admin controls and log access; avoid public unauthenticated endpoints. AWS KMS HSM custody is not a member-content key vault by itself.
3. **Separately administered Google Cloud project** — append-only content-free signed HEAD/high-water commitments locked under a reviewed retention rule, accessed through separately pinned service credentials. Store only schema, sequence, previous digest, signed-head hash and issuer identity; **no Work/member IDs, titles, source text, path, filenames, source hashes, decryption key envelopes, IP or conversation fragments**. The deletion ledger itself needs its own protected immutable retention and recovery design without member-content leakage.
4. **Independent restore auditor/reader** — checks a *fresh*, independently authenticated external signed HEAD, current checkpoint commitment, complete outbox and surviving Work keys, with a deletion-versus-restore lock/fence through final publication. If GCS/AWS authority is unreachable, not current, expired, inconclusive, or conflicting: fail closed, do not expose recovered content.

These distinct provider accounts still require genuine independent organizational administration, access policy, MFA and recovery-custody evidence. Two cloud logos do NOT alone establish independence.

## Price and scope (not an invoice or cost authorization)

AWS publicly lists **$1 per customer-managed KMS key per month** plus request charges; three active signer keys would start at approximately $3/month for KMS key storage **before signing requests, policy/logging, hosted gate, separate accounts and independent storage/network costs**. AWS's sample ECC-P256 signing request price is $0.15 per 10,000 requests, but this does not independently establish an exact price for Ed25519 in the user's chosen region; verify current SKU before expense authorization. GCS locked-storage costs, operations, logging, egress and retention liabilities must be budgeted separately. Do not imply that managed independence is free or commit to a price without provider billing evidence.

## Real admission gates (NO automatic waiver)

- Provider accounts known, owned, billing scopes reviewed, 2FA and access roles accepted; no production secrets imported.
- AWS key specs/regions, actual Sign -> published public-key Verify, minimum role separation, KMS permissions and offline attacker-negative controls witnessed on a **fictional** signed payload; no real Work text in logs or cloud.
- Remote signer gate validates a genuinely committed Work outbox and member authority; mTLS / equivalent separate identity, pinning, revocation, replay, concurrency, timeout and denial-of-service resistance tested.
- GCS locked-policy retention **duration** explicitly adjudicated before locking (cannot quietly shorten/reverse), separately administered GCS read/list identity independently verified, object generations/versioned committed records read back, stale/missing/older latest record refused; account deletion/loss and object hiding considered. A SHA in caller JSON is never proof.
- Signed chain and deletion high-water remain verifiably nonrollbackable through database, signer process and cloud snapshot restore. A redundant trusted high-water or periodic external anchoring/checkpoint rollover is needed before immutable retention can expire.
- R7 ledger signing format and original R3/R4 compatibility explicitly reviewed. No silent conversion between KMS RAW and DIGEST or ED25519ph.
- Production immutable key-retirement authority is distinct from GPG manuscript-backup decryption keys. Erased Works remain unrecoverable even given all remaining old files/keys, including historic plaintext SQL and replicas.
- Complete present-state source-vault + PostgreSQL restore and deletion-vs-restore transaction fencing, NAS ACL/recycle/offsite inventory and WS-DELETE-02 adjudication remain separate beta holds.

## Isolated implementation

Branch: feature/r20-r6-managed-signer-qualification-20261013.
Base: R20-R5 local commit 51e8b35d1250b16de6444ddd417deb4b15a78988.

New:
- lib/recovery/r20-r6/managedEd25519KmsContract.mjs — offline request/receipt adapter for pinned, exact AWS KMS Ed25519 RAW HEAD/PIN signing, explicit R7 incompatible commitment draft; no SDK, credentials or network.
- lib/recovery/r20-r6/crossProviderAnchorContract.mjs — proposed GCS/AWS independent metadata-only high-water checks, always returns DESIGN_INPUT_CONSISTENT_BUT_UNVERIFIED or refuses; no provider I/O.
- tests/constitutional/r20-r2/r6-managed-ed25519-kms.test.mjs — 21 tests.
- tests/constitutional/r20-r2/r6-cross-provider-anchor.test.mjs — 18 tests.

Results: **39/39 R6 tests PASS; entire R20 scoped Node suite 229/229 PASS; no failures.** These are synthetic/exact-message contract tests. They are NOT cloud sign requests or a real independent monotonic authority.

**Disposition: PREFERRED PROVIDER STACK QUALIFIED FOR FOUNDER DESIGN REVIEW ONLY.** No AWS/GCP account, key, bucket, irreversible retention policy, endpoint, production deployment, member data, LaCie, Lexar, NAS, PostgreSQL standby or backup history was changed.
