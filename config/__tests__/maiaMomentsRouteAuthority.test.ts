/**
 * MARKED-MOMENTS-ACCESS-01 — exact route authority for the member's own
 * verbatim moments. This test deliberately refuses a namespace grant: the
 * existing page is admitted, while every unreviewed child remains unmapped.
 */
import { checkAccess, matchRule } from '../accessMatrix';

const ordinaryMember = (pathname: string) =>
  checkAccess(pathname, 'free', ['member'], true);

describe('/maia/moments — exact authenticated member room', () => {
  const previousMode = process.env.ACCESS_CONTROL_MODE;

  beforeAll(() => {
    process.env.ACCESS_CONTROL_MODE = 'strict';
  });

  afterAll(() => {
    if (previousMode === undefined) delete process.env.ACCESS_CONTROL_MODE;
    else process.env.ACCESS_CONTROL_MODE = previousMode;
  });

  it('declares one exact free-tier rule and never makes the room public', () => {
    const rule = matchRule('/maia/moments');
    expect(rule).toMatchObject({ exact: '/maia/moments', minTier: 'free' });
    expect(rule?.public).not.toBe(true);
    expect(rule?.prefix).toBeUndefined();
  });

  it('refuses an unauthenticated visitor', () => {
    const verdict = checkAccess('/maia/moments', 'free', [], false);
    expect(verdict).toMatchObject({ allowed: false, reason: 'unauthenticated' });
    expect(verdict.unmapped).toBeFalsy();
  });

  it('admits an authenticated ordinary member and is mapped in strict mode', () => {
    const verdict = ordinaryMember('/maia/moments');
    expect(verdict.allowed).toBe(true);
    expect(verdict.unmapped).toBeFalsy();
    expect(verdict.rule?.exact).toBe('/maia/moments');
  });

  it.each([
    '/maia/moments/child',
    '/maia/moments/abc-123',
    '/maia/moments/export',
  ])('keeps neighboring route %s unmapped and refused', (pathname) => {
    expect(matchRule(pathname)).toBeNull();
    expect(ordinaryMember(pathname)).toMatchObject({
      allowed: false,
      reason: 'no-rule-match',
      unmapped: true,
    });
  });
});
