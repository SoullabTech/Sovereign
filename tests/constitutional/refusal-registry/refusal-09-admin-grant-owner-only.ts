import type { RefusalCheck } from './harness';

/**
 * Refusal 09 — Admin standing can only be granted/revoked by an OWNER.
 *
 * The admin_role grant endpoint gates on OWNER_ROLES = ['founder','cto'] via
 * checkAdminAuth, failing closed before any write. A designated admin
 * (operations/practitioner_admin/tester) cannot mint or revoke admins — the
 * grant power stays with owners. Platform-authority boundary; see memory
 * project_platform_admin_jurisdiction.
 */

const ROUTE = 'app/api/admin/members/admin-role/route.ts';

export const check: RefusalCheck = {
  id: 'R09',
  refusal: 'Only owners (founder/cto) can grant or revoke platform admin_role',
  grade: 'B',
  enforcedBy: `${ROUTE} — checkAdminAuth(req, OWNER_ROLES) gate, fail-closed before any write`,
  evidence: "OWNER_ROLES = ['founder','cto']; auth gate precedes the UPDATE; no isAdminRequest fallback",
  violationAttempted:
    'find the grant endpoint widening OWNER_ROLES beyond founder/cto, skipping the auth gate before the write, or falling back to a weaker password-only gate',
  passingAuthorizes: 'the grant endpoint refuses non-owner callers at the server, structurally',
  passingDoesNotAuthorize:
    'that the UI hides the surface correctly — UI gating is cosmetic; this proves only the server gate',
  hostileForkMustChange:
    'add a non-owner role to OWNER_ROLES, remove the "if (!auth.authed) return" gate, or swap checkAdminAuth for an ungated/password-only path — visible diff',

  run(io) {
    const src = io.read(ROUTE);

    // 1. Owner set is exactly founder + cto (no broader roles).
    const m = src.match(/OWNER_ROLES\s*:\s*AdminRole\[\]\s*=\s*\[([^\]]*)\]/);
    if (!m) {
      io.fail('OWNER_ROLES not defined', 'grant-authority set missing — re-audit');
    } else {
      const roles = m[1]
        .split(',')
        .map((s) => s.replace(/['"\s]/g, ''))
        .filter(Boolean)
        .sort();
      if (roles.join(',') === 'cto,founder') {
        io.pass('Grant authority is exactly founder + cto', roles.join(', '));
      } else {
        io.fail('Grant authority set is not {founder, cto}', roles.join(', '));
      }
    }

    // 2. The auth gate uses OWNER_ROLES and fails closed before any write.
    const gated = /checkAdminAuth\(\s*req\s*,\s*OWNER_ROLES\s*\)/.test(src);
    const failsClosed = /if\s*\(\s*!auth\.authed\s*\)\s*return\s+adminUnauthorized\(\)/.test(src);
    if (gated && failsClosed) {
      io.pass('Auth gated on OWNER_ROLES and fails closed before the write');
    } else {
      io.fail('Grant endpoint not owner-gated / not fail-closed', `gated=${gated} failsClosed=${failsClosed}`);
    }

    // 3. The gate is not bypassable via the password-only isAdminRequest helper.
    if (/isAdminRequest/.test(src)) {
      io.fail('Password-only isAdminRequest present in grant endpoint', 'weaker gate reachable');
    } else {
      io.pass('No password-only isAdminRequest fallback in grant endpoint');
    }
  },
};
