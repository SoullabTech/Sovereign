export const dynamic = 'force-dynamic';

/**
 * STUDIO FILES - Single File Operations
 *
 * Download, update metadata, share management
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

const STORAGE_BASE = process.env.FILE_STORAGE_PATH || '/app/data/vault';

async function getPractitionerId(): Promise<string | null> {
  const result = await db.query(
    'SELECT id FROM practitioners WHERE slug = $1',
    ['stellium']
  );
  return result.rows[0]?.id || null;
}

// GET - Download file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    // Get file info
    const result = await db.query(
      `SELECT * FROM practitioner_files
       WHERE id = $1 AND practitioner_id = $2 AND status = 'active'`,
      [fileId, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const file = result.rows[0];
    const fullPath = path.join(STORAGE_BASE, file.storage_path);

    if (!existsSync(fullPath)) {
      return NextResponse.json({ success: false, error: 'File not found on disk' }, { status: 404 });
    }

    // Read file
    const fileBuffer = await readFile(fullPath);

    // Log access
    await db.query(
      `INSERT INTO practitioner_file_access_log (file_id, accessor_type, accessor_id, action)
       VALUES ($1, 'practitioner', $2, 'download')`,
      [fileId, practitionerId]
    );

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.mime_type,
        'Content-Disposition': `attachment; filename="${file.original_name}"`,
        'Content-Length': file.size_bytes.toString(),
      },
    });
  } catch (error) {
    console.error('[Studio Files] Download error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download file' },
      { status: 500 }
    );
  }
}

// PATCH - Update file metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, tags, folderPath, status } = body;

    const updateFields: string[] = [];
    const updateParams: (string | string[] | null)[] = [fileId, practitionerId];

    if (name !== undefined) {
      updateFields.push(`name = $${updateParams.length + 1}`);
      updateParams.push(name);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${updateParams.length + 1}`);
      updateParams.push(description);
    }
    if (tags !== undefined) {
      updateFields.push(`tags = $${updateParams.length + 1}`);
      updateParams.push(tags);
    }
    if (folderPath !== undefined) {
      updateFields.push(`folder_path = $${updateParams.length + 1}`);
      updateParams.push(folderPath);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${updateParams.length + 1}`);
      updateParams.push(status);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: 'No updates provided' }, { status: 400 });
    }

    updateFields.push(`updated_at = NOW()`);

    const result = await db.query(
      `UPDATE practitioner_files SET ${updateFields.join(', ')}
       WHERE id = $1 AND practitioner_id = $2
       RETURNING *`,
      updateParams
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      file: {
        id: row.id,
        name: row.name,
        originalName: row.original_name,
        mimeType: row.mime_type,
        sizeBytes: parseInt(row.size_bytes),
        folderPath: row.folder_path,
        fileType: row.file_type,
        encrypted: row.encrypted,
        description: row.description,
        tags: row.tags,
        status: row.status,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Files] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

// POST - Create share link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    // Verify file exists
    const fileCheck = await db.query(
      `SELECT id FROM practitioner_files WHERE id = $1 AND practitioner_id = $2 AND status = 'active'`,
      [fileId, practitionerId]
    );

    if (fileCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const body = await request.json();
    const { clientId, colleagueId, shareType = 'download', expiresInDays } = body;

    // Generate access token
    const accessToken = randomBytes(32).toString('hex');
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const result = await db.query(
      `INSERT INTO practitioner_file_shares
        (file_id, client_id, colleague_id, share_type, access_token, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [fileId, clientId || null, colleagueId || null, shareType, accessToken, expiresAt]
    );

    const share = result.rows[0];

    // Generate share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://soullab.life';
    const shareUrl = `${baseUrl}/shared/file/${accessToken}`;

    // Log share action
    await db.query(
      `INSERT INTO practitioner_file_access_log (file_id, accessor_type, accessor_id, action)
       VALUES ($1, 'practitioner', $2, 'share')`,
      [fileId, practitionerId]
    );

    return NextResponse.json({
      success: true,
      share: {
        id: share.id,
        accessToken: share.access_token,
        shareUrl,
        shareType: share.share_type,
        expiresAt: share.expires_at,
        createdAt: share.created_at,
      },
    });
  } catch (error) {
    console.error('[Studio Files] Share error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}
