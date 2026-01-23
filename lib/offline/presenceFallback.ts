/**
 * Presence Fallback for Offline / Server Unreachable
 *
 * When the network is down or the server can't be reached,
 * MAIA remains present through warm, reflective responses
 * generated entirely on-device.
 *
 * This is the foundation of the free-tier local-first experience.
 */

import { buildSafeLocalResponse } from '@/lib/ai/safe-local-model';

/**
 * Check if we're probably online.
 * navigator.onLine is imperfect but good enough as a first gate.
 */
export function isProbablyOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
}

/**
 * Context for generating presence responses
 */
export interface PresenceContext {
  userText: string;
  mode?: 'support' | 'clarity' | 'vent';
  preferredName?: string;
  threadSummary?: string;
}

/**
 * Generate a warm, present response when the server is unreachable.
 * Uses consciousness templates from safe-local-model.
 */
export function generatePresenceFallback(ctx: PresenceContext): string {
  return buildSafeLocalResponse({
    input: ctx.userText,
    mode: ctx.mode ?? 'support',
    preferredName: ctx.preferredName,
    threadSummary: ctx.threadSummary,
  });
}

/**
 * Result shape for presence-aware API calls
 */
export interface PresenceAwareResult {
  ok: boolean;
  isFallback: boolean;
  text: string;
  debug?: {
    status?: number;
    error?: string;
    reason?: 'offline' | 'network_error' | 'server_error';
  };
}

/**
 * Check if a result indicates we're in presence/fallback mode
 */
export function isPresenceMode(result: PresenceAwareResult): boolean {
  return result.isFallback === true;
}
