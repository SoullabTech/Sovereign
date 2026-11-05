/**
 * CONVERSATION-STAGE · step 1 (founder rulings Q1–Q6, 2026-11-05) — MAIA is told
 * the truth about what she has in a Work conversation.
 *
 * The Work branch used to open with the frozen-reading STANDING: "The frozen
 * reading below, and nothing else. You do not have the manuscript prose…" — and
 * then hand her the passage the writer is at. A Work conversation has no frozen
 * reading. These tests fail on that prompt.
 */
jest.mock('../../../ai/structured/router', () => ({ runStructured: jest.fn() }));
jest.mock('@/lib/writersStudio/workSituation', () => ({
  formatWorkSituationForPrompt: () => 'THE WORK ON THE TABLE (fixture)',
}));

import { runStructured } from '../../../ai/structured/router';
import { askMaia, askPromptHash, workAskPromptHash, type AskContext } from '../askReader';
import { UNMEASURED } from '../staleness';

const mockRun = runStructured as jest.MockedFunction<typeof runStructured>;

function reply(text: string) {
  return {
    ok: true as const,
    result: {
      content: [{ type: 'text', text }] as never,
      stopReason: 'end_turn',
      usage: { inputTokens: 1, outputTokens: 1 },
      provenance: { provider: 'anthropic' as const, model: 'm', latencyMs: 1 },
    },
  };
}

const PASSAGE = 'The river kept its own counsel that spring.';

function workCtx(withLocus: boolean): AskContext {
  return {
    kind: 'work',
    anchor: { on: 'work' },
    staleness: UNMEASURED,
    facts: {
      work: {} as never,
      manuscript: { id: 'ms-1', draftId: 'd-1', version: 3 },
      sections: [
        { id: 'sec-a', position: 1, heading: 'I. The Living Spiral' },
        { id: 'sec-b', position: 2, heading: 'II. Finding Our Place' },
      ],
      locus: withLocus ? { sectionId: 'sec-b', label: 'II. Finding Our Place', body: PASSAGE } : null,
      writerUnderstanding: '',
      writerCorrections: '',
      continuity: { structure: 'unmeasured', prose: 'unmeasured' },
    },
  } as AskContext;
}

async function systemFor(ctx: AskContext): Promise<string> {
  mockRun.mockReset();
  mockRun.mockResolvedValue(reply('A reply.'));
  const out = await askMaia(ctx, [], 'What is this section doing?');
  expect(out.ok).toBe(true);
  expect(mockRun).toHaveBeenCalledTimes(1);
  return String(mockRun.mock.calls[0][0].system);
}

describe('Work conversation: MAIA is told the truth about what she has', () => {
  it('never tells her a frozen reading is all she has, or that she has no prose', async () => {
    for (const withLocus of [true, false]) {
      const system = await systemFor(workCtx(withLocus));
      expect(system).not.toContain('The frozen reading below, and nothing else');
      expect(system).not.toContain('You do not have the manuscript prose');
      expect(system).not.toContain('a reading of its structure that you made earlier');
    }
  });

  it('with a passage open, gives her the passage and says she may read it', async () => {
    const system = await systemFor(workCtx(true));
    expect(system).toContain(PASSAGE);
    expect(system).toContain('You have been given the text of exactly ONE section');
  });

  it('with no passage open, says she has no section text', async () => {
    const system = await systemFor(workCtx(false));
    expect(system).not.toContain(PASSAGE);
    expect(system).toContain('You have not been given the text of ANY section.');
  });

  it('answers the writer as a reader and keeps the authorship limits', async () => {
    const system = await systemFor(workCtx(true));
    expect(system).toMatch(/answer what they asked/i);
    expect(system).toMatch(/cannot change anything/i);
    expect(system).toMatch(/I would leave this alone/);
  });

  it('records the Work instruction it used, and leaves the proposal prompt untouched', async () => {
    mockRun.mockReset();
    mockRun.mockResolvedValue(reply('A reply.'));
    const out = await askMaia(workCtx(true), [], 'Q');
    expect(out.ok && out.provenance.promptHash).toBe(workAskPromptHash());
    expect(workAskPromptHash()).not.toBe(askPromptHash());
    /* The proposal STANDING as it stood on canonical bf06329ad, before this
       change. (providerSeamMigration's older pin, 8d41b616…, already fails there.) */
    expect(askPromptHash())
      .toBe('71281b74a73e4215d4da05d3fe28c38153a64bbbaefa6766d497873ddfd44bc6');
  });
});
