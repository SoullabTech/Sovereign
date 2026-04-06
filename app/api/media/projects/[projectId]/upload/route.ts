export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * MEDIA UPLOAD API — Single File Upload
 *
 * POST /api/media/projects/[projectId]/upload
 *
 * Accepts FormData with 'file' field.
 * Validates size, stores to local filesystem, enqueues processing pipeline.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { storeFile, validateUploadSize, checkDiskSpace, ensureProjectDirs } from '@/lib/media/storage';
import { enqueueProcessingPipeline } from '@/lib/media/enqueueJobs';
import { detectMediaType, ALL_ACCEPTED_MIMES } from '@/lib/media/types';
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

    const practitionerId = process.env.NODE_ENV === 'development' ? DEV_PRACTITIONER_ID : DEV_PRACTITIONER_ID;

    // Verify project exists and belongs to practitioner
    const projectResult = await db.query(
      'SELECT id, media_type, ai_processing_allowed FROM media_projects WHERE id = $1 AND practitioner_id = $2',
      [projectId, practitionerId]
    );
    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check Content-Length
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    const sizeError = validateUploadSize(contentLength || null);
    if (sizeError) {
      return NextResponse.json({ error: sizeError }, { status: 413 });
    }

    // Check disk space
    const diskError = await checkDiskSpace();
    if (diskError) {
      return NextResponse.json({ error: diskError }, { status: 507 });
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate mime type
    if (!(ALL_ACCEPTED_MIMES as readonly string[]).includes(file.type)) {
      return NextResponse.json({
        error: `Unsupported file type: ${file.type}`,
        accepted: ALL_ACCEPTED_MIMES,
      }, { status: 415 });
    }

    // Detect media type from mime
    const detectedType = detectMediaType(file.type);
    const projectMediaType = (projectResult.rows[0].media_type as MediaType) || detectedType || 'audio';

    // Store file
    await ensureProjectDirs(projectId);
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storeFile(projectId, 'original', file.name, buffer);

    // Insert asset record
    await db.query(
      `INSERT INTO media_assets (project_id, asset_type, storage_path, mime_type, file_size_bytes)
       VALUES ($1, 'original', $2, $3, $4)`,
      [projectId, stored.relativePath, file.type, stored.sizeBytes]
    );

    // Update project with file info and set status to processing
    await db.query(
      `UPDATE media_projects SET
         status = 'processing',
         file_size_bytes = $1,
         mime_type = $2,
         media_type = $3,
         updated_at = NOW()
       WHERE id = $4`,
      [stored.sizeBytes, file.type, projectMediaType, projectId]
    );

    // Enqueue processing pipeline
    const aiAllowed = projectResult.rows[0].ai_processing_allowed;
    const jobIds = await enqueueProcessingPipeline({
      projectId,
      mediaType: projectMediaType,
      aiProcessingAllowed: aiAllowed,
    });

    console.log(`[Media] Upload complete: ${file.name} (${stored.sizeBytes} bytes) → ${jobIds.length} jobs enqueued`);

    return NextResponse.json({
      success: true,
      data: {
        storagePath: stored.relativePath,
        sizeBytes: stored.sizeBytes,
        mimeType: file.type,
        mediaType: projectMediaType,
        jobsEnqueued: jobIds.length,
      },
    });
  } catch (err) {
    console.error('[Media] Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
