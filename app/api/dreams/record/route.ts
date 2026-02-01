/**
 * Dream Recording API Route - Thin adapter
 * All logic lives in lib/dreams/handlers
 */
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Lazy import handler to avoid module-load issues
    const { recordDreamHandler } = await import(
      '@/lib/dreams/handlers/recordDream'
    );

    const result = await recordDreamHandler(body);
    return NextResponse.json(result, { status: result.ok ? 201 : 400 });
  } catch (err: any) {
    console.error('[Dreams Record]', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST to record dreams.' },
    { status: 405 }
  );
}
