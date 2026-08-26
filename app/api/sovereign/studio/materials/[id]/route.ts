/**
 * GATHER-02 — one material: read it, rename it, or let it go.
 *
 * GET carries the extracted text (the listing route deliberately does not), so
 * a writer can read what the Studio actually got out of a document rather than
 * trusting that it got anything.
 *
 * DELETE removes the material and its belongings. It does NOT delete the vault
 * bytes: the same file may back another material, and an irreversible byte
 * delete triggered by a list-row X is the wrong default. Orphaned bytes are a
 * sweep's problem; lost bytes are the writer's.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const dynamic = 'force-dynamic';

const MAX_TITLE_CHARS = 200;

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await query<{
      id: string;
      kind: string;
      title: string;
      artifact_hash: string | null;
      artifact_size: number | null;
      original_filename: string | null;
      mime_type: string | null;
      source_url: string | null;
      extracted_text: string | null;
      extraction_method: string | null;
      extracted_chars: number | null;
      arrived_at: string;
    }>(
      `SELECT id, kind, title, artifact_hash, artifact_size, original_filename,
              mime_type, source_url, extracted_text, extraction_method,
              extracted_chars, arrived_at
         FROM studio_materials
        WHERE id = $1 AND member_id = $2`,
      [id, memberId],
    );
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const m = res.rows[0];

    // Which Works the writer declared this into, and in whose words.
    const belongs = await query<{
      living_work_id: string;
      title: string | null;
      relationship_sentence: string | null;
      declared_at: string;
    }>(
      `SELECT lwm.living_work_id, lw.title, lwm.relationship_sentence, lwm.declared_at
         FROM living_work_materials lwm
         JOIN living_works lw ON lw.id = lwm.living_work_id
        WHERE lwm.material_type = 'studio_material'
          AND lwm.material_id = $1
          AND lw.member_id = $2
        ORDER BY lwm.declared_at DESC`,
      [id, memberId],
    );

    return NextResponse.json({
      material: {
        id: m.id,
        kind: m.kind,
        title: m.title,
        artifactHash: m.artifact_hash,
        artifactSize: m.artifact_size,
        originalFilename: m.original_filename,
        mimeType: m.mime_type,
        sourceUrl: m.source_url,
        extractedText: m.extracted_text,
        extractionMethod: m.extraction_method,
        extractedChars: m.extracted_chars,
        arrivedAt: m.arrived_at,
        belongsTo: belongs.rows.map((b) => ({
          workId: b.living_work_id,
          workTitle: b.title,
          sentence: b.relationship_sentence,
          declaredAt: b.declared_at,
        })),
      },
    });
  } catch (error) {
    console.error('[studio/materials] read failed', error);
    return NextResponse.json({ error: 'Could not read that material' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const raw = (body as { title?: unknown }).title;
  if (typeof raw !== 'string') {
    return NextResponse.json({ error: 'title must be a string' }, { status: 400 });
  }
  const title = raw.trim();
  // Unlike a manuscript, a material always has a name: it arrived as a file, a
  // link, or a first line. Blanking it would leave a row the schema forbids.
  if (title.length === 0) {
    return NextResponse.json({ error: 'A material keeps a name' }, { status: 400 });
  }
  if (title.length > MAX_TITLE_CHARS) {
    return NextResponse.json({ error: 'That name is too long' }, { status: 400 });
  }

  try {
    const res = await query<{ id: string; title: string }>(
      `UPDATE studio_materials SET title = $3, updated_at = now()
        WHERE id = $1 AND member_id = $2
      RETURNING id, title`,
      [id, memberId, title],
    );
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('[studio/materials] rename failed', error);
    return NextResponse.json({ error: 'Could not rename that just now' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const removed = await query<{ id: string }>(
      `DELETE FROM studio_materials WHERE id = $1 AND member_id = $2 RETURNING id`,
      [id, memberId],
    );
    if (removed.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // living_work_materials keys materials by TEXT id, so there is no foreign
    // key to cascade. Clear the declarations explicitly rather than leaving
    // belongings pointing at nothing.
    await query(
      `DELETE FROM living_work_materials
        WHERE material_type = 'studio_material' AND material_id = $1`,
      [id],
    );
    return NextResponse.json({ removed: removed.rows[0].id });
  } catch (error) {
    console.error('[studio/materials] remove failed', error);
    return NextResponse.json({ error: 'Could not remove that just now' }, { status: 500 });
  }
}
