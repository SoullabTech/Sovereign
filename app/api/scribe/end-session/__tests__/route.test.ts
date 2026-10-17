/**
 * Scribe end-session — actor resolution and purge eligibility.
 *
 * The defect: `{ sessionId, userId, sanctuary }` came from the request body with
 * no session resolution. The target session's member_id was SELECTed and never
 * compared to anyone, and the caller-supplied `sanctuary` flag could select an
 * irreversible `DELETE FROM conversation_turns` against a caller-named session.
 *
 * Handler called directly — upstream routing contributes nothing to the proof.
 */
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));

import { POST, GET } from '../route';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

const mockQuery = query as jest.MockedFunction<typeof query>;
const mockTx = transaction as jest.MockedFunction<typeof transaction>;
const mockActor = getMemberIdFromRequest as jest.MockedFunction<typeof getMemberIdFromRequest>;

const ME = 'member-me';
const OTHER = 'member-other';
const SID = 'session-1';

const post = (body: unknown) => ({ json: async () => body }) as never;
const get = (qs: string) => ({ url: `https://x/api/scribe/end-session?${qs}` }) as never;

function sessionRow(over: Record<string, unknown> = {}) {
  return { id: SID, mode: 'continuity', status: 'active', summary: null,
           member_id: ME, completed_at: null, ...over };
}
/** First query() resolves the session; later ones are counts/updates. */
function withSession(row: unknown | null) {
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql: string) => {
    if (/FROM maia_sessions WHERE id/.test(sql)) return { rows: row ? [row] : [] } as never;
    if (/UPDATE maia_sessions SET status/.test(sql))
      return { rows: [{ id: SID }] } as never;
    if (/COUNT\(\*\)/.test(sql)) return { rows: [{ turn_count: '0' }] } as never;
    return { rows: [] } as never;
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockTx.mockImplementation(async (cb: never) =>
    (cb as unknown as (c: unknown) => Promise<unknown>)({ query: async () => ({ rows: [], rowCount: 0 }) }));
});

describe('no verified session', () => {
  it('refuses POST', async () => {
    mockActor.mockResolvedValue(null);
    expect((await POST(post({ sessionId: SID }))).status).toBe(401);
    expect(mockTx).not.toHaveBeenCalled();
  });

  it('refuses GET (it returns summary content)', async () => {
    mockActor.mockResolvedValue(null);
    expect((await GET(get(`sessionId=${SID}`))).status).toBe(401);
  });
});

describe("another member's session", () => {
  beforeEach(() => mockActor.mockResolvedValue(ME));

  it('POST returns 404, not 403 — no existence oracle', async () => {
    withSession(sessionRow({ member_id: OTHER }));
    const res = await POST(post({ sessionId: SID }));
    expect(res.status).toBe(404);
    expect(mockTx).not.toHaveBeenCalled();
  });

  it('GET discloses nothing about it', async () => {
    withSession(sessionRow({ member_id: OTHER, summary: { secret: 'x' } }));
    const res = await GET(get(`sessionId=${SID}`));
    expect(res.status).toBe(404);
    expect(JSON.stringify(await res.json())).not.toContain('secret');
  });

  it('a missing session is indistinguishable from a foreign one', async () => {
    withSession(null);
    expect((await POST(post({ sessionId: SID }))).status).toBe(404);
  });
});

describe('caller-supplied fields cannot establish anything', () => {
  beforeEach(() => mockActor.mockResolvedValue(ME));

  it('a forged userId does not become the actor', async () => {
    withSession(sessionRow({ member_id: OTHER }));
    expect((await POST(post({ sessionId: SID, userId: OTHER }))).status).toBe(404);
  });

  it('a forged sanctuary flag cannot trigger the purge', async () => {
    // Persisted mode is continuity; the body says sanctuary.
    withSession(sessionRow({ mode: 'continuity' }));
    const res = await POST(post({ sessionId: SID, sanctuary: true }));
    expect((await res.json()).mode).toBe('continuity');
    expect(mockTx).not.toHaveBeenCalled(); // no destructive branch entered
  });

  it('sanctuary cannot be conjured for a session with no persisted mode', async () => {
    withSession(sessionRow({ mode: null }));
    const res = await POST(post({ sessionId: SID, sanctuary: true }));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe('PER_TURN_DELETION_POLICY_NOT_QUALIFIED');
    expect(mockTx).not.toHaveBeenCalled();
  });
});

describe('purge eligibility', () => {
  beforeEach(() => mockActor.mockResolvedValue(ME));

  it('an owned sanctuary session cannot trigger a blanket DELETE', async () => {
    withSession(sessionRow({ mode: 'sanctuary' }));
    const res = await POST(post({ sessionId: SID }));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe('PER_TURN_DELETION_POLICY_NOT_QUALIFIED');
    expect(mockTx).not.toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('an ANONYMOUS sanctuary session is never purged — nobody can authorize it', async () => {
    withSession(sessionRow({ mode: 'sanctuary', member_id: null }));
    const res = await POST(post({ sessionId: SID }));
    expect(res.status).toBe(404);
    expect(mockTx).not.toHaveBeenCalled();
  });

  it('an ownerless legacy continuity session cannot be adopted or closed', async () => {
    withSession(sessionRow({ member_id: null }));
    const res = await POST(post({ sessionId: SID }));
    expect(res.status).toBe(404);
    expect(mockTx).not.toHaveBeenCalled();
  });
});

describe('R1-A protected content aftermath', () => {
  beforeEach(() => mockActor.mockResolvedValue(ME));
  it('ordinary closure remains non-destructive, without a summary job', async () => {
    withSession(sessionRow({mode:'continuity'}));
    const res=await POST(post({sessionId:SID}));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success:true,mode:'continuity',status:'completed',
      skippedQueue:true,summaryHeld:true,summary:null,
    });
    expect(mockTx).not.toHaveBeenCalled();
    expect(mockQuery.mock.calls.some(args=>/DELETE FROM/.test(String(args[0])))).toBe(false);
    expect(mockQuery.mock.calls.some(args=>/session_summary_queue/.test(String(args[0])))).toBe(false);
  });
  it('historical summaries are not returned on status GET',async()=>{
    withSession(sessionRow({status:'completed',summary:{essence:'PROTECTED_DERIVATIVE'}}));
    const res=await GET(get('sessionId='+SID));
    expect(res.status).toBe(200);
    const payload=await res.json();
    expect(payload.hasSummary).toBe(false);
    expect(payload.summary).toBeNull();
    expect(JSON.stringify(payload)).not.toContain('PROTECTED_DERIVATIVE');
    expect(String(mockQuery.mock.calls[0][0])).not.toContain('summary,');
  });
});

describe('idempotency', () => {
  it('an already-completed session is a no-op, not a second purge', async () => {
    mockActor.mockResolvedValue(ME);
    withSession(sessionRow({ status: 'completed', mode: 'sanctuary' }));
    const res = await POST(post({ sessionId: SID }));
    expect(res.status).toBe(200);
    expect(mockTx).not.toHaveBeenCalled();
  });
});
