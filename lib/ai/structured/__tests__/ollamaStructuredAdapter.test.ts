import { StructuredDispatchError } from '../dispatch';
import { ollamaStructuredProvider, toOllamaParams } from '../ollamaStructuredAdapter';
import type { StructuredRequest } from '../types';

const req: StructuredRequest = {
  model: 'qwen3-coder:30b',
  system: 'SYSTEM',
  messages: [
    { role: 'user', content: 'first' },
    { role: 'assistant', content: 'second' },
    { role: 'user', content: 'third' },
  ],
  maxTokens: 8000,
  tools: [{
    name: 'return_attention_map',
    description: 'Return the map',
    inputSchema: {
      type: 'object',
      required: ['version'],
      additionalProperties: false,
      properties: { version: { type: 'string' } },
    },
  }],
  toolChoice: { type: 'tool', name: 'return_attention_map' },
  execution: { completion: 'long-running' },
};

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('Ollama structured adapter', () => {
  it('preserves the pinned model, ordered roles, tools and token ceiling', () => {
    const params = toOllamaParams(req);
    expect(params.model).toBe('qwen3-coder:30b');
    expect(params.stream).toBe(false);
    expect(params.messages).toEqual([
      { role: 'system', content: 'SYSTEM' },
      { role: 'user', content: 'first' },
      { role: 'assistant', content: 'second' },
      { role: 'user', content: 'third' },
    ]);
    expect(params.options).toEqual({ num_predict: 8000 });
    expect(params.tools).toEqual([{
      type: 'function',
      function: {
        name: 'return_attention_map',
        description: 'Return the map',
        parameters: req.tools![0]!.inputSchema,
      },
    }]);
  });

  it('returns Ollama tool calls as neutral tool_use blocks with exact provenance', async () => {
    const seen: unknown[] = [];
    const fetchImpl = (async (_url: string | URL | Request, init?: RequestInit) => {
      seen.push(JSON.parse(String(init?.body ?? '{}')));
      return response({
        model: 'qwen3-coder:30b',
        message: {
          role: 'assistant',
          content: '',
          tool_calls: [{
            id: 'call_1',
            function: {
              name: 'return_attention_map',
              arguments: { version: 'v1' },
            },
          }],
        },
        done: true,
        done_reason: 'stop',
        prompt_eval_count: 111,
        eval_count: 22,
      });
    }) as typeof fetch;

    const result = await ollamaStructuredProvider({ fetchImpl, timeoutMs: 2000 }).execute(req);
    expect(seen).toHaveLength(1);
    expect(result.content).toEqual([{
      type: 'tool_use',
      id: 'call_1',
      name: 'return_attention_map',
      input: { version: 'v1' },
    }]);
    expect(result.stopReason).toBe('end_turn');
    expect(result.usage).toEqual({ inputTokens: 111, outputTokens: 22 });
    expect(result.provenance.provider).toBe('ollama');
    expect(result.provenance.model).toBe('qwen3-coder:30b');
    expect(result.provenance.reportedModel).toBe('qwen3-coder:30b');
    expect(result.provenance.modelAgreement).toBe('agreed');
  });

  it('refuses a response that ignores a required tool', async () => {
    const fetchImpl = (async () => response({
      model: 'qwen3-coder:30b',
      message: { role: 'assistant', content: 'plain prose' },
      done: true,
      done_reason: 'stop',
    })) as typeof fetch;

    await expect(
      ollamaStructuredProvider({ fetchImpl, timeoutMs: 2000 }).execute(req),
    ).rejects.toMatchObject({
      name: 'StructuredDispatchError',
      dispatch: 'response_observed',
      message: 'ollama_required_tool_missing:return_attention_map',
    } satisfies Partial<StructuredDispatchError>);
  });

  it('enforces a schema marked required before returning the tool call', async () => {
    const strictReq: StructuredRequest = {
      ...req,
      tools: [{
        ...req.tools![0]!,
        schemaEnforcement: 'required',
      }],
    };
    const fetchImpl = (async () => response({
      model: 'qwen3-coder:30b',
      message: {
        role: 'assistant',
        content: '',
        tool_calls: [{
          function: { name: 'return_attention_map', arguments: { wrong: true } },
        }],
      },
      done_reason: 'stop',
    })) as typeof fetch;

    await expect(
      ollamaStructuredProvider({ fetchImpl, timeoutMs: 2000 }).execute(strictReq),
    ).rejects.toMatchObject({
      dispatch: 'response_observed',
      message: 'ollama_tool_schema_violation:return_attention_map',
    });
  });

  it('records a provider HTTP response as response_observed', async () => {
    const fetchImpl = (async () => response({ error: 'missing model' }, 404)) as typeof fetch;
    await expect(
      ollamaStructuredProvider({ fetchImpl, timeoutMs: 2000 }).execute(req),
    ).rejects.toMatchObject({
      dispatch: 'response_observed',
      message: 'ollama_status_404',
    });
  });
});
