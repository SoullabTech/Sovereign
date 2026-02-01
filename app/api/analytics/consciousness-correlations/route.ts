import { NextRequest, NextResponse } from 'next/server';

/**
 * DREAM-SLEEP-CONSCIOUSNESS CORRELATION ANALYTICS API
 *
 * Temporarily unavailable - DreamWeaver Engine is being migrated
 */

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Consciousness correlation analytics temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Consciousness correlation analytics temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}
