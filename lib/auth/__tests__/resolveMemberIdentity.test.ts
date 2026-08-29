// @vitest-environment jsdom
/**
 * DESKTOP-MAIA-IDENTITY-HYDRATION-01 — the server decides who the member is.
 *
 * These are written as attempts to make an authenticated member resolve to a
 * guest, because that is the defect: `/maia` returned `{ id: 'guest', name:
 * 'Friend' }` to a browser holding a valid `maia_session` cookie, and then made
 * requests as `soul_guest` on behalf of a signed-in person.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { resolveMemberIdentity } from '../resolveMemberIdentity';

const ok = (body: any) => ({ ok: true, status: 200, json: async () => body }) as any;
const http = (status: number) => ({ ok: false, status, json: async () => ({}) }) as any;
const noSleep = async () => {};

const AUTHED = {
  authed: true,
  memberId: '31276ae6-134c-41f8-a126-70d11d9aef3b',
  username: 'kelly',
  name: 'Kelly Nezat',
  preferredName: 'Kelly',
  credentialSource: 'cookie',
};

beforeEach(() => {
  localStorage.clear();
});

describe('server identity is authoritative', () => {
  it('resolves a member with NO localStorage at all — the Desktop partition case', async () => {
    // ⛔ THE DEFECT, stated as a test. Desktop's platform view uses a named
    // NON-PERSISTENT partition: it carries the authenticated cookie and no
    // localStorage whatsoever. Under the old bootstrap this member was a guest.
    expect(localStorage.length).toBe(0);
    const out = await resolveMemberIdentity({ fetchImpl: async () => ok(AUTHED), sleep: noSleep });
    expect(out.state).toBe('authenticated');
    expect(out.memberId).toBe(AUTHED.memberId);
    expect(out.displayName).toBe('Kelly');
  });

  it('never sends a claimed identity — it asks, it does not assert', async () => {
    // The old call was `/api/user/profile?userId=<whatever localStorage said>`.
    localStorage.setItem('explorerId', 'SOMEONE-ELSE');
    const seen: string[] = [];
    await resolveMemberIdentity({
      fetchImpl: async (p) => { seen.push(p); return ok(AUTHED); },
      sleep: noSleep,
    });
    expect(seen).toEqual(['/api/auth/whoami']);
    expect(seen[0]).not.toContain('SOMEONE-ELSE');
  });

  it('a cached identity cannot override the server — even a contradictory one', async () => {
    localStorage.setItem('explorerId', 'STALE-ID');
    localStorage.setItem('explorerPreferredName', 'Stale Name');
    const out = await resolveMemberIdentity({ fetchImpl: async () => ok(AUTHED), sleep: noSleep });
    expect(out.memberId).toBe(AUTHED.memberId);
    expect(out.displayName).toBe('Kelly');
    // …and the cache is corrected, downstream of the verdict.
    expect(localStorage.getItem('explorerId')).toBe(AUTHED.memberId);
    expect(localStorage.getItem('explorerPreferredName')).toBe('Kelly');
  });

  it('name priority is preferredName › name › username, skipping unusable ones', async () => {
    const cases: Array<[any, string | null]> = [
      [{ preferredName: 'Kel', name: 'Kelly Nezat', username: 'kelly' }, 'Kel'],
      [{ name: 'Kelly Nezat', username: 'kelly' }, 'Kelly Nezat'],
      [{ username: 'kelly' }, 'kelly'],
      // A UUID or a placeholder is worse than nothing — the surface has its own
      // greeting for an absent name, and "Friend" is the label this whole unit
      // exists to stop showing an authenticated member.
      [{ preferredName: '31276ae6-134c-41f8-a126-70d11d9aef3b', username: 'kelly' }, 'kelly'],
      [{ preferredName: 'Friend', name: 'Guest', username: 'kelly' }, 'kelly'],
      [{ preferredName: '  ', name: null }, null],
    ];
    for (const [fields, expected] of cases) {
      const out = await resolveMemberIdentity({
        fetchImpl: async () => ok({ authed: true, memberId: AUTHED.memberId, ...fields }),
        sleep: noSleep,
      });
      expect(out.displayName, JSON.stringify(fields)).toBe(expected);
    }
  });
});

describe('an explicit NO is an answer; a failure to ask is not', () => {
  it('authed:false resolves unauthenticated, carrying the server reason', async () => {
    const out = await resolveMemberIdentity({
      fetchImpl: async () => ok({ authed: false, reason: 'expired_session', credentialSource: 'cookie' }),
      sleep: noSleep,
    });
    expect(out.state).toBe('unauthenticated');
    expect(out.memberId).toBeNull();
    expect(out.reason).toBe('expired_session');
  });

  it('an explicit NO does not delete the local cache', async () => {
    // A verdict is authority over what we DISPLAY. Letting one expired-session
    // response erase a member's device would mean an offline boot could sign
    // them out of their own machine.
    localStorage.setItem('explorerId', 'CACHED');
    await resolveMemberIdentity({ fetchImpl: async () => ok({ authed: false }), sleep: noSleep });
    expect(localStorage.getItem('explorerId')).toBe('CACHED');
  });

  it.each([
    ['unreachable', async () => { throw new Error('network'); }],
    ['http_500', async () => http(500)],
    ['http_502', async () => http(502)],
  ])('%s is an ERROR, never a guest', async (reason, fetchImpl) => {
    // ⛔ THE DEFECT ONE LEVEL DOWN. Folding "we could not ask" into "you are not
    // signed in" is exactly how an authenticated member silently becomes
    // soul_guest. The caller must be able to tell these apart.
    const out = await resolveMemberIdentity({ fetchImpl: fetchImpl as any, sleep: noSleep, attempts: 2 });
    expect(out.state).toBe('error');
    expect(out.state).not.toBe('unauthenticated');
    expect(out.memberId).toBeNull();
    expect(out.reason).toBe(reason);
  });

  it('a body with no `authed` field is an error, not an answer', async () => {
    const out = await resolveMemberIdentity({ fetchImpl: async () => ok({ hello: 'world' }), sleep: noSleep });
    expect(out.state).toBe('error');
  });

  it('authed:true with no memberId is an error, not a demotion to guest', async () => {
    const out = await resolveMemberIdentity({
      fetchImpl: async () => ok({ authed: true, name: 'Kelly' }), sleep: noSleep,
    });
    expect(out.state).toBe('error');
    expect(out.reason).toBe('authed_without_member');
  });
});

describe('one retry, because a transient failure should not need the member', () => {
  it('retries a transport failure and succeeds on the second attempt', async () => {
    let n = 0;
    const out = await resolveMemberIdentity({
      fetchImpl: async () => { n += 1; if (n === 1) throw new Error('flap'); return ok(AUTHED); },
      sleep: noSleep,
    });
    expect(n).toBe(2);
    expect(out.state).toBe('authenticated');
  });

  it('does NOT retry an explicit verdict — the server already answered', async () => {
    let n = 0;
    await resolveMemberIdentity({
      fetchImpl: async () => { n += 1; return ok({ authed: false }); }, sleep: noSleep,
    });
    expect(n).toBe(1);
  });

  it('gives up after the bounded number of attempts rather than hanging', async () => {
    let n = 0;
    const out = await resolveMemberIdentity({
      fetchImpl: async () => { n += 1; throw new Error('down'); }, sleep: noSleep, attempts: 2,
    });
    expect(n).toBe(2);
    expect(out.state).toBe('error');
  });
});
