/**
 * OpenAI Client — SOVEREIGNTY BLOCKED
 *
 * All OpenAI access is prohibited under the MAIA zero-access doctrine.
 * This file exists to satisfy legacy import shapes while failing loudly
 * if any code path actually tries to use the client.
 *
 * See lib/ai/openaiPolicy.ts for the doctrine and approved alternatives.
 */

import { assertOpenAIBlocked } from './openaiPolicy';

/**
 * Always throws. No OpenAI client will be constructed.
 */
export function getOpenAIClient(): never {
  return assertOpenAIBlocked('client access');
}

/**
 * Always false — zero access means the key is irrelevant.
 */
export function isOpenAIConfigured(): boolean {
  return false;
}

/**
 * No-op. Nothing to reset.
 */
export function resetOpenAIClient(): void {
  // intentionally empty
}
