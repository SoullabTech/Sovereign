import { NextRequest, NextResponse } from 'next/server';

/**
 * Dream Recording API - Temporarily unavailable
 * DreamWeaver Engine is being migrated from legacy backend
 */

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Dream recording temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}

export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to record dreams.' },
    { status: 405 }
  );
}
