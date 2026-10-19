/**
 * C0-SSE-R2: real Team GET handlers and membership SQL against isolated
 * PostgreSQL 17 on a private fictional Unix socket. No migrations, external
 * database, mail, member data, production credentials or live network.
 * Synthetic Team tables are created and dropped ONLY in c0_fictional.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { Pool } from 'pg';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const CHANNEL = '33333333-3333-4333-8333-333333333333';
const DM = '44444444-4444-4444-8444-444444444444';
const enabled = process.env.C0_PG_WITNESS === '1' ? describe : describe.skip;

let pool: Pool;
const mockQuery = jest.fn<(sql: string, args?: unknown[]) => Promise<{
  rows: Record<string, unknown>[]; rowCount: number | null;
}>>();
const mockChannelMessages = jest.fn(async () => [] as unknown[]);
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, args?: unknown[]) => mockQuery(sql, args),
}));
jest.mock('@/lib/team/ChannelService', () => ({
  __esModule: true,
  getMessagesSince: () => mockChannelMessages(),
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

function makeRequest(kind: 'channel' | 'dm', opts: {
  cookie?: string; header?: string; query?: string; claim?: string;
} = {}) {
  const headers = new Headers();
  if (opts.cookie) headers.set('cookie', 'maia_session=' + opts.cookie);
  if (opts.header) headers.set('x-session-token', opts.header);
  if (opts.claim) headers.set('x-member-id', opts.claim);
  const path = kind === 'channel'
    ? '/api/team/channels/' + CHANNEL + '/stream'
    : '/api/team/dm/' + DM + '/stream';
  const abort = new AbortController();
  return {
    req: new NextRequest('https://fictional.invalid' + path +
      (opts.query ? '?_t=' + opts.query : ''), {
      method: 'GET', headers, signal: abort.signal,
    }),
    abort,
  };
}

async function call(kind: 'channel' | 'dm', opts: Parameters<typeof makeRequest>[1] = {}) {
  const { req, abort } = makeRequest(kind, opts);
  try {
    return kind === 'channel'
      ? await channelGET(req, { params: Promise.resolve({ channelId: CHANNEL }) })
      : await dmGET(req, { params: Promise.resolve({ dmId: DM }) });
  } finally {
    abort.abort();
  }
}

function readTeamMaterial() {
  return mockQuery.mock.calls.some(([sql]) =>
    /FROM team_channels tc|FROM team_dm_members|FROM team_dm_messages/i.test(String(sql)));
}

enabled('C0-SSE-R2 real PostgreSQL handler identity and membership', () => {
  beforeAll(async () => {
    const socket = process.env.C0_PG_SOCKET;
    if (!socket ||
      !/^\/(?:private\/)?tmp\/soullab-c0pg-20261018\.[A-Za-z0-9]+\/socket$/.test(socket) ||
      process.env.C0_PG_DATABASE !== 'c0_fictional' ||
      process.env.CI !== 'true' ||
      process.env.DATABASE_URL || process.env.SMTP_HOST || process.env.EMAIL_PROVIDER ||
      process.env.CAPACITOR_BUILD) {
      throw new Error('C0 Team PG test refused: only fictional socket and clean environment');
    }
    pool = new Pool({
      host: socket, port: 55473, database: 'c0_fictional',
      user: 'soullab', max: 3, connectionTimeoutMillis: 2000,
    });
    const proof = await pool.query(
      'SELECT current_database() AS db, inet_server_addr() IS NULL AS socket_only, current_setting($1)::integer AS pg_version',
      ['server_version_num'],
    );
    if (proof.rows[0]?.db !== 'c0_fictional' ||
        proof.rows[0]?.socket_only !== true ||
        proof.rows[0]?.pg_version < 170000) {
      throw new Error('C0 Team PG test refused: wrong database, transport or version');
    }
    const fixture = [
      'CREATE TABLE IF NOT EXISTS team_channels (id UUID PRIMARY KEY, is_private BOOLEAN NOT NULL);',
      'CREATE TABLE IF NOT EXISTS team_channel_members (channel_id UUID NOT NULL, member_id UUID NOT NULL, PRIMARY KEY(channel_id,member_id));',
      'CREATE TABLE IF NOT EXISTS team_dm_members (dm_thread_id UUID NOT NULL, member_id UUID NOT NULL, PRIMARY KEY(dm_thread_id,member_id));',
      'CREATE TABLE IF NOT EXISTS team_dm_messages (id UUID PRIMARY KEY, dm_thread_id UUID NOT NULL, sender_id UUID NOT NULL, body TEXT NOT NULL, message_type TEXT NOT NULL, edited_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL);',
    ].join(' ');
    await pool.query(fixture);
    mockQuery.mockImplementation(async (sql, args) =>
      (await pool.query(sql, args as unknown[] | undefined)));
  }, 15000);

  afterAll(async () => {
    if (pool) {
      await pool.query('DROP TABLE IF EXISTS team_dm_messages, team_dm_members, team_channel_members, team_channels;');
      await pool.end();
    }
  });

  beforeEach(async () => {
    mockQuery.mockClear();
    mockChannelMessages.mockClear();
    await pool.query('TRUNCATE team_dm_messages, team_dm_members, team_channel_members, team_channels');
    await pool.query('INSERT INTO team_channels(id, is_private) VALUES ($1, true)', [CHANNEL]);
    await pool.query('INSERT INTO team_channel_members(channel_id,member_id) VALUES ($1,$2)', [CHANNEL, A]);
    await pool.query('INSERT INTO team_dm_members(dm_thread_id,member_id) VALUES ($1,$2)', [DM, A]);
    await pool.query(
      'INSERT INTO team_dm_messages(id,dm_thread_id,sender_id,body,message_type,created_at) VALUES ($1,$2,$3,$4,$5,NOW())',
      ['55555555-5555-4555-8555-555555555555', DM, A, 'Synthetic message', 'build'],
    );
    mockQuery.mockClear();
  });

  it.each(['channel', 'dm'] as const)('%s refuses conflicting VALID sessions even with an additional valid URL bearer', async kind => {
    const result = await call(kind, {
      cookie: 'FICTIONAL_VALID_COOKIE', header: 'FICTIONAL_OTHER_MEMBER',
      query: 'FICTIONAL_VALID_SAFARI',
    });
    expect(result.status).toBe(401);
    expect(readTeamMaterial()).toBe(false);
  });

  it.each(['channel', 'dm'] as const)('%s admits a valid query-only SSE bearer with a synthetic member', async kind => {
    const result = await call(kind, { query: 'FICTIONAL_VALID_SAFARI' });
    expect(result.status).toBe(200);
    expect(result.headers.get('content-type')).toMatch(/text\/event-stream/i);
  });

  it('real channel membership SQL denies a nonmember with a valid session', async () => {
    const result = await call('channel', { query: 'FICTIONAL_OTHER_MEMBER' });
    expect(result.status).toBe(403);
    expect(readTeamMaterial()).toBe(true);
    expect(mockChannelMessages).not.toHaveBeenCalled();
  });

  it('real channel membership SQL permits only the fictional member', async () => {
    const result = await call('channel', { query: 'FICTIONAL_VALID_COOKIE' });
    expect(result.status).toBe(200);
  });

  it('real DM membership SQL returns no messages for a verified nonmember', async () => {
    const result = await getDMMessagesSince(DM, B, 0);
    expect(result).toEqual([]);
    expect(mockQuery.mock.calls.some(([sql]) => /FROM team_dm_messages/i.test(String(sql)))).toBe(false);
  });

  it('real DM membership SQL returns synthetic content only to a participant', async () => {
    const result = await getDMMessagesSince(DM, A, 0);
    expect(result).toHaveLength(1);
    expect(result[0].body).toBe('Synthetic message');
  });

  it('stale cookie with valid Safari header still grants the authenticated channel member', async () => {
    const result = await call('channel', {
      cookie: 'FICTIONAL_EXPIRED', header: 'FICTIONAL_VALID_SAFARI',
    });
    expect(result.status).toBe(200);
  });

  it('stale cookie cannot be bypassed with query bearer when no valid header exists', async () => {
    const result = await call('channel', {
      cookie: 'FICTIONAL_EXPIRED', query: 'FICTIONAL_VALID_SAFARI',
    });
    expect(result.status).toBe(401);
    expect(readTeamMaterial()).toBe(false);
  });
});
