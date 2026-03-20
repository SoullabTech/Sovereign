export const dynamic = 'force-dynamic';
/**
 * POST /api/spiralogic-report/[reportId]/download
 *
 * Generates and streams a PDF of the Spiralogic Evolutionary Report.
 * Uses the existing SpiralogicReportPdfService (jsPDF-based).
 *
 * Auth: getMemberIdFromRequest (x-member-id or memberId cookie)
 * Note: jsPDF runs server-side (Node.js); the Blob is converted to a Buffer.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export async function POST(
  request: NextRequest,
  { params }: { params: { reportId: string } },
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportId } = params;

  // Load the report (member or practitioner access)
  let row: { birth_data: any; report_data: any } | null = null;
  try {
    const result = await query(
      `SELECT birth_data, report_data
       FROM spiralogic_reports
       WHERE id = $1
         AND (member_id = $2 OR practitioner_id = $2)`,
      [reportId, memberId],
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    row = result.rows[0];
  } catch (err) {
    console.error('[spiralogic-report/download] DB error:', err);
    return NextResponse.json({ error: 'Failed to load report' }, { status: 500 });
  }

  // Generate PDF via existing service
  try {
    const { SpiralogicReportPdfService } =
      await import('@/app/api/_backend/src/services/spiralogicReportPdfService');

    const pdfService = new SpiralogicReportPdfService();
    const pdfBlob: Blob = await pdfService.generateReport(
      row.report_data,
      row.birth_data,
    );

    // Convert Blob to Buffer for Next.js response
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Derive a clean filename
    const name = (row.birth_data?.name ?? 'report').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const date = new Date().toISOString().slice(0, 10);
    const filename = `spiralogic-evolutionary-report-${name}-${date}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.byteLength),
      },
    });
  } catch (err) {
    console.error('[spiralogic-report/download] PDF generation error:', err);
    return NextResponse.json(
      { error: 'PDF generation failed', detail: String(err) },
      { status: 500 },
    );
  }
}
