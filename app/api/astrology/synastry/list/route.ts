/**
 * Synastry API
 *
 * POST /api/astrology/synastry
 *   Calculate cross-chart aspects between two people's birth charts.
 *   Supports both member IDs (fetches from DB) and raw birth data.
 *   Request body:
 *     a: { memberId: string } | { birth: { date, time?, timezone?, lat?, lng? } }
 *     b: { memberId: string } | { birth: { date, time?, timezone?, lat?, lng? } }
 *     options?: { aspects?, orbs?, includeAngles?, includeNodes?, maxAspects? }
 *     persist?: boolean - Save result for later retrieval
 *     requestedByMemberId?: string - Member who requested (for audit)
 *
 * GET /api/astrology/synastry?analysisId=<uuid>
 *   Retrieve a previously persisted synastry analysis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { calculateBirthChart, type BirthData, type BirthChart } from '@/lib/astrology/ephemerisCalculator';
import { calculateSynastryFromCharts, chartToLongitudes } from '@/lib/astrology/synastry/calculateSynastry';
import type { SynastryRequest, SynastryResponse, SynastryOptions } from '@/lib/astrology/synastry/types';
import { createSynastryAnalysis, getSynastryAnalysisById } from '@/lib/astrology/synastry/synastryStore';

export const dynamic = 'force-dynamic';

interface MemberBirthRow {
  id: string;
  birth_date: string | null;
  birth_time: string | null;
  birth_location_lat: number | null;
  birth_location_lng: number | null;
  birth_timezone: string | null;
}

/**
 * Fetch member birth data from database
 */
async function getMemberBirthData(memberId: string): Promise<BirthData | null> {
  const result = await query<MemberBirthRow>(
    `SELECT id, birth_date, birth_time, birth_location_lat, birth_location_lng, birth_timezone
     FROM members
     WHERE id = $1`,
    [memberId]
  );

  const row = result.rows[0];
  if (!row || !row.birth_date) {
    return null;
  }

  // birth_date comes as Date object from pg, convert to string
  const dateStr = typeof row.birth_date === 'object' && row.birth_date !== null
    ? (row.birth_date as Date).toISOString().split('T')[0]
    : String(row.birth_date);

  // birth_time might be null (unknown birth time)
  const timeStr = row.birth_time ? String(row.birth_time).slice(0, 5) : '12:00'; // Default to noon if unknown

  return {
    date: dateStr,
    time: timeStr,
    location: {
      lat: row.birth_location_lat ?? 0,
      lng: row.birth_location_lng ?? 0,
      timezone: row.birth_timezone ?? undefined,
    },
  };
}

/**
 * Build BirthData from raw birth object in request
 */
function buildBirthDataFromRaw(birth: NonNullable<SynastryRequest['a']['birth']>): BirthData {
  return {
    date: birth.date,
    time: birth.time ?? '12:00', // Default to noon if unknown
    location: {
      lat: birth.lat ?? 0,
      lng: birth.lng ?? 0,
      timezone: birth.timezone ?? undefined,
    },
  };
}

/**
 * Get chart summary info for response
 */
function getChartSummary(chart: BirthChart, memberId?: string) {
  return {
    memberId,
    sunSign: chart.sun.sign,
    moonSign: chart.moon.sign,
    ascendantSign: chart.ascendant.sign,
  };
}

/**
 * GET - Retrieve a persisted synastry analysis by ID
 */
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('analysisId');

    if (!analysisId) {
      return NextResponse.json({
        success: false,
        error: 'analysisId query parameter is required',
      }, { status: 400 });
    }

    const row = await getSynastryAnalysisById(analysisId);

    if (!row) {
      return NextResponse.json({
        success: false,
        error: `Analysis ${analysisId} not found`,
      }, { status: 404 });
    }

    // Return the stored result with metadata
    // Guarantee success:true even if older rows are missing it
    const result = row.result as Record<string, unknown>;
    return NextResponse.json({
      success: (result as Record<string, unknown>).success ?? true,
      ...result,
      analysisId: row.id,
      persistedAt: row.created_at,
      updatedAt: row.updated_at,
      savedAt: row.saved_at, // null if not saved to timeline
    });

  } catch (error) {
    console.error('[Synastry API] GET error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve synastry analysis',
    }, { status: 500 });
  }
}

/**
 * POST - Calculate synastry between two charts (with optional persistence)
 */
export async function POST(request: NextRequest) {
  try {
    const body: SynastryRequest = await request.json();

    // Validate request structure
    if (!body.a || !body.b) {
      return NextResponse.json({
        success: false,
        error: 'Both "a" and "b" chart sources are required',
      } as SynastryResponse, { status: 400 });
    }

    // Resolve chart A
    let birthDataA: BirthData | null = null;
    let memberIdA: string | undefined;

    if (body.a.memberId) {
      memberIdA = body.a.memberId;
      birthDataA = await getMemberBirthData(body.a.memberId);
      if (!birthDataA) {
        return NextResponse.json({
          success: false,
          error: `Member ${body.a.memberId} not found or has no birth data`,
        } as SynastryResponse, { status: 404 });
      }
    } else if (body.a.birth) {
      if (!body.a.birth.date) {
        return NextResponse.json({
          success: false,
          error: 'a.birth.date is required when using raw birth data',
        } as SynastryResponse, { status: 400 });
      }
      birthDataA = buildBirthDataFromRaw(body.a.birth);
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either "a.memberId" or "a.birth" is required',
      } as SynastryResponse, { status: 400 });
    }

    // Resolve chart B
    let birthDataB: BirthData | null = null;
    let memberIdB: string | undefined;

    if (body.b.memberId) {
      memberIdB = body.b.memberId;
      birthDataB = await getMemberBirthData(body.b.memberId);
      if (!birthDataB) {
        return NextResponse.json({
          success: false,
          error: `Member ${body.b.memberId} not found or has no birth data`,
        } as SynastryResponse, { status: 404 });
      }
    } else if (body.b.birth) {
      if (!body.b.birth.date) {
        return NextResponse.json({
          success: false,
          error: 'b.birth.date is required when using raw birth data',
        } as SynastryResponse, { status: 400 });
      }
      birthDataB = buildBirthDataFromRaw(body.b.birth);
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either "b.memberId" or "b.birth" is required',
      } as SynastryResponse, { status: 400 });
    }

    // Calculate both birth charts
    console.log('[Synastry API] Calculating chart A...');
    const chartA = await calculateBirthChart(birthDataA);

    console.log('[Synastry API] Calculating chart B...');
    const chartB = await calculateBirthChart(birthDataB);

    // Build notes for missing data
    const notes: string[] = [];
    if (!body.a.birth?.time && !body.a.memberId) {
      notes.push('a_missing_birth_time_using_noon');
    }
    if (!body.b.birth?.time && !body.b.memberId) {
      notes.push('b_missing_birth_time_using_noon');
    }

    // Calculate synastry
    console.log('[Synastry API] Calculating synastry aspects...');
    const options: SynastryOptions = body.options ?? {};
    const synastry = calculateSynastryFromCharts(chartA, chartB, options);

    // Add any notes
    synastry.notes.push(...notes);

    console.log(`[Synastry API] Found ${synastry.aspects.length} aspects, ${synastry.highlights.length} highlights`);

    // Build response payload
    const responsePayload = {
      success: true,
      synastry,
      chartA: getChartSummary(chartA, memberIdA),
      chartB: getChartSummary(chartB, memberIdB),
    };

    // Persist if requested
    if (body.persist) {
      console.log('[Synastry API] Persisting analysis...');
      const saved = await createSynastryAnalysis({
        aMemberId: memberIdA ?? null,
        bMemberId: memberIdB ?? null,
        aBirth: body.a.birth ?? null,
        bBirth: body.b.birth ?? null,
        requestedByMemberId: body.requestedByMemberId ?? null,
        result: responsePayload,
      });
      console.log(`[Synastry API] Persisted as ${saved.id}`);

      return NextResponse.json({
        ...responsePayload,
        analysisId: saved.id,
        persistedAt: saved.created_at,
      } as SynastryResponse);
    }

    return NextResponse.json(responsePayload as SynastryResponse);

  } catch (error) {
    console.error('[Synastry API] Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate synastry',
    } as SynastryResponse, { status: 500 });
  }
}
