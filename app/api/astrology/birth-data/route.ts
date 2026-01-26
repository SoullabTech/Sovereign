/**
 * Birth Data API
 *
 * GET  - Retrieve member's birth data
 * POST - Save/update member's birth data
 * DELETE - Remove member's birth data
 *
 * /api/astrology/birth-data
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  saveBirthData,
  getBirthData,
  deleteBirthData,
  computeAndCacheChart
} from '@/lib/astrology/astrologyService';

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

    const birthData = await getBirthData(memberId);

    return NextResponse.json({
      success: true,
      birthData,
    });
  } catch (error) {
    console.error('[Astrology] Get birth data error:', error);
    return NextResponse.json(
      { error: 'Failed to get birth data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = getMemberId(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.date || !body.locationName || body.latitude === undefined || body.longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: date, locationName, latitude, longitude' },
        { status: 400 }
      );
    }

    await saveBirthData({
      memberId,
      birthDate: body.date,
      birthTime: body.time || null,
      birthLocationName: body.locationName,
      latitude: body.latitude,
      longitude: body.longitude,
      timezone: body.timezone || 'UTC',
      houseSystem: body.houseSystem || 'placidus',
      consentAstrology: body.consent ?? true,
    });

    // Compute chart immediately
    const birthData = await getBirthData(memberId);
    let chart = null;
    if (birthData) {
      chart = await computeAndCacheChart(memberId, birthData);
    }

    return NextResponse.json({
      success: true,
      chart,
    });
  } catch (error) {
    console.error('[Astrology] Save birth data error:', error);
    return NextResponse.json(
      { error: 'Failed to save birth data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const memberId = getMemberId(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await deleteBirthData(memberId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Astrology] Delete birth data error:', error);
    return NextResponse.json(
      { error: 'Failed to delete birth data' },
      { status: 500 }
    );
  }
}
