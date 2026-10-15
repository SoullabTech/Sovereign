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
import { hasTeamRole } from '@/lib/auth/teamPermissions';
import { attentionReadSql, ATTENTION_CREATE_SQL } from '@/lib/studio/field/attentionOwnerPredicates';

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
    if (teamId && (!UUID_RE.test(teamId) ||
        !(await hasTeamRole(identity.memberId, teamId, 'viewer')))) {
      return NextResponse.json({ error: 'Team not found' }, { status: 403 });
    }
    const includePersonal = request.nextUrl.searchParams.get('includePersonal') !== 'false';
    const scope = scopeFor(teamId, includePersonal);

    // Resource-owning context is rechecked when displaying references.
    // Never use a cached label as a fallback for a missing or unauthorized
    // source: it may have originally come from another practitioner's record.
    const result = await db.query(
      attentionReadSql(scope.clause),
      [practitionerId, teamId, identity.memberId],
    );

    const fields: { important: unknown[]; attention: unknown[]; emerging: unknown[] } = {
      important: [], attention: [], emerging: [],
    };
    for (const r of result.rows) {
      const item = {
        id: r.id,
        kind: r.kind as 'change' | 'decision' | 'note',
        refId: r.gone ? null : (r.ref_id as string | null),
        // A withdrawn/foreign reference remains held in storage but is never
        // displayed with its old cached source title.
        label: r.gone ? 'Reference unavailable' : (r.resolved as string),
        href: r.kind === 'note' ? undefined : (r.gone ? undefined : hrefFor(r.kind)),
        position: r.position as number,
        gone: Boolean(r.gone),
        createdAt: r.created_at,
      };
      (fields as Record<string, unknown[]>)[r.field as string].push(item);
    }
    return NextResponse.json(fields, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    // A database failure is NOT an empty field. Exposing raw SQL/driver errors
    // in logs would also undermine personal custody.
    console.error('[Field Attention] Read unavailable', { failureKind: 'query_failed' });
    return NextResponse.json(
      { error: 'Field Attention temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
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
    if (payload?.teamId != null &&
        (typeof payload.teamId !== 'string' || !UUID_RE.test(payload.teamId))) {
      return NextResponse.json({ error: 'Invalid team' }, { status: 400 });
    }
    const teamId = typeof payload?.teamId === 'string' && payload.teamId ? payload.teamId : null;
    if (teamId && !(await hasTeamRole(identity.memberId, teamId, 'member'))) {
      return NextResponse.json({ error: 'Team not found' }, { status: 403 });
    }

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
        WHERE practitioner_id = $1 AND field = $2
          AND team_id IS NOT DISTINCT FROM $3::uuid`,
      [practitionerId, field, teamId],
    );
    const position = posResult.rows[0]?.pos ?? 0;

    try {
      // Prevent race between a standalone ownership SELECT and INSERT: the
      // member/practitioner/team/client predicates live inside the INSERT
      // statement itself. For referenced objects, use the owned source's
      // CURRENT title, never a client-supplied cached title.
      const result = await db.query(
        ATTENTION_CREATE_SQL,
        [practitionerId, teamId, field, kind, refId, label, position, identity.memberId],
      );
      if (!result.rows[0]) {
        return NextResponse.json({ error: 'Reference not available in this field' }, { status: 404 });
      }
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
