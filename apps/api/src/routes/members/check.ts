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

// Check if passkey is an admin passkey (always allowed even without invites table)
function isAdminPasskey(passkey: string): boolean {
  const adminPrefixes = ['SOULLAB-', 'MAIA-', 'PIONEER-', 'FOUNDING-'];
  return adminPrefixes.some(prefix => passkey.toUpperCase().startsWith(prefix));
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
  const { passkey } = req.body;

  if (!passkey) {
    throw Errors.badRequest('Passkey required');
  }

  const normalizedPasskey = passkey.toUpperCase().trim();
  console.log(`[MEMBERS] Check passkey: ${normalizedPasskey}`);

  // Check if passkey exists in members table (returning user)
  const memberResult = await safeQuery(
    'SELECT id, username, name, onboarded, onboarding_step FROM members WHERE passkey = $1',
    [normalizedPasskey]
  );

  if (memberResult.rows.length > 0) {
    const member = memberResult.rows[0];
    console.log(`[MEMBERS] Found existing member: ${member.username}`);
    return res.json({
      success: true,
      data: {
        exists: true,
        isInvite: false,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
        username: member.username,
        name: member.name
      }
    });
  }

  // Check if this is a valid invite passkey (new user with invite)
  // This query is optional - might fail if invites table doesn't exist
  const inviteResult = await safeQuery(
    `SELECT i.id, i.status, i.expires_at, m.username as inviter_username, m.name as inviter_name
     FROM invites i
     LEFT JOIN members m ON i.created_by = m.id
     WHERE i.passkey = $1`,
    [normalizedPasskey]
  );

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
    console.log(`[MEMBERS] Valid invite found for: ${normalizedPasskey}`);
    return res.json({
      success: true,
      data: {
        exists: false,
        isInvite: true,
        inviteStatus: 'valid',
        inviterName: invite.inviter_name,
        inviterUsername: invite.inviter_username,
      }
    });
  }

  // If invites table is missing OR no invite found, check if it's an admin passkey
  // Admin passkeys are always allowed for registration
  if (isAdminPasskey(normalizedPasskey)) {
    console.log(`[MEMBERS] Admin passkey allowed: ${normalizedPasskey}`);
    return res.json({
      success: true,
      data: {
        exists: false,
        isInvite: true,  // Treat as valid invite
        inviteStatus: 'valid',
        isAdminPasskey: true,
      }
    });
  }

  // Unknown passkey
  console.log(`[MEMBERS] Unknown passkey: ${normalizedPasskey}`);
  return res.json({
    success: true,
    data: {
      exists: false,
      isInvite: false,
      error: 'Invalid passkey. Contact support for a valid passkey.'
    }
  });
}
