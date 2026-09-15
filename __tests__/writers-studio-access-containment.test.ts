/**
 * WS-ACCESS-CONTAINMENT-01 — the corridor is contained at the matrix.
 *
 * ⭐ These are executable against the REAL matcher, not string scans of the
 * rule file: `matchRule` resolution order is what actually decides containment,
 * and a rule that exists but is shadowed would pass a text scan and fail here.
 */
import { matchRule, checkAccess, ACCESS_RULES } from '../config/accessMatrix';

const EDITORIAL = [
  '/api/writers-studio/editorial/thread',
  '/api/writers-studio/editorial/turn',
  '/api/writers-studio/editorial/version',
];

describe('the Writer’s Studio editorial corridor is contained', () => {
  it('⭐ every editorial route resolves to a rule — no permissive forwarding', () => {
    for (const p of EDITORIAL) {
      const rule = matchRule(p);
      expect(rule).not.toBeNull();
      expect(rule!.public).not.toBe(true);
    }
  });

  it('⭐⭐ an unauthenticated caller is refused BEFORE the handler', () => {
    for (const p of EDITORIAL) {
      const r = checkAccess(p, 'free', [], false);
      expect(r.allowed).toBe(false);
      expect(r.reason).toBe('unauthenticated');
      /* ⛔ The defect this closes: `unmapped` meant permissive forwarding. */
      expect(r.unmapped).toBeFalsy();
    }
  });

  it('⛔ containment must not empty the corridor — an ordinary member still passes', () => {
    /* The routes serve any authenticated member writing in their own Studio.
       A rule that refused them would "contain" the corridor by closing it. */
    for (const p of EDITORIAL) {
      expect(checkAccess(p, 'free', ['member'], true).allowed).toBe(true);
      expect(checkAccess(p, 'free', [], true).allowed).toBe(true);
    }
  });

  it('⛔ demands no role and no paid tier', () => {
    /* ⛔ /api/ain/ is the STRUCTURAL precedent, never the policy one: copying
       its admin gate here would lock out every legitimate user. */
    for (const p of EDITORIAL) {
      const rule = matchRule(p)!;
      expect(rule.rolesAnyOf).toBeUndefined();
      expect(rule.minTier ?? 'free').toBe('free');
    }
  });

  it('⭐ resolves to its OWN rule, not to a broader neighbour', () => {
    for (const p of EDITORIAL) {
      expect(matchRule(p)!.prefix).toBe('/api/writers-studio/editorial/');
    }
  });

  it('⛔ nothing earlier in the array shadows it', () => {
    /* matchRule scans prefixes in array order and returns the first hit, so a
       broader rule placed above would silently take these paths. */
    const mine = ACCESS_RULES.findIndex((r) => r.prefix === '/api/writers-studio/editorial/');
    expect(mine).toBeGreaterThan(-1);
    const shadowing = ACCESS_RULES
      .slice(0, mine)
      .filter((r) => r.prefix && EDITORIAL.some((p) => p.startsWith(r.prefix!)))
      .map((r) => r.prefix);
    expect(shadowing).toEqual([]);
  });

  it('⚠️ records what is NOT contained by this act', () => {
    /* /api/writers-studio/focus carries the identical gap and is outside the
       authorized scope. Asserted as STILL UNMAPPED so the finding cannot be
       quietly closed without a ruling — if someone contains it, this fails and
       makes them say so. */
    expect(matchRule('/api/writers-studio/focus')).toBeNull();
  });

  it('⛔ neighbours are untouched', () => {
    expect(matchRule('/api/sovereign/manuscripts')!.prefix).toBe('/api/sovereign');
    expect(checkAccess('/api/ain/collective/breakthrough', 'free', ['member'], true).allowed)
      .toBe(false);
  });
});
