export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * MEDIA TRANSCRIPT API
 *
 * GET /api/media/projects/[projectId]/transcript
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

    // Verify ownership
    const projectResult = await db.query(
      'SELECT id FROM media_projects WHERE id = $1 AND practitioner_id = $2',
      [projectId, DEV_PRACTITIONER_ID]
    );
    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const transcriptResult = await db.query(
      `SELECT * FROM media_transcripts WHERE project_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [projectId]
    );

    if (transcriptResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: transcriptResult.rows[0],
    });
  } catch (err) {
    console.error('[Media] Transcript error:', err);
    return NextResponse.json({ error: 'Failed to get transcript' }, { status: 500 });
  }
}
