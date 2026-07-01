export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { cookies } from 'next/headers';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getPractitionerIdForMember } from '@/lib/studio/getPractitionerIdForMember';
import { resolveCurrentTeamId, COLAB_TEAM_COOKIE } from '@/lib/team/colabTeams';
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

async function resolveTeam(memberId: string, request: NextRequest): Promise<string | null> {
  const jar = await cookies();
  const cookieTeam =
    jar.get(COLAB_TEAM_COOKIE)?.value ??
    request.headers.get('x-colab-team-id') ??
    null;
  return resolveCurrentTeamId(memberId, cookieTeam);
}

// ── GET — List files and folders, scoped to active Co-Lab ────────────────────
export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const teamId = await resolveTeam(memberId, request);

    const { searchParams } = new URL(request.url);
    const folderPath = searchParams.get('path') || '';
    const search = searchParams.get('search') || '';
    const fileType = searchParams.get('type');
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const clientId = searchParams.get('clientId') || null;
    const encounterId = searchParams.get('encounterId') || null;

    const pathArray = folderPath ? folderPath.split('/').filter(Boolean) : [];

    // Scope clause: personal always included; colab/client/encounter only when
    // the exact context is provided. Absence = restriction, not widening.
    const scopeClauses: string[] = [`file_scope = 'personal'`];
    const filesParams: unknown[] = [practitionerId, pathArray];
    let teamParamIdx: number | null = null;

    if (teamId) {
      filesParams.push(teamId);
      teamParamIdx = filesParams.length; // $3
      scopeClauses.push(`(file_scope = 'colab' AND team_id = $${teamParamIdx}::uuid)`);
    }
    if (clientId && teamParamIdx !== null) {
      filesParams.push(clientId);
      const pc = filesParams.length;
      scopeClauses.push(
        `(file_scope = 'client' AND client_id = $${pc}::uuid AND team_id = $${teamParamIdx}::uuid)`
      );
    }
    if (encounterId && teamParamIdx !== null) {
      filesParams.push(encounterId);
      const pe = filesParams.length;
      scopeClauses.push(
        `(file_scope = 'encounter' AND encounter_id = $${pe}::uuid AND team_id = $${teamParamIdx}::uuid)`
      );
    }

    const scopeWhere = `(${scopeClauses.join(' OR ')})`;

    let filesSql = `
      SELECT
        id, name, original_name, mime_type, size_bytes,
        folder_path, file_type, file_scope, team_id, client_id, encounter_id,
        encrypted, description, tags, status, created_at, updated_at,
        (SELECT COUNT(*) FROM practitioner_file_shares WHERE file_id = practitioner_files.id AND is_active = true) as share_count
      FROM practitioner_files
      WHERE practitioner_id = $1
        AND folder_path = $2
        AND ${scopeWhere}
    `;

    if (!includeArchived) {
      filesSql += ` AND status = 'active'`;
    }
    if (search) {
      filesParams.push(`%${search}%`);
      filesSql += ` AND (name ILIKE $${filesParams.length} OR description ILIKE $${filesParams.length})`;
    }
    if (fileType) {
      filesParams.push(fileType);
      filesSql += ` AND file_type = $${filesParams.length}`;
    }

    filesSql += ` ORDER BY created_at DESC`;

    const filesResult = await db.query(filesSql, filesParams);

    // Folders: same scope filter
    const folderScopeClauses = [`file_scope = 'personal'`];
    const folderParams: unknown[] = [practitionerId, pathArray];

    if (teamId) {
      folderParams.push(teamId);
      folderScopeClauses.push(`(file_scope = 'colab' AND team_id = $${folderParams.length}::uuid)`);
    }

    const foldersResult = await db.query(
      `SELECT id, name, parent_path, color, file_scope, team_id, encrypted, created_at
       FROM practitioner_file_folders
       WHERE practitioner_id = $1 AND parent_path = $2
         AND (${folderScopeClauses.join(' OR ')})
       ORDER BY name`,
      folderParams
    );

    // Stats: all active files for this practitioner in personal + current colab scope
    const statsScopeClauses = [`file_scope = 'personal'`];
    const statsParams: unknown[] = [practitionerId];
    if (teamId) {
      statsParams.push(teamId);
      statsScopeClauses.push(`(file_scope = 'colab' AND team_id = $${statsParams.length}::uuid)`);
    }

    const statsResult = await db.query(
      `SELECT
         COUNT(*) as total_files,
         COALESCE(SUM(size_bytes), 0) as total_size,
         COUNT(*) FILTER (WHERE encrypted = true) as encrypted_count
       FROM practitioner_files
       WHERE practitioner_id = $1
         AND status = 'active'
         AND (${statsScopeClauses.join(' OR ')})`,
      statsParams
    );

    return NextResponse.json({
      success: true,
      files: filesResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        originalName: row.original_name,
        mimeType: row.mime_type,
        sizeBytes: parseInt(row.size_bytes),
        folderPath: row.folder_path,
        fileType: row.file_type,
        fileScope: row.file_scope,
        teamId: row.team_id,
        encrypted: row.encrypted,
        description: row.description,
        tags: row.tags,
        status: row.status,
        shareCount: parseInt(row.share_count),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      folders: foldersResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        parentPath: row.parent_path,
        color: row.color,
        fileScope: row.file_scope,
        teamId: row.team_id,
        encrypted: row.encrypted,
        createdAt: row.created_at,
      })),
      currentPath: pathArray,
      activeTeamId: teamId,
      stats: {
        totalFiles: parseInt(statsResult.rows[0]?.total_files || '0'),
        totalSize: parseInt(statsResult.rows[0]?.total_size || '0'),
        encryptedCount: parseInt(statsResult.rows[0]?.encrypted_count || '0'),
      },
    });
  } catch (error) {
    console.error('[Studio Files] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch files' }, { status: 500 });
  }
}

// ── POST — Upload file or create folder, scoped to active Co-Lab ─────────────
export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const teamId = await resolveTeam(memberId, request);

    const contentType = request.headers.get('content-type') || '';

    // ── Folder creation ──────────────────────────────────────────────────────
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { action, name, parentPath = [], color = '#6366f1' } = body;

      if (action === 'createFolder') {
        if (!name?.trim()) {
          return NextResponse.json({ success: false, error: 'Folder name is required' }, { status: 400 });
        }

        // Scope: colab if active team, otherwise personal
        const folderScope = teamId ? 'colab' : 'personal';

        const result = await db.query(
          `INSERT INTO practitioner_file_folders (practitioner_id, name, parent_path, color, file_scope, team_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (practitioner_id, parent_path, name) DO NOTHING
           RETURNING *`,
          [practitionerId, name.trim(), parentPath, color, folderScope, teamId ?? null]
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
            fileScope: result.rows[0].file_scope,
            teamId: result.rows[0].team_id,
            encrypted: result.rows[0].encrypted,
            createdAt: result.rows[0].created_at,
          },
        });
      }

      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // ── File upload ──────────────────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderPathStr = formData.get('folderPath') as string || '';
    const description = formData.get('description') as string || '';
    const tagsStr = formData.get('tags') as string || '';
    // Caller may explicitly declare scope; default to colab if team active, else personal
    const declaredScope = formData.get('fileScope') as string || '';
    const clientId = formData.get('clientId') as string || null;
    const encounterId = formData.get('encounterId') as string || null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    // Resolve file scope: honor explicit declaration if valid, else infer from context
    let fileScope: string = 'personal';
    if (declaredScope && ['personal', 'colab', 'client', 'encounter'].includes(declaredScope)) {
      fileScope = declaredScope;
    } else if (encounterId && teamId) {
      fileScope = 'encounter';
    } else if (clientId && teamId) {
      fileScope = 'client';
    } else if (teamId) {
      fileScope = 'colab';
    }

    // Scope coherence: non-personal must have teamId
    if (fileScope !== 'personal' && !teamId) {
      return NextResponse.json(
        { success: false, error: 'No active Co-Lab. Select a workspace before uploading scoped files.' },
        { status: 400 }
      );
    }

    const folderPath = folderPathStr ? folderPathStr.split('/').filter(Boolean) : [];
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    const fileId = randomUUID();
    const ext = path.extname(file.name);
    const sanitizedName = sanitizeFilename(path.basename(file.name, ext));
    const storagePath = `${practitionerId}/${fileId}${ext}`;

    const fullDir = path.join(STORAGE_BASE, practitionerId);
    if (!existsSync(fullDir)) {
      await mkdir(fullDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(STORAGE_BASE, storagePath), buffer);

    const result = await db.query(
      `INSERT INTO practitioner_files
        (id, practitioner_id, name, original_name, mime_type, size_bytes,
         storage_path, folder_path, file_type, description, tags,
         file_scope, team_id, client_id, encounter_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
        fileScope,
        teamId ?? null,
        clientId ?? null,
        encounterId ?? null,
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
        fileScope: row.file_scope,
        teamId: row.team_id,
        encrypted: row.encrypted,
        description: row.description,
        tags: row.tags,
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    console.error('[Studio Files] POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}

// ── DELETE — Delete file or folder ────────────────────────────────────────────
// Ownership is enforced by practitioner_id on every query. A practitioner may
// delete any file they own regardless of its scope — scope controls visibility,
// not deletion authority.
export async function DELETE(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');
    const folderId = searchParams.get('folderId');
    const permanent = searchParams.get('permanent') === 'true';

    if (fileId) {
      if (permanent) {
        const fileResult = await db.query(
          `DELETE FROM practitioner_files WHERE id = $1 AND practitioner_id = $2 RETURNING storage_path`,
          [fileId, practitionerId]
        );
        if (fileResult.rows.length === 0) {
          return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
        }
      } else {
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
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
