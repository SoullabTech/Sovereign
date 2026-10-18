/**
 * Access-policy qualification for Class A recovery under PRODUCTION-STYLE
 * strict routing (ACCESS_CONTROL_MODE=strict).
 *
 * These tests assert that an unauthenticated bearer recipient reaches ONLY
 * the one-time recovery page/redemption route, never the admin issuer.
 * The handlers themselves enforce bearer, Origin, rate limit, feature flag
 * and true founder MEMBER SESSION.
 */
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { checkAccess, matchRule } from '../accessMatrix';

const previous = process.env.ACCESS_CONTROL_MODE;
beforeAll(() => { process.env.ACCESS_CONTROL_MODE = 'strict'; });
afterAll(() => {
  if (previous === undefined) delete process.env.ACCESS_CONTROL_MODE;
  else process.env.ACCESS_CONTROL_MODE = previous;
});

describe('member recovery strict routing', () => {
  it('allows the exact member recovery landing page with no session', () => {
    expect(matchRule('/member-recovery')?.public).toBe(true);
    expect(checkAccess('/member-recovery', 'free', [], false).allowed).toBe(true);
  });

  it('allows the exact bearer redemption API with no session', () => {
    expect(matchRule('/api/members/admin-recovery')?.public).toBe(true);
    expect(checkAccess('/api/members/admin-recovery', 'free', [], false).allowed).toBe(true);
  });

  it('allows the existing member directory only to authenticated admins', () => {
    const route = '/api/admin/members';
    expect(matchRule(route)?.public).not.toBe(true);
    expect(checkAccess(route, 'free', [], false).allowed).toBe(false);
    expect(checkAccess(route, 'free', ['member'], true).allowed).toBe(false);
    expect(checkAccess(route, 'free', ['admin'], true).allowed).toBe(true);
    // Independently of this proxy rule, the existing route checks
    // checkAdminAuth(req, ['founder','cto']) before returning any member rows.
  });

  it('requires authenticated admin role for issuer at the proxy', () => {
    const route = '/api/admin/members/recovery';
    const rule = matchRule(route);
    expect(rule?.public).not.toBe(true);
    expect(rule?.rolesAnyOf).toContain('admin');
    expect(checkAccess(route, 'free', [], false).allowed).toBe(false);
    expect(checkAccess(route, 'free', ['member'], true).allowed).toBe(false);
    expect(checkAccess(route, 'free', ['admin'], true).allowed).toBe(true);
    // This outer gate is intentionally less privileged than actual issuance:
    // the handler must independently prove founder admin_role + member session.
  });

  it('retains admin-only access for the dedicated recovery operations page', () => {
    const route = '/admin/member-access';
    expect(checkAccess(route, 'free', [], false).allowed).toBe(false);
    expect(checkAccess(route, 'pro', ['member'], true).allowed).toBe(false);
    expect(checkAccess(route, 'pro', ['admin'], true).allowed).toBe(true);
  });

  it('does not accidentally make adjacent or prefix-expanded recovery paths public', () => {
    for (const route of [
      '/member-recovery/other',
      '/api/members/admin-recovery/other',
      '/api/admin/members/recovery/other',
    ]) {
      expect(matchRule(route)?.public).not.toBe(true);
      expect(checkAccess(route, 'free', [], false).allowed).toBe(false);
    }
  });
});
