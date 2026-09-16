import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { renderShadowResponse } from './shadow-response';
import type { StandingProjection } from './standing-projection';

const INPUT = process.env.STANDING_SHADOW_FIXTURE_IN || '/tmp/standing-shadow-fixtures.json';
const OUTPUT = process.env.STANDING_SHADOW_REPLAY_OUT || '/tmp/standing-shadow-replay.json';
const MODEL = 'llama3.1:8b';
const TEMPERATURE = 0.2;
const SEEDS = [42, 137] as const;
const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

function shadowPlanSchema(allowedEvidenceIds: readonly string[]) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['ground', 'synthesis', 'question'],
    properties: {
      ground: { type: 'array', maxItems: 0, items: { type: 'object' } },
      synthesis: {
        type: 'array', minItems: 1, maxItems: 3,
        items: {
          type: 'object', additionalProperties: false,
          required: ['text', 'supportEvidenceIds'],
          properties: {
            text: { type: 'string', minLength: 1 },
            supportEvidenceIds: {
              type: 'array', minItems: 1, maxItems: 4, uniqueItems: true,
              items: { type: 'string', enum: [...allowedEvidenceIds] },
            },
          },
        },
      },
      question: { anyOf: [{ type: 'string', minLength: 1 }, { type: 'null' }] },
    },
  } as const;
}

interface Packet {
  fixture: { id: string; title: string; reviewFacts: string[]; lethalFailures: string[] };
  turnId: string;
  userInput: string;
  currentSystemPrompt: string;
  shadowSystemPrompt: string;
  currentPromptDigest: string;
  shadowPromptDigest: string;
  projection: StandingProjection;
  preflight: Record<string, boolean>;
}

class OllamaTransportError extends Error {
  constructor(readonly detail: string) {
    super(detail);
    this.name = 'OllamaTransportError';
  }
}

async function ollama(system: string, prompt: string, seed: number, json: boolean, allowedEvidenceIds: readonly string[] = []): Promise<{ text: string; usage: Record<string, number | null> }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  try {
    const res = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        system,
        prompt,
        stream: false,
        ...(json ? { format: shadowPlanSchema(allowedEvidenceIds) } : {}),
        options: { temperature: TEMPERATURE, seed, num_predict: 650, num_ctx: 16384 },
      }),
    });
    if (!res.ok) {
      const body = (await res.text()).slice(0, 1200);
      throw new OllamaTransportError(`HTTP ${res.status}: ${body}`);
    }
    const body = await res.json() as any;
    return {
      text: String(body.response ?? '').trim(),
      usage: {
        promptEvalCount: typeof body.prompt_eval_count === 'number' ? body.prompt_eval_count : null,
        evalCount: typeof body.eval_count === 'number' ? body.eval_count : null,
      },
    };
  } catch (error) {
    if (error instanceof OllamaTransportError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new OllamaTransportError('timeout after 90000ms');
    }
    throw new OllamaTransportError(error instanceof Error ? error.message : String(error));
  } finally {
    clearTimeout(timer);
  }
}

async function callWithOneTransportRetry(
  system: string, prompt: string, seed: number, json: boolean, allowedEvidenceIds: readonly string[] = [],
): Promise<
  | { ok: true; out: { text: string; usage: Record<string, number | null> }; attempts: number }
  | { ok: false; transportError: string; attempts: number }
> {
  let last = 'unknown transport failure';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return { ok: true, out: await ollama(system, prompt, seed, json, allowedEvidenceIds), attempts: attempt };
    } catch (error) {
      last = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      if (attempt < 2) console.warn(`transport retry seed=${seed} json=${json}: ${last}`);
    }
  }
  return { ok: false, transportError: last, attempts: 2 };
}

async function main(): Promise<void> {
  const source = JSON.parse(readFileSync(INPUT, 'utf8')) as { packets: Packet[] };
  const rows: any[] = [];
  for (let i = 0; i < source.packets.length; i += 1) {
    const packet = source.packets[i];
    if (!Object.values(packet.preflight).every(Boolean)) throw new Error(`preflight not green: ${packet.fixture.id}`);
    for (const seed of SEEDS) {
      const order = (i + seed) % 2 === 0 ? ['shadow', 'current'] as const : ['current', 'shadow'] as const;
      for (const condition of order) {
        if (condition === 'current') {
          const call = await callWithOneTransportRetry(packet.currentSystemPrompt, packet.userInput, seed, false);
          rows.push({
            fixtureId: packet.fixture.id,
            fixtureTitle: packet.fixture.title,
            reviewFacts: packet.fixture.reviewFacts,
            lethalFailures: packet.fixture.lethalFailures,
            condition,
            seed,
            model: MODEL,
            temperature: TEMPERATURE,
            promptDigest: packet.currentPromptDigest,
            response: call.ok ? call.out.text : null,
            responseDigest: call.ok ? sha256(call.out.text) : null,
            transportError: 'transportError' in call ? call.transportError : null,
            attempts: call.attempts,
            usage: call.ok ? call.out.usage : null,
          });
        } else {
          const call = await callWithOneTransportRetry(packet.shadowSystemPrompt, packet.userInput, seed, true, packet.projection.entries.map((e) => e.evidenceId));
          let rawPlan: unknown = null;
          let rendered: ReturnType<typeof renderShadowResponse> | null = null;
          let refusal: string | null = null;
          if (call.ok) {
            try {
              rawPlan = JSON.parse(call.out.text);
              rendered = renderShadowResponse(packet.projection, rawPlan);
            } catch (error) {
              rawPlan = call.out.text;
              refusal = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
            }
          }
          rows.push({
            fixtureId: packet.fixture.id,
            fixtureTitle: packet.fixture.title,
            reviewFacts: packet.fixture.reviewFacts,
            lethalFailures: packet.fixture.lethalFailures,
            condition,
            seed,
            model: MODEL,
            temperature: TEMPERATURE,
            promptDigest: packet.shadowPromptDigest,
            rawPlan,
            rawPlanDigest: call.ok ? sha256(call.out.text) : null,
            response: rendered?.text ?? null,
            responseDigest: rendered ? sha256(rendered.text) : null,
            refusal,
            transportError: 'transportError' in call ? call.transportError : null,
            attempts: call.attempts,
            trace: rendered?.trace ?? null,
            usage: call.ok ? call.out.usage : null,
          });
        }
      }
    }
    console.log(`${packet.fixture.id}: complete`);
  }
  const result = {
    programme: 'JARVIS-MAIA-STANDING-SHADOW-01',
    act: 'S4 offline shadow comparison',
    model: MODEL,
    temperature: TEMPERATURE,
    seeds: SEEDS,
    rows,
  };
  writeFileSync(OUTPUT, JSON.stringify(result, null, 2), { mode: 0o600 });
  const shadow = rows.filter((r) => r.condition === 'shadow');
  console.log(JSON.stringify({
    output: OUTPUT,
    rows: rows.length,
    current: rows.length - shadow.length,
    shadow: shadow.length,
    shadowRendered: shadow.filter((r) => r.response).length,
    shadowRefused: shadow.filter((r) => r.refusal).length,
    transportFailures: rows.filter((r) => r.transportError).length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
