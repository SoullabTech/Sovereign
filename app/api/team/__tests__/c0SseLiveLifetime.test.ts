/**
 * C0-SSE-LIVE / fictional read-time authority acceptance.
 * Test the ACTUAL Team SSE handlers and server-derived session resolver.
 * No network, production database, real member, credential, or email access.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const CHANNEL = '33333333-3333-4333-8333-333333333333';
const DM = '44444444-4444-4444-8444-444444444444';
const TOKEN = 'FICTIONAL_ACTIVE_SSE';
const MESSAGE = 'FICTIONAL_POST_OPEN_MESSAGE';

type State = {
  active: boolean;
  principal: string;
  channelMember: boolean;
  dmMember: boolean;
  available: boolean;
  throwOnAuth: boolean;
  dbCalls: string[];
};
let state: State;
const mockQuery = jest.fn<(sql: string, args?: unknown[]) => Promise<{ rows: unknown[] }>>();
const mockChannelMessages = jest.fn<() => Promise<Array<{ id: string; createdAt: string; body: string }>>>(
  async () => [],
);

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, args?: unknown[]) => mockQuery(sql, args),
}));
jest.mock('@/lib/team/ChannelService', () => ({
  __esModule: true,
  getMessagesSince: () => mockChannelMessages(),
}));
jest.mock('@/lib/team/notifications', () => ({
  __esModule: true,
  notifyDMRecipient: jest.fn(),
}));
jest.mock('@/lib/auth/teamPermissions', () => ({
  __esModule: true,
  getTeamRole: jest.fn(),
}));

import { GET as getChannel } from '../channels/[channelId]/stream/route';
import { GET as getDM } from '../dm/[dmId]/stream/route';

beforeEach(() => {
  state = {
    active: true,
    principal: A,
    channelMember: true,
    dmMember: true,
    available: false,
    throwOnAuth: false,
    dbCalls: [],
  };
  mockQuery.mockReset();
  mockChannelMessages.mockReset();
  mockChannelMessages.mockImplementation(async () => {
    state.dbCalls.push('channel_messages');
    return state.available
      ? [{ id: '55555555-5555-4555-8555-555555555555',
           createdAt: new Date().toISOString(), body: MESSAGE }]
      : [];
  });
  mockQuery.mockImplementation(async (sql, params) => {
    const statement = String(sql);
    if (/FROM auth_sessions/i.test(statement)) {
      state.dbCalls.push('session');
      expect(statement).toMatch(/revoked\s*=\s*FALSE/i);
      expect(statement).toMatch(/expires_at\s*>\s*NOW\(\)/i);
      if (state.throwOnAuth) throw new Error('FICTIONAL_CONNECTION_FAILURE_WITH_PRIVATE_DETAILS');
      return { rows: state.active && params?.[0] === TOKEN
        ? [{ member_id: state.principal, tier: 'free', roles: ['member'] }] : [] };
    }
    if (/FROM team_channels tc/i.test(statement)) {
      state.dbCalls.push('channel_membership');
      return { rows: [{ is_private: true, is_member: state.channelMember }] };
    }
    if (/FROM team_dm_members/i.test(statement)) {
      state.dbCalls.push('dm_membership');
      return { rows: state.dmMember ? [{ present: 1 }] : [] };
    }
    if (/FROM team_dm_messages/i.test(statement)) {
      state.dbCalls.push('dm_messages');
      return { rows: state.available
        ? [{ id: '66666666-6666-4666-8666-666666666666',
             dm_thread_id: DM, sender_id: A, sender_name: 'Fictional Sender',
             body: MESSAGE, message_type: 'build', edited_at: null,
             deleted_at: null, created_at: new Date().toISOString() }]
        : [] };
    }
    throw new Error('Unexpected fictional SQL in C0-SSE-LIVE');
  });
});

type StreamKind = 'channel' | 'dm';
async function open(kind: StreamKind) {
  const controller = new AbortController();
  const target = kind === 'channel'
    ? '/api/team/channels/' + CHANNEL + '/stream'
    : '/api/team/dm/' + DM + '/stream';
  const request = new NextRequest('https://fictional.invalid' + target + '?_t=' + TOKEN, {
    method: 'GET', signal: controller.signal,
  });
  const response = kind === 'channel'
    ? await getChannel(request, { params: Promise.resolve({ channelId: CHANNEL }) })
    : await getDM(request, { params: Promise.resolve({ dmId: DM }) });
  expect(response.status).toBe(200);
  const reader = response.body!.getReader();
  const opening = await reader.read();
  expect(new TextDecoder().decode(opening.value)).toContain('retry:');
  const ready = await reader.read();
  expect(new TextDecoder().decode(ready.value)).toContain('event: ready');
  return { controller, reader };
}

async function waitForClose(reader: ReadableStreamDefaultReader<Uint8Array>, timeout = 2600) {
  let accumulated = '';
  const began = Date.now();
  while (Date.now() - began < timeout) {
    const received = await Promise.race([
      reader.read(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('SSE did not close after withdrawal')), timeout)),
    ]);
    if (received.done) return accumulated;
    accumulated += new TextDecoder().decode(received.value);
  }
  throw new Error('SSE connection did not close after withdrawal');
}

async function nextMessages(reader: ReadableStreamDefaultReader<Uint8Array>, timeout = 2100) {
  let accumulated = '';
  const begun = Date.now();
  while (Date.now() - begun < timeout) {
    const received = await Promise.race([
      reader.read(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Expected fictional messages event')), timeout)),
    ]);
    if (received.done) throw new Error('SSE closed unexpectedly');
    accumulated += new TextDecoder().decode(received.value);
    if (accumulated.includes('event: messages')) return accumulated;
  }
  throw new Error('Expected fictional message event');
}

async function dispose(controller: AbortController, reader: ReadableStreamDefaultReader<Uint8Array>) {
  controller.abort();
  try { await reader.cancel(); } catch { /* already closed */ }
}

describe('C0-SSE-LIVE post-handshake authority', () => {
  it.each(['channel', 'dm'] as const)('%s closes after session revocation without sending new content', async kind => {
    const { controller, reader } = await open(kind);
    const prior = state.dbCalls.length;
    try {
      state.active = false;
      state.available = true;
      const content = await waitForClose(reader);
      expect(content).not.toContain(MESSAGE);
      const polls = state.dbCalls.slice(prior);
      expect(polls).toContain('session');
      // Reading may precede revalidation; sending must not.
      expect(polls).toContain(kind === 'channel' ? 'channel_messages' : 'dm_membership');
    } finally { await dispose(controller, reader); }
  }, 7000);

  it('channel closes after private membership withdrawal with an otherwise valid session', async () => {
    const { controller, reader } = await open('channel');
    const prior = state.dbCalls.length;
    try {
      state.channelMember = false;
      state.available = true;
      const content = await waitForClose(reader);
      expect(content).not.toContain(MESSAGE);
      expect(state.dbCalls.slice(prior)).toContain('channel_membership');
    } finally { await dispose(controller, reader); }
  }, 7000);

  it('DM closes after membership withdrawal even if no new messages arrive', async () => {
    const { controller, reader } = await open('dm');
    const prior = state.dbCalls.length;
    try {
      state.dmMember = false;
      const content = await waitForClose(reader);
      expect(content).not.toContain('event: messages');
      expect(state.dbCalls.slice(prior)).toContain('dm_membership');
    } finally { await dispose(controller, reader); }
  }, 7000);

  it.each(['channel', 'dm'] as const)('%s closes if verified member changes after handshake', async kind => {
    const { controller, reader } = await open(kind);
    try {
      state.principal = B;
      state.available = true;
      const content = await waitForClose(reader);
      expect(content).not.toContain(MESSAGE);
    } finally { await dispose(controller, reader); }
  }, 7000);

  it.each(['channel', 'dm'] as const)('%s closes if the database cannot validate live authority', async kind => {
    const { controller, reader } = await open(kind);
    try {
      state.throwOnAuth = true;
      state.available = true;
      const content = await waitForClose(reader);
      expect(content).not.toContain(MESSAGE);
      expect(content).not.toContain('PRIVATE_DETAILS');
    } finally { await dispose(controller, reader); }
  }, 7000);

  it.each(['channel', 'dm'] as const)('%s still delivers to a currently authorized member', async kind => {
    const { controller, reader } = await open(kind);
    const begin = state.dbCalls.length;
    try {
      state.available = true;
      const event = await nextMessages(reader);
      expect(event).toContain(MESSAGE);
      const polls = state.dbCalls.slice(begin);
      expect(polls).toContain('session');
      expect(polls).toContain(kind === 'channel' ? 'channel_membership' : 'dm_membership');
    } finally { await dispose(controller, reader); }
  }, 7000);

  it.each(['channel', 'dm'] as const)('%s checks active sessions again even if no messages arrive', async kind => {
    const { controller, reader } = await open(kind);
    const begin = state.dbCalls.length;
    try {
      state.active = false;
      const content = await waitForClose(reader);
      expect(content).not.toContain('event: messages');
      expect(state.dbCalls.slice(begin)).toContain('session');
    } finally { await dispose(controller, reader); }
  }, 7000);
});
