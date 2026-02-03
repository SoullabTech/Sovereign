/**
 * COMMS ENV CHECK API
 *
 * Diagnostic endpoint to verify encryption env vars are present.
 * Returns booleans only - no secrets exposed.
 * Protected by auth + practitioner role.
 * Requires COMMS_ENV_CHECK_ENABLED=true in production.
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';

// Current key version (should match DeliveryService.ts)
const CURRENT_KEY_VERSION = 1;

/**
 * Get practitioner ID from member (mirrors credentials/route.ts pattern)
 */
async function getPractitionerForMember(memberId: string): Promise<string | null> {
  const result = await query<{ id: string }>(
    'SELECT id FROM practitioners WHERE member_id = $1',
    [memberId]
  );
  return result.rows[0]?.id || null;
}

/**
 * GET /api/stellium/comms/env-check
 *
 * Returns presence booleans for comms encryption env vars.
 * Use this to verify production has required env vars.
 */
export async function GET() {
  try {
    // Guard: require explicit opt-in for this diagnostic endpoint
    if (process.env.COMMS_ENV_CHECK_ENABLED !== 'true') {
      return NextResponse.json({ error: 'Endpoint disabled' }, { status: 403 });
    }

    // Require auth
    let memberId: string;
    try {
      memberId = await requireMemberId();
    } catch {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Require practitioner role (not just any member)
    const practitionerId = await getPractitionerForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Not a practitioner' }, { status: 403 });
    }

    // Check env var presence (booleans only, no values)
    const hasKeyBase = Boolean(process.env.COMMS_ENCRYPTION_KEY);
    const hasSaltBase = Boolean(process.env.COMMS_ENCRYPTION_SALT);

    return NextResponse.json({
      currentKeyVersion: CURRENT_KEY_VERSION,
      hasKeyBase,
      hasSaltBase,
      ready: hasKeyBase && hasSaltBase,
    });
  } catch (error) {
    console.error('[Comms Env Check] Error:', error);
    return NextResponse.json({ error: 'Failed to check env' }, { status: 500 });
  }
}
