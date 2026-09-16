/**
 * Check Passkey Endpoint
 *
 * Check if passkey exists in database.
 * Used to determine if user is new or returning.
 *
 * ROBUST DESIGN:
 * - Works even if invites table doesn't exist
 * - SOULLAB-* passkeys always allowed (admin passkeys)
 * - Falls back gracefully on missing columns
 * - Detailed error logging for debugging
 */

import { Request, Response } from 'express';
import { query } from '../../db/postgres.js';
import { Errors } from '../../middleware/error.js';
import { hashInvitePasskey, normalizeInvitePasskey } from '../../security/inviteCredential.js';


// SOURCE-CUSTODY-PII-01 — process-local containment for the public check oracle.
// Five attempts per IP per 15 minutes. This is deliberately bounded in memory
// and fails closed for new identifiers if the map is saturated. It is not a
// substitute for the eventual revocable hashed-invite architecture.
const CHECK_WINDOW_MS = 15 * 60 * 1000;
const CHECK_MAX_ATTEMPTS = 5;
const CHECK_GLOBAL_MAX = 500;
const CHECK_MAX_TRACKED = 10_000;
type CheckBucket = { count: number; windowStart: number };
const checkBuckets = new Map<string, CheckBucket>();
let globalCheckBucket: CheckBucket = { count: 0, windowStart: Date.now() };

function allowCheckAttempt(identifier: string): boolean {
  const now = Date.now();
  if (now - globalCheckBucket.windowStart >= CHECK_WINDOW_MS) {
    globalCheckBucket = { count: 0, windowStart: now };
  }
  if (globalCheckBucket.count >= CHECK_GLOBAL_MAX) return false;

  let bucket = checkBuckets.get(identifier);
  if (bucket && now - bucket.windowStart >= CHECK_WINDOW_MS) {
    checkBuckets.delete(identifier);
    bucket = undefined;
  }
  if (!bucket) {
    if (checkBuckets.size >= CHECK_MAX_TRACKED) {
      for (const [key, candidate] of checkBuckets) {
        if (now - candidate.windowStart >= CHECK_WINDOW_MS) checkBuckets.delete(key);
      }
    }
    if (checkBuckets.size >= CHECK_MAX_TRACKED) return false;
    bucket = { count: 0, windowStart: now };
    checkBuckets.set(identifier, bucket);
  }
  if (bucket.count >= CHECK_MAX_ATTEMPTS) return false;
  bucket.count += 1;
  globalCheckBucket.count += 1;
  return true;
}

// Safe query that returns empty result on table/column errors
async function safeQuery(sql: string, params: unknown[] = []): Promise<{ rows: Record<string, unknown>[]; error?: string }> {
  try {
    const result = await query(sql, params);
    return { rows: result.rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Log but don't throw - return empty result
    if (message.includes('does not exist') || message.includes('column')) {
      console.warn(`[MEMBERS] Query skipped (missing table/column): ${message}`);
      return { rows: [], error: message };
    }
    throw error; // Re-throw unexpected errors
  }
}

export async function checkPasskey(req: Request, res: Response) {
  res.set({ 'Cache-Control': 'no-store, no-cache, must-revalidate, private', Pragma: 'no-cache' });
  if (!allowCheckAttempt(req.ip || 'unknown')) {
    return res.status(429).json({
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Unable to check passkey. Please try again.' },
    });
  }

  const { passkey } = req.body;

  if (!passkey) {
    throw Errors.badRequest('Passkey required');
  }

  const normalizedPasskey = normalizeInvitePasskey(passkey);

  // Check if passkey exists in members table (returning user)
  const memberResult = await safeQuery(
    'SELECT onboarded FROM members WHERE passkey = $1',
    [normalizedPasskey]
  );

  if (memberResult.rows.length > 0) {
    const member = memberResult.rows[0];
    console.log('[MEMBERS] Existing member matched');
    return res.json({
      success: true,
      data: {
        exists: true,
        isInvite: false,
        onboarded: Boolean(member.onboarded)
      }
    });
  }

  // Check if this is a valid invite passkey (new user with invite).
  // DEPLOYMENT-ORDER BRIDGE: production swaps readers before applying schema
  // migrations. If and only if the hash column is absent, consult the legacy
  // plaintext column for an already-issued invite. After R12 migration this
  // fallback is unreachable because the column exists and plaintext is cleared.
  let inviteResult = await safeQuery(
    `SELECT i.id, i.status, i.expires_at
     FROM invites i
     WHERE i.passkey_hash = $1`,
    [hashInvitePasskey(normalizedPasskey)]
  );
  if (inviteResult.error && /passkey_hash.*does not exist/i.test(inviteResult.error)) {
    inviteResult = await safeQuery(
      `SELECT i.id, i.status, i.expires_at
       FROM invites i
       WHERE i.passkey = $1`,
      [normalizedPasskey]
    );
  }

  if (!inviteResult.error && inviteResult.rows.length > 0) {
    const invite = inviteResult.rows[0];

    // Check if invite is valid
    if (invite.status !== 'pending') {
      return res.json({
        success: true,
        data: {
          exists: false,
          isInvite: true,
          inviteStatus: invite.status,
          error: `This invite has already been ${invite.status}`
        }
      });
    }

    // Check if expired
    if (invite.expires_at && new Date(invite.expires_at as string) < new Date()) {
      return res.json({
        success: true,
        data: {
          exists: false,
          isInvite: true,
          inviteStatus: 'expired',
          error: 'This invite has expired'
        }
      });
    }

    // Valid invite - user can register with this passkey
    console.log('[MEMBERS] Valid invite matched');
    return res.json({
      success: true,
      data: {
        exists: false,
        isInvite: true,
        inviteStatus: 'valid',
      }
    });
  }

  // Unknown passkey
  console.log('[MEMBERS] Unknown passkey');
  return res.json({
    success: true,
    data: {
      exists: false,
      isInvite: false,
      error: 'Invalid passkey. Contact support for a valid passkey.'
    }
  });
}
