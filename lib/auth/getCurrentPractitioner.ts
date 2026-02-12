import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from './getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export type StudioMode = 'personal' | 'practice';

export interface PractitionerIdentity {
  memberId: string;
  practitionerId: string;
  practitionerSlug: string;
  practitionerName: string;
  portalType: string;
  enabledModules: string[] | null;
  studioMode: StudioMode;
}

/**
 * Get the current practitioner from a request.
 *
 * Flow:
 * 1. Extract member ID from request (header or cookie)
 * 2. Look up practitioner linked to that member
 * 3. Return full identity context for scoped queries
 *
 * @returns PractitionerIdentity if authenticated practitioner, null otherwise
 */
export async function getCurrentPractitioner(
  request: NextRequest
): Promise<PractitionerIdentity | null> {
  // Get member ID from request
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return null;
  }

  // Look up practitioner by member_id
  const result = await query(
    `SELECT
       p.id as practitioner_id,
       p.slug,
       p.name,
       p.portal_type,
       p.enabled_modules,
       p.studio_mode
     FROM practitioners p
     WHERE p.member_id = $1
       AND p.status = 'active'
     LIMIT 1`,
    [memberId]
  );

  if (result.rows.length === 0) {
    // Member exists but is not a practitioner
    return null;
  }

  const row = result.rows[0];
  return {
    memberId,
    practitionerId: row.practitioner_id,
    practitionerSlug: row.slug,
    practitionerName: row.name,
    portalType: row.portal_type ?? 'generalist',
    enabledModules: row.enabled_modules ?? null,
    studioMode: (row.studio_mode === 'personal' ? 'personal' : 'practice') as StudioMode,
  };
}

/**
 * Require practitioner authentication.
 * Use this in routes that need practitioner access.
 *
 * @throws Returns a 401/403 response if not authenticated or not a practitioner
 */
export async function requirePractitioner(
  request: NextRequest
): Promise<{ identity: PractitionerIdentity } | { error: Response }> {
  const identity = await getCurrentPractitioner(request);

  if (!identity) {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return {
        error: new Response(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        ),
      };
    }
    // Member exists but not a practitioner
    return {
      error: new Response(
        JSON.stringify({ success: false, error: 'Not a practitioner' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return { identity };
}
