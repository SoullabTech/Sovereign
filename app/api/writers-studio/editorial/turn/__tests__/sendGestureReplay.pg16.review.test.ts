/**
 * @jest-environment node
 *
 * Class A SOURCE-EXACT, REAL PostgreSQL16 fictional-only negative witness.
 *
 * The actual Writer POST route, actual persistMemberEditorialAct, actual
 * appendTurnWithClient and actual lib/db/postgres transaction run against a
 * disposable GitHub Actions localhost DB with a MINIMAL synthetic Ask schema.
 * Canonical identity, original relationship preflight, and MAIA provider
 * are mocked. This does NOT qualify full production schema, source custody,
 * R20 grants, provider consent, or cross-service exactly-once.
 *
 * EXPECTED RED: without an identity for one Send gesture on the wire, the
 * route cannot make a returned/repeated identical payload once-only.
 * Different REAL author gestures with identical words must remain distinct.
 */

const EXPECTED_URL =
  'postgresql://fictional_writer_qa:fictional_only@127.0.0.1:5432/fictional_writer_gesture_qa';

// Absolutely no import of db client / connection until all safety gates pass.
if (
  process.env.WRITER_SEND_GESTURE_PG16_QA !== 'TRUE_EXPLICIT_TEST_ONLY' ||
  process.env.DATABASE_URL !== EXPECTED_URL ||
  process.env.GITHUB_ACTIONS !== 'true'
) {
  throw new Error('QA guard: refusing database import or execution outside fixed GitHub-only ephemeral PostgreSQL16');
}

const mockIdentity = jest.fn();
const mockPreflight = jest.fn();
const mockProvider = jest.fn();
const mockCarry = jest.fn();

jest.mock('@/lib/maia/canonical-turn', () => ({
  resolveCanonicalIdentity: (...args: unknown[]) => mockIdentity(...args),
}));
jest.mock('@/lib/writers-studio/relationshipCarriage', () => ({
  preflightEditorialRelationshipCarriage: (...args: unknown[]) => mockPreflight(...args),
  resolvePriorMaiaEditorialCarry: (...args: unknown[]) => mockCarry(...args),
}));
jest.mock('@/lib/manuscript/editorialRuntime/turn', () => ({
  runEditorialTurn: (...args: unknown[]) => mockProvider(...args),
}));

// Deliberately perform runtime imports only AFTER the fail-closed QA gate.
// Type-only import() forms below are erased; no PG pool is constructed first.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { POST } = require('../route') as typeof import('../route');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { pool, closePool } = require('@/lib/db/postgres') as typeof import('@/lib/db/postgres');

const MEMBER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const THREAD = '33333333-3333-4333-8333-333333333333';
const CHAIN = '44444444-4444-4444-8444-444444444444';
const RELATION = '55555555-5555-4555-8555-555555555555';
const AUTHOR_WORDS = 'FICTIONAL_AUTHOR_WORDS_EPHEMERAL_DB_ONLY';

const request = (body: unknown) => ({ json: async () => body }) as never;
const body = {
  threadId: THREAD,
  relationshipId: RELATION,
  sanctuary: false,
  act: { act: 'discourse', text: AUTHOR_WORDS, refersTo: null },
};

beforeAll(async () => {
  if (!pool) throw new Error('QA guard: DB pool unavailable');
  const db = await pool.query<{
    db: string; user_name: string; server_addr: string;
  }>(`SELECT current_database() db, current_user user_name,
             inet_server_addr()::text server_addr`);
  expect(db.rows[0]).toEqual({
    db: 'fictional_writer_gesture_qa',
    user_name: 'fictional_writer_qa',
    server_addr: '127.0.0.1',
  });
  await pool.query(`
    CREATE TABLE ask_threads (
      id UUID PRIMARY KEY,
      member_id UUID NOT NULL,
      proposal_chain_id UUID
    );
    CREATE TABLE ask_turns (
      thread_id UUID NOT NULL REFERENCES ask_threads(id),
      turn_index INTEGER NOT NULL,
      speaker TEXT NOT NULL,
      body TEXT NOT NULL,
      staleness JSONB NOT NULL,
      answer_provenance JSONB,
      PRIMARY KEY(thread_id, turn_index)
    );
  `);
});

beforeEach(async () => {
  jest.clearAllMocks();
  if (!pool) throw new Error('QA guard: DB pool unavailable');
  await pool.query('DELETE FROM ask_turns');
  await pool.query('DELETE FROM ask_threads');
  await pool.query('INSERT INTO ask_threads(id, member_id, proposal_chain_id) VALUES ($1,$2,$3)',
    [THREAD, MEMBER, CHAIN]);
  process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
  mockIdentity.mockResolvedValue({ status: 'verified', memberId: MEMBER });
  mockPreflight.mockResolvedValue({
    ok: true, relationshipId: RELATION, manuscriptId: 'fictional-manuscript',
    proposalChainId: CHAIN, manuscriptLocusScope: 'passage',
  });
  mockProvider.mockResolvedValue({
    ok: false, reason: 'structured_refused', detail: 'not_configured',
  });
});

afterAll(async () => {
  if (pool) {
    // This deliberately-created ephemeral database is discarded by CI;
    // cleanup is an additional test hygiene safeguard.
    await pool.query('DROP TABLE IF EXISTS ask_turns');
    await pool.query('DROP TABLE IF EXISTS ask_threads');
  }
  await closePool();
});

async function authorTurns() {
  if (!pool) throw new Error('QA guard: DB pool unavailable');
  const found = await pool.query<{
    turn_index: number; speaker: string; body: string;
  }>('SELECT turn_index, speaker, body FROM ask_turns ORDER BY turn_index');
  return found.rows;
}

describe('Class A: real PG16 cannot infer same-gesture identity from identical HTTP POST body', () => {
  test('EXPECTED RED: sequential retry after lost response writes only one author act / one provider attempt', async () => {
    const a = await POST(request(body));
    const b = await POST(request(body));
    expect([a.status, b.status]).toEqual([502, 502]);
    const turns = await authorTurns();
    // Current original code appends two distinct indexed rows and dispatches
    // two fictional provider calls. A future authorized gesture protocol
    // MUST distinguish same retry from independent author actions.
    expect({
      persistedAuthorActs: turns.length,
      fictionalModelInvocations: mockProvider.mock.calls.length,
    }).toEqual({
      persistedAuthorActs: 1,
      fictionalModelInvocations: 1,
    });
  });

  test('EXPECTED RED: two simultaneous same-gesture calls converge to one stable receipt rather than a second act or SQL collision', async () => {
    const settled = await Promise.allSettled([
      POST(request(body)), POST(request(body)),
    ]);
    const turns = await authorTurns();
    // Depending on interleaving, the old MAX(turn_index)+1 statement either
    // appends twice or causes a PK contention. Neither is the required
    // twice-successful readback of ONE admitted gesture.
    expect({
      successfulResponses: settled.filter(x => x.status === 'fulfilled').length,
      statuses: settled.map(x => x.status === 'fulfilled' ? x.value.status : 'rejected'),
      persistedAuthorActs: turns.length,
      fictionalModelInvocations: mockProvider.mock.calls.length,
    }).toEqual({
      successfulResponses: 2,
      statuses: [502, 502],
      persistedAuthorActs: 1,
      fictionalModelInvocations: 1,
    });
  });

  test('GREEN: two genuinely distinct author gestures with identical text remain TWO durable acts', async () => {
    // Distinct is test intent. The present wire contract does not encode it.
    const first = await POST(request(body));
    const second = await POST(request(body));
    expect([first.status, second.status]).toEqual([502, 502]);
    expect(await authorTurns()).toEqual([
      { turn_index: 0, speaker: 'author', body: AUTHOR_WORDS },
      { turn_index: 1, speaker: 'author', body: AUTHOR_WORDS },
    ]);
    expect(mockProvider).toHaveBeenCalledTimes(2);
  });

  test('GREEN: foreign authenticated member cannot write a thread owned by another member', async () => {
    mockIdentity.mockResolvedValue({ status: 'verified', memberId: OTHER });
    // Preflight is mocked positive to independently test SQL member ownership.
    const response = await POST(request(body));
    expect(response.status).toBe(404);
    expect(await authorTurns()).toHaveLength(0);
    expect(mockProvider).not.toHaveBeenCalled();
  });

  test('GREEN: Sanctuary refusal happens before a PG author insert or model call', async () => {
    const response = await POST(request({ ...body, sanctuary: true }));
    expect(response.status).toBe(409);
    expect(await authorTurns()).toHaveLength(0);
    expect(mockProvider).not.toHaveBeenCalled();
  });

  test('GREEN: missing verified relationship refuses before PG author insert', async () => {
    mockPreflight.mockResolvedValue({
      ok: false, reason: 'relationship_mismatch',
    });
    const response = await POST(request({ ...body, relationshipId: OTHER }));
    expect(response.status).toBe(409);
    expect(await authorTurns()).toHaveLength(0);
    expect(mockProvider).not.toHaveBeenCalled();
  });
});
