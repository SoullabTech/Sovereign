export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * MEDIA ASSETS API
 *
 * GET /api/media/projects/[projectId]/assets
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

    const projectResult = await db.query(
      'SELECT id FROM media_projects WHERE id = $1 AND practitioner_id = $2',
      [projectId, DEV_PRACTITIONER_ID]
    );
    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const assetsResult = await db.query(
      'SELECT * FROM media_assets WHERE project_id = $1 ORDER BY created_at',
      [projectId]
    );

    return NextResponse.json({
      success: true,
      data: assetsResult.rows,
    });
  } catch (err) {
    console.error('[Media] Assets error:', err);
    return NextResponse.json({ error: 'Failed to list assets' }, { status: 500 });
  }
}
