/**
 * Trust Observation Service — Phase 3 Behavioral Signal Capture
 *
 * Lightweight fire-and-forget writes that capture how users respond to
 * different response modes. Feeds future symbolic affinity weighting.
 *
 * Pattern: void return, .catch() swallow, never blocks oracle response.
 * Matches storeCMLayerSignal / storeThemeSignal convention.
 */

import { query } from '@/lib/db/postgres';

// ── Server-safe feature flag (no React imports) ─────────────────────
// Must be a function, not a const — Next.js evaluates module-level
// constants at build time, before runtime env vars are available.

export function isTrustObservationEnabled(): boolean {
  return process.env.TRUST_OBSERVATION === 'true';
}

// ── Types ───────────────────────────────────────────────────────────

export type ResponseType = 'evocative' | 'interpretive' | 'care' | 'direct';

export interface TrustObservation {
  memberId: string;
  sessionId?: string;
  responseType: ResponseType;
  engagementProxy: number; // 0–1
  feedback?: 'positive' | 'negative';
  context?: Record<string, unknown>;
}

// ── Fire-and-forget write ───────────────────────────────────────────

/**
 * Store a trust observation signal.
 * Returns void — cannot be awaited, swallows errors.
 * Must never interrupt oracle response path.
 */
export function storeTrustObservation(
  observation: TrustObservation
): void {
  const sql = `
    INSERT INTO trust_observations (
      member_id, session_id, response_type, engagement_proxy, feedback, context
    ) VALUES ($1, $2, $3, $4, $5, $6)
  `;

  query(sql, [
    observation.memberId,
    observation.sessionId ?? null,
    observation.responseType,
    observation.engagementProxy,
    observation.feedback ?? null,
    JSON.stringify(observation.context ?? {}),
  ]).catch((error) => {
    // Swallow — observation storage must never break oracle response
    console.warn('[trust-observation] Failed to store signal:', {
      memberId: observation.memberId,
      responseType: observation.responseType,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

// ── Engagement proxy inference ──────────────────────────────────────

/**
 * Compute a simple engagement proxy from reply characteristics.
 * Not a real engagement score — just a behavioral proxy.
 *
 * Factors:
 * - Reply length relative to a baseline (longer = more engaged)
 * - Whether user continued the conversation (follow-up turn)
 * - Conversation depth (deeper sessions = more engagement)
 *
 * Returns 0–1 float.
 */
export function inferEngagementProxy(opts: {
  replyLength: number;
  conversationDepth: number;
  hasFollowUp?: boolean;
}): number {
  const { replyLength, conversationDepth, hasFollowUp } = opts;

  // Base: reply length relative to typical message (~100 chars)
  const lengthSignal = Math.min(replyLength / 200, 1.0); // caps at 200 chars

  // Depth: deeper conversations signal engagement (caps at 10 turns)
  const depthSignal = Math.min(conversationDepth / 10, 1.0);

  // Follow-up: strong signal if user continued
  const followUpSignal = hasFollowUp ? 0.3 : 0;

  // Weighted average
  const raw = (lengthSignal * 0.4) + (depthSignal * 0.3) + followUpSignal;
  return Math.min(Math.max(raw, 0), 1); // clamp 0–1
}

// ── Classify response type from oracle context ──────────────────────

/**
 * Determine the response type from available oracle context.
 * This is a simple heuristic — will be refined as care lens and
 * evocative mode are wired in.
 */
export function classifyResponseType(opts: {
  activeFrameworks?: string[];
  careLensActive?: boolean;
  evocativeMode?: boolean;
}): ResponseType {
  if (opts.evocativeMode) return 'evocative';
  if (opts.careLensActive) return 'care';
  if (opts.activeFrameworks && opts.activeFrameworks.length > 0) return 'interpretive';
  return 'direct';
}
