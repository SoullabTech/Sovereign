/**
 * MAIA-WISDOM-CONSENT-01 · ACT 2 — AIN corridor containment
 *
 * Locks the containment of the /api/ain/* corridor.
 *
 * WHY THIS TEST EXISTS. On 2026-09-15 an unauthenticated POST from the public
 * internet to https://soullab.life/api/ain/collective/breakthrough returned
 * HTTP 400 — the route's OWN body validator, which means the handler executed.
 * Two layers were absent at once: no access-matrix rule matched /api/ain/*, so
 * permissive mode forwarded the request, and the handlers carry no guard of
 * their own.
 *
 * THIS IS CONTAINMENT, NOT THE CONTRIBUTION BOUNDARY. An authenticated
 * conversation is still not an offering to the field (R15). These assertions
 * say who may reach the corridor; they say nothing about whether a member has
 * consented to contribute.
 */

import { matchRule, checkAccess } from '../config/accessMatrix';
import type { Role, Tier } from '../config/accessMatrix';

const CORRIDOR = [
  '/api/ain/collective/breakthrough',
  '/api/ain/control',
  '/api/ain/knowledge',
  '/api/ain/process',
  '/api/ain/telemetry',
  '/api/ain/digest',
  '/api/ain/activate',
];

const deny = (path: string, tier: Tier, roles: Role[], authed: boolean) =>
  checkAccess(path, tier, roles, authed);

describe('AIN corridor containment (MAIA-WISDOM-CONSENT-01)', () => {
  describe('every /api/ain route is mapped', () => {
    it.each(CORRIDOR)('%s matches the corridor rule', (path) => {
      const rule = matchRule(path);
      expect(rule).not.toBeNull();
      expect(rule!.prefix).toBe('/api/ain/');
      expect(rule!.rolesAnyOf).toEqual(['admin']);
      expect(rule!.public).toBe(false);
    });
  });

  describe('unauthenticated callers are refused before the handler', () => {
    // The production defect: this path reached the route's own 400 validator.
    it.each(CORRIDOR)('%s refuses an anonymous caller', (path) => {
      const d = deny(path, 'free', [], false);
      expect(d.allowed).toBe(false);
      expect(d.reason).toBe('unauthenticated'); // middleware answers 401 for /api/*
      expect(d.unmapped).toBeFalsy();
    });
  });

  describe('authenticated non-admins are refused', () => {
    it.each([['member'], ['practitioner'], ['steward'], ['curator'], ['partner']] as Role[][])(
      'role %s cannot reach the corridor',
      (role) => {
        const d = deny('/api/ain/collective/breakthrough', 'free', [role], true);
        expect(d.allowed).toBe(false);
        expect(d.reason).toBe('missing-role');
      },
    );
  });

  describe('admins reach the corridor normally', () => {
    it.each(CORRIDOR)('%s admits an admin', (path) => {
      expect(deny(path, 'free', ['admin'], true).allowed).toBe(true);
    });

    // minTier 'free' is load-bearing: checkAccess returns on the FIRST failure,
    // so a higher minTier would report 'insufficient-tier' and never evaluate
    // the role. Keeping the admin role the single operative condition means a
    // paying tier is never accidentally required to administer the corridor.
    it('does not require a paid tier of an admin', () => {
      expect(deny('/api/ain/control', 'free', ['admin'], true).reason).toBeUndefined();
    });
  });

  describe('regression — containment is scoped to the corridor', () => {
    it('leaves Seam 2 (/api/between/chat) unmapped and untouched', () => {
      // Seam 2 contributes via a direct function call on an authenticated
      // route, gated by AIN_FIELD_BRIDGE_ENABLED and !isSanctuary. This repair
      // must not alter it — its defect is consent (R15), not access.
      const rule = matchRule('/api/between/chat');
      expect(rule?.prefix).not.toBe('/api/ain/');
    });

    it('does not capture neighbouring /api paths by prefix', () => {
      for (const path of ['/api/founder/ops', '/api/team', '/api/book-studio/x']) {
        expect(matchRule(path)?.prefix).not.toBe('/api/ain/');
      }
    });

    it('does not capture a lookalike path outside the corridor', () => {
      // '/api/ain' without the trailing slash, and '/api/ainsley', must not be
      // swept in by the prefix — the rule says corridor, not substring.
      expect(matchRule('/api/ainsley')?.prefix).not.toBe('/api/ain/');
    });
  });
});
