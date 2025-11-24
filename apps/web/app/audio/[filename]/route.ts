import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Audio file serving endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    if (!filename || !filename.endsWith('.mp3')) {
      return new NextResponse('Invalid audio file', { status: 400 });
    }

    // Look for audio files in multiple possible locations
    const possiblePaths = [
      // Frontend public directory
      path.join(process.cwd(), 'public', 'audio', filename),
      // Backend public directory
      path.join(process.cwd(), 'backend', 'public', 'audio', filename),
      // Temp directory
      path.join('/tmp', 'audio', filename),
      // Current directory audio folder
      path.join(process.cwd(), 'audio', filename)
    ];

    let audioData: Buffer | null = null;
    let foundPath: string | null = null;

    // Try each possible path
    for (const audioPath of possiblePaths) {
      try {
        const stats = await fs.stat(audioPath);
        if (stats.isFile()) {
          audioData = await fs.readFile(audioPath);
          foundPath = audioPath;
          break;
        }
      } catch (error) {
        // Path doesn't exist, continue to next
        continue;
      }
    }

    if (!audioData) {
      console.error('[AUDIO SERVE] Audio file not found:', filename);
      console.error('[AUDIO SERVE] Searched paths:', possiblePaths);
      
      // List actual contents of possible directories for debugging
      for (const possiblePath of possiblePaths) {
        try {
          const dir = path.dirname(possiblePath);
          const files = await fs.readdir(dir);
        } catch (error) {
        }
      }
      
      return new NextResponse('Audio file not found', { status: 404 });
    }

    // Serve the audio file
    return new NextResponse(audioData, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioData.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Disposition': `inline; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('[AUDIO SERVE] Error serving audio:', error);
    return new NextResponse('Server error', { status: 500 });
  }
}