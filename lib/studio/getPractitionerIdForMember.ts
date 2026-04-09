/**
 * Studio practitioner resolver
 *
 * Maps an authenticated member_id → their active practitioner_id.
 *
 * This replaces a previous pattern where many Studio routes hardcoded
 * a single practitioner slug ('stellium') or a dev UUID, which meant
 * Studio edits went to the wrong practitioner row regardless of who
 * was logged in. See app/api/studio/** for usage.
 *
 * Sovereignty: PostgreSQL via lib/db/postgres.ts. No Supabase.
 */

import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import type { NextRequest } from 'next/server';

/**
 * Look up the active practitioner for a given member_id.
 * Returns null if the member is not a practitioner or no active row exists.
 */
export async function getPractitionerIdForMember(
  memberId: string | null | undefined,
): Promise<string | null> {
  if (!memberId) return null;

  try {
    const result = await query(
      `SELECT id FROM practitioners
       WHERE member_id = $1 AND status = 'active'
       LIMIT 1`,
      [memberId],
    );
    return result.rows[0]?.id ?? null;
  } catch (error) {
    console.error('[getPractitionerIdForMember] lookup failed', { memberId, error });
    return null;
  }
}

/**
 * Convenience: extract member ID from the request and resolve to practitioner ID
 * in one call. Returns null if unauthenticated or not a practitioner.
 *
 * Use this in Studio routes that only need the practitioner ID (not the full
 * identity). For the full identity object (slug, name, portalType, enabled
 * modules, studio mode), use getCurrentPractitioner from lib/auth instead.
 */
export async function getPractitionerIdFromRequest(
  request: NextRequest,
): Promise<{ memberId: string; practitionerId: string } | null> {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return null;

  const practitionerId = await getPractitionerIdForMember(memberId);
  if (!practitionerId) return null;

  return { memberId, practitionerId };
}
