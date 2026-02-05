/**
 * Member Tools API
 *
 * GET  - Get member's enabled tools (hydrated with full tool data)
 * POST - Add or remove a tool
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  getHydratedToolsState,
  addTool,
  removeTool,
} from '@/lib/services/memberToolsService';

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const tools = await getHydratedToolsState(memberId);

    return NextResponse.json({
      success: true,
      categories: tools,
    });
  } catch (error) {
    console.error('[member-tools] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load tools' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, toolId } = body;

    if (!toolId || typeof toolId !== 'string') {
      return NextResponse.json(
        { error: 'toolId is required' },
        { status: 400 }
      );
    }

    if (action === 'add') {
      const result = await addTool(memberId, toolId);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, action: 'added' });
    }

    if (action === 'remove') {
      await removeTool(memberId, toolId);
      return NextResponse.json({ success: true, action: 'removed' });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "add" or "remove".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[member-tools] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update tools' },
      { status: 500 }
    );
  }
}
