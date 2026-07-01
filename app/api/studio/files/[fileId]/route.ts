export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { cookies } from 'next/headers';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getPractitionerIdForMember } from '@/lib/studio/getPractitionerIdForMember';
import { resolveCurrentTeamId, COLAB_TEAM_COOKIE } from '@/lib/team/colabTeams';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

const STORAGE_BASE = process.env.FILE_STORAGE_PATH || '/app/data/vault';

async function resolveTeam(memberId: string, request: NextRequest): Promise<string | null> {
  const jar = await cookies();
  const cookieTeam =
    jar.get(COLAB_TEAM_COOKIE)?.value ??
    request.headers.get('x-colab-team-id') ??
    null;
  return resolveCurrentTeamId(memberId, cookieTeam);
}

// Scope-aware file lookup: verifies ownership AND that the requesting context
// has read authority over the file's declared scope. A colab-scoped file
// requires the active teamId to match — a practitioner in a different Co-Lab
// cannot download a file that belongs to another workspace.
async function getAuthorizedFile(
  fileId: string,
  practitionerId: string,
  teamId: string | null,
) {
  // Build the same scope clause as the list route
  const scopeClauses: string[] = [`file_scope = 'personal'`];
  const params: unknown[] = [fileId, practitionerId];

  if (teamId) {
    params.push(teamId);
    scopeClauses.push(`(file_scope = 'colab' AND team_id = $${params.length}::uuid)`);
    // client + encounter scopes: any file under this team's client/encounter is readable
    scopeClauses.push(`(file_scope IN ('client', 'encounter') AND team_id = $${params.length}::uuid)`);
  }

  const result = await db.query(
    `SELECT * FROM practitioner_files
     WHERE id = $1
       AND practitioner_id = $2
       AND status = 'active'
       AND (${scopeClauses.join(' OR ')})`,
    params
  );

  return result.rows[0] ?? null;
}

// ── GET — Download file ───────────────────────────────────────────────────────
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

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const teamId = await resolveTeam(memberId, request);
    const file = await getAuthorizedFile(fileId, practitionerId, teamId);

    if (!file) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const fullPath = path.join(STORAGE_BASE, file.storage_path);
    if (!existsSync(fullPath)) {
      return NextResponse.json({ success: false, error: 'File not found on disk' }, { status: 404 });
    }

    const fileBuffer = await readFile(fullPath);

    await db.query(
      `INSERT INTO practitioner_file_access_log (file_id, accessor_type, accessor_id, action)
       VALUES ($1, 'practitioner', $2, 'download')`,
      [fileId, practitionerId]
    );

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.mime_type,
        'Content-Disposition': `attachment; filename="${file.original_name}"`,
        'Content-Length': file.size_bytes.toString(),
      },
    });
  } catch (error) {
    console.error('[Studio Files] Download error:', error);
    return NextResponse.json({ success: false, error: 'Failed to download file' }, { status: 500 });
  }
}

// ── PATCH — Update file metadata ──────────────────────────────────────────────
// Ownership enforced by practitioner_id. Scope may also be updated here
// (e.g. promoting a personal file to colab-scoped).
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

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, tags, folderPath, status, fileScope, teamId: bodyTeamId } = body;

    const updateFields: string[] = [];
    const updateParams: unknown[] = [fileId, practitionerId];

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
    if (fileScope !== undefined && ['personal', 'colab', 'client', 'encounter'].includes(fileScope)) {
      updateFields.push(`file_scope = $${updateParams.length + 1}`);
      updateParams.push(fileScope);
      // If promoting to colab scope, require teamId
      if (fileScope !== 'personal' && bodyTeamId) {
        updateFields.push(`team_id = $${updateParams.length + 1}`);
        updateParams.push(bodyTeamId);
      }
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
        fileScope: row.file_scope,
        teamId: row.team_id,
        encrypted: row.encrypted,
        description: row.description,
        tags: row.tags,
        status: row.status,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Files] PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update file' }, { status: 500 });
  }
}

// ── POST — Create share link ──────────────────────────────────────────────────
// Share creation requires scope authorization — you can only share a file
// that is visible in your current Co-Lab context.
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

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const teamId = await resolveTeam(memberId, request);

    // Scope-aware existence check: cannot share a file outside your current context
    const file = await getAuthorizedFile(fileId, practitionerId, teamId);
    if (!file) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const body = await request.json();
    const { clientId, colleagueId, shareType = 'download', expiresInDays } = body;

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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://soullab.life';
    const shareUrl = `${baseUrl}/shared/file/${accessToken}`;

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
    return NextResponse.json({ success: false, error: 'Failed to create share link' }, { status: 500 });
  }
}
