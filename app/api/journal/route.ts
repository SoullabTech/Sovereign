import { NextRequest, NextResponse } from "next/server";

// Force dynamic for Docker/dev builds
export const dynamic = 'force-dynamic';

/**
 * Journal API - Temporarily unavailable
 * Services are being migrated from legacy backend
 */

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Journal service temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Journal service temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}
