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
  PROMPT_VERSION,
  TRUNCATION_MARKER,
  DIGEST_TRUNCATION_NOTE,
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
    // The Core must come FIRST: a generation that hits the length limit loses
    // the tail, and the tail must never be the essential section (sitting 07-19).
    expect(prompt.indexOf('Developmental Core')).toBeLessThan(prompt.indexOf('Session Field'));
    expect(prompt.indexOf('Unintegrated Material')).toBeLessThan(prompt.indexOf('Fire —'));
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

describe('digest honesty at the token cap (session map completeness, prod 2026-07-19)', () => {
  // Prod session d9f25ee4: 8 of 10 chunk digests stopped at DIGEST_MAX_TOKENS,
  // silently dropping segment tails — biased against the last DIGEST_SYSTEM
  // headings (decisions, unresolved, marked moments). The map layer must be
  // continued or say what it is missing.
  const isDigest = (p: any) =>
    typeof p?.systemPrompt === 'string' && p.systemPrompt.includes('ONE segment');
  const isCont = (p: any) => p?.messages?.length === 3;
  const findSynth = () =>
    mockGenerateSimple.mock.calls.map(c => c[0] as any).find(p => !isDigest(p));

  it('a max_tokens digest is continued once and the joined digest reaches the session map', async () => {
    const turns = makeTurns(160); // 4 chunks
    const nChunks = chunkTurns(turns).length;
    mockGenerateSimple.mockImplementation(async (params: any) => {
      if (isDigest(params) && isCont(params))
        return { text: ' Decisions: the tail facts.', metadata: { stopReason: 'end_turn' } };
      if (isDigest(params))
        return { text: 'Chronology: the head facts.', metadata: { stopReason: 'max_tokens' } };
      return { text: 'the review', metadata: { stopReason: 'end_turn' } };
    });
    const res = await runStagedReview(input(turns), hashTranscript(turns));
    expect(res.status).toBe('complete');
    if (res.status !== 'complete') return;
    expect(res.truncated).toBe(false);
    // per chunk: one digest + exactly one continuation; then one synthesis
    expect(mockGenerateSimple).toHaveBeenCalledTimes(nChunks * 2 + 1);
    // the continuation replays the SAME digest system prompt and carries the partial
    const cont = mockGenerateSimple.mock.calls
      .map(c => c[0] as any)
      .find(p => isDigest(p) && isCont(p));
    expect(cont.messages.map((m: any) => m.role)).toEqual(['user', 'assistant', 'user']);
    expect(cont.messages[1].content).toBe('Chronology: the head facts.');
    expect(cont.messages[2].content).toMatch(/continue exactly/i);
    // the synthesis reads the joined digest, not the truncated head — and no note
    const synth = findSynth();
    expect(synth.messages[0].content).toContain('Chronology: the head facts. Decisions: the tail facts.');
    expect(synth.messages[0].content).not.toContain(DIGEST_TRUNCATION_NOTE.trim());
  });

  it('still at the cap after the single continuation → the digest names its truncation in the map', async () => {
    const turns = makeTurns(160); // 4 chunks
    const nChunks = chunkTurns(turns).length;
    mockGenerateSimple.mockImplementation(async (params: any) => {
      if (isDigest(params)) return { text: 'partial digest', metadata: { stopReason: 'max_tokens' } };
      return { text: 'the review', metadata: { stopReason: 'end_turn' } };
    });
    const res = await runStagedReview(input(turns), hashTranscript(turns));
    expect(res.status).toBe('complete');
    // bounded: exactly ONE continuation per chunk, never more
    expect(mockGenerateSimple).toHaveBeenCalledTimes(nChunks * 2 + 1);
    expect(findSynth().messages[0].content).toContain(DIGEST_TRUNCATION_NOTE.trim());
  });

  it('a digest continuation failure keeps the partial digest with the note — not a chunk failure', async () => {
    const turns = makeTurns(160); // 4 chunks
    const nChunks = chunkTurns(turns).length;
    mockGenerateSimple.mockImplementation(async (params: any) => {
      if (isDigest(params) && isCont(params)) throw new Error('provider blip');
      if (isDigest(params)) return { text: 'partial digest', metadata: { stopReason: 'max_tokens' } };
      return { text: 'the review', metadata: { stopReason: 'end_turn' } };
    });
    const res = await runStagedReview(input(turns), hashTranscript(turns));
    // the partial digest is kept and marked — NOT failed(digest), NOT a full-chunk retry
    expect(res.status).toBe('complete');
    expect(mockGenerateSimple).toHaveBeenCalledTimes(nChunks * 2 + 1);
    const synth = findSynth();
    expect(synth.messages[0].content).toContain('partial digest');
    expect(synth.messages[0].content).toContain(DIGEST_TRUNCATION_NOTE.trim());
  });

  it('an end_turn digest makes exactly one call — no continuation, no note', async () => {
    const turns = makeTurns(160); // 4 chunks
    const nChunks = chunkTurns(turns).length;
    mockGenerateSimple.mockImplementation(async (params: any) => {
      if (isDigest(params)) return { text: 'a complete digest', metadata: { stopReason: 'end_turn' } };
      return { text: 'the review', metadata: { stopReason: 'end_turn' } };
    });
    const res = await runStagedReview(input(turns), hashTranscript(turns));
    expect(res.status).toBe('complete');
    expect(mockGenerateSimple).toHaveBeenCalledTimes(nChunks + 1);
    expect(findSynth().messages[0].content).not.toContain(DIGEST_TRUNCATION_NOTE.trim());
  });
});

describe('digest calibration (Kelly recommendation-first pass, 2026-07-19)', () => {
  // Reference case: 373-turn prod session, 10 chunks — all 10 first calls
  // capped at 750, ~8 continuations capped too. The selected limit is pinned
  // so it cannot drift without a deliberate test change, and the cap change
  // is pinned to a cache-version bump (the cache key omits maxTokens, so a
  // cap change without a version bump would keep serving stale digests).
  const isDigest = (p: any) =>
    typeof p?.systemPrompt === 'string' && p.systemPrompt.includes('ONE segment');

  it('every digest call — first and continuation — requests the calibrated 1500-token cap', async () => {
    const turns = makeTurns(160); // 4 chunks
    mockGenerateSimple.mockImplementation(async (params: any) => {
      if (isDigest(params) && params.messages.length === 3)
        return { text: ' tail', metadata: { stopReason: 'end_turn' } };
      if (isDigest(params))
        return { text: 'head', metadata: { stopReason: 'max_tokens' } };
      return { text: 'the review', metadata: { stopReason: 'end_turn' } };
    });
    const res = await runStagedReview(input(turns), hashTranscript(turns));
    expect(res.status).toBe('complete');
    const digestCalls = mockGenerateSimple.mock.calls.map(c => c[0] as any).filter(isDigest);
    expect(digestCalls.length).toBeGreaterThan(0);
    for (const call of digestCalls) expect(call.maxTokens).toBe(1500);
  });

  it('the calibration ships with the cache-invalidating version bump (sr-staged-v6)', () => {
    expect(PROMPT_VERSION).toBe('sr-staged-v6');
  });

  it('chunk size is unchanged by the calibration — 40 turns per chunk', () => {
    expect(CHUNK_TURNS).toBe(40);
  });
});

describe('lens grammar in staged synthesis (Spiralogic calibration pass, 2026-07-19)', () => {
  const isDigest = (p: any) =>
    typeof p?.systemPrompt === 'string' && p.systemPrompt.includes('ONE segment');

  it('question-mode synthesis carries the full Spiralogic lens instructions, not just the bare lens line', async () => {
    const turns = makeTurns(160);
    mockGenerateSimple.mockResolvedValue({ text: 'the review', metadata: { stopReason: 'end_turn' } });
    const res = await runStagedReview(
      input(turns, { mode: 'question', lens: 'spiralogic', question: 'What moved in this session?' }),
      hashTranscript(turns)
    );
    expect(res.status).toBe('complete');
    const synthCall = mockGenerateSimple.mock.calls.map(c => c[0] as any).filter(p => !isDigest(p)).pop();
    const user = synthCall.messages[0].content as string;
    expect(user).toContain('Active lens: SPIRALOGIC.');
    // The lens grammar itself — a coined term must arrive with its definition.
    expect(user).toContain('Spiralogic lens');
    expect(user).toContain('elemental imbalance');
    expect(user).toContain('living question');
  });

  it('fixed views keep the bare lens marker — their view systems govern the reading', async () => {
    const turns = makeTurns(160);
    mockGenerateSimple.mockResolvedValue({ text: 'the review', metadata: { stopReason: 'end_turn' } });
    const res = await runStagedReview(
      input(turns, { mode: 'overview', lens: 'spiralogic' }),
      hashTranscript(turns)
    );
    expect(res.status).toBe('complete');
    const synthCall = mockGenerateSimple.mock.calls.map(c => c[0] as any).filter(p => !isDigest(p)).pop();
    const user = synthCall.messages[0].content as string;
    expect(user).toContain('Active lens: SPIRALOGIC.');
    expect(user).not.toContain('elemental imbalance');
  });
});
