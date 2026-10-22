import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';
import { isTrustedPilotWrite, verifiedPilotWriterActor } from '../pilotWriteSecurity';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
const db = query as jest.Mock;
const route = 'https://beta.soullab.test/api/sovereign/writers-studio/pilot-approval';
const make = (headers: Record<string, string>) =>
  new NextRequest(route, { method: 'POST', headers });

beforeEach(() => jest.resetAllMocks());

describe('WS-TIERS-R2 dual-credential strictness and founder identity', () => {
  it('accepts a verified founder session without trusting unverified role claims', async () => {
    db.mockResolvedValue({ rows: [{ session_token: 'cookie-a', member_id: 'founder-a', admin_role: 'founder', authorized_founder: true }] });
    const actor = await verifiedPilotWriterActor(make({
      Cookie: 'maia_session=cookie-a', 'x-access-roles': 'cto', Origin: 'https://beta.soullab.test',
    }));
    expect(actor).toEqual({ memberId: 'founder-a', founder: true });
    expect(db).toHaveBeenCalledWith(expect.stringContaining('s.revoked = FALSE'), [['cookie-a']]);
  });

  it('refuses an unselected founder role even when its session is valid', async () => {
    db.mockResolvedValue({ rows: [{
      session_token: 'other-founder',
      member_id: 'founder-b',
      admin_role: 'founder',
      authorized_founder: false,
    }] });
    expect(await verifiedPilotWriterActor(make({
      'x-session-token': 'other-founder', Origin: 'https://beta.soullab.test',
    }))).toEqual({ memberId: 'founder-b', founder: false });
  });

  it('allows a single valid header session for cookie-blocked same-origin Safari', async () => {
    db.mockResolvedValue({ rows: [{ session_token: 'ios-a', member_id: 'writer-a', admin_role: null }] });
    const actor = await verifiedPilotWriterActor(make({
      'x-session-token': 'ios-a', Origin: 'https://beta.soullab.test',
    }));
    expect(actor).toEqual({ memberId: 'writer-a', founder: false });
  });

  it('rejects valid session-cookie and header credentials from different members', async () => {
    db.mockResolvedValue({ rows: [
      { session_token: 'cookie-a', member_id: 'member-a', admin_role: 'founder' },
      { session_token: 'header-b', member_id: 'member-b', admin_role: null },
    ] });
    expect(await verifiedPilotWriterActor(make({
      Cookie: 'maia_session=cookie-a', 'x-session-token': 'header-b',
    }))).toBeNull();
  });

  it('rejects a stale cookie alongside a valid header instead of falling back', async () => {
    db.mockResolvedValue({ rows: [{ session_token: 'header-b', member_id: 'member-b', admin_role: 'founder' }] });
    expect(await verifiedPilotWriterActor(make({
      Cookie: 'maia_session=expired-a', 'x-session-token': 'header-b',
    }))).toBeNull();
  });

  it('rejects identity assertion mismatch even with a valid session', async () => {
    db.mockResolvedValue({ rows: [{ session_token: 'cookie-a', member_id: 'member-a', admin_role: 'founder' }] });
    expect(await verifiedPilotWriterActor(make({
      Cookie: 'maia_session=cookie-a', 'x-member-id': 'member-b',
    }))).toBeNull();
  });

  it('does not trust an x-member-id, role or tier header without a valid session', async () => {
    expect(await verifiedPilotWriterActor(make({
      'x-member-id': 'founder-a', 'x-access-roles': 'founder',
      'x-access-tier': 'pro',
    }))).toBeNull();
    expect(db).not.toHaveBeenCalled();
  });

  it('never silently discards a malformed supplied cookie in favor of a header', async () => {
    expect(await verifiedPilotWriterActor(make({
      Cookie: 'maia_session=' + 'x'.repeat(260), 'x-session-token': 'header-b',
    }))).toBeNull();
    expect(db).not.toHaveBeenCalled();
  });
});

describe('WS-TIERS-R2 origin protection', () => {
  it('accepts only exact-origin, same-site or no-fetch-metadata browser writes', () => {
    expect(isTrustedPilotWrite(make({
      Origin: 'https://beta.soullab.test', 'Sec-Fetch-Site': 'same-origin',
    }))).toBe(true);
    expect(isTrustedPilotWrite(make({
      Origin: 'https://beta.soullab.test',
    }))).toBe(true);
  });

  it.each([
    {},
    { Origin: 'https://unrelated.test' },
    { Origin: 'null' },
    { Origin: 'https://beta.soullab.test.evil.test' },
    { Origin: 'https://beta.soullab.test', 'Sec-Fetch-Site': 'cross-site' },
    { Origin: 'https://beta.soullab.test', 'Sec-Fetch-Site': 'same-site' },
  ])('refuses foreign, missing or ambiguous origin evidence: %j', (headers) => {
    expect(isTrustedPilotWrite(make(headers))).toBe(false);
  });
});
