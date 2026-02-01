/**
 * Voice Transcribe API Route - Thin adapter
 * All logic lives in lib/voice/handlers
 */
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Lazy import handler to avoid module-load issues
    const { transcribeHandler } = await import(
      '@/lib/voice/handlers/voiceHandlers'
    );

    const result = await transcribeHandler(formData);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err: any) {
    console.error('[Voice Transcribe]', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Use POST with multipart/form-data to transcribe audio',
      fields: {
        file: 'Audio file (required)',
        userId: 'User ID (required)',
      },
    },
    { status: 200 }
  );
}
