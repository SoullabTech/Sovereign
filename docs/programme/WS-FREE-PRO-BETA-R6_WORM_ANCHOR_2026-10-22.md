# WS-TIERS-R6 — independent, restorable-proof Writer beta authorization ledger

**22 October 2026 · Class A architectural candidate · NO CLOUD CHANGES / NO DEPLOY / NO BETA GRANTS**

## The member-facing decision

Writer’s Studio will have ongoing Free and optional Pro, with **full currently
approved Pro at no charge for each individually authorized, account-verified
Writer beta participant**. Initial admission remains **exactly two named,
individually approved account-owning writers**, followed by a separate canary
decision before any later members of the same restricted group. Nobody loses
their writing, deletion, privacy or safe essential export rights on downgrade.

This file addresses *only authorization custody*, not manuscript bytes, MAIA
interpretive features, paid billing, broader community membership, or live
feature release. The source is built on the existing held Free/Pro PR #1909.

## R3–R5 evidence and the unsolved trust question

- Actual R3 old PostgreSQL backup resurrected a formerly accepted grant.
- Actual R4 three-PostgreSQL16 rehearsal found **double signer rollback**
  can mint two fresh valid ACTIVE signatures for a revoked grant.
- The exact R5 three-database fixture then PASSED **35/35** after moving
  its disposable PostgreSQL data and backup files to Docker tmpfs. It
  demonstrated R5 signed checkpoint refusal, two fictional writers,
  real pg_dump/pg_restore, and no production changes.
- The R5 triple-verifier is sound only if the third checkpoint is the **latest
  independently trusted** one. Simply signing a stale checkpoint is not enough.

No compliant independently held checkpoint, live signer, WORM retention, new
cloud resource or cost has been accepted. This is the next Class A decision.

## R6 bounded executable design

- `lib/writersStudio/pilotR20ImmutableEventChain.ts`
- `lib/writersStudio/__tests__/pilotR20ImmutableEventChain.test.ts`

The ledger represents three distinct transitions: `issued` (founder authorizes
one account and consumes one irreversible initial seat), `accepted` (that
account holder explicitly accepts), and `revoked` (terminal). All records use
an immutable grant UUID and a pseudonymous subject commitment, never names,
emails, private manuscript text, psychological observations or file contents.

Each event has a strictly increasing contiguous sequence, previous hash,
canonical signed-domain data and SHA-256 event hash. **The event
`subjectCommitment` must ultimately be derived server-side from the verified
member/account identity under separately controlled, stable cryptographic
custody, never supplied by the writer, a CRM record, or localStorage.**
The R6 fixture uses fictional preselected commitments and does not implement
that real member-to-commitment binding or key rotation.

The verifier enforces:

1. Exactly the expected independently verified chain head and sequence,
   with no missing/reordered/extra events or changed bytes.
2. No acceptance without an issued grant or second acceptance, no subject
   substitution, no reactivation after revocation and no recycled initial seats.
3. At most **two ever-issued seats** under the first canary authority,
   allocated to **distinct writer subject commitments**: the same author
   cannot obtain both slots through different grant IDs. Seats are not
   recycled even after revoked rows are deleted from the member DB.
4. Refusal of a truncated prefix when compared with a **trusted current head**.
   A prefix paired with its own **stale** head can pass; the test intentionally
   demonstrates this, proving that a current WORM head is indispensable.
5. Exact-schema, bounded input, generic content-free denial on inconsistency.

The chain verifier does **not** establish where the trusted head comes from.
It must NEVER trust an `expectedHead` supplied by a member, read from a
restored Soullab DB, or restored with the two signer databases.

## Candidate independently protected custody

**Preferred option to evaluate (NOT provisioned):** an independently
administered AWS account holding a small, content-free event journal in
an S3 bucket configured for Object Lock **Compliance mode**, fixed retention,
versioning, object-level retention verification and restricted independent
read-only verifier access. Do not use Governance mode or an ordinary mutable
PostgreSQL/Synology object store as the sole source of latest truth.

Critical AWS caveat: S3 Object Lock protects a **specific retained version**,
but does not prevent new versions or delete markers. Therefore the verifier
must **not** trust `GET latest.json`, current-key presence, or an ordinary
bucket listing as proof of the latest irreversible event. Events need unique
monotonically sequenced keys and immutable, version-ID-bound receipts;
the independent verifier must detect newer versions, delete markers, gaps,
head forks and expired/insufficient retention, and fail closed. Compromised
signer credentials must not have object-deletion, retention-reduction or
bucket-administration rights.

Official provider references (read-only evaluation):
- [AWS S3 Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html)
- [AWS Object Lock considerations and delete markers](https://docs.aws.amazon.com/us_en/AmazonS3/latest/userguide/object-lock-managing.html)
- [Google Cloud Bucket Lock](https://docs.cloud.google.com/storage/docs/bucket-lock) — an alternative, but locking retention is irreversible
- [Azure Immutable Blob Storage](https://learn.microsoft.com/azure/storage/blobs/immutable-time-based-retention-policy-overview) — a further alternative, requiring separate policy custody

**No provider is selected for live operations by this file.** R20's real
recovery owners must compare costs, legal/erasure retention obligations,
offsite access, trust-domain independence and rollback threat coverage.
The retention duration must exceed the lifespan of **every** restorable
old grant or application image. If such copies persist indefinitely, a
finite retention policy alone is not an anti-resurrection proof.

## Grant/revocation transaction ordering

- **Issue:** founder identity and individually approved account checked first.
  Append and seal a unique `issued` event externally, then link the pending
  local grant; interrupted partial changes fail closed and are reconciled, not
  automatically reused as an open seat.
- **Accept:** writer authenticates with their own current session and actively
  accepts. Externally append `accepted` before local DB confirmation; the
  beta product gate needs **both** the accepted local row and current sealed
  authorization. Neither alone admits Pro.
- **Revoke:** the independent authority seals terminal `revoked` first;
  obtain a verifiable acknowledgement; then revoke the member DB row. A failure
  of the second step cannot restore Pro. Retry is idempotent and auditable.
- **Read:** for each sensitive operation fetch current independent state, reject
  partitions/stale sequence/invalid signatures, and check current member and
  exact owner-scoped Work access separately. No client-level Pro assertion.
- **Restore:** replay WORM events/checkpoint into a new trusted reader and
  reconcile any older accepted grants. Never restore a signer/checkpoint from
  the same backup domain as the Writer database.
- **Delete:** delete author-owned Work on its own authority. Retain only the
  minimal pseudonymous terminal-grant marker for a documented purpose and
  duration; a membership downgrade or grant cancellation must never become
  a barrier to writer-owned data access/deletion.

## Independent Class A acceptance checklist — ALL must pass

1. Founder explicitly approves the *exact* independent custody, operator and
   recurring costs before irreversible Object Lock or Bucket Lock settings.
2. Signed WORM object-version receipts and a trusted current event head are
   verified from a separately controlled read identity.
3. Writer and both signer databases restored to pre-revocation copies cannot
   reinstate any previously revoked grant, even with old application images.
4. R20 checkpoint database and signing service themselves rolled back still
   cannot produce a trusted **latest** revocation head.
5. Hold key rotation, compromise, loss of one/two signers, partition, clock
   skew, slow/forked listings, delete marker, object version replacement,
   legal retention expiry and bucket/account outage as mandatory negatives.
6. A revoked/deleted grant cannot issue a third seat absent a separate
   individually signed founder decision and a separately reviewed
   cap-expansion mechanism.
7. Real clinical/private content and personally identifying contact information
   never enter checkpoint journal objects or diagnostic logs.
8. Integration stays within the latest qualified P4R1 Studio release source,
   including writer Work ownership, continuity, Inspiration/Academy Free
   inclusion, secure author-controlled export and all R20 manuscript holds.
9. Exact-source PostgreSQL/HTTP two-member isolation, desktop/mobile Safari,
   keyboard/VoiceOver, rollback, independent Class A custody review, and
   founder go/no-go are recorded before any real beta account is admitted.

## R6 evidence — bounded and reproducible

- **17/17** R6 hash-chain Jest cases PASSED, including two distinct initial
  writers, one subject attempting two grants, terminal revocation, no third
  seat, tampered/reordered/gapped events, and an attacker reconstructing
  an altered hash chain that fails against the independently pinned head.
- **112/112** focused R1–R6 Jest tests PASSED across **12 suites**.
- Writer-specific TypeScript and targeted ESLint PASSED.
- Previous exact-source R5 **35/35** three-PostgreSQL16 signed-checkpoint,
  restore and dual-signer rollback integration PASSED, with temporary
  memory-backed databases and NO production writes.
- The R6 hash-chain is a **pure research verifier**; no actual independently
  signed/WORM head, cloud bucket, signer key or physical recoverability was
  tested or provisioned. A historic prefix paired with its own historic
  (untrusted) head **still passes**, as deliberately demonstrated by the test.
- Commit/review identity is recorded in the draft PR only after source commit.
  The latest qualified production image and current P4R1 source are
  separately governed and **not** represented by these local test counts.

**Disposition: R6 local protocol research only. Production authority remains
unprovisioned and fail-closed. No cloud resources, passwords, signing keys,
billing subscriptions, real grants, new beta invitations, release switches or
manuscript bytes have been touched.**
