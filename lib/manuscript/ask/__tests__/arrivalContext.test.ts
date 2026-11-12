/**
 * JARVIS-WRITERS-STUDIO-INSPIRATION-OPENING-01 · F8 — one mind.
 * The opening reflection runs through askMaia itself, with an opt-in `arrival` kind. The arrival frame must never
 * leak into a Work or proposal conversation, and a Work frame must never be used for the door.
 */
jest.mock('../../../ai/structured/router', () => ({ runStructured: jest.fn() }));
jest.mock('@/lib/writersStudio/workSituation', () => ({
  formatWorkSituationForPrompt: () => undefined,
}));
import { runStructured } from '../../../ai/structured/router';
import { askMaia, ARRIVAL_STANDING, arrivalAskPromptHash } from '../askReader';

const mockRun = runStructured as jest.MockedFunction<typeof runStructured>;

beforeEach(() => {
  mockRun.mockReset();
  mockRun.mockResolvedValue({
    ok: true,
    result: { content: [{ type: 'text', text: 'I hear a garden. Am I hearing that right?' }], stopReason: 'end_turn' },
  } as never);
});

it('answers the door through askMaia with the arrival frame and no tools', async () => {
  const out = await askMaia({ kind: 'arrival', sanctuary: false }, [], 'a garden');
  expect(out.ok).toBe(true);
  const req = mockRun.mock.calls[0][0] as { system: string; tools?: unknown; messages: { role: string; content: string }[] };
  expect(req.system).toContain(ARRIVAL_STANDING);
  expect(req.system).not.toContain('talking with the author of this Work about the Work itself');
  expect(req.tools).toBeUndefined();
  expect(req.messages).toEqual([{ role: 'user', content: 'a garden' }]);
  if (out.ok) expect(out.provenance.promptHash).toBe(arrivalAskPromptHash(false));
});

it('the arrival frame forbids defining, categorizing, outlining, grading and claiming the writer’s real purpose', () => {
  for (const phrase of ['Do not define', 'genre', 'outline', 'title', 'grade', 'real purpose', 'I don’t know yet', 'saved']) {
    expect(ARRIVAL_STANDING).toContain(phrase);
  }
});

it('a later turn in the opening is grounded in the history and gets a different hash than a first turn', async () => {
  await askMaia({ kind: 'arrival', sanctuary: false }, [{ speaker: 'author', body: 'a garden' }, { speaker: 'maia', body: 'I hear a garden.' }], 'and her hands');
  const req = mockRun.mock.calls[0][0] as { messages: { role: string }[] };
  expect(req.messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user']);
  expect(arrivalAskPromptHash(true)).not.toBe(arrivalAskPromptHash(false));
});

it('the arrival frame never reaches a Work conversation', async () => {
  await askMaia({
    kind: 'work', workId: 'w', title: 'T', facts: [], sectionHeadings: [], corrections: [], passage: null,
    staleness: { stale: false }, sanctuary: false,
  } as never, [], 'q').catch(() => undefined);
  const call = mockRun.mock.calls[0]?.[0] as { system: string } | undefined;
  if (call) expect(call.system).not.toContain(ARRIVAL_STANDING);
});
