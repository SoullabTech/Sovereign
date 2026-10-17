# Writer’s Studio — Read-only real Source→Draft metadata chain and independent key-authority STOP

**October 16, 2026 | Mac Studio isolated source | No actual member content or KMS | Beta HOLD**

## What changed, and why

The previous accepted integrated local candidate `50c0f595cdf5c97bf89391ae8da004ea83a039ae` put the real Next.js Writer's Studio readiness door behind a request-bound authenticated member session, latest exact beta consent, legacy manuscript owner and the member's **explicit, potentially multiple** Living Work declarations. That establishes who owns the *legacy* manuscript, not that a separately encrypted manuscript exists or that any independently operated custodian may unwrap/retire its keys.

This isolated source candidate adds a **metadata-only, read-only** view of the R32 original→R42 Source/Draft intention→R35 first Draft and current encrypted revision. It never invokes encryption/decryption, opens a filename, mints a one-use author choice, accesses an operational key provider, or authorizes Save/Apply/Undo.

**R35's `work_id` and R42's `work_id` denote the exact `member_manuscripts.id` UUID.** An author-declared `living_works.id` is different and not an encryption scope; a manuscript can belong to two or more declared Living Works without selecting a winner.

## The actual member-facing read-only door

The already accepted route remains:

`GET /api/sovereign/writers-studio/manuscripts/[manuscriptId]/protected-readiness`

After verifying the exact request-bound web cookie/Safari token, current beta consent and owner-scoped manuscript and declarations, the server internally calls `inspectProtectedManifestLineage({verifiedMemberId,manuscriptId})`. It issues a **single parameterized, consistent PostgreSQL SELECT snapshot** joining:
- `member_manuscripts` against exactly `manuscriptId` and `memberId`;
- the R42 pre-Draft intention and immutable Source→Draft link;
- the R32 encrypted original Source metadata by same member/manuscript/arrival, original generation and Source pair SHA;
- the R35 encrypted Draft head, exact first generation manifest/digest and current head/version manifest, with matching checkpoint count;
- the separate Source vs Draft **key identifiers** and first-Draft reference/digest.

The SQL returns only a count and head generation. A single consistent linked record becomes `encrypted_lineage_metadata_observed_only` internally, with `ciphertextPhysicallyOpened:false`, `independentKeyGrantVerified:false`, `mayWrite:false` and `releaseApproved:false`. Missing/foreign/duplicate/inconsistent records are HELD, and a missing review-only table or database outage is HELD. SQL does not return raw hashes, Source paths, draft text, filenames, private review, member email or encryption-key material. **Different key IDs are not proof of different underlying key bytes, and SQL metadata alone cannot authenticate vault bytes or prove independent operator authority.**

The actual HTTP response remains the existing uniform **423 `protected_writer_not_yet_qualified`** for an authenticated legacy owner, regardless of the internal metadata observation. No internal member/manuscript IDs, Living Work declarations, proposed text or source/draft references are serialized. All mutations (POST/PUT/PATCH/DELETE) remain HTTP 405. Real protected writing flags and R52 legacy write guards remain compiled **OFF**.

## Actual external key-governance finding

Existing Soullab source already has:
- R24 and R26 signed short-lived scoped key-lease/deletion/freshness mathematical verifiers, and the R29 session/consent-bound extension, all fictional/synthetic when exercised here;
- R27/R28 **AWS KMS design/preflight** proposing independent application, key issuer, revocation and freshness-witness domains, and acknowledging Work-level revoke/write serialization.

Their own governing documents explicitly state **no operational AWS KMS Work key, independent signer, revocation record, external immutable audit, escrow/restore or remote key-lease provider is provisioned by those candidates.** A same-Mac Ed25519 signer does not establish independent control. There is no authority to provision resources, choose a paid provider/operator or promote a test key to production simply from “continue.”

No operational Source/Draft/consent migration has been applied to production; the R32/R35/R42 relational SQL examined is **review-only**, currently outside real `database/migrations`. Therefore the real readiness endpoint must and does treat missing such tables as **no verified protected metadata**, never as permission to downgrade into a plaintext editor.

## Local tests and limits

- Scoped strict TypeScript and new source unit tests distinguish a consistent one-record metadata chain from missing, duplicate, foreign, malformed, mismatched generation and unavailable-schema conditions. The SQL itself rejects actual content queries and writes. Existing Next.js session/consent/author/source tests remain intact.
- The already accepted R49 *full fictional Work* PostgreSQL 16 fixture now exercises the new metadata observer against a genuine immutable encrypted Source→first-Draft link and checks that a foreign owner and wrong manuscript refuse, with zero new manuscript revisions. The same fixture continues through signed, durable Apply/Undo and fresh-process PostgreSQL restart/restore using invented keys only.
- The separate real Next.js auth + Living Work physical test applies **only** the actual living-work and beta-consent migrations. Because R32/R35/R42 tables have not become operational migrations, the observer must report `metadata_store_unavailable` internally while the route preserves HTTP 423 and denies editing. This intentional HOLD is tested; the two other paths remain separate.
- The launch-corridor source gate now recognizes this reader and fails `SOURCE_DRIFT_HOLD` if its exact metadata chain / nonauthorizing contract is missing. Even if all local checks pass, `--release-gate` continues to exit **2/HOLD**.
- No actual KMS provisioning or key read, production DB, existing member record, member manuscript, network key service, paid inference, account invitation, deployment, real authenticated browser/physical Safari or release image was used.

## Exact remaining approval/engineering sequence

1. Founder separately approves independent key custody operator/provider (R27 AWS proposal or separately reviewed sovereign alternative), regional/jurisdiction and retention/deletion policies, administrators, spend ceiling, backup and real key retirement.
2. Independently establish operational Work-specific KMS/deletion highwater/freshness roots and an external Work-level revocation/write coordinator. Test identity/session/notice/consent and Work-bound leases, nonce replay, actual different crypto domains, KMS outage fail-closed, revoke-during-slow-unwrap and old-backup resurrection denial.
3. Migrate or fence real Source/first-Draft/private-review and all legacy sections/Kept passages/editorial/SQL/WAL/logs/backups/exports under permitted encryption with no plaintext fallback. Qualify actual author-click and member-invoked Save/Apply/Undo, immutable Source, audited retry/uncertain-save, truly independent offsite restore and deletion.
4. Verify exact shipping Next.js image and rollback, real logged-in Mac Safari and physical iPhone, independent Class A and founder exact-source/image GO, then two individually approved canary writers; expand only to the rest of the specifically authorized five-person cohort if canary succeeds.

**Disposition: actual server-owned read-only Source→Draft METADATA check only; operational external key grant and five-person production beta HOLD.**
