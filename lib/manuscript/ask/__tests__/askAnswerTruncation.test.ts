/**
 * WS-ASK-ANSWER-TRUNCATION (Elemental Alchemy acceptance walk, 2026-11-10).
 *
 * In the founder's walk two Work-conversation answers stopped mid-sentence (1,315 and 140 characters) and were
 * stored and shown as complete. Cause, from source + provider documentation: the model reasons by default and
 * those tokens share a 1,200-token ceiling; the reader never looked at `stopReason`.
 *
 * These tests fail on that reader: a cut answer must never come back as `ok`, the ceiling must leave room to
 * finish, and how the answer ended must be recorded.
 */
jest.mock('../../../ai/structured/router', () => ({ runStructured: jest.fn() }));
jest.mock('@/lib/writersStudio/workSituation', () => ({
  formatWorkSituationForPrompt: () => 'THE WORK ON THE TABLE (fixture)',
}));

import { runStructured } from '../../../ai/structured/router';
import { askMaia, ASK_MAX_TOKENS, type AskContext } from '../askReader';
import { UNMEASURED } from '../staleness';

const mockRun = runStructured as jest.MockedFunction<typeof runStructured>;

function reply(text: string, stopReason: string | null, outputTokens = 10) {
  return {
    ok: true as const,
    result: {
      content: [{ type: 'text', text }] as never,
      stopReason,
      usage: { inputTokens: 1, outputTokens },
      provenance: { provider: 'anthropic' as const, model: 'm', latencyMs: 1 },
    },
  };
}

/* Fictional manuscript only. */
const workCtx = (): AskContext => ({
  kind: 'work',
  anchor: { on: 'work' },
  staleness: UNMEASURED,
  facts: {
    work: {} as never,
    manuscript: { id: 'ms-1', draftId: 'd-1', version: 3 },
    sections: [{ id: 'sec-a', position: 1, heading: 'I. The Harbour' }],
    locus: { sectionId: 'sec-a', label: 'I. The Harbour', body: 'The boats came in late that winter.' },
    writerUnderstanding: '',
    writerCorrections: '',
    continuity: { structure: 'unmeasured', prose: 'unmeasured' },
  },
} as AskContext);

beforeEach(() => mockRun.mockReset());

describe('a cut answer is not an answer', () => {
  it('⛔ a max_tokens stop is refused as answer_incomplete, never returned as her words', async () => {
    /* The exact shape of the walk's second answer: a sentence ending on "of Chapter". */
    mockRun.mockResolvedValue(reply('What I have this turn is more than last time: the three readings in front of me now are of Chapter', 'max_tokens', ASK_MAX_TOKENS));
    const out = await askMaia(workCtx(), [], 'Looking across the whole book, what is it about?');
    expect(out).toEqual({ ok: false, refusal: 'answer_incomplete' });
  });

  it('⛔ a context-window stop is also unfinished and refused the same way', async () => {
    mockRun.mockResolvedValue(reply('The harbour returns in the last chapter, where', 'model_context_window_exceeded'));
    const out = await askMaia(workCtx(), [], 'Q');
    expect(out).toEqual({ ok: false, refusal: 'answer_incomplete' });
  });

  it('⭐ a finished answer still comes back, with how it ended recorded', async () => {
    mockRun.mockResolvedValue(reply('The harbour opens and closes the book.', 'end_turn', 812));
    const out = await askMaia(workCtx(), [], 'Q');
    expect(out.ok).toBe(true);
    if (!out.ok) throw new Error('unreachable');
    expect(out.answer).toBe('The harbour opens and closes the book.');
    expect(out.provenance.stopReason).toBe('end_turn');
    expect(out.provenance.outputTokens).toBe(812);
  });

  it('⭐ an unreported stop reason is not mistaken for a cut (and is recorded as unknown)', async () => {
    mockRun.mockResolvedValue(reply('An answer.', null));
    const out = await askMaia(workCtx(), [], 'Q');
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.provenance.stopReason).toBeNull();
  });
});

describe('the route never stores a refused answer (source order, Work path)', () => {
  /* The behavioural witness is route.walk W9 (needs a fictional loopback DB). This pins the ORDER that makes it true
     everywhere: on the Work path a refused outcome returns before MAIA's turn is appended. Comments stripped first. */
  const { readFileSync } = jest.requireActual<typeof import('fs')>('fs');
  const route = readFileSync(`${process.cwd()}/app/api/sovereign/manuscripts/[id]/ask/route.ts`, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('⭐ the question is appended, then a refusal returns, then (only otherwise) her answer is appended', () => {
    const fidelity = route.indexOf('checkQuoteFidelity(outcome.answer');
    expect(fidelity).toBeGreaterThan(-1);
    const refused = route.indexOf('if (!outcome.ok)', fidelity);
    const refusedReturn = route.indexOf('refusal: outcome.refusal', refused);
    const herTurn = route.indexOf("speaker: 'maia', body: outcome.answer", fidelity);
    const question = route.lastIndexOf("speaker: 'author', body: question", fidelity);
    expect(question).toBeGreaterThan(-1);
    expect(refused).toBeGreaterThan(fidelity);
    expect(refusedReturn).toBeGreaterThan(refused);
    expect(herTurn).toBeGreaterThan(refusedReturn);
    expect(route.slice(refused, herTurn)).toMatch(/return NextResponse\.json\(/);
  });
});

describe('the ceiling leaves room to reason and to finish', () => {
  it('⭐ asks with ASK_MAX_TOKENS by default — and that is far above the 1,200 that cut the walk', async () => {
    mockRun.mockResolvedValue(reply('An answer.', 'end_turn'));
    await askMaia(workCtx(), [], 'Q');
    const sent = mockRun.mock.calls[0]?.[0] as { maxTokens: number };
    expect(sent.maxTokens).toBe(ASK_MAX_TOKENS);
    expect(ASK_MAX_TOKENS).toBeGreaterThanOrEqual(16_000);
  });

  it('⭐ an explicit caller ceiling still wins', async () => {
    mockRun.mockResolvedValue(reply('An answer.', 'end_turn'));
    await askMaia(workCtx(), [], 'Q', { maxTokens: 500 });
    expect((mockRun.mock.calls[0]?.[0] as { maxTokens: number }).maxTokens).toBe(500);
  });
});
