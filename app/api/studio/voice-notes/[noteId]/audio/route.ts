export const dynamic = 'force-dynamic';

/**
 * VOICE NOTE AUDIO STREAMING
 *
 * Streams audio file for playback in browser
 * Requires practitioner authentication (must own the note)
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { query } from '@/lib/db/postgres';
import { requirePractitioner } from '@/lib/auth/getCurrentPractitioner';

export async function GET(req: NextRequest, ctx: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await ctx.params;

  const auth = await requirePractitioner(req);
  if ('error' in auth) return auth.error;
  const { practitionerId } = auth.identity;

  // Lookup note (ensure practitioner owns it)
  const result = await query(
    `SELECT storage_path, mime_type FROM voice_notes WHERE id = $1 AND practitioner_id = $2`,
    [noteId, practitionerId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const row = result.rows[0];

  try {
    const buf = await fs.readFile(row.storage_path);
    return new NextResponse(buf, {
      headers: {
        'Content-Type': row.mime_type || 'application/octet-stream',
        'Cache-Control': 'private, max-age=0, no-store',
      },
    });
  } catch (e) {
    console.error('[voice-notes/audio] File read error:', e);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
