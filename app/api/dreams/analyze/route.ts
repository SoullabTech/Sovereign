import { NextRequest, NextResponse } from 'next/server';

/**
 * Dream Analysis API - Temporarily unavailable
 * DreamWeaver Engine is being migrated from legacy backend
 */

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Dream analysis temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}

export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to analyze dreams.' },
    { status: 405 }
  );
}
