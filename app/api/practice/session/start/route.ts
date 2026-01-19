/**
 * POST /api/practice/session/start
 *
 * Start a new practice session for a solo practitioner
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/practice/PracticeStore';

export const dynamic = 'force-static';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      practitionerId,
      title,
      clientAlias,
      modalitiesTagged,
      sessionType,
      notes,
      tags
    } = body;

    const session = await createSession({
      practitionerId,
      title,
      clientAlias,
      modalitiesTagged,
      sessionType,
      notes,
      tags
    });

    return NextResponse.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('[practice/session/start] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start session' },
      { status: 500 }
    );
  }
}
