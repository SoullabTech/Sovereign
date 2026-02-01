import { NextRequest, NextResponse } from "next/server";

/**
 * Voice Transcription API - Temporarily unavailable
 * Memory and Llama services are being migrated from legacy backend
 */

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Voice transcription temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}

export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to transcribe voice.' },
    { status: 405 }
  );
}
