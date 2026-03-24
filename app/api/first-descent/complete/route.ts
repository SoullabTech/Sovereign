/**
 * First Descent — Complete & Persist
 *
 * POST /api/first-descent/complete
 *
 * Stores the descent seed and marks the member as completed.
 * Called when the user clicks "Enter" after seeing MAIA's reply.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { storeFirstDescent } from '@/lib/consciousness/firstDescentPersistence';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { originInput, maiaReply, promptVersion, modelUsed } = body;

    if (!originInput || !maiaReply) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fire-and-forget persistence
    storeFirstDescent(session.memberId, {
      originInput,
      maiaReply,
      completedAt: new Date().toISOString(),
      promptVersion: promptVersion ?? undefined,
      modelUsed: modelUsed ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[FirstDescent] Complete error:', error);
    return NextResponse.json(
      { error: 'Failed to complete descent' },
      { status: 500 }
    );
  }
}
