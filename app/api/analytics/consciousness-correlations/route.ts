/**
 * Consciousness Correlations API Route - Thin adapter
 * All logic lives in lib/analytics/handlers
 */
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Lazy import handler to avoid module-load issues
    const { correlationsHandler } = await import(
      '@/lib/analytics/handlers/analyticsHandlers'
    );

    const result = await correlationsHandler(body);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[Analytics Correlations POST]', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Lazy import handler
    const { getCorrelationsHandler } = await import(
      '@/lib/analytics/handlers/analyticsHandlers'
    );

    const result = await getCorrelationsHandler(userId);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[Analytics Correlations GET]', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    { ok: false, error: 'PUT not yet implemented for correlations' },
    { status: 501 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed.' },
    { status: 405 }
  );
}
