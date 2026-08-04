/**
 * Member Tool Use API
 *
 * POST - Record that the member opened a tool from My Lab.
 *
 * Navigation memory only: records that the door was opened, nothing about
 * what happened inside. Used to surface "recently used" so the Lab can
 * answer the return test instead of resetting on every visit.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { recordToolUse } from '@/lib/services/memberToolsService';
import { getToolById } from '@/config/toolRegistry';

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { toolId } = body;

    if (!toolId || typeof toolId !== 'string') {
      return NextResponse.json({ error: 'toolId is required' }, { status: 400 });
    }

    // Only accept ids that exist in the registry -- this endpoint must not
    // become a way to write arbitrary strings into the member's tool rows.
    if (!getToolById(toolId)) {
      return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
    }

    await recordToolUse(memberId, toolId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[member-tools/use] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to record tool use' },
      { status: 500 }
    );
  }
}
