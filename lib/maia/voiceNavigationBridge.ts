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
  /** In-shell world (panel) or 'studio'; null when navigating by route only. */
  worldId: MaiaWorldId | 'studio' | null;
  source: 'voice-command' | 'text-command';
  command: string;
  /** When set, the shell pushes this route instead of switching world panels. */
  route?: string;
  /** Human-facing destination label (logs / toasts). */
  label?: string;
}

// --- Dispatch ---

/**
 * Dispatch a navigation event.
 *  - Voice world-navigate (voiceCommands.ts): pass a worldId, no route → the shell
 *    switches the in-shell world panel (existing behavior, unchanged).
 *  - Explicit text command (OracleConversation): pass a `route` → the shell pushes
 *    that route. worldId may be null for boundary/standalone targets.
 */
export function dispatchVoiceNavigation(
  worldId: MaiaWorldId | 'studio' | null,
  command: string,
  opts?: { route?: string; label?: string; source?: 'voice-command' | 'text-command' }
): void {
  if (typeof window === 'undefined') return;

  const detail: VoiceNavigateDetail = {
    worldId,
    source: opts?.source ?? 'voice-command',
    command,
    route: opts?.route,
    label: opts?.label,
  };

  console.log(
    `🧭 [VoiceNav] Dispatching: ${detail.route ? `route=${detail.route}` : `world=${worldId}`}, command="${command}"`
  );
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
