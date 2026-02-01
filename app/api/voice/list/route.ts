/**
 * Voice List API Route - Thin adapter
 * All logic lives in lib/voice/handlers
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Lazy import handler to avoid module-load issues
    const { listVoicesHandler } = await import(
      '@/lib/voice/handlers/voiceHandlers'
    );

    const result = await listVoicesHandler();
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[Voice List]', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
