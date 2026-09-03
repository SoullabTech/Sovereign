/**
 * Prerequisite unit — POST /api/ideas/[id]/ask-maia, exercised for real.
 *
 * This file imports the actual route handler and mocks only its boundaries
 * (session, database, reflection primitive, recognition). Every assertion below
 * is about what the handler itself does — no local replica of its logic.
 *
 * It proves the semantic substrate the ratified T1 instrument expects to
 * observe, and imports NO T1 instrumentation: no attempt id, no stage ladder,
 * no runtime revision. T1 instruments this runtime as a separate unit, after
 * this exists.
 */

import { POST } from '../route';

jest.mock('@/lib/auth/serverSessions', () => ({
  getCurrentSession: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/team/maiaThreadReflection', () => {
  const actual = jest.requireActual('@/lib/team/maiaThreadReflection');
  return { ...actual, generateThreadReflection: jest.fn() };
});
jest.mock('@/lib/maia/decisionChangeRecognition', () => ({
  runRecognition: jest.fn(() => null),
  getRecentRecognitionEvents: jest.fn(async () => []),
  storeRecognitionEvent: jest.fn(async () => undefined),
}));

import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import { generateThreadReflection } from '@/lib/team/maiaThreadReflection';

const mockSession = getCurrentSession as jest.Mock;
const mockQuery = query as jest.Mock;
const mockReflect = generateThreadReflection as jest.Mock;

const IDEA_ID = '11111111-2222-4333-8444-555555555555';
const MEMBER_ID = 'member-1';

/** Every SQL string the handler issues, in order. */
const sqlLog: string[] = [];

/** Rows returned per query, keyed by a distinguishing fragment of the SQL. */
function installDb(reflectionCount = '3') {
  sqlLog.length = 0;
  mockQuery.mockImplementation(async (sql: string) => {
    sqlLog.push(sql);
    if (sql.includes('FROM member_ideas')) {
      return { rows: [{ id: IDEA_ID, title: 'An idea', framing: null }] };
    }
    if (sql.includes("block_type != 'maia_reflection'") || sql.includes('ORDER BY created_at DESC')) {
      if (sql.includes("block_type = 'maia_reflection'") && sql.includes('COUNT')) {
        return { rows: [{ count: reflectionCount }] };
      }
      return { rows: [] };
    }
    if (sql.includes('COUNT(*)')) return { rows: [{ count: reflectionCount }] };
    if (sql.startsWith('INSERT INTO member_idea_blocks') || sql.includes('INSERT INTO member_idea_blocks')) {
      return { rows: [{ id: 'block-1', block_type: 'maia_reflection', content: 'r', metadata: {}, created_at: 'now' }] };
    }
    return { rows: [] };
  });
}

/** The SQL + params of the reflection INSERT, or undefined if none happened. */
function insertCall() {
  return mockQuery.mock.calls.find(
    ([sql]) => typeof sql === 'string' && sql.includes('INSERT INTO member_idea_blocks')
  );
}

/** Count of the dedicated reflection-count reads. */
function countReads() {
  return mockQuery.mock.calls.filter(
    ([sql]) => typeof sql === 'string' && sql.includes('COUNT(*)') && sql.includes("'maia_reflection'")
  ).length;
}

function req(body?: string) {
  return {
    text: async () => body ?? '',
  } as unknown as Parameters<typeof POST>[0];
}

const ctx = { params: Promise.resolve({ id: IDEA_ID }) };

beforeEach(() => {
  jest.clearAllMocks();
  mockSession.mockResolvedValue({ memberId: MEMBER_ID });
  mockReflect.mockResolvedValue('a reflection');
  installDb();
});

describe('plain Ask MAIA — no stance', () => {
  it('succeeds with no body at all', async () => {
    const res = await POST(req(), ctx);
    expect(res.status).toBe(201);
    expect(mockReflect).toHaveBeenCalledTimes(1);
    expect(mockReflect.mock.calls[0][0].stance).toBeUndefined();
  });

  it('treats an empty object exactly as no body', async () => {
    const res = await POST(req('{}'), ctx);
    expect(res.status).toBe(201);
    expect(mockReflect.mock.calls[0][0].stance).toBeUndefined();
  });

  it('performs the reflection COUNT read exactly once', async () => {
    await POST(req(), ctx);
    expect(countReads()).toBe(1);
  });

  it('passes the counted value to the primitive as reflectionCount', async () => {
    installDb('7');
    await POST(req(), ctx);
    expect(mockReflect.mock.calls[0][0].reflectionCount).toBe(7);
  });

  it('omits the stance key from persisted metadata entirely', async () => {
    await POST(req(), ctx);
    const call = insertCall();
    expect(call).toBeDefined();
    const metadata = JSON.parse(call![1][3] as string);
    expect('stance' in metadata).toBe(false);
    expect(metadata).toMatchObject({ source: 'maia', invoked_from: 'idea_thread' });
  });
});

describe('a chosen stance', () => {
  it('reaches the reflection primitive', async () => {
    await POST(req('{"stance":"distill"}'), ctx);
    expect(mockReflect).toHaveBeenCalledTimes(1);
    expect(mockReflect.mock.calls[0][0].stance).toBe('distill');
  });

  it('is persisted verbatim in the existing block metadata', async () => {
    await POST(req('{"stance":"distill"}'), ctx);
    const metadata = JSON.parse(insertCall()![1][3] as string);
    expect(metadata.stance).toBe('distill');
  });

  it('an explicit null stance is plain Ask MAIA', async () => {
    const res = await POST(req('{"stance":null}'), ctx);
    expect(res.status).toBe(201);
    expect(mockReflect.mock.calls[0][0].stance).toBeUndefined();
  });
});

describe('refusal — the member never gets a relation they did not choose', () => {
  it('rejects an unknown stance with 400, no model call, no write', async () => {
    const res = await POST(req('{"stance":"summarize"}'), ctx);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Unknown stance' });
    expect(mockReflect).not.toHaveBeenCalled();
    expect(insertCall()).toBeUndefined();
  });

  it('rejects a malformed body with 400, no model call, no write', async () => {
    const res = await POST(req('{stance:'), ctx);
    expect(res.status).toBe(400);
    expect(mockReflect).not.toHaveBeenCalled();
    expect(insertCall()).toBeUndefined();
  });
});

describe('non-stickiness — the stance governs one turn', () => {
  it('a second request without a stance carries none', async () => {
    await POST(req('{"stance":"distill"}'), ctx);
    expect(mockReflect.mock.calls[0][0].stance).toBe('distill');

    await POST(req('{}'), { params: Promise.resolve({ id: IDEA_ID }) });
    expect(mockReflect).toHaveBeenCalledTimes(2);
    expect(mockReflect.mock.calls[1][0].stance).toBeUndefined();
  });
});

describe('refusal ordering — stance validation does not leak existence', () => {
  it('an unowned or missing idea still resolves 404 before stance parsing', async () => {
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM member_ideas')) return { rows: [] };
      return { rows: [] };
    });
    const res = await POST(req('{"stance":"summarize"}'), ctx);
    expect(res.status).toBe(404);
    expect(mockReflect).not.toHaveBeenCalled();
  });

  it('an unauthenticated caller resolves 401 before anything else', async () => {
    mockSession.mockResolvedValue(null);
    const res = await POST(req('{stance:'), ctx);
    expect(res.status).toBe(401);
    expect(mockReflect).not.toHaveBeenCalled();
  });
});
