/**
 * WS-ACCESS-CONTAINMENT-01 — the corridor is contained at the matrix.
 *
 * ⭐ These are executable against the REAL matcher, not string scans of the
 * rule file: `matchRule` resolution order is what actually decides containment,
 * and a rule that exists but is shadowed would pass a text scan and fail here.
 */
import { matchRule, checkAccess, ACCESS_RULES } from '../config/accessMatrix';
import { isWriterStudioRestrictedPath } from '../lib/writersStudio/restrictedCorridor';

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

  it('keeps the matrix as the outer auth gate while the server grant remains separate', () => {
    for (const p of EDITORIAL) {
      expect(checkAccess(p, 'free', ['member'], true).allowed).toBe(true);
      expect(isWriterStudioRestrictedPath(p)).toBe(true);
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

  it('contains the rest of the Writer API corridor without collapsing its product grant', () => {
    const focus = '/api/writers-studio/focus';
    expect(matchRule(focus)).toMatchObject({ minTier: 'free' });
    expect(matchRule(focus)?.exact ?? matchRule(focus)?.prefix).toBe('/api/writers-studio/focus');
    expect(checkAccess(focus, 'free', [], false)).toMatchObject({
      allowed: false, reason: 'unauthenticated',
    });
    expect(isWriterStudioRestrictedPath(focus)).toBe(true);
  });

  it('⛔ neighbours are untouched', () => {
    expect(matchRule('/api/sovereign/manuscripts')!.prefix).toBe('/api/sovereign');
    expect(checkAccess('/api/ain/collective/breakthrough', 'free', ['member'], true).allowed)
      .toBe(false);
  });
});
