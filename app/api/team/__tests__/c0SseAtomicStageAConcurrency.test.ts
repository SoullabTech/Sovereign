/**
 * C0-SSE-ATOMIC Stage A, direct Team handlers with real PostgreSQL 17 row
 * locks and TWO independent sessions. Test only with a disposable Unix-socket
 * cluster and fictional members/messages. No production DB, migrations or mail.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { Client, Pool } from 'pg';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const CH = '33333333-3333-4333-8333-333333333333';
const DM = '44444444-4444-4444-8444-444444444444';
const ACTIVE = 'FICTIONAL_VALID_SAFARI';
const OTHER = 'FICTIONAL_OTHER_MEMBER';
const MESSAGE = 'FICTIONAL_DISPATCH_DURING_REVOKE';

type RaceKind = 'session' | 'channel-membership' | 'dm-membership';
let mockPool: Pool;
let mockWriter: Client;
let mockArmed: RaceKind | null = null;
let mockConcurrentStarted = false;
let mockConcurrentFinished = false;
let mockBlockedWhileLocked = false;
let mockCommittedBeforeCallbackReturned = false;
let mockConcurrentPromise: Promise<unknown> | null = null;
const mockSql: string[] = [];
const enabled = process.env.C0_PG_WITNESS === '1' ? describe : describe.skip;

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) =>
    mockPool.query(sql, params as unknown[] | undefined),
  // Implements the existing transaction(callback) contract, preserving a
  // single real PostgreSQL connection and BEGIN/COMMIT until callback returns.
  transaction: async <T>(callback: (tx: {
    query: (sql: string, params?: unknown[]) => Promise<unknown>;
  }) => Promise<T>): Promise<T> => {
    const client = await mockPool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback({
        query: async (sql: string, params?: unknown[]) => {
          mockSql.push(sql);
          const output = await client.query(sql, params as unknown[] | undefined);
          if (mockArmed && !mockConcurrentStarted &&
              /FROM (team_messages tm|team_dm_messages dm)/i.test(sql)) {
            mockConcurrentStarted = true;
            let statement: string;
            let args: unknown[];
            if (mockArmed === 'session') {
              statement = 'UPDATE auth_sessions SET revoked=TRUE WHERE session_token=$1';
              args = [ACTIVE];
            } else if (mockArmed === 'channel-membership') {
              statement = 'DELETE FROM team_channel_members WHERE channel_id=$1 AND member_id=$2';
              args = [CH, A];
            } else {
              statement = 'DELETE FROM team_dm_members WHERE dm_thread_id=$1 AND member_id=$2';
              args = [DM, A];
            }
            mockConcurrentPromise = mockWriter.query(statement, args).then(() => {
              mockConcurrentFinished = true;
            });
            // Offer the competing PostgreSQL session a deterministic
            // opportunity to try committing while locks are still held.
            await new Promise(resolve => setTimeout(resolve, 90));
            mockBlockedWhileLocked = !mockConcurrentFinished;
          }
          return output;
        },
      });
      if (mockConcurrentStarted) {
        // A successful result is returned only after synchronous
        // controller.enqueue() inside the handler's transaction callback.
        mockCommittedBeforeCallbackReturned = mockConcurrentFinished;
      }
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
}));

jest.mock('@/lib/team/notifications', () => ({
  __esModule: true, notifyDMRecipient: jest.fn(),
  notifyChannelMentions: jest.fn(), notifyThreadReply: jest.fn(),
}));
jest.mock('@/lib/team/attention', () => ({
  __esModule: true, createAttentionItemsForMessage: jest.fn(),
}));
jest.mock('@/lib/team/getActiveParticipants', () => ({
  __esModule: true, getActiveParticipants: jest.fn(),
}));
jest.mock('@/lib/auth/teamPermissions', () => ({
  __esModule: true, getTeamRole: jest.fn(),
}));

import { GET as channelGET } from '../channels/[channelId]/stream/route';
import { GET as dmGET } from '../dm/[dmId]/stream/route';

function makeRequest(kind: 'channel' | 'dm', opts: {
  cookie?: string; header?: string; query?: string;
} = {}) {
  const id = kind === 'channel' ? CH : DM;
  const path = kind === 'channel'
    ? '/api/team/channels/' + id + '/stream'
    : '/api/team/dm/' + id + '/stream';
  const headers = new Headers();
  if (opts.cookie) headers.set('cookie', 'maia_session=' + opts.cookie);
  if (opts.header) headers.set('x-session-token', opts.header);
  const controller = new AbortController();
  return {
    request: new NextRequest('https://fictional.invalid' + path +
      (opts.query ? '?_t=' + opts.query : ''), {
      method: 'GET', headers, signal: controller.signal,
    }),
    controller,
    id,
  };
}
async function open(kind: 'channel' | 'dm', opts: {
  cookie?: string; header?: string; query?: string;
} = { header: ACTIVE }) {
  const { request, controller, id } = makeRequest(kind, opts);
  const response = kind === 'channel'
    ? await channelGET(request, { params: Promise.resolve({ channelId: id }) })
    : await dmGET(request, { params: Promise.resolve({ dmId: id }) });
  if (response.status !== 200) {
    controller.abort();
    return { status: response.status, controller, reader: null };
  }
  const reader = response.body!.getReader();
  expect(new TextDecoder().decode((await reader.read()).value)).toContain('retry:');
  expect(new TextDecoder().decode((await reader.read()).value)).toContain('event: ready');
  return { status: response.status, controller, reader };
}
async function readUntil(reader: ReadableStreamDefaultReader<Uint8Array>, signal: string) {
  let out = '';
  const deadline = Date.now() + 3500;
  while (Date.now() < deadline) {
    let alarm: ReturnType<typeof setTimeout> | undefined;
    try {
      const event = await Promise.race([
        reader.read(),
        new Promise<never>((_, reject) => {
          alarm = setTimeout(() => reject(new Error('Timed out waiting for SSE poll')), deadline - Date.now());
        }),
      ]);
      if (event.done) return out;
      out += new TextDecoder().decode(event.value);
      if (out.includes(signal)) return out;
    } finally {
      if (alarm) clearTimeout(alarm);
    }
  }
  throw new Error('Expected SSE event was not observed');
}
async function dispose(
  controller: AbortController,
  reader: ReadableStreamDefaultReader<Uint8Array> | null,
) {
  controller.abort();
  if (reader) try { await reader.cancel(); } catch { /* closed */ }
}
async function insert(kind: 'channel' | 'dm') {
  if (kind === 'channel') {
    await mockPool.query(
      'INSERT INTO team_messages(id,channel_id,sender_id,body,created_at) VALUES($1,$2,$3,$4,NOW())',
      ['55555555-5555-4555-8555-555555555555', CH, A, MESSAGE],
    );
  } else {
    await mockPool.query(
      'INSERT INTO team_dm_messages(id,dm_thread_id,sender_id,body,created_at) VALUES($1,$2,$3,$4,NOW())',
      ['66666666-6666-4666-8666-666666666666', DM, A, MESSAGE],
    );
  }
}
const setupSql = [
  'CREATE TABLE IF NOT EXISTS team_channels(id UUID PRIMARY KEY,is_private BOOLEAN NOT NULL);',
  'CREATE TABLE IF NOT EXISTS team_channel_members(channel_id UUID NOT NULL,member_id UUID NOT NULL,PRIMARY KEY(channel_id,member_id));',
  'CREATE TABLE IF NOT EXISTS team_messages(id UUID PRIMARY KEY,channel_id UUID NOT NULL,sender_id UUID NOT NULL,body TEXT NOT NULL,parent_id UUID,edited_at TIMESTAMPTZ,deleted_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL,message_kind TEXT NOT NULL DEFAULT \'build\');',
  'CREATE TABLE IF NOT EXISTS team_dm_members(dm_thread_id UUID NOT NULL,member_id UUID NOT NULL,PRIMARY KEY(dm_thread_id,member_id));',
  'CREATE TABLE IF NOT EXISTS team_dm_messages(id UUID PRIMARY KEY,dm_thread_id UUID NOT NULL,sender_id UUID NOT NULL,body TEXT NOT NULL,message_type TEXT NOT NULL DEFAULT \'build\',edited_at TIMESTAMPTZ,deleted_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL);',
].join(' ');

enabled('C0-SSE-ATOMIC Stage A / two concurrent fictional PostgreSQL connections', () => {
  beforeAll(async () => {
    const socket = process.env.C0_PG_SOCKET;
    if (!socket ||
        !/^\/(?:private\/)?tmp\/soullab-c0pg-20261018\.[A-Za-z0-9]+\/socket$/.test(socket) ||
        process.env.C0_PG_DATABASE !== 'c0_fictional' ||
        process.env.CI !== 'true' ||
        process.env.DATABASE_URL || process.env.SMTP_HOST || process.env.EMAIL_PROVIDER ||
        process.env.CAPACITOR_BUILD) {
      throw new Error('C0-SSE-ATOMIC refused unsafe database or SMTP settings');
    }
    const cfg = {
      host: socket, port: 55473, user: 'soullab', database: 'c0_fictional',
      connectionTimeoutMillis: 2000,
    };
    mockPool = new Pool({ ...cfg, max: 5 });
    mockWriter = new Client(cfg);
    await mockWriter.connect();
    const proof = await mockPool.query(
      'SELECT current_database() AS db, inet_server_addr() IS NULL AS local, current_setting($1)::integer AS version',
      ['server_version_num'],
    );
    if (proof.rows[0]?.db !== 'c0_fictional' ||
        proof.rows[0]?.local !== true || proof.rows[0]?.version < 170000) {
      throw new Error('C0-SSE-ATOMIC refused non-scratch PostgreSQL');
    }
    await mockPool.query(setupSql);
  }, 15000);

  afterAll(async () => {
    if (mockWriter) await mockWriter.end();
    if (mockPool) {
      await mockPool.query('DROP TABLE IF EXISTS team_dm_messages, team_dm_members, team_messages, team_channel_members, team_channels;');
      await mockPool.end();
    }
  });

  beforeEach(async () => {
    mockArmed = null;
    mockConcurrentStarted = false;
    mockConcurrentFinished = false;
    mockBlockedWhileLocked = false;
    mockCommittedBeforeCallbackReturned = false;
    mockConcurrentPromise = null;
    mockSql.length = 0;
    await mockPool.query('TRUNCATE team_dm_messages,team_dm_members,team_messages,team_channel_members,team_channels');
    await mockPool.query('UPDATE auth_sessions SET revoked=FALSE,expires_at=NOW()+interval \'2 hours\' WHERE session_token=$1', [ACTIVE]);
    await mockPool.query('INSERT INTO team_channels(id,is_private) VALUES($1,TRUE)', [CH]);
    await mockPool.query('INSERT INTO team_channel_members(channel_id,member_id) VALUES($1,$2)', [CH,A]);
    await mockPool.query('INSERT INTO team_dm_members(dm_thread_id,member_id) VALUES($1,$2)', [DM,A]);
    mockSql.length = 0;
  });

  it.each(['channel','dm'] as const)('%s refuses a revoked session before authorization', async kind => {
    await mockPool.query('UPDATE auth_sessions SET revoked=TRUE WHERE session_token=$1', [ACTIVE]);
    const opened = await open(kind);
    expect(opened.status).toBe(401);
    expect(mockSql).toHaveLength(0);
  });

  it('validates a nonrevoked member but refuses a concurrently conflicting foreign Safari credential', async () => {
    const opened = await open('channel', { cookie: ACTIVE, header: OTHER });
    expect(opened.status).toBe(401);
  });

  it('does not issue duplicate token SQL for the identical cookie and header', async () => {
    const opened = await open('channel', { cookie: ACTIVE, header: ACTIVE });
    try {
      expect(opened.status).toBe(200);
      await insert('channel');
      expect(await readUntil(opened.reader!, 'event: messages')).toContain(MESSAGE);
      const sessionQueries = mockSql.filter(sql => /FROM auth_sessions/i.test(sql));
      expect(sessionQueries).toHaveLength(1);
    } finally { await dispose(opened.controller, opened.reader); }
  }, 8000);

  it.each([
    ['channel','session'],
    ['channel','channel-membership'],
    ['dm','session'],
    ['dm','dm-membership'],
  ] as const)('%s blocks concurrent %s withdrawal until its SSE enqueue completes', async (kind,race) => {
    const opened = await open(kind);
    expect(opened.status).toBe(200);
    try {
      await insert(kind);
      mockArmed = race;
      const event = await readUntil(opened.reader!, 'event: messages');
      expect(event).toContain(MESSAGE);
      expect(mockConcurrentStarted).toBe(true);
      expect(mockBlockedWhileLocked).toBe(true);
      expect(mockCommittedBeforeCallbackReturned).toBe(false);
      if (mockConcurrentPromise) await mockConcurrentPromise;
      expect(mockConcurrentFinished).toBe(true);
      // Writer commits after the synchronous enqueue point, not before.
      if (race === 'session') {
        const revoked = await mockPool.query('SELECT revoked FROM auth_sessions WHERE session_token=$1', [ACTIVE]);
        expect(revoked.rows[0].revoked).toBe(true);
      }
    } finally { await dispose(opened.controller, opened.reader); }
  }, 9500);

  it('locks valid cookie and Safari header sessions in the same deterministic order', async () => {
    const opened = await open('channel', { cookie: ACTIVE, header: 'FICTIONAL_VALID_COOKIE' });
    try {
      expect(opened.status).toBe(200);
      await insert('channel');
      expect(await readUntil(opened.reader!, 'event: messages')).toContain(MESSAGE);
      const authQueries = mockSql.filter(sql => /FROM auth_sessions/i.test(sql));
      expect(authQueries).toHaveLength(2);
      const lastTwo = authQueries.map(sql => sql.includes('FOR SHARE'));
      expect(lastTwo).toEqual([true, true]);
    } finally { await dispose(opened.controller, opened.reader); }
  }, 8000);

  it('reports bounded per-poll query counts for channel and DM', async () => {
    const counted: number[] = [];
    for (const kind of ['channel','dm'] as const) {
      const opened = await open(kind);
      try {
        expect(opened.status).toBe(200);
        mockSql.length = 0;
        await insert(kind);
        expect(await readUntil(opened.reader!, 'event: messages')).toContain(MESSAGE);
        counted.push(mockSql.length);
      } finally { await dispose(opened.controller, opened.reader); }
      await mockPool.query('DELETE FROM team_messages');
      await mockPool.query('DELETE FROM team_dm_messages');
    }
    expect(counted).toEqual([4,4]);
  }, 9500);
});
