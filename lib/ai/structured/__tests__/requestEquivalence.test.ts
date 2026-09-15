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

import { readFileSync } from 'fs';
import { join } from 'path';
import { anthropicStructuredProvider, toAnthropicParams } from '../anthropicStructuredAdapter';
import { deriveModelAgreement } from '../types';
import { readerIdentity } from '@/lib/manuscript/developmentalReader/read';
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
  execution: { completion: 'long-running' },
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

  it('honours long-running by streaming and taking the final message', async () => {
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

  /* SP-5. This used to be called "the resolved model as provenance", which is
     what let the defect survive: the value asserted is the REQUESTED model, and
     calling it resolved made a check on it look like proof that the provider had
     answered with it. */
  it('reports usage and the REQUESTED/SENT model as provenance.model', async () => {
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

  it('uses an ordinary completion when none is required', async () => {
    const { client, seen } = capturingClient();
    await anthropicStructuredProvider({ client }).execute(askRequest);
    expect(seen[0].method).toBe('create');
  });

  it('returns answer text and the requested/sent model as provenance.model', async () => {
    const { client } = capturingClient({ content: [{ type: 'text', text: 'I could be wrong.' }] });
    const r = await anthropicStructuredProvider({ client }).execute(askRequest);
    expect(r.content).toEqual([{ type: 'text', text: 'I could be wrong.' }]);
    expect(r.provenance.model).toBe('claude-opus-5');
  });
});

describe('AIN-STRUCTURED-PROVENANCE-01 · requested is not reported', () => {
  /* The three facts a provenance system must never collapse:
       REQUESTED   what we intended to invoke
       REPORTED    what the provider says answered
       AUTHORIZED  whether we invoked it through the constituted channel
     The seam owns the first two. The third is not a field here. */

  it('SP-1 ⛔ a provider answering with a DIFFERENT model is observable', async () => {
    const { client } = capturingClient({ model: 'some-other-model' });
    const r = await anthropicStructuredProvider({ client }).execute(readerRequest);
    expect(r.provenance.model).toBe('claude-opus-5');        // unchanged meaning
    expect(r.provenance.reportedModel).toBe('some-other-model');
    expect(r.provenance.modelAgreement).toBe('differs');
  });

  it('SP-1 agreement when the provider answers with the model that was asked for', async () => {
    const { client } = capturingClient({ model: 'claude-opus-5' });
    const r = await anthropicStructuredProvider({ client }).execute(readerRequest);
    expect(r.provenance.reportedModel).toBe('claude-opus-5');
    expect(r.provenance.modelAgreement).toBe('agreed');
  });

  it('SP-2 ⛔ a provider reporting no model identity stays VISIBLY unreported', async () => {
    /* Never silently equal to the request — that is the whole defect. */
    const { client } = capturingClient();
    const r = await anthropicStructuredProvider({ client }).execute(readerRequest);
    expect(r.provenance.reportedModel).toBeNull();
    expect(r.provenance.modelAgreement).toBe('unreported');
  });

  it('SP-2 an empty or non-string model is unreported, not an empty agreement', async () => {
    for (const model of ['', 42, null, undefined]) {
      const { client } = capturingClient({ model });
      const r = await anthropicStructuredProvider({ client }).execute(readerRequest);
      expect(r.provenance.reportedModel).toBeNull();
      expect(r.provenance.modelAgreement).toBe('unreported');
    }
  });

  it('SP-2 the long-running path reports identically — both mechanisms return a Message', async () => {
    const { client } = capturingClient({ model: 'some-other-model' });
    const r = await anthropicStructuredProvider({ client })
      .execute({ ...readerRequest, execution: { completion: 'long-running' } });
    expect(r.provenance.modelAgreement).toBe('differs');
  });

  it('SP-3 the DEVELOPMENT consumer still receives the requested/sent model', async () => {
    /* readerIdentity() takes provenance.model, and that identity is frozen into
       already-persisted reader provenance. Its meaning must not move. */
    const { client } = capturingClient({ model: 'some-other-model' });
    const r = await anthropicStructuredProvider({ client }).execute(readerRequest);
    expect(readerIdentity(r.provenance.model).model).toBe('claude-opus-5');
  });

  it('SP-6 agreement is derived from the two facts — no fixture may contradict it', () => {
    expect(deriveModelAgreement('a', null)).toBe('unreported');
    expect(deriveModelAgreement('a', 'a')).toBe('agreed');
    expect(deriveModelAgreement('a', 'b')).toBe('differs');
    /* Aliases are deliberately NOT normalized: deciding two identifiers mean the
       same model is its own policy question. */
    expect(deriveModelAgreement('claude-opus-5', 'claude-opus-5-20260101')).toBe('differs');
  });

  it('SP-6 the adapter does not spell the comparison itself', () => {
    const src = readFileSync(
      join(__dirname, '../anthropicStructuredAdapter.ts'), 'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, ' ');
    expect(src).toContain('deriveModelAgreement');
    expect(src).not.toMatch(/reportedModel\s*===\s*req\.model/);
    /* And reportedModel is never populated from the request — that would recreate
       the defect under a second field name. */
    expect(src).not.toMatch(/reportedModel:\s*req\.model/);
  });
});

describe('transport is the adapter\'s choice; the requirement is the caller\'s', () => {
  it('the semantic request carries no vendor transport flag', () => {
    /* `stream` was removed from StructuredRequest: it named one provider's
       mechanism, not the meaning of the inference. */
    expect('stream' in readerRequest).toBe(false);
    expect(toAnthropicParams(readerRequest).stream).toBeUndefined();
  });

  it('a long-running requirement never leaks into the wire params', () => {
    /* The requirement selects the METHOD; it is not itself sent. */
    expect(Object.keys(toAnthropicParams(readerRequest))).not.toContain('execution');
  });

  it('the two mechanisms return the identical neutral result shape', async () => {
    const body = { content: [{ type: 'text', text: 'same' }],
      stop_reason: 'end_turn', usage: { input_tokens: 3, output_tokens: 4 } };
    const a = capturingClient(body);
    const b = capturingClient(body);
    const long = await anthropicStructuredProvider({ client: a.client })
      .execute({ ...askRequest, execution: { completion: 'long-running' } });
    const ord = await anthropicStructuredProvider({ client: b.client }).execute(askRequest);
    expect(a.seen[0].method).toBe('stream');
    expect(b.seen[0].method).toBe('create');
    expect({ ...long, provenance: { ...long.provenance, latencyMs: 0 } })
      .toEqual({ ...ord, provenance: { ...ord.provenance, latencyMs: 0 } });
  });
});
