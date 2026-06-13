import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('http://maia-whisper:9000/health', {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json({ status: 'up', whisper: true });
  } catch {
    return NextResponse.json({ status: 'down', whisper: false }, { status: 503 });
  }
}
