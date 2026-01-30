// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { generateFourPillars, calculateElementalBalance, type FourPillarsProfile } from '@/app/api/_backend/src/services/fourPillarsService';
import type { WuXingElement } from '@/lib/consciousness/wuxingBridge';

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

// Generate correlation ID for request tracking
function generateCorrelationId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

// Check if error is a database connection error
function isDbConnectionError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('connection') ||
      msg.includes('econnrefused') ||
      msg.includes('timeout') ||
      msg.includes('socket') ||
      msg.includes('pg_hba.conf')
    );
  }
  return false;
}

// Map from service Element type to lowercase WuXingElement
function toWuxingElement(el: string): WuXingElement {
  return el.toLowerCase() as WuXingElement;
}

// Compute element percentages from tally
function computePercentages(tally: Record<string, number>): Record<string, number> {
  const total = Object.values(tally).reduce((a, b) => a + b, 0);
  if (total === 0) return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  return {
    wood: (tally.Wood / total) * 100,
    fire: (tally.Fire / total) * 100,
    earth: (tally.Earth / total) * 100,
    metal: (tally.Metal / total) * 100,
    water: (tally.Water / total) * 100,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/members/bazi-profile
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/members/bazi-profile
 * Get member's computed BaZi (Four Pillars) profile
 *
 * Authentication:
 *   - Session cookie only (HttpOnly, secure)
 *   - Server decides who you are - no client-provided identity
 *
 * Returns:
 * - 200: BaZi profile found
 * - 204: No profile computed yet (birth data may be missing)
 * - 401: Auth required
 * - 503: Database unavailable
 */
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const headers = { 'X-Correlation-ID': correlationId };

  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true }, { headers });
  }

  try {
    // Get identity from session cookie only - server decides who you are
    const session = await getCurrentSession();
    const memberId = session?.memberId ?? null;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Session required', code: 'NO_SESSION', action: 'signin', correlationId },
        { status: 401, headers }
      );
    }

    // Query BaZi profile
    let result;
    try {
      result = await query(
        `SELECT * FROM member_bazi_profile WHERE user_id = $1`,
        [memberId]
      );
    } catch (dbError) {
      console.error(`[BaZi API] ${correlationId} - Database error:`, dbError);
      const retryAfter = isDbConnectionError(dbError) ? '5' : '10';
      return NextResponse.json(
        {
          error: 'Database temporarily unavailable',
          correlationId,
          retryAfter: parseInt(retryAfter) * 1000,
        },
        { status: 503, headers: { ...headers, 'Retry-After': retryAfter } }
      );
    }

    // No profile yet
    if (result.rows.length === 0) {
      return new NextResponse(null, { status: 204, headers });
    }

    const row = result.rows[0];

    return NextResponse.json({
      id: row.id,
      userId: row.user_id,
      birthDatetimeUtc: row.birth_datetime_utc,
      birthTimezone: row.birth_timezone,
      locationText: row.location_text,
      pillars: row.pillars_json,
      dayMaster: row.day_master,
      dayMasterElement: row.day_master_element,
      dayMasterYinYang: row.day_master_yinyang,
      wuxingBalance: row.wuxing_balance_json,
      wuxingPercentages: row.wuxing_percentages_json,
      dominantElements: row.dominant_elements,
      deficientElements: row.deficient_elements,
      balanceScore: row.balance_score,
      tenGods: row.ten_gods_json,
      luckCycles: row.luck_cycles_json,
      computationVersion: row.computation_version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      correlationId,
    }, { headers });

  } catch (error) {
    console.error(`[BaZi API] ${correlationId} - Unexpected error:`, error);
    return NextResponse.json(
      { error: 'Internal server error', correlationId },
      { status: 500, headers }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/members/bazi-profile
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/members/bazi-profile
 * Compute and store BaZi profile from birth data
 *
 * Request body:
 * - birthDatetimeUtc: ISO timestamp of birth in UTC
 * - birthTimezone: IANA timezone of birth location (e.g., "America/New_York")
 * - locationText?: Optional human-readable birth location
 *
 * If no body is provided, will attempt to use birth data from member profile.
 *
 * Returns:
 * - 200: Profile computed and stored
 * - 400: Missing birth data
 * - 401: Auth required
 * - 503: Database unavailable
 */
export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const headers = { 'X-Correlation-ID': correlationId };

  try {
    // Get identity from session
    const session = await getCurrentSession();
    const memberId = session?.memberId ?? null;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Session required', code: 'NO_SESSION', action: 'signin', correlationId },
        { status: 401, headers }
      );
    }

    // Parse request body
    let body: {
      birthDatetimeUtc?: string;
      birthTimezone?: string;
      locationText?: string;
    } = {};

    try {
      body = await request.json().catch(() => ({}));
    } catch {
      // Empty body is OK - we'll try to use member profile data
    }

    let birthDatetimeUtc = body.birthDatetimeUtc;
    let birthTimezone = body.birthTimezone;
    let locationText = body.locationText;

    // If no birth data in body, try to get from member profile
    if (!birthDatetimeUtc || !birthTimezone) {
      try {
        const memberResult = await query(
          `SELECT birth_date, birth_time, birth_timezone, birth_location_name
           FROM members WHERE id = $1`,
          [memberId]
        );

        if (memberResult.rows.length > 0) {
          const member = memberResult.rows[0];

          if (member.birth_date) {
            // Construct datetime from date and optional time
            const dateStr = typeof member.birth_date === 'string'
              ? member.birth_date.split('T')[0]
              : new Date(member.birth_date).toISOString().split('T')[0];
            const timeStr = member.birth_time || '12:00'; // Default to noon if no time
            birthDatetimeUtc = `${dateStr}T${timeStr}:00Z`;
            birthTimezone = member.birth_timezone || 'UTC';
            locationText = locationText || member.birth_location_name;
          }
        }
      } catch (err) {
        console.warn(`[BaZi API] ${correlationId} - Could not fetch member birth data:`, err);
      }
    }

    // Validate required data
    if (!birthDatetimeUtc || !birthTimezone) {
      return NextResponse.json(
        {
          error: 'Birth date and timezone required',
          code: 'MISSING_BIRTH_DATA',
          hint: 'Update your profile with birth date or provide birthDatetimeUtc and birthTimezone in request body',
          correlationId
        },
        { status: 400, headers }
      );
    }

    // Parse birth datetime
    const birthDate = new Date(birthDatetimeUtc);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid birth datetime format', correlationId },
        { status: 400, headers }
      );
    }

    // Compute Four Pillars using the existing service
    // Calculate timezone offset in minutes
    let tzOffsetMinutes = 0;
    try {
      // Get offset for the birth timezone at birth time
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: birthTimezone,
        timeZoneName: 'shortOffset'
      });
      const parts = formatter.formatToParts(birthDate);
      const tzPart = parts.find(p => p.type === 'timeZoneName')?.value || 'UTC';

      // Parse offset like "GMT-5" or "GMT+8"
      const match = tzPart.match(/GMT([+-])(\d+)/);
      if (match) {
        const sign = match[1] === '+' ? 1 : -1;
        tzOffsetMinutes = sign * parseInt(match[2]) * 60;
      }
    } catch (err) {
      console.warn(`[BaZi API] ${correlationId} - Could not parse timezone, using UTC:`, err);
    }

    const fourPillars: FourPillarsProfile = generateFourPillars(birthDate, tzOffsetMinutes);
    const balanceScore = Math.round(calculateElementalBalance(fourPillars));

    // Transform to database format
    const pillarsJson = {
      year: { stem: fourPillars.year.stem, branch: fourPillars.year.branch },
      month: { stem: fourPillars.month.stem, branch: fourPillars.month.branch },
      day: { stem: fourPillars.day.stem, branch: fourPillars.day.branch },
      hour: { stem: fourPillars.hour.stem, branch: fourPillars.hour.branch },
    };

    // Day Master is the day pillar's stem
    const dayMaster = fourPillars.day.stem;
    const dayMasterElement = toWuxingElement(fourPillars.day.element);
    const dayMasterYinYang = fourPillars.day.yinYang.toLowerCase() as 'yin' | 'yang';

    // Transform element tally to lowercase keys
    const wuxingBalance: Record<string, number> = {};
    for (const [key, val] of Object.entries(fourPillars.elementTally)) {
      wuxingBalance[key.toLowerCase()] = val;
    }

    const wuxingPercentages = computePercentages(fourPillars.elementTally);

    // Transform dominant/deficient to lowercase
    const dominantElements = fourPillars.dominant.map(e => e.toLowerCase() as WuXingElement);
    const deficientElements = fourPillars.deficient.map(e => e.toLowerCase() as WuXingElement);

    // Upsert into database
    try {
      const result = await query(
        `INSERT INTO member_bazi_profile (
          user_id, birth_datetime_utc, birth_timezone, location_text,
          pillars_json, day_master, day_master_element, day_master_yinyang,
          wuxing_balance_json, wuxing_percentages_json,
          dominant_elements, deficient_elements, balance_score,
          computation_version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (user_id) DO UPDATE SET
          birth_datetime_utc = EXCLUDED.birth_datetime_utc,
          birth_timezone = EXCLUDED.birth_timezone,
          location_text = EXCLUDED.location_text,
          pillars_json = EXCLUDED.pillars_json,
          day_master = EXCLUDED.day_master,
          day_master_element = EXCLUDED.day_master_element,
          day_master_yinyang = EXCLUDED.day_master_yinyang,
          wuxing_balance_json = EXCLUDED.wuxing_balance_json,
          wuxing_percentages_json = EXCLUDED.wuxing_percentages_json,
          dominant_elements = EXCLUDED.dominant_elements,
          deficient_elements = EXCLUDED.deficient_elements,
          balance_score = EXCLUDED.balance_score,
          computation_version = EXCLUDED.computation_version,
          updated_at = NOW()
        RETURNING *`,
        [
          memberId,
          birthDate.toISOString(),
          birthTimezone,
          locationText || null,
          JSON.stringify(pillarsJson),
          dayMaster,
          dayMasterElement,
          dayMasterYinYang,
          JSON.stringify(wuxingBalance),
          JSON.stringify(wuxingPercentages),
          dominantElements,
          deficientElements,
          balanceScore,
          'v1'
        ]
      );

      const row = result.rows[0];

      return NextResponse.json({
        success: true,
        profile: {
          id: row.id,
          userId: row.user_id,
          birthDatetimeUtc: row.birth_datetime_utc,
          birthTimezone: row.birth_timezone,
          locationText: row.location_text,
          pillars: row.pillars_json,
          dayMaster: row.day_master,
          dayMasterElement: row.day_master_element,
          dayMasterYinYang: row.day_master_yinyang,
          wuxingBalance: row.wuxing_balance_json,
          wuxingPercentages: row.wuxing_percentages_json,
          dominantElements: row.dominant_elements,
          deficientElements: row.deficient_elements,
          balanceScore: row.balance_score,
          computationVersion: row.computation_version,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        },
        correlationId,
      }, { headers });

    } catch (dbError) {
      console.error(`[BaZi API] ${correlationId} - Database error on upsert:`, dbError);
      const retryAfter = isDbConnectionError(dbError) ? '5' : '10';
      return NextResponse.json(
        {
          error: 'Database temporarily unavailable',
          correlationId,
          retryAfter: parseInt(retryAfter) * 1000,
        },
        { status: 503, headers: { ...headers, 'Retry-After': retryAfter } }
      );
    }

  } catch (error) {
    console.error(`[BaZi API] ${correlationId} - Unexpected error:`, error);
    return NextResponse.json(
      { error: 'Internal server error', correlationId },
      { status: 500, headers }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/members/bazi-profile
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * DELETE /api/members/bazi-profile
 * Remove BaZi profile (consent withdrawal)
 */
export async function DELETE(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const headers = { 'X-Correlation-ID': correlationId };

  try {
    const session = await getCurrentSession();
    const memberId = session?.memberId ?? null;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Session required', code: 'NO_SESSION', action: 'signin', correlationId },
        { status: 401, headers }
      );
    }

    try {
      await query(
        `DELETE FROM member_bazi_profile WHERE user_id = $1`,
        [memberId]
      );

      return NextResponse.json({
        success: true,
        message: 'BaZi profile deleted',
        correlationId,
      }, { headers });

    } catch (dbError) {
      console.error(`[BaZi API] ${correlationId} - Database error on delete:`, dbError);
      const retryAfter = isDbConnectionError(dbError) ? '5' : '10';
      return NextResponse.json(
        {
          error: 'Database temporarily unavailable',
          correlationId,
          retryAfter: parseInt(retryAfter) * 1000,
        },
        { status: 503, headers: { ...headers, 'Retry-After': retryAfter } }
      );
    }

  } catch (error) {
    console.error(`[BaZi API] ${correlationId} - Unexpected error:`, error);
    return NextResponse.json(
      { error: 'Internal server error', correlationId },
      { status: 500, headers }
    );
  }
}
