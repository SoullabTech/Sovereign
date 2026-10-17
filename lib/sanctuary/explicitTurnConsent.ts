/**
 * RF01 S0-B: a stored account default, UI cache, and bare request boolean are
 * NOT authority for content retention. Only a separate authenticated,
 * member-authored consent preflight may confer this turn's privacy posture.
 * The receipt is immutable, session/member-bound, and short-lived.
 *
 * This covers per-turn remembrance authority ONLY. It does not authorize
 * external model/speech processing or future developmental inference.
 */
import { query } from '@/lib/db/postgres';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { requireConsentState, consentEstablished } from '@/lib/provenance/requireConsentState';

export const EXPLICIT_PREFLIGHT_SOURCE = 'member-explicit-preflight-v1' as const;
export const MAX_PREFLIGHT_AGE_MS = 15 * 60 * 1000;
export type PrivacyChoice = 'continuity' | 'sanctuary';

export function validExchangeId(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function establishExplicitTurnConsent(input: {
  memberId: string;
  sessionId: string;
  exchangeId: string;
  privacyChoice: PrivacyChoice;
  explicitRemembrance?: boolean;
}): Promise<{ ok: true; sanctuary: boolean } | { ok: false; code: string }> {
  if (!input.memberId || !input.sessionId || !validExchangeId(input.exchangeId)) {
    return { ok: false, code: 'INVALID_CONSENT_IDENTITY' };
  }
  if (input.privacyChoice !== 'continuity' && input.privacyChoice !== 'sanctuary') {
    return { ok: false, code: 'PRIVACY_CHOICE_REQUIRED' };
  }
  // Separate affirmative authority for lasting memory. The mere absence of
  // Sanctuary is never enough to confer it.
  if (input.privacyChoice === 'continuity' && input.explicitRemembrance !== true) {
    return { ok: false, code: 'REMEMBRANCE_CONSENT_REQUIRED' };
  }
  const posture = TurnPosture.resolve({
    sanctuary: input.privacyChoice === 'sanctuary',
  });
  const outcome = await requireConsentState({
    requestId: input.exchangeId,
    posture,
    memberId: input.memberId,
    sessionId: input.sessionId,
    resolvedFrom: EXPLICIT_PREFLIGHT_SOURCE,
  });
  if (!consentEstablished(outcome)) {
    return { ok: false, code: outcome.kind === 'identity_mismatch'
      ? 'CONSENT_IDENTITY_CONFLICT' : 'CONSENT_UNAVAILABLE' };
  }
  // A prior exact receipt can be too old for a new Send. Re-read the immutable
  // row even on retries, rather than issuing a false fresh authorization.
  const verified = await verifyExplicitTurnConsent({
    memberId: input.memberId,
    sessionId: input.sessionId,
    exchangeId: input.exchangeId,
    sanctuary: posture.sanctuary,
  });
  if (!verified.ok) return verified;
  return { ok: true, sanctuary: posture.sanctuary };
}

export async function verifyExplicitTurnConsent(input: {
  memberId: string;
  sessionId: string;
  exchangeId: string;
  sanctuary: boolean;
}): Promise<{ ok: true } | { ok: false; code: string }> {
  if (!input.memberId || !input.sessionId || !validExchangeId(input.exchangeId)) {
    return { ok: false, code: 'CONSENT_RECEIPT_REQUIRED' };
  }
  try {
    const result = await query<{
      member_id: string | null;
      session_id: string | null;
      posture: string;
      resolved_from: string;
      resolved_at: Date | string;
    }>(
      'SELECT member_id, session_id, posture, resolved_from, resolved_at ' +
      'FROM runtime_consent_state WHERE request_id = $1 LIMIT 1',
      [input.exchangeId],
    );
    const receipt = result.rows[0];
    if (!receipt) return { ok: false, code: 'CONSENT_RECEIPT_REQUIRED' };
    if (receipt.member_id !== input.memberId ||
        receipt.session_id !== input.sessionId ||
        receipt.posture !== (input.sanctuary ? 'sanctuary' : 'normal') ||
        receipt.resolved_from !== EXPLICIT_PREFLIGHT_SOURCE) {
      return { ok: false, code: 'CONSENT_IDENTITY_CONFLICT' };
    }
    const ageMs = Date.now() - new Date(receipt.resolved_at).getTime();
    if (!Number.isFinite(ageMs) || ageMs < -30_000 || ageMs > MAX_PREFLIGHT_AGE_MS) {
      return { ok: false, code: 'CONSENT_RECEIPT_EXPIRED' };
    }
    return { ok: true };
  } catch {
    return { ok: false, code: 'CONSENT_UNAVAILABLE' };
  }
}
