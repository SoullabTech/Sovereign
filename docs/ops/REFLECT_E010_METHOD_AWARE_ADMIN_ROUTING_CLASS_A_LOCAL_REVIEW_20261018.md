# Reflect E010 / Admin Cockpit — method-aware legacy authorization
**18 October 2026 — Class A · LOCAL SOURCE CANDIDATE · DO NOT PUBLISH, MERGE OR DEPLOY**

## Custody and reason

Direct-parent source is the unchanged eight-file Draft PR #1850
(c9a97f997a253236ffdeef2c82a20c2ec4a90246), itself based on frozen
E010 (e010c0977320ea3cceb7424e84a5cf5c58770cc2).
This new isolated worktree/branch is only a local proposed follow-up.
Its ancestor PR and production code cannot be modified by this work.

The first attempted local correction bd4f8fb199e2a2eff02e8a31d8b20767c0167487
is specifically REJECTED for publication: one blanket application-admin
proxy role on /api/admin/auth erroneously blocks a valid founder or CTO
with a members.admin_role of founder or cto when their separately managed
members.roles array does not contain application role admin.
Migrations define the fields independently and the admin-role grant
route updates only members.admin_role.

The legacy /api/admin/auth URL supports TWO DIFFERENT operations:

- GET: report the caller's valid member session's true
  members.admin_role (including founder or cto) as isAdmin, for
  Studio Settings, Monitor and Research auto-detection. No password-only
  founder/owner claim; no role from client headers. The HTTP 200,
  isAdmin:false denial response remains for client compatibility.
- POST: validate the legacy shared-password challenge used by the existing
  System Admin/Command Center UI. Requires BOTH a server-verified
  application-admin MEMBER SESSION and the original shared password.
  An anonymous caller, an ordinary member, or a member whose only standing
  is founder/CTO admin_role must not cross POST merely by knowing the password.
  POST response token remains UI state; NOT a member session or release
  authority. All original incorrect-password behavior is retained after
  member-session authorization.

A path-only proxy cannot express distinct GET/POST roles: the proposed
nonpublic exact /api/admin/auth route rule requires an authenticated member
(minTier free), while GET/POST handlers enforce their method-specific
roles. GET uses real deriveVerifiedAccess and checkAdminAuth;
checkAdminAuth's generic password fallback is stripped from GET.
When member cookie and Safari x-session-token disagree, cookie wins in
BOTH checks. A forged x-member-id mismatch denies. Responses are
private, no-store.

The other exact route /api/admin/settings requires a verified
application-admin role at the proxy PLUS the original
LABTOOLS_ADMIN_PASSWORD route guard. Its handler, query shape, and
historical in-route tests are unchanged. No public route, catchall,
new schema, new role, session minting, access-control bypass, production
operator, feature flag, Caddy change, or Docker action is added.

## Caller compatibility

| Existing caller | Required behavior and limit |
| --- | --- |
| /studio/settings | Legitimate founder/CTO session sees correct GET role even without app-admin; ordinary member cannot claim owner status using shared password |
| /admin/monitor and /admin/research | GET auto-admin detection works for real admin_role member sessions; separate data API/password gates are unchanged |
| /labtools/admin/system and /labtools/admin/command-center | Page proxy already requires app-admin and Lab Tools layout separately requires member cookie/allowlist; POST now requires app-admin session plus old password |
| /api/admin/settings | Existing shared-password GET/POST available only to verified app-admin at outer proxy |

**Still unresolved:** Original Admin Cockpit page itself needs application
admin role, Lab Tools allowlist, cookie-based member session and legacy
UI password; founder admin_role alone does not confer full page access.
Cookie-blocked Safari can use API header fallback but cannot render the
cookie-only Lab Tools layout. This design does NOT change the page.
Do NOT broaden founder/Lab Tools allowlists, members.roles or password-only
visitors just to make the UI visible.

## Evidence and pending release decisions

Run fictional-only Jest integration tests using actual proxy, access matrix,
deriveVerifiedAccess, checkAdminAuth, GET/POST auth handler and existing
settings handler, with mocked fictional SQL rows. Required negative/positive
cases: legitimate founder/CTO with/without application admin role, absent
session, wrong/stolen header, conflicting current cookie/stale header,
forged member/role assertions, revoked/expired sessions, anonymous
shared password, valid/wrong app-admin/password and settings write gate.

Native TypeScript no-regression, Soullab precommit/secret/size/privacy
guards and current PR #1849 access-matrix overlap must pass before even
requesting review-only publication.

**Parallel source conflict:** unmerged PR #1847 modifies this same
app/api/admin/auth/route.ts to record shared-password POST outcomes
and improve audit observability. Its accepted patch MUST be reconciled
deliberately without silently dropping those protections. Unmerged PR
#1849 edits config/accessMatrix.ts for recovery and email verification,
requiring separate exact-source combined review. Neither source PR is
incorporated or published here.

This candidate is LOCAL ONLY. Future release requires separate founder
source acceptance, independent Class A security review, explicit merge
authority, exact-SHA deployment capacity and rollback qualification and
a permitted technical operator. Reflect beta activation and emergency
ingress OFF remain on independent HOLD.
