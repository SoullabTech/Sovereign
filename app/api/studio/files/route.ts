export const dynamic = 'force-dynamic';

/**
 * STUDIO FILES API (Vault)
 *
 * CRUD operations for practitioner file storage
 * Supports upload, download, sharing with clients/colleagues
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getPractitionerIdForMember } from '@/lib/studio/getPractitionerIdForMember';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const STORAGE_BASE = process.env.FILE_STORAGE_PATH || '/app/data/vault';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const MIME_TO_TYPE: Record<string, string> = {
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'text/plain': 'document',
  'text/markdown': 'document',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'video/webm': 'video',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/mp4': 'audio',
  'audio/webm': 'audio',
  'application/vnd.ms-excel': 'spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
  'text/csv': 'spreadsheet',
  'application/zip': 'archive',
  'application/x-rar-compressed': 'archive',
};

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/__+/g, '_')
    .substring(0, 200);
}

function getFileType(mimeType: string): string {
  return MIME_TO_TYPE[mimeType] || 'file';
}

// GET - List files and folders
export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found for member' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const folderPath = searchParams.get('path') || '';
    const search = searchParams.get('search') || '';
    const fileType = searchParams.get('type');
    const includeArchived = searchParams.get('includeArchived') === 'true';

    // Parse folder path
    const pathArray = folderPath ? folderPath.split('/').filter(Boolean) : [];

    // Build query for files
    let filesSql = `
      SELECT
        id, name, original_name, mime_type, size_bytes,
        folder_path, file_type, encrypted, description, tags,
        status, created_at, updated_at,
        (SELECT COUNT(*) FROM practitioner_file_shares WHERE file_id = practitioner_files.id AND is_active = true) as share_count
      FROM practitioner_files
      WHERE practitioner_id = $1
        AND folder_path = $2
    `;
    const filesParams: (string | string[])[] = [practitionerId, pathArray];

    if (!includeArchived) {
      filesSql += ` AND status = 'active'`;
    }

    if (search) {
      filesSql += ` AND (name ILIKE $${filesParams.length + 1} OR description ILIKE $${filesParams.length + 1})`;
      filesParams.push(`%${search}%`);
    }

    if (fileType) {
      filesSql += ` AND file_type = $${filesParams.length + 1}`;
      filesParams.push(fileType);
    }

    filesSql += ` ORDER BY created_at DESC`;

    const filesResult = await db.query(filesSql, filesParams);

    // Get folders at this level
    const foldersResult = await db.query(
      `SELECT id, name, parent_path, color, encrypted, created_at
       FROM practitioner_file_folders
       WHERE practitioner_id = $1 AND parent_path = $2
       ORDER BY name`,
      [practitionerId, pathArray]
    );

    const files = filesResult.rows.map(row => ({
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
      shareCount: parseInt(row.share_count),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    const folders = foldersResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      parentPath: row.parent_path,
      color: row.color,
      encrypted: row.encrypted,
      createdAt: row.created_at,
    }));

    // Get stats
    const statsResult = await db.query(
      `SELECT
         COUNT(*) as total_files,
         COALESCE(SUM(size_bytes), 0) as total_size,
         COUNT(*) FILTER (WHERE encrypted = true) as encrypted_count
       FROM practitioner_files
       WHERE practitioner_id = $1 AND status = 'active'`,
      [practitionerId]
    );

    const stats = {
      totalFiles: parseInt(statsResult.rows[0]?.total_files || '0'),
      totalSize: parseInt(statsResult.rows[0]?.total_size || '0'),
      encryptedCount: parseInt(statsResult.rows[0]?.encrypted_count || '0'),
    };

    return NextResponse.json({
      success: true,
      files,
      folders,
      currentPath: pathArray,
      stats,
    });
  } catch (error) {
    console.error('[Studio Files] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// POST - Upload file or create folder
export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found for member' }, { status: 404 });
    }

    const contentType = request.headers.get('content-type') || '';

    // Handle folder creation (JSON)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { action, name, parentPath = [], color = '#6366f1' } = body;

      if (action === 'createFolder') {
        if (!name?.trim()) {
          return NextResponse.json({ success: false, error: 'Folder name is required' }, { status: 400 });
        }

        const result = await db.query(
          `INSERT INTO practitioner_file_folders (practitioner_id, name, parent_path, color)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (practitioner_id, parent_path, name) DO NOTHING
           RETURNING *`,
          [practitionerId, name.trim(), parentPath, color]
        );

        if (result.rows.length === 0) {
          return NextResponse.json({ success: false, error: 'Folder already exists' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          folder: {
            id: result.rows[0].id,
            name: result.rows[0].name,
            parentPath: result.rows[0].parent_path,
            color: result.rows[0].color,
            encrypted: result.rows[0].encrypted,
            createdAt: result.rows[0].created_at,
          },
        });
      }

      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // Handle file upload (multipart)
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderPathStr = formData.get('folderPath') as string || '';
    const description = formData.get('description') as string || '';
    const tagsStr = formData.get('tags') as string || '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    const folderPath = folderPathStr ? folderPathStr.split('/').filter(Boolean) : [];
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Generate storage path
    const fileId = randomUUID();
    const ext = path.extname(file.name);
    const sanitizedName = sanitizeFilename(path.basename(file.name, ext));
    const storagePath = `${practitionerId}/${fileId}${ext}`;

    // Ensure directory exists
    const fullDir = path.join(STORAGE_BASE, practitionerId);
    if (!existsSync(fullDir)) {
      await mkdir(fullDir, { recursive: true });
    }

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const fullPath = path.join(STORAGE_BASE, storagePath);
    await writeFile(fullPath, buffer);

    // Insert into database
    const result = await db.query(
      `INSERT INTO practitioner_files
        (id, practitioner_id, name, original_name, mime_type, size_bytes, storage_path, folder_path, file_type, description, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        fileId,
        practitionerId,
        `${sanitizedName}${ext}`,
        file.name,
        file.type,
        file.size,
        storagePath,
        folderPath,
        getFileType(file.type),
        description || null,
        tags,
      ]
    );

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
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    console.error('[Studio Files] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// DELETE - Delete file or folder
export async function DELETE(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found for member' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');
    const folderId = searchParams.get('folderId');
    const permanent = searchParams.get('permanent') === 'true';

    if (fileId) {
      // Delete file (soft delete by default)
      if (permanent) {
        // Hard delete - also remove from storage
        const fileResult = await db.query(
          `DELETE FROM practitioner_files WHERE id = $1 AND practitioner_id = $2 RETURNING storage_path`,
          [fileId, practitionerId]
        );
        // Note: Could also delete from filesystem here
        if (fileResult.rows.length === 0) {
          return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
        }
      } else {
        // Soft delete
        const result = await db.query(
          `UPDATE practitioner_files SET status = 'deleted', deleted_at = NOW(), updated_at = NOW()
           WHERE id = $1 AND practitioner_id = $2 RETURNING id`,
          [fileId, practitionerId]
        );
        if (result.rows.length === 0) {
          return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
        }
      }
    } else if (folderId) {
      // Delete folder (only if empty)
      const filesInFolder = await db.query(
        `SELECT id FROM practitioner_files WHERE practitioner_id = $1 AND $2 = ANY(folder_path) LIMIT 1`,
        [practitionerId, folderId]
      );

      if (filesInFolder.rows.length > 0) {
        return NextResponse.json({ success: false, error: 'Folder is not empty' }, { status: 400 });
      }

      const result = await db.query(
        `DELETE FROM practitioner_file_folders WHERE id = $1 AND practitioner_id = $2 RETURNING id`,
        [folderId, practitionerId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Folder not found' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ success: false, error: 'File or folder ID required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Files] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete' },
      { status: 500 }
    );
  }
}
