export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const revalidate = false;

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  let soulSignature = 'unknown';
  try {
    soulSignature = request.nextUrl.searchParams.get('soulSignature') || 'unknown';
  } catch {
    // During static export, searchParams may not be available
  }

  try {
    const result = await query(
      `SELECT soul_signature, user_id, user_name, presence_quality,
              archetypal_resonances, spiral_position, relationship_field,
              first_encounter, last_encounter, encounter_count, morphic_resonance
       FROM relationship_essences
       WHERE soul_signature = $1
       LIMIT 1`,
      [soulSignature]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('[relationship-essence] DB error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
