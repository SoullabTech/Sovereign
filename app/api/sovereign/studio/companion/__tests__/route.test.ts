/**
 * MAIA in the writing room — the guarantees that are not about wording.
 *
 * This route is the first surface where MAIA speaks inside the Studio, so the
 * things worth pinning are the ones a rewrite could quietly break:
 *
 *   · a room that is not the member's does not exist for them (404, no leak);
 *   · a writer turn can NEVER be persisted without the answer it produced —
 *     they are written in one statement, so a failure cannot leave the room
 *     holding half an exchange;
 *   · when MAIA cannot answer, NOTHING is written down and the room says so
 *     rather than inventing a reply;
 *   · Sanctuary answers and records nothing;
 *   · an invitation is authored words the writer can see, and an id the room
 *     does not offer is refused rather than passed through.
 */

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/ai/claudeClient', () => ({ generateWithClaude: jest.fn() }));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { generateWithClaude } from '@/lib/ai/claudeClient';
import { POST, GET } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockClaude = generateWithClaude as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const WORK = '22222222-2222-2222-2222-222222222222';

const norm = (sql: string) => sql.replace(/\s+/g, ' ').trim();

/** Answers the route's reads; records every statement it issued. */
function fakeDb(opts: { workRows?: unknown[]; materialRows?: unknown[]; threadRows?: unknown[] } = {}) {
  const statements: { sql: string; params: unknown[] }[] = [];
  mockQuery.mockImplementation(async (sql: string, params: unknown[] = []) => {
    statements.push({ sql: norm(sql), params });
    const s = norm(sql);
    if (s.startsWith('SELECT title, purpose, form, stage FROM living_works')) {
      return { rows: opts.workRows ?? [{ title: 'Elemental Alchemy', purpose: null, form: null, stage: null }] };
    }
    if (s.includes('FROM living_work_materials')) return { rows: opts.materialRows ?? [] };
    if (s.includes('FROM studio_companion_turns')) return { rows: opts.threadRows ?? [] };
    return { rows: [] };
  });
  return statements;
}

function post(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/sovereign/studio/companion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue(MEMBER);
  mockClaude.mockResolvedValue({ text: 'I notice you keep returning to thresholds.', provider: {} });
});

describe('who may open the room', () => {
  it('refuses a signed-out caller', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(post({ workId: WORK, message: 'hello' }));
    expect(res.status).toBe(401);
  });

  it('does not leak the existence of another member’s work', async () => {
    fakeDb({ workRows: [] });
    const res = await POST(post({ workId: WORK, message: 'hello' }));
    expect(res.status).toBe(404);
    expect(mockClaude).not.toHaveBeenCalled();
  });

  it('refuses a room that names nothing', async () => {
    fakeDb();
    const res = await POST(post({ message: 'hello' }));
    expect(res.status).toBe(404);
  });
});

describe('what the writer said', () => {
  it('refuses an empty turn', async () => {
    fakeDb();
    expect((await POST(post({ workId: WORK, message: '   ' }))).status).toBe(400);
  });

  it('refuses an invitation the room does not offer', async () => {
    fakeDb();
    const res = await POST(post({ workId: WORK, invitation: 'rewrite-my-book' }));
    expect(res.status).toBe(400);
    expect(mockClaude).not.toHaveBeenCalled();
  });

  it('turns an offered invitation into authored words the writer can see', async () => {
    const statements = fakeDb();
    const res = await POST(post({ workId: WORK, invitation: 'notice' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.said).toContain('notice');
    const insert = statements.find((s) => s.sql.startsWith('INSERT INTO studio_companion_turns'));
    expect(insert!.params).toContain(body.said);
  });
});

describe('the exchange is written whole or not at all', () => {
  it('records the writer turn and the reply in ONE statement', async () => {
    const statements = fakeDb();
    await POST(post({ workId: WORK, message: 'I am circling something' }));
    const inserts = statements.filter((s) => s.sql.startsWith('INSERT INTO studio_companion_turns'));
    expect(inserts).toHaveLength(1);
    expect(inserts[0].sql).toContain("'writer'");
    expect(inserts[0].sql).toContain("'maia'");
  });

  it('writes nothing when MAIA cannot answer, and says so', async () => {
    const statements = fakeDb();
    mockClaude.mockRejectedValue(new Error('provider down'));
    const res = await POST(post({ workId: WORK, message: 'hello' }));
    expect(res.status).toBe(503);
    expect((await res.json()).message).toContain('untouched');
    expect(statements.some((s) => s.sql.startsWith('INSERT INTO'))).toBe(false);
  });

  it('writes nothing when MAIA returns an empty answer', async () => {
    const statements = fakeDb();
    mockClaude.mockResolvedValue({ text: '   ', provider: {} });
    const res = await POST(post({ workId: WORK, message: 'hello' }));
    expect(res.status).toBe(503);
    expect(statements.some((s) => s.sql.startsWith('INSERT INTO'))).toBe(false);
  });
});

describe('sanctuary', () => {
  it('answers without recording anything, and says it did not record', async () => {
    const statements = fakeDb();
    const res = await POST(post({ workId: WORK, message: 'this one is private', sanctuary: true }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.persisted).toBe(false);
    expect(statements.some((s) => s.sql.startsWith('INSERT INTO'))).toBe(false);
  });

  it('does not read the earlier thread into a sanctuary turn', async () => {
    const statements = fakeDb({ threadRows: [{ id: 'x', role: 'writer', content: 'earlier', created_at: 'now' }] });
    await POST(post({ workId: WORK, message: 'private', sanctuary: true }));
    expect(statements.some((s) => s.sql.includes('FROM studio_companion_turns'))).toBe(false);
  });
});

describe('opening the room', () => {
  it('returns the authored opening and the durable thread', async () => {
    fakeDb({ threadRows: [{ id: 'a', role: 'maia', content: 'said before', created_at: 'then' }] });
    const res = await GET(
      new NextRequest(`http://localhost/api/sovereign/studio/companion?workId=${WORK}`),
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.opening).toBe('What are you making?');
    expect(body.turns).toHaveLength(1);
  });

  it('scopes every read to the caller', async () => {
    const statements = fakeDb();
    await GET(new NextRequest(`http://localhost/api/sovereign/studio/companion?workId=${WORK}`));
    const workRead = statements.find((s) => s.sql.includes('FROM living_works'));
    expect(workRead!.params).toEqual([WORK, MEMBER]);
  });
});
