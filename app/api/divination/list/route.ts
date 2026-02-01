/**
 * Divination List API
 * GET /api/divination/list
 *
 * Lists saved divination readings for the member
 * Supports filtering by type and favorites
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

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as DivinationType | null;
    const favorites = searchParams.get('favorites') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let readings;

    if (favorites) {
      readings = await divinationService.getFavoriteReadings(userId);
    } else if (type) {
      switch (type) {
        case 'iching':
          readings = await divinationService.getIChingReadings(userId, limit);
          break;
        case 'tarot':
          readings = await divinationService.getTarotReadings(userId, limit);
          break;
        case 'runes':
          readings = await divinationService.getRunesReadings(userId, limit);
          break;
        default:
          return NextResponse.json(
            { success: false, error: `Invalid type: ${type}` },
            { status: 400 }
          );
      }
    } else {
      readings = await divinationService.getAllReadings(userId, limit);
    }

    return NextResponse.json({
      success: true,
      readings,
      count: readings.length
    });

  } catch (error) {
    console.error('[API] Error listing divination readings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
