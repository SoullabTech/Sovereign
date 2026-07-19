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
  TRUNCATION_MARKER,
  type StagedInput,
} from '../stagedReview';
import { isSingleSpeakerTranscript } from '../attributionGuard';
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

/** Current production reality: one undiarized stream → one speaker label. */
function makeUndiarizedTurns(n: number): ReviewTurn[] {
  return makeTurns(n).map(t => ({ ...t, speaker: 'Speaker 1' }));
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

  it('the elemental view asks for the developmental core (MAIA lens)', async () => {
    const turns = makeTurns(160);
    await runStagedReview(input(turns, { mode: 'elemental' }), hashTranscript(turns));
    const synthCall = mockGenerateSimple.mock.calls.find(
      c => typeof c[0]?.systemPrompt === 'string' && c[0].systemPrompt.includes('ELEMENTAL')
    );
    expect(synthCall).toBeDefined();
    const prompt = synthCall![0].messages[0].content as string;
    for (const marker of ['Center of Gravity', 'Developmental Edge', 'Living Question', 'Unintegrated Material', 'Fire', 'Aether']) {
      expect(prompt).toContain(marker);
    }
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

  it('a stalled synthesis call times out → failed(synthesis), not an infinite hang', async () => {
    const turns = makeTurns(160); // 4 chunks → staged
    // Digests resolve; synthesis never resolves (simulates the prod stall).
    mockGenerateSimple.mockImplementation(async (params: any) => {
      const isDigest = typeof params?.systemPrompt === 'string' && params.systemPrompt.includes('ONE segment');
      if (isDigest) return { text: 'digest ok' };
      return new Promise(() => {}); // synthesis hangs forever
    });
    jest.useFakeTimers();
    const p = runStagedReview(input(turns), hashTranscript(turns));
    // let the digests resolve, then trip the synthesis timeout
    await jest.advanceTimersByTimeAsync(200_000);
    const res = await p;
    jest.useRealTimers();
    expect(res.status).toBe('failed');
    if (res.status === 'failed') expect(res.stage).toBe('synthesis');
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

describe('single-undiarized-stream attribution guard (Kelly ruling, 2026-07-19)', () => {
  // Inferred dialogue must never be presented as captured attribution: when
  // the transcript carries no speaker distinctions, every prompt (each digest
  // and the synthesis) instructs inference-honest phrasing.

  it('provenance detector: derived from the transcript, not a constant', () => {
    expect(isSingleSpeakerTranscript(['Speaker 1', 'Speaker 1', 'Speaker 1'])).toBe(true);
    expect(isSingleSpeakerTranscript(['unknown', 'unknown'])).toBe(true);
    // Diarized transcript (Native Session Room Phase B) → guard off, no code change.
    expect(isSingleSpeakerTranscript(['practitioner', 'client'])).toBe(false);
    // Empty transcript has no attribution to qualify.
    expect(isSingleSpeakerTranscript([])).toBe(false);
  });

  it('single-speaker session: EVERY digest and the synthesis carry the guard', async () => {
    const turns = makeUndiarizedTurns(160); // 4 chunks → staged
    const res = await runStagedReview(input(turns, { mode: 'elemental' }), hashTranscript(turns));
    expect(res.status).toBe('complete');
    expect(mockGenerateSimple.mock.calls.length).toBeGreaterThan(0);
    for (const call of mockGenerateSimple.mock.calls) {
      const sys = call[0].systemPrompt as string;
      expect(sys).toContain('single undiarized stream');
      expect(sys).toContain('INFERENCE from conversational structure');
    }
    // The guard binds to the epistemic-label discipline: cross-participant
    // attribution is at most Tentative.
    const synth = mockGenerateSimple.mock.calls.find(c =>
      (c[0].systemPrompt as string).includes('ELEMENTAL')
    );
    expect(synth![0].systemPrompt).toContain('at most Tentative — never Said');
  });

  it('diarized (multi-speaker) session: NO prompt carries the guard', async () => {
    const turns = makeTurns(160);
    const res = await runStagedReview(input(turns, { mode: 'overview' }), hashTranscript(turns));
    expect(res.status).toBe('complete');
    for (const call of mockGenerateSimple.mock.calls) {
      expect(call[0].systemPrompt as string).not.toContain('single undiarized stream');
    }
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

describe('honest completeness at the token cap (prod walk 2026-07-19)', () => {
  // Discriminators mirror the real prompts: digests vs synthesis vs continuation.
  const isDigest = (p: any) =>
    typeof p?.systemPrompt === 'string' && p.systemPrompt.includes('ONE segment');
  const isContinuation = (p: any) => p?.messages?.length === 3;

  it('a max_tokens synthesis is continued to completion → complete, no marker', async () => {
    const turns = makeTurns(160); // 4 chunks
    const nChunks = chunkTurns(turns).length;
    mockGenerateSimple.mockImplementation(async (params: any) => {
      if (isDigest(params)) return { text: 'digest ok' };
      if (isContinuation(params)) return { text: ' finished the table.', metadata: { stopReason: 'end_turn' } };
      return { text: 'The **14-year-old girl', metadata: { stopReason: 'max_tokens' } };
    });
    const res = await runStagedReview(
      input(turns, { mode: 'question', question: 'What did the session hold?' }),
      hashTranscript(turns)
    );
    expect(res.status).toBe('complete');
    if (res.status !== 'complete') return;
    expect(res.result).toBe('The **14-year-old girl finished the table.');
    expect(res.truncated).toBe(false);
    // digests + first synthesis + exactly one continuation
    expect(mockGenerateSimple).toHaveBeenCalledTimes(nChunks + 2);
    // the continuation carries the partial as an assistant turn + an explicit continue instruction
    const cont = mockGenerateSimple.mock.calls.map(c => c[0] as any).find(isContinuation);
    expect(cont.messages.map((m: any) => m.role)).toEqual(['user', 'assistant', 'user']);
    expect(cont.messages[1].content).toBe('The **14-year-old girl');
    expect(cont.messages[2].content).toMatch(/continue exactly/i);
  });

  it('still at the cap after bounded continuations → honest marker + truncated flag, never silent', async () => {
    const turns = makeTurns(160); // 4 chunks
    const nChunks = chunkTurns(turns).length;
    mockGenerateSimple.mockImplementation(async (params: any) => {
      if (isDigest(params)) return { text: 'digest ok' };
      return { text: 'partial ', metadata: { stopReason: 'max_tokens' } };
    });
    const res = await runStagedReview(input(turns), hashTranscript(turns));
    expect(res.status).toBe('complete');
    if (res.status !== 'complete') return;
    expect(res.truncated).toBe(true);
    expect(res.result).toContain('truncated at the length limit');
    expect(res.result.endsWith(TRUNCATION_MARKER.trim())).toBe(true);
    // bounded: digests + first synthesis + SYNTH_CONTINUATIONS continuations, then stop
    expect(mockGenerateSimple).toHaveBeenCalledTimes(nChunks + 3);
  });

  it('a continuation failure keeps the partial artifact and marks it truncated', async () => {
    const turns = makeTurns(160);
    mockGenerateSimple.mockImplementation(async (params: any) => {
      if (isDigest(params)) return { text: 'digest ok' };
      if (isContinuation(params)) throw new Error('provider blip');
      return { text: 'partial work', metadata: { stopReason: 'max_tokens' } };
    });
    const res = await runStagedReview(input(turns), hashTranscript(turns));
    expect(res.status).toBe('complete');
    if (res.status !== 'complete') return;
    expect(res.truncated).toBe(true);
    expect(res.result.startsWith('partial work')).toBe(true);
    expect(res.result).toContain('truncated at the length limit');
  });

  it('a normal end_turn synthesis is untouched: no continuation, no marker, truncated=false', async () => {
    const turns = makeTurns(160);
    const nChunks = chunkTurns(turns).length;
    mockGenerateSimple.mockImplementation(async (params: any) => {
      if (isDigest(params)) return { text: 'digest ok' };
      return { text: 'a complete review', metadata: { stopReason: 'end_turn' } };
    });
    const res = await runStagedReview(input(turns), hashTranscript(turns));
    expect(res.status).toBe('complete');
    if (res.status !== 'complete') return;
    expect(res.result).toBe('a complete review');
    expect(res.truncated).toBe(false);
    expect(res.result).not.toContain('truncated at the length limit');
    expect(mockGenerateSimple).toHaveBeenCalledTimes(nChunks + 1);
  });
});
