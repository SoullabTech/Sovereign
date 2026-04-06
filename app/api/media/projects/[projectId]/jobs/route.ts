export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * MEDIA JOBS API — Job Status Polling
 *
 * GET /api/media/projects/[projectId]/jobs
 * Client polls every 3s during processing.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

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

    // Verify project ownership
    const projectResult = await db.query(
      'SELECT id, status FROM media_projects WHERE id = $1 AND practitioner_id = $2',
      [projectId, DEV_PRACTITIONER_ID]
    );
    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const jobsResult = await db.query(
      `SELECT id, job_type, status, is_critical, priority, attempts, max_attempts,
              last_error, queued_at, started_at, finished_at
       FROM media_jobs WHERE project_id = $1
       ORDER BY priority ASC, queued_at ASC`,
      [projectId]
    );

    const jobs = jobsResult.rows;
    const allComplete = jobs.every(
      (j: { status: string }) => j.status === 'done' || j.status === 'skipped' || j.status === 'failed'
    );
    const hasFailedCritical = jobs.some(
      (j: { status: string; is_critical: boolean }) => j.status === 'failed' && j.is_critical
    );

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        allComplete,
        hasFailedCritical,
        projectStatus: projectResult.rows[0].status,
      },
    });
  } catch (err) {
    console.error('[Media] Jobs status error:', err);
    return NextResponse.json({ error: 'Failed to get job statuses' }, { status: 500 });
  }
}
