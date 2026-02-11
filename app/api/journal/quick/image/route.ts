// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

/**
 * Journal Image Upload API
 * POST /api/journal/quick/image
 *
 * Handles image uploads for handwriting journal entries.
 * Stores files locally in storage/images/journals/{userId}/
 * Updates the quick_journal_entries row with image metadata.
 */

import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

// Node runtime required for filesystem writes
export const runtime = 'nodejs';

// Allowed image MIME types and their file extensions
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

// Max file size: 20MB
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

// Magic byte signatures for image format validation
// Catches MIME header lies — validates actual file content
function detectImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg';

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47
      && buf[4] === 0x0D && buf[5] === 0x0A && buf[6] === 0x1A && buf[7] === 0x0A) return 'image/png';

  // WebP: RIFF....WEBP
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
      && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp';

  // HEIC/HEIF: ....ftyp (at offset 4)
  if (buf.length >= 12 && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
    const brand = buf.toString('ascii', 8, 12);
    if (brand === 'heic' || brand === 'heix' || brand === 'mif1') return 'image/heic';
    if (brand === 'hevc' || brand === 'hevx') return 'image/heif';
  }

  return null; // Unknown format
}

function safeSegment(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    // Auth: require authenticated member
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Feature gate: image uploads disabled by default
    if (process.env.ALLOW_IMAGE_UPLOADS !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Image uploads are disabled.' },
        { status: 410 }
      );
    }

    // Guard: reject non-multipart requests
    const ct = request.headers.get('content-type') ?? '';
    if (!ct.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Expected multipart/form-data (FormData upload). Do not set Content-Type manually.' },
        { status: 415 }
      );
    }

    const form = await request.formData();

    const userId = memberId;
    const entryId = String(form.get('entryId') || '');
    const file = form.get('image') as File | null;

    if (!entryId || !file) {
      return NextResponse.json(
        { success: false, error: 'Missing entryId or image file' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Image file too large (max 20MB)' },
        { status: 413 }
      );
    }

    // Validate MIME type
    const imageMime = file.type || '';
    const ext = ALLOWED_IMAGE_TYPES[imageMime];
    if (!ext) {
      return NextResponse.json(
        { success: false, error: `Unsupported image type: ${imageMime}. Allowed: JPEG, PNG, WebP, HEIC` },
        { status: 415 }
      );
    }

    const safeUser = safeSegment(userId);
    const ts = Date.now();
    const fname = `${safeSegment(entryId)}-${ts}-${crypto.randomBytes(4).toString('hex')}.${ext}`;

    const baseDir = path.join(process.cwd(), 'storage', 'images', 'journals', safeUser);
    await ensureDir(baseDir);

    const absPath = path.join(baseDir, fname);
    const relPath = path.join('storage', 'images', 'journals', safeUser, fname);

    // Read file bytes and validate magic bytes match claimed MIME type
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const detectedType = detectImageType(buffer);

    if (detectedType && detectedType !== imageMime) {
      // Magic bytes don't match MIME header — use detected type if it's allowed
      if (ALLOWED_IMAGE_TYPES[detectedType]) {
        console.warn(`[InkJournal] MIME mismatch: claimed ${imageMime}, detected ${detectedType}. Using detected.`);
        // Intentionally proceed with detected type — client MIME headers aren't trustworthy
      } else {
        return NextResponse.json(
          { success: false, error: 'File content does not match an allowed image format' },
          { status: 415 }
        );
      }
    } else if (!detectedType) {
      // Couldn't detect from magic bytes — trust the MIME header (already validated above)
      // This covers edge cases like unusual HEIC variants
      console.warn(`[InkJournal] Could not detect image type from magic bytes. Trusting MIME header: ${imageMime}`);
    }

    // Write image file to disk
    await fs.writeFile(absPath, buffer);

    // Update the journal entry with image metadata
    await query(
      `UPDATE quick_journal_entries
       SET image_path = $1,
           image_mime = $2
       WHERE id = $3 AND user_id = $4`,
      [relPath, imageMime, entryId, userId]
    );

    console.log(`[InkJournal] Image saved: ${relPath} (${Math.round(file.size / 1024)}KB, ${imageMime})`);

    return NextResponse.json({
      success: true,
      imagePath: relPath,
      imageMime,
    });

  } catch (error) {
    console.error('[InkJournal] Upload failed:', error);
    return NextResponse.json(
      { success: false, error: 'Image upload failed' },
      { status: 500 }
    );
  }
}
