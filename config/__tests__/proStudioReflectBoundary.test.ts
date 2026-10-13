import { checkAccess, matchRule } from '../accessMatrix';

/**
 * Pro Studio R1b: the Reflect arrival is a signed-in member orientation.
 * It does NOT mean paid Reflect / Practice / Collective is active.
 */
describe('Pro Studio Reflect arrival ingress', () => {
  test('has a specific authenticated free-member route, not public/unmapped fallback', () => {
    const rule = matchRule('/pro-studio/reflect');
    expect(rule?.exact).toBe('/pro-studio/reflect');
    expect(rule?.minTier).toBe('free');
    expect(rule?.public).not.toBe(true);
  });

  test('refuses anonymous access to the arrival', () => {
    const result = checkAccess('/pro-studio/reflect', 'free', [], false);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('unauthenticated');
  });

  test('authenticated free members can see orientation; this does not test paid authority', () => {
    const result = checkAccess('/pro-studio/reflect', 'free', [], true);
    expect(result.allowed).toBe(true);
  });

  test('does not alter the authenticated /studio practitioner shell corridor', () => {
    const rule = matchRule('/studio');
    expect(rule?.prefix).toBe('/studio');
    expect(rule?.minTier).toBe('free');
    expect(rule?.public).not.toBe(true);
  });
});
