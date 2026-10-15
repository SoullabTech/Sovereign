# Reflect beta: reader-scoped invitation configuration — review candidate

**Classification:** Class A privacy boundary / Class B production Compose structure. **Status: review only.** No production flag, member invitation, image, or database change has been authorized.

## Why the isolated file exists

The ordinary production `.env.production` is loaded by Caddy, MAIA and several workers. Reflect beta uses two server-side values, `PRO_STUDIO_REFLECT_BETA_ENABLED` and `PRO_STUDIO_REFLECT_BETA_MEMBER_IDS`. Putting the member allowlist into the shared file unnecessarily exposes beta member identifiers to unrelated services.

The proposed change adds an **optional** `.env.pro-studio-reflect-beta` `env_file` entry only to `services.maia`. It is a **host-side operational file** outside Git and Docker images. A missing file leaves both values unset; `isReflectBetaAllowed()` fails closed. The file does not grant professional roles, clinical client access or paid entitlements.

## Review and operational controls

1. Independent security review of Reflect [#1826](https://github.com/SoullabTech/Sovereign/pull/1826) and authentication [#1827](https://github.com/SoullabTech/Sovereign/pull/1827) remains required. This Compose amendment also requires approval; none of the three is approval to deploy.
2. Authorized release operator must confirm the real-member subset **consented to Reflect specifically**, and use exact verified member IDs. Do **not** copy Writer's Studio, Field Lab, or Personal Portal cohorts. Do not disclose tester identifiers in tickets, artifacts, CI logs or source control.
3. Only after those approvals, the operator privately creates a **mode 0600** `.env.pro-studio-reflect-beta` in the deploy project directory (the same `--project-directory` the governed deploy lane passes to Compose). This optional file contains only the two Reflect beta keys; place no values in the shared `.env.production` or in image build arguments.
4. Stage the approved application + config SHA using the governed `prepare-maia` lane, which must pass ancestry, schema and rollback checks. Obtain distinct operator/founder artifact-specific authorization before `cutover-maia`. Beta initially remains closed until invitation and live canary conditions are met.
5. Record actual Caddy/Next SSR and RSC response headers, invited/denied/expired/revoked member cases, physical Safari, and a real MAIA handoff. Verify non-invited data never appears in streamed HTTP 200 and no client/practitioner API is accessed.
6. **Withdrawal is not a hot toggle.** Runtime environment changes require an authorized application-reader recreation/redeploy; test that withdrawal succeeds at public ingress after the operation. Preserve the exact previous image and restore permissions and routing if a gate fails.

## Executable source witness

Run `python3 scripts/witness/reflectServiceScopedCompose.py`. It builds no images, starts no containers and accesses no real member data. It copies the source Compose file into a temporary synthetic project, checks optional-file absent, fictional invited flag ON and fictional invited flag OFF, and verifies that among all 15 services **only MAIA** receives the two Reflect values. It also proves the private file path is Git-ignored. The values and temporary directory are discarded.

**Source and image boundaries:** This configuration amendment is independent from the previously verified `873ce151e` review-only image. After approval, the governed deployment must build a **new exact source SHA including this Compose structure**. Never promote or relabel the prior `ci-review-image-only` image as a production-lane artifact.

**Reversal:** Revert the additive Compose change and remove the private optional file only through the authorized operator lane. A missing file must continue to leave Reflect closed. Existing `.env.production` and all other Compose service definitions remain unchanged.
