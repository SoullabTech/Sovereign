export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * MEDIA INTEGRATIONS API — Build A: Link-only
 *
 * GET  /api/media/projects/[projectId]/integrations — List integrations
 * POST /api/media/projects/[projectId]/integrations — Add Descript link (trust-gated)
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { CreateIntegrationSchema } from '@/lib/media/types';
import { evaluateMediaDisclosure } from '@/lib/trust/mediaDisclosure';

const DEV_PRACTITIONER_ID = '0a93962d-55a2-4deb-ad46-5268ee19be54';

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

    const projectResult = await db.query(
      'SELECT id FROM media_projects WHERE id = $1 AND practitioner_id = $2',
      [projectId, DEV_PRACTITIONER_ID]
    );
    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const result = await db.query(
      'SELECT * FROM media_integrations WHERE project_id = $1',
      [projectId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error('[Media] List integrations error:', err);
    return NextResponse.json({ error: 'Failed to list integrations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    let memberId = await getMemberIdFromRequest(request);
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectResult = await db.query(
      'SELECT id FROM media_projects WHERE id = $1 AND practitioner_id = $2',
      [projectId, DEV_PRACTITIONER_ID]
    );
    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const input = CreateIntegrationSchema.parse(body);

    // ── TRUST SEAM ──────────────────────────────────────────
    const disclosure = await evaluateMediaDisclosure({
      projectId,
      action: 'descript_link',
      targetPlatform: input.service,
    });

    if (!disclosure.allowed) {
      return NextResponse.json({
        error: 'Integration blocked by trust policy',
        reason: disclosure.reason,
        privacyLevel: disclosure.privacyLevel,
      }, { status: 403 });
    }
    // ── END TRUST SEAM ──────────────────────────────────────

    // Upsert integration (one per project+service)
    const result = await db.query(
      `INSERT INTO media_integrations (project_id, service, external_url, external_id, sync_status)
       VALUES ($1, $2, $3, $4, 'linked')
       ON CONFLICT (project_id, service)
       DO UPDATE SET external_url = EXCLUDED.external_url,
                     external_id = EXCLUDED.external_id,
                     updated_at = NOW()
       RETURNING *`,
      [projectId, input.service, input.externalUrl ?? null, input.externalId ?? null]
    );

    console.log(`[Media] Integration linked: ${input.service} for project ${projectId}`);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: err }, { status: 400 });
    }
    console.error('[Media] Create integration error:', err);
    return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 });
  }
}
