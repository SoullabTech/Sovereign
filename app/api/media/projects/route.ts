export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * MEDIA PROJECTS API — List + Create
 *
 * GET  /api/media/projects — List projects with search/filter/pagination
 * POST /api/media/projects — Create a new media project
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { CreateProjectSchema, ListProjectsSchema } from '@/lib/media/types';
import { ensureProjectDirs } from '@/lib/media/storage';

const DEV_PRACTITIONER_ID = '0a93962d-55a2-4deb-ad46-5268ee19be54';

async function getPractitionerId(memberId: string): Promise<string | null> {
  if (process.env.NODE_ENV === 'development') return DEV_PRACTITIONER_ID;
  return DEV_PRACTITIONER_ID; // TODO: look up from members/practitioners
}

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const params = ListProjectsSchema.parse(Object.fromEntries(searchParams));

    const conditions: string[] = ['practitioner_id = $1'];
    const values: unknown[] = [practitionerId];
    let idx = 2;

    if (params.q) {
      conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
      values.push(`%${params.q}%`);
      idx++;
    }
    if (params.type) {
      conditions.push(`media_type = $${idx++}`);
      values.push(params.type);
    }
    if (params.status) {
      conditions.push(`status = $${idx++}`);
      values.push(params.status);
    }

    const where = conditions.join(' AND ');
    const offset = (params.page - 1) * params.limit;

    const [countResult, projectsResult] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM media_projects WHERE ${where}`, values),
      db.query(
        `SELECT * FROM media_projects
         WHERE ${where}
         ORDER BY ${params.sort} ${params.order}
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...values, params.limit, offset]
      ),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    return NextResponse.json({
      success: true,
      data: {
        projects: projectsResult.rows,
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (err) {
    console.error('[Media] List projects error:', err);
    return NextResponse.json({ error: 'Failed to list projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const input = CreateProjectSchema.parse(body);

    // If source_session_id provided, inherit session privacy
    let effectivePrivacy = input.privacyLevel;
    if (input.sourceSessionId) {
      const sessionResult = await db.query(
        `SELECT privacy_mode, allow_export FROM rl_sessions WHERE id = $1`,
        [input.sourceSessionId]
      );
      if (sessionResult.rows.length > 0) {
        const session = sessionResult.rows[0];
        effectivePrivacy = session.privacy_mode || input.privacyLevel;
      }
    }

    const result = await db.query(
      `INSERT INTO media_projects (
         practitioner_id, title, description, media_type, source,
         source_session_id, source_voice_note_id, tags,
         privacy_level, contains_sensitive_content,
         client_consent_status, external_editing_allowed,
         publishing_allowed, redaction_required, ai_processing_allowed
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        practitionerId,
        input.title,
        input.description ?? null,
        input.mediaType,
        input.source,
        input.sourceSessionId ?? null,
        input.sourceVoiceNoteId ?? null,
        input.tags,
        effectivePrivacy,
        input.containsSensitiveContent,
        input.clientConsentStatus,
        input.externalEditingAllowed,
        input.publishingAllowed,
        input.redactionRequired,
        input.aiProcessingAllowed,
      ]
    );

    const project = result.rows[0];

    // Create storage directories
    await ensureProjectDirs(project.id);

    console.log(`[Media] Project created: ${project.id} (${input.title})`);

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: err }, { status: 400 });
    }
    console.error('[Media] Create project error:', err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
