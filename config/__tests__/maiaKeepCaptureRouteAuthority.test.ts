/**
 * KEEP-CAPTURE-ACCESS-01 — exact route authority for the member's own
 * Keep/Capture portfolio. The room is admitted without granting its namespace
 * or any of the API operations it invokes after the document is loaded.
 */
import { ACCESS_RULES, checkAccess, matchRule } from '../accessMatrix';

const ordinaryMember = (pathname: string) =>
  checkAccess(pathname, 'free', ['member'], true);

describe('/maia/keep-capture — exact authenticated member room', () => {
  const previousMode = process.env.ACCESS_CONTROL_MODE;

  beforeAll(() => {
    process.env.ACCESS_CONTROL_MODE = 'strict';
  });

  afterAll(() => {
    if (previousMode === undefined) delete process.env.ACCESS_CONTROL_MODE;
    else process.env.ACCESS_CONTROL_MODE = previousMode;
  });

  it('declares exactly one exact free-tier rule and never makes the room public', () => {
    const declarations = ACCESS_RULES.filter(
      (rule) => rule.exact === '/maia/keep-capture' || rule.prefix === '/maia/keep-capture/',
    );
    expect(declarations).toHaveLength(1);

    const rule = matchRule('/maia/keep-capture');
    expect(rule).toMatchObject({ exact: '/maia/keep-capture', minTier: 'free' });
    expect(rule?.public).not.toBe(true);
    expect(rule?.prefix).toBeUndefined();
  });

  it('refuses an unauthenticated visitor', () => {
    const verdict = checkAccess('/maia/keep-capture', 'free', [], false);
    expect(verdict).toMatchObject({ allowed: false, reason: 'unauthenticated' });
    expect(verdict.unmapped).toBeFalsy();
  });

  it('admits an authenticated ordinary member and is mapped in strict mode', () => {
    const verdict = ordinaryMember('/maia/keep-capture');
    expect(verdict.allowed).toBe(true);
    expect(verdict.unmapped).toBeFalsy();
    expect(verdict.rule?.exact).toBe('/maia/keep-capture');
  });

  it.each([
    '/maia/keep-capture/',
    '/maia/keep-capture/child',
    '/maia/keep-capture/abc-123',
    '/maia/keep-capture/export',
  ])('keeps neighboring route %s unmapped and refused', (pathname) => {
    expect(matchRule(pathname)).toBeNull();
    expect(ordinaryMember(pathname)).toMatchObject({
      allowed: false,
      reason: 'no-rule-match',
      unmapped: true,
    });
  });
});
