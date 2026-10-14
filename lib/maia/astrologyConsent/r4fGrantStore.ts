/**
 * ASTRO-R4F: isolated, server-owned issuance and one-use consumption.
 * No route is permitted to use the grant to contact a model until all
 * persistence, derivative-memory and client-cache paths are accepted.
 */
import { randomUUID } from 'node:crypto';
import { query, transaction } from '@/lib/db/postgres';
import {
  isValidMemberPassage,
  mintR4fOpaqueGrant, sha256Exact, hmacPassageExact,
} from './r4fPolicy';

export type IssuedR4fGrant = {
  token: string;
  sessionId: string;
  expiresAt: string;
  scope: 'conversation_only';
};

export class R4fDenied extends Error {
  constructor(public readonly code: string) {
    super('r4f_permission_refused');
    this.name = 'R4fDenied';
  }
}

function passageDigestKey(): string {
  // No weak default or unkeyed fallback; secret is outside restorable DB.
  const key = process.env.ASTRO_R4F_PASSAGE_HMAC_KEY || '';
  if (Buffer.byteLength(key, 'utf8') < 32)
    throw new R4fDenied('passage_key_unavailable');
  return key;
}

export async function issueR4fGrant(
  memberId: string,
  exactReviewedText: unknown,
): Promise<IssuedR4fGrant> {
  if (!memberId || !isValidMemberPassage(exactReviewedText))
    throw new R4fDenied('invalid_request');
  const digestKey = passageDigestKey();
  const { token, tokenSha256, sessionId } = mintR4fOpaqueGrant();
  const id = randomUUID();
  const expiresAt = await transaction(async (tx): Promise<Date> => {
    const eligible = await tx.query<{ astrology_consent: string | null }>(
      'SELECT astrology_consent FROM members WHERE id = $1 FOR SHARE', [memberId]);
    if (eligible.rows[0]?.astrology_consent !== 'opted_in')
      throw new R4fDenied('chart_consent_required');
    // One PostgreSQL timestamp avoids clock-skew and check-constraint races.
    const written = await tx.query<{ expires_at: Date }>(
      `WITH stamp AS (SELECT clock_timestamp() AS moment)
       INSERT INTO astro_maia_transfer_grants
         (id, member_id, session_id, token_sha256, text_hmac_sha256, scope, issued_at, expires_at)
       SELECT $1::uuid, $2::uuid, $3, $4, $5, 'conversation_only',
              stamp.moment, stamp.moment + interval '5 minutes'
         FROM stamp
       RETURNING expires_at`,
      [id, memberId, sessionId, tokenSha256, hmacPassageExact(exactReviewedText, digestKey)],
    );
    if (written.rows.length !== 1) throw new R4fDenied('grant_store_unavailable');
    return new Date(written.rows[0].expires_at);
  });
  return { token, sessionId, expiresAt: expiresAt.toISOString(), scope: 'conversation_only' };
}

/**
 * Single atomic status transition. A racing second Send, wrong member, changed
 * text, expired token or withdrawn chart consent never receives a session.
 * INTERNAL ONLY. Must be called before MAIA acceptance and before any model
 * transfer; not exposed as a client-controllable consuming endpoint.
 */
export async function consumeR4fGrant(
  memberId: string,
  exactReviewedText: unknown,
  token: unknown,
): Promise<{ sessionId: string }> {
  if (!memberId || !isValidMemberPassage(exactReviewedText) ||
      typeof token !== 'string' || token.length < 32 || token.length > 256)
    throw new R4fDenied('invalid_request');
  const digestKey = passageDigestKey();
  const result = await query<{ session_id: string }>(
    `UPDATE astro_maia_transfer_grants AS g
     SET status = 'consumed', consumed_at = clock_timestamp()
     WHERE g.member_id = $1::uuid
       AND g.token_sha256 = $2
       AND g.text_hmac_sha256 = $3
       AND g.status = 'issued'
       AND g.expires_at > clock_timestamp()
       AND EXISTS (
         SELECT 1 FROM members AS m
         WHERE m.id = g.member_id AND m.astrology_consent = 'opted_in'
       )
     RETURNING g.session_id`,
    [memberId, sha256Exact(token), hmacPassageExact(exactReviewedText, digestKey)],
  );
  if (result.rows.length !== 1) throw new R4fDenied('grant_unavailable');
  return { sessionId: result.rows[0].session_id };
}

/** An origin remains protected after expiry, consumption or revocation. */
export async function revokeR4fGrant(memberId: string, sessionId: string): Promise<boolean> {
  if (!memberId || !sessionId) return false;
  const result = await query(
    `UPDATE astro_maia_transfer_grants SET status = 'revoked',
       revoked_at = clock_timestamp()
     WHERE member_id = $1::uuid AND session_id = $2
       AND status IN ('issued', 'consumed')`,
    [memberId, sessionId],
  );
  return result.rowCount === 1;
}

export async function isR4fProtectedSession(
  memberId: string, sessionId: string,
): Promise<boolean> {
  if (!memberId || !sessionId) return false;
  // A missing registry/migration is an error, never proof that a message is safe.
  const result = await query(
    'SELECT 1 FROM astro_maia_transfer_grants WHERE member_id = $1::uuid AND session_id = $2 LIMIT 1',
    [memberId, sessionId],
  );
  return result.rows.length > 0;
}


/**
 * Session-wide protection lookup. Identity is checked separately when any
 * positive grant is consumed; ordinary MAIA routes must refuse an existing
 * protected ID even if the caller claims a DIFFERENT member.
 */
export async function isR4fProtectedSessionById(sessionId: string): Promise<boolean> {
  if (!sessionId) return false;
  const result = await query(
    'SELECT 1 FROM (SELECT session_id FROM astro_maia_protected_origins UNION ALL SELECT session_id FROM astro_maia_transfer_grants) AS protected WHERE protected.session_id = $1 LIMIT 1',
    [sessionId],
  );
  return result.rows.length > 0;
}
