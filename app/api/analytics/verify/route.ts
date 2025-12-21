import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const [sysRes, csvRes, researchRes] = await Promise.all([
      fetch(`${baseUrl}/api/analytics/system`),
      fetch(`${baseUrl}/api/analytics/export/csv`),
      fetch(`${baseUrl}/api/analytics/export/research`),
    ]);

    const sys = sysRes.ok ? await sysRes.json() : null;
    const csv = csvRes.ok;
    const research = researchRes.ok;

    return NextResponse.json({
      ok: sys && csv && research,
      results: {
        system: sys ? 'ok' : 'fail',
        csv: csv ? 'ok' : 'fail',
        research: research ? 'ok' : 'fail',
      },
      system_summary: sys?.system || {},
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
