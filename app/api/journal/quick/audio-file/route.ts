/**
 * Voice Journal Audio File Serve API
 * GET /api/journal/quick/audio-file?path=storage/audio/journals/...
 *
 * Serves stored audio files for playback in the journal UI.
 * Includes path traversal protection.
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

// Node runtime required for filesystem reads
export const runtime = 'nodejs';

function safeRelPath(p: string): string | null {
  // Prevent path traversal attacks
  if (p.includes('..')) return null;
  if (!p.startsWith('storage/audio/journals/')) return null;
  return p;
}

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get('path');

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
