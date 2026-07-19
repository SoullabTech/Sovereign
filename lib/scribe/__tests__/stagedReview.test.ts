/**
 * Staged long-session review — core-logic tests (Kelly ruling, 2026-07-19).
 *
 * Proves the constitutional properties of the long-session path:
 *  - small sessions stay on the simple path; large ones enter staged;
 *  - every transcript turn is represented in exactly one chunk;
 *  - a failed chunk cannot yield an apparently-complete review;
 *  - completed artifacts are cached and reused;
 *  - concurrent requests for the same artifact share one job (no duplicate
 *    concurrent generation on tab switches).
 * The LLM is mocked — what is under test is the orchestration, not the model.
 */

const mockGenerateSimple = jest.fn();
jest.mock('@/lib/consciousness/LLMProvider', () => ({
  getLLMProvider: () => ({ generateSimple: (...a: unknown[]) => mockGenerateSimple(...a) }),
}));

import {
  chunkTurns,
  hashTranscript,
  isLongSession,
  runStagedReview,
  getOrStartReview,
  _resetStagedReviewState,
  SIMPLE_MAX_TURNS,
  CHUNK_TURNS,
  type StagedInput,
} from '../stagedReview';
import type { ReviewTurn } from '../sessionReviewMode';

function makeTurns(n: number): ReviewTurn[] {
  return Array.from({ length: n }, (_, i) => ({
    index: i,
    speaker: i % 2 === 0 ? 'practitioner' : 'client',
    text: `turn ${i} content`,
    tsLabel: `${Math.floor(i / 60)}:${String(i % 60).padStart(2, '0')}`,
    startMs: i * 1000,
  }));
}

function input(turns: ReviewTurn[], overrides: Partial<StagedInput> = {}): StagedInput {
  return {
    sessionId: 'sess-1',
    turns,
    markersText: 'No markers placed.',
    mode: 'overview',
    question: 'Provide a layered overview of this session.',
    lens: 'core',
    clientName: null,
    sessionMeta: { container: 'practitioner', durationMin: 139, startedAt: new Date('2026-07-19'), title: null },
    ...overrides,
  };
}

const flush = () => new Promise(r => setImmediate(r));

beforeEach(() => {
  jest.clearAllMocks();
  _resetStagedReviewState();
  // default: every call returns a short body
  mockGenerateSimple.mockResolvedValue({ text: 'digest or synthesis text' });
});

describe('path selection', () => {
  it('a small session is not a long session', () => {
    expect(isLongSession(SIMPLE_MAX_TURNS)).toBe(false);
    expect(isLongSession(120)).toBe(false);
  });
  it('a 373-turn session is a long session', () => {
    expect(isLongSession(373)).toBe(true);
  });
});

describe('chunk coverage invariant', () => {
  it('every turn appears in exactly one chunk, order preserved (373 turns)', () => {
    const turns = makeTurns(373);
    const chunks = chunkTurns(turns);
    const flat = chunks.flat();
    expect(flat).toHaveLength(373);
    expect(flat.map(t => t.index)).toEqual(turns.map(t => t.index)); // order + completeness
    expect(chunks.every(c => c.length <= CHUNK_TURNS)).toBe(true);
    // no chunk empty
    expect(chunks.every(c => c.length > 0)).toBe(true);
  });
  it('exact multiple and remainder both covered', () => {
    expect(chunkTurns(makeTurns(80), 40).map(c => c.length)).toEqual([40, 40]);
    expect(chunkTurns(makeTurns(85), 40).map(c => c.length)).toEqual([40, 40, 5]);
  });
});

describe('runStagedReview', () => {
  it('373-turn session: digests every chunk then synthesizes once → complete', async () => {
    const turns = makeTurns(373);
    const chunks = chunkTurns(turns).length; // ceil(373/40) = 10
    const res = await runStagedReview(input(turns), hashTranscript(turns));
    expect(res.status).toBe('complete');
    // one call per chunk (digest) + one synthesis
    expect(mockGenerateSimple).toHaveBeenCalledTimes(chunks + 1);
  });

  it('reports phase transitions: reading → the requested view', async () => {
    const turns = makeTurns(200);
    const phases: string[] = [];
    await runStagedReview(input(turns, { mode: 'elemental' }), hashTranscript(turns), (_d, _t, phase) => {
      if (phases[phases.length - 1] !== phase) phases.push(phase);
    });
    expect(phases[0]).toBe('reading');
    expect(phases[phases.length - 1]).toBe('elemental');
  });

  it('the 2nd and 3rd views reuse the cached session map (digests), paying one synth call each', async () => {
    const turns = makeTurns(200); // 5 chunks
    const hash = hashTranscript(turns);
    const nChunks = chunkTurns(turns).length;
    await runStagedReview(input(turns, { mode: 'overview' }), hash); // 5 digests + 1 synth
    const afterFirst = mockGenerateSimple.mock.calls.length;
    expect(afterFirst).toBe(nChunks + 1);
    // second view: digests are cached → only ONE new synthesis call
    await runStagedReview(input(turns, { mode: 'elemental' }), hash);
    expect(mockGenerateSimple.mock.calls.length).toBe(afterFirst + 1);
    // third view: same
    await runStagedReview(input(turns, { mode: 'organizational' }), hash);
    expect(mockGenerateSimple.mock.calls.length).toBe(afterFirst + 2);
  });

  it('a chunk that fails after retries → failed(digest), and NO synthesis runs', async () => {
    const turns = makeTurns(120 + 40); // >threshold → staged; 4 chunks
    // Fail ONE specific chunk (the one covering turns 0–39) on every attempt,
    // keyed on its digest prompt so concurrency/retries don't confound it.
    mockGenerateSimple.mockImplementation(async (params: any) => {
      const content = params?.messages?.[0]?.content ?? '';
      const isDigest = typeof params?.systemPrompt === 'string' && params.systemPrompt.includes('ONE segment');
      if (isDigest && /turns 0[–-]/.test(content)) throw new Error('provider blip');
      return { text: 'ok' };
    });
    const res = await runStagedReview(input(turns), hashTranscript(turns));
    expect(res.status).toBe('failed');
    if (res.status === 'failed') {
      expect(res.stage).toBe('digest');
      expect(res.failedChunks && res.failedChunks.length).toBeGreaterThan(0);
    }
    // synthesis system prompt is distinctive — assert it was NEVER called
    const synthCalled = mockGenerateSimple.mock.calls.some(
      c => typeof c[0]?.systemPrompt === 'string' && c[0].systemPrompt.includes('building a view of a COMPLETE session')
    );
    expect(synthCalled).toBe(false);
  });
});

describe('cache + job dedup via getOrStartReview', () => {
  it('completed artifact is cached and reused with no further LLM calls', async () => {
    const turns = makeTurns(200);
    const hash = hashTranscript(turns);
    const first = getOrStartReview(input(turns), hash);
    expect(first.status).toBe('processing');
    expect(first.started).toBe(true);
    // let the background job finish
    await flush();
    await new Promise(r => setTimeout(r, 50));
    const callsAfterGen = mockGenerateSimple.mock.calls.length;
    // subsequent request → served from cache, no new generation
    const second = getOrStartReview(input(turns), hash);
    expect(second.status).toBe('complete');
    expect(second.started).toBe(false);
    expect(mockGenerateSimple.mock.calls.length).toBe(callsAfterGen);
  });

  it('concurrent requests for the same artifact share ONE job (started once)', async () => {
    const turns = makeTurns(200);
    const hash = hashTranscript(turns);
    const a = getOrStartReview(input(turns), hash);
    const b = getOrStartReview(input(turns), hash);
    const c = getOrStartReview(input(turns), hash);
    expect(a.started).toBe(true);
    expect(b.started).toBe(false);
    expect(c.started).toBe(false);
    expect([b.status, c.status]).toEqual(['processing', 'processing']);
  });

  it('a failed job surfaces failed, then clears so a later request can retry', async () => {
    const turns = makeTurns(200);
    const hash = hashTranscript(turns);
    mockGenerateSimple.mockRejectedValue(new Error('down'));
    getOrStartReview(input(turns), hash);
    await new Promise(r => setTimeout(r, 60));
    const failed = getOrStartReview(input(turns), hash);
    expect(failed.status).toBe('failed');
    // job cleared → next call starts fresh
    mockGenerateSimple.mockResolvedValue({ text: 'ok now' });
    const retry = getOrStartReview(input(turns), hash);
    expect(retry.started).toBe(true);
  });
});
