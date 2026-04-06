export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * MEDIA PROJECT API — Detail, Update, Delete
 *
 * GET    /api/media/projects/[projectId] — Project detail
 * PATCH  /api/media/projects/[projectId] — Update project metadata
 * DELETE /api/media/projects/[projectId] — Archive project
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { UpdateProjectSchema } from '@/lib/media/types';

const DEV_PRACTITIONER_ID = '0a93962d-55a2-4deb-ad46-5268ee19be54';

async function getPractitionerId(memberId: string): Promise<string | null> {
  if (process.env.NODE_ENV === 'development') return DEV_PRACTITIONER_ID;
  return DEV_PRACTITIONER_ID;
}

// Privacy fields that cannot be updated when source_session_id is set
const SESSION_LOCKED_FIELDS = [
  'privacyLevel', 'containsSensitiveContent', 'aiProcessingAllowed',
];

type RouteParams = { params: Promise<{ projectId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    let memberId = await getMemberIdFromRequest(request);
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'No practitioner found' }, { status: 404 });
    }

    // Fetch project with related data
    const [projectResult, assetsResult, transcriptResult, jobsResult, integrationsResult] = await Promise.all([
      db.query('SELECT * FROM media_projects WHERE id = $1 AND practitioner_id = $2', [projectId, practitionerId]),
      db.query('SELECT * FROM media_assets WHERE project_id = $1 ORDER BY created_at', [projectId]),
      db.query('SELECT * FROM media_transcripts WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1', [projectId]),
      db.query('SELECT * FROM media_jobs WHERE project_id = $1 ORDER BY priority, queued_at', [projectId]),
      db.query('SELECT * FROM media_integrations WHERE project_id = $1', [projectId]),
    ]);

    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projectResult.rows[0];
    const allJobsDone = jobsResult.rows.every(
      (j: { status: string }) => j.status === 'done' || j.status === 'skipped' || j.status === 'failed'
    );

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        assets: assetsResult.rows,
        transcript: transcriptResult.rows[0] || null,
        jobs: jobsResult.rows,
        integrations: integrationsResult.rows,
        allJobsComplete: allJobsDone,
      },
    });
  } catch (err) {
    console.error('[Media] Get project error:', err);
    return NextResponse.json({ error: 'Failed to get project' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    let memberId = await getMemberIdFromRequest(request);
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'No practitioner found' }, { status: 404 });
    }

    const body = await request.json();
    const input = UpdateProjectSchema.parse(body);

    // Check project exists and is owned by this practitioner
    const existing = await db.query(
      'SELECT source_session_id FROM media_projects WHERE id = $1 AND practitioner_id = $2',
      [projectId, practitionerId]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Enforce session inheritance: refuse privacy updates when source_session_id is set
    if (existing.rows[0].source_session_id) {
      const lockedAttempts = SESSION_LOCKED_FIELDS.filter(f => f in input);
      if (lockedAttempts.length > 0) {
        return NextResponse.json({
          error: 'Cannot update privacy fields on session-sourced projects',
          detail: `Fields ${lockedAttempts.join(', ')} are derived from the source session and cannot be changed directly.`,
        }, { status: 403 });
      }
    }

    // Build dynamic UPDATE
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const fieldMap: Record<string, string> = {
      title: 'title',
      description: 'description',
      tags: 'tags',
      privacyLevel: 'privacy_level',
      containsSensitiveContent: 'contains_sensitive_content',
      clientConsentStatus: 'client_consent_status',
      externalEditingAllowed: 'external_editing_allowed',
      publishingAllowed: 'publishing_allowed',
      redactionRequired: 'redaction_required',
      aiProcessingAllowed: 'ai_processing_allowed',
    };

    for (const [inputKey, dbCol] of Object.entries(fieldMap)) {
      if (inputKey in input) {
        updates.push(`${dbCol} = $${idx++}`);
        values.push((input as Record<string, unknown>)[inputKey]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push('updated_at = NOW()');
    values.push(projectId);
    values.push(practitionerId);

    const result = await db.query(
      `UPDATE media_projects SET ${updates.join(', ')}
       WHERE id = $${idx++} AND practitioner_id = $${idx++}
       RETURNING *`,
      values
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: err }, { status: 400 });
    }
    console.error('[Media] Update project error:', err);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    let memberId = await getMemberIdFromRequest(request);
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'No practitioner found' }, { status: 404 });
    }

    // Soft delete: set status to 'archived'
    const result = await db.query(
      `UPDATE media_projects SET status = 'archived', updated_at = NOW()
       WHERE id = $1 AND practitioner_id = $2
       RETURNING id`,
      [projectId, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log(`[Media] Project archived: ${projectId}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Media] Delete project error:', err);
    return NextResponse.json({ error: 'Failed to archive project' }, { status: 500 });
  }
}
