/**
 * Gate 1 — Soul Portrait Path B access-matrix behavior.
 *
 * Governs: SOUL_PORTRAIT_PATH_B_SPEC.md §2 (matrix entries) + §9 (Gate 1 verification).
 *
 * Path B's coarse gate is the route access matrix: Augusten (the family-held
 * exception) and the hand-delivered gift/self portraits load public-unlisted via
 * their `exact` rules, while EVERY other `/soul-portrait/*` and
 * `/api/soul-portrait/*` slug falls to a `prefix` rule that requires an
 * authenticated member session. The fine-grained per-portrait consent binding is
 * enforced later in the route handler (Gate 2) — this test only locks the matrix.
 *
 * Why this test exists (not decoration): the whole gate rests on matchRule
 * resolving `exact` BEFORE `prefix`. If someone reorders matchRule, or deletes an
 * exact rule, the failure is silent and serious — either the family exception gets
 * gated behind auth, or (in strict Mode B) an unmapped slug falls through the 404
 * hole the prefix rule was added to close. This test makes both regressions loud.
 *
 * Pure functions, no DB, no mocks. `config/accessMatrix.ts` has zero imports.
 */
import { matchRule, checkAccess } from '../config/accessMatrix';

// An anonymous (unauthenticated) viewer — the adversarial case the gate protects against.
const ANON = { tier: 'free' as const, roles: [], authed: false };

// Non-Augusten portraits that are deliberately public via a grandfathered `exact`
// rule (hand-delivered gifts / the author's self-portrait). Not Path B; sanctioned
// exceptions, each with its own access-matrix line.
const GRANDFATHERED_EXACT = ['heather', 'nathan', 'jondi', 'katie', 'sophie', 'andrea', 'kelly', 'larry'];

describe('Soul Portrait — Path B access gate (Gate 1)', () => {
  describe('precedence: an exact rule wins over the /soul-portrait/ prefix gate', () => {
    it('augusten resolves to its exact public rule, not the prefix gate', () => {
      const rule = matchRule('/soul-portrait/augusten');
      expect(rule?.exact).toBe('/soul-portrait/augusten');
      expect(rule?.public).toBe(true);
    });

    it('an unmapped slug resolves to the /soul-portrait/ prefix gate (auth required)', () => {
      const rule = matchRule('/soul-portrait/not-a-real-person');
      expect(rule?.prefix).toBe('/soul-portrait/');
      expect(rule?.public).toBeFalsy();
      expect(rule?.minTier).toBe('free');
    });
  });

  describe('the family exception + gift portraits load WITHOUT auth', () => {
    it('augusten portrait is public to an anonymous viewer', () => {
      expect(checkAccess('/soul-portrait/augusten', ANON.tier, ANON.roles, ANON.authed).allowed).toBe(true);
    });

    it('augusten Mentor API is public to an anonymous viewer', () => {
      expect(checkAccess('/api/soul-portrait/augusten/mentor', ANON.tier, ANON.roles, ANON.authed).allowed).toBe(true);
    });

    it.each(GRANDFATHERED_EXACT)('gift/self portrait "%s" is public to an anonymous viewer', (slug) => {
      expect(checkAccess(`/soul-portrait/${slug}`, ANON.tier, ANON.roles, ANON.authed).allowed).toBe(true);
    });
  });

  describe('every OTHER portrait requires auth — the Path B gate, not URL obscurity', () => {
    it('an unmapped portrait is denied to an anonymous viewer (unauthenticated)', () => {
      const r = checkAccess('/soul-portrait/not-a-real-person', ANON.tier, ANON.roles, ANON.authed);
      expect(r.allowed).toBe(false);
      expect(r.reason).toBe('unauthenticated');
    });

    it('the same unmapped portrait is allowed once authenticated (free tier)', () => {
      // Auth is the matrix's job; the per-portrait consent binding is the handler's (Gate 2).
      expect(checkAccess('/soul-portrait/not-a-real-person', 'free', [], true).allowed).toBe(true);
    });

    it('the portrait API for an unmapped slug is denied to an anonymous viewer', () => {
      const r = checkAccess('/api/soul-portrait/not-a-real-person/mentor', ANON.tier, ANON.roles, ANON.authed);
      expect(r.allowed).toBe(false);
      expect(r.reason).toBe('unauthenticated');
    });
  });

  describe('strict Mode B: the prefix gate closes the 404 hole', () => {
    const prev = process.env.ACCESS_CONTROL_MODE;
    beforeAll(() => { process.env.ACCESS_CONTROL_MODE = 'strict'; });
    afterAll(() => { process.env.ACCESS_CONTROL_MODE = prev; });

    it('augusten still loads (a mapped exact rule, never an unmapped 404)', () => {
      const r = checkAccess('/soul-portrait/augusten', ANON.tier, ANON.roles, ANON.authed);
      expect(r.allowed).toBe(true);
      expect(r.unmapped).toBeFalsy();
    });

    it('an unmapped slug is denied "unauthenticated" (the gate), never "no-rule-match" (the hole)', () => {
      const r = checkAccess('/soul-portrait/not-a-real-person', ANON.tier, ANON.roles, ANON.authed);
      expect(r.allowed).toBe(false);
      expect(r.reason).toBe('unauthenticated');
      expect(r.reason).not.toBe('no-rule-match');
    });
  });
});
