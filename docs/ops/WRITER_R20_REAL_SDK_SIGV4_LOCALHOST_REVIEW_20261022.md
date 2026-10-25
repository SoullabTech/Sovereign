# Writer R20 — real AWS SDK localhost SigV4 witness (REVIEW ONLY)

**October 22, 2026 · Class A external test evidence · Production HOLD**

This draft-review branch adds only a dedicated GitHub Actions test workflow and fictional SigV4 test files under scripts/witness/writer-r20-sigv4-20261022. It does not modify any Writer API, backend authorization, security key, database, backup, production image, deployment, email, original-file upload, billing or actual member data.

## Exact source lineage

- The SigV4 verifier comes from R22 with the exact R24 observed-payload-hash correction; Git blob SHA: 7d6f6e16c40577f91f9767b7c898331ac5cd7081.
- The real-SDK localhost witness comes from the R21 source after the R22 signed bucket-owner/opaque version-ID patch; Git blob SHA: 7478d95213796ce0f3034edfd15981e6cdc8a6a2.
- R22 signed-header/opaque-version tests: 743110ec4b296c13e081076f29d933247136c4ba.
- R24 body-hash regression tests: e78d41b7935ae1e6ed25b2f3f03326b685ad2dce.
- All four blob IDs were read back from GitHub and matched the source-tested artifacts exactly. Locally, the full R22 + R24 fixture passed 51/51 tests; the 30 R22/R24-specific tests are included and run in this PR.

## What CI will actually prove

Using Node 22 and a read-only GitHub token, the workflow runs 30 fictional cryptographic/localhost tests. It then installs official @aws-sdk/client-s3 and client-sts packages at the matching exact version 3.658.1 in a separate temporary npm project, without install scripts. The lockfile integrity fields and installed package versions are checked before execution.

The official SDK clients are instantiated with the SAME explicitly fictional credential snapshot and endpoints on ephemeral 127.0.0.1 ports. The witness captures and independently validates:

- Three S3 HeadObject requests, including a signed expected bucket-owner header and distinct opaque VersionIds (plus sign, slash, long UTF-8).
- One STS GetCallerIdentity request, including a signed session token and body payload.
- Exact SigV4 HMACs, credential scope, common access key identity, service, region, query/header values and observed payload-hash binding.
- Any error is a test HOLD, not fallback authorization.

Only pull requests changing this test path or its workflow trigger the CI job; no pull_request_target, deployed app, AWS credential action, secret, registry postinstall script, production IAM or cloud endpoint is used. The job is capped at 10 minutes. It must not be merged without independent Class A and source-owner review.

## Important limitations

3.658.1 is a declared compatible baseline from the Writer package.json range, NOT proof of the Mac's actually installed S3 version. A green run is real AWS SDK v3 *localhost signing evidence*, NOT proof that the protected Mac checkout has R16–R20 integrated, that STS and S3 credentials are independently administered, or that an old snapshot cannot resurrect revoked Pro grants.

The independently controlled latest R20 head, separate AEA signer/key/custody operator, irrevocable grants and erasure/restore, original Source privacy, Writer P4R1 first-day browser and mobile journeys, and explicit founder/image authorization remain required. Production and member enrollment remain HOLD.

**Authoritative Writer/JARVIS release ledger:** https://github.com/SoullabTech/Sovereign/issues/1938

**Disposition:** independent, fictional CI wire qualification only. No source merge, production deployment, member grant, billing, upload or data access.
