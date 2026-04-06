export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * MEDIA ASSET SERVE API — Stream file with Range support
 *
 * GET /api/media/projects/[projectId]/assets/[assetId]/serve
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getFileStream, getFileSizeSync, fileExists } from '@/lib/media/storage';

const DEV_PRACTITIONER_ID = '0a93962d-55a2-4deb-ad46-5268ee19be54';

type RouteParams = { params: Promise<{ projectId: string; assetId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId, assetId } = await params;
    let memberId = await getMemberIdFromRequest(request);
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership and get asset
    const result = await db.query(
      `SELECT a.storage_path, a.mime_type, a.file_size_bytes
       FROM media_assets a
       JOIN media_projects p ON p.id = a.project_id
       WHERE a.id = $1 AND a.project_id = $2 AND p.practitioner_id = $3`,
      [assetId, projectId, DEV_PRACTITIONER_ID]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const asset = result.rows[0];

    if (!fileExists(asset.storage_path)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
    }

    const fileSize = asset.file_size_bytes || getFileSizeSync(asset.storage_path);
    const rangeHeader = request.headers.get('range');

    if (rangeHeader) {
      // Parse Range header
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (!match) {
        return new NextResponse('Invalid Range', { status: 416 });
      }

      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse('Range Not Satisfiable', {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` },
        });
      }

      const chunkSize = end - start + 1;
      const stream = getFileStream(asset.storage_path, { start, end });

      // Convert Node stream to Web ReadableStream
      const webStream = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
          stream.on('end', () => controller.close());
          stream.on('error', (err) => controller.error(err));
        },
      });

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          'Content-Type': asset.mime_type,
          'Content-Length': String(chunkSize),
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }

    // Full file response
    const stream = getFileStream(asset.storage_path);
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': asset.mime_type,
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[Media] Asset serve error:', err);
    return NextResponse.json({ error: 'Failed to serve asset' }, { status: 500 });
  }
}
