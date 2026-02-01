/**
 * Oracle Trust API Route - Thin adapter
 * All logic lives in lib/oracle/handlers
 */
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Lazy import handler to avoid module-load issues
    const { getOracleTrustHandler } = await import(
      '@/lib/oracle/handlers/oracleHandlers'
    );

    const result = await getOracleTrustHandler(req);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[Oracle Trust GET]', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: err?.message?.includes('required') ? 400 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Lazy import handler
    const { recordOracleTrustFeedbackHandler } = await import(
      '@/lib/oracle/handlers/oracleHandlers'
    );

    const result = await recordOracleTrustFeedbackHandler(body);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[Oracle Trust POST]', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 400 }
    );
  }
}
