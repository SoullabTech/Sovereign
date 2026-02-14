/**
 * Voice Preview File Server — serves ephemeral preview MP3 files by URL.
 *
 * GET /api/voice/preview/:file
 *
 * Security:
 *   - Requires authenticated session (cookie or x-session-token)
 *   - File must start with the member's ID (member-scoped access)
 *   - Only .mp3 files are served
 *
 * This endpoint exists so iOS WKWebView can play audio via a real URL
 * instead of a blob URL, which is unreliable in mobile WebViews.
 */

import { NextRequest } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const PREVIEW_DIR = '/tmp/maia-tts-preview';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  let memberId: string;
  try {
    memberId = await requireMemberId();
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { file } = await params;
  const decoded = decodeURIComponent(file);

  // Security: member can only access their own preview files
  if (!decoded.startsWith(`${memberId}_`) || !decoded.endsWith('.mp3')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Path traversal guard: reject anything with slashes or dots beyond the extension
  if (decoded.includes('/') || decoded.includes('..')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fullPath = path.join(PREVIEW_DIR, decoded);

  let buf: Buffer;
  try {
    buf = await fs.readFile(fullPath);
  } catch {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(buf.length),
      'Cache-Control': 'no-store',
    },
  });
}
