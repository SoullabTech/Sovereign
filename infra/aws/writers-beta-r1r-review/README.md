# R1R | AINOS Writer's Studio AWS KMS — review-only infrastructure proposal

**Prepared 17 October 2026 from R1Q source `4e58c2b233165c3915d13ae9fa26e93f60ff3974`.**

**Authority:** founder approved a READ-ONLY AWS provider review and preparation of a proposed configuration **without applying it**. The founder has **not** approved creating AWS resources, modifying AWS permissions, certificates, budgets, logging, backups, production code, cohort admission, or deployment. Treat all files here as nonproduction design proposals.

## Verified environment and scope

- Target AINOS account is verified by live AWS STS via IAM Identity Center as account **ending 5343** in `us-east-1`. The founder's Mac Studio `ainos-r20-admin` is an `AdministratorAccess` **human review session only**. It must **never** be reused as an application credential or installed on the Minisforum server.
- A different local default AWS profile authenticated as **root** in account ending **5161**, unrelated to the AINOS Writer KMS target. Never use the default AWS profile to deploy this plan or to bypass a policy denial. Root key retirement is a separate security operation with an authorized replacement and dependency inventory.
- The one existing AINOS customer-managed KMS key is **R20 fictional pilot signing** (`SIGN_VERIFY`, `ECC_NIST_EDWARDS25519`, alias `alias/ainos-r20-fictional-head-20261015`). It is **not compatible** with `ENCRYPT_DECRYPT` envelope encryption. **No real Writer's Studio symmetric key currently exists.** The prior administrator's `GetKeyPolicy`, `ListGrants`, and `GetKeyRotationStatus` calls were ACCESS_DENIED; these policy/grant details remain unknown.
- IAM Roles Anywhere in AINOS/us-east-1: **0 visible trust anchors, 0 profiles, 0 CRLs**. No trusted CA, unique host certificates, rotation/revocation, or app IAM role was qualified.
- Product infrastructure is Docker on the local **Minisforum Linux server**, with a separate Mac Studio parallel stack; it is **not an AWS EC2 instance**. The app needs short-lived non-root credentials from an explicitly approved external-workload scheme such as IAM Roles Anywhere; these cannot be assumed to exist.
- The AINOS `AINOS-R20-AWS-Pilot` budget is **$30**, with actual 85% and 100% plus forecast 100% alerts, but is **not an enforced hard cap**. There were zero CloudTrail trails / CloudTrail Lake event stores **visible** in us-east-1 at review time; long-term central audit delivery/retention is not proven. Free recent AWS management-event history is not the same as a retained organization trail.
- The R1Q wrapped-key source is a tested **server-only source seam with a fictional provider**, not a production KMS implementation, a member web route or a one-use editorial Apply/Undo feature. **434 inherited core TypeScript errors, 12 legacy write routes and nine release requirements remain open.**

## Bundle contents

| File | Purpose | Mutating capability |
|---|---|---|
| `kms-review-only.template.json` | CloudFormation proposal: NEW symmetric KMS key, separate alias, four independent roles, explicit encryption-context restrictions, annual key-material rotation. | **No resources by default.** CloudFormation parameter `ProvisioningApproval` defaults `REVIEW_ONLY_NO_RESOURCES`; both resources have the same approval condition. Not to be applied without separate approval. |
| `roles-anywhere-trust.review-only.json` | Example *restricted* role trust using a single approved trust-anchor ARN, X.509 subject/issuer and AINOS account. | **NOT deployable as-is**: includes placeholders and a non-IAM `_REVIEW_ONLY` sentinel field. |
| `app-key-usage.review-only.json` | Example app IAM policy with only `GenerateDataKey`, `Decrypt`, `DescribeKey` for one approved NEW symmetric key ARN and strict non-sensitive context. | **NOT deployable as-is**: placeholders and a non-IAM `_REVIEW_ONLY` sentinel field. |
| `release-decisions.review-only.json` | Explicit unresolved requirements, all provisioning/launch decisions false. | None. |
| `README.md` | Source, risks, controls, provider costs, operator decisions, rollback/restore requirements and accepted review scope. | None. |
| `scripts/ops/__tests__/wsR1RAwsKmsReview.test.cjs` | Offline code and source-custody validation. | None; pure filesystem `node --test`. |

## Key proposal — security design, not deployment authority

**Only if separately approved**: create `AWS::KMS::Key` with `KeySpec=SYMMETRIC_DEFAULT`, `KeyUsage=ENCRYPT_DECRYPT`, KMS-owned material, single region, auto rotation at 365 days, 30-day pending deletion window, `BypassPolicyLockoutSafetyCheck=false`, `Retain` for stack delete/replacement, and a new `alias/soullab/writers-beta`. Do not delete/alter the R20 signing key.

Explicit, separately verified IAM role ARNs must be provided for **four different identities**:

1. **Provisioner role:** assumed only for an explicitly approved CloudFormation change; permitted policy maintenance and provisioning tasks for this key, **not** data-key generation or decrypt. Its principal must exist before deployment or key creation may fail CloudFormation lockout safety checks.
2. **Key administrator:** key status, tagging, rotation and description operations; **no** `GenerateDataKey`, `Decrypt`, `kms:*` or policy rewrites.
3. **Break-glass recovery:** separately administered MFA/restricted trust for recovering key policy and canceling erroneous key deletion; no runtime KMS crypto. Treat the powerful `PutKeyPolicy` right as break-glass; audit every assumption of this role.
4. **Runtime Writer role:** `kms:GenerateDataKey`, `kms:Decrypt`, and `kms:DescribeKey` on **this one key**, not other KMS keys, IAM admin or alias policy changes. The `DescribeKey` statement is separate because encryption-context conditions are irrelevant to metadata reads.

The **key policy** uses `Resource:"*"` only because KMS key policies are attached to and govern that single key. **The IAM identity policy must never use a wildcard `Resource`; it names one approved key ARN.** The runtime's `GenerateDataKey`/`Decrypt` are limited to an encryption context containing exactly `service=soullab-writers-beta` and an opaque, keyed 64-hex Work digest; raw UUIDs, member names, email, manuscripts, titles, clinical content and filenames are forbidden in KMS encryption context because AWS logs it in plaintext. The application and independent custodian must validate the digest format, secret/key lifecycle and member/Work/consent binding; KMS does not establish these by itself.

**Security caveat:** a role with `kms:PutKeyPolicy` can change access rules and could ultimately grant itself decrypt if unchecked. Separate technical IAM role custody, strong MFA/identity proof, an off-system review/approval trail and alarmed policy-change events are required. Defining a distinct role alone is not separation of duties.

## Off-AWS workload credentials: IAM Roles Anywhere is a proposal, not a ready service

The selected deployment substrate is an on-prem Docker host. An AWS Identity Center **administrator browser session is not a service credential**. Do not copy `.aws/credentials`, SSO token caches, access keys or the founder's root credentials into a Linux container.

For IAM Roles Anywhere, independently qualify a CA (existing managed PKI or an explicitly priced CA), an X.509v3 signing certificate for the exact Minisforum runtime identity, trust anchor, narrow profile, role trust policy with pinned anchor ARN and certificate issuer+subject, certificate revocation/expiry/renewal and a least-privilege `aws_signing_helper` credentials process. Profiles and trust anchors must be in the same AWS region/account. Configure only the runtime role with temporary credential access; add host permissions on certificates/private keys and scope the role to the exact customer-managed symmetric KMS key. Verify renewal and loss-of-connectivity behavior; no offline/local/PHI master-key fallback.

The example trust policy deliberately contains unresolved `${...}` placeholders and an invalid-for-AWS sentinel field. **Do not remove either before a separate security and founder approval.** An extra non-admin X.509 source/issuer restriction is required because a trust-anchor alone potentially allows other authorized certificates under that CA.

## Cost and monitoring approval gates

- As of the 2026-10-17 AWS price page: **one new KMS customer-managed key costs $1/month (prorated)**. The first and second key-material rotations each **add $1/month** (maximum key-storage increment after the second rotation). Symmetric KMS requests are subject to monthly free-tier thresholds and subsequent per-request costs. Auto rotation of a KMS key does **not** automatically rotate each application's per-Work data key.
- An **external CA** may be operationally inexpensive if one already exists; an **AWS Private CA** has significant additional managed-CA charges. Do **not** assume the $1 KMS key price covers credentials/certificates, audit retention, S3, backups, restore drills, outbound networking or extra rotation.
- The existing **$30 R20 pilot budget is a warning budget, not a Writer authorization or hard cost cap**. Get founder cost authorization before creating a new account-level Writer budget, alerts, CA, Roles Anywhere, CloudTrail S3 bucket, KMS key, IAM role or key alias.
- To qualify audit evidence, review/create separately an approved **multi-region CloudTrail trail** for management events to a deliberately secured S3 bucket (with encryption, versioning/log validation, retention and offsite read privileges). CloudTrail's first management-event copy is delivered without a CloudTrail event charge, but S3 and additional events/retention cost money. Avoid logging sensitive context or plaintext writing.
- Freeze responsible account/role and alert recipients. Add alarms on key policy changes, disable/delete/schedule deletion, failed decrypt and unusual `GenerateDataKey`/`Decrypt` use. The approved beta operator must be able to trace access without reading member writing.

## Go/no-go sequencing

**R1R must remain local REVIEW ONLY until every item below is independently reviewed:**

- [ ] Founder separately confirms AWS account ending 5343 / us-east-1 for a new symmetric Writer key; documents a new change ticket and written provisioning authorization.
- [ ] Owner independently verifies the target Linux production topology, network egress, role credential acquisition and trust anchor/certificate issuance + revocation controls.
- [ ] Four actual distinct least-privilege IAM roles and their account/region/trust identities are reviewed. IAM/key policies, MFA and no-root runtime use are signed off by a different security reviewer.
- [ ] CloudTrail long-term audit bucket, logging, S3 retention/backup, notification delivery, recovery administrator and key policy escape-hatch are verified with real evidence.
- [ ] Founder accepts full cost envelope including KMS, any certificate authority, CloudTrail S3, metering, backup/recovery and failure alarms; existing $30 R20 budget not silently reused.
- [ ] A later **separate** operator approval authorizes CloudFormation stack creation or update. Never run an infrastructure mutation from this review lane.
- [ ] On fictional data only, independently witness real `GenerateDataKey`/`Decrypt` through the approved short-lived workload role, including wrong encryption context, missing key, revoked consent, stale Work, rotate-during-unwrap, failure, cold restore and rollback.
- [ ] After real encrypted backups and restore, full unsuppressed TypeScript/build, protected UI author gesture, provenance, one-use Apply/Undo and independent browser/iPhone acceptance, a **third separate GO** can authorize five-person beta release. The R1Q service remains `R1Q_OPERATIONAL_KMS_AND_MEMBER_KEY_RELEASED=false` until then.

**Important beta simplification:** Soullab previously approved a *conventional standard-security* invite-only beta **without requiring all future sovereign per-Work key/deletion machinery**. R1Q's stronger per-Work managed key program must not silently become a mandatory prerequisite if a different conventional at-rest encryption/backup design independently meets the founder's actual initial-beta consent and privacy requirements. No downgrade of a Work already promised stronger protection is permitted.

## Rollback and failure-handling policy

- **Review-only today:** rollback is simply abandoning this local proposal branch. No AWS cleanup is needed because no AWS resources exist from R1R.
- **Future new-stack failure:** stop before attaching to real member routes, prove the provisioning actor still controls `PutKeyPolicy`, verify no author text/key generation was performed, then execute a separately approved rollback. CloudFormation `Retain` intentionally keeps encrypted-key material out of casual stack deletion, and can incur continuing charges. Deleting a used key would destroy access to encrypted backups and member writing, so do **not** schedule key deletion as a generic rollback.
- **Future runtime outage/credential revocation:** member writing/preview must refuse in place; no local plaintext, SSO, root, global encryption key, provider-switch or `Origin:null` fallback. Only recover through a separately governed key custodian and verified backup source.
- **Data/key rotation:** retain old encrypted Work-key wrappers for legitimate historical versions until independently proven migrated, and block deleted/withdrawn Work epochs. AWS key-material rotation is different from application Work DEK version rotation.

## Trusted references

- [AWS KMS key policy](https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html)
- [AWS KMS encryption context conditions](https://docs.aws.amazon.com/kms/latest/developerguide/conditions-kms.html)
- [AWS KMS pricing](https://aws.amazon.com/kms/pricing/)
- [AWS IAM Roles Anywhere](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/introduction.html)
- [AWS Roles Anywhere trust model](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/trust-model.html)
- [CloudTrail trail management cost guidance](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-trail-manage-costs.html)
- [CloudFormation ValidateTemplate (checks syntax, not security)](https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_ValidateTemplate.html)

**No live AWS mutation, paid cryptographic call, real writer/user data access, production code activation, key material, IAM role creation, certificate issuance, deployment or GitHub push is authorized or performed by R1R.**
