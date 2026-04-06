export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * CHUNKED UPLOAD API
 *
 * POST /api/media/projects/[projectId]/upload-chunk
 *
 * Headers: x-chunk-index, x-total-chunks, x-upload-id, x-filename, x-total-size
 * Body: raw chunk data
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  storeChunk, allChunksReceived, assembleChunks,
  checkDiskSpace, ensureProjectDirs,
} from '@/lib/media/storage';
import { MAX_UPLOAD_BYTES } from '@/lib/media/storage';
import { enqueueProcessingPipeline } from '@/lib/media/enqueueJobs';
import { detectMediaType } from '@/lib/media/types';
import type { MediaType } from '@/lib/media/types';

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

    const practitionerId = DEV_PRACTITIONER_ID;

    // Verify project
    const projectResult = await db.query(
      'SELECT id, media_type, ai_processing_allowed FROM media_projects WHERE id = $1 AND practitioner_id = $2',
      [projectId, practitionerId]
    );
    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Parse headers
    const chunkIndex = parseInt(request.headers.get('x-chunk-index') || '-1', 10);
    const totalChunks = parseInt(request.headers.get('x-total-chunks') || '0', 10);
    const uploadId = request.headers.get('x-upload-id');
    const filename = request.headers.get('x-filename') || 'upload';
    const totalSize = parseInt(request.headers.get('x-total-size') || '0', 10);

    if (chunkIndex < 0 || totalChunks <= 0 || !uploadId) {
      return NextResponse.json({ error: 'Missing chunk headers' }, { status: 400 });
    }

    // Validate total size
    if (totalSize > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: `Total file size exceeds ${MAX_UPLOAD_BYTES} byte limit` }, { status: 413 });
    }

    // Check disk space on first chunk
    if (chunkIndex === 0) {
      const diskError = await checkDiskSpace();
      if (diskError) {
        return NextResponse.json({ error: diskError }, { status: 507 });
      }
      await ensureProjectDirs(projectId);
    }

    // Store chunk
    const buffer = Buffer.from(await request.arrayBuffer());
    await storeChunk(projectId, uploadId, chunkIndex, buffer);

    // Check if all chunks received
    const complete = await allChunksReceived(projectId, uploadId, totalChunks);
    if (!complete) {
      return NextResponse.json({
        success: true,
        data: { chunkIndex, totalChunks, complete: false },
      });
    }

    // Assemble final file
    const stored = await assembleChunks(projectId, uploadId, totalChunks, filename);

    // Detect mime type from filename extension
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeMap: Record<string, string> = {
      mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4',
      mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm',
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    };
    const mimeType = mimeMap[ext] || 'application/octet-stream';
    const detectedType = detectMediaType(mimeType);
    const mediaType = (projectResult.rows[0].media_type as MediaType) || detectedType || 'audio';

    // Insert asset + update project
    await db.query(
      `INSERT INTO media_assets (project_id, asset_type, storage_path, mime_type, file_size_bytes)
       VALUES ($1, 'original', $2, $3, $4)`,
      [projectId, stored.relativePath, mimeType, stored.sizeBytes]
    );

    await db.query(
      `UPDATE media_projects SET
         status = 'processing', file_size_bytes = $1, mime_type = $2,
         media_type = $3, updated_at = NOW()
       WHERE id = $4`,
      [stored.sizeBytes, mimeType, mediaType, projectId]
    );

    // Enqueue pipeline
    const aiAllowed = projectResult.rows[0].ai_processing_allowed;
    const jobIds = await enqueueProcessingPipeline({
      projectId, mediaType, aiProcessingAllowed: aiAllowed,
    });

    console.log(`[Media] Chunked upload assembled: ${filename} (${stored.sizeBytes} bytes) → ${jobIds.length} jobs`);

    return NextResponse.json({
      success: true,
      data: {
        storagePath: stored.relativePath,
        sizeBytes: stored.sizeBytes,
        complete: true,
        jobsEnqueued: jobIds.length,
      },
    });
  } catch (err) {
    console.error('[Media] Chunked upload error:', err);
    return NextResponse.json({ error: 'Chunked upload failed' }, { status: 500 });
  }
}
