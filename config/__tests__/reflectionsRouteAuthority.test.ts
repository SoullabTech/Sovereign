/**
 * Route authority — Reflections.
 *
 * THE CONSTITUTIONAL LINE THIS BINDS (founder ruling 2026-09-04):
 * navigation, declared access, runtime authorization and native disposition
 * must describe the SAME product. Reflections is the case that proved they can
 * drift: /api/capsules is member-scoped, the House now offers a member door,
 * app/labtools/layout.tsx refuses every non-founder — and until this ruling the
 * access matrix still declared the lab surface `minTier: 'free'`, i.e.
 * member-facing. A declaration that contradicts enforcement is not harmless
 * once members stop navigating there: it misleads later routing, entitlement,
 * audit and test work into "repairing" the gate instead of the declaration.
 *
 * So this file asserts the split itself, in both directions:
 *
 *   /reflections           → every authenticated member          (member home)
 *   /labtools/reflections  → internal only, member refused       (lab surface)
 *
 * ⛔ If a change makes either half fail, the fix is NOT to relax
 * requireFounder() in app/labtools/layout.tsx. That gate is the authority; the
 * matrix approximates it.
 */
import { checkAccess } from '../accessMatrix';
import { HOUSE_DESTINATIONS } from '@/lib/navigation/houseDestinations';

/** An ordinary authenticated member: free tier, no elevated roles. */
const member = (path: string) => checkAccess(path, 'free', ['member'], true);
/** An internal operator: carries the admin role the matrix uses for lab surfaces. */
const operator = (path: string) => checkAccess(path, 'free', ['member', 'admin'], true);

describe('/reflections — the member home', () => {
  it('admits an ordinary member to the feed and to a single reflection', () => {
    expect(member('/reflections').allowed).toBe(true);
    expect(member('/reflections/abc-123').allowed).toBe(true);
  });

  it('is mapped, so strict mode cannot deny a member their own reflections', () => {
    // An unmapped route is denied outright under ACCESS_CONTROL_MODE=strict.
    expect(member('/reflections').unmapped).toBeFalsy();
    expect(member('/reflections/abc-123').unmapped).toBeFalsy();
  });

  it('still requires authentication — member-facing is not public', () => {
    expect(checkAccess('/reflections', 'free', [], false).allowed).toBe(false);
  });
});

describe('/labtools/reflections — the founder/lab surface', () => {
  it('refuses an ordinary member, matching the requireFounder() gate above it', () => {
    expect(member('/labtools/reflections').allowed).toBe(false);
    expect(member('/labtools/reflections/abc-123').allowed).toBe(false);
  });

  it('is declared internal-only by role, not by tier', () => {
    // `minTier` alone cannot express this: every authenticated member satisfies
    // 'free', which is exactly how the contradiction arose. The role is the
    // matrix's established vocabulary for an internal surface (/founder,
    // /labtools/admin, /labtools/gifts carry the same shape).
    const denied = member('/labtools/reflections');
    expect(denied.reason).toBe('missing-role');
    expect(denied.rule?.rolesAnyOf).toContain('admin');
    expect(operator('/labtools/reflections').allowed).toBe(true);
  });

  it('never declares itself member-facing again', () => {
    for (const path of ['/labtools/reflections', '/labtools/reflections/abc-123']) {
      const rule = member(path).rule;
      expect(`${path}:${rule?.rolesAnyOf?.length ?? 0}`).not.toBe(`${path}:0`);
    }
  });
});

describe('the House offers only what the matrix admits', () => {
  it('the Reflections door leads somewhere an ordinary member may actually go', () => {
    const door = HOUSE_DESTINATIONS.find((d) => d.id === 'reflections');
    expect(door?.route).toBe('/reflections');
    expect(door?.audience).toBe('all');
    expect(member(door!.route!).allowed).toBe(true);
  });

  it('no member-visible door leads anywhere the matrix refuses a member', () => {
    // The failure this prevents: advertising a place that 403s the person who
    // taps it — which is precisely what pointing the House at
    // /labtools/reflections would have done.
    for (const d of HOUSE_DESTINATIONS) {
      if (d.audience !== 'all' || d.kind !== 'route' || !d.route) continue;
      const verdict = member(d.route);
      // An unmapped route is a separate (permissive-mode) question; only a
      // mapped refusal is a contradiction between the House and the matrix.
      if (verdict.unmapped) continue;
      expect(`${d.id}:${verdict.allowed}`).toBe(`${d.id}:true`);
    }
  });
});
