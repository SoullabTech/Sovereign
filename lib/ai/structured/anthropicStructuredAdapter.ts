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
import { StructuredDispatchError, type DispatchObservation } from './dispatch';

/**
 * ⭐ CLASSIFY WHAT THE WIRE DID — the one judgement this file is permitted, and
 * only because it is the only file that can see the vendor's error classes.
 *
 * ⛔ It classifies DELIVERY, not meaning. A 400 and a 200 are both
 * `response_observed`: the question is whether the request arrived, never
 * whether the answer was good.
 *
 * ⛔ ORDER IS LOAD-BEARING. `APIConnectionTimeoutError` extends
 * `APIConnectionError`, so it must be tested first — otherwise every timeout
 * would be misreported as "nothing arrived", which is precisely the lie the
 * third value exists to prevent.
 */
function classifyDispatch(err: unknown): DispatchObservation {
  try {
    /* A timeout is undetermined: the request may have arrived and the response
       been lost. ⛔ Never `no_response_observed`. */
    if (err instanceof Anthropic.APIConnectionTimeoutError) return 'unknown';
    /* ⭐ The server answered. That it answered with an error changes nothing
       about arrival — which is the only thing being asked here. */
    if (err instanceof Anthropic.APIError && typeof (err as { status?: unknown }).status === 'number') {
      return 'response_observed';
    }
    /* Connection refused, DNS failure, TLS failure — no response came back.
       The unconstructable-client case lands here too: it throws before
       `toAnthropicParams` has even built a body. */
    if (err instanceof Anthropic.APIConnectionError) return 'no_response_observed';
    return 'unknown';
  } catch {
    /* ⛔ If the SDK's shape is not what we expect, the honest answer is that we
       do not know. Classification must never be the thing that throws. */
    return 'unknown';
  }
}
import { deriveModelAgreement } from './types';
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
      ...(t.schemaEnforcement === 'required' ? { strict: true } : {}),
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
      /* ⭐ THE WHOLE BODY IS WRAPPED, deliberately. The client constructor is
         inside: a missing key throws there, BEFORE `toAnthropicParams` builds a
         body, so nothing left the process — and that is a fact the receipt is
         entitled to. ⛔ Wrapping only the network call would lose it. */
      try {
        return await executeOnce(opts, req);
      } catch (err) {
        /* ⛔ RE-THROWN, NOT SWALLOWED. The router still decides what a failure
           means; this adds one fact and changes no control flow. */
        throw new StructuredDispatchError(classifyDispatch(err), err);
      }
    },
  };
}

async function executeOnce(
  opts: AnthropicStructuredOptions, req: StructuredRequest,
): Promise<StructuredResult> {
      const client = opts.client ?? new Anthropic();
      const params = toAnthropicParams(req);
      const t0 = Date.now();

      /* THE REQUIREMENT IS NEUTRAL; THE MECHANISM IS THIS ADAPTER'S CHOICE.
         The caller asks that a long completion not be cut off. For Anthropic
         today that means streaming and taking the final message — a different
         provider may honour the same requirement by long-polling a job or by
         simply not having the timeout. Consumed whole either way, so the
         neutral result is identical. */
      const message = req.execution?.completion === 'long-running'
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
          /* THE MODEL REQUESTED AND SENT. Taken from the request that went up the
             wire, so this fact can never drift from what was asked for — and it
             is deliberately NOT the answer to "what actually replied". */
          model: req.model,
          /* WHAT THE PROVIDER SAYS ANSWERED — read from the RESPONSE, from the
             same message object already read for content, stop_reason and usage.
             No second request, no retry.

             ⛔ Never `req.model`. Populating this from the request would recreate
             the original defect under a second field name, and the check built on
             it would again reduce to `requested === requested`. */
          reportedModel: typeof message.model === 'string' && message.model.length > 0
            ? message.model
            : null,
          modelAgreement: deriveModelAgreement(
            req.model,
            typeof message.model === 'string' && message.model.length > 0 ? message.model : null,
          ),
          latencyMs: Date.now() - t0,
        },
      };
}
