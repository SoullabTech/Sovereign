export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * POST /api/scribe/start
 *
 * Create a new scribe session with the specified container type.
 * Returns the session with consent_status='pending'.
 */

import { NextRequest, NextResponse } from 'next/server';
import { insertOne } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';

export async function POST(request: NextRequest) {
  try {
    // Auth: Get member ID from session
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      container = 'solo',
      participants = [],
      memoryPolicy = 'sealed',
    } = body;

    // Validate container
    if (!['solo', 'witness', 'practitioner'].includes(container)) {
      return NextResponse.json(
        { error: 'Invalid container type', code: 'INVALID_CONTAINER' },
        { status: 400 }
      );
    }

    // Create session
    const session = await insertOne('scribe_sessions', {
      member_id: memberId,
      container,
      participants: JSON.stringify(participants),
      memory_policy: memoryPolicy,
      consent_status: 'pending',
      is_active: true,
      transcript_enabled: false,
    });

    console.log(`[Scribe] Started ${container} session: ${session.id} for member ${memberId}`);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        container: session.container,
        startedAt: session.started_at,
        consentStatus: session.consent_status,
      },
      consentRequired: true,
    });
  } catch (error: any) {
    console.error('[Scribe] Start session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start session', code: 'START_FAILED' },
      { status: 500 }
    );
  }
}
