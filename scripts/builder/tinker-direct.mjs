#!/usr/bin/env node
/**
 * JARVIS direct Tinker transport.
 *
 * One HTTP request, no tools, no filesystem access, no retries. Authority,
 * credential custody, and evidence selection live outside this module.
 */
const ENDPOINT = 'https://tinker.thinkingmachines.dev/services/tinker-prod/anthropic/api/v1/messages';

export const DIRECT_TINKER_MODELS = Object.freeze([
  'thinkingmachines/Inkling-Small',
  'thinkingmachines/Inkling',
  'nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16',
  'nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16',
]);

const allowed = new Set(DIRECT_TINKER_MODELS);
const utf8Bytes = (value) => Buffer.byteLength(value, 'utf8');

export function buildTinkerRequest({ model, prompt, maxTokens = 4096 }) {
  if (!allowed.has(model)) throw new Error('MODEL_NOT_REGISTERED');
  if (typeof prompt !== 'string' || prompt.length === 0) throw new Error('PROMPT_REQUIRED');
  if (utf8Bytes(prompt) > 768 * 1024) throw new Error('PROMPT_TOO_LARGE');
  if (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 32768) {
    throw new Error('INVALID_MAX_TOKENS');
  }

  return {
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  };
}

export function parseTinkerResponse(payload) {
  if (!payload || !Array.isArray(payload.content)) throw new Error('INVALID_PROVIDER_RESPONSE');
  if (payload.content.some((block) => block?.type === 'tool_use')) {
    throw new Error('UNEXPECTED_TOOL_USE');
  }
  const text = payload.content
    .filter((block) => block?.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('')
    .trim();
  if (!text) throw new Error('EMPTY_PROVIDER_RESPONSE');

  return {
    text,
    usage: payload.usage ?? null,
    stop_reason: payload.stop_reason ?? null,
  };
}

export async function invokeTinkerDirect({
  model,
  prompt,
  apiKey = process.env.TINKER_API_KEY,
  maxTokens = 4096,
  fetchImpl = globalThis.fetch,
}) {
  if (!apiKey) throw new Error('PROVIDER_CREDENTIAL_MISSING');
  if (typeof fetchImpl !== 'function') throw new Error('FETCH_UNAVAILABLE');

  const body = buildTinkerRequest({ model, prompt, maxTokens });
  const response = await fetchImpl(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`PROVIDER_HTTP_${response.status || 'INVALID_JSON'}`);
  }

  if (!response.ok) {
    const detail = typeof payload?.error?.message === 'string'
      ? payload.error.message.slice(0, 240)
      : 'provider request failed';
    const error = new Error(`PROVIDER_HTTP_${response.status}: ${detail}`);
    error.status = response.status;
    throw error;
  }

  return {
    provider: 'tinker',
    transport: 'anthropic-compatible',
    model,
    ...parseTinkerResponse(payload),
  };
}

async function readStdin() {
  let value = '';
  for await (const chunk of process.stdin) value += chunk;
  return value;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const model = process.argv[2];
  const maxTokens = process.argv[3] ? Number(process.argv[3]) : 4096;
  try {
    const prompt = await readStdin();
    const result = await invokeTinkerDirect({ model, prompt, maxTokens });
    process.stdout.write(JSON.stringify(result) + '\n');
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN_PROVIDER_ERROR';
    process.stderr.write(`[tinker-direct] REFUSED ${code}\n`);
    process.exit(4);
  }
}
