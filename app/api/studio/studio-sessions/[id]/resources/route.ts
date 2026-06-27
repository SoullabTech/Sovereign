export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO SESSION RESOURCES — attach facilitation materials to a studio_session.
 *
 * Resources belong to the Session, not the meeting provider (ADR-006). A resource is
 * either a Media Studio asset (uploaded PowerPoint/PDF/image/video — upload via the existing
 * /api/media/projects/[id]/upload, then attach its mediaProjectId here) or an external
 * reference (a whiteboard URL, a link). Every mutation verifies the parent session belongs
 * to the authenticated practitioner.
 *
 *   GET                          → list a session's resources (ordered)
 *   POST   { mediaProjectId? | externalUrl?, resourceKind, title?, visibility?, sortOrder? }
 *   PATCH  { resourceId, … }      → re-order / re-label / change visibility
 *   DELETE ?resourceId=…          → detach
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

const VALID_VISIBILITY = ['shared', 'private'] as const;
const VALID_VISIBILITY_SET = new Set<string>(VALID_VISIBILITY);
// App-validated, extensible (no DB CHECK). Default 'document'.
const VALID_RESOURCE_KIND = new Set<string>([
  'presentation', 'pdf', 'image', 'video', 'audio', 'worksheet', 'whiteboard', 'link', 'document',
]);

function shapeResource(row: any) {
  return {
    id: row.id,
    studioSessionId: row.studio_session_id,
    mediaProjectId: row.media_project_id,
    externalUrl: row.external_url,
    resourceKind: row.resource_kind,
    title: row.title,
    sortOrder: row.sort_order,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Verify the session exists and belongs to this practitioner. Returns true/false. */
async function ownsSession(sessionId: string, practitionerId: string): Promise<boolean> {
  const res = await db.query(
    `SELECT 1 FROM studio_sessions WHERE id = $1 AND practitioner_id = $2`,
    [sessionId, practitionerId]
  );
  return res.rows.length > 0;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { id: sessionId } = await params;
    if (!(await ownsSession(sessionId, identity.practitionerId))) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    const result = await db.query(
      `SELECT id, studio_session_id, media_project_id, external_url, resource_kind, title,
              sort_order, visibility, created_at, updated_at
       FROM studio_session_resources WHERE studio_session_id = $1 ORDER BY sort_order, created_at`,
      [sessionId]
    );
    return NextResponse.json({ resources: result.rows.map(shapeResource) });
  } catch (error) {
    console.error('[Studio Session Resources] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { id: sessionId } = await params;
    if (!(await ownsSession(sessionId, identity.practitionerId))) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const body = await request.json();
    const mediaProjectId = typeof body.mediaProjectId === 'string' && body.mediaProjectId.trim() ? body.mediaProjectId.trim() : null;
    const externalUrl = typeof body.externalUrl === 'string' && body.externalUrl.trim() ? body.externalUrl.trim() : null;
    if (!mediaProjectId && !externalUrl) {
      return NextResponse.json({ error: 'A resource needs a mediaProjectId or an externalUrl' }, { status: 400 });
    }

    const resourceKind = body.resourceKind ?? 'document';
    if (!VALID_RESOURCE_KIND.has(String(resourceKind))) {
      return NextResponse.json({ error: `resourceKind must be one of: ${Array.from(VALID_RESOURCE_KIND).join(', ')}` }, { status: 400 });
    }
    const visibility = body.visibility ?? 'shared';
    if (!VALID_VISIBILITY_SET.has(String(visibility))) {
      return NextResponse.json({ error: `visibility must be one of: ${VALID_VISIBILITY.join(', ')}` }, { status: 400 });
    }

    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO studio_session_resources
         (id, studio_session_id, media_project_id, external_url, resource_kind, title, sort_order, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, studio_session_id, media_project_id, external_url, resource_kind, title, sort_order, visibility, created_at, updated_at`,
      [
        id, sessionId, mediaProjectId, externalUrl, resourceKind,
        typeof body.title === 'string' && body.title.trim() ? body.title.trim() : null,
        Number.isFinite(body.sortOrder) ? body.sortOrder : 0,
        visibility,
      ]
    );
    return NextResponse.json({ resource: shapeResource(result.rows[0]) });
  } catch (error) {
    console.error('[Studio Session Resources] POST error:', error);
    return NextResponse.json({ error: 'Failed to attach resource' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { id: sessionId } = await params;
    if (!(await ownsSession(sessionId, identity.practitionerId))) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const body = await request.json();
    const { resourceId } = body;
    if (!resourceId) {
      return NextResponse.json({ error: 'resourceId is required' }, { status: 400 });
    }

    const updateFields: string[] = [];
    const queryParams: (string | number | null)[] = [resourceId, sessionId];

    if (body.title !== undefined) {
      updateFields.push(`title = $${queryParams.length + 1}`);
      queryParams.push(typeof body.title === 'string' && body.title.trim() ? body.title.trim() : null);
    }
    if (body.sortOrder !== undefined && Number.isFinite(body.sortOrder)) {
      updateFields.push(`sort_order = $${queryParams.length + 1}`);
      queryParams.push(body.sortOrder);
    }
    if (body.visibility !== undefined) {
      if (!VALID_VISIBILITY_SET.has(String(body.visibility))) {
        return NextResponse.json({ error: `visibility must be one of: ${VALID_VISIBILITY.join(', ')}` }, { status: 400 });
      }
      updateFields.push(`visibility = $${queryParams.length + 1}`);
      queryParams.push(body.visibility);
    }
    if (body.resourceKind !== undefined) {
      if (!VALID_RESOURCE_KIND.has(String(body.resourceKind))) {
        return NextResponse.json({ error: `resourceKind must be one of: ${Array.from(VALID_RESOURCE_KIND).join(', ')}` }, { status: 400 });
      }
      updateFields.push(`resource_kind = $${queryParams.length + 1}`);
      queryParams.push(body.resourceKind);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }
    updateFields.push(`updated_at = NOW()`);

    const result = await db.query(
      `UPDATE studio_session_resources SET ${updateFields.join(', ')}
       WHERE id = $1 AND studio_session_id = $2
       RETURNING id, studio_session_id, media_project_id, external_url, resource_kind, title, sort_order, visibility, created_at, updated_at`,
      queryParams
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    return NextResponse.json({ resource: shapeResource(result.rows[0]) });
  } catch (error) {
    console.error('[Studio Session Resources] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { id: sessionId } = await params;
    if (!(await ownsSession(sessionId, identity.practitionerId))) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');
    if (!resourceId) {
      return NextResponse.json({ error: 'resourceId is required' }, { status: 400 });
    }
    const result = await db.query(
      `DELETE FROM studio_session_resources WHERE id = $1 AND studio_session_id = $2 RETURNING id`,
      [resourceId, sessionId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Session Resources] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to detach resource' }, { status: 500 });
  }
}
