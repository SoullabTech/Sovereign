import Ajv from 'ajv';
import { deriveModelAgreement } from './types';
import type { ProviderName } from '../types';
import type {
  StructuredBlock, StructuredProvider, StructuredRequest, StructuredResult, StructuredTool,
} from './types';

const provider: ProviderName = 'ollama';
const DEFAULT_BASE = 'http://127.0.0.1:11434';

type OllamaToolCall = {
  function?: { name?: unknown; arguments?: unknown };
};

type OllamaResponse = {
  model?: unknown;
  done_reason?: unknown;
  prompt_eval_count?: unknown;
  eval_count?: unknown;
  message?: {
    content?: unknown;
    tool_calls?: OllamaToolCall[];
  };
};

function ollamaTools(tools: readonly StructuredTool[]) {
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      ...(tool.description !== undefined ? { description: tool.description } : {}),
      parameters: tool.inputSchema,
    },
  }));
}

function constrainedTools(req: StructuredRequest): readonly StructuredTool[] | null {
  if (!req.tools?.length || !req.toolChoice) return null;
  if (req.toolChoice.type === 'tool') {
    const tool = req.tools.find((candidate) => candidate.name === req.toolChoice!.name);
    if (!tool) throw new Error(`local_structured_forced_tool_missing:${req.toolChoice.name}`);
    return [tool];
  }
  if (req.toolChoice.type === 'any') return req.tools;
  return null;
}

function toolEnvelopeSchema(tools: readonly StructuredTool[]): Record<string, unknown> {
  const branches = tools.map((tool) => ({
    type: 'object',
    additionalProperties: false,
    required: ['name', 'input'],
    properties: {
      name: { type: 'string', const: tool.name },
      input: tool.inputSchema,
    },
  }));
  return branches.length === 1 ? branches[0]! : { oneOf: branches };
}

function toolEnvelopeInstruction(tools: readonly StructuredTool[]): string {
  return [
    'LOCAL STRUCTURED TRANSPORT:',
    'Return exactly one JSON object matching the response schema.',
    'The object represents one tool invocation with fields "name" and "input".',
    'Do not return prose outside that JSON object.',
    ...tools.map((tool) => `Tool ${tool.name}: ${tool.description ?? 'Use the supplied JSON Schema exactly.'}`),
  ].join('\n');
}

function parseArguments(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  try { return JSON.parse(raw); } catch { return raw; }
}

function validateToolInput(tool: StructuredTool, input: unknown): void {
  const ajv = new Ajv({ allErrors: true, jsonPointers: true });
  const validate = ajv.compile(tool.inputSchema);
  if (!validate(input)) {
    throw new Error(`local_structured_schema_invalid:${ajv.errorsText(validate.errors)}`);
  }
}

export interface LocalStructuredOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export function localStructuredProvider(
  opts: LocalStructuredOptions = {},
): StructuredProvider {
  return {
    name: provider,
    async execute(req: StructuredRequest): Promise<StructuredResult> {
      const fetchImpl = opts.fetchImpl ?? fetch;
      const baseUrl = opts.baseUrl ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE;
      const constrained = constrainedTools(req);
      const system = constrained
        ? `${req.system}\n\n${toolEnvelopeInstruction(constrained)}`
        : req.system;
      const messages = [
        { role: 'system', content: system },
        ...req.messages.map((m) => ({ role: m.role, content: m.content })),
      ];
      const body: Record<string, unknown> = {
        model: req.model,
        stream: false,
        messages,
        options: { temperature: 0 },
      };
      if (constrained) {
        body.format = toolEnvelopeSchema(constrained);
      } else if (req.tools !== undefined) {
        body.tools = ollamaTools(req.tools);
      }

      const t0 = Date.now();
      const response = await fetchImpl(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(
          req.execution?.completion === 'long-running' ? 300_000 : 120_000,
        ),
      });
      if (!response.ok) {
        throw new Error(`ollama_http_${response.status}`);
      }
      const data = await response.json() as OllamaResponse;
      const blocks: StructuredBlock[] = [];
      let toolCalls = Array.isArray(data.message?.tool_calls) ? data.message!.tool_calls! : [];

      if (constrained && toolCalls.length === 0) {
        const raw = typeof data.message?.content === 'string' ? data.message.content.trim() : '';
        let envelope: unknown;
        try {
          envelope = JSON.parse(raw);
        } catch {
          throw new Error('local_structured_tool_envelope_invalid_json');
        }
        const schema = toolEnvelopeSchema(constrained);
        const ajv = new Ajv({ allErrors: true, jsonPointers: true });
        const validate = ajv.compile(schema);
        if (!validate(envelope)) {
          throw new Error(`local_structured_tool_envelope_invalid:${ajv.errorsText(validate.errors)}`);
        }
        const shaped = envelope as { name?: unknown; input?: unknown };
        toolCalls = [{
          function: {
            name: shaped.name,
            arguments: shaped.input,
          },
        }];
      }

      if (req.toolChoice?.type === 'tool') {
        if (toolCalls.length !== 1) {
          throw new Error(`local_structured_forced_tool_count:${toolCalls.length}`);
        }
        const call = toolCalls[0]!;
        const name = typeof call.function?.name === 'string' ? call.function.name : '';
        if (name !== req.toolChoice.name) {
          throw new Error(`local_structured_wrong_tool:${name || 'missing'}`);
        }
      }

      for (let index = 0; index < toolCalls.length; index += 1) {
        const call = toolCalls[index]!;
        const name = typeof call.function?.name === 'string' ? call.function.name : '';
        const tool = req.tools?.find((candidate) => candidate.name === name);
        if (!tool) throw new Error(`local_structured_unapproved_tool:${name || 'missing'}`);
        const input = parseArguments(call.function?.arguments);
        validateToolInput(tool, input);
        blocks.push({
          type: 'tool_use',
          id: `ollama-tool-${index + 1}`,
          name,
          input,
        });
      }

      const text = typeof data.message?.content === 'string' ? data.message.content.trim() : '';
      if (text && toolCalls.length === 0) blocks.push({ type: 'text', text });

      if (req.toolChoice?.type === 'any' && toolCalls.length === 0) {
        throw new Error('local_structured_tool_required');
      }

      const reportedModel = typeof data.model === 'string' && data.model.length > 0
        ? data.model
        : null;
      return {
        content: blocks,
        stopReason: typeof data.done_reason === 'string' ? data.done_reason : null,
        usage: {
          inputTokens: typeof data.prompt_eval_count === 'number' ? data.prompt_eval_count : 0,
          outputTokens: typeof data.eval_count === 'number' ? data.eval_count : 0,
        },
        provenance: {
          provider,
          model: req.model,
          reportedModel,
          modelAgreement: deriveModelAgreement(req.model, reportedModel),
          latencyMs: Date.now() - t0,
        },
      };
    },
  };
}
