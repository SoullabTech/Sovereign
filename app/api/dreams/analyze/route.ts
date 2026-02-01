/**
 * Dream Analysis API Route - Thin adapter
 * All logic lives in lib/dreams/handlers
 */
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Lazy import handler to avoid module-load issues
    const { analyzeDreamHandler } = await import(
      '@/lib/dreams/handlers/analyzeDream'
    );

    const result = await analyzeDreamHandler(body);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err: any) {
    console.error('[Dreams Analyze]', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST to analyze dreams.' },
    { status: 405 }
  );
}
