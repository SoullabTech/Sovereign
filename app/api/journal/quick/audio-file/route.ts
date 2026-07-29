// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';
/**
 * Voice Journal Audio File Serve API
 * GET /api/journal/quick/audio-file?path=storage/audio/journals/...
 *
 * Serves stored audio files for playback in the journal UI.
 * Includes path traversal protection.
 */

import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;
import path from 'path';
import fs from 'fs/promises';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

// Skip during static export (Capacitor builds)

// Node runtime required for filesystem reads
export const runtime = 'nodejs';

// Mirrors the writer in ../audio/route.ts, which stores files at
// storage/audio/journals/{safeSegment(userId)}/{file}. The owning segment is
// what binds a file to a member, so it must be derived the same way here.
function safeSegment(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

function safeRelPath(p: string): string | null {
  // Prevent path traversal attacks
  if (p.includes('..')) return null;
  if (!p.startsWith('storage/audio/journals/')) return null;
  return p;
}

/**
 * The path segments a member is allowed to read from.
 *
 * Includes the legacy id aliases (username, `${username}-nezat`) for the same
 * reason /api/journal/quick/list expands them: entries and audio written before
 * the UUID migration are stored under those older ids, and playback of a
 * member's own historical audio must keep working.
 */
async function ownedSegments(memberId: string): Promise<Set<string>> {
  const segments = new Set<string>([safeSegment(memberId)]);
  try {
    const result = await query<{ username: string }>(
      'SELECT username FROM members WHERE id::text = $1',
      [memberId]
    );
    const username = result.rows[0]?.username;
    if (username) {
      segments.add(safeSegment(username));
      segments.add(safeSegment(`${username}-nezat`));
    }
  } catch {
    // Members table unavailable — fall back to the UUID segment alone.
  }
  return segments;
}

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  // Handle static generation gracefully
  let filePath: string | null = null;
  try {
    filePath = request.nextUrl.searchParams.get('path');
  } catch {
    // During static export, searchParams may not be available
    return NextResponse.json({ success: false, error: 'Static export' }, { status: 503 });
  }

  if (!filePath) {
    return NextResponse.json(
      { success: false, error: 'Missing path parameter' },
      { status: 400 }
    );
  }

  const safePath = safeRelPath(filePath);
  if (!safePath) {
    return NextResponse.json(
      { success: false, error: 'Invalid path' },
      { status: 400 }
    );
  }

  // BEFORE (2026-07-28): traversal was blocked, but nothing tied the file to a
  // member — any caller holding a path could read another member's journal
  // audio. AFTER: the path's owning segment must belong to the verified session.
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  // storage/audio/journals/{owner}/{file} -> index 3 is the owner segment.
  const owner = safePath.split('/')[3];
  const allowed = await ownedSegments(memberId);
  if (!owner || !allowed.has(owner)) {
    // 404 rather than 403: a distinct status would confirm the file exists.
    return NextResponse.json(
      { success: false, error: 'Audio file not found' },
      { status: 404 }
    );
  }

  const absPath = path.join(process.cwd(), safePath);

  try {
    const data = await fs.readFile(absPath);

    // Determine content type from extension
    const ext = path.extname(safePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.webm': 'audio/webm',
      '.mp3': 'audio/mpeg',
      '.m4a': 'audio/mp4',
      '.ogg': 'audio/ogg',
      '.wav': 'audio/wav'
    };
    const contentType = mimeTypes[ext] || 'audio/webm';

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(data.length),
        'Cache-Control': 'private, max-age=3600',
        'Accept-Ranges': 'bytes'
      }
    });

  } catch (error) {
    console.error('❌ [VoiceJournal] File not found:', safePath);
    return NextResponse.json(
      { success: false, error: 'Audio file not found' },
      { status: 404 }
    );
  }
}
