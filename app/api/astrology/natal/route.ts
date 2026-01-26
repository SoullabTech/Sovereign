/**
 * Natal Chart API
 *
 * GET - Retrieve member's computed natal chart
 *
 * /api/astrology/natal
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNatalChart, getBirthData } from '@/lib/astrology/astrologyService';

export const dynamic = 'force-dynamic';

function getMemberId(request: NextRequest): string | null {
  return request.headers.get('x-member-id') ||
    request.cookies.get('member_id')?.value ||
    null;
}

export async function GET(request: NextRequest) {
  try {
    const memberId = getMemberId(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if birth data exists
    const birthData = await getBirthData(memberId);
    if (!birthData) {
      return NextResponse.json({
        success: true,
        chart: null,
        message: 'No birth data found. Please set up your birth chart first.',
      });
    }

    // Get or compute natal chart
    const chart = await getNatalChart(memberId);

    return NextResponse.json({
      success: true,
      chart,
      birthData: {
        date: birthData.birthDate,
        time: birthData.birthTime,
        location: birthData.birthLocationName,
        houseSystem: birthData.houseSystem,
      },
    });
  } catch (error) {
    console.error('[Astrology] Get natal chart error:', error);
    return NextResponse.json(
      { error: 'Failed to get natal chart' },
      { status: 500 }
    );
  }
}
