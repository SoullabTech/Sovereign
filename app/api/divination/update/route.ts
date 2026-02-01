/**
 * Divination Update API
 * POST /api/divination/update
 *
 * Updates a saved reading (favorite, notes, archive)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { divinationService } from '@/lib/services/divinationService';
import type { DivinationType } from '@/lib/services/divinationService';

// Get user ID from various sources
async function getUserId(request: NextRequest): Promise<string | null> {
  // Check x-member-id header (Capacitor)
  const memberId = request.headers.get('x-member-id');
  if (memberId) return memberId;

  // Check cookies
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user_id');
  if (userCookie?.value) return userCookie.value;

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
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
