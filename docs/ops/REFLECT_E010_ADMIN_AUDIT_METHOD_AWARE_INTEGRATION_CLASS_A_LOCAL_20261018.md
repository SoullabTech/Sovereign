# E010 Admin Cockpit — method-aware audit integration

**18 October 2026 · Class A · isolated local source candidate · NOT PUBLISHED / NOT DEPLOYED**

## Exact source custody

- Parent: `8a08e07b693f0eb1affa0c2e9aa16123906d7dca` (local method-aware GET/POST correction, direct descendant of the unchanged Draft PR #1850 published source `c9a97f997a253236ffdeef2c82a20c2ec4a90246`).
- Reviewed audit source: Draft PR #1847 published SHA `3d859d7ee1a6e6b8717c78f26e595f30fadcd0f6`. Only its login-POST audit and generic failure visibility logic have been adapted. Its separate member-password reset work is NOT included.
- Scope: `app/api/admin/auth/route.ts`, `lib/admin/adminAuth.ts`, `config/__tests__/reflectLegacyMethodAwareAdminRouting.test.ts`, and this review document.
- Local integration branch `feature/reflect-e010-admin-audit-method-aware-local-20261018` is unpushed. No changes to the shared main checkout or either PR.

## Authority invariants

1. `GET /api/admin/auth` continues to report server-verified owner/admin_role identity (including founder/CTO without app admin role); cookie outranks stale Safari header, and shared-password-only claims cannot impersonate a member.
2. `POST /api/admin/auth` independently requires a verified member session containing application role `admin`, then the existing shared-password challenge. Neither factor by itself succeeds; route checks remain even if the proxy is bypassed.
3. Handler-level POST outcomes now emit best-effort `admin_access_log` events with `via=password/denied`, exact `POST /api/admin/auth` route, and reverse-proxy-derived IP. Early 401/403, bad password 401, rate-limit 429, unconfigured password 500, malformed body 500 and success 200 are included. No attempted password, response token, arbitrary caller member claim, member ID or invented `founder` role is stored in these added event rows.
4. If audit writes fail, authentication still responds according to the authorization decision and a generic nonsecret error is logged; failure does not promote a denial to success.
5. The returned shared-password token remains UI-only and carries no independent member session, admin role or production-release authority.
6. Reflect founder-only status is read-only and unchanged. Settings retain the stricter app-admin proxy rule and their independent password guard.

## Local evidence (fictional fixtures)

- 7 selected Jest suites: **134/134 PASS** on uncommitted isolated candidate; actual proxy, access matrix and route handlers included.
- 8 newly added audit-focused cases exercise early 401/403, success without role fabrication, incorrect password, sixth-attempt lockout, missing configuration and malformed request, generic audit outage, GET/POST audit separation and XFF normalization.
- No live PostgreSQL, real member data, production passwords, live API login, password reset, access grant, production configuration or deployment was used. Tests used an invalid DB URL and fictional records.
- Native TypeScript no-regression: **PASS** (222 extant diagnostics against 239 baselined; no new errors). No baseline was updated.
- Repository checks: **PASS** for \`git diff --check\`, \`check:private-routes\`, \`check:member-id-log\` (no new violations, inherited debt remains), and \`check:phi-gate\` (pattern gate passed with existing migration warning).
- Pre-existing qualification gaps: \`check:no-sha256-passwords\` is **RED** on unchanged \`lib/auth/inviteCredential.ts\`; \`check:sovereignty\` is **UNAVAILABLE** because its referenced script is absent in the parent tree. Neither check was bypassed or represented as green. Revision-local precommit governance is separate and will be recorded after execution.
- Exact-commit GitHub-hosted CI: **NOT RUN; branch unpublished**.

## Known limitations and independent gates

- **Proxy-preempted requests are not emitted by the route handler.** A strict-proxy 401/403 does not execute the handler audit function. Do not describe these records as exhaustive edge-level audit coverage; separately designed proxy/security logging would be required.
- The IP field depends on an appropriately trusted Caddy reverse-proxy boundary; arbitrary XFF is not an authenticated origin. The existing rate limiter remains process-local.
- These login events intentionally do not invent founder status; they also do not by themselves establish independently attributable human operator custody or release credentials.
- The original Cockpit page still independently requires app admin role, Lab Tools membership, member cookie and the shared-password UI gate. Safari cookie-blocked page access remains unresolved. Do not widen role/allowlist rules to accommodate it.
- Draft PR #1847's emergency-reset safeguards and the separate privileged script tracked in #1848 remain outside this isolated integration.
- Draft PR #1849's newer access-matrix rules require requalification with this exact integration SHA; an earlier 24/24 fictional overlay pass on the parent does not substitute for a new combined exact-SHA test.
- Founder source acceptance, independent Class A review, exact-published-commit CI, consented full-caller/browser witness, reversible deployment authorization and release-operator standing are all still required before publication or production action.
- **Reflect activation remains HOLD**; this source-only change does not qualify an E010 operator or emergency shutoff.

## Disposition

**LOCAL SOURCE REVIEW CANDIDATE ONLY.** No push, no PR mutation, no merge, no production or real-member enablement.
