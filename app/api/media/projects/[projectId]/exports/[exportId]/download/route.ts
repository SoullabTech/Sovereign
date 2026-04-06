export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * EXPORT DOWNLOAD API
 *
 * GET /api/media/projects/[projectId]/exports/[exportId]/download
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getFileStream, fileExists, getFileSizeSync } from '@/lib/media/storage';

const DEV_PRACTITIONER_ID = '0a93962d-55a2-4deb-ad46-5268ee19be54';

type RouteParams = { params: Promise<{ projectId: string; exportId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId, exportId } = await params;
    let memberId = await getMemberIdFromRequest(request);
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.query(
      `SELECT e.storage_path, e.export_type, e.file_size_bytes
       FROM media_exports e
       JOIN media_projects p ON p.id = e.project_id
       WHERE e.id = $1 AND e.project_id = $2 AND p.practitioner_id = $3`,
      [exportId, projectId, DEV_PRACTITIONER_ID]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Export not found' }, { status: 404 });
    }

    const exp = result.rows[0];

    if (!fileExists(exp.storage_path)) {
      return NextResponse.json({ error: 'Export file not found on disk' }, { status: 404 });
    }

    const fileSize = exp.file_size_bytes || getFileSizeSync(exp.storage_path);
    const mimeMap: Record<string, string> = {
      transcript_txt: 'text/plain',
      transcript_srt: 'text/srt',
      transcript_vtt: 'text/vtt',
      audio_mp3: 'audio/mpeg',
      audio_wav: 'audio/wav',
      video_mp4: 'video/mp4',
    };

    const stream = getFileStream(exp.storage_path);
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': mimeMap[exp.export_type] || 'application/octet-stream',
        'Content-Length': String(fileSize),
        'Content-Disposition': `attachment; filename="${exp.export_type}_${exportId}"`,
      },
    });
  } catch (err) {
    console.error('[Media] Export download error:', err);
    return NextResponse.json({ error: 'Failed to download export' }, { status: 500 });
  }
}
