import { NextResponse } from 'next/server';
import { requireFounder } from '@/lib/founder/founderAuth';
import { loadLearningReport } from '@/lib/constellation/learningReportServer';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

/** Read-only founder report. URL parameters cannot choose dates, segments, or people. */
export async function GET() {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers });
  }
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501, headers });
  }
  const report = await loadLearningReport();
  return NextResponse.json(report, {
    status: report.source.state === 'unavailable' ? 503 : 200, headers,
  });
}
