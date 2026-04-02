/**
 * Voice Navigation Bridge — Temporary event transport for voice → shell communication
 *
 * Talk-first architecture: voice commands can navigate between worlds.
 * Uses window CustomEvents to decouple voice command detection (inside OracleConversation)
 * from shell navigation (MaiaShell). This avoids threading callbacks through OracleConversation.
 *
 * This is a temporary transport layer. Will be replaced by an internal event bus
 * when the capability system matures.
 */

import type { MaiaWorldId } from '@/lib/navigation/types';

// --- Event Names ---

export const VOICE_NAVIGATE_EVENT = 'maia:voice-navigate';

// --- Event Payloads ---

export interface VoiceNavigateDetail {
  worldId: MaiaWorldId | 'studio';
  source: 'voice-command';
  command: string;
}

// --- Dispatch ---

/**
 * Dispatch a world navigation event from a voice command.
 * Called from voiceCommands.ts when a world-navigate action is matched.
 */
export function dispatchVoiceNavigation(worldId: MaiaWorldId | 'studio', command: string): void {
  if (typeof window === 'undefined') return;

  const detail: VoiceNavigateDetail = {
    worldId,
    source: 'voice-command',
    command,
  };

  console.log(`🧭 [VoiceNav] Dispatching: world=${worldId}, command="${command}"`);
  window.dispatchEvent(new CustomEvent(VOICE_NAVIGATE_EVENT, { detail }));
}

// --- Listener Helpers ---

export type VoiceNavigateHandler = (detail: VoiceNavigateDetail) => void;

/**
 * Subscribe to voice navigation events.
 * Returns cleanup function for useEffect.
 */
export function onVoiceNavigate(handler: VoiceNavigateHandler): () => void {
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<VoiceNavigateDetail>).detail;
    handler(detail);
  };
  window.addEventListener(VOICE_NAVIGATE_EVENT, listener);
  return () => window.removeEventListener(VOICE_NAVIGATE_EVENT, listener);
}
