export const dynamic = 'force-dynamic';
/**
 * GET  /api/spiralogic-report/[reportId]  — fetch one report (member or practitioner)
 * POST /api/spiralogic-report/[reportId]/download is in ./download/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } },
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportId } = params;

  try {
    // Member can access their own report.
    // Practitioner can access reports they ordered (practitioner_id = memberId).
    const result = await query(
      `SELECT id, member_id, practitioner_id, birth_data, report_data, created_at
       FROM spiralogic_reports
       WHERE id = $1
         AND (member_id = $2 OR practitioner_id = $2)`,
      [reportId, memberId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      report: {
        id: row.id,
        memberId: row.member_id,
        practitionerId: row.practitioner_id,
        birthData: row.birth_data,
        reportData: row.report_data,
        createdAt: row.created_at,
      },
    });
  } catch (err) {
    console.error('[spiralogic-report/[reportId]] fetch error:', err);
    return NextResponse.json({ error: 'Failed to load report' }, { status: 500 });
  }
}
