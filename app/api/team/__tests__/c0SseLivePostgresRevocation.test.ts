/**
 * C0-SSE-LIVE Class A / real PostgreSQL post-handshake revocation witness.
 *
 * Uses ONLY a fresh private Unix-socket Postgres 17 cluster named
 * c0_fictional. Synthetic Team tables are test-local and dropped afterward.
 * It runs the actual channel and DM stream handlers + actual message SQL.
 * Never touches production, staging, real members, migrations, or SMTP.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { Pool } from 'pg';

const A = '11111111-1111-4111-8111-111111111111';
const CH = '33333333-3333-4333-8333-333333333333';
const DM = '44444444-4444-4444-8444-444444444444';
const TOKEN = 'FICTIONAL_VALID_SAFARI';
const MESSAGE = 'FICTIONAL_INSERTED_AFTER_HANDSHAKE';

let pool: Pool;
const enabled = process.env.C0_PG_WITNESS === '1' ? describe : describe.skip;
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{
  rows: Record<string, unknown>[]; rowCount: number | null;
}>>();

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));
jest.mock('@/lib/team/notifications', () => ({
  __esModule: true, notifyChannelMentions: jest.fn(),
  notifyThreadReply: jest.fn(), notifyDMRecipient: jest.fn(),
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

const fixtureDDL = [
  'CREATE TABLE IF NOT EXISTS team_channels (id UUID PRIMARY KEY, is_private BOOLEAN NOT NULL);',
  'CREATE TABLE IF NOT EXISTS team_channel_members (channel_id UUID NOT NULL, member_id UUID NOT NULL, PRIMARY KEY(channel_id,member_id));',
  'CREATE TABLE IF NOT EXISTS team_messages (id UUID PRIMARY KEY, channel_id UUID NOT NULL, sender_id UUID NOT NULL, body TEXT NOT NULL, parent_id UUID, edited_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL, message_kind TEXT NOT NULL DEFAULT \'build\');',
  'CREATE TABLE IF NOT EXISTS team_dm_members (dm_thread_id UUID NOT NULL, member_id UUID NOT NULL, PRIMARY KEY(dm_thread_id,member_id));',
  'CREATE TABLE IF NOT EXISTS team_dm_messages (id UUID PRIMARY KEY, dm_thread_id UUID NOT NULL, sender_id UUID NOT NULL, body TEXT NOT NULL, message_type TEXT NOT NULL DEFAULT \'build\', edited_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL);',
].join(' ');

type StreamType = 'channel' | 'dm';
function request(kind: StreamType) {
  const controller = new AbortController();
  const path = kind === 'channel'
    ? '/api/team/channels/' + CH + '/stream'
    : '/api/team/dm/' + DM + '/stream';
  const req = new NextRequest('https://fictional.invalid' + path, {
    method: 'GET', headers: { 'x-session-token': TOKEN },
    signal: controller.signal,
  });
  return { req, controller };
}

async function open(kind: StreamType) {
  const { req, controller } = request(kind);
  const response = kind === 'channel'
    ? await channelGET(req, { params: Promise.resolve({ channelId: CH }) })
    : await dmGET(req, { params: Promise.resolve({ dmId: DM }) });
  expect(response.status).toBe(200);
  const reader = response.body!.getReader();
  const retry = await reader.read();
  const ready = await reader.read();
  expect(new TextDecoder().decode(retry.value)).toContain('retry:');
  expect(new TextDecoder().decode(ready.value)).toContain('event: ready');
  return { controller, reader };
}

async function readNext(reader: ReadableStreamDefaultReader<Uint8Array>, ms=2400) {
  let alarm: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      reader.read(),
      new Promise<never>((_, reject) => {
        alarm = setTimeout(() => reject(new Error('Fictional SSE poll did not settle')), ms);
      }),
    ]);
  } finally {
    if (alarm) clearTimeout(alarm);
  }
}

async function expectClosedWithoutMessage(reader: ReadableStreamDefaultReader<Uint8Array>) {
  let text = '';
  for (let step = 0; step < 5; step++) {
    const received = await readNext(reader);
    if (received.done) {
      expect(text).not.toContain(MESSAGE);
      return;
    }
    text += new TextDecoder().decode(received.value);
    expect(text).not.toContain(MESSAGE);
  }
  throw new Error('C0 stream did not close after server-side authority was withdrawn');
}

async function readMessage(reader: ReadableStreamDefaultReader<Uint8Array>) {
  let text = '';
  for (let step = 0; step < 5; step++) {
    const received = await readNext(reader);
    if (received.done) throw new Error('Valid fictional stream closed');
    text += new TextDecoder().decode(received.value);
    if (text.includes('event: messages')) return text;
  }
  throw new Error('No messages event');
}

async function cleanup(controller: AbortController, reader: ReadableStreamDefaultReader<Uint8Array>) {
  controller.abort();
  try { await reader.cancel(); } catch { /* already closed */ }
}

async function insertMessage(kind: StreamType) {
  if (kind === 'channel') {
    await pool.query(
      'INSERT INTO team_messages(id,channel_id,sender_id,body,created_at) VALUES($1,$2,$3,$4,NOW())',
      ['55555555-5555-4555-8555-555555555555', CH, A, MESSAGE],
    );
  } else {
    await pool.query(
      'INSERT INTO team_dm_messages(id,dm_thread_id,sender_id,body,created_at) VALUES($1,$2,$3,$4,NOW())',
      ['66666666-6666-4666-8666-666666666666', DM, A, MESSAGE],
    );
  }
}
function callTypes(start: number) {
  return mockQuery.mock.calls.slice(start).map(([sql]) => {
    const query = String(sql);
    if (/FROM auth_sessions/i.test(query)) return 'auth';
    if (/FROM team_channels tc/i.test(query)) return 'channel_membership';
    if (/FROM team_dm_members/i.test(query)) return 'dm_membership';
    if (/FROM team_messages tm/i.test(query)) return 'channel_messages';
    if (/FROM team_dm_messages dm/i.test(query)) return 'dm_messages';
    return 'other';
  });
}

enabled('C0-SSE-LIVE authentic PG17 SSE authorization liveness', () => {
  beforeAll(async () => {
    const socket = process.env.C0_PG_SOCKET;
    if (!socket ||
      !/^\/(?:private\/)?tmp\/soullab-c0pg-20261018\.[A-Za-z0-9]+\/socket$/.test(socket) ||
      process.env.C0_PG_DATABASE !== 'c0_fictional' ||
      process.env.CI !== 'true' ||
      process.env.DATABASE_URL || process.env.SMTP_HOST || process.env.EMAIL_PROVIDER ||
      process.env.CAPACITOR_BUILD) {
      throw new Error('C0-SSE-LIVE Postgres refused: synthetic database only');
    }
    pool = new Pool({
      host: socket, port: 55473, user: 'soullab', database: 'c0_fictional',
      max: 3, connectionTimeoutMillis: 2000,
    });
    const proof = await pool.query(
      'SELECT current_database() AS db, inet_server_addr() IS NULL AS local, current_setting($1)::integer AS version',
      ['server_version_num'],
    );
    if (proof.rows[0]?.db !== 'c0_fictional' || proof.rows[0]?.local !== true ||
      proof.rows[0]?.version < 170000) {
      throw new Error('C0-SSE-LIVE wrong database, transport, or version');
    }
    await pool.query(fixtureDDL);
    mockQuery.mockImplementation(async (sql, args) =>
      (await pool.query(sql, args as unknown[] | undefined)));
  }, 15000);

  afterAll(async () => {
    if (pool) {
      await pool.query('DROP TABLE IF EXISTS team_dm_messages, team_dm_members, team_messages, team_channel_members, team_channels;');
      await pool.end();
    }
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE team_dm_messages, team_dm_members, team_messages, team_channel_members, team_channels');
    await pool.query('UPDATE auth_sessions SET revoked=FALSE, expires_at=NOW()+interval \'2 hours\' WHERE session_token=$1', [TOKEN]);
    await pool.query('INSERT INTO team_channels(id,is_private) VALUES($1,TRUE)', [CH]);
    await pool.query('INSERT INTO team_channel_members(channel_id,member_id) VALUES($1,$2)', [CH,A]);
    await pool.query('INSERT INTO team_dm_members(dm_thread_id,member_id) VALUES($1,$2)', [DM,A]);
    mockQuery.mockClear();
  });

  it.each(['channel','dm'] as const)('%s closes after POST-handshake revocation before any inserted message is emitted', async kind => {
    const { controller, reader } = await open(kind);
    try {
      const since = mockQuery.mock.calls.length;
      await pool.query('UPDATE auth_sessions SET revoked=TRUE WHERE session_token=$1', [TOKEN]);
      await insertMessage(kind);
      await expectClosedWithoutMessage(reader);
      const polled = callTypes(since);
      expect(polled).toContain('auth');
      // The query may read candidate messages, but cannot release them
      // after the fresh server-side session check fails.
    } finally { await cleanup(controller, reader); }
  }, 8000);

  it('channel closes when private membership is withdrawn after open', async () => {
    const { controller, reader } = await open('channel');
    try {
      const since = mockQuery.mock.calls.length;
      await pool.query('DELETE FROM team_channel_members WHERE channel_id=$1 AND member_id=$2', [CH,A]);
      await insertMessage('channel');
      await expectClosedWithoutMessage(reader);
      expect(callTypes(since)).toContain('channel_membership');
    } finally { await cleanup(controller, reader); }
  }, 8000);

  it('DM closes when thread membership is withdrawn after open', async () => {
    const { controller, reader } = await open('dm');
    try {
      const since = mockQuery.mock.calls.length;
      await pool.query('DELETE FROM team_dm_members WHERE dm_thread_id=$1 AND member_id=$2', [DM,A]);
      await insertMessage('dm');
      await expectClosedWithoutMessage(reader);
      expect(callTypes(since)).toContain('dm_membership');
    } finally { await cleanup(controller, reader); }
  }, 8000);

  it.each(['channel','dm'] as const)('%s closes after session expires while stream remains open', async kind => {
    const { controller, reader } = await open(kind);
    try {
      await pool.query('UPDATE auth_sessions SET expires_at=NOW()-interval \'1 minute\' WHERE session_token=$1', [TOKEN]);
      await insertMessage(kind);
      await expectClosedWithoutMessage(reader);
    } finally { await cleanup(controller, reader); }
  }, 8000);

  it.each(['channel','dm'] as const)('%s continues to deliver when both session and membership remain live', async kind => {
    const { controller, reader } = await open(kind);
    try {
      await insertMessage(kind);
      const event = await readMessage(reader);
      expect(event).toContain(MESSAGE);
    } finally { await cleanup(controller, reader); }
  }, 8000);

  it('measures extra database queries for one authorized active channel poll', async () => {
    const { controller, reader } = await open('channel');
    try {
      const since = mockQuery.mock.calls.length;
      await insertMessage('channel');
      expect(await readMessage(reader)).toContain(MESSAGE);
      const operations = callTypes(since);
      expect(operations).toEqual(['channel_messages', 'auth', 'channel_membership']);
    } finally { await cleanup(controller, reader); }
  }, 8000);

  it('measures extra database queries for one authorized active DM poll', async () => {
    const { controller, reader } = await open('dm');
    try {
      const since = mockQuery.mock.calls.length;
      await insertMessage('dm');
      expect(await readMessage(reader)).toContain(MESSAGE);
      const operations = callTypes(since);
      expect(operations).toEqual(['dm_membership', 'dm_messages', 'auth', 'dm_membership']);
    } finally { await cleanup(controller, reader); }
  }, 8000);
});
