/**
 * VOICE-STREAM-PROVIDER-CONVERGENCE-01 — one provider authority for voice and text.
 *
 * ⛔ THE DEFECT THIS REPAIRS, device-witnessed 2026-08-29. `/maia` text
 * generation obeys `MAIA_TEXT_PROVIDER` and ran happily on local Ollama. The
 * VOICE response path did not: `/api/voice/stream-conversation` constructed
 * `getClaudeService()` directly and called Anthropic regardless of
 * configuration. With `MAIA_TEXT_PROVIDER=local` and a placeholder key, a
 * successfully transcribed member turn reached the route and died on
 * `validation_error: API key is invalid`. The member had spoken, MAIA had
 * heard, and the sovereign substrate was ignored one layer above.
 *
 * ⛔ WHAT THIS IS NOT. It is not a second provider switch for voice, and it is
 * not a replacement for the voice route's intelligence. That route wraps its
 * generation in memory bundle, identity and natal context, the interpretive
 * council, relational-stack governance, the threshold fast-path, the memory
 * canon guard, the identity guard and per-sentence TTS. All of it operates on
 * the CHUNKS this generator yields.
 *
 * So the contract is deliberately identical to
 * `ClaudeService.generateOracleResponseStreaming`:
 *
 *     { type: 'sentence' | 'done'; text: string; index: number }
 *
 * The route's `for await` body does not change by a single line. Only who
 * produces the chunks does. The architecture survives; the provider becomes
 * interchangeable underneath it.
 */

/**
 * ⛔ EVERY PROVIDER MODULE IS IMPORTED LAZILY, AND THAT IS LOAD-BEARING.
 *
 * A top-level `import { getClaudeService }` would pull the Anthropic SDK into
 * the module graph of every sovereign turn — loaded, initialised, and present,
 * merely not called. Importing inside the branch means that on a local turn the
 * SDK is never even evaluated, so "Anthropic is unreachable" is a structural
 * fact rather than a claim about control flow. It also lets the rule be
 * exercised without a test runner having to stub a cloud SDK it should never
 * touch.
 */

export type OracleStreamChunk = { type: 'sentence' | 'done'; text: string; index: number };

/**
 * What actually generated this turn.
 *
 * ⛔ VOICE-STREAM-PROVIDER-PROVENANCE-01. The voice route's training record
 * hardcoded `primaryEngine: 'claude-3-sonnet'` and `usedClaudeConsult: true`.
 * Once generation became configurable, that attribution stayed Claude-specific
 * — so a sovereign local turn would have been recorded, durably, as a Claude
 * turn. The generation would have been sovereign and the audit trail would have
 * said it was not, which is the worse of the two failures: a witness that
 * succeeds while manufacturing false provenance.
 *
 * ⛔ REPORTED, NOT RE-DERIVED. This is emitted by the same code path that
 * chooses and invokes the provider, carrying the model the provider itself
 * returned. A second place that inferred "which provider probably ran" could
 * drift from the first — and the old literal shows exactly how: it named
 * claude-3-sonnet long after the default became a Haiku 4.5 build.
 */
export interface TurnProvenance {
  /** 'anthropic' | 'ollama' | whatever the provider reported. */
  provider: string;
  /** The concrete model, from the provider itself. */
  model: string;
  /** True only when an Anthropic request was actually made. */
  usedClaudeConsult: boolean;
}

/** Whatever the voice route already builds and passes through. Untouched here. */
export interface OracleStreamContext {
  conversationHistory?: Array<{ role?: string; content?: string }>;
  [key: string]: unknown;
}

export interface OracleStreamDeps {
  /** Injected so a test can prove Anthropic is never REACHED, not merely unused. */
  claudeFactory?: () => { generateOracleResponseStreaming: (...a: any[]) => AsyncGenerator<OracleStreamChunk> };
  localGenerate?: (params: { systemPrompt: string; userInput: string })
    => Promise<{ text: string; provider?: { provider?: string; model?: string } }>;
  assertAvailable?: () => Promise<void> | void;
  provider?: string;
  /** Called ONCE, with what actually ran, before the first chunk is yielded. */
  onProvenance?: (provenance: TurnProvenance) => void;
}

/** The configured text provider — the SAME authority canonical text generation uses. */
export function resolveTextProvider(explicit?: string): string {
  return (explicit ?? process.env.MAIA_TEXT_PROVIDER ?? 'anthropic').toLowerCase() || 'anthropic';
}

/**
 * The sentence boundary used by the Anthropic streamer, reused verbatim so a
 * local response is chunked the way the downstream guards and TTS already
 * expect. A different rule here would mean the memory-canon guard saw
 * differently-shaped text depending on which provider answered.
 */
const SENTENCE_END = /[.!?]+[\s]+|[.!?]+$/;

/** Split completed text into the same sentence chunks the stream would have produced. */
export function splitIntoSentences(text: string): string[] {
  const cleaned = String(text ?? '')
    // The metadata block is stripped by the Anthropic path too; a local model
    // prompted with the same system prompt can emit it.
    .replace(/---SOUL_METADATA---[\s\S]*?---END_METADATA---/g, '')
    .trim();
  if (!cleaned) return [];

  const out: string[] = [];
  let buffer = '';
  for (const word of cleaned.split(/(\s+)/)) {
    buffer += word;
    if (SENTENCE_END.test(buffer)) {
      const piece = buffer.trim();
      if (piece) out.push(piece);
      buffer = '';
    }
  }
  const tail = buffer.trim();
  if (tail) out.push(tail);
  return out;
}

/**
 * Fold recent turns into the prompt for providers that take a single string.
 *
 * ⛔ CONTINUITY IS NOT OPTIONAL. The Anthropic path passes the last six messages
 * as structured turns. A local provider whose client accepts only
 * `{ systemPrompt, userInput }` would otherwise silently lose them — MAIA
 * answering fluently with no memory of the last exchange, which is precisely
 * the failure the memory canon guard exists to catch rather than cause.
 */
export function foldHistoryIntoInput(
  input: string,
  history?: Array<{ role?: string; content?: string }>,
): string {
  const recent = (history ?? [])
    .slice(-6)
    .map((m) => ({ role: m.role === 'assistant' ? 'MAIA' : 'Member', content: (m.content ?? '').trim() }))
    .filter((m) => m.content.length > 0);
  if (recent.length === 0) return input;
  const rendered = recent.map((m) => `${m.role}: ${m.content}`).join('\n');
  return `Recent conversation:\n${rendered}\n\nMember: ${input}`;
}

/**
 * Stream MAIA's spoken response from whichever provider is configured.
 *
 * ⛔ `assertProviderAvailable()` runs FIRST, and its error is allowed to
 * propagate. A misconfigured provider must fail honestly and visibly, not be
 * discovered as a mid-stream exception that the surface renders as MAIA
 * speaking — the shape already recorded as MAIA-PROCESSING-FAILURE-AS-SPEECH-01.
 */
export async function* streamOracleResponse(
  input: string,
  context: OracleStreamContext,
  systemPrompt: string | undefined,
  deps: OracleStreamDeps = {},
): AsyncGenerator<OracleStreamChunk> {
  const provider = resolveTextProvider(deps.provider);
  const assertAvailable =
    deps.assertAvailable ??
    (async () => {
      const { assertProviderAvailable } = await import('@/lib/maia/assertProviderAvailable');
      await assertProviderAvailable();
    });

  await assertAvailable();

  if (provider === 'anthropic') {
    // ⛔ Byte-identical to the previous behaviour, including where the client is
    // constructed. Anthropic remains fully available; this unit removes its
    // MONOPOLY, not its use.
    const factory =
      deps.claudeFactory ??
      (await import('@/lib/services/ClaudeService')).getClaudeService;
    const claude = factory();
    deps.onProvenance?.({
      provider: 'anthropic',
      // The instance's own model, never a literal. See ClaudeService.modelId.
      model: (claude as { modelId?: string }).modelId ?? 'anthropic:unknown',
      usedClaudeConsult: true,
    });
    yield* claude.generateOracleResponseStreaming(input, context as any, systemPrompt) as AsyncGenerator<OracleStreamChunk>;
    return;
  }

  // ⛔ EVERY OTHER PROVIDER — no Anthropic client is constructed on this path.
  // Not "constructed but unused": never reached, so an invalid or absent
  // ANTHROPIC_API_KEY cannot affect a sovereign turn at all.
  const generate =
    deps.localGenerate ?? (await import('./localModelClient')).generateWithLocalModel;
  const result = await generate({
    systemPrompt: systemPrompt ?? '',
    userInput: foldHistoryIntoInput(input, context?.conversationHistory),
  });

  // ⛔ The provider's OWN report of what it ran. `usedClaudeConsult` is false
  // here as a matter of fact, not of policy: no Anthropic module was even
  // imported on this path.
  const meta = (result as { provider?: { provider?: string; model?: string } })?.provider;
  deps.onProvenance?.({
    provider: meta?.provider ?? provider,
    model: meta?.model ?? 'unknown',
    usedClaudeConsult: false,
  });

  const sentences = splitIntoSentences(result?.text ?? '');
  let index = 0;
  for (const text of sentences) {
    yield { type: 'sentence', text, index };
    index += 1;
  }
  // ⛔ The `done` chunk is emitted even for an empty response, because the
  // route's stream teardown depends on it. A provider that returns nothing must
  // still end the turn cleanly rather than hanging the member's microphone.
  yield { type: 'done', text: '', index };
}
