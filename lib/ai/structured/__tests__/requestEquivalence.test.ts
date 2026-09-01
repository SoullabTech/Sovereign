/**
 * AIN-STRUCTURED-INFERENCE-SEAM-01 — the seam preserves the two callers' requests.
 *
 * WHY RECORDED SHAPES AND NOT IMPORTS. Neither caller exists on canonical:
 * `maiaReader` and `askReader` live on the Writer's Studio lane, and this seam is
 * deliberately built on canonical so it is not entangled in that feature's
 * history. So their call sites are recorded here VERBATIM from the witnessed
 * branch, with the SHA named, and the seam is proved to reproduce them exactly.
 *
 * Recorded from `b9a84619`:
 *
 *   lib/manuscript/structure/maiaReader.ts:710
 *     client.messages.stream({
 *       model,
 *       max_tokens: maxTokens,
 *       system: READER_SYSTEM,
 *       tools: readerTools(),
 *       tool_choice: { type: 'any' },
 *       messages: [{ role: 'user', content: buildRequest(input) }],
 *     })
 *     → const message = await stream.finalMessage()
 *     → message.content.find(b => b.type === 'tool_use')
 *
 *   lib/manuscript/ask/askReader.ts:228
 *     client.messages.create({
 *       model,
 *       max_tokens: opts.maxTokens ?? 1200,
 *       system,
 *       messages,          // ordered author/MAIA history, roles preserved
 *     })                   // NO tools key
 *
 * NO PAID READING IS RUN. Every provider call here is a capturing stub.
 */

import { anthropicStructuredProvider, toAnthropicParams } from '../anthropicStructuredAdapter';
import { runStructured } from '../router';
import type { StructuredRequest } from '../types';

/** Captures exactly what the adapter would send, and by which method. */
function capturingClient(reply: Record<string, unknown> = {}) {
  const seen: { method: 'stream' | 'create'; params: Record<string, unknown> }[] = [];
  const message = {
    content: [], stop_reason: 'end_turn', usage: { input_tokens: 1, output_tokens: 2 },
    ...reply,
  };
  return {
    seen,
    client: {
      messages: {
        create: async (params: Record<string, unknown>) => {
          seen.push({ method: 'create', params }); return message;
        },
        stream: (params: Record<string, unknown>) => {
          seen.push({ method: 'stream', params });
          return { finalMessage: async () => message };
        },
      },
    } as never,
  };
}

/* ── the recorded reader request, expressed in the neutral vocabulary ─────── */
const READER_TOOLS = [{
  name: 'propose_structure',
  description: 'Return a reading of the Work.',
  inputSchema: { type: 'object', properties: { form: { type: 'string' } }, required: ['form'] },
}, {
  name: 'request_sections',
  description: 'Ask for section bodies.',
  inputSchema: { type: 'object', properties: { sectionIds: { type: 'array' } }, required: ['sectionIds'] },
}];

const readerRequest: StructuredRequest = {
  model: 'claude-opus-5',
  system: 'READER_SYSTEM',
  messages: [{ role: 'user', content: 'BUILT REQUEST' }],
  maxTokens: 32_000,
  tools: READER_TOOLS,
  toolChoice: { type: 'any' },
  stream: true,
};

const askRequest: StructuredRequest = {
  model: 'claude-opus-5',
  system: 'ASK STANDING PROMPT',
  messages: [
    { role: 'user', content: 'Why did you put 82 in Water?' },
    { role: 'assistant', content: 'Because the seam reads as a turn.' },
    { role: 'user', content: 'Could you be wrong?' },
  ],
  maxTokens: 1200,
};

describe('maiaReader request equivalence', () => {
  const params = toAnthropicParams(readerRequest);

  it('sends exactly the keys the reader sends today', () => {
    expect(Object.keys(params).sort())
      .toEqual(['max_tokens', 'messages', 'model', 'system', 'tool_choice', 'tools']);
  });

  it('pins the model the caller pinned, with no selection policy', () => {
    expect(params.model).toBe('claude-opus-5');
  });

  it('preserves the exact max token value', () => {
    expect(params.max_tokens).toBe(32_000);
  });

  it('preserves the exact system prompt', () => {
    expect(params.system).toBe('READER_SYSTEM');
  });

  it('preserves the tool contract verbatim, schema included', () => {
    expect(params.tools).toEqual([
      { name: 'propose_structure', description: 'Return a reading of the Work.',
        input_schema: READER_TOOLS[0].inputSchema },
      { name: 'request_sections', description: 'Ask for section bodies.',
        input_schema: READER_TOOLS[1].inputSchema },
    ]);
  });

  it('preserves tool_choice: any — she must answer through a tool', () => {
    expect(params.tool_choice).toEqual({ type: 'any' });
  });

  it('preserves the single user message', () => {
    expect(params.messages).toEqual([{ role: 'user', content: 'BUILT REQUEST' }]);
  });

  it('streams and consumes the whole message, as the reader does', async () => {
    const { client, seen } = capturingClient();
    await anthropicStructuredProvider({ client }).execute(readerRequest);
    expect(seen).toHaveLength(1);
    expect(seen[0].method).toBe('stream');
  });

  it('leaves the tool_use block available to the reader\'s existing parser', async () => {
    const { client } = capturingClient({
      content: [{ type: 'tool_use', id: 'tu_1', name: 'propose_structure', input: { form: 'stable' } }],
    });
    const r = await anthropicStructuredProvider({ client }).execute(readerRequest);
    expect(r.content).toEqual([
      { type: 'tool_use', id: 'tu_1', name: 'propose_structure', input: { form: 'stable' } },
    ]);
  });

  it('keeps a MISSING tool call detectable — never coerced into a reading', async () => {
    const { client } = capturingClient({ content: [{ type: 'text', text: 'I think it is Fire.' }] });
    const r = await anthropicStructuredProvider({ client }).execute(readerRequest);
    expect(r.content.some((b) => b.type === 'tool_use')).toBe(false);
    expect(r.stopReason).toBe('end_turn');
  });

  it('reports usage and the resolved model as provenance', async () => {
    const { client } = capturingClient();
    const r = await anthropicStructuredProvider({ client }).execute(readerRequest);
    expect(r.usage).toEqual({ inputTokens: 1, outputTokens: 2 });
    expect(r.provenance.model).toBe('claude-opus-5');
    expect(r.provenance.provider).toBe('anthropic');
  });
});

describe('Ask MAIA request equivalence', () => {
  const params = toAnthropicParams(askRequest);

  it('sends exactly the keys Ask sends today — and no tools key', () => {
    expect(Object.keys(params).sort()).toEqual(['max_tokens', 'messages', 'model', 'system']);
    expect('tools' in params).toBe(false);
    expect('tool_choice' in params).toBe(false);
  });

  it('preserves ordered multi-turn roles and content, unflattened', () => {
    expect(params.messages).toEqual([
      { role: 'user', content: 'Why did you put 82 in Water?' },
      { role: 'assistant', content: 'Because the seam reads as a turn.' },
      { role: 'user', content: 'Could you be wrong?' },
    ]);
  });

  it('pins the model and the exact max token value', () => {
    expect(params.model).toBe('claude-opus-5');
    expect(params.max_tokens).toBe(1200);
  });

  it('does not stream, as Ask does not', async () => {
    const { client, seen } = capturingClient();
    await anthropicStructuredProvider({ client }).execute(askRequest);
    expect(seen[0].method).toBe('create');
  });

  it('returns answer text and resolved-model provenance', async () => {
    const { client } = capturingClient({ content: [{ type: 'text', text: 'I could be wrong.' }] });
    const r = await anthropicStructuredProvider({ client }).execute(askRequest);
    expect(r.content).toEqual([{ type: 'text', text: 'I could be wrong.' }]);
    expect(r.provenance.model).toBe('claude-opus-5');
  });
});

describe('the ruling: structured inference is non-fallbackable', () => {
  const failing = { name: 'anthropic' as const,
    execute: async () => { throw new Error('529 overloaded'); } };

  it('a provider failure REFUSES and calls nothing else', async () => {
    const r = await runStructured(readerRequest, 'primary', failing);
    expect(r).toEqual({ ok: false, refusal: 'provider_unavailable', detail: '529 overloaded' });
  });

  it('refuses rather than returning a degraded or templated answer', async () => {
    const r = await runStructured(askRequest, 'primary', failing);
    expect(r.ok).toBe(false);
    expect('result' in r).toBe(false);
  });

  it.each(['sovereign', 'local_only'] as const)(
    'refuses in %s while no local structured provider exists', async (mode) => {
      /* A provider IS supplied, to prove the mode refuses before reaching it —
         the mode is honoured, not merely unserved. */
      const spy = { name: 'anthropic' as const, execute: jest.fn() };
      const r = await runStructured(readerRequest, mode, spy);
      expect(r).toEqual({
        ok: false,
        refusal: 'structured_inference_unavailable',
        detail: `mode=${mode}: no local provider can honour a structured contract`,
      });
      expect(spy.execute).not.toHaveBeenCalled();
    });

  it('succeeds in primary and returns the exact structured result', async () => {
    const { client } = capturingClient({
      content: [{ type: 'tool_use', id: 't', name: 'propose_structure', input: { form: 'flat' } }],
    });
    const r = await runStructured(readerRequest, 'primary', anthropicStructuredProvider({ client }));
    expect(r.ok).toBe(true);
    expect(r.ok && r.result.content[0]).toEqual(
      { type: 'tool_use', id: 't', name: 'propose_structure', input: { form: 'flat' } });
  });
});
