/**
 * assertProviderAvailable — pre-generation provider health guard
 *
 * Throws ProviderUnavailableError before getMaiaResponse() is called if the
 * configured provider cannot plausibly serve the turn. The throw is the point:
 * a soft-return that downstream code must check can be silently misread as
 * success. The ProviderUnavailableError class is named so catch blocks can be
 * specific — only code that explicitly handles this error type will catch it.
 *
 * Failure message produced by this path is unforgeable by the same failure
 * class: if the provider is down, the route returns a 503 from the catch block
 * before any generation is attempted. getMaiaResponse() is never called.
 *
 * What this checks:
 *   Anthropic primary (MAIA_TEXT_PROVIDER=anthropic or unset):
 *     - ANTHROPIC_API_KEY is present and plausibly formatted (sk-ant-*)
 *     - If Ollama is also configured, logs that fallback is available
 *     - If Ollama is NOT configured, logs that no local fallback exists (warn, no throw)
 *
 *   Local primary (MAIA_TEXT_PROVIDER=local):
 *     - OLLAMA_BASE_URL is set
 *     - OLLAMA_MODEL is set
 *     - Ollama service is reachable at /api/tags (2000ms timeout)
 *     - Configured model appears in the installed model list
 *
 * What this does NOT check:
 *   - Anthropic credit balance (requires live API call; cost/latency on every turn)
 *   - Anthropic key validity beyond format (same reason)
 *   - Network reachability of Anthropic API (would add 200-500ms on every turn)
 *
 * Credit exhaustion and auth errors are caught by the existing PROVIDERS_UNAVAILABLE
 * code path in the route's outer catch block (post-generation failure).
 * This guard covers pre-generation: obviously broken configuration.
 *
 * Provider health state is also reported via buildMaiaRuntimeContext()'s
 * providerConfig field — this guard is the enforcement layer on top of that report.
 *
 * De-frag sequence step 5.
 */

// ─── Error Class ──────────────────────────────────────────────────────────────

/**
 * Thrown when the configured provider cannot serve the current turn.
 * Named class (not string code) so catch blocks must be intentional.
 *
 * The route's outer catch checks `err instanceof ProviderUnavailableError`
 * before the generic handler — this ensures the error is surfaced as
 * infrastructure failure, not routed through MAIA's voice.
 */
export class ProviderUnavailableError extends Error {
  readonly provider: string;
  readonly reason: ProviderUnavailableReason;

  constructor(provider: string, reason: ProviderUnavailableReason, detail?: string) {
    const message = detail
      ? `Provider unavailable: ${provider} — ${reason}: ${detail}`
      : `Provider unavailable: ${provider} — ${reason}`;
    super(message);
    this.name = 'ProviderUnavailableError';
    this.provider = provider;
    this.reason = reason;
    // Preserve prototype chain in TypeScript environments where Error subclassing is unreliable
    Object.setPrototypeOf(this, ProviderUnavailableError.prototype);
  }
}

export type ProviderUnavailableReason =
  | 'api_key_missing'         // ANTHROPIC_API_KEY not set
  | 'api_key_malformed'       // Key present but does not look valid
  | 'ollama_not_configured'   // OLLAMA_BASE_URL or OLLAMA_MODEL missing
  | 'ollama_unreachable'      // Ping to /api/tags failed or timed out
  | 'ollama_model_not_loaded' // Model not in Ollama's installed list
  | 'provider_unknown';       // MAIA_TEXT_PROVIDER set to unrecognised value

// ─── Main Guard ───────────────────────────────────────────────────────────────

/**
 * Assert that the configured MAIA text provider can serve the current turn.
 *
 * @throws ProviderUnavailableError — named, catchable, specific.
 *   The caller must NOT swallow this with a generic catch — re-throw or handle
 *   explicitly with `instanceof ProviderUnavailableError`.
 */
export async function assertProviderAvailable(): Promise<void> {
  const textProvider = (process.env.MAIA_TEXT_PROVIDER ?? 'anthropic').toLowerCase();

  if (textProvider === 'anthropic' || textProvider === '') {
    return assertAnthropicAvailable();
  }

  if (textProvider === 'local') {
    return assertOllamaAvailable();
  }

  // Unknown provider value — fail explicitly rather than silently proceeding
  throw new ProviderUnavailableError(
    textProvider,
    'provider_unknown',
    `MAIA_TEXT_PROVIDER="${textProvider}" is not a recognised value. Expected "anthropic" or "local".`,
  );
}

// ─── Anthropic Check ──────────────────────────────────────────────────────────

function assertAnthropicAvailable(): void {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? '';

  if (!apiKey) {
    throw new ProviderUnavailableError(
      'anthropic',
      'api_key_missing',
      'ANTHROPIC_API_KEY is not set in the environment.',
    );
  }

  // Basic format check: Anthropic keys begin with "sk-ant-"
  // This does not verify validity — it catches obvious mis-pastes.
  if (!apiKey.startsWith('sk-ant-')) {
    throw new ProviderUnavailableError(
      'anthropic',
      'api_key_malformed',
      'ANTHROPIC_API_KEY does not start with "sk-ant-". Check for truncation or copy errors.',
    );
  }

  // Report fallback availability (non-blocking)
  const ollamaUrl = process.env.OLLAMA_BASE_URL;
  const ollamaModel = process.env.OLLAMA_MODEL;
  if (ollamaUrl && ollamaModel) {
    console.log('[MAIA/provider] anthropic primary — local fallback configured', {
      ollamaModel,
      ollamaUrl: ollamaUrl.replace(/\/\/.*@/, '//***@'), // redact credentials if present
    });
  } else {
    console.warn(
      '[MAIA/provider] anthropic primary — no local fallback configured. ' +
      'If Claude is unavailable, this turn will fail. ' +
      'Set OLLAMA_BASE_URL + OLLAMA_MODEL to enable local fallback.',
    );
  }
}

// ─── Ollama Check ─────────────────────────────────────────────────────────────

const OLLAMA_PING_TIMEOUT_MS = 2000;

async function assertOllamaAvailable(): Promise<void> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL;
  const ollamaModel = process.env.OLLAMA_MODEL;

  if (!ollamaUrl || !ollamaModel) {
    throw new ProviderUnavailableError(
      'ollama',
      'ollama_not_configured',
      `MAIA_TEXT_PROVIDER=local but ${!ollamaUrl ? 'OLLAMA_BASE_URL' : 'OLLAMA_MODEL'} is not set.`,
    );
  }

  // Ping /api/tags to verify the service is up and the model is installed.
  // Fast local call — should complete in <100ms on a healthy system.
  let installedModels: string[];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OLLAMA_PING_TIMEOUT_MS);
    try {
      const res = await fetch(`${ollamaUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        throw new ProviderUnavailableError(
          'ollama',
          'ollama_unreachable',
          `Ollama /api/tags returned HTTP ${res.status}. Service may be starting up.`,
        );
      }
      const json = await res.json() as { models?: Array<{ name: string }> };
      installedModels = (json.models ?? []).map((m) => m.name);
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    if (err instanceof ProviderUnavailableError) throw err;
    // AbortError (timeout) or network error
    throw new ProviderUnavailableError(
      'ollama',
      'ollama_unreachable',
      `Ollama service unreachable at ${ollamaUrl}. ` +
      (err instanceof Error && err.name === 'AbortError'
        ? `Timed out after ${OLLAMA_PING_TIMEOUT_MS}ms.`
        : `Network error: ${err instanceof Error ? err.message : String(err)}`),
    );
  }

  // Verify the configured model is installed.
  // Ollama model names may include tags (e.g. "qwen2.5:7b") — match on exact name
  // or by stripping the tag for a prefix match.
  const modelBase = ollamaModel.split(':')[0];
  const modelFound = installedModels.some(
    (name) => name === ollamaModel || name.startsWith(modelBase + ':'),
  );

  if (!modelFound) {
    throw new ProviderUnavailableError(
      'ollama',
      'ollama_model_not_loaded',
      `Model "${ollamaModel}" is not in Ollama's installed list. ` +
      `Installed: [${installedModels.slice(0, 5).join(', ')}${installedModels.length > 5 ? ', …' : ''}]. ` +
      `Run: ollama pull ${ollamaModel}`,
    );
  }

  console.log('[MAIA/provider] ollama primary — model verified', {
    model: ollamaModel,
    installedCount: installedModels.length,
  });
}
