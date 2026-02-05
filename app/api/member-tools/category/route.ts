/**
 * Member Tools Category Preferences API
 *
 * POST - Toggle collapsed state or reorder categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  toggleCategoryCollapsed,
  reorderCategories,
} from '@/lib/services/memberToolsService';
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
    const { action, category, categories } = body;

    // Toggle collapsed state
    if (action === 'toggle-collapsed' && category) {
      const result = await toggleCategoryCollapsed(
        memberId,
        category as ToolCategory
      );
      return NextResponse.json({
        success: true,
        collapsed: result.collapsed,
      });
    }

    // Reorder categories
    if (action === 'reorder' && Array.isArray(categories)) {
      await reorderCategories(memberId, categories as ToolCategory[]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[member-tools/category] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update category preferences' },
      { status: 500 }
    );
  }
}
