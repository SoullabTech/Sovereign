import { createHash } from 'node:crypto';
import type { InterpretivePlan } from '../../../scripts/research/structural-standing/interpretive-basis-envelope';
import type { RelationalFieldPacket, StructuredShadowGeneration } from './types';
import { buildRelationalFieldPlanSchema, buildRelationalFieldShadowPrompt } from './prompt';

const DEFAULT_TIMEOUT_MS = 12_000;

export function deterministicShadowSeed(exchangeId: string, modelName: string, architectureVersion: string): number {
  const hex = createHash('sha256').update(`${exchangeId}|${modelName}|${architectureVersion}`).digest('hex').slice(0, 8);
  return Number.parseInt(hex, 16) & 0x7fffffff;
}

function validatePlan(value: unknown): InterpretivePlan {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid_plan_shape');
  const top = value as Record<string, unknown>;
  if (Object.keys(top).some((k) => !['synthesis', 'question'].includes(k))) throw new Error('invalid_plan_field');
  if (!Array.isArray(top.synthesis) || top.synthesis.length !== 1 || typeof top.question !== 'string') {
    throw new Error('invalid_plan_shape');
  }
  const item = top.synthesis[0];
  if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('invalid_synthesis_shape');
  const synth = item as Record<string, unknown>;
  if (Object.keys(synth).some((k) => !['text', 'basisEvidenceIds'].includes(k))) throw new Error('invalid_synthesis_field');
  if (typeof synth.text !== 'string' || !Array.isArray(synth.basisEvidenceIds) || synth.basisEvidenceIds.length === 0 || synth.basisEvidenceIds.some((id) => typeof id !== 'string')) {
    throw new Error('invalid_synthesis_shape');
  }
  return value as InterpretivePlan;
}

export async function generateRelationalFieldPlan(input: {
  readonly packet: RelationalFieldPacket;
  readonly modelName: string;
  readonly exchangeId: string;
  readonly architectureVersion: string;
  readonly baseUrl?: string;
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
}): Promise<StructuredShadowGeneration> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const baseUrl = input.baseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
  const timeoutMs = input.timeoutMs ?? Number(process.env.MAIA_RELATIONAL_FIELD_SHADOW_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const seed = deterministicShadowSeed(input.exchangeId, input.modelName, input.architectureVersion);
  const prompt = buildRelationalFieldShadowPrompt(input.packet);
  const promptSha256 = createHash('sha256').update(prompt).digest('hex');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const response = await fetchImpl(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: input.modelName,
        prompt,
        stream: false,
        format: buildRelationalFieldPlanSchema(input.packet),
        options: { temperature: 0.2, seed },
      }),
    });
    if (!response.ok) throw new Error(`ollama_status_${response.status}`);
    const body = await response.json() as { response?: string };
    if (typeof body.response !== 'string' || !body.response.trim()) throw new Error('ollama_empty_response');
    const rawText = body.response;
    let parsed: unknown;
    try { parsed = JSON.parse(rawText); } catch { throw new Error('invalid_plan_json'); }
    return {
      modelName: input.modelName,
      seed,
      rawText,
      rawPlan: validatePlan(parsed),
      generationMs: Date.now() - started,
      promptSha256,
    };
  } finally {
    clearTimeout(timer);
  }
}
