// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * The image itself. Member-scoped, private, and never public.
 *
 * ── Why the client fetches this instead of using it as an <img src> ───────
 * An <img> element cannot carry a header, so on iOS it would arrive with no
 * credential at all — the Capacitor cookie trap in CLAUDE.md, arriving through
 * a tag rather than a fetch. The Studio therefore reads these bytes with
 * apiFetch and renders an object URL, which authenticates identically on web
 * and in the WebView. The cost is one request per image; the alternative is a
 * surface that works on a laptop and silently shows nothing on a phone.
 *
 * ⛔ No public URL is ever minted. Sharing is a separate future act (founder
 * ruling 2026-09-07); until it is designed, there is no path by which this
 * image leaves the member's own authenticated session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { readVaultBytes } from '@/lib/storage/fileVault';

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await ctx.params;

    /* The member id is in the WHERE clause, not checked after the read: another
       member's Work matches zero rows and is answered 404, which also declines
       to confirm that the id exists. */
    const result = await query<{ storage_path: string; mime_type: string }>(
      `SELECT storage_path, mime_type FROM living_work_visuals
        WHERE living_work_id = $1 AND member_id = $2`,
      [id, memberId],
    );
    const row = result.rows[0];
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const bytes = await readVaultBytes(row.storage_path);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': row.mime_type,
        'Content-Length': String(bytes.length),
        /* Private, and revalidated: a replaced image must not persist in a
           shared cache, and must not linger in this member's own after they
           change it. */
        'Cache-Control': 'private, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[living-works/visual/bytes] read failed', error);
    return NextResponse.json({ error: 'Failed to read the image' }, { status: 500 });
  }
}
