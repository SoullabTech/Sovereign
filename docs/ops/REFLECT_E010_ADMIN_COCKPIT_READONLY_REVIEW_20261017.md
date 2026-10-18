# Reflect E010 — Existing Admin Cockpit read-only status integration

**October 17, 2026 · Status: LOCAL SOURCE CANDIDATE / NO DEPLOY**

## Why this change exists

The founder has accessed Soullab's existing System Administration page at
`/labtools/admin/system`. Current generic feature toggles use a PostgreSQL
`system_settings` table and a shared admin-password gate. The frozen Reflect
page `/pro-studio/reflect` instead reads two **server environment** keys;
its real production access has never been activated. Therefore the ordinary
database-backed feature-switch interface cannot activate OR revoke Reflect.

This candidate adds a **read-only status card to the existing Cockpit**, not
another administration system, and makes a clear distinction between:

- **OFF:** Both environment keys are absent or the flag is explicitly false
  and the allowlist is absent in the **responding Next.js reader process**.
- **CONFIGURED_UNVERIFIED:** The exact runtime flag is `true` and a single
  canonical UUID is syntactically configured. This does NOT attest that it
  belongs to the founder, that admission worked, or that the feature is safe.
- **HOLD_CONFIG_DRIFT:** unexpected, stale, malformed or multi-member settings.
- **UNAVAILABLE:** no live observation because authentication failed, an
  endpoint returned an error, or the response did not match the expected shape.
  Never display OFF by default on an error.

## Authority boundary

- `GET /api/admin/reflect-release-status` uses
  `checkAdminAuth(req, ['founder'])` and requires
  **`via === 'member'` plus an authenticated founder member ID**. A shared
  `LABTOOLS_ADMIN_PASSWORD` response is NOT sufficient even if the backend
  labels its fallback as `role:'founder'`. The UI does not send that password.
- Only names of release states are returned: no member IDs, secrets, passwords,
  cookies, allowlists, environment values or admin tokens. Responses use
  `Cache-Control: private, no-store`, noindex and appropriate Vary.
- The endpoint has only **GET**. No POST, file/system write, SSH, Caddy or
  Docker operation, production-release lock, or signing authority is wired in.
- The panel's only action is **Refresh status** (read-only), and links to the
  existing release issue #1816. Existing maintenance, banner and general
  feature toggles are unchanged.
- The request observes **this responding app process only**. It does not
  independently attest E010 image/canonical SHA, the Minisforum host, disk,
  rollback, any alternate replicas, CDN caches, founder admission or actual
  running-reader revocation. Operator and emergency release gates stay HOLD.

## Explicit exclusions

No privileged production-control channel, credential recovery, live release
approval, member allowlist grant, UI ON/OFF switch, migration, image rebuild,
deployment, admin-password change, or prior activation-block workaround.
The prior production execution refusal remains binding.

The existing dashboard currently visibly shows `limits_disabled` ON; no
attempt is made to change that or any unrelated toggle. That setting needs
its own beta/production policy review before a wider launch.

## Verification required before considering a source-review PR

- Test real endpoint access logic for anonymous, shared-password-only,
  other-admin and authenticated-founder roles.
- Verify no member ID, allowlist or environment value appears in responses.
- Exercise OFF, precisely one syntactically valid UUID, unexpected flag and
  multi-ID drift.
- Confirm no-store and that authentication failures cannot be displayed
  as OFF, preserve existing dashboard state and unrelated routes.
- Run native repository typecheck and relevant admin/Reflect regressions.

**Current disposition:** Source-only candidate. The page will **not** change
on soullab.life unless separately reviewed and deployed through an approved
release lane. Even a future approved deployment of this read-only status would
not supply the qualified operator needed to activate Reflect.

## Additional strict-mode routing qualification — isolated candidate only

The existing seven-file panel PR #1846 does not register
`/api/admin/reflect-release-status` in `config/accessMatrix.ts`. Under
`ACCESS_CONTROL_MODE=strict`, the real Next.js proxy would refuse that
unmapped API as `no-rule-match` (HTTP 404) **before** the status handler and
its verified-founder-member-session gate can run. The earlier isolated Next.js
browser fixture did not include the production `proxy.ts`; therefore its
green browser checks cannot prove strict-mode route admission.

A separately scoped *local-only* review candidate adds the **exact**
`/api/admin/reflect-release-status` rule with `minTier: 'free'` and no
`public: true`. This requires a verified member session at the proxy, then
leaves stronger `checkAdminAuth(req, ['founder'])`, `via === 'member'`
and founder role requirements in the actual GET handler. No role may be
inferred from an unverified header or cookie. Nearby sibling URLs remain
unmapped/denied in strict mode. This extends the E010 cumulative diff from
seven files to **eight** and requires its own explicit source review and
CI on the future published SHA. It is not part of PR #1846 as currently
published.

**Additional pre-existing dependencies:** strict-mode routing does not
currently map the legacy `/api/admin/auth` or `/api/admin/settings`
handlers, while `/labtools/admin/system` requires `members.roles` to
include the application `admin` role, independently of
`members.admin_role='founder'`. Thus the exact status endpoint mapping
alone does not prove the entire existing Admin Cockpit works under strict
routing or for a founder who lacks the separate application role. Do not
weaken the outer Admin Cockpit gate or make password routes public merely
to satisfy this isolated status candidate. Those existing boundary
questions require separate measured reconciliation and authorization.

**Parallel change coordination:** unmerged PR #1849 also modifies
`config/accessMatrix.ts` for Member Access recovery. Before admission to
any canonical build, reconcile both exact path sets and retest the combined
strict matrix. Unmerged PR #1847 also updates
`lib/admin/adminAuth.ts` auditing, so validate compatibility with its
exact accepted version if/when that patch lands. Neither parallel PR
authorizes or supplies the Reflect activation operator.

**Disposition:** strict status endpoint *source* rule can be exercised
hermetically without production access. All release, deployment,
emergency-containment, and Reflect activation holds remain in force.
