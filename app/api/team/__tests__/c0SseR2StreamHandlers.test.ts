/**
 * C0-SSE-R2 fictional direct Team SSE handler and membership acceptance.
 *
 * Test the real stream routes and deriveVerifiedAccess with a synthetic
 * auth_sessions database. No production queries, mail, members or network.
 * All successful streams are aborted immediately to avoid background polls.
 */
import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const MEMBER_A = '11111111-1111-4111-8111-111111111111';
const MEMBER_B = '22222222-2222-4222-8222-222222222222';
const CHANNEL = '33333333-3333-4333-8333-333333333333';
const DM = '44444444-4444-4444-8444-444444444444';

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount?: number }>>();
const mockGetChannelMessages = jest.fn<() => Promise<unknown[]>>(async () => []);
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));
jest.mock('@/lib/team/ChannelService', () => ({
  __esModule: true,
  getMessagesSince: () => mockGetChannelMessages(),
}));
jest.mock('@/lib/team/notifications', () => ({
  __esModule: true, notifyDMRecipient: jest.fn(),
}));
jest.mock('@/lib/auth/teamPermissions', () => ({
  __esModule: true, getTeamRole: jest.fn(),
}));

import { GET as channelGET } from '../channels/[channelId]/stream/route';
import { GET as dmGET } from '../dm/[dmId]/stream/route';
import { getDMMessagesSince } from '@/lib/team/DMService';

type Credentials = {
  cookie?: string;
  header?: string;
  query?: string;
  claim?: string;
  extraClaim?: string;
  memberCookie?: string;
};
const rows: Record<string, { member_id: string; tier: string; roles: string[] }> = {
  VALID_COOKIE_A: { member_id: MEMBER_A, tier: 'free', roles: ['member'] },
  VALID_HEADER_A: { member_id: MEMBER_A, tier: 'free', roles: ['member'] },
  VALID_HEADER_B: { member_id: MEMBER_B, tier: 'pro', roles: ['admin'] },
  VALID_QUERY_A: { member_id: MEMBER_A, tier: 'free', roles: ['member'] },
  VALID_QUERY_B: { member_id: MEMBER_B, tier: 'free', roles: ['member'] },
};
let channelExists = true;
let channelAllowsA = true;
let directMemberAllowed = true;
const originalCapacitorBuild = process.env.CAPACITOR_BUILD;

beforeEach(() => {
  delete process.env.CAPACITOR_BUILD;
  channelExists = true;
  channelAllowsA = true;
  directMemberAllowed = true;
  mockQuery.mockReset();
  mockGetChannelMessages.mockClear();
  mockQuery.mockImplementation(async (sql, params) => {
    if (/FROM auth_sessions/i.test(sql)) {
      expect(sql).toMatch(/revoked\s*=\s*FALSE/i);
      expect(sql).toMatch(/expires_at\s*>\s*NOW\(\)/i);
      const row = rows[String(params?.[0] ?? '')];
      return { rows: row ? [row] : [] };
    }
    if (/FROM team_channels tc/i.test(sql)) {
      const isA = params?.[1] === MEMBER_A;
      return { rows: channelExists ? [{
        is_private: true, is_member: isA && channelAllowsA,
      }] : [] };
    }
    if (/FROM team_dm_members/i.test(sql)) {
      const isA = params?.[1] === MEMBER_A;
      return { rows: isA && directMemberAllowed ? [{ present: true }] : [] };
    }
    if (/FROM team_dm_messages/i.test(sql)) return {
      rows: [{ id: 'fictional-msg', dm_thread_id: DM, sender_id: MEMBER_A,
        sender_name: 'Fictional A', body: 'Synthetic message', message_type: 'build',
        edited_at: null, deleted_at: null, created_at: new Date().toISOString() }],
    };
    throw new Error('Unexpected synthetic SQL');
  });
});

function req(path: string, opts: Credentials = {}) {
  const headers = new Headers({ host: 'fictional.invalid' });
  const jar: string[] = [];
  if (opts.cookie) jar.push('maia_session=' + opts.cookie);
  if (opts.memberCookie) jar.push('maia_member_id=' + opts.memberCookie);
  if (jar.length) headers.set('cookie', jar.join('; '));
  if (opts.header) headers.set('x-session-token', opts.header);
  if (opts.claim) headers.set('x-member-id', opts.claim);
  if (opts.extraClaim) headers.set('x-maia-member-id', opts.extraClaim);
  const controller = new AbortController();
  const request = new NextRequest(
    'https://fictional.invalid' + path + (opts.query ? '?_t=' + opts.query : ''),
    { method: 'GET', headers, signal: controller.signal },
  );
  return { request, controller };
}

async function handler(kind: 'channel' | 'dm', opts: Credentials = {}) {
  const { request, controller } = req(
    kind === 'channel'
      ? '/api/team/channels/' + CHANNEL + '/stream'
      : '/api/team/dm/' + DM + '/stream',
    opts,
  );
  try {
    const result = kind === 'channel'
      ? await channelGET(request, { params: Promise.resolve({ channelId: CHANNEL }) })
      : await dmGET(request, { params: Promise.resolve({ dmId: DM }) });
    return { result, status: result.status };
  } finally {
    controller.abort();
  }
}
function membershipReads() {
  return mockQuery.mock.calls.filter(([sql]) =>
    /FROM team_channels tc|FROM team_dm_members|FROM team_dm_messages/i.test(String(sql)));
}

describe('C0-SSE-R2 direct handler credential conflict and membership guards', () => {
  it.each(['channel', 'dm'] as const)('%s refuses different valid cookie/header principals even with URL A bearer', async kind => {
    const res = await handler(kind, {
      cookie: 'VALID_COOKIE_A', header: 'VALID_HEADER_B', query: 'VALID_QUERY_A',
    });
    expect(res.status).toBe(401);
    expect(membershipReads()).toHaveLength(0);
  });

  it.each(['channel', 'dm'] as const)('%s refuses different valid principals even with URL B bearer', async kind => {
    const res = await handler(kind, {
      cookie: 'VALID_COOKIE_A', header: 'VALID_HEADER_B', query: 'VALID_QUERY_B',
    });
    expect(res.status).toBe(401);
    expect(membershipReads()).toHaveLength(0);
  });

  it.each(['channel', 'dm'] as const)('%s refuses unknown cookie with otherwise valid URL token', async kind => {
    const res = await handler(kind, { cookie: 'EXPIRED_OR_REVOKED', query: 'VALID_QUERY_A' });
    expect(res.status).toBe(401);
    expect(membershipReads()).toHaveLength(0);
  });

  it.each(['channel', 'dm'] as const)('%s allows valid URL token alone on its approved GET SSE path', async kind => {
    const res = await handler(kind, { query: 'VALID_QUERY_A' });
    expect(res.status).toBe(200);
    expect(res.result.headers.get('content-type')).toMatch(/text\/event-stream/i);
  });

  it.each(['channel', 'dm'] as const)('%s accepts a verified Safari header when cookie is stale', async kind => {
    const res = await handler(kind, { cookie: 'EXPIRED_OR_REVOKED', header: 'VALID_HEADER_A' });
    expect(res.status).toBe(200);
  });

  it.each(['channel', 'dm'] as const)('%s accepts two valid same-member cookie/header credentials', async kind => {
    const res = await handler(kind, { cookie: 'VALID_COOKIE_A', header: 'VALID_HEADER_A' });
    expect(res.status).toBe(200);
  });

  it.each(['channel', 'dm'] as const)('%s rejects forged x-member-id even with valid URL bearer', async kind => {
    const res = await handler(kind, { query: 'VALID_QUERY_A', claim: MEMBER_B });
    expect(res.status).toBe(401);
    expect(membershipReads()).toHaveLength(0);
  });

  it.each(['channel', 'dm'] as const)('%s denies a missing or invalid URL token', async kind => {
    expect((await handler(kind)).status).toBe(401);
    expect((await handler(kind, { query: 'INVALID_QUERY' })).status).toBe(401);
    expect(membershipReads()).toHaveLength(0);
  });

  it('channel stream preserves private channel membership denial', async () => {
    channelAllowsA = false;
    const res = await handler('channel', { query: 'VALID_QUERY_A' });
    expect(res.status).toBe(403);
    expect(membershipReads().some(([sql]) => /FROM team_channels tc/i.test(String(sql)))).toBe(true);
    expect(mockGetChannelMessages).not.toHaveBeenCalled();
  });

  it('channel stream still 404s a nonexistent channel before messages', async () => {
    channelExists = false;
    const res = await handler('channel', { query: 'VALID_QUERY_A' });
    expect(res.status).toBe(404);
    expect(mockGetChannelMessages).not.toHaveBeenCalled();
  });

  it('DM message lookup returns no messages without thread membership', async () => {
    directMemberAllowed = false;
    const messages = await getDMMessagesSince(DM, MEMBER_B, 0);
    expect(messages).toEqual([]);
    expect(mockQuery.mock.calls.some(([sql]) => /FROM team_dm_messages/i.test(String(sql)))).toBe(false);
  });

  it('DM message lookup still permits only matching thread members', async () => {
    directMemberAllowed = true;
    const messages = await getDMMessagesSince(DM, MEMBER_A, 0);
    expect(messages).toHaveLength(1);
    expect(messages[0].senderId).toBe(MEMBER_A);
  });

  it('allows cookie/header A with a foreign URL token because URL must not be authoritative', async () => {
    const res = await handler('channel', {
      cookie: 'VALID_COOKIE_A', header: 'VALID_HEADER_A', query: 'VALID_QUERY_B',
    });
    expect(res.status).toBe(200);
    const tokensQueried = mockQuery.mock.calls.filter(([sql]) => /FROM auth_sessions/i.test(String(sql)))
      .map(([, args]) => (args as unknown[])[0]);
    expect(tokensQueried).toEqual(['VALID_COOKIE_A', 'VALID_HEADER_A']);
  });
});
afterAll(() => {
  if (originalCapacitorBuild === undefined) delete process.env.CAPACITOR_BUILD;
  else process.env.CAPACITOR_BUILD = originalCapacitorBuild;
});
