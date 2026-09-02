/**
 * P6 · P1(autosave_write) — the member act spans two HTTP requests.
 *
 * This is the defect the instrument was defined around: the autosave that
 * SUCCEEDED and the reflection that FAILED were, to an operator, unrelated
 * events, because no identifier spanned them. Both routes are driven here with
 * the same client-minted attempt id, and the records are joined the way an
 * operator would join them.
 */
import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';
import { ATTEMPT_ID_HEADER, ATTEMPT_MARKER } from '@/lib/ideas/attemptInstrument';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const IDEA = '22222222-2222-4222-8222-222222222222';
const ATTEMPT = '44444444-4444-4444-8444-444444444444';
const CREATED_AT = '2026-09-02T00:00:00.000Z';
const NOTE_TEXT = 'NOTETEXT-what-I-just-wrote-in-the-composer';

const mockGetCurrentSession = jest.fn<() => Promise<{ memberId: string } | null>>();
jest.mock('@/lib/auth/serverSessions', () => ({
  getCurrentSession: () => mockGetCurrentSession(),
}));

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (s: string, p?: unknown[]) => mockQuery(s, p) },
  query: (s: string, p?: unknown[]) => mockQuery(s, p),
}));

const mockCreate = jest.fn<() => Promise<unknown>>();
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: class { messages = { create: () => mockCreate() }; },
}));

jest.mock('@/lib/maia/decisionChangeRecognition', () => ({
  runRecognition: () => null,
  getRecentRecognitionEvents: async () => [],
  storeRecognitionEvent: () => undefined,
  isMaiaRecognitionOrigin: () => false,
}));

import { POST as BLOCKS_POST } from '../route';
import { POST as ASK_POST } from '../../ask-maia/route';

interface Rec {
  attempt_id: string; attempt_id_source: string; request_id: string | null;
  member_id: string | null; idea_id: string | null;
  stage: string; event: string; error_class: string | null;
}

let captured: string[] = [];
const realLog = console.log;
const realError = console.error;
const records = (): Rec[] => captured
  .filter((l) => l.startsWith(ATTEMPT_MARKER))
  .map((l) => JSON.parse(l.slice(ATTEMPT_MARKER.length + 1)) as Rec);

const blocksReq = (headers: Record<string, string>) =>
  new NextRequest(`https://soullab.life/api/ideas/${IDEA}/blocks`, {
    method: 'POST', headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ block_type: 'note', content: NOTE_TEXT, metadata: {} }),
  });
const askReq = (headers: Record<string, string>) =>
  new NextRequest(`https://soullab.life/api/ideas/${IDEA}/ask-maia`, {
    method: 'POST', headers, body: JSON.stringify({}),
  });
const params = { params: Promise.resolve({ id: IDEA }) };

function baseQuery(sql: string): Promise<{ rows: unknown[] }> {
  if (sql.includes('FROM member_ideas')) {
    return Promise.resolve({ rows: [{ id: IDEA, title: 'T', framing: null }] });
  }
  if (sql.includes('INSERT INTO member_idea_blocks')) {
    return Promise.resolve({ rows: [{
      id: '33333333-3333-4333-8333-333333333333', block_type: 'note',
      content: NOTE_TEXT, metadata: {}, created_at: CREATED_AT,
    }] });
  }
  if (sql.includes('COUNT(*)')) return Promise.resolve({ rows: [{ count: '0' }] });
  return Promise.resolve({ rows: [] });
}

beforeEach(() => {
  jest.clearAllMocks();
  captured = [];
  console.log = (...a: unknown[]) => { captured.push(a.map(String).join(' ')); };
  console.error = () => undefined;
  process.env.GIT_COMMIT = 'deadbee';
  mockGetCurrentSession.mockResolvedValue({ memberId: MEMBER });
  mockQuery.mockImplementation((sql) => baseQuery(sql));
  mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'a reflection' }] });
});
afterAll(() => { console.log = realLog; console.error = realError; });

describe('P1 — autosave_write is bracketed', () => {
  it('emits one entered and one completed on a successful autosave', async () => {
    await BLOCKS_POST(blocksReq({ [ATTEMPT_ID_HEADER]: ATTEMPT }), params);
    const rs = records().filter((r) => r.stage === 'autosave_write');
    expect(rs.map((r) => r.event)).toEqual(['entered', 'completed']);
  });

  it('classifies a failing insert as autosave_write / db_write', async () => {
    mockQuery.mockImplementation((sql) => sql.includes('INSERT INTO member_idea_blocks')
      ? Promise.reject(new Error('insert failed')) : baseQuery(sql));
    await BLOCKS_POST(blocksReq({ [ATTEMPT_ID_HEADER]: ATTEMPT }), params);
    const f = records().find((r) => r.stage === 'autosave_write' && r.event === 'failed');
    expect(f?.error_class).toBe('db_write');
  });

  it('writes no record containing the member\'s note', async () => {
    await BLOCKS_POST(blocksReq({ [ATTEMPT_ID_HEADER]: ATTEMPT }), params);
    expect(captured.filter((l) => l.startsWith(ATTEMPT_MARKER)).join('\n'))
      .not.toContain(NOTE_TEXT);
  });
});

describe('P6 — one attempt_id joins the autosave and the reflection', () => {
  it('correlates the succeeded autosave with the failed reflection', async () => {
    // The witnessed shape exactly: the note persists, the reflection 500s.
    await BLOCKS_POST(blocksReq({ [ATTEMPT_ID_HEADER]: ATTEMPT }), params);
    mockCreate.mockRejectedValue(Object.assign(new Error('overloaded'), { status: 529 }));
    const askRes = await ASK_POST(askReq({ [ATTEMPT_ID_HEADER]: ATTEMPT }), params);
    expect(askRes.status).toBe(500);

    const joined = records().filter((r) => r.attempt_id === ATTEMPT);
    const stages = joined.map((r) => r.stage);
    expect(stages).toContain('autosave_write');
    expect(stages).toContain('model_call');

    // The autosave succeeded and the reflection failed, under ONE act.
    expect(joined.find((r) => r.stage === 'autosave_write' && r.event === 'completed'))
      .toBeDefined();
    expect(joined.find((r) => r.stage === 'model_call' && r.event === 'failed'))
      .toBeDefined();
  });

  it('separates the two executions by request_id inside the one attempt', async () => {
    await BLOCKS_POST(blocksReq({ [ATTEMPT_ID_HEADER]: ATTEMPT }), params);
    await ASK_POST(askReq({ [ATTEMPT_ID_HEADER]: ATTEMPT }), params);
    const joined = records().filter((r) => r.attempt_id === ATTEMPT);
    const requestIds = new Set(joined.map((r) => r.request_id));
    // One member act, two executions — which is the distinction request_id
    // exists to preserve when an attempt id is retried or duplicated.
    expect(requestIds.size).toBe(2);
  });

  it('a malformed header on one request does not fail it, and marks the source', async () => {
    const res = await BLOCKS_POST(blocksReq({ [ATTEMPT_ID_HEADER]: 'garbage' }), params);
    expect(res.status).toBe(201);
    expect(records().every((r) => r.attempt_id_source === 'server')).toBe(true);
  });
});
