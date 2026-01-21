/**
 * COMMS ENV CHECK API
 *
 * Diagnostic endpoint to verify encryption env vars are present.
 * Returns booleans only - no secrets exposed.
 * Protected by auth.
 */

import { NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';

// Current key version (should match DeliveryService.ts)
const CURRENT_KEY_VERSION = 1;

/**
 * GET /api/stellium/comms/env-check
 *
 * Returns presence booleans for comms encryption env vars.
 * Use this to verify production has required env vars.
 */
export async function GET() {
  try {
    // Require auth
    try {
      await requireMemberId();
    } catch {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check env var presence (booleans only, no values)
    const hasKey = Boolean(process.env.COMMS_ENCRYPTION_KEY);
    const hasKeyV1 = Boolean(process.env.COMMS_ENCRYPTION_KEY_V1);
    const hasSalt = Boolean(process.env.COMMS_ENCRYPTION_SALT);

    // For rotation: check if versioned keys exist
    const hasKeyV2 = Boolean(process.env.COMMS_ENCRYPTION_KEY_V2);

    return NextResponse.json({
      currentKeyVersion: CURRENT_KEY_VERSION,
      hasKey,
      hasKeyV1,
      hasSalt,
      hasKeyV2,
      // Derived status
      v1Ready: hasKey && hasSalt,
      v2Ready: hasKeyV2 && hasSalt,
    });
  } catch (error) {
    console.error('[Comms Env Check] Error:', error);
    return NextResponse.json({ error: 'Failed to check env' }, { status: 500 });
  }
}
