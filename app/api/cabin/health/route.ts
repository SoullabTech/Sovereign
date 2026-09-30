import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.MAIA_CABIN_MODE !== 'offline') {
    return NextResponse.json({ error: 'not_cabin_runtime' }, { status: 404 });
  }

  return NextResponse.json({
    status: 'ready',
    mode: 'offline',
    build: process.env.NEXT_PUBLIC_BUILD_SHA || 'UNSTAMPED',
  });
}
