import { NextRequest, NextResponse } from "next/server";

// Force dynamic for Docker/dev builds
export const dynamic = 'force-dynamic';

/**
 * Voice List API - Temporarily unavailable
 * Memory services are being migrated from legacy backend
 */

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Voice list temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}
