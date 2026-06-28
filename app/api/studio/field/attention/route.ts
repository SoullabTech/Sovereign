export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * FIELD ATTENTION — the person's three CURATED fields (Important / Needs attention /
 * Emerging) for the Personal Studio home.
 *
 * CURATION, not derivation: the member PLACES a change, a decision, or a free note
 * into a field and can take it back out. The system never decides what is important
 * — the member does. No ranking, no significance score; ordering is the member's own
 * drag position, then recency. Scope mirrors field_notes (personal = team_id NULL).
 *
 * GET resolves the CURRENT title of a referenced change/decision (so source edits
 * show through) and falls back to the cached label, flagging `gone: true` if the
 * source was removed. POST places an item; placement is fail-closed to the author.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

const FIELDS = new Set(['important', 'attention', 'emerging']);
const KINDS = new Set(['change', 'decision', 'note']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_LABEL = 500;

function scopeFor(teamId: string | null, includePersonal: boolean): { clause: string; params: string[] } {
  if (!teamId) return { clause: 'AND fa.team_id IS NULL', params: [] };
  return includePersonal
    ? { clause: 'AND (fa.team_id = $2 OR fa.team_id IS NULL)', params: [teamId] }
    : { clause: 'AND fa.team_id = $2', params: [teamId] };
}

function hrefFor(kind: string): string | undefined {
  if (kind === 'change') return '/studio/changes';
  if (kind === 'decision') return '/studio/decisions';
  return undefined; // a free note lives in the field, not behind a door
}

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { practitionerId } = identity;

    const teamId = request.nextUrl.searchParams.get('teamId') || null;
    const includePersonal = request.nextUrl.searchParams.get('includePersonal') !== 'false';
    const scope = scopeFor(teamId, includePersonal);

    // Resolve the live title for referenced sources; fall back to cached label.
    const result = await db.query(
      `SELECT fa.id, fa.field, fa.kind, fa.ref_id, fa.label, fa.position, fa.created_at,
              COALESCE(c.title, d.title, fa.label) AS resolved,
              (fa.ref_id IS NOT NULL AND c.id IS NULL AND d.id IS NULL) AS gone
         FROM field_attention fa
         LEFT JOIN studio_changes   c ON fa.kind = 'change'   AND fa.ref_id = c.id
         LEFT JOIN studio_decisions d ON fa.kind = 'decision' AND fa.ref_id = d.id
        WHERE fa.practitioner_id = $1 ${scope.clause}
        ORDER BY fa.position ASC, fa.created_at DESC
        LIMIT 300`,
      [practitionerId, ...scope.params],
    );

    const fields: { important: unknown[]; attention: unknown[]; emerging: unknown[] } = {
      important: [], attention: [], emerging: [],
    };
    for (const r of result.rows) {
      const item = {
        id: r.id,
        kind: r.kind as 'change' | 'decision' | 'note',
        refId: r.ref_id as string | null,
        label: r.resolved as string,
        href: r.kind === 'note' ? undefined : (r.gone ? undefined : hrefFor(r.kind)),
        position: r.position as number,
        gone: Boolean(r.gone),
        createdAt: r.created_at,
      };
      (fields as Record<string, unknown[]>)[r.field as string].push(item);
    }
    return NextResponse.json(fields);
  } catch (error) {
    // Resilient: code can land before the migration runs — degrade to empty fields.
    console.warn('[Field Attention] GET failed (migration pending?):', error instanceof Error ? error.message : error);
    return NextResponse.json({ important: [], attention: [], emerging: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { practitionerId } = identity;

    const payload = await request.json().catch(() => null);
    const field = typeof payload?.field === 'string' ? payload.field : '';
    const kind = typeof payload?.kind === 'string' ? payload.kind : '';
    const refId = typeof payload?.refId === 'string' && payload.refId ? payload.refId : null;
    const label = typeof payload?.label === 'string' ? payload.label.trim() : '';
    const teamId = typeof payload?.teamId === 'string' && payload.teamId ? payload.teamId : null;

    if (!FIELDS.has(field)) return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    if (!KINDS.has(kind)) return NextResponse.json({ error: 'Invalid kind' }, { status: 400 });
    if (!label) return NextResponse.json({ error: 'Label is empty' }, { status: 400 });
    if (label.length > MAX_LABEL) return NextResponse.json({ error: 'Label is too long' }, { status: 400 });
    if (kind === 'note' && refId) return NextResponse.json({ error: 'A note carries no reference' }, { status: 400 });
    if (kind !== 'note' && (!refId || !UUID_RE.test(refId))) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
    }

    // New placements land at the top of the field (position one below the current min).
    const posResult = await db.query(
      `SELECT COALESCE(MIN(position), 0) - 1 AS pos FROM field_attention
        WHERE practitioner_id = $1 AND field = $2`,
      [practitionerId, field],
    );
    const position = posResult.rows[0]?.pos ?? 0;

    try {
      const result = await db.query(
        `INSERT INTO field_attention (practitioner_id, team_id, field, kind, ref_id, label, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, field, kind, ref_id, label, position, created_at`,
        [practitionerId, teamId, field, kind, refId, label, position],
      );
      const row = result.rows[0];
      return NextResponse.json({
        id: row.id, field: row.field, kind: row.kind, refId: row.ref_id,
        label: row.label, href: row.kind === 'note' ? undefined : hrefFor(row.kind),
        position: row.position, gone: false, createdAt: row.created_at,
      }, { status: 201 });
    } catch (e: unknown) {
      // unique (practitioner, field, kind, ref_id) — already placed in this field
      if (e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === '23505') {
        return NextResponse.json({ error: 'Already placed in this field' }, { status: 409 });
      }
      throw e;
    }
  } catch (error) {
    console.error('[Field Attention] POST error:', error);
    return NextResponse.json({ error: 'Failed to place' }, { status: 500 });
  }
}
