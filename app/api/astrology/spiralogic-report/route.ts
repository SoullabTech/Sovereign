/**
 * Spiralogic Evolutionary Report API
 *
 * POST — generate (or regenerate) a report from birth data
 * GET  — retrieve the stored report for the authenticated member
 *
 * Auth: requireMemberId() handles cookie + x-session-token + x-member-id headers
 * DB:  member_astrology_reports table (one row per member, upsert on regenerate)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { query } from '@/lib/db/postgres';
import { generateSpiralogicReport, type BirthInput } from '@/lib/astrology/spiralogicReportGenerator';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET — retrieve stored report
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest): Promise<NextResponse> {
  let memberId: string;
  try {
    memberId = await requireMemberId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query<{ report_data: unknown; generated_at: string }>(
      `SELECT report_data, generated_at
       FROM member_astrology_reports
       WHERE member_id = $1
       ORDER BY generated_at DESC
       LIMIT 1`,
      [memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No report found' }, { status: 404 });
    }

    return NextResponse.json({
      report: result.rows[0].report_data,
      generatedAt: result.rows[0].generated_at,
    });
  } catch (err) {
    console.error('[SpiralogicReport] GET failed:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — generate report from birth data
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  let memberId: string;
  try {
    memberId = await requireMemberId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { birthDate, birthTime, lat, lng, locationName, timezone } = body as {
    birthDate?: string;
    birthTime?: string;
    lat?: number;
    lng?: number;
    locationName?: string;
    timezone?: string;
  };

  if (!birthDate || !birthTime || lat === undefined || lng === undefined || !locationName || !timezone) {
    return NextResponse.json(
      { error: 'Missing required fields: birthDate, birthTime, lat, lng, locationName, timezone' },
      { status: 400 }
    );
  }

  // Fetch member name for personalisation
  let memberName = 'Explorer';
  try {
    const memberResult = await query<{ name: string; preferred_name: string | null }>(
      `SELECT name, preferred_name FROM members WHERE id = $1 LIMIT 1`,
      [memberId]
    );
    if (memberResult.rows.length > 0) {
      memberName = resolveMemberDisplayName(memberResult.rows[0]);
    }
  } catch (err) {
    console.warn('[SpiralogicReport] Could not fetch member name, using fallback:', err);
  }

  const birth: BirthInput = {
    date: String(birthDate),
    time: String(birthTime),
    lat: Number(lat),
    lng: Number(lng),
    locationName: String(locationName),
    timezone: String(timezone),
  };

  // Generate report
  let reportData;
  try {
    reportData = await generateSpiralogicReport(birth, memberName);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[SpiralogicReport] Generation failed:', err);
    return NextResponse.json({ error: 'Report generation failed', detail: message }, { status: 500 });
  }

  // Upsert into DB — non-fatal; we still return the report even if storage fails
  try {
    await query(
      `INSERT INTO member_astrology_reports
         (member_id, birth_data_snapshot, report_data, report_version, generated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (member_id) DO UPDATE SET
         birth_data_snapshot = EXCLUDED.birth_data_snapshot,
         report_data         = EXCLUDED.report_data,
         report_version      = EXCLUDED.report_version,
         generated_at        = EXCLUDED.generated_at`,
      [
        memberId,
        JSON.stringify(birth),
        JSON.stringify(reportData),
        '1.0',
      ]
    );
  } catch (err) {
    console.error('[SpiralogicReport] DB upsert failed (report still returned):', err);
  }

  return NextResponse.json({ report: reportData }, { status: 200 });
}
