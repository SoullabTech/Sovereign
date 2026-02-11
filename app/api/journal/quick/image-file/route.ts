// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

/**
 * Journal Image File Serve API
 * GET /api/journal/quick/image-file?entryId=<uuid>
 *
 * Serves stored handwriting images for display in the journal UI.
 *
 * Security model:
 * - Auth-gated: requires authenticated member via cookie/header
 * - Content-bound: looks up image_path from DB scoped to memberId
 * - Client never supplies filesystem paths — only entry IDs
 * - Path traversal protection as defense-in-depth on the DB-stored path
 * - MIME whitelist on serve (mirrors upload whitelist)
 */

import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

// Node runtime required for filesystem reads
export const runtime = 'nodejs';

// Safe MIME types — must match upload whitelist in image/route.ts
const SAFE_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

// Extension → MIME fallback (when DB mime is missing)
const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};

// Defense-in-depth: validate the DB-stored path before reading from disk
function safeRelPath(p: string): string | null {
  // Reject path traversal: .., absolute paths, backslashes
  if (p.includes('..')) return null;
  if (p.startsWith('/')) return null;
  if (p.includes('\\')) return null;

  // Must start with the expected storage prefix
  if (!p.startsWith('storage/images/journals/')) return null;

  // Normalize and re-check (handles edge cases like storage/images/journals/./../../etc)
  const normalized = path.posix.normalize(p);
  if (!normalized.startsWith('storage/images/journals/')) return null;
  if (normalized.includes('..')) return null;

  return normalized;
}

export async function GET(request: NextRequest) {
  // Capacitor builds: this endpoint requires server — return explicit 501
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json(
      { success: false, error: 'Image serving requires server. Use API base URL.' },
      { status: 501 }
    );
  }

  // Auth: require authenticated member
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    console.warn('[InkJournal:serve] Unauthorized image request');
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let entryId: string | null = null;
  try {
    entryId = request.nextUrl.searchParams.get('entryId');
  } catch {
    return NextResponse.json({ success: false, error: 'Static export' }, { status: 503 });
  }

  if (!entryId) {
    return NextResponse.json(
      { success: false, error: 'Missing entryId parameter' },
      { status: 400 }
    );
  }

  // Validate entryId format (UUID only — reject anything else)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(entryId)) {
    console.warn(`[InkJournal:serve] Invalid entryId format: ${entryId.slice(0, 40)}`);
    return NextResponse.json(
      { success: false, error: 'Invalid entryId format' },
      { status: 400 }
    );
  }

  // DB-bound lookup: get image_path scoped to this member's entry
  let imagePath: string;
  let imageMime: string | null;
  try {
    const result = await query<{ image_path: string; image_mime: string }>(
      `SELECT image_path, image_mime FROM quick_journal_entries
       WHERE id = $1 AND user_id = $2 AND image_path IS NOT NULL
       LIMIT 1`,
      [entryId, memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    imagePath = result.rows[0].image_path;
    imageMime = result.rows[0].image_mime;
  } catch (err) {
    console.error('[InkJournal:serve] DB lookup failed:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to look up image' },
      { status: 500 }
    );
  }

  // Defense-in-depth: validate DB-stored path before filesystem read
  const safePath = safeRelPath(imagePath);
  if (!safePath) {
    console.error(`[InkJournal:serve] DB contains unsafe image_path: ${imagePath}`);
    return NextResponse.json(
      { success: false, error: 'Image path integrity error' },
      { status: 500 }
    );
  }

  // Determine content type: whitelist DB-stored mime, fallback to extension
  let contentType: string;
  if (imageMime && SAFE_IMAGE_MIMES.has(imageMime)) {
    contentType = imageMime;
  } else {
    const ext = path.extname(safePath).toLowerCase();
    contentType = EXT_TO_MIME[ext] || 'application/octet-stream';
  }

  const absPath = path.join(process.cwd(), safePath);

  // Read file with proper error discrimination
  try {
    const data = await fs.readFile(absPath);

    // ETag: content hash for conditional requests (images are immutable)
    const etag = `"${crypto.createHash('md5').update(data).digest('hex')}"`;

    // Check If-None-Match — return 304 if client already has this version
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'private, max-age=86400',
          'Vary': 'Cookie',
        },
      });
    }

    const filename = path.basename(safePath);

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(data.length),
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, max-age=86400',
        'ETag': etag,
        'Vary': 'Cookie',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err: unknown) {
    // ENOENT (file missing on disk) → 404, everything else → 500
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === 'ENOENT') {
      console.warn(`[InkJournal:serve] File missing on disk: ${safePath}`);
      return NextResponse.json(
        { success: false, error: 'Image file not found' },
        { status: 404 }
      );
    }
    console.error(`[InkJournal:serve] fs.readFile failed (${code}):`, safePath);
    return NextResponse.json(
      { success: false, error: 'Failed to read image' },
      { status: 500 }
    );
  }
}
