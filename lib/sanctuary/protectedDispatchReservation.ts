/**
 * RF01 S1-C: one atomic, insert-once reservation to attempt external
 * protected turn. No prompt, reply, hashes, or downstream content retained.
 *
 * Always checked at the Anthropic SDK adapter, even for bypassing callers.
 * A failed/unknown provider attempt remains reserved: uncertain egress is NOT
 * replayed automatically; the writer must make a new deliberate turn.\n * Privileged deletion and recovery are separately governed by R1; no claim\n * here implies that database rows are physically undeletable.
 *
 * S1-A conversation ingress HOLD is NOT lifted by this facility.
 */
import { query } from '@/lib/db/postgres';
import { validExchangeId, EXPLICIT_PREFLIGHT_SOURCE } from './explicitTurnConsent';
import { S1B_DISCLOSURE, S1B_PROVIDER, S1B_PURPOSE } from './externalProcessingGrant';

export const S1C_DISPATCH_CONTRACT = 'rf01-s1c-protected-text-once-v1' as const;

export type DispatchReservation =
  | { ok: true; contract: typeof S1C_DISPATCH_CONTRACT }
  | { ok: false; code: 'PROTECTED_DISPATCH_HELD' | 'INVALID_DISPATCH_IDENTITY' |
      'DISPATCH_ALREADY_RESERVED_OR_UNAUTHORIZED' | 'DISPATCH_DATABASE_UNAVAILABLE' };

export class ProtectedDispatchRefusal extends Error {
  readonly code = 'PROTECTED_DISPATCH_NOT_AUTHORIZED';
  constructor() {
    super('PROTECTED_DISPATCH_NOT_AUTHORIZED');
    this.name = 'ProtectedDispatchRefusal';
  }
}

/** Exact, content-free, first-writer wins; no retry invokes a second provider. */
export async function reserveProtectedTextDispatch(input: {
  memberId: unknown;
  sessionId: unknown;
  exchangeId: unknown;
}): Promise<DispatchReservation> {
  // Separate default-off approval. A valid S1-B grant is not sufficient for
  // dispatch; only a separately qualified S1-C release may enable this.
  if (process.env.RF01_S1C_DISPATCH_RESERVATIONS_ENABLED !== '1') {
    return { ok: false, code: 'PROTECTED_DISPATCH_HELD' };
  }
  if (typeof input.memberId !== 'string' || !input.memberId.trim() ||
      typeof input.sessionId !== 'string' || !input.sessionId.trim() ||
      input.sessionId.length > 200 || !validExchangeId(input.exchangeId)) {
    return { ok: false, code: 'INVALID_DISPATCH_IDENTITY' };
  }

  try {
    const reservation = await query<{ request_id: string }>(
      'INSERT INTO runtime_processing_dispatch_reservations ' +
      '(request_id,member_id,session_id,processor,purpose,dispatch_contract) ' +
      'SELECT g.request_id,g.member_id,g.session_id,g.processor,g.purpose,$7 ' +
      'FROM runtime_processing_grants g ' +
      'JOIN runtime_consent_state c ON c.request_id=g.request_id ' +
      'JOIN maia_sessions s ON s.id=g.session_id ' +
      'WHERE g.request_id=$1 AND g.member_id=$2 AND g.session_id=$3 ' +
      'AND g.processor=$4 AND g.purpose=$5 ' +
      'AND g.disclosure_version=$6 ' +
      'AND c.member_id=g.member_id AND c.session_id=g.session_id ' +
      "AND c.posture='sanctuary' AND c.resolved_from=$8 " +
      "AND c.resolved_at >= NOW()-INTERVAL '15 minutes' " +
      "AND c.resolved_at <= NOW()+INTERVAL '30 seconds' " +
      "AND s.member_id=g.member_id AND s.status='active' " +
      'AND g.expires_at>NOW() AND g.granted_at<=NOW() ' +
      'ON CONFLICT (request_id) DO NOTHING RETURNING request_id',
      [input.exchangeId,input.memberId,input.sessionId,S1B_PROVIDER,
        S1B_PURPOSE,S1B_DISCLOSURE,S1C_DISPATCH_CONTRACT,EXPLICIT_PREFLIGHT_SOURCE],
    );
    if (reservation.rows[0]?.request_id !== input.exchangeId) {
      return { ok: false, code: 'DISPATCH_ALREADY_RESERVED_OR_UNAUTHORIZED' };
    }
    return { ok: true, contract: S1C_DISPATCH_CONTRACT };
  } catch {
    return { ok: false, code: 'DISPATCH_DATABASE_UNAVAILABLE' };
  }
}

/**
 * SDK adapter gate, not the HTTP route: any direct call with a valid grant
 * can reserve only ONE provider attempt. Consent is verified separately.
 */
export async function requireProtectedTextDispatch(meta?: Record<string, unknown>):
  Promise<void> {
  if (meta?.sanctuary !== true) return;
  const reserved = await reserveProtectedTextDispatch({
    memberId: meta?.userId,
    sessionId: meta?.sessionId,
    exchangeId: meta?.exchangeId,
  });
  if (!reserved.ok) throw new ProtectedDispatchRefusal();
}
