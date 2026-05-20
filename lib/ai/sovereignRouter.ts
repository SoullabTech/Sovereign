// lib/ai/sovereignRouter.ts
// Phase 1: Sovereign inference routing
//
// Public entry point called by the guard in modelService.generateText().
// DO NOT call generateText() from here — that would be infinite recursion.
// DO NOT import anything that executes code on module load.

import { generateWithClaude } from './claudeClient';
import { callLocalInference, isLocalHealthy } from './localInferenceClient';
import { emitDriftEvent } from '@/lib/sovereignty/driftAlarm';
import type { TextRequest } from './modelService';
import type { TextResult, InferenceMode, TokenUsage } from './types';

// ── Degraded mode copy (exact, per spec) ─────────────────────────────────────
const DEGRADED_TEXT =
  "MAIA is here. I've saved your message. My local voice is temporarily limited; " +
  "I'll return with a fuller response as soon as capacity is back.";

// ── Token usage logging (same schema as modelService) ─────────────────────────
const LOG_TOKENS = process.env.MAIA_LOG_TOKEN_USAGE === 'true';
const LOG_SAMPLE = Math.min(1, Math.max(0, Number(process.env.MAIA_LOG_TOKEN_USAGE_SAMPLE_RATE ?? '1')));

function shouldLog(): boolean {
  if (!LOG_TOKENS) return false;
  return LOG_SAMPLE >= 1 || Math.random() < LOG_SAMPLE;
}

function logUsageLine(args: {
  provider: string;
  model?: string | null;
  t0: number;
  usage?: TokenUsage | null;
  mode: InferenceMode;
}): void {
  if (!shouldLog()) return;
  console.info(JSON.stringify({
    at: new Date().toISOString(),
    kind: 'token_usage',
    provider: args.provider,
    model: args.model ?? null,
    ms: Date.now() - args.t0,
    input:  args.usage?.inputTokens  ?? args.usage?.input_tokens  ?? null,
    output: args.usage?.outputTokens ?? args.usage?.output_tokens ?? null,
    total:  args.usage?.totalTokens  ?? args.usage?.total_tokens  ?? null,
    tag: `sovereignRouter.${args.mode}`,
  }));
}

// ── Degraded result ───────────────────────────────────────────────────────────
function degradedResult(t0: number): TextResult {
  return {
    text: DEGRADED_TEXT,
    provider: {
      provider: 'unknown',
      model: 'degraded',
      mode: 'fallback',
      reason: 'all_providers_unavailable',
      latencyMs: Date.now() - t0,
    },
  };
}

// ── Internal dispatcher ───────────────────────────────────────────────────────
async function routeSovereignInference(
  req: TextRequest,
  mode: InferenceMode,
  t0: number
): Promise<TextResult> {

  // ── sovereign + local_only: local first, degraded on failure, NO vendor switch ──
  if (mode === 'sovereign' || mode === 'local_only') {
    // sovereign = local-first sovereign mode (UM790 owns the request)
    // local_only = stricter alias; identical behaviour in Phase 1
    const healthy = await isLocalHealthy();
    if (!healthy) {
      console.warn(`[sovereignRouter] mode=${mode}: local unhealthy — returning degraded`);
      return degradedResult(t0);
    }
    try {
      const result = await callLocalInference(req);
      logUsageLine({ provider: 'local_inference', model: result.provider.model, t0, usage: result.provider.usage, mode });
      return result;
    } catch (err) {
      console.error(`[sovereignRouter] mode=${mode}: local call failed — returning degraded:`, err);
      return degradedResult(t0);
    }
  }

  // ── primary: Anthropic first, local fallback, degraded if both fail ───────────
  if (mode === 'primary') {
    try {
      const result = await generateWithClaude({
        systemPrompt: req.systemPrompt,
        userInput: req.userInput,
        meta: req.meta,
      });
      logUsageLine({ provider: 'anthropic', model: result.provider?.model, t0, usage: result.provider?.usage, mode });
      return result;
    } catch (err: any) {
      // Billing/auth: fail fast, no fallback
      if (err?.noFallback || err?.code === 'ANTHROPIC_BILLING_ERROR') throw err;
      console.warn('[sovereignRouter] mode=primary: Anthropic failed, trying local:', err?.message);
      // Drift alarm: Anthropic→local fallback occurred without explicit
      // member-visible escalation. The member doesn't see this transition.
      emitDriftEvent('silent_fallback', {
        surface: 'sovereignRouter.primary',
        provider: 'anthropic',
        mode: 'primary',
        escalation_reason: 'anthropic_failed',
        detail: typeof err?.message === 'string' ? err.message.slice(0, 200) : 'unknown',
      });
    }

    const healthy = await isLocalHealthy();
    if (!healthy) {
      console.warn('[sovereignRouter] mode=primary: local also unhealthy — returning degraded');
      return degradedResult(t0);
    }
    try {
      const result = await callLocalInference(req);
      logUsageLine({ provider: 'local_inference', model: result.provider.model, t0, usage: result.provider.usage, mode });
      return result;
    } catch (err) {
      console.error('[sovereignRouter] mode=primary: local fallback failed — returning degraded:', err);
      return degradedResult(t0);
    }
  }

  // Unreachable — mode is validated upstream by the guard
  return degradedResult(t0);
}

// ── Public entry point ────────────────────────────────────────────────────────
export async function generateTextWithSovereignty(
  req: TextRequest,
  mode: InferenceMode,
  t0: number
): Promise<TextResult> {
  return routeSovereignInference(req, mode, t0);
}
