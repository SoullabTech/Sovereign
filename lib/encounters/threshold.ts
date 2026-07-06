/**
 * Encounter Threshold — participant-scoped consent capability tokens.
 *
 * Constitutional role (NATIVE_SESSION_ROOM_PHASE1_SPEC §3): consent is the threshold,
 * not a gate. A participant's `record` consent row must be authored BY that participant.
 * Since clients join as guests (no account — "relationship invites membership"), authorship
 * is established by capability: the practitioner mints a per-participant threshold link;
 * only the holder of that link can author that participant's consent.
 *
 * Token = HMAC-SHA256-signed capability. Stateless (no new table), participant-scoped,
 * expiring. Verification failure = no consent path. Requires JWT_SECRET — we throw rather
 * than fall back to a default secret (a silent fallback would be a forgeable consent gate).
 *
 * This module contains NO recorder logic. The recorder path (Phase B step 2) obtains its
 * consent_event_id from rows written here; the DB trigger
 * `enforce_record_consent_before_stream` (R-A1) refuses streams without them.
 */

import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days — a session link, not a standing credential

// The exact consent language shown at the threshold. Persisted per-consent in
// text_snapshot so the record carries what was actually agreed to, verbatim.
export const RECORD_CONSENT_TEXT =
  'I agree that my voice will be recorded during this session. ' +
  'The recording belongs to this encounter and is used to create its transcript. ' +
  'I can withdraw by ending the session at any time.';

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) {
    // Refuse loudly. A default secret here would make consent tokens forgeable.
    throw new Error('[threshold] JWT_SECRET is not set — consent tokens cannot be issued or verified');
  }
  return s;
}

export interface ThresholdClaims {
  encounterId: string;
  participantId: string;
  exp: number; // epoch ms
}

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

function sign(payload: string): string {
  return b64url(createHmac('sha256', secret()).update(payload).digest());
}

export function mintThresholdToken(encounterId: string, participantId: string, now = Date.now()): string {
  const claims: ThresholdClaims = { encounterId, participantId, exp: now + TOKEN_TTL_MS };
  const payload = b64url(Buffer.from(JSON.stringify(claims)));
  return `${payload}.${sign(payload)}`;
}

export function verifyThresholdToken(token: string, now = Date.now()): ThresholdClaims | null {
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as ThresholdClaims;
    if (!claims.encounterId || !claims.participantId) return null;
    if (typeof claims.exp !== 'number' || claims.exp < now) return null;
    return claims;
  } catch {
    return null;
  }
}
