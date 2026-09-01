/**
 * AIN-STRUCTURED-INFERENCE-SEAM-01 — the Anthropic structured adapter.
 *
 * THE ONLY FILE IN THIS SEAM THAT MAY IMPORT `@anthropic-ai/sdk`, and the reason
 * the seam exists: so cognitive surfaces stop importing it one at a time. It is
 * listed under `approved` in the allowlist, which is the category the guard
 * reserves for "SovereignRouter-backed adapters".
 *
 * IT TRANSLATES; IT DOES NOT DECIDE. No model policy, no retry, no fallback, no
 * defaulting of anything the caller pinned. Every judgement lives in the router
 * or in the caller, and this file is the narrow place where a neutral request
 * becomes one vendor's wire format.
 *
 * ABSENT KEYS STAY ABSENT. `tools` and `tool_choice` are omitted entirely rather
 * than sent as `undefined`, because a request that carries a tools key is not
 * the same request as one that does not — and one of the two callers this seam
 * serves is defined by having no tool capability at all.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ProviderName } from '../types';
import type {
  StructuredBlock, StructuredProvider, StructuredRequest, StructuredResult,
} from './types';

/** Exported for the equivalence tests: the exact params that go up the wire. */
export function toAnthropicParams(
  req: StructuredRequest,
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    model: req.model,
    max_tokens: req.maxTokens,
    system: req.system,
    messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
  };
  if (req.tools !== undefined) {
    params.tools = req.tools.map((t) => ({
      name: t.name,
      ...(t.description !== undefined ? { description: t.description } : {}),
      input_schema: t.inputSchema,
    }));
  }
  if (req.toolChoice !== undefined) {
    params.tool_choice = req.toolChoice.type === 'tool'
      ? { type: 'tool', name: req.toolChoice.name }
      : { type: req.toolChoice.type };
  }
  return params;
}

function toBlocks(content: readonly unknown[]): StructuredBlock[] {
  const out: StructuredBlock[] = [];
  for (const b of content) {
    const block = b as { type?: string; text?: string; id?: string; name?: string; input?: unknown };
    if (block.type === 'text' && typeof block.text === 'string') {
      out.push({ type: 'text', text: block.text });
    } else if (block.type === 'tool_use') {
      /* PASSED THROUGH WHOLE, unvalidated. Whether the call is well-formed is
         the caller's contract to judge; an adapter that filtered malformed calls
         would be answering a question it was not asked and hiding the evidence
         the caller needs to refuse. */
      out.push({
        type: 'tool_use',
        id: String(block.id ?? ''),
        name: String(block.name ?? ''),
        input: block.input,
      });
    }
    /* Any other block type is dropped rather than guessed at. */
  }
  return out;
}

export interface AnthropicStructuredOptions {
  /** Injected in tests. Never constructed lazily behind the caller's back. */
  client?: Anthropic;
}

export function anthropicStructuredProvider(
  opts: AnthropicStructuredOptions = {},
): StructuredProvider {
  const provider: ProviderName = 'anthropic';
  return {
    name: provider,
    async execute(req: StructuredRequest): Promise<StructuredResult> {
      const client = opts.client ?? new Anthropic();
      const params = toAnthropicParams(req);
      const t0 = Date.now();

      /* STREAMING IS PART OF THE REQUEST'S MEANING, not a transport detail this
         adapter may choose: for a long reading it is the difference between an
         answer and a timeout. Consumed whole either way. */
      const message = req.stream
        ? await (client.messages.stream(params as never)).finalMessage()
        : await client.messages.create(params as never) as Anthropic.Message;

      return {
        content: toBlocks(message.content as readonly unknown[]),
        stopReason: (message.stop_reason as string | null) ?? null,
        usage: {
          inputTokens: message.usage?.input_tokens ?? 0,
          outputTokens: message.usage?.output_tokens ?? 0,
        },
        provenance: {
          provider,
          /* THE MODEL ACTUALLY SENT. Reported from the request that went up the
             wire, so provenance can never drift from what was asked for. */
          model: req.model,
          latencyMs: Date.now() - t0,
        },
      };
    },
  };
}
