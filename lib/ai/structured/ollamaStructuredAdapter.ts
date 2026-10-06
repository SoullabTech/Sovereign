/**
 * WS-STRUCTURED-LOCAL-01 — Ollama structured inference adapter.
 *
 * This adapter is the local peer of the governed Anthropic structured adapter.
 * It preserves the neutral structured request: pinned model, ordered roles,
 * tool contracts, token ceiling, and one completed response. It does not choose
 * a model, retry through another provider, or silently downgrade tool use.
 *
 * Ollama 0.35.x exposes tool calling through /api/chat. A required named tool is
 * enforced by exposing only that tool; "any" remains an explicit result
 * requirement and a response with no tool call is refused at this adapter
 * boundary. Required JSON-schema enforcement is validated before a result can
 * leave the adapter.
 */

import Ajv from 'ajv';
import { StructuredDispatchError } from './dispatch';
import { deriveModelAgreement } from './types';
import type {
  StructuredBlock,
  StructuredProvider,
  StructuredRequest,
  StructuredResult,
  StructuredTool,
} from './types';

const provider = 'ollama' as const;
const DEFAULT_BASE_URL = 'http://127.0.0.1:11434';
const ORDINARY_TIMEOUT_MS = 180_000;
const LONG_TIMEOUT_MS = 600_000;

type FetchLike = typeof fetch;

export interface OllamaStructuredOptions {
  baseUrl?: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}

interface OllamaToolCall {
  id?: unknown;
  function?: {
    name?: unknown;
    arguments?: unknown;
  };
}

interface OllamaChatResponse {
  model?: unknown;
  message?: {
    content?: unknown;
    tool_calls?: unknown;
  };
  done_reason?: unknown;
  prompt_eval_count?: unknown;
  eval_count?: unknown;
}

function timeoutFor(req: StructuredRequest, opts: OllamaStructuredOptions): number {
  if (opts.timeoutMs !== undefined) return opts.timeoutMs;
  const env = Number(process.env.MAIA_STRUCTURED_OLLAMA_TIMEOUT_MS || 0);
  if (Number.isFinite(env) && env > 0) return env;
  return req.execution?.completion === 'long-running' ? LONG_TIMEOUT_MS : ORDINARY_TIMEOUT_MS;
}

function selectedTools(req: StructuredRequest): StructuredTool[] | undefined {
  if (req.tools === undefined) return undefined;
  if (req.toolChoice?.type !== 'tool') return [...req.tools];
  const match = req.tools.find((tool) => tool.name === req.toolChoice!.name);
  if (!match) throw new Error(`required_tool_not_declared:${req.toolChoice.name}`);
  return [match];
}

export function toOllamaParams(req: StructuredRequest): Record<string, unknown> {
  const tools = selectedTools(req);
  const params: Record<string, unknown> = {
    model: req.model,
    stream: false,
    messages: [
      { role: 'system', content: req.system },
      ...req.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    options: { num_predict: req.maxTokens },
  };
  if (tools !== undefined) {
    params.tools = tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        ...(tool.description !== undefined ? { description: tool.description } : {}),
        parameters: tool.inputSchema,
      },
    }));
  }
  return params;
}

function normalizeArguments(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function toBlocks(body: OllamaChatResponse): StructuredBlock[] {
  const out: StructuredBlock[] = [];
  const content = body.message?.content;
  if (typeof content === 'string' && content.length > 0) {
    out.push({ type: 'text', text: content });
  }
  const calls = body.message?.tool_calls;
  if (Array.isArray(calls)) {
    for (const [index, raw] of calls.entries()) {
      const call = raw as OllamaToolCall;
      out.push({
        type: 'tool_use',
        id: typeof call.id === 'string' ? call.id : `ollama-tool-${index + 1}`,
        name: typeof call.function?.name === 'string' ? call.function.name : '',
        input: normalizeArguments(call.function?.arguments),
      });
    }
  }
  return out;
}

function enforceToolChoice(req: StructuredRequest, blocks: readonly StructuredBlock[]): void {
  if (req.toolChoice === undefined || req.toolChoice.type === 'auto') return;
  const calls = blocks.filter((b): b is Extract<StructuredBlock, { type: 'tool_use' }> => b.type === 'tool_use');
  if (req.toolChoice.type === 'any') {
    if (calls.length === 0) throw new Error('ollama_required_tool_missing');
    return;
  }
  if (calls.length === 0 || calls.some((call) => call.name !== req.toolChoice!.name)) {
    throw new Error(`ollama_required_tool_missing:${req.toolChoice.name}`);
  }
}

function enforceRequiredSchemas(req: StructuredRequest, blocks: readonly StructuredBlock[]): void {
  const required = new Map(
    (req.tools ?? [])
      .filter((tool) => tool.schemaEnforcement === 'required')
      .map((tool) => [tool.name, tool]),
  );
  if (required.size === 0) return;
  const ajv = new Ajv({ allErrors: true, schemaId: 'auto' });
  for (const block of blocks) {
    if (block.type !== 'tool_use') continue;
    const tool = required.get(block.name);
    if (!tool) continue;
    const valid = ajv.validate(tool.inputSchema, block.input);
    if (!valid) throw new Error(`ollama_tool_schema_violation:${block.name}`);
  }
}

function neutralStopReason(value: unknown): string | null {
  if (value === 'stop') return 'end_turn';
  if (value === 'length') return 'max_tokens';
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function ollamaStructuredProvider(
  opts: OllamaStructuredOptions = {},
): StructuredProvider {
  return {
    name: provider,
    async execute(req: StructuredRequest): Promise<StructuredResult> {
      let dispatched = false;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutFor(req, opts));
      try {
        const params = toOllamaParams(req);
        const fetchImpl = opts.fetchImpl ?? fetch;
        const baseUrl = (opts.baseUrl ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
        const started = Date.now();
        dispatched = true;
        const response = await fetchImpl(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify(params),
        });
        if (!response.ok) {
          throw new StructuredDispatchError(
            'response_observed',
            new Error(`ollama_status_${response.status}`),
          );
        }
        let body: OllamaChatResponse;
        try {
          body = await response.json() as OllamaChatResponse;
        } catch (err) {
          throw new StructuredDispatchError('response_observed', err);
        }
        const blocks = toBlocks(body);
        try {
          enforceToolChoice(req, blocks);
          enforceRequiredSchemas(req, blocks);
        } catch (err) {
          throw new StructuredDispatchError('response_observed', err);
        }
        const reportedModel = typeof body.model === 'string' && body.model.length > 0
          ? body.model
          : null;
        return {
          content: blocks,
          stopReason: neutralStopReason(body.done_reason),
          usage: {
            inputTokens: typeof body.prompt_eval_count === 'number' ? body.prompt_eval_count : 0,
            outputTokens: typeof body.eval_count === 'number' ? body.eval_count : 0,
          },
          provenance: {
            provider,
            model: req.model,
            reportedModel,
            modelAgreement: deriveModelAgreement(req.model, reportedModel),
            latencyMs: Date.now() - started,
          },
        };
      } catch (err) {
        if (err instanceof StructuredDispatchError) throw err;
        const isAbort = err instanceof Error && err.name === 'AbortError';
        throw new StructuredDispatchError(
          isAbort ? 'unknown' : (dispatched ? 'no_response_observed' : 'no_response_observed'),
          err,
        );
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
