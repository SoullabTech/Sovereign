import { NextRequest, NextResponse } from 'next/server';

/**
 * Oracle Trust Metrics API - Temporarily unavailable
 * PersonalOracleAgent is being migrated from legacy backend
 */

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Trust metrics temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Trust metrics temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}
