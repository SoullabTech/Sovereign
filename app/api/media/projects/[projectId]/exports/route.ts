export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * MEDIA EXPORTS API — List + Create
 *
 * GET  /api/media/projects/[projectId]/exports
 * POST /api/media/projects/[projectId]/exports — Trust seam: calls evaluateMediaDisclosure
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { CreateExportSchema } from '@/lib/media/types';
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

    const exportsResult = await db.query(
      'SELECT * FROM media_exports WHERE project_id = $1 ORDER BY version DESC, created_at DESC',
      [projectId]
    );

    return NextResponse.json({
      success: true,
      data: exportsResult.rows,
    });
  } catch (err) {
    console.error('[Media] List exports error:', err);
    return NextResponse.json({ error: 'Failed to list exports' }, { status: 500 });
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
    const input = CreateExportSchema.parse(body);

    // ── TRUST SEAM ──────────────────────────────────────────
    const disclosure = await evaluateMediaDisclosure({
      projectId,
      action: 'export',
    });

    if (!disclosure.allowed) {
      return NextResponse.json({
        error: 'Export blocked by trust policy',
        reason: disclosure.reason,
        privacyLevel: disclosure.privacyLevel,
        consentStatus: disclosure.consentStatus,
      }, { status: 403 });
    }

    if (disclosure.redactionRequired) {
      return NextResponse.json({
        error: 'Export requires redaction before proceeding',
        reason: 'redaction_required',
      }, { status: 403 });
    }
    // ── END TRUST SEAM ──────────────────────────────────────

    // Get current version for this export type
    const versionResult = await db.query(
      `SELECT COALESCE(MAX(version), 0) + 1 as next_version
       FROM media_exports WHERE project_id = $1 AND export_type = $2`,
      [projectId, input.exportType]
    );
    const nextVersion = versionResult.rows[0].next_version;

    // For transcript exports, generate from transcript data
    // For audio/video exports, reference the processed asset
    // (Actual file generation happens here in a real implementation)
    const storagePath = `${projectId}/exports/${input.exportType}_v${nextVersion}`;

    const result = await db.query(
      `INSERT INTO media_exports (project_id, export_type, storage_path, format_options, version)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [projectId, input.exportType, storagePath, JSON.stringify(input.formatOptions), nextVersion]
    );

    console.log(`[Media] Export created: ${input.exportType} v${nextVersion} for project ${projectId}`);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: err }, { status: 400 });
    }
    console.error('[Media] Create export error:', err);
    return NextResponse.json({ error: 'Failed to create export' }, { status: 500 });
  }
}
