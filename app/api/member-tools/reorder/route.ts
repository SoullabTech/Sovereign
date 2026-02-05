/**
 * Member Tools Reorder API
 *
 * POST - Reorder tools within a category
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { reorderTools } from '@/lib/services/memberToolsService';
import { type ToolCategory } from '@/config/toolRegistry';

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
    const { category, toolIds } = body;

    if (!category || !Array.isArray(toolIds)) {
      return NextResponse.json(
        { error: 'category and toolIds[] are required' },
        { status: 400 }
      );
    }

    await reorderTools(memberId, category as ToolCategory, toolIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[member-tools/reorder] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder tools' },
      { status: 500 }
    );
  }
}
