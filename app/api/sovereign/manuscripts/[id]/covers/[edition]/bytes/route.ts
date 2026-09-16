export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { readVaultBytes } from '@/lib/storage/fileVault';
import { isCoverEdition } from '@/lib/manuscript/coverAssets/types';

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; edition: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, edition } = await ctx.params;
    if (!isCoverEdition(edition)) {
      return NextResponse.json({ error: 'Unknown cover edition' }, { status: 400 });
    }

    const result = await query<{ storage_path: string; byte_size: string }>(
      `SELECT storage_path, byte_size FROM manuscript_cover_assets
        WHERE manuscript_id = $1 AND member_id = $2 AND edition = $3`,
      [id, memberId, edition],
    );
    const row = result.rows[0];
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const bytes = await readVaultBytes(row.storage_path);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(bytes.length),
        'Cache-Control': 'private, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[manuscript-cover/bytes] read failed', error);
    return NextResponse.json({ error: 'Could not read that cover.' }, { status: 500 });
  }
}
