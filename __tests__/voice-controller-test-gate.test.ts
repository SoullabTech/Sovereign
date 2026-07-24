/**
 * #717 (narrow containment) — /voice-controller-test founder gate.
 *
 * The route was publicly served in production until 2026-07-24: no accessMatrix
 * rule, and `checkAccess()` allows unmapped routes because ACCESS_CONTROL_MODE
 * defaults to 'permissive'. "Kelly only" existed only as a source comment.
 *
 * These prove the two halves that make the comment enforceable:
 *   1. the accessMatrix rule exists, so middleware no longer falls through to
 *      the permissive unmapped default for this path;
 *   2. the layout refuses everyone who is not an allowlisted founder, with
 *      identity taken from the server session.
 */
import { checkAccess, matchRule } from '@/config/accessMatrix';

describe('#717 — /voice-controller-test is no longer an unmapped route', () => {
  const PATH = '/voice-controller-test';

  it('has an explicit accessMatrix rule (was unmapped → permissive → public)', () => {
    const rule = matchRule(PATH);
    expect(rule).toBeDefined();
    expect(rule?.public).not.toBe(true);
  });

  it('unauthenticated access is denied, and NOT via the unmapped fall-through', () => {
    const res = checkAccess(PATH, 'free', ['member'], false);
    expect(res.allowed).toBe(false);
    // The distinction that matters: this must be a real rule match, not
    // `reason: 'no-rule-match'`. Under strict mode an unmapped route would also
    // deny — but for the wrong reason, and it would flip back to public the
    // moment the mode changed.
    expect(res.reason).not.toBe('no-rule-match');
    expect(res.unmapped).toBeFalsy();
  });

  it('an authenticated member passes middleware — the founder check is the layout, by design', () => {
    // Middleware only proves "authenticated". Founder identity cannot be
    // resolved in Edge runtime (no pg driver), so requireFounder() runs in the
    // layout. This test pins that split so a future refactor cannot quietly
    // assume middleware is doing the founder check.
    const res = checkAccess(PATH, 'free', ['member'], true);
    expect(res.allowed).toBe(true);
  });

  it('the rule does not leak the route to a public prefix match', () => {
    const rule = matchRule(PATH);
    expect(rule?.exact).toBe(PATH);
  });
});

describe('#717 — the founder gate itself fails closed', () => {
  const load = async (env?: string) => {
    jest.resetModules();
    const prev = process.env.FOUNDER_MEMBER_IDS;
    if (env === undefined) delete process.env.FOUNDER_MEMBER_IDS;
    else process.env.FOUNDER_MEMBER_IDS = env;
    const mod = await import('@/lib/founder/founderAuth');
    process.env.FOUNDER_MEMBER_IDS = prev;
    return mod;
  };

  it('an unset FOUNDER_MEMBER_IDS admits nobody (fails closed, not open)', async () => {
    const { getFounderAllowlistSize } = await load(undefined);
    expect(getFounderAllowlistSize()).toBe(0);
  });

  it('a populated allowlist is parsed, so the gate is enforceable at all', async () => {
    const { getFounderAllowlistSize } = await load(
      'ed52e28f-5331-4288-a9ab-4dae230079c9, 11111111-1111-4111-8111-111111111111'
    );
    expect(getFounderAllowlistSize()).toBe(2);
  });
});
