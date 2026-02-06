export const dynamic = 'force-dynamic';

/**
 * PUBLIC FILE SHARE ACCESS
 *
 * Allows clients/colleagues to access shared files via token
 * No authentication required - access controlled by token validity
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const STORAGE_BASE = process.env.FILE_STORAGE_PATH || '/app/data/vault';

// GET - Download shared file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find share by token
    const shareResult = await db.query(
      `SELECT s.*, f.storage_path, f.mime_type, f.original_name, f.size_bytes, f.status as file_status
       FROM practitioner_file_shares s
       JOIN practitioner_files f ON s.file_id = f.id
       WHERE s.access_token = $1`,
      [token]
    );

    if (shareResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Share link not found' }, { status: 404 });
    }

    const share = shareResult.rows[0];

    // Check if share is active
    if (!share.is_active) {
      return NextResponse.json({ success: false, error: 'This share link has been revoked' }, { status: 403 });
    }

    // Check if file is active
    if (share.file_status !== 'active') {
      return NextResponse.json({ success: false, error: 'File no longer available' }, { status: 404 });
    }

    // Check expiration
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'This share link has expired' }, { status: 403 });
    }

    // Read file
    const fullPath = path.join(STORAGE_BASE, share.storage_path);

    if (!existsSync(fullPath)) {
      return NextResponse.json({ success: false, error: 'File not found on disk' }, { status: 404 });
    }

    const fileBuffer = await readFile(fullPath);

    // Update access tracking
    await db.query(
      `UPDATE practitioner_file_shares
       SET access_count = access_count + 1, last_accessed_at = NOW()
       WHERE id = $1`,
      [share.id]
    );

    // Log access
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await db.query(
      `INSERT INTO practitioner_file_access_log
        (file_id, accessor_type, action, ip_address, user_agent)
       VALUES ($1, 'link', 'download', $2, $3)`,
      [share.file_id, ip.substring(0, 100), userAgent.substring(0, 500)]
    );

    // Determine content disposition based on share type
    const disposition = share.share_type === 'view' ? 'inline' : 'attachment';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': share.mime_type,
        'Content-Disposition': `${disposition}; filename="${share.original_name}"`,
        'Content-Length': share.size_bytes.toString(),
      },
    });
  } catch (error) {
    console.error('[Shared File] Download error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to access file' },
      { status: 500 }
    );
  }
}
