import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * R4F hard-off for Astrology-derived MAIA discussion.
 *
 * The endpoint remains fail-closed until an exact-turn, server-consumed grant,
 * derived-memory controls and restore-safe revocation are independently admitted.
 * Keep this response before request-body parsing or provider resolution.
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Astrology-specific MAIA discussion is unavailable pending consent review.',
      code: 'ASTROLOGY_MAIA_R4F_HELD',
    },
    {
      status: 451,
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}
