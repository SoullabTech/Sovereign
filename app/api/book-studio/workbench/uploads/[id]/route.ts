/**
 * GET    /api/book-studio/workbench/uploads/[id]
 * PATCH  /api/book-studio/workbench/uploads/[id]
 * DELETE /api/book-studio/workbench/uploads/[id]
 *
 * Single-upload operations.
 *
 * PATCH body shape:
 *   { transcription_reviewed?: string, sanctuary?: boolean }
 *
 * When transcription_reviewed is provided, the status flips to 'reviewed'
 * and the upload becomes Shelf-indexable. This is the review-before-indexing
 * gate (Spec §5.3).
 *
 * DELETE is a hard delete — filesystem + DB row removed, and card pointers
 * to this upload are scrubbed from any workbench_tables.layout JSON.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireFounder } from '@/lib/founder/founderAuth';
import { query } from '@/lib/db/postgres';
import { deleteUpload, writeReviewed } from '@/lib/workbench/storage';
import type { TableLayout, TableGroup, CardPointer } from '@/lib/workbench/sources/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await params;

  const result = await query(
    `SELECT id, original_name, mime_type, size_bytes, source_kind,
            transcription_status, transcription_draft, transcription_reviewed,
            sanctuary, error_message, created_at, updated_at
     FROM workbench_uploads
     WHERE id = $1 AND arranger_id = $2`,
    [id, auth.memberId],
  );
  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ upload: result.rows[0] });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await params;

  let body: { transcription_reviewed?: string; sanctuary?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const sets: string[] = [];
  const queryParams: unknown[] = [];

  if (typeof body.transcription_reviewed === 'string') {
    queryParams.push(body.transcription_reviewed);
    sets.push(`transcription_reviewed = $${queryParams.length}`);
    sets.push(`transcription_status = 'reviewed'`);
    // Mirror to disk.
    await writeReviewed(auth.memberId, id, body.transcription_reviewed).catch(() => undefined);
  }
  if (typeof body.sanctuary === 'boolean') {
    queryParams.push(body.sanctuary);
    sets.push(`sanctuary = $${queryParams.length}`);
  }
  if (sets.length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  sets.push(`updated_at = NOW()`);
  queryParams.push(id);
  queryParams.push(auth.memberId);

  const result = await query(
    `UPDATE workbench_uploads SET ${sets.join(', ')}
     WHERE id = $${queryParams.length - 1} AND arranger_id = $${queryParams.length}
     RETURNING id, transcription_status, sanctuary, updated_at`,
    queryParams,
  );
  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ upload: result.rows[0] });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await params;

  // Verify ownership and existence.
  const existing = await query<{ id: string }>(
    `SELECT id FROM workbench_uploads WHERE id = $1 AND arranger_id = $2`,
    [id, auth.memberId],
  );
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Scrub any card pointers in this arranger's tables.
  const tables = await query<{ id: string; layout: TableLayout }>(
    `SELECT id, layout FROM workbench_tables WHERE arranger_id = $1`,
    [auth.memberId],
  );
  for (const t of tables.rows) {
    const scrubbed = scrubLayoutOf(t.layout, 'uploaded', id);
    if (scrubbed.changed) {
      await query(
        `UPDATE workbench_tables SET layout = $1, updated_at = NOW()
         WHERE id = $2`,
        [scrubbed.layout, t.id],
      );
    }
  }

  // Filesystem then DB.
  await deleteUpload(auth.memberId, id);
  await query(`DELETE FROM workbench_uploads WHERE id = $1`, [id]);

  return NextResponse.json({ ok: true });
}

function scrubLayoutOf(
  layout: TableLayout,
  source: CardPointer['source'],
  ref: string,
): { layout: TableLayout; changed: boolean } {
  let changed = false;
  const groups: TableGroup[] = (layout.groups ?? []).map((g) => {
    const filteredCards = g.cards.filter((c) => {
      const match = c.source === source && c.ref === ref;
      if (match) changed = true;
      return !match;
    });
    return { ...g, cards: filteredCards };
  });
  return { layout: { groups }, changed };
}
