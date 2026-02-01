/**
 * Divination Save API
 * POST /api/divination/save
 *
 * Saves a divination reading (I Ching, Tarot, or Runes) to the member's reflections
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { divinationService } from '@/lib/services/divinationService';
import type { SaveIChingInput, SaveTarotInput, SaveRunesInput, DivinationType } from '@/lib/services/divinationService';

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
