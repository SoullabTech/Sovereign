// @vitest-environment jsdom
/**
 * DESKTOP-MAIA-IDENTITY-HYDRATION-01 — the server verdict outranks localStorage.
 *
 * ⛔ WHY THESE EXIST. The first cut of this unit had the right resolver and the
 * wrong order: `checkAndMigrateSession()` still ran first and could redirect to
 * /signin from localStorage alone, so the case the unit exists for never
 * reached the server. Every test below is an attempt to make local state
 * override, redirect, or sign out a member the server has confirmed.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { decideMaiaArrival, SESSION_VERSION } from '../maiaArrival';
import type { ResolvedIdentity } from '../resolveMemberIdentity';

const MEMBER = '31276ae6-134c-41f8-a126-70d11d9aef3b';

const authenticated: ResolvedIdentity = {
  state: 'authenticated', memberId: MEMBER, displayName: 'Kelly',
  username: 'kelly', reason: null, credentialSource: 'cookie',
};
const unauthenticated: ResolvedIdentity = {
  state: 'unauthenticated', memberId: null, displayName: null,
  username: null, reason: 'expired_session', credentialSource: 'cookie',
};
const errored: ResolvedIdentity = {
  state: 'error', memberId: null, displayName: null,
  username: null, reason: 'unreachable', credentialSource: null,
};

const says = (r: ResolvedIdentity) => async () => r;

/** A localStorage that looks like a signed-in member to the legacy code. */
function cachedMember() {
  localStorage.setItem('explorerId', MEMBER);
  localStorage.setItem('explorerName', 'Kelly');
  localStorage.setItem('beta_user', JSON.stringify({ id: MEMBER, username: 'kelly' }));
  localStorage.setItem('maia_session_version', String(SESSION_VERSION));
}

beforeEach(() => localStorage.clear());

describe('an authenticated member cannot be redirected or signed out by local state', () => {
  it('EMPTY localStorage — the Desktop partition case that started this', async () => {
    // ⛔ THE DEFECT. hasAnySessionData === false made the legacy check return
    // 'fresh' and redirect to /signin BEFORE whoami was asked. A valid cookie
    // and an empty store is not a fresh install; it is a member on a new
    // browser profile.
    expect(localStorage.length).toBe(0);
    const d = await decideMaiaArrival(says(authenticated));
    expect(d.kind).toBe('member');
    if (d.kind !== 'member') return;
    expect(d.memberId).toBe(MEMBER);
  });

  it('STALE session version — the half a naive reordering would have missed', async () => {
    // The resolver writes explorerId and the name but not maia_session_version,
    // so on the next mount the legacy check would find a mismatch and sign out
    // a member the server had just confirmed. Moving whoami earlier does not
    // fix this; removing localStorage's authority does.
    localStorage.setItem('explorerId', MEMBER);
    localStorage.setItem('maia_session_version', '1');
    const d = await decideMaiaArrival(says(authenticated));
    expect(d.kind, 'a stale local version signed out a confirmed member').toBe('member');
    expect(localStorage.getItem('maia_session_version')).toBe(String(SESSION_VERSION));
  });

  it('NO session version at all is likewise not a sign-out', async () => {
    localStorage.setItem('explorerId', MEMBER);
    const d = await decideMaiaArrival(says(authenticated));
    expect(d.kind).toBe('member');
    expect(localStorage.getItem('maia_session_version')).toBe(String(SESSION_VERSION));
  });

  it('a poisoned local_* cached id loses to the server id', async () => {
    localStorage.setItem('explorerId', 'local_1735689600000');
    localStorage.setItem('beta_user', JSON.stringify({ id: 'local_1735689600000' }));
    const d = await decideMaiaArrival(says(authenticated));
    expect(d.kind).toBe('member');
    if (d.kind !== 'member') return;
    expect(d.memberId).toBe(MEMBER);
    expect(localStorage.getItem('explorerId')).toBe(MEMBER);
    expect(d.repaired).toContain('replaced_poisoned_explorer_id');
    expect(d.repaired).toContain('cleared_poisoned_beta_user');
  });

  it('a UUID cached as a name is cleared, not shown and not a sign-out', async () => {
    localStorage.setItem('explorerId', MEMBER);
    localStorage.setItem('explorerName', MEMBER);
    const d = await decideMaiaArrival(says(authenticated));
    expect(d.kind).toBe('member');
    expect(localStorage.getItem('explorerName')).toBeNull();
  });

  it('NOTHING in localStorage can produce a redirect for a confirmed member', async () => {
    // Swept rather than argued: every key the legacy policy consults, in every
    // shape that used to route, against an authenticated verdict.
    const hostile: Array<Record<string, string>> = [
      {},
      { maia_session_version: '1' },
      { maia_session_version: '0', explorerName: MEMBER },
      { explorerId: 'local_x', beta_user: '{"id":"local_x"}' },
      { signup_completed: 'true' },
      { beta_user: 'not json at all' },
      { explorerName: 'user_123', explorerId: 'deadbeefdeadbeef' },
    ];
    for (const state of hostile) {
      localStorage.clear();
      for (const [k, v] of Object.entries(state)) localStorage.setItem(k, v);
      const d = await decideMaiaArrival(says(authenticated));
      expect(d.kind, `localStorage ${JSON.stringify(state)} routed a confirmed member`).toBe('member');
    }
  });
});

describe('an explicit NO, and a failure to ask, are different answers', () => {
  it('unauthenticated + a fully cached member is UNAUTHENTICATED', async () => {
    // Cached member data cannot promote someone the server declined.
    cachedMember();
    const d = await decideMaiaArrival(says(unauthenticated));
    expect(d.kind).not.toBe('member');
    expect(['guest', 'redirect']).toContain(d.kind);
  });

  it('unauthenticated + empty store still routes a genuine newcomer', async () => {
    // The legacy policy is not deleted — it is demoted. This is where it is
    // legitimately in charge.
    const d = await decideMaiaArrival(says(unauthenticated));
    expect(d.kind).toBe('redirect');
    if (d.kind !== 'redirect') return;
    expect(d.reason).toBe('fresh');
    expect(d.to).toBe('/signin');
  });

  it('error + a fully cached member is an ERROR — never guest, never a redirect', async () => {
    // ⛔ Routing on "we could not ask" would sign a member out over a flaky
    // network; rendering it as guest is how an authenticated member became
    // soul_guest in the first place.
    cachedMember();
    const d = await decideMaiaArrival(says(errored));
    expect(d.kind).toBe('identity-error');
    if (d.kind !== 'identity-error') return;
    expect(d.reason).toBe('unreachable');
  });

  it('error does not touch the cache on its way out', async () => {
    cachedMember();
    await decideMaiaArrival(says(errored));
    expect(localStorage.getItem('explorerId')).toBe(MEMBER);
    expect(localStorage.getItem('beta_user')).not.toBeNull();
  });
});
