/**
 * Divination Save API
 * POST /api/divination/save
 *
 * Saves a divination reading (I Ching, Tarot, or Runes) to the member's reflections
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { divinationService } from '@/lib/services/divinationService';
import type { SaveIChingInput, SaveTarotInput, SaveRunesInput, DivinationType } from '@/lib/services/divinationService';

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
    const { type, reading } = body as { type: DivinationType; reading: any };

    if (!type || !reading) {
      return NextResponse.json(
        { success: false, error: 'Missing type or reading data' },
        { status: 400 }
      );
    }

    let savedReading;

    switch (type) {
      case 'iching':
        savedReading = await divinationService.saveIChingReading(
          reading as SaveIChingInput,
          userId
        );
        break;

      case 'tarot':
        savedReading = await divinationService.saveTarotReading(
          reading as SaveTarotInput,
          userId
        );
        break;

      case 'runes':
        savedReading = await divinationService.saveRunesReading(
          reading as SaveRunesInput,
          userId
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Invalid divination type: ${type}` },
          { status: 400 }
        );
    }

    if (!savedReading) {
      return NextResponse.json(
        { success: false, error: 'Failed to save reading' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reading: savedReading,
      message: 'Reading saved to your reflections'
    });

  } catch (error) {
    console.error('[API] Error saving divination reading:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
