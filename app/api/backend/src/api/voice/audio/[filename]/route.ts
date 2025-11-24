import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { logger } from "../../../../utils/logger";

/**
 * GET /api/voice/audio/[filename]
 * Serve audio files from the uploads directory
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const audioPath = path.join(process.cwd(), "uploads", "voice", sanitizedFilename);

    // Check if file exists
    try {
      await fs.access(audioPath);
    } catch {
      return NextResponse.json(
        { error: "Audio file not found" },
        { status: 404 }
      );
    }

    // Read file
    const audioBuffer = await fs.readFile(audioPath);
    
    // Determine content type based on extension
    const ext = path.extname(sanitizedFilename).toLowerCase();
    const contentType = {
      '.webm': 'audio/webm',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.ogg': 'audio/ogg'
    }[ext] || 'audio/octet-stream';

    logger.info("Serving audio file", {
      filename: sanitizedFilename,
      contentType,
      size: audioBuffer.length
    });

    // Return audio file with proper headers
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes'
      }
    });

  } catch (error: any) {
    logger.error("Failed to serve audio file", {
      error: error.message,
      filename: params.filename
    });

    return NextResponse.json(
      { error: "Failed to serve audio file" },
      { status: 500 }
    );
  }
}