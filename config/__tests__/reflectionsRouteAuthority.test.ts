/**
 * Route authority — Reflections.
 *
 * THE CONSTITUTIONAL LINE THIS BINDS (founder ruling 2026-09-04):
 * navigation, declared access, runtime authorization and native disposition
 * must describe the SAME product. Reflections is the case that proved they can
 * drift: /api/capsules is member-scoped, but the feed lived only under
 * /labtools, which requireFounder() refuses to every member, while the access
 * matrix still declared it `minTier: 'free'` — member-facing.
 *
 * The ruling resolved this by MOVING Reflections out of Lab Tools rather than
 * reconciling a second address. So the assertions here are asymmetric on
 * purpose:
 *
 *   /reflections           → every authenticated member admitted
 *   /labtools/reflections  → does not exist, and must not come back
 *
 * ⛔ If the second half fails, the fix is NOT to add a rule for
 * /labtools/reflections. A rule would declare a route that isn't there, which
 * is the same failure — the matrix describing a product that does not exist —
 * pointing the other way.
 */
import { existsSync } from 'fs';
import { join } from 'path';
import { ACCESS_RULES, checkAccess } from '../accessMatrix';
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

describe('/labtools/reflections — gone, and staying gone', () => {
  it('has no access rule, because it has no route', () => {
    for (const path of ['/labtools/reflections', '/labtools/reflections/abc-123']) {
      const rule = ACCESS_RULES.find(
        (r) => r.exact === path || (r.prefix && path.startsWith(r.prefix) && r.prefix.includes('reflections')),
      );
      expect(`${path}:${rule?.notes ?? 'no rule'}`).toBe(`${path}:no rule`);
    }
  });

  it('admits nobody — not a member, not an operator', () => {
    // With its own rules gone the path falls through to the matrix's existing
    // catch-all, `{ prefix: '/labtools', minTier: 'pro' }` ("remaining lab
    // tools = practitioner infrastructure"), which refuses both. The route
    // files are deleted, so this is belt to the 404's braces — but it means no
    // future reader can mistake the missing rule for an accidental opening.
    expect(member('/labtools/reflections').allowed).toBe(false);
    expect(operator('/labtools/reflections/abc-123').allowed).toBe(false);
  });

  it('the page files are deleted, not merely unrouted', () => {
    expect(existsSync(join(__dirname, '../../app/labtools/reflections'))).toBe(false);
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
    // taps it — precisely what pointing the House into /labtools would do.
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
