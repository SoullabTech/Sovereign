import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HELD = {
  error: 'Generated Astrology reports are unavailable pending consent and provenance review.',
  code: 'ASTROLOGY_REPORT_R4F_HELD',
};
const HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
};

/** Fail closed before authentication, body parsing, database reads or provider work. */
export async function GET() {
  return NextResponse.json(HELD, { status: 451, headers: HEADERS });
}

/** Fail closed before authentication, body parsing, database reads or provider work. */
export async function POST() {
  return NextResponse.json(HELD, { status: 451, headers: HEADERS });
}
