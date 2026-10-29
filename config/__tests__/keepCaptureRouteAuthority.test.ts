/**
 * KEEP-CAPTURE-ACCESS-01 — exact route authority for Keep/Capture's page and
 * the two GET endpoints its initial load calls. No namespace grant: every
 * neighbor stays unmapped and refused in strict mode.
 */
import { checkAccess, matchRule } from '../accessMatrix';

const EXACT = [
  '/maia/keep-capture',
  '/api/psyche/portfolio/atoms',
  '/api/psyche/portfolio/source-candidates',
];

const ordinaryMember = (pathname: string) =>
  checkAccess(pathname, 'free', ['member'], true);

describe('Keep/Capture — exact authenticated member routes', () => {
  const previousMode = process.env.ACCESS_CONTROL_MODE;
  beforeAll(() => {
    process.env.ACCESS_CONTROL_MODE = 'strict';
  });
  afterAll(() => {
    if (previousMode === undefined) delete process.env.ACCESS_CONTROL_MODE;
    else process.env.ACCESS_CONTROL_MODE = previousMode;
  });

  it.each(EXACT)('%s is one exact free-tier rule, never public', (pathname) => {
    const rule = matchRule(pathname);
    expect(rule).toMatchObject({ exact: pathname, minTier: 'free' });
    expect(rule?.public).not.toBe(true);
    expect(rule?.prefix).toBeUndefined();
  });

  it.each(EXACT)('%s refuses an unauthenticated visitor', (pathname) => {
    const verdict = checkAccess(pathname, 'free', [], false);
    expect(verdict).toMatchObject({ allowed: false, reason: 'unauthenticated' });
    expect(verdict.unmapped).toBeFalsy();
  });

  it.each(EXACT)('%s admits an authenticated member, mapped in strict mode', (pathname) => {
    const verdict = ordinaryMember(pathname);
    expect(verdict.allowed).toBe(true);
    expect(verdict.unmapped).toBeFalsy();
    expect(verdict.rule?.exact).toBe(pathname);
  });

  it.each([
    '/maia/keep-capture/child',
    '/maia/anchor',
    '/api/psyche/portfolio/atoms/abc-123',
    '/api/psyche/portfolio/source-candidates/abc-123',
    '/api/psyche/portfolio',
    '/api/psyche/portfolio/export',
  ])('keeps neighboring route %s unmapped and refused', (pathname) => {
    expect(matchRule(pathname)).toBeNull();
    expect(ordinaryMember(pathname)).toMatchObject({
      allowed: false,
      reason: 'no-rule-match',
      unmapped: true,
    });
  });
});
