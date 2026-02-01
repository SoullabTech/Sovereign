/**
 * Divination Update API
 * POST /api/divination/update
 *
 * Updates a saved reading (favorite, notes, archive)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { divinationService } from '@/lib/services/divinationService';
import type { DivinationType } from '@/lib/services/divinationService';

export async function POST(request: NextRequest) {
  try {
    // Use centralized auth that handles cookies + session token header
    let userId: string;
    try {
      userId = await requireMemberId();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, readingId, action, value } = body as {
      type: DivinationType;
      readingId: string;
      action: 'favorite' | 'notes' | 'archive';
      value?: any;
    };

    if (!type || !readingId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let success = false;

    switch (action) {
      case 'favorite':
        success = await divinationService.toggleFavorite(type, readingId, !!value);
        break;

      case 'notes':
        if (typeof value !== 'string') {
          return NextResponse.json(
            { success: false, error: 'Notes must be a string' },
            { status: 400 }
          );
        }
        success = await divinationService.updateNotes(type, readingId, value);
        break;

      case 'archive':
        success = await divinationService.archiveReading(type, readingId);
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update reading' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Reading ${action} updated`
    });

  } catch (error) {
    console.error('[API] Error updating divination reading:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
