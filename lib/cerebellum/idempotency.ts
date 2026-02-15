/**
 * Idempotency — Making retries harmless.
 *
 * Every emission gets a deterministic idempotency key derived from:
 * - Turn identity (who, when, which turn)
 * - Emission identity (what kind, what scope)
 * - Payload structure (hash of structural metadata, NEVER raw text)
 *
 * A retry of the same client turn produces the SAME key.
 * The DB sink uses ON CONFLICT (idempotency_key) DO NOTHING.
 * Result: duplicate emissions are silently absorbed.
 *
 * IMPORTANT: Never hash raw conversation text here.
 * Hash structural/metadata only.
 */

import crypto from 'crypto';
import type { TurnContext, EmitSpec } from './types';

/**
 * Stable hash helper.
 * IMPORTANT: Do not hash raw conversation text here.
 * Hash structural/metadata only.
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Deterministic idempotency key.
 * A retry of the same client turn produces the SAME key.
 *
 * Normalization guarantees:
 * - Always exactly 32 lowercase hex characters (derived from SHA-256)
 * - No whitespace, no case variance, no encoding surprises
 * - Safe to index, compare, and log
 *
 * @param ctx - Turn context (provides member, session, turn identity)
 * @param spec - Emission spec (provides emission identity)
 * @returns 32-char lowercase hex string, collision-resistant for this use case
 */
export function buildIdempotencyKey(ctx: TurnContext, spec: EmitSpec): string {
  const parts = [
    ctx.idemSeed.trim(),
    ctx.memberId.trim(),
    (ctx.sessionId ?? '').trim(),
    ctx.turnId.trim(),
    spec.name.trim(),
    spec.scope.trim(),
    (spec.subtype ?? '').trim(),
    (spec.payloadHash ?? '').trim(),
  ].join('|');

  // 32 lowercase hex chars — bounded, deterministic, index-friendly
  return sha256(parts).slice(0, 32);
}

/**
 * Build a deterministic turnId if client didn't provide one.
 * Prefer a clientTurnId if you have it (recommended).
 *
 * @param params.inputShapeHash - hash of structural shape, NOT text content
 */
export function fallbackTurnId(params: {
  memberId: string;
  sessionId?: string;
  clientTsMs?: number;
  inputShapeHash?: string; // hash of structure, NOT text content
}): string {
  const base = [
    params.memberId,
    params.sessionId ?? '',
    String(params.clientTsMs ?? 0),
    params.inputShapeHash ?? '',
  ].join('|');

  return sha256(base).slice(0, 24);
}
