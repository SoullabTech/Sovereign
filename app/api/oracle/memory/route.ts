import { NextRequest, NextResponse } from 'next/server';

/**
 * Oracle Memory Stats API - Temporarily unavailable
 * Memory services are being migrated from legacy backend
 */

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Memory stats temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Memory service temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}
