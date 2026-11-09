/**
 * WS-CRAFT-CONVENTIONS-01 · rulings 2 and 8 reach the Work conversation (Develop companion and
 * Living Work), not only Passage Focus. Found in the 2026-11-09 walk: this path built its own
 * system prompt and carried neither ruling. ⛔ These prove the rules are sent and named in
 * provenance, not that MAIA follows them: that is the witness and the walk.
 */
jest.mock('../../../ai/structured/router', () => ({ runStructured: jest.fn() }));
jest.mock('@/lib/writersStudio/workSituation', () => ({
  formatWorkSituationForPrompt: () => 'THE WORK ON THE TABLE (fixture)',
}));

import fs from 'node:fs';
import path from 'node:path';
import { runStructured } from '../../../ai/structured/router';
import { askMaia, workAskPromptHash, workIntegrityRules, WORK_CONVENTION_RULES, WORK_INTEGRITY_RULES, type AskContext } from '../askReader';
import { UNMEASURED } from '../staleness';
import { CONVENTION_STANCE_DIRECTIVE, EPISTEMIC_INTEGRITY_DIRECTIVE, TEXT_ACCURACY_DIRECTIVE, WRITER_ATTENTION_DIRECTIVE } from '@/lib/writersStudio/editorialDepth';

const mockRun = runStructured as jest.MockedFunction<typeof runStructured>;

function ctx(sanctuary: boolean): AskContext {
  return {
    kind: 'work', anchor: { on: 'work' }, staleness: UNMEASURED, sanctuary,
    facts: {
      work: {} as never, manuscript: { id: 'ms-1', draftId: 'd-1', version: 1 },
      sections: [{ id: 'sec-a', position: 1, heading: 'One' }],
      locus: { sectionId: 'sec-a', label: 'One', body: 'The tide kept its own counsel.' },
      writerUnderstanding: '', writerCorrections: '', continuity: { structure: 'unmeasured', prose: 'unmeasured' },
    },
  } as AskContext;
}

async function systemFor(c: AskContext): Promise<{ system: string; promptHash: unknown }> {
  mockRun.mockReset();
  mockRun.mockResolvedValue({
    ok: true,
    result: { content: [{ type: 'text', text: 'A reply.' }] as never, stopReason: 'end_turn',
      usage: { inputTokens: 1, outputTokens: 1 }, provenance: { provider: 'anthropic', model: 'm', latencyMs: 1 } },
  } as never);
  const out = await askMaia(c, [], 'What is Marta doing here?');
  expect(out.ok).toBe(true);
  return { system: mockRun.mock.calls[0]![0].system, promptHash: out.ok ? out.provenance.promptHash : null };
}

describe('the Work conversation carries the convention rulings', () => {
  it('is exactly the two approved directives, unchanged', () => {
    expect(WORK_CONVENTION_RULES).toBe(`${CONVENTION_STANCE_DIRECTIVE} ${WRITER_ATTENTION_DIRECTIVE}`);
  });

  it.each([false, true])('reaches MAIA in a Work conversation (sanctuary=%s)', async (sanctuary) => {
    const { system } = await systemFor(ctx(sanctuary));
    expect(system).toContain(CONVENTION_STANCE_DIRECTIVE);
    expect(system).toContain(WRITER_ATTENTION_DIRECTIVE);
  });

  it('is named by the provenance hash, so a record never claims a prompt that did not run', async () => {
    const { promptHash } = await systemFor(ctx(false));
    expect(promptHash).toBe(workAskPromptHash());
    const src = fs.readFileSync(path.join(process.cwd(), 'lib/manuscript/ask/askReader.ts'), 'utf8');
    expect(src).toContain("update(`${WORK_STANDING}\\n${WORK_LEVELS_RULES}\\n${WORK_CONVENTION_RULES}\\n${WORK_INTEGRITY_RULES}${style}${teaching}`)");
  });

  it('defeat candidate: the Work prompt as it was before (no rules) fails the guard', async () => {
    const { system } = await systemFor(ctx(false));
    const before = system.replace(`${WORK_CONVENTION_RULES}`, '');
    expect(before.includes(CONVENTION_STANCE_DIRECTIVE) || before.includes(WRITER_ATTENTION_DIRECTIVE)).toBe(false);
  });
});

/** G-1 (founder: "Approve G-1", 2026-11-09): accuracy and integrity reach the Work conversation. */
describe('the Work conversation carries the accuracy and integrity rules', () => {
  const HISTORY = [
    { speaker: 'author' as const, body: 'What is this doing?' },
    { speaker: 'maia' as const, body: 'It holds the tide still.' },
  ];
  async function systemWith(history: typeof HISTORY | []): Promise<string> {
    mockRun.mockReset();
    mockRun.mockResolvedValue({
      ok: true,
      result: { content: [{ type: 'text', text: 'A reply.' }] as never, stopReason: 'end_turn',
        usage: { inputTokens: 1, outputTokens: 1 }, provenance: { provider: 'anthropic', model: 'm', latencyMs: 1 } },
    } as never);
    const out = await askMaia(ctx(false), history, 'How many words is that sentence?');
    expect(out.ok).toBe(true);
    return mockRun.mock.calls[0]![0].system;
  }

  it('uses the existing directives, unchanged', () => {
    expect(WORK_INTEGRITY_RULES).toBe(EPISTEMIC_INTEGRITY_DIRECTIVE);
    expect(workIntegrityRules(true)).toBe(EPISTEMIC_INTEGRITY_DIRECTIVE);
    expect(workIntegrityRules(false)).toBe(TEXT_ACCURACY_DIRECTIVE);
  });

  it('a first turn carries text accuracy, without talking about earlier turns (law A2)', async () => {
    const system = await systemWith([]);
    expect(system).toContain(TEXT_ACCURACY_DIRECTIVE);
    expect(system).not.toContain(EPISTEMIC_INTEGRITY_DIRECTIVE);
  });

  it('a later turn carries the whole integrity directive', async () => {
    expect(await systemWith(HISTORY)).toContain(EPISTEMIC_INTEGRITY_DIRECTIVE);
  });

  it('defeat candidate: the Work prompt as it was before G-1 fails the guard', async () => {
    const system = await systemWith([]);
    expect(system.replace(TEXT_ACCURACY_DIRECTIVE, '').includes(TEXT_ACCURACY_DIRECTIVE)).toBe(false);
  });
});

/** G-3 (founder: "whatever is best practice", 2026-11-09): the writer's working style and a Teach me reach the Work conversation. */
describe('the Work conversation takes the writer\'s working style and a Teach me', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { explanationInstruction } = require('@/lib/writersStudio/workingStyle') as typeof import('@/lib/writersStudio/workingStyle');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { teachingTurnInstruction } = require('@/lib/writersStudio/teachingTurn') as typeof import('@/lib/writersStudio/teachingTurn');

  async function run(extra: Record<string, unknown>) {
    mockRun.mockReset();
    mockRun.mockResolvedValue({
      ok: true,
      result: { content: [{ type: 'text', text: 'A reply.' }] as never, stopReason: 'end_turn',
        usage: { inputTokens: 1, outputTokens: 1 }, provenance: { provider: 'anthropic', model: 'm', latencyMs: 1 } },
    } as never);
    const out = await askMaia({ ...ctx(false), ...extra } as AskContext, [], 'Teach me about this.');
    return { system: String(mockRun.mock.calls[0]![0].system), hash: out.ok ? out.provenance.promptHash : null };
  }

  it('sends neither unless the writer chose them', async () => {
    const { system, hash } = await run({});
    expect(system).not.toContain(explanationInstruction('plain'));
    expect(system).not.toContain(teachingTurnInstruction('passage'));
    expect(hash).toBe(workAskPromptHash());
  });

  it('composes the writer\'s working style and names it in the hash', async () => {
    const { system, hash } = await run({ responseStyle: 'plain' });
    expect(system).toContain(explanationInstruction('plain'));
    expect(hash).toBe(workAskPromptHash('plain'));
    expect(hash).not.toBe(workAskPromptHash());
  });

  it('composes the teaching turn for a pressed Teach me and names it in the hash', async () => {
    const { system, hash } = await run({ teachingAnchor: 'passage' });
    expect(system).toContain(teachingTurnInstruction('passage'));
    expect(hash).toBe(workAskPromptHash(undefined, 'passage'));
  });

  it('the route forwards both into the Work conversation', () => {
    const route = fs.readFileSync(path.join(process.cwd(), 'app/api/sovereign/manuscripts/[id]/ask/route.ts'), 'utf8');
    expect(route).toContain('responseStyle, teachingAnchor });');
    expect(route).toContain('...(responseStyle ? { responseStyle } : {}),');
    expect(route).toContain('...(teachingAnchor ? { teachingAnchor } : {}) };');
  });
});
