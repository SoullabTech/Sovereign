/**
 * The two readers on the structured seam — proved against what they used to send.
 *
 * WHY THIS FILE EXISTS ALONGSIDE THE SEAM'S OWN EQUIVALENCE TEST.
 * `lib/ai/structured/__tests__/requestEquivalence.test.ts` proves the seam can
 * reproduce two call sites RECORDED AS LITERALS from `b9a84619`, because on
 * canonical the callers did not exist. Here they do. So this file closes the
 * remaining gap: it drives the REAL `createMaiaStructureReader` and the REAL
 * `askMaia`, captures the `StructuredRequest` each actually builds, puts it
 * through the REAL adapter translation, and asserts the resulting Anthropic
 * params equal the pre-migration call VERBATIM.
 *
 * THE RECORDED CALL SITES, at `b9a84619`, before this migration:
 *
 *   lib/manuscript/structure/maiaReader.ts:710
 *     client.messages.stream({ model, max_tokens: maxTokens, system: READER_SYSTEM,
 *       tools: readerTools(), tool_choice: { type: 'any' },
 *       messages: [{ role: 'user', content: buildRequest(input) }] })
 *     → await stream.finalMessage()
 *
 *   lib/manuscript/ask/askReader.ts:228
 *     client.messages.create({ model, max_tokens: opts.maxTokens ?? 1200,
 *       system, messages })            // NO tools key
 *
 * WHAT WOULD FAIL HERE. A changed prompt, model, token ceiling or tool schema; a
 * thread flattened into one turn; a `tools` key appearing where the asker has
 * none; a refusal rendered as an answer or as `form: 'none'`.
 *
 * NO PAID CALL IS MADE. `runStructured` is module-mocked and the adapter is
 * exercised as the pure translation it is.
 */

jest.mock('../../ai/structured/router', () => ({ runStructured: jest.fn() }));

import { runStructured } from '../../ai/structured/router';
import { toAnthropicParams } from '../../ai/structured/anthropicStructuredAdapter';
import type { StructuredRequest } from '../../ai/structured/types';
import {
  createMaiaStructureReader, readerTools, READER_SYSTEM, buildRequest,
  promptContractHash, StructureReaderError,
} from '../structure/maiaReader';
import type { ReaderInput } from '../structure/interpret';
import { askMaia, askPromptHash, type AskContext } from '../ask/askReader';
import { UNMEASURED } from '../ask/staleness';

const mockRun = runStructured as jest.MockedFunction<typeof runStructured>;
beforeEach(() => mockRun.mockReset());

/** Exactly what the caller handed the platform, before any translation. */
function captured(): StructuredRequest {
  expect(mockRun).toHaveBeenCalledTimes(1);
  return mockRun.mock.calls[0][0];
}

function ok(content: unknown[], stopReason = 'tool_use') {
  return {
    ok: true as const,
    result: {
      content: content as never,
      stopReason,
      usage: { inputTokens: 11, outputTokens: 22 },
      provenance: { provider: 'anthropic' as const, model: 'm', latencyMs: 1 },
    },
  };
}

/* ── the prompts themselves did not move ──────────────────────────────────── */

/**
 * These two hashes are the provenance of every reading and every answer already
 * made. They are pinned as literals, computed from `b9a84619` BEFORE this
 * migration and verified identical after it. A prompt edit, a tool-description
 * edit, or a rename of `input_schema` to the seam's neutral `inputSchema` would
 * each move a hash and fail here — which is the point: a provider migration that
 * quietly re-identified the reader would not be a provider migration.
 */
describe('the migration changed the provider and nothing MAIA is', () => {
  it('leaves the reader prompt contract hash exactly where it was', () => {
    expect(promptContractHash())
      .toBe('a1825a7c2f5003f172c907097e234491fa27e0e57963b2e0e4508e8b4dfb77dd');
  });

  it('leaves the ask prompt hash exactly where it was', () => {
    expect(askPromptHash())
      .toBe('8d41b6160d41fdec8b1d7b1455b7669f5369611f11aed2f6c76fbecc632a1dc7');
  });
});

/* ── maiaReader ───────────────────────────────────────────────────────────── */

const readerInput: ReaderInput = {
  pass: 1,
  evidence: {
    manuscriptId: 'ms-1',
    sectionTopologyHash: 'topo-1',
    observations: [],
    coverage: {} as never,
  } as never,
  sections: [
    { id: 'sec-a', position: 0, heading: 'CHAPTER ONE' },
    { id: 'sec-b', position: 1, heading: null },
  ],
  bodies: new Map(),
};

describe('maiaReader sends the request it sent before the seam', () => {
  async function run(opts: Parameters<typeof createMaiaStructureReader>[0] = {}) {
    mockRun.mockResolvedValue(ok([{ type: 'tool_use', id: 't1',
      name: 'request_sections', input: { sectionIds: ['sec-a'], why: 'because' } }]));
    const maia = createMaiaStructureReader(opts);
    await maia.read(readerInput);
    return toAnthropicParams(captured());
  }

  it('sends exactly the six keys the reader sent, and no seventh', async () => {
    expect(Object.keys(await run()).sort())
      .toEqual(['max_tokens', 'messages', 'model', 'system', 'tool_choice', 'tools']);
  });

  it('pins the caller\'s model, with no selection policy in between', async () => {
    expect((await run({ model: 'claude-opus-5-pinned' })).model).toBe('claude-opus-5-pinned');
  });

  it('keeps the 32k ceiling a reading of a whole Work needs', async () => {
    expect((await run()).max_tokens).toBe(32_000);
  });

  it('sends READER_SYSTEM verbatim, unreformatted', async () => {
    expect((await run()).system).toBe(READER_SYSTEM);
  });

  /* The neutral vocabulary spells it `inputSchema`; the wire spells it
     `input_schema`. This asserts the round trip lands back on the EXACT object
     `readerTools()` returns — the same object that is hashed. */
  it('reproduces the tool contract byte for byte, schemas included', async () => {
    expect((await run()).tools).toEqual(readerTools());
  });

  it('still requires that she answer THROUGH a tool', async () => {
    expect((await run()).tool_choice).toEqual({ type: 'any' });
  });

  it('sends the one built user turn, unchanged', async () => {
    expect((await run()).messages)
      .toEqual([{ role: 'user', content: buildRequest(readerInput) }]);
  });

  /* Transport is not semantics: the reader names the requirement, the adapter
     picks streaming. Losing this would reintroduce the timeout on long Works. */
  it('asks for a long-running completion rather than naming a transport', async () => {
    mockRun.mockResolvedValue(ok([{ type: 'tool_use', id: 't1',
      name: 'request_sections', input: { sectionIds: ['sec-a'], why: 'w' } }]));
    await createMaiaStructureReader().read(readerInput);
    expect(captured().execution).toEqual({ completion: 'long-running' });
  });

  it('reports usage from the neutral result, not from SDK field names', async () => {
    const turns: { inputTokens: number; outputTokens: number }[] = [];
    mockRun.mockResolvedValue(ok([{ type: 'tool_use', id: 't1',
      name: 'request_sections', input: { sectionIds: ['sec-a'], why: 'w' } }]));
    await createMaiaStructureReader({ onTurn: (t) => turns.push(t) }).read(readerInput);
    expect(turns).toEqual([{ pass: 1, tool: 'request_sections',
      inputTokens: 11, outputTokens: 22, bodiesSupplied: 0 }]);
  });
});

describe('a refused inference is a machine fault, never a reading', () => {
  /* The whole reason the seam refuses instead of falling back. If this ever
     returned `form: 'none'`, "no stable larger structure is evident" would be
     published under MAIA's name at the moment she was never asked. */
  it('throws rather than returning a reading when the platform refuses', async () => {
    mockRun.mockResolvedValue({ ok: false, refusal: 'structured_inference_unavailable',
      detail: 'mode=sovereign' });
    const maia = createMaiaStructureReader();
    await expect(maia.read(readerInput)).rejects.toBeInstanceOf(StructureReaderError);
  });

  it('names the refusal, so the fault is legible rather than generic', async () => {
    mockRun.mockResolvedValue({ ok: false, refusal: 'provider_unavailable', detail: 'boom' });
    await expect(createMaiaStructureReader().read(readerInput))
      .rejects.toThrow(/provider_unavailable/);
  });

  it('still refuses a reply that carries no tool call at all', async () => {
    mockRun.mockResolvedValue(ok([{ type: 'text', text: 'I think it is in three parts.' }], 'end_turn'));
    await expect(createMaiaStructureReader().read(readerInput))
      .rejects.toThrow(/no-tool-call/);
  });
});

/* ── askReader ────────────────────────────────────────────────────────────── */

const askCtx = {
  anchor: { on: 'section', sectionId: 'sec-a' },
  interpretation: { form: 'stable', account: 'Three movements.', units: [],
    unaccountedSectionIds: [], uncertainRegions: [], editorialSynthesis: null },
  evidence: null,
  coverage: null,
  reviewed: { units: [], revision: 1 },
  reviewRevision: 1,
  sections: [{ id: 'sec-a', position: 0, heading: 'CHAPTER ONE' }],
  staleness: UNMEASURED,
} as unknown as AskContext;

const history = [
  { speaker: 'author' as const, body: 'Why did you put 82 in Water?' },
  { speaker: 'maia' as const, body: 'Because the seam reads as a turn.' },
];

describe('askReader sends the request it sent before the seam', () => {
  async function run(opts: Parameters<typeof askMaia>[3] = {}) {
    mockRun.mockResolvedValue(ok([{ type: 'text', text: 'An answer.' }], 'end_turn'));
    await askMaia(askCtx, history, 'Could you be wrong?', opts);
    return toAnthropicParams(captured());
  }

  it('sends exactly the four keys the asker sent, and no fifth', async () => {
    expect(Object.keys(await run()).sort())
      .toEqual(['max_tokens', 'messages', 'model', 'system']);
  });

  /* Absent, not `undefined`. The capability is not present to be disabled: there
     is no tool through which a body could ever be requested. */
  it('sends NO tools key at all', async () => {
    expect('tools' in (await run())).toBe(false);
    expect(captured().tools).toBeUndefined();
  });

  it('keeps the 1200-token default, and honours an override', async () => {
    expect((await run()).max_tokens).toBe(1200);
    mockRun.mockReset();
    expect((await run({ maxTokens: 4000 })).max_tokens).toBe(4000);
  });

  /* The reason the record is persisted at all. Flattening the thread into one
     turn would turn a conversation back into a series of first questions. */
  it('preserves the thread as ordered turns with their roles intact', async () => {
    expect((await run()).messages).toEqual([
      { role: 'user', content: 'Why did you put 82 in Water?' },
      { role: 'assistant', content: 'Because the seam reads as a turn.' },
      { role: 'user', content: 'Could you be wrong?' },
    ]);
  });

  it('asks for an ordinary completion, as it always did', async () => {
    await run();
    expect(captured().execution).toBeUndefined();
  });

  it('carries the assembled standing prompt through unedited', async () => {
    const params = await run();
    expect(params.system).toBe(captured().system);
    expect(String(params.system)).toContain('--- THE READING YOU MADE ---');
  });
});

describe('a refused inference is not an answer', () => {
  it('refuses as unreachable rather than showing a refusal as MAIA speaking', async () => {
    mockRun.mockResolvedValue({ ok: false, refusal: 'structured_inference_unavailable',
      detail: 'mode=sovereign' });
    await expect(askMaia(askCtx, history, 'Could you be wrong?'))
      .resolves.toEqual({ ok: false, refusal: 'unreachable' });
  });

  it('still refuses an empty answer distinctly from an unreachable one', async () => {
    mockRun.mockResolvedValue(ok([{ type: 'text', text: '   ' }], 'end_turn'));
    await expect(askMaia(askCtx, history, 'Could you be wrong?'))
      .resolves.toEqual({ ok: false, refusal: 'empty_answer' });
  });
});
