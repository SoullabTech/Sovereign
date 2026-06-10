/**
 * Stewardship Rate Card — cost-to-provide, NOT cost-to-charge.
 *
 * Source of truth for converting usage (tokens, audio seconds) into the system's
 * COST TO PROVIDE an interaction, expressed in micro-USD (1e-6 USD).
 *
 * Claude (Anthropic) is MAIA's only paid text provider; local models cost ~$0 at the
 * margin (hardware is amortized at the capacity-planning layer, not per event).
 *
 * Prices are USD per 1,000,000 tokens (per MTok), from the Anthropic pricing reference
 * (claude-api skill, cached 2026-05-26). Update here when Anthropic pricing changes.
 * Cache pricing (standard Anthropic): cache write (5m) = 1.25x input, cache read = 0.1x input.
 */

interface ModelRate {
  inputPerMTok: number;
  outputPerMTok: number;
  cacheWritePerMTok: number; // 5-minute TTL write
  cacheReadPerMTok: number;
}

// Keyed by Claude family. Matched by substring so version bumps (4-6 → 4-8) still price.
const CLAUDE_RATES: Record<'opus' | 'sonnet' | 'haiku', ModelRate> = {
  opus:   { inputPerMTok: 5.0, outputPerMTok: 25.0, cacheWritePerMTok: 6.25, cacheReadPerMTok: 0.50 },
  sonnet: { inputPerMTok: 3.0, outputPerMTok: 15.0, cacheWritePerMTok: 3.75, cacheReadPerMTok: 0.30 },
  haiku:  { inputPerMTok: 1.0, outputPerMTok: 5.0,  cacheWritePerMTok: 1.25, cacheReadPerMTok: 0.10 },
};

function claudeFamily(model: string): 'opus' | 'sonnet' | 'haiku' | null {
  const m = model.toLowerCase();
  if (m.includes('opus')) return 'opus';
  if (m.includes('sonnet')) return 'sonnet';
  if (m.includes('haiku')) return 'haiku';
  return null;
}

// Providers that cost real money per token. Everything else (local, ollama,
// consciousness_engine, local_inference, multi_engine) is $0 marginal by design.
// 'moonshot' (Kimi) is paid but backstage — priced 0 until a confirmed rate is added (TODO).
const PAID_TEXT_PROVIDERS = new Set(['anthropic']);

export interface CostInputs {
  provider: string;
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  cacheCreationTokens?: number | null;
  cacheReadTokens?: number | null;
  audioSeconds?: number | null;
}

/**
 * Cost to provide, in micro-USD (integer). 0 for local / unknown providers.
 *
 * Identity: cost_micros = Σ tokens_i × usd_per_MTok_i
 *   cost_usd  = tokens / 1e6 × usd_per_MTok
 *   cost_micros = cost_usd × 1e6 = tokens × usd_per_MTok   (the 1e6 factors cancel)
 */
export function computeCostMicros(inp: CostInputs): number {
  const provider = (inp.provider || '').toLowerCase();

  if (PAID_TEXT_PROVIDERS.has(provider)) {
    const fam = inp.model ? claudeFamily(inp.model) : null;
    if (!fam) return 0; // unknown Claude model — don't guess a price
    const r = CLAUDE_RATES[fam];
    const usd =
      (inp.inputTokens ?? 0) * r.inputPerMTok +
      (inp.outputTokens ?? 0) * r.outputPerMTok +
      (inp.cacheCreationTokens ?? 0) * r.cacheWritePerMTok +
      (inp.cacheReadTokens ?? 0) * r.cacheReadPerMTok;
    return Math.round(usd); // tokens × usd/MTok == micro-USD
  }

  // TODO(stewardship): price 'moonshot'/Kimi (paid backstage) and audio TTS
  // (OpenAI/ElevenLabs per-second) once those rate cards are confirmed.
  return 0;
}

/** Exposed for tests / admin display. */
export const RATE_CARD = { claude: CLAUDE_RATES, paidProviders: [...PAID_TEXT_PROVIDERS] } as const;
