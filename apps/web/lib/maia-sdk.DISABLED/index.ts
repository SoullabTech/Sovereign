/**
 * MAIA SDK - Sovereign Voice & AI Integration Layer
 *
 * Main entry point for the MAIA SDK.
 * Provides a unified interface for multiple AI/voice providers.
 *
 * @example
 * ```typescript
 * import { createProvider } from '@/lib/maia-sdk';
 *
 * const provider = createProvider('openai', {
 *   apiKey: process.env.OPENAI_API_KEY
 * });
 *
 * await provider.connect(conversationContext);
 * provider.on('response', (text, audio) => {
 *   // Handle MAIA's response
 * });
 * ```
 */

// Core exports
export * from './core/types';
export { BaseProvider } from './providers/base-provider';

// Provider exports
export { OpenAIRealtimeAdapter } from './providers/openai/realtime-adapter';

// Provider factory
import { BaseProvider } from './providers/base-provider';
import { OpenAIRealtimeAdapter } from './providers/openai/realtime-adapter';
import { ProviderConfig } from './core/types';

export type ProviderType = 'openai' | 'local' | 'anthropic';

/**
 * Create and initialize a provider
 *
 * @param type - Provider type ('openai', 'local', 'anthropic')
 * @param config - Provider-specific configuration
 * @returns Initialized provider instance
 *
 * @example
 * ```typescript
 * const provider = await createProvider('openai', {
 *   apiKey: process.env.OPENAI_API_KEY,
 *   model: 'gpt-4o-realtime-preview-2024-10-01'
 * });
 * ```
 */
export async function createProvider(
  type: ProviderType,
  config: ProviderConfig
): Promise<BaseProvider> {
  let provider: BaseProvider;

  switch (type) {
    case 'openai':
      provider = new OpenAIRealtimeAdapter();
      break;

    case 'local':
      // TODO: Implement LocalWhisperXTTSAdapter
      throw new Error('Local provider not yet implemented');

    case 'anthropic':
      // TODO: Implement ClaudeAdapter
      throw new Error('Anthropic provider not yet implemented');

    default:
      throw new Error(`Unknown provider type: ${type}`);
  }

  await provider.initialize(config);
  return provider;
}

/**
 * Get metadata about available providers
 */
export function getAvailableProviders(): string[] {
  return ['openai']; // Will add 'local', 'anthropic' later
}

/**
 * SDK Version
 */
export const VERSION = '0.1.0-alpha';

/**
 * Default export - convenient access to main functions
 */
export default {
  createProvider,
  getAvailableProviders,
  VERSION
};
