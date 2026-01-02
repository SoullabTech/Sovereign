// backend: app/api/health/route.ts
import { NextResponse } from 'next/server';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'maia-sovereign-web',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
