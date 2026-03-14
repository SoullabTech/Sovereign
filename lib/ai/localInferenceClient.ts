// lib/ai/localInferenceClient.ts
// Phase 1: HTTP client for maia-local-inference service.
// Extracted from sovereignRouter so it can be tested independently.
// DO NOT import anything that executes code on module load.

import type { TextRequest } from './modelService';
import type { TextResult } from './types';

// ── Env config (read once at module load — all reads, no side effects) ────────
const LOCAL_BASE_URL = process.env.LOCAL_INFERENCE_BASE_URL ?? 'http://maia-local-inference:8080';
const LOCAL_TIMEOUT_MS = Math.max(1000, Number(process.env.LOCAL_INFERENCE_TIMEOUT_MS ?? '15000'));
const HEALTH_PATH = process.env.LOCAL_INFERENCE_HEALTH_PATH ?? '/health';
const GENERATE_PATH = process.env.LOCAL_INFERENCE_GENERATE_PATH ?? '/v1/generate';

// ── In-process circuit breaker ────────────────────────────────────────────────
const CIRCUIT_BREAKER_TTL_MS = 45_000; // 45 s
let localDownUntil = 0; // epoch ms; 0 = not tripped

function localCircuitOpen(): boolean {
  return Date.now() < localDownUntil;
}

function tripLocalCircuit(): void {
  localDownUntil = Date.now() + CIRCUIT_BREAKER_TTL_MS;
  console.warn(`[localInferenceClient] circuit tripped — pausing for ${CIRCUIT_BREAKER_TTL_MS / 1000}s`);
}

/** Reset circuit breaker to closed state. For use in tests only. */
export function resetCircuitBreaker(): void {
  localDownUntil = 0;
}

// ── Health probe ──────────────────────────────────────────────────────────────
export async function isLocalHealthy(): Promise<boolean> {
  if (localCircuitOpen()) return false;

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 3_000);
  try {
    const res = await fetch(`${LOCAL_BASE_URL}${HEALTH_PATH}`, { signal: controller.signal });
    clearTimeout(tid);
    return res.ok;
  } catch {
    clearTimeout(tid);
    tripLocalCircuit();
    return false;
  }
}

// ── Generate call ─────────────────────────────────────────────────────────────
export async function callLocalInference(req: TextRequest): Promise<TextResult> {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), LOCAL_TIMEOUT_MS);

  try {
    const res = await fetch(`${LOCAL_BASE_URL}${GENERATE_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `${req.systemPrompt}\n\n${req.userInput}`,
        max_tokens: 1024,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    clearTimeout(tid);

    if (!res.ok) throw new Error(`local inference HTTP ${res.status}`);

    const data = await res.json() as {
      text: string;
      model?: string;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    return {
      text: data.text,
      provider: {
        provider: 'local_inference',
        model: data.model ?? 'local',
        mode: 'full',
        usage: {
          input_tokens:  data.usage?.prompt_tokens,
          output_tokens: data.usage?.completion_tokens,
          total_tokens:  data.usage?.total_tokens,
        },
      },
    };
  } catch (err) {
    clearTimeout(tid);
    tripLocalCircuit();
    throw err;
  }
}
