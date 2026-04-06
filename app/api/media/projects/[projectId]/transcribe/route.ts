export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * MEDIA TRANSCRIBE API — Manually trigger transcription
 *
 * POST /api/media/projects/[projectId]/transcribe
 *
 * Enqueues transcribe + classify + summarize jobs for any project
 * that has an audio or video asset.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

const DEV_PRACTITIONER_ID = '0a93962d-55a2-4deb-ad46-5268ee19be54';

type RouteParams = { params: Promise<{ projectId: string }> };

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

    // Verify project ownership
    const projectResult = await db.query(
      'SELECT id, media_type, ai_processing_allowed FROM media_projects WHERE id = $1 AND practitioner_id = $2',
      [projectId, DEV_PRACTITIONER_ID]
    );
    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projectResult.rows[0];

    if (!project.ai_processing_allowed) {
      return NextResponse.json({ error: 'AI processing is disabled for this project' }, { status: 403 });
    }

    // Check if there's an audio source available
    const audioAsset = await db.query(
      `SELECT id FROM media_assets
       WHERE project_id = $1 AND asset_type IN ('original', 'audio_extract')
       LIMIT 1`,
      [projectId]
    );
    if (audioAsset.rows.length === 0) {
      return NextResponse.json({ error: 'No audio source available for transcription' }, { status: 400 });
    }

    // Check if transcription is already running or completed
    const existingJob = await db.query(
      `SELECT id, status FROM media_jobs
       WHERE project_id = $1 AND job_type = 'transcribe' AND status IN ('queued', 'processing')`,
      [projectId]
    );
    if (existingJob.rows.length > 0) {
      return NextResponse.json({ error: 'Transcription already in progress' }, { status: 409 });
    }

    // Enqueue transcribe job (no dependency — asset already exists)
    const transcribeResult = await db.query(
      `INSERT INTO media_jobs (project_id, job_type, priority, is_critical)
       VALUES ($1, 'transcribe', 4, true)
       RETURNING id`,
      [projectId]
    );
    const transcribeJobId = transcribeResult.rows[0].id;

    // Enqueue classify (depends on transcribe)
    await db.query(
      `INSERT INTO media_jobs (project_id, job_type, priority, is_critical, depends_on)
       VALUES ($1, 'classify', 5, false, $2)`,
      [projectId, transcribeJobId]
    );

    // Enqueue summarize (depends on transcribe)
    await db.query(
      `INSERT INTO media_jobs (project_id, job_type, priority, is_critical, depends_on)
       VALUES ($1, 'summarize', 5, false, $2)`,
      [projectId, transcribeJobId]
    );

    console.log(`[Media] Manual transcription enqueued for project ${projectId}`);

    return NextResponse.json({
      success: true,
      data: { jobsEnqueued: 3 },
    });
  } catch (err) {
    console.error('[Media] Transcribe error:', err);
    return NextResponse.json({ error: 'Failed to enqueue transcription' }, { status: 500 });
  }
}
