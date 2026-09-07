/**
 * GOOGLE OAUTH STATE — a transaction, not an identity.
 * ====================================================
 *
 * The callback previously read the member id straight out of the `state`
 * parameter:
 *
 *     const state = searchParams.get('state'); // userId
 *     await storeTokens(state, tokens);
 *
 * OAuth `state` is a CSRF and transaction-binding instrument. It was being used
 * as IDENTITY. Conflating the two lets anyone who can reach the callback name
 * the account that receives the tokens — complete a Google consent for their
 * own Google account, put someone else's id in `state`, and that member's row
 * now holds an attacker-controlled credential.
 *
 * Here the state is opaque and the identity lives server-side. The URL carries
 * a lookup key and nothing else, so there is nothing in it worth forging.
 *
 * This is the same shape as MAIL-04a's destination rule, one axis over:
 *
 *     MAIL-03/04a  a caller may not choose the DESTINATION of a send
 *     MAIL-04c     a caller may not choose the SENDING IDENTITY
 *
 * Both are instances of: authority is derived from a verified session, never
 * asserted by the request.
 */

import { randomBytes } from 'crypto';
import { query } from '@/lib/db/postgres';

/**
 * An OAuth round trip is a redirect, a consent screen and a redirect back —
 * seconds to a minute or two. Ten minutes is generous for a slow human and
 * still far too short to be worth farming.
 */
const STATE_TTL_MINUTES = 10;

/** 256 bits. The state must be unguessable; it is the only thing in the URL. */
function mintStateValue(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Begin an OAuth transaction for a VERIFIED member.
 *
 * The caller must pass an id it resolved from a session — never one it read
 * from a request body. This function cannot tell the difference, which is why
 * the routes are where that rule is enforced and tested.
 */
export async function beginOAuthTransaction(
  memberId: string,
  initiatedIp?: string
): Promise<string> {
  if (!memberId) throw new Error('[MAIA/oauth] refusing to begin a transaction with no member');

  const state = mintStateValue();
  await query(
    `INSERT INTO google_oauth_state (state, member_id, expires_at, initiated_ip)
     VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval, $4)`,
    [state, memberId, String(STATE_TTL_MINUTES), initiatedIp ?? null]
  );
  return state;
}

export type OAuthStateResolution =
  | { ok: true; memberId: string }
  | { ok: false; reason: 'unknown' | 'expired' | 'replayed' };

/**
 * Redeem a state exactly once and return the member bound to it.
 *
 * Consumption is atomic: the UPDATE only matches a row that is unexpired AND
 * unconsumed, so two concurrent callbacks cannot both succeed. Doing this as
 * SELECT-then-UPDATE would leave a window where a replayed callback races the
 * original and both store tokens.
 *
 * The three refusals are kept distinct rather than collapsed into a boolean:
 * "replayed" is a security event worth seeing, "expired" is usually a person
 * who left the tab open, and "unknown" is a forged or truncated value. They
 * warrant different responses and must not look alike in the logs.
 */
export async function consumeOAuthState(state: string): Promise<OAuthStateResolution> {
  if (!state) return { ok: false, reason: 'unknown' };

  const claimed = await query(
    `UPDATE google_oauth_state
        SET consumed_at = NOW()
      WHERE state = $1
        AND consumed_at IS NULL
        AND expires_at > NOW()
      RETURNING member_id`,
    [state]
  );

  if (claimed.rows.length === 1) {
    return { ok: true, memberId: claimed.rows[0].member_id };
  }

  // Nothing claimed. Distinguish why, from the row's own state.
  const existing = await query(
    `SELECT consumed_at, expires_at <= NOW() AS is_expired
       FROM google_oauth_state WHERE state = $1`,
    [state]
  );

  if (existing.rows.length === 0) return { ok: false, reason: 'unknown' };
  if (existing.rows[0].consumed_at) return { ok: false, reason: 'replayed' };
  return { ok: false, reason: 'expired' };
}
